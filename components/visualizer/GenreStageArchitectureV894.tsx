'use client';
/** One optional instanced architectural accent draw call; no new lights, shadows,
 * audio analysis or frame-time mesh/material allocation. R3F owns the resources.
 * All structural bars sit behind the cast, LED screen and lyrics projection. */
import {useLayoutEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Color,Object3D} from 'three';
import type {InstancedMesh,MeshBasicMaterial} from 'three';
import type {GenreStageLookV894,GenreStageCueV894} from './ultimateGenreStageV894';
import {GENRE_STAGE_LOOKS_V894} from './ultimateGenreStageV894';

type Bar={x:number;y:number;z:number;w:number;h:number;angle:number;accent:boolean};
const bar=(x:number,y:number,w:number,h:number,angle=0,accent=false):Bar=>({x,y,z:-4.04,w,h,angle,accent});
const MAX=32;
/** Four deliberately different architectures built exactly once, never per frame. */
export const GENRE_ARCHITECTURES_V894:Readonly<Record<GenreStageLookV894,readonly Bar[]>>={
 noir:[
  ...Array.from({length:7},(_,i)=>bar(-4.65+i*.25,-.74+(i%3)*.19,.085,1.5+(i%4)*.36,0,i%3===0)),
  ...Array.from({length:7},(_,i)=>bar(3.12+i*.25,-.74+((i+1)%3)*.19,.085,1.55+((i+1)%4)*.36,0,i%3===1)),
  bar(-3.85,2.25,1.85,.08),bar(3.85,2.25,1.85,.08),
  bar(-3.45,-1.62,1.5,.07),bar(3.45,-1.62,1.5,.07),
 ],
 reactor:[
  ...Array.from({length:7},(_,i)=>bar(-4.25+i*.21,-.50+i*.34,.09,1.36,-.43,i%2===0)),
  ...Array.from({length:7},(_,i)=>bar(4.25-i*.21,-.50+i*.34,.09,1.36,.43,i%2!==0)),
  bar(-2.65,2.34,2.75,.095),bar(2.65,2.34,2.75,.095),
  bar(-4.15,.2,.11,3.1),bar(4.15,.2,.11,3.1),
 ],
 'rock-arena':[
  ...[-4.45,-3.9,3.9,4.45].map((x,i)=>bar(x,.02,.15,3.8,0,i%2===0)),
  ...Array.from({length:9},(_,i)=>bar(-4.35+i*1.08,2.05,.9,.12,0,i%2===0)),
  bar(-4.25,.88,1.7,.09,-.44),bar(4.25,.88,1.7,.09,.44),
  bar(-4.2,-1.55,1.4,.13),bar(4.2,-1.55,1.4,.13),
 ],
 prism:[
  ...[-3.75,-2.95,2.95,3.75].map((x,i)=>bar(x,.15,.08,3.25,0,i%2===0)),
  bar(-1.4,1.14,.1,3.2,-.66),bar(1.4,1.14,.1,3.2,.66,true),
  bar(-1.4,1.14,.1,3.2,.66,true),bar(1.4,1.14,.1,3.2,-.66),
  bar(-3.4,-1.62,1.25,.07),bar(3.4,-1.62,1.25,.07),
  bar(0,2.45,2.6,.09),
 ],
};
export function GenreStageArchitectureV894({cueRef}:{cueRef:{current:GenreStageCueV894}}){
 const mesh=useRef<InstancedMesh>(null);
 const material=useRef<MeshBasicMaterial>(null);
 const dummy=useMemo(()=>new Object3D(),[]);
 const primary=useMemo(()=>new Color(),[]);
 const secondary=useMemo(()=>new Color(),[]);
 const last=useRef<GenreStageLookV894|null>(null);
 const opacity=useRef(0);
 useLayoutEffect(()=>{last.current=null;opacity.current=0;},[]);
 useFrame((_,delta)=>{
  const m=mesh.current,mat=material.current;
  if(!m||!mat)return;
  const cue=cueRef.current;
  const target=cue.active?cue.architectureOpacity:0;
  const alpha=1-Math.exp(-Math.min(.1,Math.max(0,delta))*4.2);
  // Blackouts, pause, seek, and explicit off must hide immediately, never fade a ghost.
  opacity.current=cue.active?opacity.current+(target-opacity.current)*alpha:0;
  if(target===0&&opacity.current<.001)opacity.current=0;
  mat.opacity=opacity.current;
  // Draw nothing when disabled/low tier/blackout; no buffer updates in that state.
  m.visible=opacity.current>.001;
  if(!m.visible)return;
  if(last.current!==cue.look){
   const bars=GENRE_ARCHITECTURES_V894[cue.look];
   const palette=GENRE_STAGE_LOOKS_V894[cue.look];
   primary.set(palette.primary);secondary.set(palette.secondary);
   for(let i=0;i<bars.length;i++){
    const b=bars[i];
    dummy.position.set(b.x,b.y,b.z);
    dummy.rotation.set(0,0,b.angle);
    dummy.scale.set(b.w,b.h,.075);
    dummy.updateMatrix();
    m.setMatrixAt(i,dummy.matrix);
    m.setColorAt(i,b.accent?secondary:primary);
   }
   m.count=bars.length;
   m.instanceMatrix.needsUpdate=true;
   if(m.instanceColor)m.instanceColor.needsUpdate=true;
   m.computeBoundingSphere();
   last.current=cue.look;
  }
 });
 return <instancedMesh ref={mesh} name="v894-genre-stage-architecture" visible={false}
  args={[undefined,undefined,MAX]} frustumCulled={false} renderOrder={-4}>
   <boxGeometry args={[1,1,1]}/>
   <meshBasicMaterial ref={material} color="#ffffff" transparent opacity={0} depthWrite={false} toneMapped={false}/>
  </instancedMesh>;
}
