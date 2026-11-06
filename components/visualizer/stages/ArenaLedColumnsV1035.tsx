"use client";
import {useFrame} from '@react-three/fiber';
import {useLayoutEffect,useMemo,useRef} from 'react';
import {Color,Object3D,type InstancedMesh} from 'three';
import type {AudioFeatures} from '@/types/audio';
import {useAdaptivePerformance} from '../adaptivePerformance';
import {createArenaColumnsV1035,planArenaTimelineV1035,sampleArenaColumnV1035} from '@/lib/arena360DirectorV1035';
/** Eight to sixteen world-fixed, low-poly kinetic light columns. Instanced = two draw calls. */
export function ArenaLedColumnsV1035({audio,playing,reducedMotion,reactive,enabled,directorEnabled,progressMs,durationMs,section,intensity}: {
 audio:AudioFeatures;playing:boolean;reducedMotion:boolean;reactive:boolean;enabled:boolean;directorEnabled:boolean;
 progressMs?:number;durationMs?:number;section?:string;intensity?:number;
}){
 const tier=useAdaptivePerformance().tier;
 const columns=useMemo(()=>createArenaColumnsV1035(tier),[tier]);
 const cores=useRef<InstancedMesh>(null),pixels=useRef<InstancedMesh>(null);
 const dummy=useMemo(()=>new Object3D(),[]),tint=useMemo(()=>new Color(),[]);
 const cyan=useMemo(()=>new Color('#4cdeff'),[]),pink=useMemo(()=>new Color('#ee6fe9'),[]);
 const budget=useRef(0),needsReset=useRef(true);
 useLayoutEffect(()=>{needsReset.current=true;},[columns]);
 useFrame((_,delta)=>{
  if(!enabled)return;
  const dt=Number.isFinite(delta)?Math.max(0,Math.min(.1,delta)):0;
  budget.current+=dt;
  if(budget.current<(tier==='low'?.13:.065)&&!needsReset.current)return;
  budget.current=0;needsReset.current=false;
  const cue=planArenaTimelineV1035({enabled:directorEnabled,playing,reducedMotion,reactive,progressMs,durationMs,section,energy:audio.energyEnvelope,intensity});
  const time=Number.isFinite(progressMs)?Math.max(0,(progressMs??0)/1000):0;
  for(let i=0;i<columns.length;i++){
   const c=columns[i],sample=sampleArenaColumnV1035(c,time,cue);
   dummy.position.set(c.x,-2.01+sample.height*.5,c.z);
   dummy.rotation.set(0,-c.angle+sample.twist,0);
   dummy.scale.set(1,sample.height,1);dummy.updateMatrix();
   cores.current?.setMatrixAt(i,dummy.matrix);
   dummy.position.set(c.x,-2.01+sample.height*.64,c.z);
   dummy.scale.set(1,Math.max(.18,sample.height*.54),1);dummy.updateMatrix();
   pixels.current?.setMatrixAt(i,dummy.matrix);
   pixels.current?.setColorAt(i,tint.copy(i%2===0?cyan:pink).multiplyScalar(sample.light));
  }
  if(cores.current)cores.current.instanceMatrix.needsUpdate=true;
  if(pixels.current){pixels.current.instanceMatrix.needsUpdate=true;if(pixels.current.instanceColor)pixels.current.instanceColor.needsUpdate=true;}
 });
 if(!enabled)return null;
 return <group name="v1035-kinetic-led-columns">
  <instancedMesh ref={cores} args={[undefined,undefined,columns.length]} frustumCulled={false}>
   <boxGeometry args={[.18,1,.17]}/><meshStandardMaterial color="#20334d" metalness={.7} roughness={.4}/>
  </instancedMesh>
  <instancedMesh ref={pixels} args={[undefined,undefined,columns.length]} frustumCulled={false}>
   <boxGeometry args={[.20,1,.185]}/><meshBasicMaterial color="#ffffff" toneMapped={false}/>
  </instancedMesh>
 </group>;
}
