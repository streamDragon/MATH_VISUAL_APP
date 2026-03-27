const CACHE_NAME = 'mathviz-v1.2';
const OFFLINE_URL = '/offline.html';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  OFFLINE_URL,
  '/privacy.html',
  '/version.json',
  '/mobile.css',
  '/questions.js',
  '/sound.js',
  '/presets.js',
  '/capacitor.js',
  '/codex_features.js',
  '/coach_feedback.css',
  '/coach_feedback.js',
  '/coach_feedback_catalog.json',
  '/help-video-registry.js',
  '/helpContent.he.js',
  '/help_videos.json',
  '/feed_manifest.json',
  '/opening-poster.png',
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-128.png',
  '/icons/icon-144.png',
  '/icons/icon-152.png',
  '/icons/icon-192.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/shortcut-practice.png',
  '/icons/shortcut-scan.png',
  '/screenshots/functions-workplace.png',
  '/screenshots/mobile-home.png',
  '/screenshots/mobile-exercise.png',
  '/screenshots/mobile-win.png'
];

const CACHE_PREFIXES = ['mathviz-', 'math-functions-pwa-'];

function isCacheableSameOriginRequest(request) {
  const url = new URL(request.url);
  if (request.method !== 'GET') return false;
  if (request.headers.has('range')) return false;
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith('/api/')) return false;
  if (url.pathname.startsWith('/auth/')) return false;
  return true;
}

function isStaticAssetRequest(request) {
  if (request.mode === 'navigate') return false;
  if (request.destination === 'audio' || request.destination === 'video') return false;
  return true;
}

function shouldCacheResponse(response) {
  return !!response && response.ok && response.type !== 'opaque';
}

async function addAppShell(cache) {
  const settled = await Promise.allSettled(
    APP_SHELL.map((asset) => cache.add(asset))
  );
  settled.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.warn('[SW] Failed to precache:', APP_SHELL[index], result.reason);
    }
  });
}

async function networkFirst(request, event) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const preload = event ? await event.preloadResponse : null;
    if (shouldCacheResponse(preload)) {
      cache.put(request, preload.clone());
      return preload;
    }
    const response = await fetch(request);
    if (shouldCacheResponse(response)) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === 'navigate') {
      return (await caches.match('/index.html')) || (await caches.match(OFFLINE_URL)) || Response.error();
    }
    return Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });
  const networkFetch = fetch(request)
    .then((response) => {
      if (shouldCacheResponse(response)) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    return cached;
  }

  const response = await networkFetch;
  return response || Response.error();
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => addAppShell(cache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME && CACHE_PREFIXES.some((prefix) => key.startsWith(prefix)))
        .map((key) => caches.delete(key))
    )).then(async () => {
      if ('navigationPreload' in self.registration) {
        await self.registration.navigationPreload.enable();
      }
      await self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (!isCacheableSameOriginRequest(request)) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, event));
    return;
  }

  if (isStaticAssetRequest(request)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  event.respondWith(networkFirst(request, event));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
