'use client';
import {useState} from 'react';
import type {PiStudioCaptureV518} from '@/services/monitoring/piConcertPerformanceStudioV518';
import {planConcertOptimizationV519,compareOptimizationCapturesV519,type ConcertTargetV519}
  from '@/services/monitoring/concertOptimizationAdvisorV519';
const n=(value:number|null,d=1)=>value===null||!Number.isFinite(value)?'—':value.toFixed(d);
/** Only suggests opt-in A/B experiments based on measured V518 captures. No setting setter here. */
export function PiConcertOptimizationAdvisorV519({captures}:{captures:readonly PiStudioCaptureV518[]}){
  const [baseline,setBaseline]=useState(-1);
  const [candidate,setCandidate]=useState(-1);
  const [target,setTarget]=useState<ConcertTargetV519>(30);
  const baselineIndex=baseline<0||baseline>=captures.length?captures.length-1:baseline;
  const a=captures[baselineIndex];
  const b=candidate>=0&&candidate<captures.length?captures[candidate]:undefined;
  const plan=planConcertOptimizationV519(a,target);
  const pair=compareOptimizationCapturesV519(a,b);
  return <div className="settings-note" aria-label="V519 Adaptive Concert Performance Optimization">
    <h5>V519 – Adaptive Concert Performance Optimization</h5>
    <p>Messbasierte Empfehlungen für Deutschrap- und Hardstyle-Shows mit 2–4 Avataren. Jede vorgeschlagene Änderung muss <strong>von dir selbst</strong> ausgeführt und erneut gemessen werden. Es gibt keine automatische Optimierung und keine vorhergesagten FPS-Gewinne.</p>
    <div className="concert-actions-v480">
      <label>Referenzmessung <select value={baselineIndex} onChange={e=>setBaseline(Number(e.target.value))} disabled={!captures.length}>
        {captures.length===0?<option value={-1}>Noch keine Messung</option>:captures.map((c,i)=><option value={i} key={`${c.at}-${i}`}>#{i+1} · {c.avatarCount} Avatare · {n(c.avgFps)} FPS</option>)}
      </select></label>
      <label>FPS-Ziel <select value={target} onChange={e=>setTarget(Number(e.target.value) as ConcertTargetV519)}>
        <option value={30}>30 FPS</option><option value={45}>45 FPS</option><option value={60}>60 FPS</option>
      </select></label>
    </div>
    <p role="status"><strong>{plan.valid?(plan.severity==='constrained'?'Deutlicher Engpass':plan.severity==='observe'?'Gegenmessung empfohlen':'Aktuelle Probe unauffällig'):'Noch keine belastbare Aufnahme'}</strong> · {plan.reason}</p>
    {plan.valid&&<ol aria-label="Messbasierter manueller Optimierungsplan">
      {plan.actions.map(action=><li key={action.id}>
        <strong>{action.title}</strong> — {action.test}
        <p>Messbezug: {action.reason}</p>
        <small>Schutz: {action.guard}</small>
      </li>)}
    </ol>}
    {captures.length>=2&&<div aria-label="V519 Einzeländerungsanalyse">
      <h5>A/B-Vergleich kontrollieren</h5>
      <label>Vergleichsmessung <select value={candidate} onChange={e=>setCandidate(Number(e.target.value))}>
        <option value={-1}>Zweiten Messpunkt wählen</option>
        {captures.map((c,i)=><option value={i} key={`${c.at}-${i}`}>#{i+1} · {c.avatarCount} Avatare · {n(c.avgFps)} FPS</option>)}
      </select></label>
      <p role="status"><strong>{pair.status==='single-change'?'Eine erfasste Änderung':pair.status==='repeat'?'Wiederholungsmessung':pair.status==='confounded'?'Mehrere Änderungen':'Kein gültiger Paarvergleich'}</strong> · {pair.description}</p>
      {pair.status!=='invalid'&&<p>Geändert: {pair.changes.join(', ')||'keine erfasste Option'} · Gemessenes Δ FPS: {pair.fpsDelta!==null&&pair.fpsDelta>=0?'+':''}{n(pair.fpsDelta)} · Δ schlechtestes Fenster-P95: {pair.p95DeltaMs!==null&&pair.p95DeltaMs>=0?'+':''}{n(pair.p95DeltaMs)} ms. {pair.positiveObservation?'Beide beobachteten Kennzahlen verbesserten sich; Ursache unbewiesen.':'Kein eindeutiger gleichgerichteter Vorteil beider Kennzahlen.'}</p>}
    </div>}
    <p>Die Diagnose kennt weder Songabschnitt, Temperatur, GPU-Zeit noch Raspberry-Pi-RAM. FPS und P95 stammen aus Browser-Fenstern; die P95-Angabe ist das schlechteste der Fenster-P95. GLB-Motions, Lip-Sync, Fuß-IK, Lyrics und manuell gesetzte Optionen bleiben unverändert.</p>
  </div>;
}
