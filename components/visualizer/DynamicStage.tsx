"use client";
import type {SmartStageCueV351} from "@/services/stageContent/smartStageCompositionV351";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Color, Vector3 } from "three";
import type {VisualizerProps} from "./registry";
import {resolveDuetInteractionV376} from "./interactiveVocalDuetsV376";
import {resolveManualVocalCueV385,applyManualVocalCueV385} from "./manualVocalCastingV385";
import type {ConcertShowCueV387} from "./concertShowDirectorV387";
import {resolveConcertCueV386,concertLightAccentV386} from "./expressiveConcertDirectorV386";
import { getLightingPlayback } from "./lightingPlayback";
import { advanceStageDirector, createStageDirectorState } from "./smartStageDirectorV236";
import { sceneDetailFlags, useSceneDetail } from "./scenePerformanceControls";
import { evaluateLightTimeline, loadLightCues, LIGHT_TIMELINE_CHANGED, type LightCue } from "./lightingTimeline";
import type { Mesh, MeshBasicMaterial, PointLight, SpotLight } from "three";
import type { AudioFeatures } from "@/types/audio";
import { getActivePerformanceTier } from "./adaptivePerformance";
import { advanceStageCue, createStageCueState } from "./reactiveStageLighting";
import { advanceLightingDirector, createLightingDirectorState } from "./intelligentLightingDirector";
import { loadPresetLibrary, PRESET_LIBRARY_CHANGED } from "./lightingPresetLibrary";
import { GENRE_PROFILE_CHANGED, loadGenreProfiles, selectGenrePreset } from "./lightingGenreProfiles";
import { advancePredictiveLighting, createPredictiveLightingState, defaultLightingPreset, loadLightingPreset, LIGHTING_CHANGED, type LightingPreset } from "./predictiveLighting";

import type { ShowCue } from "./ultimateShowDirectorV306";
import {planConcertLightingV462} from "./concertLightingDirectorV462";
import type { StageSection } from "./stageDirectorV287";
import {combineFestivalGainsV394,type FestivalShowCueV394} from "./festivalShowDirectorV394";
import { ConcertAtmosphereRendererV308 } from "./ConcertAtmosphereRendererV308";
import type { StageEnvironmentId } from "./stages";
export type StageTheme = StageEnvironmentId;
const palettes = {
  classic: { base: "#202037", primary: "#8d78ff", secondary: "#66e7e8", floor: "#25283f" },
  neon: { base: "#080e22", primary: "#00efff", secondary: "#ff42ce", floor: "#11152a" },
  festival: { base: "#161126", primary: "#ffb938", secondary: "#b453ff", floor: "#231b31" },
  minimal: { base: "#161a20", primary: "#ffffff", secondary: "#9bb3c9", floor: "#262b32" },
  cyberpunk: {base:"#070b1c",primary:"#00f0ff",secondary:"#f32cc5",floor:"#11172a"},
  vaporwave: {base:"#1b0f36",primary:"#fe84b7",secondary:"#67f0cc",floor:"#21133e"},
  galaxy: {base:"#030513",primary:"#869fff",secondary:"#c766ff",floor:"#111027"},
  white: {base:"#e9edf4",primary:"#fff9e6",secondary:"#a2b5d0",floor:"#dfe4ea"},
  rock: {base:"#141314",primary:"#ff9d3e",secondary:"#e53c37",floor:"#2a292c"},
} as const;

