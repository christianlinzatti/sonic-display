"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import type {AnimationClip,Group} from "three";
import {aggregateMotionQuality,analyzeGLBMotionClips,type ClipQualityReport} from "./glbMotionQualityAnalyzer";
import {inspectMotionQualityV321,polishMotionClipV321,transitionQualityV321,DEFAULT_MOTION_QUALITY_V321,
 MOTION_QUALITY_EVENT_V321,readMotionQualityV321,refreshMotionQualityV321,writeMotionQualityV321,
 type MotionQualitySettingsV321} from "./advancedMotionQualityV321";
import type {InstalledCharacterMotion} from "./characterMotionLibrary";
import {MotionQualityPreviewV321} from "./MotionQualityPreviewV321";
import {inspectAdvancedMotionV534,type AdvancedMotionReportV534} from "./motionQualitySamplerV534";
import {VisualDanceReviewPanelV589} from "./VisualDanceReviewPanelV589";
import {LongSongReviewPanelV589} from "./LongSongReviewPanelV589";

type Result={url:string;reports:ClipQualityReport[];clips:AnimationClip[];scene:Group};
export function MotionQualityOptimizerDashboard({avatarId,motions,modelUrl}:{avatarId:string;motions:InstalledCharacterMotion[];modelUrl?:string}){
 const [motionId,setMotionId]=useState("");const [result,setResult]=useState<Result|null>(null);
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");const request=useRef(0);
 const [settings,setSettings]=useState<MotionQualitySettingsV321>(DEFAULT_MOTION_QUALITY_V321);
 const [visualReportV589,setVisualReportV589]=useState<AdvancedMotionReportV534|null>(null);
 const [visualBusyV589,setVisualBusyV589]=useState(false);
 const [index,setIndex]=useState(0),[second,setSecond]=useState(-1),[seconds,setSeconds]=useState(0),[playing,setPlaying]=useState(false),[show3D,setShow3D]=useState(false);
 const current=motions.find(m=>m.id===motionId)??motions[0];
 useEffect(()=>{request.current++;setResult(null);setError("");setBusy(false);setMotionId("");setShow3D(false);setPlaying(false);setVisualBusyV589(false);setVisualReportV589(null);},[avatarId]);
 useEffect(()=>()=>{request.current++;},[]);
 useEffect(()=>{const sync=()=>setSettings(refreshMotionQualityV321());sync();window.addEventListener(MOTION_QUALITY_EVENT_V321,sync);window.addEventListener('storage',sync);
  return()=>{window.removeEventListener(MOTION_QUALITY_EVENT_V321,sync);window.removeEventListener('storage',sync);};},[]);
 const report=result?.url===current?.url?result.reports:null;
 const clips=result?.url===current?.url?result.clips:[];
 const selected=clips[index],duration=Math.max(.01,Number.isFinite(selected?.duration)?selected.duration:1);
 const details=useMemo(()=>selected?inspectMotionQualityV321(selected):[],[selected]);
 const proposed=useMemo(()=>selected?polishMotionClipV321(selected,{...settings,enabled:true}):null,[selected,settings]);
 const after=useMemo(()=>proposed?inspectMotionQualityV321(proposed):[],[proposed]);
 const issueCount=details.filter(e=>e.autoFixable).length;
 const remaining=after.filter(e=>e.autoFixable).length;
 const transition=useMemo(()=>selected&&second>=0&&clips[second]&&second!==index?transitionQualityV321(selected,clips[second]):null,[selected,clips,second,index]);
 const summary=useMemo(()=>aggregateMotionQuality(report??[]),[report]);
 const update=(diff:Partial<MotionQualitySettingsV321>)=>{const next={...settings,...diff};setSettings(next);writeMotionQualityV321(next);};
 useEffect(()=>{if(!playing||!selected)return;const interval=window.setInterval(()=>setSeconds(t=>(t+0.05)%duration),50);return()=>window.clearInterval(interval);},[playing,selected,duration]);
 function inspect(){if(!current)return;const req=++request.current;setBusy(true);setError("");setResult(null);setPlaying(false);setShow3D(false);
  setVisualReportV589(null);setVisualBusyV589(false);
  new GLTFLoader().load(current.url,gltf=>{if(req!==request.current)return;
    setResult({url:current.url,reports:analyzeGLBMotionClips(gltf.animations),clips:gltf.animations,scene:gltf.scene});
    setIndex(0);setSecond(-1);setSeconds(0);setBusy(false);
  },undefined,e=>{if(req!==request.current)return;setError(e instanceof Error?e.message:"GLB konnte nicht geladen werden.");setBusy(false);});
 }
 return <section className="avatar-metadata-editor" aria-label="Advanced Motion Quality Studio V321">
  <h3>V321 · Advanced Motion Quality Studio</h3>
  <p>Analysiert importierte GLB-Keyframes auf harte Rotationssprünge, auffällige Translationen und mögliche Fußbewegungen am Boden. Die Ergebnisse sind Heuristiken; echte Fußkontakte benötigen eine 3D-/IK-Prüfung.</p>
  <label>GLB-Motion<select value={current?.id??""} onChange={e=>{request.current++;setMotionId(e.target.value);setResult(null);setBusy(false);setError("");setPlaying(false);setShow3D(false);setVisualReportV589(null);setVisualBusyV589(false);}}>
  {motions.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
  <button type="button" disabled={!current||busy} onClick={inspect}>{busy?"Analysiere …":"GLB-Motion prüfen"}</button>
  {error&&<p role="alert">Analyse fehlgeschlagen: {error}</p>}
  {report&&<>
    <p role="status"><strong>Diagnose-Indikator: {summary.score}/100</strong> · {summary.clips} Clips · {summary.warnings} Warnungen · {summary.hints} Hinweise</p>
    {clips.length===0?<p>Keine Animationsclips in dieser GLB-Datei vorhanden.</p>:<>
      <label>Animationsclip<select value={index} onChange={e=>{request.current++;setIndex(Number(e.target.value));setSeconds(0);setPlaying(false);setVisualBusyV589(false);setVisualReportV589(null);}}>
        {clips.map((c,i)=><option key={i} value={i}>{c.name||`Clip ${i+1}`} ({c.duration.toFixed(2)} s)</option>)}
      </select></label>
      <p><strong>Keyframe-Diagnose:</strong> {details.length} Ereignisse · {issueCount} isolierte Rotations-Ausreißer mit vorsichtiger automatischer Glättungsoption</p>
      <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>update({enabled:e.target.checked})}/> Geglättete Kopien auch auf der Live-Bühne verwenden (optional)</label>
      <label>Glättungsstärke: {settings.strength} %<input type="range" min="0" max="100" step="5" value={settings.strength} onChange={e=>update({strength:Number(e.target.value)})}/></label>
      <label className="setting-check"><input type="checkbox" checked={settings.protectAuthored} onChange={e=>update({protectAuthored:e.target.checked})}/> Eingebettete Originalanimationen unverändert lassen (empfohlen)</label>
      <button type="button" onClick={()=>update(DEFAULT_MOTION_QUALITY_V321)}>V321-Glättung ausschalten / zurücksetzen</button>
      <p>Vorher: {issueCount} isolierte Ausreißer · nach der vorgeschlagenen Glättung: {remaining}. Bei Teilglättung können Restwarnungen bleiben.</p>
      {clips.length>1&&<label>Optionalen Anschlussclip prüfen<select value={second} onChange={e=>{request.current++;setSecond(Number(e.target.value));setVisualBusyV589(false);setVisualReportV589(null);}}>
        <option value={-1}>Kein Übergang</option>{clips.map((c,i)=><option value={i} key={i} disabled={i===index}>{c.name||`Clip ${i+1}`}</option>)}
      </select></label>}
      {transition&&<p><strong>Übergangs-Hinweis:</strong> {transition.matchedJoints} vergleichbare Gelenke · mittlerer Winkel {transition.angleRad===null?'nicht verfügbar':(transition.angleRad*180/Math.PI).toFixed(0)+'°'} · vorgeschlagene Überblendung {transition.recommendFadeSeconds.toFixed(2)} s. {transition.note}</p>}
      {details.length===0?<p>In den begrenzt geprüften Kanälen keine auffälligen Bewegungen erkannt.</p>:
      <div style={{maxHeight:220,overflowY:'auto'}}><ul>{details.slice(0,35).map((event,i)=><li key={`${event.track}-${event.atSeconds}-${i}`}>
        <button type="button" onClick={()=>{setSeconds(Math.max(0,Math.min(duration,event.atSeconds)));setPlaying(false);}} title="Zur Auffälligkeit springen">{event.atSeconds.toFixed(2)} s</button> · {event.track}: {event.detail} {event.autoFixable?'(glättbar)':'(nur Hinweis)'}
      </li>)}</ul></div>}
      <div className="avatar-metadata-editor" aria-label="V589 installierte GLB Qualitaetspruefung">
        <h4>V589 · Original-GLB-Qualitätsprüfung</h4>
        <button type="button" disabled={visualBusyV589||busy} onClick={async()=>{
          if(!current||!selected)return;
          const req=++request.current;setVisualBusyV589(true);setError('');setVisualReportV589(null);
          try {const detail=await inspectAdvancedMotionV534(current.url,index,second>=0?second:undefined,'separate-motion-glb');
            if(request.current===req){setVisualReportV589(detail);setShow3D(true);}}
          catch(err){if(request.current===req)setError(err instanceof Error?err.message:'GLB-Qualitätsprüfung fehlgeschlagen');}
          finally{if(request.current===req)setVisualBusyV589(false);}
        }}>{visualBusyV589?'Echte GLB-Posen werden geprüft…':'Original-GLB-Pose und Fußrutschen prüfen'}</button>
        {visualReportV589&&<VisualDanceReviewPanelV589 key={`${current?.url}:${index}:${second}`} report={visualReportV589}
          sourceLabel={current?.name??'Installierte Motion-GLB'} durationSeconds={duration} hasFollowingClip={second>=0}
          onSeek={time=>{setSeconds(time);setPlaying(false);setShow3D(true);}}/>}
        <LongSongReviewPanelV589 clips={clips} canPreview={Boolean(modelUrl)} onSelect={n=>{request.current++;setIndex(n);setSeconds(0);setPlaying(false);setShow3D(true);setVisualBusyV589(false);setVisualReportV589(null);}}/>
      </div>
      {modelUrl&&<><button type="button" onClick={()=>{setShow3D(v=>!v);setPlaying(false);}}>{show3D?'3D-Vergleich schließen':'Original und Glättung in 3D vergleichen'}</button>
      {show3D&&<div style={{marginTop:10}}>
        <label>Zeit {seconds.toFixed(2)} / {duration.toFixed(2)} s<input type="range" min="0" max={duration} step="0.01" value={Math.min(seconds,duration)} onChange={e=>{setSeconds(Number(e.target.value));setPlaying(false);}}/></label>
        <button type="button" onClick={()=>setPlaying(v=>!v)}>{playing?'Pause':'Wiedergabe'}</button> <button type="button" onClick={()=>{setSeconds(0);setPlaying(false);}}>Anfang</button>
        <MotionQualityPreviewV321 modelUrl={modelUrl} sourceScene={result!.scene} sourceClips={clips} index={index} settings={settings} seconds={seconds}/>
      </div>}</>}
    </>}
  </>}
  <small>Die V321-Glättung verändert ausschließlich isolierte Quaternion-Ausreißer auf Clip-Kopien. Root Motion, Fuß-Translationskurven, Original-GLBs, Kontaktlogik und IK bleiben unangetastet. Fuß-Sliding ist nur ein Prüfhinweis, keine automatisch korrigierte Bodenbewegung.</small>
 </section>;
}
