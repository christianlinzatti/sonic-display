"use client";
import {useFrame} from '@react-three/fiber';
import {useLayoutEffect,useMemo,useRef} from 'react';
import {Color,Object3D,Quaternion,Vector3,type InstancedMesh} from 'three';
import type {AudioFeatures} from '@/types/audio';
import {useAdaptivePerformance} from '../adaptivePerformance';
import type {ArenaPeakStateV1036} from '@/lib/arena360AtmosphereV1036';
import {createArenaLasersV1036,planArenaAtmosphereV1036,sampleArenaLaserV1036} from '@/lib/arena360AtmosphereV1036';
/** All rays are translucent, bounded mesh geometry, not physical lasers or HDR flashes.
 * Fixed in arena coordinates: the rotating performer deck is never affected.
 */
export function ArenaLaserFansV1036({audio,playing,reducedMotion,reactive,enabled,directorEnabled,
 section,progressMs,durationMs,intensity,peakRef}: {
 audio:AudioFeatures;playing:boolean;reducedMotion:boolean;reactive:boolean;enabled:boolean;directorEnabled:boolean;
 section?:string;progressMs?:number;durationMs?:number;intensity?:number;
 peakRef?:{readonly current:ArenaPeakStateV1036};
}){
 const tier=useAdaptivePerformance().tier;
 const fixtures=useMemo(()=>createArenaLasersV1036(tier),[tier]);
 const rays=useRef<InstancedMesh>(null);
 const dummy=useMemo(()=>new Object3D(),[]),up=useMemo(()=>new Vector3(0,1,0),[]);
 const start=useMemo(()=>new Vector3(),[]),end=useMemo(()=>new Vector3(),[]),direction=useMemo(()=>new Vector3(),[]);
 const quaternion=useMemo(()=>new Quaternion(),[]),tint=useMemo(()=>new Color(),[]);
 const blue=useMemo(()=>new Color('#49d8ff'),[]),purple=useMemo(()=>new Color('#dc78f5'),[]);
 const budget=useRef(.2),clock=useRef(0),wasActive=useRef(true);
 useLayoutEffect(()=>{budget.current=.2;},[fixtures]);
 useFrame((_,delta)=>{
  if(!enabled||!rays.current)return;
  const dt=Number.isFinite(delta)?Math.max(0,Math.min(.1,delta)):0;
  const active=playing&&!reducedMotion&&reactive&&directorEnabled;
  if(active)clock.current+=dt;
  if(!active&&!wasActive.current)return;
  budget.current+=dt;
  if(active&&budget.current<(tier==='low'?.14:.065))return;
  budget.current=0;wasActive.current=active;
  const cue=planArenaAtmosphereV1036({enabled:directorEnabled,playing,reducedMotion,reactive,
    section,progressMs,durationMs,energy:audio.energyEnvelope,intensity,peak:peakRef?.current.energy});
  for(let i=0;i<fixtures.length;i++){
   const f=fixtures[i],sample=sampleArenaLaserV1036(f,clock.current,cue);
   start.set(f.originX,f.originY,f.originZ);end.set(sample.targetX,sample.targetY,sample.targetZ);
   direction.subVectors(end,start);const length=direction.length();
   quaternion.setFromUnitVectors(up,direction.normalize());
   dummy.position.copy(start).add(end).multiplyScalar(.5);
   dummy.quaternion.copy(quaternion);dummy.scale.set(.75,Math.max(.001,length),.75);dummy.updateMatrix();
   rays.current.setMatrixAt(i,dummy.matrix);
   rays.current.setColorAt(i,tint.copy(i%2?blue:purple).multiplyScalar(active?sample.brightness:.008));
  }
  rays.current.instanceMatrix.needsUpdate=true;
  if(rays.current.instanceColor)rays.current.instanceColor.needsUpdate=true;
 });
 if(!enabled)return null;
 return <group name="v1036-360-arena-laser-fans">
  <instancedMesh ref={rays} args={[undefined,undefined,fixtures.length]} frustumCulled={false}>
   <cylinderGeometry args={[.010,.048,1,6,1,true]}/>
   <meshBasicMaterial color="#ffffff" transparent opacity={.30} depthWrite={false} toneMapped={false}/>
  </instancedMesh>
 </group>;
}
