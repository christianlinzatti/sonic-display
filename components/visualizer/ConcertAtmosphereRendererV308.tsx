"use client";
import {combineFestivalGainsV394,type FestivalShowCueV394} from "./festivalShowDirectorV394";
import {planConcertLightingV462} from "./concertLightingDirectorV462";
import {refineConcertLightingV542} from "./intelligentConcertLightingV542";
import {planStageAtmosphereV551} from "./intelligentStageAtmosphereV551";
import {planDynamicConcertLightingV608} from "./dynamicConcertLightingV608";
import {planUltimateConcertDramaturgyV623,composeConcertLightingV623} from "./ultimateConcertDramaturgyV623";
import {planAdvancedStageLightingV621} from "./advancedStageLightingV621";
import {planDynamicStageTransformationV622} from "./dynamicStageTransformationV622";
import {planDynamicConcertStagesV635} from "./dynamicConcertStagesV635";
import {planProfessionalLightingV636} from "./professionalLightingShowV636";
import {planGenreConcertV610} from "./genreConcertExperienceV610";
import {planContinuousConcertV611} from "./continuousConcertExperienceV611";
import {planSeamlessConcertTransitionV609} from "./seamlessConcertTransitionsV609";
import type {NarrativePlanV604,NarrativeCueV604} from "./fullSongConcertDramaturgyV604";
import type {ConcertSceneV528} from "./cinematicConcertCoordinationV528";
import type {ConcertShowCueV387} from "./concertShowDirectorV387";
import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, Color, DoubleSide, Fog, Vector3 } from "three";
import type { Group, ShaderMaterial, SpotLight, MeshBasicMaterial, Mesh } from "three";
import type { AudioFeatures } from "@/types/audio";
import type { ShowCue } from "./ultimateShowDirectorV306";
import type { StageSection } from "./stageDirectorV287";
import type { StageEnvironmentId } from "./stages";
import { getActivePerformanceTier } from "./adaptivePerformance";
import {getVisualFactorsV640} from "./adaptiveVisualBudgetV640";
import {readPiConcertBudgetV479} from "./piConcertRuntimeV479";
import {shouldDrawTransparentV552,needsSpotTargetMatrixV552} from "./piConcertDrawBudgetV552";
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

