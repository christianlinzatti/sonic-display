"use client";
import type {Track} from '@/types/playbackCore';
import {ConcertScenery,type ConcertSceneryGate} from './ConcertScenery';
import {useConcertPresentation} from '../concertPresentation';
import {useCrewSettings} from './useSonicCrew';
import {portraitContrastV1135} from '@/lib/stagePresenceV1135';
import {lyricSpotlightV1133} from '@/lib/lyricSpotlightV1133';
import {useConcertStoryV1131} from './useConcertStoryV1131';
import type {SmartStageCueV351} from "@/services/stageContent/smartStageCompositionV351";
import { useFrame } from "@react-three/fiber";
import {planConcertStageV882,readConcertStageSyncV882,OFF_CONCERT_STAGE_V882,
 type ConcertStageCueV882} from './concertStageSyncV882';
import {ConcertStageFxV882} from './ConcertStageFxV882';
import {planImmersiveConcertFxV1028,mixImmersiveConcertFxV1028} from './immersiveConcertFxV1028';
import {planAiVisualDirectorV1029,mixAiVisualDirectorV1029,VISUAL_LED_UNIFORMS_V1029} from './aiVisualDirectorV1029';
import {planIntelligentConcertAtmosphereV1030,applyConcertAtmosphereCrowdV1030,applyConcertAtmosphereStageV1030} from './intelligentConcertAtmosphereV1030';
import {VirtualPyroStageV891} from './VirtualPyroStageV891';
import {sampleEpicDropV892,DEFAULT_EPIC_DROP_V892} from './epicDropExperienceV892';
import {planPyroV891,PYRO_OFF_V891,DEFAULT_PYRO_V891,type PyroCueV891} from './virtualPyrotechnicsV891';
import {sampleAtmosphereV885,DEFAULT_ATMOSPHERE_V885} from './dynamicConcertAtmosphereV885';
import {planConcertFxV810,normalizeConcertFxV810} from "./concertFxStudioV810";
import type {CoordinatedConcertTransitionV849} from "./intelligentConcertTransitionsV849";
import {applyConcertTransitionGainV849} from "./intelligentConcertTransitionsV849";
import {planSmartFestivalShowV850,dimFestivalLaneV850} from "./smartFestivalShowDirectorV850";
import type {ConcertFxSettingsV810,ConcertFxSectionV810} from "./concertFxStudioV810";
import {LASER_MATRIX_VERTEX_V811} from "./laserMatrixShaderV811";
import {LASER_SHOW_FRAGMENT_V888} from "./laserShowShaderV888";
import {planLaserShowV888,DEFAULT_LASER_SHOW_V888} from "./laserShowDirectorV888";
import {directParticlesV889,DEFAULT_PARTICLE_V889} from "./advancedParticleDirectorV889";
import {LED_WALL_FRAGMENT_V990} from "./livingLedWallShaderV990";
import {planLivingLedWallV990} from "./livingLedWallDirectorV990";
import {createBassImpactStateV991,planBassImpactV991,enhanceBassImpactParticlesV991} from "./bassImpactDirectorV991";
import {BASS_IMPACT_VERTEX_V991,BASS_IMPACT_FRAGMENT_V991} from "./bassImpactShaderV991";
import {planLedWallExperienceV842} from "./ledWallExperiencePlannerV842";
import {planLedWallMotifsV870} from "./ledWallMotifDirectorV870";
import {planLedWallCreativeV886} from "./ledWallCreativeDirectorV886";
import {planLedWallExperienceV821} from "./ledWallExperiencePlannerV821";
import {planBeatAccentDirectorV822} from "./beatAccentDirectorV822";
import {evaluateFxTimelineV823,fxTimelineMultiplierV823} from "./visualFxTimelineV823";
import {planConcertExperienceV828,EXPERIENCE_OFF_V828} from "./concertExperienceDirectorV828";
import type {ConcertExperienceCueV828} from "./concertExperienceDirectorV828";
import {ConcertMomentCrownV828} from "./ConcertMomentCrownV828";
import {planSmartFxShowDirectorV824,mergeSmartFxWithTimelineV824} from "./smartFxShowDirectorV824";
import {applyCameraAwarePerformanceV834} from "./cameraAwarePerformanceV834";
import {createFxPerfStateV825,advanceFxPerfStateV825,planFxPerformanceV825} from "./concertFxPerformanceOptimizerV825";
import {createAutoQualityV827,advanceAutomaticQualityV827,effectiveFxPressureV827} from "./automaticConcertQualityV827";
import {createConcertQualityDirectorV980,advanceConcertQualityDirectorV980,clearAdaptiveQualityV980,qualityPressureV980} from "./concertQualityDirectorV980";
import {createPerformanceIntelligenceV981,analyzeConcertPerformanceV981,clearPerformanceIntelligenceV981} from "./concertPerformanceIntelligenceV981";
import {recordBenchmarkWindowV827} from "./concertBenchmarkV827";
import {recordRealGlbWindowV832} from "./realGlbConcertBenchmarkV832";
import {inspectVisibleCastV830} from "./concertProductionEvidenceV830";
import {makeStageWindowProofV908,publishLiveStageProofV908,clearLiveStageProofV908} from "./liveStageBenchmarkProofV908";
import {recordAcceptanceV829,getAcceptanceV829} from "./concertAcceptanceV829";
import {recordCastWindowV830} from "./concertProductionEvidenceV830";
import {createConcertQualityMonitorV826,accumulateConcertFrameV826,completeConcertQualityV826,publishConcertQualityV826,clearConcertQualityV826} from "./concertQualityTelemetryV826";
import {planLyricsProjectionV813} from "./lyricsProjectionV813";
import {planCinematicProjectionV873} from "./cinematicLyricsPolishV873";
import {planAtmosphericConcertFxV814} from "./atmosphericConcertFxV814";
import {ATMOSPHERE_VERTEX_V814} from "./atmosphereShaderV814";
import {ATMOSPHERE_FRAGMENT_V887} from "./cinematicFogShaderV887";
import {planCinematicFogV887,DEFAULT_FOG_V887} from "./cinematicFogDirectorV887";
import {planArenaCrowdV893,DEFAULT_ARENA_CROWD_V893} from './arenaCrowdAtmosphereV893';
import {VirtualConcertCrowdV815} from "./VirtualConcertCrowdV815";
import {ConcertFlowBridgeV997} from './ConcertFlowBridgeV997';
import {planIntelligentAudienceV874} from "./intelligentAudienceExperienceV874";
import {IntelligentAudienceArmsV874} from "./IntelligentAudienceArmsV874";
import {planSmartFestivalAtmosphereV875} from "./smartFestivalAtmosphereV875";
import type {AudienceCueV874} from "./intelligentAudienceExperienceV874";
import {FestivalWristbandsV875} from "./FestivalWristbandsV875";
import {planDynamicFestivalCrowdChoreographyV876} from "./dynamicFestivalCrowdChoreographyV876";
import {planIntelligentCrowdInteractionV877} from "./intelligentCrowdInteractionV877";
import {planSmartAudienceEmotionV878} from "./smartAudienceEmotionDirectorV878";
import {planCrowdCameraStageHarmonyV879} from "./crowdCameraStageHarmonyV879";
import {planSmartConcertExperienceV880,applyConcertArcCrowdV880,applyConcertArcParticlesV880,applyConcertArcFestivalV880,applyConcertArcFoamV880,concertArcLaneGainV880} from "./smartConcertExperienceV880";
import type {ConcertArcStateV880} from "./smartConcertExperienceV880";
import type {CrowdHarmonyCueV879} from "./crowdCameraStageHarmonyV879";
import type {AudienceEmotionStateV878} from "./smartAudienceEmotionDirectorV878";
import type {CrowdInteractionCueV877} from "./intelligentCrowdInteractionV877";
import type {CrowdChoreographyCueV876} from "./dynamicFestivalCrowdChoreographyV876";
import type {FestivalAtmosphereCueV875} from "./smartFestivalAtmosphereV875";
import {planLivingAudienceV973} from './livingAudienceDirectorV973';
import {planCrowdExperienceV996} from './virtualCrowdExperienceV996';
import {planVirtualConcertCrowdV815,CROWD_OFF_V815} from "./virtualConcertCrowdPlannerV815";
import type {VirtualCrowdCueV815} from "./virtualConcertCrowdPlannerV815";
import {planFestivalSpecialFxV844,mergeFestivalParticlesV844,coordinateFestivalFoamV844,FESTIVAL_OFF_V844} from './festivalSpecialFxPlannerV844';
import {coordinateFestivalFxV871} from './festivalFxCoordinationV871';
import type {FestivalCueV844} from './festivalSpecialFxPlannerV844';
import {FestivalCo2V844} from './FestivalCo2V844';
import {planSoapBubblesV8441,planFullStageFlashV8441,BUBBLES_OFF_V8441,FLASH_OFF_V8441} from './festivalBubblesFlashPlannerV8441';
import type {SoapBubbleCueV8441,FullStageFlashCueV8441} from './festivalBubblesFlashPlannerV8441';
import {SoapBubblesV8441} from './SoapBubblesV8441';
import {FullStageFlashV8441} from './FullStageFlashV8441';
import {planPaperStreamersV846,STREAMERS_OFF_V846} from './festivalPaperStreamersPlannerV846';
import type {PaperStreamersCueV846} from './festivalPaperStreamersPlannerV846';
import {PaperStreamersV846} from './PaperStreamersV846';
import {planFestivalFinaleV847,FINALE_OFF_V847,coordinateFestivalParticlesV847} from './festivalFinalePlannerV847';
import type {FestivalFinaleCueV847} from './festivalFinalePlannerV847';
import {FestivalFinaleV847} from './FestivalFinaleV847';
import {ReactiveParticleStudioV816} from "./ReactiveParticleStudioV816";
import {FoamCannonV817} from "./FoamCannonV817";
import {planFoamExperienceV843} from "./foamExperiencePlannerV843";
import {planFoamCannonV817,FOAM_OFF_V817} from "./foamCannonPlannerV817";
import type {FoamCannonCueV817} from "./foamCannonPlannerV817";
import {KineticStageV817} from "./KineticStageV817";
import {SpectralMusicVisualsV818} from "./SpectralMusicVisualsV818";
import {CinematicSceneTransitionV819} from "./CinematicSceneTransitionV819";
import {VocalAdlibFxV820} from "./VocalAdlibFxV820";
import {planVocalAdlibFxV820,VOCAL_FX_OFF_V820} from "./vocalAdlibFxPlannerV820";
import type {VocalAdlibFxCueV820} from "./vocalAdlibFxPlannerV820";
import {planCinematicTransitionV819,TRANSITION_OFF_V819} from "./cinematicTransitionPlannerV819";
import type {CinematicTransitionCueV819} from "./cinematicTransitionPlannerV819";
import {planSpectralMusicV818,SPECTRAL_OFF_V818} from "./spectralMusicPlannerV818";
import type {SpectralMusicCueV818} from "./spectralMusicPlannerV818";
import {planKineticStageV817,KINETIC_OFF_V817} from "./kineticStagePlannerV817";
import type {KineticStageCueV817} from "./kineticStagePlannerV817";
import {planReactiveParticlesV816,PARTICLES_OFF_V816} from "./reactiveParticlePlannerV816";
import type {ReactiveParticleCueV816} from "./reactiveParticlePlannerV816";
import type {Lyrics} from "@/types/music";
import { useEffect, useRef } from "react";
import { AdditiveBlending as importedAdditiveBlendingV811,Color, Vector3,CanvasTexture,LinearFilter,SRGBColorSpace } from "three";
import {planAdvancedLightChoreographyV793,LIGHT_CHOREOGRAPHY_OFF_V793} from "./advancedLightChoreographerV793";
import {planIntelligentStageLightingV1026} from "./intelligentStageLightingV1026";
import {planProfessionalLightingV841} from "./professionalLightingExperienceV841";
import type {LightChoreographyCueV793} from "./advancedLightChoreographerV793";
import type {EpicPeakCueV794} from "./epicPeakMomentsV794";
import {STAGE_EVOLUTION_OFF_V795} from "./dynamicStageEvolutionV795";
import type {StageEvolutionCueV795} from "./dynamicStageEvolutionV795";
import type {Scene,Object3D} from "three";
import type {VisualizerProps} from "./registry";
import type {MultiVocalSpotlightCueV797} from "./multiVocalSpotlightDirectorV797";
import {concertLightMultiplierV497} from "./cinematicConcertChoreographyV497";
import type {VocalConcertHandoffV498} from "./vocalHandoffDirectorV498";
import {resolveDuetInteractionV376} from "./interactiveVocalDuetsV376";
import {resolveManualVocalCueV385,applyManualVocalCueV385} from "./manualVocalCastingV385";
import type {ConcertShowCueV387} from "./concertShowDirectorV387";
import {resolveConcertCueV386,concertLightAccentV386} from "./expressiveConcertDirectorV386";
import { getLightingPlayback } from "./lightingPlayback";
import {planDynamicStageLightingV762,SCENIC_LIGHTING_OFF_V762} from "./cinematicScenicLightingV762";
import type {DynamicStageLightingSettingsV762,ScenicLightingCueV762} from "./cinematicScenicLightingV762";
import type {CinematicCueV761} from "./cinematicConcertDirectorV761";
import {GOBO_VERTEX_V762,GOBO_FRAGMENT_V762} from "./scenicGoboShaderV762";
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
import {planPerformanceLightingV749,advancePerformanceLightingV749,createPerformanceLightingStateV749,normalizePerformanceLightingV749} from "./performanceLightingDirectorV749";
import type {PerformanceLightingSettingsV749} from "./performanceLightingDirectorV749";
import {planDynamicConcertLightingV608} from "./dynamicConcertLightingV608";
import {planUltimateConcertDramaturgyV623,composeConcertLightingV623} from "./ultimateConcertDramaturgyV623";
import {planAdvancedStageLightingV621} from "./advancedStageLightingV621";
import {planDynamicStageTransformationV622} from "./dynamicStageTransformationV622";
import {planAdaptiveStageTransformationV690} from "./adaptiveStageTransformationV690";
import {planMusicMoodFusionV691} from "./musicMoodFusionV691";
import {planDynamicConcertStagesV635,LED_WALL_VERTEX_V635} from "./dynamicConcertStagesV635";
import {planCinematicStageEnvironmentV647} from "./cinematicStageEnvironmentsV647";
import {getVisualFactorsV640,getVisualLevelV640} from "./adaptiveVisualBudgetV640";
import {getConcertFactorsV999} from "./concertPerformanceGovernorStoreV999";
import {getImmersiveSettingsV1000} from "./immersiveConcertStoreV1000";
import {planImmersiveV1000} from "./immersiveConcertDirectorV1000";
import {limitCrowdV999} from "./intelligentPerformanceGovernorV999";
import {resolveLightingBudgetV772} from "./adaptiveLightingBudgetV772";
import {planGenreConcertV610} from "./genreConcertExperienceV610";
import {planContinuousConcertV611} from "./continuousConcertExperienceV611";
import {planSeamlessConcertTransitionV609} from "./seamlessConcertTransitionsV609";
import type {SceneTransitionCueV791} from "./seamlessSceneTransitionsV791";
import type {NarrativePlanV604,NarrativeCueV604} from "./fullSongConcertDramaturgyV604";
import type { StageSection } from "./stageDirectorV287";
import {combineFestivalGainsV394,type FestivalShowCueV394} from "./festivalShowDirectorV394";
import { ConcertAtmosphereRendererV308 } from "./ConcertAtmosphereRendererV308";
import { ConcertArchitectureV789 } from "./ConcertArchitectureV789";
import {GenreStageArchitectureV894} from './GenreStageArchitectureV894';
import {sampleDirectorV895,DEFAULT_DIRECTOR_V895} from './aiConcertDirectorV895';
import {sampleUltimateV900,DEFAULT_ULTIMATE_V900} from './ultimateConcertExperienceV900';
import {advanceEnergyV896,publishEnergyV896,sampleEnergyV896,DEFAULT_ENERGY_V896,type EnergyStateV896} from './musicalEnergyIntelligenceV896';
import {sampleGenreStageV894,DEFAULT_GENRE_STAGE_V894,GENRE_STAGE_OFF_V894,type GenreStageCueV894} from './ultimateGenreStageV894';
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
  arena360: {base:"#0b1024",primary:"#52ddff",secondary:"#d77eff",floor:"#16223a"},
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
export function DynamicStage({ track,theme = "classic", audio, isPlaying, reducedMotion, reactive = true, strength = 60, genre, musicPalette, showCue, composition, glowGainV353=1, timelineGainV354=1, cinematicCueV497, concertLipSyncV386, concertShowCueV387, concertShowLightingV387=true,concertShowAtmosphereV387=true,festivalShowCueV394,festivalShowLightingV394=true,festivalShowAtmosphereV394=true,festivalShowLasersV394=false,lyricsProtectedV542=false,groupCountV542=1,vocalFocusV542=false,performerLightingV557,cameraNarrativeV605,cameraSectionV608,performanceLightingV749,concertFxV810,lyricsV813,lyricsVisibleV813=false,scenicLightingV762,cinematicCueV761,manualLightingV763=false,transitionV791,transitionV849,epicPeakV794,stageEvolutionV795,vocalSpotlightV797,liveShowV827=false }: {
  track?:Track|null;theme?: StageTheme; audio: AudioFeatures; isPlaying: boolean; reducedMotion: boolean; reactive?: boolean; strength?: number; genre?: string | null; musicPalette?: { primary: string; secondary: string; glow: string }; showCue?: ShowCue; composition?:SmartStageCueV351;glowGainV353?:number; timelineGainV354?:number;cinematicCueV497?:VocalConcertHandoffV498;concertLipSyncV386?:VisualizerProps["lipSync"];concertShowCueV387?:ConcertShowCueV387;concertShowLightingV387?:boolean;concertShowAtmosphereV387?:boolean;festivalShowCueV394?:FestivalShowCueV394;festivalShowLightingV394?:boolean;festivalShowAtmosphereV394?:boolean;festivalShowLasersV394?:boolean;lyricsProtectedV542?:boolean;groupCountV542?:number;vocalFocusV542?:boolean;performerLightingV557?:{settings:ConcertDetailSettingsV555;cue:ConcertDetailsCueV555;scene?:import("./cinematicConcertCoordinationV528").ConcertSceneV528|null;progressMs?:number};cameraNarrativeV605?:{plan:NarrativePlanV604;cue:NarrativeCueV604;manualCamera:boolean};cameraSectionV608?:StageSection;performanceLightingV749?:PerformanceLightingSettingsV749;concertFxV810?:ConcertFxSettingsV810;lyricsV813?:Lyrics|null;lyricsVisibleV813?:boolean;scenicLightingV762?:DynamicStageLightingSettingsV762;cinematicCueV761?:CinematicCueV761;manualLightingV763?:boolean;transitionV791?:SceneTransitionCueV791;transitionV849?:CoordinatedConcertTransitionV849;epicPeakV794?:EpicPeakCueV794;stageEvolutionV795?:StageEvolutionCueV795;vocalSpotlightV797?:MultiVocalSpotlightCueV797;liveShowV827?:boolean;
}) {
  const lyricPriorityV1133=lyricSpotlightV1133(lyricsV813??concertLipSyncV386?.lyrics,concertLipSyncV386?.progressMs??performerLightingV557?.progressMs??0);
  const storyV1131=useConcertStoryV1131({trackId:concertLipSyncV386?.storyTrackIdV1136,playback:concertLipSyncV386?.storyPlaybackV1136,durationMs:concertLipSyncV386?.storyDurationMsV1131,progressMs:concertLipSyncV386?.progressMs??performerLightingV557?.progressMs??0,lyrics:lyricsV813??concertLipSyncV386?.lyrics,genre,bpm:audio.bpm,energy:audio.energyEnvelope,count:groupCountV542,section:lyricsV813?.synced?undefined:cameraSectionV608});
  const concertPresentation=useConcertPresentation(),crewSettings=useCrewSettings();
  const sceneryEnabled=concertPresentation&&crewSettings.scenery===true&&crewSettings.enabled&&crewSettings.mode==='adaptive';
  const sceneryGate=useRef<ConcertSceneryGate>({manual:true,pressure:0,lights:false,pulse:false,tier:'low'});
  const readSceneryGate=()=>({...sceneryGate.current,manual:sceneryGate.current.manual||manualLightingV763||timeline.current.cues.length>0||!reactive||showCue?.lightingEnabled!==undefined&&showCue?.lightingEnabled!==null});
  const palette = palettes[theme];
  const liveStageV882=useRef<ConcertStageCueV882>({...OFF_CONCERT_STAGE_V882});
  const livePyroV891=useRef<PyroCueV891>({...PYRO_OFF_V891});
  const genreStageCueV894=useRef<GenreStageCueV894>({...GENRE_STAGE_OFF_V894});
  const genreStagePrimaryV894=useRef(new Color());
  const genreStageSecondaryV894=useRef(new Color());
  const stageLightTintV1026=useRef(new Color());
  const sceneFlags = sceneDetailFlags(useSceneDetail());
  const key = useRef<PointLight>(null);
  const productionColor=useRef(new Color());
  const targetPrimary = useRef(new Color());
  const targetSecondary = useRef(new Color());
  const atmospherePrimaryV885=useRef(new Color());
  const atmosphereSecondaryV885=useRef(new Color());
  const atmosphereAmbientV885=useRef(new Color());
  // V622: reuse mutable Three colors and the existing stage floor/background.
  const warmTintV622=useRef(new Color('#ffc487'));
  const coolTintV622=useRef(new Color('#77caff'));
  const moodTintV622=useRef(new Color());
  const backgroundTargetV622=useRef(new Color());
  const floorTargetV622=useRef(new Color());
  const floorMaterialV622=useRef<import('three').MeshStandardMaterial>(null);
  // V635: one reusable planar LED wall, never any per-frame mesh/material allocation.
  const ledWallV635=useRef<Mesh>(null);
  const laserMeshV811=useRef<Mesh>(null);
  const lyricsWallV813=useRef<Mesh>(null);
  const lyricsFloorV813=useRef<Mesh>(null);
  const lyricsWallMatV813=useRef<MeshBasicMaterial>(null);
  const lyricsFloorMatV813=useRef<MeshBasicMaterial>(null);
  const lyricsCanvasV813=useRef<HTMLCanvasElement|null>(null);
  const lyricsTextureV813=useRef<CanvasTexture|null>(null);
  const lyricsDrawnV813=useRef('');
  const fxPerfStateV825=useRef(createFxPerfStateV825());
  const autoQualityStateV827=useRef(createAutoQualityV827());
  const qualityDirectorStateV980=useRef(createConcertQualityDirectorV980());
  const performanceIntelligenceV981=useRef(createPerformanceIntelligenceV981());
  const qualityTrackScopeV980=useRef({trackId:'',positionMs:NaN,epoch:0});
  const qualityMonitorV826=useRef(createConcertQualityMonitorV826());
  const qualityPublishedV826=useRef(false);
  const concertArcStateV880=useRef<ConcertArcStateV880|null>(null);
  const crowdCueV815=useRef<VirtualCrowdCueV815>({...CROWD_OFF_V815});
  const audienceEmotionStateV878=useRef<AudienceEmotionStateV878|null>(null);
  const festivalCueV844=useRef<FestivalCueV844>({...FESTIVAL_OFF_V844});
  const soapBubbleCueV8441=useRef<SoapBubbleCueV8441>({...BUBBLES_OFF_V8441});
  const fullStageFlashCueV8441=useRef<FullStageFlashCueV8441>({...FLASH_OFF_V8441});
  const paperStreamersCueV846=useRef<PaperStreamersCueV846>({...STREAMERS_OFF_V846});
  const festivalFinaleCueV847=useRef<FestivalFinaleCueV847>({...FINALE_OFF_V847});
  const particlesCueV816=useRef<ReactiveParticleCueV816>({...PARTICLES_OFF_V816});
  const secondaryTintV828=useRef(new Color());
  const crownCueV828=useRef<ConcertExperienceCueV828>({...EXPERIENCE_OFF_V828});
  const foamCueV817=useRef<FoamCannonCueV817>({...FOAM_OFF_V817});
  const kineticCueV817=useRef<KineticStageCueV817>({...KINETIC_OFF_V817});
  const spectralCueV818=useRef<SpectralMusicCueV818>({...SPECTRAL_OFF_V818});
  const transitionCueV819=useRef<CinematicTransitionCueV819>({...TRANSITION_OFF_V819});
  const vocalFxCueV820=useRef<VocalAdlibFxCueV820>({...VOCAL_FX_OFF_V820});
  const hazeFloorV814=useRef<Mesh>(null);
  const hazeShaftsV814=useRef<Mesh>(null);
  const hazeFloorMatV814=useRef<import('three').ShaderMaterial>(null);
  const hazeShaftsMatV814=useRef<import('three').ShaderMaterial>(null);
  const laserMaterialV811=useRef<import("three").ShaderMaterial>(null);
  const scenicCueV762=useRef<ScenicLightingCueV762>(SCENIC_LIGHTING_OFF_V762);
  const lightChoreographyV793=useRef<LightChoreographyCueV793>(LIGHT_CHOREOGRAPHY_OFF_V793);
  const peakCueRefV794=useRef<EpicPeakCueV794|null>(null);
  const evolutionRefV795=useRef<StageEvolutionCueV795>(STAGE_EVOLUTION_OFF_V795);
  const beamTargetV793=useRef<Object3D>(null);
  const goboMeshV762=useRef<Mesh>(null);
  const goboMaterialV762=useRef<import('three').ShaderMaterial>(null);
  const ledMaterialV635=useRef<import('three').ShaderMaterial>(null);
  const bassImpactMatV991=useRef<import('three').ShaderMaterial>(null);
  const bassImpactMeshV991=useRef<Mesh>(null);
  const bassImpactStateV991=useRef(createBassImpactStateV991());
  // V558 cached neutral portrait temperatures; no per-frame Color allocations.
  const warmPortraitV558 = useRef(new Color('#ffe5d6'));
  const coolDuetV558 = useRef(new Color('#c3d9ff'));
  // V559: smoothed accents, no geometry/shadow/light allocations in render loop.
  const beatAccentV559 = useRef(0);
  const lightingMixV749=useRef(createPerformanceLightingStateV749());
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
  // V813: create ONE canvas/texture for both projection surfaces; dispose on unmount.
  // Drawing happens only on a new timed word, not every animation frame.
  useEffect(()=>{
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;
    const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;
    texture.minFilter=LinearFilter;texture.magFilter=LinearFilter;
    lyricsCanvasV813.current=canvas;lyricsTextureV813.current=texture;
    if(lyricsWallMatV813.current){lyricsWallMatV813.current.map=texture;lyricsWallMatV813.current.needsUpdate=true;}
    if(lyricsFloorMatV813.current){lyricsFloorMatV813.current.map=texture;lyricsFloorMatV813.current.needsUpdate=true;}
    return ()=>{
      if(lyricsWallMatV813.current){lyricsWallMatV813.current.map=null;lyricsWallMatV813.current.needsUpdate=true;}
      if(lyricsFloorMatV813.current){lyricsFloorMatV813.current.map=null;lyricsFloorMatV813.current.needsUpdate=true;}
      lyricsCanvasV813.current=null;lyricsTextureV813.current=null;lyricsDrawnV813.current='';
      texture.dispose();
    };
  },[]);
  const energyStateV896=useRef<EnergyStateV896|null>(null);
  useEffect(()=>()=>{publishEnergyV896(null);clearLiveStageProofV908();clearConcertQualityV826();},[]);
  useFrame((state, delta) => {
    const presetMix = reducedMotion ? 1 : 1-Math.exp(-Math.min(Math.max(delta,0),.1)*2.0);
    activePreset.current.anticipation += (lightingPreset.current.anticipation-activePreset.current.anticipation)*presetMix;
    activePreset.current.kickRollStrength += (lightingPreset.current.kickRollStrength-activePreset.current.kickRollStrength)*presetMix;
    activePreset.current.blackoutStrength += (lightingPreset.current.blackoutStrength-activePreset.current.blackoutStrength)*presetMix;
    const tier = getActivePerformanceTier();
    // V772: switch visibility, not only intensity=0: invisible Three.js lights
    // no longer occupy a shader light slot. Hysteresis is inherited from V640.
    const budgetV772=resolveLightingBudgetV772(tier,getVisualLevelV640(),theme);
    if(key.current)key.current.visible=budgetV772.key;
    if(fill.current)fill.current.visible=budgetV772.fill;
    if(beam.current)beam.current.visible=budgetV772.centerSpot&&sceneFlags.extraLights;
    if(floorLight.current)floorLight.current.visible=budgetV772.floor&&sceneFlags.extraLights;
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
    // V882 – shared real-show clock; no fabricated audio/transient analysis.
    // Respect saved light timelines, intentional blackouts and lyrics protection.
    const liveSignalV882=readConcertStageSyncV882();
    // V1000: optional unified *reduction-only* score. Requires an observed,
    // verified stage scene for this exact song. No new time, audio or device owner.
    const immersiveCueV1000=planImmersiveV1000({
      settings:getImmersiveSettingsV1000(),trackId:playback.trackId??'',
      stageTrackId:liveSignalV882.trackId,durationMs:playback.durationMs,
      sceneStartMs:liveSignalV882.sceneStartMs,section:liveSignalV882.section,
      momentKind:liveSignalV882.momentKind,
      verified:liveSignalV882.sceneSource==='verified',
      playing:isPlaying&&playback.playing&&reactive,
      autoEnabled:liveSignalV882.enabled&&liveSignalV882.sync.stage,
      reducedMotion,manual:!!liveSignalV882.manual||manualLightingV763||authoredLightsV386||
        showCue?.lightingEnabled===false,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      seekBlocked:playback.positionMs<(liveSignalV882.atmosphereSeekBlockedUntilMs??0),
      lyricsProtected:lyricsProtectedV542||lyricsVisibleV813,
      vocalFocus:vocalFocusV542,
    });
    const liveCueV882=planConcertStageV882(liveSignalV882,{
      trackId:playback.trackId,durationMs:playback.durationMs,positionMs:playback.positionMs,
      playing:isPlaying&&playback.playing&&reactive,reducedMotion,tier,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542||vocalFocusV542,
    });
    // V892: one non-strobing, verified cue conductor. Modulate existing
    // post-budget channels only; a disabled renderer remains disabled.
    const epicV892=sampleEpicDropV892({
      settings:liveSignalV882.epicSettingsV892??DEFAULT_EPIC_DROP_V892,
      plan:liveSignalV882.epicPlanV892,trackId:playback.trackId,durationMs:playback.durationMs,
      positionMs:playback.positionMs,playing:isPlaying&&playback.playing&&reactive,
      autoEnabled:liveSignalV882.enabled,reducedMotion,tier,
      seekBlocked:playback.positionMs<(liveSignalV882.atmosphereSeekBlockedUntilMs??0),
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      manualFx:!!liveSignalV882.manual,lyricsProtected:lyricsProtectedV542||lyricsVisibleV813,
      vocalFocus:vocalFocusV542,
    });
    const concertDirectorV895=sampleDirectorV895({
      plan:liveSignalV882.directorPlanV895,
      settings:liveSignalV882.directorSettingsV895??DEFAULT_DIRECTOR_V895,
      trackId:playback.trackId,durationMs:playback.durationMs,positionMs:playback.positionMs,
      playing:isPlaying&&playback.playing&&reactive,autoEnabled:liveSignalV882.enabled,
      reducedMotion,tier,seekBlocked:playback.positionMs<(liveSignalV882.atmosphereSeekBlockedUntilMs??0),
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      manualFx:!!liveSignalV882.manual,manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      lyricsProtected:lyricsProtectedV542,lyricsVisible:lyricsVisibleV813,vocalFocus:vocalFocusV542,
    });
    // V896: consume measured audio only; the verified V895 director remains authoritative.
    energyStateV896.current=advanceEnergyV896(energyStateV896.current,{
      trackId:playback.trackId,durationMs:playback.durationMs,positionMs:playback.positionMs,
      elapsedMs:Math.max(0,Math.min(100,delta*1000)),
      playing:isPlaying&&playback.playing&&reactive&&!reducedMotion&&liveSignalV882.enabled&&
       !!liveSignalV882.directorSettingsV895?.enabled&&tier!=='low'&&!liveSignalV882.manual&&
       !(playback.positionMs<(liveSignalV882.atmosphereSeekBlockedUntilMs??0))&&
       timelineCue.blackout<=0&&timelineCue.strobe<=0&&timelineCue.scale>0&&timelineGainV354>0,
      audio:{energyEnvelope:audio.energyEnvelope,bass:audio.bass,
       attack:audio.attack,kickAccentIntensity:audio.kickAccentIntensity},
    });
    publishEnergyV896(energyStateV896.current);
    const energyCueV896=sampleEnergyV896({
      state:energyStateV896.current,plan:liveSignalV882.directorPlanV895,
      settings:liveSignalV882.energySettingsV896??DEFAULT_ENERGY_V896,
      trackId:playback.trackId,durationMs:playback.durationMs,positionMs:playback.positionMs,
      playing:isPlaying&&playback.playing&&reactive,autoEnabled:liveSignalV882.enabled,
      directorEnabled:!!liveSignalV882.directorSettingsV895?.enabled,
      reducedMotion,tier,seekBlocked:playback.positionMs<(liveSignalV882.atmosphereSeekBlockedUntilMs??0),
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      manualFx:!!liveSignalV882.manual,manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      lyricsProtected:lyricsProtectedV542||vocalFocusV542,lyricsVisible:lyricsVisibleV813,
    });
    // V900: full-song continuity is attenuation-only, sampled from verified V604 scenes.
    // Existing V895 director, real audio and manually authored lanes retain authority.
    const ultimateStageV900=sampleUltimateV900({
      plan:liveSignalV882.ultimatePlanV900,settings:liveSignalV882.ultimateSettingsV900??DEFAULT_ULTIMATE_V900,
      trackId:playback.trackId,durationMs:playback.durationMs,positionMs:playback.positionMs,
      playing:isPlaying&&playback.playing&&reactive,autoEnabled:liveSignalV882.enabled,
      directorEnabled:!!liveSignalV882.directorSettingsV895?.enabled,reducedMotion,tier,
      seekBlocked:playback.positionMs<(liveSignalV882.atmosphereSeekBlockedUntilMs??0),
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      manualFx:!!liveSignalV882.manual,manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      lyricsProtected:lyricsProtectedV542,lyricsVisible:lyricsVisibleV813,vocalFocus:vocalFocusV542,
      energy:energyStateV896.current,
    });
    liveStageV882.current={...liveCueV882,
      ringOpacity:Math.min(.46,liveCueV882.ringOpacity*epicV892.ringGain*concertDirectorV895.stageGain*ultimateStageV900.stageGain),
      beamGain:Math.min(1.3,liveCueV882.beamGain*(liveSignalV882.sync.lights&&liveSignalV882.spotlightSettingsV890?.enabled?epicV892.spotlightGain*concertDirectorV895.lightGain*energyCueV896.lightGain*ultimateStageV900.lightGain:1)),
    };
    const liveAtmosphereV885=sampleAtmosphereV885({
      plan:liveSignalV882.atmospherePlan,settings:liveSignalV882.atmosphereSettings??DEFAULT_ATMOSPHERE_V885,
      trackId:playback.trackId,durationMs:playback.durationMs,positionMs:playback.positionMs,
      playing:isPlaying&&playback.playing&&reactive,reducedMotion,tier,
      autoEnabled:liveSignalV882.enabled,
      seekBlocked:playback.positionMs<(liveSignalV882.atmosphereSeekBlockedUntilMs??0),
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542||vocalFocusV542,manualFx:liveSignalV882.manual!==null,
    });
    // V894: verified genre architecture is optional and remains behind the cast.
    // It never forces manual stage presets, authored colors or extra GPU lights.
    genreStageCueV894.current=sampleGenreStageV894({
      plan:liveSignalV882.genreStagePlanV894,
      settings:liveSignalV882.genreStageSettingsV894??DEFAULT_GENRE_STAGE_V894,
      trackId:playback.trackId,durationMs:playback.durationMs,positionMs:playback.positionMs,
      playing:isPlaying&&playback.playing&&reactive,autoEnabled:liveSignalV882.enabled&&liveSignalV882.sync.stage&&theme!=='minimal',
      genre,reducedMotion,tier,lightsAllowed:liveSignalV882.sync.lights,
      seekBlocked:playback.positionMs<(liveSignalV882.atmosphereSeekBlockedUntilMs??0),
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false||timelineCue.color!==undefined,
      manualFx:!!liveSignalV882.manual,lyricsProtected:lyricsProtectedV542,
      lyricsVisible:lyricsVisibleV813,vocalFocus:vocalFocusV542,
    });
    // The V895 director only scales the existing decorative instance layer.
    if(genreStageCueV894.current.active&&concertDirectorV895.stageGain!==1){
      const current=genreStageCueV894.current;
      genreStageCueV894.current={...current,architectureOpacity:Math.min(.58,current.architectureOpacity*concertDirectorV895.stageGain*ultimateStageV900.stageGain)};
    }
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
    // V749: one bounded, smoothed lighting layer. Saved light timelines and
    // deliberate show/blackout commands beat automatic cues. V551 validates casts.
    const lightingV749=planPerformanceLightingV749({
      settings:performanceLightingV749,cast:lightingV551,
      section:cameraSectionV608??atmosphereSection.current,
      energy:audio.energyEnvelope??audio.bass??0,kick:audio.kickAccentIntensity??0,
      playing:isPlaying&&playback.playing,reactive,reducedMotion,tier,
      authored:authoredLightsV386||showCue?.lightingEnabled===false||!concertShowLightingV387,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542,groupCount:groupCountV542,
      cameraFocus:concertLipSyncV386?.cinematicSceneV528?.active===true,
    });
    const lightingMixV749Now=advancePerformanceLightingV749(lightingMixV749.current,lightingV749,delta,
      normalizePerformanceLightingV749(performanceLightingV749).transitionMs);
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
    // V690: expand the EXISTING scenic depth and color over the verified song arc.
    // Never replace the selected theme or add geometry/lighting/render passes.
    const stageMoodInputV691:import("./adaptiveStageTransformationV690").AdaptiveStageInputV690={
      narrative:cameraNarrativeV605,trackId:playback.trackId,positionMs:playback.positionMs,
      durationMs:playback.durationMs,section:cameraSectionV608??atmosphereSection.current,
      genre,playing:isPlaying&&playback.playing,reactive,reducedMotion,tier,
      authored:authoredLightsV386||showCue?.lightingEnabled===false||!concertShowLightingV387,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,
      visualsEnabled:theme!=='minimal'&&sceneFlags.extraLights,
      groupCount:Math.max(1,Math.min(4,Math.round(groupCountV542)||1)),foundation:transformationV622,
    };
    const stageScaleV690=planAdaptiveStageTransformationV690(stageMoodInputV691);
    const musicMoodV691=planMusicMoodFusionV691(stageMoodInputV691,stageScaleV690);
    // V795 uses exactly the V790 verified scene and SAME playback clock.
    // The real saved light timeline/blackout and manual user controls have final
    // authority. Disabled/low-tier => portal eases back to the original layout.
    const evolveV795=stageEvolutionV795;
    const evolutionAllowedV795=evolveV795?.active===true&&isPlaying&&playback.playing&&reactive&&
      !reducedMotion&&tier!=='low'&&theme!=='minimal'&&sceneFlags.extraLights&&
      !manualLightingV763&&!authoredLightsV386&&showCue?.lightingEnabled!==false&&
      timelineCue.blackout<=0&&timelineCue.strobe<=0&&timelineCue.scale>0&&
      timelineGainV354>0&&evolveV795.trackId===playback.trackId&&
      evolveV795.durationMs===playback.durationMs&&
      playback.positionMs>=evolveV795.sceneStartMs&&
      playback.positionMs<evolveV795.sceneEndMs;
    evolutionRefV795.current=evolutionAllowedV795?evolveV795:STAGE_EVOLUTION_OFF_V795;

    // V762: decorative scenic direction comes solely from verified V761/V604 scenes.
    // Saved lighting cues, blackout, manual theme, low-tier and lyrics readability win.
    const scenicV762=planDynamicStageLightingV762({
      settings:scenicLightingV762,scene:cinematicCueV761,narrative:cameraNarrativeV605,
      trackId:playback.trackId,progressMs:playback.positionMs,genre,
      playing:isPlaying&&playback.playing,reactive,reducedMotion,tier,
      authored:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false||!concertShowLightingV387,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542,visualsEnabled:theme!=='minimal'&&sceneFlags.extraLights,
      ledBudget:getVisualFactorsV640().led,hazeBudget:getVisualFactorsV640().haze,
      energy:audio.energyEnvelope??audio.bass??0,kick:audio.kickAccentIntensity??0,
    });
    scenicCueV762.current=scenicV762;
    if(goboMaterialV762.current){
      goboMaterialV762.current.uniforms.uOpacity.value=scenicV762.goboOpacity;
      goboMaterialV762.current.uniforms.uPattern.value=scenicV762.goboPattern;
      goboMaterialV762.current.uniforms.uPhase.value=scenicV762.goboPhase;
      (goboMaterialV762.current.uniforms.uColor.value as Color).set(musicPalette?.secondary??palette.secondary);
      if(goboMeshV762.current)goboMeshV762.current.visible=scenicV762.goboOpacity>.003;
    }
    // V640: optional LED plane fades to zero before any avatar/lyrics reduction.
    // A zero-opacity plane is also culled by the existing mesh.visible gate.
    const ledBudgetV640=getVisualFactorsV640().led;
    // The LED shader uses playback time, not state.clock, so seeking is deterministic.
    const led=ledMaterialV635.current;
    if(led){
      const mix=1-Math.exp(-Math.min(Math.max(delta,0),.1)*5);
      const o=led.uniforms.uOpacity;
      o.value+=(stageVisualV635.opacity*ledBudgetV640*scenicV762.ledGain-o.value)*mix;
      led.uniforms.uPattern.value=scenicV762.active&&scenicV762.ledGain>1?scenicV762.ledPattern:stageVisualV635.pattern;
      led.uniforms.uPhase.value=stageVisualV635.phase;
      led.uniforms.uSpeed.value=stageVisualV635.speed*ledBudgetV640;
      led.uniforms.uSceneStyle.value=sceneMotifV647.style;
      led.uniforms.uStageMorph.value=Math.min(.75,stageScaleV690.morph+musicMoodV691.morph+(stageVisualV635.active?evolutionRefV795.current.ledMorph:0));
      led.uniforms.uVariation.value=sceneMotifV647.variation;
      led.uniforms.uArchitecture.value=sceneMotifV647.architecture*ledBudgetV640;
      led.uniforms.uDepth.value=sceneMotifV647.depth*ledBudgetV640;
      led.uniforms.uMotion.value=sceneMotifV647.motion*ledBudgetV640;
      (led.uniforms.uPrimary.value as Color).set(musicPalette?.primary??palette.primary);
      (led.uniforms.uSecondary.value as Color).set(musicPalette?.secondary??palette.secondary);
      if(ledWallV635.current)ledWallV635.current.visible=o.value>.004&&
        stageVisualV635.active&&tier!=='low';
    }
    // V810–V812: one verified song authority, same timeline/blackout precedence
    // as the existing V635 LED wall. Unknown sections never become fake drops.
    const verifiedActV810=cameraNarrativeV605?.cue;
    const currentActV810=verifiedActV810?.active?cameraNarrativeV605?.plan.acts[verifiedActV810.act]:undefined;
    const currentSectionV810=currentActV810?.section;
    const fxCueV810=planConcertFxV810({settings:concertFxV810,genre,
      section:(currentSectionV810==='verse'||currentSectionV810==='hook'||currentSectionV810==='build'||currentSectionV810==='drop'||currentSectionV810==='break'?currentSectionV810:'verse') as ConcertFxSectionV810,
      progressMs:playback.positionMs,startMs:currentActV810?.startMs??0,endMs:currentActV810?.endMs??0,
      active:stageVisualV635.active&&theme!=='minimal'&&sceneFlags.extraLights,
      verified:cameraNarrativeV605?.plan.source==='verified-v600'&&verifiedActV810?.source==='verified-v600'&&
        cinematicCueV761?.active===true&&cinematicCueV761.reason==='verified-act'&&
        cameraNarrativeV605.plan.trackId===playback.trackId&&
        cameraNarrativeV605.plan.durationMs===playback.durationMs&&
        cinematicCueV761.actIndex===verifiedActV810.act,
      playing:isPlaying&&playback.playing,reactive,reducedMotion,
      authored:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false||!concertShowLightingV387,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,groupCount:groupCountV542,tier,
      energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,
      bass:audio.bass??0,mids:audio.mids??0,highs:audio.highs??0,
      ledBudget:ledBudgetV640,laserBudget:getVisualFactorsV640().beams});
    // V823 timeline only shapes already-authorized V810 effects. It NEVER forces
    // a disabled renderer on, changes the camera, or bypasses blackout/manual cues.
    const authoredFxV823=evaluateFxTimelineV823({
      cues:concertFxV810?.timelineCuesV823??[],enabled:concertFxV810?.timelineEnabledV823===true,
      trackId:playback.trackId,durationMs:playback.durationMs,progressMs:playback.positionMs,
      verified:fxCueV810.active&&fxCueV810.reason==='music',
      playing:isPlaying&&playback.playing,reducedMotion});
    // V824: dramaturgy follows the SAME verified V604/V761 act and cannot
    // activate blocked FX. The V823 author envelope wins per lane.
    const smartFxV824=planSmartFxShowDirectorV824({settings:concertFxV810,fx:fxCueV810,
      trackId:playback.trackId,startMs:currentActV810?.startMs??0,endMs:currentActV810?.endMs??0,
      progressMs:playback.positionMs,tier,lyricsProtected:lyricsProtectedV542,
      vocalFocus:vocalFocusV542,groupCount:groupCountV542});
    const smartMixV824=mergeSmartFxWithTimelineV824(smartFxV824,authoredFxV823);
    // V850: repeat-aware dramaturgy for the SAME verified act, not a new
    // controller of song structure, camera, dancers or manual FX timelines.
    const authoredLanesV850=(['laser','led','particles','foam','transition'] as const).filter(lane=>
      authoredFxV823[lane].boost>.001||authoredFxV823[lane].mute>.001);
    const festivalShowV850=planSmartFestivalShowV850({settings:concertFxV810,fx:fxCueV810,
      trackId:playback.trackId,actIndex:verifiedActV810?.act??-1,
      actStartMs:currentActV810?.startMs??0,actEndMs:currentActV810?.endMs??0,
      progressMs:playback.positionMs,playing:isPlaying&&playback.playing,reactive,reducedMotion,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,
      groupCount:groupCountV542,tier,budget:getVisualFactorsV640().led,
      authoredLanes:authoredLanesV850,
      songArcV868:cameraNarrativeV605?.plan.source==='verified-v600'&&
        cameraNarrativeV605.plan.trackId===playback.trackId&&
        cameraNarrativeV605.plan.durationMs===playback.durationMs
          ?cameraNarrativeV605.plan:null});
    // V828: visual staging of this verified musical act. Alternating motifs,
    // negative space and background atmosphere, without any new draw calls,
    // camera cuts, guessed drops or bypass of V823 user-authored cues.
    const experienceV828=planConcertExperienceV828({settings:concertFxV810,fx:fxCueV810,
      authored:authoredFxV823,trackId:playback.trackId,
      startMs:currentActV810?.startMs??0,endMs:currentActV810?.endMs??0,
      progressMs:playback.positionMs,tier,lyricsProtected:lyricsProtectedV542,
      vocalFocus:vocalFocusV542,groupCount:groupCountV542});
    // V825: observed R3F frame cadence (not GPU milliseconds) drives gradual,
    // prioritized shedding. Expensive stage layers yield before vocal/LED. No new draw calls.
    advanceFxPerfStateV825(fxPerfStateV825.current,delta,
      fxCueV810.reason==='music'&&concertFxV810?.perfOptimizerV825!==false&&isPlaying,
      tier==='balanced'?30:60);
    const qualityEnabledV980=concertFxV810?.concertQualityDirectorV980===true&&liveShowV827&&
      concertFxV810?.qualityDashboardV826!==false&&concertFxV810?.perfOptimizerV825!==false&&
      (tier!=='low'||concertFxV810?.concertQualityPiV980===true);
    const fxPressureV980=qualityEnabledV980?
      qualityPressureV980(fxPerfStateV825.current.pressure,qualityDirectorStateV980.current,true):
      effectiveFxPressureV827(fxPerfStateV825.current.pressure,
        autoQualityStateV827.current,liveShowV827&&concertFxV810?.qualityDashboardV826!==false&&concertFxV810?.autoQualityV827!==false&&concertFxV810?.perfOptimizerV825!==false);
    const fxPerfV825=planFxPerformanceV825({settings:concertFxV810,fx:fxCueV810,tier,
      pressure:fxPressureV980,
      lyricsProtected:lyricsProtectedV542,
      vocalFocus:vocalFocusV542,groupCount:groupCountV542,
      authoredLanes:(['laser','led','particles','foam','transition'] as const).filter(lane=>
        authoredFxV823[lane].boost>.001||authoredFxV823[lane].mute>.001)});
    // V834: VERIFIED cinematic intent only, never assumed actual occlusion.
    // Reduce decorative side-stage instances on portrait/dialogue scenes under
    // sustained V825 pressure. Wide views and festival drops retain V825 priority.
    const cameraBudgetV834=applyCameraAwarePerformanceV834(fxPerfV825,{
      settings:concertFxV810,fx:fxCueV810,
      intent:cinematicCueV761?.intent??null,
      verifiedCamera:cinematicCueV761?.active===true&&cinematicCueV761.reason==='verified-act'&&
        cinematicCueV761.actIndex===verifiedActV810?.act,
      manualCamera:cameraNarrativeV605?.manualCamera===true,
      groupCount:groupCountV542,
      authoredLanes:(['laser','led','particles','foam','transition'] as const).filter(lane=>
        authoredFxV823[lane].boost>.001||authoredFxV823[lane].mute>.001),
    });

    crownCueV828.current=experienceV828.active?{
      ...experienceV828,
      crownCount:Math.floor(experienceV828.crownCount*fxPerfV825.gains.led),
      crownOpacity:experienceV828.crownOpacity*fxPerfV825.gains.led,
    }:EXPERIENCE_OFF_V828;
    const laserGainV823=dimFestivalLaneV850(fxTimelineMultiplierV823(authoredFxV823.laser)*smartMixV824.gains.laser*experienceV828.gains.laser*fxPerfV825.gains.laser,festivalShowV850.gains.laser,authoredLanesV850.includes('laser'));
    const ledGainV823=dimFestivalLaneV850(fxTimelineMultiplierV823(authoredFxV823.led)*smartMixV824.gains.led*experienceV828.gains.led*fxPerfV825.gains.led,festivalShowV850.gains.led,authoredLanesV850.includes('led'));
    const particleGainV823=dimFestivalLaneV850(fxTimelineMultiplierV823(authoredFxV823.particles)*smartMixV824.gains.particles*experienceV828.gains.particles*fxPerfV825.gains.particles,festivalShowV850.gains.particles,authoredLanesV850.includes('particles'));
    const foamGainV823=dimFestivalLaneV850(fxTimelineMultiplierV823(authoredFxV823.foam)*smartMixV824.gains.foam*experienceV828.gains.foam*fxPerfV825.gains.foam,festivalShowV850.gains.foam,authoredLanesV850.includes('foam'));
    const transitionGainV823=dimFestivalLaneV850(fxTimelineMultiplierV823(authoredFxV823.transition)*smartMixV824.gains.transition*experienceV828.gains.transition*fxPerfV825.gains.transition,festivalShowV850.gains.transition,authoredLanesV850.includes('transition'));
    // V822 derives distinct, bounded accents ONLY from microphone transients and bands.
    // The V810 music authority has already enforced blackout, authored light, pause,
    // reduced motion and verified song timing. No separate beat timer or GPU layer.
    const beatV822=planBeatAccentDirectorV822({fx:fxCueV810,
      settings:normalizeConcertFxV810(concertFxV810),tier,budget:getVisualFactorsV640().led,
      beatStrength:audio.beatStrength??0,kickOnset:audio.kickAccentIntensity??0,
      kickBand:audio.kick??0,snareBand:audio.snare??0,bass:audio.bass??0,
      energy:audio.energyEnvelope??0,attack:audio.attack??0,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,groupCount:groupCountV542});
    // V991: a measured V822 kick starts ONE seek-safe radial floor wave. The old
    // song clock remains authoritative: no AI/BPM-derived onsets and no extra loop.
    const bassImpactV991=planBassImpactV991({fx:fxCueV810,beat:beatV822,
      settings:normalizeConcertFxV810(concertFxV810),trackId:playback.trackId??'',
      positionMs:playback.positionMs,durationMs:playback.durationMs,
      playing:isPlaying&&playback.playing&&reactive,reducedMotion,tier,
      budget:getVisualFactorsV640().led*getConcertFactorsV999().bass*immersiveCueV1000.gains.bass,performanceGain:fxPerfV825.gains.particles,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      manualFx:!!liveSignalV882.manual,blackout:timelineCue.blackout>0||timelineCue.strobe>0||
        timelineCue.scale<=0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542,lyricsVisible:lyricsVisibleV813,
      vocalFocus:vocalFocusV542,groupCount:groupCountV542},bassImpactStateV991.current);
    if(bassImpactMeshV991.current)bassImpactMeshV991.current.visible=bassImpactV991.active;
    if(bassImpactMatV991.current){
      const u=bassImpactMatV991.current.uniforms;
      u.uPower.value=bassImpactV991.power;u.uRadius.value=bassImpactV991.radius;
      u.uAge.value=bassImpactV991.age;u.uStyle.value=bassImpactV991.style;
      if(bassImpactV991.active)(u.uColor.value as Color).set(fxCueV810.secondary);
    }
    // V813: copies only confirmed, timestamped synchronized lyrics onto a BACKWALL
    // or a FLOOR decal. Regular 3D lyrics are unchanged and always remain in front.
    const rawLyricsCueV813=planLyricsProjectionV813({fx:fxCueV810,
      settings:normalizeConcertFxV810(concertFxV810),lyrics:lyricsV813,progressMs:playback.positionMs,
      verifiedSong:fxCueV810.reason==='music',lyricsVisible:lyricsVisibleV813,groupCount:groupCountV542});
    // V873 refines ONLY this existing confirmed V813 cue. The projection canvas,
    // materials and timestamps remain V813-owned. No new meshes or word inference.
    const cinematicProjectionV873=planCinematicProjectionV873({base:rawLyricsCueV813,
      settings:normalizeConcertFxV810(concertFxV810),fx:fxCueV810,
      playing:isPlaying&&playback.playing,reducedMotion,lyricsProtected:lyricsProtectedV542,
      cameraCloseup:concertLipSyncV386?.cinematicSceneV528?.active===true&&vocalFocusV542,
      manualCamera:cameraNarrativeV605?.manualCamera===true,groupCount:groupCountV542});
    const lyricsCueV813=cinematicProjectionV873.cue;
    if(lyricsWallV813.current)lyricsWallV813.current.scale.setScalar(cinematicProjectionV873.scale);
    const showWallV813=lyricsCueV813.active&&lyricsCueV813.surface==='wall'&&!!lyricsTextureV813.current;
    const showFloorV813=lyricsCueV813.active&&lyricsCueV813.surface==='floor'&&!!lyricsTextureV813.current;
    if(lyricsCueV813.active&&lyricsDrawnV813.current!==lyricsCueV813.text){
      const canvas=lyricsCanvasV813.current;const ctx=canvas?.getContext('2d');
      if(canvas&&ctx){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.textAlign='center';ctx.textBaseline='middle';
        let size=148;
        ctx.font=`bold ${size}px system-ui, sans-serif`;
        while(size>45&&ctx.measureText(lyricsCueV813.text).width>canvas.width*.90){
          size-=8;ctx.font=`bold ${size}px system-ui, sans-serif`;
        }
        ctx.shadowColor='#ffffff';ctx.shadowBlur=12;ctx.fillStyle='#ffffff';
        ctx.fillText(lyricsCueV813.text,canvas.width/2,canvas.height/2);
        if(lyricsTextureV813.current)lyricsTextureV813.current.needsUpdate=true;
        lyricsDrawnV813.current=lyricsCueV813.text;
      }
    }
    if(lyricsWallV813.current)lyricsWallV813.current.visible=showWallV813;
    if(lyricsFloorV813.current)lyricsFloorV813.current.visible=showFloorV813;
    if(lyricsWallMatV813.current){lyricsWallMatV813.current.opacity=showWallV813?lyricsCueV813.opacity:0;
      lyricsWallMatV813.current.color.set(lyricsCueV813.accent==='rhyme'?fxCueV810.secondary:fxCueV810.primary);}
    if(lyricsFloorMatV813.current){lyricsFloorMatV813.current.opacity=showFloorV813?lyricsCueV813.opacity:0;
      lyricsFloorMatV813.current.color.set(lyricsCueV813.accent==='rhyme'?fxCueV810.secondary:fxCueV810.primary);}
    // V1028: one verified V810 clock, no independent FX activation. The final
    // post-budget mix happens after V889; V814 fog merely receives a <=1 gain.
    const immersiveFxV1028=planImmersiveConcertFxV1028({
      enabled:concertFxV810?.immersiveFxV1028??false,masterEnabled:concertFxV810?.enabled??false,
      strength:concertFxV810?.immersiveFxStrengthV1028??0,fx:fxCueV810,
      positionMs:playback.positionMs,startMs:currentActV810?.startMs??-1,
      endMs:currentActV810?.endMs??-1,durationMs:playback.durationMs,
      playing:isPlaying&&playback.playing&&reactive,reducedMotion,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      manualFx:!!liveSignalV882.manual,seekBlocked:playback.positionMs<(liveSignalV882.atmosphereSeekBlockedUntilMs??0),
      authoredLanes:authoredLanesV850,lyricsProtected:lyricsProtectedV542,
      lyricsVisible:!!lyricsVisibleV813,vocalFocus:vocalFocusV542,
      cameraCloseup:cameraNarrativeV605?.manualCamera===true||
        concertLipSyncV386?.cinematicSceneV528?.active===true&&vocalFocusV542,
      groupCount:groupCountV542,tier,energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,
      budget:fxPerfV825.gains.particles,pressure:fxPerfStateV825.current.pressure,
    });
    // V1029: a single verified V604/V761 storyboard coordinates the EXISTING
    // LED, haze, beam and particle lanes. This is not another camera or emitter.
    const visualDirectorV1029=planAiVisualDirectorV1029({
      enabled:concertFxV810?.aiVisualDirectorV1029??false,
      masterEnabled:concertFxV810?.enabled??false,
      strength:concertFxV810?.aiVisualDirectorStrengthV1029??0,
      trackId:playback.trackId,durationMs:playback.durationMs,positionMs:playback.positionMs,
      playing:isPlaying&&playback.playing,reactive,reducedMotion,tier,
      narrative:cameraNarrativeV605?.plan&&currentActV810?{
        source:cameraNarrativeV605.plan.source,trackId:cameraNarrativeV605.plan.trackId,
        durationMs:cameraNarrativeV605.plan.durationMs,actIndex:currentActV810.index,
        section:currentActV810.section,startMs:currentActV810.startMs,
        endMs:currentActV810.endMs}:null,
      cinematic:cinematicCueV761?{
        active:cinematicCueV761.active,reason:cinematicCueV761.reason,
        actIndex:cinematicCueV761.actIndex,intent:cinematicCueV761.intent,
        blend:cinematicCueV761.blend}:null,
      fx:fxCueV810,groupCount:groupCountV542,vocalFocus:!!vocalFocusV542,
      focusSlot:lightingV749.focusSlot,partnerSlot:lightingV749.partnerSlot,
      lyricsProtected:!!lyricsProtectedV542,lyricsVisible:!!lyricsVisibleV813,
      manualCamera:cameraNarrativeV605?.manualCamera===true,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      manualFx:!!liveSignalV882.manual,authoredLanes:authoredLanesV850,
      seekBlocked:playback.positionMs<(liveSignalV882.atmosphereSeekBlockedUntilMs??0),
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,
      budget:fxPerfV825.gains.led,pressure:fxPerfStateV825.current.pressure,
    });
    // V1030 – a single evidence-checked atmosphere director, using only the
    // authorized stage, lights, haze and already budgeted audience. Never sends
    // hardware commands or creates any additional meshes or lights.
    const concertAtmosphereV1030=planIntelligentConcertAtmosphereV1030({
      enabled:concertFxV810?.intelligentAtmosphereV1030??false,
      masterEnabled:concertFxV810?.enabled??false,
      strength:concertFxV810?.atmosphereStrengthV1030??0,
      trackId:playback.trackId,durationMs:playback.durationMs,positionMs:playback.positionMs,
      playing:isPlaying&&playback.playing,reactive,reducedMotion,tier,
      narrative:cameraNarrativeV605?.plan&&currentActV810?{
        source:cameraNarrativeV605.plan.source,trackId:cameraNarrativeV605.plan.trackId,
        durationMs:cameraNarrativeV605.plan.durationMs,actIndex:currentActV810.index,
        section:currentActV810.section,startMs:currentActV810.startMs,
        endMs:currentActV810.endMs}:null,
      cinematic:cinematicCueV761?{
        active:cinematicCueV761.active,reason:cinematicCueV761.reason,
        actIndex:cinematicCueV761.actIndex,intent:cinematicCueV761.intent,
        blend:cinematicCueV761.blend}:null,
      fx:fxCueV810,groupCount:groupCountV542,vocalFocus:!!vocalFocusV542,
      lyricsProtected:!!lyricsProtectedV542,lyricsVisible:!!lyricsVisibleV813,
      manualCamera:cameraNarrativeV605?.manualCamera===true,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      manualFx:!!liveSignalV882.manual,authoredLanes:authoredLanesV850,
      seekBlocked:playback.positionMs<(liveSignalV882.atmosphereSeekBlockedUntilMs??0),
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,
      budget:Math.min(fxPerfV825.gains.crowd,fxPerfV825.gains.haze),
      pressure:fxPerfStateV825.current.pressure,
    });
    // V814 augments the existing V308 fog and V762 gobo. No scene.fog replacement.
    const hazeV814=planAtmosphericConcertFxV814({fx:fxCueV810,
      settings:normalizeConcertFxV810(concertFxV810),lyricsProtected:lyricsProtectedV542,
      vocalFocus:vocalFocusV542,groupCount:groupCountV542,tier,
      hazeBudget:getVisualFactorsV640().haze});
    hazeV814.floorOpacity*=fxPerfV825.gains.haze*festivalShowV850.gains.ambience;
    hazeV814.shaftsOpacity*=fxPerfV825.gains.haze*festivalShowV850.gains.ambience;
    // V887 changes only uniforms of the existing two V814 haze planes.
    // Never add meshes, brighten an authored blackout or animate under reduced motion.
    const cinematicFogV887=planCinematicFogV887({
      settings:liveSignalV882.fogSettingsV887??DEFAULT_FOG_V887,
      plan:liveSignalV882.atmospherePlan,base:hazeV814,
      trackId:playback.trackId,durationMs:playback.durationMs,positionMs:playback.positionMs,
      genre:genre??'',playing:isPlaying&&playback.playing&&reactive,autoEnabled:liveSignalV882.enabled,
      reducedMotion,seekBlocked:playback.positionMs<(liveSignalV882.atmosphereSeekBlockedUntilMs??0),
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      lyricsProtected:lyricsProtectedV542||vocalFocusV542,manualFx:liveSignalV882.manual!==null,
      tier,hazeBudget:getVisualFactorsV640().haze,
      performanceGain:fxPerfV825.gains.haze*festivalShowV850.gains.ambience,
    });
    if(hazeFloorMatV814.current){
      const u=hazeFloorMatV814.current.uniforms;
      u.uOpacity.value=cinematicFogV887.floorOpacity*immersiveFxV1028.fogGain*visualDirectorV1029.fogGain*concertAtmosphereV1030.hazeGain;
      u.uPhase.value=cinematicFogV887.phase;
      u.uFogDriftV887.value=cinematicFogV887.drift;
      u.uFogSoftV887.value=cinematicFogV887.softness;
      u.uFogWarpV887.value=cinematicFogV887.warp;
      (u.uColor.value as Color).set(cinematicFogV887.color);
    }
    if(hazeShaftsMatV814.current){
      const u=hazeShaftsMatV814.current.uniforms;
      u.uOpacity.value=cinematicFogV887.shaftsOpacity*immersiveFxV1028.fogGain*visualDirectorV1029.fogGain*concertAtmosphereV1030.hazeGain;
      u.uPhase.value=cinematicFogV887.phase;
      u.uFogDriftV887.value=cinematicFogV887.drift;
      u.uFogSoftV887.value=cinematicFogV887.softness;
      u.uFogWarpV887.value=cinematicFogV887.warp;
      (u.uColor.value as Color).set(cinematicFogV887.color);
    }
    if(hazeFloorV814.current)hazeFloorV814.current.visible=cinematicFogV887.floorOpacity*immersiveFxV1028.fogGain*visualDirectorV1029.fogGain*concertAtmosphereV1030.hazeGain>.002;
    if(hazeShaftsV814.current)hazeShaftsV814.current.visible=cinematicFogV887.shaftsOpacity*immersiveFxV1028.fogGain*visualDirectorV1029.fogGain*concertAtmosphereV1030.hazeGain>.002;
    // V815 uses the SAME verified FX cue; disables on pauses, blackout, manual
    // light tracks and low tier, and stays outside the central performer lane.
    crowdCueV815.current=planVirtualConcertCrowdV815({fx:fxCueV810,
      settings:normalizeConcertFxV810(concertFxV810),tier,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,
      groupCount:groupCountV542,energy:audio.energyEnvelope??0,
      kick:audio.kickAccentIntensity??0,crowdBudget:getVisualFactorsV640().led});
    // V849: shared scene seam from ThreeAvatar; per-frame manual and performance
    // safeguards always win. Visual gains can only REDUCE the existing FX.
    const transitionsActiveV849=transitionV849?.active===true&&
      tier!=='low'&&reactive&&isPlaying&&playback.playing&&!reducedMotion&&
      fxCueV810.reason==='music'&&
      !manualLightingV763&&!authoredLightsV386&&
      showCue?.lightingEnabled!==false&&timelineGainV354===1&&
      timelineCue.blackout<=0&&timelineCue.strobe<=0&&timelineCue.scale>0;
    const ledBlendV849=transitionsActiveV849?transitionV849!.ledGain:1;
    const laserBlendV849=transitionsActiveV849?transitionV849!.laserGain:1;
    const festivalBlendV849=transitionsActiveV849?transitionV849!.festivalGain:1;
    const overlayBlendV849=transitionsActiveV849?transitionV849!.overlayGain:1;
    // V844: one verified festival hero effect, after V823/V825 authoring and budget checks.
    // No autonomous/unverified drops. Manual light tracks and blackouts win.
    festivalCueV844.current=planFestivalSpecialFxV844({fx:fxCueV810,
      settings:normalizeConcertFxV810(concertFxV810),playing:isPlaying&&playback.playing&&reactive,
      reducedMotion,manualLighting:authoredLightsV386||manualLightingV763||showCue?.lightingEnabled===false,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,groupCount:groupCountV542,
      tier,energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,
      particleBudget:getVisualFactorsV640().led,foamBudget:getVisualFactorsV640().led,
      timelineGain:Math.min(particleGainV823,foamGainV823),
      performanceGain:Math.min(fxPerfV825.gains.particles,fxPerfV825.gains.foam)});
    // V844.1: atmospheric bubbles + separately opted-in canvas-wide stage flash.
    // Both inherit the V844 verified music, manual-light, blackout and performance gates.
    // An opted-in full-stage flash replaces (never stacks with) the floor strobe.
    const companionInputsV8441={fx:fxCueV810,settings:normalizeConcertFxV810(concertFxV810),
      playing:isPlaying&&playback.playing&&reactive,reducedMotion,
      manualLighting:authoredLightsV386||manualLightingV763||showCue?.lightingEnabled===false,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,groupCount:groupCountV542,
      tier,energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,
      budget:getVisualFactorsV640().led,timelineGain:particleGainV823,
      performanceGain:fxPerfV825.gains.particles,moment:festivalCueV844.current.moment};
    soapBubbleCueV8441.current=planSoapBubblesV8441(companionInputsV8441);
    fullStageFlashCueV8441.current=planFullStageFlashV8441(companionInputsV8441);
    paperStreamersCueV846.current=planPaperStreamersV846(companionInputsV8441);
    // V847: reuse the same verified V844/V845 gate and V825/V823 budgets.
    festivalFinaleCueV847.current=planFestivalFinaleV847(companionInputsV8441);
    if(festivalBlendV849<1){
      const special=festivalCueV844.current,finale=festivalFinaleCueV847.current;
      festivalCueV844.current={...special,
        co2Count:Math.floor(special.co2Count*festivalBlendV849),
        co2Opacity:applyConcertTransitionGainV849(special.co2Opacity,festivalBlendV849),
        sparkGain:applyConcertTransitionGainV849(special.sparkGain,festivalBlendV849),
        confettiGain:applyConcertTransitionGainV849(special.confettiGain,festivalBlendV849)};
      festivalFinaleCueV847.current={...finale,
        rainCount:Math.floor(finale.rainCount*festivalBlendV849),
        wheelCount:Math.floor(finale.wheelCount*festivalBlendV849),
        rainOpacity:applyConcertTransitionGainV849(finale.rainOpacity,festivalBlendV849),
        wheelOpacity:applyConcertTransitionGainV849(finale.wheelOpacity,festivalBlendV849)};
    }
    // V850 quiet-space and motif cadence: optional festival effects are
    // attenuated AFTER V847/V849 and NEVER enabled by this director.
    // Authored particle lanes preserve their exact existing result.
    if(festivalShowV850.active&&!authoredLanesV850.includes('particles')){
      const g=festivalShowV850.gains.festival;
      const special=festivalCueV844.current,finale=festivalFinaleCueV847.current;
      festivalCueV844.current={...special,
        co2Count:Math.floor(special.co2Count*g),
        co2Opacity:dimFestivalLaneV850(special.co2Opacity,g,false),
        sparkGain:dimFestivalLaneV850(special.sparkGain,g,false),
        confettiGain:dimFestivalLaneV850(special.confettiGain,g,false)};
      festivalFinaleCueV847.current={...finale,
        rainCount:Math.floor(finale.rainCount*g),
        wheelCount:Math.floor(finale.wheelCount*g),
        rainOpacity:dimFestivalLaneV850(finale.rainOpacity,g,false),
        wheelOpacity:dimFestivalLaneV850(finale.wheelOpacity,g,false)};
      const bubble=soapBubbleCueV8441.current,streamers=paperStreamersCueV846.current;
      soapBubbleCueV8441.current={...bubble,count:Math.floor(bubble.count*g),
        opacity:dimFestivalLaneV850(bubble.opacity,g,false)};
      paperStreamersCueV846.current={...streamers,count:Math.floor(streamers.count*g),
        opacity:dimFestivalLaneV850(streamers.opacity,g,false)};
      // The full-stage flash remains explicit opt-in; we may only dim it.
      const flash=fullStageFlashCueV8441.current;
      fullStageFlashCueV8441.current={...flash,
        opacity:dimFestivalLaneV850(flash.opacity,g,false)};
    }
    if(companionInputsV8441.settings.festivalFullStageFlashV8441 &&
        festivalCueV844.current.strobeGain>0){
      festivalCueV844.current={...festivalCueV844.current,strobeGain:0};
    }
    // V816: particle bursts inherit the SAME V810 verification and blackout rules.
    // Instancing and budget caps live in the renderer/planner; no new scene lights.
    particlesCueV816.current=planReactiveParticlesV816({fx:fxCueV810,
      settings:normalizeConcertFxV810(concertFxV810),tier,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,groupCount:groupCountV542,
      energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,
      bass:audio.bass??0,highs:audio.highs??0,
      particleBudget:getVisualFactorsV640().led});
    if(crowdCueV815.current.active){
      const c=crowdCueV815.current,g=fxPerfV825.gains.crowd;
      crowdCueV815.current={...c,count:Math.floor(c.count*g),
        movement:c.movement*g,phoneOpacity:c.phoneOpacity*g,lightGain:c.lightGain*g,
        active:g>.001&&Math.floor(c.count*g)>=2};
    }
    // V874 only reshapes the already-authorized V815 cue after the V825 governor.
    crowdCueV815.current=planIntelligentAudienceV874({base:crowdCueV815.current,
      fx:fxCueV810,settings:normalizeConcertFxV810(concertFxV810),
      tier,energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,reducedMotion});
    // V875 reads only the performance-governed V874 crowd. No new FX authority.
    crowdCueV815.current=planSmartFestivalAtmosphereV875({
      base:crowdCueV815.current as AudienceCueV874,
      fx:fxCueV810,settings:normalizeConcertFxV810(concertFxV810),
      energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,tier,
      playing:isPlaying&&playback.playing&&reactive,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,reducedMotion});
    // V876 is downstream of the verified V810 cue, V825 budget and V875 mood.
    crowdCueV815.current=planDynamicFestivalCrowdChoreographyV876({
      base:crowdCueV815.current as FestivalAtmosphereCueV875,
      fx:fxCueV810,settings:normalizeConcertFxV810(concertFxV810),
      energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,tier,
      playing:isPlaying&&playback.playing&&reactive,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,reducedMotion});
    // V877: verified music, optional synced lyric and verified performer-slot focus.
    // Always AFTER V825 governor and V876; may only reduce/add tiny bounded motion.
    crowdCueV815.current=planIntelligentCrowdInteractionV877({
      base:crowdCueV815.current as CrowdChoreographyCueV876,
      fx:fxCueV810,settings:normalizeConcertFxV810(concertFxV810),
      tier,playing:isPlaying&&playback.playing&&reactive,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      reducedMotion,lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,
      energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,
      groupCount:groupCountV542,
      focusSlot:vocalSpotlightV797?.leadSlot??null,
      focusVerified:vocalSpotlightV797?.lightingActive===true,
      lyrics:lyricsV813,lyricsVisible:lyricsVisibleV813,progressMs:playback.positionMs});
    // V878 – smooth mood changes using *song position*, reset on seek/track change.
    // The director only dims existing FX gains and adds bounded existing-mesh motion.
    const audienceEmotionV878=planSmartAudienceEmotionV878({
      base:crowdCueV815.current as CrowdInteractionCueV877,
      fx:fxCueV810,settings:normalizeConcertFxV810(concertFxV810),
      previous:audienceEmotionStateV878.current,trackId:playback.trackId??null,
      positionMs:playback.positionMs,energy:audio.energyEnvelope??0,
      kick:audio.kickAccentIntensity??0,tier,
      playing:isPlaying&&playback.playing&&reactive,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      reducedMotion,lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542});
    audienceEmotionStateV878.current=audienceEmotionV878.state;
    // V879: stage- and camera-aware attenuation, downstream of the V825 budget.
    // Manual cameras remain in charge; lyrics protection never creates new effects.
    crowdCueV815.current=planCrowdCameraStageHarmonyV879({
      base:audienceEmotionV878.cue,settings:normalizeConcertFxV810(concertFxV810),
      verifiedCamera:fxCueV810.active&&fxCueV810.reason==='music'&&
        cinematicCueV761?.active===true&&cinematicCueV761.reason==='verified-act',
      cameraIntent:cinematicCueV761?.intent??null,
      manualCamera:cameraNarrativeV605?.manualCamera===true,
      lyricsVisible:lyricsVisibleV813,lyricsProtected:lyricsProtectedV542,
      vocalFocus:vocalFocusV542,performerVerified:vocalSpotlightV797?.lightingActive===true,
      groupCount:groupCountV542,
      transitionActive:transitionV791?.active===true,
      transitionProximity:transitionV791?.proximity??0,
      playing:isPlaying&&playback.playing&&reactive,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      reducedMotion,tier});
    particlesCueV816.current=mergeFestivalParticlesV844(particlesCueV816.current,
      festivalCueV844.current,normalizeConcertFxV810(concertFxV810));
    if(particlesCueV816.current.active&&beatV822.particles>0){
      const c=particlesCueV816.current;
      particlesCueV816.current={...c,
        sparkOpacity:Math.min(.62,c.sparkOpacity*(1+beatV822.particles*.22)),
        shardOpacity:Math.min(.50,c.shardOpacity*(1+beatV822.particles*.25)),
        ringOpacity:Math.min(.37,c.ringOpacity*(1+beatV822.particles*.24))};
    }
    if(particlesCueV816.current.active){
      const c=particlesCueV816.current;
      const opacity=(x:number,cap:number)=>Math.min(cap,x*particleGainV823);
      particlesCueV816.current={...c,
        sparkOpacity:opacity(c.sparkOpacity,.62),shardOpacity:opacity(c.shardOpacity,.50),
        confettiOpacity:opacity(c.confettiOpacity,.52),ringOpacity:opacity(c.ringOpacity,.37),
        active:particleGainV823>.001};
    }
    if(particlesCueV816.current.active){
      const c=particlesCueV816.current,g=fxPerfV825.gains.particles;
      // V816 is instanced: reduce actual instances, not just their opacity.
      particlesCueV816.current={...c,
        sparks:Math.floor(c.sparks*g),shards:Math.floor(c.shards*g),
        confetti:Math.floor(c.confetti*g),rings:Math.floor(c.rings*g),
        active:g>.001&&(Math.floor(c.sparks*g)+Math.floor(c.shards*g)+Math.floor(c.confetti*g)+Math.floor(c.rings*g))>0};
    }
    // V847 dim only matching legacy instances, never reactivate authored/disabled particles.
    particlesCueV816.current=coordinateFestivalParticlesV847(particlesCueV816.current,festivalFinaleCueV847.current);
    // V817: verified FX authority controls BOTH kinetic architecture and foam cannon.
    // Side-only foam respects performer/lyric sightlines and costs at most 2 instanced draws.
    foamCueV817.current=planFoamCannonV817({fx:fxCueV810,
      settings:normalizeConcertFxV810(concertFxV810),tier,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,groupCount:groupCountV542,
      energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,
      foamBudget:getVisualFactorsV640().led});
    if(foamCueV817.current.active&&beatV822.foam>0){
      const c=foamCueV817.current;
      foamCueV817.current={...c,opacity:Math.min(.62,c.opacity*(1+beatV822.foam*.18))};
    }
    if(foamCueV817.current.active){
      const c=foamCueV817.current;
      foamCueV817.current={...c,opacity:Math.min(.62,c.opacity*foamGainV823),
        power:Math.min(1,c.power*foamGainV823),active:foamGainV823>.001};
    }
    if(foamCueV817.current.active){
      const c=foamCueV817.current,g=fxPerfV825.gains.foam;
      foamCueV817.current={...c,bubbles:Math.floor(c.bubbles*g),mist:Math.floor(c.mist*g),
        active:g>.001&&Math.floor(c.bubbles*g)>=2&&Math.floor(c.mist*g)>=2};
    }
    // V844 cross-effect scheduler: dim foam during CO2/confetti hero moments,
    // without ever bypassing the previously applied V817/V823/V825 gates.
    foamCueV817.current=coordinateFestivalFoamV844(foamCueV817.current,festivalCueV844.current);
    // V843 runs only after the V823 and V825 foam safety/budget gates; it
    // changes trajectories, never particle count, alpha or authority.
    if(foamCueV817.current.active){
      const c=foamCueV817.current;
      foamCueV817.current={...c,experienceV843:planFoamExperienceV843({
        cue:c,fx:fxCueV810,settings:normalizeConcertFxV810(concertFxV810),tier,
        lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,groupCount:groupCountV542,
      })};
    }
    // V871 Festival FX 4.0: final visibility pass after ALL legacy authority,
    // authored-lane, V823 timeline and V825 performance gates. Reduction ONLY.
    // One shared phase from verified V810; never a competing audio/FX controller.
    const coordinatedV871=coordinateFestivalFxV871({
      settings:normalizeConcertFxV810(concertFxV810),fx:fxCueV810,
      festival:festivalCueV844.current,foam:foamCueV817.current,
      bubbles:soapBubbleCueV8441.current,streamers:paperStreamersCueV846.current,
      finale:festivalFinaleCueV847.current,flash:fullStageFlashCueV8441.current,
      playing:isPlaying&&playback.playing&&reactive,reducedMotion,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      manualLighting:authoredLightsV386||manualLightingV763||showCue?.lightingEnabled===false,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,
      cameraCloseup:concertLipSyncV386?.cinematicSceneV528?.active===true&&vocalFocusV542,
      groupCount:groupCountV542,tier,authoredLanes:authoredLanesV850});
    festivalCueV844.current=coordinatedV871.festival;
    foamCueV817.current=coordinatedV871.foam;
    soapBubbleCueV8441.current=coordinatedV871.bubbles;
    paperStreamersCueV846.current=coordinatedV871.streamers;
    festivalFinaleCueV847.current=coordinatedV871.finale;
    fullStageFlashCueV8441.current=coordinatedV871.flash;
    kineticCueV817.current=planKineticStageV817({fx:fxCueV810,
      settings:normalizeConcertFxV810(concertFxV810),tier,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,groupCount:groupCountV542,
      energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,
      architectureBudget:getVisualFactorsV640().led});
    if(kineticCueV817.current.active){
      const c=kineticCueV817.current,g=fxPerfV825.gains.kinetic;
      kineticCueV817.current={...c,columns:Math.floor(c.columns*g),
        lift:c.lift*g,spread:c.spread*g,opacity:c.opacity*g,
        active:g>.001&&Math.floor(c.columns*g)>=2};
    }
    // V818: use only REAL already-analyzed bands, and inherit the V810
    // verified-act, manual-lighting, pause and lyric/portrait protection gates.
    spectralCueV818.current=planSpectralMusicV818({fx:fxCueV810,
      settings:normalizeConcertFxV810(concertFxV810),tier,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,groupCount:groupCountV542,
      energy:audio.energyEnvelope??0,bass:audio.bass??0,mids:audio.mids??0,highs:audio.highs??0,
      spectralBudget:getVisualFactorsV640().led});
    if(spectralCueV818.current.active){
      const c=spectralCueV818.current,g=fxPerfV825.gains.spectral;
      spectralCueV818.current={...c,waves:Math.floor(c.waves*g),rings:Math.floor(c.rings*g),
        prisms:Math.floor(c.prisms*g),waveOpacity:c.waveOpacity*g,
        ringOpacity:c.ringOpacity*g,prismOpacity:c.prismOpacity*g,
        active:g>.001};
    }
    // V819: V791 explicitly verifies the adjacent scene seam and owns camera/light
    // easing. V819 is strictly visual, behind the performer lane, no second timer.
    transitionCueV819.current=planCinematicTransitionV819({fx:fxCueV810,
      transition:transitionV791,settings:normalizeConcertFxV810(concertFxV810),
      playing:isPlaying&&playback.playing,reducedMotion,
      manualCamera:cameraNarrativeV605?.manualCamera===true,manualLighting:manualLightingV763||authoredLightsV386,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,
      groupCount:groupCountV542,tier,budget:getVisualFactorsV640().led});
    if(transitionCueV819.current.active){
      const c=transitionCueV819.current;
      transitionCueV819.current={...c,opacity:Math.min(.27,c.opacity*transitionGainV823*overlayBlendV849),
        active:transitionGainV823>.001};
    }
    // V820: editorial V496 time segments for THIS track only. No inferred singer
    // identity or fabricated adlib text; camera and lip-sync remain authoritative.
    vocalFxCueV820.current=planVocalAdlibFxV820({fx:fxCueV810,
      settings:concertFxV810,trackId:playback.trackId,
      vocalTrackId:concertLipSyncV386?.vocalTimeTrackIdV496??'',
      segments:concertLipSyncV386?.vocalTimeSegmentsV496,
      vocalEnabled:concertLipSyncV386?.vocalTimeEnabledV496===true,
      progressMs:playback.positionMs,playing:isPlaying&&playback.playing,reducedMotion,
      lyrics:lyricsV813,lyricsVisible:lyricsVisibleV813,
      manualCamera:cameraNarrativeV605?.manualCamera===true,
      manualLighting:manualLightingV763||authoredLightsV386,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,
      groupCount:groupCountV542,tier,budget:getVisualFactorsV640().led});
    if(vocalFxCueV820.current.active){
      const c=vocalFxCueV820.current,g=fxPerfV825.gains.vocal;
      vocalFxCueV820.current={...c,leadOpacity:c.leadOpacity*g,
        adlibOpacity:c.adlibOpacity*g};
    }
    // V880: final cross-system musical arc, AFTER V825 performance / V871 festival
    // coordination. This is NOT a second camera or dancer controller: verified
    // camera intent and performance focus inform visual restraint only.
    const concertArcV880=planSmartConcertExperienceV880({
      settings:normalizeConcertFxV810(concertFxV810),fx:fxCueV810,
      previous:concertArcStateV880.current,trackId:playback.trackId??null,
      positionMs:playback.positionMs,durationMs:playback.durationMs,
      energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,
      cameraVerified:cinematicCueV761?.active===true&&cinematicCueV761.reason==='verified-act'&&
        fxCueV810.active&&fxCueV810.reason==='music',
      cameraIntent:cinematicCueV761?.intent??null,
      manualCamera:cameraNarrativeV605?.manualCamera===true,
      lyricsProtected:lyricsProtectedV542||lyricsVisibleV813,
      vocalFocus:vocalFocusV542,groupCount:groupCountV542,
      transitionActive:transitionV791?.active===true,
      playing:isPlaying&&playback.playing&&reactive,reducedMotion,tier,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
    });
    concertArcStateV880.current=concertArcV880.state;
    if(concertArcV880.cue.active){
      crowdCueV815.current=applyConcertArcCrowdV880(
        crowdCueV815.current as CrowdHarmonyCueV879,concertArcV880.cue);
      if(!authoredLanesV850.includes('particles'))
        particlesCueV816.current=applyConcertArcParticlesV880(particlesCueV816.current,concertArcV880.cue);
      if(!authoredLanesV850.includes('particles'))
        festivalCueV844.current=applyConcertArcFestivalV880(festivalCueV844.current,concertArcV880.cue);
      if(!authoredLanesV850.includes('foam'))
        foamCueV817.current=applyConcertArcFoamV880(foamCueV817.current,concertArcV880.cue);
    }
    // V893: read-only, verified arena mood AFTER V825/V879/V880 crowd priority.
    // No new instanced meshes; all disabled phone / motion lanes stay disabled.
    crowdCueV815.current=planArenaCrowdV893({
      base:crowdCueV815.current,
      plan:liveSignalV882.arenaPlanV893,
      settings:liveSignalV882.arenaSettingsV893??DEFAULT_ARENA_CROWD_V893,
      trackId:playback.trackId,durationMs:playback.durationMs,positionMs:playback.positionMs,
      playing:isPlaying&&playback.playing&&reactive,autoEnabled:liveSignalV882.enabled,
      reducedMotion,tier,seekBlocked:playback.positionMs<(liveSignalV882.atmosphereSeekBlockedUntilMs??0),
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      manualFx:!!liveSignalV882.manual,
      lyricsProtected:lyricsProtectedV542,lyricsVisible:lyricsVisibleV813,
      vocalFocus:vocalFocusV542,manualCamera:cameraNarrativeV605?.manualCamera===true,
      genre:genre??'',energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,
    });
    // V973: last audience pass, AFTER the existing V815/V825/V874–V880/V893
    // authority. Never re-enable a disabled crowd or bypass manual camera/show.
    crowdCueV815.current=planLivingAudienceV973({
      base:crowdCueV815.current,fx:fxCueV810,settings:normalizeConcertFxV810(concertFxV810),
      positionMs:playback.positionMs,energy:audio.energyEnvelope??0,
      kick:audio.kickAccentIntensity??0,tier,
      playing:isPlaying&&playback.playing&&reactive,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false||!!liveSignalV882.manual,
      manualCamera:cameraNarrativeV605?.manualCamera===true,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      reducedMotion,lyricsProtected:lyricsProtectedV542||lyricsVisibleV813,
      vocalFocus:vocalFocusV542,groupCount:groupCountV542,
    });
    // V996: optional audience depth, AFTER V825/V879/V893/V973 authority.
    // Verified V604 scene and inherited V815 crowd are required; no external lighting.
    crowdCueV815.current=limitCrowdV999(planCrowdExperienceV996({
      base:crowdCueV815.current,plan:liveSignalV882.arenaPlanV893,fx:fxCueV810,
      settings:liveSignalV882.crowdSettingsV996,trackId:playback.trackId,
      durationMs:playback.durationMs,positionMs:playback.positionMs,
      playing:isPlaying&&playback.playing&&reactive,autoEnabled:liveSignalV882.enabled,
      tier,reducedMotion,seekBlocked:playback.positionMs<(liveSignalV882.atmosphereSeekBlockedUntilMs??0),
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      manualFx:!!liveSignalV882.manual,manualCamera:cameraNarrativeV605?.manualCamera===true,
      lyricsProtected:lyricsProtectedV542||lyricsVisibleV813,vocalFocus:vocalFocusV542,
      energy:audio.energyEnvelope??0,kick:audio.kickAccentIntensity??0,
    }),getConcertFactorsV999().crowd*immersiveCueV1000.gains.crowd);
    // V1030 reduces ONLY the existing V815/V999 crowd after all audience governors.
    crowdCueV815.current=applyConcertAtmosphereCrowdV1030(crowdCueV815.current,concertAtmosphereV1030);
    // V889: final reduction-only artistic mix after V871 and V880, applied to the
    // existing 3D particle/foam emitters. Authored timelines and stage safety win.
    const particleMixV889=directParticlesV889({
      settings:liveSignalV882.particleSettingsV889??DEFAULT_PARTICLE_V889,
      plan:liveSignalV882.atmospherePlan,trackId:playback.trackId,
      durationMs:playback.durationMs,positionMs:playback.positionMs,genre:genre??'',
      playing:isPlaying&&playback.playing&&reactive,autoEnabled:liveSignalV882.enabled,
      reducedMotion,seekBlocked:playback.positionMs<(liveSignalV882.atmosphereSeekBlockedUntilMs??0),
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      manualFx:!!liveSignalV882.manual,
      lyricsProtected:lyricsProtectedV542||lyricsVisibleV813,vocalFocus:vocalFocusV542,
      groupCount:groupCountV542,tier,authoredLanes:authoredLanesV850,
      particles:particlesCueV816.current,foam:foamCueV817.current,
      bubbles:soapBubbleCueV8441.current,streamers:paperStreamersCueV846.current,
      festival:festivalCueV844.current,finale:festivalFinaleCueV847.current,
    });
    particlesCueV816.current=particleMixV889.particles;
    // V991 reuses V816's existing capped rings AFTER V825/V880/V889 priorities.
    particlesCueV816.current=enhanceBassImpactParticlesV991(particlesCueV816.current,
      bassImpactV991,authoredLanesV850.includes('particles')||!!liveSignalV882.manual);
    foamCueV817.current=particleMixV889.foam;
    soapBubbleCueV8441.current=particleMixV889.bubbles;
    paperStreamersCueV846.current=particleMixV889.streamers;
    festivalCueV844.current=particleMixV889.festival;
    festivalFinaleCueV847.current=particleMixV889.finale;
    // V1028: last, reduction-only coordinated mix. Keep V871/V889 sources and
    // V823/V825/authoring caps authoritative; V882 remains the only stage emitter.
    const immersiveMixV1028=mixImmersiveConcertFxV1028(immersiveFxV1028,
      liveStageV882.current,particlesCueV816.current,foamCueV817.current);
    liveStageV882.current=immersiveMixV1028.stage;
    particlesCueV816.current=immersiveMixV1028.particles;
    foamCueV817.current=immersiveMixV1028.foam;
    // V1029: reduction-only artistic finish after V889/V1028 resource budgets.
    const visualMixV1029=mixAiVisualDirectorV1029(visualDirectorV1029,
      liveStageV882.current,particlesCueV816.current,foamCueV817.current);
    liveStageV882.current=visualMixV1029.stage;
    liveStageV882.current=applyConcertAtmosphereStageV1030(liveStageV882.current,concertAtmosphereV1030);
    particlesCueV816.current=visualMixV1029.particles;
    foamCueV817.current=visualMixV1029.foam;
    // V891: confirmed sections only; opt-in virtual-only 3D pyrotechnics.
    // Existing V844 CO2, authored V823 particles and blackouts always win.
    livePyroV891.current=planPyroV891({
      settings:liveSignalV882.pyroSettingsV891??DEFAULT_PYRO_V891,
      plan:liveSignalV882.atmospherePlan,trackId:playback.trackId,
      durationMs:playback.durationMs,positionMs:playback.positionMs,genre:genre??'',
      playing:isPlaying&&playback.playing&&reactive,
      autoEnabled:liveSignalV882.enabled&&liveSignalV882.sync.stage,
      reducedMotion,tier,
      seekBlocked:playback.positionMs<(liveSignalV882.atmosphereSeekBlockedUntilMs??0),
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      manualFx:!!liveSignalV882.manual,
      authoredParticles:authoredLanesV850.includes('particles')||authoredLanesV850.includes('foam'),
      lyricsProtected:lyricsProtectedV542||lyricsVisibleV813,vocalFocus:vocalFocusV542,
      existingCo2:festivalCueV844.current.active&&festivalCueV844.current.co2Count>0,
    });
    const concertArcLedGainV880=concertArcLaneGainV880(concertArcV880.cue,'led',authoredLanesV850.includes('led'));
    if(livePyroV891.current.active&&liveSignalV882.pyroSettingsV891?.enabled&&epicV892.pyroGain>1)
      livePyroV891.current={...livePyroV891.current,opacity:Math.min(.65,livePyroV891.current.opacity*epicV892.pyroGain)};
    const concertArcLaserGainV880=concertArcLaneGainV880(concertArcV880.cue,'laser',authoredLanesV850.includes('laser'));
    // V826: read-only instrumentation uses the post-budget render cues, not theoretical
    // maxima. Only publish every >=500ms; never set React state inside the R3F loop.
    // WebGLRenderer.info counters describe a renderer snapshot, not GPU timings.
    if(concertFxV810?.qualityDashboardV826!==false){
      if(accumulateConcertFrameV826(qualityMonitorV826.current,delta,tier==='low'?30:60)){
      const c=particlesCueV816.current,f=foamCueV817.current,k=kineticCueV817.current,
        sp=spectralCueV818.current,crowd=crowdCueV815.current;
      const info=state.gl.info;
      const snapshot=completeConcertQualityV826(qualityMonitorV826.current,{
        playing:isPlaying&&playback.playing,verified:fxCueV810.active&&fxCueV810.reason==='music',
        targetFps:tier==='low'?30:60,pressure:fxPerfStateV825.current.pressure,
        fxActive:fxPerfV825.active,fxCapacity:fxPerfV825.capacity,fxCost:fxPerfV825.cost,
        gains:fxPerfV825.gains,performanceTier:tier,
        autoQualityPressureV827:autoQualityStateV827.current.pressure,
        autoQualityReasonV827:autoQualityStateV827.current.reason,
        qualityDirectorPressureV980:qualityEnabledV980?qualityDirectorStateV980.current.pressure:undefined,
        qualityDirectorReasonV980:qualityEnabledV980?qualityDirectorStateV980.current.reason:undefined,
        qualityDirectorObservationsV980:qualityEnabledV980?qualityDirectorStateV980.current.observations:undefined,
        cameraAwareReasonV834:cameraBudgetV834.reason,
        cameraAwareSavingsV834:cameraBudgetV834.relativeCostSaved,
        cameraIntentV834:cameraBudgetV834.intent??undefined,
        counts:{crowd:crowd.active?crowd.count:0,
          sparks:c.active?c.sparks:0,shards:c.active?c.shards:0,confetti:c.active?c.confetti:0,
          energyRings:c.active?c.rings:0,foamBubbles:f.active?f.bubbles:0,foamMist:f.active?f.mist:0,
          kineticColumns:k.active?k.columns:0,
          spectralWaves:sp.active?sp.waves:0,spectralRings:sp.active?sp.rings:0,
          spectralPrisms:sp.active?sp.prisms:0},
        rendererCalls:info.render.calls,rendererTriangles:info.render.triangles,
        rendererGeometries:info.memory.geometries,rendererTextures:info.memory.textures});
      // V827 uses only completed V826 sample windows: no per-frame tuner allocations.
      // The verified V810 authority, manual FX switches and V825 floors still win.
      advanceAutomaticQualityV827(autoQualityStateV827.current,{snapshot,
        enabled:!qualityEnabledV980&&concertFxV810?.autoQualityV827!==false&&liveShowV827,
        optimizerEnabled:concertFxV810?.perfOptimizerV825!==false,
        response:concertFxV810?.autoResponseV827??'balanced'});
      // V980 replaces V827 feedback only while explicitly opted in: no competing
      // regulators, no extra telemetry loop or extra Three.js allocations.
      // Only evaluate seek discontinuities at the completed V826 measurement window.
      // A real seek to another part of the same track clears previous auto pressure.
      const trackScopeV980=qualityTrackScopeV980.current;
      const songIdV980=playback.trackId??'';
      if(trackScopeV980.trackId!==songIdV980){
        trackScopeV980.trackId=songIdV980;trackScopeV980.epoch=0;trackScopeV980.positionMs=NaN;
      }else if(Number.isFinite(trackScopeV980.positionMs)&&Number.isFinite(playback.positionMs)&&
        Math.abs(playback.positionMs-trackScopeV980.positionMs)>5000){
        trackScopeV980.epoch++;
      }
      trackScopeV980.positionMs=playback.positionMs;
      advanceConcertQualityDirectorV980(qualityDirectorStateV980.current,{
        snapshot,enabled:qualityEnabledV980,optimizerEnabled:concertFxV810?.perfOptimizerV825!==false,
        // The enclosing V826 guard already proves telemetry is enabled.
        telemetryEnabled:true,
        tier,allowLowTier:concertFxV810?.concertQualityPiV980===true,
        restore:concertFxV810?.concertQualityRecoveryV980!==false,
        mode:concertFxV810?.concertQualityModeV980??'balanced',
        scopeKey:songIdV980?`${songIdV980}:${trackScopeV980.epoch}`:''});
      snapshot.qualityDirectorPressureV980=qualityEnabledV980?qualityDirectorStateV980.current.pressure:undefined;
      snapshot.qualityDirectorReasonV980=qualityEnabledV980?qualityDirectorStateV980.current.reason:undefined;
      snapshot.qualityDirectorObservationsV980=qualityEnabledV980?qualityDirectorStateV980.current.observations:undefined;
      // V981 read-only diagnostics: completed V826 windows, same seek-safe scope as V980.
      snapshot.performanceInsightV981=analyzeConcertPerformanceV981(performanceIntelligenceV981.current,
        snapshot,songIdV980?`${songIdV980}:${trackScopeV980.epoch}`:'')??undefined;
      recordBenchmarkWindowV827({snapshot,count:groupCountV542,trackId:playback.trackId??'',
        liveShow:liveShowV827,targetSeconds:12});
      // V832: real scene and renderer evidence, sampled at most twice per second.
      // Count actual V830 SkinnedMeshes, NOT merely configured performer slots.
      // Draw-buffer pixels describe physical WebGL resolution including DPR.
      recordRealGlbWindowV832({snapshot,
        proof:inspectVisibleCastV830(state.scene,groupCountV542),
        configuredCount:groupCountV542,trackId:playback.trackId??'',
        progressMs:playback.positionMs,liveShow:liveShowV827,
        pixelsX:state.gl.domElement.width,pixelsY:state.gl.domElement.height,
        fxSignature:JSON.stringify(normalizeConcertFxV810(concertFxV810))});
      // V830: verify visible skinned meshes in the actual performer slot roots.
      // Collect only at a finished V826 measurement window, never per frame.
      // This runs before V829 may finalize and clear the active case on last window.
      recordCastWindowV830({key:getAcceptanceV829().active,scene:state.scene,
        expected:groupCountV542,trackId:playback.trackId??'',progressMs:playback.positionMs,
        playing:snapshot.playing,verified:snapshot.verified&&snapshot.available&&snapshot.sampleCount>=6&&snapshot.p95FrameMs>0,liveShow:liveShowV827});
      // V829 records REAL nearly-complete songs (no synthetic quality verdict).
      recordAcceptanceV829({snapshot,genre:fxCueV810.genre,count:groupCountV542,trackId:playback.trackId??'',
        progressMs:playback.positionMs,durationMs:playback.durationMs,section:fxCueV810.section,
        liveShow:liveShowV827});
      // V908: capture the SAME completed V826 snapshot and V830 visible rig proof.
      // Read by the existing V901 subscription; no extra RAF, listener or mesh allocation.
      publishLiveStageProofV908(makeStageWindowProofV908(snapshot,
        inspectVisibleCastV830(state.scene,groupCountV542),playback.trackId??'',playback.positionMs,
        inspectVisibleCastV830(state.scene,4)));
      publishConcertQualityV826(snapshot);qualityPublishedV826.current=true;
      }
    }else{
      // No telemetry means no evidence for either regulator; drop cached overrides.
      clearAdaptiveQualityV980(qualityDirectorStateV980.current);
      clearPerformanceIntelligenceV981(performanceIntelligenceV981.current);
      autoQualityStateV827.current.pressure=0;
      autoQualityStateV827.current.badWindows=0;
      autoQualityStateV827.current.goodWindows=0;
      autoQualityStateV827.current.reason='off';
      if(qualityPublishedV826.current){
        clearLiveStageProofV908();clearConcertQualityV826();qualityPublishedV826.current=false;
      }
    }
    // V888: never raises the old V811 opacity ceiling or bypasses V810/V823/850.
    // A shared, song-scoped V604 storyboard selects shapes; V811 remains the fallback.
    const laserShowV888=planLaserShowV888({
      settings:liveSignalV882.laserSettingsV888??DEFAULT_LASER_SHOW_V888,
      plan:liveSignalV882.atmospherePlan,
      trackId:playback.trackId,durationMs:playback.durationMs,
      positionMs:playback.positionMs,playing:isPlaying&&playback.playing&&reactive,
      autoEnabled:liveSignalV882.enabled,reducedMotion,
      seekBlocked:playback.positionMs<(liveSignalV882.atmosphereSeekBlockedUntilMs??0),
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false,
      manualLaser:authoredFxV823.laser.boost>.001||authoredFxV823.laser.mute>.001||authoredLanesV850.includes('laser'),
      manualFx:liveSignalV882.manual!==null,
      lyricsProtected:lyricsProtectedV542||lyricsVisibleV813||vocalFocusV542,
      tier,budget:getVisualFactorsV640().beams,
      performanceGain:laserGainV823*concertArcLaserGainV880,
      existingLaserOpacity:fxCueV810.laserOpacity,
      laserEnabled:concertFxV810?.lasers!==false&&fxCueV810.active&&fxCueV810.reason==='music',
    });
    const laser=laserMaterialV811.current;
    if(laser){
      const lu=laser.uniforms;
      // Fail closed on pause, seek, song replacement and blackout (no lingering cue).
      const targetPower=epicV892.active&&laserShowV888.active?
        Math.min(.95,laserShowV888.power*epicV892.laserGain):laserShowV888.power;
      lu.uLaser88Power.value=laserShowV888.active?
        lu.uLaser88Power.value+(targetPower-lu.uLaser88Power.value)*
          (1-Math.exp(-Math.min(Math.max(delta,0),.1)*6)):0;
      lu.uLaser88Mode.value=laserShowV888.mode;
      lu.uLaser88Phase.value=laserShowV888.phase;
      lu.uLaser88Motion.value=laserShowV888.motion;
      lu.uLaser88Spread.value=laserShowV888.spread;

      const alpha=1-Math.exp(-Math.min(Math.max(delta,0),.1)*7);
      laser.uniforms.uOpacity.value+=(Math.min(.20,fxCueV810.laserOpacity*(1+beatV822.laser*.22)*laserGainV823*concertArcLaserGainV880*(authoredFxV823.laser.boost>.001||authoredFxV823.laser.mute>.001?1:laserBlendV849))-laser.uniforms.uOpacity.value)*alpha;
      laser.uniforms.uRibbons.value=Math.min(.35,fxCueV810.ribbonGain*(1+beatV822.laser*.18)*laserGainV823*concertArcLaserGainV880);
      laser.uniforms.uLaserOn.value=concertFxV810?.lasers!==false?1:0;
      laser.uniforms.uPhase.value=fxCueV810.phase;
      laser.uniforms.uMode.value=fxCueV810.ledStyle;
      (laser.uniforms.uPrimary.value as Color).set(laserShowV888.active&&
        (liveSignalV882.laserSettingsV888?.useScenePalette??true)?laserShowV888.primary:fxCueV810.primary);
      (laser.uniforms.uSecondary.value as Color).set(laserShowV888.active&&
        (liveSignalV882.laserSettingsV888?.useScenePalette??true)?laserShowV888.secondary:fxCueV810.secondary);
      if(laserMeshV811.current)laserMeshV811.current.visible=laser.uniforms.uOpacity.value>.001&&
        tier!=='low'&&fxCueV810.reason==='music';
    }
    const wallV821=planLedWallExperienceV821({fx:fxCueV810,
      settings:(experienceV828.active&&experienceV828.ledLook!=='auto'?experienceV828.ledLook:smartMixV824.ledLook)==='auto'?concertFxV810:
        {...normalizeConcertFxV810(concertFxV810),ledLookV821:experienceV828.active&&experienceV828.ledLook!=='auto'?experienceV828.ledLook:smartMixV824.ledLook},
      tier,budget:ledBudgetV640,lyricsProtected:lyricsProtectedV542,
      vocalFocus:vocalFocusV542,groupCount:groupCountV542});
    if(led){
      led.uniforms.uBeat22Kick.value=wallV821.active?beatV822.kick:0;
      led.uniforms.uBeat22Snare.value=wallV821.active?beatV822.snareLike:0;
      led.uniforms.uBeat22Peak.value=wallV821.active?beatV822.peak:0;
      led.uniforms.uLed21Power.value=Math.min(.38,wallV821.power*ledGainV823*concertArcLedGainV880*(authoredFxV823.led.boost>.001||authoredFxV823.led.mute>.001?1:ledBlendV849));
      led.uniforms.uLed21Look.value=wallV821.look;
      led.uniforms.uLed21Bass.value=wallV821.bass;
      led.uniforms.uLed21Mids.value=wallV821.mids;
      led.uniforms.uLed21Highs.value=wallV821.highs;
      led.uniforms.uLed21Drop.value=Math.min(.8,wallV821.dropAccent*ledGainV823*concertArcLedGainV880*(authoredFxV823.led.boost>.001||authoredFxV823.led.mute>.001?1:ledBlendV849));
      led.uniforms.uLed21Phase.value=wallV821.phase;
      led.uniforms.uLed21Tempo.value=wallV821.tempo;
      led.uniforms.uLed21Variation.value=wallV821.variation+(experienceV828.active?experienceV828.signature*.18:0);
      // Existing LED architecture morph; do not allocate or reposition meshes.
      if(experienceV828.active&&led.uniforms.uStageMorph){
        led.uniforms.uStageMorph.value=Math.min(.75,led.uniforms.uStageMorph.value+experienceV828.architectureMotion);
      }
      led.uniforms.uFxPower.value=Math.min(1,fxCueV810.ledGain*ledGainV823*concertArcLedGainV880*(authoredFxV823.led.boost>.001||authoredFxV823.led.mute>.001?1:ledBlendV849));
      if(fxCueV810.ledGain>.001){
        (led.uniforms.uPrimary.value as Color).set(fxCueV810.primary);
        (led.uniforms.uSecondary.value as Color).set(fxCueV810.secondary);
      }
      led.uniforms.uFxStyle.value=fxCueV810.ledStyle;
      led.uniforms.uAudioBass.value=fxCueV810.bass;
      led.uniforms.uAudioMids.value=fxCueV810.mids;
      led.uniforms.uAudioHighs.value=fxCueV810.highs;
      // The original V647 layer remains the authority and stays behind performers.
    }
    moodTintV622.current.copy(coolTintV622.current).lerp(warmTintV622.current,Math.max(0,Math.min(1,(transformationV622.tone+1)/2+(stageScaleV690.warmth+musicMoodV691.warmth)*.18)));
    const environmentRateV622=reducedMotion?1:1-Math.exp(-Math.min(Math.max(delta,0),.1)*2.6*1);
    backgroundTargetV622.current.set(palette.base).lerp(moodTintV622.current,Math.min(.23,transformationV622.background+stageVisualV635.ambientTint*ledBudgetV640+stageScaleV690.ambientMix+evolutionRefV795.current.ambientMix));
    // V828 colors only the existing background/floor and only when V810 has
    // verified authority. Manual lighting remains an absolute stop.
    if(experienceV828.active&&!timelineCue.color&&!manualLightingV763){
      backgroundTargetV622.current.lerp(secondaryTintV828.current.set(fxCueV810.secondary),experienceV828.backgroundAccent);
    }
    if(liveAtmosphereV885.environmentMix>0&&!timelineCue.color){
      backgroundTargetV622.current.lerp(atmosphereAmbientV885.current.set(liveAtmosphereV885.ambient),liveAtmosphereV885.environmentMix*concertAtmosphereV1030.ambientGain);
    }
    if(state.scene.background instanceof Color){state.scene.background.lerp(backgroundTargetV622.current,environmentRateV622);}
    floorTargetV622.current.set(palette.floor).lerp(moodTintV622.current,Math.min(.26,transformationV622.floor+stageVisualV635.floorTint*ledBudgetV640+stageScaleV690.floorMix+evolutionRefV795.current.floorMix));
    if(experienceV828.active&&!timelineCue.color&&!manualLightingV763){
      floorTargetV622.current.lerp(secondaryTintV828.current,experienceV828.backgroundAccent*.58);
    }
    if(liveAtmosphereV885.environmentMix>0&&!timelineCue.color){
      floorTargetV622.current.lerp(atmosphereAmbientV885.current,liveAtmosphereV885.environmentMix*.8*concertAtmosphereV1030.ambientGain);
    }
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
    // V793: verified V604 act + V761 storyboard, same playback as camera V792.
    // Completely bypass on authored cues, blackout, protected motion and low tier.
    const choreographyV793=planAdvancedLightChoreographyV793({
      trackId:playback.trackId,durationMs:playback.durationMs,positionMs:playback.positionMs,
      playing:isPlaying&&playback.playing,reactive,reducedMotion,tier,
      authored:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false||
        !concertShowLightingV387||timelineGainV354!==1,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||
        timelineGainV354<=0,lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,
      genre,energy:audio.energyEnvelope??audio.bass??0,kick:audio.kickAccentIntensity??0,
      scene:cinematicCueV761,narrative:cameraNarrativeV605,
    });
    lightChoreographyV793.current=choreographyV793;
    // V841: bounded refinements of existing shaders/spotlight, from VERIFIED V793
    // choreography only. Fail closed on authored cues, low tier or blackout.
    const actSectionV841=choreographyV793.active?
      cameraNarrativeV605?.plan.acts[cinematicCueV761?.actIndex??-1]?.section??'':'off';
    const professionalV841=planProfessionalLightingV841({
      settings:{professionalLightingV841:concertFxV810?.professionalLightingV841!==false,
        lightingStrengthV841:concertFxV810?.lightingStrengthV841??65,
        lightingStyleV841:concertFxV810?.lightingStyleV841??'balanced'},
      choreography:choreographyV793,section:actSectionV841,
      positionMs:playback.positionMs,durationMs:playback.durationMs,
      sceneBlend:cinematicCueV761?.blend??0,
      enabledFx:concertFxV810?.enabled!==false&&fxCueV810.active,
      playing:isPlaying&&playback.playing,reducedMotion,tier,
      manualLighting:manualLightingV763||authoredLightsV386||timelineGainV354!==1||
        showCue?.lightingEnabled===false,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,
      lasersEnabled:concertFxV810?.lasers!==false&&fxCueV810.laserOpacity>0&&
        authoredFxV823.laser.boost<=.001&&authoredFxV823.laser.mute<=.001&&laserGainV823>0,
      gobosAvailable:scenicLightingV762?.enabled!==true,
      energy:audio.energyEnvelope??audio.bass??0,kick:audio.kickAccentIntensity??0,
      laserBudget:getVisualFactorsV640().beams,goboBudget:budgetV772.centerSpot?1:0,
    });
    // V842: extend the EXISTING single LED shader, after V841 confirmed light cue.
    // V823 manually authored LED lanes and explicit V821 modes take absolute priority.
    const wallDepthV842=planLedWallExperienceV842({
      fx:fxCueV810,wall:wallV821,settings:concertFxV810,light:professionalV841,
      section:fxCueV810.section,playing:isPlaying&&playback.playing,reducedMotion,tier,
      budget:ledBudgetV640,timelineGain:Math.min(1,Math.max(0,ledGainV823)),
      manualLed:authoredFxV823.led.boost>.001||authoredFxV823.led.mute>.001,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false||
        timelineGainV354!==1,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0,
      lyricsProtected:lyricsProtectedV542,vocalFocus:vocalFocusV542,groupCount:groupCountV542,
    });
    if(led){
      const u=led.uniforms;
      u.uLed42Power.value=wallDepthV842.power*(authoredFxV823.led.boost>.001||authoredFxV823.led.mute>.001?1:ledBlendV849);
      u.uLed42Mode.value=wallDepthV842.mode;
      u.uLed42Depth.value=wallDepthV842.depth;
      u.uLed42Geometry.value=wallDepthV842.geometry;
      u.uLed42Tunnel.value=wallDepthV842.tunnel;
      u.uLed42Phase.value=wallDepthV842.phase;
      u.uLed42Flow.value=wallDepthV842.flow;
      u.uLed42LightLink.value=wallDepthV842.lightLink;
    }
    // V870: the same verified V810/V821/V842 evidence; no independent phase/mesh.
    const wallMotifV870=planLedWallMotifsV870({
      fx:fxCueV810,wall:wallV821,depth:wallDepthV842,settings:concertFxV810,
      section:fxCueV810.section,playing:isPlaying&&playback.playing,reducedMotion,tier,
      budget:ledBudgetV640,timelineGain:Math.min(1,Math.max(0,ledGainV823)),
      manualLed:authoredFxV823.led.boost>.001||authoredFxV823.led.mute>.001,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false||
        timelineGainV354!==1,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0,
      lyricsProtected:lyricsProtectedV542,lyricsVisible:lyricsVisibleV813,
      vocalFocus:vocalFocusV542,groupCount:groupCountV542,
      cameraCloseup:concertLipSyncV386?.cinematicSceneV528?.active===true&&vocalFocusV542,
      manualCamera:cameraNarrativeV605?.manualCamera===true,
    });
    if(led){
      const u=led.uniforms;
      u.uLed70Power.value=wallMotifV870.power*(authoredFxV823.led.boost>.001||authoredFxV823.led.mute>.001?1:ledBlendV849);
      u.uLed70Mode.value=wallMotifV870.mode;
      u.uLed70Phase.value=wallMotifV870.phase;
      u.uLed70Bass.value=wallMotifV870.bass;
      u.uLed70Mids.value=wallMotifV870.mids;
      u.uLed70Camera.value=wallMotifV870.camera;
    }
    // V886 creative patterns share the exact V821 LED mesh/shader and the V810
    // verified musical act. Existing authored lanes, blackout and lyrics win.
    const ledCreativeV886=planLedWallCreativeV886({
      fx:fxCueV810,wall:wallV821,settings:concertFxV810,section:fxCueV810.section,
      playing:isPlaying&&playback.playing,reducedMotion,tier,
      budget:ledBudgetV640,timelineGain:Math.min(1,Math.max(0,ledGainV823)),
      manualLed:authoredFxV823.led.boost>.001||authoredFxV823.led.mute>.001,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false||
        timelineGainV354!==1,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0,
      lyricsProtected:lyricsProtectedV542,lyricsVisible:lyricsVisibleV813,
      vocalFocus:vocalFocusV542,groupCount:groupCountV542,
      cameraCloseup:concertLipSyncV386?.cinematicSceneV528?.active===true&&vocalFocusV542,
      manualCamera:cameraNarrativeV605?.manualCamera===true,
    });
    if(led){
      const u=led.uniforms;
      u.uLed86Power.value=(epicV892.active&&ledCreativeV886.active?
        Math.min(.95,ledCreativeV886.power*epicV892.ledGain):ledCreativeV886.power)*
        concertDirectorV895.ledGain*energyCueV896.ledGain*
        (authoredFxV823.led.boost>.001||authoredFxV823.led.mute>.001?1:ultimateStageV900.ledGain)*
        (authoredFxV823.led.boost>.001||authoredFxV823.led.mute>.001?1:ledBlendV849);
      u.uLed86Mode.value=ledCreativeV886.mode;
      u.uLed86Phase.value=ledCreativeV886.phase;
      u.uLed86Bass.value=ledCreativeV886.bass;
      u.uLed86Mids.value=ledCreativeV886.mids;
      u.uLed86Highs.value=ledCreativeV886.highs;
      u.uLed86Motion.value=ledCreativeV886.motion;
      u.uLed86Camera.value=ledCreativeV886.camera;
    }
    // V990: one extra genre-sensitive line motif on the existing wall. V886
    // validates verified music and all guards; no separate clock or LED lane.
    const livingLedV990=planLivingLedWallV990({
      fx:fxCueV810,wall:wallV821,settings:concertFxV810,section:fxCueV810.section,
      playing:isPlaying&&playback.playing,reducedMotion,tier,
      budget:ledBudgetV640*getConcertFactorsV999().led*immersiveCueV1000.gains.led,timelineGain:Math.min(1,Math.max(0,ledGainV823)),
      manualLed:authoredFxV823.led.boost>.001||authoredFxV823.led.mute>.001,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false||
        timelineGainV354!==1,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0,
      lyricsProtected:lyricsProtectedV542,lyricsVisible:lyricsVisibleV813,
      vocalFocus:vocalFocusV542,groupCount:groupCountV542,
      cameraCloseup:concertLipSyncV386?.cinematicSceneV528?.active===true&&vocalFocusV542,
      manualCamera:cameraNarrativeV605?.manualCamera===true,
    });
    if(led){
      const u=led.uniforms;
      u.uLed90Power.value=livingLedV990.power*concertDirectorV895.ledGain*
        energyCueV896.ledGain*ultimateStageV900.ledGain*ledBlendV849;
      u.uLed90Mode.value=livingLedV990.mode;
      u.uLed90Phase.value=livingLedV990.phase;
      u.uLed90Motion.value=livingLedV990.motion;
      u.uLed90Bass.value=livingLedV990.bass;
      u.uLed90Mids.value=livingLedV990.mids;
      u.uLed90Highs.value=livingLedV990.highs;
      u.uLed90Accent.value=livingLedV990.accent;
    }
    // V894: tint the EXISTING LED-wall color uniforms very gently as well.
    // Never change manually authored LED lanes or create a parallel shader.
    if(led&&genreStageCueV894.current.active&&genreStageCueV894.current.lightMix>0&&
      !manualLightingV763&&!timelineCue.color&&
      authoredFxV823.led.boost<=.001&&authoredFxV823.led.mute<=.001&&
      ledGainV823>0&&(fxCueV810.ledGain>.001||stageVisualV635.active)){
      const mixV894=genreStageCueV894.current.lightMix*.55;
      (led.uniforms.uPrimary.value as Color).lerp(
        genreStagePrimaryV894.current.set(genreStageCueV894.current.primary),mixV894);
      (led.uniforms.uSecondary.value as Color).lerp(
        genreStageSecondaryV894.current.set(genreStageCueV894.current.secondary),mixV894);
    }
    // V1029 post-budget LED hierarchy, shared across every existing wall shader.
    // Zero stays zero. No new mesh, materials, shader or GPU upload is allocated.
    if(led&&visualDirectorV1029.active){
      for(const uniform of VISUAL_LED_UNIFORMS_V1029){
        const layer=led.uniforms[uniform];
        if(layer&&Number.isFinite(layer.value)&&layer.value>0)
          layer.value*=visualDirectorV1029.ledGain;
      }
    }
    // Explicit scenic settings have priority over the automatic V841 floor Gobo.
    if(goboMaterialV762.current){
      const u=goboMaterialV762.current.uniforms;
      u.uScale.value=professionalV841.active&&professionalV841.goboOpacity>0?professionalV841.goboScale:1;
      if(professionalV841.active&&professionalV841.goboOpacity>0){
        u.uOpacity.value=professionalV841.goboOpacity;
        u.uPattern.value=professionalV841.goboPattern;
        u.uPhase.value=professionalV841.goboPhase;
        if(goboMeshV762.current)goboMeshV762.current.visible=true;
      }
    }
    if(laserMaterialV811.current){
      laserMaterialV811.current.uniforms.uFanSpread.value=professionalV841.active?professionalV841.laserSpread:1;
      laserMaterialV811.current.uniforms.uFanMotion.value=professionalV841.active?professionalV841.laserMotion:0;
    }
    const lightingBlendV609=planSeamlessConcertTransitionV609({
      narrative:cameraNarrativeV605,trackId:playback.trackId,
      positionMs:playback.positionMs,playing:isPlaying&&playback.playing,
      reducedMotion,tier,manualCamera:true,
      manualLighting:authoredLightsV386||!reactive||
        timelineCue.blackout>0||timelineCue.strobe>0||timelineGainV354<=0||
        showCue?.lightingEnabled===false,
    });
    const lerp=1-Math.exp(-Math.min(Math.max(delta,0),.1)*9*Math.min(lightingBlendV609.lightingRate,!(authoredLightsV386||!reactive||manualLightingV763||timelineCue.blackout>0||timelineCue.strobe>0||timelineGainV354<=0)&&transitionV791?.active?transitionV791.lightingRate:1));
    const colorFade=reducedMotion?1:1-Math.exp(-Math.min(Math.max(delta,0),.1)*2.4*Math.min(lightingBlendV609.lightingRate,!(authoredLightsV386||!reactive||manualLightingV763||timelineCue.blackout>0||timelineCue.strobe>0||timelineGainV354<=0)&&transitionV791?.active?transitionV791.lightingRate:1));
    // V794 accents only the existing beam + architecture in automatic scenes.
    // Authored lighting, blackouts, singer focus and lyric visibility take priority.
    const peakLightingAllowedV794=epicPeakV794?.active===true&&
      epicPeakV794.trackId===playback.trackId&&epicPeakV794.durationMs===playback.durationMs&&
      playback.positionMs>=epicPeakV794.sceneStartMs&&playback.positionMs<epicPeakV794.sceneEndMs&&
      !authoredLightsV386&&!manualLightingV763&&reactive&&isPlaying&&playback.playing&&
      !reducedMotion&&tier!=='low'&&concertShowLightingV387&&
      timelineCue.blackout<=0&&timelineCue.strobe<=0&&timelineCue.scale>0&&
      timelineGainV354>0;
    // Separate ref prevents V789 from bypassing actual saved timeline blackouts.
    peakCueRefV794.current=peakLightingAllowedV794?epicPeakV794:null;
    const peakBeamGainV794=peakLightingAllowedV794&&!lyricsProtectedV542&&
      !vocalFocusV542?Math.max(.78,Math.min(1.09,epicPeakV794?.lightingGain??1)):1;
    // V497 uses only existing rig lights; do not brighten manual timelines or blackouts.
    const cinematicKeyV497=concertLightMultiplierV497(cinematicCueV497,"key",{
      authored:authoredLightsV386,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      playing:isPlaying&&reactive,reducedMotion,lowTier:tier==="low"});
    const cinematicBeamV497=concertLightMultiplierV497(cinematicCueV497,"beam",{
      authored:authoredLightsV386,
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      playing:isPlaying&&reactive,reducedMotion,lowTier:tier==="low"});
    const storyGainV1131=storyV1131&&isPlaying&&!reducedMotion&&reactive&&!manualLightingV763&&!authoredLightsV386&&timelineCue.blackout<=0&&timelineCue.strobe<=0?storyV1131.lightGain:1;
    const scoreBeamV1134=storyV1131&&isPlaying&&!reducedMotion&&reactive&&!manualLightingV763&&!authoredLightsV386&&timelineCue.blackout<=0&&timelineCue.strobe<=0?storyV1131.beamGain:1;
    const showGain = (reactive&&isPlaying&&!reducedMotion&&!manualLightingV763&&!authoredLightsV386?lyricPriorityV1133.effectGain:1) * storyGainV1131 * festivalLightV387 * lightAccentV386.gain * (reactive && isPlaying && !reducedMotion ? (showCue?.lightGain ?? 1) : 1) * (composition?.lightGain ?? 1) * (reducedMotion||timelineCue.blackout>0?1:timelineGainV354);
    const showBeam = scoreBeamV1134 * (reactive&&isPlaying&&!reducedMotion&&!manualLightingV763&&!authoredLightsV386?lyricPriorityV1133.effectGain:1) * festivalBeamV387 * lightAccentV386.beamGain * (reactive && isPlaying && !reducedMotion ? (showCue?.beamGain ?? 1) : 1) * (composition?.beamGain ?? 1) * (reducedMotion||timelineCue.blackout>0?1:timelineGainV354);
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
    // V885: subtle tint only of existing automatic light targets. Never override manual colors.
    if(liveAtmosphereV885.lightsMix>0&&!timelineCue.color){
      targetPrimary.current.lerp(atmospherePrimaryV885.current.set(liveAtmosphereV885.primary),liveAtmosphereV885.lightsMix);
      targetSecondary.current.lerp(atmosphereSecondaryV885.current.set(liveAtmosphereV885.secondary),liveAtmosphereV885.lightsMix);
    }
    // A maximum 14% tint on existing automatic color targets, after V885.
    const genreLookV894=genreStageCueV894.current;
    if(genreLookV894.active&&genreLookV894.lightMix>0&&!timelineCue.color){
      targetPrimary.current.lerp(genreStagePrimaryV894.current.set(genreLookV894.primary),genreLookV894.lightMix);
      targetSecondary.current.lerp(genreStageSecondaryV894.current.set(genreLookV894.secondary),genreLookV894.lightMix);
    }
    // V1026: concert-camera/verified-act lighting finish for the EXISTING four lights.
    // V604 + V761 must both confirm the same track/act. V749 alone validates singer slots.
    // Saved timelines, manual lighting, actual blackout and seek locks override this layer.
    const stageLightV1026=planIntelligentStageLightingV1026({
      narrative:cameraNarrativeV605,cinematic:cinematicCueV761,
      trackId:playback.trackId,durationMs:playback.durationMs,positionMs:playback.positionMs,
      playing:isPlaying&&playback.playing,reactive,reducedMotion,tier,genre,
      manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false||!concertShowLightingV387,
      manualFx:!!liveSignalV882.manual,seekBlocked:playback.positionMs<(liveSignalV882.atmosphereSeekBlockedUntilMs??0),
      blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,
      lyricsProtected:!!lyricsProtectedV542,lyricsVisible:!!lyricsVisibleV813,vocalFocus:!!vocalFocusV542,
      groupCount:groupCountV542,focusSlot:lightingV749.focusSlot,partnerSlot:lightingV749.partnerSlot,
      energy:audio.energyEnvelope??audio.bass??0,kick:audio.kickAccentIntensity??0,
    });
    if(stageLightV1026.active&&stageLightV1026.colorMix>0&&!timelineCue.color){
      stageLightTintV1026.current.set(stageLightV1026.color);
      targetPrimary.current.lerp(stageLightTintV1026.current,stageLightV1026.colorMix);
      targetSecondary.current.lerp(stageLightTintV1026.current,stageLightV1026.colorMix*.65);
    }
    // V1030 slightly unifies the already selected live key/fill palettes.
    // Authored color/manual cues and the V1026 portrait light are authoritative.
    if(concertAtmosphereV1030.active&&!timelineCue.color)
      targetSecondary.current.lerp(targetPrimary.current,concertAtmosphereV1030.fillColorBlend);
    if (key.current) key.current.color.lerp(targetPrimary.current, colorFade);
    if (fill.current) fill.current.color.lerp(targetSecondary.current, colorFade);
    if (floorLight.current) floorLight.current.color.lerp(
      targetPrimary.current.set(timelineCue.color ?? musicPalette?.primary ?? palette.primary),colorFade);
    if (beam.current) beam.current.color.lerp(
      targetSecondary.current.set(musicPalette?.secondary ?? palette.secondary),colorFade);
    // Virtual key/fill only. Existing manual colors, consent and blackouts remain authoritative.
    if(storyV1131?.production&&isPlaying&&reactive&&!reducedMotion&&!manualLightingV763&&!authoredLightsV386&&!timelineCue.color&&timelineCue.blackout<=0&&timelineCue.strobe<=0&&timelineCue.scale>0&&timelineGainV354>0&&showCue?.lightingEnabled!==false){
      productionColor.current.set(storyV1131.production.color);
      if(key.current)key.current.color.lerp(productionColor.current,colorFade*(storyV1131.lyricFocus?.06:.18));
      if(fill.current)fill.current.color.lerp(productionColor.current,colorFade*(storyV1131.lyricFocus?.12:.42));
    }
    // V797: only existing portrait lights, no new fixtures/renderer pass.
    // Cross-check the LIVE authored timeline and blackout, not only the UI flag.
    const vocalSafeV797=!!vocalSpotlightV797?.lightingActive&&!authoredLightsV386&&
      isPlaying&&reactive&&!reducedMotion&&tier!=='low'&&
      !timelineCue.color&&timelineCue.blackout<=0&&timelineCue.strobe<=0&&
      timelineCue.scale>0&&timelineGainV354>0&&showCue?.lightingEnabled!==false;
    const vocalKeyV797=vocalSafeV797?(vocalSpotlightV797?.keyGain??1):1;
    const vocalFillV797=vocalSafeV797?(vocalSpotlightV797?.fillGain??1):1;
    const portraitV1135=portraitContrastV1135(storyV1131,{playing:isPlaying&&reactive,reducedMotion,manual:manualLightingV763||authoredLightsV386||vocalSafeV797,blackout:timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0});
    const keyTargetV462=Math.min(3,Math.max(lightingV542.faceFloor||lightingV462.faceFloor,directed(cue.key)*lightScale*showGain*lightingV462.keyGain*lightingV542.keyGain*lightingV551.keyGain*lightingV608.key*lightingMixV749Now.key*concertGenreV610.key*lightingV621.key*concertContinuityV611.key*cinematicKeyV497)*performerPlanV557.keyGain*vocalKeyV797*portraitV1135.key);
    const fillTargetV462=Math.min(2.4,Math.max(Math.max(lightingV462.faceFloor,lightingV542.faceFloor)*.75,directed(cue.fill)*lightScale*showGain*lightingV462.fillGain*lightingV542.fillGain*lightingV551.fillGain*lightingV608.fill*lightingMixV749Now.fill*concertGenreV610.fill*lightingV621.fill*concertContinuityV611.fill)*performerPlanV557.fillGain*vocalFillV797*portraitV1135.fill);
    // V559 applies only capped percentages to existing V462/V557 light targets.
    // These factors never overpower a manual cue, low tier, pause, or blackout.
    const beatKeyTargetV559=Math.min(3,keyTargetV462*(1+beatPortraitPlanV559.keyLift*beatScaleV559+cinematicPlanV566.keyLift*cinematicScaleV566));
    const beatFillTargetV559=Math.min(2.4,fillTargetV462*(1+beatPortraitPlanV559.fillLift*beatScaleV559+cinematicPlanV566.fillLift*cinematicScaleV566));
    if (key.current) key.current.intensity += (Math.min(3,beatKeyTargetV559*stageLightV1026.keyGain)-key.current.intensity)*lerp;
    if (fill.current) fill.current.intensity += (Math.min(2.4,beatFillTargetV559*stageLightV1026.fillGain)-fill.current.intensity)*lerp;
    if (floorLight.current) floorLight.current.intensity += ((sceneFlags.extraLights ? Math.min(2.5,directed(cue.floor) * lightScale * showGain * stageLightV1026.floorGain) : 0) - floorLight.current.intensity) * lerp;
    // V844: optional narrow stage-floor strobe, never a fullscreen or portrait flash.
    // Apply after normal lighting interpolation, under the original budget visibility mask.
    if(floorLight.current&&floorLight.current.visible&&festivalCueV844.current.strobeGain>0)
      floorLight.current.intensity=Math.min(2.5,floorLight.current.intensity+festivalCueV844.current.strobeGain);
    if (beam.current) {
      beam.current.intensity += ((sceneFlags.extraLights ? (theme === "minimal" ? .2 : Math.min(3.0,directed(cue.beam) * (1 + smartCue.sweep * .12) * showBeam * lightingV462.beamGain * lightingV542.beamGain * lightingV551.beamGain * lightingV608.beam * lightingMixV749Now.beam * concertGenreV610.beam * lightingV621.beam * concertContinuityV611.beam * cinematicBeamV497*scenicCueV762.current.beamGain * peakBeamGainV794 * (lightAccentV386.focusSlot===null&&!(cinematicBeamV497>1&&cinematicCueV497?.focusSlot!=null)?choreographyV793.beamGain:1))) * lightScale * liveCueV882.beamGain * stageLightV1026.beamGain * visualDirectorV1029.beamGain : 0) - beam.current.intensity) * lerp;
      beam.current.position.x = sceneFlags.beamSweep && cue.sweep && !reducedMotion && tier === "high"
        ? Math.sin(state.clock.elapsedTime * .65) * (1.2 + cue.sweep + director.sweep + predictive.anticipation * .15 + smartCue.sweep * .24) * lightingV462.sweepGain * lightingV542.sweepGain * lightingV551.sweepGain * lightingV608.sweep * lightingMixV749Now.sweep * concertGenreV610.sweep * lightingV621.sweep * concertContinuityV611.sweep : 0;
      if(scenicCueV762.current.active&&sceneFlags.beamSweep&&!lyricsProtectedV542&&
          (cinematicCueV497?.focusSlot===null||cinematicCueV497?.focusSlot===undefined)&&
          lightAccentV386.focusSlot===null){
        beam.current.position.x=Math.max(-2.1,Math.min(2.1,beam.current.position.x+scenicCueV762.current.beamOffset));
      }
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
    // V793: steer only the existing shadow-free spotlight. Singer-assigned beams
    // take priority, and disabling the choreography restores the neutral target.
    if(beam.current&&beamTargetV793.current){
      if(beam.current.target!==beamTargetV793.current)beam.current.target=beamTargetV793.current;
      const hasSingerBeam=lightAccentV386.focusSlot!==null||
        (cinematicBeamV497>1&&cinematicCueV497?.focusSlot!=null);
      const eligible=choreographyV793.active&&!hasSingerBeam&&
        sceneFlags.beamSweep&&sceneFlags.extraLights&&budgetV772.centerSpot;
      const rate=eligible?1-Math.exp(-Math.min(Math.max(delta,0),.1)*4):1;
      const targetX=eligible?choreographyV793.sweep*(professionalV841.active?professionalV841.sweepScale:1):0;
      const targetZ=eligible?choreographyV793.tilt:0;
      beamTargetV793.current.position.x+=(targetX-beamTargetV793.current.position.x)*rate;
      beamTargetV793.current.position.z+=(targetZ-beamTargetV793.current.position.z)*rate;
      const angle=eligible?.5+Math.min(.07,choreographyV793.depth*.10)+(professionalV841.active?professionalV841.angleAdd:0):.5;
      beam.current.angle+=(angle-beam.current.angle)*rate;
      // Beam gain is part of the already capped target above, never multiplied
      // onto the previous frame (which would accumulate extra brightness).
    }
    // V882: an additive, smooth sweep of the existing spotlight only when the
    // singer/vocal spotlight is not actively steering it. Never moves a camera.
    if(beam.current&&beam.current.visible&&liveCueV882.beamOffset!==0&&
       lightAccentV386.focusSlot===null&&cinematicCueV497?.focusSlot==null){
      beam.current.position.x=Math.max(-2.1,Math.min(2.1,
       beam.current.position.x+liveCueV882.beamOffset));
    }
    // V557: track real stage roots, not a synthetic singer position. Existing lights only.
    // Target position follows the actual performers with smooth, bounded travel and returns
    // to the authored default when no trusted cast is present or light cues take priority.
    followPerformerLightV557(state.scene,(vocalSafeV797?vocalSpotlightV797?.leadSlot:null)??performerPlanV557.focusSlot??lightingV749.focusSlot,homeKeyV557.current,
      key.current,followPositionV557.current,-.65,lerp,cinematicPlanV566.enabled?cinematicPlanV566.faceBalance:portraitPlanV558.faceBodyBalance);
    followPerformerLightV557(state.scene,(vocalSafeV797?vocalSpotlightV797?.partnerSlot:null)??(portraitPlanV558.enabled?portraitPlanV558.fillSlot:(performerPlanV557.partnerSlot??lightingV749.partnerSlot)),homeFillV557.current,
      fill.current,followPositionV557.current,.65,lerp,cinematicPlanV566.enabled?cinematicPlanV566.faceBalance:portraitPlanV558.faceBodyBalance);
    if (pulseMesh.current) {
      const visible = sceneFlags.pulse && tier !== "low" && theme !== "minimal" && reactive && isPlaying && !reducedMotion && cue.glow > .015;
      pulseMesh.current.visible = visible;
      if (visible) {
        pulseMesh.current.scale.setScalar(1 + Math.max(cue.pulse, director.pulse, predictive.kickRoll) * .7);
        (pulseMesh.current.material as MeshBasicMaterial).opacity = Math.min(.34, cue.glow * .3 * glowGainV353);
      }
    }
    // The concert layer takes ownership only of un-authored decorative defaults.
    sceneryGate.current={manual:manualLightingV763||authoredLightsV386||!!liveSignalV882.manual||showCue?.lightingEnabled===false||timelineCue.blackout>0||timelineCue.strobe>0||timelineCue.scale<=0||timelineGainV354<=0,pressure:fxPressureV980,lights:sceneFlags.extraLights,pulse:sceneFlags.pulse,tier};
    if(sceneryEnabled&&!readSceneryGate().manual){
      for(const mesh of [ledWallV635.current,laserMeshV811.current,lyricsWallV813.current,lyricsFloorV813.current,pulseMesh.current])if(mesh)mesh.visible=false;
      if(beam.current)beam.current.visible=false;
    }
  });
  return <group>
    {sceneryEnabled&&storyV1131&&<ConcertScenery track={track} cue={storyV1131} lyrics={lyricsV813??concertLipSyncV386?.lyrics} playing={isPlaying} reducedMotion={reducedMotion} gate={readSceneryGate}/>}
    <ConcertStageFxV882 cueRef={liveStageV882}/>
    {/* V997: decorative, opt-in observed-track handover; never takes camera/light ownership. */}
    <ConcertFlowBridgeV997 allowed={isPlaying&&!reducedMotion&&!manualLightingV763&&!lyricsProtectedV542}
      color={musicPalette?.secondary??palette.secondary}/>

    <VirtualPyroStageV891 cueRef={livePyroV891}/>
    <GenreStageArchitectureV894 cueRef={genreStageCueV894}/>
    <color attach="background" args={[palette.base]}/>
    <ambientLight intensity={theme === "minimal" ? 1.2 : 0.9}/>
    {/* V789: one instanced architectural backdrop, read-only to playback and authored cues. */}
    <VirtualConcertCrowdV815 cueRef={crowdCueV815}/>
    <IntelligentAudienceArmsV874 cueRef={crowdCueV815}/>
    <FestivalWristbandsV875 cueRef={crowdCueV815}/>
    <ReactiveParticleStudioV816 cueRef={particlesCueV816}/>
    <FestivalCo2V844 cueRef={festivalCueV844}/>
    <SoapBubblesV8441 cueRef={soapBubbleCueV8441}/>
    <FullStageFlashV8441 cueRef={fullStageFlashCueV8441}/>
    <PaperStreamersV846 cueRef={paperStreamersCueV846}/>
    <FestivalFinaleV847 cueRef={festivalFinaleCueV847}/>
    <KineticStageV817 cueRef={kineticCueV817}/>
    <FoamCannonV817 cueRef={foamCueV817}/>
    <ConcertMomentCrownV828 cueRef={crownCueV828}/>
    <SpectralMusicVisualsV818 cueRef={spectralCueV818}/>
    <CinematicSceneTransitionV819 cueRef={transitionCueV819}/>
    <VocalAdlibFxV820 cueRef={vocalFxCueV820}/>
    <ConcertArchitectureV789 key={theme} theme={theme} audio={audio} isPlaying={isPlaying}
      reactive={reactive} reducedMotion={reducedMotion}
      primary={musicPalette?.primary??palette.primary} secondary={musicPalette?.secondary??palette.secondary}
      sectionRef={atmosphereSection} timelineGainRef={atmosphereTimelineGain}
      timelineGain={timelineGainV354} strength={strength} showCue={showCue} cinematicCue={cinematicCueV761}
      lyricsProtected={lyricsProtectedV542} manualLighting={manualLightingV763}
      choreographyRefV793={lightChoreographyV793} peakRefV794={peakCueRefV794}
      evolutionRefV795={evolutionRefV795}/>
    <ConcertAtmosphereRendererV308 transitionV791={transitionV791?.active&&!manualLightingV763?transitionV791:undefined} scenicCueRefV762={scenicCueV762} cameraSectionV608={cameraSectionV608} cameraNarrativeV605={cameraNarrativeV605} concertSceneV551={concertLipSyncV386?.cinematicSceneV528} genreV462={genre} lyricsProtectedV542={lyricsProtectedV542} groupCountV542={groupCountV542} vocalFocusV542={vocalFocusV542} audio={audio} isPlaying={isPlaying} reducedMotion={reducedMotion} reactive={reactive} theme={theme} musicPalette={musicPalette} showCue={showCue} timelineGainRef={atmosphereTimelineGain} sectionRef={atmosphereSection} concertShowCueV387={concertShowAtmosphereV387?concertShowCueV387:undefined} festivalShowCueV394={festivalShowAtmosphereV394?festivalShowCueV394:undefined} festivalShowLasersV394={festivalShowLasersV394}
      authoredLightingV387={timeline.current.cues.length>0||timelineGainV354!==1||showCue?.lightingEnabled===true||showCue?.lightingEnabled===false}/>
    {/* V762: low-cost procedural floor gobo, depth-tested and never above performers. */}
    <mesh ref={goboMeshV762} name="v762-floor-gobo" visible={false} position={[0,-1.928,-0.15]} rotation={[-Math.PI/2,0,0]} renderOrder={1}>
      <planeGeometry args={[4.2,3.5]}/>
      <shaderMaterial ref={goboMaterialV762} transparent depthWrite={false} depthTest
        vertexShader={GOBO_VERTEX_V762} fragmentShader={GOBO_FRAGMENT_V762}
        uniforms={{uColor:{value:new Color(palette.secondary)},uOpacity:{value:0},uPattern:{value:0},uPhase:{value:0},uScale:{value:1}}}/>
    </mesh>
    {/* V635: back-wall LED pattern is one low-cost mesh behind the cast.
        When disabled its draw call is gated; it cannot cover a singer/lyrics. */}
    <mesh ref={ledWallV635} visible={false} position={[0,0.05,-3.8]} renderOrder={-1}>
      <planeGeometry args={[6.2,3.35]}/>
      <shaderMaterial ref={ledMaterialV635} transparent depthWrite={false}
        vertexShader={LED_WALL_VERTEX_V635} fragmentShader={LED_WALL_FRAGMENT_V990}
        uniforms={{uOpacity:{value:0},uPattern:{value:0},uPhase:{value:0},uSpeed:{value:0},
          uSceneStyle:{value:0},uStageMorph:{value:0},uVariation:{value:0},uArchitecture:{value:0},uDepth:{value:0},uMotion:{value:0},
          uLed21Power:{value:0},uLed21Look:{value:0},uLed21Bass:{value:0},
          uLed21Mids:{value:0},uLed21Highs:{value:0},uLed21Drop:{value:0},
          uLed21Phase:{value:0},uLed21Tempo:{value:0},uLed21Variation:{value:0},
          uLed42Power:{value:0},uLed42Mode:{value:0},uLed42Depth:{value:0},
          uLed42Geometry:{value:0},uLed42Tunnel:{value:0},uLed42Phase:{value:0},
          uLed42Flow:{value:0},uLed42LightLink:{value:0},
          uLed70Power:{value:0},uLed70Mode:{value:0},uLed70Phase:{value:0},
          uLed70Bass:{value:0},uLed70Mids:{value:0},uLed70Camera:{value:0},
          uLed86Power:{value:0},uLed86Mode:{value:0},uLed86Phase:{value:0},
          uLed86Bass:{value:0},uLed86Mids:{value:0},uLed86Highs:{value:0},
          uLed86Motion:{value:0},uLed86Camera:{value:0},
          uLed90Power:{value:0},uLed90Mode:{value:0},uLed90Phase:{value:0},
          uLed90Motion:{value:0},uLed90Bass:{value:0},uLed90Mids:{value:0},
          uLed90Highs:{value:0},uLed90Accent:{value:0},
          uBeat22Kick:{value:0},uBeat22Snare:{value:0},uBeat22Peak:{value:0},
          uFxPower:{value:0},uFxStyle:{value:0},uAudioBass:{value:0},uAudioMids:{value:0},uAudioHighs:{value:0},
          uPrimary:{value:new Color(palette.primary)},uSecondary:{value:new Color(palette.secondary)}}}/>
    </mesh>
    {/* V991: opt-in single planar radial floor shader. No independent timer or flashes.
        Low tier, manual shows, unknown timestamps and lyric focus all disable it. */}
    <mesh ref={bassImpactMeshV991} name="v991-bass-impact-floor" visible={false}
      position={[0,-1.902,-.20]} rotation={[-Math.PI/2,0,0]} renderOrder={1}>
      <planeGeometry args={[5.8,5.8]}/>
      <shaderMaterial ref={bassImpactMatV991} transparent depthWrite={false} depthTest
        vertexShader={BASS_IMPACT_VERTEX_V991} fragmentShader={BASS_IMPACT_FRAGMENT_V991}
        uniforms={{uColor:{value:new Color(palette.secondary)},uPower:{value:0},
          uRadius:{value:0},uAge:{value:0},uStyle:{value:0}}}/>
    </mesh>
    {/* V811: one lightweight laser/ribbon shader behind all performers, no flashes. */}
    <mesh ref={laserMeshV811} name="v811-laser-matrix" visible={false} position={[0,0.05,-3.57]} renderOrder={-1}>
      <planeGeometry args={[6.3,3.4]}/>
      <shaderMaterial ref={laserMaterialV811} transparent depthWrite={false} depthTest
        blending={importedAdditiveBlendingV811}
        vertexShader={LASER_MATRIX_VERTEX_V811} fragmentShader={LASER_SHOW_FRAGMENT_V888}
        uniforms={{uOpacity:{value:0},uLaserOn:{value:1},uRibbons:{value:0},uPhase:{value:0},uMode:{value:0},uFanSpread:{value:1},uFanMotion:{value:0},
          uLaser88Power:{value:0},uLaser88Mode:{value:0},uLaser88Phase:{value:0},
          uLaser88Motion:{value:0},uLaser88Spread:{value:1},
          uPrimary:{value:new Color('#35b5d8')},uSecondary:{value:new Color('#8d3bd2')}}}/>
    </mesh>
    {/* V813 uses a single shared canvas texture, behind singers or on the floor.
        Avoid geometry or texture creation per beat. Existing lyric renderer is untouched. */}
    <mesh name="v813-lyrics-wall-projection" ref={lyricsWallV813} visible={false} position={[-1.58,-1.27,-3.44]} renderOrder={-1}>
      <planeGeometry args={[2.75,.68]}/>
      <meshBasicMaterial ref={lyricsWallMatV813} transparent opacity={0} depthWrite={false} depthTest toneMapped={false}/>
    </mesh>
    <mesh name="v813-lyrics-floor-projection" ref={lyricsFloorV813} visible={false} rotation={[-Math.PI/2,0,0]} position={[0,-1.909,-1.18]} renderOrder={1}>
      <planeGeometry args={[2.8,.78]}/>
      <meshBasicMaterial ref={lyricsFloorMatV813} transparent opacity={0} depthWrite={false} depthTest toneMapped={false}/>
    </mesh>
    {/* V814 procedural low-opacity haze layer AND backstage shaft graphics.
        Performance and low-tier skip expensive shafts; V308 remains Fog owner. */}
    <mesh name="v814-floor-haze" ref={hazeFloorV814} visible={false} rotation={[-Math.PI/2,0,0]} position={[0,-1.913,-.6]} renderOrder={1}>
      <planeGeometry args={[5.7,3.5]}/>
      <shaderMaterial ref={hazeFloorMatV814} transparent depthWrite={false} depthTest
        vertexShader={ATMOSPHERE_VERTEX_V814} fragmentShader={ATMOSPHERE_FRAGMENT_V887}
        uniforms={{uColor:{value:new Color(palette.primary)},uOpacity:{value:0},uPhase:{value:0},uKind:{value:0},
          uFogDriftV887:{value:0},uFogSoftV887:{value:0},uFogWarpV887:{value:0}}}/>
    </mesh>
    <mesh name="v814-backstage-light-shafts" ref={hazeShaftsV814} visible={false} position={[0,.02,-3.52]} renderOrder={-1}>
      <planeGeometry args={[6.2,3.4]}/>
      <shaderMaterial ref={hazeShaftsMatV814} transparent depthWrite={false} depthTest
        blending={importedAdditiveBlendingV811}
        vertexShader={ATMOSPHERE_VERTEX_V814} fragmentShader={ATMOSPHERE_FRAGMENT_V887}
        uniforms={{uColor:{value:new Color(palette.primary)},uOpacity:{value:0},uPhase:{value:0},uKind:{value:1},
          uFogDriftV887:{value:0},uFogSoftV887:{value:0},uFogWarpV887:{value:0}}}/>
    </mesh>
    <pointLight ref={key} color={palette.primary} position={[-2.3, 2.4, 2.2]} intensity={1.1} distance={11}/>
    <pointLight ref={fill} color={palette.secondary} position={[2.4, 1.5, 1.8]} intensity={0.65} distance={10}/>
    <pointLight ref={floorLight} color={palette.primary} position={[0, -1.6, 0.4]} intensity={0.45} distance={7}/>
    <spotLight ref={beam} color={palette.secondary} position={[0, 3.0, 1.4]} angle={0.5} penumbra={0.9} intensity={0.7} distance={9} castShadow={false}/>
    <object3D ref={beamTargetV793} name="v793-reused-spotlight-target" position={[0,0,0]}/>
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
