"use client";
import dynamic from "next/dynamic";
import {useMemo,useState} from "react";
import type {Lyrics} from "@/types/music";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import {getAvatarModel} from "./avatarModels";
import {stageCameraPoseV289,type CameraPose} from "./stageCameraPoseHelpersV289";
import {buildRapCameraTimelineV431,timelineLineAtV431} from "./rapCameraTimelineV431";
import {lineRapCameraKeyframesV432,normalizeRapCameraKeyframesV432,normalizeRapCameraPoseV432,
  sampleRapCameraKeyframesV432,saveRapCameraKeyframeV432} from "./rapCameraKeyframesV432";

const CameraLivePreviewV291=dynamic(()=>import("./CameraLivePreviewV291").then(m=>m.CameraLivePreviewV291),
  {ssr:false,loading:()=> <p>3D-Kameravorschau wird geladen …</p>});
const coordinates:[keyof CameraPose,string,number,number,number][]=[
  ["x","Position X",-10,10,.1],["y","Position Y",-5,8,.1],
  ["z","Abstand Z",1.2,12,.1],["targetX","Blickpunkt X",-6,6,.1],
  ["targetY","Blickpunkt Y",-3,5,.1],["targetZ","Blickpunkt Z",-6,6,.1],
  ["fov","Sichtwinkel",20,95,1]];
const time=(ms:number)=>(ms/1000).toFixed(2)+" s";

