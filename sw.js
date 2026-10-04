const CACHE='kpss-pro-v11';
const FILES=['./','./index.html','./manifest.json','./chart.umd.js','./icon-192.png','./icon-512.png','./privacy.html'];
const put=(r,res)=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res};
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||!r.url.startsWith(self.location.origin))return;
  if(r.mode==='navigate'||r.url.endsWith('index.html')){
    e.respondWith(fetch(r).then(res=>put(r,res)).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
  }else{
    // sadece başarılı (200) cevaplar önbelleğe alınır
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>put(r,res))));
  }
});
