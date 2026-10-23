"use client";
import {useEffect, useState} from "react";
import {getSessionSamples,getSessionSummary,resetSession,SESSION_METRICS_EVENT} from "@/services/monitoring/longSessionMetrics";
const format = (v: number | null, digits=1) => v === null || !Number.isFinite(v) ? "nicht verfügbar" : v.toFixed(digits);
export function LongSessionMonitoringPanel() {
  const [,refresh] = useState(0);
  useEffect(() => { const update=()=>refresh(n=>n+1); window.addEventListener(SESSION_METRICS_EVENT,update); return ()=>window.removeEventListener(SESSION_METRICS_EVENT,update); },[]);
  const summary=getSessionSummary(); const samples=getSessionSamples();
  const latest=samples.slice(-12);
  const duration=Math.floor(summary.durationSeconds);
  return <section aria-label="Langzeit-Performance" style={{padding:"0.75rem 1rem"}}>
    <h3>V250 · Langzeit-Performance</h3>
    <p className="settings-note">Lokal im Arbeitsspeicher, Messung alle 5 Sekunden während der Wiedergabe (nur sichtbarer Tab). Maximal 720 Stichproben; keine Übertragung und keine Speicherung.</p>
    <div className="render-diagnostics-grid">
      <div><span>Status / Laufzeit</span><strong>{summary.active ? "Aufzeichnung" : "Pausiert"} · {Math.floor(duration/60)}:{String(duration%60).padStart(2,"0")}</strong></div>
      <div><span>FPS · Mittel / P10</span><strong>{format(summary.fpsAverage)} / {format(summary.fpsP10)}</strong></div>
      <div><span>Langsame Frames · Mittel</span><strong>{format(summary.slowAverage)} %</strong></div>
      <div><span>JS-Heap · zuletzt</span><strong>{format(summary.heapLatestMiB)} MiB</strong></div>
      <div><span>Heap-Veränderung</span><strong>{format(summary.heapDeltaMiB)} MiB</strong></div>
      <div><span>Heap-Trend (ab 5 min)</span><strong>{format(summary.heapGrowthMiBPerHour)} MiB/h</strong></div>
    </div>
    <p className="settings-note">{summary.samples} Stichproben · Zuletzt: {summary.latest ? new Date(summary.latest.at).toLocaleTimeString("de-AT") : "noch keine"}</p>
    <p className="settings-note">Die Heap-Messung ist nur in unterstützten Browsern verfügbar. Ein steigender Heap-Trend beweist kein Speicherleck; Garbage Collection beeinflusst die Werte. FPS/P95 stammen aus der 3D-Renderdiagnose, nicht aus einem zusätzlichen Render-Loop.</p>
    {latest.length>0 && <details><summary>Letzte {latest.length} Messungen</summary><div style={{maxHeight:220,overflowY:"auto"}}><table><thead><tr><th>Zeit</th><th>FPS</th><th>P95</th><th>Heap</th></tr></thead><tbody>{latest.map((s,i)=><tr key={`${s.at}-${i}`}><td>{new Date(s.at).toLocaleTimeString("de-AT")}</td><td>{format(s.fps)}</td><td>{format(s.p95FrameMs)} ms</td><td>{format(s.heapMiB)} MiB</td></tr>)}</tbody></table></div></details>}
    <button type="button" onClick={()=>resetSession()}>Messwerte zurücksetzen</button>
  </section>;
}
