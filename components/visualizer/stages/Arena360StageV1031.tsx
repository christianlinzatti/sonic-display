"use client";

import {useFrame} from "@react-three/fiber";
import {useLayoutEffect, useMemo, useRef, type ReactNode} from "react";
import {Color, Object3D} from "three";
import type {Group, InstancedMesh} from "three";
import type {AudioFeatures} from "@/types/audio";
import {getActivePerformanceTier} from "../adaptivePerformance";
import {normalizedArenaSpeedV1031, stepArenaRotationV1031} from "@/lib/arena360RotationV1031";
import {ArenaAudienceV1032} from "./ArenaAudienceV1032";
import {ArenaLightsV1032} from "./ArenaLightsV1032";
import {planCinematicLightingV1056} from "@/lib/arena360CinematicLightingV1056";
import {planIntelligentLaserV1057} from "@/lib/arena360IntelligentLaserV1057";
import {planVolumetricLightingV1058} from '@/lib/arena360VolumetricLightingV1058';
import {planLedWallV1059,type LedWallPatternV1059} from '@/lib/arena360LedWallV1059';
import {ArenaLedWallV1059} from './ArenaLedWallV1059';
import {planLightingChoreographerV1060} from '@/lib/arena360LightingChoreographerV1060';
import {ArenaLedDomeV1033} from "./ArenaLedDomeV1033";
import {ArenaSkyFormationV1034} from "./ArenaSkyFormationV1034";
import {ArenaLedColumnsV1035} from "./ArenaLedColumnsV1035";
import {ArenaVirtualPyroV1035} from "./ArenaVirtualPyroV1035";
import {planArenaTimelineV1035} from "@/lib/arena360DirectorV1035";
import {INITIAL_ARENA_PEAK_V1036,stepArenaPeakV1036} from "@/lib/arena360AtmosphereV1036";
import {ArenaLaserFansV1036} from "./ArenaLaserFansV1036";
import {ArenaMovingLedSkyV1036} from "./ArenaMovingLedSkyV1036";
import {ArenaLowFogV1036} from "./ArenaLowFogV1036";
import {ArenaTransformingDeckV1037} from './ArenaTransformingDeckV1037';
import type {ArenaTransformationModeV1037} from '@/lib/arena360TransformationV1037';
import {ArenaFloatingPlatformsV1038} from './ArenaFloatingPlatformsV1038';
import type {FloatingStageModeV1038} from '@/lib/arena360FloatingStageV1038';
import {ArenaHologramPortalsV1039} from './ArenaHologramPortalsV1039';
import {ArenaLaserTunnelsV1039} from './ArenaLaserTunnelsV1039';
import type {HologramPatternV1039} from '@/lib/arena360HolographyV1039';
import {sampleArenaShowPlanV1040,type ArenaShowPlanV1040} from '@/lib/arena360ShowDesignerV1040';
import {directArenaShowV1048} from '@/lib/arena360ConcertDirectorV1048';
import {directLiveConcertV1049} from '@/lib/arena360LiveConcertIntelligenceV1049';
import {directAdaptiveStoryV1050} from '@/lib/arena360AdaptiveStorytellingV1050';
import {planArenaCinematicFinaleV1046} from '@/lib/arena360CinematicFinaleV1046';
import {ArenaCinematicFinaleV1046} from './ArenaCinematicFinaleV1046';
import {planArenaImmersionV1047} from '@/lib/arena360ImmersiveArenaV1047';
import {ArenaImmersiveExperienceV1047} from './ArenaImmersiveExperienceV1047';
import {planArenaAtmosphereDirectorV1045} from '@/lib/arena360AtmosphereDirectorV1045';
import {planArenaAudienceV1044} from '@/lib/arena360AudienceDirectorV1044';
import {planCrowdExperienceV1051} from '@/lib/arena360CrowdExperienceV1051';
import {directUltimateConcertV1052} from '@/lib/arena360UltimateConcertV1052';
import {INITIAL_ARENA_LIFT_V1034,stepArenaLiftV1034} from "@/lib/arena360ShowV1034";
import type {ArenaPhoneModeV1033} from "@/lib/arena360ImmersionV1033";

const TAU = Math.PI * 2;
const LED_COUNT = 32;

/** One shared turntable parent rotates BOTH the physical deck and its performers.
 * Outer audience / overhead truss stay fixed in the world, just as in an arena.
 * No real-time shadows, network requests, camera ownership or new postprocessing.
 */
