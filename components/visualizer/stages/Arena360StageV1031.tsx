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
import {planLaserExperienceV1080} from "@/lib/arena360LaserExperienceV1080";
import {planVolumetricLightingV1058} from '@/lib/arena360VolumetricLightingV1058';
import {planLedWallV1059,type LedWallPatternV1059} from '@/lib/arena360LedWallV1059';
import {ArenaLedWallV1059} from './ArenaLedWallV1059';
import {planLedWallExperienceV1083,type LedExperienceModeV1083} from '@/lib/arena360LedWallExperienceV1083';
import {planFestivalAtmosphereV1084,type FestivalModeV1084} from '@/lib/arena360FestivalAtmosphereV1084';
import {ArenaFestivalAtmosphereV1084} from './ArenaFestivalAtmosphereV1084';
import {planProjectionMappingV1085,type ProjectionModeV1085} from '@/lib/arena360ProjectionMappingV1085';
import {planEpicStageTransformationV1086,coordinateEpicStageTransformationV1086,type EpicStageModeV1086} from '@/lib/arena360EpicStageTransformationV1086';
import {ArenaProjectionMappingV1085} from './ArenaProjectionMappingV1085';
import {planUltimateFestivalDropV1087,stepUltimateFestivalDropV1087,INITIAL_ULTIMATE_FESTIVAL_DROP_V1087} from '@/lib/arena360UltimateFestivalDropV1087';
import {ArenaUltimateFestivalDropV1087} from './ArenaUltimateFestivalDropV1087';
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
import {planStageFormationV1066} from '@/lib/arena360TransformingStageV1066';
import {planFloatingExperienceV1067} from '@/lib/arena360FloatingExperienceV1067';
import {planHolographicConcertV1068} from '@/lib/arena360HolographicConcertV1068';
import {planHolographicDancersV1081} from '@/lib/arena360HolographicDancersV1081';
import {planStageArchitectureV1082} from '@/lib/arena360StageArchitectureV1082';
import {ArenaDynamicArchitectureV1082} from './ArenaDynamicArchitectureV1082';
import {planEpicDropV1069} from '@/lib/arena360EpicDropV1069';
import {planUltimateConcertFinaleV1070} from '@/lib/arena360UltimateFinaleV1070';
import {planSmartConcertFlowV1071} from '@/lib/arena360SmartConcertFlowV1071';
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
import {planAudienceExperienceV1073} from '@/lib/arena360AudienceExperienceV1073';
import {planCrowdEnergyV1075} from '@/lib/arena360CrowdEnergyV1075';
import type {AvatarAudienceCueV1074} from '@/lib/arena360AvatarAudienceInteractionV1074';
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
  audienceExperienceEnabledV1073=false,audienceExperienceStrengthV1073=55,avatarAudienceCueV1074,
  crowdEnergyEnabledV1075=false,crowdEnergyStrengthV1075=55,
  ultimateConcertEnabledV1052=false,ultimateConcertStrengthV1052=60,
  cinematicLightingEnabledV1056=false,cinematicLightingStrengthV1056=55,
  intelligentLaserEnabledV1057=false,intelligentLaserStrengthV1057=55,
  volumetricLightingEnabledV1058=false,volumetricLightingStrengthV1058=55,
  ledWallEnabledV1059=false,ledWallStrengthV1059=55,ledWallPatternV1059='auto',
  advancedLedEnabledV1083=false,advancedLedStrengthV1083=55,advancedLedModeV1083='auto',lyricTextV1083='',
  festivalFxEnabledV1084=false,festivalFxStrengthV1084=55,festivalFxModeV1084='auto',
  projectionEnabledV1085=false,projectionStrengthV1085=55,projectionModeV1085='auto',
  epicTransformationEnabledV1086=false,epicTransformationStrengthV1086=55,epicTransformationModeV1086='auto',
  ultimateFestivalDropEnabledV1087=false,ultimateFestivalDropStrengthV1087=55,
  lightingChoreographerEnabledV1060=false,lightingChoreographerStrengthV1060=55,
  transformingStageEnabledV1066=false,transformingStageStrengthV1066=55,
  floatingExperienceEnabledV1067=false,floatingExperienceStrengthV1067=55,
  holographicConcertEnabledV1068=false,holographicConcertStrengthV1068=55,
  holographicDancersEnabledV1081=false,holographicDancersStrengthV1081=55,
  dynamicArchitectureEnabledV1082=false,dynamicArchitectureStrengthV1082=55,
  epicDropEnabledV1069=false,epicDropStrengthV1069=55,
  ultimateFinaleEnabledV1070=false,ultimateFinaleStrengthV1070=55,
  smartConcertFlowEnabledV1071=false,smartConcertFlowStrengthV1071=55,trackId,genre}: {
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
  audienceExperienceEnabledV1073?:boolean;audienceExperienceStrengthV1073?:number;avatarAudienceCueV1074?:AvatarAudienceCueV1074;
  crowdEnergyEnabledV1075?:boolean;crowdEnergyStrengthV1075?:number;
  ultimateConcertEnabledV1052?:boolean;ultimateConcertStrengthV1052?:number;
  cinematicLightingEnabledV1056?:boolean;cinematicLightingStrengthV1056?:number;
  intelligentLaserEnabledV1057?:boolean;intelligentLaserStrengthV1057?:number;
  volumetricLightingEnabledV1058?:boolean;volumetricLightingStrengthV1058?:number;
  ledWallEnabledV1059?:boolean;ledWallStrengthV1059?:number;ledWallPatternV1059?:LedWallPatternV1059;
  advancedLedEnabledV1083?:boolean;advancedLedStrengthV1083?:number;advancedLedModeV1083?:LedExperienceModeV1083;lyricTextV1083?:string;
  festivalFxEnabledV1084?:boolean;festivalFxStrengthV1084?:number;festivalFxModeV1084?:FestivalModeV1084;
  projectionEnabledV1085?:boolean;projectionStrengthV1085?:number;projectionModeV1085?:ProjectionModeV1085;
  epicTransformationEnabledV1086?:boolean;epicTransformationStrengthV1086?:number;epicTransformationModeV1086?:EpicStageModeV1086;
  ultimateFestivalDropEnabledV1087?:boolean;ultimateFestivalDropStrengthV1087?:number;
  lightingChoreographerEnabledV1060?:boolean;lightingChoreographerStrengthV1060?:number;
  transformingStageEnabledV1066?:boolean;transformingStageStrengthV1066?:number;
  floatingExperienceEnabledV1067?:boolean;floatingExperienceStrengthV1067?:number;
  holographicConcertEnabledV1068?:boolean;holographicConcertStrengthV1068?:number;
  holographicDancersEnabledV1081?:boolean;holographicDancersStrengthV1081?:number;
  dynamicArchitectureEnabledV1082?:boolean;dynamicArchitectureStrengthV1082?:number;
  epicDropEnabledV1069?:boolean;epicDropStrengthV1069?:number;
  ultimateFinaleEnabledV1070?:boolean;ultimateFinaleStrengthV1070?:number;
  smartConcertFlowEnabledV1071?:boolean;smartConcertFlowStrengthV1071?:number;
  trackId?:string|null;genre?:string|null;
}){
  const turntable=useRef<Group>(null);
  const scenicTier=useRef<Group>(null);
  const scenicState=useRef({...INITIAL_ARENA_LIFT_V1034});
  const sharedPeak=useRef({...INITIAL_ARENA_PEAK_V1036});
  const ultimateFestivalDropStateV1087=useRef({...INITIAL_ULTIMATE_FESTIVAL_DROP_V1087});
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
  // V1066 remains fully subordinate to the EXISTING V1037 petal renderer:
  // no second RAF/timer, floor transformation, camera or hardware interaction.
  const stageFormationV1066=planStageFormationV1066({
    enabled:transformingStageEnabledV1066,stageIsArena:true,
    playing:isPlaying,reducedMotion,showDesignerEnabled,
    decorEnabled:transformingDeckEnabled&&showDirectorEnabled,
    manualDeckMode:transformingDeckMode,performanceTier:getActivePerformanceTier(),
    progressMs,durationMs,strength:transformingStageStrengthV1066,
    show:showCueV1040,
  });

  const floatingExperienceV1067=planFloatingExperienceV1067({
    enabled:floatingExperienceEnabledV1067,stageIsArena:true,playing:isPlaying,
    reducedMotion,reactive,showDesignerEnabled,showDirectorEnabled,
    floatingEnabled:floatingStageEnabled,floatMode:floatingStageMode,
    performanceTier:getActivePerformanceTier(),progressMs,durationMs,
    strength:floatingExperienceStrengthV1067,show:showCueV1040,
    stageCueV1066:stageFormationV1066,
  });

  const holographicConcertV1068=planHolographicConcertV1068({
    enabled:holographicConcertEnabledV1068,stageIsArena:true,playing:isPlaying,
    reducedMotion,reactive,showDesignerEnabled,showDirectorEnabled,
    hologramsEnabled,portalPattern:hologramPattern,
    performanceTier:getActivePerformanceTier(),progressMs,durationMs,
    strength:holographicConcertStrengthV1068,show:showCueV1040,
    stageCueV1066:stageFormationV1066,floatCueV1067:floatingExperienceV1067,
  });

  // Authored chapters affect optical styling only. A real V287 observed `drop`
  // plus a measured beat edge is mandatory; no planned 'hook' invents a drop.
  const epicDropV1069=planEpicDropV1069({
    enabled:epicDropEnabledV1069,stageIsArena:true,playing:isPlaying,
    reducedMotion,reactive,showDesignerEnabled,showDirectorEnabled,
    observedSection:section,show:showCueV1040,trackId,progressMs,durationMs,
    strength:epicDropStrengthV1069,performanceTier:getActivePerformanceTier(),
    genre:showPlan?.genre??genre,ledPattern:ledWallPatternV1059,
    effects:{finale:cinematicFinaleEnabled&&dropEnabled,led:ledWallEnabledV1059,pyro:virtualPyroEnabled},
  });
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
  // V1070: synchronized final 12% of the same song, using only ALREADY
  // authorized V1066/67/68 stage effects and V1057/59 optical cues.
  const ultimateFinaleV1070=planUltimateConcertFinaleV1070({
    enabled:ultimateFinaleEnabledV1070,stageIsArena:true,playing:isPlaying,
    reducedMotion,reactive,showDesignerEnabled,showDirectorEnabled,
    trackId,progressMs,durationMs,show:showCueV1040,
    strength:ultimateFinaleStrengthV1070,performanceTier:getActivePerformanceTier(),
    channels:{deck:stageFormationV1066.active,floating:floatingExperienceV1067.active,
      holograms:holographicConcertV1068.active,lasers:coordinatedLasersV1060.active&&hologramPattern==='auto',
      led:coordinatedLedV1060.active},
  });
  // V1071: transition-aware, song-clock-only focus for ALREADY ACTIVE effects.
  // It crossfades priority across chapters without touching raw audio or V1070.
  const smartFlowV1071=planSmartConcertFlowV1071({
    enabled:smartConcertFlowEnabledV1071,stageIsArena:true,playing:isPlaying,
    reducedMotion,reactive,showDesignerEnabled,showDirectorEnabled,
    trackId,progressMs,durationMs,show:showCueV1040,plan:showPlan,
    strength:smartConcertFlowStrengthV1071,performanceTier:getActivePerformanceTier(),
    channels:{deck:stageFormationV1066.active&&transformingDeckMode==='auto',
      floating:floatingExperienceV1067.active&&floatingStageMode==='auto',
      holograms:holographicConcertV1068.active&&hologramPattern==='auto',
      lasers:coordinatedLasersV1060.active&&hologramPattern==='auto',
      led:coordinatedLedV1060.active&&ledWallPatternV1059==='auto'},
  });
  const finaleStageV1070=ultimateFinaleV1070.active&&stageFormationV1066.active?
    {...stageFormationV1066,amount:stageFormationV1066.amount*ultimateFinaleV1070.deck}:stageFormationV1066;
  const finaleFloatingV1070=ultimateFinaleV1070.active&&floatingExperienceV1067.active?
    {...floatingExperienceV1067,power:floatingExperienceV1067.power*ultimateFinaleV1070.floating}:floatingExperienceV1067;
  const finaleHologramsV1070=ultimateFinaleV1070.active&&holographicConcertV1068.active?
    {...holographicConcertV1068,power:holographicConcertV1068.power*ultimateFinaleV1070.holograms}:holographicConcertV1068;
  const finaleLasersV1070=ultimateFinaleV1070.active&&coordinatedLasersV1060.active?
    {...coordinatedLasersV1060,fanGain:coordinatedLasersV1060.fanGain*ultimateFinaleV1070.lasers,
      beamGain:coordinatedLasersV1060.beamGain*ultimateFinaleV1070.lasers}:coordinatedLasersV1060;
  const finaleLedV1070=ultimateFinaleV1070.active&&coordinatedLedV1060.active?
    {...coordinatedLedV1060,gain:coordinatedLedV1060.gain*ultimateFinaleV1070.led}:coordinatedLedV1060;
  const flowStageV1071=smartFlowV1071.active&&finaleStageV1070.active?
    {...finaleStageV1070,amount:finaleStageV1070.amount*smartFlowV1071.deck}:finaleStageV1070;
  const flowFloatingV1071=smartFlowV1071.active&&finaleFloatingV1070.active?
    {...finaleFloatingV1070,power:finaleFloatingV1070.power*smartFlowV1071.floating}:finaleFloatingV1070;
  const flowHologramsV1071=smartFlowV1071.active&&finaleHologramsV1070.active?
    {...finaleHologramsV1070,power:finaleHologramsV1070.power*smartFlowV1071.holograms}:finaleHologramsV1070;
  // V1081: lightweight dance cues for world-fixed holographic silhouettes.
  // Neither disabled/manual V1039 portals nor unapproved V1068 channels are enabled.
  // V1082: three multi-level, world-fixed scenic truss layers. Existing
  // manually selected deck modes, reduced motion, pause and low tiers win.
  const dynamicArchitectureV1082=planStageArchitectureV1082({
    enabled:dynamicArchitectureEnabledV1082,stageIsArena:true,
    playing:isPlaying,reducedMotion,reactive,showDesignerEnabled,showDirectorEnabled,
    outerStageEnabled:transformingDeckEnabled,manualDeckMode:transformingDeckMode,
    performanceTier:getActivePerformanceTier(),progressMs,durationMs,
    strength:dynamicArchitectureStrengthV1082,show:showCueV1040,
    beat:audio.beat,beatStrength:audio.beatStrength,energy:audio.energyEnvelope,
  });
  const holographicDancersV1081=planHolographicDancersV1081({
    enabled:holographicDancersEnabledV1081&&holographicConcertEnabledV1068,
    stageIsArena:true,hologramsEnabled,showDesignerEnabled,showDirectorEnabled,
    playing:isPlaying,reducedMotion,reactive,manualPattern:hologramPattern!=='auto',
    performanceTier:getActivePerformanceTier(),progressMs,durationMs,
    strength:holographicDancersStrengthV1081,genre:showPlan?.genre??genre,
    energy:audio.energyEnvelope,beat:audio.beat,beatStrength:audio.beatStrength,
    show:showCueV1040,baseHolograms:flowHologramsV1071,
  });
  const flowLasersV1071=smartFlowV1071.active&&finaleLasersV1070.active?
    {...finaleLasersV1070,fanGain:finaleLasersV1070.fanGain*smartFlowV1071.lasers,
      beamGain:finaleLasersV1070.beamGain*smartFlowV1071.lasers}:finaleLasersV1070;
  // V1080 reuses both existing instanced ray batches; opt-in via V1057's laser control.
  // An explicit V1039 manual pattern takes precedence, and no synthetic drop is assumed.
  const laserExperienceV1080=planLaserExperienceV1080({
    enabled:intelligentLaserEnabledV1057&&lasersEnabled&&showDirectorEnabled&&showDesignerEnabled,
    playing:isPlaying,reducedMotion,reactive,manualPattern:hologramPattern!=='auto',
    performanceTier:getActivePerformanceTier(),progressMs,durationMs,
    director:flowLasersV1071,energy:audio.energyEnvelope,beat:audio.beat,
    beatStrength:audio.beatStrength,strength:intelligentLaserStrengthV1057,
  });
  const flowLedV1071=smartFlowV1071.active&&finaleLedV1070.active?
    {...finaleLedV1070,gain:finaleLedV1070.gain*smartFlowV1071.led}:finaleLedV1070;
  // V1083 modifies EXISTING V1059 pixel colors and optional verified lyric text only.
  // Manual V1059 patterns, paused/reduced motion/low GPU, and unverified drops win.
  const ledExperienceV1083=planLedWallExperienceV1083({
    enabled:advancedLedEnabledV1083&&ledWallEnabledV1059&&showDesignerEnabled&&showDirectorEnabled,
    stageIsArena:true,playing:isPlaying,reducedMotion,reactive,
    performanceTier:getActivePerformanceTier(),manualPattern:ledWallPatternV1059,
    mode:advancedLedModeV1083,progressMs,durationMs,show:showCueV1040,
    baseCue:flowLedV1071,strength:advancedLedStrengthV1083,
    observedSection:section,lyricText:lyricTextV1083,
  });
  // V1084: purely virtual FX, bounded particle instances and real beat-edge jets.
  // No scheduled hook/segment alone can trigger CO2; existing fog switch wins.
  const festivalCueV1084=planFestivalAtmosphereV1084({
    enabled:festivalFxEnabledV1084,stageIsArena:true,playing:isPlaying,reducedMotion,reactive,
    performanceTier:getActivePerformanceTier(),showDesignerEnabled,showDirectorEnabled,
    show:showCueV1040,progressMs,durationMs,strength:festivalFxStrengthV1084,
    mode:festivalFxModeV1084,observedSection:section,genre:showPlan?.genre??genre,
    fogEnabled:groundFogEnabled,
  });
  // V1085: song-clock deterministic optical patterns, never real projectors.
  // The floor is in the rotating cast group; satellites/architecture are world-fixed.
  const projectionCueV1085=planProjectionMappingV1085({
    enabled:projectionEnabledV1085,stageIsArena:true,playing:isPlaying,reducedMotion,reactive,
    showDesignerEnabled,showDirectorEnabled,performanceTier:getActivePerformanceTier(),
    progressMs,durationMs,strength:projectionStrengthV1085,mode:projectionModeV1085,
    show:showCueV1040,beat:audio.beat,beatStrength:audio.beatStrength,energy:audio.energyEnvelope,
    floorEnabled:true,satellitesEnabled:floatingStageEnabled,
    sceneryEnabled:dynamicArchitectureEnabledV1082&&dynamicArchitectureV1082.active,
  });
  // V1086 coordinates EXISTING active, manually unmodified optical channels.
  // No additional geometry or independent clock. A low tier, pause, manual
  // pattern, missing chapter or insufficient enabled channels turns it off.
  const epicTransformationCueV1086=planEpicStageTransformationV1086({
    enabled:epicTransformationEnabledV1086,stageIsArena:true,playing:isPlaying,
    reducedMotion,reactive,showDesignerEnabled,showDirectorEnabled,
    performanceTier:getActivePerformanceTier(),progressMs,durationMs,
    strength:epicTransformationStrengthV1086,mode:epicTransformationModeV1086,
    show:showCueV1040,
    channels:{
      architecture:dynamicArchitectureV1082.active&&transformingDeckMode==='auto',
      laser:laserExperienceV1080.active&&hologramPattern==='auto',
      led:ledExperienceV1083.active&&advancedLedModeV1083==='auto'&&ledWallPatternV1059==='auto',
      holograms:flowHologramsV1071.active&&hologramPattern==='auto',
      projection:projectionCueV1085.active&&projectionModeV1085==='auto',
    },
  });
  const epicTransformedV1086=coordinateEpicStageTransformationV1086(epicTransformationCueV1086,{
    architecture:dynamicArchitectureV1082,laser:laserExperienceV1080,
    led:ledExperienceV1083,holograms:flowHologramsV1071,projection:projectionCueV1085,
  });
  // V1087: one measured beat-edge envelope shared by all existing virtual FX.
  // Authored hooks alone cannot fire; manual patterns and individual OFF switches win.
  const ultimateFestivalDropCueV1087=planUltimateFestivalDropV1087({
    enabled:ultimateFestivalDropEnabledV1087,stageIsArena:true,playing:isPlaying,
    reducedMotion,reactive,showDesignerEnabled,showDirectorEnabled,
    performanceTier:getActivePerformanceTier(),observedSection:section,
    show:showCueV1040,progressMs,durationMs,strength:ultimateFestivalDropStrengthV1087,
    channels:{shockwave:dropEnabled,
      laser:lasersEnabled&&hologramPattern==='auto',
      led:ledWallEnabledV1059&&flowLedV1071.active&&ledWallPatternV1059==='auto',
      confetti:festivalCueV1084.active&&festivalCueV1084.confetti>.02},
  });
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
  // V1073 uses the existing instanced audience: no second animation clock or hardware actions.
  const audienceExperienceV1073=planAudienceExperienceV1073({
    enabled:audienceExperienceEnabledV1073,stageIsArena:true,audienceEnabled,
    phoneEnabled:phoneSyncEnabled,phoneMode,showDesignerEnabled,showDirectorEnabled,
    playing:isPlaying,reducedMotion,reactive,performanceTier:getActivePerformanceTier(),
    show:showCueV1040,trackId,progressMs,durationMs,strength:audienceExperienceStrengthV1073,
    observedSection:section,genre:showPlan?.genre??genre,
  });
  // V1075: one shared optical cue on the existing crowd update clock.
  const crowdEnergyV1075=planCrowdEnergyV1075({
    enabled:crowdEnergyEnabledV1075,stageIsArena:true,audienceEnabled,
    showDesignerEnabled,showDirectorEnabled,playing:isPlaying,reducedMotion,reactive,
    phoneMode,performanceTier:getActivePerformanceTier(),show:showCueV1040,
    trackId,progressMs,durationMs,strength:crowdEnergyStrengthV1075,
    observedSection:section,
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
    ultimateFestivalDropStateV1087.current=stepUltimateFestivalDropV1087(
      ultimateFestivalDropStateV1087.current,delta,ultimateFestivalDropCueV1087,audio,progressMs,trackId);
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
      audienceCueV1044={coordinatedAudienceCue} crowdCueV1051={crowdCueV1051}
      audienceCueV1073={audienceExperienceV1073} avatarAudienceCueV1074={avatarAudienceCueV1074}
      crowdEnergyCueV1075={crowdEnergyV1075}/>
    <ArenaLedDomeV1033 audio={audio} playing={isPlaying} reducedMotion={reducedMotion} enabled={domeEnabled} reactive={reactive}/>
    <ArenaLedWallV1059 audio={audio} playing={isPlaying} reducedMotion={reducedMotion}
      cue={flowLedV1071} progressMs={progressMs} experienceCueV1083={epicTransformedV1086.led}
      epicDropCueV1069={epicDropV1069} ultimateFestivalDropCueV1087={ultimateFestivalDropCueV1087}
      ultimateFestivalDropStateV1087={ultimateFestivalDropStateV1087}/>
    <ArenaSkyFormationV1034 audio={audio} section={section} playing={isPlaying} reducedMotion={reducedMotion}
      enabled={skyFormationEnabled} directorEnabled={showDirectorEnabled} reactive={reactive}
      showAmbience={fullSongDirectorEnabled?cueV1035.ambience:undefined}/>
    <ArenaLedColumnsV1035 audio={audio} playing={isPlaying} reducedMotion={reducedMotion} reactive={reactive}
      enabled={ledColumnsEnabled} directorEnabled={fullSongDirectorEnabled&&showDirectorEnabled}
      progressMs={progressMs} durationMs={durationMs} section={section} intensity={plannedIntensity}/>
    <ArenaVirtualPyroV1035 audio={audio} playing={isPlaying} reducedMotion={reducedMotion} reactive={reactive}
      enabled={virtualPyroEnabled} directorEnabled={fullSongDirectorEnabled&&showDirectorEnabled}
      progressMs={progressMs} durationMs={durationMs} section={section} intensity={plannedIntensity}
      epicDropCueV1069={epicDropV1069}/>
    <ArenaLaserFansV1036 audio={audio} playing={isPlaying} reducedMotion={reducedMotion} reactive={reactive}
      enabled={lasersEnabled} directorEnabled={showDirectorEnabled} section={section}
      progressMs={progressMs} durationMs={durationMs} intensity={plannedIntensity} peakRef={sharedPeak} atmosphereV1045={atmosphereV1045} finaleV1046={finaleV1046}
      laserCueV1057={flowLasersV1071} laserExperienceCueV1080={epicTransformedV1086.laser}
      ultimateFestivalDropCueV1087={ultimateFestivalDropCueV1087}
      ultimateFestivalDropStateV1087={ultimateFestivalDropStateV1087}/>
    <ArenaMovingLedSkyV1036 audio={audio} playing={isPlaying} reducedMotion={reducedMotion} reactive={reactive}
      enabled={movingSkyEnabled} directorEnabled={showDirectorEnabled} section={section}
      progressMs={progressMs} durationMs={durationMs} intensity={plannedIntensity} peakRef={sharedPeak} atmosphereV1045={atmosphereV1045}/>
    <ArenaLowFogV1036 audio={audio} playing={isPlaying} reducedMotion={reducedMotion} reactive={reactive}
      enabled={groundFogEnabled} directorEnabled={showDirectorEnabled} section={section}
      progressMs={progressMs} durationMs={durationMs} intensity={plannedIntensity} peakRef={sharedPeak} atmosphereV1045={atmosphereV1045}
      volumetricCueV1058={volumetricLightingEnabledV1058?coordinatedVolumeV1060:undefined} festivalCueV1084={festivalCueV1084}/>
    {festivalCueV1084.active && <ArenaFestivalAtmosphereV1084 cue={festivalCueV1084} audio={audio} progressMs={progressMs}
      ultimateFestivalDropCueV1087={ultimateFestivalDropCueV1087}
      ultimateFestivalDropStateV1087={ultimateFestivalDropStateV1087}/>}
    <ArenaUltimateFestivalDropV1087 cue={ultimateFestivalDropCueV1087} stateRef={ultimateFestivalDropStateV1087}/>
    <ArenaImmersiveExperienceV1047 cue={immersiveV1047}
      hologramsEnabled={hologramsEnabled&&showDirectorEnabled}
      lasersEnabled={laserArchitectureEnabled&&lasersEnabled&&showDirectorEnabled}/>
    <ArenaCinematicFinaleV1046 cue={finaleV1046} audio={audio} trackId={trackId}
      playing={isPlaying} reducedMotion={reducedMotion} progressMs={progressMs}
      epicDropCueV1069={epicDropV1069}/>
    <ArenaHologramPortalsV1039 audio={audio} playing={isPlaying} reducedMotion={reducedMotion}
      reactive={reactive} enabled={hologramsEnabled&&showDirectorEnabled}
      genre={plannedGenre} section={section} pattern={plannedLasers} strength={plannedHoloStrength}
      concertCueV1068={epicTransformedV1086.holograms} dancerCueV1081={holographicDancersV1081}/>
    <ArenaLaserTunnelsV1039 audio={audio} playing={isPlaying} reducedMotion={reducedMotion}
      reactive={reactive} enabled={laserArchitectureEnabled&&showDirectorEnabled&&lasersEnabled}
      genre={plannedGenre} section={section} pattern={plannedLasers} strength={plannedHoloStrength}
      laserCueV1057={flowLasersV1071} laserExperienceCueV1080={epicTransformedV1086.laser}
      ultimateFestivalDropCueV1087={ultimateFestivalDropCueV1087}
      ultimateFestivalDropStateV1087={ultimateFestivalDropStateV1087}/>
    {dynamicArchitectureEnabledV1082 && <ArenaDynamicArchitectureV1082 enabled={dynamicArchitectureEnabledV1082}
      playing={isPlaying} reducedMotion={reducedMotion} cue={epicTransformedV1086.architecture}/>}
    {projectionCueV1085.active&&projectionCueV1085.scenery&&
      <ArenaProjectionMappingV1085 cue={epicTransformedV1086.projection} surface="scenery"/>}
    <ArenaFloatingPlatformsV1038 mappingCueV1085={epicTransformedV1086.projection} audio={audio} playing={isPlaying} reducedMotion={reducedMotion}
      reactive={reactive} enabled={floatingStageEnabled} mode={plannedFloat}
      intensity={plannedFloatStrength} section={section}
      floatingCueV1067={flowFloatingV1071} floatingEnabledV1067={floatingExperienceEnabledV1067&&floatingStageMode==='auto'}/>
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
      {projectionCueV1085.active&&projectionCueV1085.floor&&
        <ArenaProjectionMappingV1085 cue={epicTransformedV1086.projection} surface="floor"/>}
      <ArenaTransformingDeckV1037 audio={audio} playing={isPlaying} reducedMotion={reducedMotion} reactive={reactive}
        enabled={transformingDeckEnabled} mode={plannedDeck} strength={plannedDeckStrength} section={section}
        stageCueV1066={flowStageV1071} stageEnabledV1066={transformingStageEnabledV1066&&transformingDeckMode==='auto'}/>
      {children}
    </group>
  </group>;
}
