const CACHE='kpss-pro-v18';
const FILES=['./','./index.html','./manifest.json','./chart.umd.js','./icon-192.png','./icon-512.png','./privacy.html'];
// Netlify yönlendirme (301) yaptığında "redirected" işaretli cevap sayfa açılışında hataya yol açar; işareti temizle
const clean=async r=>r.redirected?new Response(await r.blob(),{status:200,statusText:'OK',headers:r.headers}):r;
const save=(req,res)=>{if(res&&res.ok){const cp=res.clone();clean(cp).then(x=>caches.open(CACHE).then(c=>c.put(req,x))).catch(()=>{})}return res};
self.addEventListener('install',e=>{
  e.waitUntil(Promise.all(FILES.map(f=>fetch(f).then(r=>save(f,r)).catch(()=>{}))));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||!r.url.startsWith(self.location.origin))return;
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>save(r,res)).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./index.html')||caches.match('./'))));
  }else{
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>save(r,res))));
  }
});
