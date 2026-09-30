import { Hono } from 'hono';
import { z } from 'zod';

import { requireFacilitator, type Facilitator } from '../auth.js';
import { query } from '../db.js';
import {
  ApiError,
  body,
  hashToken,
  makeSessionCode,
  newToken,
  notFound,
  ok,
  rateLimit,
} from '../http.js';
import { toFacilitators, toSession } from '../realtime.js';

export const sessions = new Hono();

/** From the proposal: squads of about 4–5. */
export const SQUAD_MAX = 5;

const CreateSession = z.object({
  ageBand: z.enum(['B10_13', 'B14_16', 'B17_24']),
  squads: z.number().int().min(1).max(12).default(6),
  leaderboard: z.boolean().default(false),
  // Free text a facilitator types ("Sec 3 Cohort A", "Computer Lab 2"). About
  // the room, never about a participant.
  title: z.string().trim().max(80).optional(),
  venue: z.string().trim().max(80).optional(),
});

// Codenames are letters and spaces. Digits are refused outright, which keeps a
// phone number from ever being typed into the one free-text field there is.
const JoinSession = z.object({
  handle: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[\p{L} '-]+$/u),
  squadId: z.string().uuid().optional(),
});

const SQUAD_NAMES = [
  'Falcon',
  'Otter',
  'Lynx',
  'Heron',
  'Panda',
  'Orca',
  'Gecko',
  'Kite',
  'Ibis',
  'Mantis',
  'Robin',
  'Tapir',
];

/** Open a room. Facilitator only. */
sessions.post('/', async (c) => {
  const person = await requireFacilitator(c);
  const input = await body(c, CreateSession);

  // Retry on the (rare) code collision rather than failing the facilitator.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = makeSessionCode();
    const created = await query<{ id: string }>(
      `INSERT INTO sessions (code, age_band, leaderboard_enabled, facilitator_id, title, venue)
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (code) DO NOTHING RETURNING id`,
      [
        code,
        input.ageBand,
        input.leaderboard,
        person?.id ?? null,
        input.title || null,
        input.venue || null,
      ],
    );
    const session = created.rows[0];
    if (!session) continue;

    const names = SQUAD_NAMES.slice(0, input.squads).map((name) => `Squad ${name}`);
    await query(`INSERT INTO squads (session_id, name) SELECT $1, unnest($2::text[])`, [
      session.id,
      names,
    ]);
    c.header('Location', `/api/sessions/${code}`);
    return ok(c, { code, ageBand: input.ageBand, squads: names }, 201);
  }
  throw new ApiError(500, 'INTERNAL', 'Something went wrong.');
});

/**
 * A facilitator's sessions, newest first. Admins, and the service key, see
 * everyone's; a facilitator sees the rooms they opened.
 */
sessions.get('/', async (c) => {
  const person = await requireFacilitator(c);
  const everyone = !person || person.role === 'admin';
  const found = await query(
    `SELECT s.code, s.age_band AS "ageBand", s.status, s.title, s.venue,
            s.created_at AS "createdAt", s.closed_at AS "closedAt",
            (SELECT count(*)::int FROM participants p WHERE p.session_id = s.id) AS participants
       FROM sessions s
      WHERE ($1::boolean OR s.facilitator_id = $2)
      ORDER BY s.created_at DESC LIMIT 30`,
    [everyone, person?.id ?? null],
  );
  return ok(c, found.rows);
});

/** A session this facilitator may run: their own, or any if they are an admin. */
async function ownedSession(code: string, person: Facilitator | null) {
  const found = await query<{
    id: string;
    code: string;
    age_band: string;
    status: string;
    title: string | null;
    venue: string | null;
    facilitator_id: string | null;
    created_at: string;
  }>(
    `SELECT id, code, age_band, status, title, venue, facilitator_id, created_at
       FROM sessions WHERE code = $1`,
    [code.toUpperCase()],
  );
  const session = found.rows[0];
  const allowed =
    session && (!person || person.role === 'admin' || session.facilitator_id === person.id);
  if (!session || !allowed) throw notFound();
  return session;
}

/**
 * Everything the live room screen needs in one read: squads, who has joined,
 * and the vote counts for every round played so far. Counts only — the same
 * rule as the WebSocket, no row here says who chose what.
 */
