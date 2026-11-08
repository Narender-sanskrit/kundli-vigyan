/* Kundli Vigyan — offline cache */
const CACHE = 'kundli-vigyan-v5';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './vendor/swe.wasm'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.all(ASSETS.map(a => c.add(a).catch(() => { })))
  ).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;          // let external lookups go to the network
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => { });
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});
