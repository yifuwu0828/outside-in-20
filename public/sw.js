const CACHE='outside20-v3';
const app=['./','index.html','style.css','app.js','engine.js','catalog.js','card.html','card.css','card.js','validation.html','validation.js','assets-manifest.json'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE),manifest=await (await fetch('./assets-manifest.json')).json();
  const assets=manifest.assets.filter(a=>!a.path.includes('jsep')&&!a.path.endsWith('package.json')).map(a=>a.path);
  for(const path of [...app,...assets])await cache.add(new Request(new URL(path,self.registration.scope),{cache:'reload'}));
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>{if(event.data?.type==='status')event.source?.postMessage({type:'cache-status',ready:self.registration.active?.state==='activated'});});
self.addEventListener('fetch',event=>{if(event.request.method==='GET'&&new URL(event.request.url).origin===self.location.origin)event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(event.request,{ignoreSearch:new URL(event.request.url).pathname.endsWith('/card.html')}))||fetch(event.request)));});
