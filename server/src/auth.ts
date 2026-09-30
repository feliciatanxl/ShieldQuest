import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';

import { env } from './env.js';
import { query } from './db.js';
import { ApiError, hashToken } from './http.js';

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

/** `scrypt$<salt>$<hash>`, both base64url. Node's built-in, so no native module to build. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64);
  return `scrypt$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64url');
  const actual = await scryptAsync(password, Buffer.from(salt, 'base64url'), expected.length);
  return timingSafeEqual(actual, expected);
}

export const LOGIN_COOKIE = 'sq_fac';
/** Long enough for a working week of sessions; short enough that a shared lab PC forgets. */
export const LOGIN_DAYS = 7;

export interface Facilitator {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'facilitator';
}

/** The facilitator behind a login token, or null. Used by HTTP and by the WebSocket. */
export async function facilitatorForToken(token: string | undefined): Promise<Facilitator | null> {
  if (!token) return null;
  const found = await query<{
    id: string;
    email: string;
    display_name: string;
    role: Facilitator['role'];
  }>(
    `SELECT f.id, f.email, f.display_name, f.role
       FROM facilitator_logins l JOIN facilitators f ON f.id = l.facilitator_id
      WHERE l.token_hash = $1 AND l.expires_at > now()`,
    [hashToken(token)],
  );
  const row = found.rows[0];
  return row
    ? { id: row.id, email: row.email, displayName: row.display_name, role: row.role }
    : null;
}

function serviceKeyMatches(given: string | undefined): boolean {
  if (!given || !env.facilitatorKey) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(env.facilitatorKey);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Who is calling a facilitator route: a signed-in browser (the cookie), or a
 * script holding FACILITATOR_KEY. The key acts as an admin with no account,
 * which is what lets you open a room before any facilitator exists.
 */
export async function requireFacilitator(c: Context): Promise<Facilitator | null> {
  const person = await facilitatorForToken(getCookie(c, LOGIN_COOKIE));
  if (person) return person;
  if (serviceKeyMatches(c.req.header('x-facilitator-key'))) return null;
  throw new ApiError(401, 'UNAUTHORIZED', 'Sign in to use the facilitator portal.');
}

export async function requireAdmin(c: Context): Promise<Facilitator | null> {
  const person = await requireFacilitator(c);
  if (person && person.role !== 'admin') {
    throw new ApiError(403, 'FORBIDDEN', 'Only an admin can do that.');
  }
  return person;
}

/** Parse one cookie out of a raw Cookie header, for the WebSocket upgrade. */
export function cookieFrom(header: string | undefined, name: string): string | undefined {
  for (const part of (header ?? '').split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

export { serviceKeyMatches };
