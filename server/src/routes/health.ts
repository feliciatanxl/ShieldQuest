import { Hono } from 'hono';

import { query } from '../db.js';
import { ApiError, ok } from '../http.js';

export const health = new Hono();

health.get('/', async (c) => {
  try {
    await query('SELECT 1');
  } catch {
    throw new ApiError(503, 'DB_UNAVAILABLE', 'The database is not reachable.', {
      'Retry-After': '10',
    });
  }
  return ok(c, { status: 'ok', db: 'up' });
});
