"use client";
import { useEffect, useRef, useState } from "react";
import { useRenderDiagnostics } from "./renderDiagnostics";
import { getSceneDetail, setSceneDetail, type SceneDetail } from "./scenePerformanceControls";
import { setPerformanceMode, useAdaptivePerformance } from "./adaptivePerformance";
import { currentDeviceFingerprint, loadDeviceProfile, saveDeviceProfile, clearDeviceProfile, type DeviceProfile } from "./deviceCalibrationProfiles";
import { calibrationCandidates, recommendCalibration, type CalibrationResult, type CalibrationTier } from "./autoCalibrationAdvisor";
const PHASE_MS = 5500;
const WARMUP_MS = 1600;
type Saved = { mode: "auto" | CalibrationTier; scene: SceneDetail };
type Run = { index: number; started: number; lastStamp: number; readings: CalibrationResult[]; results: CalibrationResult[]; saved: Saved };
const average = (rows: CalibrationResult[], k: "fps" | "frameMs" | "slowPercent" | "drawCalls") => rows.reduce((a,r)=>a+r[k],0)/rows.length;
export function AutomaticPerformanceCalibrationWizard({ disabled = false }: {disabled?: boolean}) {
  const metrics = useRenderDiagnostics();
  const quality = useAdaptivePerformance();
  const metricsRef = useRef(metrics); metricsRef.current = metrics;
  const qualityRef = useRef(quality); qualityRef.current = quality;
  const runRef = useRef<Run | null>(null);
  const appliedRef = useRef<Saved | null>(null);
  const [running,setRunning] = useState(false);
  const [progress,setProgress] = useState(0);
  const [results,setResults] = useState<CalibrationResult[]>([]);
  const [message,setMessage] = useState("");
  const [complete,setComplete] = useState(false);
  const [stored,setStored] = useState<DeviceProfile | null>(null);
  const [restoreOnLoad,setRestoreOnLoad] = useState(false);
  useEffect(() => {
    const p = loadDeviceProfile(currentDeviceFingerprint());
    setStored(p);
    // Explicit opt-in for restoring settings, never override user choices on mount.
    setRestoreOnLoad(false);
  }, []);
  function saveRecommendedProfile() {
    const chosen = recommendation?.recommended;
    if (!chosen || running) return;
    const p = saveDeviceProfile(currentDeviceFingerprint(), chosen);
    if (p) { setStored(p); setMessage("Geräteprofil lokal gespeichert. Beim nächsten Start kannst du es wieder anwenden."); }
    else setMessage("Geräteprofil konnte nicht gespeichert werden (z. B. privater Browsermodus).");
  }
  function restoreSavedProfile() {
    if (running || disabled || !stored || stored.fingerprint !== currentDeviceFingerprint()) return;
    if (!appliedRef.current) appliedRef.current = {mode: qualityRef.current.mode, scene: getSceneDetail()};
    setPerformanceMode(stored.tier); setSceneDetail(stored.scene);
    setRestoreOnLoad(true);
    setMessage("Gespeichertes Geräteprofil angewendet.");
  }
  function deleteSavedProfile() {
    if (running) return;
    if (clearDeviceProfile()) {setStored(null);setRestoreOnLoad(false);setMessage("Gespeichertes Geräteprofil entfernt.");}
    else setMessage("Lokaler Speicher ist nicht verfügbar.");
  }
  function restoreAndStop(reason = "") {
    const r=runRef.current;
    if(r) {setPerformanceMode(r.saved.mode); setSceneDetail(r.saved.scene);}
    runRef.current=null; setRunning(false); if(reason) setMessage(reason);
  }
  function begin() {
    if(disabled || runRef.current) return;
    const m=metricsRef.current;
    if(!m.updatedAt || Date.now()-m.updatedAt>3500) {setMessage("Keine aktuellen 3D-Messwerte. Avatar-Ansicht öffnen."); return;}
    const saved: Saved = { mode: qualityRef.current.mode, scene: getSceneDetail() };
    runRef.current={index:0,started:Date.now(),lastStamp:m.updatedAt,readings:[],results:[],saved};
    setMessage("");setResults([]);setComplete(false);setProgress(0);setRunning(true);
    setPerformanceMode(calibrationCandidates[0].tier);setSceneDetail(calibrationCandidates[0].scene);
  }
  useEffect(()=>{
    const timer=window.setInterval(()=>{
      const r=runRef.current; if(!r) return;
      const now=Date.now(),m=metricsRef.current,c=calibrationCandidates[r.index];
      if(!m.updatedAt || now-m.updatedAt>3500) {restoreAndStop("Messwerte veraltet. Ursprüngliche Einstellungen wiederhergestellt.");return;}
      setProgress(Math.min(100,Math.round(100*(r.index+(Math.min(PHASE_MS,now-r.started)/PHASE_MS))/calibrationCandidates.length)));
      if(now-r.started>=WARMUP_MS && m.updatedAt!==r.lastStamp && m.updatedAt>=r.started+WARMUP_MS && qualityRef.current.tier===c.tier) {
        r.lastStamp=m.updatedAt;
        if([m.fps,m.frameMs,m.slowPercent,m.drawCalls].every(Number.isFinite) && m.fps>0)
          r.readings.push({...c,fps:m.fps,frameMs:m.frameMs,slowPercent:m.slowPercent,drawCalls:m.drawCalls,samples:1});
      }
      if(now-r.started<PHASE_MS)return;
      if(r.readings.length<2) {restoreAndStop("Zu wenige echte Frames: Kalibrierung abgebrochen.");return;}
      const result:CalibrationResult={...c,fps:average(r.readings,"fps"),frameMs:average(r.readings,"frameMs"),slowPercent:average(r.readings,"slowPercent"),drawCalls:average(r.readings,"drawCalls"),samples:r.readings.length};
      r.results.push(result);setResults([...r.results]);r.index++;
      if(r.index===calibrationCandidates.length) {restoreAndStop();setComplete(true);setProgress(100);return;}
      r.started=now;r.lastStamp=m.updatedAt;r.readings=[];
      setPerformanceMode(calibrationCandidates[r.index].tier);setSceneDetail(calibrationCandidates[r.index].scene);
    },250);
    return ()=>window.clearInterval(timer);
  },[]);
  useEffect(()=>()=>{const r=runRef.current;if(r){setPerformanceMode(r.saved.mode);setSceneDetail(r.saved.scene);runRef.current=null;}},[]);
  const recommendation = complete ? recommendCalibration(results) : null;
  function apply() {
    const chosen=recommendation?.recommended;
    if(!chosen || disabled || running)return;
    if(!appliedRef.current)appliedRef.current={mode:qualityRef.current.mode,scene:getSceneDetail()};
    setPerformanceMode(chosen.tier);setSceneDetail(chosen.scene);setMessage("Profil nur für diese Sitzung übernommen.");
  }
  function undo(){if(!appliedRef.current)return;setPerformanceMode(appliedRef.current.mode);setSceneDetail(appliedRef.current.scene);appliedRef.current=null;setMessage("Vorheriges Profil wiederhergestellt.");}
  return <section className="settings-note" aria-label="V238 Automatic Performance Calibration Wizard">
    <h4>V240 – Automatic Performance Calibration &amp; Device Profiles</h4>
    <p>Testet automatisch fünf echte Kombinationen aus Renderqualität und Bühnenbeleuchtung (je 5,5 Sekunden, davon 1,6 Sekunden Aufwärmen). Benötigt eine sichtbare 3D-Szene; Einstellungen werden nach dem Test wiederhergestellt.</p>
    <div className="avatar-editor-buttons">
      <button type="button" disabled={disabled || running} onClick={begin}>Automatische Kalibrierung starten</button>
      {running && <button type="button" onClick={()=>restoreAndStop("Abgebrochen; ursprüngliche Einstellungen wiederhergestellt.")}>Abbrechen</button>}
      <button type="button" disabled={disabled || running || !recommendation?.recommended} onClick={apply}>Empfehlung übernehmen</button>
      <button type="button" disabled={running || !appliedRef.current} onClick={undo}>Zurücksetzen</button>
    </div>
    <div className="avatar-editor-buttons">
      <button type="button" disabled={running || !recommendation?.recommended} onClick={saveRecommendedProfile}>Kalibrierung für dieses Gerät speichern</button>
      <button type="button" disabled={running || disabled || !stored} onClick={restoreSavedProfile}>Gespeichertes Profil anwenden</button>
      <button type="button" disabled={running || !stored} onClick={deleteSavedProfile}>Geräteprofil löschen</button>
    </div>
    {stored && <p role="status">Geräteprofil vorhanden: {stored.tier} / {stored.scene} · {stored.fps.toFixed(1)} FPS · {new Date(stored.savedAt).toLocaleDateString("de-AT")}. {restoreOnLoad ? "Aktiviert" : "Noch nicht angewendet"}. Wird nur für dieses Browser-Gerät angeboten.</p>}
    {running && <p role="status">Test {Math.min(calibrationCandidates.length,(runRef.current?.index??0)+1)}/{calibrationCandidates.length} · {progress}%</p>}
    {message && <p role="status">{message}</p>}
    {results.length>0 && <div className="render-diagnostics-grid">{results.map((r,i)=><div key={i}><strong>{r.tier} / {r.scene}</strong><p>{r.fps.toFixed(1)} FPS · {r.frameMs.toFixed(1)} ms</p><small>{r.slowPercent.toFixed(1)} % langsame Frames · {r.samples} Messungen</small></div>)}</div>}
    {recommendation && <p role="status">{recommendation.reason} {recommendation.recommended && `Empfohlen: ${recommendation.recommended.tier} / ${recommendation.recommended.scene}.`}</p>}
    <p>Heuristische Empfehlung für die getestete Avatar-/Musikszene, kein garantierter Gerätebenchmark. Beat- und Motion-Steuerung bleiben unverändert.</p>
  </section>;
}
