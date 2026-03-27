const CACHE_NAME = 'math-functions-pwa-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/mobile.css',
  '/questions.js',
  '/sound.js',
  '/coach_feedback.css',
  '/coach_feedback.js',
  '/help-video-registry.js',
  '/helpContent.he.js',
  '/feed_manifest.json',
  '/opening-poster.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png'
];

function isCacheableSameOriginRequest(requestUrl) {
  return requestUrl.origin === self.location.origin
    && !requestUrl.pathname.startsWith('/api/')
    && !requestUrl.pathname.startsWith('/auth/');
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (!isCacheableSameOriginRequest(requestUrl)) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', responseClone));
          }
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || !networkResponse.ok) return networkResponse;

        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return networkResponse;
      });
    })
  );
});
