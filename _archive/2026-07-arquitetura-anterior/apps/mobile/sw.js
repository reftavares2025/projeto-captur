const CACHE_NAME = 'captur-v1-cache';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
        if (event.request.url.includes('/uploads/voucher_')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});

// SERVICE WORKER PARA NOTIFICAÇÕES PUSH E FUNCIONAMENTO OFFLINE
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "🔥 Nova Viagem Lançada na Captur!";
  const options = {
    body: data.body || "A Paula acabou de cadastrar um novo destino exclusivo! Confira antes que acabe.",
    icon: "/logo.png",
    badge: "/logo.png",
    data: { url: data.url || "/" }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || "/")
  );
});
