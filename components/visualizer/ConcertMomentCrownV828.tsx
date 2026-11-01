'use client';
import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Color,Object3D} from 'three';
import type {InstancedMesh,MeshBasicMaterial} from 'three';
import type {ConcertExperienceCueV828} from './concertExperienceDirectorV828';

/** One bounded instanced halo/arch draw behind the side wings (|x| >= 3.4).
 * The main concert show still uses V604/V761, no inferred drops/camera changes.
 * No dynamic geometry, shadow lights or allocations in the render loop.
 */
export function ConcertMomentCrownV828({cueRef}:{cueRef:{current:ConcertExperienceCueV828}}){
 const mesh=useRef<InstancedMesh>(null),mat=useRef<MeshBasicMaterial>(null);
 const object=useMemo(()=>new Object3D(),[]);
 const first=useMemo(()=>new Color(),[]),second=useMemo(()=>new Color(),[]);
 const elapsed=useRef(1);
 useFrame((_,delta)=>{
  const c=cueRef.current,m=mesh.current;
  if(!m)return;
  m.count=c.active?Math.max(0,Math.min(12,c.crownCount)):0;
  m.visible=m.count>0&&c.crownOpacity>.001;
  if(!m.visible){elapsed.current=1;return;}
  if(mat.current)mat.current.opacity=Math.min(.24,c.crownOpacity);
  first.set(c.primary);second.set(c.secondary);
  elapsed.current+=Math.max(0,Math.min(.1,delta));
  if(elapsed.current<.05)return;
  elapsed.current=0;
  for(let i=0;i<m.count;i++){
   const side=i%2===0?-1:1;
   const row=Math.floor(i/2);
   const wobble=Math.sin(c.phase*.9+row*.6)*c.crownPulse;
   object.position.set(side*(4.15+row*.28),2.1+row*.48+wobble,-3.5-row*.1);
   object.rotation.set(0,side*.12,side*(.10+row*.065));
   object.scale.set(.76+row*.07,.72+row*.045,1);
   object.updateMatrix();m.setMatrixAt(i,object.matrix);
   m.setColorAt(i,(i+row)%2===0?first:second);
  }
  m.instanceMatrix.needsUpdate=true;
  if(m.instanceColor)m.instanceColor.needsUpdate=true;
 });
 return <group name="v828-concert-moment-crown" frustumCulled={false}>
  <instancedMesh ref={mesh} args={[undefined,undefined,12]} frustumCulled={false}
    visible={false} castShadow={false} receiveShadow={false}>
   <torusGeometry args={[1,.028,4,32,2.65]}/>
   <meshBasicMaterial ref={mat} transparent opacity={0} color="#ffffff"
      depthWrite={false} depthTest toneMapped={false}/>
  </instancedMesh>
 </group>;
}
