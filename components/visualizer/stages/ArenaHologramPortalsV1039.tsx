"use client";
import {useFrame} from '@react-three/fiber';
import {useEffect,useMemo,useRef} from 'react';
import {AdditiveBlending,Color,DoubleSide,Matrix4,Object3D,Shape,ShapeGeometry,type InstancedMesh} from 'three';
import type {AudioFeatures} from '@/types/audio';
import {useAdaptivePerformance} from '../adaptivePerformance';
import {createHologramFixturesV1039,planArenaHolographyV1039,sampleHologramPortalV1039,
 type HologramPatternV1039} from '@/lib/arena360HolographyV1039';
import {sampleHolographicConcertV1068,type HologramCueV1068} from '@/lib/arena360HolographicConcertV1068';
import {sampleHolographicDancerV1081,type DancerCueV1081,type DancerPoseV1081} from '@/lib/arena360HolographicDancersV1081';
/** Hologram-like floating rings, rendered as TWO bounded instance batches.
 * Not avatars, not projectors or physical lasers, no network, timers, camera, shadows.
 */
export function ArenaHologramPortalsV1039({audio,playing,reducedMotion,reactive,enabled=true,genre,
 section,pattern='auto',strength=65,concertCueV1068,dancerCueV1081}:{audio:AudioFeatures;playing:boolean;reducedMotion:boolean;
 reactive:boolean;enabled?:boolean;genre?:string|null;section?:string;
 pattern?:HologramPatternV1039;strength?:number;concertCueV1068?:HologramCueV1068;dancerCueV1081?:DancerCueV1081}){
 const {tier}=useAdaptivePerformance();
 const fixtures=useMemo(()=>createHologramFixturesV1039(tier),[tier]);
 const rings=useRef<InstancedMesh>(null),crystals=useRef<InstancedMesh>(null),echoes=useRef<InstancedMesh>(null),arms=useRef<InstancedMesh>(null);
 const dummy=useMemo(()=>new Object3D(),[]),tint=useMemo(()=>new Color(),[]);
 const dancerBase=useMemo(()=>new Matrix4(),[]),armMatrix=useMemo(()=>new Matrix4(),[]);
 const dancerPose=useMemo<DancerPoseV1081>(()=>({sideStep:0,bob:0,tilt:0,yaw:0,leftArm:0,rightArm:0,scale:1,glow:0}),[]);
 const palette=useMemo(()=>[new Color(),new Color()],[]);
 // One small 2-D performer outline repeated across existing portal positions.
 // No GLB duplication, skeletal animation, extra audio stream or new frame owner.
 const silhouetteGeometry=useMemo(()=>{
  const outline=new Shape();
  const contour:[number,number][]=[[-.20,-.52],[-.07,-.52],[-.02,-.22],[.02,-.22],
   [.07,-.52],[.20,-.52],[.13,-.12],[.18,.07],[.26,-.08],[.31,-.04],
   [.22,.20],[.12,.22],[.10,.28],[.14,.35],[.10,.44],[0,.48],
   [-.10,.44],[-.14,.35],[-.10,.28],[-.12,.22],[-.22,.20],[-.31,-.04],
   [-.26,-.08],[-.18,.07],[-.13,-.12]];
  outline.moveTo(...contour[0]);
  contour.slice(1).forEach(point=>outline.lineTo(...point));outline.closePath();
  return new ShapeGeometry(outline);
 },[]);
 useEffect(()=>()=>silhouetteGeometry.dispose(),[silhouetteGeometry]);
 const time=useRef(0),budget=useRef(.2),lastActive=useRef(true);
 useFrame((_,delta)=>{
  if(!enabled||!rings.current||!crystals.current)return;
  const active=playing&&!reducedMotion&&reactive;
  const dt=Number.isFinite(delta)?Math.max(0,Math.min(.1,delta)):0;
  if(active)time.current+=dt;
  if(!active&&!lastActive.current)return;
  budget.current+=dt;
  if(active&&budget.current<(tier==='low'?.16:.075))return;
  budget.current=0;lastActive.current=active;
  const cue=planArenaHolographyV1039({enabled,playing,reducedMotion,reactive,genre,section,
    pattern,strength,energy:audio.energyEnvelope??audio.bass});
  palette[0].set(cue.primary);palette[1].set(cue.secondary);
  for(let i=0;i<fixtures.length;i++){
   const sample=sampleHologramPortalV1039(fixtures[i],time.current,cue);
   const fx=sampleHolographicConcertV1068(i,fixtures.length,
    concertCueV1068??{active:false,look:'awakening',power:0,phase:0,sync:'show'});
   const theta=Math.atan2(sample.z,sample.x)+fx.rotation;
   const radius=Math.hypot(sample.x,sample.z)+fx.radial;
   dummy.position.set(Math.cos(theta)*radius,sample.y+fx.rise,Math.sin(theta)*radius);
   dummy.rotation.set(0,sample.rotY+fx.rotation,sample.rotZ);
   dummy.scale.setScalar(sample.size*fx.scale);dummy.updateMatrix();
   rings.current.setMatrixAt(i,dummy.matrix);
   rings.current.setColorAt(i,tint.copy(palette[i%2]).multiplyScalar(Math.min(.49,sample.light+fx.glow)));
   dummy.scale.setScalar(sample.size*.64*fx.scale);dummy.rotation.set(.3+time.current*cue.speed*.16,sample.rotY+fx.rotation+time.current*cue.speed*.3,sample.rotZ);
   dummy.updateMatrix();crystals.current.setMatrixAt(i,dummy.matrix);
   crystals.current.setColorAt(i,tint.copy(palette[1-i%2]).multiplyScalar(Math.min(.49,sample.light*.8+fx.glow*.7)));
   if(echoes.current){
    // V1081 reuses the existing projected silhouette; only the two arm highlights
    // need one extra bounded instanced batch (max 18 instances). The stage cast,
    // its foot IK, audio sources and the main portal ring remain unchanged.
    const visible=active&&tier!=='low'&&fx.echo>0;
    const dancing=visible&&dancerCueV1081?.active===true;
    if(dancing)sampleHolographicDancerV1081(i,fixtures.length,dancerCueV1081!,dancerPose);
    const tangent=dancing?dancerPose.sideStep:0;
    dummy.position.set(Math.cos(theta)*radius-Math.sin(theta)*tangent,
      sample.y+fx.rise+(dancing?dancerPose.bob:0),
      Math.sin(theta)*radius+Math.cos(theta)*tangent);
    dummy.rotation.set(0,-theta-Math.PI/2+(dancing?dancerPose.yaw:0),dancing?dancerPose.tilt:0);
    dummy.scale.setScalar(visible ? (.65+fx.echo*.20)*(dancing?dancerPose.scale:1):.00001);
    dummy.updateMatrix();
    echoes.current.setMatrixAt(i,dummy.matrix);
    echoes.current.setColorAt(i,tint.copy(palette[i%2]).multiplyScalar(
      Math.min(.30,Math.min(.30,fx.echo*.28)+(dancing?dancerPose.glow:0))));
    if(arms.current){
      dancerBase.copy(dummy.matrix);
      for(let arm=0;arm<2;arm++){
       const sign=arm===0?-1:1;
       dummy.position.set(sign*.21,.10,0);
       dummy.rotation.set(0,0,sign*(dancing?(arm===0?dancerPose.leftArm:dancerPose.rightArm):0)-sign*.20);
       dummy.scale.set(.65,1,1);dummy.updateMatrix();
       armMatrix.multiplyMatrices(dancerBase,dummy.matrix);
       arms.current.setMatrixAt(i*2+arm,armMatrix);
       arms.current.setColorAt(i*2+arm,tint.copy(palette[1-i%2]).multiplyScalar(
        dancing?Math.min(.30,fx.echo*.24+dancerPose.glow):0));
      }
    }
   }
  }
  for(const mesh of [rings.current,crystals.current,echoes.current,arms.current]){
   if(!mesh)continue;
   mesh.instanceMatrix.needsUpdate=true;
   if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
  }
 });
 if(!enabled)return null;
 return <group name="v1039-holographic-portals-world-fixed">
  <instancedMesh ref={rings} args={[undefined,undefined,fixtures.length]} frustumCulled={false}>
   <torusGeometry args={[.36,.018,5,32]}/>
   <meshBasicMaterial color="#ffffff" transparent opacity={.59} depthWrite={false} toneMapped={false}/>
  </instancedMesh>
  <instancedMesh ref={crystals} args={[undefined,undefined,fixtures.length]} frustumCulled={false}>
   <octahedronGeometry args={[.22,0]}/>
   <meshBasicMaterial color="#ffffff" wireframe transparent opacity={.4} depthWrite={false} toneMapped={false}/>
  </instancedMesh>
  {tier!=='low'&&concertCueV1068?.active&&<instancedMesh ref={echoes} args={[undefined,undefined,fixtures.length]}
   geometry={silhouetteGeometry} frustumCulled={false}>
   <meshBasicMaterial color="#ffffff" transparent opacity={.32} blending={AdditiveBlending}
    depthWrite={false} depthTest={true} toneMapped={false} side={DoubleSide}/>
  </instancedMesh>}
  {tier!=='low'&&concertCueV1068?.active&&dancerCueV1081?.active&&<instancedMesh ref={arms}
   args={[undefined,undefined,fixtures.length*2]} frustumCulled={false}>
   <boxGeometry args={[.055,.36,.018]}/>
   <meshBasicMaterial color="#ffffff" transparent opacity={.25} blending={AdditiveBlending}
    depthWrite={false} depthTest={true} toneMapped={false}/>
  </instancedMesh>}
 </group>;
}
