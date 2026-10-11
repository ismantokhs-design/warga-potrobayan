// Service Worker Version & Cache Name unik untuk Warga Potrobayan
const CACHE_NAME = 'warga-potrobayan-v1';
const ASSETS_TO_CACHE = [
  '/warga-potrobayan/',
  '/warga-potrobayan/index.html',
  '/warga-potrobayan/manifest.json',
  '/warga-potrobayan/icon.png',
  '/warga-potrobayan/icon2.png'
];

// 1. Proses Install: Simpan file utama ke Cache
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Proses Aktivasi: Bersihkan cache lama jika ada update versi
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache.startsWith('warga-potrobayan-')) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Menangani Fetch/Network (Offline Support)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// 4. Menangani Push Notification
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.text() : 'Notifikasi Warga Potrobayan';
  
  const options = {
    body: data,
    icon: 'icon.png?v=1',
    badge: 'icon.png?v=1'
  };

  event.waitUntil(
    self.registration.showNotification('Warga Potrobayan', options)
  );
});