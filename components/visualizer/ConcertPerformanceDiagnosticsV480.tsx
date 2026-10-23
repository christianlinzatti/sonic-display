'use client';
import {useState} from 'react';
import {useConcertDiagnosticsV480,clearConcertDiagnosticsV480} from './concertDiagnosticsRuntimeV480';
import {usePiConcertBudgetV479} from './piConcertRuntimeV479';
import {useAdaptivePerformance} from './adaptivePerformance';
import {summarizeConcertV480,type ConcertReadingV480} from '@/services/monitoring/concertPerformanceDiagnosticsV480';

const number=(value:number,digits=1)=>Number.isFinite(value)?value.toFixed(digits):'—';
const gradeNames={stable:'Stabiler Verlauf',limited:'Schwankende Bildrate',strained:'Deutliche Frame-Last',insufficient:'Noch zu wenige Messungen'};
function TrendV480({readings,metric,label}: {readings:readonly ConcertReadingV480[];metric:'fps'|'p95FrameMs';label:string}){
  const recent=readings.slice(-60);
  const values=recent.map(sample=>sample[metric]);
  const domain=metric==='fps'?{min:0,max:70}:{min:0,max:70};
  const points=values.map((value,i)=>`${Math.round(6+i*288/Math.max(1,values.length-1))},${Math.round(65-(Math.min(domain.max,Math.max(domain.min,value))/domain.max)*54)}`).join(' ');
  return <div className="concert-trend-v480">
    <span>{label} · letzte {recent.length} Messfenster</span>
    {recent.length<2?<p className="settings-note">Wird nach zwei gültigen Messungen angezeigt.</p>:
      <svg viewBox="0 0 300 76" role="img" aria-label={`${label}: Verlauf aus ${recent.length} echten Messungen`} preserveAspectRatio="none">
        <line x1="6" y1="65" x2="294" y2="65" stroke="currentColor" strokeOpacity=".25" />
        <line x1="6" y1="38" x2="294" y2="38" stroke="currentColor" strokeOpacity=".12" strokeDasharray="3 4" />
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>}
  </div>;
}

/** Opt-in viewing: mounted only under the existing Diagnostics settings tab.
 * Values are observed render-loop frame windows, not GPU timing/temperature.
 */
export function ConcertPerformanceDiagnosticsV480(){
  const {readings,changes,lastAt}=useConcertDiagnosticsV480();
  const budget=usePiConcertBudgetV479();
  const quality=useAdaptivePerformance();
  const [message,setMessage]=useState('');
  const summary=summarizeConcertV480(readings);
  const fresh=lastAt>0&&Date.now()-lastAt<5000;
  const current=readings[readings.length-1];
  const grade=fresh?summary.grade:'insufficient';
  function exportReport(){
    try{
      const report={version:'V480',source:'Observed browser render frames (not GPU timing)',
        quality:{mode:quality.mode,tier:quality.tier,dpr:quality.dpr,reason:quality.reason},
        pi:{enabled:budget.enabled,profile:budget.profile,level:budget.level,reason:budget.reason},
        summary,readings,changes};
      const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob);
      const link=document.createElement('a');link.href=url;link.download='sonic-display-v480-diagnostics.json';
      document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
      setMessage('Bericht lokal gespeichert – keine Daten wurden hochgeladen.');
    }catch{setMessage('Der Browser konnte den Bericht nicht speichern.');}
  }
  return <section className="concert-diagnostics-v480" aria-label="V480 Konzert-Performance-Diagnose">
    <h4>V480 – Konzert-Performance-Diagnose</h4>
    <p className="settings-note">Verwendet die vorhandenen Render-Messfenster (ca. 1 pro Sekunde). Maximal 90 Messungen und 24 Wechsel im Arbeitsspeicher dieser Sitzung. Keine zusätzliche Render-Schleife, kein Upload und keine permanente Speicherung.</p>
    <p role="status" aria-live="polite"><strong>{fresh?gradeNames[grade]:'Keine aktuellen Messungen'}</strong>{!fresh?' – starte die 3D-Bühne mit laufender Musik.':''}</p>
    <div className="render-diagnostics-grid">
      <div><span>FPS · letzte 30 Messungen Ø</span><strong>{summary.count?number(summary.avgFps):'—'}</strong></div>
      <div><span>Frame-Zeit P95 · schlechtestes Fenster</span><strong>{summary.count?`${number(summary.p95FrameMs)} ms`:'—'}</strong></div>
      <div><span>Langsame Frames · Ø</span><strong>{summary.count?`${number(summary.avgSlowPercent)} %`:'—'}</strong></div>
      <div><span>Avatare · letztes Messfenster</span><strong>{current?.avatarCount??'—'}</strong></div>
      <div><span>Pi-Effektbudget</span><strong>{budget.enabled?budget.level:'Aus'}</strong></div>
      <div><span>Aktuelle Renderqualität</span><strong>{quality.tier}</strong></div>
    </div>
    <p className="settings-note">Pi-Profil: <strong>{budget.profile}</strong> · DPR: {number(quality.dpr,2)} · Modus: {quality.mode} · letzter gemessener Draw-Call-Wert: {current?.drawCalls??'—'} · P95 ist hier das Maximum der gemessenen Fenster-P95-Werte, nicht der P95 über alle Einzelbilder.</p>
    {summary.count>=5 && <p className="settings-note">{grade==='strained'?'Hinweis: Die Framezeiten deuten auf starke Last. Teste weniger gleichzeitig sichtbare Avatare oder das Pi-Low-Profil.':grade==='limited'?'Hinweis: Die Bildrate schwankt. Vergleiche zwei und vier Avatare und beobachte das Pi-Effektbudget.':'Die gemessenen letzten Fenster sind relativ stabil. Das ist keine Garantie für eine feste FPS-Zahl.'}</p>}
    <div className="concert-trends-v480">
      <TrendV480 readings={readings} metric="fps" label="FPS" />
      <TrendV480 readings={readings} metric="p95FrameMs" label="P95-Framezeit (ms)" />
    </div>
    <h5>Automatische Pi-Budgetwechsel</h5>
    {changes.length===0?<p className="settings-note">In dieser Sitzung keine automatisch gemessenen Budgetwechsel.</p>:
      <ol className="concert-changes-v480">{[...changes].reverse().slice(0,8).map((change,i)=><li key={`${change.at}-${i}`}><strong>{change.from} → {change.to}</strong> · {new Date(change.at).toLocaleTimeString('de-AT')} · {change.reason}</li>)}</ol>}
    <div className="concert-actions-v480">
      <button type="button" onClick={exportReport} disabled={!readings.length}>Diagnosebericht als JSON speichern</button>
      <button type="button" onClick={()=>{clearConcertDiagnosticsV480();setMessage('Sitzungsverlauf gelöscht.');}} disabled={!readings.length&&!changes.length}>Verlauf löschen</button>
    </div>
    {message&&<p role="status" className="settings-note">{message}</p>}
    <p className="settings-note">Die Messwerte umfassen Frame-Intervalle, Draw Calls und Dreiecke, jedoch keine verlässliche GPU-Auslastung, GPU-Temperatur, VRAM-Auslastung oder native Raspberry-Pi-Telemetrie. Die Diagnose verändert selbst keine Qualitätsstufen.</p>
  </section>;
}