sessions.get('/:code/live', async (c) => {
  const person = await requireFacilitator(c);
  const session = await ownedSession(c.req.param('code'), person);
  const squads = await squadsOf(session.id);
  const rounds = await query<{
    roundKey: string;
    squadId: string;
    choiceId: string;
    count: number;
  }>(
    `SELECT round_key AS "roundKey", squad_id AS "squadId", choice_id AS "choiceId",
            count(*)::int AS count
       FROM votes WHERE session_id = $1
      GROUP BY round_key, squad_id, choice_id
      ORDER BY min(created_at)`,
    [session.id],
  );
  return ok(c, {
    code: session.code,
    ageBand: session.age_band,
    status: session.status,
    title: session.title,
    venue: session.venue,
    createdAt: session.created_at,
    squads: squads.map((squad) => ({ ...squad, full: squad.members >= SQUAD_MAX })),
    votes: rounds.rows,
  });
});

async function openSession(code: string) {
  const found = await query<{
    id: string;
    code: string;
    age_band: string;
    leaderboard_enabled: boolean;
  }>(
    `SELECT id, code, age_band, leaderboard_enabled
       FROM sessions WHERE code = $1 AND status = 'open'`,
    [code.toUpperCase()],
  );
  // Unknown, closed and expired all look the same from outside. See the 404
  // section of docs/api-status-codes.md.
  const session = found.rows[0];
  if (!session) throw notFound();
  return session;
}

async function squadsOf(sessionId: string) {
  const found = await query<{ id: string; name: string; members: number }>(
    `SELECT q.id, q.name, count(p.id)::int AS members
       FROM squads q LEFT JOIN participants p ON p.squad_id = q.id
      WHERE q.session_id = $1
      GROUP BY q.id ORDER BY q.created_at, q.name`,
    [sessionId],
  );
  return found.rows;
}

/** What a device needs before joining: the age band and which squads have room. */
sessions.get('/:code', async (c) => {
  const session = await openSession(c.req.param('code'));
  const squads = await squadsOf(session.id);
  return ok(c, {
    code: session.code,
    ageBand: session.age_band,
    leaderboard: session.leaderboard_enabled,
    squads: squads.map((squad) => ({ ...squad, full: squad.members >= SQUAD_MAX })),
  });
});

/** Join a room. Returns the token the device keeps for the rest of the session. */
sessions.post('/:code/join', async (c) => {
  const code = c.req.param('code').toUpperCase();
  rateLimit(`join:${code}`, 60, 60_000);
  const input = await body(c, JoinSession);
  const session = await openSession(code);
  const squads = await squadsOf(session.id);

  let squad = input.squadId ? squads.find((entry) => entry.id === input.squadId) : undefined;
  if (input.squadId && !squad) throw notFound();
  if (squad && squad.members >= SQUAD_MAX) {
    throw new ApiError(409, 'SQUAD_FULL', 'That squad already has five members.');
  }
  // No squad asked for: the emptiest one, so squads fill evenly.
  squad ??= [...squads]
    .sort((a, b) => a.members - b.members)
    .find((entry) => entry.members < SQUAD_MAX);
  if (!squad) throw new ApiError(409, 'SESSION_FULL', 'Every squad in this session is full.');

  const token = newToken();
  const joined = await query<{ id: string }>(
    `INSERT INTO participants (session_id, squad_id, handle, token_hash)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [session.id, squad.id, input.handle, hashToken(token)],
  );
  toFacilitators(session.id, { type: 'roster', squads: await squadsOf(session.id) });
  c.header('Location', `/api/sessions/${code}`);
  return ok(
    c,
    {
      participantId: joined.rows[0]!.id,
      token,
      ageBand: session.age_band,
      squad: { id: squad.id, name: squad.name },
    },
    201,
  );
});

/** End a room. Facilitator only. Everyone connected is told it is over. */
sessions.delete('/:code', async (c) => {
  const person = await requireFacilitator(c);
  const owned = await ownedSession(c.req.param('code'), person);
  const closed = await query<{ id: string }>(
    `UPDATE sessions SET status = 'closed', closed_at = now()
      WHERE id = $1 AND status = 'open' RETURNING id`,
    [owned.id],
  );
  const session = closed.rows[0];
  if (!session) throw notFound();
  toSession(session.id, { type: 'session:closed' });
  return c.body(null, 204);
});

/** Scaffolded, not connected. 501 rather than a fake success — see the API doc. */
sessions.get('/:code/leaderboard', async (c) => {
  await requireFacilitator(c);
  throw new ApiError(501, 'NOT_IMPLEMENTED', 'The event leaderboard is not built yet.');
});
