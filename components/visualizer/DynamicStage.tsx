"use client";
import type {SmartStageCueV351} from "@/services/stageContent/smartStageCompositionV351";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Color, Vector3 } from "three";
import type {Scene,Object3D} from "three";
import type {VisualizerProps} from "./registry";
import {concertLightMultiplierV497} from "./cinematicConcertChoreographyV497";
import type {VocalConcertHandoffV498} from "./vocalHandoffDirectorV498";
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
import {planPerformerLightingV557} from "./performerLightingV557";
import {planAvatarPortraitLightingV558} from "./avatarPortraitLightingV558";
import {planBeatVocalPortraitLightingV559} from "./beatVocalPortraitLightingV559";
import {planCinematicAvatarLightingV566} from "./cinematicAvatarLightingV566";
import type {ConcertDetailSettingsV555,ConcertDetailsCueV555} from "./concertDetailEffectsV555";
import {refineConcertLightingV542} from "./intelligentConcertLightingV542";
import {planStageAtmosphereV551} from "./intelligentStageAtmosphereV551";
import {planDynamicConcertLightingV608} from "./dynamicConcertLightingV608";
import {planUltimateConcertDramaturgyV623,composeConcertLightingV623} from "./ultimateConcertDramaturgyV623";
import {planAdvancedStageLightingV621} from "./advancedStageLightingV621";
import {planDynamicStageTransformationV622} from "./dynamicStageTransformationV622";
import {planDynamicConcertStagesV635,LED_WALL_VERTEX_V635} from "./dynamicConcertStagesV635";
import {planCinematicStageEnvironmentV647,LED_WALL_FRAGMENT_V647} from "./cinematicStageEnvironmentsV647";
import {getVisualFactorsV640} from "./adaptiveVisualBudgetV640";
import {planGenreConcertV610} from "./genreConcertExperienceV610";
import {planContinuousConcertV611} from "./continuousConcertExperienceV611";
import {planSeamlessConcertTransitionV609} from "./seamlessConcertTransitionsV609";
import type {NarrativePlanV604,NarrativeCueV604} from "./fullSongConcertDramaturgyV604";
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


/** Reuse the stage's two point lights and one world-space vector (no frame allocations). */
function followPerformerLightV557(scene:Scene,slot:number|null,home:Vector3,
  light:PointLight|null,work:Vector3,side:number,alpha:number,faceBodyBalance=0){
  if(!light)return;
  let target=home;
  if(slot!==null){
    const root=scene.getObjectByName(`v377-vocal-stage-slot-${slot}`);
    let visible=!!root;
    for(let p:Object3D|null|undefined=root;p;p=p.parent){if(!p.visible){visible=false;break;}}
    if(visible&&root){
      root.updateWorldMatrix(true,false);root.getWorldPosition(work);
      if(Number.isFinite(work.x)&&Number.isFinite(work.y)&&Number.isFinite(work.z)){
        target=work;
        target.set(Math.max(-3,Math.min(3,target.x+side)),
          Math.max(-.25,Math.min(3,target.y+1.7-.36*faceBodyBalance)),
          Math.max(-2,Math.min(3.2,target.z+2-.24*faceBodyBalance)));
      }
    }
  }
  light.position.lerp(target,Math.min(.12,alpha*.42));
}

