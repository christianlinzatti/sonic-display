"use client";
import {Suspense,useEffect,useMemo,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {OrbitControls,useGLTF} from '@react-three/drei';
import {AnimationMixer,type AnimationClip,type Group} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone as cloneSkinnedScene} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {retargetHumanoidClips,readRetargetCalibration} from './avatarAnimationRetarget';
import {timelinePosition,timelineWeights,type MotionTimeline} from './motionTimelineEngine';

function Preview({modelUrl,animationUrl,timeline,seconds}:{modelUrl:string;animationUrl?:string;timeline:MotionTimeline;seconds:number}){
 const {scene,animations}=useGLTF(modelUrl);
 const cloned=useMemo(()=>cloneSkinnedScene(scene),[scene]);
 const mixer=useMemo(()=>new AnimationMixer(cloned),[cloned]);
 const [external,setExternal]=useState<AnimationClip[]>([]);
 useEffect(()=>{
   let cancelled=false;setExternal([]);
   if(!animationUrl)return;
   new GLTFLoader().load(animationUrl,gltf=>{
     if(cancelled)return;
     const result=retargetHumanoidClips(gltf.animations,gltf.scene,cloned,readRetargetCalibration(modelUrl));
     setExternal(result.clips);
   },undefined,()=>{if(!cancelled)setExternal([]);});
   return()=>{cancelled=true;};
 },[animationUrl,cloned,modelUrl]);
 const catalog=useMemo(()=>[
   ...animations.map(c=>({name:c.name,clip:c})),
   ...external.map(c=>({name:`Imported: ${c.name}`,clip:c})),
 ],[animations,external]);
 const actions=useMemo(()=>catalog.map(c=>({...c,action:mixer.clipAction(c.clip)})),[catalog,mixer]);
 useEffect(()=>{mixer.stopAllAction();},[mixer,actions]);
 useEffect(()=>()=>{mixer.stopAllAction();mixer.uncacheRoot(cloned);},[mixer,cloned]);
 useFrame(()=>{
   const position=timelinePosition(timeline,seconds);
   const weights=timelineWeights(timeline,seconds);
   for(const {name,clip,action} of actions){
     const weight=weights[name]??0;
     if(weight<=.0001){action.enabled=false;continue;}
     if(!action.isRunning())action.reset().play();
     action.enabled=true;action.paused=true;
     action.setEffectiveWeight(weight);
     const active=timeline.segments.find(s=>s.clip===name&&position>=s.start&&position<s.start+s.duration);
     if(active)action.time=((position-active.start)*active.speed%Math.max(.01,clip.duration)+clip.duration)%clip.duration;
   }
   mixer.update(0);
 });
 return <primitive object={cloned} />;
}
export function MotionTimelinePreview3DV319({modelUrl,animationUrl,timeline,seconds}:{modelUrl:string|null;animationUrl?:string;timeline:MotionTimeline;seconds:number}){
 if(!modelUrl)return <p>Kein 3D-Avatar ausgewählt.</p>;
 return <section aria-label="3D Timeline Motion Vorschau V319" style={{minWidth:0}}>
   <div style={{height:320,borderRadius:10,overflow:'hidden',background:'#121b2a',border:'1px solid #495b75'}}>
     <Canvas camera={{position:[0,1.35,4.2],fov:42}} dpr={[1,1.4]}>
       <ambientLight intensity={1.1}/><directionalLight position={[3,6,5]} intensity={1.8}/>
       <Suspense fallback={null}><Preview modelUrl={modelUrl} animationUrl={animationUrl} timeline={timeline} seconds={seconds}/></Suspense>
       <OrbitControls enablePan={false} minDistance={2} maxDistance={8}/>
       <gridHelper args={[8,12,'#53657a','#293144']} position={[0,-1.05,0]}/>
     </Canvas>
   </div>
   <small>Die 3D-Vorschau verwendet dieselben Clip-Gewichte und Zeitpositionen wie die Mehrspur-Timeline. Externe GLB-Clips werden retargetet; ihr Aussehen hängt vom Rig ab. Es wird kein Spotify-Audio wiedergegeben.</small>
 </section>;
}
