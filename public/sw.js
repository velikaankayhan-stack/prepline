/* Offline support: serve from cache, refresh in the background. Bump VERSION on every release. */
var VERSION="prepline-1.0.1";
var CORE=["./","index.html","manifest.json","privacy.html","icons/icon.svg","icons/icon-192.png","icons/icon-512.png","icons/maskable-512.png"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){ return c.addAll(CORE); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k!==VERSION; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch",function(e){
  var u=new URL(e.request.url);
  if(e.request.method!=="GET" || u.origin!==location.origin) return;   /* dictionary API etc. go to the network */
  e.respondWith(caches.open(VERSION).then(function(c){
    return c.match(e.request,{ignoreSearch:true}).then(function(hit){
      var net=fetch(e.request).then(function(r){ if(r && r.ok) c.put(e.request,r.clone()); return r; }).catch(function(){ return hit; });
      return hit || net;
    });
  }));
});
