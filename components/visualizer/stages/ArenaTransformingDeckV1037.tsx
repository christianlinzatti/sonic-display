"use client";
import {useFrame} from '@react-three/fiber';
import {useMemo,useRef} from 'react';
import type {Group,MeshBasicMaterial} from 'three';
import type {AudioFeatures} from '@/types/audio';
import {useAdaptivePerformance} from '../adaptivePerformance';
import {arenaPetalCountV1037,INITIAL_ARENA_TRANSFORMATION_V1037,planArenaTransformationV1037,
  sampleArenaPetalV1037,stepArenaTransformationV1037,type ArenaTransformationModeV1037,
  type ArenaTransformationStateV1037,type ArenaPetalPatternV1037} from '@/lib/arena360TransformationV1037';
const TAU=Math.PI*2;
/** The entire moving structure is purely SCENIC outside the stable avatar deck.
 * No physics, camera takeover, network access, dynamic geometry or extra lights. */
export function ArenaTransformingDeckV1037({audio,playing,reducedMotion,reactive,enabled=true,
 mode='auto',strength=70,section='verse'}:{audio:AudioFeatures;playing:boolean;reducedMotion:boolean;reactive:boolean;
 enabled?:boolean;mode?:ArenaTransformationModeV1037;strength?:number;section?:string}){
 const {tier}=useAdaptivePerformance();
 const count=arenaPetalCountV1037(tier);
 const petals=useMemo(()=>Array.from({length:count},(_,i)=>i),[count]);
 const nodes=useRef<(Group|null)[]>([]);
 const leds=useRef<(MeshBasicMaterial|null)[]>([]);
 const state=useRef<ArenaTransformationStateV1037>({...INITIAL_ARENA_TRANSFORMATION_V1037});
 const heldPattern=useRef<ArenaPetalPatternV1037>('closed');
 useFrame((_,delta)=>{
  const cue=planArenaTransformationV1037({enabled,playing,reducedMotion,reactive,section,mode,strength,
   energy:audio.energyEnvelope??audio.bass});
  state.current=stepArenaTransformationV1037(state.current,delta,cue,{playing,enabled,reducedMotion});
  if(!enabled||reducedMotion)heldPattern.current='closed';
  else if(playing)heldPattern.current=cue.pattern;
  const pattern=heldPattern.current;
  for(let i=0;i<count;i++){
   const petal=nodes.current[i];if(!petal)continue;
   const sample=sampleArenaPetalV1037(i,count,state.current,pattern);
   petal.position.set(sample.x,sample.y,sample.z);
   petal.rotation.y=sample.twist;
   const led=leds.current[i];if(led)led.opacity=cue.brightness;
  }
 });
 if(!enabled)return null;
 return <group name="v1037-transforming-petal-deck" position={[0,-1.82,0]}>
  {petals.map(i=><group key={i} ref={node=>{nodes.current[i]=node;}} name={`v1037-petal-${i}`}>
   <mesh rotation={[-Math.PI/2,0,0]}>
    <ringGeometry args={[2.86,3.14,14,1,TAU*i/count+.02,TAU/count-.04]}/>
    <meshStandardMaterial color="#17233b" metalness={.72} roughness={.34} side={2}/>
   </mesh>
   <mesh position={[0,.008,0]} rotation={[-Math.PI/2,0,0]}>
    <ringGeometry args={[3.035,3.10,14,1,TAU*i/count+.03,TAU/count-.06]}/>
    <meshBasicMaterial ref={node=>{leds.current[i]=node;}} color={i%2===0?'#3ce7ff':'#e56aff'}
      transparent opacity={.38} depthWrite={false} toneMapped={false} side={2}/>
   </mesh>
  </group>)}
 </group>;
}
