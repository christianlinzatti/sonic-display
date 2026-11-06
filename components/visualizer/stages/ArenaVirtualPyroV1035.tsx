"use client";
import {useFrame} from '@react-three/fiber';
import {useLayoutEffect,useMemo,useRef} from 'react';
import {Color,Object3D,type InstancedMesh} from 'three';
import type {AudioFeatures} from '@/types/audio';
import {useAdaptivePerformance} from '../adaptivePerformance';
import {INITIAL_ARENA_PYRO_V1035,planArenaTimelineV1035,sampleArenaPyroSparkV1035,stepArenaPyroV1035} from '@/lib/arena360DirectorV1035';
/** Software-only stage spark jets with a beat-edge trigger and 5.5s cooldown.
 * Nothing physically ignites; no white flashes or WebGL light sources are added. */
export function ArenaVirtualPyroV1035({audio,playing,reducedMotion,reactive,enabled,directorEnabled,progressMs,durationMs,section,intensity}: {
 audio:AudioFeatures;playing:boolean;reducedMotion:boolean;reactive:boolean;enabled:boolean;directorEnabled:boolean;
 progressMs?:number;durationMs?:number;section?:string;intensity?:number;
}){
 const tier=useAdaptivePerformance().tier;
 const emitters=tier==='low'?4:tier==='balanced'?6:8;
 const perEmitter=tier==='low'?3:tier==='balanced'?4:6;
 const count=emitters*perEmitter;
 const mesh=useRef<InstancedMesh>(null);
 const dummy=useMemo(()=>new Object3D(),[]),tint=useMemo(()=>new Color(),[]);
 const coral=useMemo(()=>new Color('#ff9c5e'),[]),pink=useMemo(()=>new Color('#f776b1'),[]);
 const state=useRef({...INITIAL_ARENA_PYRO_V1035}),budget=useRef(0),wasLit=useRef(true);
 useLayoutEffect(()=>{wasLit.current=true;},[count]);
 useFrame((_,delta)=>{
  if(!enabled)return;
  const dt=Number.isFinite(delta)?Math.max(0,Math.min(.1,delta)):0;
  const cue=planArenaTimelineV1035({enabled:directorEnabled,playing,reducedMotion,reactive,progressMs,durationMs,section,energy:audio.energyEnvelope,intensity});
  state.current=stepArenaPyroV1035(state.current,dt,{enabled:reactive,playing,reducedMotion,armed:cue.pyroArmed,
   beat:audio.beat,beatStrength:audio.beatStrength,energy:audio.energyEnvelope});
  const lit=state.current.energy>.001;
  if(!lit&&!wasLit.current)return;
  budget.current+=dt;
  if(lit&&budget.current<(tier==='low'?.085:.043))return;
  budget.current=0;
  for(let i=0;i<count;i++){
   const jet=Math.floor(i/perEmitter),slot=i%perEmitter;
   const a=Math.PI*2*(jet+.5)/emitters;
   const p=sampleArenaPyroSparkV1035(i,count,state.current);
   const spread=(slot-(perEmitter-1)/2)*.09;
   dummy.position.set(Math.cos(a)*(3.0+spread),-1.83+p.rise,Math.sin(a)*(3.0+spread));
   dummy.rotation.set(0,a,Math.sin(a*3+slot)*.25);
   dummy.scale.set(.028,.0001+Math.max(0,p.height),.028);
   dummy.updateMatrix();mesh.current?.setMatrixAt(i,dummy.matrix);
   mesh.current?.setColorAt(i,tint.copy(slot%2===0?coral:pink).multiplyScalar(Math.max(.001,p.brightness)));
  }
  if(mesh.current){mesh.current.instanceMatrix.needsUpdate=true;if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;}
  wasLit.current=lit;
 });
 if(!enabled)return null;
 return <group name="v1035-virtual-pyro-sparks">
  <instancedMesh ref={mesh} args={[undefined,undefined,count]} frustumCulled={false}>
   <coneGeometry args={[1,1,5]}/><meshBasicMaterial color="#ffffff" transparent opacity={.68} toneMapped={false} depthWrite={false}/>
  </instancedMesh>
 </group>;
}
