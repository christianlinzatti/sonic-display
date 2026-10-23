"use client";
import {combineFestivalGainsV394,type FestivalShowCueV394} from "./festivalShowDirectorV394";
import {planConcertLightingV462} from "./concertLightingDirectorV462";
import type {ConcertShowCueV387} from "./concertShowDirectorV387";
import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, Color, DoubleSide, Fog, Vector3 } from "three";
import type { Group, ShaderMaterial, SpotLight, MeshBasicMaterial } from "three";
import type { AudioFeatures } from "@/types/audio";
import type { ShowCue } from "./ultimateShowDirectorV306";
import type { StageSection } from "./stageDirectorV287";
import type { StageEnvironmentId } from "./stages";
import { getActivePerformanceTier } from "./adaptivePerformance";
import { getLightingPlayback } from "./lightingPlayback";
import { useSceneDetail, sceneDetailFlags } from "./scenePerformanceControls";
import { CONCERT_ATMOSPHERE_EVENT, DEFAULT_CONCERT_ATMOSPHERE, evaluateConcertAtmosphereV308, readConcertAtmosphereSettings } from "./concertAtmosphereV308";

// No postprocessing, high-resolution textures, expensive physically-based volumetric scattering,
// or shadow-map allocation. The light shafts are low-poly, additive translucent cones.
const BEAM_VERTEX = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
const BEAM_FRAGMENT = `uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv;
  void main(){float axial=(1.0-smoothstep(0.68,1.0,vUv.y))*smoothstep(0.0,0.16,vUv.y);
  gl_FragColor=vec4(uColor, clamp(uOpacity*axial,0.0,0.30));}`;
const HAZE_VERTEX = BEAM_VERTEX;
const HAZE_FRAGMENT = `uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv;
  void main(){float d=length((vUv-vec2(0.5))*vec2(1.12,1.0));
  float soft=1.0-smoothstep(0.04,0.51,d);
  gl_FragColor=vec4(uColor,clamp(uOpacity*soft,0.0,0.15));}`;
const DOWN = new Vector3(0,-1,0);
const BEAM_HEIGHT = 5.0;

