'use client';
import {backgroundJsonV1009} from '@/lib/backgroundJsonV1009';
import {useEffect,useRef,useState} from 'react';
import {useMusic} from '@/context/MusicContext';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import {ALEXA_LOCAL_ENABLED_KEY_V967} from '@/lib/alexaConcertV967';
import {activateConcertSceneV1147,applyVirtualConcertSceneV1147,type ConcertSceneV1147} from '@/lib/alexaConcertScenesV1147';
import {ALEXA_FULL_CONCERT_EVENT_V1145,loadFullConcertConsentV1145,isFullConcertVoiceCommandV1145,executeAlexaFullConcertV1145,runFullConcertV1145} from '@/lib/alexaFullConcertV1145';
import {ALEXA_GOVEE_RECEIVER_EVENT_V1139,readAlexaGoveeReceiverTokenV1139,alexaGoveeReceiverHeadersV1139} from '@/lib/alexaGoveeReceiverClientV1139';
import {executeAlexaGoveePowerV1141} from '@/lib/goveePowerRoutingV1141';
import {GOVEE_LOOK_CONSENT_EVENT_V1146,loadGoveeLookConsentV1146,isGoveeVoiceLookCommandV1146,executeAlexaGoveeVoiceLookV1146} from '@/lib/goveeVoiceLookV1146';
import {GOVEE_SYNC_CONSENT_EVENT_V1143,loadGoveeSyncConsentV1143,isGoveeMusicVoiceCommandV1143,executeAlexaGoveeMusicSyncV1143,isGoveeOnlyVoiceCommandV1143} from '@/lib/goveeMusicVoiceV1143';
import {GOVEE_POWER_CONSENT_EVENT_V1138,loadGoveePowerConsentV1138,isGoveePowerCommandV1138,executeAlexaGoveePowerV1138} from '@/lib/goveePowerV1138';
import {ALEXA_ARTIST_KEY_V1007,ALEXA_ARTIST_EVENT_V1007,parseArtistVoiceConsentV1007} from '@/lib/alexaArtistV1007';
import {VOICE_DISPLAY_KEY_V1008,VOICE_SETTINGS_EVENT_V1008,freshVoiceV1008,isArtistVoiceV1008,
 executeArtistVoiceV1008,executeDisplayVoiceV1008,type VoiceUndoV1008,type VoiceResultV1008,type VoiceMessageV1008} from '@/lib/alexaVoiceV1008';
