"use client";
import {useMemo,useRef,useLayoutEffect} from 'react';
import {useFrame} from '@react-three/fiber';
import {Color,Object3D} from 'three';
import type {InstancedMesh,MeshBasicMaterial} from 'three';
import {createVirtualCrowdLayoutV815,CROWD_MAX_V815} from './virtualConcertCrowdPlannerV815';
import {sampleCrowdChoreographyV876,createCrowdMotionScratchV876} from './dynamicFestivalCrowdChoreographyV876';
import {applyCrowdInteractionMotionV877} from './intelligentCrowdInteractionV877';
import {applyAudienceEmotionMotionV878} from './smartAudienceEmotionDirectorV878';
import {applyCrowdCameraHarmonyMotionV879} from './crowdCameraStageHarmonyV879';
import type {VirtualCrowdCueV815} from './virtualConcertCrowdPlannerV815';

/** Three capped instanced draw calls, not individual animated avatar rigs.
 * Small crowds live on left/right wings, leaving a wide center sightline.
 * No shadows, lights, textures, geometry/material allocations in animation frames.
 */
export function VirtualConcertCrowdV815({cueRef}:{cueRef:{current:VirtualCrowdCueV815}}){
 const people=useMemo(createVirtualCrowdLayoutV815,[]);
 const dummy=useMemo(()=>new Object3D(),[]);
 const choreographyMotion=useMemo(createCrowdMotionScratchV876,[]);
 const heads=useRef<InstancedMesh>(null),bodies=useRef<InstancedMesh>(null);
 const phones=useRef<InstancedMesh>(null);
 const silhouetteMat=useRef<MeshBasicMaterial>(null),headMat=useRef<MeshBasicMaterial>(null);
 const phoneMat=useRef<MeshBasicMaterial>(null);
 const mainColor=useMemo(()=>new Color('#0c1020'),[]);
 const accent=useMemo(()=>new Color(),[]);
 const previous=useRef({phase:0,count:-1});
 useLayoutEffect(()=>{
  // Matrices are set before any animated render; no invisible/zero initial bounds.
  for(let index=0;index<CROWD_MAX_V815;index++){
   const p=people[index];
   dummy.position.set(p.x,p.y+.36*p.scale,p.z);
   dummy.rotation.set(0,0,0);dummy.scale.set(.32*p.scale,.65*p.scale,.20*p.scale);
   dummy.updateMatrix();bodies.current?.setMatrixAt(index,dummy.matrix);
   dummy.position.set(p.x,p.y+.8*p.scale,p.z);
   dummy.scale.set(.155*p.scale,.17*p.scale,.14*p.scale);
   dummy.updateMatrix();heads.current?.setMatrixAt(index,dummy.matrix);
   dummy.position.set(p.x+.14*p.scale,p.y+1.03*p.scale,p.z+.03);
   dummy.scale.set(.075*p.scale,.115*p.scale,.018);
   dummy.updateMatrix();phones.current?.setMatrixAt(index,dummy.matrix);
  }
  for(const mesh of [heads.current,bodies.current,phones.current]){
   if(mesh){mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();}
  }
 },[people,dummy]);
 useFrame((_,dt)=>{
  const cue=cueRef.current;
  const head=heads.current,body=bodies.current,phone=phones.current;
  if(!head||!body||!phone)return;
  const active=cue.active&&cue.count>0;
  head.visible=body.visible=active;phone.visible=active&&cue.phoneOpacity>.003;
  if(!active){previous.current.count=-1;return;}
  const n=Math.max(0,Math.min(CROWD_MAX_V815,cue.count));
  head.count=body.count=n;phone.count=n;
  if(silhouetteMat.current)silhouetteMat.current.opacity=.55+cue.lightGain*.35;
  if(headMat.current)headMat.current.opacity=.65+cue.lightGain*.20;
  if(phoneMat.current){phoneMat.current.opacity=cue.phoneOpacity;accent.set(cue.primary);
    phoneMat.current.color.copy(mainColor).lerp(accent,.82);}
  // 20 Hz cap on instance uploads regardless of display refresh rate.
  previous.current.phase+=Math.min(.1,Math.max(0,dt));
  if(previous.current.phase>=.05||previous.current.count!==n){
   previous.current.phase=0;previous.current.count=n;
   for(let index=0;index<n;index++){
    const p=people[index];
    const wave=Math.sin(cue.phase*(cue.movement>.14?6:3)+p.phase);
    const lift=Math.max(-.07,Math.min(.12,wave*cue.movement));
    sampleCrowdChoreographyV876(index,p,cue,choreographyMotion);
   applyCrowdInteractionMotionV877(index,p,cue,choreographyMotion);
   applyAudienceEmotionMotionV878(index,p,cue,choreographyMotion);
   applyCrowdCameraHarmonyMotionV879(index,p,cue,choreographyMotion);
    const visualLift=lift+choreographyMotion.bob;
    dummy.position.set(p.x+choreographyMotion.horizontal,p.y+.36*p.scale+visualLift,p.z);
    dummy.rotation.set(0,0,wave*cue.movement*.18+choreographyMotion.tilt);
    dummy.scale.set(.32*p.scale,.65*p.scale,.20*p.scale);
    dummy.updateMatrix();body.setMatrixAt(index,dummy.matrix);
    dummy.position.set(p.x+choreographyMotion.horizontal,p.y+.8*p.scale+visualLift,p.z);
    dummy.scale.set(.155*p.scale,.17*p.scale,.14*p.scale);
    dummy.updateMatrix();head.setMatrixAt(index,dummy.matrix);
    const phoneWave=(cue as {phoneWave?:number}).phoneWave??0;
    const phoneSway=phoneWave*Math.sin(cue.phase*5+p.phase)*.13*p.scale;
    dummy.position.set(p.x+choreographyMotion.horizontal+.14*p.scale,p.y+1.03*p.scale+visualLift+phoneSway,p.z+.03);
    dummy.rotation.set(0,0,0);dummy.scale.set(p.phone?.075*p.scale:0,p.phone?.115*p.scale:0,.018);
    dummy.updateMatrix();phone.setMatrixAt(index,dummy.matrix);
   }
   for(const mesh of [head,body,phone])mesh.instanceMatrix.needsUpdate=true;
  }
 });
 return <group name="v815-virtual-concert-crowd" frustumCulled={false}>
   <instancedMesh ref={bodies} args={[undefined,undefined,CROWD_MAX_V815]} visible={false} castShadow={false} receiveShadow={false} frustumCulled={false} renderOrder={0}>
    <cylinderGeometry args={[.6,.85,1,5,1]}/>
    <meshBasicMaterial ref={silhouetteMat} color="#121525" transparent opacity={.65} depthWrite={false} toneMapped={false}/>
   </instancedMesh>
   <instancedMesh ref={heads} args={[undefined,undefined,CROWD_MAX_V815]} visible={false} castShadow={false} receiveShadow={false} frustumCulled={false} renderOrder={0}>
    <sphereGeometry args={[1,6,4]}/>
    <meshBasicMaterial ref={headMat} color="#192038" transparent opacity={.72} depthWrite={false} toneMapped={false}/>
   </instancedMesh>
   <instancedMesh ref={phones} args={[undefined,undefined,CROWD_MAX_V815]} visible={false} castShadow={false} receiveShadow={false} frustumCulled={false} renderOrder={0}>
    <boxGeometry args={[1,1,1]}/>
    <meshBasicMaterial ref={phoneMat} color="#7ea9ff" transparent opacity={0} depthWrite={false} toneMapped={false}/>
   </instancedMesh>
  </group>;
}
