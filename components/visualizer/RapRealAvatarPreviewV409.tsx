"use client";

import {useEffect,useMemo,useRef,useState} from "react";
import {useFrame} from "@react-three/fiber";
import {useGLTF} from "@react-three/drei";
import {clone as cloneSkinnedScene} from "three/examples/jsm/utils/SkeletonUtils.js";
import {AnimationMixer,Box3,Vector3,type AnimationAction,type AnimationClip,type Object3D,type Mesh,type Quaternion} from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {collectAvatarRigNodes} from "./avatarRigController";
import type {AvatarRigProfileId} from "./avatarRigProfiles";
import type {RapPerformanceEditorSettingsV408} from "./rapPerformanceEditorV408";
import type {RapPreviewMotionV410} from "./rapMotionPreviewV410";
import {sampleRapTimelineV411,type RapTimelineItemV411} from "./rapMotionTimelineV411";
import {readRetargetCalibration,retargetHumanoidClips} from "./avatarAnimationRetarget";

export type RapRigInfoV409={parts:string[];mouth:boolean;note:string};
export type RapMotionInfoV410={message:string;clipCount:number;matchedTracks:number};
type Props={url:string;mouthPreviewV418?:number|null;settings:RapPerformanceEditorSettingsV408;section:"verse"|"hook";playing:boolean;reducedMotion:boolean;rigProfile:AvatarRigProfileId;onRigInfo:(info:RapRigInfoV409)=>void;
  motion:RapPreviewMotionV410|null;motionSpeed:number;onEmbeddedClips:(names:string[])=>void;onMotionInfo:(info:RapMotionInfoV410)=>void;
  timeline?:ReadonlyArray<RapTimelineItemV411>;timelineMotions?:ReadonlyArray<RapPreviewMotionV410>;timelineLoop?:boolean;timelineSeek?:{position:number;token:number};onTimelineClock?:(seconds:number)=>void};
type Morph={mesh:Mesh;index:number};
const pickMorph=(dict:Record<string,number>,patterns:RegExp[])=>Object.entries(dict).find(([name])=>patterns.some(pattern=>pattern.test(name)))?.[1];
const gain=(n:number)=>Math.max(0,Math.min(1.5,n/100));

