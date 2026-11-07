"use client";
import {useFrame} from '@react-three/fiber';
import {useMemo,useRef} from 'react';
import type {Group,MeshBasicMaterial} from 'three';
import type {AudioFeatures} from '@/types/audio';
import {INITIAL_STAGE_PETAL_V1066,sampleStagePetalV1066,stepStagePetalV1066,
 type StageFormationCueV1066,type StagePetalOffsetV1066} from '@/lib/arena360TransformingStageV1066';
import {useAdaptivePerformance} from '../adaptivePerformance';
import {arenaPetalCountV1037,INITIAL_ARENA_TRANSFORMATION_V1037,planArenaTransformationV1037,
  sampleArenaPetalV1037,stepArenaTransformationV1037,type ArenaTransformationModeV1037,
  type ArenaTransformationStateV1037,type ArenaPetalPatternV1037} from '@/lib/arena360TransformationV1037';
const TAU=Math.PI*2;
/** The entire moving structure is purely SCENIC outside the stable avatar deck.
 * No physics, camera takeover, network access, dynamic geometry or extra lights. */
export function ArenaTransformingDeckV1037({audio,playing,reducedMotion,reactive,enabled=true,
 mode='auto',strength=70,section='verse',stageCueV1066,stageEnabledV1066=false}:{audio:AudioFeatures;playing:boolean;reducedMotion:boolean;reactive:boolean;
 enabled?:boolean;mode?:ArenaTransformationModeV1037;strength?:number;section?:string;
 stageCueV1066?:StageFormationCueV1066;stageEnabledV1066?:boolean}){
 const {tier}=useAdaptivePerformance();
 const count=arenaPetalCountV1037(tier);
 const petals=useMemo(()=>Array.from({length:count},(_,i)=>i),[count]);
 const nodes=useRef<(Group|null)[]>([]);
 const leds=useRef<(MeshBasicMaterial|null)[]>([]);
 const state=useRef<ArenaTransformationStateV1037>({...INITIAL_ARENA_TRANSFORMATION_V1037});
 const stageOffsetsV1066=useRef<StagePetalOffsetV1066[]>([]);
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
   const extra=stepStagePetalV1066(stageOffsetsV1066.current[i]??INITIAL_STAGE_PETAL_V1066,
     delta,sampleStagePetalV1066(i,count,stageCueV1066??{active:false,shape:'halo',amount:0,phase:0}),{
      enabled:stageEnabledV1066&&enabled&&mode==='auto',playing,reducedMotion,lowTier:tier==='low',
     });
   stageOffsetsV1066.current[i]=extra;
   // Sector offsets remain fully outside the stable central performer platform.
   const angle=sample.angle;
   petal.position.set(sample.x+Math.cos(angle)*extra.radial,
     sample.y+extra.lift,sample.z-Math.sin(angle)*extra.radial);
   petal.rotation.y=sample.twist+extra.yaw;
   const led=leds.current[i];if(led)led.opacity=Math.min(.83,cue.brightness+extra.ledBonus);
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
