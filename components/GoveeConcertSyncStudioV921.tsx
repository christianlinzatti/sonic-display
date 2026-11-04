'use client';
import {useEffect,useMemo,useState} from 'react';
import {GOVEE_CINEMATIC_EVENT_V921,GOVEE_CINEMATIC_KEY_V921,GOVEE_STAGE_CUE_EVENT_V921,
 DEFAULT_GOVEE_CINEMATIC_V921,loadGoveeCinematicV921,saveGoveeCinematicV921,
 previewGoveeCinematicV921,type GoveeStageCueV921,
 type GoveeConcertSyncSettingsV921} from '@/lib/goveeConcertSyncV921';
import {useMusic} from '@/context/MusicContext';
import type {CameraShotV354,DanceFormationV354} from '@/services/stageContent/showTimelineV354';
import type {GoveeRoleV911} from '@/lib/goveeConcertDirectorV911';
const roles:{role:GoveeRoleV911;label:string}[]=[
 {role:'wall',label:'H6063 · Bühnenlicht'},{role:'rhythm',label:'H610B · Rhythmus'},
 {role:'neon',label:'H61A2 · Neon'},{role:'ambient',label:'H6051 · Ambient'}];
export function GoveeConcertSyncStudioV921(){
 const {track}=useMusic();
 const [settings,setSettings]=useState<GoveeConcertSyncSettingsV921>(DEFAULT_GOVEE_CINEMATIC_V921);
 const [camera,setCamera]=useState<CameraShotV354>('wide');
 const [dance,setDance]=useState<DanceFormationV354>('sync');
 const [lyrics,setLyrics]=useState(false);
 const [gain,setGain]=useState(1.2);
 const [stageCue,setStageCue]=useState<GoveeStageCueV921|null>(null);
 const [clock,setClock]=useState(0);
 useEffect(()=>{
  const refresh=()=>setSettings(loadGoveeCinematicV921());
  const stored=(e:StorageEvent)=>{if(!e.key||e.key===GOVEE_CINEMATIC_KEY_V921)refresh();};
  refresh();window.addEventListener(GOVEE_CINEMATIC_EVENT_V921,refresh);window.addEventListener('storage',stored);
  return()=>{window.removeEventListener(GOVEE_CINEMATIC_EVENT_V921,refresh);window.removeEventListener('storage',stored);};
 },[]);
 // Display only, never sends a LAN command; restrict events to current playback and expire stale events.
 useEffect(()=>{
  const stage=(event:Event)=>{
   const next=(event as CustomEvent<GoveeStageCueV921>).detail;
   if(next&&typeof next.trackId==='string')setStageCue(next);
   setClock(Date.now());
  };
  const freshness=window.setInterval(()=>setClock(Date.now()),2000);
  window.addEventListener(GOVEE_STAGE_CUE_EVENT_V921,stage);
  return()=>{window.removeEventListener(GOVEE_STAGE_CUE_EVENT_V921,stage);window.clearInterval(freshness);};
 },[]);
 const change=(patch:Partial<GoveeConcertSyncSettingsV921>)=>{
  saveGoveeCinematicV921({...settings,...patch});setSettings(loadGoveeCinematicV921());
 };
 const demos=useMemo(()=>roles.map(({role,label})=>({role,label,
  ...previewGoveeCinematicV921(role,settings,{camera,dance,lyrics,lightingGain:gain})})),
  [settings,camera,dance,lyrics,gain]);
 const matched=!!stageCue&&stageCue.trackId===track?.id&&stageCue.playing&&
  clock>=stageCue.capturedAt&&clock-stageCue.capturedAt<4000;
 // The live monitor is intentionally not evidence of exact physical camera or LAN latency.
 return <section className="govee-v909-panel" aria-label="V921 Cinematic Concert Light Synchronization">
  <h3>V921 · Cinematic Concert Light Synchronization</h3>
  <p className="settings-note">Die Govee-Lichtregie reagiert auf dieselben Show-Cues wie die 3D-Bühne: V354-Kamera, Ensemble-Formationen, Bühnenhelligkeit und sichtbar eingeblendete Lyrics. V356-Automatikszenen sind optional. Bestehende Farbshows, V915-Gruppen und V920-Genrelooks bleiben erhalten. Keine neuen RGBIC- oder Stroboskopbefehle.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>change({enabled:e.target.checked})}/>
   V921 Licht-Synchronisierung aktivieren (nur mit aktiver Govee-Musiksynchronisierung und V911)</label>
  <div className="govee-v909-grid">
   <label>Synchronisationsstärke ({settings.strength} %)<input type="range" min={0} max={100} step={5} value={settings.strength} onChange={e=>change({strength:Number(e.target.value)})}/></label>
   <label>Maximale Helligkeitsänderung (±{settings.maxChangePoints} Punkte)<input type="range" min={0} max={12} step={1} value={settings.maxChangePoints} onChange={e=>change({maxChangePoints:Number(e.target.value)})}/></label>
  </div>
  <div className="govee-v909-grid">
   <label className="setting-check"><input type="checkbox" checked={settings.followCamera} onChange={e=>change({followCamera:e.target.checked})}/> Kamera-Cues begleiten</label>
   <label className="setting-check"><input type="checkbox" checked={settings.followDance} onChange={e=>change({followDance:e.target.checked})}/> Ensemble-Formationen begleiten</label>
   <label className="setting-check"><input type="checkbox" checked={settings.followLighting} onChange={e=>change({followLighting:e.target.checked})}/> Bühnenlichtpegel übernehmen</label>
   <label className="setting-check"><input type="checkbox" checked={settings.protectLyrics} onChange={e=>change({protectLyrics:e.target.checked})}/> Sichtbare Lyrics vor grellem Licht schützen</label>
   <label className="setting-check"><input type="checkbox" checked={settings.includeAutomatic} onChange={e=>change({includeAutomatic:e.target.checked})}/> Auch vorläufige V356-Automatik-Cues begleiten</label>
  </div>
  <p className="settings-note">Bühnenstatus: {matched?`${stageCue?.source==='authored'?'V354 Timeline':stageCue?.source==='automatic'?'V356 Automatik':'Lyrics-Signal'} · Live-Cue empfangen`:'Kein aktueller Bühnen-Cue erkannt'}. Die Steuerung benötigt eine laufende 3D-Bühne im selben Browser-Tab. Alte oder fremde Track-Cues werden verworfen.</p>
  <h4>Offline-Vorschau (ohne Govee-Befehle)</h4>
  <div className="govee-v909-grid">
   <label>Kameraplan<select value={camera} onChange={e=>setCamera(e.target.value as CameraShotV354)}>
    <option value="wide">Weitwinkel</option><option value="medium">Halbtotal</option><option value="close">Nahaufnahme</option><option value="orbit">Orbit</option></select></label>
   <label>Ensemble<select value={dance} onChange={e=>setDance(e.target.value as DanceFormationV354)}>
    <option value="solo">Solo</option><option value="sync">Synchron</option><option value="mirror">Spiegel</option><option value="duet">Duett</option></select></label>
   <label>Bühnenlicht-Skalierung<select value={gain} onChange={e=>setGain(Number(e.target.value))}>
    <option value={0.7}>Ruhig (70 %)</option><option value={1}>Neutral</option><option value={1.2}>Intensiv (120 %)</option><option value={1.5}>Höhepunkt (150 %)</option></select></label>
   <label className="setting-check"><input type="checkbox" checked={lyrics} onChange={e=>setLyrics(e.target.checked)}/> Lyrics sichtbar</label>
  </div>
  <div className="govee-v909-device-list" aria-label="V921 Lichtvorschau">
   {demos.map(d=><div className="govee-v909-device" key={d.role}>
    <span><strong>{d.label}</strong><small>{d.base} % → {d.result} % · {d.decision.active?'koordiniert':'unverändert'}</small></span>
    <span aria-label={`${d.result} Prozent Helligkeit`} style={{display:'inline-flex',height:10,width:100,background:'#35313d',borderRadius:5,overflow:'hidden'}}>
     <span style={{display:'block',background:'#ba73db',width:`${d.result}%`,height:'100%'}}/>
    </span>
   </div>)}
  </div>
  <p className="settings-note">V354/V356 sind gemeinsame Show-Pläne, kein Sensor für tatsächliche Kamerapositionen. Manuelle Kameravorgaben bleiben vorrangig. Die bestehende LAN-Befehlsrate begrenzt die physische Synchronität auf grobe Konzertakzente, nicht einzelne Videoframes.</p>
 </section>;
}
