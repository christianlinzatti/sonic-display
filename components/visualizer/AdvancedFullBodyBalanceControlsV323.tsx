'use client';
import {useEffect,useState} from 'react';
import {DEFAULT_FULL_BODY_BALANCE_V323,FULL_BODY_BALANCE_DIAGNOSTIC_V323,FULL_BODY_BALANCE_EVENT_V323,refreshFullBodyBalanceV323,writeFullBodyBalanceV323,type FullBodyBalanceSettingsV323} from './advancedFullBodyBalanceV323';
type Report={support:'left'|'right'|'both'|'none';lean:number;turn:number;landing:number};
export function AdvancedFullBodyBalanceControlsV323(){
  const [settings,setSettings]=useState<FullBodyBalanceSettingsV323>(DEFAULT_FULL_BODY_BALANCE_V323);
  const [report,setReport]=useState<Report|null>(null);
  useEffect(()=>{
    const sync=()=>setSettings(refreshFullBodyBalanceV323());
    const onReport=(event:Event)=>setReport((event as CustomEvent<Report>).detail);
    sync();window.addEventListener(FULL_BODY_BALANCE_EVENT_V323,sync);
    window.addEventListener('storage',sync);window.addEventListener(FULL_BODY_BALANCE_DIAGNOSTIC_V323,onReport);
    return()=>{window.removeEventListener(FULL_BODY_BALANCE_EVENT_V323,sync);
      window.removeEventListener('storage',sync);window.removeEventListener(FULL_BODY_BALANCE_DIAGNOSTIC_V323,onReport);};
  },[]);
  const update=(patch:Partial<FullBodyBalanceSettingsV323>)=>{
    const next={...settings,...patch};setSettings(next);writeFullBodyBalanceV323(next);
  };
  const slider=(key:'stanceTransfer'|'turnCounterbalance'|'landingSoftness'|'response',label:string)=><label key={key}>
    {label} ({settings[key]} %)
    <input type="range" min="0" max="100" step="5" value={settings[key]} disabled={!settings.enabled}
      onChange={event=>update({[key]:Number(event.target.value)})}/>
  </label>;
  const label={left:'links',right:'rechts',both:'beidbeinig',none:'kein sicherer Fußkontakt'}[report?.support??'none'];
  return <fieldset className="stage-director-v287 full-body-balance-v323">
    <legend>Advanced Full-Body Balance · V323</legend>
    <p>Dezente Körpergegenbewegung abhängig vom erkannten Standbein. Nutzt die Foot-IK-Kontakte aus V135/V322 und erhält importierte Motion-Keyframes.</p>
    <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={event=>update({enabled:event.target.checked})}/> Standbeinabhängige Ganzkörper-Balance aktivieren (optional)</label>
    {slider('stanceTransfer','Standbein-Gewichtsverlagerung')}
    {slider('turnCounterbalance','Gegenbewegung bei Drehungen')}
    {slider('landingSoftness','Abfederung beim Aufsetzen')}
    {slider('response','Geschwindigkeit des Ausgleichs')}
    {report&&settings.enabled?<p role="status">Live-Standbein: {label} · Gewichtsimpuls {report.lean} % · Drehungsausgleich {report.turn} % · Aufsetz-Impuls {report.landing} % (heuristisch)</p>:
      <small>Live-Informationen erscheinen bei einem kompatiblen GLB-Avatar während der Wiedergabe mit aktivierter Foot-IK.</small>}
    <button type="button" onClick={()=>update({...DEFAULT_FULL_BODY_BALANCE_V323})}>V323 zurücksetzen</button>
    <small>Standardmäßig ausgeschaltet. Erfordert kompatible Hip-Knee-Ankle-Ketten und aktive Foot-IK. Bei Pause, Reduced Motion, Track-Sprung oder fehlendem Bodenkontakt keine Zusatzkorrektur. Kein physikalischer Schwerpunkt-Solver und keine Verschiebung von Root, Becken oder Füßen.</small>
  </fieldset>;
}
