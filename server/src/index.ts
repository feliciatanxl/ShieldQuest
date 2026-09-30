import { existsSync, readFileSync } from 'node:fs';
import type { Server } from 'node:http';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { cors } from 'hono/cors';

import { DatabaseUnavailable } from './db.js';
import { env } from './env.js';
import { ApiError } from './http.js';
import { migrate, purgeExpired } from './migrate.js';
import { attachRealtime } from './realtime.js';
import { health } from './routes/health.js';
import { sessions } from './routes/sessions.js';
import { votes } from './routes/votes.js';

/**
 * The facilitated half of ShieldQuest: rooms, squads and live voting.
 *
 * Solo play never touches this. The game is local-first and must keep working
 * when this server is down — see "503 and the offline commitment" in
 * docs/api-status-codes.md.
 */
const app = new Hono();

app.use(
  '/api/*',
  cors({
    origin: env.corsOrigins,
    allowHeaders: ['Content-Type', 'X-Facilitator-Key'],
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Location', 'Retry-After'],
    maxAge: 600,
  }),
);

app.use(
  '/api/*',
  bodyLimit({
    maxSize: 16 * 1024,
    onError: () => {
      throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'The body is over 16 KB.');
    },
  }),
);

app.route('/api/health', health);
app.route('/api/sessions', sessions);
app.route('/api/votes', votes);

for (const path of ['/api/minigames/*', '/api/assessments/*']) {
  app.all(path, () => {
    throw new ApiError(501, 'NOT_IMPLEMENTED', 'This endpoint is not built yet.');
  });
}

/*
  The website, served from the same origin as the API.

  One service on Railway hosts the public site, the game and the portal, so the
  game reaches `/api` and `/ws` on its own host — no CORS, and no API URL to
  configure per environment. This mirrors what `vercel.json` did:
    - `/assets/*` are content-hashed by Vite, so they are cached for a year;
    - `sw.js` must revalidate every time, or a stale worker pins an old build;
    - any other path without a file extension is an app route (`/play`,
      `/portal`) and gets `index.html`.
  Skipped when there is no build, so `npm run dev` in server/ is API-only.
*/
const siteRoot = process.env.STATIC_DIR ?? fileURLToPath(new URL('../../dist', import.meta.url));
const siteIndex = `${siteRoot}/index.html`;

if (existsSync(siteIndex)) {
  const indexHtml = readFileSync(siteIndex, 'utf8');

  app.use('/assets/*', async (c, next) => {
    await next();
    if (c.res.ok) c.header('Cache-Control', 'public, max-age=31536000, immutable');
  });
  app.use('/sw.js', async (c, next) => {
    await next();
    c.header('Cache-Control', 'public, max-age=0, must-revalidate');
  });
  // The page itself must never be cached, or a phone keeps an old build's
  // asset names after a deploy.
  app.use('/', async (c, next) => {
    await next();
    c.header('Cache-Control', 'no-cache');
  });
  app.use('*', serveStatic({ root: siteRoot }));

  app.get('*', (c, next) => {
    const path = c.req.path;
    if (path.startsWith('/api/') || path === '/ws' || /\.[a-z0-9]+$/i.test(path)) return next();
    c.header('Cache-Control', 'no-cache');
    return c.html(indexHtml);
  });
  console.log(`[boot] serving the website from ${siteRoot}`);
}

app.notFound((c) => c.json({ error: { code: 'NOT_FOUND', message: 'Route not found.' } }, 404));

app.onError((error, c) => {
  if (error instanceof ApiError) {
    for (const [name, value] of Object.entries(error.headers)) c.header(name, value);
    return c.json({ error: { code: error.code, message: error.message } }, error.status);
  }
  if (error instanceof DatabaseUnavailable) {
    c.header('Retry-After', '10');
    return c.json(
      { error: { code: 'DB_UNAVAILABLE', message: 'The database is not reachable.' } },
      503,
    );
  }
  // Detail goes to the log, never to the caller.
  console.error('[api]', error);
  return c.json({ error: { code: 'INTERNAL', message: 'Something went wrong.' } }, 500);
});

async function main() {
  if (!env.databaseUrl) {
    console.warn('[boot] DATABASE_URL is not set — /api/health will report 503.');
  } else {
    try {
      await migrate();
      const purged = await purgeExpired();
      console.log(`[boot] schema ready${purged ? `, purged ${purged} expired session(s)` : ''}`);
    } catch (error) {
      console.error('[boot] could not reach the database:', (error as Error).message);
    }
  }
  if (!env.facilitatorKey) {
    console.warn('[boot] FACILITATOR_KEY is not set — rooms cannot be opened.');
  }

  const server = serve({ fetch: app.fetch, port: env.port }, (info) => {
    console.log(`[boot] listening on :${info.port}`);
  }) as Server;
  attachRealtime(server);

  // Retention runs daily, not only at boot, so a server that stays up for weeks
  // still deletes pilot data on schedule.
  setInterval(
    () => {
      purgeExpired().catch((error) => console.error('[purge]', (error as Error).message));
    },
    24 * 60 * 60 * 1000,
  ).unref();
}

void main();
