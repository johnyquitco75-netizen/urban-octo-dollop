const CACHE_NAME = 'egrs-cache-v2'; // Incrementing cache version to ensure update
const urlsToCache = [
  '/',
  '/index.html',
  // Explicitly cache icons and other static assets
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching initial assets');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache initial assets', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests for navigation and assets
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If a cached response is found, return it immediately
      if (cachedResponse) {
        return cachedResponse;
      }

      // If no cached response, fetch from the network
      return fetch(event.request).then((networkResponse) => {
        // Check if we received a valid response
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // IMPORTANT: Clone the response. A response is a stream
        // and can only be consumed once. We need to consume it once
        // to return it to the browser and once to cache it.
        const responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // If network request fails (e.g., offline), and it's a navigation request,
        // try to serve the index.html from cache as a fallback.
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        // For other failed requests, you might want to return a generic offline page or error.
        // For now, we'll just let it fail or return a simple offline response.
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});