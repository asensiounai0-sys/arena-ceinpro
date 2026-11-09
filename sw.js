const CACHE='arena-ceinpro-v7';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const u=new URL(req.url); if(u.origin!==location.origin && !/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) return; // conexión online y otros sitios: sin caché
  // Página del juego: primero la red (para recibir actualizaciones), si no hay conexión, la copia guardada
  if(req.mode==='navigate'){ e.respondWith(fetch(req).then(r=>{ const cp=r.clone(); caches.open(CACHE).then(c=>c.put('index.html',cp)); return r; }).catch(()=>caches.match('index.html'))); return; }
  // Resto (iconos, fuentes): copia guardada y se actualiza en segundo plano
  e.respondWith(caches.match(req).then(hit=>{ const net=fetch(req).then(r=>{ if(r&&(r.ok||r.type==='opaque')){ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); } return r; }).catch(()=>hit); return hit||net; }));
});
