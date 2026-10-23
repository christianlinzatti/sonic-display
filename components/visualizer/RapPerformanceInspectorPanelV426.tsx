"use client";

import {useCallback,useEffect,useMemo,useState} from "react";
import {useMusic} from "@/context/MusicContext";
import {readGroupV326,canRunGroupV326,GROUP_EVENT_V326} from "./multiAvatarStageDirectorV326";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import {inspectRapPerformanceV426,normalizeInspectorDraftV426,type InspectorLaneV426,type InspectorProposalV426} from "./rapPerformanceInspectorV426";
import {sampleRapTimingV418,normalizeRapTimingOffsetsV418} from "./rapPerformanceQualityV418";
import {loadRapGestureDocumentV414,saveRapGestureDocumentV414,updateRapGestureDocumentV414,
 RAP_GESTURES_CHANGE_V414,type RapGestureDocumentV414,type RapGestureSampleV414} from "./rapGestureCuesV414";
import {normalizeRapDuetAssignmentsV416} from "./rapDuetStudioV416";
import {normalizeRapMouthDocumentV420} from "./rapSyllableKeyframesV420";
import {resolveVocalPerformanceQualityV374} from "./vocalPerformanceQualityV374";
import {resolveExpressiveRapCueV425} from "./expressiveRapDirectorV425";

