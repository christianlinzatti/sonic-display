'use client';
import {backgroundJsonV1009 as fetch} from '@/lib/backgroundJsonV1009';
import {useEffect,useRef,useState} from 'react';
import {AlexaToolsV1008} from '@/components/AlexaVoiceControlV1008';
import {AlexaArtistPermissionV1007} from '@/components/AlexaArtistControlV1007';
import {ALEXA_LOCAL_ENABLED_KEY_V967,canApplyAlexaCommandV967}
 from '@/lib/alexaConcertV967';
import {loadConcertRoadmapV958,saveConcertRoadmapV958,CONCERT_ROADMAP_EVENT_V958,
 type ConcertSettingsV958} from '@/lib/ultimateConcertRoadmapV958';
import {canApplyAlexaCommandV968} from '@/lib/alexaConcertV968';
import {ALEXA_CONCERT_MESSAGES_V969,applyAlexaConcertCommandV969,canApplyAlexaCommandV969,
 type AlexaConcertCommandV969} from '@/lib/alexaConcertV969';
import {SMART_CONCERT_PRESETS_V969,selectSmartConcertPresetV969} from '@/lib/smartConcertPresetsV969';
import {GOVEE_CONFIG_KEY_V909,GOVEE_CONFIG_EVENT_V909,loadGoveeConfigV909,type GoveeConfigV909} from '@/lib/goveeLanV909';
import {ALEXA_GOVEE_CUE_EVENT_V970,ALEXA_GOVEE_CONSENT_EVENT_V970,ALEXA_GOVEE_RESET_EVENT_V970,ALEXA_GOVEE_MESSAGES_V970,
 loadAlexaGoveeConsentV970,saveAlexaGoveeConsentV970,mayAcceptAlexaGoveeV970,
 canApplyAlexaCommandV970,isAlexaGoveeCommandV970,type AlexaGoveeCommandV970,
 type AlexaGoveeConsentV970} from '@/lib/alexaGoveeV970';
import type {ConcertPresetIdV969} from '@/lib/ultimateConcertRoadmapV958';

/** V967 explicitly opt-in receiver. Runs only while this studio is open.
 * Re-reads user-owned settings for each action; no Spotify or external hardware calls.
 */
