"use client";
import {useFrame} from '@react-three/fiber';
import {useLayoutEffect,useMemo,useRef} from 'react';
import {Color,Object3D,type InstancedMesh} from 'three';
import {useAdaptivePerformance} from '../adaptivePerformance';
import {REST_ARCHITECTURE_V1082,sampleStageArchitectureV1082,stepArchitectureV1082,
 type ArchitectureCueV1082,type ArchitectureSampleV1082} from '@/lib/arena360StageArchitectureV1082';
const TAU=Math.PI*2;
/** Three batched scenic levels beyond the performer stage, before the first audience ring.
 * Three instanced draws, maximum 24 posts, 24 LEDs and 16 connecting rails.
 * No extra shadows, real lights, RAFs, imported models or dynamic geometries.
 */
export function ArenaDynamicArchitectureV1082({enabled,playing,reducedMotion,cue}:{
 enabled:boolean;playing:boolean;reducedMotion:boolean;cue:ArchitectureCueV1082;
}){
 const tier=useAdaptivePerformance().tier;
 const count=tier==='high'?8:tier==='balanced'?6:0;
 const posts=useRef<InstancedMesh>(null),leds=useRef<InstancedMesh>(null),bridges=useRef<InstancedMesh>(null);
 const dummy=useMemo(()=>new Object3D(),[]);
 const color=useMemo(()=>new Color(),[]);
 const cyan=useMemo(()=>new Color('#3deaff'),[]),magenta=useMemo(()=>new Color('#f678fc'),[]);
 const state=useRef<ArchitectureSampleV1082[]>([]);
 const output=useMemo<ArchitectureSampleV1082>(()=>({...REST_ARCHITECTURE_V1082}),[]);
 const budget=useRef(0),fresh=useRef(true);
 useLayoutEffect(()=>{state.current=[];fresh.current=true;budget.current=0;},[count,enabled]);
 useFrame((_,delta)=>{
  if(!enabled||count===0)return;
  budget.current+=Number.isFinite(delta)?Math.max(0,Math.min(delta,.10)):0;
  if(!fresh.current&&budget.current<(tier==='high'?.05:.08))return;
  const dt=budget.current;budget.current=0;fresh.current=false;
  for(let i=0;i<count;i++){
   sampleStageArchitectureV1082(i,count,cue,output);
   const previous=state.current[i]??REST_ARCHITECTURE_V1082;
   // Pausing holds the last scenic pose; reduced motion parks the entire overlay.
   const pose=stepArchitectureV1082(previous,output,dt,{playing,reducedMotion,enabled:cue.active||!playing});
   state.current[i]=pose;
   const theta=TAU*(i+.5)/count;
   const x=Math.cos(theta)*pose.radius,z=Math.sin(theta)*pose.radius;
   for(let level=0;level<3;level++){
    const idx=i*3+level;
    const h=level===0?pose.height:Math.max(.25,pose.height-(level*.10));
    dummy.position.set(x,-1.92+level*.77+h*.5+pose.rise,z);
    dummy.rotation.set(0,theta+pose.twist,0);
    dummy.scale.set(.115,h,.115);dummy.updateMatrix();posts.current?.setMatrixAt(idx,dummy.matrix);
    dummy.position.set(x,-1.92+level*.77+Math.min(.42,h)*.5+pose.rise,z);
    dummy.rotation.set(0,theta,0);
    dummy.scale.set(.024,Math.min(.42,h),.03);dummy.updateMatrix();leds.current?.setMatrixAt(idx,dummy.matrix);
    leds.current?.setColorAt(idx,color.copy((level+i)%2===0?cyan:magenta).multiplyScalar(pose.glow));
    if(level>=2)continue;
    dummy.position.set(x,-1.08+level*.77+pose.rise,z);
    dummy.rotation.set(0,theta+Math.PI/2+pose.twist,0);
    dummy.scale.set(2*pose.radius*Math.sin(Math.PI/count)*.86,.07,.12);
    dummy.updateMatrix();bridges.current?.setMatrixAt(i*2+level,dummy.matrix);
   }
  }
  for(const mesh of [posts.current,leds.current,bridges.current]){
   if(mesh)mesh.instanceMatrix.needsUpdate=true;
  }
  if(leds.current?.instanceColor)leds.current.instanceColor.needsUpdate=true;
 });
 if(!enabled||count===0)return null;
 return <group name="v1082-world-fixed-architecture">
  <instancedMesh ref={posts} args={[undefined,undefined,count*3]} frustumCulled={false} castShadow={false} receiveShadow={false}>
   <boxGeometry args={[1,1,1]}/><meshStandardMaterial color="#24334d" roughness={.43} metalness={.72}/>
  </instancedMesh>
  <instancedMesh ref={bridges} args={[undefined,undefined,count*2]} frustumCulled={false} castShadow={false} receiveShadow={false}>
   <boxGeometry args={[1,1,1]}/><meshStandardMaterial color="#35465f" roughness={.48} metalness={.64}/>
  </instancedMesh>
  <instancedMesh ref={leds} args={[undefined,undefined,count*3]} frustumCulled={false} castShadow={false} receiveShadow={false}>
   <boxGeometry args={[1,1,1]}/><meshBasicMaterial color="#ffffff" toneMapped={false}/>
  </instancedMesh>
 </group>;
}
