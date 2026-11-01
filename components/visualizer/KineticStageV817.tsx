'use client';
import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Color,Object3D} from 'three';
import type {InstancedMesh,MeshBasicMaterial} from 'three';
import {KINETIC_COLUMNS_V817} from './kineticStagePlannerV817';
import type {KineticStageCueV817} from './kineticStagePlannerV817';

/** Twelve LED pillars BEHIND performers, |x| >= 3.05. No new lights or shadows. */
export function KineticStageV817({cueRef}:{cueRef:{current:KineticStageCueV817}}){
 const mesh=useRef<InstancedMesh>(null),mat=useRef<MeshBasicMaterial>(null);
 const obj=useMemo(()=>new Object3D(),[]);
 const colorA=useMemo(()=>new Color(),[]),colorB=useMemo(()=>new Color(),[]);
 const elapsed=useRef(1);
 useFrame((_,delta)=>{
  const c=cueRef.current;
  if(!mesh.current)return;
  mesh.current.count=c.active?Math.min(KINETIC_COLUMNS_V817,Math.max(0,c.columns)):0;
  mesh.current.visible=c.active&&mesh.current.count>0;
  if(!c.active){elapsed.current=1;return;}
  if(mat.current)mat.current.opacity=c.opacity;
  colorA.set(c.primary);colorB.set(c.secondary);
  elapsed.current+=Math.max(0,Math.min(.1,delta));
  if(elapsed.current<.05)return;
  elapsed.current=0;
  for(let i=0;i<mesh.current.count;i++){
   const side=i%2===0?-1:1;
   const row=Math.floor(i/2);
   const sway=Math.sin(c.phase*1.35+row*.7)*c.spread;
   const rise=c.lift*(.5+.5*Math.sin(c.phase*1.10+row*.8));
   const h=1.8+(row%3)*.52;
   obj.position.set(side*(3.2+row*.49+sway),-.95+h*.5+rise,-2.65-row*.08);
   obj.scale.set(.28,h,.13);
   obj.rotation.set(0,side*.06,side*c.spread*.11);
   obj.updateMatrix();mesh.current.setMatrixAt(i,obj.matrix);
   mesh.current.setColorAt(i,row%2===0?colorA:colorB);
  }
  mesh.current.instanceMatrix.needsUpdate=true;
  if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;
 });
 return <group name="v817-kinetic-stage" frustumCulled={false}>
  <instancedMesh ref={mesh} args={[undefined,undefined,KINETIC_COLUMNS_V817]} visible={false} frustumCulled={false} castShadow={false} receiveShadow={false}>
   <boxGeometry args={[1,1,1]}/><meshBasicMaterial ref={mat} transparent opacity={0} color="#ffffff" depthWrite={false} depthTest toneMapped={false}/>
  </instancedMesh>
 </group>;
}
