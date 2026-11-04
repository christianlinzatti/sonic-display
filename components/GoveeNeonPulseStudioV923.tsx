'use client';
import {useEffect,useMemo,useState} from 'react';
import {GOVEE_NEON_KEY_V923,GOVEE_NEON_EVENT_V923,DEFAULT_GOVEE_NEON_V923,
 loadGoveeNeonV923,saveGoveeNeonV923,previewGoveeNeonV923,
 type GoveeNeonSettingsV923,type GoveeNeonModeV923,type GoveeNeonPaletteV923,
 type GoveeNeonScopeV923} from '@/lib/goveeNeonPulseV923';
import type {GoveeConfigV909} from '@/lib/goveeLanV909';
const modes:Record<GoveeNeonModeV923,string>={
 flow:'Neon Flow · langsam wandernde Farben',breathe:'Neon Breath · sanftes Lichtatmen',
 bass:'Neon Bass · nur gemessene Bassimpulse'};
const paletteNames:Record<GoveeNeonPaletteV923,string>={
 genre:'Zum Musikgenre passend','violet-cyan':'Violett / Cyan','pink-blue':'Pink / Blau','amber-red':'Amber / Rot'};
const examples=['Deutschrap','Hardtekk','Hardstyle','Deutschrock'];
export function GoveeNeonPulseStudioV923({config}:{config:GoveeConfigV909}){
 const [settings,setSettings]=useState<GoveeNeonSettingsV923>(DEFAULT_GOVEE_NEON_V923);
 const [elapsed,setElapsed]=useState(1300);
 const [genre,setGenre]=useState('Deutschrap');
 const [notice,setNotice]=useState('Die Vorschau verändert keine gespeicherte Lichtshow und sendet keine LAN-Befehle.');
 useEffect(()=>{
  const refresh=()=>setSettings(loadGoveeNeonV923());
  const storage=(e:StorageEvent)=>{if(!e.key||e.key===GOVEE_NEON_KEY_V923)refresh();};
  refresh();window.addEventListener(GOVEE_NEON_EVENT_V923,refresh);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_NEON_EVENT_V923,refresh);window.removeEventListener('storage',storage);};
 },[]);
 const change=(patch:Partial<GoveeNeonSettingsV923>)=>{
  const next={...settings,...patch};setSettings(next);saveGoveeNeonV923(next);
  setNotice('V923-Neon-Einstellungen lokal gespeichert.');
 };
 const lamps=useMemo(()=>previewGoveeNeonV923(settings,genre,elapsed,config.selectedIps.length||4,
  config.masterBrightness),[settings,genre,elapsed,config.selectedIps.length,config.masterBrightness]);
 const labels=['H6063 · Bühne','H610B · Rhythmus','H61A2 · Neon','H6051 · Ambient'];
 return <section className="govee-v909-panel" aria-label="V923 Neon Pulse Experience">
  <h3>V923 · Neon Pulse Experience</h3>
  <p className="settings-note">Langsame, sanfte <strong>Ganzleuchten-Neonverläufe</strong> ohne Stroboskop und ohne zusätzliche LAN-Befehle. Standardmäßig betrifft V923 nur die Neon-Rolle (typischerweise H61A2). Im Bassmodus zählen ausschließlich aktuelle Mikrofon-Bassimpulse. Bei allen anderen Modi folgt die Animation der Songposition und hält bei Pause an.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>change({enabled:e.target.checked})}/>
   V923-Neonbewegungen aktivieren (Govee-Musiksynchronisierung erforderlich)</label>
  <div className="govee-v909-grid">
   <label>Neon-Stil<select value={settings.mode} onChange={e=>change({mode:e.target.value as GoveeNeonModeV923})}>
    {Object.entries(modes).map(([key,label])=><option key={key} value={key}>{label}</option>)}
   </select></label>
   <label>Farbstimmung<select value={settings.palette} onChange={e=>change({palette:e.target.value as GoveeNeonPaletteV923})}>
    {Object.entries(paletteNames).map(([key,label])=><option key={key} value={key}>{label}</option>)}
   </select></label>
   <label>Leuchten<select value={settings.scope} onChange={e=>change({scope:e.target.value as GoveeNeonScopeV923})}>
    <option value="neon">Nur Neon-Rolle (H61A2)</option><option value="all">Alle ausgewählten Leuchten</option>
   </select></label>
   <label>Stärke ({settings.intensity} %)<input type="range" min={0} max={100} step={5} value={settings.intensity} onChange={e=>change({intensity:Number(e.target.value)})}/></label>
   <label>Farbanpassung ({settings.colorMixPercent} % maximal)<input type="range" min={0} max={35} step={1} value={settings.colorMixPercent} onChange={e=>change({colorMixPercent:Number(e.target.value)})}/></label>
   <label>Wellenlänge ({(settings.periodMs/1000).toFixed(1)} s)<input type="range" min={4000} max={18000} step={100} value={settings.periodMs} onChange={e=>change({periodMs:Number(e.target.value)})}/></label>
   <label>Versatz je Leuchte ({settings.staggerMs} ms)<input type="range" min={0} max={1200} step={20} value={settings.staggerMs} onChange={e=>change({staggerMs:Number(e.target.value)})}/></label>
   <label>Maximal +{settings.maxBoostPoints} Helligkeitspunkte<input type="range" min={0} max={8} step={1} value={settings.maxBoostPoints} onChange={e=>change({maxBoostPoints:Number(e.target.value)})}/></label>
  </div>
  <div className="govee-v909-grid">
   <label>Vorschaugenre<select value={genre} onChange={e=>setGenre(e.target.value)}>
    {examples.map(value=><option key={value} value={value}>{value}</option>)}
   </select></label>
   <label>Zeit im Song ({(elapsed/1000).toFixed(1)} s)<input type="range" min={0} max={18000} step={100} value={elapsed} onChange={e=>setElapsed(Number(e.target.value))}/></label>
  </div>
  <div className="govee-v909-device-list" aria-label="V923 Neon-Vorschau ohne LAN-Befehle">
   {lamps.map(({deviceIndex,role,decision,look})=><div className="govee-v909-device" key={deviceIndex}>
    <span><strong>{config.selectedIps[deviceIndex]??labels[deviceIndex]??`Leuchte ${deviceIndex+1}`}</strong>
     <small>{role} · {look.brightness}% · {decision.active?'Neonverlauf':'Unverändertes Grundlicht'}</small></span>
    <span aria-label={`Vorschaufarbe für Gerät ${deviceIndex+1}`} style={{display:'inline-block',width:46,height:28,
     borderRadius:7,border:'1px solid #888',background:`rgb(${look.color.r},${look.color.g},${look.color.b})`}}/>
   </div>)}
  </div>
  <p className="settings-note" role="status">{notice} · Musiksteuerung: {config.enabled&&config.autoSync?'aktiv':'aus'} · Die V915-Gruppendimmung und V911-Glättung bleiben erhalten. Kein RGBIC-Segmentlauf; tatsächlich sichtbare Geschwindigkeit hängt von der LAN-Latenz ab.</p>
 </section>;
}
