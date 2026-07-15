const CACHE_NAME = 'sanskrit-setu-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/variables.css',
  '/css/base.css',
  '/css/components.css',
  '/css/pages.css',
  '/css/animations.css',
  '/css/ai.css',
  '/js/utils.js',
  '/js/store.js',
  '/js/router.js',
  '/js/components.js',
  '/js/ai.js',
  '/js/app.js'
  // Note: NOT caching data.js entirely to avoid shipping answer keys permanently to cache.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
