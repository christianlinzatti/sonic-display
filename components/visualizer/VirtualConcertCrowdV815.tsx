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
import {sampleLivingAudienceV973,createLivingMotionScratchV973} from './livingAudienceDirectorV973';
import type {LivingAudienceCueV973} from './livingAudienceDirectorV973';
import type {VirtualCrowdCueV815} from './virtualConcertCrowdPlannerV815';
import type {ArenaCrowdCueV893} from './arenaCrowdAtmosphereV893';
import type {CrowdExperienceCueV996} from './virtualCrowdExperienceV996';

/** Three capped instanced draw calls, not individual animated avatar rigs.
 * Small crowds live on left/right wings, leaving a wide center sightline.
 * No shadows, lights, textures, geometry/material allocations in animation frames.
 */
export function VirtualConcertCrowdV815({cueRef}:{cueRef:{current:VirtualCrowdCueV815}}){
 const people=useMemo(createVirtualCrowdLayoutV815,[]);
 const dummy=useMemo(()=>new Object3D(),[]);
 const choreographyMotion=useMemo(createCrowdMotionScratchV876,[]);
 const livingMotionV973=useMemo(createLivingMotionScratchV973,[]);
 const heads=useRef<InstancedMesh>(null),bodies=useRef<InstancedMesh>(null);
 const phones=useRef<InstancedMesh>(null),glowsticksV996=useRef<InstancedMesh>(null);
 const silhouetteMat=useRef<MeshBasicMaterial>(null),headMat=useRef<MeshBasicMaterial>(null);
 const phoneMat=useRef<MeshBasicMaterial>(null),glowMatV996=useRef<MeshBasicMaterial>(null);
 const mainColor=useMemo(()=>new Color('#0c1020'),[]);
 const accent=useMemo(()=>new Color(),[]);
 const phoneColor=useMemo(()=>new Color('#ffffff'),[]);
 const phoneSecondary=useMemo(()=>new Color(),[]);
 const stickTintV996=useMemo(()=>new Color(),[]);
 const previous=useRef({phase:0,count:-1,arenaColored:false});
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
  const head=heads.current,body=bodies.current,phone=phones.current,sticks=glowsticksV996.current;
  if(!head||!body||!phone)return;
  const experience=cue as Partial<CrowdExperienceCueV996>;
  const sticksCount=experience.crowdActiveV996&&Number.isFinite(experience.crowdSticksV996)?
   Math.max(0,Math.min(24,Math.floor(experience.crowdSticksV996??0))):0;
  if(sticks)sticks.visible=cue.active&&sticksCount>0;
  const active=cue.active&&cue.count>0;
  head.visible=body.visible=active;phone.visible=active&&cue.phoneOpacity>.003;
  if(!active){previous.current.count=-1;previous.current.phase=0;return;}
  const n=Math.max(0,Math.min(CROWD_MAX_V815,cue.count));
  head.count=body.count=n;phone.count=n;
  const arenaCue=cue as ArenaCrowdCueV893;
  const arenaPulse=arenaCue.arenaActiveV893?arenaCue.arenaPhonePulseV893:0;
  const arenaWave=arenaCue.arenaActiveV893?arenaCue.arenaWaveV893:0;
  if(silhouetteMat.current)silhouetteMat.current.opacity=Math.min(.95,.55+cue.lightGain*.35+(arenaCue.arenaSilhouetteV893??0));
  if(headMat.current)headMat.current.opacity=.65+cue.lightGain*.20;
  if(phoneMat.current){phoneMat.current.opacity=cue.phoneOpacity;accent.set(cue.primary);
    phoneMat.current.color.copy(mainColor).lerp(accent,.82);}
  // 20 Hz cap on instance uploads regardless of display refresh rate.
  previous.current.phase+=Math.min(.1,Math.max(0,dt));
  if(previous.current.phase>=.05||previous.current.count!==n){
   previous.current.phase=0;previous.current.count=n;
   const resetPhoneColors=arenaPulse<=0&&previous.current.arenaColored;
   const crowdWaveV996=experience.crowdActiveV996?Math.min(.035,Math.max(0,experience.crowdWaveV996??0)):0;
   const crowdReactionV996=experience.crowdActiveV996?Math.min(.03,Math.max(0,experience.crowdReactionV996??0)):0;
   const crowdPhaseV996=experience.crowdActiveV996?(experience.crowdPhaseV996??0):0;
   for(let index=0;index<n;index++){
    const p=people[index];
    const wave=Math.sin(cue.phase*(cue.movement>.14?6:3)+p.phase);
    const lift=Math.max(-.07,Math.min(.12,wave*cue.movement));
    sampleCrowdChoreographyV876(index,p,cue,choreographyMotion);
   applyCrowdInteractionMotionV877(index,p,cue,choreographyMotion);
   applyAudienceEmotionMotionV878(index,p,cue,choreographyMotion);
   applyCrowdCameraHarmonyMotionV879(index,p,cue,choreographyMotion);
   sampleLivingAudienceV973(index,p,cue as LivingAudienceCueV973,choreographyMotion,livingMotionV973);
    // Bounded V893 arena ripple uses existing instanced silhouettes.
    const arenaRipple=arenaWave*Math.sin((arenaCue.arenaPhaseV893??0)*1.8+Math.floor(index/12)*.72+p.phase*.13);
    // V996 wave is an overlay on the EXISTING audience; no root or foot motion.
    const audienceWaveV996=crowdWaveV996*Math.sin(crowdPhaseV996*1.65-Math.floor(index/12)*.66+p.phase*.09);
    const audienceResponseV996=crowdReactionV996*Math.max(0,Math.sin(crowdPhaseV996*3+p.phase));
    const visualLift=lift+choreographyMotion.bob+Math.max(-.012,Math.min(.012,arenaRipple*.05))+
      Math.max(-.035,Math.min(.035,audienceWaveV996+audienceResponseV996));
    dummy.position.set(p.x+choreographyMotion.horizontal,p.y+.36*p.scale+visualLift,p.z);
    dummy.rotation.set(0,0,wave*cue.movement*.18+choreographyMotion.tilt);
    dummy.scale.set(.32*p.scale,.65*p.scale,.20*p.scale);
    dummy.updateMatrix();body.setMatrixAt(index,dummy.matrix);
    dummy.position.set(p.x+choreographyMotion.horizontal,p.y+.8*p.scale+visualLift,p.z);
    dummy.scale.set(.155*p.scale,.17*p.scale,.14*p.scale);
    dummy.rotation.z+=livingMotionV973.headNod;
    dummy.updateMatrix();head.setMatrixAt(index,dummy.matrix);
    const phoneWave=(cue as {phoneWave?:number}).phoneWave??0;
    const phoneSway=phoneWave*Math.sin(cue.phase*5+p.phase)*.13*p.scale+
      arenaPulse*Math.sin((arenaCue.arenaPhaseV893??0)*2.4+p.phase)*.028*p.scale;
    dummy.position.set(p.x+choreographyMotion.horizontal+.14*p.scale,p.y+1.03*p.scale+visualLift+phoneSway,p.z+.03);
    dummy.rotation.set(0,0,0);dummy.scale.set(p.phone?.075*p.scale:0,p.phone?.115*p.scale:0,.018);
    dummy.updateMatrix();phone.setMatrixAt(index,dummy.matrix);
    // 20 Hz deterministic handset tint, no per-frame Color allocations.
    if(arenaPulse>0){
     phoneSecondary.set(cue.secondary);
     const ratio=.20+.60*(.5+.5*Math.sin((arenaCue.arenaPhaseV893??0)*1.9+index*.71));
     phoneColor.copy(accent).lerp(phoneSecondary,ratio*arenaPulse);
     phone.setColorAt(index,phoneColor);
    }else if(resetPhoneColors){phoneColor.set('#ffffff');phone.setColorAt(index,phoneColor);}
   }
   // V996: ONE additional instanced draw call, up to 24 dim glowsticks, spread
   // across the already-authorized side-lane spectators. No per-frame allocations.
   if(sticks&&sticksCount>0){
    sticks.count=sticksCount;
    const glow=experience.crowdGlowV996??0;
    if(glowMatV996.current)glowMatV996.current.opacity=Math.min(.32,Math.max(0,glow));
    for(let slot=0;slot<sticksCount;slot++){
     const index=Math.min(n-1,Math.floor((slot+.5)*n/sticksCount));
     const p=people[index];
     const sway=Math.sin(crowdPhaseV996*1.5+p.phase*.6)*.09;
     dummy.rotation.set(0,0,sway);
     dummy.position.set(p.x+.24*p.scale,p.y+(1.03+.10*Math.sin(crowdPhaseV996*1.6-slot*.38))*p.scale,p.z+.045);
     dummy.scale.set(.028*p.scale,.27*p.scale,.028*p.scale);
     dummy.updateMatrix();sticks.setMatrixAt(slot,dummy.matrix);
     stickTintV996.set(slot%2===0?cue.primary:cue.secondary);
     sticks.setColorAt(slot,stickTintV996);
    }
    sticks.instanceMatrix.needsUpdate=true;
    if(sticks.instanceColor)sticks.instanceColor.needsUpdate=true;
   }
   for(const mesh of [head,body,phone])mesh.instanceMatrix.needsUpdate=true;
   if((arenaPulse>0||resetPhoneColors)&&phone.instanceColor)phone.instanceColor.needsUpdate=true;
   previous.current.arenaColored=arenaPulse>0;
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
   <instancedMesh name="v996-virtual-crowd-glowsticks" ref={glowsticksV996}
    args={[undefined,undefined,24]} visible={false} castShadow={false} receiveShadow={false} frustumCulled={false}>
    <cylinderGeometry args={[1,1,1,5,1]}/>
    <meshBasicMaterial ref={glowMatV996} color="#ffffff" transparent opacity={0} depthWrite={false} toneMapped={false}/>
   </instancedMesh>
  </group>;
}
