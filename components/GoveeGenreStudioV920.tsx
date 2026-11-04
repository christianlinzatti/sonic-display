'use client';
import {useEffect,useMemo,useState} from 'react';
import {useMusic} from '@/context/MusicContext';
import {readTrackAnalysisV318,ANALYSIS_EVENT_V318,ANALYSIS_STORAGE_KEY_V318} from '@/services/musicAnalysis/trackAnalysisV318';
import {GOVEE_SECTION_EVENT_V919,GOVEE_SECTION_KEY_V919,loadGoveeSectionV919,planGoveeSectionV919} from '@/lib/goveeSectionDirectorV919';
import {GOVEE_GENRE_KEY_V920,GOVEE_GENRE_EVENT_V920,DEFAULT_GOVEE_GENRE_V920,
 loadGoveeGenreV920,saveGoveeGenreV920,resolveGoveeGenreV920,planGoveeGenreV920,previewGoveeGenreV920,
 type GoveeGenreFamilyV920,type GoveeGenreSettingsV920} from '@/lib/goveeGenreLightV920';
import type {GoveeConfigV909} from '@/lib/goveeLanV909';
import type {GoveeRoleV911} from '@/lib/goveeConcertDirectorV911';
import type {SongSectionV318} from '@/services/musicAnalysis/trackAnalysisV318';

const genres:{id:GoveeGenreFamilyV920;label:string;description:string}[]=[
 {id:'deutschrap',label:'Deutschrap',description:'Dunkle Verse, deutliche Hook-Akzente'},
 {id:'hardtekk',label:'Hardtekk',description:'Durchgehende Energie und kräftige Builds'},
 {id:'hardstyle',label:'Hardstyle',description:'Kontrastreiche Breaks und markante Drops'},
 {id:'deutschrock',label:'Deutschrock',description:'Breite Arena-Hooks und dynamische Steigerung'},
];
const phases:{id:SongSectionV318;label:string}[]=[
 {id:'verse',label:'Verse'},{id:'hook',label:'Hook'},{id:'build',label:'Build-up'},
 {id:'drop',label:'Drop'},{id:'break',label:'Break'}];
const lamps:{role:GoveeRoleV911;name:string}[]=[
 {role:'wall',name:'H6063 · Bühne'},{role:'rhythm',name:'H610B · Rhythmus'},
 {role:'neon',name:'H61A2 · Neon'},{role:'ambient',name:'H6051 · Ambient'}];
