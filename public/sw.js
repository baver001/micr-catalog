const CACHE_NAME = 'micr-fun-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/app.html',
    '/styles/main.css',
    '/js/store.js',
    '/js/supabase.js',
    '/js/i18n.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
