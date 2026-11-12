"use client";
import {fitImportedAvatar,isImportedAvatarUrl} from "@/lib/importedAvatarPresentation";
import {stagePlacementV1135} from '@/lib/stagePresenceV1135';
import {CREW_IDS} from './sonicCrewDirector';
import {SonicFootContactV1135} from './SonicFootContactV1135';
import {lyricDensityV1130,lyricSectionV1130} from '@/lib/showIntelligenceV1130';
import {useOwnedAvatarResourcesV1009} from './useOwnedAvatarResourcesV1009';
import {usePreviewGltfCacheV654} from "./usePreviewGltfCacheV654";
import {planMotionPlaybackV659,keepCurrentMotionWhileLoadingV659} from "./motionPlaybackWindowV659";
import {applyGltfVocalPerformanceV492} from "./gltfVocalPerformanceV492";
import {useGltfFootContactV492} from "./useGltfFootContactV492";
import {useGltfVocalMotionV492} from "./useGltfVocalMotionV492";
import {useGltfBlendSetupV492} from "./useGltfBlendSetupV492";
import {useGltfAnimationMixerV492} from "./useGltfAnimationMixerV492";
import {useGltfClipTransitionsV492} from "./useGltfClipTransitionsV492";
import {useGltfBlendPlaybackV492} from "./useGltfBlendPlaybackV492";
import {useGltfMotionPresetDirectorV493} from "./useGltfMotionPresetDirectorV493";
import {preparePortraitMaterialsV560} from "./applyGlbPortraitMaterialsV560";
import {GlbMaterialQualityV560} from "./GlbMaterialQualityV560";
import {useCrewSettings,useCrewDirector} from "./useSonicCrew";
import {crewClipTime} from "./sonicCrewDirector";
import {prepareCrewReaction,applyCrewReaction} from "./sonicCrewReaction";
import {useEmbeddedMotionDirectorV530} from "./useEmbeddedMotionDirectorV530";
import {useGenreAwareMotionDirectorV536} from "./useGenreAwareMotionDirectorV536";
import {genreCrossfadeSecondsV536,motionSectionV536,type GenreMotionCandidateV536} from "./genreAwareMotionDirectorV536";
import {suggestMotionCategoryV535} from "./motionLibraryIntelligenceV535";
// Extracted unchanged from ThreeAvatar.tsx (V492 modular refactor).
// --- Extracted dependencies (V492 refactor) ---
import { observeReviewMotionV314 } from "./dancePerformanceReviewV314";
import { createEmotionV233State, updateEmotionV233 } from "./emotionExpressionV233";
import { ADAPTIVE_MOTION_MEMORY_EVENT, readMotionMemory, readMotionMemoryHardware, resolveMotionMemoryLimit, recordMotionUse, chooseAdaptiveMotionEvictions, pruneMotionLedger, type MotionMemoryLedger } from "./adaptiveMotionMemory";
import { readPredictiveDance, PREDICTIVE_DANCE_EVENT, predictDanceCue, mayCommitPredictedCue, type UpcomingDanceCue } from "./predictiveDanceTransitions";
import { readMotionPrefetch, MOTION_PREFETCH_EVENT, planMotionPrefetch, choosePrefetchEvictions, shouldReplanMotionPrefetch, type MotionPlanSnapshot } from "./intelligentMotionPrefetch";
import { computeExpressiveCue } from "./expressiveDanceCharacters";
import { readExpressiveSettings, EXPRESSIVE_EVENT } from "./expressiveDanceSettings";
import { readMotionStyle, STYLE_EVENT } from "./motionStyleSettings";
import { adaptMotionStyle } from "./motionStyleTransfer";
import { initialRhythmLock, updateRhythmLock, publishRhythmLock, loadBeatLockSettings, BEAT_LOCK_SETTINGS_EVENT } from "./adaptiveBeatIntelligence";
import { advanceBeatTransport, initialBeatTransport, shouldCommitMotionSwitch } from "./beatPerfectSequencer";
import { EVOLUTION_EVENT, readEvolution, selectEvolutionByBeat, resolveEvolutionCrossfade } from "./smartChoreographyEvolution";
import { CONTEXT_MEMORY_EVENT } from "./choreographyContextMemory";
import { ADAPTIVE_CHOREOGRAPHY_EVENT, loadAdaptiveState, resolveAdaptiveMotion } from "./adaptiveChoreographyLearning";
import { measureProfilerPhase } from "./runtimeProfiler";
import { recordAvatarFrame, releaseAvatarFrame, getAvatarFrameStats } from "./avatarFrameProfiler";
import { chooseAvatarWorkloadTier, stabilizeAvatarWorkload, type WorkloadLatch } from "./adaptiveAvatarWorkloadV252";
import { readMultiAvatarDirectorEnabled, decideMultiAvatarDirector } from "./adaptiveMultiAvatarDirectorV260";
import { evaluateAnimationBudget, shouldRunScheduledTask, releaseScheduledInstance, getAnimationSchedulerTier } from "./adaptiveAnimationScheduler";
import { readIKConstraints } from "./ikJointSafety";
import type { JointConstraintMap } from "./jointConstraintCalibration";
import { computeMusicAwareDanceExpression } from "./musicAwareDanceExpression";
import { advanceBeatFlow, createBeatFlowState, type BeatFlowResult } from "./beatFlowDetector";
import { planDanceTransition } from "./smartDanceTransition";
import { publishLodPoseSample, removeLodPoseSample, getOutgoingLodPose } from "./lodContinuityDiagnostics";
import { readMotionDebugSettings, getRuntimeMotionSettings, filterMotionDebugLayers, applyMotionPresetForGenre, updateMotionPresetMorph } from "./motionDebugControls";
import { SkeletonHelper } from "three";
import { applyLodPoseCorrection } from "./lodPoseCorrection";
import { createLodAutoTuneState, updateLodAutoTune } from "./lodAutoTuning";
import { Quaternion } from "three";
import { createMotionQualitySampler, sampleMotionQuality } from "./motionQualityDiagnostics";
import { createIKQualitySampler } from "./ikMotionAnalyzer";
import { getIKQualitySnapshot } from "./ikMotionAnalyzer";
import { createRefinementState, getRefinementSettings, refineFullBodyMotion } from "./adaptiveFullBodyRefinement";
import { createDanceQualityState, createDanceSongClock, updateDanceSongClock, enhanceDanceQuality, readDanceQualitySettings } from "./danceQualityV307";
import { createAdvancedDanceStateV311, refineDancePerformanceV311, readDancePerformanceV311 } from "./advancedDancePerformanceV311";
import { createDanceFlowStateV391, refineDanceFlowV391, readDanceFlowV391 } from "./naturalDanceIntelligenceV391";
import { createDanceMotionStateV545, refineNaturalDanceMotionV545, readNaturalDanceMotionV545 } from "./naturalDanceMotionV545";
import {refineExpressiveRigV587} from "./expressiveDanceFootworkV587";
import {refineNaturalDanceRigV684} from "./naturalDanceEvolutionV684";
import {refineAdvancedRapRigV685, rapGenreV685} from "./advancedRapPerformanceV685";
import {newGlbFootworkQualityStateV596,stepGlbFootworkQualityV596} from "./naturalFootworkQualityV596";
import {createNaturalFootworkClockV839,refineNaturalFootworkRigV839,readNaturalFootworkV839} from "./naturalDanceFootworkV839";
import {newGroundingStateV665,stepRealisticGroundingV665,readGroundingSettingsV665} from "./realisticDanceGroundingV665";
import {newGenreDanceStateV666,stepGenreDanceV666,readGenreDanceSettingsV666} from "./genreDancePerformanceV666";
import {sampleChoreographyV993,DEFAULT_CHOREOGRAPHY_V993} from "./aiChoreographyDirectorV993";
import {readConcertStageSyncV882} from "./concertStageSyncV882";
import {readEnergyV896} from "./musicalEnergyIntelligenceV896";
import { createNaturalDanceStateV320, refineNaturalDanceV320, readNaturalDanceV320 } from "./naturalDanceIntelligenceV320";
import { MOTION_QUALITY_EVENT_V321, readMotionQualityV321, polishMotionClipV321 } from "./advancedMotionQualityV321";
import { computeNaturalDanceCoordination } from "./naturalDanceCoordination";
import { createNaturalDanceDynamics, updateNaturalDanceDynamics } from "./naturalDanceIntelligence";
import { createPhraseMotionVariation, updatePhraseMotionVariation } from "./phraseMotionVariationV241";
import { createPhraseMotionState, updatePhraseMotion } from "./musicalPhraseIntelligence";
import { composeUnifiedMotion, createUnifiedMotionState } from "./unifiedDanceEngine";
import { createMomentumState, updateMomentumState } from "./danceMomentumEngine";
import { useUiPreferences } from "@/context/UiPreferencesContext";
import { advanceTimelineClockV733,sanitizeTimeline, timelineWeights, timelinePosition } from "./motionTimelineEngine";
import { timelineSongSecondsV319 } from "./musicMotionTimelineV319";
import { useFrame } from "@react-three/fiber";
import { phaseForClipV328 } from "./groupMotionSynchronizationV328";
import { NEUTRAL_LOOK } from "./partnerLookAtEngine";
import { NEUTRAL_GESTURE, type PartnerGestureCue } from "./partnerGestureEngine";
import { createHandIKState, NEUTRAL_HAND, updatePartnerHandIK } from "./partnerHandIK";
import { createPartnerTorsoState, updatePartnerTorso } from "./partnerFullBodyContact";
import { calibratePartnerCue } from "./partnerContactCalibration";
import { measureAvatarProportions, resolveContactCalibration, type AvatarProportions } from "./avatarProportionCalibration";
import {measureGlbBodyV507} from "./measureGlbBodyV507";
import {AvatarBodyContextV507} from "./ThreeAvatarContextsV492";
import {useAnimatedCollisionSamplingV508} from "./useAnimatedCollisionSamplingV508";
import { useId, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import {loadMotionAssetV734,disposeMotionAssetV734} from "./loadMotionAssetV734";
import { readMotionTransitionSettings, MOTION_TRANSITION_CHANGE_EVENT } from "./motionTransitionStudioSettings";
import { shouldSwitchLiveMotion } from "./liveMotionTransitionDirector";
import { publishTimelineObservation, explainTimelineDecision, normalizeTimelineEvidence, type TimelinePhase } from "./musicStructureTimeline";
import { advanceDropPrediction, createDropPredictionState, type DropPhase } from "./advancedDropPredictor";
import { initialStructureState, advanceStructureState, structureEvidence, choreographyPhase } from "./advancedMusicStructureV208";
import { CHARACTER_MOTION_CHANGE_EVENT, loadCharacterMotionStore, chooseCharacterMotion } from "./characterMotionLibrary";
import {isMixamoMotion,mixamoBeatAlignedSpeed,mixamoMinimumFade} from "./mixamoMotionDirector";
import { AnimationClip, type Group } from "three";
import { clone as cloneSkinnedScene } from "three/examples/jsm/utils/SkeletonUtils.js";
import {disposeClonedAvatarSkeletonsV654} from "./disposeClonedAvatarSkeletonsV654";
import type { VisualizerProps } from "./registry";
import {planNaturalMotionV1061,overlayNaturalMotionV1061} from "@/lib/naturalAvatarMotionV1061";
import {refineNaturalDanceV1078} from "@/lib/naturalDanceIntelligenceV1078";
import {sampleAvatarAudienceInteractionV1074,blendAvatarAudiencePoseV1074,
 ZERO_AVATAR_AUDIENCE_POSE_V1074} from '@/lib/arena360AvatarAudienceInteractionV1074';
import { VocalRigV368 } from "./VocalRigV368";
import { normalizeRapPresetV412, sampleRapLiveV412, liveRapClipNameV412, type RapLiveSampleV412 } from "./rapChoreographyPresetsV412";
import { sampleRapLyricsCueV413, lyricsRapGainV413 } from "./lyricsAwareRapChoreographyV413";
import { effectiveRapTimingOffsetV418 } from "./rapPerformanceQualityV418";
import { loadRapGestureDocumentV414, sampleRapGestureV414, applyRapGestureMotionV414, RAP_GESTURES_CHANGE_V414, type RapGestureDocumentV414, type RapGestureSampleV414 } from "./rapGestureCuesV414";
import { createVocalStageOverlayV371 } from "./vocalStageExpressionV371";
import { selectAutonomousMotionV356 } from "@/services/stageContent/autonomousShowV356";
import { findLowPoseClipV481 } from "./intelligentLowPoseV481";
import { newLowClipStateV482, stepLowClipV482 } from "./naturalLowPoseTransitionsV482";
import { animationMapping } from "./animationMapping";
import { type AvatarLoopPreset, getActiveAvatarLoop, LOOP_CHANGE_EVENT } from "./avatarLoopPresets";
import { getActiveChoreography, resolveChoreography, readChoreographies, CHOREOGRAPHY_CHANGE_EVENT } from "./avatarChoreographies";
import { getDanceEnergy, rankChoreographies } from "./smartDanceDirector";
import { retargetHumanoidClips, readRetargetCalibration, RETARGET_EVENT } from "./avatarAnimationRetarget";
import { createFullBodyBalanceStateV323, refineFullBodyBalanceV323, readFullBodyBalanceV323, FULL_BODY_BALANCE_DIAGNOSTIC_V323, fullBodyBalanceReportV323 } from "./advancedFullBodyBalanceV323";
import { sampleStanceV323 } from "./avatarFootIK";
import { getAvatarAnimationState } from "./avatarAnimationEngine";
import { applyAvatarRigMotion, type AvatarRigTargets } from "./avatarRigController";
import {blendHipDanceV735, normalizeHipDanceV735} from "./hipDanceV735";
import {createHipStudioStateV738,sampleHipStudioV738} from "./hipMotionStudioV738";
import {createBeatBassStateV743,sampleBeatBassV743} from "./beatBassHipMotionV743";
import {directGenreHipV742} from "./genreHipIntelligenceV742";
import {createSmartHipStateV744,directSmartHipV744} from "./smartHipChoreographyV744";
import {createEnsembleHipStateV745,directEnsembleHipV745} from "./multiAvatarHipSyncV745";
import {createNaturalContinuityStateV872,refineNaturalContinuityV872} from "./naturalDanceContinuityV872";
import {createNaturalDanceStateV758,directNaturalDanceV758} from "./naturalDanceMotionV758";
import {createDanceVarietyStateV759,stepDanceVarietyV759} from "./intelligentDanceVarietyV759";
import {createDanceStateV1024,stepDanceChoreographyV1024} from "./aiDanceChoreographyV1024";
import {sampleNaturalBodyV740,blendNaturalBodyV740} from "./naturalBodyDynamicsV740";
import {collectGluteRigV741,createGluteOverlayV741,sampleGluteV741,applyGluteRigV741} from "./advancedGluteRigV741";
import { getAvatarRigProfile, type AvatarRigProfileId } from "./avatarRigProfiles";
import { getAvatarDancePreset } from "./avatarDancePresets";
import { createDanceIntelligenceState, getDanceIntelligenceMultipliers, updateDanceIntelligence } from "./danceIntelligence";
import { createFullBodyDanceState, getFullBodyDanceMotion, updateFullBodyDance } from "./fullBodyDance";
import { getAvatarExpressionState } from "./avatarExpressionEngine";
import { createPerformanceDirectorState, updatePerformanceDirector } from "./performanceDirector";
import { createMusicalStructureState, getMusicalStructure, updateMusicalStructure } from "./musicalStructureEngine";
import { createNaturalMotionState, updateNaturalMotion } from "./naturalMotionEngine";
import { createChoreographyState, updateDanceChoreography } from "./advancedDanceChoreography";
import { createRhythmChoreographyState, updateRhythmChoreography } from "./rhythmAwareChoreography";
import { publishDancePerformance, nextPhraseBoundary } from "./dancePerformanceStore";
import { createFrameSampler, sampleAvatarFrame } from "./danceDiagnosticsStore";
import { getActivePerformanceTier } from "./adaptivePerformance";
import { AvatarSmartLOD } from "./AvatarSmartLOD";
import { safeClipTime, saveLodPlayback, takeLodPlayback, publishLiveLodPlayback, readLiveLodPlayback, clearLiveLodPlayback } from "./lodPlaybackContinuity";
import {createLodPlaybackBufferV569,updateLodPlaybackBufferV569} from "./lodPlaybackBufferV569";
import { selectMotionWorkloadTier } from "./motionWorkloadPolicy";
import { createAnimationCadence, setAnimationCadencePhase, shouldUpdateAnimation, publishAnimationQuality } from "./adaptiveAnimationQuality";
import { createPersonalityState, updateAvatarPersonality } from "./avatarPersonalityEngine";
import { rapGroovePose, DEFAULT_RAP_GROOVE } from "./rapGrooveEngine";
import { GroupLowPoseContextV481, PartnerCalibrationContext, applyPartnerGesture, applyPartnerLook, usePartnerGesture, usePartnerHand, usePartnerLook } from './ThreeAvatarContextsV492';

export function propsGenreKey(genre?: string | null) { return genre?.toLowerCase() ?? "default"; }

export function ImportedAnimationAvatar(props: VisualizerProps & { workloadSlot?: number; url: string; assetUrl?: string; animationUrl: string }) {
  const animationGltf = useGLTF(props.animationUrl);
  usePreviewGltfCacheV654(props.animationUrl);
  return <GltfAvatar {...props} importedClips={animationGltf.animations} importedAnimationScene={animationGltf.scene} animationUrl={props.animationUrl} />;
}

/** V531 loads the canonical source once through the existing drei GLTF cache.
 * The target rig stays independent; imported motions are conservatively retargeted.
 * An explicitly selected external Motion-GLB always takes precedence in Dancer.
 */
export function SharedEmbeddedAvatarV531(props: VisualizerProps & {workloadSlot?:number;url:string;assetUrl?:string;sharedMotionUrlV531:string}) {
  const source = useGLTF(props.sharedMotionUrlV531);
  usePreviewGltfCacheV654(props.sharedMotionUrlV531);
  return <GltfAvatar {...props} importedClips={source.animations} importedAnimationScene={source.scene} sharedMotionV531 />;
}

export function GltfAvatar({ importedClips = [], importedAnimationScene, animationUrl, sharedMotionV531=false, url, assetUrl, audio, isPlaying, reducedMotion, genre, genreFusion, stagePalette, wardrobeModeV468, wardrobeColorV468, wardrobePatternV468, wardrobeGlowV468, audioMotionEnabledV468, audioMotionStrengthV468, avatarModelId, avatarScale = 1, avatarOffsetY = 0, avatarAnimationIntensity = 1, avatarRigProfile = "auto", preferredMotionUrlV440, avatarDancePreset = "auto", danceAggression = 0.5, danceVariation = 0.5, danceMotionStyle = "balanced", avatarMotionMode = "hybrid", smartDanceEnabled = false, smartDanceOverride = "", avatarClipSpeed = 1, avatarBlendEnabled = false, avatarBlendClip = "", avatarBlendWeight = 0.3, avatarBlendSpeed = 1, avatarBlendAutoEnergy = false, avatarBlendBpmSync = false, avatarBlendReferenceBpm = 120, avatarBlendSmoothing = 0.28, avatarBlendCurve = "smooth", avatarBlendMask = "full", avatarCrossfadeSeconds = 0.35, avatarArmResponse = 1, avatarLegResponse = 1, avatarFootIKEnabled = true, avatarFootIKStrength = 70, avatarFootIKContact = 50, avatarFootIKLock = 50, arenaNaturalMotionEnabledV1061=false, arenaNaturalMotionStrengthV1061=55, arenaRapPerformanceEnabledV1062=false, arenaRapPerformanceStrengthV1062=55, arenaRapGesturesEnabledV1076=false, arenaRapGesturesStrengthV1076=55, arenaDuetPerformanceEnabledV1077=false, arenaDuetPerformanceStrengthV1077=55, arenaNaturalDanceEnabledV1078=false, arenaNaturalDanceStrengthV1078=55, arenaAvatarAudienceCueV1074, stageTheme, cameraDirectorSection, cameraDirectorProgressMs, track, autonomousShowPhraseV356, showCue, lipSync: propsLipSyncV367, ensembleCountV745, workloadSlot = 0 }: VisualizerProps & { url: string; assetUrl?: string; importedClips?: AnimationClip[]; importedAnimationScene?: Group; animationUrl?: string; sharedMotionV531?:boolean; avatarRigProfile?: AvatarRigProfileId; workloadSlot?: number }) {
  const schedulerInstance = useId();
  useEffect(() => () => releaseAvatarFrame(schedulerInstance), [schedulerInstance]);
  useEffect(() => () => releaseScheduledInstance(schedulerInstance), [schedulerInstance]);
  const {preferences: groovePreferences} = useUiPreferences();
  const crewSettings = useCrewSettings();
  const crewTelemetry=useRef({source:"",at:-Infinity});
  const crewClock = useRef({key:"",position:-1,elapsed:0});
  const preferencesRap=useRef(groovePreferences.rapGroove??DEFAULT_RAP_GROOVE);
  preferencesRap.current=groovePreferences.rapGroove??DEFAULT_RAP_GROOVE;
  const partnerLook = usePartnerLook();
  const partnerGesture = usePartnerGesture();
  const partnerHand = usePartnerHand();
  const contactCalibration = useContext(PartnerCalibrationContext);
  const measuredProportions = useRef<AvatarProportions | null>(null);
  const expressiveSettings = useRef(readExpressiveSettings(avatarModelId??""));
  useEffect(()=>{const refresh=()=>{expressiveSettings.current=readExpressiveSettings(avatarModelId??"");};refresh();window.addEventListener(EXPRESSIVE_EVENT,refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener(EXPRESSIVE_EVENT,refresh);window.removeEventListener("storage",refresh);};},[avatarModelId]);
  const handIK = useRef(createHandIKState());
  const ikConstraints = useRef<JointConstraintMap>({});
  useEffect(() => {
    const refresh = () => { ikConstraints.current = readIKConstraints(url); };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("sonic:joint-constraints-changed", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("sonic:joint-constraints-changed", refresh); };
  }, [url]);
  const torsoIK = useRef(createPartnerTorsoState());
  const lastPartnerLook = useRef({ yaw: 0, pitch: 0, eye: 0 });
  const lastPartnerGesture = useRef<PartnerGestureCue>({...NEUTRAL_GESTURE});
  const lastAudiencePoseV1074=useRef({...ZERO_AVATAR_AUDIENCE_POSE_V1074});
  const root = useRef<Group>(null);
  const groupLowPoseV481=useContext(GroupLowPoseContextV481);
  const {preferences: timelinePrefs} = useUiPreferences();
  const timelineEnabled = !!timelinePrefs.avatarTimelineEnabled;
  const rapLivePresetV412=useMemo(()=>normalizeRapPresetV412(groovePreferences.rapLivePresetV412),[groovePreferences.rapLivePresetV412]);
  const rapLiveCandidateV412=rapLivePresetV412?.avatarId===avatarModelId&&!timelineEnabled&&workloadSlot===0;
  const timeline = useMemo(() => sanitizeTimeline(timelinePrefs.avatarTimeline), [timelinePrefs.avatarTimeline]);
  const timelineStarted = useRef<number | null>(null);
  const timelinePause=useRef<number|null>(null);
  const timelineTrack=useRef<string|undefined>(undefined);
  const clockElapsed = useRef(0);
  const timelineWasActive = useRef(false);
  useFrame(state => { clockElapsed.current = state.clock.elapsedTime; });
  const intelligence = useRef(createDanceIntelligenceState());
  const performanceDirector = useRef(createPerformanceDirectorState());
  const emotionV233 = useRef(createEmotionV233State());
  const musicalStructure = useRef(createMusicalStructureState());
  const choreography = useRef(createChoreographyState());
  const previewPublishedAt = useRef(-1);
  const frameSampler = useRef(createFrameSampler());
  const rhythmChoreography = useRef(createRhythmChoreographyState());
  const personality = useRef(createPersonalityState());
  const animationCadence = useRef(createAnimationCadence());
  const workloadLatchV252 = useRef<WorkloadLatch>({tier:"high",lastChangedAt:0});
  const workloadDecisionV252 = useRef<{tier: "high" | "balanced" | "low"; checkedAt:number}>({tier:"high",checkedAt:-Infinity});
  // React instance identity keeps the cadence independent even with identical GLB URLs.
  useEffect(() => { setAnimationCadencePhase(animationCadence.current, workloadSlot, 2); }, [workloadSlot]);
  const cachedChoreography = useRef<ReturnType<typeof updateDanceChoreography> | null>(null);
  const cachedSignature = useRef<ReturnType<typeof updateAvatarPersonality> | null>(null);
  const cachedFullBody = useRef<ReturnType<typeof getFullBodyDanceMotion> | null>(null);
  const rigTargets = useRef<AvatarRigTargets>({});
  const vocalStageOverlayV371=useRef(createVocalStageOverlayV371());
  useEffect(() => {
    const model = root.current;
    if (!model) return;
    const helper = new SkeletonHelper(model);
    helper.visible = readMotionDebugSettings().skeleton;
    model.add(helper);
    const update = () => { helper.visible = readMotionDebugSettings().skeleton; };
    window.addEventListener('sonic:motion-debug-controls', update);
    return () => { window.removeEventListener('sonic:motion-debug-controls', update); model.remove(helper); helper.geometry.dispose(); };
  }, []);
  const momentum = useRef(createMomentumState());
  const unifiedMotion = useRef(createUnifiedMotionState());
  const motionQualitySampler = useRef(createMotionQualitySampler());
  const fullBodyRefinement = useRef(createRefinementState());
  const danceQualityV307 = useRef(createDanceQualityState());
  const dancePerformanceV311 = useRef(createAdvancedDanceStateV311());
  const naturalDanceV320 = useRef(createNaturalDanceStateV320());
  const danceFlowV391 = useRef(createDanceFlowStateV391());
  const danceMotionV545=useRef(createDanceMotionStateV545());
  const footworkQualityV596=useRef(newGlbFootworkQualityStateV596());
  const naturalFootworkV839=useRef(createNaturalFootworkClockV839());
  const danceNaturalStateV758=useRef(createNaturalDanceStateV758());
  const groundingV665=useRef(newGroundingStateV665());
  const genreDanceV666=useRef(newGenreDanceStateV666());
  const varietyStateV759=useRef(createDanceVarietyStateV759());
  const danceStateV1024=useRef(createDanceStateV1024());
  const hipStudioV738=useRef(createHipStudioStateV738());
  const beatBassV743=useRef(createBeatBassStateV743());
  const smartHipV744=useRef(createSmartHipStateV744());
  const ensembleHipV745=useRef(createEnsembleHipStateV745());
  const continuityV872=useRef(createNaturalContinuityStateV872());
  const reviewCadenceV314=useRef(0);
  const danceSongClockV307 = useRef(createDanceSongClock());
  const ikQualitySampler = useRef(createIKQualitySampler());
  const balanceStateV323=useRef(createFullBodyBalanceStateV323());
  const balanceReportAtV323=useRef(0);
  const hipHeadingQuaternionV323=useRef(new Quaternion());
  const beatFlow = useRef(createBeatFlowState());
  const beatFlowData = useRef<BeatFlowResult>({ transitionBoost: 0, kickOnset: 0, snareOnset: 0, groove: 0, accent: 0, confidence: 0, style: "steady" });
  const fullBodyDance = useRef(createFullBodyDanceState());
  const naturalMotion = useRef(createNaturalMotionState());
  const naturalDanceDynamics = useRef(createNaturalDanceDynamics());
  const phraseVariationV241 = useRef(createPhraseMotionVariation());
  const phraseMotionState = useRef(createPhraseMotionState());
  const { scene, animations } = useGLTF(assetUrl ?? url);
 usePreviewGltfCacheV654(assetUrl ?? url);
  // Clone only when the model changes. SkeletonUtils preserves skinned-mesh
  // bone bindings; cloning inside JSX on every React render breaks caching.
  // Cached originals stay untouched; the owned-resource hook isolates renderer resources.
  const model = useMemo(() => {
    const instance = cloneSkinnedScene(scene);
    instance.traverse(node => {
      if ("castShadow" in node) node.castShadow = false;
      if ("receiveShadow" in node) node.receiveShadow = false;
    });
    return fitImportedAvatar(instance,assetUrl??url);
  }, [scene,assetUrl,url]);
  // V507: rest-pose analysis only when a decoded GLB/scale changes; no frame tax.
  // Stage-local registry is keyed by dancer slot and cleaned on asset switch.
  const bodyRegistryV507=useContext(AvatarBodyContextV507);
  const bodyProfileV507=useMemo(()=>measureGlbBodyV507(isImportedAvatarUrl(assetUrl??url)?model:scene,avatarScale),[scene,model,avatarScale,assetUrl,url]);
  useEffect(()=>{
    const identity=`${url}|${assetUrl??url}|${avatarScale}|${workloadSlot}`;
    bodyRegistryV507?.set(workloadSlot,identity,bodyProfileV507);
    return ()=>bodyRegistryV507?.clear(workloadSlot,identity);
  },[bodyRegistryV507,bodyProfileV507,url,assetUrl,avatarScale,workloadSlot]);
  useEffect(()=>()=>{disposeClonedAvatarSkeletonsV654(model);},[model]);
  useOwnedAvatarResourcesV1009(model);
  const gluteRigV741=useMemo(()=>collectGluteRigV741(model),[model]);
  const gluteOverlayV741=useMemo(()=>createGluteOverlayV741(),[model]);
  // V560: one private set of PBR material copies per GLB instance. Never edit
  // shared useGLTF materials, animation morph targets, textures, or geometry.
  const materialSessionV560=useMemo(()=>preparePortraitMaterialsV560(model),[model]);
  useEffect(()=>()=>materialSessionV560.dispose(),[materialSessionV560]);
  useGltfVocalMotionV492({model,audio,isPlaying,reducedMotion,genre,genreFusion,stagePalette,
    wardrobeModeV468,wardrobeColorV468,wardrobePatternV468,wardrobeGlowV468,
    audioMotionEnabledV468,audioMotionStrengthV468,avatarFootIKEnabled,track,
    cameraDirectorSection,showCue,avatarMotionMode,propsLipSyncV367,workloadSlot,
    arenaRapPerformanceEnabledV1062:arenaRapPerformanceEnabledV1062&&stageTheme==='arena360',arenaRapPerformanceStrengthV1062,
    arenaRapGesturesEnabledV1076:arenaRapGesturesEnabledV1076&&stageTheme==='arena360',arenaRapGesturesStrengthV1076,
    arenaDuetPerformanceEnabledV1077:arenaDuetPerformanceEnabledV1077&&stageTheme==='arena360',arenaDuetPerformanceStrengthV1077});
  // Match humanoid bones across Mixamo/Blender-style names and preserve rest-pose differences.
  // Unsupported tracks are safely ignored; original avatar/animation files are unchanged.
  const [calibrationVersion, setCalibrationVersion] = useState(0);
  useEffect(() => { const update = () => setCalibrationVersion(v => v+1); window.addEventListener(RETARGET_EVENT, update); window.addEventListener("storage", update); return () => { window.removeEventListener(RETARGET_EVENT, update); window.removeEventListener("storage", update); }; }, []);
  // V191: preload installed motion assets without remounting this dancer's GLTF rig.
  const [libraryRevision, setLibraryRevision] = useState(0);
  useEffect(() => {
    const refresh = () => setLibraryRevision(v => v + 1);
    window.addEventListener(CHARACTER_MOTION_CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {window.removeEventListener(CHARACTER_MOTION_CHANGE_EVENT, refresh);window.removeEventListener("storage", refresh);};
  }, []);
  const library = useMemo(() => loadCharacterMotionStore(), [libraryRevision]);
  // V659: never truncate the *catalog*; decoded clips are instead capped by the working-set cache.
  const installed = useMemo(() => library.motions.filter(m => m.avatarId === avatarModelId), [library, avatarModelId]);
  const libraryKey = installed.map(m => m.id + ":" + m.url).join("|");
  const [styleRevision,setStyleRevision]=useState(0);
  useEffect(()=>{const refresh=()=>setStyleRevision(v=>v+1);window.addEventListener(STYLE_EVENT,refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener(STYLE_EVENT,refresh);window.removeEventListener("storage",refresh);};},[]);
  const motionStyle=useMemo(()=>readMotionStyle(avatarModelId??""),[avatarModelId,styleRevision]);
  const styleRest=useMemo(()=>{const map=new Map<string,Quaternion>();model.traverse(o=>{if((o as any).isBone)map.set(o.name,o.quaternion.clone());});return map;},[model]);
  const [libraryClips, setLibraryClips] = useState<AnimationClip[]>([]);
  const [prefetchRevision,setPrefetchRevision]=useState(0);
  useEffect(()=>{const refresh=()=>setPrefetchRevision(v=>v+1);window.addEventListener(MOTION_PREFETCH_EVENT,refresh);window.addEventListener(PREDICTIVE_DANCE_EVENT,refresh);window.addEventListener(EVOLUTION_EVENT,refresh);window.addEventListener('storage',refresh);return()=>{window.removeEventListener(MOTION_PREFETCH_EVENT,refresh);window.removeEventListener(PREDICTIVE_DANCE_EVENT,refresh);window.removeEventListener(EVOLUTION_EVENT,refresh);window.removeEventListener('storage',refresh);};},[]);
  const prefetchSettings=useMemo(()=>readMotionPrefetch(),[prefetchRevision]);
  const [memoryRevision,setMemoryRevision]=useState(0);
  useEffect(()=>{const refresh=()=>setMemoryRevision(n=>n+1);window.addEventListener(ADAPTIVE_MOTION_MEMORY_EVENT,refresh);window.addEventListener('storage',refresh);return()=>{window.removeEventListener(ADAPTIVE_MOTION_MEMORY_EVENT,refresh);window.removeEventListener('storage',refresh);};},[]);
  const memorySettings=useMemo(()=>readMotionMemory(),[memoryRevision]);
  const memoryHardware=useMemo(()=>readMotionMemoryHardware(),[memoryRevision]);
  const memoryLedger=useRef<MotionMemoryLedger>({});
  const memoryTick=useRef(0);
  const lastObservedClip=useRef('');

  const [prefetchTargets,setPrefetchTargets]=useState<{id:string;url:string}[]>([]);
  const [requestedMotionIdV659,setRequestedMotionIdV659]=useState("");
  const [authoredCueIdsV659,setAuthoredCueIdsV659]=useState<string[]>([]);
  const authoredCueKeyV659=useRef("");
  const prefetchedCache=useRef(new Map<string,AnimationClip[]>());
  const prefetchInFlight=useRef(new Map<string,symbol>());
  const prefetchFailures=useRef(new Set<string>());
  const activeLibraryIdRef=useRef('');
  const prefetchGeneration=useRef(0);
  const prefetchPlanKey=useRef('');
  const prefetchActive=prefetchSettings.enabled && readPredictiveDance().enabled && readEvolution().enabled && installed.length>0;
  // V249: release per-avatar clip references and invalidate outstanding loads on unmount.
  useEffect(() => () => {
    prefetchGeneration.current++;
    prefetchedCache.current.clear();
    prefetchInFlight.current.clear();
    prefetchFailures.current.clear();
    memoryLedger.current = {};
    cachedChoreography.current = null;
    cachedSignature.current = null;
    cachedFullBody.current = null;
  }, []);
  // Invalidate old retargets when avatar or calibration/style changes.
  useEffect(()=>{prefetchGeneration.current++;prefetchedCache.current.clear();prefetchInFlight.current.clear();prefetchFailures.current.clear();prefetchPlanKey.current='';memoryLedger.current={};memoryTick.current=0;lastObservedClip.current='';setLibraryClips([]);},[model,url,calibrationVersion,motionStyle,styleRest,libraryKey]);
  // V659: a single bounded loader serves *both* normal and predictive mode.
  // Only the selected motion and a small set of upcoming motions are decoded.
  // Keeping all library metadata in `installed` makes even entry 25/250 eligible.
  useEffect(()=>{
    if(!installed.length){setLibraryClips([]);return;}
    let disposed=false;const controller=new AbortController();const owner=Symbol();
    const generation=prefetchGeneration.current;
    const pool=prefetchedCache.current;
    const budget=memorySettings.enabled
      ?resolveMotionMemoryLimit(memorySettings,memoryHardware,2)
      :prefetchSettings.cacheSize;
    // Explicitly authored rap-duet cues take precedence over automatic choices.
    const manualTargets=authoredCueIdsV659.map(id=>installed.find(m=>m.id===id)).filter((m):m is NonNullable<typeof m>=>!!m);
    const requested=manualTargets[0]?.id??requestedMotionIdV659;
    const plan=planMotionPlaybackV659(installed,requested,
      [...manualTargets.slice(1),...(prefetchActive?prefetchTargets:[])],activeLibraryIdRef.current,budget);
    const pinned=plan.pinned;
    const publish=()=>{
      if(disposed||generation!==prefetchGeneration.current)return;
      setLibraryClips(Array.from(pool.values()).flat());
    };
    const trim=()=>{
      const cap=memorySettings.enabled
        ?resolveMotionMemoryLimit(memorySettings,memoryHardware,pinned.length)
        :prefetchSettings.cacheSize;
      const old=memorySettings.enabled
        ?chooseAdaptiveMotionEvictions(Array.from(pool.keys()),pinned,cap,memoryLedger.current,memorySettings.favorFrequentlyUsed)
        :choosePrefetchEvictions(Array.from(pool.keys()),pinned,cap);
      old.forEach(id=>pool.delete(id));
      memoryLedger.current=pruneMotionLedger(memoryLedger.current,Array.from(pool.keys()));
    };
    trim();publish();
    const pending=plan.targets.filter(t=>!pool.has(t.id)&&!prefetchInFlight.current.has(t.id)&&!prefetchFailures.current.has(t.id));
    let cursor=0;
    const worker=async()=>{
      while(!disposed&&cursor<pending.length){
        const target=pending[cursor++];
        prefetchInFlight.current.set(target.id,owner);
        try{
          const gltf=await loadMotionAssetV734(target.url,controller.signal);
          try {
          if(disposed||generation!==prefetchGeneration.current)continue;
          const converted=retargetHumanoidClips(gltf.animations,gltf.scene,model,readRetargetCalibration(url));
          const clips=adaptMotionStyle(converted.clips,motionStyle,styleRest).map((clip,index)=>{
            const named=clip.clone();named.name=`Library:${target.id}:${index}`;return named;
          });
          pool.delete(target.id);pool.set(target.id,clips);
          trim();publish();
          }finally{disposeMotionAssetV734(gltf);}
        }catch{
          // Bad assets cannot trigger a retry storm on every animation frame.
          if(!disposed&&generation===prefetchGeneration.current)prefetchFailures.current.add(target.id);
        }finally{
          if(prefetchInFlight.current.get(target.id)===owner)prefetchInFlight.current.delete(target.id);
        }
      }
    };
    void Promise.allSettled(Array.from({length:Math.min(prefetchActive?prefetchSettings.concurrency:2,pending.length)},()=>worker()));
    return()=>{disposed=true;controller.abort();for(const [id,requestOwner] of prefetchInFlight.current)if(requestOwner===owner)prefetchInFlight.current.delete(id);};
  },[installed,libraryKey,requestedMotionIdV659,authoredCueIdsV659,
    prefetchActive,prefetchTargets,prefetchSettings.cacheSize,prefetchSettings.concurrency,
    memorySettings,memoryHardware,model,url,motionStyle,styleRest]);
  // V194: use a stateful, hysteretic build/drop estimate rather than a single-frame kick threshold.
  const stableLibraryClipRef = useRef("");
  const lastTimelineSample = useRef(-Infinity);
  const predictedDrop = useRef(createDropPredictionState());
  const structureState = useRef(initialStructureState());
  const [predictedPhase, setPredictedPhase] = useState<DropPhase>("verse");
  // V217: keep the last queued phase in a ref to avoid duplicate React updates
  // when several animation frames arrive before React commits a render.
  const queuedStructurePhase = useRef<DropPhase>("verse");
  useFrame(({clock}) => {
    const prior = predictedDrop.current;
    const next = advanceDropPrediction(prior, {
      energy: audio.energyEnvelope ?? 0, bass: audio.bass ?? 0,
      attack: audio.attack ?? 0, kick: audio.kickAccentIntensity ?? 0,
      anticipation: audio.kickAnticipation ?? 0, bpm: audio.bpm,
      playing: isPlaying && !reducedMotion,
    }, clock.elapsedTime);
    predictedDrop.current = next;
    // V208: stable four-phase interpretation; break maps to verse for legacy libraries.
    const previousStructure = structureState.current;
    const currentStructure = advanceStructureState(previousStructure,{
      energy:audio.energyEnvelope??0,bass:audio.bass??0,kick:audio.kickAccentIntensity??0,
      attack:audio.attack??0,anticipation:audio.kickAnticipation??0,playing:isPlaying&&!reducedMotion
    },next,clock.elapsedTime);
    structureState.current=currentStructure;
    const choreoPhase=choreographyPhase(currentStructure.phase);
    if(choreoPhase!==queuedStructurePhase.current) {
      queuedStructurePhase.current = choreoPhase;
      setPredictedPhase(choreoPhase);
    }
    // Lightweight telemetry: no state updates on each frame, rate-limited to 4Hz.
    const at=clock.elapsedTime;
    if (avatarModelId && at-lastTimelineSample.current>=0.25 && isPlaying && !reducedMotion) {
      lastTimelineSample.current=at;
      const evidence=normalizeTimelineEvidence(structureEvidence(currentStructure,next,audio.kickAnticipation??0));
      const phase:TimelinePhase=currentStructure.phase;
      const motion=stableLibraryClipRef.current ?? "";
      publishTimelineObservation({at,avatarId:avatarModelId,phase,motion,reason:currentStructure.reason+" · "+explainTimelineDecision(phase,motion,evidence),evidence});
    }
  });
  const [adaptiveRevision,setAdaptiveRevision]=useState(0);
  useEffect(()=>{const update=()=>setAdaptiveRevision(v=>v+1);window.addEventListener(ADAPTIVE_CHOREOGRAPHY_EVENT,update);window.addEventListener(CONTEXT_MEMORY_EVENT,update);window.addEventListener("storage",update);return()=>{window.removeEventListener(ADAPTIVE_CHOREOGRAPHY_EVENT,update);window.removeEventListener(CONTEXT_MEMORY_EVENT,update);window.removeEventListener("storage",update);};},[]);
  const adaptiveMotion = useMemo(()=>resolveAdaptiveMotion(loadAdaptiveState(),avatarModelId??"",predictedPhase,installed,{genre:genre??"",bpm:audio.bpm??0}),[avatarModelId,predictedPhase,installed,genre,audio.bpm,adaptiveRevision]);
  // V198: only change the selected motion at a phase boundary or a bar-based sequence step.
  const [evolutionRevision,setEvolutionRevision]=useState(0);
  useEffect(()=>{const refresh=()=>setEvolutionRevision(n=>n+1);window.addEventListener(EVOLUTION_EVENT,refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener(EVOLUTION_EVENT,refresh);window.removeEventListener("storage",refresh);};},[]);
  const evolution=useMemo(()=>readEvolution(),[evolutionRevision]);
  const [predictiveRevision,setPredictiveRevision]=useState(0);
  useEffect(()=>{const refresh=()=>setPredictiveRevision(v=>v+1);window.addEventListener(PREDICTIVE_DANCE_EVENT,refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener(PREDICTIVE_DANCE_EVENT,refresh);window.removeEventListener("storage",refresh);};},[]);
  const predictiveSettings=useMemo(()=>readPredictiveDance(),[predictiveRevision]);
  const queuedPredictiveCue=useRef<UpcomingDanceCue|undefined>(undefined);
  const lastPredictiveSwitchBeat=useRef(-Infinity);

  // V199: beat-based transport freezes while paused; phase resets only when music phase changes.
  const phaseTransport=useRef(initialBeatTransport());
  const rhythmLock=useRef(initialRhythmLock());
  const [rhythmSettings,setRhythmSettings]=useState(()=>loadBeatLockSettings());
  useEffect(()=>{const refresh=()=>setRhythmSettings(loadBeatLockSettings());window.addEventListener(BEAT_LOCK_SETTINGS_EVENT,refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener(BEAT_LOCK_SETTINGS_EVENT,refresh);window.removeEventListener("storage",refresh);};},[]);
  const lastRhythmPublished=useRef(-Infinity);
  const previousMotionPlan=useRef<MotionPlanSnapshot | undefined>(undefined);
  const phaseName=useRef(predictedPhase);
  const [phaseBeat,setPhaseBeat]=useState(0);
  const beatBoundary=useRef(0);
  useFrame((_,delta)=>{
    if(phaseName.current!==predictedPhase){phaseName.current=predictedPhase;phaseTransport.current=initialBeatTransport();beatBoundary.current=0;rhythmLock.current=initialRhythmLock();queuedPredictiveCue.current=undefined;lastPredictiveSwitchBeat.current=-Infinity;setPhaseBeat(0);}
    const before=phaseTransport.current;
    const after=advanceBeatTransport(before,delta,isPlaying&&!reducedMotion,audio.bpm ?? undefined);
    // V209: adaptive correction is opt-in and falls back to the pause-safe V199 clock.
    const lock=updateRhythmLock(rhythmLock.current,_.clock.elapsedTime,delta,isPlaying&&!reducedMotion,{bpm:audio.bpm,beat:audio.beat,beatStrength:audio.beatStrength,kickAccentIntensity:audio.kickAccentIntensity,bpmConfidence:audio.bpmConfidence},rhythmSettings.enabled);
    rhythmLock.current=lock;
    const correctedBeat=rhythmSettings.enabled&&lock.confidence>=rhythmSettings.minConfidence ? lock.beat : after.beat;
    const nextTransport={...after,beat:correctedBeat,phase:correctedBeat%1};
    phaseTransport.current=nextTransport;
    if(_.clock.elapsedTime-lastRhythmPublished.current>=.25){lastRhythmPublished.current=_.clock.elapsedTime;publishRhythmLock(lock);}
    if(!isPlaying||reducedMotion)return;
    // V212: request current + upcoming clips; 1 React update only when the planned IDs change.
    if(prefetchActive && predictiveSettings.enabled && evolution.enabled && avatarModelId){
      const snapshot:MotionPlanSnapshot={evolution,motions:installed,avatarId:avatarModelId,
        phase:predictedPhase,aheadSteps:prefetchSettings.aheadSteps,bar:Math.floor(nextTransport.beat/4)};
      if(shouldReplanMotionPrefetch(previousMotionPlan.current,snapshot)){
        previousMotionPlan.current=snapshot;
        const plan=planMotionPrefetch(evolution,avatarModelId,predictedPhase,installed,nextTransport.beat,prefetchSettings.aheadSteps);
        const key=JSON.stringify(plan);
        if(key!==prefetchPlanKey.current){prefetchPlanKey.current=key;setPrefetchTargets(plan);}
      }
    }
    // V211: schedule the upcoming, already installed timeline clip before the next bar.
    if(predictiveSettings.enabled && avatarModelId){
      const upcoming=predictDanceCue(evolution,avatarModelId,predictedPhase,installed,nextTransport.beat,4,predictiveSettings.leadBeats);
      if(upcoming)queuedPredictiveCue.current=upcoming;
      const pending=queuedPredictiveCue.current;
      if(pending && nextTransport.beat>pending.boundaryBeat+0.5)queuedPredictiveCue.current=undefined;
      const ready=!!pending && libraryClips.some(clip=>clip.name.startsWith(`Library:${pending.motionId}:`));
      if(mayCommitPredictedCue(pending,before.beat,nextTransport.beat,ready,lastPredictiveSwitchBeat.current,4,predictiveSettings.minimumDwellBars)){
        const clip=libraryClips.find(c=>c.name.startsWith(`Library:${pending!.motionId}:`));
        if(clip){lastPredictiveSwitchBeat.current=pending!.boundaryBeat;queuedPredictiveCue.current=undefined;setStableLibraryClip(clip.name);}
      }
    }
    // Only rerender for each bar (plus first beat): avoid 60fps React state churn.
    if(shouldCommitMotionSwitch(beatBoundary.current,nextTransport.beat,4)){
      beatBoundary.current=nextTransport.beat;
      setPhaseBeat(nextTransport.beat);
    }
  });
  const evolutionMotion=useMemo(()=>selectEvolutionByBeat(evolution,avatarModelId??"",predictedPhase,installed,phaseBeat,4),[evolution,avatarModelId,predictedPhase,installed,phaseBeat]);
  const sequenceCrossfade = useMemo(()=>evolutionMotion ? resolveEvolutionCrossfade(evolution,avatarModelId??"",predictedPhase,evolutionMotion.id,phaseBeat,4) : undefined,[evolution,avatarModelId,predictedPhase,evolutionMotion,phaseBeat]);
  const libraryMotion = useMemo(() => evolutionMotion?.url ?? adaptiveMotion?.url ?? (library.automatic && installed.some(m=>m.url===preferredMotionUrlV440)?preferredMotionUrlV440:undefined) ?? chooseCharacterMotion({...library,motions:installed}, avatarModelId ?? "", genre ?? "", audio.bpm ?? undefined,
    predictedPhase, undefined),
    [library, avatarModelId, genre, audio.bpm, predictedPhase, adaptiveMotion, evolutionMotion, installed, preferredMotionUrlV440]);
  const selectedEntryV659=installed.find(m=>m.url===libraryMotion);
  const requestedIdV659=selectedEntryV659?.id??"";
  useEffect(()=>{setRequestedMotionIdV659(requestedIdV659);},[requestedIdV659]);
  const selectedLibraryClip = useMemo(() => {
    if ((!library.automatic && !adaptiveMotion && !evolutionMotion) || !isPlaying || reducedMotion || !libraryMotion) return undefined;
    const selected = installed.find(m => m.url === libraryMotion);
    return selected ? libraryClips.find(c => c.name.startsWith(`Library:${selected.id}:`))?.name : undefined;
  }, [library, adaptiveMotion, evolutionMotion, libraryMotion, installed, libraryClips, isPlaying, reducedMotion]);
  // Switch only at controlled intervals so kick-energy fluctuations do not
  // continuously restart or crossfade clips every render frame.
  const [liveTransitionRevision, setLiveTransitionRevision] = useState(0);
  useEffect(() => {
    const update = () => setLiveTransitionRevision(n => n + 1);
    window.addEventListener(MOTION_TRANSITION_CHANGE_EVENT, update);
    window.addEventListener("storage", update);
    return () => {window.removeEventListener(MOTION_TRANSITION_CHANGE_EVENT, update); window.removeEventListener("storage", update);};
  }, []);
  const liveTransition = useMemo(() => readMotionTransitionSettings(avatarModelId ?? ""), [avatarModelId, liveTransitionRevision]);
  const lastKickLevel = useRef(0);
  const kickTriggeredAt = useRef(-Infinity);
  const [stableLibraryClip, setStableLibraryClip] = useState<string | undefined>();
  activeLibraryIdRef.current=installed.find(m=>stableLibraryClip?.startsWith(`Library:${m.id}:`))?.id??"";
  // V213: count an actual motion selection once, not once per rendered frame.
  useEffect(()=>{
    const id=activeLibraryIdRef.current;
    if(!id||id===lastObservedClip.current)return;
    lastObservedClip.current=id;
    memoryLedger.current=recordMotionUse(memoryLedger.current,id,++memoryTick.current);
    // Map insertion order is a fallback for V212; do not change clip objects.
    const clips=prefetchedCache.current.get(id);
    if(clips){prefetchedCache.current.delete(id);prefetchedCache.current.set(id,clips);}
  },[stableLibraryClip]);
  stableLibraryClipRef.current = installed.find(m=>stableLibraryClip?.startsWith(`Library:${m.id}:`))?.name ?? "";
  const lastLibraryTransition = useRef(-Infinity);
  useFrame(({clock}) => {
    // The predictive path handles only opted-in, configured timeline sequences.
    // A queued clip has priority at the boundary; legacy switching remains the fallback.
    if(predictiveSettings.enabled && evolution.enabled && evolution.sequences[avatarModelId??""]?.[predictedPhase]?.length && isPlaying && !reducedMotion){
      if(selectedLibraryClip===stableLibraryClip)return;
      if(queuedPredictiveCue.current)return;
    }
    // A candidate selected from any part of the catalog can take a moment to
    // decode. Hold the existing action instead of clearing it mid-song.
    if(keepCurrentMotionWhileLoadingV659(requestedIdV659,
      libraryClips.filter(c=>c.name.startsWith("Library:")).map(c=>c.name.split(":")[1])))return;
    if (selectedLibraryClip === stableLibraryClip) return;
    const now = clock.elapsedTime;
    const kick = Math.max(0, audio.kickAccentIntensity ?? 0);
    if (kick > 0.6 && lastKickLevel.current <= 0.6) kickTriggeredAt.current = now;
    lastKickLevel.current = kick;
    if (shouldSwitchLiveMotion({now, lastSwitch:lastLibraryTransition.current,
      isStopping:!selectedLibraryClip, beatSync:liveTransition.beatSync,
      bpm:audio.bpm, beatsPerBar:liveTransition.beatsPerBar,
      beatOffset:liveTransition.beatOffset, kickAt:kickTriggeredAt.current})) {
      lastLibraryTransition.current = now;
      setStableLibraryClip(selectedLibraryClip);
    }
  });
  // V531: verified identical animation/rig signatures require direct track
  // binding, not heuristic retargeting. This preserves the authored pose.
  const retargeted = useMemo(() => sharedMotionV531
    ? { clips: importedClips, report: null }
    : importedAnimationScene
      ? retargetHumanoidClips(importedClips, importedAnimationScene, model, readRetargetCalibration(url))
      : { clips: importedClips, report: null }, [importedClips, importedAnimationScene, model, url, calibrationVersion, sharedMotionV531]);
  const [qualityRevisionV321,setQualityRevisionV321]=useState(0);
  useEffect(()=>{const refresh=()=>setQualityRevisionV321(v=>v+1);
    window.addEventListener(MOTION_QUALITY_EVENT_V321,refresh);window.addEventListener('storage',refresh);
    return()=>{window.removeEventListener(MOTION_QUALITY_EVENT_V321,refresh);window.removeEventListener('storage',refresh);};
  },[]);
  // V659: authored installed:ID cues are requested at their playback position;
  // the same bounded loader used by automatic motion owns these resources.
  const clips = useMemo(() => {
    const base=[...animations, ...retargeted.clips.map(clip => {
      const renamed=clip.clone();renamed.name=`${sharedMotionV531?"SharedV531:":"Imported: "}${clip.name}`;return renamed;
    }), ...libraryClips];
    const source=Array.from(new Map(base.map(clip=>[clip.name,clip])).values());
    const quality=readMotionQualityV321();
    if(!quality.enabled)return source;
    // Only use cloned clips, never change shared useGLTF cache or installed GLBs.
    return source.map(clip => quality.protectAuthored && !/^(Imported:|Library:|SharedV531:)/.test(clip.name)
      ?clip:polishMotionClipV321(clip,quality));
  }, [animations, libraryClips, retargeted.clips,qualityRevisionV321,sharedMotionV531]);
  const {preparedBlendsV492,maskedOverlay,autoUpperGestureV490,playbackClips}=useGltfBlendSetupV492({
    clips,url,animationUrl,genre,avatarBlendMask,avatarBlendClip});
  const {groupClockV328,groupPhraseV329,actions,names,groupMixerV328}=useGltfAnimationMixerV492({
    playbackClips,root,autoUpperGestureV490,preparedBlendsV492});
  // V481: a real imported squat/kneel clip is preferred over synthetic knee
  // rotations. Update only on pose transitions, never setState every frame.
  const [lowClipV481,setLowClipV481]=useState<string|null>(null);
  const clipLatchV482=useRef(newLowClipStateV482());
  useFrame((_,delta)=>{
    const cue=groupLowPoseV481?.current;
    const safe=isPlaying&&!reducedMotion&&avatarMotionMode!=="choreography"&&
      !timelineEnabled&&!activeSequence&&!activeLoop&&!avatarBlendEnabled&&
      !smartDanceOverride&&!stableLibraryClip&&!groupClockV328?.settings.enabled&&
      !groupPhraseV329?.settings.enabled;
    const candidate=safe&&cue&&cue.depth>=.08?findLowPoseClipV481(names,cue.mode):null;
    const next=stepLowClipV482(clipLatchV482.current,candidate,delta,track?.id,!safe);
    if(next!==lowClipV481)setLowClipV481(next);
  });
  const [activeLoop, setActiveLoop] = useState<AvatarLoopPreset | null>(null);
  const [activeSequence, setActiveSequence] = useState<ReturnType<typeof getActiveChoreography>>(null);
  const directorLastCheck = useRef(-100);
  const directorLastSwitch = useRef(-100);
  const directorSelectedId = useRef<string | null>(null);
  const [savedDirectorChoreographies, setSavedDirectorChoreographies] = useState<ReturnType<typeof readChoreographies>>([]);
  useEffect(() => {
    const refresh = () => setSavedDirectorChoreographies(readChoreographies().filter(c => c.modelUrl === url && c.animationUrl === (animationUrl ?? "")));
    refresh(); window.addEventListener(CHOREOGRAPHY_CHANGE_EVENT, refresh); window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(CHOREOGRAPHY_CHANGE_EVENT, refresh); window.removeEventListener("storage", refresh); };
  }, [url, animationUrl]);
  const rapLiveEnabledV412=!!rapLiveCandidateV412&&!activeSequence&&!activeLoop&&!avatarBlendEnabled&&!smartDanceOverride&&avatarMotionMode!=="choreography";
  const rapLyricsDocV414=useRef<RapGestureDocumentV414|null>(null);
  const rapLyricsFrameV414=useRef<RapGestureSampleV414>({head:1,arms:1,motionId:"",motionBlend:0,motionSec:0,active:false});
  useEffect(()=>{
    const refresh=()=>{rapLyricsDocV414.current=loadRapGestureDocumentV414(track?.id??"",avatarModelId??"");};
    refresh();window.addEventListener(RAP_GESTURES_CHANGE_V414,refresh);window.addEventListener("storage",refresh);
    return()=>{window.removeEventListener(RAP_GESTURES_CHANGE_V414,refresh);window.removeEventListener("storage",refresh);};
  },[track?.id,avatarModelId]);
  const rapLiveFrameV412=useRef<{section:"verse"|"hook";active:RapLiveSampleV412[]}>({section:"verse",active:[]});
  const rapLiveSectionV412=useRef<{section:"verse"|"hook";previous:null|"verse"|"hook";changedAt:number}>({section:"verse",previous:null,changedAt:0});
  const rapLiveElapsedV412=useRef(0);
  useEffect(()=>{rapLiveElapsedV412.current=0;rapLiveSectionV412.current={section:"verse",previous:null,changedAt:0};rapLiveFrameV412.current={section:"verse",active:[]};},[rapLivePresetV412?.id,track?.id]);
  const sequenceStep = useRef(0);
  const sequenceLastAction = useRef<string | null>(null);
  const sequenceStarted = useRef(0);
  const sequenceWaitingUntil = useRef<number | null>(null);
  useEffect(() => {
    const update = () => { if (!smartDanceEnabled) setActiveSequence(getActiveChoreography(url, animationUrl ?? "")); sequenceStep.current = 0; sequenceLastAction.current = null; sequenceStarted.current = 0; sequenceWaitingUntil.current = null;};
    update(); window.addEventListener(CHOREOGRAPHY_CHANGE_EVENT, update);window.addEventListener("storage", update);
    return () => {window.removeEventListener(CHOREOGRAPHY_CHANGE_EVENT, update);window.removeEventListener("storage", update);};
  }, [url, animationUrl, smartDanceEnabled]);

  useEffect(() => {
    const refresh = () => setActiveLoop(getActiveAvatarLoop(url, animationUrl ?? ""));
    refresh(); window.addEventListener(LOOP_CHANGE_EVENT, refresh); window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(LOOP_CHANGE_EVENT, refresh); window.removeEventListener("storage", refresh); };
  }, [url, animationUrl]);

  useFrame((state) => {
    if (timelineEnabled || !smartDanceEnabled || !isPlaying || reducedMotion) return;
    const now = state.clock.elapsedTime;
    evaluateAnimationBudget(now);
    if (!shouldRunScheduledTask(schedulerInstance, "director", now, Boolean(smartDanceOverride))) return;
    directorLastCheck.current = now;
    const candidates = savedDirectorChoreographies;
    const energy = getDanceEnergy(audio, isPlaying);
    const ranked = measureProfilerPhase("choreography", () => rankChoreographies(candidates, genre, audio.bpm, energy));
    const chosen = smartDanceOverride
      ? candidates.find(c => c.id === smartDanceOverride)?.id ?? null
      : ranked[0]?.id ?? null;
    if (chosen === directorSelectedId.current) return;
    // Allow manual changes immediately; automatic switches have a minimum dwell time.
    if (!smartDanceOverride && now - directorLastSwitch.current < 12) return;
    const next = chosen ? resolveChoreography(chosen, url, animationUrl ?? "") : null;
    directorSelectedId.current = chosen;
    directorLastSwitch.current = now;
    setActiveSequence(next);
    sequenceStep.current = 0; sequenceLastAction.current = null;
    sequenceStarted.current = 0; sequenceWaitingUntil.current = null;
  });
  useEffect(() => {
    directorSelectedId.current = null;
    directorLastSwitch.current = -100;
    directorLastCheck.current = -100;
    if (!smartDanceEnabled) setActiveSequence(getActiveChoreography(url, animationUrl ?? ""));
  }, [smartDanceEnabled, smartDanceOverride, url, animationUrl]);
  const crewReaction = useMemo(()=>prepareCrewReaction(model),[model]);
  const {footIK, updateFootGrounding}=useGltfFootContactV492(root, model, rigTargets, avatarRigProfile);
  useEffect(() => { applyMotionPresetForGenre(genre); }, [genre]);
  const mapping = animationMapping[propsGenreKey(genre)];
  const danceClip = names.find(name => name.startsWith("Imported: ")) ?? names.find((name) => mapping?.playing.some((pattern) => pattern.test(name))) ?? names.find((name) => /dance|move|groove/i.test(name));
  const idleClip = names.find((name) => mapping?.idle.some((pattern) => pattern.test(name))) ?? names.find((name) => /idle|stand|rest/i.test(name));
  const availableDanceClip = danceClip ?? names.find(name => name !== idleClip) ?? idleClip;
  const reactiveMix = avatarMotionMode === "choreography" ? 0.12 : avatarMotionMode === "hybrid" && availableDanceClip ? 0.45 : 1;
  useFrame((state, delta) => {
    const v251StartedAt = typeof performance !== "undefined" ? performance.now() : -1;
    try {     clockElapsed.current = state.clock.elapsedTime;
    sampleAvatarFrame(frameSampler.current, delta, "gltf", isPlaying);
    beatFlowData.current = advanceBeatFlow(beatFlow.current, audio, delta, genre, isPlaying, reducedMotion);
    const avatarRoot = root.current;
    if (!avatarRoot) return;
    if (crew.plan.active && selectedClip === crew.plan.clip) {
      if (crewClock.current.key !== crew.state.key || crewClock.current.position !== crew.state.position) crewClock.current={key:crew.state.key,position:crew.state.position,elapsed:state.clock.elapsedTime};
      const action = selectedClip ? actions[selectedClip] : undefined;
      if (action) {
        action.time=crewClipTime(crew.plan,action.getClip().duration,(state.clock.elapsedTime-crewClock.current.elapsed)*1000);
        groupMixerV328.update(0);
      }
    }

    intelligence.current = updateDanceIntelligence(intelligence.current, audio, state.clock.elapsedTime);
    const intelligenceMultipliers = getDanceIntelligenceMultipliers(intelligence.current);
    musicalStructure.current = updateMusicalStructure(musicalStructure.current, audio, state.clock.elapsedTime, isPlaying, reducedMotion);
    const structure = getMusicalStructure(musicalStructure.current, state.clock.elapsedTime);
    const performance = updatePerformanceDirector(performanceDirector.current, audio, genre, intelligence.current, structure, state.clock.elapsedTime, isPlaying, reducedMotion, avatarDancePreset);
    const rhythmDance = updateRhythmChoreography(rhythmChoreography.current, audio, state.clock.elapsedTime, delta, isPlaying && !reducedMotion);
    if (shouldRunScheduledTask(schedulerInstance, "preview", state.clock.elapsedTime)) {
      previewPublishedAt.current = state.clock.elapsedTime;
      publishDancePerformance({ playing: isPlaying, sequence: rhythmDance.sequence,
        move: isPlaying ? choreography.current.currentMove : "idle", section: performance.section,
        rhythm: audio.learnedRhythm ?? "unknown", confidence: rhythmDance.confidence, blend: rhythmDance.blend,
        ...nextPhraseBoundary(state.clock.elapsedTime, audio.bpm), source: "gltf" });
    }
    // Costly pattern/personality evaluation can run at a lower cadence. Every frame
    // still updates beat accents, prediction, rig interpolation and the actual 3D pose.
    const lastComplexUpdate = animationCadence.current.lastRun;
    const baseAnimationTier = selectMotionWorkloadTier(getActivePerformanceTier(), getAnimationSchedulerTier());
    // Re-evaluate only once per second; retain beat/rig/IK updates every frame.
    if (state.clock.elapsedTime - workloadDecisionV252.current.checkedAt >= 1) {
      const statsV260 = getAvatarFrameStats();
      // V260 is opt-in; V252 remains the default workload policy.
      const directorV260 = readMultiAvatarDirectorEnabled();
      const decision = directorV260
        ? decideMultiAvatarDirector(baseAnimationTier, schedulerInstance, statsV260, isPlaying && !reducedMotion)
        : chooseAvatarWorkloadTier(baseAnimationTier, schedulerInstance, statsV260, isPlaying && !reducedMotion);
      workloadDecisionV252.current = {
        tier: stabilizeAvatarWorkload(workloadLatchV252.current, decision.tier, state.clock.elapsedTime),
        checkedAt: state.clock.elapsedTime,
      };
    }
    const animationTier = workloadDecisionV252.current.tier;
    const updateComplexMotion = shouldUpdateAnimation(animationCadence.current, state.clock.elapsedTime, animationTier);
    publishAnimationQuality(animationTier, animationCadence.current, state.clock.elapsedTime);
    if (updateComplexMotion || !cachedChoreography.current || !cachedSignature.current) {
      const elapsedSinceUpdate = Math.min(0.15, Math.max(delta, Number.isFinite(lastComplexUpdate) ? state.clock.elapsedTime - lastComplexUpdate : delta));
      cachedChoreography.current = updateDanceChoreography(choreography.current, audio, genre, avatarDancePreset, showCue?.enabled?(showCue.section==='hook'||showCue.section==='drop'?'chorus':showCue.section==='break'?'break':'verse'):performance.section, performance.pattern, state.clock.elapsedTime, elapsedSinceUpdate, isPlaying, reducedMotion, { aggression: danceAggression, variation: danceVariation, style: danceMotionStyle }, rhythmDance.moveOptions, genreFusion);
      cachedSignature.current = updateAvatarPersonality(personality.current, audio, avatarModelId, genre, avatarDancePreset, performance.section, state.clock.elapsedTime, isPlaying, reducedMotion);
    }
    const choreographyMotion = cachedChoreography.current;
    const signature = cachedSignature.current;
    const motion = getAvatarAnimationState(audio, genre, isPlaying, reducedMotion, avatarAnimationIntensity, state.clock.elapsedTime, avatarDancePreset);
    const rap = rapGroovePose(audio,state.clock.elapsedTime,{...DEFAULT_RAP_GROOVE,...preferencesRap.current},genre,isPlaying,reducedMotion);
    const expression = getAvatarExpressionState(audio, genre, isPlaying, reducedMotion, avatarAnimationIntensity * performance.expressionIntensity, state.clock.elapsedTime);
    const emotion = updateEmotionV233(emotionV233.current, expression, performance.section, genre, state.clock.elapsedTime, delta, isPlaying, reducedMotion);
    const varied = updatePhraseMotionVariation(phraseVariationV241.current, audio, state.clock.elapsedTime, delta, isPlaying, reducedMotion, genre, motion.intensity, danceVariation, performance.phraseProgress);
    naturalMotion.current = updateNaturalMotion(naturalMotion.current, audio, genre, state.clock.elapsedTime, delta, isPlaying, reducedMotion, avatarDancePreset);
    const natural = naturalMotion.current;
    const phrase = updatePhraseMotion(phraseMotionState.current, performance.section, genre, audio, performance.phraseProgress, delta, isPlaying, reducedMotion);
    const bodyDynamics = updateNaturalDanceDynamics(naturalDanceDynamics.current, audio, state.clock.elapsedTime, delta, isPlaying, reducedMotion, genre, motion.intensity * phrase.groove);
    const preKick = isPlaying && !reducedMotion ? (audio.kickAnticipation ?? 0) : 0;
    const kickAccent = isPlaying && !reducedMotion ? (audio.kickAccentIntensity ?? 0) : 0;
    const patternConfidence = audio.kickPatternConfidence ?? 0;
    const patternAccent = isPlaying && !reducedMotion && patternConfidence >= 0.4 ? (audio.kickPatternAccent ?? 0) * patternConfidence : 0;
    const patternKick = audio.kickPattern === "double" ? patternAccent * 0.32 : audio.kickPattern === "syncopated" ? patternAccent * 0.23 : patternAccent * 0.10;
    const learnedAccent = isPlaying && !reducedMotion && (audio.rhythmConfidence ?? 0) >= 0.5
      ? (audio.rhythmPhraseAccent ?? 0) * (audio.rhythmConfidence ?? 0) * Math.max(0, audio.beatStrength) * 0.22 : 0;
    const smooth = Math.min(1, delta * (danceMotionStyle === "sharp" ? 15 : danceMotionStyle === "smooth" ? 4 : 8));
    const bakedCrewV1135=crew.plan.active&&selectedClip===crew.plan.clip;
    avatarRoot.rotation.y += ((bakedCrewV1135?0:(motion.bodySway + natural.hipSway * 0.35 + (audio.kickPattern === "syncopated" ? patternAccent * 0.055 : 0)) * performance.danceMultiplier) - avatarRoot.rotation.y) * smooth;
    avatarRoot.position.y += ((bakedCrewV1135?avatarOffsetY:motion.bodyBounce * performance.danceMultiplier - preKick * 0.065) - avatarRoot.position.y) * smooth;

    if (updateComplexMotion || !cachedFullBody.current) {
      fullBodyDance.current = updateFullBodyDance(fullBodyDance.current, audio, state.clock.elapsedTime, avatarDancePreset);
      cachedFullBody.current = getFullBodyDanceMotion(fullBodyDance.current, audio, motion.intensity);
    }
    const fullBody = cachedFullBody.current;
    const profile = getAvatarRigProfile(avatarRigProfile);
    const dance = getAvatarDancePreset(avatarDancePreset, genre);
    const liveAmplitude = (0.7 + danceAggression * 0.6) * reactiveMix * phrase.upperBody;
    const coordination = computeNaturalDanceCoordination(audio, state.clock.elapsedTime, isPlaying, reducedMotion, genre ?? undefined, motion.intensity);
    const physics = updateMomentumState(momentum.current, coordination, delta, genre ?? undefined, isPlaying, reducedMotion);
    const musicExpression = computeMusicAwareDanceExpression(beatFlowData.current, isPlaying, reducedMotion, avatarAnimationIntensity);
    const expressiveCue = computeExpressiveCue({audio,genre,phase:performance.section,playing:isPlaying,reducedMotion,elapsed:state.clock.elapsedTime,settings:expressiveSettings.current});
    const combinedMotion = {
      ...physics,
      headNod: expressiveCue.headNod + musicExpression.headNod + rap.headNod + reactiveMix * (-motion.headNod * 0.75 * profile.multipliers.headNod * intelligenceMultipliers.head) + natural.anticipation * 0.035 - preKick * 0.09 + (choreographyMotion.headAccent + signature.head) * liveAmplitude,
      headTurn: expressiveCue.headTurn + motion.bodySway * 0.55 * profile.multipliers.headTurn,
      spineSway: expressiveCue.spineSway + motion.bodySway * 0.8 * profile.multipliers.spineSway + natural.hipSway * 0.28 + bodyDynamics.torsoLean + varied.torso,
      hipSway: natural.hipSway + rap.hipSway + bodyDynamics.hipCounter + varied.hip + (choreographyMotion.hipAccent + signature.hip) * liveAmplitude,
      shoulderRoll: expressiveCue.shoulderRoll + musicExpression.shoulderRoll + natural.shoulderRoll + rap.shoulder + bodyDynamics.shoulderCounter + varied.shoulder,
      followThrough: natural.followThrough,
      headLag: natural.headLag + bodyDynamics.headFollow + varied.head,
      chestPulse: expressiveCue.chestPulse + musicExpression.chestPulse + rap.chest + ((motion.beatImpulse + kickAccent * 0.55 + patternKick + learnedAccent) * 0.055 * profile.multipliers.chestPulse * dance.multipliers.chest * intelligenceMultipliers.chest + performance.poseImpulse * 0.05) * performance.danceMultiplier * phrase.accents,
      armSwing: musicExpression.armSwing + rap.arm + bodyDynamics.armFollow + varied.arm + avatarArmResponse * reactiveMix * (((motion.beatImpulse + kickAccent * 0.55 + patternKick + learnedAccent) * 0.16 * intelligenceMultipliers.kick + Math.sin(state.clock.elapsedTime * 2.4) * 0.08 * motion.intensity * intelligenceMultipliers.arms + natural.anticipation * 0.045) * profile.multipliers.armSwing * dance.multipliers.arms + (choreographyMotion.armAccent + signature.arm) * liveAmplitude) * performance.danceMultiplier + performance.poseImpulse * 0.12 * phrase.accents + (choreographyMotion.poseAccent + signature.pose) * liveAmplitude,
      legGroove: rap.bounce + rap.legGroove + avatarLegResponse * reactiveMix * (fullBody.legGroove * dance.multipliers.bounce + (audio.kickPattern === "double" ? patternAccent * 0.12 : 0) + (choreographyMotion.legAccent + signature.leg) * liveAmplitude) * performance.danceMultiplier,
      footStep: rap.footStep + avatarLegResponse * reactiveMix * fullBody.footStep * dance.multipliers.kick * performance.danceMultiplier,
      weightShift: rap.weightShift + bodyDynamics.weightTransfer + reactiveMix * (fullBody.weightShift * dance.multipliers.sway + natural.weightShift - preKick * 0.12) * performance.danceMultiplier,
      beatImpulse: reactiveMix * (motion.beatImpulse + kickAccent * 0.55 + patternKick + learnedAccent) * performance.danceMultiplier,
      expressionJaw: expressiveCue.expressionJaw + emotion.jaw + musicExpression.expressionJaw,
      expressionBrow: expressiveCue.expressionBrow + emotion.brow + musicExpression.expressionBrow,
      expressionEyeNarrow: expressiveCue.expressionEyeNarrow - emotion.eyeNarrow - musicExpression.expressionEyeNarrow,
      expressionHeadTilt: expressiveCue.headTilt + emotion.headTilt + musicExpression.expressionHeadTilt,
    };
    updateMotionPresetMorph(delta);
    const unified = measureProfilerPhase("motion", () => composeUnifiedMotion(unifiedMotion.current, combinedMotion, {delta, playing:isPlaying, reducedMotion, genre}));
    const refined = refineFullBodyMotion(fullBodyRefinement.current, unified, {dt:delta, active:isPlaying && !reducedMotion, dancer:avatarModelId ?? url, quality:getIKQualitySnapshot(), settings:getRefinementSettings()});
    // V307: phrase-aware expression on additive channels only; clip/IK data remain untouched.
    const expressiveV307 = enhanceDanceQuality(danceQualityV307.current, refined, {
      playing:isPlaying, reducedMotion, delta, songSeconds:updateDanceSongClock(danceSongClockV307.current, {trackId:track?.id, progressMs:cameraDirectorProgressMs, elapsed:state.clock.elapsedTime, playing:isPlaying}),
      trackId:track?.id, dancerKey:`${avatarModelId ?? url}:${workloadSlot}`, genre, section:performance.section,
      bpm:audio.bpm, beatStrength:audio.beatStrength, kick:audio.kickAccentIntensity, snare:audio.snare, energy:audio.energyEnvelope,
      plantedLeft:footIK.current.left?.contact.phase==="planted", plantedRight:footIK.current.right?.contact.phase==="planted",
      authoredClipPriority:avatarMotionMode==="choreography" || !!stableLibraryClip, settings:readDanceQualitySettings(),
    });
    const performanceV311 = refineDancePerformanceV311(dancePerformanceV311.current, expressiveV307, {
      playing:isPlaying, reducedMotion, delta,
      time:updateDanceSongClock(danceSongClockV307.current, {trackId:track?.id, progressMs:cameraDirectorProgressMs, elapsed:state.clock.elapsedTime, playing:isPlaying}),
      trackId:track?.id, genre, section:performance.section, bpm:audio.bpm,
      beat:audio.beatStrength, kick:audio.kickAccentIntensity, snare:audio.snare,
      plantedLeft:footIK.current.left?.contact.phase==="planted", plantedRight:footIK.current.right?.contact.phase==="planted",
      authoredClipPriority:avatarMotionMode==="choreography" || !!stableLibraryClip, settings:readDancePerformanceV311(),
    });
    const performanceV320 = refineNaturalDanceV320(naturalDanceV320.current, performanceV311, {
      settings:readNaturalDanceV320(), playing:isPlaying, reducedMotion, delta,
      time:updateDanceSongClock(danceSongClockV307.current, {trackId:track?.id, progressMs:cameraDirectorProgressMs, elapsed:state.clock.elapsedTime, playing:isPlaying}),
      trackId:track?.id, genre, section:performance.section, bpm:audio.bpm,
      beatPhase:audio.beatPhase, phaseConfidence:audio.phaseConfidence,
      beat:audio.beatStrength, kick:audio.kickAccentIntensity, snare:audio.snare, energy:audio.energyEnvelope,
      plantedLeft:footIK.current.left?.contact.phase==="planted", plantedRight:footIK.current.right?.contact.phase==="planted",
      authoredClipPriority:avatarMotionMode==="choreography" || !!stableLibraryClip,
    });
    const performanceV391=refineDanceFlowV391(danceFlowV391.current,performanceV320,{settings:readDanceFlowV391(),playing:isPlaying,reducedMotion,delta,time:updateDanceSongClock(danceSongClockV307.current,{trackId:track?.id,progressMs:cameraDirectorProgressMs,elapsed:state.clock.elapsedTime,playing:isPlaying}),trackId:track?.id,genre,section:performance.section,slot:workloadSlot,bpm:audio.bpm,energy:audio.energyEnvelope,beat:audio.beatStrength,snare:audio.snare,kick:audio.kickAccentIntensity,plantedLeft:footIK.current.left?.contact.phase==="planted",plantedRight:footIK.current.right?.contact.phase==="planted",authoredClipPriority:avatarMotionMode==="choreography"||!!stableLibraryClip});
    // V314 lightweight pose sampler: only already-computed additive motion, no bone traversal.
    // V323 consumes previous-frame V135 contacts to avoid a feedback loop with
    // V322 Foot-IK (run later in this frame). Never alters GLB clip keyframes.
    const fullBalanceV323=readFullBodyBalanceV323();
    // A GLB may turn at the animated hips rather than the stage root.
    // Sample the current animated world heading; reuse a quaternion to avoid
    // allocation per frame. The core filters angular wrap and limits impulses.
    const animatedHipsV323=fullBalanceV323.enabled?rigTargets.current.hips:null;
    const headingQuaternionV323=animatedHipsV323?.getWorldQuaternion(hipHeadingQuaternionV323.current);
    const headingV323=headingQuaternionV323
      ? Math.atan2(2*(headingQuaternionV323.w*headingQuaternionV323.y+headingQuaternionV323.x*headingQuaternionV323.z),
        1-2*(headingQuaternionV323.y*headingQuaternionV323.y+headingQuaternionV323.z*headingQuaternionV323.z))
      : avatarRoot.rotation.y;
    const performanceV323=refineFullBodyBalanceV323(balanceStateV323.current,performanceV391,{
      settings:fullBalanceV323,
      stance:fullBalanceV323.enabled && avatarFootIKEnabled ? sampleStanceV323(footIK.current,avatarRoot) : null,
      time:updateDanceSongClock(danceSongClockV307.current,{trackId:track?.id,progressMs:cameraDirectorProgressMs,elapsed:state.clock.elapsedTime,playing:isPlaying}),
      delta,trackId:track?.id,playing:isPlaying && avatarFootIKEnabled,reducedMotion,
      yaw:headingV323,
      authoredClipPriority:avatarMotionMode==='choreography'||!!stableLibraryClip,
    });
    if(fullBalanceV323.enabled&&isPlaying&&!reducedMotion&&state.clock.elapsedTime-balanceReportAtV323.current>=1&&typeof window!=='undefined'){
      balanceReportAtV323.current=state.clock.elapsedTime;
      window.dispatchEvent(new CustomEvent(FULL_BODY_BALANCE_DIAGNOSTIC_V323,{detail:fullBodyBalanceReportV323(balanceStateV323.current)}));
    }
    reviewCadenceV314.current+=Math.min(.10,Math.max(0,delta));
    if(isPlaying&&!reducedMotion&&reviewCadenceV314.current>=.25){
      reviewCadenceV314.current=0;
      observeReviewMotionV314({trackId:track?.id??"",slot:workloadSlot,source:"gltf",
        motion:performanceV323,kick:audio.kickAccentIntensity??0,
        footPlanted:footIK.current.left?.contact.phase==="planted"||footIK.current.right?.contact.phase==="planted"});
    }
    // V735: if the imported model already plays an authored Hip_* clip, do not
    // stack a duplicate synthesized move over that authored performance.
    const authoredHipClipV735=['Hip_Sway','Hip_Circle','Hip_Bounce'].some(name=>{
      const action=actions[name];
      return !!action?.isRunning() && action.getEffectiveWeight()>.02;
    });
    const hipManualPriorityV735=authoredHipClipV735||avatarMotionMode==='choreography'||!!stableLibraryClip||!!activeSequence||
      !!activeLoop||timelineEnabled||avatarBlendEnabled||!!smartDanceOverride||!!rapLiveEnabledV412;
    // V545: one bounded additive finishing pass on the existing frame path.
    // The PREVIOUS V492 IK contact state is authoritative; V545 never runs IK.
    const motionV545=refineNaturalDanceMotionV545(danceMotionV545.current,performanceV323,{
      settings:readNaturalDanceMotionV545(),trackId:track?.id,modelKey:avatarModelId??url,
      seconds:updateDanceSongClock(danceSongClockV307.current,{trackId:track?.id,progressMs:cameraDirectorProgressMs,elapsed:state.clock.elapsedTime,playing:isPlaying}),
      delta,playing:isPlaying,reducedMotion,genre,quality:getActivePerformanceTier(),
      manualPriority:hipManualPriorityV735||!!stableLibraryClip||!!activeSequence||!!activeLoop||timelineEnabled||avatarBlendEnabled||!!smartDanceOverride,
      footIKEnabled:avatarFootIKEnabled,contactKnown:!!footIK.current.left&&!!footIK.current.right,
      plantedLeft:footIK.current.left?.contact.phase==='planted',plantedRight:footIK.current.right?.contact.phase==='planted',
    });
    // V587: stance-aware existing arm/shoulder/hip accents only. No new
    // animation actions, render loops, root changes, or IK/contact updates.
    const expressiveMotionV587=refineExpressiveRigV587(motionV545,{
      trackId:track?.id,seconds:updateDanceSongClock(danceSongClockV307.current,{trackId:track?.id,
        progressMs:cameraDirectorProgressMs,elapsed:state.clock.elapsedTime,playing:isPlaying}),
      playing:isPlaying,reducedMotion,genre,section:performance.section,
      quality:getActivePerformanceTier(),
      manualPriority:hipManualPriorityV735||!!stableLibraryClip||!!activeSequence||
        !!activeLoop||timelineEnabled||avatarBlendEnabled||!!smartDanceOverride,
      contactKnown:!!footIK.current.left&&!!footIK.current.right,
      plantedLeft:footIK.current.left?.contact.phase==='planted',
      plantedRight:footIK.current.right?.contact.phase==='planted',
    });
    // V596: release smoothing on *existing* GLB additive foot channels.
    // The actual foot contacts and locks still belong only to the V492 IK.
    const refinedFootworkV596=stepGlbFootworkQualityV596(footworkQualityV596.current,expressiveMotionV587,{
      trackId:track?.id,modelKey:avatarModelId??url,
      seconds:updateDanceSongClock(danceSongClockV307.current,{trackId:track?.id,
        progressMs:cameraDirectorProgressMs,elapsed:state.clock.elapsedTime,playing:isPlaying}),
      delta,playing:isPlaying,reducedMotion,genre,quality:getActivePerformanceTier(),
      manualPriority:hipManualPriorityV735||!!stableLibraryClip||!!activeSequence||
        !!activeLoop||timelineEnabled||avatarBlendEnabled||!!smartDanceOverride,
      footIKEnabled:avatarFootIKEnabled,contactKnown:!!footIK.current.left&&!!footIK.current.right,
      plantedLeft:footIK.current.left?.contact.phase==='planted',
      plantedRight:footIK.current.right?.contact.phase==='planted',
    });
    footworkQualityV596.current=refinedFootworkV596.state;
    // V665: optional contact/pose-transition damping, after V596 and before the
    // existing rig overlay + SINGLE authoritative V492 Foot-IK call.
    const groundingV665Result=stepRealisticGroundingV665(groundingV665.current,refinedFootworkV596.motion,{
      settings:readGroundingSettingsV665(),trackId:track?.id,modelId:avatarModelId??url,
      seconds:updateDanceSongClock(danceSongClockV307.current,{trackId:track?.id,
        progressMs:cameraDirectorProgressMs,elapsed:state.clock.elapsedTime,playing:isPlaying}),
      delta,playing:isPlaying,reducedMotion,
      manualPriority:hipManualPriorityV735||!!stableLibraryClip||!!activeSequence||
        !!activeLoop||timelineEnabled||avatarBlendEnabled||!!smartDanceOverride,
      quality:getActivePerformanceTier(),footIKEnabled:avatarFootIKEnabled,
      contactKnown:!!footIK.current.left&&!!footIK.current.right,
      plantedLeft:footIK.current.left?.contact.phase==='planted',
      plantedRight:footIK.current.right?.contact.phase==='planted',
      poseDepth:groupLowPoseV481?.current?.depth??0,
      poseClipActive:!!lowClipV481&&selectedClip===lowClipV481&&!!actions[lowClipV481],
    });
    groundingV665.current=groundingV665Result.state;
    // V666 adjusts only bounded existing expressive overlays; V665 contact damping,
    // authored GLB clips and the authoritative V492 Foot-IK are untouched.
    const genreV666Result=stepGenreDanceV666(genreDanceV666.current,groundingV665Result.motion,{
      settings:readGenreDanceSettingsV666(),trackId:track?.id,modelId:avatarModelId??url,
      seconds:updateDanceSongClock(danceSongClockV307.current,{trackId:track?.id,
        progressMs:cameraDirectorProgressMs,elapsed:state.clock.elapsedTime,playing:isPlaying}),
      delta,playing:isPlaying,reducedMotion,genre,section:performance.section,
      manualPriority:hipManualPriorityV735||!!stableLibraryClip||!!activeSequence||
        !!activeLoop||timelineEnabled||avatarBlendEnabled||!!smartDanceOverride,
      quality:getActivePerformanceTier(),energy:audio.energyEnvelope,
      kick:audio.kickAccentIntensity,snare:audio.snare,
      footContactKnown:!!footIK.current.left&&!!footIK.current.right,
      plantedLeft:footIK.current.left?.contact.phase==='planted',
      plantedRight:footIK.current.right?.contact.phase==='planted',
    });
    genreDanceV666.current=genreV666Result.state;
    // V993 uses the same V895 verified score as V899/V992. Only additive
    // upper-body channels are scaled; imported clips, legs, pelvis, lip-sync,
    // and the ONE existing V492 Foot-IK stage remain untouched.
    const choreographySignalV993=readConcertStageSyncV882();
    const choreographyV993=sampleChoreographyV993(genreV666Result.motion,{
      settings:choreographySignalV993.choreographySettingsV993??DEFAULT_CHOREOGRAPHY_V993,
      plan:choreographySignalV993.directorPlanV895,
      trackId:track?.id??'',durationMs:choreographySignalV993.durationMs,
      positionMs:cameraDirectorProgressMs??-1,genre,playing:isPlaying,
      autoEnabled:choreographySignalV993.enabled&&choreographySignalV993.sync.dance,
      directorEnabled:!!choreographySignalV993.directorSettingsV895?.enabled,
      danceEnabled:!!choreographySignalV993.directorSettingsV895?.dance,
      tier:getActivePerformanceTier(),reducedMotion,
      manualPriority:hipManualPriorityV735||!!stableLibraryClip||!!activeSequence||
        !!activeLoop||timelineEnabled||avatarBlendEnabled||!!smartDanceOverride||!!clipChoiceV328||
        !!phraseChoiceV329||!!rapLiveEnabledV412||!!lowClipV481&&selectedClip===lowClipV481,
      manualFx:!!choreographySignalV993.manual,blackout:!choreographySignalV993.playing,
      seekBlocked:(cameraDirectorProgressMs??-1)<(choreographySignalV993.atmosphereSeekBlockedUntilMs??0),
      lyricsVisible:!!propsLipSyncV367?.cinematicLyricsVisibleV378,
      footContactKnown:!!footIK.current.left&&!!footIK.current.right,
      plantedLeft:footIK.current.left?.contact.phase==='planted',
      plantedRight:footIK.current.right?.contact.phase==='planted',
      slot:Math.max(0,Math.min(3,workloadSlot??0)),count:Math.max(1,Math.min(4,ensembleCountV745??Math.max(workloadSlot+1,propsLipSyncV367?.ensembleCountV374??1))),
      energy:readEnergyV896(track?.id??'',choreographySignalV993.durationMs,cameraDirectorProgressMs??-1),
    });
    // V759 varies only EXISTING expressive rig scalars at musical phrase boundaries.
    // It never replaces GLB clips or touches feet, hips, root, lip sync or IK.
    const varietyV759=stepDanceVarietyV759(varietyStateV759.current,choreographyV993.motion,{
      settings:groovePreferences.avatarDanceVarietyV759,trackId:track?.id,modelId:avatarModelId??url,
      seconds:updateDanceSongClock(danceSongClockV307.current,{trackId:track?.id,
        progressMs:cameraDirectorProgressMs,elapsed:state.clock.elapsedTime,playing:isPlaying}),
      delta,bpm:audio.bpm,genre,section:showCue?.enabled?showCue.section:performance.section,
      slot:workloadSlot,playing:isPlaying,reducedMotion,
      manualPriority:hipManualPriorityV735||!!stableLibraryClip||!!activeSequence||
        !!activeLoop||timelineEnabled||avatarBlendEnabled||!!smartDanceOverride||!!clipChoiceV328||!!phraseChoiceV329||
        !!rapLiveEnabledV412|| (!!lowClipV481&&selectedClip===lowClipV481),
      quality:getActivePerformanceTier(),qualityGain:propsLipSyncV367?.qualityDanceGainV750??1,
    });
    varietyStateV759.current=varietyV759.state;
    // V684: slow, phrase-based variety on existing, already-grounded additive
    // rig scalars. Authored clips, IK contact, facial/vocal and root paths win.
    const evolvedMotionV684=refineNaturalDanceRigV684(varietyV759.motion,{
      trackId:track?.id,
      seconds:updateDanceSongClock(danceSongClockV307.current,{trackId:track?.id,
        progressMs:cameraDirectorProgressMs,elapsed:state.clock.elapsedTime,playing:isPlaying}),
      playing:isPlaying,reducedMotion,genre,section:performance.section,
      slot:Math.max(0,Math.min(3,workloadSlot??0)),quality:getActivePerformanceTier(),
      manualPriority:hipManualPriorityV735||!!stableLibraryClip||!!activeSequence||
        !!activeLoop||timelineEnabled||avatarBlendEnabled||!!smartDanceOverride,
      footContactKnown:avatarFootIKEnabled&&!!footIK.current.left&&!!footIK.current.right,
      plantedLeft:footIK.current.left?.contact.phase==='planted',
      plantedRight:footIK.current.right?.contact.phase==='planted',
    });
    // V685: final bounded RAP ONLY pass; do not reassign vocalist, lips, clips
    // or foot contacts. Verified synced lyric timing may emphasize *existing*
    // gestures, while manually-authored rap presets and choreography take priority.
    const rapCueV685 = rapGenreV685(genre) && propsLipSyncV367?.enabled===true &&
      propsLipSyncV367?.playing===true && Number.isFinite(propsLipSyncV367.progressMs) &&
      typeof cameraDirectorProgressMs==='number' && Number.isFinite(cameraDirectorProgressMs) &&
      Math.abs(propsLipSyncV367.progressMs-cameraDirectorProgressMs)<1800
      ? sampleRapLyricsCueV413(propsLipSyncV367.lyrics,propsLipSyncV367.progressMs,
          isPlaying,reducedMotion,propsLipSyncV367.coordinationOffsetMsV372??0)
      : null;
    const advancedRapV685=refineAdvancedRapRigV685(evolvedMotionV684,{
      trackId:track?.id,seconds:updateDanceSongClock(danceSongClockV307.current,{trackId:track?.id,
        progressMs:cameraDirectorProgressMs,elapsed:state.clock.elapsedTime,playing:isPlaying}),
      playing:isPlaying,reducedMotion,genre,section:performance.section,
      slot:Math.max(0,Math.min(3,workloadSlot??0)),quality:getActivePerformanceTier(),
      manualPriority:hipManualPriorityV735||!!stableLibraryClip||!!activeSequence||
        !!activeLoop||timelineEnabled||avatarBlendEnabled||!!smartDanceOverride||!!rapLiveEnabledV412,
      footContactKnown:avatarFootIKEnabled&&!!footIK.current.left&&!!footIK.current.right,
      plantedLeft:footIK.current.left?.contact.phase==='planted',
      plantedRight:footIK.current.right?.contact.phase==='planted',
      lyricCue:rapCueV685,
    });
    // Conservative additive pelvis dance; existing GLB clips and the
    // end-of-frame V492 IK remain authoritative. Never override manual shows.
    const hipSettingsV735=normalizeHipDanceV735({mode:groovePreferences.avatarHipDanceModeV735,
      strength:(groovePreferences.avatarHipDanceStrengthV735??45)*(propsLipSyncV367?.qualityDanceGainV750??1),speed:groovePreferences.avatarHipDanceSpeedV735});
    // V742 selects a genre/section phrase only for AUTO hips. Authored clips,
    // manual timelines and explicit movement choices are never overridden.
    const genreHipV742=directGenreHipV742({config:groovePreferences.avatarGenreHipV742,
      hip:hipSettingsV735,studio:groovePreferences.avatarHipStudioV738,
      genre,section:performance.section,
      seconds:typeof cameraDirectorProgressMs==='number'&&Number.isFinite(cameraDirectorProgressMs)
        ?Math.max(0,cameraDirectorProgressMs/1000):state.clock.elapsedTime,
      bpm:audio.bpm,playing:isPlaying,reducedMotion,manualPriority:hipManualPriorityV735});
    // V744 adds non-repeating musical phrases only after V742 has confirmed
    // the genre auto-selection. The existing V738 mixer smooths transitions.
    const smartHipPlanV744=directSmartHipV744(smartHipV744.current,{
      settings:groovePreferences.avatarSmartHipV744,plan:genreHipV742,
      originalHip:hipSettingsV735,trackId:track?.id,
      seconds:typeof cameraDirectorProgressMs==='number'&&Number.isFinite(cameraDirectorProgressMs)
        ?Math.max(0,cameraDirectorProgressMs/1000):state.clock.elapsedTime,
      bpm:audio.bpm,section:performance.section,playing:isPlaying,reducedMotion,
      manualPriority:hipManualPriorityV735});
    // V745 arranges the same V744 phrases across GLB performers. This layer
    // cannot override authored GLB motions, timelines, reduced motion, or IK.
    const ensembleHipPlanV745=directEnsembleHipV745(ensembleHipV745.current,{
      settings:groovePreferences.avatarEnsembleHipV745,plan:smartHipPlanV744,
      slot:workloadSlot,count:ensembleCountV745??Math.max(workloadSlot+1,propsLipSyncV367?.ensembleCountV374??1),
      trackId:track?.id,
      seconds:typeof cameraDirectorProgressMs==='number'&&Number.isFinite(cameraDirectorProgressMs)
        ?Math.max(0,cameraDirectorProgressMs/1000):state.clock.elapsedTime,
      bpm:audio.bpm,playing:isPlaying,reducedMotion,manualPriority:hipManualPriorityV735,delta,
    });
    // V738 samples V735 mode poses (sampleHipDanceV735) with shared C1 crossfades.
    const hipStudioFrameV738 = sampleHipStudioV738(hipStudioV738.current,{
      settings:ensembleHipPlanV745.hip,
      seconds:ensembleHipPlanV745.seconds,
      bpm:audio.bpm, genre, section:performance.section,
      playing:isPlaying,reducedMotion,
      manualPriority:hipManualPriorityV735,
      beat:audio.beatStrength,energy:audio.energyEnvelope,
      footIKEnabled:avatarFootIKEnabled,contactKnown:!!footIK.current.left&&!!footIK.current.right,
      plantedLeft:footIK.current.left?.contact.phase==='planted',
      plantedRight:footIK.current.right?.contact.phase==='planted',
      studio:ensembleHipPlanV745.studio,delta,trackId:track?.id,
    });
    // V743 uses genuine kick/bass/attack analysis; no phantom metronome.
    // The pre-existing V738 foot-contact and manual/GLB priority rules remain.
    const beatBassFrameV743=sampleBeatBassV743(beatBassV743.current,{
      pose:hipStudioFrameV738.pose,mode:hipStudioFrameV738.mode,poseStrength:hipStudioFrameV738.effectiveStrength,
      settings:groovePreferences.avatarBeatBassV743,
      seconds:typeof cameraDirectorProgressMs==='number'&&Number.isFinite(cameraDirectorProgressMs)
        ?Math.max(0,cameraDirectorProgressMs/1000):state.clock.elapsedTime,
      delta,trackId:track?.id,bpm:audio.bpm,genre,section:performance.section,
      kick:audio.kickAccentIntensity,beat:audio.beatStrength,bass:audio.bass,attack:audio.attack,
      playing:isPlaying,reducedMotion,manualPriority:hipManualPriorityV735,
      footIKEnabled:avatarFootIKEnabled,contactKnown:!!footIK.current.left&&!!footIK.current.right,
      plantedLeft:footIK.current.left?.contact.phase==='planted',
      plantedRight:footIK.current.right?.contact.phase==='planted',
    });
    // V872: refine existing hip channels after V743, BEFORE V740/V758 and IK.
    // No authored GLB or manually selected hip sequence is modified.
    const hipDanceV735=refineNaturalContinuityV872(continuityV872.current,{
      settings:groovePreferences.avatarDanceContinuityV872,
      pose:beatBassFrameV743.pose,mode:hipStudioFrameV738.mode,
      trackId:track?.id,seconds:typeof cameraDirectorProgressMs==='number'&&Number.isFinite(cameraDirectorProgressMs)
        ?Math.max(0,cameraDirectorProgressMs/1000):state.clock.elapsedTime,
      delta,playing:isPlaying,reducedMotion,manualPriority:hipManualPriorityV735,
      autoMode:hipSettingsV735.mode==='auto',
      footIKEnabled:avatarFootIKEnabled,contactKnown:!!footIK.current.left&&!!footIK.current.right,
      plantedLeft:footIK.current.left?.contact.phase==='planted',
      plantedRight:footIK.current.right?.contact.phase==='planted',
      slot:workloadSlot,count:ensembleCountV745??Math.max(workloadSlot+1,propsLipSyncV367?.ensembleCountV374??1),
      section:performance.section,
    }).pose;
    const debugSettingsV735=getRuntimeMotionSettings();
    const hipTorsoGainV735=debugSettingsV735.layers.torso?(debugSettingsV735.weights?.torso??1):0;
    const hipLegGainV735=debugSettingsV735.layers.legs?(debugSettingsV735.weights?.legs??1):0;
    const adjustedHipV735={...hipDanceV735,
      hipPitch:(hipDanceV735.hipPitch??0)*hipTorsoGainV735,
      hipRoll:(hipDanceV735.hipRoll??0)*hipTorsoGainV735,
      hipLateral:(hipDanceV735.hipLateral??0)*hipTorsoGainV735,
      hipVertical:(hipDanceV735.hipVertical??0)*hipTorsoGainV735,
      spineCounter:hipDanceV735.spineCounter*hipTorsoGainV735,
      kneeCounter:hipDanceV735.kneeCounter*hipLegGainV735,
      ankleCounter:hipDanceV735.ankleCounter*hipLegGainV735};
    // V740: body counter-motion follows the *blended* hips from V738, and
    // never changes grounded ankles or manually authored choreography.
    const naturalBodyV740 = sampleNaturalBodyV740({
      pose:adjustedHipV735,mode:hipStudioFrameV738.mode,
      seconds:typeof cameraDirectorProgressMs==='number'&&Number.isFinite(cameraDirectorProgressMs)
        ?Math.max(0,cameraDirectorProgressMs/1000):state.clock.elapsedTime,
      playing:isPlaying,reducedMotion,manualPriority:hipManualPriorityV735,
      footIKEnabled:avatarFootIKEnabled,contactKnown:!!footIK.current.left&&!!footIK.current.right,
      plantedLeft:footIK.current.left?.contact.phase==='planted',
      plantedRight:footIK.current.right?.contact.phase==='planted',
      settings:groovePreferences.avatarNaturalBodyV740,
    });
    // V758: smooth, contact-aware weight transfer and upper-body follow-through;
    // the original GLB motion, manual cues, pelvis translations and final IK win.
    const naturalDanceV758=directNaturalDanceV758(danceNaturalStateV758.current,{
      settings:groovePreferences.avatarNaturalDanceV758,
      hip:adjustedHipV735,body:naturalBodyV740,mode:hipStudioFrameV738.mode,
      trackId:track?.id,seconds:typeof cameraDirectorProgressMs==='number'&&Number.isFinite(cameraDirectorProgressMs)
        ?Math.max(0,cameraDirectorProgressMs/1000):state.clock.elapsedTime,
      delta,playing:isPlaying,reducedMotion,manualPriority:hipManualPriorityV735,
      footIKEnabled:avatarFootIKEnabled,contactKnown:!!footIK.current.left&&!!footIK.current.right,
      plantedLeft:footIK.current.left?.contact.phase==='planted',
      plantedRight:footIK.current.right?.contact.phase==='planted',
      qualityGain:propsLipSyncV367?.qualityDanceGainV750??1,
    });
    const baseDebugMotionV1024 = blendNaturalBodyV740(
      blendHipDanceV735(filterMotionDebugLayers(advancedRapV685, debugSettingsV735), naturalDanceV758.hip),
      {...naturalDanceV758.body,
        headTilt:debugSettingsV735.layers.head?naturalDanceV758.body.headTilt:0,
        chestRoll:naturalDanceV758.body.chestRoll*hipTorsoGainV735,
        chestTwist:naturalDanceV758.body.chestTwist*hipTorsoGainV735,
        leftArm:debugSettingsV735.layers.arms?naturalDanceV758.body.leftArm*(debugSettingsV735.weights?.arms??1):0,
        rightArm:debugSettingsV735.layers.arms?naturalDanceV758.body.rightArm*(debugSettingsV735.weights?.arms??1):0,
        leftForearm:debugSettingsV735.layers.arms?naturalDanceV758.body.leftForearm*(debugSettingsV735.weights?.arms??1):0,
        rightForearm:debugSettingsV735.layers.arms?naturalDanceV758.body.rightForearm*(debugSettingsV735.weights?.arms??1):0,
        leftLeg:naturalDanceV758.body.leftLeg*hipLegGainV735,
        rightLeg:naturalDanceV758.body.rightLeg*hipLegGainV735,
        leftAnkle:naturalDanceV758.body.leftAnkle*hipLegGainV735,
        rightAnkle:naturalDanceV758.body.rightAnkle*hipLegGainV735,
      });
    // V1024: phrase variety from the existing music clock, applied to already
    // calculated upper-body overlays. V839 remains the final additive footwork
    // guardian; mixer clips, root motion, IK anchors and lips are never changed.
    // V1078: sub-step groove variation uses existing audio/IK evidence.
    // This stays BEFORE V1024's phrase crossfade and V839's final Foot-IK guard.
    const naturalDanceV1078=refineNaturalDanceV1078(baseDebugMotionV1024,{
      enabled:arenaNaturalDanceEnabledV1078&&stageTheme==='arena360',
      strength:arenaNaturalDanceStrengthV1078,trackId:track?.id,
      seconds:cameraDirectorProgressMs===undefined?NaN:cameraDirectorProgressMs/1000,
      bpm:audio.bpm,genre,section:showCue?.enabled?showCue.section:performance.section,
      energy:audio.energyEnvelope??0,beat:audio.beatStrength??0,snare:audio.snare??0,
      playing:isPlaying,reducedMotion,
      manualPriority:hipManualPriorityV735||!!stableLibraryClip||!!activeSequence||
        !!activeLoop||timelineEnabled||avatarBlendEnabled||!!smartDanceOverride||
        !!clipChoiceV328||!!phraseChoiceV329||!!rapLiveEnabledV412||
        (!!lowClipV481&&selectedClip===lowClipV481),
      quality:getActivePerformanceTier(),qualityGain:propsLipSyncV367?.qualityDanceGainV750??1,
      footIKEnabled:avatarFootIKEnabled,contactKnown:!!footIK.current.left&&!!footIK.current.right,
      plantedLeft:footIK.current.left?.contact.phase==='planted',
      plantedRight:footIK.current.right?.contact.phase==='planted',
      slot:Math.max(0,Math.min(3,workloadSlot??0)),
      count:Math.max(1,Math.min(4,ensembleCountV745??Math.max(workloadSlot+1,propsLipSyncV367?.ensembleCountV374??1))),
    });
    const danceV1024=stepDanceChoreographyV1024(danceStateV1024.current,naturalDanceV1078.motion,{
      trackId:track?.id,modelId:avatarModelId??url,
      seconds:updateDanceSongClock(danceSongClockV307.current,{trackId:track?.id,
        progressMs:cameraDirectorProgressMs,elapsed:state.clock.elapsedTime,playing:isPlaying}),
      delta,bpm:audio.bpm,section:showCue?.enabled?showCue.section:performance.section,genre,
      playing:isPlaying,reducedMotion,
      manualPriority:hipManualPriorityV735||!!stableLibraryClip||!!activeSequence||
        !!activeLoop||timelineEnabled||avatarBlendEnabled||!!smartDanceOverride||
        !!clipChoiceV328||!!phraseChoiceV329||!!rapLiveEnabledV412||
        (!!lowClipV481&&selectedClip===lowClipV481),
      quality:getActivePerformanceTier(),footIKEnabled:avatarFootIKEnabled,
      contactKnown:!!footIK.current.left&&!!footIK.current.right,
      plantedLeft:footIK.current.left?.contact.phase==='planted',
      plantedRight:footIK.current.right?.contact.phase==='planted',
      slot:Math.max(0,Math.min(3,workloadSlot??0)),
      count:Math.max(1,Math.min(4,ensembleCountV745??Math.max(workloadSlot+1,propsLipSyncV367?.ensembleCountV374??1))),
      qualityGain:propsLipSyncV367?.qualityDanceGainV750??1,
    });
    danceStateV1024.current=danceV1024.state;
    // V1061 only adds bounded rotation accents before V839's final footwork
    // guardian and the existing IK solve. No new animation action or root movement.
    const naturalCueV1061=planNaturalMotionV1061({
      enabled:arenaNaturalMotionEnabledV1061&&stageTheme==='arena360',
      strength:arenaNaturalMotionStrengthV1061,
      playing:isPlaying,reducedMotion,
      manualPriority:hipManualPriorityV735||!!stableLibraryClip||!!activeSequence||
        !!activeLoop||timelineEnabled||avatarBlendEnabled||!!smartDanceOverride||
        !!clipChoiceV328||!!phraseChoiceV329||!!rapLiveEnabledV412,
      quality:getActivePerformanceTier(),trackId:track?.id,
      seconds:cameraDirectorProgressMs===undefined?NaN:cameraDirectorProgressMs/1000,
      bpm:audio.bpm,energy:audio.energyEnvelope??0,
      beat:audio.beatStrength??0,snare:audio.snare??0,genre,section:performance.section,
      slot:workloadSlot,footIKEnabled:avatarFootIKEnabled,
      contactKnown:!!footIK.current.left&&!!footIK.current.right,
      plantedLeft:footIK.current.left?.contact.phase==='planted',
      plantedRight:footIK.current.right?.contact.phase==='planted',
    });
    const debugMotion = overlayNaturalMotionV1061(danceV1024.motion,naturalCueV1061);
    // V839 is an additive-only, contact-evidenced FINAL dance guard. It never
    // edits source GLB clips, IK anchors, root motion, lips or manual cues.
    const footworkV839=refineNaturalFootworkRigV839(naturalFootworkV839.current,debugMotion,{
      settings:readNaturalFootworkV839(),trackId:track?.id,modelId:avatarModelId??url,
      seconds:updateDanceSongClock(danceSongClockV307.current,{trackId:track?.id,
        progressMs:cameraDirectorProgressMs,elapsed:state.clock.elapsedTime,playing:isPlaying}),
      delta,playing:isPlaying,reducedMotion,genre,section:performance.section,
      manualPriority:hipManualPriorityV735||!!stableLibraryClip||
        !!activeSequence||!!activeLoop||timelineEnabled||avatarBlendEnabled||!!smartDanceOverride||
        !!clipChoiceV328||!!phraseChoiceV329||!!rapLiveEnabledV412||!!lowClipV481&&selectedClip===lowClipV481,
      quality:getActivePerformanceTier(),footIKEnabled:avatarFootIKEnabled,
      contactKnown:!!footIK.current.left&&!!footIK.current.right,
      plantedLeft:footIK.current.left?.contact.phase==='planted',
      plantedRight:footIK.current.right?.contact.phase==='planted',
    });
    naturalFootworkV839.current=footworkV839.state;
    // V741: optional mesh deformation, distinct from pelvis/Foot-IK pose.
    // Disabled or unsupported rigs receive zero; no new skin weights are invented.
    const glutePoseV741=sampleGluteV741({pose:adjustedHipV735,mode:hipStudioFrameV738.mode,
      playing:isPlaying,reducedMotion,manualPriority:hipManualPriorityV735,
      settings:groovePreferences.avatarGluteRigV741});
    applyGluteRigV741(gluteRigV741,gluteOverlayV741,glutePoseV741,
      groovePreferences.avatarGluteRigV741,delta);
    sampleMotionQuality(motionQualitySampler.current, footworkV839.motion, delta, isPlaying && !reducedMotion);
    measureProfilerPhase("rigging", () => applyAvatarRigMotion(rigTargets.current, footworkV839.motion, delta * (danceMotionStyle === "sharp" ? 1.8 : danceMotionStyle === "smooth" ? 0.55 : 1)));
    applyPartnerLook(rigTargets.current, partnerLook?.current ?? NEUTRAL_LOOK, delta, lastPartnerLook.current);
    applyPartnerGesture(rigTargets.current, partnerGesture?.current ?? NEUTRAL_GESTURE, delta, lastPartnerGesture.current);
    // V1074: only additive gaze/upper-arm offsets. Source clips, feet,
    // lip-sync, root motion and the existing IK solver retain ownership.
    const audienceSampleV1074=sampleAvatarAudienceInteractionV1074(
      avatarMotionMode==='choreography'||timelineEnabled||!!stableLibraryClip||
      !!activeSequence||!!activeLoop||avatarBlendEnabled||!!smartDanceOverride||
      !!clipChoiceV328||!!phraseChoiceV329||!!rapLiveEnabledV412||
      !isPlaying||reducedMotion||getActivePerformanceTier()==='low'
       ?null:arenaAvatarAudienceCueV1074,
      cameraDirectorProgressMs,workloadSlot,audio.beat?audio.beatStrength:0);
    const beforeV1074=lastAudiencePoseV1074.current;
    const nextV1074=blendAvatarAudiencePoseV1074(beforeV1074,audienceSampleV1074,delta);
    const rigV1074=rigTargets.current;
    if(rigV1074.head){
      rigV1074.head.rotation.y+=nextV1074.headYaw-beforeV1074.headYaw;
      rigV1074.head.rotation.x+=nextV1074.headPitch-beforeV1074.headPitch;
    }
    if(rigV1074.leftArm)rigV1074.leftArm.rotation.z+=nextV1074.leftLift-beforeV1074.leftLift;
    if(rigV1074.rightArm)rigV1074.rightArm.rotation.z-=nextV1074.rightLift-beforeV1074.rightLift;
    lastAudiencePoseV1074.current=nextV1074;
    applyCrewReaction(crewReaction,crew.plan,crew.plan.beat+Math.min(1,Math.max(0,state.clock.elapsedTime-crewClock.current.elapsed))*crew.plan.bpm/60,audio.energyEnvelope??.35,delta);
    // Report only the actually selected, dominant loaded action. No planning preview is counted.
    if(crewSettings.showPlans&&crewSettings.enabled&&crewSettings.mode==='adaptive'&&track?.id&&typeof window!=='undefined'){
      const source=`track:${track.id}`,now=state.clock.elapsedTime;
      if(crewTelemetry.current.source!==source||now-crewTelemetry.current.at>=.5){
        crewTelemetry.current={source,at:now};
        const action=selectedClip?actions[selectedClip]:null;
        const observed=isPlaying&&!reducedMotion&&!crewManualV1135&&crew.plan.active&&selectedClip===crew.plan.clip&&action?.enabled&&(action.getEffectiveWeight()??0)>.5;
        window.dispatchEvent(new CustomEvent('sonic:crew-performance',{detail:{source,slot:workloadSlot,costume:observed?model.userData.songCostume??null:null,ensemble:observed?{role:crew.plan.interaction?.role,gaze:crewReaction.find(item=>item.node.name==='Head')?.channels.y??0}:null,clip:observed?selectedClip:null,dance:observed&&crew.plan.dance?{phase:crew.plan.dance.phase,role:crew.plan.dance.role,bars:crew.plan.dance.bars,measured:crew.plan.dance.measured}:null,bond:crew.plan.story?.relationship?.id,progressMs:cameraDirectorProgressMs??propsLipSyncV367?.progressMs??0}}));
      }
    }
    applyGltfVocalPerformanceV492({propsLipSyncV367,trackId:track?.id??"",audio,genre,showCue,reducedMotion,isPlaying,
      workloadSlot,avatarMotionMode,stableLibraryClip,partnerGesture,partnerLook,partnerHand,
      groovePreferences,rapLiveEnabledV412,rapLiveFrameV412,rapLyricsFrameV414,preferencesRap,
      performanceSection:performance.section,rigTargets,vocalStageOverlayV371,delta});
    const arm = rigTargets.current;
    // Measure each GLB rig once when valid bones become available. Do not remeasure dancing poses.
    if (!measuredProportions.current) measuredProportions.current = measureAvatarProportions(arm);
    const calibrated = resolveContactCalibration(contactCalibration, measuredProportions.current);
    const activeHandCue = calibratePartnerCue(isPlaying && !reducedMotion ? (partnerHand?.current ?? NEUTRAL_HAND) : NEUTRAL_HAND, calibrated);
    // Shoulder/chest assist is additive, conservative and reset every frame.
    updatePartnerTorso({chest: arm.chest, spine: arm.spine, upper: arm.rightArm, hand: arm.rightHand},
      torsoIK.current, activeHandCue.target, activeHandCue.enabled ? activeHandCue.strength : 0, delta, calibrated.reach);
    measureProfilerPhase("handIK", () => updatePartnerHandIK({upper: arm.rightArm, lower: arm.rightForearm, hand: arm.rightHand}, handIK.current,
      activeHandCue, delta, calibrated.reach, ikConstraints.current));
    // Grounding is a single in-order call after all authored and additive motion.
    updateFootGrounding({delta,elapsed:state.clock.elapsedTime,root:avatarRoot,audio,genre,
      playing:isPlaying,reducedMotion,enabled:avatarFootIKEnabled,strength:avatarFootIKStrength,
      contact:avatarFootIKContact,lock:avatarFootIKLock,trackId:track?.id??"",
      progressMs:cameraDirectorProgressMs,rigTargets,constraints:ikConstraints,
      avatarKey:avatarModelId??url,ikQualitySampler,handIK,activeHandCue,
      hipFootLockV737:{enabled:!hipManualPriorityV735&&isPlaying&&!reducedMotion&&
        hipTorsoGainV735>0&&hipSettingsV735.mode!=='off'&&hipSettingsV735.strength>0&&hipStudioFrameV738.effectiveStrength>0||bakedCrewV1135&&crewSettings.mode==='adaptive',
        
        intensity:bakedCrewV1135?.55:hipStudioFrameV738.effectiveStrength}});
    } finally {
      if (v251StartedAt >= 0) recordAvatarFrame(schedulerInstance, `GLTF: ${avatarModelId ?? url.split("/").pop() ?? "Avatar"}`, performance.now() - v251StartedAt, performance.now());
    }
  });
  // Crossfade embedded clips; reactive mode uses idle while the rig controller handles movement.
  // Never restart animations when only the playback speed changes.
  const loopClip = !activeSequence && activeLoop ? (activeLoop.clipId.startsWith("embedded:")
    ? animations[Number(activeLoop.clipId.split(":")[1])]?.name
    : clips[animations.length + Number(activeLoop.clipId.split(":")[1])]?.name) : undefined;
  // Explicit group clip selection is scoped to the opt-in V328 stage. Never
  // replace manually sequenced, looped, layered or timeline-authored clips.
  const clipChoiceV328=groupClockV328?.settings.enabled && !timelineEnabled && !activeSequence && !activeLoop && !avatarBlendEnabled
    ? names[groupClockV328.settings.clipIndexes[groupClockV328.clock.current.slot]??-1] : undefined;
  const selectedClipLegacy = isPlaying && !reducedMotion
    ? (stableLibraryClip && actions[stableLibraryClip] ? stableLibraryClip : loopClip && actions[loopClip] ? loopClip : (avatarMotionMode === "reactive" ? (idleClip ?? availableDanceClip) : availableDanceClip))
    : (idleClip ?? availableDanceClip);
  // V329 suggests an existing clip; explicit V328 clip choices and authored timelines win.
  const phraseSlotV329=groupClockV328?.clock.current.slot??-1;
  const phraseIndexV329=phraseSlotV329>=0?groupPhraseV329?.plan.indices[phraseSlotV329]??-1:-1;
  const phraseChoiceV329=groupPhraseV329?.settings.enabled && !timelineEnabled && !activeSequence && !activeLoop && !avatarBlendEnabled && (!groupClockV328?.settings.enabled || (groupClockV328.settings.clipIndexes[phraseSlotV329]??-1)<0) && phraseIndexV329>=0
    ? names[phraseIndexV329] : undefined;
  const autoMotionV356=autonomousShowPhraseV356?.enabled && avatarMotionMode==='hybrid' && !stableLibraryClip && !activeLoop && !activeSequence && !timelineEnabled && !avatarBlendEnabled && !groupClockV328?.settings.enabled && !groupPhraseV329?.settings.enabled && !smartDanceOverride && isPlaying && !reducedMotion
    ? selectAutonomousMotionV356(names,undefined,track?.id,autonomousShowPhraseV356.index,workloadSlot):undefined;
  // V530 uses only clips embedded in THIS avatar GLB. External motions, imported
  // motion files and timeline/manual/group directors keep their existing priority.
  // This metadata is memoized per GLB; no per-frame GLTF inspection or new mixer.
  const embeddedCandidatesV530=useMemo(()=> (sharedMotionV531
    ? retargeted.clips.map(c=>({name:`SharedV531:${c.name}`,duration:c.duration,trackCount:c.tracks.length}))
    : animations.filter(c=>names.includes(c.name)).map(c=>({name:c.name,duration:c.duration,trackCount:c.tracks.length})))
    .filter(c=>names.includes(c.name)),[animations,names,retargeted.clips,sharedMotionV531]);
  const manualEmbeddedPriorityV530=avatarMotionMode!=='hybrid'||!!animationUrl||!!activeSequence||
    !!activeLoop||timelineEnabled||avatarBlendEnabled||!!stableLibraryClip||!!smartDanceOverride||
    !!lowClipV481||!!clipChoiceV328||!!phraseChoiceV329||!!autoMotionV356||
    !!groupClockV328?.settings.enabled||!!groupPhraseV329?.settings.enabled||
    rapLiveEnabledV412||!!rapLiveCandidateV412;
  const crewManualV1135=avatarMotionMode!=='hybrid'||Math.abs(avatarClipSpeed-1)>.001||!!animationUrl||sharedMotionV531||!!activeSequence||
      !!activeLoop||timelineEnabled||avatarBlendEnabled||!!stableLibraryClip||!!smartDanceOverride||
      !!lowClipV481||!!clipChoiceV328||!!phraseChoiceV329||!!groupClockV328?.settings.enabled||
      !!groupPhraseV329?.settings.enabled||!!rapLiveEnabledV412||!!rapLiveCandidateV412||
      !!evolutionMotion||!!adaptiveMotion||!!preferredMotionUrlV440;
  const placementV1135=stagePlacementV1135({bundled:CREW_IDS.some(id=>id===avatarModelId),adaptive:crewSettings.enabled&&crewSettings.mode==='adaptive',manual:crewManualV1135,scale:avatarScale,offsetY:avatarOffsetY});
  const crew = useCrewDirector({
    stance:{left:footIK.current.left?.contact.phase==='planted',right:footIK.current.right?.contact.phase==='planted'},modelId:avatarModelId??'',clips:sharedMotionV531?embeddedCandidatesV530:animations,trackId:track?.id,
    progressMs:cameraDirectorProgressMs??propsLipSyncV367?.progressMs,
    section:(showCue?.enabled?showCue.section:cameraDirectorSection)??lyricSectionV1130(propsLipSyncV367?.lyrics,cameraDirectorProgressMs??propsLipSyncV367?.progressMs??0),
    genre,energy:audio.energyEnvelope,bpm:audio.bpm,slot:workloadSlot,
    count:ensembleCountV745??propsLipSyncV367?.ensembleCountV374??1,
    playing:isPlaying,reducedMotion,settings:crewSettings,durationMs:track?.durationMs,lyrics:propsLipSyncV367?.lyrics,
    lyricDensity:lyricDensityV1130(propsLipSyncV367?.lyrics,cameraDirectorProgressMs??propsLipSyncV367?.progressMs??0),
    manualPriority:crewManualV1135,
  });
  const embeddedMotionV530=useEmbeddedMotionDirectorV530({
    clips:embeddedCandidatesV530,modelKey:`${url}|${assetUrl??url}|${sharedMotionV531?"shared":"embedded"}`,trackId:track?.id,
    progressMs:cameraDirectorProgressMs??propsLipSyncV367?.progressMs,
    section:showCue?.enabled?showCue.section:cameraDirectorSection,
    genre,energy:audio.energyEnvelope,bpm:audio.bpm,slot:workloadSlot,
    playing:isPlaying,reducedMotion,manualPriority:manualEmbeddedPriorityV530,
  });
  // V536: rank *only* clips already loaded and bound to actions. Embedded /
  // V531-shared clips plus (when library auto-play is enabled) retargeted V535
  // library clips. Categories and favorites are metadata; source GLBs stay intact.
  const genreCandidatesV536=useMemo<GenreMotionCandidateV536[]>(()=>{
    const embedded:GenreMotionCandidateV536[]=embeddedCandidatesV530.map(c=>({
      name:c.name,label:c.name.replace(/^SharedV531:/,''),duration:c.duration,trackCount:c.trackCount,
      source:sharedMotionV531?'shared':'embedded',
      category:suggestMotionCategoryV535(c.name.replace(/^SharedV531:/,'')),
    }));
    if(!library.automatic)return embedded;
    const motionsById=new Map(installed.map(m=>[m.id,m] as const));
    const external:GenreMotionCandidateV536[]=libraryClips.flatMap(c=>{
      const match=/^Library:([^:]+):(\d+)$/.exec(c.name);
      if(!match)return [];
      const motion=motionsById.get(match[1]);
      if(!motion)return [];
      return [{name:c.name,label:motion.name,duration:c.duration,trackCount:c.tracks.length,
        source:'library' as const,category:motion.category??suggestMotionCategoryV535(motion.name),
        favorite:motion.favorite===true}];
    });
    return [...embedded,...external];
  },[embeddedCandidatesV530,sharedMotionV531,library.automatic,installed,libraryClips]);
  // Authored and opt-in directors retain priority. The automatic V191 library
  // chooser is only a fallback when V536 has no suitable already-loaded action.
  const manualGenrePriorityV536=avatarMotionMode!=='hybrid'||!!animationUrl||!!activeSequence||
    !!activeLoop||timelineEnabled||avatarBlendEnabled||!!smartDanceOverride||
    !!lowClipV481||!!clipChoiceV328||!!phraseChoiceV329||!!autoMotionV356||
    !!groupClockV328?.settings.enabled||!!groupPhraseV329?.settings.enabled||
    rapLiveEnabledV412||!!rapLiveCandidateV412||!!evolutionMotion||!!adaptiveMotion||
    !!preferredMotionUrlV440;
  const genreMotionV536=useGenreAwareMotionDirectorV536({
    clips:genreCandidatesV536,modelKey:`${url}|${assetUrl??url}|${sharedMotionV531?'shared':'embedded'}`,
    trackId:track?.id,progressMs:cameraDirectorProgressMs??propsLipSyncV367?.progressMs,
    section:showCue?.enabled?showCue.section:cameraDirectorSection,
    genre,energy:audio.energyEnvelope,bpm:audio.bpm,slot:workloadSlot,
    playing:isPlaying,reducedMotion,manualPriority:manualGenrePriorityV536,
  });
  // Keep V481/V328/V329/V356 and every manually authored action above V530.
  // The existing V492 transition pipeline performs the real pose-matched crossfade.
  const selectedClip=lowClipV481 && actions[lowClipV481] && isPlaying&&!reducedMotion ? lowClipV481 : clipChoiceV328 && actions[clipChoiceV328] ? clipChoiceV328 : phraseChoiceV329 && actions[phraseChoiceV329]?phraseChoiceV329:crew.plan.active && crew.plan.clip && actions[crew.plan.clip]?crew.plan.clip:autoMotionV356 && actions[autoMotionV356]?autoMotionV356:genreMotionV536 && actions[genreMotionV536]?genreMotionV536:embeddedMotionV530 && actions[embeddedMotionV530]?embeddedMotionV530:selectedClipLegacy;
  // Mixamo can refine only a currently loaded *automatic* library action.
  // Every authored source, timeline, user speed, foot/ensemble clock and
  // explicit animation continues to own playback unchanged.
  const mixamoLibraryId=/^Library:([^:]+):/.exec(selectedClip??"")?.[1];
  const mixamoEntry=installed.find(m=>m.id===mixamoLibraryId&&isMixamoMotion(m.name));
  const automaticMixamo=!!mixamoEntry&&library.automatic&&isPlaying&&!reducedMotion&&
    avatarMotionMode!=="choreography"&&!animationUrl&&!activeSequence&&!activeLoop&&
    !timelineEnabled&&!avatarBlendEnabled&&!smartDanceOverride&&
    !rapLiveEnabledV412&&!clipChoiceV328&&!phraseChoiceV329&&
    !groupClockV328?.settings.enabled&&!groupPhraseV329?.settings.enabled;
  const mixamoFade=automaticMixamo && mixamoEntry ? mixamoMinimumFade(mixamoEntry.name,
    motionSectionV536(showCue?.enabled?showCue.section:cameraDirectorSection)) : 0;
  // V492: a saved combination activates only when its original *base* is
  // already the chosen live clip. Never hijack a manual selection / timeline.
  const liveBlendV492=preparedBlendsV492.find(p=>p.baseName===selectedClip)??null;
  const liveBlendAllowedV492=!!liveBlendV492&&isPlaying&&!reducedMotion&&!timelineEnabled&&
    !activeSequence&&!activeLoop&&!avatarBlendEnabled&&!rapLiveEnabledV412&&
    avatarMotionMode!=='choreography'&&!stableLibraryClip&&!smartDanceOverride&&
    !groupClockV328?.settings.enabled&&!groupPhraseV329?.settings.enabled&&
    getActivePerformanceTier()!=='low';
  // V493: choose between valid V492 presets only when auto control owns the stage.
  // The chosen base animation remains unchanged; only masked gesture channels blend.
  const directorBlendV493=useGltfMotionPresetDirectorV493({
    presets:preparedBlendsV492,selectedBase:selectedClip,trackId:track?.id,
    positionMs:cameraDirectorProgressMs??0,section:showCue?.enabled?showCue.section:cameraDirectorSection,
    energy:audio.energyEnvelope,bpm:audio.bpm,slot:workloadSlot,playing:isPlaying,
    reducedMotion,manualPriority:!liveBlendAllowedV492,quality:getActivePerformanceTier()
  });
  const activeLiveBlendV492=liveBlendAllowedV492?directorBlendV493:null;

  useGltfClipTransitionsV492({crewEntrySeconds:crew.plan.active&&selectedClip===crew.plan.clip&&selectedClip&&actions[selectedClip]?crewClipTime(crew.plan,actions[selectedClip]!.getClip().duration):undefined,actions,selectedClip,audio,genre,isPlaying,reducedMotion,
    activeSequence,rapLiveEnabledV412,timelineEnabled,timeline,avatarBlendEnabled,avatarBlendClip,
    maskedOverlay,liveTransition,stableLibraryClip,sequenceCrossfade,lowClipV481,smartDanceOverride,
    avatarMotionMode,activeLoop,autoUpperGestureV490,activeLiveBlendV492,
    avatarCrossfadeSeconds:Math.max(mixamoFade,crew.plan.active && crew.plan.clip===selectedClip?Math.max(.55,avatarCrossfadeSeconds):genreMotionV536===selectedClip?Math.max(avatarCrossfadeSeconds,genreCrossfadeSecondsV536({section:showCue?.enabled?showCue.section:cameraDirectorSection,energy:audio.energyEnvelope})):embeddedMotionV530===selectedClip?Math.max(.55,avatarCrossfadeSeconds):avatarCrossfadeSeconds),
    footIK,beatFlowData,musicSectionV565:showCue?.enabled?showCue.section:cameraDirectorSection,
    trackIdV614:track?.id,progressMsV614:cameraDirectorProgressMs??propsLipSyncV367?.progressMs,
    energyV614:audio.energyEnvelope,
    manualSelectionV565:!!clipChoiceV328||!!phraseChoiceV329||!!animationUrl||
      !!groupClockV328?.settings.enabled||!!groupPhraseV329?.settings.enabled});
  // V129: read the still-running outgoing LOD before falling back to the
  // unmount snapshot. Publish per-frame clip state for seamless handoff.
  const liveOwner = useRef(`lod-${Math.random().toString(36).slice(2)}`);
  const liveSynced = useRef(false);
  const livePlaybackBufferV569=useRef(createLodPlaybackBufferV569());
  useFrame((_, delta) => {
    const nowV569=window.performance.now()/1000;
    if (!liveSynced.current) {
      const incoming = readLiveLodPlayback(url, liveOwner.current, nowV569);
      if (incoming) {
        for (const [name, saved] of Object.entries(incoming.clips)) {
          const action = actions[name];
          if (!action) continue;
          action.time = safeClipTime(saved.time + (saved.paused ? 0 : Math.min(0.1, Math.max(0, nowV569 - incoming.savedAt)) * saved.timeScale), action.getClip().duration);
          action.timeScale = saved.timeScale;
          action.setEffectiveWeight(saved.weight);
          if (saved.running && !action.isRunning()) action.play();
          action.paused = saved.paused;
        }
        if (incoming.timelineElapsed !== null) timelineStarted.current = clockElapsed.current - incoming.timelineElapsed;
        liveSynced.current = true;
      }
    }
    // First instance owns publication. A successor takes over only after the
    // predecessor unmounts, to avoid the fade-in instance overwriting the source.
    // V569: do not allocate Object.entries + one object per action at 60fps.
    const existing = readLiveLodPlayback(url, liveOwner.current, nowV569);
    if (!existing) publishLiveLodPlayback(url, liveOwner.current,
      updateLodPlaybackBufferV569(livePlaybackBufferV569.current,actions,nowV569,
        timelineStarted.current===null?null:Math.max(0,clockElapsed.current-timelineStarted.current)));
  });
  useEffect(() => () => clearLiveLodPlayback(url, liveOwner.current), [url]);
  // V215: the skeleton graph is immutable for a mounted GLTF instance. Cache
  // named bone references once instead of traversing the complete model at 60fps.
  const lodBones = useMemo(() => {
    const named = new Map<string, Quaternion>();
    model.traverse(node => {
      if ((node as { isBone?: boolean }).isBone && !named.has(node.name)) named.set(node.name, node.quaternion);
    });
    return named;
  }, [model]);
  const lodTargetQuaternion = useMemo(() => new Quaternion(), []);
  // V132: bounded auto-tuning only on the incoming model, after the mixer updates.
  const lodTuning = useRef(createLodAutoTuneState());
  useFrame((_, delta) => {
    if (!isPlaying || reducedMotion) { lodTuning.current = createLodAutoTuneState(); return; }
    const reference = getOutgoingLodPose(url, liveOwner.current, window.performance.now()/1000);
    if (!reference) { lodTuning.current = createLodAutoTuneState(); return; }
    const bones: Record<string, Quaternion> = {};
    const errors: number[] = [];
    for (const [name, q] of lodBones) {
      bones[name] = q;
      const target = reference.bones[name];
      if (target) {
        lodTargetQuaternion.set(target[0], target[1], target[2], target[3]).normalize();
        errors.push(q.angleTo(lodTargetQuaternion) * 180 / Math.PI);
      }
    }
    lodTuning.current = updateLodAutoTune(lodTuning.current, errors, delta);
    applyLodPoseCorrection(bones, reference, true, lodTuning.current.strength);
  }, 1);
  // V130: low-frequency passive sampling while two LOD instances overlap.
  const lastLodDiagnostic = useRef(-1);
  useFrame(() => {
    const now=window.performance.now()/1000;
    if(now-lastLodDiagnostic.current < 0.12) return;
    lastLodDiagnostic.current=now;
    const bones:Record<string,[number,number,number,number]>={};
    for (const [name,q] of lodBones) bones[name]=[q.x,q.y,q.z,q.w];
    const clipState:Record<string,{time:number;weight:number}>={};
    for(const [name,action] of Object.entries(actions)) {
      if(action && action.isRunning()) clipState[name]={time:action.time,weight:action.getEffectiveWeight()};
    }
    publishLodPoseSample({source:url,asset:assetUrl??url,owner:liveOwner.current,sampledAt:now,clips:clipState,bones});
  });
  useEffect(()=>()=>removeLodPoseSample(liveOwner.current),[]);
  // V127: preserve clip phase and timeline position when a different LOD GLB mounts.
  // Note: this preserves local playback state, not a shared skeleton/pose in the same frame.
  useEffect(() => {
    const snapshot = readLiveLodPlayback(url, liveOwner.current, window.performance.now() / 1000) ?? takeLodPlayback(url, window.performance.now() / 1000);
    if (snapshot) {
      if (snapshot.timelineElapsed !== null) {
        timelineStarted.current = -snapshot.timelineElapsed;
      }
      for (const [name, saved] of Object.entries(snapshot.clips)) {
        const action = actions[name];
        if (!action) continue; // target LOD may not contain the same clip
        action.reset();
        action.time = safeClipTime(saved.time, action.getClip().duration);
        action.timeScale = saved.timeScale;
        action.setEffectiveWeight(saved.weight);
        if (saved.running) action.play();
        action.paused = saved.paused;
      }
    }
    return () => {
      const clipsState: Record<string, {time: number; weight: number; running: boolean; paused: boolean; timeScale: number}> = {};
      for (const [name, action] of Object.entries(actions)) {
        if (!action) continue;
        clipsState[name] = {time: action.time, weight: action.getEffectiveWeight(), running: action.isRunning(), paused: action.paused, timeScale: action.timeScale};
      }
      saveLodPlayback(url, {savedAt: window.performance.now() / 1000, timelineElapsed: timelineStarted.current === null ? null : Math.max(0, clockElapsed.current - timelineStarted.current), clips: clipsState});
    };
  }, [actions, url]);
  // Explicit V412 live preset: isolated from manually-authored V105 timelines,
  // saved choreography and loop modes. Disabled/invalid model falls back to V411/V410 behavior.
  useEffect(()=>{if(!rapLiveEnabledV412)return;return()=>{Object.values(actions).forEach(a=>a?.stop());};},[actions,rapLiveEnabledV412]);
  useFrame((_,delta)=>{
    if(!rapLiveEnabledV412||!rapLivePresetV412||!isPlaying||reducedMotion){
      if(authoredCueKeyV659.current){authoredCueKeyV659.current="";setAuthoredCueIdsV659([]);}
      rapLiveFrameV412.current={section:"verse",active:[]};rapLyricsFrameV414.current={head:1,arms:1,motionId:"",motionBlend:0,motionSec:0,active:false};return;
    }
    rapLiveElapsedV412.current+=Math.max(0,Math.min(.12,Number.isFinite(delta)?delta:0));
    const elapsed=rapLiveElapsedV412.current;
    // Song section is an estimate: known show cues win; a detected drop is a hook proxy.
    const sec:"verse"|"hook"=showCue?.enabled&&(showCue.section==="hook"||showCue.section==="drop")||predictedPhase==="drop"?"hook":"verse";
    const state=rapLiveSectionV412.current;
    if(state.section!==sec){state.previous=state.section;state.section=sec;state.changedAt=elapsed;}
    // Lyrics share Spotify's playback position with the existing lip-sync system.
    // The explicitly selected preset remains the owner of clip choices and fades.
    const lyricsCueV413=sampleRapLyricsCueV413(propsLipSyncV367?.lyrics,propsLipSyncV367?.progressMs??NaN,
      isPlaying,reducedMotion,propsLipSyncV367?.coordinationOffsetMsV372??0);
    const sample=sampleRapLiveV412(rapLivePresetV412,elapsed,sec,state.previous,state.changedAt);
    // V414 is opt-in and strictly owned by the active V412 preset, track and avatar.
    // Never run these cues over authored choreography, paused playback, or reduced motion.
    const manualGestureV414=sampleRapGestureV414(propsLipSyncV367?.lyrics,groovePreferences.rapLyricsGestureEnabledV414?rapLyricsDocV414.current:null,
      track?.id,avatarModelId,propsLipSyncV367?.progressMs??NaN,isPlaying,reducedMotion,
      (propsLipSyncV367?.coordinationOffsetMsV372??0)+effectiveRapTimingOffsetV418(!!groovePreferences.rapTimingLiveEnabledV418,groovePreferences.rapTimingOffsetsV418?.gestureMs??0),rapLivePresetV412.items.map(i=>i.motionId));
    rapLyricsFrameV414.current=manualGestureV414;
    const liveActiveV414=applyRapGestureMotionV414(sample.active,manualGestureV414);
    const cueIds=Array.from(new Set(liveActiveV414.filter(i=>i.motionId.startsWith('installed:')).map(i=>i.motionId.slice(10))));
    const cueKey=cueIds.join('|');
    if(cueKey!==authoredCueKeyV659.current){authoredCueKeyV659.current=cueKey;setAuthoredCueIdsV659(cueIds);}
    rapLiveFrameV412.current={...sample,active:liveActiveV414.map(item=>({...item,rapGain:lyricsRapGainV413(item.rapGain,lyricsCueV413)}))};
    const weights=new Map<string,{weight:number;localSec:number}>();
    for(const item of liveActiveV414){
      const clip=liveRapClipNameV412(item.motionId,animations.map(c=>c.name));
      if(!clip||!actions[clip])continue;
      const old=weights.get(clip);
      weights.set(clip,{weight:(old?.weight??0)+item.weight,localSec:item.localSec});
    }
    const available=Array.from(weights.values()).reduce((n,s)=>n+s.weight,0);
    if(available<=0)return; // unavailable clips never silence a running manual/fallback animation
    for(const [name,action] of Object.entries(actions)){
      if(!action)continue;
      const data=weights.get(name);
      const weight=data?data.weight/available:0;
      if(weight>0&&!action.isRunning())action.reset().play();
      action.enabled=weight>0;
      action.setEffectiveWeight(weight);
      if(data){const d=Math.max(.01,action.getClip().duration);action.time=((data.localSec%d)+d)%d;}
    }
  });
  // V105: deterministic multi-clip timeline; frame weights are owned exclusively by this mode.
  useFrame((state) => {
    const songSeconds=timelineSongSecondsV319(0,timeline.trackId,track?.id,cameraDirectorProgressMs,timeline.songSync===true);
    const active = timelineEnabled && timeline.segments.length > 0 && isPlaying && !reducedMotion && songSeconds!==null;
    const localClock=advanceTimelineClockV733(timelineStarted.current,timelinePause.current,timelineTrack.current,track?.id,active,timelineEnabled,state.clock.elapsedTime);
    timelineStarted.current=localClock.started;timelinePause.current=localClock.paused;timelineTrack.current=track?.id;
    if(!active){if(timelineWasActive.current){timelineWasActive.current=false;Object.values(actions).forEach(a=>a?.stop());}return;}
    timelineWasActive.current=true;
    // Legacy V105 timelines keep their local clock; V319 opt-in timelines use
    // absolute Spotify playback seconds so seeks and track-specific markers stay aligned.
    const elapsed=timeline.songSync===true ? songSeconds! : state.clock.elapsedTime-timelineStarted.current!;
    const pos=timelinePosition(timeline,elapsed);
    const weights=timelineWeights(timeline,elapsed);
    for (const [name,action] of Object.entries(actions)) {
      if(!action)continue;
      const weight=weights[name]??0;
      if(weight>0 && !action.isRunning())action.reset().play();
      action.enabled=weight>0;
      action.setEffectiveWeight(weight);
      const segment=timeline.segments.find(s=>s.clip===name && pos>=s.start && pos<s.start+s.duration);
      if(segment){
        action.timeScale=segment.speed;
        if(timeline.songSync===true){
          const duration=Math.max(.01,action.getClip().duration);
          // Deterministic seek-to-song-time: no re-started local phase when
          // scrubbing, pausing or resuming the Spotify track.
          action.time=((pos-segment.start)*segment.speed%duration+duration)%duration;
        }
      }
    }
  });
  const overlayName=useGltfBlendPlaybackV492({actions,maskedOverlay,avatarBlendClip,
    avatarBlendEnabled,avatarBlendWeight,avatarBlendAutoEnergy,avatarBlendCurve,
    avatarBlendSmoothing,avatarBlendSpeed,avatarBlendReferenceBpm,avatarBlendBpmSync,
    avatarCrossfadeSeconds,timelineEnabled,isPlaying,reducedMotion,activeSequence,activeLoop,
    avatarMotionMode,selectedClip,audio,autoUpperGestureV490,lowClipV481,rapLiveEnabledV412,
    stableLibraryClip,smartDanceOverride,groupClockV328,groupPhraseV329,activeLiveBlendV492,
    footIK,genre,showCue});
  useEffect(() => {
    if (overlayName) return;
    const primary = selectedClip ? actions[selectedClip] : undefined;
    if (primary && !activeSequence && !timelineEnabled) primary.setEffectiveWeight(1);
  }, [actions, overlayName, selectedClip, activeSequence]);
  useEffect(() => {
    const speed = Math.max(0.25, Math.min(2, activeLoop?.speed ?? avatarClipSpeed));
    Object.values(actions).forEach(action => { if (action) action.timeScale = speed; });
  }, [actions, avatarClipSpeed, activeLoop]);
  // Quantize only near-natural-speed Mixamo loops to 2/4/8/16 beats.
  // The existing V492 mixer advances time; V537/V630/V799 keep transition
  // matching and planted-foot protection. No second mixer or frame timer.
  useEffect(()=>{
    if(!automaticMixamo||!mixamoEntry||!selectedClip||Math.abs(avatarClipSpeed-1)>.001)return;
    const action=actions[selectedClip];
    if(!action)return;
    // Restore the previous mixer speed when the automatic clip, song BPM or
    // playback mode changes. A manual/timeline speed applied in the meantime
    // must never be overwritten by this cleanup.
    const previousSpeed=action.timeScale;
    const alignedSpeed=mixamoBeatAlignedSpeed(mixamoEntry.name,
      action.getClip().duration,audio.bpm,1);
    action.timeScale=alignedSpeed;
    return ()=>{
      if(Math.abs(action.timeScale-alignedSpeed)<.0005)action.timeScale=previousSpeed;
    };
  },[actions,selectedClip,automaticMixamo,mixamoEntry?.name,audio.bpm,avatarClipSpeed]);
  // V328: absolute shared ensemble beat clock drives the *actual* selected
  // GLB action in each independent mixer; no source track or shared audio edits.
  useFrame(()=>{
    if(!groupClockV328 || timelineEnabled || activeSequence || activeLoop || avatarBlendEnabled || !isPlaying || reducedMotion)return;
    const clock=groupClockV328.clock.current;
    const action=selectedClip ? actions[selectedClip] : undefined;
    if(!action || !action.isRunning())return;
    // Shift only the existing V328 beat clock; no clip keyframes or mixer clocks are replaced.
    const offset=groupPhraseV329?.settings.enabled && groupPhraseV329.settings.alignPhase && (groupClockV328.settings.clipIndexes[clock.slot]??-1)<0
      ?groupPhraseV329.plan.offsets[clock.slot]??0:0;
    const syncSettings=offset===0?groupClockV328.settings:{...groupClockV328.settings,phaseOffsets:groupClockV328.settings.phaseOffsets.map((v,i)=>i===clock.slot?v+offset:v)};
    const target=phaseForClipV328(syncSettings,clock,action.getClip().duration);
    if(!target)return;
    action.time=target.time;
    groupMixerV328.update(0); // apply the new pose this frame; preserve weights and fades
  });
  useFrame(() => {
    if (timelineEnabled || activeSequence || !activeLoop || !isPlaying || reducedMotion || selectedClip !== loopClip) return;
    const action = selectedClip ? actions[selectedClip] : undefined;
    const clip = clips.find(c => c.name === selectedClip);
    if (!action || !clip) return;
    const start = Math.min(Math.max(0, activeLoop.start), clip.duration - 0.01);
    const end = Math.min(activeLoop.end, clip.duration);
    if (end <= start) return;
    if (action.time < start || action.time >= end) action.time = start + (((action.time - start) % (end-start)) + (end-start)) % (end-start);
  });
  // V95: Sequence playback in the existing animation mixer. No React state updates per frame.
  useFrame((state) => {
    if (timelineEnabled || !activeSequence || !isPlaying || reducedMotion) return;
    const { sequence, choreography } = activeSequence;
    if (!sequence.length) return;
    let index = Math.min(sequenceStep.current, sequence.length - 1);
    const part = sequence[index];
    const id = part.loop.clipId;
    const clipName = id.startsWith("embedded:")
      ? animations[Number(id.split(":")[1])]?.name
      : clips[animations.length + Number(id.split(":")[1])]?.name;
    const clip = clips.find(c => c.name === clipName);
    const action = clipName ? actions[clipName] : undefined;
    if (!action || !clip || clip.duration <= 0) return;
    const start = Math.max(0, Math.min(part.loop.start, clip.duration - 0.01));
    const end = Math.max(start + 0.01, Math.min(part.loop.end, clip.duration));
    const now = state.clock.elapsedTime;
    if (sequenceLastAction.current !== `${index}:${clipName}`) {
      const previousName = sequenceLastAction.current?.split(":").slice(1).join(":");
      const previousAction = previousName ? actions[previousName] : undefined;
      const plan = planDanceTransition({ baseSeconds: part.step.transition * (1 - beatFlowData.current.transitionBoost * 0.22), bpm: audio.bpm, genre,
        outgoingTime: previousAction?.time, outgoingDuration: previousAction?.getClip().duration,
        incomingDuration: clip.duration, sameClip: previousName === clipName,
        grounded: footIK.current.left?.contact.phase === "planted" || footIK.current.right?.contact.phase === "planted" });
      Object.entries(actions).forEach(([name, previous]) => { if (previous && name !== clipName) previous.fadeOut(plan.duration); });
      action.reset();
      // Timeline controls its own exact segment time; only live clip changes phase-match.
      action.time = start;
      action.timeScale = part.loop.speed;
      action.setEffectiveWeight(1).fadeIn(plan.duration).play();
      sequenceLastAction.current = `${index}:${clipName}`;
      sequenceStarted.current = now; sequenceWaitingUntil.current = null;
    }
    const elapsed = (now - sequenceStarted.current) * part.loop.speed;
    action.time = Math.min(end - 0.001, start + Math.max(0, elapsed));
    const segmentDuration = (end - start) / part.loop.speed;
    if (now - sequenceStarted.current < segmentDuration) return;
    if (part.step.beatAligned) {
      // BPM produces an approximate clock grid, not a verified musical beat timestamp.
      const bpm = Number(audio.bpm);
      if (Number.isFinite(bpm) && bpm >= 50 && bpm <= 240) {
        if (sequenceWaitingUntil.current === null) {
          const beatSeconds = 60 / bpm;
          sequenceWaitingUntil.current = now + beatSeconds - (now % beatSeconds);
        }
        if (now < sequenceWaitingUntil.current) return;
      }
    }
    if (index === sequence.length - 1 && !choreography.repeat) {
      // Hold the final pose until stopped or another choreography is selected.
      return;
    }
    index = (index + 1) % sequence.length;
    sequenceStep.current = index;
    sequenceLastAction.current = null;
  });
  useAnimatedCollisionSamplingV508({model,root,profile:bodyProfileV507,workloadSlot,
    modelUrl:url,assetUrl,avatarScale,isPlaying,reducedMotion,castCount:propsLipSyncV367?.ensembleCountV374??1});
  return <group name="sonic-grounded-stage-v1135" position={[0,placementV1135.y,0]}><group ref={root} userData={{sonicV592GlbActor:true}} scale={avatarScale} position={[0, avatarOffsetY, 0]}><primitive object={model} /><GlbMaterialQualityV560 session={materialSessionV560}
    enabled={groovePreferences.concertGlbMaterialQualityV560??true}
    strength={groovePreferences.concertGlbMaterialStrengthV560??65}/><VocalRigV368 model={model} trackId={track?.id??""} sectionV503={showCue?.enabled?showCue.section:null} authoredPriorityV499={avatarMotionMode==="choreography"||!!stableLibraryClip} footIKV618={footIK} footIKEnabledV618={avatarFootIKEnabled} lipSync={propsLipSyncV367} audio={audio} genre={genre} reducedMotion={reducedMotion} avatarSlot={workloadSlot} profileV370={propsLipSyncV367?.profilesV370?.[avatarModelId??""]} arenaRapPerformanceEnabledV1062={arenaRapPerformanceEnabledV1062&&stageTheme==='arena360'} arenaRapPerformanceStrengthV1062={arenaRapPerformanceStrengthV1062}/><AvatarSmartLOD model={model} /></group>{placementV1135.enabled&&<SonicFootContactV1135 model={model} floorY={placementV1135.floor} scale={avatarScale} worldFloor={-1.95}/>}</group>;
}

/** Each dancer receives its own animation mixer and cloned GLB scene. */