/** Lights are reused across frames; low tier disables animated beam sweeping and floor pulse geometry. */
export function DynamicStage({ theme = "classic", audio, isPlaying, reducedMotion, reactive = true, strength = 60, genre, musicPalette, showCue, composition, glowGainV353=1, timelineGainV354=1, cinematicCueV497, concertLipSyncV386, concertShowCueV387, concertShowLightingV387=true,concertShowAtmosphereV387=true,festivalShowCueV394,festivalShowLightingV394=true,festivalShowAtmosphereV394=true,festivalShowLasersV394=false,lyricsProtectedV542=false,groupCountV542=1,vocalFocusV542=false,performerLightingV557,cameraNarrativeV605,cameraSectionV608 }: {
  theme?: StageTheme; audio: AudioFeatures; isPlaying: boolean; reducedMotion: boolean; reactive?: boolean; strength?: number; genre?: string | null; musicPalette?: { primary: string; secondary: string; glow: string }; showCue?: ShowCue; composition?:SmartStageCueV351;glowGainV353?:number; timelineGainV354?:number;cinematicCueV497?:VocalConcertHandoffV498;concertLipSyncV386?:VisualizerProps["lipSync"];concertShowCueV387?:ConcertShowCueV387;concertShowLightingV387?:boolean;concertShowAtmosphereV387?:boolean;festivalShowCueV394?:FestivalShowCueV394;festivalShowLightingV394?:boolean;festivalShowAtmosphereV394?:boolean;festivalShowLasersV394?:boolean;lyricsProtectedV542?:boolean;groupCountV542?:number;vocalFocusV542?:boolean;performerLightingV557?:{settings:ConcertDetailSettingsV555;cue:ConcertDetailsCueV555;scene?:import("./cinematicConcertCoordinationV528").ConcertSceneV528|null;progressMs?:number};cameraNarrativeV605?:{plan:NarrativePlanV604;cue:NarrativeCueV604;manualCamera:boolean};cameraSectionV608?:StageSection;
}) {
  const palette = palettes[theme];
  const sceneFlags = sceneDetailFlags(useSceneDetail());
  const key = useRef<PointLight>(null);
  const targetPrimary = useRef(new Color());
  const targetSecondary = useRef(new Color());
  // V622: reuse mutable Three colors and the existing stage floor/background.
  const warmTintV622=useRef(new Color('#ffc487'));
  const coolTintV622=useRef(new Color('#77caff'));
  const moodTintV622=useRef(new Color());
  const backgroundTargetV622=useRef(new Color());
  const floorTargetV622=useRef(new Color());
  const floorMaterialV622=useRef<import('three').MeshStandardMaterial>(null);
  // V635: one reusable planar LED wall, never any per-frame mesh/material allocation.
  const ledWallV635=useRef<Mesh>(null);
  const ledMaterialV635=useRef<import('three').ShaderMaterial>(null);
  // V558 cached neutral portrait temperatures; no per-frame Color allocations.
  const warmPortraitV558 = useRef(new Color('#ffe5d6'));
  const coolDuetV558 = useRef(new Color('#c3d9ff'));
  // V559: smoothed accents, no geometry/shadow/light allocations in render loop.
  const beatAccentV559 = useRef(0);
  // Cached V566 camera directions + sampled performer position; never allocate in frame loop.
  const cameraFaceV566=useRef(new Vector3());
  const cameraForwardV566=useRef(new Vector3());
  const cameraToFaceV566=useRef(new Vector3());
  const cinematicMixV566=useRef(0);
  const fill = useRef<PointLight>(null);
  const beam = useRef<SpotLight>(null);
  const floorLight = useRef<PointLight>(null);
  const pulseMesh = useRef<Mesh>(null);
  const concertFocusPositionV386=useRef(new Vector3());
  const followPositionV557=useRef(new Vector3());
  const homeKeyV557=useRef(new Vector3(-2.3,2.4,2.2));
  const homeFillV557=useRef(new Vector3(2.4,1.5,1.8));
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

    // Music colors affect existing lights only: no new draw calls, shadow maps or post-processing.
    targetPrimary.current.set(timelineCue.color ?? musicPalette?.primary ?? palette.primary);
    targetSecondary.current.set(musicPalette?.secondary ?? palette.secondary);

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
    // V542 refines the established V462 budget without adding new lights or GPU effects.
    // Authored light timelines and deliberate blackouts remain authoritative.
    const lightingV542=refineConcertLightingV542({base:lightingV462,section:atmosphereSection.current,
      energy:audio.energyEnvelope??audio.bass??0,kick:audio.kickAccentIntensity??0,
      playing:isPlaying,reactive,reducedMotion,tier,
      authored:authoredLightsV386||(showCue?.enabled===true&&showCue.lightingEnabled===false),
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,groupCount:groupCountV542});
    // V551 follows only confirmed V528 vocal casts, and reuses V462/V542 light budgets.
    const lightingV551=planStageAtmosphereV551({base:lightingV542,mood:lightingV462.mood,
      section:atmosphereSection.current,energy:audio.energyEnvelope??audio.bass??0,
      kick:audio.kickAccentIntensity??0,tier,playing:isPlaying,reactive,reducedMotion,
      authored:authoredLightsV386||(showCue?.enabled===true&&showCue.lightingEnabled===false),
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542,groupCount:groupCountV542,
      scene:concertLipSyncV386?.cinematicSceneV528});
    // V608: use the same live V604 act, playback clock and V551 verified singers
    // for one extra bounded envelope over the existing key/fill/spot/fog lights.
    const lightingV608=planDynamicConcertLightingV608({
      narrative:cameraNarrativeV605,trackId:playback.trackId,
      durationMs:playback.durationMs,positionMs:playback.positionMs,
      section:cameraSectionV608??atmosphereSection.current,mood:lightingV462.mood,
      energy:audio.energyEnvelope??audio.bass??0,kick:audio.kickAccentIntensity??0,
      cast:lightingV551,playing:isPlaying&&playback.playing,reactive,reducedMotion,tier,
      authored:authoredLightsV386||(showCue?.enabled===true&&showCue.lightingEnabled===false),
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542,
    });
    const lightingV621=composeConcertLightingV623(planAdvancedStageLightingV621({narrative:cameraNarrativeV605,
      trackId:playback.trackId,durationMs:playback.durationMs,positionMs:playback.positionMs,
      section:cameraSectionV608??atmosphereSection.current,genre,
      energy:audio.energyEnvelope??audio.bass??0,kick:audio.kickAccentIntensity??0,
      playing:isPlaying&&playback.playing,reactive,reducedMotion,tier,
      authored:authoredLightsV386||!reactive||showCue?.lightingEnabled===false,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,groupCount:groupCountV542,
     }),planUltimateConcertDramaturgyV623({
      narrative:cameraNarrativeV605,trackId:playback.trackId,durationMs:playback.durationMs,positionMs:playback.positionMs,
      section:cameraSectionV608??atmosphereSection.current,playing:isPlaying&&playback.playing,reducedMotion,tier:tier,
      energy:audio.energyEnvelope??audio.bass??0,kick:audio.kickAccentIntensity??0,lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,
      manualLighting:authoredLightsV386||showCue?.lightingEnabled===false||!concertShowLightingV387,
    }));
    // V622 transforms existing environment colors only when a verified V604
    // act is active. No scene/theme replacement or hidden new lighting source.
    const transformationV622=planDynamicStageTransformationV622({
      narrative:cameraNarrativeV605,trackId:playback.trackId,positionMs:playback.positionMs,
      durationMs:playback.durationMs,section:cameraSectionV608??atmosphereSection.current,
      genre,playing:isPlaying&&playback.playing,reactive,reducedMotion,tier,
      authored:authoredLightsV386||showCue?.lightingEnabled===false||!concertShowLightingV387,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,
    });
    // V635: obey precisely the same verified V604 act and manual lighting safety
    // as V622. All patterns are faded out at genuine act boundaries.
    const stageVisualV635=planDynamicConcertStagesV635({
      narrative:cameraNarrativeV605,trackId:playback.trackId,positionMs:playback.positionMs,
      durationMs:playback.durationMs,section:cameraSectionV608??atmosphereSection.current,
      genre,playing:isPlaying&&playback.playing,reactive,reducedMotion,tier,
      authored:authoredLightsV386||showCue?.lightingEnabled===false||!concertShowLightingV387,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,
      groupCount:Math.max(1,Math.min(4,Math.round(groupCountV542)||1)),
      visualsEnabled:theme!=='minimal'&&sceneFlags.extraLights,
      energy:Math.max(0,Math.min(1,audio.energyEnvelope??audio.bass??0)),
      kick:Math.max(0,Math.min(1,audio.kickAccentIntensity??0)),
      foundation:transformationV622,
    });
    // V647 adds genre-aware architectural stage motifs inside the SAME LED plane.
    // V635 verified act/opacity remains the ceiling and manual theme remains intact.
    const sceneMotifV647=planCinematicStageEnvironmentV647({
      narrative:cameraNarrativeV605,trackId:playback.trackId,
      positionMs:playback.positionMs,durationMs:playback.durationMs,
      section:cameraSectionV608??atmosphereSection.current,genre,
      playing:isPlaying&&playback.playing,reactive,reducedMotion,tier,
      authored:authoredLightsV386||showCue?.lightingEnabled===false||!concertShowLightingV387,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,
      visualsEnabled:theme!=='minimal'&&sceneFlags.extraLights,
      groupCount:Math.max(1,Math.min(4,Math.round(groupCountV542)||1)),base:stageVisualV635,
    });
    // V640: optional LED plane fades to zero before any avatar/lyrics reduction.
    // A zero-opacity plane is also culled by the existing mesh.visible gate.
    const ledBudgetV640=getVisualFactorsV640().led;
    // The LED shader uses playback time, not state.clock, so seeking is deterministic.
    const led=ledMaterialV635.current;
    if(led){
      const mix=1-Math.exp(-Math.min(Math.max(delta,0),.1)*5);
      const o=led.uniforms.uOpacity;
      o.value+=(stageVisualV635.opacity*ledBudgetV640-o.value)*mix;
      led.uniforms.uPattern.value=stageVisualV635.pattern;
      led.uniforms.uPhase.value=stageVisualV635.phase;
      led.uniforms.uSpeed.value=stageVisualV635.speed*ledBudgetV640;
      led.uniforms.uSceneStyle.value=sceneMotifV647.style;
      led.uniforms.uVariation.value=sceneMotifV647.variation;
      led.uniforms.uArchitecture.value=sceneMotifV647.architecture*ledBudgetV640;
      led.uniforms.uDepth.value=sceneMotifV647.depth*ledBudgetV640;
      led.uniforms.uMotion.value=sceneMotifV647.motion*ledBudgetV640;
      (led.uniforms.uPrimary.value as Color).set(musicPalette?.primary??palette.primary);
      (led.uniforms.uSecondary.value as Color).set(musicPalette?.secondary??palette.secondary);
      if(ledWallV635.current)ledWallV635.current.visible=o.value>.004&&
        stageVisualV635.active&&tier!=='low';
    }
    moodTintV622.current.copy(coolTintV622.current).lerp(warmTintV622.current,(transformationV622.tone+1)/2);
    const environmentRateV622=reducedMotion?1:1-Math.exp(-Math.min(Math.max(delta,0),.1)*2.6*1);
    backgroundTargetV622.current.set(palette.base).lerp(moodTintV622.current,Math.min(.19,transformationV622.background+stageVisualV635.ambientTint*ledBudgetV640));
    if(state.scene.background instanceof Color){state.scene.background.lerp(backgroundTargetV622.current,environmentRateV622);}
    floorTargetV622.current.set(palette.floor).lerp(moodTintV622.current,Math.min(.22,transformationV622.floor+stageVisualV635.floorTint*ledBudgetV640));
    if(floorMaterialV622.current)floorMaterialV622.current.color.lerp(floorTargetV622.current,environmentRateV622);
    // Portrait key/fill are altered only very slightly and never override authored colors.
    if(transformationV622.active&&!timelineCue.color){
      targetPrimary.current.lerp(moodTintV622.current,transformationV622.accent*.10);
      targetSecondary.current.lerp(moodTintV622.current,transformationV622.accent*.13);
    }
    // V610: true genre-specific artistic balance over the EXISTING lighting budget.
    const concertGenreV610=planGenreConcertV610({
      narrative:cameraNarrativeV605,trackId:playback.trackId,
      durationMs:playback.durationMs,positionMs:playback.positionMs,
      section:cameraSectionV608??atmosphereSection.current,genre,
      energy:audio.energyEnvelope??audio.bass??0,kick:audio.kickAccentIntensity??0,
      playing:isPlaying&&playback.playing,reducedMotion,tier,
      lyricsProtected:lyricsProtectedV542,manualDance:true,manualCamera:true,
      manualLighting:authoredLightsV386||!reactive||
        timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||
        timelineGainV354<=0||showCue?.lightingEnabled===false,
    });
    // V611: one evidence-bound song arc for the same automatic lanes, no new clock.
    const concertContinuityV611=planContinuousConcertV611({
    genreCue:concertGenreV610,
      narrative:cameraNarrativeV605,trackId:playback.trackId,
      durationMs:playback.durationMs,positionMs:playback.positionMs,
      section:cameraSectionV608??atmosphereSection.current,genre,
      energy:audio.energyEnvelope??audio.bass??0,kick:audio.kickAccentIntensity??0,
      playing:isPlaying&&playback.playing,reducedMotion,tier,
      lyricsProtected:lyricsProtectedV542,manualDance:true,manualCamera:true,
      manualLighting:authoredLightsV386||!reactive||
        timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||
        timelineGainV354<=0||showCue?.lightingEnabled===false,
    });
    // V609 shares the same verified playback/act across camera and both lighting
    // rigs. No extra polling or render callback; authored blackout stays instant.
    const lightingBlendV609=planSeamlessConcertTransitionV609({
      narrative:cameraNarrativeV605,trackId:playback.trackId,
      positionMs:playback.positionMs,playing:isPlaying&&playback.playing,
      reducedMotion,tier,manualCamera:true,
      manualLighting:authoredLightsV386||!reactive||
        timelineCue.blackout>0||timelineCue.strobe>0||timelineGainV354<=0||
        showCue?.lightingEnabled===false,
    });
    const lerp=1-Math.exp(-Math.min(Math.max(delta,0),.1)*9*lightingBlendV609.lightingRate);
    const colorFade=reducedMotion?1:1-Math.exp(-Math.min(Math.max(delta,0),.1)*2.4*lightingBlendV609.lightingRate);
    // V497 uses only existing rig lights; do not brighten manual timelines or blackouts.
    const cinematicKeyV497=concertLightMultiplierV497(cinematicCueV497,"key",{
      authored:authoredLightsV386,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      playing:isPlaying&&reactive,reducedMotion,lowTier:tier==="low"});
    const cinematicBeamV497=concertLightMultiplierV497(cinematicCueV497,"beam",{
      authored:authoredLightsV386,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      playing:isPlaying&&reactive,reducedMotion,lowTier:tier==="low"});
    const showGain = festivalLightV387 * lightAccentV386.gain * (reactive && isPlaying && !reducedMotion ? (showCue?.lightGain ?? 1) : 1) * (composition?.lightGain ?? 1) * (reducedMotion||timelineCue.blackout>0?1:timelineGainV354);
    const showBeam = festivalBeamV387 * lightAccentV386.beamGain * (reactive && isPlaying && !reducedMotion ? (showCue?.beamGain ?? 1) : 1) * (composition?.beamGain ?? 1) * (reducedMotion||timelineCue.blackout>0?1:timelineGainV354);
    // Face floor is limited to un-authored active scenes and never defeats a manual blackout.
    const performerPlanV557=planPerformerLightingV557({
      cue:performerLightingV557?.cue,settings:performerLightingV557?.settings,
      scene:performerLightingV557?.scene,count:groupCountV542,progressMs:performerLightingV557?.progressMs,playing:isPlaying&&reactive,
      reducedMotion,tier,authored:authoredLightsV386||showCue?.lightingEnabled===false,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
    });
    const portraitPlanV558=planAvatarPortraitLightingV558({
      performer:performerPlanV557,cue:performerLightingV557?.cue,
      settings:performerLightingV557?.settings,tier,
    });
    // Authored colors/timelines and blackouts are upstream of the portrait planner.
    // Only the existing key/fill are warmed; decorative beams/floor keep stage palette.
    if(portraitPlanV558.enabled && !timelineCue.color){
      targetPrimary.current.lerp(warmPortraitV558.current,portraitPlanV558.keyWarmth);
      targetSecondary.current.lerp(portraitPlanV558.mode==='duet'?coolDuetV558.current:warmPortraitV558.current,
        portraitPlanV558.fillWarmth);
    }
    const beatPortraitPlanV559=planBeatVocalPortraitLightingV559({
      performer:performerPlanV557,portrait:portraitPlanV558,
      cue:performerLightingV557?.cue,audio,settings:performerLightingV557?.settings,
      playing:isPlaying,reactive,reducedMotion,tier,authored:authoredLightsV386||showCue?.lightingEnabled===false,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542,
    });
    // V566: measure actual camera sightline to V557 trusted, visible performer stage root.
    // Do not infer face orientation, mouth openness or the active singer from lyrics.
    let rootVisibleV566=false;
    let distanceV566=Infinity;
    let alignmentV566=-1;
    if(performerPlanV557.focusSlot!==null){
      const performerRootV566=state.scene.getObjectByName(`v377-vocal-stage-slot-${performerPlanV557.focusSlot}`);
      if(performerRootV566){
        rootVisibleV566=true;
        for(let p:Object3D|null=performerRootV566;p;p=p.parent){if(!p.visible){rootVisibleV566=false;break;}}
        if(rootVisibleV566){
          performerRootV566.updateWorldMatrix(true,false);
          performerRootV566.getWorldPosition(cameraFaceV566.current);
          cameraFaceV566.current.y+=1.55;
          state.camera.getWorldPosition(cameraToFaceV566.current);
          cameraToFaceV566.current.subVectors(cameraFaceV566.current,cameraToFaceV566.current);
          distanceV566=cameraToFaceV566.current.length();
          if(distanceV566>0){
            state.camera.getWorldDirection(cameraForwardV566.current);
            alignmentV566=cameraForwardV566.current.dot(cameraToFaceV566.current)/distanceV566;
          }
        }
      }
    }
    const cinematicPlanV566=planCinematicAvatarLightingV566({
      performer:performerPlanV557,portrait:portraitPlanV558,cue:performerLightingV557?.cue,
      settings:performerLightingV557?.settings,cameraDistance:distanceV566,
      cameraAlignment:alignmentV566,rootVisible:rootVisibleV566,
      playing:isPlaying,reactive,reducedMotion,tier,
      authored:authoredLightsV386||showCue?.lightingEnabled===false,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542,
    });
    const cinematicTargetV566=cinematicPlanV566.enabled?1:0;
    // A soft attack and release, no camera-cut flash or stateful timers.
    const cinematicRateV566=1-Math.exp(-Math.min(.1,Math.max(0,delta))*(cinematicTargetV566?2.8:4.0));
    cinematicMixV566.current+=(cinematicTargetV566-cinematicMixV566.current)*cinematicRateV566;
    const cinematicScaleV566=cinematicPlanV566.enabled?cinematicMixV566.current:0;
    if(cinematicScaleV566>0&&!timelineCue.color){
      targetPrimary.current.lerp(warmPortraitV558.current,cinematicPlanV566.colorMix*cinematicScaleV566);
      targetSecondary.current.lerp(portraitPlanV558.mode==='duet'?coolDuetV558.current:warmPortraitV558.current,
        cinematicPlanV566.colorMix*.65*cinematicScaleV566);
    }
    // Ease into beats and decay afterwards; bypass immediately on off/blackout/authoring.
    const targetBeatV559=beatPortraitPlanV559.enabled?1:0;
    const beatResponseV559=1-Math.exp(-Math.min(.1,Math.max(0,delta))*(targetBeatV559?4.0:2.8));
    beatAccentV559.current+=(targetBeatV559-beatAccentV559.current)*beatResponseV559;
    const beatScaleV559=beatPortraitPlanV559.enabled?beatAccentV559.current:0;
    if(beatScaleV559>0 && !timelineCue.color){
      targetPrimary.current.lerp(warmPortraitV558.current,beatPortraitPlanV559.keyColorMix*beatScaleV559);
      targetSecondary.current.lerp(portraitPlanV558.mode==='duet'?coolDuetV558.current:warmPortraitV558.current,
        beatPortraitPlanV559.fillColorMix*beatScaleV559);
    }
    if(transformationV622.active&&!timelineCue.color){
      targetPrimary.current.lerp(moodTintV622.current,transformationV622.accent*.07);
      targetSecondary.current.lerp(moodTintV622.current,transformationV622.accent*.09);
    }
    if (key.current) key.current.color.lerp(targetPrimary.current, colorFade);
    if (fill.current) fill.current.color.lerp(targetSecondary.current, colorFade);
    if (floorLight.current) floorLight.current.color.lerp(
      targetPrimary.current.set(timelineCue.color ?? musicPalette?.primary ?? palette.primary),colorFade);
    if (beam.current) beam.current.color.lerp(
      targetSecondary.current.set(musicPalette?.secondary ?? palette.secondary),colorFade);
    const keyTargetV462=Math.min(3,Math.max(lightingV542.faceFloor||lightingV462.faceFloor,directed(cue.key)*lightScale*showGain*lightingV462.keyGain*lightingV542.keyGain*lightingV551.keyGain*lightingV608.key*concertGenreV610.key*lightingV621.key*concertContinuityV611.key*cinematicKeyV497)*performerPlanV557.keyGain);
    const fillTargetV462=Math.min(2.4,Math.max(Math.max(lightingV462.faceFloor,lightingV542.faceFloor)*.75,directed(cue.fill)*lightScale*showGain*lightingV462.fillGain*lightingV542.fillGain*lightingV551.fillGain*lightingV608.fill*concertGenreV610.fill*lightingV621.fill*concertContinuityV611.fill)*performerPlanV557.fillGain);
    // V559 applies only capped percentages to existing V462/V557 light targets.
    // These factors never overpower a manual cue, low tier, pause, or blackout.
    const beatKeyTargetV559=Math.min(3,keyTargetV462*(1+beatPortraitPlanV559.keyLift*beatScaleV559+cinematicPlanV566.keyLift*cinematicScaleV566));
    const beatFillTargetV559=Math.min(2.4,fillTargetV462*(1+beatPortraitPlanV559.fillLift*beatScaleV559+cinematicPlanV566.fillLift*cinematicScaleV566));
    if (key.current) key.current.intensity += (beatKeyTargetV559-key.current.intensity)*lerp;
    if (fill.current) fill.current.intensity += (beatFillTargetV559-fill.current.intensity)*lerp;
    if (floorLight.current) floorLight.current.intensity += ((sceneFlags.extraLights ? Math.min(2.5,directed(cue.floor) * lightScale * showGain) : 0) - floorLight.current.intensity) * lerp;
    if (beam.current) {
      beam.current.intensity += ((sceneFlags.extraLights ? (theme === "minimal" ? .2 : Math.min(3.0,directed(cue.beam) * (1 + smartCue.sweep * .12) * showBeam * lightingV462.beamGain * lightingV542.beamGain * lightingV551.beamGain * lightingV608.beam * concertGenreV610.beam * lightingV621.beam * concertContinuityV611.beam * cinematicBeamV497)) * lightScale : 0) - beam.current.intensity) * lerp;
      beam.current.position.x = sceneFlags.beamSweep && cue.sweep && !reducedMotion && tier === "high"
        ? Math.sin(state.clock.elapsedTime * .65) * (1.2 + cue.sweep + director.sweep + predictive.anticipation * .15 + smartCue.sweep * .24) * lightingV462.sweepGain * lightingV542.sweepGain * lightingV551.sweepGain * lightingV608.sweep * concertGenreV610.sweep * lightingV621.sweep * concertContinuityV611.sweep : 0;
      // V497 may focus the existing beam even when V386 concert lighting is disabled.
      // Never steer a user-authored lighting timeline or a deliberate blackout.
      const lightFocusV497=cinematicBeamV497>1?cinematicCueV497?.focusSlot:null;
      if(lightFocusV497!==null&&lightFocusV497!==undefined&&sceneFlags.extraLights){
        const dancer=state.scene.getObjectByName(`v377-vocal-stage-slot-${lightFocusV497}`);
        if(dancer?.visible){dancer.updateWorldMatrix(true,false);dancer.getWorldPosition(concertFocusPositionV386.current);
          let goal=Math.max(-2.1,Math.min(2.1,concertFocusPositionV386.current.x));
          // V498: follow the *actual* old/new avatar world positions during an
          // authored singer hand-off. Reuse the existing Vector3 and spotlight.
          const fromSlotV498=cinematicCueV497?.focusFromV498;
          if(fromSlotV498!==null&&fromSlotV498!==undefined){
            const previous=state.scene.getObjectByName(`v377-vocal-stage-slot-${fromSlotV498}`);
            if(previous?.visible){
              previous.updateWorldMatrix(true,false);
              previous.getWorldPosition(concertFocusPositionV386.current);
              const oldX=Math.max(-2.1,Math.min(2.1,concertFocusPositionV386.current.x));
              const mix=cinematicCueV497?.focusBlendV498??1;
              goal=oldX+(goal-oldX)*mix;
            }
          }
          beam.current.position.x+=(goal-beam.current.position.x)*Math.min(.17,cinematicBeamV497-1);
        }
      }
      if(lightAccentV386.focusSlot!==null&&sceneFlags.extraLights){
        const dancer=state.scene.getObjectByName(`v377-vocal-stage-slot-${lightAccentV386.focusSlot}`);
        if(dancer?.visible){dancer.updateWorldMatrix(true,false);dancer.getWorldPosition(concertFocusPositionV386.current);
          // Use actual dancer positions; cap the steering to a quiet, non-strobing gesture.
          const goal=Math.max(-2.1,Math.min(2.1,concertFocusPositionV386.current.x));
          beam.current.position.x+=(goal-beam.current.position.x)*Math.min(.28,lightAccentV386.beamGain-1);
        }
      }
    }
    // V557: track real stage roots, not a synthetic singer position. Existing lights only.
    // Target position follows the actual performers with smooth, bounded travel and returns
    // to the authored default when no trusted cast is present or light cues take priority.
    followPerformerLightV557(state.scene,performerPlanV557.focusSlot,homeKeyV557.current,
      key.current,followPositionV557.current,-.65,lerp,cinematicPlanV566.enabled?cinematicPlanV566.faceBalance:portraitPlanV558.faceBodyBalance);
    followPerformerLightV557(state.scene,portraitPlanV558.enabled?portraitPlanV558.fillSlot:performerPlanV557.partnerSlot,homeFillV557.current,
      fill.current,followPositionV557.current,.65,lerp,cinematicPlanV566.enabled?cinematicPlanV566.faceBalance:portraitPlanV558.faceBodyBalance);
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
    <ConcertAtmosphereRendererV308 cameraSectionV608={cameraSectionV608} cameraNarrativeV605={cameraNarrativeV605} concertSceneV551={concertLipSyncV386?.cinematicSceneV528} genreV462={genre} lyricsProtectedV542={lyricsProtectedV542} groupCountV542={groupCountV542} vocalFocusV542={vocalFocusV542} audio={audio} isPlaying={isPlaying} reducedMotion={reducedMotion} reactive={reactive} theme={theme} musicPalette={musicPalette} showCue={showCue} timelineGainRef={atmosphereTimelineGain} sectionRef={atmosphereSection} concertShowCueV387={concertShowAtmosphereV387?concertShowCueV387:undefined} festivalShowCueV394={festivalShowAtmosphereV394?festivalShowCueV394:undefined} festivalShowLasersV394={festivalShowLasersV394}
      authoredLightingV387={timeline.current.cues.length>0||timelineGainV354!==1||showCue?.lightingEnabled===true||showCue?.lightingEnabled===false}/>
    {/* V635: back-wall LED pattern is one low-cost mesh behind the cast.
        When disabled its draw call is gated; it cannot cover a singer/lyrics. */}
    <mesh ref={ledWallV635} visible={false} position={[0,0.05,-3.8]} renderOrder={-1}>
      <planeGeometry args={[6.2,3.35]}/>
      <shaderMaterial ref={ledMaterialV635} transparent depthWrite={false}
        vertexShader={LED_WALL_VERTEX_V635} fragmentShader={LED_WALL_FRAGMENT_V647}
        uniforms={{uOpacity:{value:0},uPattern:{value:0},uPhase:{value:0},uSpeed:{value:0},
          uSceneStyle:{value:0},uVariation:{value:0},uArchitecture:{value:0},uDepth:{value:0},uMotion:{value:0},
          uPrimary:{value:new Color(palette.primary)},uSecondary:{value:new Color(palette.secondary)}}}/>
    </mesh>
    <pointLight ref={key} color={palette.primary} position={[-2.3, 2.4, 2.2]} intensity={1.1} distance={11}/>
    <pointLight ref={fill} color={palette.secondary} position={[2.4, 1.5, 1.8]} intensity={0.65} distance={10}/>
    <pointLight ref={floorLight} color={palette.primary} position={[0, -1.6, 0.4]} intensity={0.45} distance={7}/>
    <spotLight ref={beam} color={palette.secondary} position={[0, 3.0, 1.4]} angle={0.5} penumbra={0.9} intensity={0.7} distance={9}/>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.95, 0]}>
      <circleGeometry args={[3.2, 48]}/><meshStandardMaterial ref={floorMaterialV622} color={palette.floor} roughness={0.7} metalness={0.18}/>
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