export function ConcertAtmosphereRendererV308({ audio, isPlaying, reactive, reducedMotion, theme, musicPalette, showCue, timelineGainRef, sectionRef, genreV462, concertShowCueV387, authoredLightingV387=false,festivalShowCueV394,festivalShowLasersV394=false,lyricsProtectedV542=false,groupCountV542=1,vocalFocusV542=false,concertSceneV551,cameraNarrativeV605,cameraSectionV608 }: {
  audio: AudioFeatures; isPlaying: boolean; reactive: boolean; reducedMotion: boolean;
  theme: StageEnvironmentId; genreV462?: string | null; musicPalette?: {primary:string;secondary:string;glow:string}; showCue?: ShowCue;
  timelineGainRef: {current: number}; sectionRef: {current: StageSection};
  concertShowCueV387?:ConcertShowCueV387;authoredLightingV387?:boolean;festivalShowCueV394?:FestivalShowCueV394;festivalShowLasersV394?:boolean;lyricsProtectedV542?:boolean;groupCountV542?:number;vocalFocusV542?:boolean;concertSceneV551?:ConcertSceneV528;cameraNarrativeV605?:{plan:NarrativePlanV604;cue:NarrativeCueV604;manualCamera:boolean};cameraSectionV608?:StageSection;
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
  const leftBeamMeshV552=useRef<Mesh>(null);
  const rightBeamMeshV552=useRef<Mesh>(null);
  const floorHazeMeshV552=useRef<Mesh>(null);
  const backHazeMeshV552=useRef<Mesh>(null);
  const lastSpotTargetLeftV552=useRef(Number.NaN);
  const lastSpotTargetRightV552=useRef(Number.NaN);
  const rightBeam=useRef<ShaderMaterial>(null);
  const floorHaze=useRef<ShaderMaterial>(null);
  const backHaze=useRef<ShaderMaterial>(null);
  const leftSpot=useRef<SpotLight>(null);
  const rightSpot=useRef<SpotLight>(null);
  const leftDirection=useRef(new Vector3());
  const rightDirection=useRef(new Vector3());
  const singerWorldV551=useRef(new Vector3());
  const ownedFogV551=useRef<Fog|null>(null);
  const desiredPrimary=useRef(new Color());
  const desiredSecondary=useRef(new Color());
  const warmTintV622=useRef(new Color('#ffc487'));
  const coolTintV622=useRef(new Color('#77caff'));
  const ambientTargetV622=useRef(new Color());
  const fogTargetV622=useRef(new Color());
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
    ownedFogV551.current=fog;
    return ()=>{if(ownedFogV551.current===fog)ownedFogV551.current=null;if(scene.fog===fog)scene.fog=previous;};
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
    const lightingV542=refineConcertLightingV542({base:lightingV462,section:sectionRef.current,
      energy:audio.energyEnvelope??audio.bass??0,kick:audio.kickAccentIntensity??0,
      playing:isPlaying,reactive,reducedMotion,tier:nowTier,
      authored:authoredLightingV387||!showLightingAllowed,
      blackout:timelineGainRef.current<.001,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,groupCount:groupCountV542});
    const lightingV551=planStageAtmosphereV551({base:lightingV542,mood:lightingV462.mood,
      section:sectionRef.current,energy:audio.energyEnvelope??audio.bass??0,
      kick:audio.kickAccentIntensity??0,tier:nowTier,playing:isPlaying,reactive,reducedMotion,
      authored:authoredLightingV387||!showLightingAllowed,
      blackout:timelineGainRef.current<.001,
      lyricsProtected:lyricsProtectedV542,groupCount:groupCountV542,scene:concertSceneV551});
    // V608 reads the SAME Spotify playback and confirmed V604 act as DynamicStage.
    const lightingV608=planDynamicConcertLightingV608({
      narrative:cameraNarrativeV605,trackId:playback.trackId,
      positionMs:playback.positionMs,durationMs:playback.durationMs,
      section:cameraSectionV608??sectionRef.current,mood:lightingV462.mood,
      energy:audio.energyEnvelope??audio.bass??0,kick:audio.kickAccentIntensity??0,
      cast:lightingV551,playing:isPlaying&&playback.playing,reactive,reducedMotion,tier:nowTier,
      authored:authoredLightingV387||!showLightingAllowed,
      blackout:timelineGainRef.current<.001,lyricsProtected:lyricsProtectedV542,
    });
    const lightingV621=composeConcertLightingV623(planAdvancedStageLightingV621({narrative:cameraNarrativeV605,
      trackId:playback.trackId,durationMs:playback.durationMs,positionMs:playback.positionMs,
      section:cameraSectionV608??sectionRef.current,genre:genreV462,
      energy:audio.energyEnvelope??audio.bass??0,kick:audio.kickAccentIntensity??0,
      playing:isPlaying&&playback.playing,reactive,reducedMotion,tier:nowTier,
      authored:authoredLightingV387||!showLightingAllowed||!reactive,
      blackout:timelineGainRef.current<.001,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,groupCount:groupCountV542,
     }),planUltimateConcertDramaturgyV623({
      narrative:cameraNarrativeV605,trackId:playback.trackId,durationMs:playback.durationMs,positionMs:playback.positionMs,
      section:cameraSectionV608??sectionRef.current,playing:isPlaying&&playback.playing,reducedMotion,tier:nowTier,
      energy:audio.energyEnvelope??audio.bass??0,kick:audio.kickAccentIntensity??0,lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,
      manualLighting:authoredLightingV387||!showLightingAllowed,
    }));
    // V622 uses the identical confirmed act/clock as the key rig. The fog
    // color belongs exclusively to the V308-created scene Fog object.
    const transformationV622=planDynamicStageTransformationV622({
      narrative:cameraNarrativeV605,trackId:playback.trackId,positionMs:playback.positionMs,
      durationMs:playback.durationMs,section:cameraSectionV608??sectionRef.current,genre:genreV462,
      playing:isPlaying&&playback.playing,reactive,reducedMotion,tier:nowTier,
      authored:authoredLightingV387||!showLightingAllowed||!reactive,
      blackout:timelineGainRef.current<.001,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,
    });
    // V635 respects V308-owned fog and the same verified song arc as V622.
    const stageVisualV635=planDynamicConcertStagesV635({
      narrative:cameraNarrativeV605,trackId:playback.trackId,positionMs:playback.positionMs,
      durationMs:playback.durationMs,section:cameraSectionV608??sectionRef.current,
      genre:genreV462,playing:isPlaying&&playback.playing,reactive,reducedMotion,tier:nowTier,
      authored:authoredLightingV387||!showLightingAllowed||!reactive,
      blackout:timelineGainRef.current<.001,lyricsProtected:lyricsProtectedV542,
      vocalFocus:vocalFocusV542,groupCount:Math.max(1,Math.min(4,Math.round(groupCountV542)||1)),
      visualsEnabled:settings.enabled,energy:Math.max(0,Math.min(1,audio.energyEnvelope??audio.bass??0)),
      kick:Math.max(0,Math.min(1,audio.kickAccentIntensity??0)),foundation:transformationV622,
    });
    // V636: editorial modulation of EXISTING V308 shafts and two moving heads.
    // All gains remain downstream of user settings, budget tiers and blackout.
    const professionalLightV636=planProfessionalLightingV636({
      narrative:cameraNarrativeV605,trackId:playback.trackId,
      positionMs:playback.positionMs,durationMs:playback.durationMs,
      section:cameraSectionV608??sectionRef.current,genre:genreV462,
      energy:audio.energyEnvelope??audio.bass??0,kick:audio.kickAccentIntensity??0,
      playing:isPlaying&&playback.playing,reactive,reducedMotion,tier:nowTier,
      authored:authoredLightingV387||!showLightingAllowed||!reactive,
      blackout:timelineGainRef.current<.001,enabled:settings.enabled,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,
      groupCount:Math.max(1,Math.min(4,Math.round(groupCountV542)||1)),
    });
    ambientTargetV622.current.copy(coolTintV622.current).lerp(warmTintV622.current,(transformationV622.tone+1)/2);
    // V610: only verified section + genre, bounded by the V551/V542 light caps.
    const concertGenreV610=planGenreConcertV610({
      narrative:cameraNarrativeV605,trackId:playback.trackId,
      positionMs:playback.positionMs,durationMs:playback.durationMs,
      section:cameraSectionV608??sectionRef.current,genre:genreV462,
      energy:audio.energyEnvelope??audio.bass??0,kick:audio.kickAccentIntensity??0,
      playing:isPlaying&&playback.playing,reducedMotion,tier:nowTier,
      lyricsProtected:lyricsProtectedV542,manualDance:true,manualCamera:true,
      manualLighting:authoredLightingV387||!showLightingAllowed||!reactive||
        timelineGainRef.current<.001,
    });
    // V611: one evidence-bound song arc for the same automatic lanes, no new clock.
    const concertContinuityV611=planContinuousConcertV611({
    genreCue:concertGenreV610,
      narrative:cameraNarrativeV605,trackId:playback.trackId,
      positionMs:playback.positionMs,durationMs:playback.durationMs,
      section:cameraSectionV608??sectionRef.current,genre:genreV462,
      energy:audio.energyEnvelope??audio.bass??0,kick:audio.kickAccentIntensity??0,
      playing:isPlaying&&playback.playing,reducedMotion,tier:nowTier,
      lyricsProtected:lyricsProtectedV542,manualDance:true,manualCamera:true,
      manualLighting:authoredLightingV387||!showLightingAllowed||!reactive||
        timelineGainRef.current<.001,
    });
    // V609 softens only existing automatic light interpolations at confirmed
    // adjacent section edges. The real authored timeline/blackout is untouched.
    const lightingBlendV609=planSeamlessConcertTransitionV609({
      narrative:cameraNarrativeV605,trackId:playback.trackId,
      positionMs:playback.positionMs,playing:isPlaying&&playback.playing,
      reducedMotion,tier:nowTier,manualCamera:true,
      manualLighting:authoredLightingV387||!showLightingAllowed||!reactive||
        timelineGainRef.current<.001,
    });
    const combinedV394=combineFestivalGainsV394(showV387,reactive&&isPlaying&&!reducedMotion?festivalShowCueV394:undefined,{
      authored:authoredLightingV387,blackout:timelineGainRef.current<.001||!showLightingAllowed});
    const beamGainV387=combinedV394.beamGain;
    const hazeGainV387=combinedV394.hazeGain;
    const sweepGainV387=combinedV394.sweepGain;
    const alpha=1-Math.exp(-Math.min(.1,Math.max(0,delta))*5.5*lightingBlendV609.lightingRate);
    // Change only the Fog instance installed by V308, and ease toward its normal
    // density-dependent distances when V551 becomes inactive (e.g. on pause).
    const fog=ownedFogV551.current;
    if(fog && scene.fog===fog){
      const density=Math.max(0,Math.min(1,settings.hazeDensity/100));
      const fogAlpha=1-Math.exp(-Math.min(.1,Math.max(0,delta))*2.5*lightingBlendV609.lightingRate);
      fog.near+=(10+(1-density)*12+lightingV551.fogNearOffset+lightingV608.fogOffset-fog.near)*fogAlpha;
      fog.far+=(27+(1-density)*27+lightingV551.fogFarOffset+lightingV608.fogOffset*1.2-fog.far)*fogAlpha;
      // Shift *existing* haze toward the same song-section mood; neither
      // fog density nor its visibility is amplified during lyric-heavy sections.
      fogTargetV622.current.set(ambientBase).lerp(ambientTargetV622.current,transformationV622.background*.70);
      fog.color.lerp(fogTargetV622.current,fogAlpha);
      const shift=Math.max(-.4,Math.min(.9,transformationV622.fog-stageVisualV635.fogTrim));
      fog.far+=(Math.max(fog.near+6,27+(1-density)*27+lightingV551.fogFarOffset+lightingV608.fogOffset*1.2+shift)-fog.far)*fogAlpha;
    }
    // V640 only scales nonessential auto decoration; manual spotlights and
    // confirmed singer portrait illumination are never throttled here.
    const decorationV640=authoredLightingV387?{led:1,gobo:1,haze:1,beams:1}:getVisualFactorsV640();
    // Two thin additive fan bars – no extra GPU lights, shadow maps, shaders or strobes.
    const lasersOn=lightingV542.allowLasers && festivalShowLasersV394 && reactive && isPlaying && !reducedMotion && settings.enabled && settings.beams &&
      tier==="high" && nowTier==="high" && sceneFlags.beamSweep && showLightingAllowed &&
      timelineGainRef.current>.001 && !authoredLightingV387 && festivalShowCueV394?.active;
    const laserOpacity=lasersOn?Math.min(.17,(festivalShowCueV394?.laserGain??0)*.20)*decorationV640.beams:0;
    if(laserMaterialV394.current) laserMaterialV394.current.opacity+=(laserOpacity-laserMaterialV394.current.opacity)*Math.min(.25,Math.max(0,delta)*5);
    if(laserMaterialRightV394.current) laserMaterialRightV394.current.opacity+=(laserOpacity-laserMaterialRightV394.current.opacity)*Math.min(.25,Math.max(0,delta)*5);
    if(laserFanV394.current) laserFanV394.current.rotation.y=Math.sin(state.clock.elapsedTime*.44)*Math.min(.17,(festivalShowCueV394?.sweepGain??1)-1);

    desiredPrimary.current.set(musicPalette?.primary ?? (theme === "rock" ? "#ff8f40" : "#58cfff"));
    desiredSecondary.current.set(musicPalette?.secondary ?? (theme === "festival" ? "#f5b24e" : "#e674ff"));
    if(transformationV622.active){
      desiredPrimary.current.lerp(ambientTargetV622.current,transformationV622.accent*.14);
      desiredSecondary.current.lerp(ambientTargetV622.current,transformationV622.accent*.17);
    }
    const move=(material:ShaderMaterial|null,opacity:number,color:Color)=>{
      if(!material)return;
      const o=material.uniforms.uOpacity;
      o.value+=(opacity-o.value)*alpha;
      (material.uniforms.uColor.value as Color).lerp(color,alpha);
    };
    move(leftBeam.current,Math.min(.3,frame.leftOpacity*decorationV640.beams*beamGainV387*lightingV462.beamGain*lightingV542.beamGain*lightingV551.beamGain*lightingV608.beam*lightingV621.beam*concertGenreV610.beam*concertContinuityV611.beam*professionalLightV636.beam),desiredPrimary.current);
    move(rightBeam.current,Math.min(.3,frame.rightOpacity*decorationV640.beams*beamGainV387*lightingV462.beamGain*lightingV542.beamGain*lightingV551.beamGain*lightingV608.beam*lightingV621.beam*concertGenreV610.beam*concertContinuityV611.beam*professionalLightV636.beam),desiredSecondary.current);
    move(floorHaze.current,Math.min(.15,frame.floorHaze*decorationV640.haze*hazeGainV387*lightingV462.hazeGain*lightingV542.hazeGain*lightingV551.hazeGain*lightingV608.haze*lightingV621.haze*concertGenreV610.haze*concertContinuityV611.haze*professionalLightV636.haze),desiredPrimary.current);
    move(backHaze.current,Math.min(.15,frame.backHaze*decorationV640.haze*hazeGainV387*lightingV462.hazeGain*lightingV542.hazeGain*lightingV551.hazeGain*lightingV608.haze*lightingV621.haze*concertGenreV610.haze*concertContinuityV611.haze*professionalLightV636.haze),desiredSecondary.current);
    // V552: transparent objects consume GPU draw calls even at zero alpha.
    // Hide them in the existing frame callback, without unmount/remount,
    // changing materials, or delaying synchronized karaoke/beat updates.
    const piBudgetV552=readPiConcertBudgetV479();
    const authoredVisualsV552=authoredLightingV387;
    const gateV552=(mesh:Mesh|null,material:ShaderMaterial|null)=>{
      if(!mesh||!material)return;
      mesh.visible=shouldDrawTransparentV552(material.uniforms.uOpacity.value,mesh.visible,
        piBudgetV552.enabled,piBudgetV552.level,authoredVisualsV552);
    };
    gateV552(leftBeamMeshV552.current,leftBeam.current);
    gateV552(rightBeamMeshV552.current,rightBeam.current);
    gateV552(floorHazeMeshV552.current,floorHaze.current);
    gateV552(backHazeMeshV552.current,backHaze.current);
    // The V542 safety planner never authorizes lasers: skip their draw calls.
    if(laserFanV394.current)laserFanV394.current.visible=lasersOn;
    // V551: steer existing shafts/spots to measured world positions of confirmed
    // vocalists. Missing/unloaded GLBs simply retain V308's original sweep.
    const spotlightAimV551=(slot:number|null,fallback:number)=>{
      if(slot===null||lightingV551.focusStrength<=0||!sceneFlags.extraLights)return fallback;
      const dancer=state.scene.getObjectByName(`v377-vocal-stage-slot-${slot}`);
      if(!dancer?.visible)return fallback;
      dancer.updateWorldMatrix(true,false);
      dancer.getWorldPosition(singerWorldV551.current);
      if(!Number.isFinite(singerWorldV551.current.x))return fallback;
      const x=Math.max(-2.2,Math.min(2.2,singerWorldV551.current.x));
      return fallback+(x-fallback)*Math.min(.75,lightingV551.focusStrength+lightingV608.focusBoost);
    };
    const leftAimV551=spotlightAimV551(lightingV551.leftSingerSlot,
      Math.max(-3,Math.min(3,(-.65+(frame.targetLeftX+.65)*lightingV462.sweepGain*lightingV542.sweepGain*lightingV551.sweepGain*lightingV608.sweep*lightingV621.sweep*concertGenreV610.sweep*concertContinuityV611.sweep*professionalLightV636.sweep)*sweepGainV387+(lightingV551.leftSingerSlot===null?professionalLightV636.aimOffset:0))));
    const rightAimV551=spotlightAimV551(lightingV551.rightSingerSlot,
      Math.max(-3,Math.min(3,(.65+(frame.targetRightX-.65)*lightingV462.sweepGain*lightingV542.sweepGain*lightingV551.sweepGain*lightingV608.sweep*lightingV621.sweep*concertGenreV610.sweep*concertContinuityV611.sweep*professionalLightV636.sweep)*sweepGainV387-(lightingV551.rightSingerSlot===null?professionalLightV636.aimOffset:0))));
    if(leftGroup.current){
      leftDirection.current.set(leftAimV551-(-2.55),-1.72-3.15,.25-(-1.25)).normalize();
      leftGroup.current.quaternion.setFromUnitVectors(DOWN,leftDirection.current);
    }
    if(rightGroup.current){
      rightDirection.current.set(rightAimV551-2.55,-1.72-3.15,.25-(-1.25)).normalize();
      rightGroup.current.quaternion.setFromUnitVectors(DOWN,rightDirection.current);
    }
    const setSpot=(spot:SpotLight|null,intensity:number,color:Color,targetX:number)=>{
      if(!spot)return;
      spot.intensity+=(intensity-spot.intensity)*alpha;
      spot.color.lerp(color,alpha);
      const previousX=spot===leftSpot.current?lastSpotTargetLeftV552:lastSpotTargetRightV552;
      if(needsSpotTargetMatrixV552(previousX.current,targetX)){
        spot.target.position.set(targetX,-1.72,.25);
        spot.target.updateMatrixWorld();
        previousX.current=targetX;
      }
    };
    setSpot(leftSpot.current,Math.min(3,frame.leftLight*beamGainV387*lightingV462.spotGain*lightingV542.spotGain*lightingV551.spotGain*lightingV608.spot*lightingV621.spot*concertGenreV610.spot*concertContinuityV611.spot*professionalLightV636.spot),desiredPrimary.current,leftAimV551);
    setSpot(rightSpot.current,Math.min(3,frame.rightLight*beamGainV387*lightingV462.spotGain*lightingV542.spotGain*lightingV551.spotGain*lightingV608.spot*lightingV621.spot*concertGenreV610.spot*concertContinuityV611.spot*professionalLightV636.spot),desiredSecondary.current,rightAimV551);
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
      <mesh ref={leftBeamMeshV552} position={[0,-BEAM_HEIGHT/2,0]} frustumCulled={false}>
        <coneGeometry args={[1.12,BEAM_HEIGHT,22,1,true]}/>
        <shaderMaterial ref={leftBeam} vertexShader={BEAM_VERTEX} fragmentShader={BEAM_FRAGMENT} transparent depthWrite={false} side={DoubleSide} blending={AdditiveBlending} uniforms={{uOpacity:{value:0},uColor:{value:new Color("#58cfff")}}}/>
      </mesh>
    </group>}
    {beamVisible && tier==="high" && <group ref={rightGroup} position={[2.55,3.15,-1.25]}>
      <mesh ref={rightBeamMeshV552} position={[0,-BEAM_HEIGHT/2,0]} frustumCulled={false}>
        <coneGeometry args={[1.12,BEAM_HEIGHT,22,1,true]}/>
        <shaderMaterial ref={rightBeam} vertexShader={BEAM_VERTEX} fragmentShader={BEAM_FRAGMENT} transparent depthWrite={false} side={DoubleSide} blending={AdditiveBlending} uniforms={{uOpacity:{value:0},uColor:{value:new Color("#e674ff")}}}/>
      </mesh>
    </group>}
    {spotVisible && <spotLight ref={leftSpot} position={[-2.55,3.15,-1.25]} angle={.30} penumbra={.97} decay={2} distance={9} castShadow={false} intensity={0}/>}
    {spotVisible && tier==="high" && <spotLight ref={rightSpot} position={[2.55,3.15,-1.25]} angle={.30} penumbra={.97} decay={2} distance={9} castShadow={false} intensity={0}/>}
    {hazeVisible && <mesh ref={floorHazeMeshV552} position={[0,-1.914,0]} rotation={[-Math.PI/2,0,0]} renderOrder={2}>
      <planeGeometry args={[9.2,7.2]}/>
      <shaderMaterial ref={floorHaze} vertexShader={HAZE_VERTEX} fragmentShader={HAZE_FRAGMENT} transparent depthWrite={false} side={DoubleSide} blending={AdditiveBlending} uniforms={{uOpacity:{value:0},uColor:{value:new Color("#58cfff")}}}/>
    </mesh>}
    {hazeVisible && tier==="high" && <mesh ref={backHazeMeshV552} position={[0,-1.88,-1.65]} rotation={[-Math.PI/2,0,0]} renderOrder={2}>
      <planeGeometry args={[7.5,5.1]}/>
      <shaderMaterial ref={backHaze} vertexShader={HAZE_VERTEX} fragmentShader={HAZE_FRAGMENT} transparent depthWrite={false} side={DoubleSide} blending={AdditiveBlending} uniforms={{uOpacity:{value:0},uColor:{value:new Color("#e674ff")}}}/>
    </mesh>}
  </group>;
}
