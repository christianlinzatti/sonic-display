'use client';
import {useEffect,useMemo,useState} from 'react';
import {useMusic} from '@/context/MusicContext';
import {readTrackAnalysisV318,ANALYSIS_EVENT_V318,ANALYSIS_STORAGE_KEY_V318} from '@/services/musicAnalysis/trackAnalysisV318';
import {planGoveeSectionV919,previewGoveeSectionV919,loadGoveeSectionV919,saveGoveeSectionV919,
 DEFAULT_GOVEE_SECTION_V919,GOVEE_SECTION_KEY_V919,type GoveeSectionSettingsV919} from '@/lib/goveeSectionDirectorV919';
import type {GoveeConfigV909} from '@/lib/goveeLanV909';
import type {SongSectionV318} from '@/services/musicAnalysis/trackAnalysisV318';
import type {GoveeRoleV911} from '@/lib/goveeConcertDirectorV911';
const phases:{value:SongSectionV318;label:string}[]=[{value:'verse',label:'Verse'},{value:'hook',label:'Hook'},
 {value:'build',label:'Build-up'},{value:'drop',label:'Drop'},{value:'break',label:'Break'}];
const fixtures:{role:GoveeRoleV911;name:string}[]=[{role:'wall',name:'H6063 · Bühne'},
 {role:'rhythm',name:'H610B · Rhythmus'},{role:'neon',name:'H61A2 · Neon'},{role:'ambient',name:'H6051 · Ambient'}];
export function GoveeSectionStudioV919({config}:{config:GoveeConfigV909}){
 const {track,progressMs}=useMusic();
 const [settings,setSettings]=useState<GoveeSectionSettingsV919>(DEFAULT_GOVEE_SECTION_V919);
 const [phase,setPhase]=useState<SongSectionV318>('build');
 const [analysisVersion,setAnalysisVersion]=useState(0);
 useEffect(()=>{
  const read=()=>setSettings(loadGoveeSectionV919());
  const storage=(e:StorageEvent)=>{if(!e.key||e.key===GOVEE_SECTION_KEY_V919)read();};
  read();window.addEventListener('storage',storage);
  return()=>window.removeEventListener('storage',storage);
 },[]);
 useEffect(()=>{
  const refresh=()=>setAnalysisVersion(v=>v+1);
  const storage=(e:StorageEvent)=>{if(!e.key||e.key===ANALYSIS_STORAGE_KEY_V318)refresh();};
  window.addEventListener(ANALYSIS_EVENT_V318,refresh);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(ANALYSIS_EVENT_V318,refresh);window.removeEventListener('storage',storage);};
 },[]);
 const update=(patch:Partial<GoveeSectionSettingsV919>)=>{
  saveGoveeSectionV919({...settings,...patch});setSettings(loadGoveeSectionV919());
 };
 // Version changes when an imported V318 analysis is edited in this or another tab.
 const current=useMemo(()=>planGoveeSectionV919(track?.id?readTrackAnalysisV318(track.id):null,track?.id??'',progressMs,settings),
  [track?.id,progressMs,settings,analysisVersion]);
 return <section className="govee-v909-panel" aria-label="V919 Verse Hook Drop Lighting Director">
  <h3>V919 · Verse Hook Drop Lighting Director</h3>
  <p className="settings-note">Dramaturgische Helligkeit für bestätigte Verse-, Hook-, Build-up-, Drop- und Break-Phasen. Farben, V912–V916-Presets, V914-Übergänge und Gerätegruppen bleiben unverändert. Keine automatischen Power-Befehle oder Blitzfolgen.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>update({enabled:e.target.checked})}/> V919 Songphasen-Lichtregie aktivieren (benötigt V911 und die Govee-Musiksynchronisierung)</label>
  <div className="govee-v909-grid">
   <label>Dramaturgie-Stärke ({settings.strength} %)<input type="range" min={0} max={100} step={5} value={settings.strength} onChange={e=>update({strength:Number(e.target.value)})}/></label>
   <label>Mindestvertrauen ({settings.minConfidence} %)<input type="range" min={50} max={95} step={5} value={settings.minConfidence} onChange={e=>update({minConfidence:Number(e.target.value)})}/></label>
   <label>Pre-Drop-Fenster ({settings.preDropWindowMs/1000} s)<input type="range" min={2000} max={8000} step={500} value={settings.preDropWindowMs} onChange={e=>update({preDropWindowMs:Number(e.target.value)})}/></label>
   <label>Zusatzhelligkeit maximal (+{settings.maxExtraBrightness} Punkte)<input type="range" min={0} max={15} step={1} value={settings.maxExtraBrightness} onChange={e=>update({maxExtraBrightness:Number(e.target.value)})}/></label>
  </div>
  <p className="settings-note">Aktueller Song: <strong>{track?.id?current.active?`${current.phase} · bestätigt (${Math.round(current.confidence*100)} %)`:'keine für V919 ausreichend sichere Songphase':'kein Track'}</strong> · {current.verifiedDropAhead?'Nächster Drop als direkter Folgeabschnitt bestätigt':'Kein bestätigter unmittelbar folgender Drop'} · Govee: {config.enabled&&config.autoSync&&config.directorEnabledV911?'Konzertsteuerung grundsätzlich aktiv':'Konzertsteuerung deaktiviert'}.</p>
  <label>Simulierte Songphase (keine echten Leuchten)
   <select value={phase} onChange={e=>setPhase(e.target.value as SongSectionV318)}>
    {phases.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}
   </select>
  </label>
  <div className="govee-v909-device-list" aria-label="V919 Songphasen-Vorschau ohne LAN-Befehle">
   {fixtures.map(({role,name})=>{
    const example=previewGoveeSectionV919(settings,phase,role,Math.min(55,config.masterBrightness),config.masterBrightness);
    return <div key={role} className="govee-v909-device">
     <span>{name} · {example.base}% → {example.result}%</span>
     <span style={{display:'inline-block',background:'#303348',width:90,height:8,overflow:'hidden',borderRadius:5}}>
      <span style={{display:'block',width:`${example.result}%`,background:'#b67dff',height:'100%'}}/>
     </span>
    </div>;
   })}
  </div>
  <p className="settings-note">Die Vorschau simuliert einen bestätigten Songabschnitt. Der Build-up wird dort absichtlich mit anschließendem Drop simuliert; live gibt es diese Pre-Drop-Steigerung nur, wenn beide Marker wirklich importiert, ausreichend sicher und direkt benachbart sind. Ohne passende Analyse wird keine zusätzliche Helligkeitsdramaturgie angewendet. Die Hardware sendet maximal im bestehenden V918-Takt.</p>
 </section>;
}
