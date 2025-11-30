const CACHE_NAME = 'egrs-cache-v6'; // Increment cache version to force update
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
      .then(() => self.skipWaiting()) // Activate new service worker immediately
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

  const url = new URL(event.request.url);

  // Always serve index.html from cache if available, otherwise fetch and cache
  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log('Service Worker: Serving index.html from cache:', event.request.url);
          return cachedResponse;
        }
        console.log('Service Worker: Fetching index.html from network and caching:', event.request.url);
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch((error) => {
          console.error('Service Worker: Failed to fetch index.html from network:', error);
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      })
    );
    return; // Stop processing after handling index.html
  }

  // Stale-While-Revalidate strategy for all other assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Updating cache with fresh network response:', event.request.url);
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((error) => {
        console.error('Service Worker: Network fetch failed for:', event.request.url, error);
        // If network fails, and there's no cached response, try to fallback to index.html for navigation
        if (!cachedResponse && event.request.mode === 'navigate') {
          console.log('Service Worker: Network failed for navigation, falling back to index.html');
          return caches.match('/index.html');
        }
        // If network fails and no cached response, return a generic offline response
        if (!cachedResponse) {
          console.log('Service Worker: Network failed and no cache for:', event.request.url);
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        }
        // If network fails but there's a cached response, the cachedResponse will be returned below
        throw error; // Re-throw to propagate error if no fallback
      });

      // Return cached response immediately if available, otherwise wait for network
      return cachedResponse || fetchPromise;
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
      console.log('Service Worker: Claiming clients');
      return self.clients.claim();
    })
  );
});