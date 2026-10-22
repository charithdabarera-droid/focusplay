const C='focusplay-v11',A=['./','./index.html','./styles.css','./app.js','./i18n.js','./apple-touch-icon.png','./manifest.json','./icon.svg','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./privacy-policy.html','./terms.html','./sounds/soft_chime.mp3','./sounds/bubble_pop.mp3','./sounds/wind_chimes.mp3','./sounds/music_box.mp3','./sounds/kitten_bell.mp3','./sounds/gentle_harp.mp3','./sounds/raindrop.mp3','./sounds/marimba.mp3'];
const CORE=/\/(index\.html|app\.js|i18n\.js|styles\.css|manifest\.json)?$/;
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(A.map(u=>new Request(u,{cache:'reload'})))))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
function netFirst(req){return Promise.race([fetch(req,{cache:'no-store'}).then(r=>{if(r&&r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(req,cp))}return r}),new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),4000))])
 .catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||(req.mode==='navigate'?caches.match('./index.html'):Response.error())))}
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
 if(r.mode==='navigate'||CORE.test(u.pathname))e.respondWith(netFirst(r));
 else e.respondWith(caches.match(r,{ignoreSearch:true}).then(c=>c||fetch(r).then(n=>{if(n.ok){const cp=n.clone();caches.open(C).then(x=>x.put(r,cp))}return n})))});
self.addEventListener('message',e=>{if(e.data==='skipWaiting')self.skipWaiting()});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window'}).then(l=>l.length?l[0].focus():clients.openWindow('./')))});
