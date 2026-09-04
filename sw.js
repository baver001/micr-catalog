const CACHE = 'micrfun-shell-v2';
const PRECACHE = ['/', '/index.html', '/favicon.svg', '/manifest.json', '/data/graph.json', '/data/surfaces.json'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

function isShellAsset(url) {
  return url.pathname === '/' || url.pathname === '/index.html' ||
    url.pathname === '/favicon.svg' || url.pathname === '/icon.svg' ||
    url.pathname === '/manifest.json' || url.pathname === '/data/graph.json' ||
    url.pathname === '/data/surfaces.json' || url.pathname.startsWith('/data/js/') ||
    url.pathname.startsWith('/data/styles/');
}

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin || !isShellAsset(url)) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => caches.match(event.request).then(cached => cached || caches.match('/'))));
});
