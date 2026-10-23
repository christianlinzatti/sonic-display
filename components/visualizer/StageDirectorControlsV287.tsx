"use client";
import { useEffect, useState } from "react";
import { TrackAnalysisControlsV318 } from "./TrackAnalysisControlsV318";
import { VisualDanceImprovementStudioV315 } from "./VisualDanceImprovementStudioV315";
import { DancePerformanceReviewStudioV314 } from "./DancePerformanceReviewStudioV314";
import { IntelligentChoreographyControlsV312 } from "./IntelligentChoreographyControlsV312";
import { ShowQualityControlsV310 } from "./ShowQualityControlsV310";
import { DanceShowEvolutionControlsV313 } from "./DanceShowEvolutionControlsV313";
import { ShowPresetStudioV309 } from "./ShowPresetStudioV309";
import { UltimateShowControlsV306 } from "./UltimateShowControlsV306";
import { DanceQualityControlsV307 } from "./DanceQualityControlsV307";
import { DancePerformanceControlsV311 } from "./DancePerformanceControlsV311";
import { AdvancedFullBodyBalanceControlsV323 } from "./AdvancedFullBodyBalanceControlsV323";
import { IntelligentFootLockControlsV322 } from "./IntelligentFootLockControlsV322";
import { GroundContactStudioV487 } from "./GroundContactPanelV487";
import { NaturalDanceControlsV320 } from "./NaturalDanceControlsV320";
import { ConcertAtmosphereControlsV308 } from "./ConcertAtmosphereControlsV308";
import { CameraPresetStudioV290 } from "./CameraPresetStudioV290";
import { DEFAULT_STAGE_DIRECTOR, readStageDirector, writeStageDirector, STAGE_DIRECTOR_EVENT } from "./stageDirectorV287";

export function StageDirectorControlsV287() {
  const [settings, setSettings] = useState(DEFAULT_STAGE_DIRECTOR);
  useEffect(() => { const sync = () => setSettings(readStageDirector()); sync(); window.addEventListener(STAGE_DIRECTOR_EVENT, sync); return () => window.removeEventListener(STAGE_DIRECTOR_EVENT, sync); }, []);
  const update = (values: Partial<typeof settings>) => { const next = { ...settings, ...values }; setSettings(next); writeStageDirector(next); };
  return <><ShowPresetStudioV309 /><fieldset className="stage-director-v287"><legend>Smart Stage Director · V287</legend>
    <p>Wechselt passend zu Genre, erkannten Songabschnitten und Energie automatisch zwischen Bühnen. Die manuell gewählte Bühne bleibt gespeichert.</p>
    <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e => update({ enabled: e.target.checked })} /> Automatische Bühnenwechsel aktivieren</label>
    <label className="setting-check"><input type="checkbox" checked={settings.energySensitive} onChange={e => update({ energySensitive: e.target.checked })} disabled={!settings.enabled}/> Songenergie berücksichtigen</label>
    <label>Übergangsdauer ({settings.transitionMs} ms)<input type="range" min="250" max="1800" step="50" value={settings.transitionMs} disabled={!settings.enabled} onChange={e => update({ transitionMs: Number(e.target.value) })}/></label>
    <label className="setting-check"><input type="checkbox" checked={settings.cinematic} onChange={e => update({ cinematic: e.target.checked })} disabled={!settings.enabled}/> Filmische Bühnenübergänge</label>
    <label className="setting-check"><input type="checkbox" checked={settings.cameraMotion} onChange={e => update({ cameraMotion: e.target.checked })} disabled={!settings.enabled || !settings.cinematic}/> Sanfte Kamerafahrt beim Übergang</label>
    <label className="setting-check"><input type="checkbox" checked={settings.dropFlash} onChange={e => update({ dropFlash: e.target.checked })} disabled={!settings.enabled || !settings.cinematic}/> Lichtakzent bei Drops und Hooks</label>
    <label className="setting-check"><input type="checkbox" checked={settings.realCamera} onChange={e => update({ realCamera: e.target.checked })} disabled={!settings.enabled}/> Echte 3D-Kamerafahrten · V289</label>
    <label>Kamerabewegung ({settings.cameraIntensity} %)<input type="range" min="0" max="100" step="5" value={settings.cameraIntensity} disabled={!settings.enabled || !settings.realCamera} onChange={e => update({ cameraIntensity: Number(e.target.value) })}/></label>
    <small>Die 3D-Kamera reagiert auf Verse, Break, Build, Hook und Drop. Bei deaktivierter Automatik oder Reduced Motion bleibt die bisherige Kameraführung aktiv.</small>
    <small>Eigene Bühnenwahl überschreibt die Automatik bis zum nächsten Track. Die Musikanalyse ist eine Schätzung; ohne Mikrofon nutzt Sonic Display synthetische Audio-Werte.</small>
  </fieldset><TrackAnalysisControlsV318 /><UltimateShowControlsV306 /><ShowQualityControlsV310 /><DanceShowEvolutionControlsV313 /><DancePerformanceReviewStudioV314 /><VisualDanceImprovementStudioV315 /><IntelligentChoreographyControlsV312 /><DanceQualityControlsV307 /><DancePerformanceControlsV311 /><NaturalDanceControlsV320 /><IntelligentFootLockControlsV322 /><GroundContactStudioV487 /><AdvancedFullBodyBalanceControlsV323 /><ConcertAtmosphereControlsV308 /><CameraPresetStudioV290 /></>;
}
