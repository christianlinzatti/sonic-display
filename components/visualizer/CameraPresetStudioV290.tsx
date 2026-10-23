"use client";
import { useEffect, useMemo, useState } from "react";
import { CameraDirectorStudioV299 } from "./CameraDirectorStudioV299";
import { CAMERA_DASHBOARD_NAV_EVENT, type CameraDashboardNavigation } from "./cameraDashboardHelpersV300";
import { avatarModels, type AvatarModel } from "./avatarModels";
import { loadCharacterMotionStore, CHARACTER_MOTION_CHANGE_EVENT, type InstalledCharacterMotion } from "./characterMotionLibrary";
import dynamic from "next/dynamic";
import { sanitizeCameraPose } from "./cameraPresetLibraryV290";
import {cameraPoseAtTime,readCameraKeyframes,writeCameraKeyframes,type CameraKeyframe} from "./cameraKeyframesV295";
import {cinematicCameraPoseAtTime, sampleCinematicCameraPath, readCameraPathSettings,writeCameraPathSettings, DEFAULT_CAMERA_PATH_SETTINGS, type CameraPathSettings} from "./cinematicCameraPathsV305";
import {readSmartCameraTrackingEnabled,writeSmartCameraTrackingEnabled} from "./smartCameraTrackingV297";
import {readLiveCameraKeyframesEnabled,writeLiveCameraKeyframesEnabled} from "./liveCameraKeyframesV296";
import {readSmartCameraComposer,writeSmartCameraComposer,type ComposerSettings} from "./smartCameraComposerV298";
const CameraLivePreviewV291 = dynamic(() => import("./CameraLivePreviewV291").then(m => m.CameraLivePreviewV291), { ssr:false, loading:()=> <p>3D-Kameravorschau lädt …</p> });
import type { StageSection } from "./stageDirectorV287";
import { stageCameraPoseV289, type CameraPose } from "./stageCameraPoseHelpersV289";
import { CAMERA_PRESET_EVENT, CAMERA_SECTIONS, EMPTY_CAMERA_PRESETS, readCameraPresets, writeCameraPresets, type CameraPresetLibrary, type CameraPreset } from "./cameraPresetLibraryV290";