/** Lights are reused across frames; low tier disables animated beam sweeping and floor pulse geometry. */
export function DynamicStage({ theme = "classic", audio, isPlaying, reducedMotion, reactive = true, strength = 60, genre, musicPalette, showCue, composition, glowGainV353=1, timelineGainV354=1, concertLipSyncV386, concertShowCueV387, concertShowLightingV387=true,concertShowAtmosphereV387=true,festivalShowCueV394,festivalShowLightingV394=true,festivalShowAtmosphereV394=true,festivalShowLasersV394=false }: {
  theme?: StageTheme; audio: AudioFeatures; isPlaying: boolean; reducedMotion: boolean; reactive?: boolean; strength?: number; genre?: string | null; musicPalette?: { primary: string; secondary: string; glow: string }; showCue?: ShowCue; composition?:SmartStageCueV351;glowGainV353?:number; timelineGainV354?:number;concertLipSyncV386?:VisualizerProps["lipSync"];concertShowCueV387?:ConcertShowCueV387;concertShowLightingV387?:boolean;concertShowAtmosphereV387?:boolean;festivalShowCueV394?:FestivalShowCueV394;festivalShowLightingV394?:boolean;festivalShowAtmosphereV394?:boolean;festivalShowLasersV394?:boolean;
}) {
  const palette = palettes[theme];
  const sceneFlags = sceneDetailFlags(useSceneDetail());
  const key = useRef<PointLight>(null);
  const targetPrimary = useRef(new Color());
  const targetSecondary = useRef(new Color());
  const fill = useRef<PointLight>(null);
  const beam = useRef<SpotLight>(null);
  const floorLight = useRef<PointLight>(null);
  const pulseMesh = useRef<Mesh>(null);
  const concertFocusPositionV386=useRef(new Vector3());
  const cueState = useRef(createStageCueState());
  const smartStage = useRef(createStageDirectorState());
  const directorState = useRef(createLightingDirectorState());
  const predictiveState = useRef(createPredictiveLightingState());
  const lightingPreset = useRef<LightingPreset>(defaultLightingPreset);
  const activePreset = useRef<LightingPreset>({...defaultLightingPreset});
  const genreRef = useRef(genre);
  genreRef.current = genre;
  const timeline = useRef<{id:string;cues:LightCue[]}>({id:"",cues:[]});
  const atmosphereTimelineGain = useRef(1);
  const atmosphereSection = useRef<StageSection>("verse");
  useEffect(() => {
    const reload = () => { lightingPreset.current = selectGenrePreset(genreRef.current,loadGenreProfiles(),loadPresetLibrary()) ?? loadLightingPreset(); };
    const reloadCues = () => { const p=getLightingPlayback(); timeline.current={id:p.trackId,cues:loadLightCues(p.trackId,p.durationMs)}; };
    reload(); reloadCues(); window.addEventListener(LIGHTING_CHANGED, reload); window.addEventListener(GENRE_PROFILE_CHANGED,reload); window.addEventListener(PRESET_LIBRARY_CHANGED,reload); window.addEventListener(LIGHT_TIMELINE_CHANGED,reloadCues);
    return () => { window.removeEventListener(LIGHTING_CHANGED, reload); window.removeEventListener(GENRE_PROFILE_CHANGED,reload); window.removeEventListener(PRESET_LIBRARY_CHANGED,reload); window.removeEventListener(LIGHT_TIMELINE_CHANGED,reloadCues); };
  }, []);
  useEffect(()=>{lightingPreset.current=selectGenrePreset(genre,loadGenreProfiles(),loadPresetLibrary())??loadLightingPreset();},[genre]);
  useFrame((state, delta) => {
    const presetMix = reducedMotion ? 1 : 1-Math.exp(-Math.min(Math.max(delta,0),.1)*2.0);
    activePreset.current.anticipation += (lightingPreset.current.anticipation-activePreset.current.anticipation)*presetMix;
    activePreset.current.kickRollStrength += (lightingPreset.current.kickRollStrength-activePreset.current.kickRollStrength)*presetMix;
    activePreset.current.blackoutStrength += (lightingPreset.current.blackoutStrength-activePreset.current.blackoutStrength)*presetMix;
    const tier = getActivePerformanceTier();
    const smartCue=advanceStageDirector(smartStage.current,audio,delta,genre,isPlaying && reactive,reducedMotion);
    const cue = advanceStageCue(cueState.current, audio, delta, genre, isPlaying && reactive, reducedMotion, strength, tier);
    const director = advanceLightingDirector(directorState.current, audio, delta, Boolean(musicPalette && reactive && isPlaying), reducedMotion);
    atmosphereSection.current=director.section === "intro" ? "verse" : director.section;
    const predictive = advancePredictiveLighting(predictiveState.current, audio, director.section, delta, Boolean(musicPalette && reactive && isPlaying), activePreset.current, reducedMotion);
    const playback=getLightingPlayback();
    if (playback.trackId !== timeline.current.id) timeline.current={id:playback.trackId,cues:loadLightCues(playback.trackId,playback.durationMs)};
    const timelineCue = playback.playing && isPlaying && reactive ? evaluateLightTimeline(timeline.current.cues,playback.positionMs,reducedMotion) : {scale:1,blackout:0,strobe:0,color:undefined};
    const directorScale = musicPalette && reactive && isPlaying ? director.intensity * (1 + predictive.anticipation * .12 + predictive.kickRoll * .12) * (1 - predictive.blackout * .82) : 1;
    const cueScale = Math.max(.08, timelineCue.scale * (1 - timelineCue.blackout) * (1 - timelineCue.strobe));
    // V308 shares the same authored-lighting gain: saved timeline blackouts take priority.
    atmosphereTimelineGain.current = Math.max(0,Math.min(1,timelineCue.scale * (1 - timelineCue.blackout) * (1 - timelineCue.strobe)));
    const stageLimit = tier === "low" ? 1.06 : tier === "balanced" ? 1.22 : 1.48;
    const directed = (value: number) => Math.min(stageLimit * Math.max(.1, value), value * directorScale * cueScale);
    const lerp = 1 - Math.exp(-Math.min(Math.max(delta, 0), .1) * 9);
    // Music colors affect existing lights only: no new draw calls, shadow maps or post-processing.
    targetPrimary.current.set(timelineCue.color ?? musicPalette?.primary ?? palette.primary);
    targetSecondary.current.set(musicPalette?.secondary ?? palette.secondary);
    const colorFade = reducedMotion ? 1 : 1 - Math.exp(-Math.min(Math.max(delta, 0), .1) * 2.4);
    if (key.current) key.current.color.lerp(targetPrimary.current, colorFade);
    if (fill.current) fill.current.color.lerp(targetSecondary.current, colorFade);
    if (floorLight.current) floorLight.current.color.lerp(targetPrimary.current, colorFade);
    if (beam.current) beam.current.color.lerp(targetSecondary.current, colorFade);
    const lightScale = tier === "low" ? .65 : tier === "balanced" ? .85 : 1;
    // V306: gentle shared show cues layer over saved lighting timelines; capped for Pi/low-tier.
    const voice=concertLipSyncV386;
    const count=voice?.cameraCastCountV377??1;
    const enabledV386=voice?.concertModeV386!==undefined&&voice.concertModeV386!=="off"&&
      voice.concertLightingV386!==false&&isPlaying&&reactive&&!reducedMotion;
    const manualV385=enabledV386?resolveManualVocalCueV385({lyrics:voice?.lyrics,progressMs:voice?.progressMs??0,
      playing:isPlaying&&!!voice?.playing,count,enabled:voice?.manualVocalEnabledV385===true&&
      !!voice.manualVocalTrackIdV385,assignments:voice?.manualVocalAssignmentsV385,
      manualPriority:!!voice?.cameraManualStagePriorityV377}):null;
    const duetV376=enabledV386?resolveDuetInteractionV376({lyrics:voice?.lyrics,progressMs:voice?.progressMs??0,
      playing:isPlaying&&!!voice?.playing,reducedMotion,count,mode:voice?.duetModeV376,
      strength:voice?.duetStrengthV376,manualPriority:!!voice?.cameraManualStagePriorityV377}):null;
    const concertV386=enabledV386?resolveConcertCueV386({mode:voice?.concertModeV386,
      strength:voice?.concertStrengthV386,playing:isPlaying&&!!voice?.playing&&reactive,
      reducedMotion,count,manual:manualV385,duet:duetV376&&manualV385?applyManualVocalCueV385(duetV376,manualV385,reducedMotion):duetV376,
      section:atmosphereSection.current,beat:audio.beatStrength,manualPriority:!!voice?.cameraManualStagePriorityV377}):null;
    const authoredLightsV386=timeline.current.cues.length>0||showCue?.lightingEnabled===true||timelineGainV354!==1||!reactive;
    const lightAccentV386=concertLightAccentV386(concertV386,authoredLightsV386);
    const showV387=concertShowLightingV387&&!authoredLightsV386&&timelineCue.blackout===0&&
      !(showCue?.enabled&&showCue.lightingEnabled===false)?concertShowCueV387:null;
    const festivalGainsV394=combineFestivalGainsV394(showV387?.active?showV387:undefined,
      festivalShowLightingV394&&reactive&&isPlaying&&!reducedMotion?festivalShowCueV394:undefined,{authored:authoredLightsV386,blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineGainV354===0});
    const festivalLightV387=festivalGainsV394.lightGain;
    const festivalBeamV387=festivalGainsV394.beamGain;
    // V462 adds genre/section balance to the EXISTING light rig. Authored timelines
    // and intentional show blackouts must never be brightened automatically.
    const lightingV462=planConcertLightingV462({genre,section:atmosphereSection.current,
      energy:audio.energyEnvelope??audio.bass??0,kick:audio.kickAccentIntensity??0,
      playing:isPlaying,reactive,reducedMotion,tier,authored:authoredLightsV386 ||
        (showCue?.enabled===true&&showCue.lightingEnabled===false),
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineGainV354<=0});
    const showGain = festivalLightV387 * lightAccentV386.gain * (reactive && isPlaying && !reducedMotion ? (showCue?.lightGain ?? 1) : 1) * (composition?.lightGain ?? 1) * (reducedMotion||timelineCue.blackout>0?1:timelineGainV354);
    const showBeam = festivalBeamV387 * lightAccentV386.beamGain * (reactive && isPlaying && !reducedMotion ? (showCue?.beamGain ?? 1) : 1) * (composition?.beamGain ?? 1) * (reducedMotion||timelineCue.blackout>0?1:timelineGainV354);
    // Face floor is limited to un-authored active scenes and never defeats a manual blackout.
    const keyTargetV462=Math.min(3,Math.max(lightingV462.faceFloor,directed(cue.key)*lightScale*showGain*lightingV462.keyGain));
    const fillTargetV462=Math.min(2.4,Math.max(lightingV462.faceFloor*.75,directed(cue.fill)*lightScale*showGain*lightingV462.fillGain));
    if (key.current) key.current.intensity += (keyTargetV462-key.current.intensity)*lerp;
    if (fill.current) fill.current.intensity += (fillTargetV462-fill.current.intensity)*lerp;
    if (floorLight.current) floorLight.current.intensity += ((sceneFlags.extraLights ? Math.min(2.5,directed(cue.floor) * lightScale * showGain) : 0) - floorLight.current.intensity) * lerp;
    if (beam.current) {
      beam.current.intensity += ((sceneFlags.extraLights ? (theme === "minimal" ? .2 : Math.min(3.0,directed(cue.beam) * (1 + smartCue.sweep * .12) * showBeam * lightingV462.beamGain)) * lightScale : 0) - beam.current.intensity) * lerp;
      beam.current.position.x = sceneFlags.beamSweep && cue.sweep && !reducedMotion && tier === "high"
        ? Math.sin(state.clock.elapsedTime * .65) * (1.2 + cue.sweep + director.sweep + predictive.anticipation * .15 + smartCue.sweep * .24) * lightingV462.sweepGain : 0;
      if(lightAccentV386.focusSlot!==null&&sceneFlags.extraLights){
        const dancer=state.scene.getObjectByName(`v377-vocal-stage-slot-${lightAccentV386.focusSlot}`);
        if(dancer?.visible){dancer.updateWorldMatrix(true,false);dancer.getWorldPosition(concertFocusPositionV386.current);
          // Use actual dancer positions; cap the steering to a quiet, non-strobing gesture.
          const goal=Math.max(-2.1,Math.min(2.1,concertFocusPositionV386.current.x));
          beam.current.position.x+=(goal-beam.current.position.x)*Math.min(.28,lightAccentV386.beamGain-1);
        }
      }
    }
    if (pulseMesh.current) {
      const visible = sceneFlags.pulse && tier !== "low" && theme !== "minimal" && reactive && isPlaying && !reducedMotion && cue.glow > .015;
      pulseMesh.current.visible = visible;
      if (visible) {
        pulseMesh.current.scale.setScalar(1 + Math.max(cue.pulse, director.pulse, predictive.kickRoll) * .7);
        (pulseMesh.current.material as MeshBasicMaterial).opacity = Math.min(.34, cue.glow * .3 * glowGainV353);
      }
    }
  });
  return <group>
    <color attach="background" args={[palette.base]}/>
    <ambientLight intensity={theme === "minimal" ? 1.2 : 0.9}/>
    <ConcertAtmosphereRendererV308 genreV462={genre} audio={audio} isPlaying={isPlaying} reducedMotion={reducedMotion} reactive={reactive} theme={theme} musicPalette={musicPalette} showCue={showCue} timelineGainRef={atmosphereTimelineGain} sectionRef={atmosphereSection} concertShowCueV387={concertShowAtmosphereV387?concertShowCueV387:undefined} festivalShowCueV394={festivalShowAtmosphereV394?festivalShowCueV394:undefined} festivalShowLasersV394={festivalShowLasersV394}
      authoredLightingV387={timeline.current.cues.length>0||timelineGainV354!==1||showCue?.lightingEnabled===false}/>
    <pointLight ref={key} color={palette.primary} position={[-2.3, 2.4, 2.2]} intensity={1.1} distance={11}/>
    <pointLight ref={fill} color={palette.secondary} position={[2.4, 1.5, 1.8]} intensity={0.65} distance={10}/>
    <pointLight ref={floorLight} color={palette.primary} position={[0, -1.6, 0.4]} intensity={0.45} distance={7}/>
    <spotLight ref={beam} color={palette.secondary} position={[0, 3.0, 1.4]} angle={0.5} penumbra={0.9} intensity={0.7} distance={9}/>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.95, 0]}>
      <circleGeometry args={[3.2, 48]}/><meshStandardMaterial color={palette.floor} roughness={0.7} metalness={0.18}/>
    </mesh>
    {theme !== "minimal" && <group position={[0, -1.94, 0]} rotation={[-Math.PI/2, 0, 0]}>
      {sceneFlags.rings && [1.15, 2.05, 2.85].map(radius => <mesh key={radius}>
        <ringGeometry args={[radius, radius + 0.014, 56]}/><meshBasicMaterial color={palette.primary} transparent opacity={theme === "festival" ? 0.36 : 0.22} depthWrite={false}/>
      </mesh>)}
      <mesh ref={pulseMesh} visible={false} position={[0, 0, .012]}>
        <ringGeometry args={[2.55, 2.63, 64]}/><meshBasicMaterial color={palette.secondary} transparent opacity={0} depthWrite={false}/>
      </mesh>
    </group>}
    {theme === "festival" && [-2.55, 2.55].map(x => <mesh key={x} position={[x,-0.15,-1.25]}>
      <boxGeometry args={[0.16,3.0,0.18]}/><meshStandardMaterial color={palette.secondary} emissive={palette.secondary} emissiveIntensity={0.25}/>
    </mesh>)}
  </group>;
}
