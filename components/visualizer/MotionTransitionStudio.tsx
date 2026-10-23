"use client";
import { Suspense,useCallback,useEffect,useMemo,useRef,useState } from "react";
import { Canvas,useFrame } from "@react-three/fiber";
import { OrbitControls,useGLTF } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkinnedScene } from "three/examples/jsm/utils/SkeletonUtils.js";
import { AnimationMixer, type AnimationClip, type AnimationAction } from "three";
import { retargetHumanoidClips,readRetargetCalibration } from "./avatarAnimationRetarget";
import type { InstalledCharacterMotion } from "./characterMotionLibrary";
import { nextBeatBoundary,readMotionTransitionSettings,saveMotionTransitionSettings,type MotionTransitionSettings } from "./motionTransitionStudioSettings";
import type { AvatarModel } from "./avatarModels";
import { findMotionMatch } from "./smartMotionMatching";

type Prepared = {id:string;clip:AnimationClip};
function PreviewActor({modelUrl,from,to,duration,request,onStatus}:{modelUrl:string;from:InstalledCharacterMotion;to:InstalledCharacterMotion;duration:number;request:number;onStatus:(message:string)=>void}){
 const {scene}=useGLTF(modelUrl);
 const rig=useMemo(()=>cloneSkinnedScene(scene),[scene]);
 const mixer=useMemo(()=>new AnimationMixer(rig),[rig]);
 const [clips,setClips]=useState<Prepared[]>([]);
 const active=useRef<AnimationAction|null>(null);
 const seen=useRef(0);
 const callback=useRef(onStatus);callback.current=onStatus;
 useEffect(()=>{let cancelled=false;setClips([]);
  const loader=new GLTFLoader();Promise.allSettled([from,to].map(m=>loader.loadAsync(m.url))).then(results=>{
   if(cancelled)return;
   const next:Prepared[]=[];
   results.forEach((result,index)=>{if(result.status!=="fulfilled"){callback.current(`GLB ${index+1} konnte nicht geladen werden.`);return;}
    const retargeted=retargetHumanoidClips(result.value.animations,result.value.scene,rig,readRetargetCalibration(modelUrl));
    const clip=retargeted.clips[0];if(clip)next.push({id:index===0?from.id:to.id,clip});
   });setClips(next);
   if(next.length!==2)callback.current("Nicht beide Motions besitzen kompatible Animationsspuren. Vorschau eingeschränkt.");
   else callback.current("Beide Motions geladen. Übergang kann gestartet werden.");
  });return()=>{cancelled=true;};
 },[from.id,from.url,to.id,to.url,modelUrl,rig]);
 useEffect(()=>{
  mixer.stopAllAction();active.current=null;
  const first=clips.find(c=>c.id===from.id);if(!first)return;
  active.current=mixer.clipAction(first.clip);active.current.reset().fadeIn(0.01).play();
  return()=>{mixer.stopAllAction();};
 },[mixer,clips,from.id]);
 useEffect(()=>{if(request<=0||request===seen.current)return;seen.current=request;
  const next=clips.find(c=>c.id===to.id);if(!next)return;
  const match = active.current ? findMotionMatch(active.current.getClip(), next.clip, active.current.time) : null;
  const action=mixer.clipAction(next.clip);action.reset().setEffectiveWeight(1).play();
  if(match && match.comparedTracks > 0 && Number.isFinite(match.score)) action.time = match.time;
  if(active.current && active.current!==action)active.current.crossFadeTo(action,Math.max(0.1,duration),true);
  active.current=action;
  callback.current(match && match.comparedTracks > 0 ? `Motion-Matching: Übergang bei ${match.time.toFixed(2)} s, ${match.comparedTracks} gemeinsame Spuren.` : `Crossfade gestartet (${duration.toFixed(2)} s; keine vergleichbaren Spuren).`);
 },[request,clips,to.id,duration,mixer]);
 useFrame((_,delta)=>mixer.update(Math.min(delta,0.07)));
 return <primitive object={rig}/>;
}
export function MotionTransitionStudio({model,motions}:{model:AvatarModel;motions:InstalledCharacterMotion[]}){
 const [settings,setSettings]=useState<MotionTransitionSettings>(()=>readMotionTransitionSettings(model.id));
 const [request,setRequest]=useState(0);const [message,setMessage]=useState("");const [scheduled,setScheduled]=useState(false);
 const mounted=useRef(0);const pending=useRef<number|null>(null);
 useEffect(()=>{setSettings(readMotionTransitionSettings(model.id));setRequest(0);setScheduled(false);mounted.current=0;},[model.id]);
 const first=motions.find(m=>m.id===settings.fromId)??motions[0];
 const second=motions.find(m=>m.id===settings.toId&&m.id!==first?.id)??motions.find(m=>m.id!==first?.id);
 const update=(patch:Partial<MotionTransitionSettings>)=>setSettings(old=>({...old,...patch}));
 const trigger=useCallback(()=>{if(!first||!second)return;
  if(!settings.beatSync){setRequest(v=>v+1);return;}
  const now=performance.now()/1000;
  const planned=nextBeatBoundary(now,settings.bpm,settings.beatsPerBar,settings.beatOffset);
  pending.current=planned;setScheduled(true);setMessage(`Übergang für den nächsten ${settings.beatsPerBar}-Beat-Takt vorgemerkt.`);
 },[first,second,settings.beatSync,settings.bpm,settings.beatsPerBar,settings.beatOffset]);
 useEffect(()=>{if(!scheduled)return;let raf=0;const poll=()=>{
  if(pending.current!==null&&performance.now()/1000>=pending.current){pending.current=null;setScheduled(false);setRequest(v=>v+1);return;}
  raf=requestAnimationFrame(poll);
 };raf=requestAnimationFrame(poll);return()=>cancelAnimationFrame(raf);},[scheduled]);
 const canPlay=Boolean(model.url&&first&&second&&first.id!==second.id);
 return <section className="avatar-metadata-editor" aria-label="Motion Transition Studio V192">
  <h3>Motion Transition Studio · V231</h3><p>Zwei installierte GLB-Motions anhand von Pose und Bewegungsrichtung passend überblenden. Beat-Sync verwendet einen lokalen BPM-Taktgeber.</p>
  <label>Motion A<select value={first?.id??""} onChange={e=>update({fromId:e.target.value,toId:settings.toId===e.target.value?"":settings.toId})}>{motions.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
  <label>Motion B<select value={second?.id??""} onChange={e=>update({toId:e.target.value})}>{motions.filter(m=>m.id!==first?.id).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
  <label>Überblendung: {settings.duration.toFixed(2)} s<input type="range" min="0.1" max="4" step="0.05" value={settings.duration} onChange={e=>update({duration:Number(e.target.value)})}/></label>
  <label className="setting-check"><input type="checkbox" checked={settings.beatSync} onChange={e=>update({beatSync:e.target.checked})}/> Am nächsten Taktanfang auslösen</label>
  {settings.beatSync&&<><label>BPM<input type="number" min="60" max="240" value={settings.bpm} onChange={e=>update({bpm:Number(e.target.value)})}/></label><label>Beats pro Takt<input type="number" min="1" max="16" value={settings.beatsPerBar} onChange={e=>update({beatsPerBar:Number(e.target.value)})}/></label><label>Takt-Offset (0–1)<input type="number" min="0" max="1" step="0.05" value={settings.beatOffset} onChange={e=>update({beatOffset:Number(e.target.value)})}/></label></>}
  <button type="button" disabled={!canPlay||scheduled} onClick={trigger}>{scheduled?"Warte auf Takt …":"Übergang in 3D testen"}</button>{' '}
  <button type="button" disabled={!canPlay} onClick={()=>{saveMotionTransitionSettings({...settings,fromId:first!.id,toId:second!.id});setMessage("Übergangseinstellungen lokal gespeichert.");}}>Einstellungen speichern</button>
  {canPlay&&<div style={{height:320}}><Canvas camera={{position:[0,1.1,3.6],fov:45}} dpr={[1,1.5]}><ambientLight intensity={1.8}/><directionalLight position={[3,5,4]} intensity={2}/><Suspense fallback={null}><PreviewActor key={`${model.url}|${first!.id}|${second!.id}`} modelUrl={model.url!} from={first!} to={second!} duration={settings.duration} request={request} onStatus={setMessage}/></Suspense><OrbitControls makeDefault/></Canvas></div>}
  {!canPlay&&<small>Bitte mindestens zwei unterschiedliche Motions für diesen Avatar installieren.</small>}
  {message&&<p role="status">{message}</p>}
  <small>Die Vorschau ist eine Simulation. Der Takt ist nicht mit Spotify-Audio synchronisiert; bei inkompatiblen Rigs bleibt Retargeting nötig. Gespeicherte Studio-Einstellungen beeinflussen die Live-Bühne derzeit nicht automatisch.</small>
 </section>;
}
