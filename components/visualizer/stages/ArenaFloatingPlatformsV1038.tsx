"use client";

import {useFrame} from '@react-three/fiber';
import {useMemo,useRef} from 'react';
import type {Group,MeshBasicMaterial} from 'three';
import type {AudioFeatures} from '@/types/audio';
import {REST_FLOAT_V1067,sampleFloatingExperienceV1067,stepFloatingExperienceV1067,
 type FloatCueV1067,type FloatOffsetV1067} from '@/lib/arena360FloatingExperienceV1067';
import {useAdaptivePerformance} from '../adaptivePerformance';
import {floatingStagePlatformCountV1038,INITIAL_FLOATING_STAGE_V1038,
 planFloatingStageV1038,sampleFloatingPlatformV1038,stepFloatingStageV1038,
 type FloatingStageModeV1038,type FloatingStageStateV1038} from '@/lib/arena360FloatingStageV1038';

/** World-fixed scenic satellites above the petal perimeter: never a replacement
 * for avatar ground and never inside the rotating performer root. The small
 * platform count is tier-capped, with no shadows, new dynamic lights or IO.
 */
export function ArenaFloatingPlatformsV1038({audio,playing,reducedMotion,reactive,enabled=true,mode='auto',intensity=70,section='verse',floatingCueV1067,floatingEnabledV1067=false}:{
 audio:AudioFeatures;playing:boolean;reducedMotion:boolean;reactive:boolean;
 enabled?:boolean;mode?:FloatingStageModeV1038;intensity?:number;section?:string;
 floatingCueV1067?:FloatCueV1067;floatingEnabledV1067?:boolean;
}) {
 const {tier}=useAdaptivePerformance();
 const count=floatingStagePlatformCountV1038(tier);
 const indices=useMemo(()=>Array.from({length:count},(_,index)=>index),[count]);
 const platforms=useRef<(Group|null)[]>([]);
 const glow=useRef<(MeshBasicMaterial|null)[]>([]);
 const state=useRef<FloatingStageStateV1038>({...INITIAL_FLOATING_STAGE_V1038});
 const offsetsV1067=useRef<FloatOffsetV1067[]>([]);
 const heldCue=useRef(planFloatingStageV1038({enabled:true,playing:true,reducedMotion:false,
  reactive:true,mode:'auto',intensity:0,section:'verse',energy:0}));
 useFrame((_,delta)=>{
  const requested=planFloatingStageV1038({enabled,playing,reducedMotion,reactive,mode,intensity,section,
   energy:audio.energyEnvelope??audio.bass});
  // Freeze the visual pattern as well as the movement state when paused.
  // Otherwise changes to a buffered energy envelope could make parked stages bob.
  const cue=!playing&&enabled&&!reducedMotion?heldCue.current:requested;
  if(playing||!enabled||reducedMotion)heldCue.current=requested;
  state.current=stepFloatingStageV1038(state.current,delta,cue,{enabled,playing,reducedMotion});
  for(let i=0;i<count;i++){
   const p=platforms.current[i];if(!p)continue;
   const sample=sampleFloatingPlatformV1038(i,count,state.current,reducedMotion?{...cue,wave:0}:cue);
   const offset=stepFloatingExperienceV1067(offsetsV1067.current[i]??REST_FLOAT_V1067,
    delta,sampleFloatingExperienceV1067(i,count,floatingCueV1067??{active:false,formation:'halo',power:0,phase:0}),{
     enabled:floatingEnabledV1067&&enabled,playing,reducedMotion,lowTier:tier==='low',
    });
   offsetsV1067.current[i]=offset;
   const theta=Math.atan2(sample.z,sample.x)+offset.yaw;
   const radius=Math.hypot(sample.x,sample.z)+offset.radial;
   p.position.set(Math.cos(theta)*radius,sample.y+offset.rise,Math.sin(theta)*radius);
   p.rotation.y=-state.current.angle*.32+offset.yaw;
   const led=glow.current[i];if(led)led.opacity=Math.min(.75,sample.glow+offset.glow);
  }
 });
 if(!enabled)return null;
 return <group name="v1038-world-fixed-floating-stage" position={[0,-1.82,0]}>
  {indices.map(i=><group key={i} name={`v1038-floating-platform-${i}`} ref={node=>{platforms.current[i]=node;}}>
   <mesh name="v1038-hover-platform-body">
    <cylinderGeometry args={[.30,.26,.11,24]}/>
    <meshStandardMaterial color="#1b2d49" metalness={.76} roughness={.32}/>
   </mesh>
   <mesh position={[0,.065,0]} rotation={[-Math.PI/2,0,0]}>
    <circleGeometry args={[.275,24]}/>
    <meshStandardMaterial color="#29445e" metalness={.65} roughness={.30}/>
   </mesh>
   <mesh position={[0,.069,0]} rotation={[-Math.PI/2,0,0]}>
    <ringGeometry args={[.21,.27,32]}/>
    <meshBasicMaterial ref={node=>{glow.current[i]=node;}} color={i%2===0?'#37dffa':'#ee75ff'}
     transparent opacity={.54} depthWrite={false} toneMapped={false} side={2}/>
   </mesh>
   <mesh position={[0,-.070,0]} rotation={[-Math.PI/2,0,0]}>
    <ringGeometry args={[.22,.29,24]}/>
    <meshBasicMaterial color="#7697e5" transparent opacity={.32} depthWrite={false} toneMapped={false} side={2}/>
   </mesh>
  </group>)}
 </group>;
}
