"use client";
import {useFrame} from '@react-three/fiber';
import {useMemo,useRef} from 'react';
import {Color,Object3D,Quaternion,Vector3,type InstancedMesh} from 'three';
import type {AudioFeatures} from '@/types/audio';
import {useAdaptivePerformance} from '../adaptivePerformance';
import {createLaserArchitectureV1039,planArenaHolographyV1039,sampleLaserArchitectureV1039,
 type HologramPatternV1039} from '@/lib/arena360HolographyV1039';
/** Visual-only tunnel/spiral/halo laser geometry: at most 12 instanced rays.
 * Uses existing stage audio/section; NO hardware output, flashes or extra lights.
 */
export function ArenaLaserTunnelsV1039({audio,playing,reducedMotion,reactive,enabled=true,
 genre,section,pattern='auto',strength=65}:{audio:AudioFeatures;playing:boolean;reducedMotion:boolean;
 reactive:boolean;enabled?:boolean;genre?:string|null;section?:string;
 pattern?:HologramPatternV1039;strength?:number}){
 const {tier}=useAdaptivePerformance();
 const fixtures=useMemo(()=>createLaserArchitectureV1039(tier),[tier]);
 const rays=useRef<InstancedMesh>(null),dummy=useMemo(()=>new Object3D(),[]);
 const up=useMemo(()=>new Vector3(0,1,0),[]),start=useMemo(()=>new Vector3(),[]);
 const end=useMemo(()=>new Vector3(),[]),difference=useMemo(()=>new Vector3(),[]);
 const orientation=useMemo(()=>new Quaternion(),[]),tint=useMemo(()=>new Color(),[]);
 const palette=useMemo(()=>[new Color(),new Color()],[]);
 const budget=useRef(.2),time=useRef(0),lastActive=useRef(true);
 useFrame((_,delta)=>{
  if(!enabled||!rays.current)return;
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
   const ray=sampleLaserArchitectureV1039(fixtures[i],time.current,cue);
   start.set(ray.origin.x,ray.origin.y,ray.origin.z);end.set(ray.end.x,ray.end.y,ray.end.z);
   difference.subVectors(end,start);
   const length=Math.max(.01,difference.length());
   orientation.setFromUnitVectors(up,difference.normalize());
   dummy.position.copy(start).add(end).multiplyScalar(.5);
   dummy.quaternion.copy(orientation);dummy.scale.set(1,length,1);dummy.updateMatrix();
   rays.current.setMatrixAt(i,dummy.matrix);
   rays.current.setColorAt(i,tint.copy(palette[i%2]).multiplyScalar(ray.light));
  }
  rays.current.instanceMatrix.needsUpdate=true;
  if(rays.current.instanceColor)rays.current.instanceColor.needsUpdate=true;
 });
 if(!enabled)return null;
 return <group name="v1039-world-fixed-laser-tunnel">
  <instancedMesh ref={rays} args={[undefined,undefined,fixtures.length]} frustumCulled={false}>
   <cylinderGeometry args={[.009,.024,1,5,1,true]}/>
   <meshBasicMaterial color="#ffffff" transparent opacity={.29} depthWrite={false} toneMapped={false}/>
  </instancedMesh>
 </group>;
}
