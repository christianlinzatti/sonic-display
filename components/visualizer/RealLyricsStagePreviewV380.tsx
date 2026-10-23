"use client";

import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { AnimationMixer, Box3, Vector3, type Group, type Object3D } from "three";
import { normalizeSpatialLayoutV381, type LyricsSpatialLayoutV381 } from "./lyricsSpatialEditorV381";
import { SpatialLyricsHandlesV381, type SpatialSafetyV381 } from "./SpatialLyricsHandlesV381";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { retargetHumanoidClips, readRetargetCalibration } from "./avatarAnimationRetarget";
import { DynamicStage } from "./DynamicStage";
import { Lyrics3DScene } from "./Lyrics3DScene";
import type { VisualizerProps } from "./registry";
import type { Lyrics, UiPreferences } from "@/types/music";
import type { AudioFeatures } from "@/types/audio";
import { useAvatarModel } from "@/hooks/useAvatarModel";
import { useDisplayProfileV388 } from "../DisplayPerformanceV388";
import {resolveDisplayBudgetV388} from "./displayPerformancePolicyV388";
import { planStudioCameraV380, previewClipTimeV380, STUDIO_CAST_POSITIONS_V380, type StudioCameraModeV380, type StudioCastV380, type StudioShotV380 } from "./realLyricsPreviewV380";

const EMPTY_AUDIO_V380: AudioFeatures = { bass:0,mids:0,highs:0,volume:0,beat:false,beatStrength:0,bpm:130,kick:0,snare:0,hiHat:0,energyEnvelope:0,attack:0,decay:0 };

class AvatarLoadBoundaryV380 extends Component<{children:ReactNode;fallback:ReactNode;modelKey:string},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidUpdate(previous:{modelKey:string}){if(this.state.failed&&previous.modelKey!==this.props.modelKey)this.setState({failed:false});}
  render(){return this.state.failed?this.props.fallback:this.props.children;}
}

/** A standalone avatar clone: the preview cannot advance the actual stage's AnimationMixer. */
function InstalledAvatarV380({url,animationUrl,positionMs,speed}:{url:string;animationUrl?:string;positionMs:number;speed:number}) {
  const gltf=useGLTF(url);
  const scene=useMemo(()=>cloneSkeleton(gltf.scene),[gltf.scene]);
  const mixer=useMemo(()=>new AnimationMixer(scene),[scene]);
  const fit=useMemo(()=>{
    const b=new Box3().setFromObject(scene);
    const dimensions=b.getSize(new Vector3());
    const center=b.getCenter(new Vector3());
    const scale=Number.isFinite(dimensions.y)&&dimensions.y>.001?Math.min(20,Math.max(.002,2.15/dimensions.y)):1;
    return {scale,offset:new Vector3(-center.x*scale,-center.y*scale,-center.z*scale)};
  },[scene]);
  const external=useExternalAnimationV380(url,animationUrl,scene);
  const clip=external[0]??gltf.animations[0];
  useEffect(()=>{
    mixer.stopAllAction();
    if(!clip)return;
    const action=mixer.clipAction(clip);
    action.play(); // Mixer.setTime() samples this action at an absolute studio time.
    return ()=>{action.stop();};
  },[clip,mixer]);
  useEffect(()=>{if(clip)mixer.setTime(previewClipTimeV380(positionMs,clip.duration,speed));},[mixer,clip,positionMs,speed]);
  useEffect(()=>()=>{mixer.stopAllAction();mixer.uncacheRoot(scene);},[mixer,scene]);
  return <group position={[fit.offset.x,fit.offset.y,fit.offset.z]}><group scale={fit.scale}><primitive object={scene}/></group></group>;
}

function useExternalAnimationV380(url:string,animationUrl:string|undefined,scene:Object3D) {
  const [clips,setClips]=useState<import("three").AnimationClip[]>([]);
  useEffect(()=>{
    setClips([]);
    if(!animationUrl)return;
    let alive=true;
    new GLTFLoader().load(animationUrl,gltf=>{
      if(!alive)return;
      try {setClips(retargetHumanoidClips(gltf.animations,gltf.scene,scene,readRetargetCalibration(url)).clips);}
      catch {setClips([]);}
    },undefined,()=>{if(alive)setClips([]);});
    return ()=>{alive=false;};
  },[url,animationUrl,scene]);
  return clips;
}