/** Clones the loaded skinned hierarchy so preview pose/morphs never mutate the cached scene or the live stage. */
export function RapRealAvatarPreviewV409({url,mouthPreviewV418=null,settings,section,playing,reducedMotion,rigProfile,onRigInfo,motion,motionSpeed,onEmbeddedClips,onMotionInfo,timeline,timelineMotions=[],timelineLoop=true,timelineSeek,onTimelineClock}:Props){
  const {scene,animations}=useGLTF(url);
  useEffect(()=>onEmbeddedClips(animations.map(clip=>clip.name)),[animations,onEmbeddedClips]);
  const clone=useMemo(()=>cloneSkinnedScene(scene),[scene]);
  const clock=useRef(0);
  const mixer=useMemo(()=>new AnimationMixer(clone),[clone]);
  const [external,setExternal]=useState<{url:string;clips:AnimationClip[];matchedTracks:number;error?:string}|null>(null);
  // The external loader is separate from useGLTF so an invalid motion cannot hide the avatar.
  useEffect(()=>{
    if(timeline||!motion||motion.kind!=="installed"||!motion.url){setExternal(null);return;}
    let cancelled=false;
    const motionUrl=motion.url;
    setExternal(null);
    new GLTFLoader().load(motionUrl,gltf=>{
      if(cancelled)return;
      try{
        const result=retargetHumanoidClips(gltf.animations,gltf.scene,clone,readRetargetCalibration(url));
        setExternal({url:motionUrl,clips:result.clips.filter(c=>c.tracks.length>0),matchedTracks:result.report.matchedTracks});
      }catch(error){setExternal({url:motionUrl,clips:[],matchedTracks:0,error:error instanceof Error?error.message:"Retargeting fehlgeschlagen"});}
    },undefined,()=>{if(!cancelled)setExternal({url:motionUrl,clips:[],matchedTracks:0,error:"Motion-Datei konnte nicht geladen werden (URL/CORS/Dateiformat)."});});
    return()=>{cancelled=true;};
  },[motion?.kind,motion?.url,clone,url,Boolean(timeline)]);
  const clip=useMemo(()=>{
    if(timeline||!motion)return null;
    if(motion.kind==="embedded")return animations[motion.index??-1]??null;
    return external?.url===motion.url?(external?.clips[0]??null):null;
  },[motion,animations,external,Boolean(timeline)]);
  useEffect(()=>{
    // Remove the previous overlay before stopping or switching the action.
    for(const {obj,quat} of overlaid.current)obj.quaternion.copy(quat);
    for(const {mesh,index,value} of overlaidMorphs.current){if(mesh.morphTargetInfluences)mesh.morphTargetInfluences[index]=value;}
    overlaid.current=[];overlaidMorphs.current=[];
    mixer.stopAllAction();
    if(timeline||!clip)return;
    const action=mixer.clipAction(clip);
    action.reset().play();action.setEffectiveWeight(1);
    mixer.update(0);
    return()=>{action.stop();mixer.stopAllAction();};
  },[mixer,clip,Boolean(timeline)]);
  useEffect(()=>()=>{mixer.stopAllAction();mixer.uncacheRoot(clone);},[mixer,clone]);
  useEffect(()=>{
    if(timeline)return;
    if(!motion){onMotionInfo({message:"Nur Rap-Gesten, keine Tanz-Motion ausgewählt.",clipCount:0,matchedTracks:0});return;}
    if(motion.kind==="installed"&&external?.url!==motion.url){onMotionInfo({message:"Installierte Motion wird geladen und auf den Avatar übertragen …",clipCount:0,matchedTracks:0});return;}
    if(!clip){onMotionInfo({message:external?.error??"Keine kompatiblen Animationstracks gefunden. Rap-Gesten bleiben verfügbar.",clipCount:0,matchedTracks:external?.matchedTracks??0});return;}
    onMotionInfo({message:motion.kind==="embedded"?`Eingebetteter Clip: ${clip.name} · ${clip.duration.toFixed(1)} s`:`Installierte Motion: ${clip.name} · ${clip.duration.toFixed(1)} s · ${external?.matchedTracks??0} Retarget-Tracks`,clipCount:1,matchedTracks:external?.matchedTracks??0});
  },[motion,external,clip,onMotionInfo,Boolean(timeline)]);
  // V411: timeline uses the *same cloned avatar* and mixer, with individual
  // AnimationActions for repeated slots. External GLBs are loaded only in the
  // preview; their contents never mutate the live avatar or saved motion store.
  const timelineUrls=useMemo(()=>{
    if(!timeline)return [];
    return [...new Set(timelineMotions.filter(m=>m.kind==="installed"&&m.url&&timeline.some(slot=>slot.motionId===m.id)).map(m=>m.url!))];
  },[timeline,timelineMotions]);
  const timelineUrlKey=timelineUrls.join("\n");
  const [timelineExternal,setTimelineExternal]=useState<Record<string,{clip:AnimationClip|null;matched:number;error?:string}>>({});
  useEffect(()=>{
    if(!timeline){setTimelineExternal({});return;}
    let disposed=false;
    setTimelineExternal({});
    for(const sourceUrl of timelineUrls){
      new GLTFLoader().load(sourceUrl,gltf=>{
        if(disposed)return;
        try{
          const result=retargetHumanoidClips(gltf.animations,gltf.scene,clone,readRetargetCalibration(url));
          setTimelineExternal(old=>({...old,[sourceUrl]:{clip:result.clips.find(c=>c.tracks.length>0)??null,matched:result.report.matchedTracks}}));
        }catch(error){setTimelineExternal(old=>({...old,[sourceUrl]:{clip:null,matched:0,error:error instanceof Error?error.message:"Retargeting fehlgeschlagen"}}));}
      },undefined,()=>{if(!disposed)setTimelineExternal(old=>({...old,[sourceUrl]:{clip:null,matched:0,error:"Motion nicht geladen (URL/CORS)"}}));});
    }
    return()=>{disposed=true;};
  // Changes in slot order/crossfade do not refetch unchanged external GLBs.
  },[timelineUrlKey,clone,url,Boolean(timeline)]);
  const timelineActions=useMemo(()=>{
    if(!timeline)return [] as Array<{id:string;action:AnimationAction}>;
    const all:Array<{id:string;action:AnimationAction}>=[];
    for(const item of timeline){
      const source=timelineMotions.find(m=>m.id===item.motionId);
      let base:AnimationClip|null=null;
      if(source?.kind==="embedded")base=animations[source.index??-1]??null;
      else if(source?.url)base=timelineExternal[source.url]?.clip??null;
      if(base?.tracks.length){
        // Clone for independent time cursors when the same dance occurs twice.
        const unique=base.clone();unique.name=`v411_${item.id}`;
        const action=mixer.clipAction(unique);
        all.push({id:item.id,action});
      }
    }
    return all;
  },[timeline,animations,timelineMotions,timelineExternal,mixer]);
  useEffect(()=>{
    if(!timeline)return;
    for(const {obj,quat} of overlaid.current)obj.quaternion.copy(quat);
    for(const {mesh,index,value} of overlaidMorphs.current){if(mesh.morphTargetInfluences)mesh.morphTargetInfluences[index]=value;}
    overlaid.current=[];overlaidMorphs.current=[];
    mixer.stopAllAction();
    for(const {action} of timelineActions){action.reset().play().setEffectiveTimeScale(0).setEffectiveWeight(0);}
    mixer.update(0);
    return()=>{for(const {action} of timelineActions){action.stop();mixer.uncacheAction(action.getClip(),clone);}};
  },[timelineActions,mixer,Boolean(timeline)]);
  useEffect(()=>{
    if(!timeline)return;
    const needed=timeline.length;
    const ready=timelineActions.length;
    const failures=Object.values(timelineExternal).filter(item=>item.error||!item.clip).length;
    onMotionInfo({message:needed===0?"Timeline ist leer – füge eine Tanz-Motion hinzu.":`${ready}/${needed} Timeline-Clips geladen${failures?` · ${failures} inkompatibel oder nicht erreichbar`:""} · V411 Crossfades`,clipCount:ready,matchedTracks:Object.values(timelineExternal).reduce((sum,item)=>sum+item.matched,0)});
  },[timeline,timelineActions,timelineExternal,onMotionInfo]);
  const lastTimelineSeek=useRef(-1);
  const timelineNotify=useRef(0);
  // Restore the untouched mixer pose before every animation update. This avoids
  // additive Rap gestures accumulating on joints the dance clip does not keyframe.
  const overlaid=useRef<Array<{obj:Object3D;quat:Quaternion}>>([]);
  const overlaidMorphs=useRef<Array<{mesh:Mesh;index:number;value:number}>>([]);
  const {targets,description}=useMemo(()=>collectAvatarRigNodes(clone,rigProfile),[clone,rigProfile]);
  const morphs=useMemo(()=>{
    const list:Morph[]=[];
    clone.traverse(obj=>{
      const mesh=obj as Mesh;
      const dict=mesh.morphTargetDictionary;
      if(!dict || !mesh.morphTargetInfluences)return;
      const index=pickMorph(dict,[/^viseme_aa$/i,/^jawopen$/i,/^mouthopen$/i,/^viseme_a$/i,/^aa$/i,/^a$/i]);
      if(index!==undefined)list.push({mesh,index});
    });
    return list;
  },[clone]);
  const bounds=useMemo(()=>{
    clone.updateMatrixWorld(true);
    const box=new Box3().setFromObject(clone);
    const size=box.getSize(new Vector3());
    const center=box.getCenter(new Vector3());
    if(!Number.isFinite(size.y)||size.y<=.000001 || !Number.isFinite(center.x+center.y+center.z))return {scale:1,position:[0,0,0] as [number,number,number]};
    const scale=Math.min(1000,Math.max(.00001,2.4/Math.max(size.x,size.y,size.z)));
    return {scale,position:[-center.x*scale,-center.y*scale,-center.z*scale] as [number,number,number]};
  },[clone]);
  useEffect(()=>{
    const parts=(Object.entries(targets) as Array<[string,Object3D|undefined]>).filter(([,v])=>!!v).map(([k])=>k);
    onRigInfo({parts,mouth:morphs.length>0||!!targets.jaw,note:parts.length?description:"Kein unterstütztes Humanoid-Rig gefunden – Modell ist sichtbar, Körpergesten eventuell nicht verfügbar."});
  },[targets,morphs.length,description,onRigInfo]);
  useFrame((_,delta)=>{
    // Restore the pose before the last Rap overlay, leaving the mixer fully in charge
    // of its own keyframed dance motion and any morph tracks.
    for(const {obj,quat} of overlaid.current)obj.quaternion.copy(quat);
    for(const {mesh,index,value} of overlaidMorphs.current){if(mesh.morphTargetInfluences)mesh.morphTargetInfluences[index]=value;}
    overlaid.current=[];overlaidMorphs.current=[];
    const active=playing&&!reducedMotion;
    const dt=Math.min(.08,Math.max(0,delta));
    if(timeline&&timelineSeek&&timelineSeek.token!==lastTimelineSeek.current){
      clock.current=timelineSeek.position;lastTimelineSeek.current=timelineSeek.token;
    }
    if(active){
      const advance=dt*Math.max(.25,Math.min(1.75,motionSpeed));
      if(timeline){
        const duration=sampleRapTimelineV411(timeline,0).duration;
        clock.current=timelineLoop||clock.current<duration?clock.current+advance:duration;
      }else clock.current+=dt;
    }
    const timelineFrame=timeline?sampleRapTimelineV411(timeline,clock.current,timelineLoop):null;
    if(timelineFrame){
      clock.current=timelineFrame.time;
      const availableWeight=timelineActions.reduce((sum,{id})=>sum+(timelineFrame.active.find(item=>item.id===id)?.weight??0),0);
      for(const {id,action} of timelineActions){
        const sampled=timelineFrame.active.find(item=>item.id===id);
        const clipDuration=action.getClip().duration;
        action.time=sampled&&clipDuration>0?sampled.localSec%clipDuration:0;
        action.setEffectiveWeight(availableWeight>0?(sampled?.weight??0)/availableWeight:0);
      }
      mixer.update(0);
      timelineNotify.current+=dt;
      if(onTimelineClock&&(timelineNotify.current>=.14||!active&&timelineNotify.current>=.3)){
        timelineNotify.current=0;onTimelineClock(timelineFrame.time);
      }
    }else mixer.update(active&&clip?dt*Math.max(.25,Math.min(1.75,motionSpeed)):0);
    const t=clock.current;
    const activeSection=timelineFrame?.section??section;
    const beat=t*2.2;const phase=((beat%1)+1)%1;
    const kick=active?Math.exp(-phase*13)*gain(settings.kick):0;
    const snare=active?Math.exp(-((phase+.5)%1)*13)*gain(settings.snare):0;
    const timelineRapGain=timelineFrame?.active.reduce((sum,item)=>sum+item.weight*(item.rapGain/100),0)??1;
    const flow=active?Math.max(0,Math.sin(t*9))*gain(activeSection==="hook"?settings.hook:settings.verse)*timelineRapGain:0;
    const nod=(snare*.14+flow*.04)*gain(settings.head);
    const chest=kick*.09;
    const gesture=(snare*.17+flow*(activeSection==="hook"?.19:.075))*gain(settings.gestures);
    const mouth=active?(mouthPreviewV418===null?Math.abs(Math.sin(t*11))*.52*gain(settings.lipSync):Math.max(0,Math.min(1,mouthPreviewV418))*gain(settings.lipSync)):0;
    const overlay=(obj:Object3D|undefined,x:number,z:number)=>{
      if(!obj||(!x&&!z))return;
      // A dance animation and a Rap accent are layered, never replace one another.
      if(!overlaid.current.some(entry=>entry.obj===obj))overlaid.current.push({obj,quat:obj.quaternion.clone()});
      obj.rotation.x+=x;obj.rotation.z+=z;
    };
    overlay(targets.head,-nod,active?Math.sin(t*2.1)*.035:0);
    overlay(targets.neck,-nod*.3,0);
    overlay(targets.spine,-chest*.38,active?Math.sin(t*2.3)*.018:0);
    overlay(targets.chest,-chest,0);
    overlay(targets.leftArm,0,-gesture);
    overlay(targets.rightArm,0,gesture);
    if(!morphs.length)overlay(targets.jaw,mouth*.22,0);
    for(const {mesh,index} of morphs){
      const influences=mesh.morphTargetInfluences;
      if(!influences||!mouth)continue;
      overlaidMorphs.current.push({mesh,index,value:influences[index]??0});
      influences[index]=Math.min(1,Math.max(influences[index]??0,mouth));
    }
  });
  return <group position={bounds.position} scale={bounds.scale}><primitive object={clone} dispose={null}/></group>;
}
