"use client";
import {useEffect,useState,useSyncExternalStore} from "react";
import {useRenderDiagnostics} from "@/components/visualizer/renderDiagnostics";
import {useAdaptivePerformance} from "@/components/visualizer/adaptivePerformance";
import {useAvatarFrameProfiler} from "@/components/visualizer/avatarFrameProfiler";
import {getQualityDecisionHistory,getServerQualityDecisionHistory,subscribeQualityDecisionHistory} from "@/components/visualizer/qualityDecisionHistoryV255";
import {getAnimationSchedulerSnapshot,subscribeAnimationScheduler,isAnimationSchedulerEnabled} from "@/components/visualizer/adaptiveAnimationScheduler";
import {readMultiAvatarDirectorEnabled,setMultiAvatarDirectorEnabled} from "@/components/visualizer/adaptiveMultiAvatarDirectorV260";

const fmt=(n:number|undefined,digits=1)=>n!==undefined&&Number.isFinite(n)?n.toFixed(digits):"—";
/** V261: Read existing instrumented stores only. Never adds a render loop or changes beat/IK timing. */
export function PerformanceControlCenterV261(){
  const metrics=useRenderDiagnostics();
  const quality=useAdaptivePerformance();
  const avatars=useAvatarFrameProfiler();
  const decisions=useSyncExternalStore(subscribeQualityDecisionHistory,getQualityDecisionHistory,getServerQualityDecisionHistory);
  const scheduler=useSyncExternalStore(subscribeAnimationScheduler,getAnimationSchedulerSnapshot,getAnimationSchedulerSnapshot);
  const [directorEnabled,setDirectorEnabled]=useState(false);
  const [clock,setClock]=useState(()=>Date.now());
  useEffect(()=>{setDirectorEnabled(readMultiAvatarDirectorEnabled());const refresh=()=>setDirectorEnabled(readMultiAvatarDirectorEnabled());window.addEventListener("sonic:v260-director",refresh);return ()=>window.removeEventListener("sonic:v260-director",refresh);},[]);
  useEffect(()=>{const id=window.setInterval(()=>setClock(Date.now()),2000);return ()=>window.clearInterval(id);},[]);
  const fresh=metrics.updatedAt>0&&clock>=metrics.updatedAt&&clock-metrics.updatedAt<6000;
  const active=avatars.filter(a=>a.frames>0&&(typeof performance!=="undefined"?performance.now():0)-a.updatedAt<6000);
  const sumMean=active.reduce((s,a)=>s+a.meanMs,0);
  return <section aria-label="V261 Adaptive Performance Control Center" style={{padding:"0.75rem 1rem"}}>
    <h3>V261 · Adaptive Performance Control Center</h3>
    <p className="settings-note">Alle Werte stammen aus bereits vorhandenen Messungen. Dieses Dashboard erzeugt keine zusätzlichen 3D-Frames und keine GPU-Timer-Abfragen.</p>
    <div className="render-diagnostics-grid">
      <div><span>FPS</span><strong>{fresh?fmt(metrics.fps):"—"}</strong></div>
      <div><span>Frame P95</span><strong>{fresh?`${fmt(metrics.p95FrameMs)} ms`:"—"}</strong></div>
      <div><span>Langsame Frames</span><strong>{fresh?`${fmt(metrics.slowPercent)} %`:"—"}</strong></div>
      <div><span>Renderqualität</span><strong>{quality.tier} ({quality.mode})</strong></div>
      <div><span>Pixel Ratio</span><strong>{fmt(quality.dpr,2)}</strong></div>
      <div><span>Aktive Avatare</span><strong>{active.length}</strong></div>
      <div><span>Avatar CPU Callback · Ø Summe</span><strong>{active.length?`${fmt(sumMean,2)} ms`:"—"}</strong></div>
      <div><span>Draw Calls / Dreiecke</span><strong>{fresh?`${metrics.drawCalls} / ${metrics.triangles}`:"—"}</strong></div>
      <div><span>CPU Scheduler</span><strong>{isAnimationSchedulerEnabled()?scheduler.tier:"deaktiviert"}</strong></div>
    </div>
    {!fresh&&<p role="status" className="settings-note">Keine aktuellen WebGL-Daten. Bitte den 3D-Visualizer starten.</p>}
    <p className="settings-note">Qualitätsentscheidung: {quality.reason} · CPU-Scheduler: {scheduler.reason}</p>
    <label><input type="checkbox" checked={directorEnabled} onChange={e=>{setDirectorEnabled(e.target.checked);setMultiAvatarDirectorEnabled(e.target.checked);}} /> V260 Multi-Avatar Director aktivieren</label>
    <p className="settings-note">Diese Einstellung steuert ausschließlich die optionale Drosselung zusätzlicher Animationsberechnungen; deine Charakterauswahl bleibt bestehen.</p>
    <h4>Aktive Avatar-Callbacks</h4>
    {!active.length?<p className="settings-note">Keine aktiven Avatar-Messungen.</p>:<div style={{maxHeight:260,overflowY:"auto"}}><table aria-label="Aktive Avatar CPU-Kosten"><thead><tr><th>Avatar</th><th>Ø CPU</th><th>P95</th><th>Samples</th></tr></thead><tbody>{active.map(a=><tr key={a.id}><td>{a.label}</td><td>{fmt(a.meanMs,2)} ms</td><td>{fmt(a.p95Ms,2)} ms</td><td>{a.frames}</td></tr>)}</tbody></table></div>}
    <h4>Letzte Qualitätsentscheidungen</h4>
    {!decisions.length?<p className="settings-note">Noch keine automatischen Qualitätswechsel in dieser Sitzung.</p>:<ol>{decisions.slice(0,5).map((d,i)=><li key={`${d.at}-${i}`}>{new Date(d.at).toLocaleTimeString("de-AT")} · {d.from} → {d.to} · {d.reason} · {fmt(d.fps)} FPS</li>)}</ol>}
    <p className="settings-note">Die Avatar-CPU-Summe ist nur ein Callback-Näherungswert. Sie ist weder gesamte CPU-Auslastung noch GPU-Zeit; die P95-Werte der Avatare dürfen nicht als Gesamtframezeit interpretiert werden. Für Raspberry Pi die Messung direkt auf dem Zielgerät durchführen.</p>
  </section>;
}
