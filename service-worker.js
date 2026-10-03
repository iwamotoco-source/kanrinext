/* 工事管理next — オフライン用キャッシュ（GitHub Pages / PWA 時のみ有効） */
const CACHE='kouji-next-v8';
const CORE=['./','./index.html','./manifest.json','./icons/icon-64.png','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png',
'./assets/css/app.css','./assets/css/calendar.css','./assets/css/mobile.css','./assets/vendor/leaflet/leaflet.css','./assets/vendor/leaflet/leaflet.js',
'./assets/js/stations.js','./assets/js/core.js','./assets/js/holidays.js','./assets/js/recur.js','./assets/js/calendar.js','./assets/js/event-editor.js','./assets/js/ics.js','./assets/js/ics-original.js','./assets/js/crypto-sync.js','./assets/js/tool-cable-route.js','./assets/js/mobile-fixes.js','./assets/js/assistant.js','./assets/js/assistant-transport-fix.js','./assets/js/app.js',
'./tools/pdf-editor.html','./tools/excel-images.html','./tools/drawing-scale.html','./tools/quantity-takeoff.html','./tools/cable-route.html','./tools/electrical-calc.html','./tools/odakyu-fare.html',
'./tools/lib/jszip.min.js','./tools/lib/jspdf.umd.min.js','./tools/lib/pdf.min.js','./tools/lib/pdf.worker.min.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;const u=new URL(e.request.url);
  if(u.origin!==location.origin)return; /* 天気・地図タイル・GitHub API・AIプロキシはキャッシュしない */
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});
