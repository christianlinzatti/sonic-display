'use client';
import {useEffect,useState} from 'react';
import {useAudioAnalysis} from '@/context/AudioAnalysisContext';
import {
 DEFAULT_GOVEE_BASS_V917,GOVEE_BASS_KEY_V917,loadGoveeBassV917,saveGoveeBassV917,
 previewGoveeBassV917,type GoveeBassSettingsV917
} from '@/lib/goveeBassReactiveV917';
import type {GoveeConfigV909} from '@/lib/goveeLanV909';
const labels={wall:'H6063 · Bühne',rhythm:'H610B · Rhythmus',neon:'H61A2 · Neon',ambient:'H6051 · Ambient'};
export function GoveeBassStudioV917({config}:{config:GoveeConfigV909}){
 const {active:microphoneActive,enabled:microphoneEnabled}=useAudioAnalysis();
 const [settings,setSettings]=useState<GoveeBassSettingsV917>(DEFAULT_GOVEE_BASS_V917);
 const [preview,setPreview]=useState(72);
 const [notice,setNotice]=useState('');
 useEffect(()=>{
  const read=()=>setSettings(loadGoveeBassV917());
  const storage=(e:StorageEvent)=>{if(e.key===GOVEE_BASS_KEY_V917||e.key===null)read();};
  read();window.addEventListener('storage',storage);return()=>window.removeEventListener('storage',storage);
 },[]);
 const update=(patch:Partial<GoveeBassSettingsV917>)=>{
  const next={...settings,...patch};saveGoveeBassV917(next);setSettings(loadGoveeBassV917());setNotice('Bass-Einstellungen lokal gespeichert.');
 };
 const bars=previewGoveeBassV917(settings,preview/100,config.masterBrightness);
 return <section aria-label="V917 Bass Reactive Lighting" className="govee-v909-panel">
  <h3>V917 · Bass Reactive Lighting 3.0</h3>
  <p className="settings-note">Sanfte, auf echte Bass- und Kick-Impulse reagierende Helligkeitsakzente. Die Farben, Songphasen und Lichtgruppen bleiben unverändert. Ohne aktives Mikrofon werden keine Bassakzente erzeugt.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>update({enabled:e.target.checked})}/> V917 Bassreaktion aktivieren (benötigt Govee-Musiksynchronisierung)</label>
  <div className="govee-v909-grid">
   <label>Stärke ({settings.intensity} %)<input type="range" min={0} max={100} step={5} value={settings.intensity} onChange={e=>update({intensity:Number(e.target.value)})}/></label>
   <label>Kick-Schwelle ({settings.threshold} %)<input type="range" min={20} max={85} step={5} value={settings.threshold} onChange={e=>update({threshold:Number(e.target.value)})}/></label>
   <label>Abstand zwischen Akzenten ({settings.cooldownMs} ms)<input type="range" min={250} max={1200} step={10} value={settings.cooldownMs} onChange={e=>update({cooldownMs:Number(e.target.value)})}/></label>
   <label>Ausklang ({settings.releaseMs} ms)<input type="range" min={500} max={2200} step={10} value={settings.releaseMs} onChange={e=>update({releaseMs:Number(e.target.value)})}/></label>
  </div>
  <p className="settings-note">Mikrofon: <strong>{microphoneActive?'aktiv':microphoneEnabled?'aktiviert, aber kein Audiosignal':'deaktiviert'}</strong> · Musiksteuerung: {config.enabled&&config.autoSync?'aktiv':'noch nicht aktiviert'}. Keine künstlichen Kick-Ereignisse. Die langsame LAN-Ausgabe kann nicht jeden einzelnen Kick eines schnellen Hardtekk-Tracks darstellen.</p>
  <label>Test-Basspegel (nur Vorschau, {preview} %)<input type="range" min={0} max={100} value={preview} onChange={e=>setPreview(Number(e.target.value))}/></label>
  <div className="govee-v909-device-list" aria-label="V917 Bass Vorschau ohne LAN-Befehle">
   {bars.map(({role,look})=><div className="govee-v909-device" key={role}>
    <span>{labels[role]} · {look.brightness}%</span>
    <span style={{width:90,height:8,borderRadius:5,background:'#2e3250',display:'inline-block',overflow:'hidden'}}>
     <span style={{display:'block',width:`${look.brightness}%`,height:'100%',background:'#8e54f0'}}/>
    </span>
   </div>)}
  </div>
  <p role="status" className="settings-note">{notice||'Vorschau sendet keine Befehle. Alle Einstellungen werden nur in diesem Browser gespeichert.'}</p>
 </section>;
}
