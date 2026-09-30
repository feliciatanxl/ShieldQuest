import { readFile } from 'node:fs/promises';

import { env } from './env.js';
import { query } from './db.js';

/** Apply `schema.sql`. Every statement is idempotent, so this runs on each boot. */
export async function migrate() {
  const sql = await readFile(new URL('../src/schema.sql', import.meta.url), 'utf8');
  await query(sql);
}

/** Delete sessions past the retention window. Cascades to everything in them. */
export async function purgeExpired(): Promise<number> {
  const result = await query(
    `DELETE FROM sessions WHERE created_at < now() - make_interval(days => $1)`,
    [env.retentionDays],
  );
  return result.rowCount ?? 0;
}