export function AlexaConcertControlV967(){
 const [enabled,setEnabled]=useState(false);
 const [enabledSince,setEnabledSince]=useState(0);
 const [status,setStatus]=useState('Alexa noch nicht aktiviert.');
 const [look,setLook]=useState<ConcertSettingsV958|null>(null);
 const [goveeConsent,setGoveeConsent]=useState<AlexaGoveeConsentV970>({enabled:false,since:0});
 const [goveeConfig,setGoveeConfig]=useState<GoveeConfigV909|null>(null);
 const lastSeen=useRef('');
 useEffect(()=>{
  try{
   const saved=JSON.parse(localStorage.getItem(ALEXA_LOCAL_ENABLED_KEY_V967)||'null') as {enabled?:boolean;since?:number}|null;
   if(saved?.enabled===true&&typeof saved.since==='number'&&Number.isSafeInteger(saved.since)){
    setEnabled(true);setEnabledSince(saved.since);setStatus('Alexa-Empfang aktiv – Verbindungsstatus wird geprüft.');
   }
   lastSeen.current=sessionStorage.getItem('sonic-display:alexa-last-v967')||'';
  }catch{/* Private-browsing storage can be unavailable; remain disabled. */}
 },[]);
 useEffect(()=>{
  const refresh=()=>setLook(loadConcertRoadmapV958());
  refresh();window.addEventListener(CONCERT_ROADMAP_EVENT_V958,refresh);
  return()=>window.removeEventListener(CONCERT_ROADMAP_EVENT_V958,refresh);
 },[]);
 useEffect(()=>{
  const refresh=()=>{setGoveeConsent(loadAlexaGoveeConsentV970());setGoveeConfig(loadGoveeConfigV909());};
  const storage=(e:StorageEvent)=>{if(!e.key||e.key===GOVEE_CONFIG_KEY_V909||e.key==='sonic-display:alexa-govee-consent-v970')refresh();};
  refresh();window.addEventListener(GOVEE_CONFIG_EVENT_V909,refresh);
  window.addEventListener(ALEXA_GOVEE_CONSENT_EVENT_V970,refresh);
  window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_CONFIG_EVENT_V909,refresh);
   window.removeEventListener(ALEXA_GOVEE_CONSENT_EVENT_V970,refresh);
   window.removeEventListener('storage',storage);};
 },[]);
 useEffect(()=>{
  const synchronize=()=>{
   try{
    const saved=JSON.parse(localStorage.getItem(ALEXA_LOCAL_ENABLED_KEY_V967)||'null') as {enabled?:boolean;since?:number}|null;
    const allowed=saved?.enabled===true&&Number.isSafeInteger(saved.since)&&
     typeof saved.since==='number'&&saved.since>0&&saved.since<=Date.now();
    setEnabled(allowed);setEnabledSince(allowed?saved!.since!:0);
   }catch{setEnabled(false);setEnabledSince(0);}
  };
  window.addEventListener('storage',synchronize);
  window.addEventListener('sonic-display:alexa-local-status-v971',synchronize);
  return()=>{window.removeEventListener('storage',synchronize);window.removeEventListener('sonic-display:alexa-local-status-v971',synchronize);};
 },[]);
 const toggle=(next:boolean)=>{
  const since=next?Date.now():0;
  try{localStorage.setItem(ALEXA_LOCAL_ENABLED_KEY_V967,JSON.stringify({enabled:next,since}));}
  catch{setStatus('Alexa-Einstellung konnte nicht gespeichert werden.');return;}
  setEnabled(next);setEnabledSince(since);
  window.dispatchEvent(new Event('sonic-display:alexa-local-status-v971'));
  if(!next)window.dispatchEvent(new Event(ALEXA_GOVEE_RESET_EVENT_V970));
  setStatus(next?'Alexa-Empfang aktiviert – Verbindung wird geprüft.':'Alexa-Empfang ausgeschaltet.');
 };
 const allowGovee=(on:boolean)=>{
  try{
   const permission=saveAlexaGoveeConsentV970(on);setGoveeConsent(permission);
   setStatus(on?'Govee-Sprachsteuerung auf diesem Display freigegeben (nur bei bestehender Synchronisation).':'Govee-Sprachsteuerung gesperrt; Alexa-Lichtszene verworfen.');
  }catch{setStatus('Govee-Freigabe konnte nicht gespeichert werden.');}
 };
 const applyGovee=(command:AlexaGoveeCommandV970,createdAt:number)=>{
  const permission=loadAlexaGoveeConsentV970();
  const config=loadGoveeConfigV909();
  if(!mayAcceptAlexaGoveeV970(command,permission,config,enabled,enabledSince,createdAt)){
   setStatus('Govee abgelehnt: erst Alexa-Empfang und separate Govee-Freigabe aktivieren, danach Govee und Musik-Sync einschalten und Lampen auswählen.');
   return;
  }
  // The existing GoveeMusicSyncV909 effect consumes this transient local event.
  // No direct lamp request, token forwarding or new network timer.
  window.dispatchEvent(new CustomEvent(ALEXA_GOVEE_CUE_EVENT_V970,{detail:{command,createdAt}}));
  setStatus(`${ALEXA_GOVEE_MESSAGES_V970[command]} gewählt – nur bei laufender Musik und eingeschalteter Govee-Synchronisation, maximal 3 Minuten.`);
 };
 const apply=(command:AlexaConcertCommandV969)=>{
  try{
   saveConcertRoadmapV958(applyAlexaConcertCommandV969(loadConcertRoadmapV958(),command));
   setStatus(`${ALEXA_CONCERT_MESSAGES_V969[command]} übernommen (nur virtuelle Bühne).`);
  }catch{setStatus('Befehl konnte nicht gespeichert werden. Prüfe den lokalen Speicher.');}
 };
 useEffect(()=>{
  if(!enabled||enabledSince<=0)return;
  let disposed=false,flight=false;
  const abort=new AbortController();
  const poll=async()=>{
   if(flight||disposed||document.visibilityState==='hidden')return;
   flight=true;
   try{
    const response=await fetch('/api/alexa/pending',{cache:'no-store',signal:abort.signal});
    if(disposed)return;
    if(response.status===401){setStatus('Alexa wartet: Spotify-Sitzung für dieses Display fehlt.');return;}
    if(response.status===503){setStatus('Alexa nicht konfiguriert: Lambda, Bridge-Secret und Upstash prüfen.');return;}
    if(!response.ok){setStatus('Alexa-Befehle momentan nicht erreichbar.');return;}
    const data=await response.json() as {command?:unknown};
    if(disposed)return;
    if(!data.command){setStatus(old=>old.includes('übernommen')?old:'Alexa-Empfang bereit (virtuelle Bühnenshow).');return;}
    if(!canApplyAlexaCommandV967(data.command,enabledSince,Date.now())&&
       !canApplyAlexaCommandV968(data.command,enabledSince,Date.now())&&
       !canApplyAlexaCommandV969(data.command,enabledSince,Date.now())&&
       !canApplyAlexaCommandV970(data.command,enabledSince,Date.now()))return;
    if(lastSeen.current===data.command.id)return;
    lastSeen.current=data.command.id;
    try{sessionStorage.setItem('sonic-display:alexa-last-v967',data.command.id);}catch{/* optional dedupe across reloads */}
    if(isAlexaGoveeCommandV970(data.command.command))applyGovee(data.command.command,data.command.createdAt);
    else apply(data.command.command);
   }catch{if(!disposed)setStatus('Alexa-Verbindung vorübergehend unterbrochen.');}
   finally{flight=false;}
  };
  void poll();
  const timer=window.setInterval(()=>{void poll();},4000);
  const visible=()=>{if(document.visibilityState==='visible')void poll();};
  document.addEventListener('visibilitychange',visible);
  return()=>{disposed=true;abort.abort();window.clearInterval(timer);document.removeEventListener('visibilitychange',visible);};
 },[enabled,enabledSince]);
 return <section className="govee-v958" aria-label="V967 Alexa Sprachsteuerung">
  <h4>V967–V970 · Alexa Konzert- und Raumlichtsteuerung</h4>
  <p className="settings-note">Alexa kann Arena, Festival, Club, ruhige Atmosphäre und virtuelle Effekte wählen oder die Konzertautomatik stoppen. Govee-Lichtstimmungen benötigen eine getrennte Freigabe und bereits aktive Musik-Synchronisation. Kein Ein- oder Ausschalten von Lampen oder Spotify-Wiedergabebefehle. Künstler-Abonnements lassen sich separat freigeben. Eine gültige Spotify-Sitzung und die geöffnete Seite sind für den Empfang erforderlich.</p>
  <div className="govee-v958-settings">
   <label><input type="checkbox" checked={enabled} onChange={e=>toggle(e.target.checked)}/> Alexa-Befehle auf diesem Display empfangen (opt-in)</label>
   <button type="button" onClick={()=>apply('festival')}>Festivalmodus lokal testen (ohne Alexa)</button>
  </div>
  <AlexaArtistPermissionV1007/>
  <AlexaToolsV1008/>
  <h4>V970 · Alexa &amp; Govee – Raumlicht (separate Freigabe)</h4>
  <p className="settings-note">Alexa kann nur bei laufender Musik die bereits synchronisierten, ausgewählten Govee-Lampen mit ruhigen Arena-, Festival- und Club-Farben überblenden. Die Funktion schaltet keine Lampen ein oder aus, aktiviert keine Bridge und verändert keine gespeicherte Govee-Show. Presets laufen höchstens 3 Minuten. Vorhandene manuelle Shows bleiben vorrangig.</p>
  <div className="govee-v958-settings">
   <label><input type="checkbox" checked={goveeConsent.enabled}
    onChange={e=>allowGovee(e.target.checked)}/> Govee-Lichtstimmungen durch Alexa auf diesem Display ausdrücklich erlauben</label>
   <span className="settings-note" role="status">Govee: {goveeConfig?.enabled&&goveeConfig?.autoSync&&goveeConfig?.token&&goveeConfig?.selectedIps.length?
    `${goveeConfig.selectedIps.length} ausgewählte Lampe(n), Musik-Sync bereit`: 'Bridge, Lampen oder automatische Synchronisation noch nicht aktiviert'}</span>
   <button type="button" onClick={()=>applyGovee('govee-festival',Date.now())}>Festival-Raumlicht lokal testen</button>
   <button type="button" onClick={()=>applyGovee('govee-auto',Date.now())}>Zur Govee-Musikautomatik zurückkehren</button>
  </div>
  <h4>V969 · Smart Concert Presets</h4>
  <p className="settings-note">Ein Preset koordiniert virtuelle LED-Muster, Farbpalette, atmosphärische Effekte und Songphasen. Smart Automatik wählt passend zum Musikgenre. Keine Hardware-, Spotify- oder Kamerabefehle; eigene Show-Timelines behalten Vorrang.</p>
  <div className="govee-v958-settings">
   <label>Virtuelle Konzertwelt
    <select aria-label="Smart Konzert-Preset V969" value={look?.concertPresetV969??'off'}
     onChange={e=>{try{
       const selected=e.target.value as ConcertPresetIdV969;
       saveConcertRoadmapV958(selectSmartConcertPresetV969(loadConcertRoadmapV958(),selected));
       setStatus(`V969 ${SMART_CONCERT_PRESETS_V969.find(p=>p.id===selected)?.label||'Preset'} aktiviert (virtuell).`);
      }catch{setStatus('Preset konnte nicht gespeichert werden.');}}}>
     {SMART_CONCERT_PRESETS_V969.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
    </select>
   </label>
   <span className="settings-note">{SMART_CONCERT_PRESETS_V969.find(p=>p.id===(look?.concertPresetV969??'off'))?.description}</span>
  </div>
  <h4>V968 · Einzelne Bühnenbereiche, Lichtfarben und Bühneneffekte</h4>
  <p className="settings-note">Die folgenden Einstellungen lassen sich auch ohne Echo lokal testen.
   Änderungen gelten ausschließlich für die automatische virtuelle Konzertkulisse und nicht für Govee, Spotify oder eigene Show-Timelines.</p>
  <div className="govee-v958-settings">
   <label>Virtueller Bühnenbereich <select aria-label="Alexa Bühnenbereich" value={look?.voiceZoneV968??'all'}
    onChange={e=>apply((`zone-${e.target.value}`) as AlexaConcertCommandV969)}>
    <option value="all">Alle Bereiche</option><option value="stage">Bühne</option>
    <option value="backdrop">LED-Hintergrund</option><option value="audience">Publikumsrand</option>
   </select></label>
   <label>Lichtstimmung <select aria-label="Alexa Lichtstimmung" value={look?.voiceMoodV968??'auto'}
    onChange={e=>apply((`mood-${e.target.value}`) as AlexaConcertCommandV969)}>
    <option value="auto">Genreautomatik</option><option value="warm">Warm</option>
    <option value="cool">Kühl</option><option value="neon">Neon</option>
   </select></label>
   <label>Virtuelle Einzeleffekte <select aria-label="Alexa Bühneneffekte" value={look?.voiceFxV968??'auto'}
    onChange={e=>apply((`effect-${e.target.value}`) as AlexaConcertCommandV969)}>
    <option value="auto">Automatisch</option><option value="beams">Lichtkegel</option>
    <option value="fog">Bodennebel</option><option value="confetti">Konfetti</option>
    <option value="streamers">Luftschlangen</option><option value="off">Zusätzliche Effekte aus</option>
   </select></label>
  </div>
  <p className="settings-note" role="status">{status}</p>
  <small>Die Sprachverbindung muss einmalig in der Alexa Developer Console und in AWS Lambda eingerichtet werden. Befehle werden maximal 75 Sekunden bereitgehalten; manuelle Bühnen-Timelines behalten Vorrang.</small>
 </section>;
}
