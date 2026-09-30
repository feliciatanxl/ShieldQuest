import { useSyncExternalStore } from 'react';

import type { AgeBand } from '../game/types.ts';

/**
 * The facilitator portal's link to the ShieldQuest server.
 *
 * Same origin in production (Railway serves the site and `/api` together) and
 * proxied by Vite in development, so every call is a relative path and the
 * login cookie travels with it. There is no API URL to configure.
 */

export class ApiFailure extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

/** A network failure or a 503 means "the server is not there", not "you did it wrong". */
export function isOffline(error: unknown): boolean {
  return error instanceof ApiFailure && (error.status === 0 || error.status === 503);
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...init,
      credentials: 'same-origin',
      headers: init.body ? { 'content-type': 'application/json', ...init.headers } : init.headers,
    });
  } catch {
    throw new ApiFailure(0, 'OFFLINE', 'Could not reach the ShieldQuest server.');
  }
  if (response.status === 204) return undefined as T;
  const payload = (await response.json().catch(() => null)) as {
    data?: T;
    error?: { code: string; message: string };
  } | null;
  if (!response.ok) {
    throw new ApiFailure(
      response.status,
      payload?.error?.code ?? 'UNKNOWN',
      payload?.error?.message ?? 'Something went wrong.',
    );
  }
  return payload?.data as T;
}

/* ------------------------------------------------------------------ */
/* Who is signed in                                                    */
/* ------------------------------------------------------------------ */

export interface Facilitator {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'facilitator';
}

/**
 * `checking` while the first request is in flight. `signed-out` covers both
 * "nobody is signed in" and "the server is unreachable": the demonstration
 * sections of the portal open either way, and only live sessions need a login.
 */
type AuthState =
  { status: 'checking' } | { status: 'signed-out' } | { status: 'signed-in'; me: Facilitator };

let state: AuthState = { status: 'checking' };
const listeners = new Set<() => void>();

function setState(next: AuthState) {
  state = next;
  listeners.forEach((listener) => listener());
}

let checked = false;
export function refreshMe() {
  checked = true;
  api<Facilitator>('/auth/me')
    .then((me) => setState({ status: 'signed-in', me }))
    .catch(() => setState({ status: 'signed-out' }));
}

export function useAuth(): AuthState {
  if (!checked && typeof window !== 'undefined') refreshMe();
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
  );
}

export async function signIn(email: string, password: string): Promise<Facilitator> {
  const me = await api<Facilitator>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setState({ status: 'signed-in', me });
  return me;
}

export async function signOut() {
  try {
    await api('/auth/logout', { method: 'POST' });
  } finally {
    setState({ status: 'signed-out' });
  }
}

/* ------------------------------------------------------------------ */
/* Sessions                                                            */
/* ------------------------------------------------------------------ */

export interface SessionSummary {
  code: string;
  ageBand: AgeBand;
  status: 'open' | 'closed';
  title: string | null;
  venue: string | null;
  createdAt: string;
  closedAt: string | null;
  participants: number;
}

export interface LiveSquad {
  id: string;
  name: string;
  members: number;
  full?: boolean;
}

export interface LiveVote {
  roundKey: string;
  squadId: string;
  choiceId: string;
  count: number;
}

export interface LiveSession {
  code: string;
  ageBand: AgeBand;
  status: 'open' | 'closed';
  title: string | null;
  venue: string | null;
  createdAt: string;
  squads: LiveSquad[];
  votes: LiveVote[];
}

export const listSessions = () => api<SessionSummary[]>('/sessions');

export const openSession = (input: {
  ageBand: AgeBand;
  squads: number;
  title?: string;
  venue?: string;
}) => api<{ code: string }>('/sessions', { method: 'POST', body: JSON.stringify(input) });

export const liveSession = (code: string) => api<LiveSession>(`/sessions/${code}/live`);

export const closeSession = (code: string) => api<void>(`/sessions/${code}`, { method: 'DELETE' });

/** The link a QR code on the projector points at. */
export function joinUrl(code: string): string {
  return `${window.location.origin}/play?code=${code}`;
}

/** The live socket for one room, signed in by the login cookie. */
export function watchSession(code: string, onMessage: (message: SocketMessage) => void) {
  let socket: WebSocket | null = null;
  let closed = false;
  let retry = 0;

  const connect = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
    socket.onopen = () => {
      retry = 0;
      socket?.send(JSON.stringify({ type: 'hello', code }));
    };
    socket.onmessage = (event) => {
      try {
        onMessage(JSON.parse(String(event.data)) as SocketMessage);
      } catch {
        /* Not ours. */
      }
    };
    socket.onclose = (event) => {
      if (closed) return;
      // 4xxx is the server refusing this room (ended, or not yours): stop.
      if (event.code >= 4000) {
        onMessage({ type: 'error', code: 'NOT_FOUND' });
        return;
      }
      // Back off, so a server restart during a session reconnects on its own.
      retry = Math.min(retry + 1, 5);
      window.setTimeout(connect, retry * 1500);
    };
  };
  connect();

  return () => {
    closed = true;
    socket?.close();
  };
}

export type SocketMessage =
  | { type: 'welcome'; role: 'participant' | 'facilitator' }
  | { type: 'roster'; squads: LiveSquad[] }
  | { type: 'vote:progress'; squadId: string; roundKey: string; voted: number; members: number }
  | {
      type: 'vote:reveal';
      squadId: string;
      roundKey: string;
      tally: { choiceId: string; count: number }[];
    }
  | { type: 'session:closed' }
  | { type: 'error'; code: string };