export function Arena360StageV1031({children,audio,isPlaying,reducedMotion,reactive=true,
  rotationSpeed=90,rotationEnabled=true,audienceEnabled=true,lightsEnabled=true,dropEnabled=true,
  wavesEnabled=true,phoneSyncEnabled=true,phoneMode="wave",domeEnabled=true,
  showDirectorEnabled=true,secondLevelEnabled=true,skyFormationEnabled=true,section="verse",
  fullSongDirectorEnabled=true,ledColumnsEnabled=true,virtualPyroEnabled=true,crowdChantEnabled=true,
  showIntensity=65,progressMs=0,durationMs=0,
  lasersEnabled=true,movingSkyEnabled=true,groundFogEnabled=true,arenaPeaksEnabled=true,
  transformingDeckEnabled=true,transformingDeckMode='auto',transformingDeckStrength=70,
  floatingStageEnabled=true,floatingStageMode='auto',floatingStageIntensity=70,
  hologramsEnabled=true,laserArchitectureEnabled=true,hologramPattern='auto',hologramStrength=65,
  showDesignerEnabled=false,showPlan,audienceDirectorEnabled=false,audienceDirectorStrength=50,
  atmosphereDirectorEnabled=false,atmosphereDirectorStrength=55,
  cinematicFinaleEnabled=false,cinematicFinaleStrength=60,
  immersiveEnabled=false,immersiveStrength=55,concertDirectorEnabled=false,concertDirectorStrength=50,
  liveConcertEnabledV1049=false,liveConcertStrengthV1049=50,microphoneActiveV1049=false,
  storytellingEnabledV1050=false,storytellingStrengthV1050=55,
  crowdExperienceEnabledV1051=false,crowdExperienceStrengthV1051=55,
  ultimateConcertEnabledV1052=false,ultimateConcertStrengthV1052=60,
  cinematicLightingEnabledV1056=false,cinematicLightingStrengthV1056=55,
  intelligentLaserEnabledV1057=false,intelligentLaserStrengthV1057=55,
  volumetricLightingEnabledV1058=false,volumetricLightingStrengthV1058=55,
  ledWallEnabledV1059=false,ledWallStrengthV1059=55,ledWallPatternV1059='auto',
  lightingChoreographerEnabledV1060=false,lightingChoreographerStrengthV1060=55,trackId,genre}: {
  children?:ReactNode;audio:AudioFeatures;isPlaying:boolean;reducedMotion:boolean;
  reactive?:boolean;rotationSpeed?:number;rotationEnabled?:boolean;
  audienceEnabled?:boolean;lightsEnabled?:boolean;dropEnabled?:boolean;
  wavesEnabled?:boolean;phoneSyncEnabled?:boolean;phoneMode?:ArenaPhoneModeV1033;domeEnabled?:boolean;
  showDirectorEnabled?:boolean;secondLevelEnabled?:boolean;skyFormationEnabled?:boolean;section?:string;
  fullSongDirectorEnabled?:boolean;ledColumnsEnabled?:boolean;virtualPyroEnabled?:boolean;
  crowdChantEnabled?:boolean;showIntensity?:number;progressMs?:number;durationMs?:number;
  lasersEnabled?:boolean;movingSkyEnabled?:boolean;groundFogEnabled?:boolean;arenaPeaksEnabled?:boolean;
  transformingDeckEnabled?:boolean;transformingDeckMode?:ArenaTransformationModeV1037;transformingDeckStrength?:number;
  floatingStageEnabled?:boolean;floatingStageMode?:FloatingStageModeV1038;floatingStageIntensity?:number;
  hologramsEnabled?:boolean;laserArchitectureEnabled?:boolean;hologramPattern?:HologramPatternV1039;
  hologramStrength?:number;showDesignerEnabled?:boolean;showPlan?:ArenaShowPlanV1040;
  audienceDirectorEnabled?:boolean;audienceDirectorStrength?:number;
  atmosphereDirectorEnabled?:boolean;atmosphereDirectorStrength?:number;
  cinematicFinaleEnabled?:boolean;cinematicFinaleStrength?:number;
  immersiveEnabled?:boolean;immersiveStrength?:number;concertDirectorEnabled?:boolean;concertDirectorStrength?:number;
  liveConcertEnabledV1049?:boolean;liveConcertStrengthV1049?:number;microphoneActiveV1049?:boolean;
  storytellingEnabledV1050?:boolean;storytellingStrengthV1050?:number;
  crowdExperienceEnabledV1051?:boolean;crowdExperienceStrengthV1051?:number;
  ultimateConcertEnabledV1052?:boolean;ultimateConcertStrengthV1052?:number;
  cinematicLightingEnabledV1056?:boolean;cinematicLightingStrengthV1056?:number;
  intelligentLaserEnabledV1057?:boolean;intelligentLaserStrengthV1057?:number;
  volumetricLightingEnabledV1058?:boolean;volumetricLightingStrengthV1058?:number;
  ledWallEnabledV1059?:boolean;ledWallStrengthV1059?:number;ledWallPatternV1059?:LedWallPatternV1059;
  lightingChoreographerEnabledV1060?:boolean;lightingChoreographerStrengthV1060?:number;
  trackId?:string|null;genre?:string|null;
}){
  const turntable=useRef<Group>(null);
  const scenicTier=useRef<Group>(null);
  const scenicState=useRef({...INITIAL_ARENA_LIFT_V1034});
  const sharedPeak=useRef({...INITIAL_ARENA_PEAK_V1036});
  const glow=useRef<Group>(null);
  const leds=useRef<InstancedMesh>(null);
  const dummy=useMemo(()=>new Object3D(),[]);
  const blue=useMemo(()=>new Color('#29e9ff'),[]);
  const pink=useMemo(()=>new Color('#ef4ce9'),[]);
  const speed=normalizedArenaSpeedV1031(rotationSpeed);
  // Authored templates steer visuals only when explicitly enabled. The observed section
  // still owns the real audio/pyro triggers; manual modes and disabled effects win.
  const authoredShowCueV1040=sampleArenaShowPlanV1040(showPlan,{enabled:showDesignerEnabled&&showDirectorEnabled,
    playing:isPlaying,reducedMotion,progressMs,durationMs,observedSection:section});
  // V1048: a single reproducible song-specific cue feeds all EXISTING 360° systems.
  const arrangedShowV1048=directArenaShowV1048({enabled:concertDirectorEnabled&&showDesignerEnabled&&showDirectorEnabled,
    stageIsArena:true,playing:isPlaying,reducedMotion,reactive,show:authoredShowCueV1040,
    plan:showPlan,trackId,progressMs,durationMs,strength:concertDirectorStrength,
    performanceTier:getActivePerformanceTier()}).show;
  // V1050: the existing show-plan gets a restrained narrative intensity arc.
  const storyShowV1050=directAdaptiveStoryV1050({
    enabled:storytellingEnabledV1050&&showDesignerEnabled&&showDirectorEnabled,
    stageIsArena:true,playing:isPlaying,reducedMotion,reactive,
    plan:showPlan,show:arrangedShowV1048,trackId,progressMs,durationMs,
    strength:storytellingStrengthV1050,performanceTier:getActivePerformanceTier(),
  }).show;
  const composedShowV1049=directLiveConcertV1049({enabled:liveConcertEnabledV1049&&showDesignerEnabled&&showDirectorEnabled,
    stageIsArena:true,playing:isPlaying,reducedMotion,reactive,show:storyShowV1050,audio,
    microphoneActive:microphoneActiveV1049,strength:liveConcertStrengthV1049,
    performanceTier:getActivePerformanceTier()}).show;
  // V1052: one shared, opt-in score for stage/crowd/cast/camera; no new scene owner.
  const ultimateConcertV1052=directUltimateConcertV1052({
    enabled:ultimateConcertEnabledV1052&&showDesignerEnabled&&showDirectorEnabled,
    stageIsArena:true,playing:isPlaying,reducedMotion,reactive,
    plan:showPlan,show:composedShowV1049,trackId,progressMs,durationMs,
    strength:ultimateConcertStrengthV1052,performanceTier:getActivePerformanceTier(),
  });
  const showCueV1040=ultimateConcertV1052.show;
  const cinematicLightingV1056=planCinematicLightingV1056({
    enabled:cinematicLightingEnabledV1056&&showDesignerEnabled&&showDirectorEnabled,
    lightsEnabled,stageIsArena:true,playing:isPlaying,reducedMotion,reactive,
    show:showCueV1040,plan:showPlan,trackId,progressMs,durationMs,
    strength:cinematicLightingStrengthV1056,performanceTier:getActivePerformanceTier(),
  });
  const intelligentLaserV1057=planIntelligentLaserV1057({
    enabled:intelligentLaserEnabledV1057&&showDesignerEnabled&&showDirectorEnabled,
    stageIsArena:true,fanEnabled:lasersEnabled,architectureEnabled:laserArchitectureEnabled&&lasersEnabled,
    playing:isPlaying,reducedMotion,reactive,
    show:showCueV1040,plan:showPlan,trackId,progressMs,durationMs,
    strength:intelligentLaserStrengthV1057,performanceTier:getActivePerformanceTier(),
  });
  // V1058: purely optical, bounded cue for two existing cone meshes + fog batches.
  const volumetricLightingV1058=planVolumetricLightingV1058({
    enabled:volumetricLightingEnabledV1058&&showDesignerEnabled&&showDirectorEnabled,
    stageIsArena:true,lightsEnabled,fogEnabled:groundFogEnabled,
    playing:isPlaying,reducedMotion,reactive,
    show:showCueV1040,plan:showPlan,trackId,progressMs,durationMs,
    strength:volumetricLightingStrengthV1058,performanceTier:getActivePerformanceTier(),
  });
  // V1059: authored concert chapter + VERIFIED audio features feed one open LED pixel belt.
  const ledWallV1059=planLedWallV1059({
    enabled:ledWallEnabledV1059&&showDesignerEnabled&&showDirectorEnabled,
    stageIsArena:true,playing:isPlaying,reducedMotion,reactive,
    performanceTier:getActivePerformanceTier(),trackId,progressMs,durationMs,
    plan:showPlan,show:showCueV1040,strength:ledWallStrengthV1059,pattern:ledWallPatternV1059,
  });
  // V1060 coordinates only individually authorized, already computed optical cues.
  // It cannot enable a manually disabled effect or create any physical light command.
  const choreographyV1060=planLightingChoreographerV1060({
    enabled:lightingChoreographerEnabledV1060&&showDesignerEnabled&&showDirectorEnabled,
    stageIsArena:true,playing:isPlaying,reducedMotion,reactive,
    performanceTier:getActivePerformanceTier(),trackId,progressMs,durationMs,
    plan:showPlan,show:showCueV1040,strength:lightingChoreographerStrengthV1060,
    channels:{spots:cinematicLightingV1056.active&&lightsEnabled,
      lasers:intelligentLaserV1057.active&&lasersEnabled,
      fog:volumetricLightingV1058.active&&(groundFogEnabled||lightsEnabled),
      led:ledWallV1059.active},
  });
  const coordinatedSpotsV1060=choreographyV1060.active&&cinematicLightingV1056.active?
    {...cinematicLightingV1056,gainA:cinematicLightingV1056.gainA*choreographyV1060.spots,
      gainB:cinematicLightingV1056.gainB*choreographyV1060.spots}:cinematicLightingV1056;
  const coordinatedLasersV1060=choreographyV1060.active&&intelligentLaserV1057.active?
    {...intelligentLaserV1057,fanGain:intelligentLaserV1057.fanGain*choreographyV1060.lasers,
      beamGain:intelligentLaserV1057.beamGain*choreographyV1060.lasers}:intelligentLaserV1057;
  const coordinatedVolumeV1060=choreographyV1060.active&&volumetricLightingV1058.active?
    {...volumetricLightingV1058,
      beamOpacity:.075+(volumetricLightingV1058.beamOpacity-.075)*choreographyV1060.fog,
      fogGain:1+(volumetricLightingV1058.fogGain-1)*choreographyV1060.fog}:volumetricLightingV1058;
  const coordinatedLedV1060=choreographyV1060.active&&ledWallV1059.active?
    {...ledWallV1059,gain:ledWallV1059.gain*choreographyV1060.led}:ledWallV1059;
  const audienceCueV1044=planArenaAudienceV1044({
    enabled:audienceDirectorEnabled&&showDesignerEnabled&&showDirectorEnabled,show:showCueV1040,
    stageIsArena:true,playing:isPlaying,reducedMotion,phoneEnabled:phoneSyncEnabled&&audienceEnabled,
    phoneMode,performanceTier:getActivePerformanceTier(),trackId,progressMs,strength:audienceDirectorStrength,
    genre:showCueV1040.active&&showPlan?showPlan.genre:genre,
  });
  // V1051: crowd-only animation layered after the existing composed show cue.
  // It does not alter lasers, camera, show plan, real audio or Govee commands.
  const plannedCrowdV1051=planCrowdExperienceV1051({
    enabled:crowdExperienceEnabledV1051&&showDesignerEnabled&&showDirectorEnabled,
    stageIsArena:true,playing:isPlaying,reducedMotion,reactive,audienceEnabled,
    show:showCueV1040,trackId,progressMs,durationMs,strength:crowdExperienceStrengthV1051,
    performanceTier:getActivePerformanceTier(),
  });
  const crowdCueV1051=plannedCrowdV1051.active&&ultimateConcertV1052.active?
    {...plannedCrowdV1051,gain:plannedCrowdV1051.gain*ultimateConcertV1052.crowdGain}:plannedCrowdV1051;
  const atmosphereV1045=planArenaAtmosphereDirectorV1045({
    enabled:atmosphereDirectorEnabled&&showDesignerEnabled&&showDirectorEnabled,
    playing:isPlaying,reducedMotion,reactive,show:showCueV1040,showPlan,
    progressMs,durationMs,strength:atmosphereDirectorStrength,performanceTier:getActivePerformanceTier(),
  });
  const finaleV1046=planArenaCinematicFinaleV1046({
    enabled:cinematicFinaleEnabled&&showDesignerEnabled&&showDirectorEnabled,
    playing:isPlaying,reducedMotion,reactive,show:showCueV1040,trackId,
    progressMs,durationMs,strength:cinematicFinaleStrength,
    performanceTier:getActivePerformanceTier(),
  });
  const immersiveV1047=planArenaImmersionV1047({
    enabled:immersiveEnabled&&showDesignerEnabled&&showDirectorEnabled,
    stageIsArena:true,playing:isPlaying,reducedMotion,reactive,show:showCueV1040,
    trackId,progressMs,durationMs,strength:immersiveStrength,
    genre:showCueV1040.active&&showPlan?showPlan.genre:genre,
    performanceTier:getActivePerformanceTier(),
  });
  // Enhance existing synchronized phone lights only if the V1044 director was enabled.
  // The manually selected phone modes, tier restrictions and safety gates still win.
  const finalAudienceCue=audienceCueV1044.active&&finaleV1046.active?
    {...audienceCueV1044,gain:Math.min(.75,audienceCueV1044.gain+finaleV1046.audienceAccent)}:
    audienceCueV1044;
  // The existing phone-light director stays independent; only its opt-in cue gets dimmed.
  const coordinatedAudienceCue=finalAudienceCue.active&&ultimateConcertV1052.active?
    {...finalAudienceCue,gain:finalAudienceCue.gain*ultimateConcertV1052.crowdGain}:finalAudienceCue;
  const plannedIntensity=showCueV1040.active?Math.min(showIntensity,showCueV1040.intensity):showIntensity;
  const plannedDeck=showCueV1040.active&&transformingDeckMode==='auto'?showCueV1040.deck:transformingDeckMode;
  const plannedFloat=showCueV1040.active&&floatingStageMode==='auto'?showCueV1040.floating:floatingStageMode;
  const plannedLasers=showCueV1040.active&&hologramPattern==='auto'?showCueV1040.lasers:hologramPattern;
  const plannedHoloStrength=showCueV1040.active?Math.min(hologramStrength,showCueV1040.intensity):hologramStrength;
  const plannedDeckStrength=showCueV1040.active?Math.min(transformingDeckStrength,showCueV1040.intensity):transformingDeckStrength;
  const plannedFloatStrength=showCueV1040.active?Math.min(floatingStageIntensity,showCueV1040.intensity):floatingStageIntensity;
  const plannedGenre=showCueV1040.active&&showPlan?showPlan.genre:genre;
  const cueV1035=planArenaTimelineV1035({enabled:fullSongDirectorEnabled&&showDirectorEnabled,
    playing:isPlaying,reducedMotion,reactive,progressMs,durationMs,section,
    energy:audio.energyEnvelope,intensity:plannedIntensity});

  // One instance batch instead of 32 separate geometries/draw calls.
  useLayoutEffect(()=>{
    if(!leds.current)return;
    for(let i=0;i<LED_COUNT;i++){
      const a=TAU*i/LED_COUNT;
      dummy.position.set(Math.cos(a)*2.35,-1.788,Math.sin(a)*2.35);
      dummy.rotation.set(0,-a,0);
      dummy.scale.set(1,1,1);
      dummy.updateMatrix();
      leds.current.setMatrixAt(i,dummy.matrix);
      leds.current.setColorAt(i,i%4<2?blue:pink);
    }
    leds.current.instanceMatrix.needsUpdate=true;
    if(leds.current.instanceColor)leds.current.instanceColor.needsUpdate=true;
    leds.current.computeBoundingSphere();
  },[dummy,blue,pink]);

  useFrame((_,delta)=>{
    sharedPeak.current=stepArenaPeakV1036(sharedPeak.current,delta,{
      enabled:arenaPeaksEnabled&&showDirectorEnabled&&fullSongDirectorEnabled,
      playing:isPlaying,reducedMotion,reactive,section,beat:audio.beat,
      beatStrength:audio.beatStrength,energy:audio.energyEnvelope,progressMs,durationMs,
    });
    if(!turntable.current)return;
    turntable.current.rotation.y=stepArenaRotationV1031(turntable.current.rotation.y,delta,{
      playing:isPlaying,reducedMotion,enabled:rotationEnabled,speedDegPerMinute:speed,
      bass:audio.bass??audio.energyEnvelope,reactive,
    });
    scenicState.current=stepArenaLiftV1034(scenicState.current,delta,{
      enabled:showDirectorEnabled&&secondLevelEnabled,playing:isPlaying,reducedMotion,
      reactive,section,energy:audio.energyEnvelope??audio.bass,
    });
    if(scenicTier.current){
      scenicTier.current.position.y=scenicState.current.height;
      scenicTier.current.rotation.y=scenicState.current.rotation;
    }
    if(glow.current){
      const bass=reactive&&isPlaying&&!reducedMotion?Math.max(0,Math.min(1,audio.bass??0)):0;
      const tier=getActivePerformanceTier();
      const scale=tier==='low'||reducedMotion?1:1+bass*.035+(finaleV1046.active?finaleV1046.deckAccent:0);
      glow.current.scale.set(scale,1,scale);
    }
  });

  return <group name="v1031-360-arena">
    {/* A fixed dark arena surrounding the moving platform. */}
    <mesh position={[0,-2.085,0]} rotation={[-Math.PI/2,0,0]}>
      <circleGeometry args={[8.4,64]}/>
      <meshStandardMaterial color="#080c1a" metalness={.42} roughness={.7}/>
    </mesh>
    <mesh position={[0,-2.058,0]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[2.8,4.25,80]}/>
      <meshStandardMaterial color="#10182b" metalness={.7} roughness={.35}/>
    </mesh>
    <mesh position={[0,-2.047,0]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[3.13,3.17,80]}/>
      <meshBasicMaterial color="#3371db" transparent opacity={.75} toneMapped={false}/>
    </mesh>
    <mesh position={[0,-2.045,0]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[3.8,3.83,80]}/>
      <meshBasicMaterial color="#9c56de" transparent opacity={.46} toneMapped={false}/>
    </mesh>
    {/* Stage roof: a stationary circular lighting truss, not a rear wall. */}
    <mesh position={[0,2.95,0]} rotation={[Math.PI/2,0,0]}>
      <torusGeometry args={[3.1,.055,6,64]}/>
      <meshStandardMaterial color="#41516a" metalness={.86} roughness={.32}/>
    </mesh>
    <mesh position={[0,2.91,0]} rotation={[Math.PI/2,0,0]}>
      <torusGeometry args={[2.97,.018,4,64]}/>
      <meshBasicMaterial color="#5b7df0" transparent opacity={.55} toneMapped={false}/>
    </mesh>
    {[0,1,2,3,4,5,6,7].map(i=>{
      const a=TAU*i/8;
      return <group key={i} position={[Math.cos(a)*3.1,2.9,Math.sin(a)*3.1]}>
        <mesh position={[0,-.14,0]}>
          <cylinderGeometry args={[.07,.10,.25,8]}/>
          <meshStandardMaterial color="#1b2439" metalness={.7} roughness={.4}/>
        </mesh>
        <mesh position={[0,-.29,0]} rotation={[-Math.PI/2,0,0]}>
          <circleGeometry args={[.09,10]}/>
          <meshBasicMaterial color={i%2===0?'#3dd9ff':'#ff62d5'} toneMapped={false}/>
        </mesh>
      </group>;
    })}
    {/* Spectators and moving lights stay WORLD-FIXED as the round platform rotates. */}
    <ArenaAudienceV1032 audio={audio} playing={isPlaying} reducedMotion={reducedMotion} enabled={audienceEnabled} reactive={reactive}
      wavesEnabled={wavesEnabled} phoneSyncEnabled={phoneSyncEnabled} phoneMode={phoneMode}
      hookCueEnabled={crowdChantEnabled} progressMs={progressMs} durationMs={durationMs}
      fullSongDirectorEnabled={fullSongDirectorEnabled&&showDirectorEnabled} showIntensity={showIntensity} section={section}
      audienceCueV1044={coordinatedAudienceCue} crowdCueV1051={crowdCueV1051}/>
    <ArenaLedDomeV1033 audio={audio} playing={isPlaying} reducedMotion={reducedMotion} enabled={domeEnabled} reactive={reactive}/>
    <ArenaLedWallV1059 audio={audio} playing={isPlaying} reducedMotion={reducedMotion}
      cue={coordinatedLedV1060} progressMs={progressMs}/>
    <ArenaSkyFormationV1034 audio={audio} section={section} playing={isPlaying} reducedMotion={reducedMotion}
      enabled={skyFormationEnabled} directorEnabled={showDirectorEnabled} reactive={reactive}
      showAmbience={fullSongDirectorEnabled?cueV1035.ambience:undefined}/>
    <ArenaLedColumnsV1035 audio={audio} playing={isPlaying} reducedMotion={reducedMotion} reactive={reactive}
      enabled={ledColumnsEnabled} directorEnabled={fullSongDirectorEnabled&&showDirectorEnabled}
      progressMs={progressMs} durationMs={durationMs} section={section} intensity={plannedIntensity}/>
    <ArenaVirtualPyroV1035 audio={audio} playing={isPlaying} reducedMotion={reducedMotion} reactive={reactive}
      enabled={virtualPyroEnabled} directorEnabled={fullSongDirectorEnabled&&showDirectorEnabled}
      progressMs={progressMs} durationMs={durationMs} section={section} intensity={plannedIntensity}/>
    <ArenaLaserFansV1036 audio={audio} playing={isPlaying} reducedMotion={reducedMotion} reactive={reactive}
      enabled={lasersEnabled} directorEnabled={showDirectorEnabled} section={section}
      progressMs={progressMs} durationMs={durationMs} intensity={plannedIntensity} peakRef={sharedPeak} atmosphereV1045={atmosphereV1045} finaleV1046={finaleV1046}
      laserCueV1057={coordinatedLasersV1060}/>
    <ArenaMovingLedSkyV1036 audio={audio} playing={isPlaying} reducedMotion={reducedMotion} reactive={reactive}
      enabled={movingSkyEnabled} directorEnabled={showDirectorEnabled} section={section}
      progressMs={progressMs} durationMs={durationMs} intensity={plannedIntensity} peakRef={sharedPeak} atmosphereV1045={atmosphereV1045}/>
    <ArenaLowFogV1036 audio={audio} playing={isPlaying} reducedMotion={reducedMotion} reactive={reactive}
      enabled={groundFogEnabled} directorEnabled={showDirectorEnabled} section={section}
      progressMs={progressMs} durationMs={durationMs} intensity={plannedIntensity} peakRef={sharedPeak} atmosphereV1045={atmosphereV1045}
      volumetricCueV1058={volumetricLightingEnabledV1058?coordinatedVolumeV1060:undefined}/>
    <ArenaImmersiveExperienceV1047 cue={immersiveV1047}
      hologramsEnabled={hologramsEnabled&&showDirectorEnabled}
      lasersEnabled={laserArchitectureEnabled&&lasersEnabled&&showDirectorEnabled}/>
    <ArenaCinematicFinaleV1046 cue={finaleV1046} audio={audio} trackId={trackId}
      playing={isPlaying} reducedMotion={reducedMotion}/>
    <ArenaHologramPortalsV1039 audio={audio} playing={isPlaying} reducedMotion={reducedMotion}
      reactive={reactive} enabled={hologramsEnabled&&showDirectorEnabled}
      genre={plannedGenre} section={section} pattern={plannedLasers} strength={plannedHoloStrength}/>
    <ArenaLaserTunnelsV1039 audio={audio} playing={isPlaying} reducedMotion={reducedMotion}
      reactive={reactive} enabled={laserArchitectureEnabled&&showDirectorEnabled&&lasersEnabled}
      genre={plannedGenre} section={section} pattern={plannedLasers} strength={plannedHoloStrength}
      laserCueV1057={coordinatedLasersV1060}/>
    <ArenaFloatingPlatformsV1038 audio={audio} playing={isPlaying} reducedMotion={reducedMotion}
      reactive={reactive} enabled={floatingStageEnabled} mode={plannedFloat}
      intensity={plannedFloatStrength} section={section}/>
    <ArenaLightsV1032 audio={audio} playing={isPlaying} reducedMotion={reducedMotion}
      enabled={lightsEnabled} dropEnabled={dropEnabled} reactive={reactive}
      lightCueV1056={coordinatedSpotsV1060}
      volumetricCueV1058={volumetricLightingEnabledV1058?coordinatedVolumeV1060:undefined}/>
    {/* The turntable and the performer root share precisely the same transform. */}
    <group ref={turntable} name="v1031-rotating-platform-and-cast">
      <mesh position={[0,-1.99,0]}>
        <cylinderGeometry args={[2.76,2.83,.29,64]}/>
        <meshStandardMaterial color="#151b2b" metalness={.82} roughness={.32}/>
      </mesh>
      <mesh position={[0,-1.833,0]} rotation={[-Math.PI/2,0,0]}>
        <circleGeometry args={[2.74,64]}/>
        <meshStandardMaterial color="#202b41" metalness={.62} roughness={.3}/>
      </mesh>
      <mesh position={[0,-1.825,0]} rotation={[-Math.PI/2,0,0]}>
        <ringGeometry args={[.63,.66,64]}/>
        <meshBasicMaterial color="#d9fcff" transparent opacity={.48} toneMapped={false}/>
      </mesh>
      <group ref={glow}>
        <mesh position={[0,-1.816,0]} rotation={[-Math.PI/2,0,0]}>
          <ringGeometry args={[2.58,2.70,64]}/>
          <meshBasicMaterial color="#20cfff" transparent opacity={.92} toneMapped={false}/>
        </mesh>
        <mesh position={[0,-1.811,0]} rotation={[-Math.PI/2,0,0]}>
          <ringGeometry args={[2.40,2.44,64]}/>
          <meshBasicMaterial color="#f15cf0" transparent opacity={.75} toneMapped={false}/>
        </mesh>
      </group>
      <instancedMesh ref={leds} args={[undefined,undefined,LED_COUNT]} name="v1031-turntable-led-segments" frustumCulled={false}>
        <boxGeometry args={[.10,.012,.30]}/>
        <meshBasicMaterial color="#ffffff" toneMapped={false}/>
      </instancedMesh>
      {secondLevelEnabled && <group ref={scenicTier} name="v1034-independent-scenic-lift-ring">
        {/* A separate annular lift: no performer rigs move, and the center remains clear. */}
        <mesh position={[0,-1.805,0]} rotation={[-Math.PI/2,0,0]}>
          <ringGeometry args={[2.03,2.38,64]}/>
          <meshStandardMaterial color="#19243d" metalness={.74} roughness={.28}/>
        </mesh>
        <mesh position={[0,-1.793,0]} rotation={[-Math.PI/2,0,0]}>
          <ringGeometry args={[2.28,2.35,64]}/>
          <meshBasicMaterial color="#7e9fff" toneMapped={false} transparent opacity={.65}/>
        </mesh>
        {[0,1,2,3,4,5,6,7].map(i=>{
          const a=TAU*i/8;
          return <mesh key={i} position={[Math.cos(a)*2.18,-1.783,Math.sin(a)*2.18]} rotation={[0,-a,0]}>
            <boxGeometry args={[.11,.016,.33]}/>
            <meshBasicMaterial color={i%2===0?"#6bdfff":"#ed72e9"} toneMapped={false}/>
          </mesh>;
        })}
      </group>}
      <ArenaTransformingDeckV1037 audio={audio} playing={isPlaying} reducedMotion={reducedMotion} reactive={reactive}
        enabled={transformingDeckEnabled} mode={plannedDeck} strength={plannedDeckStrength} section={section}/>
      {children}
    </group>
  </group>;
}
