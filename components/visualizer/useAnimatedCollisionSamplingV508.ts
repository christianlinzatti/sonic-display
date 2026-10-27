"use client";
/** V508 optional rig sampler: reads only cloned bones, never touches mixer/IK.
 * Kept outside GltfDancerAvatar's complex clip scheduler for maintainability.
 */
import {useContext,useEffect,useMemo,useRef,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import type {Group,Object3D} from 'three';
import {AnimatedBodyContextV508} from './ThreeAvatarContextsV492';
import {findAnimatedBonesV508,sampleAnimatedGlbV508} from './measureAnimatedGlbV508';
import {getActivePerformanceTier} from './adaptivePerformance';
import {readPiConcertBudgetV479} from './piConcertRuntimeV479';
import {optionalBodySampleHzV511} from './concertStageQualityV511';
import type {BodyProfileV507} from './avatarBodyAwarenessV507';
interface Args {model:Object3D;root:RefObject<Group|null>;profile:BodyProfileV507;
 workloadSlot:number;modelUrl:string;assetUrl?:string;avatarScale:number;
 isPlaying:boolean;reducedMotion:boolean;castCount:number;}
export function useAnimatedCollisionSamplingV508({model,root,profile,workloadSlot,modelUrl,
 assetUrl,avatarScale,isPlaying,reducedMotion,castCount}:Args):void {
 const registry=useContext(AnimatedBodyContextV508);
 const bones=useMemo(()=>findAnimatedBonesV508(model),[model]);
 const identity=`${modelUrl}|${assetUrl??modelUrl}|${avatarScale}|${workloadSlot}`;
 const sampledAt=useRef(-Infinity);
 useEffect(()=>{
   sampledAt.current=-Infinity;
   return ()=>registry?.clear(workloadSlot,identity);
 },[registry,identity,workloadSlot]);
 useEffect(()=>{
   if(!isPlaying||reducedMotion){sampledAt.current=-Infinity;registry?.clear(workloadSlot,identity);}
 },[registry,identity,workloadSlot,isPlaying,reducedMotion]);
 // Registered after the existing clip/overlay hooks in GltfDancerAvatar;
 // does not take render loop ownership (priority remains at default 0).
 useFrame(state=>{
   if(!registry||!isPlaying||reducedMotion)return;
   const tier=getActivePerformanceTier();if(tier==='low')return;
   const hz=optionalBodySampleHzV511(tier,readPiConcertBudgetV479(),castCount);
   const now=state.clock.elapsedTime,cadence=1/hz;
   if(now>=sampledAt.current&&now-sampledAt.current<cadence)return;
   sampledAt.current=now;
   const group=root.current;
   // Solo can keep partner mounted at scale 0.001. Do not sample ghosts.
   if(!group||!group.visible||!group.parent?.visible||Math.abs(group.parent.scale.x)<.03)return;
   const sample=sampleAnimatedGlbV508(bones,profile,now);
   if(sample)registry.set(workloadSlot,identity,sample);
 });
}