/** Editing never changes playback or the active R3F camera; only Save commits. */
export function RapCameraKeyframeStudioPanelV432({trackId,lyrics,previewMs,onPreview,avatarCount}:{
  trackId:string;lyrics:Lyrics|null;previewMs:number;onPreview:(ms:number)=>void;avatarCount:number;
}){
  const {preferences,updatePreferences}=useUiPreferences();
  const raw=trackId?(preferences.rapCameraKeyframesV432??{})[trackId]:null;
  const frames=useMemo(()=>normalizeRapCameraKeyframesV432(raw),[raw]);
  const timeline=useMemo(()=>buildRapCameraTimelineV431({trackId,lyrics,
    assignments:trackId?(preferences.rapDuetAssignmentsV416??{})[trackId]:[],
    overrides:trackId?(preferences.rapCameraOverridesV430??{})[trackId]:[],avatarCount,
    autoAssignIfMissing:preferences.rapCameraAutoFixEnabledV436??true}),
    [trackId,lyrics,preferences.rapDuetAssignmentsV416,preferences.rapCameraOverridesV430,avatarCount,preferences.rapCameraAutoFixEnabledV436]);
  const selected=timeline.items[timelineLineAtV431(timeline.items,previewMs)];
  const startMs=selected?.startMs??0;
  const durationMs=Math.min(14000,selected?.durationMs??0);
  const maxOffsetMs=Math.max(0,Math.floor(durationMs)-1);
  const lineIndex=selected?.lineIndex??-1;
  const [offsetMs,setOffsetMs]=useState(()=>Math.max(0,Math.min(maxOffsetMs,Math.round(previewMs-startMs))));
  const [pose,setPose]=useState<CameraPose>(()=>stageCameraPoseV289("verse",previewMs,65,avatarCount>=2));
  const [previewOpen,setPreviewOpen]=useState(false);
  const [dirty,setDirty]=useState(false);
  const [notice,setNotice]=useState("");
  const lineFrames=useMemo(()=>lineRapCameraKeyframesV432(frames,lineIndex),[frames,lineIndex]);
  const interpolated=sampleRapCameraKeyframesV432(frames,lineIndex,offsetMs);
  const model=getAvatarModel(preferences.avatarModelId??"procedural");
  const canEdit=!!trackId&&!!selected&&selected.eligible;
  const choose=(frame:{offsetMs:number;pose:CameraPose})=>{
    setOffsetMs(frame.offsetMs);setPose(normalizeRapCameraPoseV432(frame.pose));
    setDirty(false);setNotice("");onPreview(startMs+frame.offsetMs);
  };
  const update=(key:keyof CameraPose,value:number)=>{
    setPose(current=>normalizeRapCameraPoseV432({...current,[key]:value}));
    setDirty(true);setNotice("");
  };
  const save=()=>{
    if(!canEdit)return;
    updatePreferences({rapCameraKeyframesV432:saveRapCameraKeyframeV432(
      preferences.rapCameraKeyframesV432,trackId,lineIndex,offsetMs,pose)});
    setDirty(false);setNotice("Keyframe lokal gespeichert.");
  };
  const remove=()=>{
    if(!canEdit||!lineFrames.some(frame=>frame.offsetMs===offsetMs))return;
    updatePreferences({rapCameraKeyframesV432:saveRapCameraKeyframeV432(
      preferences.rapCameraKeyframesV432,trackId,lineIndex,offsetMs,null)});
    setDirty(false);setNotice("Keyframe entfernt.");
  };
  return <fieldset aria-label="V432 Interactive Rap Camera Keyframe Studio" style={{marginTop:12,padding:12,
      minWidth:0,border:"1px solid #49758b",borderRadius:10}}>
    <legend>V432 · Interactive Rap Camera Keyframe Studio</legend>
    <p>3D-Kamerapositionen je Lyrics-Zeile setzen und weich ineinander überblenden. {frames.length} Keyframes für diesen Titel.</p>
    <label className="setting-check"><input type="checkbox" checked={preferences.rapCameraKeyframesEnabledV432??false}
      onChange={e=>updatePreferences({rapCameraKeyframesEnabledV432:e.target.checked})}/>
      Eigene Rap-Kamera-Keyframes im Live-Automatikmodus verwenden (optional)</label>
    {!(preferences.rapCameraEnabledV429??false)&&<p>Die V429-Kameraregie ist ausgeschaltet. V432 kann trotzdem offline bearbeitet werden.</p>}
    {!selected?<p>Wähle eine synchronisierte Lyrics-Zeile in der V431-Timeline aus.</p>:<>
      <p>Zeile {lineIndex+1} · {time(startMs)}–{time(selected.endMs)}: <strong>{selected.text||"(Pause)"}</strong></p>
      {!canEdit&&<p>Diese Zeile hat keine gültige V416-Rapper-Zuordnung. Keyframes sind hier nicht aktivierbar.</p>}
      <div aria-label="Keyframe-Marker auf der Lyrics-Zeitachse" style={{display:"flex",gap:8,flexWrap:"wrap",margin:"8px 0"}}>
        {lineFrames.length===0?<small>Noch keine Keyframes in dieser Zeile.</small>:lineFrames.map(frame=><button type="button"
          key={frame.offsetMs} aria-pressed={offsetMs===frame.offsetMs}
          onClick={()=>choose(frame)}>{time(frame.offsetMs)} {offsetMs===frame.offsetMs?"●":"○"}</button>)}
      </div>
      <label>Position in der Zeile: {time(offsetMs)}
        <input aria-label="V432 Position auf der Lyrics-Timeline" type="range" min="0" max={Math.max(1,maxOffsetMs)} step="10"
          value={Math.min(offsetMs,Math.max(1,maxOffsetMs))} onChange={e=>{
            const ms=Number(e.target.value);setOffsetMs(ms);onPreview(startMs+ms);
            setPose(sampleRapCameraKeyframesV432(frames,lineIndex,ms)??pose);setDirty(true);setNotice("");
          }}/>
      </label>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))",gap:10,margin:"8px 0"}}>
        {coordinates.map(([key,label,min,max,step])=><label key={key}>{label}: {(pose[key]??0).toFixed(1)}
          <input type="range" min={min} max={max} step={step} value={pose[key]??0}
            onChange={e=>update(key,Number(e.target.value))}/></label>)}
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"10px 0"}}>
        <button type="button" onClick={()=>{setPose(interpolated??stageCameraPoseV289("verse",previewMs,65,avatarCount>=2));setDirty(true);}}>Interpolierte Position laden</button>
        <button type="button" onClick={save} disabled={!canEdit||!dirty}>Keyframe speichern</button>
        <button type="button" onClick={remove} disabled={!canEdit||!lineFrames.some(f=>f.offsetMs===offsetMs)}>Keyframe löschen</button>
        <button type="button" aria-expanded={previewOpen} onClick={()=>setPreviewOpen(value=>!value)}>{previewOpen?"3D-Vorschau schließen":"Interaktive 3D-Vorschau öffnen"}</button>
      </div>
      {dirty&&<p role="status">Entwurf nicht gespeichert. Die Live-Bühne bleibt unverändert.</p>}
      {notice&&<p role="status">{notice}</p>}
      {previewOpen&&<CameraLivePreviewV291 pose={pose} onPoseChange={next=>{
        setPose(normalizeRapCameraPoseV432(next));setDirty(true);}}
        avatarUrl={model.url} avatarLabel={model.label} playing={false}
        pathPoints={lineFrames.map(frame=>frame.pose)}/>}
      <small>Die isolierte 3D-Vorschau verwendet einen eigenen Kamerabereich und kann per Maus/Touch-Orbit bedient werden.
        Der Live-Modus blendet gespeicherte Positionen kontrolliert auf den V429/V430-Kameraplan und schützt den Lyrics-Bildbereich.
        Manuelle Kamera, bestehende Kamera-Keyframes, weitere Regiemodi und „Reduzierte Bewegung“ haben Vorrang.</small>
    </>}
  </fieldset>;
}
