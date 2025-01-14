console.log('work')

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('offline-cache').then((cache) => {
            return cache.addAll(['/offline', '/icons/icon-192x192.png']);
        })
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() =>
                caches.match('/offline')
            )
        );
        console.log('ok')
    } else {
        event.respondWith(
            caches.match(event.request).then((response) => response || fetch(event.request))
        );
        console.log('not ok')
    }
});



