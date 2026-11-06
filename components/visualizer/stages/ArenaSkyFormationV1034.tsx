"use client";
import {useFrame} from "@react-three/fiber";
import {useLayoutEffect,useMemo,useRef} from "react";
import {Color,Object3D,type InstancedMesh} from "three";
import type {AudioFeatures} from "@/types/audio";
import {useAdaptivePerformance} from "../adaptivePerformance";
import {createArenaSkyFixturesV1034,sampleArenaSkyFixtureV1034} from "@/lib/arena360ShowV1034";
/** Fixed ring of decorative overhead LED blades. Does not add real spotlights,
 * cast dynamic shadows, or create external render loops. */
export function ArenaSkyFormationV1034({audio,section,playing,reducedMotion,enabled=true,directorEnabled=true,reactive=true,showAmbience}:{
 audio:AudioFeatures;section?:string;playing:boolean;reducedMotion:boolean;
 enabled?:boolean;directorEnabled?:boolean;reactive?:boolean;showAmbience?:number;
}){
 const tier=useAdaptivePerformance().tier;
 const fixtures=useMemo(()=>createArenaSkyFixturesV1034(tier),[tier]);
 const mesh=useRef<InstancedMesh>(null);
 const dummy=useMemo(()=>new Object3D(),[]);
 const color=useMemo(()=>new Color(),[]);
 const cold=useMemo(()=>new Color('#49deff'),[]);
 const warm=useMemo(()=>new Color('#df70ff'),[]);
 const elapsed=useRef(0),timer=useRef(0),previousSection=useRef(''),wasAnimated=useRef(true);
 useLayoutEffect(()=>{
  if(!mesh.current)return;
  for(let i=0;i<fixtures.length;i++){
   const f=fixtures[i];
   dummy.position.set(f.x,f.y,f.z);dummy.rotation.set(0,-f.angle,Math.PI/8);
   dummy.updateMatrix();mesh.current.setMatrixAt(i,dummy.matrix);
   mesh.current.setColorAt(i,color.copy(i%2?warm:cold).multiplyScalar(.3));
  }
  mesh.current.instanceMatrix.needsUpdate=true;
  if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;
  mesh.current.computeBoundingSphere();
 },[fixtures,dummy,color,cold,warm]);
 useFrame((_,delta)=>{
  if(!enabled||!mesh.current)return;
  const animate=directorEnabled&&playing&&!reducedMotion&&reactive;
  const dt=Number.isFinite(delta)?Math.max(0,Math.min(.1,delta)):0;
  if(animate)elapsed.current+=dt;
  if(!animate&&!wasAnimated.current)return;
  timer.current+=dt;
  const effective=animate?section??'verse':'break';
  if(timer.current<(tier==='low'?.125:.067)&&previousSection.current===effective)return;
  timer.current=0;previousSection.current=effective;wasAnimated.current=animate;
  const bass=animate?audio.bass??0:0;
  for(let i=0;i<fixtures.length;i++){
   const f=fixtures[i];
   const level=animate?sampleArenaSkyFixtureV1034(f,elapsed.current,effective,bass):.22;
   mesh.current.setColorAt(i,color.copy(i%2?warm:cold).multiplyScalar(
    showAmbience===undefined?level:level*(.52+Math.min(1,Math.max(0,showAmbience)))));
  }
  if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true;
 });
 if(!enabled)return null;
 return <group name="v1034-arena-overhead-light-formations">
  <mesh position={[0,3.2,0]} rotation={[Math.PI/2,0,0]}>
   <torusGeometry args={[4.14,.035,5,64]}/>
   <meshStandardMaterial color="#40506c" roughness={.4} metalness={.8}/>
  </mesh>
  <instancedMesh ref={mesh} args={[undefined,undefined,fixtures.length]} frustumCulled={false}>
   <boxGeometry args={[.26,.035,.075]}/>
   <meshBasicMaterial color="#ffffff" toneMapped={false}/>
  </instancedMesh>
 </group>;
}
