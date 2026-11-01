"use client";
import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Object3D} from 'three';
import type {InstancedMesh,MeshBasicMaterial} from 'three';
import type {FestivalCueV844} from './festivalSpecialFxPlannerV844';
/** One bounded, shadowless instanced CO2 plume behind both side wings.
 * No timers, no new allocations per animation frame, no additional render pass.
 */
export function FestivalCo2V844({cueRef}:{cueRef:{current:FestivalCueV844}}){
 const mesh=useRef<InstancedMesh>(null),mat=useRef<MeshBasicMaterial>(null);
 const dummy=useMemo(()=>new Object3D(),[]),cadence=useRef(1);
 useFrame((_,dt)=>{
  const c=cueRef.current,m=mesh.current;
  if(!m)return;
  m.count=c.active?Math.min(48,Math.max(0,c.co2Count)):0;
  m.visible=m.count>0;
  if(mat.current)mat.current.opacity=m.visible?Math.min(.38,c.co2Opacity):0;
  if(!m.visible){cadence.current=1;return;}
  cadence.current+=Math.min(.1,Math.max(0,dt));
  if(cadence.current<.05)return;
  cadence.current=0;
  for(let j=0;j<m.count;j++){
   const side=j%2===0?-1:1,seed=((j*53+11)%71)/71;
   const rise=((c.phase*1.20+seed*1.7)%1.7+1.7)%1.7/1.7;
   const sideways=Math.sin(c.phase*2.0+j*.52)*.17;
   dummy.position.set(side*(3.3+rise*.55)+sideways,-1.25+rise*4.1,-2.0-seed*.25);
   const scale=.13+rise*.28;
   dummy.scale.set(scale,scale*1.9,.015);
   dummy.rotation.set(0,0,side*.18);
   dummy.updateMatrix();m.setMatrixAt(j,dummy.matrix);
  }
  m.instanceMatrix.needsUpdate=true;
 });
 return <instancedMesh name="v844-co2-side-plumes" ref={mesh} args={[undefined,undefined,48]}
   visible={false} castShadow={false} receiveShadow={false} frustumCulled={false}>
  <planeGeometry args={[1,1]}/>
  <meshBasicMaterial ref={mat} transparent opacity={0} color="#d5f3ff" side={2}
    depthWrite={false} depthTest toneMapped={false}/>
 </instancedMesh>;
}
