const CACHE_NAME = 'pwa-firebase-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/css/style.css',
  '/src/js/app.js',
  '/src/js/router.js',
  '/src/js/firebase-init.js'
];

// Event Install: Menyimpan file utama ke cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Event Fetch: Mengambil data dari cache jika offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});