"use client";
import {useEffect,useState} from 'react';
import {DEFAULT_ENSEMBLE_BALANCE_V324,ENSEMBLE_BALANCE_DIAGNOSTIC_V324,ENSEMBLE_BALANCE_EVENT_V324,
  readEnsembleBalanceV324,refreshEnsembleBalanceV324,writeEnsembleBalanceV324,type EnsembleBalanceSettingsV324} from './adaptiveEnsembleBalanceV324';
type Report={separation:number;protectionActive:boolean;role:string;footLockEnabled:boolean};
export function AdaptiveEnsembleBalanceControlsV324(){
  const [settings,setSettings]=useState<EnsembleBalanceSettingsV324>(DEFAULT_ENSEMBLE_BALANCE_V324);
  const [report,setReport]=useState<Report|null>(null);
  useEffect(()=>{
    const sync=()=>setSettings(refreshEnsembleBalanceV324());
    const onReport=(e:Event)=>setReport((e as CustomEvent<Report>).detail);
    sync();
    window.addEventListener(ENSEMBLE_BALANCE_EVENT_V324,sync);
    window.addEventListener('storage',sync);
    window.addEventListener(ENSEMBLE_BALANCE_DIAGNOSTIC_V324,onReport);
    return()=>{window.removeEventListener(ENSEMBLE_BALANCE_EVENT_V324,sync);
      window.removeEventListener('storage',sync);
      window.removeEventListener(ENSEMBLE_BALANCE_DIAGNOSTIC_V324,onReport);};
  },[]);
  const update=(patch:Partial<EnsembleBalanceSettingsV324>)=>{
    const next=writeEnsembleBalanceV324({...settings,...patch});setSettings(next);
  };
  const slider=(key:'transitionSmoothness'|'soloFocus'|'dropExpansion',label:string)=><label key={key}>
    {label} ({settings[key]} %)
    <input type="range" min="0" max="100" step="5" value={settings[key]} disabled={!settings.enabled}
      onChange={e=>update({[key]:Number(e.target.value)})}/>
  </label>;
  return <fieldset className="ensemble-balance-v324">
    <legend>Adaptive Ensemble Balance · V324</legend>
    <p>Gemeinsame, gedämpfte Bühnenpositionen für genau zwei Avatare. Unterstützt Solo- und Drop-Formationen, schützt Abstände und erhält die Zuordnung von linkem und rechtem Tänzer.</p>
    <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>update({enabled:e.target.checked})}/> Adaptive Ensemble Balance aktivieren</label>
    <label>Mindestabstand ({settings.minSpacing.toFixed(2)} Bühnen-Einheiten)
      <input type="range" min="1.4" max="2.6" step="0.05" value={settings.minSpacing} disabled={!settings.enabled}
        onChange={e=>update({minSpacing:Number(e.target.value)})}/>
    </label>
    {slider('transitionSmoothness','Übergänge beruhigen')}
    {slider('soloFocus','Solo-Fokus')}
    {slider('dropExpansion','Abstand bei gemeinsamen Drops')}
    <label className="setting-check"><input type="checkbox" checked={settings.laneSafety} disabled={!settings.enabled} onChange={e=>update({laneSafety:e.target.checked})}/> Linken und rechten Bühnenplatz erhalten (Kreuzungsschutz)</label>
    {settings.enabled&&report?<p role="status">Live-Abstand: {report.separation.toFixed(2)} Bühnen-Einheiten · {report.protectionActive?'Abstandsschutz aktiv':'Abstand sicher'} · {report.role==='together'?'gemeinsam':report.role==='lead-solo'?'Lead-Solo':'Partner-Solo'} · Fußfixierung {report.footLockEnabled?'an (langsameres Fahren)':'aus'}</p>
      :<small>Live-Diagnose erscheint bei zwei sichtbaren 3D-Avataren während der Wiedergabe.</small>}
    <button type="button" onClick={()=>update(DEFAULT_ENSEMBLE_BALANCE_V324)}>V324 zurücksetzen</button>
    <small>Standardmäßig ausgeschaltet. Verändert nur die Positionen der beiden Tänzergruppen auf der Bühne, nicht GLB-Keyframes, Fuß-IK oder tatsächliche Stützbeine. V322 verlangsamt die Formationsfahrt zusätzlich; verhindert aber nicht jede mögliche Fußverschiebung. Für Solo und Reduced Motion gibt es keine neue Bewegung. Keine Physikkollision und keine beliebig großen Gruppen.</small>
  </fieldset>;
}