const UNDO='sonic:alexa-undo-v1008';
function permissions(){try{return {
 general:parseArtistVoiceConsentV1007(localStorage.getItem(ALEXA_LOCAL_ENABLED_KEY_V967)),
 artist:parseArtistVoiceConsentV1007(localStorage.getItem(ALEXA_ARTIST_KEY_V1007)),
 display:parseArtistVoiceConsentV1007(localStorage.getItem(VOICE_DISPLAY_KEY_V1008)),
 power:loadGoveePowerConsentV1138(),
 sync:loadGoveeSyncConsentV1143(),
 look:loadGoveeLookConsentV1146(),
 show:loadFullConcertConsentV1145(),
};}catch{return {general:{enabled:false,since:0},artist:{enabled:false,since:0},display:{enabled:false,since:0},power:{enabled:false,since:0},sync:{enabled:false,since:0},look:{enabled:false,since:0},show:{enabled:false,since:0,includeGovee:false}};}}
export function AlexaVoiceControlV1008(){
 const {connected,isPlaying,track}=useMusic();const {preferences,updatePreferences}=useUiPreferences();
 const current=useRef(preferences);current.current=preferences;
 const [settings,setSettings]=useState(permissions),[status,setStatus]=useState('');
 const seen=useRef(new Set<string>()),undo=useRef<VoiceUndoV1008|null>(null);
 useEffect(()=>{try{undo.current=JSON.parse(sessionStorage.getItem(UNDO)||'null');}catch{/* no history */}
  const refresh=()=>setSettings(permissions());refresh();
  const events=['storage',VOICE_SETTINGS_EVENT_V1008,ALEXA_ARTIST_EVENT_V1007,GOVEE_POWER_CONSENT_EVENT_V1138,ALEXA_GOVEE_RECEIVER_EVENT_V1139,GOVEE_SYNC_CONSENT_EVENT_V1143,GOVEE_LOOK_CONSENT_EVENT_V1146,ALEXA_FULL_CONCERT_EVENT_V1145,'sonic-display:alexa-local-status-v971'];
  events.forEach(e=>window.addEventListener(e,refresh));return()=>events.forEach(e=>window.removeEventListener(e,refresh));
 },[]);
 useEffect(()=>{if(!status)return;const timer=window.setTimeout(()=>setStatus(''),18000);return()=>window.clearTimeout(timer);},[status]);
 useEffect(()=>{
  if(!settings.general.enabled||(!connected&&(!(settings.power.enabled||settings.sync.enabled||settings.look.enabled)||!readAlexaGoveeReceiverTokenV1139())))return;
  let disposed=false,flight=false;const abort=new AbortController();
  const visible=()=>!disposed&&!abort.signal.aborted&&document.visibilityState==='visible';
  const notify=(value:{artistId:string;following:boolean})=>window.dispatchEvent(new CustomEvent('sonic:artist-follow-changed-v359',{detail:value}));
  const saveUndo=(value:VoiceUndoV1008|null)=>{undo.current=value;try{if(value)sessionStorage.setItem(UNDO,JSON.stringify(value));else sessionStorage.removeItem(UNDO);}catch{/* keep in-memory undo */}};
  const post=async(value:object)=>backgroundJsonV1009(connected?'/api/alexa/voice-result':'/api/alexa/govee-result',{method:'POST',headers:{'Content-Type':'application/json',...(!connected?alexaGoveeReceiverHeadersV1139():{})},body:JSON.stringify(value),signal:abort.signal});
  const poll=async()=>{
   if(flight||!visible())return;flight=true;
   try{
    const response=await backgroundJsonV1009(connected?'/api/alexa/voice-pending':'/api/alexa/govee-pending',{cache:'no-store',signal:abort.signal,...(!connected?{headers:alexaGoveeReceiverHeadersV1139()}:{})});
    if(!response.ok){if(response.status===401)setStatus(connected?'Spotify-Anmeldung fehlt. Bitte Spotify neu verbinden.':'Govee-Empfänger-Token stimmt nicht mit der Vercel-Einstellung überein.');else if(response.status===503)setStatus('Alexa-Weiterleitung nicht erreichbar. Unter Einstellungen die Verbindung prüfen.');return;}
    const data=await response.json();if(!Array.isArray(data.commands)||!visible())return;
    for(const raw of data.commands.slice(0,20)){
     const p=permissions();if(!p.general.enabled||(!connected&&!isGoveeOnlyVoiceCommandV1143(raw?.command))||!freshVoiceV1008(raw,p.general.since,Date.now())||seen.current.has(raw.id)||!visible())continue;
     const message:VoiceMessageV1008=raw;seen.current.add(message.id);if(seen.current.size>100)seen.current.delete(seen.current.values().next().value!);
     const claim=await post({id:message.id,phase:'claim'});if(!claim.ok)continue;
     const {token}=await claim.json();let result:VoiceResultV1008;
     try{
      const category=isArtistVoiceV1008(message.command)?'artist':isGoveePowerCommandV1138(message.command)?'power':isGoveeMusicVoiceCommandV1143(message.command)?'sync':isGoveeVoiceLookCommandV1146(message.command)?'look':(isFullConcertVoiceCommandV1145(message.command)||message.command.startsWith('concert-scene-'))?'show':'display';
      const consent=p[category];const since=Math.max(p.general.since,consent.since);
      const allowed=()=>{const latest=permissions();return visible()&&latest.general.enabled&&latest.general.since===p.general.since&&latest[category].enabled&&latest[category].since===consent.since;};
      if(message.command==='connection-status'){
       const response=await backgroundJsonV1009('/api/alexa/status',{cache:'no-store',signal:abort.signal});const health=await response.json();
       if(!response.ok||health.spotify!==true||health.relay!=='ready')throw Error(health.spotify===false?'Spotify-Verbindung fehlt oder ist nicht erreichbar. Bitte auf dem Display prüfen.':'Die Alexa-Weiterleitung ist noch nicht bereit. Bitte auf dem Display prüfen.');
       result={kind:'complete',text:`Das Display ist erreichbar. Spotify und die Alexa-Weiterleitung sind verbunden.${health.artistScopes?'':' Für Künstleraktionen Spotify bitte neu verbinden.'}`};
      }
      else if(!consent.enabled||!freshVoiceV1008(message,since,Date.now()))throw Error(category==='artist'?'Bitte zuerst die Künstlersteuerung auf diesem Display freigeben.':category==='power'?'Bitte zuerst Alexa Govee Ein/Aus separat freigeben.':category==='sync'?'Bitte zuerst Alexa Govee Musik-Sync separat freigeben.':category==='look'?'Bitte zuerst Alexa Govee Farbe und Helligkeit separat freigeben.':category==='show'?'Bitte zuerst die vollständige Konzertshow per Alexa separat freigeben.':'Bitte zuerst die Anzeigesteuerung auf diesem Display freigeben.');
      else if(category==='artist')result=await executeArtistVoiceV1008(message,{since,now:Date.now,allowed,fetcher:fetch,signal:abort.signal,undo:undo.current,saveUndo,notify});
      else if(category==='sync')result=executeAlexaGoveeMusicSyncV1143(message,{since,now:Date.now,allowed,signal:abort.signal});
      else if(category==='look')result=await executeAlexaGoveeVoiceLookV1146(message,{since,now:Date.now,allowed,signal:abort.signal});
      else if(category==='show'&&message.command.startsWith('concert-scene-')){
       if(!connected||!isPlaying||!track?.id)throw Error('Bitte zuerst Spotify-Musik abspielen.');
       if(!allowed())throw Error('Konzertfreigabe widerrufen.');
       const scene=message.command.slice('concert-scene-'.length) as ConcertSceneV1147;
       const activation=activateConcertSceneV1147({scene,genre:'other',showConsent:p.show.enabled,
        goveeConsent:p.show.includeGovee&&p.look.enabled,musicSyncConsent:p.sync.enabled,
        reducedMotion:current.current.reducedMotion,masterBrightness:50},()=>runFullConcertV1145('concert-show-start',{preferences:current.current,updatePreferences,connected,playing:isPlaying,trackId:track?.id,allowed,signal:abort.signal}));
       applyVirtualConcertSceneV1147(activation.plan,allowed);
       result={kind:'complete',text:'Virtuelle Konzertphase '+scene+' aktiviert. Bühne und Lichtstimmung angepasst; Govee-Lampen bleiben unverändert.'};
      }
      else if(category==='show')result=executeAlexaFullConcertV1145(message,{since,now:Date.now,allowed,signal:abort.signal,preferences:current.current,updatePreferences,connected,playing:isPlaying,trackId:track?.id});
      else if(category==='power')result=message.goveeTarget?
       await executeAlexaGoveePowerV1141(message,{since,now:Date.now,allowed,signal:abort.signal}):
       await executeAlexaGoveePowerV1138(message,{since,now:Date.now,allowed,signal:abort.signal});
      else result=await executeDisplayVoiceV1008(message.command,{current:current.current.avatarModelId,fetcher:fetch,update:updatePreferences,allowed,signal:abort.signal});
     }catch(error){result={kind:'error',text:error instanceof Error?error.message.slice(0,1000):'Sprachbefehl konnte nicht ausgeführt werden.'};}
     if(disposed||abort.signal.aborted)return;
     setStatus(result.text);await post({id:message.id,phase:'complete',token,result});
    }
   }catch{if(visible())setStatus('Alexa-Verbindung unterbrochen. Bitte die Verbindung in den Einstellungen prüfen.');}
   finally{flight=false;}
  };
  void poll();const timer=window.setInterval(()=>{void poll();},1000);
  const onVisible=()=>{if(document.visibilityState==='visible')void poll();};document.addEventListener('visibilitychange',onVisible);
  return()=>{disposed=true;abort.abort();window.clearInterval(timer);document.removeEventListener('visibilitychange',onVisible);};
 },[connected,settings,updatePreferences,isPlaying,track?.id]);
 return status?<div className="alexa-artist-status-v1007" role="status" aria-live="polite">{status}</div>:null;
}
export function AlexaToolsV1008(){
 const {preferences,updatePreferences}=useUiPreferences();
 const [enabled,setEnabled]=useState(false),[notice,setNotice]=useState(''),[health,setHealth]=useState('Noch nicht geprüft.'),[busy,setBusy]=useState(false);
 useEffect(()=>{const refresh=()=>{try{setEnabled(parseArtistVoiceConsentV1007(localStorage.getItem(VOICE_DISPLAY_KEY_V1008)).enabled);}catch{setEnabled(false);}};refresh();window.addEventListener(VOICE_SETTINGS_EVENT_V1008,refresh);window.addEventListener('storage',refresh);return()=>{window.removeEventListener(VOICE_SETTINGS_EVENT_V1008,refresh);window.removeEventListener('storage',refresh);};},[]);
 const toggle=(next:boolean)=>{try{localStorage.setItem(VOICE_DISPLAY_KEY_V1008,JSON.stringify({enabled:next,since:next?Date.now():0}));setEnabled(next);window.dispatchEvent(new Event(VOICE_SETTINGS_EVENT_V1008));}catch{setNotice('Die Freigabe konnte nicht gespeichert werden.');}};
 const diagnose=async()=>{setBusy(true);try{
  const r=await backgroundJsonV1009('/api/alexa/status',{cache:'no-store'});const d=await r.json();
  setHealth(r.status===401?'Spotify: Anmeldung fehlt. Bitte neu verbinden.':d.spotify===false?'Spotify: momentan nicht erreichbar. Bitte Spotify-Berechtigungen und Verbindung prüfen.':d.relay==='ready'?`Spotify: verbunden. Künstler-Berechtigungen: ${d.artistScopes?'vorhanden':'Spotify neu verbinden'}. Alexa-Weiterleitung: erreichbar. Skill und Echo bitte mit einem Sprachbefehl testen.`:d.relay==='not-configured'?'Spotify: verbunden. Alexa-Weiterleitung: noch nicht konfiguriert.':'Alexa-Weiterleitung: momentan nicht erreichbar.');
 }catch{setHealth('Server nicht erreichbar. Bitte Netzwerk und Deployment prüfen.');}finally{setBusy(false);}};
 const local=async(command:Parameters<typeof executeDisplayVoiceV1008>[0])=>{try{const r=await executeDisplayVoiceV1008(command,{current:preferences.avatarModelId,fetcher:fetch,update:updatePreferences,allowed:()=>true});setNotice(r.text);}catch(e){setNotice(e instanceof Error?e.message:'Anzeige konnte nicht geändert werden.');}};
 return <fieldset aria-label="Alexa Zusatzfunktionen"><legend>Alexa: Status, Rückgängig und Anzeige</legend>
  <p className="settings-note">Frage „Folge ich diesem Künstler schon?“ oder sage „Letzte Künstleraktion rückgängig“. Bei mehreren Künstlern fragt Alexa nach einer Nummer. Mit „Like den Hauptkünstler“ wählst du direkt den ersten Künstler. „Bitte allen Künstlern folgen“ abonniert alle Künstler des aktuellen Titels; auch diese Sammeländerung kann rückgängig gemacht werden. Rückgängig gilt zehn Minuten für die letzte bestätigte Änderung auf diesem Display und demselben Spotify-Konto.</p>
  <label><input type="checkbox" checked={enabled} onChange={e=>toggle(e.target.checked)}/> Anzeige per Alexa steuern erlauben</label>
  <p className="settings-note">Zusätzlich Alexa-Empfang aktivieren. Befehle: „Lyrics einblenden“, „Lyrics ausblenden“, „Avatar wechseln“, „ruhige Darstellung“ und „normale Darstellung“. Musik und Lampen werden dadurch nicht verändert.</p>
  <div className="govee-v958-settings"><button type="button" disabled={busy} onClick={()=>void diagnose()}>{busy?'Verbindung wird geprüft…':'Alexa- und Spotify-Verbindung prüfen'}</button></div>
  <p role="status">{health}</p>
  <details><summary>Anzeige lokal ausprobieren</summary><div className="govee-v958-settings">
   <button type="button" onClick={()=>void local('lyrics-on')}>Lyrics einblenden</button>
   <button type="button" onClick={()=>void local('lyrics-off')}>Lyrics ausblenden</button>
   <button type="button" onClick={()=>void local('avatar-next')}>Avatar wechseln</button>
   <button type="button" onClick={()=>void local('display-calm')}>Ruhige Darstellung</button>
   <button type="button" onClick={()=>void local('display-normal')}>Normale Darstellung</button>
  </div></details>
  {notice&&<p role="status">{notice}</p>}
 </fieldset>;
}