function ProceduralAvatarV380({positionMs,reducedMotion}:{positionMs:number;reducedMotion:boolean}) {
  const phase=reducedMotion?0:positionMs/650;
  return <group rotation={[0,Math.sin(phase*.3)*.09,Math.sin(phase)*.04]}>
    <mesh position={[0,.02,0]}><capsuleGeometry args={[.29,.90,6,12]}/><meshStandardMaterial color="#8c89eb" roughness={.7}/></mesh>
    <mesh position={[0,.91,0]}><sphereGeometry args={[.29,22,16]}/><meshStandardMaterial color="#efbda5" roughness={.8}/></mesh>
    <mesh position={[-.11,.97,.26]}><sphereGeometry args={[.025,10,10]}/><meshBasicMaterial color="#161b2e"/></mesh>
    <mesh position={[.11,.97,.26]}><sphereGeometry args={[.025,10,10]}/><meshBasicMaterial color="#161b2e"/></mesh>
    <mesh position={[-.44,.14,0]} rotation={[0,0,-.18]}><capsuleGeometry args={[.10,.64,5,8]}/><meshStandardMaterial color="#edae98"/></mesh>
    <mesh position={[.44,.14,0]} rotation={[0,0,.18]}><capsuleGeometry args={[.10,.64,5,8]}/><meshStandardMaterial color="#edae98"/></mesh>
    <mesh position={[-.16,-.80,0]}><capsuleGeometry args={[.12,.58,5,8]}/><meshStandardMaterial color="#222a50"/></mesh>
    <mesh position={[.16,-.80,0]}><capsuleGeometry args={[.12,.58,5,8]}/><meshStandardMaterial color="#222a50"/></mesh>
  </group>;
}

function DirectedCameraV380({shot,section,cast,leadIndex,side,immersive,strength,mode,reducedMotion,editMode}:{
  shot:StudioShotV380;section:"verse"|"hook"|"drop";cast:StudioCastV380;leadIndex:number;
  side:"left"|"right";immersive:boolean;strength:number;mode:StudioCameraModeV380;reducedMotion:boolean;editMode?:boolean;
}) {
  const {camera,invalidate}=useThree();
  const plan=planStudioCameraV380({shot,section,cast,leadIndex,side,immersive,strength});
  const target=useRef(new Vector3());
  useEffect(()=>{
    if(mode==="orbit")return;
    // When paused or reducing motion, jumps are intentional: scrubbing must never wait for frame-loop animation.
    if(reducedMotion){camera.position.set(...plan.position);camera.lookAt(...plan.target);camera.updateProjectionMatrix();invalidate();}
  },[camera,invalidate,mode,plan.position[0],plan.position[1],plan.position[2],plan.target[0],plan.target[1],plan.target[2],reducedMotion]);
  useFrame((_state,dt)=>{
    if(mode==="orbit")return;
    const alpha=reducedMotion?1:Math.min(1,dt*8);
    const wanted=target.current.set(...plan.position);
    camera.position.lerp(wanted,alpha);
    camera.lookAt(...plan.target);
    if("fov" in camera && typeof camera.fov==="number") {camera.fov+=(plan.fov-camera.fov)*alpha;camera.updateProjectionMatrix();}
    if(!reducedMotion && (camera.position.distanceTo(wanted)>.003 || ("fov" in camera && typeof camera.fov === "number" && Math.abs(camera.fov-plan.fov)>.03)))invalidate();
  });
  return mode==="orbit"?<OrbitControls makeDefault enabled={!editMode} enablePan={false} minDistance={2.5} maxDistance={10} target={[0,.25,0]}/>:null;
}

