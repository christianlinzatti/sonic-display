"use client";
import {useFrame} from '@react-three/fiber';
import {useMemo,useRef} from 'react';
import {Color,Object3D,type InstancedMesh} from 'three';
import {useAdaptivePerformance} from '../adaptivePerformance';
import {sampleProjectionMappingV1085,type ProjectionCueV1085,type ProjectionSurfaceV1085} from '@/lib/arena360ProjectionMappingV1085';
/** Two pooled, non-shadow-casting overlays. Floor follows the artist turntable;
 * scenic projections stay world-fixed outside the cast's collision footprint.
 * No WebGL renderer, texture, material, geometry or timer is created in useFrame.
 */
export function ArenaProjectionMappingV1085({cue,surface}:{cue:ProjectionCueV1085;surface:'floor'|'scenery'}){
 const tier=useAdaptivePerformance().tier;
 const count=tier==='high'?surface==='floor'?32:24:tier==='balanced'?surface==='floor'?16:12:0;
 const mesh=useRef<InstancedMesh>(null),budget=useRef(0),fresh=useRef(true);
 const dummy=useMemo(()=>new Object3D(),[]),c=useMemo(()=>new Color(),[]);
 const cyan=useMemo(()=>new Color('#26caff'),[]),violet=useMemo(()=>new Color('#e866ff'),[]);
 useFrame((_,delta)=>{
  if(!cue.active||count===0||!mesh.current)return;
  budget.current+=Number.isFinite(delta)?Math.max(0,Math.min(delta,.1)):0;
  if(!fresh.current&&budget.current<(tier==='high'?1/30:1/20))return;
  budget.current=0;fresh.current=false;
  for(let i=0;i<count;i++){
   const sample=sampleProjectionMappingV1085(surface as ProjectionSurfaceV1085,i,count,cue);
   const theta=sample.angle;
   dummy.position.set(Math.cos(theta)*sample.radius,sample.y,Math.sin(theta)*sample.radius);
   dummy.rotation.set(surface==='floor'?-Math.PI/2:0,surface==='scenery'?-theta-Math.PI/2:0,surface==='floor'?theta:0);
   dummy.scale.set(sample.width,sample.height,1);dummy.updateMatrix();
   mesh.current.setMatrixAt(i,dummy.matrix);
   mesh.current.setColorAt(i,c.copy(sample.hue?violet:cyan).multiplyScalar(sample.glow));
  }
  mesh.current.instanceMatrix.needsUpdate=true;
  if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;
 });
 if(!cue.active||count===0||(surface==='floor'?!cue.floor:!cue.scenery))return null;
 return <group name={`v1085-projection-${surface}`}>
  <instancedMesh ref={mesh} args={[undefined,undefined,count]} frustumCulled={false} castShadow={false} receiveShadow={false}>
   <planeGeometry args={[1,1]}/>
   <meshBasicMaterial transparent opacity={.67} depthWrite={false} side={2} toneMapped={false}/>
  </instancedMesh>
 </group>;
}
