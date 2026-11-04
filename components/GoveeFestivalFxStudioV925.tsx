'use client';
import {useEffect,useMemo,useState} from 'react';
import {useMusic} from '@/context/MusicContext';
import {readTrackAnalysisV318,ANALYSIS_EVENT_V318,ANALYSIS_STORAGE_KEY_V318} from '@/services/musicAnalysis/trackAnalysisV318';
import {loadGoveeSectionV919,planGoveeSectionV919,GOVEE_SECTION_EVENT_V919,GOVEE_SECTION_KEY_V919} from '@/lib/goveeSectionDirectorV919';
import {GOVEE_FESTIVAL_KEY_V925,GOVEE_FESTIVAL_EVENT_V925,DEFAULT_GOVEE_FESTIVAL_V925,
 loadGoveeFestivalV925,saveGoveeFestivalV925,planGoveeFestivalV925,previewGoveeFestivalV925,
 type GoveeFestivalSettingsV925,type GoveeFestivalPatternV925} from '@/lib/goveeFestivalFxV925';
import type {GoveeConfigV909} from '@/lib/goveeLanV909';
import type {SongSectionV318} from '@/services/musicAnalysis/trackAnalysisV318';

const patterns:{id:GoveeFestivalPatternV925;name:string;description:string}[]=[
 {id:'auto',name:'Auto · intelligente Szenenwahl',description:'Hook: Arena oder Farbfront · Build-up: symmetrische Welle · bestätigter Drop: Finale'},
 {id:'arena',name:'Arena Sweep',description:'Sanfte Lichtfront wandert von Leuchte zu Leuchte'},
 {id:'mirror',name:'Symmetric Wave',description:'Licht antwortet spiegelbildlich von der Mitte nach außen'},
 {id:'colorfront',name:'Color Front',description:'Langsam wandernde, genreabhängige Farbfront über ganze Leuchten'},
 {id:'finale',name:'Drop Finale',description:'Einmaliger, weicher Höhepunkt ausschließlich bei bestätigtem Drop'},
];
const phases:{id:SongSectionV318;name:string}[]=[
 {id:'verse',name:'Verse · Ruhe'}, {id:'hook',name:'Hook · Arena'},
 {id:'build',name:'Build-up · Spannung'}, {id:'drop',name:'Drop · Finale'},
 {id:'break',name:'Break · Ruhe'},
];
export function GoveeFestivalFxStudioV925({config}:{config:GoveeConfigV909}){
 const {track,progressMs,genre}=useMusic();
 const [settings,setSettings]=useState<GoveeFestivalSettingsV925>(DEFAULT_GOVEE_FESTIVAL_V925);
 const [previewGenre,setPreviewGenre]=useState('Hardstyle');
 const [phase,setPhase]=useState<SongSectionV318>('hook');
 const [elapsed,setElapsed]=useState(3000);
 const [revision,setRevision]=useState(0);
 useEffect(()=>{
  const read=()=>setSettings(loadGoveeFestivalV925());
  const storage=(event:StorageEvent)=>{if(!event.key||event.key===GOVEE_FESTIVAL_KEY_V925)read();};
  read();window.addEventListener(GOVEE_FESTIVAL_EVENT_V925,read);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_FESTIVAL_EVENT_V925,read);window.removeEventListener('storage',storage);};
 },[]);
 useEffect(()=>{
  const refresh=()=>setRevision(n=>n+1);
  const storage=(event:StorageEvent)=>{if(!event.key||event.key===ANALYSIS_STORAGE_KEY_V318||event.key===GOVEE_SECTION_KEY_V919)refresh();};
  window.addEventListener(ANALYSIS_EVENT_V318,refresh);window.addEventListener(GOVEE_SECTION_EVENT_V919,refresh);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(ANALYSIS_EVENT_V318,refresh);window.removeEventListener(GOVEE_SECTION_EVENT_V919,refresh);window.removeEventListener('storage',storage);};
 },[]);
 const change=(patch:Partial<GoveeFestivalSettingsV925>)=>{
  saveGoveeFestivalV925({...settings,...patch});setSettings(loadGoveeFestivalV925());
 };
 const preview=useMemo(()=>previewGoveeFestivalV925(settings,previewGenre,phase,elapsed,config.masterBrightness),
  [settings,previewGenre,phase,elapsed,config.masterBrightness]);
 const live=useMemo(()=>{
  const id=track?.id??'';const analysis=id?readTrackAnalysisV318(id):null;
  const confirmation=planGoveeSectionV919(analysis,id,progressMs,loadGoveeSectionV919());
  const decision=planGoveeFestivalV925(analysis,id,progressMs,confirmation,genre,0,4,settings);
  return decision.active?`Bestätigte ${decision.phase}-Phase · ${decision.pattern}`:decision.reason;
 },[track?.id,progressMs,genre,settings,revision]);
 return <section className="govee-v909-panel govee-v925" aria-label="V925 Festival Lighting FX Studio">
  <h3>V925 · Festival Lighting FX Studio</h3>
  <p className="settings-note">Arena-Sweeps, symmetrische Lichtwellen, Farbfronten und ein kontrolliertes Drop-Finale – auf deinen <strong>ganzen Govee-Leuchten</strong>. Die Effekte nutzen ausschließlich bestätigte Songabschnitte, sind abschaltbar und verändern keine gespeicherten Lichtshows. Die Vorschau ist rein lokal.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>change({enabled:e.target.checked})}/>
   V925 Festival-Effekte aktivieren (V919 + Musiksynchronisierung erforderlich)</label>
  <div className="govee-v909-grid">
   <label>Effekt-Regie<select value={settings.pattern} onChange={e=>change({pattern:e.target.value as GoveeFestivalPatternV925})}>
    {patterns.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
   </select></label>
   <label>Stärke ({settings.strength} %)<input type="range" min={0} max={100} step={5} value={settings.strength} onChange={e=>change({strength:Number(e.target.value)})}/></label>
   <label>Farbmischung ({settings.colorMixPercent} %)<input type="range" min={0} max={35} step={1} value={settings.colorMixPercent} onChange={e=>change({colorMixPercent:Number(e.target.value)})}/></label>
   <label>Max. Helligkeitsakzent (+{settings.maxBoostPoints} Punkte)<input type="range" min={0} max={10} step={1} value={settings.maxBoostPoints} onChange={e=>change({maxBoostPoints:Number(e.target.value)})}/></label>
   <label>Wellenperiode ({(settings.periodMs/1000).toFixed(1)} s)<input type="range" min={2500} max={12000} step={500} value={settings.periodMs} onChange={e=>change({periodMs:Number(e.target.value)})}/></label>
   <label>Versatz pro Leuchte ({settings.spreadMs} ms)<input type="range" min={150} max={1600} step={50} value={settings.spreadMs} onChange={e=>change({spreadMs:Number(e.target.value)})}/></label>
   <label>Mindestsicherheit der Songphase ({settings.minConfidence} %)<input type="range" min={50} max={95} step={5} value={settings.minConfidence} onChange={e=>change({minConfidence:Number(e.target.value)})}/></label>
  </div>
  <p className="settings-note" role="status">Live: {config.enabled&&config.autoSync?live:'Govee-Musiksynchronisierung deaktiviert'}.</p>
  <h4>Vier Leuchten · Showvorschau ohne LAN-Befehle</h4>
  <div className="govee-v909-grid">
   <label>Genre<select value={previewGenre} onChange={e=>setPreviewGenre(e.target.value)}>
    {['Deutschrap','Hardtekk','Hardstyle','Deutschrock'].map(g=><option key={g} value={g}>{g}</option>)}
   </select></label>
   <label>Songphase<select value={phase} onChange={e=>setPhase(e.target.value as SongSectionV318)}>
    {phases.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
   </select></label>
   <label>Fortschritt in dieser Phase ({(elapsed/1000).toFixed(1)} s)<input type="range" min={0} max={11500} step={250} value={elapsed} onChange={e=>setElapsed(Number(e.target.value))}/></label>
  </div>
  <div className="govee-v925-fixtures" aria-label="Simulierte Effektfarben und Helligkeiten für vier Govee-Leuchten">
   {preview.map(item=><div className="govee-v925-fixture" key={item.name}>
    <div className="govee-v925-light" style={{backgroundColor:`rgb(${item.look.color.r},${item.look.color.g},${item.look.color.b})`,opacity:.24+.76*item.look.brightness/100}}/>
    <strong>{item.name}</strong><small>{item.look.brightness}% · {item.decision.pattern}</small>
   </div>)}
  </div>
  <p className="settings-note"><strong>Wichtig:</strong> Die Vorschau verwendet erfundene, ausdrücklich als Simulation gekennzeichnete Abschnitte. Für den Livebetrieb gelten nur bestätigte V318-Marker des aktuellen Tracks und die aktivierte V919-Lichtregie. „Drop Finale“ löst nie bei unmarkierten oder unsicheren Drops aus. Kein Stroboskop, keine RGBIC-Segmentsteuerung und keine zusätzlichen LAN-Timer. Gruppendimmung (V915) bleibt die letzte Helligkeitsstufe.</p>
 </section>;
}
