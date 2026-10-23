'use client';
import {useCallback,useEffect,useState} from 'react';
import {PUSH_GENRES_V365,type PushGenreV365} from '@/lib/push-client-v365';
import {decodeVapidPublicKey} from '@/lib/push-client-v365';
type Status={configured:boolean;enabled:boolean;currentDeviceEnabled?:boolean;devices:number;publicKey:string|null;genres:PushGenreV365[];message?:string};
const labels:Record<PushGenreV365,string>={deutschrap:'Deutschrap',hardstyle:'Hardstyle',hardtekk:'Hardtekk'};
export function PushSettingsV365(){
 const [status,setStatus]=useState<Status|null>(null),[genres,setGenres]=useState<PushGenreV365[]>([]);
 const [localEnabled,setLocalEnabled]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const supported=typeof window!=='undefined'&&'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window&&window.isSecureContext;
 const refresh=useCallback(async()=>{
  try{
   const current=supported?await (await navigator.serviceWorker.getRegistration('/'))?.pushManager.getSubscription():null;
   const endpoint=current?.endpoint??'';
   const response=await fetch('/api/push/subscription'+(endpoint?'?endpoint='+encodeURIComponent(endpoint):''),{cache:'no-store'});
   if(!response.ok)throw new Error(response.status===401?'Bitte Spotify verbinden.':'Push-Status nicht verfügbar.');
   const result=await response.json() as Status;setStatus(result);setGenres(result.genres??[]);
   setLocalEnabled(!!current&&!!result.currentDeviceEnabled);
  }catch(e){setMessage(e instanceof Error?e.message:'Push-Dienst nicht erreichbar.');}
 },[supported]);
 useEffect(()=>{if(supported)void navigator.serviceWorker.register('/sw-v364.js',{scope:'/'}).catch(()=>null).then(()=>refresh());else void refresh();},[refresh,supported]);
 async function enable(){
  if(!supported||!status?.configured||!status.publicKey)return;
  setBusy(true);setMessage('');
  let subscription:PushSubscription|null=null;let newlyCreated=false;
  try{
   const permission=await Notification.requestPermission();
   if(permission!=='granted')throw new Error('Benachrichtigungen wurden im Browser nicht erlaubt.');
   const registration=await navigator.serviceWorker.ready;
   subscription=await registration.pushManager.getSubscription();
   if(!subscription){subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:decodeVapidPublicKey(status.publicKey)});newlyCreated=true;}
   const response=await fetch('/api/push/subscription',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subscription:subscription.toJSON(),genres})});
   if(!response.ok){const d=await response.json() as {message?:string};throw new Error(d.message||'Push-Abo konnte nicht auf dem Server gespeichert werden.');}
   setMessage('Web Push aktiviert. Erste Hintergrundprüfung richtet den Ausgangsstand ein.');await refresh();
  }catch(e){if(newlyCreated&&subscription)await subscription.unsubscribe().catch(()=>{});setMessage(e instanceof Error?e.message:'Push-Aktivierung fehlgeschlagen.');}
  finally{setBusy(false);}
 }
 async function disable(){
  setBusy(true);setMessage('');
  try{
   const subscription=supported?await (await navigator.serviceWorker.ready).pushManager.getSubscription():null;
   const response=await fetch('/api/push/subscription',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify(subscription?{endpoint:subscription.endpoint}:{all:true})});
   if(!response.ok)throw new Error('Serverseitige Abmeldung fehlgeschlagen. Bitte erneut versuchen.');
   if(subscription)await subscription.unsubscribe();
   await refresh();setMessage('Push für dieses Gerät deaktiviert.');
  }catch(e){setMessage(e instanceof Error?e.message:'Push konnte nicht deaktiviert werden.');}
  finally{setBusy(false);}
 }
 async function updateGenres(next:PushGenreV365[]){setGenres(next);if(!localEnabled)return;
  setBusy(true);setMessage('');
  try{
   const sub=await (await navigator.serviceWorker.ready).pushManager.getSubscription();
   if(!sub)throw new Error('Das Push-Abo ist nicht mehr vorhanden.');
   const response=await fetch('/api/push/subscription',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subscription:sub.toJSON(),genres:next})});
   if(!response.ok)throw new Error('Genreeinstellung konnte nicht gespeichert werden.');
   setMessage('Genre-Auswahl gespeichert.');
  }catch(e){setMessage(e instanceof Error?e.message:'Änderung fehlgeschlagen.');}finally{setBusy(false);}
 }
 if(!supported)return <p>Web Push wird von diesem Browser nicht unterstützt. Android: Chrome mit HTTPS verwenden.</p>;
 return <section style={{marginTop:9,borderTop:'1px solid #555',paddingTop:8}} aria-label="Web-Push-Benachrichtigungen">
  <strong>🔔 Hintergrund-Push (V365)</strong>
  {status&&!status.configured?<p>Web Push ist auf dem Server noch nicht eingerichtet (Redis, VAPID, Cron).</p>:<>
   <p>{localEnabled?'Auf diesem Gerät aktiviert':status?.enabled?'Auf anderem Gerät bereits aktiv':'Noch nicht aktiviert'}{status?.devices?` · ${status.devices} Gerät(e)`:''}</p>
   <label style={{display:'block',fontSize:11}}>Künstlergenres (keine Auswahl = alle gefolgten Künstler)</label>
   {PUSH_GENRES_V365.map(g=><label key={g} style={{display:'block'}}><input type="checkbox" disabled={busy} checked={genres.includes(g)} onChange={e=>void updateGenres(e.target.checked?[...genres,g]:genres.filter(x=>x!==g))}/> {labels[g]}</label>)}
   <button type="button" disabled={busy||!status?.configured} onClick={()=>void (localEnabled?disable():enable())}>{busy?'Bitte…':localEnabled?'Push auf diesem Gerät deaktivieren':'Hintergrund-Push aktivieren'}</button>
   {status?.enabled&&<button type="button" disabled={busy} onClick={()=>void (async()=>{
    setBusy(true);try{const r=await fetch('/api/push/subscription',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({all:true})});if(!r.ok)throw Error('Löschen fehlgeschlagen.');const sub=await (await navigator.serviceWorker.ready).pushManager.getSubscription();await sub?.unsubscribe();await refresh();setMessage('Alle Push-Geräte und serverseitige Spotify-Daten entfernt.');}catch(e){setMessage(e instanceof Error?e.message:'Fehler');}finally{setBusy(false);}})()}>Alle Geräte abmelden und Serverdaten löschen</button>}
  </>}
  {message&&<p role="status">{message}</p>}
  <small>Nur wenn die Server-Einrichtung abgeschlossen ist. Erste Prüfung legt den Ausgangsstand fest; danach tägliche Prüfung gemäß Hosting-Tarif. Artist-Genres sind unvollständig und können Veröffentlichungen auslassen.</small>
 </section>;
}
