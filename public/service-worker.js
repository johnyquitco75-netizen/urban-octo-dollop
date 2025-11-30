const CACHE_NAME = 'egrs-cache-v3'; // Increment cache version again to force update
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
  console.log('Service Worker: Install event - Caching initial assets');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache initial assets during install', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  // Strategy: Cache First, then Network, with dynamic caching for new assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If cached, return immediately
      if (cachedResponse) {
        console.log('Service Worker: Serving from cache:', event.request.url);
        return cachedResponse;
      }

      // If not cached, try network
      console.log('Service Worker: Fetching from network:', event.request.url);
      return fetch(event.request)
        .then((networkResponse) => {
          // Check if we received a valid response to cache
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              console.log('Service Worker: Caching new asset:', event.request.url);
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((error) => {
          console.error('Service Worker: Fetch failed for:', event.request.url, error);
          // Network request failed.
          // For navigation requests, try to serve index.html as a fallback.
          if (event.request.mode === 'navigate') {
            console.log('Service Worker: Network failed for navigation, falling back to index.html');
            return caches.match('/index.html');
          }
          // For other requests, return a generic offline response or re-throw error
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event - Cleaning old caches');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Ensure the service worker takes control of all clients immediately
      return self.clients.claim();
    })
  );
});