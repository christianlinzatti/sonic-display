"use client";
import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Object3D} from 'three';
import type {InstancedMesh,MeshBasicMaterial} from 'three';
import type {PaperStreamersCueV846} from './festivalPaperStreamersPlannerV846';
// Thin ribbon strips, instanced and stage-bounded; no shadows, physics or allocations per frame.
export function PaperStreamersV846({cueRef}:{cueRef:{current:PaperStreamersCueV846}}){
 const mesh=useRef<InstancedMesh>(null),material=useRef<MeshBasicMaterial>(null);
 const dummy=useMemo(()=>new Object3D(),[]),elapsed=useRef(.1);
 useFrame((_,dt)=>{
  const cue=cueRef.current,m=mesh.current;
  if(!m)return;
  const count=cue.active?Math.min(56,Math.max(0,cue.count)):0;
  m.count=count;m.visible=count>0;
  if(material.current)material.current.opacity=m.visible?Math.min(.34,cue.opacity):0;
  if(!m.visible){elapsed.current=.1;return;}
  elapsed.current+=Math.min(.1,Math.max(0,dt));
  if(elapsed.current<1/30)return;
  elapsed.current=0;
  for(let k=0;k<count;k++){
   const t=(k*0.754877666)%1;
   const side=k%2===0?-1:1;
   const lane=(Math.floor(k/2)%7)/6;
   const sway=Math.sin(cue.phase*(.75+.07*(k%4))+k*1.73)*(.18+.08*cue.curl);
   const fall=(((cue.phase*cue.fallSpeed*.11+t)%1)+1)%1;
   dummy.position.set(side*(1.55+lane*cue.spread)+sway,2.55-fall*4.55,-2.55-.38*t);
   dummy.rotation.set(.16*Math.sin(cue.phase*.53+k*.37),.18*side,.55*side+sway*.65);
   dummy.scale.set(.052,.72+(k%5)*.12,.02);
   dummy.updateMatrix();
   m.setMatrixAt(k,dummy.matrix);
  }
  m.instanceMatrix.needsUpdate=true;
 });
 return <instancedMesh name="v846-paper-streamers" ref={mesh} args={[undefined,undefined,56]}
   visible={false} castShadow={false} receiveShadow={false} frustumCulled={false}>
   <planeGeometry args={[1,1]}/>
   <meshBasicMaterial ref={material} transparent opacity={0} color="#fff4da"
     side={2} depthWrite={false} depthTest toneMapped={false}/>
 </instancedMesh>;
}
