'use client';
/** V1150 · manual refresh or explicit foreground-only 60s monitoring.
 * No /scan, /command or /status; no extra Spotify polling beyond the bounded server endpoint.
 */
import {useCallback,useEffect,useRef,useState} from 'react';
import {useMusic} from '@/context/MusicContext';
import {ALEXA_LOCAL_ENABLED_KEY_V967} from '@/lib/alexaConcertV967';
import {parseArtistVoiceConsentV1007} from '@/lib/alexaArtistV1007';
import {backgroundJsonV1009} from '@/lib/backgroundJsonV1009';
import {GOVEE_CONFIG_EVENT_V909,goveeBridgeRequestV909,loadGoveeConfigV909,type GoveeDeviceV909} from '@/lib/goveeLanV909';
import {classifyAlexaServerV1149,classifyAlexaServerErrorV1149,classifyGoveeBridgeV1149,
 classifyGoveeErrorV1149,classifyGoveeNotConfiguredV1149,type DiagnosticV1149,type ServerDiagnosticsV1149} from '@/lib/alexaConnectionDiagnosticsV1149';
import {ALEXA_LIVE_INTERVAL_MS_V1150,deriveGoveeFixturesV1150,summarizeLiveDiagnosticsV1150,
 type FixtureV1150} from '@/lib/alexaLiveDiagnosticsV1150';

