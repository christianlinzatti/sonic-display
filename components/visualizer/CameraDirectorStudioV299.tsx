"use client";
import { useEffect, useState } from "react";
import { CameraDirectorDashboardV300 } from "./CameraDirectorDashboardV300";
import { CAMERA_DASHBOARD_STATUS_TIMEOUT_MS } from "./cameraDashboardHelpersV300";
import { applyManualCameraMode, CAMERA_STUDIO_STATUS_EVENT, CAMERA_STUDIO_MODE_EVENT, readManualCameraMode, writeManualCameraMode, type CameraStudioStatus, type ManualCameraMode } from "./cameraStudioHelpersV299";
import { readCameraPresets } from "./cameraPresetLibraryV290";
import { readLiveCameraKeyframesEnabled } from "./liveCameraKeyframesV296";
import { readSmartCameraComposer } from "./smartCameraComposerV298";
import { readSmartCameraTrackingEnabled } from "./smartCameraTrackingV297";
import { CAMERA_PRESET_EVENT } from "./cameraPresetLibraryV290";
import { SMART_CAMERA_COMPOSER_EVENT } from "./smartCameraComposerV298";
import { SMART_CAMERA_TRACKING_EVENT } from "./smartCameraTrackingV297";
import { LIVE_CAMERA_KEYFRAMES_EVENT } from "./liveCameraKeyframesV296";

const modes: {value:ManualCameraMode;label:string}[]=[{value:"auto",label:"Automatisch"},{value:"wide",label:"Totale"},{value:"close",label:"Nahaufnahme"},{value:"side",label:"Seitlich"}];
export function CameraDirectorStudioV299() {
  const [mode,setMode]=useState<ManualCameraMode>("auto");
  const [status,setStatus]=useState<CameraStudioStatus|null>(null);
  const [lastStatusAt,setLastStatusAt]=useState(0);
  const [clock,setClock]=useState(0);
  const [config,setConfig]=useState({presets:false,keyframes:false,composer:false,tracking:false});
  useEffect(()=>{
    const syncMode=()=>setMode(readManualCameraMode());
    const syncConfig=()=>setConfig({presets:readCameraPresets().enabled,keyframes:readLiveCameraKeyframesEnabled(),composer:readSmartCameraComposer().enabled,tracking:readSmartCameraTrackingEnabled()});
    const onStatus=(event:Event)=>{setStatus((event as CustomEvent<CameraStudioStatus>).detail);setLastStatusAt(Date.now());};
    syncMode();syncConfig();
    window.addEventListener(CAMERA_STUDIO_MODE_EVENT,syncMode);
    for(const e of [CAMERA_PRESET_EVENT,LIVE_CAMERA_KEYFRAMES_EVENT,SMART_CAMERA_COMPOSER_EVENT,SMART_CAMERA_TRACKING_EVENT]) window.addEventListener(e,syncConfig);
    window.addEventListener(CAMERA_STUDIO_STATUS_EVENT,onStatus);
    return ()=>{window.removeEventListener(CAMERA_STUDIO_MODE_EVENT,syncMode);for(const e of [CAMERA_PRESET_EVENT,LIVE_CAMERA_KEYFRAMES_EVENT,SMART_CAMERA_COMPOSER_EVENT,SMART_CAMERA_TRACKING_EVENT])window.removeEventListener(e,syncConfig);window.removeEventListener(CAMERA_STUDIO_STATUS_EVENT,onStatus);};
  },[]);
  useEffect(()=>{const id=window.setInterval(()=>setClock(Date.now()),1000);return ()=>window.clearInterval(id);},[]);
  const connected=!!status && Math.max(clock,Date.now())-lastStatusAt<CAMERA_DASHBOARD_STATUS_TIMEOUT_MS;
  return <section className="camera-director-studio-v299" aria-label="Camera Director Studio">
    <h4>V299 · Camera Director Studio</h4>
    <p>Live-Regie, manuelle Perspektiven und Status an einem Ort. Die Live-Anzeige ist nur bei geöffneter 3D-Bühne verfügbar.</p>
    <div role="group" aria-label="Kameraperspektive" className="camera-studio-modes-v299">
      {modes.map(entry=><button key={entry.value} type="button" aria-pressed={mode===entry.value} onClick={()=>{setMode(entry.value);writeManualCameraMode(entry.value);}}>{entry.label}</button>)}
    </div>
    <div className="camera-studio-status-v299" role="status" aria-live="polite">
      <span>Phase: <strong>{status?.section ?? "—"}</strong></span>
      <span>Regie: <strong>{status?.source ?? "Keine Live-Daten"}</strong></span>
      <span>Audioenergie: <strong>{status?`${Math.round(status.intensity)} %`:"—"}</strong></span>
      <span>Wiedergabe: <strong>{!status?"Nicht verbunden":status.reducedMotion?"Bewegungsreduktion":status.playing?"Aktiv":"Pausiert"}</strong></span>
      <span>Kameraabstand: <strong>{status?status.camera.z.toFixed(1):"—"}</strong></span>
    </div>
    <CameraDirectorDashboardV300 status={connected?status:null} connected={connected}/>
    <p className="camera-studio-features-v299">Presets {config.presets?"✓":"–"} · Keyframes {config.keyframes?"✓":"–"} · Composer {config.composer?"✓":"–"} · Avatar-Tracking {config.tracking?"✓":"–"}</p>
    <small>Manuelle Perspektiven übersteuern die Regie, nicht den Sicherheitsspielraum des Avatar-Trackings. „Automatisch“ stellt die bisherige Regie wieder her. Für die 3D-Kamera muss der Stage Camera Director aktiviert sein.</small>
  </section>;
}
