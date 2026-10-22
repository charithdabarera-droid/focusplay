const C='focusplay-v10',A=['./','./index.html','./styles.css','./app.js','./i18n.js','./apple-touch-icon.png','./manifest.json','./icon.svg','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./privacy-policy.html','./terms.html','./sounds/soft_chime.mp3','./sounds/bubble_pop.mp3','./sounds/wind_chimes.mp3','./sounds/music_box.mp3','./sounds/kitten_bell.mp3','./sounds/gentle_harp.mp3','./sounds/raindrop.mp3','./sounds/marimba.mp3'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window'}).then(l=>l.length?l[0].focus():clients.openWindow('./')))});
