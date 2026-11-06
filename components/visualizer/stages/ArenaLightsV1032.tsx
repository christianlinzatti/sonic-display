"use client";
import {useFrame} from "@react-three/fiber";
import {useMemo,useRef} from "react";
import {Object3D,type Group,type MeshBasicMaterial,type SpotLight} from "three";
import type {AudioFeatures} from "@/types/audio";
import {getActivePerformanceTier} from "../adaptivePerformance";
import {INITIAL_ARENA_DROP_V1032,stepArenaDropV1032} from "@/lib/arena360ExperienceV1032";

/** Actual moving target spots + subtle translucent fixtures. A single soft drop
 * ring replaces any strobe/full-screen white flash. Uses the existing R3F clock.
 */
export function ArenaLightsV1032({audio,playing,reducedMotion,reactive=true,enabled=true,dropEnabled=true}:{
  audio:AudioFeatures;playing:boolean;reducedMotion:boolean;reactive?:boolean;
  enabled?:boolean;dropEnabled?:boolean;
}){
  const left=useRef<Group>(null),right=useRef<Group>(null);
  const spotlightA=useRef<SpotLight>(null),spotlightB=useRef<SpotLight>(null);
  const ringA=useRef<MeshBasicMaterial>(null),ringB=useRef<MeshBasicMaterial>(null);
  const targetA=useMemo(()=>new Object3D(),[]),targetB=useMemo(()=>new Object3D(),[]);
  const drop=useRef({...INITIAL_ARENA_DROP_V1032});
  const clock=useRef(0);
  useFrame((_,delta)=>{
    const dt=Number.isFinite(delta)?Math.max(0,Math.min(.1,delta)):0;
    if(playing&&!reducedMotion)clock.current+=dt;
    const moving=enabled&&playing&&!reducedMotion;
    const t=clock.current;
    const bass=reactive&&moving?Math.max(0,Math.min(1,audio.bass??0)):0;
    // Fixture's cone and the real light sweep toward the same center-stage position.
    targetA.position.set(Math.sin(t*.43)*1.30,-.55,Math.cos(t*.43)*.74);
    targetB.position.set(Math.sin(t*.43+Math.PI)*1.30,-.55,Math.cos(t*.43+Math.PI)*.74);
    targetA.updateMatrixWorld();targetB.updateMatrixWorld();
    if(left.current){left.current.rotation.z=moving?Math.sin(t*.43)*.22:0;left.current.rotation.x=moving?Math.cos(t*.43)*.13:0;}
    if(right.current){right.current.rotation.z=moving?Math.sin(t*.43+Math.PI)*.22:0;right.current.rotation.x=moving?Math.cos(t*.43+Math.PI)*.13:0;}
    const tier=getActivePerformanceTier();
    // Cap the number of extra *real* lights. Existing concert director keeps
    // ownership of its own fixtures; none of these cast dynamic shadows.
    if(spotlightA.current){
      spotlightA.current.visible=enabled&&tier!=='low';
      spotlightA.current.intensity=enabled?(moving ? .55+bass*.32 : .33):0;
    }
    if(spotlightB.current){
      spotlightB.current.visible=enabled&&tier==='high';
      spotlightB.current.intensity=enabled?(moving ? .46+bass*.25 : .30):0;
    }
    drop.current=stepArenaDropV1032(drop.current,dt,{
      playing,reducedMotion,enabled:dropEnabled&&enabled,reactive,
      beat:audio.beat,beatStrength:audio.beatStrength,bass:audio.bass,
      energyEnvelope:audio.energyEnvelope,kickAccentIntensity:audio.kickAccentIntensity,
    });
    // Warm glow fades gradually rather than a hard white flash.
    if(ringA.current)ringA.current.opacity=.12+drop.current.energy*.46;
    if(ringB.current)ringB.current.opacity=.09+drop.current.energy*.30;
  });
  if(!enabled)return null;
  return <group name="v1032-arena-moving-spotlights">
    <primitive object={targetA}/><primitive object={targetB}/>
    <spotLight ref={spotlightA} position={[-2.50,2.88,1.55]} target={targetA}
      color="#6edfff" intensity={.55} distance={10} decay={2} angle={.48} penumbra={.94} castShadow={false}/>
    <spotLight ref={spotlightB} position={[2.50,2.88,-1.55]} target={targetB}
      color="#f57bfb" intensity={.46} distance={10} decay={2} angle={.48} penumbra={.94} castShadow={false}/>
    <group ref={left} position={[-2.50,2.86,1.55]}>
      <mesh position={[0,-1.42,0]}><coneGeometry args={[.64,2.84,12,1,true]}/>
        <meshBasicMaterial color="#4cbdff" transparent opacity={.075} depthWrite={false} side={2}/></mesh>
    </group>
    <group ref={right} position={[2.50,2.86,-1.55]}>
      <mesh position={[0,-1.42,0]}><coneGeometry args={[.64,2.84,12,1,true]}/>
        <meshBasicMaterial color="#ce71ff" transparent opacity={.075} depthWrite={false} side={2}/></mesh>
    </group>
    <mesh position={[0,-2.025,0]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[3.24,3.32,80]}/>
      <meshBasicMaterial ref={ringA} color="#64e9ff" transparent opacity={.12} toneMapped={false} depthWrite={false}/>
    </mesh>
    <mesh position={[0,-2.023,0]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[3.91,4.03,80]}/>
      <meshBasicMaterial ref={ringB} color="#ff70db" transparent opacity={.09} toneMapped={false} depthWrite={false}/>
    </mesh>
  </group>;
}