export function ConcertAtmosphereRendererV308({ audio, isPlaying, reactive, reducedMotion, theme, musicPalette, showCue, timelineGainRef, sectionRef, genreV462, concertShowCueV387, authoredLightingV387=false,festivalShowCueV394,festivalShowLasersV394=false }: {
  audio: AudioFeatures; isPlaying: boolean; reactive: boolean; reducedMotion: boolean;
  theme: StageEnvironmentId; genreV462?: string | null; musicPalette?: {primary:string;secondary:string;glow:string}; showCue?: ShowCue;
  timelineGainRef: {current: number}; sectionRef: {current: StageSection};
  concertShowCueV387?:ConcertShowCueV387;authoredLightingV387?:boolean;festivalShowCueV394?:FestivalShowCueV394;festivalShowLasersV394?:boolean;
}) {
  const [settings,setSettings]=useState(DEFAULT_CONCERT_ATMOSPHERE);
  const [tier,setTier]=useState(getActivePerformanceTier);
  const scene=useThree(state=>state.scene);
  const sceneFlags=sceneDetailFlags(useSceneDetail());
  useEffect(()=>{
    const sync=()=>setSettings(readConcertAtmosphereSettings());
    sync(); window.addEventListener(CONCERT_ATMOSPHERE_EVENT,sync); window.addEventListener("storage",sync);
    return ()=>{window.removeEventListener(CONCERT_ATMOSPHERE_EVENT,sync);window.removeEventListener("storage",sync);};
  },[]);
  const laserFanV394=useRef<Group>(null);
  const laserMaterialV394=useRef<MeshBasicMaterial>(null);
  const laserMaterialRightV394=useRef<MeshBasicMaterial>(null);
  const leftGroup=useRef<Group>(null);
  const rightGroup=useRef<Group>(null);
  const leftBeam=useRef<ShaderMaterial>(null);
  const rightBeam=useRef<ShaderMaterial>(null);
  const floorHaze=useRef<ShaderMaterial>(null);
  const backHaze=useRef<ShaderMaterial>(null);
  const leftSpot=useRef<SpotLight>(null);
  const rightSpot=useRef<SpotLight>(null);
  const leftDirection=useRef(new Vector3());
  const rightDirection=useRef(new Vector3());
  const desiredPrimary=useRef(new Color());
  const desiredSecondary=useRef(new Color());
  const ambientBase = theme === "white" || theme === "minimal" ? "#b2bfd1" : theme === "festival" ? "#351a48" : theme === "rock" ? "#261a18" : "#10102b";
  const showLightingAllowed=!(settings.syncToShow && showCue?.enabled && !showCue.lightingEnabled);
  // Fog must be attached to the THREE.Scene (a fog child of a group has no effect).
  // Clean up only our own instance, preserving other scene controllers' fog.
  useEffect(()=>{
    if(!settings.enabled||!settings.haze||settings.hazeDensity<=0||tier==="low"||!showLightingAllowed)return;
    const previous=scene.fog;
    const density=Math.max(0,Math.min(1,settings.hazeDensity/100));
    const fog=new Fog(ambientBase,10+(1-density)*12,27+(1-density)*27);
    scene.fog=fog;
    return ()=>{if(scene.fog===fog)scene.fog=previous;};
  },[ambientBase,scene,settings.enabled,settings.haze,settings.hazeDensity,tier,showLightingAllowed]);
  useFrame((state,delta)=>{
    const nowTier=getActivePerformanceTier();
    if (nowTier!==tier) setTier(nowTier); // only on a real device tier transition
    const playback=getLightingPlayback();
    const frame=evaluateConcertAtmosphereV308({
      settings,isPlaying,reactive,reducedMotion,theme,tier:nowTier,
      sceneExtraLights:sceneFlags.extraLights,
      section:sectionRef.current,
      energy:audio.energyEnvelope ?? audio.bass ?? 0,
      kick:audio.kickAccentIntensity ?? 0,
      timeSeconds:playback.trackId && Number.isFinite(playback.positionMs) ? playback.positionMs/1000 : state.clock.elapsedTime,
      timelineGain:timelineGainRef.current,
      showCue,
    });
    const showV387=concertShowCueV387?.active&&!authoredLightingV387&&showLightingAllowed&&
      timelineGainRef.current>.001?concertShowCueV387:undefined;
    const lightingV462=planConcertLightingV462({genre:genreV462,section:sectionRef.current,
      energy:audio.energyEnvelope??audio.bass??0,kick:audio.kickAccentIntensity??0,
      playing:isPlaying,reactive,reducedMotion,tier:nowTier,
      authored:authoredLightingV387||!showLightingAllowed,
      blackout:timelineGainRef.current<.001,enabled:settings.enabled});
    const combinedV394=combineFestivalGainsV394(showV387,reactive&&isPlaying&&!reducedMotion?festivalShowCueV394:undefined,{
      authored:authoredLightingV387,blackout:timelineGainRef.current<.001||!showLightingAllowed});
    const beamGainV387=combinedV394.beamGain;
    const hazeGainV387=combinedV394.hazeGain;
    const sweepGainV387=combinedV394.sweepGain;
    const alpha=1-Math.exp(-Math.min(.1,Math.max(0,delta))*5.5);
    // Two thin additive fan bars – no extra GPU lights, shadow maps, shaders or strobes.
    const lasersOn=festivalShowLasersV394 && reactive && isPlaying && !reducedMotion && settings.enabled && settings.beams &&
      tier==="high" && nowTier==="high" && sceneFlags.beamSweep && showLightingAllowed &&
      timelineGainRef.current>.001 && !authoredLightingV387 && festivalShowCueV394?.active;
    const laserOpacity=lasersOn?Math.min(.17,(festivalShowCueV394?.laserGain??0)*.20):0;
    if(laserMaterialV394.current) laserMaterialV394.current.opacity+=(laserOpacity-laserMaterialV394.current.opacity)*Math.min(.25,Math.max(0,delta)*5);
    if(laserMaterialRightV394.current) laserMaterialRightV394.current.opacity+=(laserOpacity-laserMaterialRightV394.current.opacity)*Math.min(.25,Math.max(0,delta)*5);
    if(laserFanV394.current) laserFanV394.current.rotation.y=Math.sin(state.clock.elapsedTime*.44)*Math.min(.17,(festivalShowCueV394?.sweepGain??1)-1);

    desiredPrimary.current.set(musicPalette?.primary ?? (theme === "rock" ? "#ff8f40" : "#58cfff"));
    desiredSecondary.current.set(musicPalette?.secondary ?? (theme === "festival" ? "#f5b24e" : "#e674ff"));
    const move=(material:ShaderMaterial|null,opacity:number,color:Color)=>{
      if(!material)return;
      const o=material.uniforms.uOpacity;
      o.value+=(opacity-o.value)*alpha;
      (material.uniforms.uColor.value as Color).lerp(color,alpha);
    };
    move(leftBeam.current,Math.min(.3,frame.leftOpacity*beamGainV387*lightingV462.beamGain),desiredPrimary.current);
    move(rightBeam.current,Math.min(.3,frame.rightOpacity*beamGainV387*lightingV462.beamGain),desiredSecondary.current);
    move(floorHaze.current,Math.min(.15,frame.floorHaze*hazeGainV387*lightingV462.hazeGain),desiredPrimary.current);
    move(backHaze.current,Math.min(.15,frame.backHaze*hazeGainV387*lightingV462.hazeGain),desiredSecondary.current);
    if(leftGroup.current){
      leftDirection.current.set(Math.max(-3.0,Math.min(3.0,(-.65+(frame.targetLeftX+.65)*lightingV462.sweepGain)*sweepGainV387))-(-2.55),-1.72-3.15,.25-(-1.25)).normalize();
      leftGroup.current.quaternion.setFromUnitVectors(DOWN,leftDirection.current);
    }
    if(rightGroup.current){
      rightDirection.current.set(Math.max(-3.0,Math.min(3.0,(.65+(frame.targetRightX-.65)*lightingV462.sweepGain)*sweepGainV387))-2.55,-1.72-3.15,.25-(-1.25)).normalize();
      rightGroup.current.quaternion.setFromUnitVectors(DOWN,rightDirection.current);
    }
    const setSpot=(spot:SpotLight|null,intensity:number,color:Color,targetX:number)=>{
      if(!spot)return;
      spot.intensity+=(intensity-spot.intensity)*alpha;
      spot.color.lerp(color,alpha);
      spot.target.position.set(targetX,-1.72,.25);
      spot.target.updateMatrixWorld();
    };
    setSpot(leftSpot.current,Math.min(3,frame.leftLight*beamGainV387*lightingV462.spotGain),desiredPrimary.current,Math.max(-3,Math.min(3,(-.65+(frame.targetLeftX+.65)*lightingV462.sweepGain)*sweepGainV387)));
    setSpot(rightSpot.current,Math.min(3,frame.rightLight*beamGainV387*lightingV462.spotGain),desiredSecondary.current,Math.max(-3,Math.min(3,(.65+(frame.targetRightX-.65)*lightingV462.sweepGain)*sweepGainV387)));
  });
  const beamVisible=settings.enabled&&settings.beams&&tier!=="low"&&sceneFlags.beamSweep;
  const hazeVisible=settings.enabled&&settings.haze&&tier!=="low";
  const spotVisible=settings.enabled&&settings.stageSpots&&tier!=="low"&&sceneFlags.extraLights;
  const laserVisible=festivalShowLasersV394&&settings.enabled&&settings.beams&&tier==="high"&&sceneFlags.beamSweep;
  return <group>
    {laserVisible && <group ref={laserFanV394} position={[0,0,-2.4]}>
      <mesh position={[-1.0,.2,0]} rotation={[0,0,-.41]}>
        <boxGeometry args={[.025,4.6,.025]}/>
        <meshBasicMaterial ref={laserMaterialV394} color={musicPalette?.primary??"#7ff8ff"} transparent opacity={0} depthWrite={false} blending={AdditiveBlending} fog={false}/>
      </mesh>
      <mesh position={[1.0,.2,0]} rotation={[0,0,.41]}>
        <boxGeometry args={[.025,4.6,.025]}/>
        <meshBasicMaterial ref={laserMaterialRightV394} color={musicPalette?.secondary??"#ff84f5"} transparent opacity={0} depthWrite={false} blending={AdditiveBlending} fog={false}/>
      </mesh>
    </group>}
    {beamVisible && <group ref={leftGroup} position={[-2.55,3.15,-1.25]}>
      <mesh position={[0,-BEAM_HEIGHT/2,0]} frustumCulled={false}>
        <coneGeometry args={[1.12,BEAM_HEIGHT,22,1,true]}/>
        <shaderMaterial ref={leftBeam} vertexShader={BEAM_VERTEX} fragmentShader={BEAM_FRAGMENT} transparent depthWrite={false} side={DoubleSide} blending={AdditiveBlending} uniforms={{uOpacity:{value:0},uColor:{value:new Color("#58cfff")}}}/>
      </mesh>
    </group>}
    {beamVisible && tier==="high" && <group ref={rightGroup} position={[2.55,3.15,-1.25]}>
      <mesh position={[0,-BEAM_HEIGHT/2,0]} frustumCulled={false}>
        <coneGeometry args={[1.12,BEAM_HEIGHT,22,1,true]}/>
        <shaderMaterial ref={rightBeam} vertexShader={BEAM_VERTEX} fragmentShader={BEAM_FRAGMENT} transparent depthWrite={false} side={DoubleSide} blending={AdditiveBlending} uniforms={{uOpacity:{value:0},uColor:{value:new Color("#e674ff")}}}/>
      </mesh>
    </group>}
    {spotVisible && <spotLight ref={leftSpot} position={[-2.55,3.15,-1.25]} angle={.30} penumbra={.97} decay={2} distance={9} castShadow={false} intensity={0}/>}
    {spotVisible && tier==="high" && <spotLight ref={rightSpot} position={[2.55,3.15,-1.25]} angle={.30} penumbra={.97} decay={2} distance={9} castShadow={false} intensity={0}/>}
    {hazeVisible && <mesh position={[0,-1.914,0]} rotation={[-Math.PI/2,0,0]} renderOrder={2}>
      <planeGeometry args={[9.2,7.2]}/>
      <shaderMaterial ref={floorHaze} vertexShader={HAZE_VERTEX} fragmentShader={HAZE_FRAGMENT} transparent depthWrite={false} side={DoubleSide} blending={AdditiveBlending} uniforms={{uOpacity:{value:0},uColor:{value:new Color("#58cfff")}}}/>
    </mesh>}
    {hazeVisible && tier==="high" && <mesh position={[0,-1.88,-1.65]} rotation={[-Math.PI/2,0,0]} renderOrder={2}>
      <planeGeometry args={[7.5,5.1]}/>
      <shaderMaterial ref={backHaze} vertexShader={HAZE_VERTEX} fragmentShader={HAZE_FRAGMENT} transparent depthWrite={false} side={DoubleSide} blending={AdditiveBlending} uniforms={{uOpacity:{value:0},uColor:{value:new Color("#e674ff")}}}/>
    </mesh>}
  </group>;
}
