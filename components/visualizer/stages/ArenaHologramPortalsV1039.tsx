"use client";
import {useFrame} from '@react-three/fiber';
import {useMemo,useRef} from 'react';
import {Color,Object3D,type InstancedMesh} from 'three';
import type {AudioFeatures} from '@/types/audio';
import {useAdaptivePerformance} from '../adaptivePerformance';
import {createHologramFixturesV1039,planArenaHolographyV1039,sampleHologramPortalV1039,
 type HologramPatternV1039} from '@/lib/arena360HolographyV1039';
/** Hologram-like floating rings, rendered as TWO bounded instance batches.
 * Not avatars, not projectors or physical lasers, no network, timers, camera, shadows.
 */
export function ArenaHologramPortalsV1039({audio,playing,reducedMotion,reactive,enabled=true,genre,
 section,pattern='auto',strength=65}:{audio:AudioFeatures;playing:boolean;reducedMotion:boolean;
 reactive:boolean;enabled?:boolean;genre?:string|null;section?:string;
 pattern?:HologramPatternV1039;strength?:number}){
 const {tier}=useAdaptivePerformance();
 const fixtures=useMemo(()=>createHologramFixturesV1039(tier),[tier]);
 const rings=useRef<InstancedMesh>(null),crystals=useRef<InstancedMesh>(null);
 const dummy=useMemo(()=>new Object3D(),[]),tint=useMemo(()=>new Color(),[]);
 const palette=useMemo(()=>[new Color(),new Color()],[]);
 const time=useRef(0),budget=useRef(.2),lastActive=useRef(true);
 useFrame((_,delta)=>{
  if(!enabled||!rings.current||!crystals.current)return;
  const active=playing&&!reducedMotion&&reactive;
  const dt=Number.isFinite(delta)?Math.max(0,Math.min(.1,delta)):0;
  if(active)time.current+=dt;
  if(!active&&!lastActive.current)return;
  budget.current+=dt;
  if(active&&budget.current<(tier==='low'?.16:.075))return;
  budget.current=0;lastActive.current=active;
  const cue=planArenaHolographyV1039({enabled,playing,reducedMotion,reactive,genre,section,
    pattern,strength,energy:audio.energyEnvelope??audio.bass});
  palette[0].set(cue.primary);palette[1].set(cue.secondary);
  for(let i=0;i<fixtures.length;i++){
   const sample=sampleHologramPortalV1039(fixtures[i],time.current,cue);
   dummy.position.set(sample.x,sample.y,sample.z);
   dummy.rotation.set(0,sample.rotY,sample.rotZ);dummy.scale.setScalar(sample.size);dummy.updateMatrix();
   rings.current.setMatrixAt(i,dummy.matrix);
   rings.current.setColorAt(i,tint.copy(palette[i%2]).multiplyScalar(sample.light));
   dummy.scale.setScalar(sample.size*.64);dummy.rotation.set(.3+time.current*cue.speed*.16,sample.rotY+time.current*cue.speed*.3,sample.rotZ);
   dummy.updateMatrix();crystals.current.setMatrixAt(i,dummy.matrix);
   crystals.current.setColorAt(i,tint.copy(palette[1-i%2]).multiplyScalar(sample.light*.8));
  }
  for(const mesh of [rings.current,crystals.current]){
   mesh.instanceMatrix.needsUpdate=true;
   if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
  }
 });
 if(!enabled)return null;
 return <group name="v1039-holographic-portals-world-fixed">
  <instancedMesh ref={rings} args={[undefined,undefined,fixtures.length]} frustumCulled={false}>
   <torusGeometry args={[.36,.018,5,32]}/>
   <meshBasicMaterial color="#ffffff" transparent opacity={.59} depthWrite={false} toneMapped={false}/>
  </instancedMesh>
  <instancedMesh ref={crystals} args={[undefined,undefined,fixtures.length]} frustumCulled={false}>
   <octahedronGeometry args={[.22,0]}/>
   <meshBasicMaterial color="#ffffff" wireframe transparent opacity={.4} depthWrite={false} toneMapped={false}/>
  </instancedMesh>
 </group>;
}