const UNCHECKED:DiagnosticV1149={state:'unknown',summary:'Noch nicht geprüft.',nextStep:'„Jetzt prüfen“ auswählen.'};
const EMPTY:ServerDiagnosticsV1149={spotify:UNCHECKED,relay:UNCHECKED};
type GoveeHealth={ok?:boolean};
type GoveeDevices={devices:GoveeDeviceV909[]};
type Snapshot={server:ServerDiagnosticsV1149;bridge:DiagnosticV1149;fixtures:FixtureV1150[];checkedAt:number|null};
const STATE_LABEL:Record<DiagnosticV1149['state'],string>={
 ok:'Bestätigt',attention:'Hinweis',error:'Problem',unknown:'Unbekannt'
};
const FIXTURE_LABEL:Record<FixtureV1150['state'],string>={
 'not-selected':'Nicht zugewiesen','unknown':'Unbekannt','seen-online':'Zuletzt erreichbar','not-seen':'Nicht erreichbar'
};
const preview=()=>deriveGoveeFixturesV1150([],null,Date.now());
export function AlexaLiveDiagnosticsV1150(){
 const {connected,isPlaying}=useMusic();
 const [live,setLive]=useState(false),[busy,setBusy]=useState(false);
 const [localAllowed,setLocalAllowed]=useState(false);
 const [snapshot,setSnapshot]=useState<Snapshot>({
  server:EMPTY,bridge:UNCHECKED,fixtures:preview(),checkedAt:null
 });
 const generation=useRef(0),mounted=useRef(false),inFlight=useRef(false);
 const abort=useRef<AbortController|null>(null);
 useEffect(()=>{
  mounted.current=true;
  const update=()=>{
   try{setLocalAllowed(parseArtistVoiceConsentV1007(
    localStorage.getItem(ALEXA_LOCAL_ENABLED_KEY_V967)).enabled);}
   catch{setLocalAllowed(false);}
  };
  update();
  window.addEventListener('storage',update);
  window.addEventListener('sonic-display:alexa-local-status-v971',update);
  return()=>{
   mounted.current=false;generation.current++;abort.current?.abort();
   window.removeEventListener('storage',update);
   window.removeEventListener('sonic-display:alexa-local-status-v971',update);
  };
 },[]);
 const check=useCallback(async()=>{
  if(inFlight.current||document.visibilityState!=='visible')return;
  inFlight.current=true;
  const id=++generation.current,controller=new AbortController();
  abort.current=controller;
  const config=loadGoveeConfigV909();
  setBusy(true);
  const serverTask=async():Promise<ServerDiagnosticsV1149>=>{
   try{
    // Explicit uncached fetch: don't report a V1010 cached GET as a live result.
    const response=await backgroundJsonV1009('/api/alexa/status',{
     cache:'no-store',signal:controller.signal
    },12000,(input,init)=>fetch(input,init));
    return classifyAlexaServerV1149(response.status,await response.json());
   }catch{return classifyAlexaServerErrorV1149();}
  };
  const bridgeTask=async():Promise<{status:DiagnosticV1149;devices:unknown}>=>{
   try{
    const missing=classifyGoveeNotConfiguredV1149(config);
    if(missing)return {status:missing,devices:null};
    const health=await goveeBridgeRequestV909<GoveeHealth>(config,'/health');
    if(health.ok!==true||!config.enabled||config.selectedIps.length===0)
     return {status:classifyGoveeBridgeV1149(config,health),devices:null};
    const list=await goveeBridgeRequestV909<GoveeDevices>(config,'/devices');
    const now=loadGoveeConfigV909();
    if(now.token!==config.token||now.endpoint!==config.endpoint||
     now.enabled!==config.enabled||JSON.stringify(now.selectedIps)!==JSON.stringify(config.selectedIps))
     return {status:{state:'unknown',summary:'Govee-Auswahl während der Diagnose geändert.',
      nextStep:'Status erneut prüfen.'},devices:null};
    return {status:classifyGoveeBridgeV1149(config,health,list.devices),devices:list.devices};
   }catch{return {status:classifyGoveeErrorV1149(),devices:null};}
  };
  try{
   const [server,bridge]=await Promise.all([serverTask(),bridgeTask()]);
   if(!mounted.current||controller.signal.aborted||generation.current!==id)return;
   setSnapshot({
    server,bridge:bridge.status,
    fixtures:deriveGoveeFixturesV1150(config.selectedIps,bridge.devices,Date.now()),
    checkedAt:Date.now()
   });
  }finally{
   if(generation.current===id){
    inFlight.current=false;abort.current=null;
    if(mounted.current)setBusy(false);
   }
  }
 },[]);
 useEffect(()=>{
  if(!live)return;
  const tick=()=>{if(document.visibilityState==='visible'&&navigator.onLine)void check();};
  tick();
  const timer=window.setInterval(tick,ALEXA_LIVE_INTERVAL_MS_V1150);
  window.addEventListener('visibilitychange',tick);
  window.addEventListener('online',tick);
  const onConfig=()=>{
   // Immediately invalidate a stale lamp view, but never trigger a new network check.
   generation.current++;abort.current?.abort();
   inFlight.current=false;abort.current=null;setBusy(false);
   const cfg=loadGoveeConfigV909();
   setSnapshot(s=>({...s,bridge:UNCHECKED,fixtures:deriveGoveeFixturesV1150(cfg.selectedIps,null,Date.now()),checkedAt:null}));
  };
  window.addEventListener(GOVEE_CONFIG_EVENT_V909,onConfig);
  return()=>{
   window.clearInterval(timer);
   window.removeEventListener('visibilitychange',tick);
   window.removeEventListener('online',tick);
   window.removeEventListener(GOVEE_CONFIG_EVENT_V909,onConfig);
  };
 },[live,check]);
 const sum=summarizeLiveDiagnosticsV1150(snapshot.server.spotify,snapshot.server.relay,snapshot.bridge,snapshot.fixtures);
 const rows:[
  {id:'spotify',title:'Spotify-Verbindung',diag:snapshot.server.spotify},
  {id:'relay',title:'Alexa-Relay / Redis',diag:snapshot.server.relay},
  {id:'bridge',title:'Govee LAN Bridge',diag:snapshot.bridge}
 ];
 return <section className="govee-v958" aria-label="V1150 Alexa Govee Live Diagnose">
  <h4>V1150 · Alexa & Govee Live-Diagnose</h4>
  <p className="settings-note">
   Übersicht für Spotify, Alexa-Weiterleitung und bis zu vier ausgewählte Govee-Leuchten. Nur lesende
   HTTP-Abfragen; keine automatischen Schalt- oder Suchbefehle. Die Gerätepräsenz beweist keinen Ein/Aus-Zustand.
  </p>
  <div className="govee-v909-actions">
   <button type="button" disabled={busy} onClick={()=>void check()}>{busy?'Prüfung läuft…':'Jetzt prüfen'}</button>
   <button type="button" aria-pressed={live} onClick={()=>setLive(v=>!v)}>
    {live?'Live-Diagnose beenden':'Live-Diagnose starten'}
   </button>
  </div>
  <p className="settings-note" role="status">
   {busy?'Verbindungen werden geprüft.':snapshot.checkedAt!==null?
     `Letzte Prüfung: ${new Date(snapshot.checkedAt).toLocaleTimeString('de-AT')}`:'Noch keine Prüfung.'}
   {' · '}Live-Modus {live?'aktiv (alle 60 Sekunden, nur im sichtbaren Tab)':'ausgeschaltet'}.
  </p>
  <p className="settings-note">{sum.description}</p>
  <p className="settings-note">
   Alexa-Empfang auf diesem Display: {localAllowed?'lokal freigegeben':'lokal ausgeschaltet'}.
   Spotify-Anzeige: {connected?(isPlaying?'Wiedergabe aktiv':'verbunden, keine aktive Wiedergabe'):'nicht verbunden'}.
  </p>
  <div className="govee-v915-groups">
   {rows.map(row=><div className="govee-v915-card" key={row.id}>
    <strong>{row.title} · {STATE_LABEL[row.diag.state]}</strong>
    <p className="settings-note">{row.diag.summary}</p>
    <small>{row.diag.nextStep}</small>
   </div>)}
  </div>
  <h4>Govee-Leuchten (erste vier ausgewählte)</h4>
  <div className="govee-v915-groups">
   {snapshot.fixtures.map(f=><div className="govee-v915-card" key={f.slot}>
    <strong>{f.label} · {FIXTURE_LABEL[f.state]}</strong>
    <p className="settings-note">{f.description}</p>
   </div>)}
  </div>
  <small>
   Keine Lampen-IP und keine Tokens im Bericht. Live-Diagnose stoppt beim Schließen des Einstellungsbereichs;
   in versteckten Tabs wird nicht abgefragt. Für einen bestätigten Ein/Aus-Status die manuelle Statusprüfung
   in der Govee-Lichtzentrale verwenden. Amazon-Skill und Echo werden hier nicht direkt getestet.
  </small>
 </section>;
}