const lanes:ReadonlyArray<{id:InspectorLaneV426;label:string;color:string}>=[
 {id:"lyrics",label:"Lyrics / Wort",color:"#78cde7"},{id:"mouth",label:"Mund (V418)",color:"#bb9cef"},
 {id:"articulation",label:"Artikulation V419/V420",color:"#f3bd89"},{id:"gesture",label:"Gesten V414",color:"#e1a76a"},
 {id:"expression",label:"Ausdruck V425",color:"#e5a4bd"},{id:"rapper",label:"Rapper-Wechsel V416",color:"#9cdea9"},
];
const msFmt=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,"0")}.${String(Math.floor(ms%1000/10)).padStart(2,"0")}`;
const clamp=(v:number,a:number,b:number)=>Number.isFinite(v)?Math.max(a,Math.min(b,v)):a;
const blankGesture:RapGestureSampleV414={head:1,arms:1,motionId:"",motionBlend:0,motionSec:0,active:false};
/** V426 is a track-scoped authoring aid. A/B only drives the already existing local 3D preview. */
export function RapPerformanceInspectorPanelV426({avatarId,onPreviewMouth,onPreviewGesture}:{
 avatarId:string;onPreviewMouth:(jaw:number|null)=>void;onPreviewGesture:(cue:RapGestureSampleV414)=>void;
}){
 const {track,lyrics,progressMs}=useMusic();const {preferences,updatePreferences}=useUiPreferences();
 const trackId=track?.id??"";
 const [open,setOpen]=useState(false),[follow,setFollow]=useState(false),[time,setTime]=useState(0);
 const [doc,setDoc]=useState<RapGestureDocumentV414|null>(null);
 const [group,setGroup]=useState(readGroupV326);
 useEffect(()=>{const refresh=()=>setGroup(readGroupV326());window.addEventListener(GROUP_EVENT_V326,refresh);
  return ()=>window.removeEventListener(GROUP_EVENT_V326,refresh);},[]);
 const [selectedId,setSelectedId]=useState<string|null>(null),[draftValue,setDraftValue]=useState<number|null>(null);
 const [variant,setVariant]=useState<"A"|"B">("A"),[message,setMessage]=useState("");
 useEffect(()=>{
  const refresh=()=>setDoc(trackId&&avatarId?loadRapGestureDocumentV414(trackId,avatarId):null);
  refresh();window.addEventListener(RAP_GESTURES_CHANGE_V414,refresh);window.addEventListener("storage",refresh);
  return ()=>{window.removeEventListener(RAP_GESTURES_CHANGE_V414,refresh);window.removeEventListener("storage",refresh);};
 },[trackId,avatarId]);
 useEffect(()=>{setFollow(false);setTime(0);setSelectedId(null);setDraftValue(null);setVariant("A");setMessage("");
  onPreviewMouth(null);onPreviewGesture(blankGesture);
 },[trackId,avatarId,onPreviewMouth,onPreviewGesture]);
 useEffect(()=>()=>{onPreviewMouth(null);onPreviewGesture(blankGesture);},[onPreviewMouth,onPreviewGesture]);
 const lastEnd=lyrics?.lines?.at(-1)?.endMs;
 const duration=Math.max(1000,track?.durationMs??lastEnd??1000);
 const cursor=clamp(follow?progressMs:time,0,duration);
 const start=Math.max(0,cursor-5000),end=Math.min(duration,Math.max(start+1000,cursor+5000));
 const count=canRunGroupV326(group,trackId)?group.count:preferences.multiAvatarMode==="solo"?1:2;
 const assignments=useMemo(()=>normalizeRapDuetAssignmentsV416((preferences.rapDuetAssignmentsV416??{})[trackId],lyrics?.lines.length??0),
  [preferences.rapDuetAssignmentsV416,trackId,lyrics]);
 const mouthDoc=useMemo(()=>normalizeRapMouthDocumentV420(trackId,(preferences.rapSyllableDocumentsV420??{})[trackId]),
  [trackId,preferences.rapSyllableDocumentsV420]);
 const offsets=normalizeRapTimingOffsetsV418(preferences.rapTimingOffsetsV418);
 const reviewed=useMemo(()=>inspectRapPerformanceV426({lyrics,trackId,avatarId,gestureDocument:doc,
  mouthDocument:mouthDoc,assignments,count,startMs:start,endMs:end,offsets,
  syllablesEnabled:!!preferences.avatarRapSyllableEnabledV419,
  syllableSmoothness:preferences.avatarRapSyllableSmoothnessV419??70,
  expressionEnabled:!!preferences.rapExpressiveEnabledV425,
  expressionStrength:preferences.rapExpressiveStrengthV425??65,reducedMotion:preferences.reducedMotion}),
  [lyrics,trackId,avatarId,doc,mouthDoc,assignments,count,start,end,offsets.mouthMs,offsets.gestureMs,offsets.roleMs,
   preferences.avatarRapSyllableEnabledV419,preferences.avatarRapSyllableSmoothnessV419,
   preferences.rapExpressiveEnabledV425,preferences.rapExpressiveStrengthV425,preferences.reducedMotion]);
 const selected=reviewed.proposals.find(p=>p.id===selectedId)??null;
 const draft=selected?.proposed!==null&&selected?.proposed!==undefined?
   normalizeInspectorDraftV426(selected,draftValue??selected.proposed):null;
 const sample=useCallback((at:number,side:"A"|"B",s:InspectorProposalV426|null,value:number|null)=>{
  const previewAssignments=side==="B"&&s?.kind==="remove-role"&&s.roleIndex!==undefined?
   assignments.filter((_,i)=>i!==s.roleIndex):assignments;
  const previewDoc=side==="B"&&s?.kind==="remove-gesture"&&doc!==null&&doc.trackId===trackId&&doc.avatarId===avatarId?
   updateRapGestureDocumentV414(doc,null,{lineIndex:s.gestureLine??-1,wordIndex:s.gestureWord??-1}):doc;
  const active=sampleRapTimingV418({lyrics,trackId,avatarId,doc:previewDoc,assignments:previewAssignments,count,ms:at,offsets,
   reducedMotion:preferences.reducedMotion});
  const smooth=side==="B"&&s?.kind==="smoothness"&&value!==null?value:preferences.avatarRapSyllableSmoothnessV419??70;
  const strength=side==="B"&&s?.kind==="expression"&&value!==null?value:preferences.rapExpressiveStrengthV425??65;
  const face=resolveVocalPerformanceQualityV374(lyrics??null,at,true,{
   style:"rap",mode:"lyrics",reducedMotion:preferences.reducedMotion,lipStrength:preferences.avatarLipSyncEnabled===false?0:preferences.avatarLipSyncStrength??90,
   rapLipEnabledV415:preferences.avatarRapLipEnabledV415,rapLipPrecisionV415:preferences.avatarRapLipPrecisionV415,
   rapLipOffsetMsV415:preferences.rapTimingLiveEnabledV418?offsets.mouthMs:preferences.avatarRapLipOffsetMsV415,
   rapSyllableEnabledV419:preferences.avatarRapSyllableEnabledV419,rapSyllableStrengthV419:preferences.avatarRapSyllableStrengthV419,
   rapSyllableSmoothnessV419:smooth,rapSyllableEditsEnabledV420:preferences.rapSyllableEditsEnabledV420,
   rapSyllableDocumentV420:mouthDoc,rapSyllableTrackIdV420:trackId,
  });
  onPreviewMouth(face.confidence==="word"&&face.vocal.style==="rap"?clamp(face.face.jaw,0,1):0);
  const cue=resolveExpressiveRapCueV425({enabled:!!preferences.rapExpressiveEnabledV425,playing:true,
   reducedMotion:preferences.reducedMotion,lyrics,progressMs:at,trackId,assignmentTrackId:trackId,
   assignments:[...previewAssignments],avatarCount:count,strength});
  onPreviewGesture({...active.gesture,
   head:clamp(active.gesture.head+cue.gestureStrength*.12,1,1.5),
   arms:clamp(active.gesture.arms+cue.gestureStrength*.16,1,1.5),
   active:active.gesture.active||cue.active});
  return cue;
 },[lyrics,trackId,avatarId,doc,assignments,count,offsets.mouthMs,offsets.gestureMs,offsets.roleMs,mouthDoc,
  preferences.reducedMotion,preferences.avatarLipSyncEnabled,preferences.avatarLipSyncStrength,
  preferences.avatarRapLipEnabledV415,preferences.avatarRapLipPrecisionV415,preferences.avatarRapLipOffsetMsV415,
  preferences.rapTimingLiveEnabledV418,preferences.avatarRapSyllableEnabledV419,preferences.avatarRapSyllableStrengthV419,
  preferences.avatarRapSyllableSmoothnessV419,preferences.rapSyllableEditsEnabledV420,
  preferences.rapExpressiveEnabledV425,preferences.rapExpressiveStrengthV425,onPreviewMouth,onPreviewGesture]);
 useEffect(()=>{if(open)sample(cursor,variant,selected,draft);},[open,cursor,variant,selected,draft,sample]);
 const choose=(item:InspectorProposalV426)=>{setSelectedId(item.id);setDraftValue(item.proposed);setVariant("A");setFollow(false);setTime(clamp(item.atMs+(item.kind==="expression"?240:35),0,duration));setMessage("");};
 const apply=()=>{
  if(!selected||!trackId||!lyrics?.synced)return;
  if(selected.kind==="smoothness"&&draft!==null){updatePreferences({avatarRapSyllableSmoothnessV419:draft});setMessage("V419-Glättung nach ausdrücklicher Freigabe gespeichert.");}
  else if(selected.kind==="expression"&&draft!==null){updatePreferences({rapExpressiveStrengthV425:draft});setMessage("V425-Ausdrucksstärke nach ausdrücklicher Freigabe gespeichert.");}
  else if(selected.kind==="remove-role"&&selected.roleIndex!==undefined){
   const target=assignments[selected.roleIndex];if(!target){setMessage("Szene hat sich geändert. Bitte erneut auswählen.");return;}
   updatePreferences({rapDuetAssignmentsV416:{...(preferences.rapDuetAssignmentsV416??{}),[trackId]:assignments.filter((_,i)=>i!==selected.roleIndex)}});
   setMessage("Ältere überlappende V416-Szene entfernt.");
  }else if(selected.kind==="remove-gesture"&&doc&&doc.trackId===trackId&&doc.avatarId===avatarId&&
   doc.cues.some(c=>c.lineIndex===selected.gestureLine&&c.wordIndex===selected.gestureWord&&c.startMs===selected.gestureStartMs)){
   const saved=saveRapGestureDocumentV414(updateRapGestureDocumentV414(doc,null,{lineIndex:selected.gestureLine!,wordIndex:selected.gestureWord!}));
   setMessage(saved?"Veralteter Gestenanker entfernt.":"Speichern fehlgeschlagen – Daten unverändert.");
  }else{setMessage("Vorschlag nicht mehr aktuell. Bitte neu auswählen.");return;}
  setSelectedId(null);setDraftValue(null);setVariant("A");
 };
 const valid=!!trackId&&!!lyrics?.synced;
 return <fieldset aria-label="V426 Smart Performance Quality Inspector" style={{marginTop:14,padding:12,border:"1px solid #466c8b",borderRadius:10,display:"grid",gap:9}}>
  <legend>V426 · Smart Performance Quality Inspector</legend>
  <button type="button" aria-expanded={open} onClick={()=>{setOpen(v=>!v);if(open){onPreviewMouth(null);onPreviewGesture(blankGesture);}}}>
   {open?"▾ Inspektor schließen":"▸ Gemeinsame Rap-Zeitachse und A/B-Vergleich öffnen"}</button>
  {open&&<>
   <small>Lyrics-Zeitstempel sind Provider-Daten; Mund, Artikulation, Gesten, Szenen und Ausdruck zeigen <b>berechnete oder manuell entworfene Cues</b>, keine gemessenen GLB-Morphs oder erkannten Stimmen. Keine automatische Live-Änderung.</small>
   {!valid?<p role="status">Für die Prüfung ist ein Titel mit synchronisierten Lyrics erforderlich.</p>:<>
    <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
     <label className="setting-check"><input type="checkbox" checked={follow} onChange={e=>setFollow(e.target.checked)}/> Spotify-Zeit folgen (ohne Seek)</label>
     <b>{msFmt(cursor)} / {msFmt(duration)}</b>
    </div>
    <input type="range" aria-label="V426 lokale Wiedergabezeit" min={0} max={duration} step={20} value={cursor} onChange={e=>{setTime(Number(e.target.value));setFollow(false);}} style={{width:"100%"}}/>
    <div role="group" aria-label="V426 Rap Performance Spuren" style={{display:"grid",gap:5,padding:10,border:"1px solid #40516d",borderRadius:8}}>
     <small>{msFmt(start)} — Gemeinsame Vorschau ±5 Sekunden — {msFmt(end)}</small>
     {lanes.map(lane=><div key={lane.id} style={{display:"grid",gridTemplateColumns:"minmax(105px,155px) minmax(0,1fr)",gap:7,alignItems:"center"}}>
      <span style={{fontSize:11}}>{lane.label}</span>
      <div style={{height:29,position:"relative",background:"#19263b",borderRadius:4,overflow:"hidden"}}>
       {reviewed.events.filter(e=>e.lane===lane.id).map(event=>{
        const left=100*clamp((event.startMs-start)/(end-start),0,1),right=100*clamp((event.endMs-start)/(end-start),0,1);
        return <button key={event.id} type="button" aria-label={`${lane.label}: ${event.label}`} title={`${event.label} · ${event.source}`}
         onClick={()=>{setTime(clamp(event.startMs+20,0,duration));setFollow(false);}} style={{position:"absolute",left:`${left}%`,width:`${Math.max(.4,right-left)}%`,
          top:4,height:21,minWidth:2,padding:0,border:0,opacity:.88,background:lane.color,borderRadius:3}}/>;
       })}
       <span aria-hidden="true" style={{position:"absolute",left:`${100*clamp((cursor-start)/(end-start),0,1)}%`,top:0,width:2,height:"100%",background:"white",pointerEvents:"none"}}/>
      </div>
     </div>)}
    </div>
    <strong>Auffälligkeiten im aktuellen Zeitfenster: {reviewed.proposals.length} Vorschläge · {reviewed.notes.length} Hinweise</strong>
    {reviewed.notes.map(n=><small key={n.id}>ℹ {msFmt(n.atMs)} · {n.title}: {n.detail}</small>)}
    {!reviewed.proposals.length?<small>Keine heuristischen Auffälligkeiten in diesem Zeitfenster. Das ist keine bestätigte Qualitätsmessung.</small>:
     <div role="group" aria-label="V426 prüfbare Vorschläge" style={{display:"grid",gap:5,maxHeight:245,overflowY:"auto"}}>
      {reviewed.proposals.map(p=><button type="button" key={p.id} aria-pressed={selectedId===p.id} onClick={()=>choose(p)}
       style={{textAlign:"left",padding:8,border:selectedId===p.id?"2px solid #8cdbec":"1px solid #425572",borderRadius:6}}>
       <b>{msFmt(p.atMs)} · {p.title}</b><span style={{display:"block",fontSize:12}}>{p.reason}</span>
      </button>)}
     </div>}
    {selected&&<section aria-label="V426 A B Performance Vorschau" style={{padding:10,border:"1px solid #5d7693",borderRadius:8,display:"grid",gap:8}}>
     <strong>A/B-Probe – {selected.title}</strong>
     <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <button type="button" aria-pressed={variant==="A"} onClick={()=>setVariant("A")}>A · Aktuelle Einstellungen</button>
      <button type="button" aria-pressed={variant==="B"} onClick={()=>setVariant("B")}>B · Vorschlag (nur 3D-Vorschau)</button>
     </div>
     {draft!==null&&<label>Vorgeschlagener Wert: {draft} % (bisher {selected.before} %)
      <input type="range" aria-label="V426 Vorschlag bearbeiten" min={0} max={100} step={5} value={draft}
       onChange={e=>{setDraftValue(Number(e.target.value));setVariant("B");}} style={{width:"100%"}}/>
     </label>}
     {selected.kind==="remove-gesture"||selected.kind==="remove-role"?<small>B simuliert das Entfernen nur in der lokalen Vorschau. Ein veralteter Anker hatte ohnehin keinen Live-Effekt; gespeicherte Daten bleiben unverändert.</small>:
      <small>Beide Varianten verwenden V374 und V425. Die GLB-Vorschau zeigt Kiefer- sowie Kopf-/Arm-Differenzen; Gesichts-Ausdrucksstärke ist zusätzlich diagnostisch. Globale V419/V425-Stärken betreffen nach Freigabe auch andere Tracks. Keine Wirkung auf Spotify oder Live-Bühne vor Freigabe.</small>}
     {(()=>{const strength=variant==="B"&&selected.kind==="expression"&&draft!==null?draft:preferences.rapExpressiveStrengthV425??65;
      const previewRoles=variant==="B"&&selected.kind==="remove-role"&&selected.roleIndex!==undefined?
       assignments.filter((_,i)=>i!==selected.roleIndex):assignments;
      const cue=resolveExpressiveRapCueV425({enabled:!!preferences.rapExpressiveEnabledV425,playing:true,reducedMotion:preferences.reducedMotion,lyrics,
       progressMs:cursor,trackId,assignmentTrackId:trackId,assignments:[...previewRoles],avatarCount:count,strength});
      return <small>Aktuelle {variant}-Vorschau: Gesichtsausdruck {Math.round(cue.faceStrength*100)} % · Gestenimpuls {Math.round(cue.gestureStrength*100)} % · Kameraimpuls {Math.round(cue.cameraEnergy*100)} % (nur Diagnose).</small>;})()}
     <button type="button" onClick={apply}>Diesen Vorschlag ausdrücklich übernehmen</button>
     <button type="button" onClick={()=>{setSelectedId(null);setDraftValue(null);setVariant("A");}}>Verwerfen</button>
    </section>}
    {!!message&&<small role="status">{message}</small>}
   </>}
  </>}
 </fieldset>;
}
