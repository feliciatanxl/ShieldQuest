import { parseHandoff, type GameHandoff, type MissionExit } from '@shieldquest/shared';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const KEY = 'shieldquest-session';
const HANDOFF_KEY = 'shieldquest-handoff';

export interface PlayerSession { sessionId: string; token: string | null; version: number }

const read = <T,>(k: string): T | null => { try { return JSON.parse(sessionStorage.getItem(k) ?? 'null'); } catch { return null; } };
const write = (k: string, v: unknown) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode: state stays in memory */ } };

/**
 * Anonymous per-tab session. If the API is unreachable (e.g. static Amplify hosting with no backend yet)
 * the player still gets a local id and plays; progress is then only kept in this tab.
 */
export async function ensureSession(fetcher: typeof fetch = fetch): Promise<PlayerSession> {
  const existing = read<PlayerSession>(KEY);
  if (existing?.sessionId) return existing;
  let session: PlayerSession = { sessionId: `local-${crypto.randomUUID()}`, token: null, version: 0 };
  try {
    const res = await fetcher(`${API_BASE}/sessions`, { method: 'POST' });
    const body = await res.json();
    if (res.ok && body?.success) session = { sessionId: body.data.sessionId, token: body.data.token, version: 0 };
  } catch { /* offline: keep the local session */ }
  write(KEY, session);
  return session;
}

/** Saves a mission exit to the server when there is one; returns the session with its new version. */
export async function saveMissionExit(session: PlayerSession, exit: MissionExit, fetcher: typeof fetch = fetch): Promise<PlayerSession> {
  if (!session.token) return session;
  const res = await fetcher(`${API_BASE}/sessions/${session.sessionId}/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
    body: JSON.stringify({ expectedVersion: session.version, exit }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error?.message ?? `Save failed (${res.status})`);
  const next = { ...session, version: body.data.version as number };
  write(KEY, next);
  return next;
}

/** Survives a reload mid-mission so the player can be returned to the right spot. */
export const storeHandoff = (h: GameHandoff | null) => (h ? write(HANDOFF_KEY, h) : sessionStorage.removeItem(HANDOFF_KEY));
export function loadHandoff(): GameHandoff | null {
  const parsed = parseHandoff(read(HANDOFF_KEY));
  return parsed.ok ? parsed.value : null;
}
