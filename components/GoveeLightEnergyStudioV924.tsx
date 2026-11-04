'use client';
import {useEffect,useMemo,useState} from 'react';
import {useMusic} from '@/context/MusicContext';
import {readTrackAnalysisV318,ANALYSIS_EVENT_V318,ANALYSIS_STORAGE_KEY_V318} from '@/services/musicAnalysis/trackAnalysisV318';
import {GOVEE_SECTION_EVENT_V919,GOVEE_SECTION_KEY_V919,loadGoveeSectionV919,planGoveeSectionV919} from '@/lib/goveeSectionDirectorV919';
import {GOVEE_ENERGY_KEY_V924,GOVEE_ENERGY_EVENT_V924,DEFAULT_GOVEE_ENERGY_V924,
 loadGoveeEnergyV924,saveGoveeEnergyV924,planGoveeEnergyV924,previewGoveeEnergyV924,
 type GoveeEnergySettingsV924,type GoveeEnergyModeV924} from '@/lib/goveeLightEnergyV924';
import type {GoveeConfigV909} from '@/lib/goveeLanV909';
import type {GoveeRoleV911} from '@/lib/goveeConcertDirectorV911';

const modes:{id:GoveeEnergyModeV924;title:string}[]=[
 {id:'balanced',title:'Balanced · ausgewogene Songdynamik'},
 {id:'cinematic',title:'Cinematic · ruhige Verse, starke Höhepunkte'},
 {id:'festival',title:'Festival · energiegeladene Hooks und Drops'},
];
const fixtureRoles:{id:GoveeRoleV911;name:string}[]=[
 {id:'wall',name:'H6063 · Bühne'}, {id:'rhythm',name:'H610B · Rhythmus'},
 {id:'neon',name:'H61A2 · Neon'}, {id:'ambient',name:'H6051 · Ambient'},
];
const phaseLabels:Record<string,string>={verse:'Verse',hook:'Hook',build:'Build-up',drop:'Drop',break:'Break'};
export function GoveeLightEnergyStudioV924({config}:{config:GoveeConfigV909}){
 const {track,progressMs,genre}=useMusic();
 const [settings,setSettings]=useState<GoveeEnergySettingsV924>(DEFAULT_GOVEE_ENERGY_V924);
 const [previewGenre,setPreviewGenre]=useState('Deutschrap');
 const [role,setRole]=useState<GoveeRoleV911>('rhythm');
 const [revision,setRevision]=useState(0);
 useEffect(()=>{
  const read=()=>setSettings(loadGoveeEnergyV924());
  const storage=(e:StorageEvent)=>{if(!e.key||e.key===GOVEE_ENERGY_KEY_V924)read();};
  read();window.addEventListener(GOVEE_ENERGY_EVENT_V924,read);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_ENERGY_EVENT_V924,read);window.removeEventListener('storage',storage);};
 },[]);
 useEffect(()=>{
  const refresh=()=>setRevision(x=>x+1);
  const storage=(e:StorageEvent)=>{if(!e.key||e.key===ANALYSIS_STORAGE_KEY_V318||e.key===GOVEE_SECTION_KEY_V919)refresh();};
  window.addEventListener(ANALYSIS_EVENT_V318,refresh);window.addEventListener(GOVEE_SECTION_EVENT_V919,refresh);
  window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(ANALYSIS_EVENT_V318,refresh);window.removeEventListener(GOVEE_SECTION_EVENT_V919,refresh);window.removeEventListener('storage',storage);};
 },[]);
 const change=(patch:Partial<GoveeEnergySettingsV924>)=>{
  const next={...settings,...patch};saveGoveeEnergyV924(next);setSettings(loadGoveeEnergyV924());
 };
 const current=useMemo(()=>{
  const id=track?.id??'',data=id?readTrackAnalysisV318(id):null;
  const v919=planGoveeSectionV919(data,id,progressMs,loadGoveeSectionV919());
  return planGoveeEnergyV924(data,id,progressMs,genre,v919,settings);
 },[track?.id,progressMs,genre,settings,revision]);
 const preview=useMemo(()=>previewGoveeEnergyV924(settings,previewGenre,role,config.masterBrightness),
  [settings,previewGenre,role,config.masterBrightness]);
 return <section className="govee-v909-panel govee-v924" aria-label="V924 Intelligent Light Energy Director">
  <h3>V924 · Intelligent Light Energy Director</h3>
  <p className="settings-note">Eine dramaturgische Energiekurve über den ganzen Song: zurückhaltende Verse, unterschiedliche Hooks und gezielte Drop-Höhepunkte. Häufen sich bestätigte energiegeladene Abschnitte, reduziert V924 weitere Spitzen; nach ruhigeren Passagen wird wieder mehr Dynamik möglich. Keine Farben werden überschrieben und es gibt keine zusätzlichen LAN-Befehle.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>change({enabled:e.target.checked})}/>
   Genreübergreifende V924-Energieregie aktivieren (V919 und Musiksynchronisierung erforderlich)</label>
  <div className="govee-v909-grid">
   <label>Regiestil<select value={settings.mode} onChange={e=>change({mode:e.target.value as GoveeEnergyModeV924})}>
    {modes.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}
   </select></label>
   <label>Dramaturgie-Stärke ({settings.strength} %)<input type="range" min={0} max={100} step={5} value={settings.strength} onChange={e=>change({strength:Number(e.target.value)})}/></label>
   <label>Kontrast ({settings.contrast} %)<input type="range" min={0} max={100} step={5} value={settings.contrast} onChange={e=>change({contrast:Number(e.target.value)})}/></label>
   <label>Max. Änderung (±{settings.maxChangePoints} Punkte)<input type="range" min={0} max={12} step={1} value={settings.maxChangePoints} onChange={e=>change({maxChangePoints:Number(e.target.value)})}/></label>
   <label>Erholungsfenster ({Math.round(settings.recoveryWindowMs/1000)} s)<input type="range" min={15000} max={90000} step={5000} value={settings.recoveryWindowMs} onChange={e=>change({recoveryWindowMs:Number(e.target.value)})}/></label>
   <label>Mindestsicherheit der Songphase ({settings.minConfidence} %)<input type="range" min={50} max={95} step={5} value={settings.minConfidence} onChange={e=>change({minConfidence:Number(e.target.value)})}/></label>
  </div>
  <p className="settings-note" role="status">Live: {current.active?`${phaseLabels[current.phase]??current.phase} · Energie ${Math.round(current.energy*100)} % · Spitzendämpfung ${Math.round(current.fatigue*100)} %`:current.reason} · Govee: {config.enabled&&config.autoSync?'aktiv':'aus'}.</p>
  <h4>Song-Dramaturgie · Vorschau ohne LAN-Befehle</h4>
  <div className="govee-v909-grid">
   <label>Musikrichtung<select value={previewGenre} onChange={e=>setPreviewGenre(e.target.value)}>
    {['Deutschrap','Hardtekk','Hardstyle','Deutschrock'].map(item=><option key={item} value={item}>{item}</option>)}
   </select></label>
   <label>Leuchte<select value={role} onChange={e=>setRole(e.target.value as GoveeRoleV911)}>
    {fixtureRoles.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
   </select></label>
  </div>
  <div className="govee-v924-chart" role="img" aria-label="Simulierte Helligkeitskurve mit Verse, Hook, Break, Build-up und Drop">
   {preview.map(sample=><div className="govee-v924-bar" key={sample.index}>
    <div className="govee-v924-column"><span style={{height:`${sample.brightness}%`}}/></div>
    <strong>{phaseLabels[sample.label]}</strong><small>{sample.brightness} %</small>
   </div>)}
  </div>
  <p className="settings-note">Die Vorschau enthält bewusst <strong>synthetische, beschriftete</strong> Songphasen und sendet keinerlei Hardwarebefehle. Im Live-Betrieb gelten ausschließlich ausreichend sichere, importierte V318-Abschnitte für den aktuellen Track. Bei Pause, fehlenden Abschnitten oder deaktivierter V919-Regie bleibt das bisherige Licht unverändert. Die V915-Gruppendimmung wird zuletzt angewendet.</p>
 </section>;
}
