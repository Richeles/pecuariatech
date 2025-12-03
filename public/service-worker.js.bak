self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { clients.claim(); });
self.addEventListener('fetch', event => {
  // simple cache-first for static assets
  event.respondWith(caches.match(event.request).then(r => r || fetch(event.request)));
});
