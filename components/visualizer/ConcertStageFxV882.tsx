'use client';
/** V882 real 3D floor wave + single low-cost instanced confetti emitter.
 * Draw calls: at most two, no per-frame geometry or material allocations.
 * Reads only the parent stage's already authorised V882 sample. */
import {useEffect,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Color,DoubleSide,DynamicDrawUsage,Object3D,
 type InstancedMesh,type Mesh,type MeshBasicMaterial} from 'three';
import type {ConcertStageCueV882} from './concertStageSyncV882';

const COUNT=12;
const colors=['#4ce8f4','#ffaf71','#fb72d1','#90d996','#c5a1ff','#ffdf8e'];
export function ConcertStageFxV882({cueRef}:{cueRef:{current:ConcertStageCueV882}}){
 const ring=useRef<Mesh>(null);
 const ringMaterial=useRef<MeshBasicMaterial>(null);
 const confetti=useRef<InstancedMesh>(null);
 const confettiMaterial=useRef<MeshBasicMaterial>(null);
 const proxy=useRef(new Object3D());
 useEffect(()=>{
  const mesh=confetti.current;
  if(!mesh)return;
  mesh.instanceMatrix.setUsage(DynamicDrawUsage);
  for(let i=0;i<COUNT;i++)mesh.setColorAt(i,new Color(colors[i%colors.length]));
  if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
 },[]);
 useFrame(()=>{
  const cue=cueRef.current;
  const showRing=cue.ringOpacity>.001;
  if(ring.current){
   ring.current.visible=showRing;
   if(showRing)ring.current.scale.setScalar(cue.ringScale);
  }
  if(ringMaterial.current)ringMaterial.current.opacity=showRing?cue.ringOpacity:0;
  const mesh=confetti.current;
  if(!mesh)return;
  const visible=cue.confettiOpacity>.001;
  mesh.visible=visible;
  if(!visible)return;
  if(confettiMaterial.current)confettiMaterial.current.opacity=cue.confettiOpacity;
  const p=cue.confettiProgress;
  for(let i=0;i<COUNT;i++){
   const angle=i*2.399963229728653;
   const radius=.35+(i%5)*.18+p*(.8+(i%3)*.25);
   const shape=proxy.current;
   shape.position.set(Math.cos(angle)*radius,-.6+((i*7)%10)*.15+1.0*p-.8*p*p,
    -.6+Math.sin(angle)*radius);
   shape.rotation.set(angle+p*5,i*.7+p*4,i*1.1+p*3);
   shape.scale.set(.07+(i%3)*.018,.11+(i%2)*.02,1);
   shape.updateMatrix();mesh.setMatrixAt(i,shape.matrix);
  }
  mesh.instanceMatrix.needsUpdate=true;
 });
 return <group name="v882-concert-stage-fx">
  <mesh ref={ring} name="v882-3d-bass-wave" visible={false}
   rotation={[-Math.PI/2,0,0]} position={[0,-1.91,-.2]} renderOrder={2}>
   <ringGeometry args={[.86,1.02,64]}/>
   <meshBasicMaterial ref={ringMaterial} color="#4ce8f4" transparent opacity={0}
    depthWrite={false} depthTest side={DoubleSide} toneMapped={false}/>
  </mesh>
  <instancedMesh ref={confetti} name="v882-3d-confetti" args={[undefined,undefined,COUNT]}
   visible={false} frustumCulled={false} renderOrder={3}>
   <planeGeometry args={[1,1]}/>
   <meshBasicMaterial ref={confettiMaterial} color="#ffffff" transparent opacity={0}
    vertexColors side={DoubleSide} depthWrite={false} toneMapped={false}/>
  </instancedMesh>
 </group>;
}
