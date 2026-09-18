const CACHE_VERSION = 'bastly-offline-v2';
const OFFLINE_CACHE = `${CACHE_VERSION}:static`;

const PRECACHE = [
  '/offline',
  '/brand/bastly-logo.webp',
  '/brand/icon-192.png',
  '/brand/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(OFFLINE_CACHE)
      .then((cache) => cache.addAll(PRECACHE)),
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith('bastly-') &&
                key !== OFFLINE_CACHE,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || request.mode !== 'navigate') {
    return;
  }

  const url = new URL(request.url);

  // The Bastly service worker never handles cross-origin requests or the API.
  // In particular, authenticated JSON and R2 uploads are never cached here.
  if (
    url.origin !== self.location.origin ||
    url.pathname === '/api' ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // Navigations are always network-first. The service worker intentionally does
  // not cache JS, CSS, images, authenticated route HTML, or API data. Browser and
  // CDN HTTP caching are enough for those resources and avoid stale app bundles.
  event.respondWith(
    fetch(request, { cache: 'no-store' }).catch(async () => {
      const offline = await caches.match('/offline', {
        ignoreSearch: true,
      });

      return (
        offline ||
        new Response('Bastly is offline.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
      );
    }),
  );
});
