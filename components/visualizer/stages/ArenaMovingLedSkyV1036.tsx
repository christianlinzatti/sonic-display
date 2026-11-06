"use client";
import {useFrame} from '@react-three/fiber';
import {useLayoutEffect,useMemo,useRef} from 'react';
import {Color,Object3D,type InstancedMesh} from 'three';
import type {AudioFeatures} from '@/types/audio';
import {useAdaptivePerformance} from '../adaptivePerformance';
import type {ArenaPeakStateV1036} from '@/lib/arena360AtmosphereV1036';
import {createArenaSkyPixelsV1036,planArenaAtmosphereV1036,sampleArenaSkyPixelV1036} from '@/lib/arena360AtmosphereV1036';
/** Segmented suspended LED canopy. No ceiling surface that hides aerial cameras. */
export function ArenaMovingLedSkyV1036({audio,playing,reducedMotion,reactive,enabled,directorEnabled,
 section,progressMs,durationMs,intensity,peakRef}: {
 audio:AudioFeatures;playing:boolean;reducedMotion:boolean;reactive:boolean;enabled:boolean;directorEnabled:boolean;
 section?:string;progressMs?:number;durationMs?:number;intensity?:number;
 peakRef?:{readonly current:ArenaPeakStateV1036};
}){
 const tier=useAdaptivePerformance().tier;
 const pixels=useMemo(()=>createArenaSkyPixelsV1036(tier),[tier]);
 const mesh=useRef<InstancedMesh>(null),dummy=useMemo(()=>new Object3D(),[]);
 const tint=useMemo(()=>new Color(),[]),blue=useMemo(()=>new Color('#42dbe9'),[]);
 const pink=useMemo(()=>new Color('#d97cff'),[]),budget=useRef(.2),clock=useRef(0),wasAnimated=useRef(true);
 useLayoutEffect(()=>{budget.current=.2;},[pixels]);
 useFrame((_,delta)=>{
  if(!enabled||!mesh.current)return;
  const dt=Number.isFinite(delta)?Math.max(0,Math.min(.1,delta)):0;
  const active=playing&&!reducedMotion&&reactive&&directorEnabled;
  if(active)clock.current+=dt;
  if(!active&&!wasAnimated.current)return;
  budget.current+=dt;
  if(active&&budget.current<(tier==='low'?.125:.07))return;
  budget.current=0;wasAnimated.current=active;
  const cue=planArenaAtmosphereV1036({enabled:directorEnabled,playing,reducedMotion,reactive,
   section,progressMs,durationMs,energy:audio.energyEnvelope,intensity,peak:peakRef?.current.energy});
  for(let i=0;i<pixels.length;i++){
   const p=pixels[i],sample=sampleArenaSkyPixelV1036(p,clock.current,cue);
   dummy.position.set(Math.cos(p.angle)*p.radius,p.y+sample.lift,Math.sin(p.angle)*p.radius);
   dummy.rotation.set(0,-p.angle,0);dummy.scale.set(1,1,1);dummy.updateMatrix();
   mesh.current.setMatrixAt(i,dummy.matrix);
   mesh.current.setColorAt(i,tint.copy(p.ring%2?pink:blue).multiplyScalar(sample.brightness));
  }
  mesh.current.instanceMatrix.needsUpdate=true;
  if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;
 });
 if(!enabled)return null;
 return <group name="v1036-moving-led-sky">
  <instancedMesh ref={mesh} args={[undefined,undefined,pixels.length]} frustumCulled={false}>
   <boxGeometry args={[.18,.055,.25]}/>
   <meshBasicMaterial color="#ffffff" toneMapped={false}/>
  </instancedMesh>
 </group>;
}
