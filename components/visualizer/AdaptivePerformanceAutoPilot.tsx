"use client";
import { useEffect, useRef, useState } from "react";
import { useRenderDiagnostics } from "./renderDiagnostics";
import { getSceneDetail, setSceneDetail, type SceneDetail } from "./scenePerformanceControls";
import { useAdaptivePerformance } from "./adaptivePerformance";
import { advancePilot, initialPilotState, pilotScenes } from "./performanceAutoPilotPolicy";
/** Opt-in and session-only: scene detail is restored on disable or unmount. */
export function AdaptivePerformanceAutoPilot({ disabled = false }: { disabled?: boolean }) {
  const metrics = useRenderDiagnostics();
  const quality = useAdaptivePerformance();
  const latest = useRef(metrics); latest.current = metrics;
  const qualityRef = useRef(quality); qualityRef.current = quality;
  const [enabled, setEnabled] = useState(false);
  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState("Inaktiv – manuelle Einstellungen bleiben erhalten.");
  const saved = useRef<SceneDetail | null>(null);
  const pilot = useRef(initialPilotState());
  const stop = (message: string) => {
    if (saved.current !== null) setSceneDetail(saved.current);
    saved.current = null;
    pilot.current = initialPilotState();
    setLevel(0); setEnabled(false); setStatus(message);
  };
  const start = () => {
    if (disabled || qualityRef.current.mode !== "auto" || saved.current !== null) return;
    const m=latest.current;
    if (!m.updatedAt || Date.now()-m.updatedAt>3500) {setStatus("Keine aktuellen 3D-Messwerte. Avatar-Ansicht öffnen.");return;}
    saved.current=getSceneDetail();
    // Begin with the user's scene unchanged; only adjust after sustained overload.
    pilot.current=initialPilotState(Date.now());
    setEnabled(true);setStatus("Auto-Pilot überwacht die reale Bildrate.");
  };
  useEffect(() => {
    if (!enabled) return;
    if (disabled || quality.mode !== "auto") {stop("Auto-Pilot beendet: Benchmark oder manuelle Renderqualität aktiv.");return;}
    const timer=window.setInterval(() => {
      if (saved.current===null) return;
      const now=Date.now();
      const m=latest.current;
      if (!m.updatedAt || now-m.updatedAt>5000) {stop("Messwerte veraltet – ursprüngliche Bühneneffekte wiederhergestellt.");return;}
      const next=advancePilot(pilot.current, {fps:m.fps,slowPercent:m.slowPercent,updatedAt:m.updatedAt}, now);
      if (next.level!==pilot.current.level) {
        // The original scene is always the upper bound of quality.
        const base=pilotScenes.indexOf(saved.current);
        const target=pilotScenes[Math.min(pilotScenes.length-1, Math.max(0,base)+next.level)];
        setSceneDetail(target);setLevel(next.level);
        setStatus(next.level>pilot.current.level ? "Grafiklast wegen anhaltend niedriger FPS reduziert." : "Bühneneffekte nach stabiler Bildrate vorsichtig erhöht.");
      }
      pilot.current=next;
    },1000);
    return ()=>window.clearInterval(timer);
  },[enabled,disabled,quality.mode]);
  useEffect(()=>()=>{if(saved.current!==null) setSceneDetail(saved.current);saved.current=null;},[]);
  return <section className="settings-note" aria-label="V239 Adaptive Performance Auto-Pilot">
    <h4>V239 – Adaptive Performance Auto-Pilot</h4>
    <p>Optionaler Echtzeit-Auto-Pilot für die Bühneneffekte. Reduziert sie nach vier schlechten Messungen, erhöht sie erst nach zwölf guten Messungen; mindestens 14 Sekunden zwischen Änderungen. Die adaptive Auflösung läuft wie bisher separat.</p>
    <div className="avatar-editor-buttons">
      <button type="button" disabled={disabled || enabled || quality.mode!=="auto"} onClick={start}>Auto-Pilot starten</button>
      <button type="button" disabled={!enabled} onClick={()=>stop("Auto-Pilot beendet; Bühneneffekte wiederhergestellt.")}>Auto-Pilot stoppen</button>
    </div>
    <p role="status">{status} {enabled ? `· Stufe ${level}/3 · Szene ${getSceneDetail()}` : ""}</p>
    <small>Nur während dieser Sitzung. Erfordert Renderqualität „Auto“, eine aktive 3D-Szene und pausiert bei Benchmarks. Beat, Lyrics und Tanzanimationen bleiben unberührt.</small>
  </section>;
}
