/* V364 PWA shell. No Spotify responses or credentials are cached. */
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.mode !== 'navigate' || url.origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).catch(() => new Response('Sonic Display ist offline. Bitte Internetverbindung prüfen.', {status:503, headers:{'Content-Type':'text/plain; charset=utf-8'}})));
});
/* V365 Web Push: only safe, server-created payloads; no token or album cache. */
self.addEventListener('push', event => {
  let data={};
  try { data=event.data ? event.data.json() : {}; } catch { data={}; }
  const albumId=typeof data.albumId==='string'&&/^[A-Za-z0-9]{10,32}$/.test(data.albumId)?data.albumId:null;
  const title=typeof data.title==='string'?data.title.slice(0,90):'Sonic Display · Neue Musik';
  const body=typeof data.body==='string'?data.body.slice(0,180):'Neue Veröffentlichung entdecken';
  const icon=typeof data.icon==='string'&&data.icon.startsWith('https://')&&(()=>{try{return new URL(data.icon).hostname==='i.scdn.co';}catch{return false;}})()?data.icon:'/sonic-icon.svg';
  const tag=albumId?`sonic-release-${albumId}`:'sonic-release';
  event.waitUntil(self.registration.showNotification(title,{body,icon,tag,data:{albumId},actions:[{action:'spotify',title:'Auf Spotify öffnen'},{action:'sonic',title:'Sonic Display'}]}));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const id=event.notification.data?.albumId;
  const albumId=typeof id==='string'&&/^[A-Za-z0-9]{10,32}$/.test(id)?id:null;
  // Notification tap opens the real Spotify release; the optional Sonic action opens the PWA.
  const openSonic=event.action==='sonic';
  const target=openSonic?new URL(albumId?`/?release=${encodeURIComponent(albumId)}`:'/',self.location.origin).href:
    albumId?`https://open.spotify.com/album/${albumId}`:self.location.origin+'/';
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients => {
    if(openSonic){
      const existing=clients.find(client=>new URL(client.url).origin===self.location.origin);
      if(existing){await existing.focus();await existing.navigate(target);return;}
    }
    await self.clients.openWindow(target);
  }));
});
