'use client';
import {useFrame} from '@react-three/fiber';
import {useLayoutEffect,useMemo,useRef} from 'react';
import {Color,Object3D,type InstancedMesh} from 'three';
import type {AudioFeatures} from '@/types/audio';
import {useAdaptivePerformance} from '../adaptivePerformance';
import {createLedWallPixelsV1059,sampleLedWallPixelV1059,type LedWallCueV1059} from '@/lib/arena360LedWallV1059';

/** One instanced draw call, not a video texture or a wall hiding the singers.
 * An open, low-slung ring of small pixels surrounds the existing arena floor.
 * Matrix positions are static. Only colors change at 8–14 Hz.
 */
export function ArenaLedWallV1059({audio,playing,reducedMotion,cue,progressMs}: {
 audio:AudioFeatures;playing:boolean;reducedMotion:boolean;cue:LedWallCueV1059;progressMs?:number;
}){
 const tier=useAdaptivePerformance().tier;
 const pixels=useMemo(()=>createLedWallPixelsV1059(tier),[tier]);
 const mesh=useRef<InstancedMesh>(null),timer=useRef(.2);
 const dummy=useMemo(()=>new Object3D(),[]),tint=useMemo(()=>new Color(),[]);
 const colorA=useMemo(()=>new Color(),[]),colorB=useMemo(()=>new Color(),[]);
 useLayoutEffect(()=>{
  if(!mesh.current)return;
  for(let i=0;i<pixels.length;i++){
   const p=pixels[i];
   dummy.position.set(p.x,p.y,p.z);
   dummy.rotation.set(0,-p.angle,0);
   dummy.scale.set(1,1,1);dummy.updateMatrix();
   mesh.current.setMatrixAt(i,dummy.matrix);
   mesh.current.setColorAt(i,tint.set('#050b16'));
  }
  mesh.current.instanceMatrix.needsUpdate=true;
  if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;
  mesh.current.computeBoundingSphere();
 },[pixels,dummy,tint,cue.active]);
 useFrame((_,delta)=>{
  if(!cue.active||!playing||reducedMotion||tier==='low'||!mesh.current)return;
  timer.current+=Number.isFinite(delta)?Math.max(0,Math.min(.1,delta)):0;
  if(timer.current<(tier==='high'?.07:.12))return;
  timer.current=0;
  colorA.set(cue.colorA);colorB.set(cue.colorB);
  const time=(Number.isFinite(progressMs)?Math.max(0,progressMs??0):0)/1000;
  for(let i=0;i<pixels.length;i++){
   const p=pixels[i];
   const light=sampleLedWallPixelV1059(p,cue,audio,time);
   tint.copy(p.column%2===0?colorA:colorB).multiplyScalar(light);
   mesh.current.setColorAt(i,tint);
  }
  if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;
 });
 if(!cue.active||!playing||reducedMotion||tier==='low'||pixels.length===0)return null;
 return <group name="v1059-led-wall-360">
  <instancedMesh ref={mesh} name="v1059-led-wall-pixels" args={[undefined,undefined,pixels.length]} frustumCulled={false}>
   <boxGeometry args={[.24,.18,.085]}/><meshBasicMaterial color="#ffffff" toneMapped={false}/>
  </instancedMesh>
 </group>;
}
