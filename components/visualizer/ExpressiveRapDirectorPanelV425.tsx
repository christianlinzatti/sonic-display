"use client";
import {useMemo,useState} from "react";
import {useMusic} from "@/context/MusicContext";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import {resolveExpressiveRapCueV425} from "./expressiveRapDirectorV425";
import {RapCameraShotStudioPanelV430} from "./RapCameraShotStudioPanelV430";
import {RapCameraTimelinePanelV431} from "./RapCameraTimelinePanelV431";
import {RapCameraKeyframeStudioPanelV432} from "./RapCameraKeyframeStudioPanelV432";
import {RapCameraTransitionPreviewPanelV434} from "./RapCameraTransitionPreviewPanelV434";
import {AutoRapPerformancePanelV437} from "./AutoRapPerformancePanelV437";
import {AutoMotionIntelligencePanelV438} from "./AutoMotionIntelligencePanelV438";
import {RapCameraAutoFixPanelV436} from "./RapCameraAutoFixPanelV436";
import {buildRapCameraTimelineV431,timelineLineAtV431} from "./rapCameraTimelineV431";
import {planRapCameraV429} from "./cinematicRapCameraV429";
import {cameraSceneAssignmentsV436} from "./autoRapSceneAssignmentsV436";
import {planFeatureCastV440} from "./automaticFeatureShowV440";
import {planMultiArtistCastV442,featureCameraAssignmentsV442} from "./automaticMultiArtistStageV442";
export function ExpressiveRapDirectorPanelV425(){
  const {track,lyrics,progressMs}=useMusic();
  const {preferences,updatePreferences}=useUiPreferences();
  const [previewMs,setPreviewMs]=useState<number|null>(null);
  const id=track?.id??"";
  const assignments=id?(preferences.rapDuetAssignmentsV416??{})[id]??[]:[];
  const featureCastV440=planFeatureCastV440({track,enabled:preferences.rapFeatureAvatarsV440??true,
    mode:preferences.multiAvatarMode??"solo",avatarStage:preferences.visualizerMode==="avatar",
    reducedMotion:preferences.reducedMotion});
  const groupCastV442=planMultiArtistCastV442({artists:featureCastV440.artists,
    enabled:(preferences.rapMultiArtistEnabledV442??true)&&(preferences.rapFeatureAvatarsV440??true),
    maxCount:preferences.rapMultiArtistMaxV442??4,avatarStage:preferences.visualizerMode==="avatar",
    reducedMotion:preferences.reducedMotion,
    manualMode:(preferences.multiAvatarMode??"solo")!=="solo"||
      preferences.avatarMotionMode==="choreography"||!!preferences.avatarTimelineEnabled||
      !!preferences.avatarBlendEnabled||!!preferences.smartDanceOverride||
      (preferences.avatarDancePreset??"auto")!=="auto"});
  const previewArtistCountV442=groupCastV442.enabled?groupCastV442.count:
    preferences.multiAvatarMode==="solo"?(featureCastV440.enabled?2:1):2;
  const cue=useMemo(()=>resolveExpressiveRapCueV425({enabled:true,playing:true,reducedMotion:false,
    lyrics,progressMs:previewMs??progressMs,trackId:id,assignmentTrackId:id,assignments,
    avatarCount:previewArtistCountV442,strength:preferences.rapExpressiveStrengthV425??65}),
    [lyrics,previewMs,progressMs,id,assignments,previewArtistCountV442,preferences.rapExpressiveStrengthV425]);
  const rapCameraCastV436=useMemo(()=>cameraSceneAssignmentsV436({lyrics,
    authored:assignments,avatarCount:previewArtistCountV442,
    autoEnabled:preferences.rapCameraAutoFixEnabledV436??true,
  }),[lyrics,assignments,previewArtistCountV442,preferences.rapCameraAutoFixEnabledV436]);
  const previewCameraAssignmentsV442=useMemo(()=>rapCameraCastV436.inferred&&groupCastV442.enabled?
    featureCameraAssignmentsV442(rapCameraCastV436.assignments,lyrics,groupCastV442.count as 3|4):
    rapCameraCastV436.assignments,
    [rapCameraCastV436,groupCastV442.enabled,groupCastV442.count,lyrics]);
  const rapCameraCue=useMemo(()=>resolveExpressiveRapCueV425({enabled:true,playing:true,reducedMotion:false,
    lyrics,progressMs:previewMs??progressMs,trackId:id,assignmentTrackId:id,assignments:previewCameraAssignmentsV442,
    assignmentSource:rapCameraCastV436.inferred?"auto":"authored",
    avatarCount:previewArtistCountV442,strength:100}),
    [lyrics,previewMs,progressMs,id,previewCameraAssignmentsV442,previewArtistCountV442]);
  const rapCameraPreview=planRapCameraV429({
    enabled:true,playing:true,reducedMotion:false,trackId:id,assignmentTrackId:id,
    progressMs:previewMs??progressMs,strength:preferences.rapCameraStrengthV429??65,cue:rapCameraCue
  });
  const rapCameraTimeline=useMemo(()=>buildRapCameraTimelineV431({trackId:id,lyrics,
    assignments:previewCameraAssignmentsV442,overrides:id?(preferences.rapCameraOverridesV430??{})[id]:[],
    avatarCount:previewArtistCountV442,
    autoAssignIfMissing:preferences.rapCameraAutoFixEnabledV436??true}),
    [id,lyrics,previewCameraAssignmentsV442,previewArtistCountV442,preferences.rapCameraOverridesV430,preferences.multiAvatarMode,
      preferences.rapCameraAutoFixEnabledV436]);
  const selectedLine=timelineLineAtV431(rapCameraTimeline.items,previewMs??progressMs);
  const selectedLineIndex=selectedLine>=0?rapCameraTimeline.items[selectedLine].lineIndex:-1;
  return <fieldset className="v425-expressive-rap" style={{marginTop:12}}>
    <legend>V425 · Expressive Rap Performance Director</legend>
    <label className="setting-check"><input type="checkbox" checked={preferences.rapExpressiveEnabledV425??false}
      onChange={e=>updatePreferences({rapExpressiveEnabledV425:e.target.checked})}/> Ausdrucksregie live aktivieren (optional)</label>
    <label>Intensität ({preferences.rapExpressiveStrengthV425??65} %)
      <input type="range" min="0" max="100" step="5" value={preferences.rapExpressiveStrengthV425??65}
        onChange={e=>updatePreferences({rapExpressiveStrengthV425:Number(e.target.value)})}/></label>
    <label>Vorschauzeit in der Aufnahme: {((previewMs??progressMs)/1000).toFixed(2)} s
      <input type="range" min="0" max={Math.max(1000,track?.durationMs??1000)} step="100"
       value={Math.min(track?.durationMs??1000,previewMs??progressMs)} onChange={e=>setPreviewMs(Number(e.target.value))}/></label>
    <button type="button" onClick={()=>setPreviewMs(null)}>Spotify-Zeit in Vorschau verwenden</button>
    <p>Szene: <strong>{cue.active?cue.scene:"Keine manuell zugeordnete V416-Szene"}</strong></p>
    <p>Gesicht: {Math.round(cue.faceStrength*100)} % · Gesten: {Math.round(cue.gestureStrength*100)} % · Kamera-Impuls (Diagnose): {Math.round(cue.cameraEnergy*100)} %</p>
    <AutoRapPerformancePanelV437 previewMs={previewMs}/>
    <AutoMotionIntelligencePanelV438/>
    <fieldset aria-label="V429 Cinematic Rap Camera Director" style={{padding:12,marginTop:10,border:"1px solid #486683",borderRadius:8}}>
      <legend>V429 · Cinematic Rap Camera Director</legend>
      <label className="setting-check"><input type="checkbox" checked={preferences.rapCameraEnabledV429??false}
        onChange={e=>updatePreferences({rapCameraEnabledV429:e.target.checked})}/>
        Automatische Rap-Kamerafahrten live aktivieren (optional)</label>
      <label>Kamera-Intensität ({preferences.rapCameraStrengthV429??65} %)
        <input type="range" aria-label="V429 Rap Kamera Intensität" min="0" max="100" step="5"
          value={preferences.rapCameraStrengthV429??65}
          onChange={e=>updatePreferences({rapCameraStrengthV429:Number(e.target.value)})}/></label>
      <p>Lokaler Kameraplan: <strong>{rapCameraPreview.active?rapCameraPreview.shot:"Keine V416-Szene aktiv"}</strong>
        {rapCameraPreview.active&&<> · Energie: {Math.round(rapCameraPreview.gain*100)} % · mindestens {rapCameraPreview.holdMs} ms pro Einstellung</>}</p>
      <fieldset aria-label="V433 Smart Rap Camera Transition Director" style={{marginTop:10,padding:10,border:"1px solid #4f667e",borderRadius:8}}>
        <legend>V433 · Smart Rap Camera Transition Director</legend>
        <label className="setting-check"><input type="checkbox" checked={preferences.rapCameraTransitionsEnabledV433??false}
          onChange={e=>updatePreferences({rapCameraTransitionsEnabledV433:e.target.checked})}/>
          Musikalische Rap-Kameraübergänge live aktivieren (optional)</label>
        <label className="setting-check"><input type="checkbox" checked={preferences.rapCameraBeatSyncV433??true}
          onChange={e=>updatePreferences({rapCameraBeatSyncV433:e.target.checked})}/>
          Übergänge auf BPM-Raster oder erkannte Kick-Akzente abstimmen</label>
        <label>Übergangsweichheit ({preferences.rapCameraTransitionSmoothnessV433??55} %)
          <input type="range" min="0" max="100" step="5" aria-label="V433 Kamera Übergangsweichheit"
            value={preferences.rapCameraTransitionSmoothnessV433??55}
            onChange={e=>updatePreferences({rapCameraTransitionSmoothnessV433:Number(e.target.value)})}/></label>
        <small>BPM-Raster ist eine Näherung ohne garantierte Beat-Phase. Ein starker Kick-Akzent kann den Übergang sofort auslösen.
          Wartezeit maximal 160 ms; gespeicherte V432-Keyframes, manuelle Kameras und reduzierte Bewegung haben Vorrang.</small>
      </fieldset>
      <RapCameraAutoFixPanelV436 trackId={id} lyrics={lyrics??null}
        avatarCount={previewArtistCountV442} onPreview={setPreviewMs}/>
      <RapCameraTimelinePanelV431 trackId={id} lyrics={lyrics} previewMs={previewMs??progressMs} liveProgressMs={progressMs} previewLocked={previewMs!==null}
        onPreview={setPreviewMs} avatarCount={previewArtistCountV442}/>
      <RapCameraTransitionPreviewPanelV434 key={`${id}:${selectedLineIndex}`} trackId={id} lyrics={lyrics??null}
        previewMs={previewMs??progressMs} avatarCount={previewArtistCountV442}/>
      <RapCameraKeyframeStudioPanelV432 key={`${id}:${selectedLineIndex}`} trackId={id} lyrics={lyrics??null}
        previewMs={previewMs??progressMs} onPreview={setPreviewMs}
        avatarCount={previewArtistCountV442}/>
      <RapCameraShotStudioPanelV430 key={`${id}:${rapCameraPreview.lineIndex}`} trackId={id}
        lineIndex={rapCameraPreview.lineIndex} plan={rapCameraPreview}
        lyricText={lyrics?.lines?.[rapCameraPreview.lineIndex]?.text??""}/>
      <small>Die Vorschauzeit zeigt ausschließlich den Kameraplan und steuert Spotify oder die Live-Kamera nicht.
        Im Livebetrieb bleibt die Kamera bei manuellen Einstellungen, Kamera-Keyframes, V400-Timelines,
        Duett- und anderen aktiven Kameraregie-Modi unverändert. Reduzierte Bewegung deaktiviert V429.
        Lyrics bekommen einen geschützten Bildbereich; Solo-/Reply-/Duett-/Hook-Szenen werden nur aus gespeicherten V416-Zuordnungen abgeleitet.</small>
    </fieldset>
    <small>V425 und V429 lassen sich unabhängig aktivieren. Der Ausdruck und der Kameraplan basieren auf gespeicherten V416-Szenen, nicht auf Stimm- oder Emotionserkennung.</small>
  </fieldset>;
}
