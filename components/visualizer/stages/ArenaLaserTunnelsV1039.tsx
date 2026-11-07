"use client";
import {useFrame} from '@react-three/fiber';
import {useMemo,useRef} from 'react';
import {Color,Object3D,Quaternion,Vector3,type InstancedMesh} from 'three';
import type {AudioFeatures} from '@/types/audio';
import type {IntelligentLaserCueV1057} from '@/lib/arena360IntelligentLaserV1057';
import {sampleLaserEndpointV1080,type LaserExperienceCueV1080} from '@/lib/arena360LaserExperienceV1080';
import {useAdaptivePerformance} from '../adaptivePerformance';
import {createLaserArchitectureV1039,planArenaHolographyV1039,sampleLaserArchitectureV1039,
 type HologramPatternV1039} from '@/lib/arena360HolographyV1039';
/** Visual-only tunnel/spiral/halo laser geometry: at most 12 instanced rays.
 * Uses existing stage audio/section; NO hardware output, flashes or extra lights.
 */
export function ArenaLaserTunnelsV1039({audio,playing,reducedMotion,reactive,enabled=true,
 genre,section,pattern='auto',strength=65,laserCueV1057,laserExperienceCueV1080}:{audio:AudioFeatures;playing:boolean;reducedMotion:boolean;
 reactive:boolean;enabled?:boolean;genre?:string|null;section?:string;
 pattern?:HologramPatternV1039;strength?:number;laserCueV1057?:IntelligentLaserCueV1057;
 laserExperienceCueV1080?:LaserExperienceCueV1080}){
 const {tier}=useAdaptivePerformance();
 const fixtures=useMemo(()=>createLaserArchitectureV1039(tier),[tier]);
 const rays=useRef<InstancedMesh>(null),dummy=useMemo(()=>new Object3D(),[]);
 const up=useMemo(()=>new Vector3(0,1,0),[]),start=useMemo(()=>new Vector3(),[]);
 const end=useMemo(()=>new Vector3(),[]),difference=useMemo(()=>new Vector3(),[]);
 const orientation=useMemo(()=>new Quaternion(),[]),tint=useMemo(()=>new Color(),[]);
 const palette=useMemo(()=>[new Color(),new Color()],[]);
 const targetPalette=useMemo(()=>[new Color(),new Color()],[]);
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
  const authored=laserCueV1057?.active?laserCueV1057:null;
  // A manual pattern always beats the V1057 planned look.
  const effectivePattern=pattern==='auto'&&authored?authored.pattern:pattern;
  const cue=planArenaHolographyV1039({enabled,playing,reducedMotion,reactive,genre,section,
    pattern:effectivePattern,strength,energy:audio.energyEnvelope??audio.bass});
  // Smooth cross-chapter color changes; never add an independent timer.
  const mix=1-Math.exp(-dt*4);
  palette[0].lerp(targetPalette[0].set(authored?.colorA??cue.primary),mix);
  palette[1].lerp(targetPalette[1].set(authored?.colorB??cue.secondary),mix);
  for(let i=0;i<fixtures.length;i++){
   const ray=sampleLaserArchitectureV1039(fixtures[i],time.current,cue);
   start.set(ray.origin.x,ray.origin.y,ray.origin.z);end.set(ray.end.x,ray.end.y,ray.end.z);
   if(laserExperienceCueV1080?.active)sampleLaserEndpointV1080(
    laserExperienceCueV1080,i,fixtures.length,time.current,'architecture',end);
   difference.subVectors(end,start);
   const length=Math.max(.01,difference.length());
   orientation.setFromUnitVectors(up,difference.normalize());
   dummy.position.copy(start).add(end).multiplyScalar(.5);
   dummy.quaternion.copy(orientation);dummy.scale.set(1,length,1);dummy.updateMatrix();
   rays.current.setMatrixAt(i,dummy.matrix);
   rays.current.setColorAt(i,tint.copy(palette[i%2]).multiplyScalar(ray.light*(authored?.beamGain??1)*(laserExperienceCueV1080?.active?laserExperienceCueV1080.gain:1)));
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
