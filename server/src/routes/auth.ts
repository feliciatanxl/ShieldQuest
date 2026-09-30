import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { z } from 'zod';

import {
  LOGIN_COOKIE,
  LOGIN_DAYS,
  facilitatorForToken,
  hashPassword,
  requireAdmin,
  verifyPassword,
} from '../auth.js';
import { query } from '../db.js';
import { ApiError, body, hashToken, newToken, ok, rateLimit } from '../http.js';

export const auth = new Hono();

const Login = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(200),
});

/**
 * A password hash to compare against when the email is unknown, so a wrong
 * email and a wrong password take the same time and give the same answer.
 */
const decoy = hashPassword('not-a-real-password');

auth.post('/login', async (c) => {
  const input = await body(c, Login);
  rateLimit(`login:${input.email}`, 10, 15 * 60_000);

  const found = await query<{ id: string; password_hash: string }>(
    `SELECT id, password_hash FROM facilitators WHERE email = $1`,
    [input.email],
  );
  const row = found.rows[0];
  const valid = await verifyPassword(input.password, row?.password_hash ?? (await decoy));
  if (!row || !valid) {
    throw new ApiError(401, 'BAD_CREDENTIALS', 'That email and password do not match.');
  }

  const token = newToken();
  await query(
    `INSERT INTO facilitator_logins (token_hash, facilitator_id, expires_at)
     VALUES ($1, $2, now() + make_interval(days => $3))`,
    [hashToken(token), row.id, LOGIN_DAYS],
  );
  // Tidy up this facilitator's expired logins while we are here.
  await query(`DELETE FROM facilitator_logins WHERE facilitator_id = $1 AND expires_at < now()`, [
    row.id,
  ]);

  setCookie(c, LOGIN_COOKIE, token, {
    httpOnly: true,
    // Secure everywhere except plain-http localhost, where browsers would drop it.
    secure: new URL(c.req.url).protocol === 'https:',
    sameSite: 'Lax',
    path: '/',
    maxAge: LOGIN_DAYS * 24 * 60 * 60,
  });
  return ok(c, await facilitatorForToken(token));
});

auth.post('/logout', async (c) => {
  const token = getCookie(c, LOGIN_COOKIE);
  if (token)
    await query(`DELETE FROM facilitator_logins WHERE token_hash = $1`, [hashToken(token)]);
  deleteCookie(c, LOGIN_COOKIE, { path: '/' });
  return c.body(null, 204);
});

auth.get('/me', async (c) => {
  const person = await facilitatorForToken(getCookie(c, LOGIN_COOKIE));
  if (!person) throw new ApiError(401, 'UNAUTHORIZED', 'Not signed in.');
  return ok(c, person);
});

/* --- managing facilitators (admin) ---------------------------------- */

const NewFacilitator = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  displayName: z.string().trim().min(1).max(80),
  password: z.string().min(10).max(200),
  role: z.enum(['admin', 'facilitator']).default('facilitator'),
});

auth.get('/facilitators', async (c) => {
  await requireAdmin(c);
  const found = await query(
    `SELECT id, email, display_name AS "displayName", role, created_at AS "createdAt"
       FROM facilitators ORDER BY created_at`,
  );
  return ok(c, found.rows);
});

auth.post('/facilitators', async (c) => {
  await requireAdmin(c);
  const input = await body(c, NewFacilitator);
  try {
    const created = await query<{ id: string }>(
      `INSERT INTO facilitators (email, display_name, role, password_hash)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [input.email, input.displayName, input.role, await hashPassword(input.password)],
    );
    return ok(c, { id: created.rows[0]!.id, email: input.email, role: input.role }, 201);
  } catch (error) {
    if ((error as { code?: string }).code === '23505') {
      throw new ApiError(409, 'EMAIL_TAKEN', 'A facilitator with that email already exists.');
    }
    throw error;
  }
});
