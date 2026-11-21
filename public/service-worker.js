const CACHE_NAME = 'mathviz-learning-v2.23-phone-stage';
const OFFLINE_URL = '/offline.html';
const APP_SHELL = [
  "/",
  "/learn.html",
  "/classroom-practice.html",
  "/problem-map.html",
  "/problem-map.css",
  "/problem-map-data.js",
  "/problem-map-core.js",
  "/problem-map.js",
  "/problem-map-visual.js",
  "/problem-map-flow-data.js",
  "/problem-map-flow-core.js",
  "/problem-map-flow.js",
  "/vizy-algebra-worlds.js",
  "/vizy-algebra-worlds.css",
  "/meaning-weave-data.js",
  "/meaning-weave-core.js",
  "/meaning-weave.js",
  "/story-corner.css",
  "/story-corner-data.js",
  "/story-corner.js",
  "/vizy-theme.css",
  "/vizy-icons.js",
  "/vizy-mascot.js",
  "/fonts/rubik-hebrew-400.woff2",
  "/fonts/rubik-hebrew-500.woff2",
  "/fonts/rubik-hebrew-700.woff2",
  "/fonts/rubik-latin-400.woff2",
  "/fonts/rubik-latin-500.woff2",
  "/fonts/rubik-latin-700.woff2",
  "/vizy-unified-shell.css",
  "/vizy-unified-shell.js",
  "/vizy-inquiry.css",
  "/vizy-inquiry-core.js",
  "/vizy-inquiry-graph.js",
  "/vizy-inquiry-map.js",
  "/vizy-ltr.js",
  "/vizy-inquiry-entry.js",
  "/vizy-inquiry.js",
  "/vizy-sound.js",
  "/vizy-sound.css",
  "/play.html",
  "/vizy-game-return.js",
  "/vizy-glide.css",
  "/vizy-glide.js",
  "/vizy-glide-core.js",
  "/vizy-playtime.js",
  "/vizy-playtime-core.js",
  "/skill-lab.html",
  "/skill-lab.css",
  "/skill-lab-data.js",
  "/skill-lab.js",
  "/classroom-practice.css",
  "/classroom-activities.js",
  "/classroom-math.js",
  "/classroom-visuals.js",
  "/classroom-shared-model.js",
  "/classroom-flow.js",
  "/ability-picker.css",
  "/ability-picker.js",
  "/learning.css",
  "/mobile-polish.css",
  "/learning-app.js",
  "/learning-core.js",
  "/learning-service.js",
  "/learning-visuals.js",
  "/learning-bank.json",
  "/learning-voices.json",
  "/manifest.json",
  "/offline.html",
  "/privacy.html",
  "/version.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png"
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
      return (await caches.match('/learn.html')) || (await caches.match(OFFLINE_URL)) || Response.error();
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
