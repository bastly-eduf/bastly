const CACHE_VERSION = 'bastly-shell-v1';
const STATIC_CACHE = `${CACHE_VERSION}:static`;

const PRECACHE = [
  '/offline.html',
  '/site.webmanifest',
  '/brand/bastly-logo.webp',
  '/brand/icon-192.png',
  '/brand/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
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
                key.startsWith('bastly-shell-') &&
                key !== STATIC_CACHE,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache API or third-party requests in Bastly's service worker.
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // Navigations stay network-first. We deliberately do not serve cached
  // account HTML when offline because Bastly's student/parent/doctor/admin
  // data is private and time-sensitive.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/offline.html'),
      ),
    );
    return;
  }

  const cacheableDestinations = new Set([
    'script',
    'style',
    'image',
    'font',
  ]);

  if (!cacheableDestinations.has(request.destination)) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkRequest = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches
              .open(STATIC_CACHE)
              .then((cache) =>
                cache.put(request, copy),
              );
          }

          return response;
        })
        .catch(() => cached);

      return cached || networkRequest;
    }),
  );
});
