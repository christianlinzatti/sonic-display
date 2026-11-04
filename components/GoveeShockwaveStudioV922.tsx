'use client';
import {useEffect,useMemo,useState} from 'react';
import {DEFAULT_GOVEE_SHOCKWAVE_V922,GOVEE_SHOCKWAVE_KEY_V922,GOVEE_SHOCKWAVE_EVENT_V922,
 loadGoveeShockwaveV922,saveGoveeShockwaveV922,previewGoveeShockwaveV922,
 type GoveeShockwaveSettingsV922,type GoveeShockwaveDirectionV922} from '@/lib/goveeShockwaveV922';
import type {GoveeConfigV909} from '@/lib/goveeLanV909';
const names:Record<GoveeShockwaveDirectionV922,string>={
 forward:'Links → rechts (Geräteliste)',reverse:'Rechts → links (Geräteliste)',
 'center-out':'Mitte → außen','outside-in':'Außen → Mitte'};
export function GoveeShockwaveStudioV922({config}:{config:GoveeConfigV909}){
 const [settings,setSettings]=useState<GoveeShockwaveSettingsV922>(DEFAULT_GOVEE_SHOCKWAVE_V922);
 const [elapsed,setElapsed]=useState(480);
 const [notice,setNotice]=useState('Die Vorschau sendet keine LAN-Befehle.');
 useEffect(()=>{
  const refresh=()=>setSettings(loadGoveeShockwaveV922());
  const storage=(e:StorageEvent)=>{if(!e.key||e.key===GOVEE_SHOCKWAVE_KEY_V922)refresh();};
  refresh();window.addEventListener(GOVEE_SHOCKWAVE_EVENT_V922,refresh);window.addEventListener('storage',storage);
  return()=>{window.removeEventListener(GOVEE_SHOCKWAVE_EVENT_V922,refresh);window.removeEventListener('storage',storage);};
 },[]);
 const change=(patch:Partial<GoveeShockwaveSettingsV922>)=>{
  saveGoveeShockwaveV922({...settings,...patch});setNotice('V922-Einstellungen lokal gespeichert.');
 };
 const lamps=useMemo(()=>previewGoveeShockwaveV922(settings,
  (config.selectedIps.length||4),elapsed,50,config.masterBrightness),[settings,elapsed,config.selectedIps.length,config.masterBrightness]);
 const labels=['H6063 · Bühne','H610B · Rhythmus','H61A2 · Neon','H6051 · Ambient'];
 return <section className="govee-v909-panel" aria-label="V922 Bass Shockwave Room FX">
  <h3>V922 · Bass Shockwave Room FX</h3>
  <p className="settings-note">Eine über die Gerätereihenfolge wandernde Helligkeitswelle bei <strong>gemessenen, neuen Mikrofon-Bassimpulsen</strong>. Keine zusätzlichen UDP-Befehle, keine RGBIC-Segmentsteuerung und keine Stroboskop- oder Ein/Aus-Kommandos. Die Geräteposition entspricht der Reihenfolge unter „Leuchten im LAN“ und nicht einer automatisch erkannten Raumposition.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>change({enabled:e.target.checked})}/>
   V922-Raum-Schockwellen aktivieren (benötigt Govee-Musiksynchronisierung und aktive Mikrofonanalyse)</label>
  <div className="govee-v909-grid">
   <label>Wellenrichtung<select value={settings.direction} onChange={e=>change({direction:e.target.value as GoveeShockwaveDirectionV922})}>
    {Object.entries(names).map(([key,label])=><option key={key} value={key}>{label}</option>)}
   </select></label>
   <label>Stärke ({settings.intensity} %)<input type="range" min={0} max={100} step={5} value={settings.intensity} onChange={e=>change({intensity:Number(e.target.value)})}/></label>
   <label>Auslöseschwelle ({settings.threshold} %)<input type="range" min={25} max={90} step={5} value={settings.threshold} onChange={e=>change({threshold:Number(e.target.value)})}/></label>
   <label>Verzögerung je Position ({settings.stepMs} ms)<input type="range" min={180} max={750} step={10} value={settings.stepMs} onChange={e=>change({stepMs:Number(e.target.value)})}/></label>
   <label>Ausklang ({settings.releaseMs} ms)<input type="range" min={900} max={2600} step={50} value={settings.releaseMs} onChange={e=>change({releaseMs:Number(e.target.value)})}/></label>
   <label>Mindestens {settings.cooldownMs} ms zwischen Wellen<input type="range" min={1800} max={5000} step={100} value={settings.cooldownMs} onChange={e=>change({cooldownMs:Number(e.target.value)})}/></label>
   <label>Maximal +{settings.maxBoostPoints} Helligkeitspunkte<input type="range" min={0} max={12} step={1} value={settings.maxBoostPoints} onChange={e=>change({maxBoostPoints:Number(e.target.value)})}/></label>
  </div>
  <div className="govee-v909-grid"><label>Vorschauzeit nach Bassimpuls ({elapsed} ms)
   <input type="range" min={0} max={4000} step={80} value={elapsed} onChange={e=>setElapsed(Number(e.target.value))}/></label></div>
  <div className="govee-v909-device-list" aria-label="V922 Raum-Schockwellen-Vorschau ohne LAN-Befehle">
   {lamps.map(({index,decision,brightness})=>
    <div className="govee-v909-device" key={index}>
     <span><strong>{config.selectedIps[index]??labels[index]??`Gerät ${index+1}`}</strong>
      <small>Wellenposition {decision.order>=0?decision.order+1:'–'} · {brightness}% · {decision.active?'Welle sichtbar':'Grundlicht'}</small></span>
     <span style={{width:42,height:26,borderRadius:7,display:'inline-block',border:'1px solid #888',
      background:`rgb(${Math.round(brightness*2.25)},${Math.round(brightness*.9)},${Math.min(255,Math.round(brightness*2.4))})`}}/>
    </div>)}
  </div>
  <p className="settings-note" role="status">{notice} · Govee-Musikautomatik: {config.enabled&&config.autoSync?'aktiv':'aus'} · Die 900-ms-Sendegrenze bleibt erhalten. Bei schnellem Hardtekk werden Impulse zusammengefasst bzw. ausgelassen. Vorschau und echte Hardware können zeitlich abweichen.</p>
 </section>;
}