const sectionLabels: Record<StageSection,string> = { verse:"Verse", break:"Break", build:"Build", hook:"Hook", drop:"Drop" };
export function CameraPresetStudioV290() {
  const [library, setLibrary] = useState<CameraPresetLibrary>(EMPTY_CAMERA_PRESETS);
  const [section, setSection] = useState<StageSection>("verse");
  const [selectedId, setSelectedId] = useState("");
  const [newName, setNewName] = useState("");
  const [status, setStatus] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draftPose, setDraftPose] = useState<CameraPose | null>(null);
  const [avatarOptions, setAvatarOptions] = useState<AvatarModel[]>(avatarModels);
  const [avatarId, setAvatarId] = useState("procedural");
  const [avatarWarning, setAvatarWarning] = useState("");
  const [installedMotions, setInstalledMotions] = useState<InstalledCharacterMotion[]>([]);
  const [motionId, setMotionId] = useState("embedded");
  const [motionPlaying, setMotionPlaying] = useState(true);
  const [motionSpeed, setMotionSpeed] = useState(1);
  const [motionTime, setMotionTime] = useState(0);
  const [motionDuration, setMotionDuration] = useState(0);
  const [seek, setSeek] = useState<{seconds:number;revision:number}>();
  const [wasPlayingBeforeScrub, setWasPlayingBeforeScrub] = useState(false);
  useEffect(()=>{
    const navigate=(event:Event)=>{
      const detail=(event as CustomEvent<CameraDashboardNavigation>).detail;
      if(!detail || !["verse","break","build","hook","drop"].includes(detail.section)) return;
      setSection(detail.section);
      if(detail.presetId){
        setSelectedId(detail.presetId);
        setPreviewOpen(true);
      }
      if(typeof detail.seconds === "number" && Number.isFinite(detail.seconds) && detail.seconds>=0){
        setMotionPlaying(false);
        setMotionTime(detail.seconds);
        setSeek(previous=>({seconds:detail.seconds!,revision:(previous?.revision??0)+1}));
      }
    };
    window.addEventListener(CAMERA_DASHBOARD_NAV_EVENT,navigate);
    return ()=>window.removeEventListener(CAMERA_DASHBOARD_NAV_EVENT,navigate);
  },[]);

  const [keyframes, setKeyframes] = useState<CameraKeyframe[]>([]);
  const [previewKeyframes, setPreviewKeyframes] = useState(false);
  const [pathSettings, setPathSettings] = useState<CameraPathSettings>(DEFAULT_CAMERA_PATH_SETTINGS);
  const [showCinematicPath, setShowCinematicPath] = useState(true);
  const [liveKeyframes, setLiveKeyframes] = useState(false);
  const [smartTracking, setSmartTracking] = useState(false);
  const [composer,setComposer] = useState<ComposerSettings>({enabled:false,intensity:55,energyAware:true});
  useEffect(()=>{setComposer(readSmartCameraComposer());},[]);
  const updateComposer=(next:ComposerSettings)=>{setComposer(next);writeSmartCameraComposer(next);};
  useEffect(() => {setSmartTracking(readSmartCameraTrackingEnabled());}, []);
  useEffect(() => { setLiveKeyframes(readLiveCameraKeyframesEnabled()); }, []);
  useEffect(() => {setKeyframes(selectedId ? readCameraKeyframes(selectedId) : []);setPreviewKeyframes(false);
    setPathSettings(selectedId ? readCameraPathSettings(selectedId) : DEFAULT_CAMERA_PATH_SETTINGS);}, [selectedId]);
  const updatePathSettings = (value:CameraPathSettings) => {
    if(!selectedId)return; const next={...value};setPathSettings(next);writeCameraPathSettings(selectedId,next);
  };
  const sampledCinematicPath = useMemo(() => pathSettings.enabled && showCinematicPath
    ? sampleCinematicCameraPath(keyframes,pathSettings,48) : [], [keyframes,pathSettings,showCinematicPath]);
  const updateKeyframes = (frames:CameraKeyframe[]) => {
    if (!selectedId) return;
    writeCameraKeyframes(selectedId, frames);
    setKeyframes(readCameraKeyframes(selectedId));
  };
  const addKeyframe = () => {
    if (!selectedId || !activePose || keyframes.length>=120) return;
    const id=`kf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
    updateKeyframes([...keyframes,{id,time:motionTime,pose:sanitizeCameraPose(activePose)}]);
    setStatus(`Keyframe bei ${motionTime.toFixed(2)} s gespeichert`);
  };
  const seekTo = (seconds:number) => {
    const next = Math.min(Math.max(0, seconds), motionDuration || 0);
    setMotionTime(next);
    setSeek(previous => ({seconds:next,revision:(previous?.revision ?? 0)+1}));
  };
  useEffect(() => {
    if (!previewOpen) return;
    const sync = () => setInstalledMotions(loadCharacterMotionStore().motions);
    sync(); window.addEventListener(CHARACTER_MOTION_CHANGE_EVENT, sync); window.addEventListener("storage", sync);
    return () => { window.removeEventListener(CHARACTER_MOTION_CHANGE_EVENT, sync); window.removeEventListener("storage", sync); };
  }, [previewOpen]);
  useEffect(() => {
    if (!previewOpen) return;
    const controller = new AbortController();
    fetch("/api/avatars", { cache:"no-store", signal:controller.signal })
      .then(response => { if(!response.ok) throw new Error("Avatar-Bibliothek nicht verfügbar"); return response.json(); })
      .then((data: {defaults?: AvatarModel[]; models?: AvatarModel[]})=>{
        const models=[...(Array.isArray(data.defaults)?data.defaults:avatarModels),...(Array.isArray(data.models)?data.models:[])];
        setAvatarOptions(models.filter(m=>m && typeof m.id==="string" && (m.url===null || typeof m.url==="string")));
        setAvatarWarning("");
      }).catch(e=>{if(!controller.signal.aborted)setAvatarWarning("Avatar-Bibliothek nicht erreichbar – Standardmodelle verfügbar.");});
    return ()=>controller.abort();
  },[previewOpen]);
  const previewAvatar = avatarOptions.find(m=>m.id===avatarId) ?? avatarOptions[0];
  const availableMotions = installedMotions.filter(m => m.avatarId === previewAvatar?.id).slice(-40);
  const chosenMotion = availableMotions.find(m => m.id === motionId);
  useEffect(() => { setMotionTime(0); setMotionDuration(0); setSeek(undefined); }, [motionId, avatarId]);
  const motionUrl = chosenMotion?.url ?? (motionId === "model" ? previewAvatar?.animationUrl ?? null : null);
  useEffect(() => { const sync=()=>setLibrary(readCameraPresets()); sync(); window.addEventListener(CAMERA_PRESET_EVENT,sync); return ()=>window.removeEventListener(CAMERA_PRESET_EVENT,sync); },[]);
  const save = (next:CameraPresetLibrary) => { setLibrary(next); writeCameraPresets(next); };
  const selected = library.presets.find(p => p.id===selectedId);
  const activePose = draftPose ?? selected?.pose ?? null;
  const selectPreset = (id:string) => { setSelectedId(id); setDraftPose(null); };
  const updatePose = (field:keyof CameraPose,value:number) => {
    const next = sanitizeCameraPose({...(draftPose ?? selected?.pose),[field]:value});
    if (previewOpen) setDraftPose(next);
    else save({ ...library, presets:library.presets.map(p=>p.id===selectedId?{...p,pose:next}:p) });
  };
  const add = () => {
    if (library.presets.length>=80) {setStatus("Maximal 80 Kamerapresets");return;}
    const id = `cam_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
    const preset:CameraPreset={id,name:newName.trim().slice(0,60)||`${sectionLabels[section]} Kamera`,pose:stageCameraPoseV289(section,0,65,false)};
    save({...library,presets:[...library.presets,preset],assignments:{...library.assignments,[section]:id}});
    selectPreset(id);setNewName("");setStatus("Preset gespeichert und zugeordnet");
  };
  const remove = () => {
    if (!selected) return;
    const assignments={...library.assignments};
    for(const s of CAMERA_SECTIONS) if(assignments[s]===selected.id) delete assignments[s];
    updateKeyframes([]);save({...library,presets:library.presets.filter(p=>p.id!==selected.id),assignments});selectPreset("");setStatus("Preset gelöscht");
  };
  return <fieldset className="camera-preset-studio-v290"><legend>Interactive Camera Director · V290</legend>
    <p>Eigene Kamerapositionen erstellen, feinjustieren und Songabschnitten zuweisen. Ohne Zuordnung bleibt die automatische V289-Kamera aktiv.</p>
    <CameraDirectorStudioV299/>
    <label className="setting-check"><input type="checkbox" checked={composer.enabled} onChange={e=>updateComposer({...composer,enabled:e.target.checked})}/> V298: Smart Camera Composer – musikalische Kameraregie</label>
    <label>Composer-Intensität: {composer.intensity}% <input type="range" min="0" max="100" step="5" value={composer.intensity} onChange={e=>updateComposer({...composer,intensity:Number(e.target.value)})}/></label>
    <label className="setting-check"><input type="checkbox" checked={composer.energyAware} onChange={e=>updateComposer({...composer,energyAware:e.target.checked})}/> Kameraeffekte an Musikenergie anpassen</label>
    <small>V298 verbindet Songabschnitt, Musikenergie, gespeicherte Keyframes und Avatar-Tracking. Eigene Kamerafahrten bleiben die Basis; Tracking korrigiert anschließend den Bildausschnitt. Inaktiv bei Pause oder Reduced Motion.</small>
    <label className="setting-check"><input type="checkbox" checked={smartTracking} onChange={e=>{setSmartTracking(e.target.checked);writeSmartCameraTrackingEnabled(e.target.checked);}}/> V297: Smart Camera Tracking – tanzende Avatare automatisch im Bild halten</label>
    <small>Berücksichtigt die tatsächlichen animierten 3D-Grenzen (Solo/Duo). Die Bildanpassung ist sanft, bei pausierter Wiedergabe oder Reduced Motion inaktiv. Nur mit aktiviertem 3D-Kamera-Director.</small>
    <label className="setting-check"><input type="checkbox" checked={liveKeyframes} onChange={e=>{setLiveKeyframes(e.target.checked);writeLiveCameraKeyframesEnabled(e.target.checked);}}/> V296: Gespeicherte Keyframe-Kamerafahrten live verwenden</label>
    <small>Bei aktivierten eigenen Kamerapresets und echter 3D-Kamera nutzt die Live-Bühne die Keyframes der aktuell zugewiesenen Kamera. Fehlen Keyframes, bleibt die gewohnte Kameraregie aktiv. Die Fahrt läuft synchron zur Songzeit in einer Schleife; manuelle Steuerung und Reduced Motion haben Vorrang.</small>
    <label className="setting-check"><input type="checkbox" checked={library.enabled} onChange={e=>save({...library,enabled:e.target.checked})}/> Eigene Kamerapresets verwenden</label>
    <label>Songabschnitt <select value={section} onChange={e=>setSection(e.target.value as StageSection)}>{CAMERA_SECTIONS.map(s=><option key={s} value={s}>{sectionLabels[s]}</option>)}</select></label>
    <label>Preset für {sectionLabels[section]} <select value={library.assignments[section]??""} onChange={e=>save({...library,assignments:{...library.assignments,[section]:e.target.value||undefined}})}><option value="">Automatische Kamera (V289)</option>{library.presets.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
    <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center"}}><input aria-label="Name für neue Kamera" value={newName} maxLength={60} placeholder="Neue Kamera benennen" onChange={e=>setNewName(e.target.value)}/><button type="button" onClick={add}>Kamera hinzufügen</button></div>
    <label>Position bearbeiten <select value={selectedId} onChange={e=>selectPreset(e.target.value)}><option value="">Preset auswählen</option>{library.presets.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
    {selected && <div style={{display:"grid",gap:8}}>
      <label>Name <input value={selected.name} maxLength={60} onChange={e=>save({...library,presets:library.presets.map(p=>p.id===selected.id?{...p,name:e.target.value}:p)})}/></label>
      {([ ["x","Kamera X",-20,20,.1], ["y","Kamera Y",-12,12,.1], ["z","Kamera Z",-20,20,.1], ["targetX","Blickpunkt X",-12,12,.1], ["targetY","Blickhöhe",-6,8,.1], ["targetZ","Blickpunkt Z",-12,12,.1], ["fov","Sichtfeld (FOV)",18,85,1] ] as const).map(([field,label,min,max,step])=><label key={field}>{label}: {((activePose ?? selected.pose)[field]??0).toFixed(1)}<input type="range" min={min} max={max} step={step} value={(activePose ?? selected.pose)[field]??0} onChange={e=>updatePose(field,Number(e.target.value))}/></label>)}
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button type="button" onClick={()=>setPreviewOpen(v=>!v)} aria-expanded={previewOpen}>{previewOpen?"3D-Vorschau schließen":"3D-Kamera visuell bearbeiten"}</button>
        {draftPose && <button type="button" onClick={()=>{save({...library,presets:library.presets.map(p=>p.id===selected.id?{...p,pose:sanitizeCameraPose(draftPose)}:p)});setDraftPose(null);setStatus("Kameraperspektive übernommen");}}>Perspektive speichern</button>}
        {draftPose && <button type="button" onClick={()=>setDraftPose(null)}>Änderungen verwerfen</button>}
      </div>
      {previewOpen && activePose && <>
        <label>Avatar für Kameravorschau <select value={previewAvatar?.id??""} onChange={e=>{setAvatarId(e.target.value);setMotionId("embedded");}}>
          {avatarOptions.map(model=><option key={model.id} value={model.id}>{model.label}</option>)}
        </select></label>
        {avatarWarning && <small role="status">{avatarWarning}</small>}
        <label>Animation für Kameravorschau <select value={motionId} onChange={e=>setMotionId(e.target.value)}>
          <option value="embedded">Im Avatar enthaltene Animation</option>
          {previewAvatar?.animationUrl && <option value="model">Standard-Motion des Avatars</option>}
          {availableMotions.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
        </select></label>
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <button type="button" onClick={()=>setMotionPlaying(v=>!v)}>{motionPlaying?"Animation pausieren":"Animation abspielen"}</button>
          <label>Tempo {motionSpeed.toFixed(2)}× <input aria-label="Animationsgeschwindigkeit" type="range" min="0.25" max="2" step="0.25" value={motionSpeed} onChange={e=>setMotionSpeed(Number(e.target.value))}/></label>
        </div>
        <div className="camera-motion-timeline-v294" style={{display:"grid",gap:7,padding:12,border:"1px solid #506078",borderRadius:10}}>
          <label htmlFor="camera-motion-scrub-v294">Motion-Timeline · {motionTime.toFixed(2)} s / {motionDuration.toFixed(2)} s</label>
          <input id="camera-motion-scrub-v294" type="range" min={0} max={motionDuration || 1} step="0.01"
            disabled={motionDuration <= 0} value={Math.min(motionTime,motionDuration || 1)}
            onPointerDown={()=>{setWasPlayingBeforeScrub(motionPlaying);setMotionPlaying(false);}}
            onPointerUp={()=>setMotionPlaying(wasPlayingBeforeScrub)}
            onChange={event=>seekTo(Number(event.target.value))}/>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            <button type="button" disabled={motionDuration <= 0} onClick={()=>{setMotionPlaying(false);seekTo(0);}}>Anfang</button>
            <button type="button" disabled={motionDuration <= 0} onClick={()=>{setMotionPlaying(false);seekTo(motionTime - 1/30);}}>−1 Frame</button>
            <button type="button" disabled={motionDuration <= 0} onClick={()=>{setMotionPlaying(false);seekTo(motionTime + 1/30);}}>+1 Frame</button>
            <button type="button" disabled={motionDuration <= 0} onClick={()=>setMotionPlaying(false)}>Pose einfrieren</button>
          </div>
          <small>Timeline zum Vor- und Zurückspulen; Einzelbildschritte mit angenommenen 30 fps. Kamera-Preset über „Perspektive speichern“ sichern.</small>
        </div>
        <section className="camera-keyframe-editor-v295" style={{display:"grid",gap:8,padding:12,border:"1px solid #506078",borderRadius:10}}>
          <strong>Camera Keyframe Editor · V295</strong>
          <p>Kamera einstellen, an der aktuellen Motion-Position einen Keyframe setzen und die Fahrt durch die Timeline ansehen.</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button type="button" disabled={keyframes.length>=120} onClick={addKeyframe}>Keyframe hier setzen</button>
            <label className="setting-check"><input type="checkbox" checked={previewKeyframes} disabled={keyframes.length===0}
              onChange={e=>{setPreviewKeyframes(e.target.checked);if(e.target.checked)setMotionPlaying(false);}}/> Kamerafahrt vorschauen</label>
          </div>
          {keyframes.map(frame=><div key={frame.id} style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <button type="button" onClick={()=>{setMotionPlaying(false);seekTo(frame.time);setPreviewKeyframes(false);setDraftPose(frame.pose);}}>
              {frame.time.toFixed(2)} s · Perspektive laden
            </button>
            <button type="button" onClick={()=>updateKeyframes(keyframes.map(f=>f.id===frame.id?{...f,pose:sanitizeCameraPose(activePose)}:f))}>Pose ersetzen</button>
            <button type="button" onClick={()=>updateKeyframes(keyframes.filter(f=>f.id!==frame.id))} aria-label={`Keyframe ${frame.time.toFixed(2)} löschen`}>Löschen</button>
          </div>)}
          <fieldset style={{display:"grid",gap:9,padding:12,border:"1px solid #7c6985",borderRadius:10}}>
            <legend>Cinematic Camera Paths · V305</legend>
            <label className="setting-check"><input type="checkbox" checked={pathSettings.enabled} disabled={keyframes.length < 2}
              onChange={e=>updatePathSettings({...pathSettings,enabled:e.target.checked})}/> Geschwungene 3D-Kamerafahrt für dieses Preset aktivieren</label>
            <label>Kurvenführung <select value={pathSettings.curve} onChange={e=>updatePathSettings({...pathSettings,curve:e.target.value as CameraPathSettings["curve"]})}>
              <option value="catmull-rom">Catmull–Rom · geschwungene Kurven</option><option value="linear">Gerade Segmente</option>
            </select></label>
            <label>Beschleunigung <select value={pathSettings.easing} onChange={e=>updatePathSettings({...pathSettings,easing:e.target.value as CameraPathSettings["easing"]})}>
              <option value="cinematic">Cinematic · besonders weich</option><option value="ease-in-out">Weiches Ein- und Ausfahren</option><option value="linear">Konstantes Tempo je Segment</option>
            </select></label>
            <label>Abspielgeschwindigkeit: {pathSettings.speed.toFixed(2)}× <input type="range" min="0.25" max="3" step="0.05" value={pathSettings.speed}
              onChange={e=>updatePathSettings({...pathSettings,speed:Number(e.target.value)})}/></label>
            <label>Kurvenspannung: {Math.round(pathSettings.tension*100)} % <input type="range" min="0" max="1" step="0.05" value={pathSettings.tension}
              onChange={e=>updatePathSettings({...pathSettings,tension:Number(e.target.value)})}/></label>
            <label className="setting-check"><input type="checkbox" checked={pathSettings.loop} onChange={e=>updatePathSettings({...pathSettings,loop:e.target.checked})}/> Kamerafahrt wiederholen (Loop)</label>
            <label className="setting-check"><input type="checkbox" checked={showCinematicPath} onChange={e=>setShowCinematicPath(e.target.checked)}/> 3D-Kamerapfad in der Vorschau anzeigen</label>
            <small>Mindestens zwei Keyframes erforderlich. Der Weg folgt geschwungenen 3D-Kurven um den beweglichen Blickpunkt; der Kameraabstand bleibt positiv. Das Tempo bezieht sich auf die Song-/Motion-Zeit. Preset- und Keyframe-Daten bleiben im bisherigen Format erhalten.</small>
          </fieldset>
          <small>{keyframes.length}/120 Keyframes · {pathSettings.enabled ? "V305 Cinematic Path" : "V295 weiche Ease-in-out-Interpolation"} · nur lokal gespeichert. Für die echte Live-Bühne außerdem V296 aktivieren.</small>
        </section>
        <CameraLivePreviewV291 key={previewAvatar?.id ?? "neutral"} pathPoints={sampledCinematicPath}
          pose={(previewKeyframes ? (pathSettings.enabled ? cinematicCameraPoseAtTime(keyframes,motionTime,pathSettings) : cameraPoseAtTime(keyframes,motionTime)) : null) ?? activePose}
          avatarUrl={previewAvatar?.url} avatarLabel={previewAvatar?.label} motionUrl={motionUrl} playing={motionPlaying} speed={motionSpeed} seek={seek}
          onMotionProgress={(seconds,duration)=>{setMotionTime(seconds);setMotionDuration(duration);}}
          onPoseChange={pose=>setDraftPose(sanitizeCameraPose(pose))}/>
      </>}
      <button type="button" onClick={remove}>Preset löschen</button>
    </div>}
    {status&&<small role="status">{status}</small>}
    <small>Presets werden lokal in diesem Browser gespeichert. Aktivieren erfordert Smart Stage Director und „Echte 3D-Kamerafahrten“. Reduced Motion hat Vorrang.</small>
  </fieldset>;
}
