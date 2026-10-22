
const CACHE_NAME = 'receptes-v1';
const ASSETS = [
    '/Receptes/index.html',
    '/Receptes/manifest.json',
    '/Receptes/icon-192.png',
    '/Receptes/icon-512.png'
];

// Install: cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch: cache-first strategy
self.addEventListener('fetch', event => {
    // Let share target requests pass through
    if (event.request.url.includes('?title=') || 
        event.request.url.includes('?text=') || 
        event.request.url.includes('?url=')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request).then(response => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            });
        }).catch(() => caches.match('/Receptes/index.html'))
    );
});

