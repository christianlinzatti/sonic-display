"use client";
import dynamic from "next/dynamic";
import {useEffect,useMemo,useRef,useState} from "react";
import {useMusic} from "@/context/MusicContext";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import type {AvatarModel} from "./avatarModels";
import {normalizeCameraStudioV398,cameraSceneV398} from "./cameraPerformanceStudioV398";
import {activeCameraCueV400,editCameraCuesV400,formatCameraTimeV400,newCameraCueV400,normalizeCameraTimelineV400,
 type CameraTimelineCueV400} from "./cinematicCameraTimelineV400";
import {demoPositionsV399,previewShotV399} from "./multiAvatarCameraV399";
import type {PreviewDancerV399} from "./MultiAvatarCameraCanvasV399";
const MultiAvatarCameraCanvasV399=dynamic(()=>import("./MultiAvatarCameraCanvasV399").then(m=>m.MultiAvatarCameraCanvasV399),{ssr:false});
const choiceLabels={lead:"Solo / Lead",'two-shot':"Duett / Two-Shot",group:"Gesamte Bühne"};
export function CinematicCameraTimelineV400({models,activeAvatar}:{models:AvatarModel[];activeAvatar:AvatarModel}){
 const {track,progressMs}=useMusic();const {preferences,updatePreferences}=useUiPreferences();
 const library=useMemo(()=>normalizeCameraTimelineV400(preferences.avatarCameraTimelineV400),[preferences.avatarCameraTimelineV400]);
 const trackId=track?.id??"demo";
 const title=track?`${track.artist} – ${track.title}`:"Demo (ohne Spotify-Track)";
 const durationMs=Math.max(1000,Math.min(36000000,track?.durationMs??180000));
 const stored=library.tracks[trackId];
 const cues=stored?.cues??[];
 const [cursor,setCursor]=useState(0);const [selectedId,setSelectedId]=useState("");
 const [playingPreview,setPlayingPreview]=useState(false);const [count,setCount]=useState(2);
 const [orbitReset,setOrbitReset]=useState(0);const counter=useRef(1);
 const [modelOverrides,setModelOverrides]=useState<Record<number,string>>({});
 useEffect(()=>{setCursor(0);setSelectedId("");setPlayingPreview(false);setOrbitReset(v=>v+1);},[trackId]);
 useEffect(()=>{if(!playingPreview)return;const handle=window.setInterval(()=>setCursor(ms=>{
  return Math.min(durationMs,ms+100);
 }),100);return ()=>window.clearInterval(handle);},[playingPreview,durationMs]);
 useEffect(()=>{if(playingPreview&&cursor>=durationMs)setPlayingPreview(false);},[playingPreview,cursor,durationMs]);
 const chosen=cues.find(c=>c.id===selectedId)??null;
 const atTime=activeCameraCueV400({...library,enabled:true},trackId,cursor,true,false,count)?.cue??null;
 const audition=chosen&&Math.abs(cursor-chosen.atMs)<120?chosen:atTime;
 const activeCue=audition??newCameraCueV400(cursor);
 const scene=cameraSceneV398(activeCue.shot==='group'?'hook':'verse');
 const studio=normalizeCameraStudioV398(preferences.avatarCameraStudioV398);
 const previewProfile={...studio,scenes:{...studio.scenes,[scene]:{
  shot:activeCue.shot,distance:activeCue.distance,pan:activeCue.pan}}};
 const positions=useMemo(()=>demoPositionsV399(count),[count]);
 const plan=previewShotV399({scene,choice:activeCue.shot,positions,lead:activeCue.leadSlot,
  partner:activeCue.partnerSlot,profile:previewProfile});
 const available=useMemo(()=>[...new Map([...models,activeAvatar].filter(m=>m&&m.id).map(m=>[m.id,m])).values()].filter(m=>m.url),[models,activeAvatar]);
 const dancers:PreviewDancerV399[]=Array.from({length:count},(_,i)=>{
  const id=modelOverrides[i]??(i===0?activeAvatar.id:available[i]?.id??"");
  const model=available.find(m=>m.id===id);
  return {id:`v400-preview-${i}`,label:model?.label??`Demo-Tänzer ${i+1}`,url:model?.url??null};
 });
 const commit=(next:CameraTimelineCueV400[])=>updatePreferences({avatarCameraTimelineV400:editCameraCuesV400(library,trackId,durationMs,next)});
 const add=()=>{
  if(cues.length>=48)return;
  let cue=newCameraCueV400(Math.round(cursor/100)*100,counter.current++);
  while(cues.some(c=>c.id===cue.id))cue=newCameraCueV400(Math.round(cursor/100)*100,counter.current++);
  commit([...cues,cue]);setSelectedId(cue.id);
 };
 const update=(patch:Partial<CameraTimelineCueV400>)=>{if(!chosen)return;commit(cues.map(c=>c.id===chosen.id?{...c,...patch}:c));};
 const remove=()=>{if(!chosen)return;commit(cues.filter(c=>c.id!==chosen.id));setSelectedId("");};
 const choose=(cue:CameraTimelineCueV400)=>{setSelectedId(cue.id);setCursor(cue.atMs);setOrbitReset(v=>v+1);};
 return <section className="v400-camera-timeline" aria-label="V400 Cinematic Camera Timeline">
  <h4>V400 · Cinematic Camera Timeline</h4>
  <p>Eigene Kamera-Marken entlang des Songs setzen, auswählen, bearbeiten und auf einer separaten 3D-Bühne testen. Die Demo ohne Spotify wird niemals als Live-Timeline verwendet.</p>
  <strong>Song: {title}</strong>
  <label className="setting-check"><input type="checkbox" checked={library.enabled}
   onChange={e=>updatePreferences({avatarCameraTimelineV400:{...library,enabled:e.target.checked}})}/>
   Gespeicherte Kameramarken während dieses Songs verwenden</label>
  <div className="v400-timeline-toolbar">
   <label>Vorschau-Tänzer <select value={count} onChange={e=>{setCount(Number(e.target.value));setOrbitReset(v=>v+1);}}>
    {[1,2,3,4].map(n=><option key={n} value={n}>{n}</option>)}
   </select></label>
   <button type="button" onClick={()=>{setCursor(Math.min(durationMs,progressMs));setPlayingPreview(false);}}>Aktuelle Songposition übernehmen</button>
   <button type="button" onClick={add} disabled={cues.length>=48}>+ Kamera-Marke setzen</button>
   <button type="button" onClick={()=>{setPlayingPreview(v=>!v);if(cursor>=durationMs)setCursor(0);}}>
    {playingPreview?"■ Probe stoppen":"▶ Probe abspielen"}</button>
  </div>
  <label>Zeitposition: {formatCameraTimeV400(cursor)} / {formatCameraTimeV400(durationMs)}
   <input type="range" min="0" max={durationMs} step="100" value={cursor}
    onChange={e=>{setCursor(Number(e.target.value));setPlayingPreview(false);}}/>
  </label>
  <div className="v400-timeline-track" role="group" aria-label="Kamera-Marken auf der Musik-Timeline">
   {cues.map(c=><button key={c.id} type="button" className="v400-cue" aria-pressed={chosen?.id===c.id}
    title={`${formatCameraTimeV400(c.atMs)} · ${choiceLabels[c.shot]}`}
    style={{left:`${Math.min(99,Math.max(0,c.atMs/durationMs*100))}%`}} onClick={()=>choose(c)}>
    <span className="sr-only">{formatCameraTimeV400(c.atMs)} · {choiceLabels[c.shot]}</span>
   </button>)}
   <span className="v400-playhead" style={{left:`${Math.min(100,cursor/durationMs*100)}%`}} aria-hidden="true"/>
  </div>
  <div className="v400-cue-list" aria-label="Gespeicherte Kamera-Marken">
   {cues.length===0?<small>Keine Kameramarken. Position wählen und „Kamera-Marke setzen“ drücken.</small>:
    cues.map(c=><button type="button" key={c.id} aria-pressed={chosen?.id===c.id} onClick={()=>choose(c)}>
     {formatCameraTimeV400(c.atMs)} · {choiceLabels[c.shot]} {c.transition==='cut'?'· Schnitt':'· Fahrt'}
    </button>)}
  </div>
  {chosen&&<fieldset className="v400-cue-editor"><legend>Kameramarke bearbeiten · {formatCameraTimeV400(chosen.atMs)}</legend>
   <label>Startzeit in Sekunden <input type="number" min="0" max={Math.round(durationMs/1000)} step="0.1"
    value={chosen.atMs/1000} onChange={e=>{const value=Number(e.target.value);if(Number.isFinite(value))update({atMs:Math.round(value*1000)});}}/></label>
   <label>Aufnahme <select value={chosen.shot} onChange={e=>update({shot:e.target.value as CameraTimelineCueV400['shot']})}>
    {Object.entries(choiceLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}
   </select></label>
   <label>Lead-Tänzer <select value={chosen.leadSlot} onChange={e=>update({leadSlot:Number(e.target.value)})}>
    {[0,1,2,3].map(n=><option key={n} value={n}>Tänzer {n+1}</option>)}
   </select></label>
   {chosen.shot==='two-shot'&&<label>Duett-Partner <select value={chosen.partnerSlot} onChange={e=>update({partnerSlot:Number(e.target.value)})}>
    {[0,1,2,3].map(n=><option key={n} value={n}>Tänzer {n+1}</option>)}
   </select></label>}
   <label>Zoom / Nähe ({chosen.distance} %)<input type="range" min="0" max="100" value={chosen.distance} onChange={e=>update({distance:Number(e.target.value)})}/></label>
   <label>Seitlicher Bildausschnitt ({chosen.pan} %)<input type="range" min="-100" max="100" value={chosen.pan} onChange={e=>update({pan:Number(e.target.value)})}/></label>
   <label>Übergang <select value={chosen.transition} onChange={e=>update({transition:e.target.value as CameraTimelineCueV400['transition']})}>
    <option value="smooth">Sanfte Kamerafahrt</option><option value="cut">Direkter Schnitt</option>
   </select></label>
   {chosen.transition==='smooth'&&<label>Übergangsdauer ({chosen.transitionMs} ms)
    <input type="range" min="150" max="3000" step="50" value={chosen.transitionMs} onChange={e=>update({transitionMs:Number(e.target.value)})}/></label>}
   <button type="button" onClick={remove}>Diese Kameramarke löschen</button>
  </fieldset>}
  <strong>3D-Kameraprobe · {audition?choiceLabels[audition.shot]:"Ohne gespeicherte Marke"}</strong>
  <div className="v400-timeline-toolbar" aria-label="Modelle für die Vorschau">
   {dancers.map((d,i)=><label key={d.id}>Tänzer {i+1} · Modell
    <select value={modelOverrides[i]??(i===0?activeAvatar.id:available[i]?.id??"")}
     onChange={e=>setModelOverrides(previous=>({...previous,[i]:e.target.value}))}>
     <option value="">Demo-Figur</option>
     {available.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}
    </select>
   </label>)}
  </div>
  <MultiAvatarCameraCanvasV399 plan={plan} positions={positions} dancers={dancers}
   onPoseChange={()=>{}} reducedMotion={preferences.reducedMotion===true||activeCue.transition==='cut'}
   holdMs={activeCue.transitionMs} revision={orbitReset}/>
  <small>Die Vorschau nutzt eine Demo-Formation mit bis zu vier ausgewählten Modellen. Ihre freie Orbit-Rotation wird nicht gespeichert. In der Live-Regie wirken nur Marken des aktuell laufenden Tracks, wenn die tatsächlichen Tänzer sichtbar sind. Bereits vorhandene manuelle Kameravorgaben, Show-Timelines und Lyrics-Schutzzonen haben Vorrang. Zum Aktivieren ist kein V397-Modus erforderlich; V400 ist ein eigener manueller Zeitplan.</small>
 </section>;
}
