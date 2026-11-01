'use client';
import {useEffect,useState} from 'react';
import {HIP_FOOT_LOCK_DIAGNOSTICS_V737} from './hipFootLockV737';
import {DEFAULT_FOOT_LOCK_V322,FOOT_LOCK_EVENT_V322,FOOT_LOCK_DIAGNOSTIC_EVENT_V322,refreshFootLockV322,writeFootLockV322,type FootLockSettingsV322} from './intelligentFootLockV322';

type Report={leftLocked:boolean;rightLocked:boolean;leftSlipCm:number;rightSlipCm:number;floorY:number|null};
export function IntelligentFootLockControlsV322(){
  const [settings,setSettings]=useState<FootLockSettingsV322>(DEFAULT_FOOT_LOCK_V322);
  const [report,setReport]=useState<Report|null>(null);
  const [hipReportV737,setHipReportV737]=useState<(Report & {enabled:boolean})|null>(null);
  useEffect(()=>{
    const sync=()=>setSettings(refreshFootLockV322());
    const diagnostic=(event:Event)=>{setReport((event as CustomEvent<Report>).detail);};
    const hipDiagnosticV737=(event:Event)=>setHipReportV737((event as CustomEvent<Report & {enabled:boolean}>).detail);
    sync();window.addEventListener(FOOT_LOCK_EVENT_V322,sync);window.addEventListener('storage',sync);
    window.addEventListener(FOOT_LOCK_DIAGNOSTIC_EVENT_V322,diagnostic);
    window.addEventListener(HIP_FOOT_LOCK_DIAGNOSTICS_V737,hipDiagnosticV737);
    return()=>{window.removeEventListener(FOOT_LOCK_EVENT_V322,sync);window.removeEventListener('storage',sync);
      window.removeEventListener(FOOT_LOCK_DIAGNOSTIC_EVENT_V322,diagnostic);
      window.removeEventListener(HIP_FOOT_LOCK_DIAGNOSTICS_V737,hipDiagnosticV737);};
  },[]);
  const update=(patch:Partial<FootLockSettingsV322>)=>{const next={...settings,...patch};setSettings(next);writeFootLockV322(next);};
  const slider=(key:'anchorStrength'|'releaseSpeed'|'floorTracking'|'maxCorrectionCm',label:string,min:number,max:number,step:number,unit:string)=><label key={key}>
    {label} ({settings[key]}{unit})<input type="range" min={min} max={max} step={step} value={settings[key]} disabled={!settings.enabled} onChange={event=>update({[key]:Number(event.target.value)})}/>
  </label>;
  return <fieldset className="stage-director-v287 intelligent-foot-lock-v322">
    <legend>Intelligent Foot Lock & Ground Contact · V322</legend>
    <p>Ergänzt die bestehende Foot-IK um begrenzte Weltkoordinaten-Anker bei erkanntem Bodenkontakt. Keine Bearbeitung deiner GLB-Keyframes.</p>
    <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={event=>update({enabled:event.target.checked})}/> Intelligente Fußfixierung aktivieren (optional)</label>
    {slider('anchorStrength','Stärke der Fußverankerung',0,100,5,' %')}
    {slider('releaseSpeed','Loslösen beim Abheben',0,100,5,' %')}
    {slider('floorTracking','Vorsichtige Bodenhöhen-Nachführung',0,100,5,' %')}
    {slider('maxCorrectionCm','Maximale Korrektur (Avatar-Referenzmaß)',1,12,1,' cm')}
    {report&&settings.enabled?<p role="status">Live-IK: links {report.leftLocked?'Standphase':'frei'} · rechts {report.rightLocked?'Standphase':'frei'} · Abweichung links {report.leftSlipCm.toFixed(1)}, rechts {report.rightSlipCm.toFixed(1)} (modellbezogene cm-Schätzung)</p>:<small>Live-Kontaktdaten erscheinen, sobald ein kompatibler GLB-Avatar mit aktivierter Foot-IK spielt.</small>}
    {!settings.enabled&&hipReportV737&&<p role="status">V737 Hip Foot Lock: {hipReportV737.enabled ?
      `links ${hipReportV737.leftLocked?'Stützfuß':'frei'}, rechts ${hipReportV737.rightLocked?'Stützfuß':'frei'} · Ankerabweichung vor IK links ${hipReportV737.leftSlipCm.toFixed(1)}, rechts ${hipReportV737.rightSlipCm.toFixed(1)} (modellbezogene cm-Schätzung)`
      :'bei ausgeschalteter Hüftanimation nicht aktiv'}.</p>}
    <button type="button" onClick={()=>update({...DEFAULT_FOOT_LOCK_V322})}>V322 auf Standard zurücksetzen</button>
    <small>Opt-in: V322 greift nur nach der ursprünglichen Animation und begrenzt die Beinrotationen durch den bisherigen Solver. Ohne sichere Hip-Knee-Ankle-Kette oder bei Pause/Reduced Motion keine Korrektur. Die Bodenhöhe wird aus Animation und Fußpositionen geschätzt – kein physikalischer Bodensensor oder garantierter Schutz gegen Foot-Sliding.</small>
  </fieldset>;
}
