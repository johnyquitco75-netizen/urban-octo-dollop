const CACHE_NAME = 'egrs-cache-v4'; // Increment cache version to force update
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json', // Ensure manifest is cached
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

  const url = new URL(event.request.url);

  // Cache-First strategy for index.html and root path
  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log('Service Worker: Serving index.html from cache:', event.request.url);
          return cachedResponse;
        }
        console.log('Service Worker: Fetching index.html from network:', event.request.url);
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              console.log('Service Worker: Caching index.html:', event.request.url);
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch((error) => {
          console.error('Service Worker: Failed to fetch index.html from network:', error);
          // If network fails for index.html and it wasn't in cache, we can't do much more.
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      })
    );
    return; // Stop processing after handling index.html
  }

  // Network-First, then Cache strategy for all other assets
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Caching asset from network:', event.request.url);
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        console.log('Service Worker: Network failed, trying cache for:', event.request.url);
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('Service Worker: Serving from cache after network failure:', event.request.url);
            return cachedResponse;
          }
          // If both network and cache fail, and it's a navigation request, fallback to index.html
          if (event.request.mode === 'navigate') {
            console.log('Service Worker: Cache also failed for navigation, falling back to index.html');
            return caches.match('/index.html'); // This should ideally be already cached by the first block
          }
          console.log('Service Worker: Cache also failed for non-navigation request:', event.request.url);
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