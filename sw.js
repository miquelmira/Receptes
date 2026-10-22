
var CACHE_NAME = 'receptes-v4';
var ASSETS = [
    '/Receptes/index.html',
    '/Receptes/manifest.json',
    '/Receptes/icon-192.png',
    '/Receptes/icon-512.png'
];

// Install: cache assets
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) { return cache.addAll(ASSETS); })
    );
    self.skipWaiting();
});

// Activate: delete ALL old caches
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(k) { return k !== CACHE_NAME; })
                    .map(function(k) { return caches.delete(k); })
            );
        })
    );
    self.clients.claim();
});

// Fetch: NETWORK-FIRST strategy (always tries to get fresh version)
self.addEventListener('fetch', function(event) {
    // Let share target requests pass through always
    if (event.request.url.indexOf('?title=') >= 0 ||
        event.request.url.indexOf('?text=') >= 0 ||
        event.request.url.indexOf('?url=') >= 0) {
        return;
    }

    event.respondWith(
        fetch(event.request).then(function(response) {
            // Got fresh response, update cache
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
                cache.put(event.request, clone);
            });
            return response;
        }).catch(function() {
            // Network failed, use cache (offline mode)
            return caches.match(event.request).then(function(cached) {
                return cached || caches.match('/Receptes/index.html');
            });
        })
    );
});