export function RealLyricsStagePreviewV380({lyrics,progressMs,lyricsTimeMs,playing,activeIndex,preferences,shot,section,cast,leadIndex,cameraMode,genre="",editMode=false,autoPlaceRequest=0,onLayoutChange,onSafetyChange}:{
  lyrics:Lyrics|null;progressMs:number;lyricsTimeMs:number;playing:boolean;activeIndex:number;preferences:UiPreferences;
  shot:StudioShotV380;section:"verse"|"hook"|"drop";cast:StudioCastV380;leadIndex:number;cameraMode:StudioCameraModeV380;
  genre?:string;editMode?:boolean;autoPlaceRequest?:number;onLayoutChange?:(layout:LyricsSpatialLayoutV381)=>void;onSafetyChange?:(safety:SpatialSafetyV381)=>void;
}) {
  const primary=useAvatarModel(preferences.avatarModelId??"procedural");
  const secondary=useAvatarModel(preferences.secondaryAvatarModelId??"procedural");
  const urls=[primary,secondary];
  const side=preferences.lyricsImmersiveSide??"right";
  const scene:VisualizerProps["lyricsScene"]|undefined=lyrics?.lines.length?{
    lyrics,progressMs:lyricsTimeMs,activeIndex,playing,side,depth:preferences.lyricsImmersiveDepth??45,
    colorFrom:preferences.lyricsGradientFrom??"#79f7ff",colorTo:preferences.lyricsGradientTo??"#d789ff",
    intensity:preferences.lyricsAnimationIntensity??65,fontScale:preferences.lyricsFontSize??100,glow:preferences.lyricsGlow??65,
    wordHighlight:preferences.lyricsWordHighlight??true,cinematicModeV378:preferences.avatarLyricsCameraModeV378??"off",
    cinematicStrengthV378:preferences.avatarLyricsCameraStrengthV378??70,cinematicContrastV378:preferences.avatarLyricsContrastV378??true,
    spatialLayoutV381:preferences.lyricsSpatialLayoutV381,
    kineticPresetV382:preferences.lyricsKineticPresetV382??"auto",kineticStrengthV382:preferences.lyricsKineticStrengthV382??65,
    kineticDropsV382:preferences.lyricsKineticDropsV382??true,genreV382:genre
  }:undefined;
  const positions=STUDIO_CAST_POSITIONS_V380[cast];
  const theme=preferences.stageTheme??"classic";
  const previewHostV388=useRef<HTMLDivElement>(null);
  const [previewVisibleV388,setPreviewVisibleV388]=useState(true);
  const displayProfileV388=useDisplayProfileV388();
  useEffect(()=>{
    const host=previewHostV388.current;
    if(!host||typeof IntersectionObserver==="undefined")return;
    const observer=new IntersectionObserver(entries=>setPreviewVisibleV388(entries[0]?.isIntersecting??true),{threshold:.01});
    observer.observe(host);return()=>observer.disconnect();
  },[]);
  const previewBudgetV388=resolveDisplayBudgetV388(displayProfileV388.profile,displayProfileV388.kioskEnabled,
    {width:typeof window==="undefined"?1024:window.innerWidth,height:typeof window==="undefined"?600:window.innerHeight,
     pixelRatio:typeof window==="undefined"?1:window.devicePixelRatio||1,avatarCount:Number(cast)||1});
  return <div ref={previewHostV388} className="v380-canvas-shell" aria-label="Echte 3D-Bühnenvorschau mit installierten Avataren und 3D-Lyrics">
    <Canvas dpr={[.5,previewBudgetV388.enabled?previewBudgetV388.previewDprCap:1.3]} frameloop={playing&&previewVisibleV388&&!preferences.reducedMotion?"always":"demand"}
      gl={{antialias:true,alpha:false,powerPreference:"low-power"}} camera={{position:[0,1.3,5.9],fov:43,near:.1,far:70}}
      onCreated={({gl})=>gl.setClearColor("#0c1429")}>
      <ambientLight intensity={.65}/>
      <DynamicStage theme={theme} audio={EMPTY_AUDIO_V380} isPlaying={false} reducedMotion={true} reactive={false} strength={preferences.stageLightStrength??60}/>
      {positions.map((x,index)=>{
        const model=urls[index%2];
        return <group key={`${index}-${model.id}`} position={[x,-.10,0]} scale={preferences.avatarScale??1}>
          <AvatarLoadBoundaryV380 modelKey={model.url??"procedural"} fallback={<ProceduralAvatarV380 positionMs={progressMs} reducedMotion={preferences.reducedMotion}/>}>
            <Suspense fallback={<ProceduralAvatarV380 positionMs={progressMs} reducedMotion={preferences.reducedMotion}/>}>
              {model.url?<InstalledAvatarV380 key={model.url} url={model.url} animationUrl={model.animationUrl} positionMs={progressMs} speed={preferences.avatarClipSpeed??1}/>:<ProceduralAvatarV380 positionMs={progressMs} reducedMotion={preferences.reducedMotion}/>}
            </Suspense>
          </AvatarLoadBoundaryV380>
        </group>;
      })}
      {scene&&<Lyrics3DScene scene={scene} audio={EMPTY_AUDIO_V380} reducedMotion={true}/>}
      {editMode&&scene&&onLayoutChange&&onSafetyChange&&<SpatialLyricsHandlesV381
        layout={normalizeSpatialLayoutV381(preferences.lyricsSpatialLayoutV381)} side={side} depth={preferences.lyricsImmersiveDepth??45}
        cast={cast} avatarScale={preferences.avatarScale??1} editable={editMode} autoPlaceRequest={autoPlaceRequest}
        onLayoutChange={onLayoutChange} onSafetyChange={onSafetyChange}/>}
      <DirectedCameraV380 shot={shot} section={section} cast={cast} leadIndex={leadIndex} side={side} immersive={true}
        strength={preferences.avatarLyricsCameraStrengthV378??70} mode={cameraMode} reducedMotion={preferences.reducedMotion} editMode={editMode}/>
    </Canvas>
    <span className="v380-webgl-label">WebGL · echte GLB-Modelle · 3D-Lyrics · eigenständige Vorschau</span>
  </div>;
}
