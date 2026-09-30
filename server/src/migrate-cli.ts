import { pool } from './db.js';
import { migrate } from './migrate.js';

/** `npm run migrate`: apply the schema without starting the server. */
migrate()
  .then(() => console.log('[migrate] schema is up to date'))
  .catch((error: Error) => {
    console.error('[migrate] failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool?.end());
