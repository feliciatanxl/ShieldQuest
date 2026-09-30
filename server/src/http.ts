import { createHash, randomBytes } from 'node:crypto';
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { ZodType } from 'zod';

/**
 * The response envelope from docs/api-status-codes.md.
 *
 * Errors are always `{ error: { code, message } }`; the message names a field,
 * never a submitted value, so nothing a participant typed can end up in a log.
 */
export class ApiError extends Error {
  constructor(
    readonly status: ContentfulStatusCode,
    readonly code: string,
    message: string,
    readonly headers: Record<string, string> = {},
  ) {
    super(message);
  }
}

export const notFound = () => new ApiError(404, 'NOT_FOUND', 'Not found.');

export function ok<T>(c: Context, data: T, status: ContentfulStatusCode = 200) {
  return c.json({ mode: 'live', data }, status);
}

/** Parse and validate a JSON body: 415 for the wrong type, 400 for bad JSON or schema. */
export async function body<T>(c: Context, schema: ZodType<T>): Promise<T> {
  const type = c.req.header('content-type') ?? '';
  if (!type.includes('application/json')) {
    throw new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Send the body as application/json.');
  }
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    throw new ApiError(400, 'BAD_JSON', 'The body is not valid JSON.');
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path.join('.') || 'body';
    throw new ApiError(400, 'INVALID_BODY', `${field} is missing or invalid.`);
  }
  return parsed.data;
}

/* --- participant tokens -------------------------------------------- */

export function newToken(): string {
  return randomBytes(24).toString('base64url');
}

/** Tokens are stored hashed, so a database dump cannot be used to vote as anyone. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/* --- session codes -------------------------------------------------- */

/** Same alphabet as the game (`src/game/engine.ts`): no vowels, so no words. */
export const SESSION_CODE_ALPHABET = 'BCDFGHJKLMNPQRSTVWXZ23456789';

export function makeSessionCode(): string {
  const bytes = randomBytes(6);
  let out = '';
  for (const byte of bytes) out += SESSION_CODE_ALPHABET[byte % SESSION_CODE_ALPHABET.length];
  return out;
}

/* --- rate limiting --------------------------------------------------- */

/**
 * Keyed to the session code, not the IP: a whole class joins from behind one
 * school NAT, and an IP limit would throttle them during onboarding.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    const retry = Math.ceil((bucket.resetAt - now) / 1000);
    throw new ApiError(429, 'RATE_LIMITED', 'Too many attempts. Try again shortly.', {
      'Retry-After': String(retry),
    });
  }
}

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
}, 60_000).unref();
