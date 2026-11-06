'use client';
import {useEffect,useRef,useState} from 'react';
import {useMusic} from '@/context/MusicContext';
import {ALEXA_LOCAL_ENABLED_KEY_V967} from '@/lib/alexaConcertV967';
import {ALEXA_ARTIST_KEY_V1007,ALEXA_ARTIST_EVENT_V1007,parseArtistVoiceConsentV1007,
 canApplyAlexaArtistV1007,executeAlexaArtistV1007} from '@/lib/alexaArtistV1007';
function permissionSince():number {
 try{
  const general=parseArtistVoiceConsentV1007(localStorage.getItem(ALEXA_LOCAL_ENABLED_KEY_V967));
  const artist=parseArtistVoiceConsentV1007(localStorage.getItem(ALEXA_ARTIST_KEY_V1007));
  return general.enabled&&artist.enabled?Math.max(general.since,artist.since):0;
 }catch{return 0;}
}
/** Mounted on the display, so the settings studio can be closed after opt-in. */
export function AlexaArtistControlV1007(){
 const {connected}=useMusic();
 const [since,setSince]=useState(0),[status,setStatus]=useState('');
 const lastSeen=useRef('');
 useEffect(()=>{
  const refresh=()=>setSince(permissionSince());
  refresh();
  const events=['storage',ALEXA_ARTIST_EVENT_V1007,'sonic-display:alexa-local-status-v971'];
  events.forEach(event=>window.addEventListener(event,refresh));
  try{lastSeen.current=sessionStorage.getItem('sonic:alexa-artist-last-v1007')||'';}catch{/* in-memory dedupe */}
  return()=>events.forEach(event=>window.removeEventListener(event,refresh));
 },[]);
 useEffect(()=>{if(!status)return;const timer=window.setTimeout(()=>setStatus(''),14000);return()=>window.clearTimeout(timer);},[status]);
 useEffect(()=>{
  if(!connected||since<=0)return;
  let disposed=false,flight=false;
  const abort=new AbortController();
  const allowed=()=>!disposed&&!abort.signal.aborted&&permissionSince()===since&&document.visibilityState==='visible';
  const poll=async()=>{
   if(flight||!allowed())return;flight=true;
   try{
    const response=await fetch('/api/alexa/pending',{cache:'no-store',signal:abort.signal});
    if(!response.ok||!allowed())return;
    const data=await response.json();
    if(!allowed()||!canApplyAlexaArtistV1007(data.command,since,Date.now())||data.command.id===lastSeen.current)return;
    // Claim before network mutation: no automatic retries of an uncertain result.
    lastSeen.current=data.command.id;
    try{sessionStorage.setItem('sonic:alexa-artist-last-v1007',data.command.id);}catch{/* optional persistence */}
    const result=await executeAlexaArtistV1007(data.command,{since,now:Date.now,allowed,fetcher:fetch,signal:abort.signal});
    if(disposed)return;
    window.dispatchEvent(new CustomEvent('sonic:artist-follow-changed-v359',{detail:result}));
    setStatus(result.following?`Du folgst jetzt ${result.artistName} auf Spotify.`:`Du folgst ${result.artistName} auf Spotify nicht mehr.`);
   }catch(error){if(!disposed)setStatus(error instanceof Error?error.message:'Alexa-Künstleraktion fehlgeschlagen.');}
   finally{flight=false;}
  };
  void poll();const timer=window.setInterval(()=>{void poll();},4000);
  const visible=()=>{if(document.visibilityState==='visible')void poll();};
  document.addEventListener('visibilitychange',visible);
  return()=>{disposed=true;abort.abort();window.clearInterval(timer);document.removeEventListener('visibilitychange',visible);};
 },[connected,since]);
 return status?<div className="alexa-artist-status-v1007" role="status" aria-live="polite">{status}</div>:null;
}
export function AlexaArtistPermissionV1007(){
 const [enabled,setEnabled]=useState(false),[error,setError]=useState('');
 useEffect(()=>{const refresh=()=>{try{setEnabled(parseArtistVoiceConsentV1007(localStorage.getItem(ALEXA_ARTIST_KEY_V1007)).enabled);}catch{setEnabled(false);}};
  refresh();window.addEventListener('storage',refresh);window.addEventListener(ALEXA_ARTIST_EVENT_V1007,refresh);
  return()=>{window.removeEventListener('storage',refresh);window.removeEventListener(ALEXA_ARTIST_EVENT_V1007,refresh);};},[]);
 const toggle=(next:boolean)=>{
  try{localStorage.setItem(ALEXA_ARTIST_KEY_V1007,JSON.stringify({enabled:next,since:next?Date.now():0}));
   setEnabled(next);setError('');window.dispatchEvent(new Event(ALEXA_ARTIST_EVENT_V1007));
  }catch{setError('Alexa-Künstlerfreigabe konnte nicht gespeichert werden.');}
 };
 return <fieldset aria-label="Alexa Spotify-Künstler"><legend>Künstler mit Alexa liken oder entliken</legend>
  <label><input type="checkbox" checked={enabled} onChange={event=>toggle(event.target.checked)}/> Künstler auf Spotify per Alexa folgen und entfolgen erlauben</label>
  <p className="settings-note">Zusätzlich den Alexa-Empfang oben einschalten. Sage „Alexa, sage Sonic Display, bitte like den Künstler“ oder „bitte entlike den Künstler“. Bei mehreren Künstlern fragt Alexa nach einer Nummer. Mit „Bitte allen Künstlern folgen“ wird die gesamte aktuelle Künstlerliste gewählt. Das Display muss sichtbar geöffnet und mit Spotify verbunden sein; die Einstellungen dürfen geschlossen werden.</p>
  <p className="settings-note">Bei fehlender Berechtigung Spotify neu verbinden und Künstler-Abonnements freigeben. Der bestätigte Spotify-Status erscheint auf dem Display. Alexa wartet kurz auf die Bestätigung; bei Verzögerung lässt sich das letzte Ergebnis erneut abfragen.</p>
  {error&&<p role="status">{error}</p>}
 </fieldset>;
}