export function GoveeGenreStudioV920({config}:{config:GoveeConfigV909}){
 const {track,progressMs,genre}=useMusic();
 const [settings,setSettings]=useState<GoveeGenreSettingsV920>(DEFAULT_GOVEE_GENRE_V920);
 const [previewGenre,setPreviewGenre]=useState<GoveeGenreFamilyV920>('hardtekk');
 const [previewPhase,setPreviewPhase]=useState<SongSectionV318>('drop');
 const [revision,setRevision]=useState(0);
 useEffect(()=>{
  const read=()=>setSettings(loadGoveeGenreV920());
  const onStorage=(e:StorageEvent)=>{if(!e.key||e.key===GOVEE_GENRE_KEY_V920)read();};
  read();window.addEventListener(GOVEE_GENRE_EVENT_V920,read);window.addEventListener('storage',onStorage);
  return()=>{window.removeEventListener(GOVEE_GENRE_EVENT_V920,read);window.removeEventListener('storage',onStorage);};
 },[]);
 useEffect(()=>{
  const refresh=()=>setRevision(n=>n+1);
  const onStorage=(e:StorageEvent)=>{if(!e.key||[ANALYSIS_STORAGE_KEY_V318,GOVEE_SECTION_KEY_V919].includes(e.key))refresh();};
  window.addEventListener(ANALYSIS_EVENT_V318,refresh);window.addEventListener(GOVEE_SECTION_EVENT_V919,refresh);
  window.addEventListener('storage',onStorage);
  return()=>{window.removeEventListener(ANALYSIS_EVENT_V318,refresh);window.removeEventListener(GOVEE_SECTION_EVENT_V919,refresh);window.removeEventListener('storage',onStorage);};
 },[]);
 const update=(change:Partial<GoveeGenreSettingsV920>)=>{
  saveGoveeGenreV920({...settings,...change});setSettings(loadGoveeGenreV920());
 };
 const current=useMemo(()=>{
  const id=track?.id??'';const analysis=id?readTrackAnalysisV318(id):null;
  const section=planGoveeSectionV919(analysis,id,progressMs,loadGoveeSectionV919());
  return planGoveeGenreV920(analysis,id,progressMs,genre,section,settings);
 },[track?.id,progressMs,genre,settings,revision]);
 const inferred=resolveGoveeGenreV920(genre);
 return <section className="govee-v909-panel" aria-label="V920 Genre Adaptive Light Intelligence">
  <h3>V920 · Genre Adaptive Light Intelligence</h3>
  <p className="settings-note">Vier musikalische Lichtdramaturgien. Nur bestätigte Songphasen werden verstärkt oder gedämpft. Deine gespeicherten Farben, V912–V916-Shows, V914-Übergänge und V915-Gruppen bleiben erhalten. Keine neuen Blitze, kein RGBIC-Segmentzugriff.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>update({enabled:e.target.checked})}/>
   Genreabhängige Helligkeitsdramaturgie aktivieren (benötigt V919 und aktive Govee-Konzertsteuerung)
  </label>
  <div className="govee-v909-grid">
   <label>Genre-Dynamik ({settings.strength} %)<input type="range" min={0} max={100} step={5} value={settings.strength} onChange={e=>update({strength:Number(e.target.value)})}/></label>
   <label>Maximale Helligkeitsänderung (±{settings.maxChangePoints} Punkte)<input type="range" min={0} max={12} step={1} value={settings.maxChangePoints} onChange={e=>update({maxChangePoints:Number(e.target.value)})}/></label>
   <label>Mindestvertrauen der Songphase ({settings.minConfidence} %)<input type="range" min={50} max={95} step={5} value={settings.minConfidence} onChange={e=>update({minConfidence:Number(e.target.value)})}/></label>
  </div>
  <p className="settings-note">Aktuelles Genre: <strong>{String(genre??'unbekannt')}</strong> → {inferred??'neutral (keine Zusatzwirkung)'} · Songphase: <strong>{current.active?`${current.phase}, bestätigt (${Math.round(current.confidence*100)} %)`:'keine V920-Regel aktiv'}</strong> · {current.reason} · {config.enabled&&config.autoSync&&config.directorEnabledV911?'Govee-Konzertsteuerung eingerichtet':'Govee-Konzertsteuerung nicht aktiv'}.</p>
  <div className="govee-v909-grid">
   <label>Genre der Vorschau
    <select value={previewGenre} onChange={e=>setPreviewGenre(e.target.value as GoveeGenreFamilyV920)}>
     {genres.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}
    </select>
   </label>
   <label>Songphase der Vorschau
    <select value={previewPhase} onChange={e=>setPreviewPhase(e.target.value as SongSectionV318)}>
     {phases.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
    </select>
   </label>
  </div>
  <p className="settings-note">{genres.find(x=>x.id===previewGenre)?.description}. Vorschau mit einem künstlich bestätigten Songabschnitt; sie steuert keine echten Leuchten.</p>
  <div className="govee-v909-device-list" aria-label="V920 Genredramaturgie Vorschau ohne LAN-Befehle">
   {lamps.map(lamp=>{
    const state=previewGoveeGenreV920(previewGenre,previewPhase,lamp.role,settings,Math.min(55,config.masterBrightness),config.masterBrightness);
    return <div key={lamp.role} className="govee-v909-device">
     <span>{lamp.name} · {state.base}% → {state.result}%</span>
     <span style={{display:'inline-block',background:'#303348',width:90,height:8,overflow:'hidden',borderRadius:5}}>
      <span style={{display:'block',width:`${state.result}%`,background:'#bb83ff',height:'100%'}}/>
     </span>
    </div>;
   })}
  </div>
  <p className="settings-note">Ohne passende, verlässliche Abschnittsmarkierung und aktiviertes V919 bleibt die V918-/V919-Lichtshow unverändert. V920 benötigt kein neues Mikrofon und sendet keine zusätzlichen LAN-Befehle; der bisherige Versandtakt bleibt bestehen.</p>
 </section>;
}
