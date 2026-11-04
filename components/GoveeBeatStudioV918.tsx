'use client';
import {useEffect,useState} from 'react';
import {useAudioAnalysis} from '@/context/AudioAnalysisContext';
import {DEFAULT_GOVEE_BEAT_V918,GOVEE_BEAT_KEY_V918,
 loadGoveeBeatV918,saveGoveeBeatV918,previewGoveeBeatV918,predictGoveeBeatV918,
 type GoveeBeatSettingsV918} from '@/lib/goveeBeatPredictionV918';
import type {GoveeConfigV909} from '@/lib/goveeLanV909';
const names={wall:'H6063 · Bühne',rhythm:'H610B · Rhythmus',neon:'H61A2 · Neon',ambient:'H6051 · Ambient'};
export function GoveeBeatStudioV918({config}:{config:GoveeConfigV909}){
 const {active:microphoneActive,enabled:microphoneEnabled,metrics}=useAudioAnalysis();
 const [settings,setSettings]=useState<GoveeBeatSettingsV918>(DEFAULT_GOVEE_BEAT_V918);
 const [notice,setNotice]=useState('Die Vorschau schaltet keine echten Leuchten.');
 useEffect(()=>{
  const read=()=>setSettings(loadGoveeBeatV918());
  const storage=(event:StorageEvent)=>{if(!event.key||event.key===GOVEE_BEAT_KEY_V918)read();};
  read();window.addEventListener('storage',storage);return()=>window.removeEventListener('storage',storage);
 },[]);
 const update=(patch:Partial<GoveeBeatSettingsV918>)=>{
  saveGoveeBeatV918({...settings,...patch});setSettings(loadGoveeBeatV918());
  setNotice('Beat-Vorhersage lokal gespeichert.');
 };
 // Live UI only; the scheduler tracks real metric freshness separately.
 const confident=microphoneActive&&metrics.phaseLocked&&
  Math.min(metrics.bpmConfidence??0,metrics.phaseConfidence??0)>=settings.minConfidence/100;
 const samplePreview=predictGoveeBeatV918(metrics,Date.now(),Date.now(),settings,microphoneActive);
 const lamps=previewGoveeBeatV918(settings,config.masterBrightness);
 return <section className="govee-v909-panel" aria-label="V918 Intelligent Beat Prediction">
  <h3>V918 · Intelligent Beat Prediction</h3>
  <p className="settings-note">Vorausschauende, langsame Lichtakzente bei stabiler Mikrofon-Beatphase. Der Sendezeitpunkt wird manuell um die erwartete Verzögerung vorgezogen. <strong>Die tatsächliche Leuchten-Latenz ist nicht gemessen.</strong></p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>update({enabled:e.target.checked})}/> V918 Beat-Vorhersage aktivieren (benötigt aktive Govee-Musiksynchronisierung und Mikrofon)</label>
  <div className="govee-v909-grid">
   <label>Manueller Vorlauf ({settings.leadMs} ms)<input type="range" min={0} max={350} step={10} value={settings.leadMs} onChange={e=>update({leadMs:Number(e.target.value)})}/></label>
   <label>Mindestvertrauen ({settings.minConfidence} %)<input type="range" min={60} max={95} step={5} value={settings.minConfidence} onChange={e=>update({minConfidence:Number(e.target.value)})}/></label>
   <label>Akzentstärke ({settings.intensity} %)<input type="range" min={0} max={100} step={5} value={settings.intensity} onChange={e=>update({intensity:Number(e.target.value)})}/></label>
  </div>
  <p className="settings-note">Mikrofon: <strong>{microphoneActive?'aktiv':microphoneEnabled?'aktiviert, ohne Analyse':'deaktiviert'}</strong> · Beat-Synchronisation: <strong>{confident?'stabil':'nicht ausreichend bestätigt'}</strong> · BPM: {confident&&samplePreview.bpm?Math.round(samplePreview.bpm):'–'} · Govee-LAN: {config.enabled&&config.autoSync?'Musikautomatik aktiv':'Musikautomatik aus'}</p>
  <p className="settings-note">Die Bridge quittiert nicht die sichtbare Reaktion der Leuchten. Ein Vorlauf von 180 ms ist ein Startwert, kein gemessener Gerätewert. Maximal ein Befehlsdurchlauf pro 900 ms; schnelle Hardtekk-Kicks werden bewusst ausgelassen. Ohne Phasenlock wird die normale Beleuchtung verwendet.</p>
  <div className="govee-v909-device-list" aria-label="V918 Beat Vorschau ohne LAN-Befehle">
   {lamps.map(({role,look,base})=><div className="govee-v909-device" key={role}>
    <span>{names[role]} · Vorschau {base}% → {look.brightness}%</span>
    <span style={{display:'inline-block',width:88,height:8,overflow:'hidden',borderRadius:5,background:'#303348'}}>
     <span style={{display:'block',width:`${look.brightness}%`,height:'100%',background:'#ae6ff7'}}/>
    </span>
   </div>)}
  </div>
  <p role="status" className="settings-note">{notice}</p>
 </section>;
}
