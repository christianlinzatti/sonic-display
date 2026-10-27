'use client';
import {useState} from 'react';
import {usePiStudioV518,clearPiStudioV518} from './piConcertPerformanceRuntimeV518';
import {PiConcertOptimizationAdvisorV519} from './PiConcertOptimizationAdvisorV519';
import {PiConcertAutoTuningStudioV520} from './PiConcertAutoTuningStudioV520';
import {PiConcertBenchmarkStudioV522} from './PiConcertBenchmarkStudioV522';
import {capturePiStudioV518,comparePiStudioV518,piStudioAdviceV518,
 type PiStudioCaptureV518} from '@/services/monitoring/piConcertPerformanceStudioV518';
const num=(v:number,d=1)=>Number.isFinite(v)?v.toFixed(d):'—';
const bool=(v:boolean)=>v?'an':'aus';
/** Read-only, session-scoped comparison. Stage options are changed by the user elsewhere. */
export function PiConcertPerformanceStudioV518(){
 const samples=usePiStudioV518();
 const [captures,setCaptures]=useState<readonly PiStudioCaptureV518[]>([]);
 const [left,setLeft]=useState(0),[right,setRight]=useState(1);
 const [message,setMessage]=useState('');
 const latest=samples[samples.length-1];
 const prepared=capturePiStudioV518(samples,Date.now());
 const a=captures[left],b=captures[right];
 const comparison=a&&b?comparePiStudioV518(a,b):null;
 function take(){
  const result=capturePiStudioV518(samples,Date.now());
  if(!result.capture){setMessage(result.reason);return;}
  const next=[...captures,result.capture].slice(-8);
  setCaptures(next);setLeft(Math.max(0,next.length-2));setRight(next.length-1);
  setMessage(`${result.capture.avatarCount} Avatare: ${result.count} echte Messfenster übernommen.`);
 }
 function download(){
  const report={version:'V518',source:'Observed main-canvas frame windows; no GPU/process/thermal measurement',
    notes:'Browser measurements only. Other scenes, songs, temperature and time can alter results.',captures};
  const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='sonic-display-v518-pi-concert-comparison.json';
  document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
 }
 return <section className="concert-diagnostics-v480" aria-label="V518 Raspberry Pi Concert Performance Studio">
  <h4>V518 – Raspberry Pi Concert Performance Studio</h4>
  <p className="settings-note">Vergleiche <strong>zwei bis vier Avatare</strong> auf der laufenden Hauptbühne. Stelle Anzahl, Lyrics, Lip-Sync, reaktives Bühnenlicht und Grafikprofil selbst um. Nach jedem Wechsel mindestens sechs zusammenhängende Ein-Sekunden-Messungen abwarten; anschließend einen Messpunkt übernehmen. Keine zusätzliche WebGL-Bühne und keine automatische Änderung der Einstellungen.</p>
  <p role="status">{latest?`${latest.avatarCount} Avatare · ${latest.tier} · ${num(latest.fps)} FPS · P95 ${num(latest.p95FrameMs)} ms · Lyrics ${bool(latest.features.lyrics)} · Lip-Sync ${bool(latest.features.lipSync)} · reaktives Licht ${bool(latest.features.reactiveLighting)}`:'Noch keine gültigen Live-Messungen mit 2–4 Avataren.'}</p>
  <p className="settings-note">Aktuelles Messfenster: <strong>{prepared.status==='ready'?`${prepared.count} stabile Intervalle`:`${prepared.count}/6 Intervalle`}</strong> · {prepared.reason}</p>
  <div className="concert-actions-v480">
   <button type="button" onClick={take} disabled={prepared.status!=='ready'}>Messfenster übernehmen</button>
   <button type="button" onClick={download} disabled={!captures.length}>Vergleich als JSON speichern</button>
   <button type="button" onClick={()=>{clearPiStudioV518();setCaptures([]);setLeft(0);setRight(1);setMessage('Sitzungsmessungen gelöscht.');}} disabled={!samples.length&&!captures.length}>Messungen löschen</button>
  </div>
  {message&&<p role="status" className="settings-note">{message}</p>}
  {captures.length>0&&<div className="render-diagnostics-grid">
   {captures.map((c,i)=><div key={`${c.at}-${i}`}>
    <strong>#{i+1} · {c.avatarCount} Avatare · {c.tier}</strong>
    <p>FPS Ø {num(c.avgFps)} · Minimum {num(c.minFps)}</p>
    <p>Schlechtestes Fenster-P95 {num(c.worstWindowP95Ms)} ms · langsame Frames Ø {num(c.avgSlowPercent)} %</p>
    <p>Draw Calls Ø {num(c.avgDrawCalls,0)} · Dreiecke Ø {num(c.avgTriangles,0)}</p>
    <p>JS-Heap-Spitze {c.peakHeapMb===null?'nicht verfügbar':`${num(c.peakHeapMb)} MB`}</p>
    <small>{c.count} Fenster · DPR {num(c.dpr,2)} · Pi {c.piProfile}/{c.piLevel} · Lyrics {bool(c.features.lyrics)} · Lip-Sync {bool(c.features.lipSync)} · reaktives Licht {bool(c.features.reactiveLighting)}</small>
    <p className="settings-note">{piStudioAdviceV518(c)}</p>
   </div>)}
  </div>}
  {captures.length>=2&&<div className="settings-note" aria-label="V518 gemessener Bühnenvergleich">
   <h5>Zwei Messpunkte vergleichen</h5>
   <label>Vergleich A <select value={left} onChange={e=>setLeft(Number(e.target.value))}>{captures.map((c,i)=><option key={i} value={i}>#{i+1} – {c.avatarCount} Avatare</option>)}</select></label>
   <label>Vergleich B <select value={right} onChange={e=>setRight(Number(e.target.value))}>{captures.map((c,i)=><option key={i} value={i}>#{i+1} – {c.avatarCount} Avatare</option>)}</select></label>
   {comparison&&<p role="status"><strong>{left===right?'Gleicher Messpunkt':comparison.comparable?'Bedingt vergleichbar':'Nicht direkt vergleichbar'}</strong> · Δ FPS {comparison.fpsDifference>=0?'+':''}{num(comparison.fpsDifference)} · Δ schlechtestes Fenster-P95 {comparison.p95DifferenceMs>=0?'+':''}{num(comparison.p95DifferenceMs)} ms. {left===right?'Wähle zwei unterschiedliche Messpunkte.':comparison.description}</p>}
  </div>}
  <PiConcertBenchmarkStudioV522 readings={samples} />
  <PiConcertOptimizationAdvisorV519 captures={captures} />
  <PiConcertAutoTuningStudioV520 captures={captures} liveConfiguration={prepared.capture?.configuration??null} />
  <p className="settings-note">FPS, P95, Draw Calls und Dreiecke stammen aus realen Browser-Renderfenstern. P95 ist hier das <em>Maximum der P95-Fensterwerte</em>, kein P95 aller Frames. JS-Heap ist nur verfügbar, wenn Chromium performance.memory bereitstellt, und ist <strong>nicht</strong> der RAM-Verbrauch des Raspberry Pi. GPU-Zeit, GPU-Auslastung, Temperatur, Stromverbrauch und VRAM sind nicht messbar. Szenen, Songs und thermische Drosselung können Vergleiche beeinflussen. Alle Daten bleiben bis zum Schließen dieser Sitzung im Arbeitsspeicher.</p>
 </section>;
}
