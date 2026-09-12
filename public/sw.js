/**
 * ShieldQuest service worker.
 *
 * Hand-written rather than generated. Two reasons:
 *
 * 1. The generated-service-worker toolchain pulls in a native rollup binary,
 *    which a Windows Application Control policy blocks on the team's own
 *    machine — a build that only works on some computers is worse than a
 *    service worker you can read.
 * 2. The offline behaviour here is a product requirement, not a default. The
 *    proposal commits to low-bandwidth access and to sessions run in school
 *    halls and community spaces where the network drops mid-workshop. What
 *    must survive that is the whole game: every scenario, every Guardian, the
 *    board. There is no server call to lose, because there is no server.
 *
 * Strategy:
 *   - navigations   → network first, falling back to the cached shell.
 *     (So a deployed update is picked up, but a dead network still opens.)
 *   - hashed assets → cache first. The filename changes when the file does, so
 *     a stale hit is impossible.
 *   - everything else same-origin → stale-while-revalidate.
 *
 * Cross-origin requests are not touched at all: the game makes none, and a
 * service worker that caches third-party responses is a privacy surface this
 * project has no reason to open.
 */

const VERSION = 'shieldquest-v2.0.0';
const SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;

const SHELL_URLS = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      // `reload` so an install never re-caches a stale copy from the HTTP cache.
      .then((cache) => cache.addAll(SHELL_URLS.map((url) => new Request(url, { cache: 'reload' }))))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

const isHashedAsset = (url) => /\/assets\/.+-[A-Za-z0-9_-]{8,}\.(js|css|woff2?)$/.test(url.pathname);

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() =>
          caches
            .match('/index.html')
            .then(
              (cached) =>
                cached ??
                new Response('<h1>ShieldQuest is offline</h1>', {
                  headers: { 'Content-Type': 'text/html' },
                }),
            ),
        ),
    );
    return;
  }

  if (isHashedAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(ASSETS).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(ASSETS).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached ?? network;
    }),
  );
});
