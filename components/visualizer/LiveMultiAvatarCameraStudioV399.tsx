"use client";
import dynamic from "next/dynamic";
import {useCallback,useEffect,useMemo,useState} from "react";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import type {AvatarModel} from "./avatarModels";
import type {CameraPose} from "./stageCameraPoseHelpersV289";
import {GROUP_EVENT_V326,readGroupV326,evaluateGroupV326,type GroupStudioV326} from "./multiAvatarStageDirectorV326";
import {normalizeCameraStudioV398,type CameraSceneV398,type CameraShotChoiceV398} from "./cameraPerformanceStudioV398";
import {demoPositionsV399,previewShotV399,updateStudioFromCastPoseV399} from "./multiAvatarCameraV399";
import type {PreviewDancerV399} from "./MultiAvatarCameraCanvasV399";
const MultiAvatarCameraCanvasV399=dynamic(()=>import("./MultiAvatarCameraCanvasV399").then(m=>m.MultiAvatarCameraCanvasV399),{ssr:false});
const sections:CameraSceneV398[]=["verse","hook","drop"];
const names:Record<CameraSceneV398,string>={verse:"Verse · Rap",hook:"Hook · Refrain",drop:"Drop · Festival"};
const shots:{value:CameraShotChoiceV398;label:string}[]=[
 {value:"auto",label:"Automatisch"},{value:"lead",label:"Solo-Nahaufnahme"},
 {value:"two-shot",label:"Duett / Two-Shot"},{value:"group",label:"Gruppe"}
];
/** This is a deliberately separate, opt-in editor; normal playback never mounts its Canvas. */
export function LiveMultiAvatarCameraStudioV399({models,activeAvatar}:{models:AvatarModel[];activeAvatar:AvatarModel}){
 const {preferences,updatePreferences}=useUiPreferences();
 const profile=normalizeCameraStudioV398(preferences.avatarCameraStudioV398);
 const [group,setGroup]=useState<GroupStudioV326|null>(null);
 const [count,setCount]=useState(2);
 const [scene,setScene]=useState<CameraSceneV398>("verse");
 const [shot,setShot]=useState<CameraShotChoiceV398>("auto");
 const [lead,setLead]=useState(0);
 const [partner,setPartner]=useState(1);
 const [useSaved,setUseSaved]=useState(true);
 const [cueId,setCueId]=useState("");
 const [modelOverrides,setModelOverrides]=useState<Record<number,string>>({});
 const [orbitPose,setOrbitPose]=useState<CameraPose|null>(null);
 const [revision,setRevision]=useState(0);
 const [playing,setPlaying]=useState(false);
 useEffect(()=>{
  const refresh=()=>{const current=readGroupV326();setGroup(current);};
  refresh();window.addEventListener(GROUP_EVENT_V326,refresh);window.addEventListener("storage",refresh);
  return ()=>{window.removeEventListener(GROUP_EVENT_V326,refresh);window.removeEventListener("storage",refresh);};
 },[]);
 useEffect(()=>{if(!group)return;if(group.enabled){setCount(group.count);setCueId(prev=>group.cues.some(c=>c.id===prev)?prev:group.cues[0]?.id??"");}},[group]);
 const chooseSection=useCallback((next:CameraSceneV398)=>setScene(next),[]);
 useEffect(()=>{
  setShot(normalizeCameraStudioV398(preferences.avatarCameraStudioV398).scenes[scene].shot);
  setOrbitPose(null);setRevision(v=>v+1);
 // Only scene transitions change the preview; editing profile/shot does not reset the orbit.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[scene]);
 useEffect(()=>{
  if(!playing)return;
  const timer=window.setInterval(()=>setScene(previous=>sections[(sections.indexOf(previous)+1)%sections.length]),2400);
  return ()=>window.clearInterval(timer);
 },[playing]);
 const selectedCue=group?.cues.find(c=>c.id===cueId)??group?.cues[0];
 const usingSaved=!!(group?.enabled&&useSaved&&count===group.count&&selectedCue);
 const stagePose=usingSaved&&group&&selectedCue?evaluateGroupV326(group,selectedCue.at+Math.max(.01,selectedCue.transition+.01)):null;
 const positions=useMemo(()=>stagePose?.positions??demoPositionsV399(count),[stagePose?.positions,count]);
 const available=useMemo(()=>[...new Map([...models,activeAvatar].filter(m=>m&&m.id).map(m=>[m.id,m])).values()].filter(m=>m.url),[models,activeAvatar]);
 const dancers:PreviewDancerV399[]=Array.from({length:count},(_,i)=>{
  const id=modelOverrides[i]??(usingSaved?group?.modelIds[i]:undefined)??(i===0?activeAvatar.id:"");
  const model=available.find(m=>m.id===id)??(i===0?activeAvatar:null);
  return {id:`slot-${i}`,label:model?.label??`Demo-Tänzer ${i+1}`,url:model?.url??null};
 });
 const plan=previewShotV399({scene,choice:shot,positions,lead,partner,profile,fromSavedFormation:usingSaved});
 const cameraReset=()=>{setOrbitPose(null);setRevision(v=>v+1);};
 const save=()=>{
  const tuned=orbitPose?updateStudioFromCastPoseV399(profile,scene,plan,orbitPose):profile;
  updatePreferences({avatarCameraStudioV398:{...tuned,scenes:{...tuned.scenes,[scene]:{...tuned.scenes[scene],shot:plan.shot}}}});
  cameraReset();
 };
 const changeCount=(value:number)=>{setCount(value);setLead(0);setPartner(1);cameraReset();};
 return <section className="v399-multi-avatar-camera-studio" aria-label="V399 Live Multi-Avatar Camera Studio">
  <h4>V399 · Live Multi-Avatar Camera Studio</h4>
  <p>Eine separate Konzertbühne mit bis zu vier Avataren. Die Probe zeigt echte gespeicherte Gruppenpositionen, wenn V326 aktiv ist; ansonsten eine ausdrücklich simulierte Demo-Aufstellung. Die Vorschau beeinflusst weder die Live-Show noch importierte Animationen.</p>
  <div className="v399-camera-controls">
   <label>Tänzer in der Vorschau
    <select value={count} onChange={e=>changeCount(Number(e.target.value))}>
     {[1,2,3,4].map(n=><option key={n} value={n}>{n} {n===1?"Avatar":"Avatare"}</option>)}
    </select>
   </label>
   <label className="setting-check"><input type="checkbox" checked={useSaved} onChange={e=>{setUseSaved(e.target.checked);cameraReset();}} disabled={!group?.enabled} /> Gruppenformation aus V326 verwenden</label>
   {group?.enabled&&<label>Gespeicherte Formation
    <select value={cueId||group.cues[0]?.id||""} onChange={e=>{setCueId(e.target.value);cameraReset();}}>
     {group.cues.map(c=><option key={c.id} value={c.id}>{c.id} · {c.at.toFixed(1)} s ({c.formation})</option>)}
    </select>
   </label>}
  </div>
  <div className="v399-camera-controls">
   <label>Lead-Position <select value={Math.min(count-1,lead)} onChange={e=>{setLead(Number(e.target.value));cameraReset();}}>
    {dancers.map((_,i)=><option key={i} value={i}>Tänzer {i+1}</option>)}
   </select></label>
   {count>1&&<label>Duettpartner <select value={Math.min(count-1,partner)} onChange={e=>{setPartner(Number(e.target.value));cameraReset();}}>
    {dancers.map((_,i)=><option key={i} value={i}>Tänzer {i+1}</option>)}
   </select></label>}
  </div>
  <div role="group" aria-label="Songabschnitt simulieren" className="v399-camera-scenes">
   {sections.map(key=><button type="button" key={key} aria-pressed={scene===key} onClick={()=>chooseSection(key)}>{names[key]}</button>)}
  </div>
  <div role="group" aria-label="Kameraaufnahme simulieren" className="v399-camera-shots">
   {shots.map(choice=><button type="button" key={choice.value} aria-pressed={shot===choice.value}
     onClick={()=>{setShot(choice.value);cameraReset();}}>{choice.label}</button>)}
  </div>
  <div className="v399-camera-preview-header">
   <strong>{plan.shot==="lead"?"Solo":plan.shot==="two-shot"?"Duett":"Gruppe"} · {plan.actors.map(i=>`#${i+1}`).join(" + ")}</strong>
   <small>{usingSaved?"V326-Positionen · gespeicherte Formation":"Demo-Aufstellung · keine Live-Positionsmessung"}</small>
  </div>
  <MultiAvatarCameraCanvasV399 plan={plan} positions={positions} dancers={dancers} onPoseChange={setOrbitPose}
    reducedMotion={preferences.reducedMotion===true} holdMs={profile.holdMs} revision={revision}/>
  <small>Links ziehen: Kamera drehen · Mausrad/Pinch: Zoom · Rechtsklick/Touch: verschieben. Perspektivwechsel werden weich animiert; bei „Reduced Motion“ ohne Kamerafahrt.</small>
  <div className="v399-camera-controls" aria-label="Avatar-Modelle für die Vorschau">
   {dancers.map((d,i)=><label key={i}>Tänzer {i+1} – Modell
    <select value={modelOverrides[i]??(usingSaved?group?.modelIds[i]:undefined)??(i===0?activeAvatar.id:"")}
     onChange={e=>setModelOverrides(v=>({...v,[i]:e.target.value}))}>
     <option value="">Neutrale Demo-Figur</option>
     {available.map(model=><option value={model.id} key={model.id}>{model.label}</option>)}
    </select>
   </label>)}
  </div>
  <div className="v399-camera-actions">
   <button type="button" onClick={()=>setPlaying(x=>!x)} aria-pressed={playing}>{playing?"■ Durchlauf stoppen":"▶ Verse → Hook → Drop testen"}</button>
   <button type="button" onClick={cameraReset}>Kamera zurücksetzen</button>
   <button type="button" onClick={save}>Perspektive für „{names[scene]}“ in V398 speichern</button>
  </div>
  <label className="setting-check"><input type="checkbox" checked={profile.enabled}
   onChange={e=>updatePreferences({avatarCameraStudioV398:{...profile,enabled:e.target.checked}})}/>
   Gespeicherte V398-Perspektiven in der Live-V397-Kameraregie verwenden
  </label>
  <small>Gespeichert werden nur Perspektiventyp, Nähe und seitliche Ausrichtung in den V398-Songabschnitt. Neigung/Rotation und Modellwahl sind Vorschauoptionen. Die echte Bühne nutzt ausschließlich bestätigte sichtbare Performer und vorhandene Rolleninformationen. V397 muss für die automatische Live-Kamera aktiviert sein. Manuelle Kamera-Timelines und Lyrics-Schutzzonen behalten Vorrang.</small>
 </section>;
}
