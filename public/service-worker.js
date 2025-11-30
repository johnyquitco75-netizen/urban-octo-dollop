const CACHE_NAME = 'egrs-cache-v5'; // Increment cache version to force update
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json', // Ensure manifest is cached
  '/service-worker.js', // Cache the service worker itself
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
        console.log('Service Worker: Pre-caching static assets');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Failed to pre-cache initial assets during install', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Strategy: Cache First, then Network (for all requests)
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // If the request is in the cache, return the cached response immediately
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // If not in cache, try to fetch from the network
        console.log('Service Worker: Fetching from network and caching:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // Check if we received a valid response to cache
            // Don't cache non-200 responses or opaque responses (e.g., cross-origin without CORS)
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.error('Service Worker: Network fetch failed for:', event.request.url, error);
            // If both cache and network fail, and it's a navigation request,
            // try to fallback to the cached index.html
            if (event.request.mode === 'navigate') {
              console.log('Service Worker: Network failed for navigation, falling back to index.html');
              return caches.match('/index.html');
            }
            // For other requests, return a generic offline response
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
      console.log('Service Worker: Claiming clients');
      return self.clients.claim();
    })
  );
});