import type { IncomingMessage, Server } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';

import { LOGIN_COOKIE, cookieFrom, facilitatorForToken, serviceKeyMatches } from './auth.js';
import { query } from './db.js';
import { hashToken } from './http.js';

/**
 * Live squad play over one WebSocket per device.
 *
 * A device connects to `/ws` and then proves who it is in its FIRST message —
 * `{ type: 'hello', token }` for a participant, or `{ type: 'hello', code }`
 * for the portal's live room, signed in by its login cookie (or with
 * `facilitatorKey` from a script) — rather than in the URL, where proxies and
 * host logs would record it.
 *
 * Messages out are counts and tallies only. Nothing sent to a squad says WHO
 * voted for what: Think–Vote–Explain is a private vote followed by a group
 * conversation, and naming voters would turn the reveal into a call-out.
 */

interface Client {
  ws: WebSocket;
  sessionId: string;
  squadId: string | null;
  facilitator: boolean;
}

const rooms = new Map<string, Set<Client>>();

export type Outgoing =
  | { type: 'welcome'; role: 'participant' | 'facilitator' }
  | { type: 'vote:progress'; squadId: string; roundKey: string; voted: number; members: number }
  | {
      type: 'vote:reveal';
      squadId: string;
      roundKey: string;
      tally: { choiceId: string; count: number }[];
    }
  | { type: 'roster'; squads: { id: string; name: string; members: number }[] }
  | { type: 'session:closed' }
  | { type: 'error'; code: string };

function send(ws: WebSocket, message: Outgoing) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(message));
}

/** To everyone in a squad, plus every facilitator screen in the session. */
export function toSquad(sessionId: string, squadId: string, message: Outgoing) {
  for (const client of rooms.get(sessionId) ?? []) {
    if (client.facilitator || client.squadId === squadId) send(client.ws, message);
  }
}

/** To the portal screens watching a session only. */
export function toFacilitators(sessionId: string, message: Outgoing) {
  for (const client of rooms.get(sessionId) ?? []) {
    if (client.facilitator) send(client.ws, message);
  }
}

export function toSession(sessionId: string, message: Outgoing) {
  for (const client of rooms.get(sessionId) ?? []) send(client.ws, message);
}

async function identify(
  message: Record<string, unknown>,
  request: IncomingMessage,
): Promise<Omit<Client, 'ws'> | null> {
  if (typeof message.token === 'string') {
    const found = await query<{ session_id: string; squad_id: string | null }>(
      `SELECT p.session_id, p.squad_id
         FROM participants p JOIN sessions s ON s.id = p.session_id
        WHERE p.token_hash = $1 AND s.status = 'open'`,
      [hashToken(message.token)],
    );
    const row = found.rows[0];
    return row ? { sessionId: row.session_id, squadId: row.squad_id, facilitator: false } : null;
  }
  if (typeof message.code === 'string') {
    const byKey =
      typeof message.facilitatorKey === 'string' && serviceKeyMatches(message.facilitatorKey);
    const person = byKey
      ? null
      : await facilitatorForToken(cookieFrom(request.headers.cookie, LOGIN_COOKIE));
    if (!byKey && !person) return null;
    const found = await query<{ id: string; facilitator_id: string | null }>(
      `SELECT id, facilitator_id FROM sessions WHERE code = $1 AND status = 'open'`,
      [message.code.toUpperCase()],
    );
    const row = found.rows[0];
    // The same rule as the HTTP routes: your own rooms, or any if you are an admin.
    const allowed = row && (byKey || person?.role === 'admin' || row.facilitator_id === person?.id);
    return row && allowed ? { sessionId: row.id, squadId: null, facilitator: true } : null;
  }
  return null;
}

export function attachRealtime(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 4 * 1024 });
  const alive = new WeakSet<WebSocket>();

  wss.on('connection', (ws, request) => {
    let client: Client | null = null;
    alive.add(ws);
    ws.on('pong', () => alive.add(ws));

    // A socket that never says hello is dropped rather than held open.
    const helloTimer = setTimeout(() => ws.close(4001, 'hello timeout'), 10_000);

    ws.on('message', async (raw) => {
      if (client) return; // Everything after hello travels over HTTP.
      let message: Record<string, unknown>;
      try {
        message = JSON.parse(String(raw)) as Record<string, unknown>;
      } catch {
        ws.close(4000, 'bad json');
        return;
      }
      if (message.type !== 'hello') {
        ws.close(4000, 'expected hello');
        return;
      }

      try {
        const who = await identify(message, request);
        clearTimeout(helloTimer);
        if (!who) {
          send(ws, { type: 'error', code: 'NOT_FOUND' });
          ws.close(4004, 'not found');
          return;
        }
        client = { ws, ...who };
        const room = rooms.get(who.sessionId) ?? new Set<Client>();
        room.add(client);
        rooms.set(who.sessionId, room);
        send(ws, { type: 'welcome', role: who.facilitator ? 'facilitator' : 'participant' });
      } catch {
        send(ws, { type: 'error', code: 'DB_UNAVAILABLE' });
        ws.close(1011, 'unavailable');
      }
    });

    ws.on('close', () => {
      clearTimeout(helloTimer);
      if (!client) return;
      const room = rooms.get(client.sessionId);
      room?.delete(client);
      if (room && room.size === 0) rooms.delete(client.sessionId);
    });
  });

  // Keep idle connections alive through Railway's proxy, and drop dead ones.
  setInterval(() => {
    for (const ws of wss.clients) {
      if (!alive.has(ws)) {
        ws.terminate();
        continue;
      }
      alive.delete(ws);
      ws.ping();
    }
  }, 25_000).unref();

  return wss;
}
