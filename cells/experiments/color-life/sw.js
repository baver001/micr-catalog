const CACHE='micr-color-life-v2';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.svg','./icon-512.svg','/data/styles/mascot.css','/data/styles/micr-shell.css','/data/js/mascot.js','/data/js/pwa-install.js','/data/js/micr-shell.js','/data/js/app-pwa.js','/data/graph.json','/data/surfaces.json'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok&&new URL(event.request.url).origin===self.location.origin){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>cached)));});
