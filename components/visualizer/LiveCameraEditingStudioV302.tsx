"use client";
import { useEffect, useRef, useState } from "react";
import { CAMERA_ORBIT_GESTURE_EVENT, applyCameraOrbitGesture, normalizeCameraOrbitGesture, publishCameraOrbitActive, type CameraOrbitGesture } from "./cameraOrbitV303";
import { CAMERA_PRESET_EVENT, CAMERA_SECTIONS, readCameraPresets, writeCameraPresets, type CameraPresetLibrary, EMPTY_CAMERA_PRESETS, sanitizeCameraPose } from "./cameraPresetLibraryV290";
import { readCameraKeyframes, writeCameraKeyframes } from "./cameraKeyframesV295";
import { CAMERA_DASHBOARD_NAV_EVENT } from "./cameraDashboardHelpersV300";
import { addLiveCameraPreset, cameraPoseFromLiveStatus, publishLiveCameraEdit, upsertLiveCameraKeyframe } from "./liveCameraEditingV302";
import type { CameraStudioStatus } from "./cameraStudioHelpersV299";
import type { CameraPose } from "./stageCameraPoseHelpersV289";
import type { StageSection } from "./stageDirectorV287";

type Props={status:CameraStudioStatus|null;connected:boolean};
const labels:Record<StageSection,string>={verse:"Verse",break:"Break",build:"Build",hook:"Hook",drop:"Drop"};
const fields: {field:keyof CameraPose;label:string;min:number;max:number;step:number}[]=[
  {field:"x",label:"Kameraposition X",min:-20,max:20,step:.1},
  {field:"y",label:"Kameraposition Y",min:-12,max:12,step:.1},
  {field:"z",label:"Kameraposition Z (auch hinter der Bühne)",min:-20,max:20,step:.1},
  {field:"targetX",label:"Blickpunkt X / Pan",min:-12,max:12,step:.1},
  {field:"targetY",label:"Blickhöhe / Pan",min:-6,max:8,step:.1},
  {field:"targetZ",label:"Blickpunkt Z / Pan",min:-12,max:12,step:.1},
  {field:"fov",label:"Sichtfeld (FOV)",min:18,max:85,step:1},
];
export function LiveCameraEditingStudioV302({status,connected}:Props) {
  const [editing,setEditing]=useState(false);
  const [draft,setDraft]=useState<CameraPose|null>(null);
  const draftRef=useRef<CameraPose|null>(null);
  const editStartPose=useRef<CameraPose|null>(null);
  const editingRef=useRef(false);
  const [library,setLibrary]=useState<CameraPresetLibrary>(EMPTY_CAMERA_PRESETS);
  const [section,setSection]=useState<StageSection>("verse");
  const [presetName,setPresetName]=useState("Live-Kamera");
  const [targetPreset,setTargetPreset]=useState("");
  const [seconds,setSeconds]=useState(0);
  const [message,setMessage]=useState("");
  useEffect(()=>{
    const sync=()=>setLibrary(readCameraPresets());
    sync();window.addEventListener(CAMERA_PRESET_EVENT,sync);
    return ()=>window.removeEventListener(CAMERA_PRESET_EVENT,sync);
  },[]);
  useEffect(()=>{if(status && !editing)setSection(status.section);},[status?.section,editing]);
  useEffect(()=>{
    if (!library.presets.some(p=>p.id===targetPreset)) setTargetPreset(library.assignments[section]??library.presets[0]?.id??"");
  },[library,section,targetPreset]);
  // The orbit overlay updates exactly the same draft used by sliders, presets and keyframes.
  useEffect(()=>{
    const onOrbit=(event:Event)=>{
      if(!editingRef.current || !draftRef.current)return;
      const gesture=normalizeCameraOrbitGesture((event as CustomEvent<unknown>).detail);
      if(!gesture)return;
      const next=gesture.kind==="reset"?editStartPose.current:applyCameraOrbitGesture(draftRef.current,gesture);
      if(!next)return;
      draftRef.current=next;setDraft(next);publishLiveCameraEdit({kind:"pose",pose:next});
    };
    window.addEventListener(CAMERA_ORBIT_GESTURE_EVENT,onOrbit);
    return ()=>window.removeEventListener(CAMERA_ORBIT_GESTURE_EVENT,onOrbit);
  },[]);
  // A collapsed/unmounted panel MUST release control back to the running director.
  useEffect(()=>()=>{editingRef.current=false;draftRef.current=null;publishCameraOrbitActive(false);publishLiveCameraEdit({kind:"stop"});},[]);
  useEffect(()=>{
    if(!connected && editing){editingRef.current=false;draftRef.current=null;publishCameraOrbitActive(false);publishLiveCameraEdit({kind:"stop"});setEditing(false);setDraft(null);setMessage("Live-Verbindung unterbrochen – Regie wieder freigegeben.");}
  },[connected,editing]);
  const start=()=>{
    if(!connected || !status)return;
    const pose=cameraPoseFromLiveStatus(status);
    draftRef.current=pose;editStartPose.current=pose;editingRef.current=true;
    setDraft(pose);setEditing(true);publishCameraOrbitActive(true);setMessage("");setSection(status.section);
    const assigned=readCameraPresets().assignments[status.section];
    if(assigned)setTargetPreset(assigned);
    const frames=assigned?readCameraKeyframes(assigned):[];
    const duration=frames.at(-1)?.time??0;
    setSeconds(duration>0?Math.round(((status.progressMs/1000)%duration)*100)/100:0);
    publishLiveCameraEdit({kind:"pose",pose});
  };
  const stop=()=>{
    editingRef.current=false;draftRef.current=null;editStartPose.current=null;publishCameraOrbitActive(false);
    publishLiveCameraEdit({kind:"stop"});setEditing(false);setDraft(null);setMessage("Automatische bzw. manuell gewählte Regie wieder aktiv.");
  };
  const change=(update:Partial<CameraPose>)=>{
    if (!editing || !draft)return;
    const next=sanitizeCameraPose({...draft,...update});
    draftRef.current=next;setDraft(next);publishLiveCameraEdit({kind:"pose",pose:next});
  };
  const savePreset=()=>{
    if(!draft)return;
    const old=readCameraPresets();
    const id=`live_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`;
    const next=addLiveCameraPreset(old,id,presetName,draft,section);
    if(!next){setMessage("Kein freier Preset-Platz (max. 80) oder ungültiger Name.");return;}
    writeCameraPresets(next);
    if(!readCameraPresets().presets.some(p=>p.id===id)){setMessage("Preset konnte nicht gespeichert werden (Browser-Speicher).");return;}
    setLibrary(next);setTargetPreset(id);
    setMessage(`Preset „${next.presets.find(p=>p.id===id)?.name}“ gespeichert und ${labels[section]} zugeordnet.`);
  };
  const saveKeyframe=()=>{
    if(!draft||!targetPreset)return;
    const old=readCameraKeyframes(targetPreset);
    const id=`livekf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
    const next=upsertLiveCameraKeyframe(old,id,seconds,draft);
    if(!next){setMessage("Keyframe nicht gespeichert: max. 120 oder Zeit außerhalb 0–3600 s.");return;}
    writeCameraKeyframes(targetPreset,next);
    if(!readCameraKeyframes(targetPreset).some(f=>Math.abs(f.time-seconds)<.025)){
      setMessage("Keyframe konnte nicht gespeichert werden (Browser-Speicher).");return;
    }
    setMessage(`Keyframe bei ${seconds.toFixed(2)} s für „${library.presets.find(p=>p.id===targetPreset)?.name??"Preset"}“ gespeichert.`);
  };
  return <section className="live-camera-editor-v302" aria-label="V302 Live Camera Editing Studio">
    <header className="live-camera-editor-heading-v302"><strong>V304 · Advanced Camera Orbit & Pan Studio</strong><span>{editing?"● Kamera wird live bearbeitet":connected?"● Bühne verbunden":"○ Bühne nicht verbunden"}</span></header>
    <p>Stelle die <strong>echte Bühnenkamera</strong> am laufenden Avatar ein. Änderungen bleiben zunächst temporär und können anschließend als Preset oder Keyframe gespeichert werden.</p>
    {!editing?<button type="button" disabled={!connected||!status} onClick={start}>Aktuelle Kamera live bearbeiten</button>:
      <div className="live-camera-editor-controls-v302">
        <div className="live-camera-orbit-toolbar-v303"><strong>V304 · 360° Orbit und freier Pan</strong>
          <span>Im Bühnenbild ziehen: 360° drehen. Shift-Ziehen / Rechtsziehen: Bühne verschieben. Zwei Finger: gleichzeitig Pan und Pinch-Zoom. Shift+Pfeiltasten: Pan.</span>
          <button type="button" onClick={()=>window.dispatchEvent(new CustomEvent(CAMERA_ORBIT_GESTURE_EVENT,{detail:{kind:"reset"} satisfies CameraOrbitGesture}))}>Ausgangsperspektive wiederherstellen</button>
        </div>
        <div className="live-camera-editor-fields-v302">
          {fields.map(({field,label,min,max,step})=><label key={field}>{label}: <output>{(draft?.[field]??0).toFixed(field==="fov"?0:2)}</output>
            <input type="range" min={min} max={max} step={step} value={draft?.[field]??0} onChange={e=>change({[field]:Number(e.target.value)})}/>
          </label>)}
        </div>
        <div className="live-camera-editor-nudge-v302" role="group" aria-label="Kameraposition schrittweise verändern">
          <button type="button" onClick={()=>change({x:(draft?.x??0)-.2})}>← Links</button>
          <button type="button" onClick={()=>change({x:(draft?.x??0)+.2})}>Rechts →</button>
          <button type="button" onClick={()=>change({y:(draft?.y??0)+.2})}>↑ Höher</button>
          <button type="button" onClick={()=>change({y:(draft?.y??0)-.2})}>↓ Tiefer</button>
          <button type="button" onClick={()=>{if(draft)change(applyCameraOrbitGesture(draft,{kind:"zoom",factor:.95}));}}>Näher</button>
          <button type="button" onClick={()=>{if(draft)change(applyCameraOrbitGesture(draft,{kind:"zoom",factor:1.05}));}}>Weiter</button>
          <button type="button" onClick={()=>{if(draft)change(applyCameraOrbitGesture(draft,{kind:"pan",deltaX:40,deltaY:0}));}}>Blickpunkt ←</button>
          <button type="button" onClick={()=>{if(draft)change(applyCameraOrbitGesture(draft,{kind:"pan",deltaX:-40,deltaY:0}));}}>Blickpunkt →</button>
        </div>
        <fieldset className="live-camera-editor-save-v302"><legend>Als neues Preset speichern</legend>
          <label>Name <input value={presetName} maxLength={60} onChange={e=>setPresetName(e.target.value)}/></label>
          <label>Songphase <select value={section} onChange={e=>{const next=e.target.value as StageSection;setSection(next);setTargetPreset(library.assignments[next]??library.presets[0]?.id??"");}}>{CAMERA_SECTIONS.map(s=><option key={s} value={s}>{labels[s]}</option>)}</select></label>
          <button type="button" onClick={savePreset} disabled={!draft||library.presets.length>=80}>Neues Kamera-Preset speichern und zuordnen</button>
        </fieldset>
        <fieldset className="live-camera-editor-save-v302"><legend>Als Keyframe speichern</legend>
          <label>Ziel-Preset <select value={targetPreset} onChange={e=>setTargetPreset(e.target.value)}><option value="">Preset wählen</option>{library.presets.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          <label>Position innerhalb der Kamerafahrt (Sekunden) <input type="number" min="0" max="3600" step="0.01" value={seconds} onChange={e=>setSeconds(Number(e.target.value))}/></label>
          <button type="button" onClick={saveKeyframe} disabled={!draft||!targetPreset||!Number.isFinite(seconds)||seconds<0||seconds>3600}>Keyframe bei dieser Zeit speichern</button>
          <small>Die Keyframe-Zeit gehört zur Kamerafahrt, nicht zur absoluten Songzeit. Live-Wiedergabe erfordert aktivierte eigene Presets und V296-Live-Keyframes.</small>
        </fieldset>
        <div className="live-camera-editor-actions-v302"><button type="button" onClick={stop}>Live-Bearbeitung beenden · Regie zurückgeben</button>
          <button type="button" onClick={()=>{if(targetPreset)window.dispatchEvent(new CustomEvent(CAMERA_DASHBOARD_NAV_EVENT,{detail:{section,presetId:targetPreset,seconds}}));}}>Preset im Editor öffnen</button></div>
        <small>Während der Bearbeitung sind Composer, Keyframes, manuelle Modi und Avatar-Tracking vorübergehend pausiert. Gespeicherte Einstellungen bleiben unverändert. Das Live-Bild zeigt die bereits laufende Bühne, kein zweites Canvas.</small>
      </div>}
    {message&&<p role="status" className="live-camera-editor-message-v302">{message}</p>}
    {!connected&&<small>Öffne die laufende Three.js-Bühne und aktiviere Smart Stage Director sowie echte 3D-Kamerafahrten.</small>}
  </section>;
}
