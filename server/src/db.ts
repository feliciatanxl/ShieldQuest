import pg from 'pg';

import { env } from './env.js';

/**
 * One small pool. A pilot room is 20–30 devices, and most of what they do
 * travels over the WebSocket rather than as queries.
 */
export const pool = env.databaseUrl
  ? new pg.Pool({
      connectionString: env.databaseUrl,
      max: 10,
      ssl: env.databaseSsl ? { rejectUnauthorized: false } : undefined,
    })
  : null;

pool?.on('error', (error) => {
  // An idle client dropping is recoverable; the pool replaces it.
  console.error('[db] idle client error:', error.message);
});

export class DatabaseUnavailable extends Error {}

export async function query<T extends pg.QueryResultRow>(
  text: string,
  values: unknown[] = [],
): Promise<pg.QueryResult<T>> {
  if (!pool) throw new DatabaseUnavailable('DATABASE_URL is not set');
  try {
    return await pool.query<T>(text, values);
  } catch (error) {
    const code = (error as { code?: string }).code;
    // Connection-level failures, as opposed to a bad query.
    if (
      code === 'ECONNREFUSED' ||
      code === 'ENOTFOUND' ||
      code === 'ETIMEDOUT' ||
      code === '57P01'
    ) {
      throw new DatabaseUnavailable(code);
    }
    throw error;
  }
}
