"use client";
import {useEffect,useState} from "react";
import {SESSION_METRICS_EVENT,getSessionSummary} from "@/services/monitoring/longSessionMetrics";
import {getAnalysisSamples,analyzeSession,formatSessionCsv} from "@/services/monitoring/performanceSessionAnalyzerV262";
import {PerformanceStabilityGuardV272} from "./PerformanceStabilityGuardV272";
import {AdaptivePerformanceBenchmarkV270} from "./AdaptivePerformanceBenchmarkV270";
import {PerformanceOptimizationAssistantV264} from "./PerformanceOptimizationAssistantV264";
import {detectBottlenecks} from "@/services/monitoring/performanceBottleneckDetectorV263";
const fmt=(n:number|null, digits=1)=>n===null||!Number.isFinite(n)?"—":n.toFixed(digits);
export function PerformanceSessionAnalyzerV262(){
 const [,refresh]=useState(0);
 useEffect(()=>{const onUpdate=()=>refresh(n=>n+1);window.addEventListener(SESSION_METRICS_EVENT,onUpdate);return ()=>window.removeEventListener(SESSION_METRICS_EVENT,onUpdate);},[]);
 const samples=getAnalysisSamples(); const summary=getSessionSummary(); const findings=analyzeSession(samples); const bottlenecks=detectBottlenecks(samples);
 const latest=samples.slice(-12); const last=latest[latest.length-1];
 const exportCsv=()=>{const csv=formatSessionCsv(samples);const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));try{const a=document.createElement("a");a.href=url;a.download="sonic-display-performance-session-v262.csv";a.click();}finally{URL.revokeObjectURL(url);}};
 return <section aria-label="V262 Performance Session Analyzer" style={{padding:"0.75rem 1rem"}}>
  <h3>V262 · Performance Session Analyzer</h3>
  <p className="settings-note">Laufende Sitzungsanalyse auf Basis der vorhandenen 5-Sekunden-Messungen aus V250. Die Aufzeichnung erfolgt nur während der Wiedergabe im sichtbaren Tab. Maximal 720 Stichproben (ca. 60 Minuten), ausschließlich im Arbeitsspeicher.</p>
  <div className="render-diagnostics-grid">
   <div><span>Messungen</span><strong>{samples.length}</strong></div>
   <div><span>FPS · Mittel</span><strong>{fmt(summary.fpsAverage)}</strong></div>
   <div><span>FPS · P10</span><strong>{fmt(summary.fpsP10)}</strong></div>
   <div><span>Aktive Avatare · letzte Messung</span><strong>{last?.activeAvatars??"—"}</strong></div>
   <div><span>Avatar Callback · Ø Summe</span><strong>{fmt(last?.avatarCallbackMeanMs??null,2)} ms</strong></div>
   <div><span>Qualitätswechsel · Messfenster</span><strong>{latest.reduce((sum,s)=>sum+s.qualityChanges,0)}</strong></div>
  </div>
  <h4>V263 · Intelligent Performance Bottleneck Detector</h4>
  <p className="settings-note">Heuristische Ursachenanalyse der letzten bis zu 12 Messpunkte. Die Daten messen keine echte CPU-/GPU-Auslastung; Speicherwerte sind browserabhängig.</p>
  {samples.length<6?<p className="settings-note">Mindestens sechs Messpunkte nötig.</p>:bottlenecks.length?<ul>{bottlenecks.map(b=><li key={b.kind}><strong>{b.title}</strong> ({b.confidence==="moderate"?"mittlere Indizien":"schwache Indizien"}): {b.evidence} <em>Empfehlung: {b.recommendation}</em></li>)}</ul>:<p className="settings-note">Keine eindeutigen Engpass-Indizien im aktuellen Messfenster.</p>}
  <AdaptivePerformanceBenchmarkV270 />
  <PerformanceStabilityGuardV272 />
  <PerformanceOptimizationAssistantV264 />
  <h4>Automatische Hinweise</h4>
  {samples.length<6?<p className="settings-note">Mindestens sechs Stichproben (rund 30 Sekunden) für eine Bewertung erforderlich.</p>:findings.length?<ul>{findings.map(f=><li key={f.kind}><strong>{f.title}:</strong> {f.detail}</li>)}</ul>:<p className="settings-note">Im aktuellen Messfenster keine der definierten Warnschwellen überschritten.</p>}
  {latest.length>0&&<details><summary>Letzte {latest.length} Messpunkte</summary><div style={{overflowX:"auto",maxHeight:300,overflowY:"auto"}}><table><thead><tr><th>Zeit</th><th>FPS</th><th>Frame P95</th><th>Avatar CPU Ø</th><th>Avatare</th><th>Qualitätswechsel</th></tr></thead><tbody>{latest.map((s,i)=><tr key={`${s.at}-${i}`}><td>{new Date(s.at).toLocaleTimeString("de-AT")}</td><td>{fmt(s.fps)}</td><td>{fmt(s.p95FrameMs)} ms</td><td>{fmt(s.avatarCallbackMeanMs,2)} ms</td><td>{s.activeAvatars}</td><td>{s.qualityChanges}</td></tr>)}</tbody></table></div></details>}
  <button type="button" onClick={exportCsv} disabled={!samples.length}>Sitzung als CSV exportieren</button>
  <p className="settings-note">Grenzwerte sind heuristisch und zeigen mögliche Ursachen, keine Diagnosen. Die Avatar-Zeit misst ausschließlich zentrale Animations-Callbacks. Qualitätsschalter werden aus dem begrenzten V255-Verlauf ermittelt; bei sehr vielen Änderungen zwischen Messungen können einzelne fehlen.</p>
 </section>;
}
