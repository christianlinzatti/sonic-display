"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import {useMusic} from "@/context/MusicContext";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import {readGroupV326,canRunGroupV326,GROUP_EVENT_V326} from "./multiAvatarStageDirectorV326";
import {loadRapGestureDocumentV414,RAP_GESTURES_CHANGE_V414,type RapGestureDocumentV414,type RapGestureSampleV414} from "./rapGestureCuesV414";
import type {RapPreviewMotionV410} from "./rapMotionPreviewV410";
import {buildRapTimingTimelineV418,normalizeRapTimingOffsetsV418,sampleRapTimingV418,type RapTimingLaneV418} from "./rapPerformanceQualityV418";
const lanes:ReadonlyArray<{id:RapTimingLaneV418;label:string;color:string}>=[
 {id:"lyrics",label:"Lyrics-Quelle",color:"#79d8f7"},{id:"mouth",label:"Mund (geschätzt)",color:"#c69bff"},
 {id:"gesture",label:"Gespeicherte Gesten",color:"#f3bf67"},{id:"roles",label:"Rapper-Rollen",color:"#8be0aa"},
];
const format=(ms:number)=>`${Math.floor(Math.max(0,ms)/60000)}:${String(Math.floor(Math.max(0,ms)%60000/1000)).padStart(2,"0")}.${String(Math.floor(Math.max(0,ms)%1000/10)).padStart(2,"0")}`;
const clamp=(v:number,min:number,max:number)=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):min;
export function RapPerformanceQualityInspectorV418({avatarId,motions,onPreviewGesture,onPreviewMouth}:{
 avatarId:string;motions:ReadonlyArray<RapPreviewMotionV410>;
 onPreviewGesture:(cue:RapGestureSampleV414)=>void;onPreviewMouth:(jaw:number|null)=>void;
}){
 const {track,lyrics,progressMs}=useMusic();const {preferences,updatePreferences}=useUiPreferences();
 const [open,setOpen]=useState(false),[follow,setFollow]=useState(false),[cursor,setCursor]=useState(0);
 const [doc,setDoc]=useState<RapGestureDocumentV414|null>(null);
 const [group,setGroup]=useState(readGroupV326);
 useEffect(()=>{const update=()=>setGroup(readGroupV326());window.addEventListener(GROUP_EVENT_V326,update);
  return ()=>window.removeEventListener(GROUP_EVENT_V326,update);},[]);
 const id=track?.id??"";const offsets=normalizeRapTimingOffsetsV418(preferences.rapTimingOffsetsV418);
 const count=canRunGroupV326(group,id)?group.count:preferences.multiAvatarMode==="solo"?1:2;
 const assignments=useMemo(()=>id?(preferences.rapDuetAssignmentsV416??{})[id]??[]:[],[id,preferences.rapDuetAssignmentsV416]);
 const allowedIds=useMemo(()=>preferences.rapLivePresetV412?.avatarId===avatarId?
   preferences.rapLivePresetV412.items.map(i=>i.motionId):[],[preferences.rapLivePresetV412,avatarId]);
 useEffect(()=>{
  const refresh=()=>setDoc(id&&avatarId?loadRapGestureDocumentV414(id,avatarId):null);
  refresh();window.addEventListener("storage",refresh);window.addEventListener(RAP_GESTURES_CHANGE_V414,refresh);
  return ()=>{window.removeEventListener("storage",refresh);window.removeEventListener(RAP_GESTURES_CHANGE_V414,refresh);};
 },[id,avatarId]);
 useEffect(()=>{setCursor(0);setFollow(false);onPreviewMouth(null);},[id,avatarId,onPreviewMouth]);
 useEffect(()=>()=>onPreviewMouth(null),[onPreviewMouth]);
 const rawTime=follow?progressMs:cursor;
 const lastLineEnd=lyrics?.lines?.length?lyrics.lines[lyrics.lines.length-1]?.endMs:undefined;
 const duration=Math.max(1000,track?.durationMs??lastLineEnd??1000);
 const time=clamp(rawTime,0,duration);
 const start=Math.max(0,time-5000),end=Math.min(duration,Math.max(time+5000,start+3000));
 const data=useMemo(()=>buildRapTimingTimelineV418({lyrics,doc,trackId:id,avatarId,assignments,count,
   offsets,startMs:start,endMs:end}),[lyrics,doc,id,avatarId,assignments,count,offsets.mouthMs,offsets.gestureMs,offsets.roleMs,start,end]);
 const active=useMemo(()=>sampleRapTimingV418({lyrics,doc,trackId:id,avatarId,assignments,count,
   ms:time,offsets,allowedMotionIds:allowedIds,reducedMotion:preferences.reducedMotion}),
   [lyrics,doc,id,avatarId,assignments,count,time,offsets.mouthMs,offsets.gestureMs,offsets.roleMs,allowedIds,preferences.reducedMotion]);
 const sampleAt=useCallback((ms:number)=>{
  const sampled=sampleRapTimingV418({lyrics,doc,trackId:id,avatarId,assignments,count,
   ms,offsets,allowedMotionIds:allowedIds,reducedMotion:preferences.reducedMotion});
  onPreviewGesture(sampled.gesture);onPreviewMouth(sampled.mouthPreview);
 },[lyrics,doc,id,avatarId,assignments,count,offsets.mouthMs,offsets.gestureMs,offsets.roleMs,allowedIds,preferences.reducedMotion,onPreviewGesture,onPreviewMouth]);
 useEffect(()=>{if(open&&follow)sampleAt(progressMs);},[open,follow,progressMs,sampleAt]);
 const scrub=(ms:number)=>{const next=clamp(ms,0,duration);setFollow(false);setCursor(next);sampleAt(next);};
 const patch=(key:"mouthMs"|"gestureMs"|"roleMs",value:number)=>{
  const next=normalizeRapTimingOffsetsV418({...offsets,[key]:value});
  updatePreferences({rapTimingOffsetsV418:next});
  // Re-sample the preview on subsequent state update, never seek the Spotify player.
 };
 useEffect(()=>{if(open&&!follow)sampleAt(cursor);},[open,follow,cursor,offsets.mouthMs,offsets.gestureMs,offsets.roleMs,sampleAt]);
 const valid=Boolean(id&&lyrics?.synced&&lyrics.lines.some(l=>Number.isFinite(l.startMs)&&l.text.trim()));
 const hasWords=!!lyrics?.lines.some(l=>l.words?.some(w=>Number.isFinite(w.startMs)));
 const hasRealPreview=!!avatarId&&avatarId!=="procedural";
 return <fieldset aria-label="V418 Rap Performance Quality Inspector" style={{marginTop:14,border:"1px solid #52637b",borderRadius:10,padding:12,display:"grid",gap:10}}>
  <legend>V418 · Rap Performance Quality Inspector</legend>
  <button type="button" aria-expanded={open} onClick={()=>{setOpen(v=>!v);if(open){onPreviewMouth(null);onPreviewGesture({head:1,arms:1,motionId:"",motionBlend:0,motionSec:0,active:false});}}}>
   {open?"▾ Timing-Analyse schließen":"▸ Timing-Analyse und 3D-Vorschau öffnen"}
  </button>
  {open&&<>
   <small>Die Zeitachse vergleicht <strong>gelieferte Lyrics-Zeitstempel</strong> mit <strong>berechneten Steuer-Cues</strong>. Sie misst weder Audio-Phoneme noch die tatsächliche Renderlatenz oder den Zustand der GLB-Morph-Targets.</small>
   {!valid?<p role="status">Aktuell keine synchronisierten Lyrics verfügbar. Bitte einen Track mit Zeitstempeln abspielen.</p>:<>
    <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
     <label className="setting-check"><input type="checkbox" checked={follow} onChange={e=>{setFollow(e.target.checked);sampleAt(e.target.checked?progressMs:cursor);}}/> Live-Zeit folgen</label>
     <strong>{format(time)} / {format(duration)}</strong>
     <span>{active.word?`Lyrics-Wort: ${active.word}`:hasWords?"Wortpause / kein aktives Wort":"Nur Zeilen-Timing"}</span>
    </div>
    <input type="range" aria-label="V418 Wiedergabezeit-Vorschau" min={0} max={duration} step={20} value={clamp(time,0,duration)} onChange={e=>scrub(Number(e.target.value))} style={{width:"100%"}}/>
    <div role="group" aria-label="Grafische Zeitachse für Lyrics und Animationen" style={{display:"grid",gap:7,padding:10,border:"1px solid #3e4c66",borderRadius:8}}>
     <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}><span>{format(start)}</span><span>Fenster ±5 s · Playhead {format(time)}</span><span>{format(end)}</span></div>
     {lanes.map(lane=><div key={lane.id} style={{display:"grid",gridTemplateColumns:"125px 1fr",gap:7,alignItems:"center"}}>
      <span style={{fontSize:12}}>{lane.label}</span>
      <div style={{height:28,position:"relative",background:"#192439",borderRadius:5,overflow:"hidden"}}>
       {data.filter(d=>d.lane===lane.id).map(item=>{
        const left=100*clamp((item.startMs-start)/(end-start),0,1);
        const right=100*clamp((item.endMs-start)/(end-start),0,1);
        return <button type="button" key={item.id} title={`${item.label} · ${format(item.startMs)} bis ${format(item.endMs)} · ${item.source}`}
         aria-label={`${lane.label}: ${item.label} bei ${format(item.startMs)}`} onClick={()=>scrub(Math.max(0,item.startMs+35))}
         style={{position:"absolute",left:`${left}%`,width:`${Math.max(.45,right-left)}%`,height:"77%",top:"12%",padding:0,border:0,borderRadius:2,background:lane.color,opacity:.85,minWidth:2}}/>;
       })}
       <div aria-hidden="true" style={{position:"absolute",left:`${100*clamp((time-start)/(end-start),0,1)}%`,width:2,height:"100%",top:0,background:"white",pointerEvents:"none"}}/>
      </div>
     </div>)}
    </div>
    <div aria-live="polite" style={{fontSize:12}}>
     <strong>Berechnete Vorschau:</strong> Mundöffnung {Math.round(active.mouthPreview*100)} % (geschätzt), Lippenverschluss {Math.round(active.closurePreview*100)} %, Gesten {active.gesture.active?`Kopf ${active.gesture.head.toFixed(2)}× · Arme ${active.gesture.arms.toFixed(2)}×`:"keine"}, Szene {active.role.active?`${active.role.style} · Lead Avatar ${active.role.leadSlot+1}`:"keine"}.
    </div>
    <div style={{display:"grid",gap:8}}>
     <label className="setting-check"><input type="checkbox" checked={!!preferences.rapTimingLiveEnabledV418} onChange={e=>updatePreferences({rapTimingLiveEnabledV418:e.target.checked})}/> V418-Timing-Korrekturen ausdrücklich in Live-Show anwenden</label>
     {([{"key":"mouthMs","label":"Mund","min":-150,"max":150},{"key":"gestureMs","label":"Gesten","min":-250,"max":250},{"key":"roleMs","label":"Rapper-Rollen","min":-250,"max":250}] as const).map(item=><label key={item.key} style={{display:"flex",alignItems:"center",gap:9,flexWrap:"wrap"}}>{item.label} ({offsets[item.key]>0?"+":""}{offsets[item.key]} ms)
       <input aria-label={`V418 ${item.label} Zeitversatz`} type="range" min={item.min} max={item.max} step={10} value={offsets[item.key]} onChange={e=>patch(item.key,Number(e.target.value))} style={{flex:1,minWidth:130}}/>
       <button type="button" disabled={offsets[item.key]===0} onClick={()=>patch(item.key,0)}>0 ms</button>
      </label>)}
     <small>Positiv = Signal früher, negativ = später. Unabhängige Korrekturen: Mund nur bei eingeschaltetem V415-Rap-Lip-Sync, Gesten nur mit aktivierten V414-/V412-Funktionen, Rollen nur bei aktiver V416-Besetzung. Die ältere V415-Mundkorrektur bleibt bei deaktiviertem V418 erhalten.</small>
     <button type="button" onClick={()=>{updatePreferences({rapTimingOffsetsV418:{mouthMs:0,gestureMs:0,roleMs:0},rapTimingLiveEnabledV418:false});setFollow(false);}}>Zurücksetzen und Live-Korrekturen deaktivieren</button>
    </div>
    <small>Vorschau: {hasRealPreview?"Der oben gewählte GLB-Avatar erhält die simulierten Kopf-/Arm- und Mundsignale, soweit sein Rig diese unterstützt.":"Schematischer Avatar; für echte Rig-Vorschau einen installierten GLB-Avatar auswählen."} Der Inspector bewegt Spotify nicht. Es erfolgt keine automatische Latenzkorrektur.</small>
   </>}
  </>}
 </fieldset>;
}
