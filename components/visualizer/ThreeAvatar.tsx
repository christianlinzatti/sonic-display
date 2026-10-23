"use client";
import {observeReviewMotionV314} from "./dancePerformanceReviewV314";
import { LiveStageCanvasBridgeV301 } from "./LiveStageCanvasBridgeV301";
import {advanceRecoveryV395,initialRecoveryV395} from "./displayRecoveryPolicyV395";
import {appendProductionEventV395,setProductionRecoveryStateV395,useDisplayProductionV395} from "../DisplayProductionV395";
import { StageContentScreenV330 } from "./StageContentScreenV330";
import { StageContentScreensV333 } from "./StageContentScreensV333";
import { StageEnvironment } from "./stages";
import {createEmotionV233State, updateEmotionV233} from "./emotionExpressionV233";
import { findMotionMatch } from "./smartMotionMatching";
import {ADAPTIVE_MOTION_MEMORY_EVENT,readMotionMemory,readMotionMemoryHardware,resolveMotionMemoryLimit,recordMotionUse,chooseAdaptiveMotionEvictions,pruneMotionLedger,type MotionMemoryLedger} from "./adaptiveMotionMemory";
import {readPredictiveDance,PREDICTIVE_DANCE_EVENT,predictDanceCue,mayCommitPredictedCue,type UpcomingDanceCue} from "./predictiveDanceTransitions";
import {readMotionPrefetch,MOTION_PREFETCH_EVENT,planMotionPrefetch,choosePrefetchEvictions,shouldReplanMotionPrefetch,type MotionPlanSnapshot} from "./intelligentMotionPrefetch";
import {computeExpressiveCue} from "./expressiveDanceCharacters";
import {readExpressiveSettings,EXPRESSIVE_EVENT} from "./expressiveDanceSettings";
import {readMotionStyle,STYLE_EVENT} from "./motionStyleSettings";
import {adaptMotionStyle} from "./motionStyleTransfer";
import {initialRhythmLock,updateRhythmLock,publishRhythmLock,loadBeatLockSettings,BEAT_LOCK_SETTINGS_EVENT} from "./adaptiveBeatIntelligence";
import {advanceBeatTransport,initialBeatTransport,shouldCommitMotionSwitch} from "./beatPerfectSequencer";
import {EVOLUTION_EVENT,readEvolution,selectEvolutionByBeat,resolveEvolutionCrossfade} from "./smartChoreographyEvolution";
import {CONTEXT_MEMORY_EVENT} from "./choreographyContextMemory";
import {ADAPTIVE_CHOREOGRAPHY_EVENT,loadAdaptiveState,resolveAdaptiveMotion} from "./adaptiveChoreographyLearning";
import { measureProfilerPhase } from "./runtimeProfiler";
import { recordAvatarFrame, releaseAvatarFrame, getAvatarFrameStats } from "./avatarFrameProfiler";
import { chooseAvatarWorkloadTier, stabilizeAvatarWorkload, type WorkloadLatch } from "./adaptiveAvatarWorkloadV252";
import { readMultiAvatarDirectorEnabled, decideMultiAvatarDirector } from "./adaptiveMultiAvatarDirectorV260";
import { evaluateAnimationBudget, shouldRunScheduledTask, releaseScheduledInstance, getAnimationSchedulerTier } from "./adaptiveAnimationScheduler";
import { readIKConstraints } from "./ikJointSafety";
import type { JointConstraintMap } from "./jointConstraintCalibration";

import { computeMusicAwareDanceExpression } from "./musicAwareDanceExpression";
import { advanceBeatFlow, createBeatFlowState, type BeatFlowResult } from "./beatFlowDetector";
import { planDanceTransition, matchedClipTime } from "./smartDanceTransition";
import { publishLodPoseSample, removeLodPoseSample, getOutgoingLodPose } from "./lodContinuityDiagnostics";
import { readMotionDebugSettings, getRuntimeMotionSettings, filterMotionDebugLayers, applyMotionPresetForGenre, updateMotionPresetMorph } from "./motionDebugControls";
import { SkeletonHelper } from "three";
import { applyLodPoseCorrection } from "./lodPoseCorrection";
import { createLodAutoTuneState, updateLodAutoTune } from "./lodAutoTuning";
import { Quaternion } from "three";
import { createMotionQualitySampler, sampleMotionQuality } from "./motionQualityDiagnostics";
import { createIKQualitySampler, sampleIKQuality } from "./ikMotionAnalyzer";
import { getIKQualitySnapshot } from "./ikMotionAnalyzer";
import { createRefinementState, getRefinementSettings, refineFullBodyMotion } from "./adaptiveFullBodyRefinement";
import {createDanceQualityState, createDanceSongClock, updateDanceSongClock, enhanceDanceQuality, readDanceQualitySettings, NEUTRAL_QUALITY_MOTION} from "./danceQualityV307";
import {createAdvancedDanceStateV311, refineDancePerformanceV311, polishAutomaticCrossfadeV311, readDancePerformanceV311} from "./advancedDancePerformanceV311";
import {createDanceFlowStateV391,refineDanceFlowV391,readDanceFlowV391} from "./naturalDanceIntelligenceV391";
import {resolveEnsembleSettingsV396} from "./performanceExperienceV396";
import {advanceEnsembleV392,initialEnsembleV392,readEnsembleV392,type EnsembleCueV392} from "./ensemblePerformanceV392";
import {createNaturalDanceStateV320, refineNaturalDanceV320, readNaturalDanceV320} from "./naturalDanceIntelligenceV320";
import {MOTION_QUALITY_EVENT_V321, readMotionQualityV321, polishMotionClipV321} from "./advancedMotionQualityV321";
import { computeNaturalDanceCoordination } from "./naturalDanceCoordination";
import { createNaturalDanceDynamics, updateNaturalDanceDynamics } from "./naturalDanceIntelligence";
import { createPhraseMotionVariation, updatePhraseMotionVariation } from "./phraseMotionVariationV241";
import { createPhraseMotionState, updatePhraseMotion } from "./musicalPhraseIntelligence";
import { composeUnifiedMotion, createUnifiedMotionState } from "./unifiedDanceEngine";
import { createMomentumState, updateMomentumState } from "./danceMomentumEngine";
import { useUiPreferences } from "@/context/UiPreferencesContext";
import { sanitizeTimeline, timelineWeights, timelineDuration, timelinePosition } from "./motionTimelineEngine";
import {timelineSongSecondsV319} from "./musicMotionTimelineV319";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {advanceMultiAvatarChoreography,initialMultiAvatarState,readMultiAvatarSettings,MULTI_AVATAR_EVENT,type MultiAvatarSettings,type MultiAvatarCue} from "./multiAvatarChoreography";
import {advanceChoreographyV312,initialChoreographyV312,readChoreographyV312,CHOREOGRAPHY_V312_EVENT,type ChoreographySettingsV312,type ChoreographyCueV312} from "./intelligentDanceChoreographyV312";
import { advanceInteraction, initialInteractionState } from "./multiAvatarInteractionV274";
import { advanceDuoDirector, createDuoDirectorState, type DuoScene } from "./duoChoreographyDirector";
import { duoFormationTargets, formationApproach } from "./duoFormationEngine";
import {advanceEnsembleBalanceV324,createEnsembleStateV324,readEnsembleBalanceV324,refreshEnsembleBalanceV324,ENSEMBLE_BALANCE_EVENT_V324,ENSEMBLE_BALANCE_DIAGNOSTIC_V324} from "./adaptiveEnsembleBalanceV324";
import {readEnsembleTimelineV325,canPlayEnsembleTimelineV325,evaluateEnsembleTimelineV325,ENSEMBLE_TIMELINE_EVENT_V325} from "./ensembleChoreographyV325";
import {readGroupV326,canRunGroupV326,evaluateGroupV326,GROUP_EVENT_V326,type GroupStudioV326} from "./multiAvatarStageDirectorV326";
import {getAvatarModel} from "./avatarModels";
import {readGroupSyncV327,GROUP_SYNC_EVENT_V327,evaluateGroupSyncV327,type GroupSyncV327} from "./groupDanceSynchronizationV327";
import {readMotionSyncV328,MOTION_SYNC_EVENT_V328,phaseForClipV328,type MotionSyncV328,type MotionSyncClockV328} from "./groupMotionSynchronizationV328";
import {readPhraseV329,PHRASE_EVENT_V329,describeAnimationClipsV329,planGroupPhrasesV329,type PhraseSettingsV329,type PhraseSignatureV329,type PhraseMatchV329} from "./intelligentMotionPhraseV329";
import {readTrackAnalysisV318,ANALYSIS_EVENT_V318,type TrackAnalysisV318} from "@/services/musicAnalysis/trackAnalysisV318";
import { partnerCue, separatePartners } from "./avatarPartnerAwareness";
import { approachLook, NEUTRAL_LOOK, partnerLookCue, type LookAtCue } from "./partnerLookAtEngine";
import { approachGesture, NEUTRAL_GESTURE, partnerGestureCue, type PartnerGestureCue } from "./partnerGestureEngine";
import { advancePartnerInteraction, createPartnerInteractionState } from "./partnerInteractionDirector";
import { advancePartnerSync, createPartnerSyncState } from "./partnerMotionSync";
import { createHandIKState, handInteractionWeight, NEUTRAL_HAND, updatePartnerHandIK, type PartnerHandCue } from "./partnerHandIK";
import { createPartnerTorsoState, updatePartnerTorso } from "./partnerFullBodyContact";
import { calibratePartnerCue } from "./partnerContactCalibration";
import { measureAvatarProportions, resolveContactCalibration, type AvatarProportions } from "./avatarProportionCalibration";
import { Component, type ErrorInfo, type ReactNode, Suspense, useId, useCallback, createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import {ArtistNameBubbleV441} from "./ArtistNameBubbleV441";
import {ConcertQualityProbeV466} from "./ConcertQualityProbeV466";
import {ConcertQualityInspectorV466} from "./ConcertQualityInspectorV466";
import {resetConcertQualityV466} from "./concertQualityStoreV466";
import {planArtistSpotlightV443} from "./artistSpotlightV443";
import {planMultiArtistInteractionV444} from "./multiArtistInteractionV444";
import {planCrewAccentsV452,combineCrewGesturesV452,combineCrewLooksV452} from "./advancedMultiAvatarPerformanceV452";
import {refineNaturalCrewV458} from "./naturalStageInteractionV458";
import {VOCAL_CHANGE_EVENT_V445,advanceVocalEvidenceV445,emptyVocalEvidenceV445,vocalHintPulseV445} from "./vocalChangeEvidenceV445";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { readMotionTransitionSettings, MOTION_TRANSITION_CHANGE_EVENT } from "./motionTransitionStudioSettings";
import { shouldSwitchLiveMotion, resolveLiveTransitionDuration } from "./liveMotionTransitionDirector";
import { publishTimelineObservation, explainTimelineDecision, normalizeTimelineEvidence, type TimelinePhase } from "./musicStructureTimeline";
import { advanceDropPrediction, createDropPredictionState, type DropPhase } from "./advancedDropPredictor";
import {initialStructureState, advanceStructureState, structureEvidence, choreographyPhase} from "./advancedMusicStructureV208";
import { CHARACTER_MOTION_CHANGE_EVENT, loadCharacterMotionStore, chooseCharacterMotion } from "./characterMotionLibrary";
import { targetBlendWeight, smoothBlend, syncedClipSpeed } from "./motionBlendEngine";
import { createMaskedAnimationClip } from "./animationBoneMask";
import { AnimationClip, type Group, type Mesh } from "three";
import { Vector3 } from "three";
import { clone as cloneSkinnedScene } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { VisualizerProps } from "./registry";
import { Lyrics3DScene } from "./Lyrics3DScene";
import { VocalRigV368 } from "./VocalRigV368";
import {resolveVocalPerformanceQualityV374} from "./vocalPerformanceQualityV374";
import {composeVocalBodyV393} from "./vocalPerformanceIntelligenceV393";
import {composeRapFaceV406,composeRapStageV406} from "./rapStagePerformanceV406";
import {enhanceExpressiveLipV453,addExpressiveHeadV453} from "./expressiveLipSyncV453";
import {refineAdvancedVocalV459,addAdvancedVocalHeadV459} from "./advancedVocalPerformanceV459";
import {refineExpressiveLipV476} from "./expressiveLipSyncV476";
import {composeRapRhythmStageV407} from "./rapRhythmPerformanceV407";
import {normalizeRapPresetV412,sampleRapLiveV412,liveRapClipNameV412,type RapLiveSampleV412} from "./rapChoreographyPresetsV412";
import {sampleRapLyricsCueV413,lyricsRapGainV413} from "./lyricsAwareRapChoreographyV413";
import {effectiveRapTimingOffsetV418} from "./rapPerformanceQualityV418";
import {loadRapGestureDocumentV414,sampleRapGestureV414,applyRapGestureMotionV414,RAP_GESTURES_CHANGE_V414,type RapGestureDocumentV414,type RapGestureSampleV414} from "./rapGestureCuesV414";
import {resolveAdaptiveVocalPerformanceV375} from "./adaptiveVocalPerformanceV375";
import {resolveDuetInteractionV376,overlayDuetV376} from "./interactiveVocalDuetsV376";
import {resolveConcertCueV386,overlayConcertExpressionV386} from "./expressiveConcertDirectorV386";
import {resolveManualVocalCueV385,applyManualVocalCueV385} from "./manualVocalCastingV385";
import {resolveRapDuetCueV416,applyRapDuetInteractionV416,toVocalCueV416} from "./rapDuetStudioV416";
import {applyVocalStageOverlayV371,createVocalStageOverlayV371} from "./vocalStageExpressionV371";

import {hasActiveLyricsV350} from "@/services/stageContent/lyricsPhotoChoreographyV350";
import {SMART_STAGE_EVENT_V351,readSmartStageV351,decideSmartStageV351} from "@/services/stageContent/smartStageCompositionV351";
import {GENRE_VISUAL_EVENT_V352,readGenreVisualV352,decideGenreVisualV352,resolveGenreVisualV352,mergeGenreCompositionV352} from "@/services/stageContent/genreVisualDirectorV352";
import {VISUAL_FX_EVENT_V353,readVisualFxV353,decideVisualFxV353} from "@/services/stageContent/visualEffectsStudioV353";
import {StageVisualEffectsV353} from "./StageVisualEffectsV353";
import {LongRunStabilityControllerV355} from "./LongRunStabilityV355";
import {useStabilityCapV355,stabilityEffectFactorV355} from "@/services/monitoring/performanceStabilityV355";
import {SHOW_TIMELINE_EVENT_V354,readTimelineV354,evaluateTimelineV354,type ShowTimelineCueV354} from "@/services/stageContent/showTimelineV354";
import {AUTONOMOUS_SHOW_EVENT_V356,readAutoShowV356,planAutonomousShowV356,selectAutonomousMotionV356} from "@/services/stageContent/autonomousShowV356";
import {SHOW_QUALITY_EVENT_V357,readShowQualityV357,refineShowQualityV357} from "@/services/stageContent/showQualityV357";
import {SHOW_LEARNING_EVENT_V358,readShowLearningSettingsV358,readShowLearningHistoryV358,recordShowLearningV358,storeShowLearningHistoryV358,refineLearnedShowV358,type ShowLearningContextV358,type ShowLearningObservationV358} from "@/services/stageContent/adaptiveShowLearningV358";
import {getRenderMetricsSnapshot} from "./renderDiagnostics";
import { DancePostProcessingV468 } from './DancePostProcessingV468';
import {usePiConcertBudgetV479} from "./piConcertRuntimeV479";
import {resolvePiConcertEffectsV479} from "@/services/monitoring/piConcertBudgetV479";
import { ProceduralShaderEnvironmentV468 } from './ProceduralShaderEnvironmentV468';
import {prepareAvatarWardrobeV468} from './avatarWardrobeV468';
import {useAudioMotionEngine} from '@/hooks/useAudioMotionEngine';
import {resolveVocalDanceAccentV472} from "./vocalAwareChoreographyV472";
import {enhanceRapAccentV473} from "./rapFlowIntelligenceV473";
import {resolveNaturalRapGestureV474} from "./naturalRapGestureVarietyV474";
import {featureSpotlightV460,featureInteractionV460} from "./intelligentFeaturePerformanceV460";
import {refineMultiAvatarInteractionV475} from "./intelligentMultiAvatarInteractionV475";
import {LOW_POSE_EVENT_V481,readLowPoseV481,planLowPosesV481,findLowPoseClipV481,solveProceduralLowLegV481,type LowPoseSlotV481} from "./intelligentLowPoseV481";
import {newNaturalLowPoseStateV482,stepNaturalLowPoseV482,newLowClipStateV482,stepLowClipV482} from "./naturalLowPoseTransitionsV482";
import {newLowInteractionStateV483,stepLowInteractionV483} from "./naturalLowPoseInteractionV483";
import {planExpressiveLowPoseV484} from "./expressiveLowPosePerformanceV484";
import {planNaturalDanceMotionV485,type NaturalDanceSlotV485} from "./naturalDanceMotionStudioV485";
import {planAdvancedDanceFootworkV486, type FootSupportV486, type FootworkSlotV486} from "./advancedDanceFootworkV486";
import {buildGroundContactReportV487,emptyGroundObservationV487,GROUND_CONTACT_REPORT_EVENT_V487,type GroundObservationV487} from './groundContactStudioV487';
import {planNaturalFullBodyV488} from "./naturalFullBodyDanceV488";
import {planNaturalGlbMotionV489} from "./naturalGlbFullBodyMotionV489";
import {chooseUpperGestureClipV490,planUpperBlendV490} from "./automaticGlbUpperBlendV490";
import {createAutomaticUpperClipV490} from "./automaticGlbUpperClipV490";
import {GLB_BLEND_CHANGE_V492,readBlendPresetsV492,chooseLiveBlendPresetV492,type GlbBlendPresetV492} from "./glbBlendPresetsV492";
import {isPreviewBlendTrackV491} from "./glbMotionBlendPreviewV491";
import { DanceFX } from "./DanceFX";
import { DynamicStage } from "./DynamicStage";
import { SmartStageCameraV236 } from "./SmartStageCameraV236";
import { TRACKING_ROOT_NAME } from "./smartCameraTrackingV297";
import { StageCameraDirectorV289 } from "./StageCameraDirectorV289";
import { animationMapping } from "./animationMapping";
import { type AvatarLoopPreset, getActiveAvatarLoop, LOOP_CHANGE_EVENT } from "./avatarLoopPresets";
import { getActiveChoreography, resolveChoreography, readChoreographies, CHOREOGRAPHY_CHANGE_EVENT } from "./avatarChoreographies";
import { getDanceEnergy, rankChoreographies } from "./smartDanceDirector";
import { retargetHumanoidClips, readRetargetCalibration, RETARGET_EVENT } from "./avatarAnimationRetarget";
import { createFootContactState, updateFootContact } from "./avatarFootContact";
import {readFootLockV322,groundLockReportV322,FOOT_LOCK_DIAGNOSTIC_EVENT_V322,FOOT_LOCK_EVENT_V322} from "./intelligentFootLockV322";
import {createFullBodyBalanceStateV323,refineFullBodyBalanceV323,readFullBodyBalanceV323,FULL_BODY_BALANCE_DIAGNOSTIC_V323,fullBodyBalanceReportV323} from "./advancedFullBodyBalanceV323";
import { createFootIKState, initializeFootIK, updateFootIK, sampleStanceV323 } from "./avatarFootIK";
import { createBeatFootworkState, updateBeatFootwork } from "./beatPerfectFootworkV234";
import { getAvatarAnimationState } from "./avatarAnimationEngine";
import { applyAvatarRigMotion, collectAvatarRigNodes, type AvatarRigTargets } from "./avatarRigController";
import { getAvatarRigProfile, type AvatarRigProfileId } from "./avatarRigProfiles";
import { getAvatarDancePreset } from "./avatarDancePresets";
import { createDanceIntelligenceState, getDanceIntelligenceMultipliers, updateDanceIntelligence } from "./danceIntelligence";
import { createFullBodyDanceState, getFullBodyDanceMotion, updateFullBodyDance } from "./fullBodyDance";
import { getAvatarExpressionState } from "./avatarExpressionEngine";
import { createPerformanceDirectorState, updatePerformanceDirector } from "./performanceDirector";
import { createMusicalStructureState, getMusicalStructure, updateMusicalStructure } from "./musicalStructureEngine";
import { createNaturalMotionState, updateNaturalMotion } from "./naturalMotionEngine";
import { createChoreographyState, updateDanceChoreography } from "./advancedDanceChoreography";
import {resolveGenreMotionV471} from "./genreChoreographyV471";
import { createRhythmChoreographyState, updateRhythmChoreography } from "./rhythmAwareChoreography";
import { publishDancePerformance, nextPhraseBoundary } from "./dancePerformanceStore";
import { createFrameSampler, sampleAvatarFrame } from "./danceDiagnosticsStore";
import { AdaptivePerformanceController, getActivePerformanceTier } from "./adaptivePerformance";
import { RaspberryPiProfileBootstrap } from "./RaspberryPiEdition";
import { AvatarSmartLOD } from "./AvatarSmartLOD";
import { AutomaticLODAssetLoader } from "./AutomaticLODAssetLoader";
import { safeClipTime, saveLodPlayback, takeLodPlayback, publishLiveLodPlayback, readLiveLodPlayback, clearLiveLodPlayback } from "./lodPlaybackContinuity";
import { selectMotionWorkloadTier } from "./motionWorkloadPolicy";
import { createAnimationCadence, setAnimationCadencePhase, shouldUpdateAnimation, publishAnimationQuality } from "./adaptiveAnimationQuality";
import { createPersonalityState, updateAvatarPersonality } from "./avatarPersonalityEngine";
import { rapGroovePose, DEFAULT_RAP_GROOVE } from "./rapGrooveEngine";
import { normalizeRapEditorV408 } from "./rapPerformanceEditorV408";

/** Per-dancer mutable cue avoids rerendering or restarting animation mixers each frame. */
const GroupMotionClockContextV328=createContext<{settings:MotionSyncV328;clock:{current:MotionSyncClockV328}}|null>(null);
// V329: clip signatures published only on asset/clip changes, never per animation frame.
const GroupLowPoseContextV481=createContext<{current:LowPoseSlotV481}|null>(null);
const GroupDanceMotionContextV485=createContext<{current:NaturalDanceSlotV485}|null>(null);
const GroupFootworkContextV486=createContext<{current:FootworkSlotV486}|null>(null);
const GroupFootSupportContextV486=createContext<{current:FootSupportV486}|null>(null);
const GroupGroundObservationContextV487=createContext<{current:GroundObservationV487}|null>(null);
const GroupPhraseContextV329=createContext<{settings:PhraseSettingsV329;plan:PhraseMatchV329;register:(slot:number,profiles:readonly PhraseSignatureV329[])=>void}|null>(null);
const PartnerLookContext = createContext<{current: LookAtCue} | null>(null);
function usePartnerLook() { return useContext(PartnerLookContext); }
function applyPartnerLook(targets: AvatarRigTargets, cue: LookAtCue, delta: number, previous: { yaw: number; pitch: number; eye: number }) {
  const yaw = approachLook(previous.yaw, cue.yaw, delta);
  const pitch = approachLook(previous.pitch, cue.pitch, delta);
  const eye = approachLook(previous.eye, cue.eyeYaw, delta);
  // Add only frame-to-frame overlay deltas, preserving authored clip rotations.
  if (targets.head) { targets.head.rotation.y += yaw - previous.yaw; targets.head.rotation.x += pitch - previous.pitch; }
  if (targets.leftEye) targets.leftEye.rotation.y += eye - previous.eye;
  if (targets.rightEye) targets.rightEye.rotation.y += eye - previous.eye;
  previous.yaw = yaw; previous.pitch = pitch; previous.eye = eye;
}

/** Add delta overlays after source animation, retaining previous offset for smooth release. */
const PartnerHandContext = createContext<{current:PartnerHandCue} | null>(null);
const PartnerCalibrationContext = createContext<{reach:number;height:number;strength:number} | null>(null);
function usePartnerHand() { return useContext(PartnerHandContext); }
const PartnerGestureContext = createContext<{current:PartnerGestureCue} | null>(null);
function usePartnerGesture() { return useContext(PartnerGestureContext); }
function applyPartnerGesture(targets:AvatarRigTargets, cue:PartnerGestureCue, delta:number, previous:PartnerGestureCue) {
  const next:PartnerGestureCue = {
    leftLift:approachGesture(previous.leftLift,cue.leftLift,delta),
    rightLift:approachGesture(previous.rightLift,cue.rightLift,delta),
    shoulder:approachGesture(previous.shoulder,cue.shoulder,delta),
    lean:approachGesture(previous.lean,cue.lean,delta),
    intensity:approachGesture(previous.intensity,cue.intensity,delta),
  };
  if (targets.leftArm) targets.leftArm.rotation.z += next.leftLift-previous.leftLift;
  if (targets.rightArm) targets.rightArm.rotation.z -= next.rightLift-previous.rightLift;
  if (targets.chest) targets.chest.rotation.x += next.shoulder-previous.shoulder;
  if (targets.spine) targets.spine.rotation.z += next.lean-previous.lean;
  Object.assign(previous,next);
}

function ProceduralAvatar({ audio, isPlaying, reducedMotion, genre, genreFusion, avatarScale = 1, avatarOffsetY = 0, avatarAnimationIntensity = 1, avatarDancePreset = "auto", danceAggression = 0.5, danceMotionStyle = "balanced", avatarMotionMode = "hybrid", avatarArmResponse = 1, avatarLegResponse = 1, track, lipSync, showCue, workloadSlot = 0 }: VisualizerProps & {workloadSlot?:number}) {
  const argumentsLipSync = lipSync ?? {lyrics:null,progressMs:0,playing:false,enabled:false,strength:90,mode:"lyrics" as const};
  const schedulerInstance = useId();
  useEffect(() => () => releaseAvatarFrame(schedulerInstance), [schedulerInstance]);
  useEffect(() => () => releaseScheduledInstance(schedulerInstance), [schedulerInstance]);
  const {preferences: groovePreferences} = useUiPreferences();
  const preferencesRap=useRef(groovePreferences.rapGroove??DEFAULT_RAP_GROOVE);
  preferencesRap.current=groovePreferences.rapGroove??DEFAULT_RAP_GROOVE;
  const partnerLook = usePartnerLook();
  const partnerGesture = usePartnerGesture();
  const root = useRef<Group>(null);
  const intelligence = useRef(createDanceIntelligenceState());
  const performanceDirector = useRef(createPerformanceDirectorState());
  const emotionV233 = useRef(createEmotionV233State());
  const musicalStructure = useRef(createMusicalStructureState());
  const danceQualityV307 = useRef(createDanceQualityState());
  const dancePerformanceV311 = useRef(createAdvancedDanceStateV311());
  const naturalDanceV320 = useRef(createNaturalDanceStateV320());
  const danceFlowV391 = useRef(createDanceFlowStateV391());
  const reviewCadenceV314=useRef(0);
  const previewPublishedAt = useRef(-1);
  const frameSampler = useRef(createFrameSampler());
  const head = useRef<Mesh>(null);
  const mouth = useRef<Mesh>(null);
  const eyes = useRef<Group>(null);
  const browsV406 = useRef<Group>(null);
  const torso = useRef<Mesh>(null);
  const leftLegV481=useRef<Group>(null);
  const rightLegV481=useRef<Group>(null);
  const leftKneeV481=useRef<Group>(null);
  const rightKneeV481=useRef<Group>(null);
  const lowPoseV481=useContext(GroupLowPoseContextV481);
  const groupDanceV485=useContext(GroupDanceMotionContextV485);
  const groupFootworkV486=useContext(GroupFootworkContextV486);
  const naturalLowV482=useRef(newNaturalLowPoseStateV482());
  const baseRootYV482=useRef(0);
  const leftArm = useRef<Mesh>(null);
  const rightArm = useRef<Mesh>(null);
  useFrame((state, delta) => {
    const v251StartedAt = typeof performance !== "undefined" ? performance.now() : -1;
    try {     sampleAvatarFrame(frameSampler.current, delta, "procedural", isPlaying);
    if (!root.current || !head.current || !torso.current) return;
    intelligence.current = updateDanceIntelligence(intelligence.current, audio, state.clock.elapsedTime);
    const intelligenceMultipliers = getDanceIntelligenceMultipliers(intelligence.current);
    musicalStructure.current = updateMusicalStructure(musicalStructure.current, audio, state.clock.elapsedTime, isPlaying, reducedMotion);
    const structure = getMusicalStructure(musicalStructure.current, state.clock.elapsedTime);
    const performance = updatePerformanceDirector(performanceDirector.current, audio, genre, intelligence.current, structure, state.clock.elapsedTime, isPlaying, reducedMotion, avatarDancePreset);
    if (shouldRunScheduledTask(schedulerInstance, "preview", state.clock.elapsedTime)) {
      previewPublishedAt.current = state.clock.elapsedTime;
      publishDancePerformance({ playing: isPlaying, sequence: "baseline", move: isPlaying ? "procedural groove" : "idle",
        section: performance.section, rhythm: audio.learnedRhythm ?? "unknown", confidence: audio.rhythmConfidence ?? 0,
        blend: 1, ...nextPhraseBoundary(state.clock.elapsedTime, audio.bpm), source: "procedural" });
    }
    const genreMotionV471=resolveGenreMotionV471({genre,fusion:genreFusion,section:showCue?.enabled?showCue.section:performance.section,playing:isPlaying,reducedMotion,energy:audio.energyEnvelope,authored:avatarMotionMode==='choreography'});
    const motion = getAvatarAnimationState(audio, genre, isPlaying, reducedMotion, avatarAnimationIntensity, state.clock.elapsedTime, avatarDancePreset);
    const rap = rapGroovePose(audio,state.clock.elapsedTime,{...DEFAULT_RAP_GROOVE,...preferencesRap.current},genre,isPlaying,reducedMotion);
    const expression = getAvatarExpressionState(audio, genre, isPlaying, reducedMotion, avatarAnimationIntensity * performance.expressionIntensity, state.clock.elapsedTime);
    const emotion = updateEmotionV233(emotionV233.current, expression, performance.section, genre, state.clock.elapsedTime, delta, isPlaying, reducedMotion);
    const qualityV307 = enhanceDanceQuality(danceQualityV307.current, NEUTRAL_QUALITY_MOTION, {
      playing:isPlaying, reducedMotion, delta, songSeconds:state.clock.elapsedTime, genre, section:performance.section,
      bpm:audio.bpm, beatStrength:audio.beatStrength, kick:audio.kickAccentIntensity, snare:audio.snare,
      energy:audio.energyEnvelope, dancerKey:"procedural", settings:readDanceQualitySettings(),
      authoredClipPriority:avatarMotionMode==="choreography",
    });
    const performanceV311 = refineDancePerformanceV311(dancePerformanceV311.current, {...qualityV307, weightShift:rap.weightShift, spineSway:rap.shoulder*.3+qualityV307.spineSway}, {
      playing:isPlaying, reducedMotion, delta, time:state.clock.elapsedTime, genre, section:performance.section,
      bpm:audio.bpm, kick:audio.kickAccentIntensity, beat:audio.beatStrength, snare:audio.snare,
      authoredClipPriority:avatarMotionMode==="choreography", settings:readDancePerformanceV311(),
    });
    const performanceV320 = refineNaturalDanceV320(naturalDanceV320.current, performanceV311, {
      settings:readNaturalDanceV320(), playing:isPlaying, reducedMotion, time:state.clock.elapsedTime,
      delta, trackId:track?.id, genre, section:performance.section, bpm:audio.bpm,
      beatPhase:audio.beatPhase, phaseConfidence:audio.phaseConfidence,
      beat:audio.beatStrength, kick:audio.kickAccentIntensity, snare:audio.snare, energy:audio.energyEnvelope,
      authoredClipPriority:avatarMotionMode==="choreography",
    });
    const performanceV391 = refineDanceFlowV391(danceFlowV391.current,performanceV320,{settings:readDanceFlowV391(),playing:isPlaying,reducedMotion,delta,time:state.clock.elapsedTime,trackId:track?.id,genre,section:performance.section,slot:workloadSlot,bpm:audio.bpm,energy:audio.energyEnvelope,beat:audio.beatStrength,snare:audio.snare,kick:audio.kickAccentIntensity,authoredClipPriority:avatarMotionMode==="choreography"});
    reviewCadenceV314.current+=Math.min(.10,Math.max(0,delta));
    if(isPlaying&&!reducedMotion&&reviewCadenceV314.current>=.25){
      reviewCadenceV314.current=0;
      observeReviewMotionV314({trackId:track?.id??"",slot:workloadSlot,source:"procedural",
        motion:performanceV391,kick:audio.kickAccentIntensity??0});
    }
    const preKick = isPlaying && !reducedMotion ? (audio.kickAnticipation ?? 0) : 0;
    const kickAccent = isPlaying && !reducedMotion ? (audio.kickAccentIntensity ?? 0) : 0;
    const patternConfidence = audio.kickPatternConfidence ?? 0;
    const patternAccent = isPlaying && !reducedMotion && patternConfidence >= 0.4 ? (audio.kickPatternAccent ?? 0) * patternConfidence : 0;
    const patternKick = audio.kickPattern === "double" ? patternAccent * 0.32 : audio.kickPattern === "syncopated" ? patternAccent * 0.23 : patternAccent * 0.10;
    const learnedAccent = isPlaying && !reducedMotion && (audio.rhythmConfidence ?? 0) >= 0.5
      ? (audio.rhythmPhraseAccent ?? 0) * (audio.rhythmConfidence ?? 0) * Math.max(0, audio.beatStrength) * 0.22 : 0;
    const motionMix = avatarMotionMode === "choreography" ? 0.35 : 1;
    const smooth = Math.min(1, delta * (danceMotionStyle === "sharp" ? 15 : danceMotionStyle === "smooth" ? 4 : 8));
    // V372: one deterministic timebase for facial, head and gesture cues.
    const synchronizedV372=resolveVocalPerformanceQualityV374(argumentsLipSync.lyrics,argumentsLipSync.progressMs,argumentsLipSync.playing,{
      enabled:lipSync?.coordinationEnabledV372??true,reducedMotion,
      alignment:lipSync?.coordinationStrengthV372??70,timingOffsetMs:lipSync?.coordinationOffsetMsV372??0,
      qualityEnabledV374:lipSync?.qualityEnabledV374??true,mouthSmoothnessV374:lipSync?.mouthSmoothnessV374??65,rapGestureCalmV374:lipSync?.rapGestureCalmV374??70,rapLipEnabledV415:lipSync?.rapLipEnabledV415??false,rapLipPrecisionV415:lipSync?.rapLipPrecisionV415??70,rapSyllableEnabledV419:lipSync?.rapSyllableEnabledV419??false,rapSyllableStrengthV419:lipSync?.rapSyllableStrengthV419??65,rapSyllableSmoothnessV419:lipSync?.rapSyllableSmoothnessV419??70,rapSyllableEditsEnabledV420:lipSync?.rapSyllableEditsEnabledV420??false,rapSyllableTrackIdV420:lipSync?.rapSyllableTrackIdV420??"",rapSyllableDocumentV420:lipSync?.rapSyllableDocumentV420??null,rapAudioEnabledV423:lipSync?.rapAudioEnabledV423??false,rapAudioStrengthV423:lipSync?.rapAudioStrengthV423??45,rapAudioOffsetMsV423:lipSync?.rapAudioOffsetMsV423??0,rapAudioTrackIdV423:lipSync?.rapAudioTrackIdV423??"",rapAudioDocumentV423:lipSync?.rapAudioDocumentV423??null,rapLipOffsetMsV415:lipSync?.rapLipOffsetMsV415??0,naturalArticulationEnabledV384:lipSync?.naturalArticulationEnabledV384??true,articulationStrengthV384:lipSync?.articulationStrengthV384??70,lipSealV384:lipSync?.lipSealV384??90,jawStabilityV384:lipSync?.jawStabilityV384??65,ensembleModeV374:lipSync?.ensembleModeV374??"lead",ensembleCountV374:lipSync?.ensembleCountV374??1,manualSingingSlotsV385:lipSync?.manualVocalCueRefV385?.current?.active?lipSync.manualVocalCueRefV385.current.singingSlots:undefined,stageLeaderV375:lipSync?.interactionCueRefV376?.current?.enabled?lipSync.interactionCueRefV376.current.leadSlot:lipSync?.performanceCueRefV375?.current?.enabled?lipSync.performanceCueRefV375.current.leadSlot:undefined,
      style:lipSync?.style,genre,mode:argumentsLipSync.mode,mids:audio.mids,
      expression:(lipSync?.expression??55)/100,lipStrength:argumentsLipSync.enabled?argumentsLipSync.strength:0,
      jawFollow:lipSync?.jawFollowV369??65,bodyEnabled:lipSync?.bodyEnabledV371??true,
      bodyStrength:lipSync?.bodyStrengthV371??60,eyeContact:lipSync?.eyeContactV371??true,
      gestures:lipSync?.gesturesV371??true,avatarSlot:workloadSlot,
      partnerAttention:Math.min(1,Math.abs(partnerLook?.current.yaw??0)*2+(partnerGesture?.current.intensity??0)),
      authoredPriority:avatarMotionMode==="choreography",
    });
    const bodyCueV371=overlayDuetV376(synchronizedV372.body,lipSync?.interactionCueRefV376?.current,
      workloadSlot,isPlaying&&!reducedMotion&&lipSync?.bodyEnabledV371!==false,lipSync?.gesturesV371!==false,
      lipSync?.eyeContactV371!==false,avatarMotionMode==="choreography");
    const expressiveBodyV386=overlayConcertExpressionV386(bodyCueV371,lipSync?.concertCueRefV386?.current,workloadSlot,
      {gestures:lipSync?.gesturesV371!==false,eyeContact:lipSync?.eyeContactV371!==false,authoredPriority:avatarMotionMode==="choreography"});
    const expressiveBodyV393=composeVocalBodyV393(expressiveBodyV386,synchronizedV372,
      {mode:lipSync?.performanceModeV393,strength:lipSync?.performanceStrengthV393},
      {playing:isPlaying,reducedMotion,authoredPriority:avatarMotionMode==="choreography",
       bodyEnabled:lipSync?.bodyEnabledV371!==false&&lipSync?.enabled!==false,gestures:lipSync?.gesturesV371,eyeContact:lipSync?.eyeContactV371,
       section:showCue?.enabled?showCue.section:null,slot:workloadSlot});
    const rapBodyV406=composeRapStageV406(expressiveBodyV393,synchronizedV372,
      {playing:isPlaying,reducedMotion,enabled:lipSync?.enabled!==false&&lipSync?.coordinationEnabledV372!==false,
       energy:audio.mids,strength:lipSync?.expression,slot:workloadSlot,
       authoredPriority:avatarMotionMode==="choreography",bodyEnabled:lipSync?.bodyEnabledV371!==false,
       gestures:lipSync?.gesturesV371,eyeContact:lipSync?.eyeContactV371});
    const rapBodyV407=composeRapRhythmStageV407(rapBodyV406,synchronizedV372,audio,{
      playing:isPlaying,reducedMotion,enabled:lipSync?.enabled!==false&&lipSync?.coordinationEnabledV372!==false,
      energy:audio.mids,strength:lipSync?.expression,slot:workloadSlot,
      authoredPriority:avatarMotionMode==="choreography",bodyEnabled:lipSync?.bodyEnabledV371!==false,
      gestures:lipSync?.gesturesV371,section:showCue?.enabled?showCue.section:performance.section,
      rhythmEnabled:preferencesRap.current.enabled,
      headGain:preferencesRap.current.head,shoulderGain:preferencesRap.current.shoulders,
      snareGain:preferencesRap.current.snare,editorV408:groovePreferences.rapPerformanceEditorV408,
    });
    const manualVocalV453=lipSync?.manualVocalCueRefV385?.current;
    const lipV453=enhanceExpressiveLipV453(argumentsLipSync.lyrics,synchronizedV372,{
      playing:isPlaying,enabled:argumentsLipSync.enabled,reducedMotion,
      manualSilent:!!manualVocalV453?.active&&!manualVocalV453.singingSlots.includes(workloadSlot),
      editedWords:lipSync?.rapSyllableEditsEnabledV420&&lipSync.rapSyllableDocumentV420!=null&&lipSync.rapSyllableTrackIdV420===lipSync.rapSyllableDocumentV420.trackId
        ?lipSync.rapSyllableDocumentV420.edits:undefined,
      intensity:argumentsLipSync.strength,
      preserveAudioMouth:!!lipSync?.rapAudioEnabledV423&&!!lipSync.rapAudioDocumentV423&&
        lipSync.rapAudioTrackIdV423===lipSync.rapAudioDocumentV423.trackId,
      authoredBody:avatarMotionMode==="choreography",
    });
    const lipV459=refineAdvancedVocalV459(argumentsLipSync.lyrics,lipV453,synchronizedV372,{
      playing:isPlaying,enabled:argumentsLipSync.enabled,reducedMotion,
      manualSilent:!!manualVocalV453?.active&&!manualVocalV453.singingSlots.includes(workloadSlot),
      editedWords:lipSync?.rapSyllableEditsEnabledV420&&lipSync.rapSyllableDocumentV420!=null&&lipSync.rapSyllableTrackIdV420===lipSync.rapSyllableDocumentV420.trackId
        ?lipSync.rapSyllableDocumentV420.edits:undefined,
      intensity:argumentsLipSync.strength,
      preserveAudioMouth:!!lipSync?.rapAudioEnabledV423&&!!lipSync.rapAudioDocumentV423&&
        lipSync.rapAudioTrackIdV423===lipSync.rapAudioDocumentV423.trackId,
      authoredBody:avatarMotionMode==="choreography",
    });
    const lipV476=refineExpressiveLipV476(argumentsLipSync.lyrics,lipV459,synchronizedV372,{
      playing:isPlaying,enabled:argumentsLipSync.enabled,reducedMotion,
      manualSilent:!!manualVocalV453?.active&&!manualVocalV453.singingSlots.includes(workloadSlot),
      editedWords:lipSync?.rapSyllableEditsEnabledV420&&lipSync.rapSyllableDocumentV420!=null&&lipSync.rapSyllableTrackIdV420===lipSync.rapSyllableDocumentV420.trackId
        ?lipSync.rapSyllableDocumentV420.edits:undefined,
      intensity:argumentsLipSync.strength,
      preserveAudioMouth:!!lipSync?.rapAudioEnabledV423&&!!lipSync.rapAudioDocumentV423&&
        lipSync.rapAudioTrackIdV423===lipSync.rapAudioDocumentV423.trackId,
      authoredBody:avatarMotionMode==="choreography",
    });
    const rapBodyV453=addAdvancedVocalHeadV459(addExpressiveHeadV453(rapBodyV407,lipV453),lipV459);
    if (mouth.current) {
      const face=composeRapFaceV406(synchronizedV372.face,synchronizedV372,{
        playing:isPlaying,reducedMotion,
        enabled:lipSync?.enabled!==false&&lipSync?.coordinationEnabledV372!==false,
        energy:audio.mids,strength:lipSync?.expression,slot:workloadSlot,
      });
      mouth.current.scale.y += ((.32 + lipV476.face.jaw * 1.9 - lipV476.face.lipsClosed*.16) - mouth.current.scale.y) * Math.min(1,delta*(lipV459.rapid?27:18));
      mouth.current.scale.x += ((1 + lipV476.face.wide*.34 - lipV476.face.round*.50 - lipV476.face.lipsClosed*.25) - mouth.current.scale.x) * Math.min(1,delta*(lipV459.rapid?22:14));
      if (eyes.current) { eyes.current.scale.y += ((1-face.blink*.88-lipV476.face.squint*.30)-eyes.current.scale.y)*Math.min(1,delta*30); eyes.current.rotation.y += (rapBodyV407.eyeYaw-eyes.current.rotation.y)*Math.min(1,delta*12); }
      if (browsV406.current) browsV406.current.position.y += ((.78 + Math.max(face.brow,lipV476.face.brow)*.10)-browsV406.current.position.y)*Math.min(1,delta*16);
    }
    // Matching bounded vocal gestures for the procedural fallback avatar.
    const variationV474=resolveNaturalRapGestureV474(enhanceRapAccentV473(resolveVocalDanceAccentV472({lyrics:lipSync?.lyrics,progressMs:lipSync?.progressMs,
      playing:isPlaying&&lipSync?.enabled!==false&&lipSync?.playing!==false,reducedMotion,
      rap:genreMotionV471?.family==='rap',section:showCue?.enabled?showCue.section:performance.section,
      slot:workloadSlot,authored:avatarMotionMode==='choreography',
      bodyEnabled:lipSync?.bodyEnabledV371,gesturesEnabled:lipSync?.gesturesV371,
      strength:(lipSync?.bodyStrengthV371??60)/100,offsetMs:lipSync?.coordinationOffsetMsV372,
      casting:!!track?.id&&lipSync?.manualVocalEnabledV385===true&&
        track.id===lipSync.manualVocalTrackIdV385&&lipSync.manualVocalCueRefV385?.current?.active
        ?lipSync.manualVocalCueRefV385.current
        :!!track?.id&&lipSync?.rapDuetEnabledV416===true&&
          track.id===lipSync.rapDuetTrackIdV416
            ?resolveRapDuetCueV416({lyrics:lipSync.lyrics,progressMs:lipSync.progressMs,playing:isPlaying,
              count:Math.max(1,lipSync.ensembleCountV374??1),enabled:true,
              assignments:lipSync.rapDuetAssignmentsV416,reducedMotion,
              manualPriority:avatarMotionMode==='choreography'}):null,
    }),{
      lyrics:lipSync?.lyrics,progressMs:lipSync?.progressMs,offsetMs:lipSync?.coordinationOffsetMsV372,
      playing:isPlaying&&lipSync?.enabled!==false&&lipSync?.playing!==false,
      rap:genreMotionV471?.family==='rap',reducedMotion,
      section:showCue?.enabled?showCue.section:performance.section,
    }),{trackId:track?.id,slot:workloadSlot,playing:isPlaying,reducedMotion,
       authored:avatarMotionMode==='choreography',section:showCue?.enabled?showCue.section:performance.section});
    const vocalV472=variationV474.accent;
    const genreAccentV471=(genreMotionV471?.weight??0)*Math.min(1,audio.beatStrength??0)*.07;
    head.current.scale.y += (1 + (motion.beatImpulse + kickAccent * 0.55 + patternKick + learnedAccent) * 0.18 * (0.7 + danceAggression * 0.6) * intelligenceMultipliers.kick * performance.danceMultiplier * motionMix + performance.poseImpulse * 0.08 + performance.buildUp * 0.025 - preKick * 0.055 - head.current.scale.y) * smooth;
    head.current.rotation.z += (emotion.headTilt + rap.shoulder*.6 + performanceV391.expressionHeadTilt + rapBodyV407.headTilt + variationV474.headTilt - head.current.rotation.z) * smooth;
    head.current.rotation.x += (rap.headNod + performanceV391.headNod + genreAccentV471*((genreMotionV471?.head??1)-.8) + (partnerLook?.current.pitch ?? 0) + emotion.gazePitch + rapBodyV453.headPitch + vocalV472.head - head.current.rotation.x) * smooth;
    head.current.rotation.y += ((partnerLook?.current.yaw ?? 0) + emotion.gazeYaw + performanceV391.headTurn + rapBodyV407.headYaw + variationV474.headTurn - head.current.rotation.y) * smooth;
    if (leftArm.current) leftArm.current.rotation.z += ((-0.25 + genreAccentV471*((genreMotionV471?.arms??1)-.6) + (partnerGesture?.current.leftLift ?? 0) + (performanceV391.leftArmAccent ?? 0) + (performanceV391.counterArm ?? 0) + rapBodyV407.leftArm + vocalV472.arms*Math.max(0,vocalV472.side)) - leftArm.current.rotation.z) * smooth;
    if (rightArm.current) rightArm.current.rotation.z += ((0.25 - genreAccentV471*((genreMotionV471?.arms??1)-.6) - (partnerGesture?.current.rightLift ?? 0) + (performanceV391.rightArmAccent ?? 0) - (performanceV391.counterArm ?? 0) + rapBodyV407.rightArm - vocalV472.arms*Math.max(0,-vocalV472.side)) - rightArm.current.rotation.z) * smooth;
    // V484: restrained forward/back counter-swing while the procedural legs
    // crouch. Existing V481 IK remains responsible for feet, and authored
    // choreography never receives this extra arm-axis motion.
    const lowWeightV484=isPlaying&&!reducedMotion&&avatarMotionMode!=='choreography'
      ?Math.min(1,Math.max(0,(lowPoseV481?.current.depth??0)/.4)):0;
    const lowGestureV484=partnerGesture?.current;
    if(leftArm.current){const x=-Math.min(.11,lowWeightV484*(.045+(lowGestureV484?.leftLift??0)*.3));leftArm.current.rotation.x+=(x-leftArm.current.rotation.x)*smooth;}
    if(rightArm.current){const x=-Math.min(.11,lowWeightV484*(.045+(lowGestureV484?.rightLift??0)*.3));rightArm.current.rotation.x+=(x-rightArm.current.rotation.x)*smooth;}
    // V482: the pelvis and procedural leg solve share a single filtered depth below.
    torso.current.scale.x += (1 + audio.volume * 0.12 * motion.intensity - torso.current.scale.x) * smooth;
    // Torso roll is resolved once with the low-pose counterbalance below (V488).
    root.current.rotation.y += ((motion.bodySway * performance.danceMultiplier * motionMix + rap.hipSway*.6 + performanceV391.hipSway + (performanceV391.hipCounter ?? 0)) - root.current.rotation.y) * smooth;
    // V481: two real articulated procedural leg chains. The inverse two-link
    // angle keeps each ankle at its original stage height as the pelvis lowers.
    const requestedLowV481=isPlaying&&!reducedMotion&&avatarMotionMode!=="choreography"?lowPoseV481?.current:null;
    const lowerV481=requestedLowV481?.mode==='rap-lean'?0:Math.min(.26,Math.max(0,(requestedLowV481?.depth??0)*.46));
    const lowV482=stepNaturalLowPoseV482(naturalLowV482.current,{
      depth:lowerV481,mode:requestedLowV481?.mode??'stand',seconds:(lipSync?.progressMs??0)/1000,
      slot:workloadSlot,beat:audio.beatStrength??0,playing:isPlaying,reducedMotion,
      manualPriority:avatarMotionMode==='choreography',
    },delta);
    const lowLegV481=solveProceduralLowLegV481(lowV482.depth);
    // V488: safe coordination targets for procedural torso/arms/leg swing.
    // Song-time beats come from the same media clock as V486's footwork;
    // GLB rigs receive NO synthetic root/bone/IK adjustments.
    const fullBodyV488=planNaturalFullBodyV488({
      trackId:track?.id,seconds:Math.max(0,(lipSync?.progressMs??0)/1000||state.clock.elapsedTime),
      slot:workloadSlot,lowDepth:lowV482.depth,
      footwork:groupFootworkV486?.current??{offsetX:0,offsetZ:0,liftLeft:0,liftRight:0,rootSpeed:1,weightShift:0},
      beat:audio.beatStrength??0,kick:audio.kickAccentIntensity??0,energy:audio.energyEnvelope??0,
      genre,playing:isPlaying,reducedMotion,manualPriority:avatarMotionMode==='choreography',
      automaticGroup:!!lowPoseV481&&!!groupFootworkV486,tier:getActivePerformanceTier(),
    });
    // V485: a very small raised-foot sidestep only for the procedural standing
    // dancer. Low-pose IK stays unaltered for the crouching partner; GLB rigs
    // continue to use their own mixer/clips and are never retargeted here.
    const stepV485=isPlaying&&!reducedMotion&&avatarMotionMode!=='choreography'&&lowV482.depth<.025
      ?Math.min(1,Math.max(0,groupDanceV485?.current.step??0)):0;
    // V486: song-time, alternating foot swings (not renderer elapsed time).
    // The V485 step remains the conservative enable/strength source.
    const stepLeftV485=stepV485>0?Math.max(0,Math.min(1,groupFootworkV486?.current.liftLeft??0)):0;
    const stepRightV485=stepV485>0?Math.max(0,Math.min(1,groupFootworkV486?.current.liftRight??0)):0;
    // One exact target for knee angles and pelvis height prevents filter drift.
    if(leftLegV481.current)leftLegV481.current.rotation.x=-lowLegV481.hipAngle+stepLeftV485*.038;
    if(rightLegV481.current)rightLegV481.current.rotation.x=-lowLegV481.hipAngle+stepRightV485*.038;
    if(leftKneeV481.current)leftKneeV481.current.rotation.x=lowLegV481.kneeAngle+stepLeftV485*.11+fullBodyV488.leftKneeExtra;
    if(rightKneeV481.current)rightKneeV481.current.rotation.x=lowLegV481.kneeAngle+stepRightV485*.11+fullBodyV488.rightKneeExtra;
    const rapLeanV482=(requestedLowV481?.mode==='rap-lean'?(requestedLowV481.depth*.4):lowV482.depth*.22)
      +(stepV485>0?(groupFootworkV486?.current.weightShift??0):0);
    torso.current.rotation.x+=(rapLeanV482+fullBodyV488.torsoPitch-torso.current.rotation.x)*smooth;
    // Keep hips near planted feet. A few millimetres of weight shift belong to
    // the torso visual only, NOT to the stage/root or ankle anchors.
    torso.current.position.x+=(fullBodyV488.hipShiftX-torso.current.position.x)*smooth;
    if(leftArm.current)leftArm.current.rotation.x+=(fullBodyV488.leftArmSwing-leftArm.current.rotation.x)*smooth;
    if(rightArm.current)rightArm.current.rotation.x+=(fullBodyV488.rightArmSwing-rightArm.current.rotation.x)*smooth;
    const headPitchTargetV488=rap.headNod + performanceV391.headNod
      + genreAccentV471*((genreMotionV471?.head??1)-.8)
      + (partnerLook?.current.pitch ?? 0) + emotion.gazePitch + rapBodyV453.headPitch
      + vocalV472.head + fullBodyV488.headCounterPitch;
    head.current.rotation.x+=(headPitchTargetV488-head.current.rotation.x)*smooth;
    // V488 counter-roll is a target offset with its own state so it cannot
    // accumulate frame after frame (unlike adding a constant every tick).
    const bodyRollTargetV488=(performanceV391.spineSway + (performanceV391.torsoTwist ?? 0)
      + rapBodyV407.chestLean + vocalV472.chest*vocalV472.side*.4 + variationV474.torsoSway)
      + lowV482.torsoShift + fullBodyV488.torsoRoll;
    torso.current.rotation.z+=(bodyRollTargetV488-torso.current.rotation.z)*smooth;
    // Keep normal beat bounce separate from the low-pose compensation.
    const normalBounceV482=motion.bodyBounce * performance.danceMultiplier * motionMix * (0.5 + avatarLegResponse * 0.5) - preKick * 0.065 + Math.sin(state.clock.elapsedTime*2.1)*audio.mids*.025*motion.intensity;
    baseRootYV482.current+=(normalBounceV482-baseRootYV482.current)*smooth;
    root.current.position.y=baseRootYV482.current-lowV482.depth;
    } finally {
      if (v251StartedAt >= 0) recordAvatarFrame(schedulerInstance, "Procedural", performance.now() - v251StartedAt, performance.now());
    }
  });
  return <group ref={root} scale={avatarScale} position={[0, avatarOffsetY, 0]}>
    <mesh ref={torso} position={[0, -0.48, 0]}><capsuleGeometry args={[0.48, 0.62, 6, 12]} /><meshStandardMaterial color="#7557d9" roughness={0.42} /></mesh>
    <mesh position={[0, 0.55, 0]}><sphereGeometry args={[0.43, 32, 24]} /><meshStandardMaterial color="#e7b99d" roughness={0.55} /></mesh>
    <mesh name="SonicV369Face" ref={head} position={[0, 0.57, 0.02]}><sphereGeometry args={[0.44, 32, 24]} /><meshStandardMaterial color="#e7b99d" roughness={0.55} /></mesh>
    <group ref={eyes} position={[0, 0.62, 0.39]}>
      <mesh position={[-0.16,0,0]}><sphereGeometry args={[0.035,12,12]}/><meshBasicMaterial color="#241b35"/></mesh>
      <mesh position={[0.16,0,0]}><sphereGeometry args={[0.035,12,12]}/><meshBasicMaterial color="#241b35"/></mesh>
    </group>
    <group ref={browsV406} position={[0, 0.78, 0.39]}>
      <mesh position={[-0.16,0,0]}><boxGeometry args={[0.18,0.026,0.040]}/><meshBasicMaterial color="#35264b"/></mesh>
      <mesh position={[0.16,0,0]}><boxGeometry args={[0.18,0.026,0.040]}/><meshBasicMaterial color="#35264b"/></mesh>
    </group>
    <mesh ref={mouth} position={[0, 0.42, 0.418]}><sphereGeometry args={[0.093, 16, 12]} /><meshStandardMaterial color="#44202b" roughness={0.85} /></mesh>
    <mesh position={[0, 1.03, 0]}><sphereGeometry args={[0.27, 20, 12]} /><meshStandardMaterial color="#35264b" /></mesh>
    {/* V481: articulated 2-segment legs with a fixed ankle-height relation. */}
    {([['left',-0.24],['right',0.24]] as const).map(([side,x])=><group key={side} ref={side==='left'?leftLegV481:rightLegV481} position={[x,-0.81,0]}>
      <mesh position={[0,-0.24,0]}><capsuleGeometry args={[.155,.30,6,9]}/><meshStandardMaterial color="#454064" roughness={.72}/></mesh>
      <group ref={side==='left'?leftKneeV481:rightKneeV481} position={[0,-.48,0]}>
        <mesh position={[0,-.24,0]}><capsuleGeometry args={[.115,.30,6,9]}/><meshStandardMaterial color="#302d4d" roughness={.76}/></mesh>
        <mesh position={[0,-.48,.12]} scale={[1,.45,1.4]}><sphereGeometry args={[.16,12,10]}/><meshStandardMaterial color="#211e36" roughness={.8}/></mesh>
      </group>
    </group>)}
    <mesh ref={leftArm} position={[-0.59, -0.42, 0]} rotation={[0, 0, -0.25]}><capsuleGeometry args={[0.13, 0.55, 4, 8]} /><meshStandardMaterial color="#e7b99d" /></mesh>
    <mesh ref={rightArm} position={[0.59, -0.42, 0]} rotation={[0, 0, 0.25]}><capsuleGeometry args={[0.13, 0.55, 4, 8]} /><meshStandardMaterial color="#e7b99d" /></mesh>
  </group>;
}

function propsGenreKey(genre?: string | null) { return genre?.toLowerCase() ?? "default"; }

function ImportedAnimationAvatar(props: VisualizerProps & { workloadSlot?: number; url: string; assetUrl?: string; animationUrl: string }) {
  const animationGltf = useGLTF(props.animationUrl);
  return <GltfAvatar {...props} importedClips={animationGltf.animations} importedAnimationScene={animationGltf.scene} animationUrl={props.animationUrl} />;
}

function GltfAvatar({ importedClips = [], importedAnimationScene, animationUrl, url, assetUrl, audio, isPlaying, reducedMotion, genre, genreFusion, stagePalette, wardrobeModeV468, wardrobeColorV468, wardrobePatternV468, wardrobeGlowV468, audioMotionEnabledV468, audioMotionStrengthV468, avatarModelId, avatarScale = 1, avatarOffsetY = 0, avatarAnimationIntensity = 1, avatarRigProfile = "auto", preferredMotionUrlV440, avatarDancePreset = "auto", danceAggression = 0.5, danceVariation = 0.5, danceMotionStyle = "balanced", avatarMotionMode = "hybrid", smartDanceEnabled = false, smartDanceOverride = "", avatarClipSpeed = 1, avatarBlendEnabled = false, avatarBlendClip = "", avatarBlendWeight = 0.3, avatarBlendSpeed = 1, avatarBlendAutoEnergy = false, avatarBlendBpmSync = false, avatarBlendReferenceBpm = 120, avatarBlendSmoothing = 0.28, avatarBlendCurve = "smooth", avatarBlendMask = "full", avatarCrossfadeSeconds = 0.35, avatarArmResponse = 1, avatarLegResponse = 1, avatarFootIKEnabled = true, avatarFootIKStrength = 70, avatarFootIKContact = 50, avatarFootIKLock = 50, cameraDirectorSection, cameraDirectorProgressMs, track, autonomousShowPhraseV356, showCue, lipSync: propsLipSyncV367, workloadSlot = 0 }: VisualizerProps & { url: string; assetUrl?: string; importedClips?: AnimationClip[]; importedAnimationScene?: Group; animationUrl?: string; avatarRigProfile?: AvatarRigProfileId; workloadSlot?: number }) {
  const schedulerInstance = useId();
  useEffect(() => () => releaseAvatarFrame(schedulerInstance), [schedulerInstance]);
  useEffect(() => () => releaseScheduledInstance(schedulerInstance), [schedulerInstance]);
  const {preferences: groovePreferences} = useUiPreferences();
  const preferencesRap=useRef(groovePreferences.rapGroove??DEFAULT_RAP_GROOVE);
  preferencesRap.current=groovePreferences.rapGroove??DEFAULT_RAP_GROOVE;
  const partnerLook = usePartnerLook();
  const partnerGesture = usePartnerGesture();
  const partnerHand = usePartnerHand();
  const groupSupportV486=useContext(GroupFootSupportContextV486);
  const groupGroundV487=useContext(GroupGroundObservationContextV487);
  const groundProbeV487=useRef(new Vector3());
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
  const root = useRef<Group>(null);
  const groupLowPoseV481=useContext(GroupLowPoseContextV481);
  const {preferences: timelinePrefs} = useUiPreferences();
  const timelineEnabled = !!timelinePrefs.avatarTimelineEnabled;
  const rapLivePresetV412=useMemo(()=>normalizeRapPresetV412(groovePreferences.rapLivePresetV412),[groovePreferences.rapLivePresetV412]);
  const rapLiveCandidateV412=rapLivePresetV412?.avatarId===avatarModelId&&!timelineEnabled&&workloadSlot===0;
  const timeline = useMemo(() => sanitizeTimeline(timelinePrefs.avatarTimeline), [timelinePrefs.avatarTimeline]);
  const timelineStarted = useRef<number | null>(null);
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
  const reviewCadenceV314=useRef(0);
  const danceSongClockV307 = useRef(createDanceSongClock());
  const ikQualitySampler = useRef(createIKQualitySampler());
  const footContact = useRef(createFootContactState());
  const footIK = useRef(createFootIKState());
  const footLockLastReportV322=useRef(0);
  const balanceStateV323=useRef(createFullBodyBalanceStateV323());
  const balanceReportAtV323=useRef(0);
  const hipHeadingQuaternionV323=useRef(new Quaternion());
  const beatFootworkV234 = useRef(createBeatFootworkState());
  const beatFlow = useRef(createBeatFlowState());
  const beatFlowData = useRef<BeatFlowResult>({ transitionBoost: 0, kickOnset: 0, snareOnset: 0, groove: 0, accent: 0, confidence: 0, style: "steady" });
  const fullBodyDance = useRef(createFullBodyDanceState());
  const naturalMotion = useRef(createNaturalMotionState());
  const naturalDanceDynamics = useRef(createNaturalDanceDynamics());
  const phraseVariationV241 = useRef(createPhraseMotionVariation());
  const phraseMotionState = useRef(createPhraseMotionState());
  const { scene, animations } = useGLTF(assetUrl ?? url);
  // Clone only when the model changes. SkeletonUtils preserves skinned-mesh
  // bone bindings; cloning inside JSX on every React render breaks caching.
  // Geometry and materials remain shared with the GLTF cache (never dispose here).
  const model = useMemo(() => {
    const instance = cloneSkinnedScene(scene);
    instance.traverse(node => {
      if ("castShadow" in node) node.castShadow = false;
      if ("receiveShadow" in node) node.receiveShadow = false;
    });
    return instance;
  }, [scene]);
  // V468: per-instance clothing material clones; never recolor the cached GLTF or skin.
  const wardrobeV468=useMemo(()=>prepareAvatarWardrobeV468(model),[model]);
  useEffect(()=>()=>wardrobeV468.dispose(),[wardrobeV468]);
  const musicMotionV468=useAudioMotionEngine({intensity:(audioMotionStrengthV468??45)/100,protectFootIK:avatarFootIKEnabled});
  useEffect(()=>musicMotionV468.bindBones(model),[model,musicMotionV468.bindBones]);
  useFrame((_,delta)=>{
    const palette=wardrobeModeV468==='custom'?(wardrobeColorV468??'#de38fa'):(stagePalette?.primary??'#628cf9');
    wardrobeV468.apply(wardrobeModeV468==='album'&&!stagePalette?.primary?'off':(wardrobeModeV468??'album'),palette,delta,isPlaying,wardrobePatternV468??'original',wardrobeGlowV468??35);
    const genreCue=resolveGenreMotionV471({genre,fusion:genreFusion,section:showCue?.enabled?showCue.section:(cameraDirectorSection??'verse'),playing:isPlaying,reducedMotion,energy:audio.energyEnvelope,authored:avatarMotionMode==='choreography'});
    // V472: only timed lyric cues, with OPTIONAL authored singer/feature roles.
    // Anonymous features never become invented singer assignments.
    const authoredVocalV472=!!track?.id&&propsLipSyncV367?.manualVocalEnabledV385===true&&
      track.id===propsLipSyncV367.manualVocalTrackIdV385
        ?propsLipSyncV367.manualVocalCueRefV385?.current:null;
    const assignedDuetV472=!authoredVocalV472?.active&&!!track?.id&&
      propsLipSyncV367?.rapDuetEnabledV416===true&&track.id===propsLipSyncV367.rapDuetTrackIdV416
        ?resolveRapDuetCueV416({lyrics:propsLipSyncV367.lyrics,progressMs:propsLipSyncV367.progressMs,
          playing:isPlaying,count:Math.max(1,propsLipSyncV367.ensembleCountV374??1),
          enabled:true,assignments:propsLipSyncV367.rapDuetAssignmentsV416,
          reducedMotion,manualPriority:avatarMotionMode==='choreography'}):null;
    const vocalV472=resolveNaturalRapGestureV474(enhanceRapAccentV473(resolveVocalDanceAccentV472({
      lyrics:propsLipSyncV367?.lyrics,progressMs:propsLipSyncV367?.progressMs,
      playing:isPlaying&&propsLipSyncV367?.playing!==false&&propsLipSyncV367?.enabled!==false,
      reducedMotion,rap:genreCue?.family==='rap',section:showCue?.enabled?showCue.section:cameraDirectorSection,
      slot:workloadSlot,authored:avatarMotionMode==='choreography',
      bodyEnabled:propsLipSyncV367?.bodyEnabledV371,gesturesEnabled:propsLipSyncV367?.gesturesV371,
      strength:(propsLipSyncV367?.bodyStrengthV371??60)/100,
      offsetMs:propsLipSyncV367?.coordinationOffsetMsV372,casting:authoredVocalV472?.active?authoredVocalV472:assignedDuetV472,
    }),{
      lyrics:propsLipSyncV367?.lyrics,progressMs:propsLipSyncV367?.progressMs,
      offsetMs:propsLipSyncV367?.coordinationOffsetMsV372,
      playing:isPlaying&&propsLipSyncV367?.playing!==false&&propsLipSyncV367?.enabled!==false,
      rap:genreCue?.family==='rap',reducedMotion,
      section:showCue?.enabled?showCue.section:cameraDirectorSection,
    }),{trackId:track?.id,slot:workloadSlot,playing:isPlaying,reducedMotion,
       authored:avatarMotionMode==='choreography',section:showCue?.enabled?showCue.section:cameraDirectorSection}).accent;
    musicMotionV468.updateMotion(audio,delta,isPlaying&&!reducedMotion&&(audioMotionEnabledV468??true),genreCue,vocalV472);
  },1);
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
  const installed = useMemo(() => library.motions.filter(m => m.avatarId === avatarModelId).slice(-24), [library, avatarModelId]);
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
  const prefetchedCache=useRef(new Map<string,AnimationClip[]>());
  const prefetchInFlight=useRef(new Set<string>());
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
  useEffect(() => {
    let cancelled = false;
    if (prefetchActive) return;
    setLibraryClips([]);
    if (!installed.length) return;
    // V249: Limit simultaneous GLB decoding/retargeting for non-prefetch libraries.
    // Keep source order deterministic and stop starting work after unmount/model changes.
    // Decoded GLTF scenes are not retained in an allSettled results array.
    const orderedClips: AnimationClip[][] = Array.from({length: installed.length}, () => []);
    let cursor = 0;
    const loadNext = async () => {
      const loader = new GLTFLoader();
      while (!cancelled && cursor < installed.length) {
        const index = cursor++;
        const entry = installed[index];
        try {
          const gltf = await loader.loadAsync(entry.url);
          if (cancelled) return;
          const conversion = retargetHumanoidClips(gltf.animations, gltf.scene, model, readRetargetCalibration(url));
          orderedClips[index] = adaptMotionStyle(conversion.clips, motionStyle, styleRest).map((clip, clipIndex) => {
            const renamed = clip.clone();
            renamed.name = `Library:${entry.id}:${clipIndex}`;
            return renamed;
          });
        } catch {
          // Preserve previous allSettled behavior: skip corrupt or unavailable clips.
        }
      }
    };
    const concurrency = Math.min(installed.length, 2);
    void Promise.all(Array.from({length: concurrency}, () => loadNext())).then(() => {
      if (!cancelled) setLibraryClips(orderedClips.flat());
    });
    return () => {cancelled = true;};
  }, [libraryKey, model, url, calibrationVersion, motionStyle, styleRest, prefetchActive]);
  // V212: fetch only current + future timeline clips, bounded concurrency and LRU-like eviction.
  useEffect(()=>{
    if(!prefetchActive)return;
    let disposed=false;
    const generation=prefetchGeneration.current;
    const pinned=new Set([...prefetchTargets.map(t=>t.id),activeLibraryIdRef.current]);
    const pool=prefetchedCache.current;
    const publish=()=>{
      if(disposed||generation!==prefetchGeneration.current)return;
      const clips=Array.from(pool.values()).flat();
      setLibraryClips(clips);
    };
    const pending=prefetchTargets.filter(t=>!pool.has(t.id)&&!prefetchInFlight.current.has(t.id)&&!prefetchFailures.current.has(t.id));
    let cursor=0;
    const worker=async()=>{
      const loader=new GLTFLoader();
      while(!disposed && cursor<pending.length){
        const target=pending[cursor++];
        if(!target||prefetchInFlight.current.has(target.id))continue;
        prefetchInFlight.current.add(target.id);
        try{
          const gltf=await loader.loadAsync(target.url);
          if(disposed||generation!==prefetchGeneration.current)continue;
          const converted=retargetHumanoidClips(gltf.animations,gltf.scene,model,readRetargetCalibration(url));
          const clips=adaptMotionStyle(converted.clips,motionStyle,styleRest).map((clip,index)=>{
            const named=clip.clone();named.name=`Library:${target.id}:${index}`;return named;
          });
          pool.delete(target.id);pool.set(target.id,clips);
          // Preserve currently selected and upcoming motions when trimming the cache.
          const keep=[...pinned];
          const cap=memorySettings.enabled?resolveMotionMemoryLimit(memorySettings,memoryHardware,keep.length):prefetchSettings.cacheSize;
          const old=memorySettings.enabled?chooseAdaptiveMotionEvictions(Array.from(pool.keys()),keep,cap,memoryLedger.current,memorySettings.favorFrequentlyUsed):choosePrefetchEvictions(Array.from(pool.keys()),keep,cap);
          old.forEach(id=>pool.delete(id));
          memoryLedger.current=pruneMotionLedger(memoryLedger.current,Array.from(pool.keys()));
          publish();
        }catch{
          // Do not retry a missing/corrupt asset on every animation frame.
          if(generation===prefetchGeneration.current)prefetchFailures.current.add(target.id);
        }finally{
          prefetchInFlight.current.delete(target.id);
          // A previous plan may have been superseded while loading. Reschedule once
          // the old request settles so a shared in-flight ID cannot block the new plan.
          if(disposed && generation===prefetchGeneration.current){
            setPrefetchTargets(latest=>latest.some(t=>t.id===target.id)?[...latest]:latest);
          }
        }
      }
    };
    const workers=Array.from({length:Math.min(prefetchSettings.concurrency,pending.length)},()=>worker());
    void Promise.allSettled(workers);
    // Trim old clips also when the planned sequence changes without another fetch.
    const limit=memorySettings.enabled?resolveMotionMemoryLimit(memorySettings,memoryHardware,pinned.size):prefetchSettings.cacheSize;
    const evictions=memorySettings.enabled?chooseAdaptiveMotionEvictions(Array.from(pool.keys()),[...pinned],limit,memoryLedger.current,memorySettings.favorFrequentlyUsed):choosePrefetchEvictions(Array.from(pool.keys()),[...pinned],limit);
    evictions.forEach(id=>pool.delete(id));
    memoryLedger.current=pruneMotionLedger(memoryLedger.current,Array.from(pool.keys()));
    publish();
    return()=>{disposed=true;};
  },[prefetchActive,prefetchTargets,prefetchSettings.cacheSize,prefetchSettings.concurrency,memorySettings,memoryHardware,model,url,motionStyle,styleRest]);
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
  const libraryMotion = useMemo(() => evolutionMotion?.url ?? adaptiveMotion?.url ?? (library.automatic && installed.some(m=>m.url===preferredMotionUrlV440)?preferredMotionUrlV440:undefined) ?? chooseCharacterMotion(library, avatarModelId ?? "", genre ?? "", audio.bpm ?? undefined,
    predictedPhase, undefined),
    [library, avatarModelId, genre, audio.bpm, predictedPhase, adaptiveMotion, evolutionMotion, installed, preferredMotionUrlV440]);
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
  const retargeted = useMemo(() => importedAnimationScene
    ? retargetHumanoidClips(importedClips, importedAnimationScene, model, readRetargetCalibration(url))
    : { clips: importedClips, report: null }, [importedClips, importedAnimationScene, model, url, calibrationVersion]);
  const [qualityRevisionV321,setQualityRevisionV321]=useState(0);
  useEffect(()=>{const refresh=()=>setQualityRevisionV321(v=>v+1);
    window.addEventListener(MOTION_QUALITY_EVENT_V321,refresh);window.addEventListener('storage',refresh);
    return()=>{window.removeEventListener(MOTION_QUALITY_EVENT_V321,refresh);window.removeEventListener('storage',refresh);};
  },[]);
  // V412: Predictive prefetch can omit manually authored preset motions.
  // Load only referenced installed clips, with cancellation on avatar/preset changes.
  const [rapLiveExtraClipsV412,setRapLiveExtraClipsV412]=useState<AnimationClip[]>([]);
  useEffect(()=>{
    let cancelled=false;
    setRapLiveExtraClipsV412([]);
    if(!rapLiveCandidateV412||!prefetchActive||!rapLivePresetV412)return;
    const ids=Array.from(new Set(rapLivePresetV412.items.filter(s=>s.motionId.startsWith('installed:')).map(s=>s.motionId.slice(10))));
    const entries=ids.map(id=>installed.find(m=>m.id===id&&m.avatarId===avatarModelId)).filter((m):m is NonNullable<typeof m>=>!!m);
    if(!entries.length)return;
    let cursor=0;
    const output:AnimationClip[][]=Array.from({length:entries.length},()=>[]);
    const worker=async()=>{const loader=new GLTFLoader();while(!cancelled&&cursor<entries.length){const i=cursor++;try{
      const gltf=await loader.loadAsync(entries[i].url);
      if(cancelled)return;
      const converted=retargetHumanoidClips(gltf.animations,gltf.scene,model,readRetargetCalibration(url));
      output[i]=adaptMotionStyle(converted.clips,motionStyle,styleRest).map((clip,j)=>{const named=clip.clone();named.name=`Library:${entries[i].id}:${j}`;return named;});
    }catch{/* retain fallback and do not break live stage */}}};
    void Promise.all(Array.from({length:Math.min(2,entries.length)},()=>worker())).then(()=>{if(!cancelled)setRapLiveExtraClipsV412(output.flat());});
    return()=>{cancelled=true;};
  },[rapLiveCandidateV412,rapLivePresetV412,prefetchActive,installed,model,url,avatarModelId,motionStyle,styleRest]);
  const clips = useMemo(() => {
    const base=[...animations, ...retargeted.clips.map(clip => {
      const renamed=clip.clone();renamed.name=`Imported: ${clip.name}`;return renamed;
    }), ...libraryClips, ...rapLiveExtraClipsV412];
    const source=Array.from(new Map(base.map(clip=>[clip.name,clip])).values());
    const quality=readMotionQualityV321();
    if(!quality.enabled)return source;
    // Only use cloned clips, never change shared useGLTF cache or installed GLBs.
    return source.map(clip => quality.protectAuthored && !/^(Imported:|Library:)/.test(clip.name)
      ?clip:polishMotionClipV321(clip,quality));
  }, [animations, libraryClips, rapLiveExtraClipsV412, retargeted.clips,qualityRevisionV321]);
  // V492: Browser-local presets do not poll or consume frame time. Read only
  // when the underlying model/source changes or the studio saves/imports.
  const [savedBlendsV492,setSavedBlendsV492]=useState<GlbBlendPresetV492[]>([]);
  useEffect(()=>{
    const refresh=()=>setSavedBlendsV492(readBlendPresetsV492());
    refresh();window.addEventListener(GLB_BLEND_CHANGE_V492,refresh);window.addEventListener('storage',refresh);
    return()=>{window.removeEventListener(GLB_BLEND_CHANGE_V492,refresh);window.removeEventListener('storage',refresh);};
  },[url,animationUrl]);
  // Bind only safe arm/chest rotation channels of a matching, installed GLB.
  // Multiple presets can be saved, but at most 8 auto-enabled clips per model
  // are prepared for the live mixer. None owns root/hips/feet/face/IK.
  const preparedBlendsV492=useMemo(()=>{
    const output:{baseName:string;actionName:string;clip:AnimationClip;weight:number}[]=[];
    const eligible=savedBlendsV492.filter(p=>p.autoEnabled&&p.modelUrl===url&&p.animationUrl===(animationUrl??''));
    for(const preset of eligible){
      if(output.length>=8)break;
      const baseName=preset.base.id.startsWith('external:')?`Imported: ${preset.base.name}`:preset.base.name;
      const match=chooseLiveBlendPresetV492([preset],clips,url,animationUrl??'',baseName,genre);
      if(!match)continue;
      const safe=match.overlay.tracks.filter(t=>isPreviewBlendTrackV491(t.name,preset.region)).map(t=>t.clone());
      if(!safe.length)continue;
      const actionName=`GlbPresetV492:${preset.id}`;
      output.push({baseName,actionName,clip:new AnimationClip(actionName,match.overlay.duration,safe),weight:preset.weight});
    }
    return output;
  },[savedBlendsV492,clips,url,animationUrl,genre]);
  const maskedOverlay = useMemo(() => {
    if (avatarBlendMask === "full" || !avatarBlendClip) return null;
    const source = clips.find(clip => clip.name === avatarBlendClip);
    if (!source) return null;
    return createMaskedAnimationClip(source, avatarBlendMask);
  }, [clips, avatarBlendClip, avatarBlendMask]);
  // V490: select an existing gesture/dance clip with SAFE rotation channels;
  // never duplicate hips/feet/root or vocal face/head channels in the overlay.
  const autoUpperGestureV490 = useMemo(() => {
    const source=chooseUpperGestureClipV490(clips,genre);
    return createAutomaticUpperClipV490(source);
  },[clips,genre]);
  const playbackClips = useMemo(() => [
    ...clips, ...(maskedOverlay?[maskedOverlay]:[]), ...(autoUpperGestureV490?[autoUpperGestureV490]:[]),
    ...preparedBlendsV492.map(p=>p.clip)
  ], [clips, maskedOverlay, autoUpperGestureV490,preparedBlendsV492]);
  const groupClockV328=useContext(GroupMotionClockContextV328);
  const groupPhraseV329=useContext(GroupPhraseContextV329);
  const phraseProfilesV329=useMemo(()=>groupPhraseV329?.settings.enabled?describeAnimationClipsV329(playbackClips,groupPhraseV329.settings.maxCandidates):[],[playbackClips,groupPhraseV329?.settings.enabled,groupPhraseV329?.settings.maxCandidates]);
  useEffect(()=>{if(groupClockV328 && groupPhraseV329?.settings.enabled)groupPhraseV329.register(groupClockV328.clock.current.slot,phraseProfilesV329);},[groupClockV328?.clock,groupPhraseV329?.register,groupPhraseV329?.settings.enabled,phraseProfilesV329]);
  const { actions, names:allActionNamesV490, mixer:groupMixerV328 } = useAnimations(playbackClips, root);
  // Never offer the generated overlay as a standalone selectable/beat-aligned dance.
  const names=useMemo(()=>allActionNamesV490.filter(n=>n!==autoUpperGestureV490?.name&&
    !preparedBlendsV492.some(p=>p.actionName===n)),
    [allActionNamesV490,autoUpperGestureV490?.name,preparedBlendsV492]);
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
  useEffect(() => {
    if (root.current) {
      rigTargets.current = collectAvatarRigNodes(root.current, avatarRigProfile).targets;
      footContact.current = createFootContactState();
      footIK.current = initializeFootIK(root.current, rigTargets.current);
    }
  }, [model, avatarRigProfile]);
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
    avatarRoot.rotation.y += ((motion.bodySway + natural.hipSway * 0.35 + (audio.kickPattern === "syncopated" ? patternAccent * 0.055 : 0)) * performance.danceMultiplier - avatarRoot.rotation.y) * smooth;
    avatarRoot.position.y += (motion.bodyBounce * performance.danceMultiplier - preKick * 0.065 - avatarRoot.position.y) * smooth;

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
    const debugMotion = filterMotionDebugLayers(performanceV323, getRuntimeMotionSettings());
    sampleMotionQuality(motionQualitySampler.current, debugMotion, delta, isPlaying && !reducedMotion);
    measureProfilerPhase("rigging", () => applyAvatarRigMotion(rigTargets.current, debugMotion, delta * (danceMotionStyle === "sharp" ? 1.8 : danceMotionStyle === "smooth" ? 0.55 : 1)));
    applyPartnerLook(rigTargets.current, partnerLook?.current ?? NEUTRAL_LOOK, delta, lastPartnerLook.current);
    applyPartnerGesture(rigTargets.current, partnerGesture?.current ?? NEUTRAL_GESTURE, delta, lastPartnerGesture.current);
    const synchronizedV372=resolveVocalPerformanceQualityV374(
      propsLipSyncV367?.lyrics??null,propsLipSyncV367?.progressMs??0,propsLipSyncV367?.playing??false,{
        enabled:propsLipSyncV367?.coordinationEnabledV372??true,reducedMotion,
        alignment:propsLipSyncV367?.coordinationStrengthV372??70,timingOffsetMs:propsLipSyncV367?.coordinationOffsetMsV372??0,
        qualityEnabledV374:propsLipSyncV367?.qualityEnabledV374??true,mouthSmoothnessV374:propsLipSyncV367?.mouthSmoothnessV374??65,rapGestureCalmV374:propsLipSyncV367?.rapGestureCalmV374??70,rapLipEnabledV415:propsLipSyncV367?.rapLipEnabledV415??false,rapLipPrecisionV415:propsLipSyncV367?.rapLipPrecisionV415??70,rapSyllableEnabledV419:propsLipSyncV367?.rapSyllableEnabledV419??false,rapSyllableStrengthV419:propsLipSyncV367?.rapSyllableStrengthV419??65,rapSyllableSmoothnessV419:propsLipSyncV367?.rapSyllableSmoothnessV419??70,rapSyllableEditsEnabledV420:propsLipSyncV367?.rapSyllableEditsEnabledV420??false,rapSyllableTrackIdV420:propsLipSyncV367?.rapSyllableTrackIdV420??"",rapSyllableDocumentV420:propsLipSyncV367?.rapSyllableDocumentV420??null,rapAudioEnabledV423:propsLipSyncV367?.rapAudioEnabledV423??false,rapAudioStrengthV423:propsLipSyncV367?.rapAudioStrengthV423??45,rapAudioOffsetMsV423:propsLipSyncV367?.rapAudioOffsetMsV423??0,rapAudioTrackIdV423:propsLipSyncV367?.rapAudioTrackIdV423??"",rapAudioDocumentV423:propsLipSyncV367?.rapAudioDocumentV423??null,rapLipOffsetMsV415:propsLipSyncV367?.rapLipOffsetMsV415??0,naturalArticulationEnabledV384:propsLipSyncV367?.naturalArticulationEnabledV384??true,articulationStrengthV384:propsLipSyncV367?.articulationStrengthV384??70,lipSealV384:propsLipSyncV367?.lipSealV384??90,jawStabilityV384:propsLipSyncV367?.jawStabilityV384??65,ensembleModeV374:propsLipSyncV367?.ensembleModeV374??"lead",ensembleCountV374:propsLipSyncV367?.ensembleCountV374??1,manualSingingSlotsV385:propsLipSyncV367?.manualVocalCueRefV385?.current?.active?propsLipSyncV367.manualVocalCueRefV385.current.singingSlots:undefined,stageLeaderV375:propsLipSyncV367?.interactionCueRefV376?.current?.enabled?propsLipSyncV367.interactionCueRefV376.current.leadSlot:propsLipSyncV367?.performanceCueRefV375?.current?.enabled?propsLipSyncV367.performanceCueRefV375.current.leadSlot:undefined,
        mode:propsLipSyncV367?.mode,style:propsLipSyncV367?.style,genre,mids:audio.mids,
        expression:(propsLipSyncV367?.expression??55)/100,
        lipStrength:propsLipSyncV367?.enabled?propsLipSyncV367.strength:0,
        jawFollow:propsLipSyncV367?.jawFollowV369??65,
        bodyEnabled:propsLipSyncV367?.bodyEnabledV371??true,
        bodyStrength:propsLipSyncV367?.bodyStrengthV371??60,
        eyeContact:propsLipSyncV367?.eyeContactV371??true,
        gestures:propsLipSyncV367?.gesturesV371??true,
        avatarSlot:workloadSlot,authoredPriority:avatarMotionMode==="choreography" || !!stableLibraryClip,
        partnerAttention:Math.min(1,(partnerGesture?.current.intensity??0)+Math.abs(partnerLook?.current.yaw??0)*2+(partnerHand?.current.enabled ? .3 : 0)),
      });
    const duetBodyV376=overlayDuetV376(synchronizedV372.body,propsLipSyncV367?.interactionCueRefV376?.current,
      workloadSlot,isPlaying&&!reducedMotion&&propsLipSyncV367?.bodyEnabledV371!==false,propsLipSyncV367?.gesturesV371!==false,
      propsLipSyncV367?.eyeContactV371!==false,avatarMotionMode==="choreography"||!!stableLibraryClip);
    const expressiveBodyV386=overlayConcertExpressionV386(duetBodyV376,propsLipSyncV367?.concertCueRefV386?.current,
      workloadSlot,{gestures:propsLipSyncV367?.gesturesV371!==false,eyeContact:propsLipSyncV367?.eyeContactV371!==false,
      authoredPriority:avatarMotionMode==="choreography"||!!stableLibraryClip});
    const expressiveBodyV393=composeVocalBodyV393(expressiveBodyV386,synchronizedV372,
      {mode:propsLipSyncV367?.performanceModeV393,strength:propsLipSyncV367?.performanceStrengthV393},
      {playing:isPlaying,reducedMotion,authoredPriority:avatarMotionMode==="choreography"||!!stableLibraryClip,
       bodyEnabled:propsLipSyncV367?.bodyEnabledV371!==false&&propsLipSyncV367?.enabled!==false,gestures:propsLipSyncV367?.gesturesV371,
       eyeContact:propsLipSyncV367?.eyeContactV371,section:showCue?.enabled?showCue.section:null,slot:workloadSlot});
    const rapBodyV406=composeRapStageV406(expressiveBodyV393,synchronizedV372,
      {playing:isPlaying,reducedMotion,enabled:propsLipSyncV367?.enabled!==false&&propsLipSyncV367?.coordinationEnabledV372!==false,
       energy:audio.mids,strength:propsLipSyncV367?.expression,slot:workloadSlot,
       authoredPriority:avatarMotionMode==="choreography"||!!stableLibraryClip,
       bodyEnabled:propsLipSyncV367?.bodyEnabledV371!==false,gestures:propsLipSyncV367?.gesturesV371,
       eyeContact:propsLipSyncV367?.eyeContactV371});
    const rapLiveEditorV412=normalizeRapEditorV408(groovePreferences.rapPerformanceEditorV408);
    const rapBodyV407=composeRapRhythmStageV407(rapBodyV406,synchronizedV372,audio,{
      playing:isPlaying,reducedMotion,enabled:propsLipSyncV367?.enabled!==false&&propsLipSyncV367?.coordinationEnabledV372!==false,
      energy:audio.mids,strength:propsLipSyncV367?.expression,slot:workloadSlot,
      authoredPriority:rapLiveEnabledV412?false:(avatarMotionMode==="choreography"||!!stableLibraryClip),
      bodyEnabled:propsLipSyncV367?.bodyEnabledV371!==false,gestures:propsLipSyncV367?.gesturesV371,
      section:rapLiveEnabledV412?rapLiveFrameV412.current.section:(showCue?.enabled?showCue.section:performance.section),
      rhythmEnabled:preferencesRap.current.enabled,
      headGain:preferencesRap.current.head,shoulderGain:preferencesRap.current.shoulders,
      snareGain:preferencesRap.current.snare,editorV408:rapLiveEnabledV412?{...rapLiveEditorV412,enabled:true,
        head:Math.min(150,(rapLiveEditorV412.enabled?rapLiveEditorV412.head:100)*(rapLiveFrameV412.current.active.length?rapLiveFrameV412.current.active.reduce((n,s)=>n+s.weight*s.rapGain,0):100)/100*rapLyricsFrameV414.current.head),
        gestures:Math.min(150,(rapLiveEditorV412.enabled?rapLiveEditorV412.gestures:100)*(rapLiveFrameV412.current.active.length?rapLiveFrameV412.current.active.reduce((n,s)=>n+s.weight*s.rapGain,0):100)/100*rapLyricsFrameV414.current.arms),
      }:groovePreferences.rapPerformanceEditorV408,
    });
    const confirmedSingerV453=propsLipSyncV367?.manualVocalCueRefV385?.current;
    const lipHeadV453=enhanceExpressiveLipV453(propsLipSyncV367?.lyrics??null,synchronizedV372,{
      playing:isPlaying,enabled:propsLipSyncV367?.enabled!==false,reducedMotion,
      manualSilent:!!confirmedSingerV453?.active&&!confirmedSingerV453.singingSlots.includes(workloadSlot),
      editedWords:propsLipSyncV367?.rapSyllableEditsEnabledV420&&propsLipSyncV367.rapSyllableDocumentV420!=null&&propsLipSyncV367.rapSyllableTrackIdV420===propsLipSyncV367.rapSyllableDocumentV420.trackId
        ?propsLipSyncV367.rapSyllableDocumentV420.edits:undefined,
      intensity:propsLipSyncV367?.strength??90,
      preserveAudioMouth:!!propsLipSyncV367?.rapAudioEnabledV423&&!!propsLipSyncV367.rapAudioDocumentV423&&
        propsLipSyncV367.rapAudioTrackIdV423===propsLipSyncV367.rapAudioDocumentV423.trackId,
      authoredBody:avatarMotionMode==="choreography"||!!stableLibraryClip,
    });
    const lipHeadV459=refineAdvancedVocalV459(propsLipSyncV367?.lyrics??null,lipHeadV453,synchronizedV372,{
      playing:isPlaying,enabled:propsLipSyncV367?.enabled!==false,reducedMotion,
      manualSilent:!!confirmedSingerV453?.active&&!confirmedSingerV453.singingSlots.includes(workloadSlot),
      editedWords:propsLipSyncV367?.rapSyllableEditsEnabledV420&&propsLipSyncV367.rapSyllableDocumentV420!=null&&propsLipSyncV367.rapSyllableTrackIdV420===propsLipSyncV367.rapSyllableDocumentV420.trackId
        ?propsLipSyncV367.rapSyllableDocumentV420.edits:undefined,
      intensity:propsLipSyncV367?.strength??90,
      preserveAudioMouth:!!propsLipSyncV367?.rapAudioEnabledV423&&!!propsLipSyncV367.rapAudioDocumentV423&&
        propsLipSyncV367.rapAudioTrackIdV423===propsLipSyncV367.rapAudioDocumentV423.trackId,
      authoredBody:avatarMotionMode==="choreography"||!!stableLibraryClip,
    });
    applyVocalStageOverlayV371(rigTargets.current,
      addAdvancedVocalHeadV459(addExpressiveHeadV453(rapBodyV407,lipHeadV453),lipHeadV459),
      delta,vocalStageOverlayV371.current);

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
    // Run after clip + additive rig motion, with an optional low-cost fallback.
    const footCueV234 = updateBeatFootwork(beatFootworkV234.current, {
      beat: audio.beat, beatStrength: audio.beatStrength, kick: audio.kickAccentIntensity,
      bpm: audio.bpm ?? undefined, genre, playing: isPlaying, reducedMotion, delta,
    });
    const enableIK = avatarFootIKEnabled && isPlaying && !reducedMotion;
    const activeIK = measureProfilerPhase("footIK", () => updateFootIK(footIK.current, avatarRoot, delta, enableIK, avatarFootIKStrength / 100, Math.min(1, avatarFootIKContact / 100 + footCueV234.contactBoost), Math.min(1, avatarFootIKLock / 100 + footCueV234.lockBoost), ikConstraints.current, footCueV234, readFootLockV322(), {trackId:track?.id??"",playheadMs:cameraDirectorProgressMs}));
    if(activeIK&&readFootLockV322().enabled&&state.clock.elapsedTime-footLockLastReportV322.current>=1&&typeof window!=='undefined'){
      footLockLastReportV322.current=state.clock.elapsedTime;
      window.dispatchEvent(new CustomEvent(FOOT_LOCK_DIAGNOSTIC_EVENT_V322,{detail:groundLockReportV322(footIK.current.groundV322)}));
    }
    if (!activeIK) updateFootContact(footContact.current, avatarRoot, rigTargets.current, delta, enableIK, avatarFootIKStrength / 100);
    // V486: publish only the existing measured IK stance to the parent group.
    // No new sensor, animation solver or React state update per frame.
    if(groupSupportV486){
      groupSupportV486.current.tracked=activeIK;
      groupSupportV486.current.leftPlanted=activeIK&&footIK.current.left?.contact.phase==='planted';
      groupSupportV486.current.rightPlanted=activeIK&&footIK.current.right?.contact.phase==='planted';
    }
    // V487: observe the existing world-space IK anchor only. Model-relative
    // drift is sampled from real planted ankle positions; no new bone solver.
    if(groupGroundV487){
      const record=groupGroundV487.current;
      record.tracked=enableIK&&activeIK;
      const observe=(leg:typeof footIK.current.left)=>{
        if(!enableIK||!activeIK||!leg||leg.contact.phase!=='planted')return {planted:false,confidence:0,drift:0};
        const confidence=Math.max(0,Math.min(1,leg.contact.confidence));
        const ankle=leg.ankle.getWorldPosition(groundProbeV487.current);
        const relativeScale=Math.max(.1,leg.upperLength+leg.lowerLength);
        const drift=Math.min(99,Math.hypot(ankle.x-leg.contact.plantedX,ankle.z-leg.contact.plantedZ)*90/relativeScale);
        return {planted:true,confidence,drift:Number.isFinite(drift)?drift:0};
      };
      const left=observe(footIK.current.left),right=observe(footIK.current.right);
      record.leftPlanted=left.planted;record.rightPlanted=right.planted;
      record.leftConfidence=left.confidence;record.rightConfidence=right.confidence;
      record.leftDriftCm=left.drift;record.rightDriftCm=right.drift;
    }
    sampleIKQuality(ikQualitySampler.current, {dancer:avatarModelId ?? url, dt:delta, active:isPlaying && !reducedMotion, foot:footIK.current, rig:{upper:arm.rightArm,lower:arm.rightForearm,hand:arm.rightHand}, handState:handIK.current, cue:activeHandCue});
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
  const selectedClip=lowClipV481 && actions[lowClipV481] && isPlaying&&!reducedMotion ? lowClipV481 : clipChoiceV328 && actions[clipChoiceV328] ? clipChoiceV328 : phraseChoiceV329 && actions[phraseChoiceV329]?phraseChoiceV329:autoMotionV356 && actions[autoMotionV356]?autoMotionV356:selectedClipLegacy;
  // V492: a saved combination activates only when its original *base* is
  // already the chosen live clip. Never hijack a manual selection / timeline.
  const liveBlendV492=preparedBlendsV492.find(p=>p.baseName===selectedClip)??null;
  const liveBlendAllowedV492=!!liveBlendV492&&isPlaying&&!reducedMotion&&!timelineEnabled&&
    !activeSequence&&!activeLoop&&!avatarBlendEnabled&&!rapLiveEnabledV412&&
    avatarMotionMode!=='choreography'&&!stableLibraryClip&&!smartDanceOverride&&
    !groupClockV328?.settings.enabled&&!groupPhraseV329?.settings.enabled&&
    getActivePerformanceTier()!=='low';
  const activeLiveBlendV492=liveBlendAllowedV492?liveBlendV492:null;

  const previousClipRef = useRef<string | null>(null);
  const previousWasLowClipV489 = useRef(false);
  useEffect(() => {
    if (activeSequence || rapLiveEnabledV412 || (timelineEnabled && timeline.segments.length)) return;
    const nextAction = selectedClip ? actions[selectedClip] : undefined;
    const previousName = previousClipRef.current;
    const previousAction = previousName ? actions[previousName] : undefined;
    const grounded = footIK.current.left?.contact.phase === "planted" || footIK.current.right?.contact.phase === "planted";
    const plan = planDanceTransition({
      baseSeconds: resolveLiveTransitionDuration(sequenceCrossfade ?? liveTransition.duration, avatarCrossfadeSeconds, !!stableLibraryClip && !!previousName?.startsWith("Library:")) * (1 - beatFlowData.current.transitionBoost * 0.22), bpm: audio.bpm, genre,
      outgoingTime: previousAction?.time, outgoingDuration: previousAction?.getClip().duration,
      incomingDuration: nextAction?.getClip().duration, sameClip: previousName === selectedClip,
      grounded,
    });
    let effectiveFadeDurationV311 = plan.duration;
    if (nextAction && previousName !== selectedClip) {
      nextAction.reset();
      // V232: match a compatible pose and motion direction on live clip switches.
      // Keep the existing beat-aligned transition plan; this changes only the incoming clip seek.
      const outgoingClip = previousAction?.getClip();
      const incomingClip = nextAction.getClip();
      const match = outgoingClip && incomingClip && Number.isFinite(previousAction?.time)
        ? findMotionMatch(outgoingClip, incomingClip, previousAction!.time, 12)
        : null;
      const usableMatch = match && match.comparedTracks > 0 && Number.isFinite(match.score)
        && match.score < 1.5 && Number.isFinite(match.time);
      // V489: only automatic low-pose entry/exit may refine clip alignment and
      // blend time. A high-confidence planted foot extends the crossfade but
      // never resets the existing IK contact anchors.
      const enteringLowV489 = !!lowClipV481 && selectedClip === lowClipV481 && !previousWasLowClipV489.current;
      const leavingLowV489 = previousWasLowClipV489.current && selectedClip !== lowClipV481;
      const switchingLowV489 = previousWasLowClipV489.current && !!lowClipV481 && selectedClip === lowClipV481;
      const lowMotionV489 = planNaturalGlbMotionV489({
        enteringLow:enteringLowV489,leavingLow:leavingLowV489,switchingLow:switchingLowV489,
        baseFadeSeconds:plan.duration,incomingDuration:incomingClip.duration,
        plantedLeft:footIK.current.left?.contact.phase==='planted',
        plantedRight:footIK.current.right?.contact.phase==='planted',
        manualPriority:avatarMotionMode==='choreography'||!!stableLibraryClip||!!smartDanceOverride||
          !!activeSequence||!!activeLoop||timelineEnabled||avatarBlendEnabled||rapLiveEnabledV412,
        playing:isPlaying,reducedMotion,quality:getActivePerformanceTier(),
        matchScore:usableMatch?match?.score:null,matchTime:usableMatch?match?.time:null,
      });
      if (usableMatch && (!lowMotionV489.active || lowMotionV489.allowPoseMatch))
        nextAction.time = Math.max(0, Math.min(match.time, Math.max(0, incomingClip.duration - 0.001)));
      else if (plan.preservePhase && (!lowMotionV489.active || lowMotionV489.allowPhaseFallback))
        nextAction.time = matchedClipTime(plan, incomingClip.duration);
      const fadeDurationV311 = polishAutomaticCrossfadeV311(plan, {
        settings:readDancePerformanceV311(), bpm:audio.bpm, genre, planted:grounded,
        manual:avatarMotionMode==="choreography" || !!stableLibraryClip, reducedMotion, playing:isPlaying,
        matchScore:usableMatch ? match?.score : undefined,
      });
      effectiveFadeDurationV311 = lowMotionV489.active ? lowMotionV489.fadeSeconds : fadeDurationV311;
      nextAction.paused = !isPlaying || reducedMotion;
      nextAction.fadeIn(effectiveFadeDurationV311).play();
      // A valid foot plant remains anchored by V135 IK while both actions overlap.
      // Never reset foot-contact trackers as part of a clip transition.
    } else if (nextAction) {
      nextAction.paused = !isPlaying || reducedMotion;
    }
    Object.entries(actions).forEach(([name, action]) => {
      if (name !== selectedClip && name !== autoUpperGestureV490?.name &&
          name !== activeLiveBlendV492?.actionName && !(avatarBlendEnabled && name === (maskedOverlay?.name ?? avatarBlendClip))) action?.fadeOut(effectiveFadeDurationV311);
    });
    previousClipRef.current = selectedClip ?? null;
    previousWasLowClipV489.current = !!lowClipV481 && selectedClip === lowClipV481;
  }, [actions, selectedClip, avatarCrossfadeSeconds, audio.bpm, genre, isPlaying, reducedMotion, activeSequence, timelineEnabled, timeline.segments.length, rapLiveEnabledV412, avatarBlendEnabled, avatarBlendClip, maskedOverlay, liveTransition, stableLibraryClip, sequenceCrossfade, lowClipV481, smartDanceOverride, avatarMotionMode, activeLoop, autoUpperGestureV490?.name, activeLiveBlendV492?.actionName]);
  // V129: read the still-running outgoing LOD before falling back to the
  // unmount snapshot. Publish per-frame clip state for seamless handoff.
  const liveOwner = useRef(`lod-${Math.random().toString(36).slice(2)}`);
  const liveSynced = useRef(false);
  useFrame((_, delta) => {
    if (!liveSynced.current) {
      const incoming = readLiveLodPlayback(url, liveOwner.current, window.performance.now() / 1000);
      if (incoming) {
        for (const [name, saved] of Object.entries(incoming.clips)) {
          const action = actions[name];
          if (!action) continue;
          action.time = safeClipTime(saved.time + (saved.paused ? 0 : Math.min(0.1, Math.max(0, window.performance.now() / 1000 - incoming.savedAt)) * saved.timeScale), action.getClip().duration);
          action.timeScale = saved.timeScale;
          action.setEffectiveWeight(saved.weight);
          if (saved.running && !action.isRunning()) action.play();
          action.paused = saved.paused;
        }
        if (incoming.timelineElapsed !== null) timelineStarted.current = clockElapsed.current - incoming.timelineElapsed;
        liveSynced.current = true;
      }
    }
    const clipStates: Record<string, {time:number;weight:number;running:boolean;paused:boolean;timeScale:number}> = {};
    for (const [name, action] of Object.entries(actions)) {
      if (action) clipStates[name] = {time:action.time, weight:action.getEffectiveWeight(), running:action.isRunning(), paused:action.paused, timeScale:action.timeScale};
    }
    // First instance owns publication. A successor takes over only after the
    // predecessor unmounts, to avoid the fade-in instance overwriting the source.
    const existing = readLiveLodPlayback(url, liveOwner.current, window.performance.now() / 1000);
    if (!existing) publishLiveLodPlayback(url, liveOwner.current, {savedAt:window.performance.now()/1000, timelineElapsed:timelineStarted.current===null?null:Math.max(0,clockElapsed.current-timelineStarted.current), clips:clipStates});
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
    if (!active) { timelineStarted.current = null; if(timelineWasActive.current){timelineWasActive.current=false;Object.values(actions).forEach(a=>a?.stop());} return; }
    timelineWasActive.current=true;
    if (timelineStarted.current===null) timelineStarted.current=state.clock.elapsedTime;
    // Legacy V105 timelines keep their local clock; V319 opt-in timelines use
    // absolute Spotify playback seconds so seeks and track-specific markers stay aligned.
    const elapsed=timeline.songSync===true ? songSeconds! : state.clock.elapsedTime-timelineStarted.current;
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
  // V99: isolated bone-track overlay, suspended while a choreography owns the mixer.
  const overlayClipName = maskedOverlay?.name ?? avatarBlendClip;
  const overlayName = !timelineEnabled && avatarBlendEnabled && isPlaying && !reducedMotion && !activeSequence &&
    avatarMotionMode !== "reactive" && avatarBlendClip !== selectedClip && actions[overlayClipName]
    ? overlayClipName : null;
  useEffect(() => {
    const overlay = overlayName ? actions[overlayName] : undefined;
    if (!overlay) return;
    const fade = Math.max(0.1, Math.min(1.5, avatarCrossfadeSeconds));
    overlay.reset().setEffectiveWeight(0).fadeIn(fade).play();
    return () => { overlay.fadeOut(fade); };
  }, [actions, overlayName, avatarCrossfadeSeconds]);
  const liveBlendWeight = useRef(0);
  useFrame((_, delta) => {
    if (!overlayName) { liveBlendWeight.current = 0; return; }
    const overlay = actions[overlayName];
    const primary = selectedClip ? actions[selectedClip] : undefined;
    if (!overlay || !primary) return;
    const target = targetBlendWeight(avatarBlendWeight, audio.energyEnvelope, avatarBlendAutoEnergy, avatarBlendCurve);
    liveBlendWeight.current = smoothBlend(liveBlendWeight.current, target, delta, avatarBlendSmoothing);
    const weight = liveBlendWeight.current;
    // Weights sum to 1 to avoid doubling rotations of shared tracks.
    overlay.setEffectiveWeight(weight);
    primary.setEffectiveWeight(maskedOverlay ? 1 : 1 - weight);
    overlay.timeScale = syncedClipSpeed(avatarBlendSpeed, audio.bpm, avatarBlendReferenceBpm, avatarBlendBpmSync);
  });
  // V490: automatic arm/chest-only gesture overlay while a genuine installed GLB
  // low-pose clip owns the legs. All authored mixer modes and manual blending win.
  const autoUpperNameV490=autoUpperGestureV490?.name;
  const autoUpperEligibleV490=!!autoUpperNameV490 && !!lowClipV481 && selectedClip===lowClipV481 &&
    isPlaying&&!reducedMotion&&!timelineEnabled&&!activeSequence&&!activeLoop&&
    !avatarBlendEnabled&&!rapLiveEnabledV412&&avatarMotionMode!=='choreography'&&
    !stableLibraryClip&&!smartDanceOverride&&!groupClockV328?.settings.enabled&&
    !groupPhraseV329?.settings.enabled&&!activeLiveBlendV492;
  const activeAutoUpperV490=autoUpperEligibleV490?autoUpperNameV490:null;
  useEffect(()=>{
    const overlay=activeAutoUpperV490?actions[activeAutoUpperV490]:undefined;
    if(!overlay)return;
    overlay.reset().stopFading().setEffectiveWeight(0).play();
    return ()=>{overlay.stop();};
  },[actions,activeAutoUpperV490]);
  const autoUpperWeightV490=useRef(0);
  useFrame((_,delta)=>{
    const overlay=activeAutoUpperV490?actions[activeAutoUpperV490]:undefined;
    if(!overlay){autoUpperWeightV490.current=0;return;}
    const desired=planUpperBlendV490({
      playing:isPlaying,reducedMotion,manualPriority:!autoUpperEligibleV490,
      activeLowPose:!!lowClipV481&&selectedClip===lowClipV481,
      quality:getActivePerformanceTier(),energy:audio.energyEnvelope,genre,
      section:showCue?.enabled?showCue.section:null,
      plantedLeft:footIK.current.left?.contact.phase==='planted',
      plantedRight:footIK.current.right?.contact.phase==='planted',
    });
    // No React state per frame. The underlying low-clip keeps full strength;
    // Three's mixer blends shared upper channels while lower joints stay untouched.
    const response=Math.min(1,Math.max(0,delta)*5);
    autoUpperWeightV490.current += (desired-autoUpperWeightV490.current)*response;
    overlay.setEffectiveWeight(autoUpperWeightV490.current);
  });
  // V492: explicit saved preset uses the SAME mixer as V489/V490. The source
  // clip is cloned/masked at setup time; no additional useFrame state updates.
  useEffect(()=>{
    const action=activeLiveBlendV492?actions[activeLiveBlendV492.actionName]:undefined;
    if(!action)return;
    action.reset().stopFading().setEffectiveWeight(0).play();
    return()=>{action.stop();};
  },[actions,activeLiveBlendV492?.actionName]);
  const livePresetWeightV492=useRef(0);
  useFrame((_,delta)=>{
    const p=activeLiveBlendV492;
    const action=p?actions[p.actionName]:undefined;
    if(!p||!action){livePresetWeightV492.current=0;return;}
    const left=footIK.current.left?.contact.phase==='planted';
    const right=footIK.current.right?.contact.phase==='planted';
    const support=left&&right?.82:left||right?.92:1;
    const target=Math.max(0,Math.min(.5,p.weight*support));
    livePresetWeightV492.current+=(target-livePresetWeightV492.current)*Math.min(1,Math.max(0,delta)*5);
    action.setEffectiveWeight(livePresetWeightV492.current);
  });
  useEffect(() => {
    if (overlayName) return;
    const primary = selectedClip ? actions[selectedClip] : undefined;
    if (primary && !activeSequence && !timelineEnabled) primary.setEffectiveWeight(1);
  }, [actions, overlayName, selectedClip, activeSequence]);
  useEffect(() => {
    const speed = Math.max(0.25, Math.min(2, activeLoop?.speed ?? avatarClipSpeed));
    Object.values(actions).forEach(action => { if (action) action.timeScale = speed; });
  }, [actions, avatarClipSpeed, activeLoop]);
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
  return <group ref={root} scale={avatarScale} position={[0, avatarOffsetY, 0]}><primitive object={model} /><VocalRigV368 model={model} lipSync={propsLipSyncV367} audio={audio} genre={genre} reducedMotion={reducedMotion} avatarSlot={workloadSlot} profileV370={propsLipSyncV367?.profilesV370?.[avatarModelId??""]}/><AvatarSmartLOD model={model} /></group>;
}

/** Each dancer receives its own animation mixer and cloned GLB scene. */
function Dancer({ props, secondary = false, slot }: { props: VisualizerProps; secondary?: boolean; slot?: number }) {
  const {preferences: dancerTimelinePreferences}=useUiPreferences();
  const modelUrl = secondary ? props.secondaryAvatarModelUrl : props.avatarModelUrl;
  const requestedAnimationUrl = secondary ? props.secondaryAvatarAnimationUrl : props.avatarAnimationUrl;
  const library = loadCharacterMotionStore();
  // The current imported animation remains a fallback while library clips preload.
  // Avoid remounts across automatic library switches.
  const animationUrl = library.automatic ? undefined : requestedAnimationUrl;
  // V313: scale only procedural/reactive dance accents; preserve the authored GLB clip and IK.
  const concertGainV387=props.isPlaying&&!props.reducedMotion&&props.avatarMotionMode!=="choreography"&&
    !dancerTimelinePreferences.avatarTimelineEnabled ? (props.concertShowCueV387?.danceGain??1) : 1;
  const narrativeGain=(props.isPlaying && !props.reducedMotion ? (props.showCue?.evolution?.dancerScale??1) : 1)*concertGainV387;
  const baseProps:VisualizerProps=narrativeGain===1?props:{...props,danceAggression:Math.min(1,Math.max(0,(props.danceAggression??.5)*narrativeGain))};
  const ensembleCountV374=baseProps.lipSync?.ensembleCountV374??((baseProps.multiAvatarMode??"solo")!=="solo"?2:1);
  const pacedProps:VisualizerProps=baseProps.lipSync?{...baseProps,lipSync:{...baseProps.lipSync,ensembleCountV374}}:baseProps;
  const dancerProps: VisualizerProps & { workloadSlot?: number } = secondary ? {
    ...pacedProps,
    avatarModelUrl: modelUrl,
    avatarAnimationUrl: animationUrl,
    preferredMotionUrlV440:props.secondaryPreferredMotionUrlV440,
    avatarModelId: props.secondaryAvatarModelId ?? props.avatarModelId,
    workloadSlot: slot ?? (secondary ? 1 : 0),
    avatarDancePreset: props.multiAvatarMode === "duet" ? (props.secondaryDancePreset ?? "freestyle") : props.avatarDancePreset,
    // Duet has a modestly different reactive response; sync/mirror retain the same dance input.
    danceVariation: props.multiAvatarMode === "duet" ? Math.min(1, (props.danceVariation ?? 0.5) + 0.25) : props.danceVariation,
  } : slot === undefined ? pacedProps : {...pacedProps,workloadSlot:slot};
  return modelUrl
    ? <AutomaticLODAssetLoader sourceUrl={modelUrl}>{assetUrl => <Suspense fallback={<ProceduralAvatar {...dancerProps} />}>
        {animationUrl
          ? <ImportedAnimationAvatar key={assetUrl} {...dancerProps} url={modelUrl} assetUrl={assetUrl} animationUrl={animationUrl} />
          : <GltfAvatar key={assetUrl} {...dancerProps} url={modelUrl} assetUrl={assetUrl} />}
      </Suspense>}</AutomaticLODAssetLoader>
    : <ProceduralAvatar {...dancerProps} />;
}

function DuoDirectorTick({props, onScene}: {props: VisualizerProps; onScene: (scene: DuoScene) => void}) {
  const director = useRef(createDuoDirectorState());
  const prior = useRef<DuoScene>("solo");
  useFrame((_state, delta) => {
    const next = advanceDuoDirector(director.current, props.audio, delta, props.genre, props.isPlaying, props.reducedMotion);
    if (next !== prior.current) { prior.current = next; onScene(next); }
  });
  useEffect(() => { director.current = createDuoDirectorState(); prior.current = "solo"; onScene("solo"); }, [props.track?.id, onScene]);
  return null;
}

/** V206: one shared musical director, no independent timers per avatar. */
function MultiAvatarDirectorTick({props, settings, onCue}: {props:VisualizerProps;settings:MultiAvatarSettings;onCue:(cue:MultiAvatarCue)=>void}) {
  const clock = useRef(initialMultiAvatarState());
  const interaction = useRef(initialInteractionState());
  // Compare scene/role/phrase as primitives instead of building a string every frame.
  const last = useRef<Pick<MultiAvatarCue, "scene" | "role" | "phrase"> | null>(null);
  const lastDrop = useRef(false);
  useEffect(()=>{clock.current=initialMultiAvatarState();interaction.current=initialInteractionState();last.current=null;},[props.track?.id]);
  useFrame((_state,delta)=>{
    const base=advanceMultiAvatarChoreography(clock.current,settings,props.audio,delta,props.isPlaying,props.reducedMotion);
    const cue=advanceInteraction(interaction.current,props.audio,delta,props.genre,props.isPlaying,props.reducedMotion,base,settings);
    const previous = last.current;
    if (!previous || cue.scene !== previous.scene || cue.role !== previous.role || cue.phrase !== previous.phrase || cue.dropAccent !== lastDrop.current) {
      last.current = {scene: cue.scene, role: cue.role, phrase: cue.phrase};
      lastDrop.current = cue.dropAccent;
      onCue(cue);
    }
  });
  return null;
}

/** V312: one playback-clock-driven director shared by both skinned dancers. */
function IntelligentChoreographyTickV312({props,settings,onCue}:{props:VisualizerProps;settings:ChoreographySettingsV312;onCue:(cue:ChoreographyCueV312|null)=>void}){
  const director=useRef(initialChoreographyV312());
  const latest=useRef("");
  useEffect(()=>{director.current=initialChoreographyV312();latest.current="";onCue(null);},[props.track?.id,settings,onCue]);
  useFrame(()=>{
    if(!props.showCue)return;
    director.current=advanceChoreographyV312(director.current,{
      trackId:props.track?.id??"",progressMs:props.cameraDirectorProgressMs??0,playing:props.isPlaying,
      reducedMotion:props.reducedMotion,bpm:props.audio.bpm,genre:props.genre,showCue:props.showCue,settings
    });
    const cue=director.current.cue;
    // One React update per musical change, never one update per animation frame.
    const signature=cue?`${cue.scene}|${cue.role}|${cue.phrase}|${cue.formation}|${cue.partnerDelayBeats}|${cue.dropAccent}|${cue.interactionMode}|${cue.interactionStrength}`:"";
    if(signature!==latest.current){latest.current=signature;onCue(cue);}
  });
  return null;
}

/** V142: groups persist across scene changes so animator state and foot anchors survive. */
function FormationDancers({props, mode, choreography}: {props: VisualizerProps; mode: DuoScene; choreography?: MultiAvatarCue | null}) {
  const lead = useRef<Group>(null);
  const partner = useRef<Group>(null);
  const ensembleStateV392 = useRef(initialEnsembleV392());
  const ensembleCueV392 = useRef<EnsembleCueV392 | null>(null);
  const performanceCueRefV375=useRef<ReturnType<typeof resolveAdaptiveVocalPerformanceV375>|null>(null);
  const interactionCueRefV376=useRef<ReturnType<typeof resolveDuetInteractionV376>|null>(null);
  const concertCueRefV386=useRef<ReturnType<typeof resolveConcertCueV386>|null>(null);
 const manualVocalCueRefV385=useRef<ReturnType<typeof resolveManualVocalCueV385>|null>(null);
  const visibility = useRef(mode !== "solo" ? 1 : 0);
  const dual = mode !== "solo";
  // V312: scale only reactive overlays for the background dancer. Authored GLB clips and IK remain untouched.
  const leadProps = useMemo(() => {
    const gain=choreography?.leadGain ?? 1;
    const syncedProps={...props,lipSync:props.lipSync?{...props.lipSync,performanceCueRefV375,interactionCueRefV376,manualVocalCueRefV385,concertCueRefV386}:undefined};
    return choreography ? {...syncedProps, avatarArmResponse:(props.avatarArmResponse??1)*(.35+.65*gain),
      avatarLegResponse:(props.avatarLegResponse??1)*(.60+.40*gain),
      danceAggression:Math.min(1,(props.danceAggression??.5)*(.50+.50*gain))} : syncedProps;
  },[props,choreography?.leadGain]);
  const partnerProps = useMemo(() => {
    const gain=choreography?.partnerGain ?? 1;
    return {...props,lipSync:props.lipSync?{...props.lipSync,performanceCueRefV375,interactionCueRefV376,manualVocalCueRefV385,concertCueRefV386}:undefined, multiAvatarMode: mode,
      ...(choreography ? {avatarArmResponse:(props.avatarArmResponse??1)*(.35+.65*gain),
        avatarLegResponse:(props.avatarLegResponse??1)*(.60+.40*gain),
        danceAggression:Math.min(1,(props.danceAggression??.5)*(.50+.50*gain))} : {})};
  }, [props,mode,choreography?.partnerGain]);
  const leadLook = useRef<LookAtCue>({...NEUTRAL_LOOK});
  const partnerLook = useRef<LookAtCue>({...NEUTRAL_LOOK});
  const leadGesture = useRef<PartnerGestureCue>({...NEUTRAL_GESTURE});
  const partnerGesture = useRef<PartnerGestureCue>({...NEUTRAL_GESTURE});
  // V445 shares the same conservative anonymous cue on the existing two-avatar stage.
  const duoVocalEvidenceV445=useRef(emptyVocalEvidenceV445());
  const duoLastHintV445=useRef("");
  const interaction = useRef(createPartnerInteractionState());
  const partnerSync = useRef(createPartnerSyncState());
  const cachedFormation = useRef<ReturnType<typeof duoFormationTargets> | null>(null);
  // V324: one shared stage-space coordinator; isolated from both clip/IK instances.
  const [ensembleSettings,setEnsembleSettings]=useState(readEnsembleBalanceV324);
  const ensembleState=useRef(createEnsembleStateV324());
  // V325: authored formation cues override automatic group positions only when explicitly enabled.
  const [manualTimeline,setManualTimeline]=useState(readEnsembleTimelineV325);
  const manualClock=useRef(0);
  useEffect(()=>{const sync=()=>setManualTimeline(readEnsembleTimelineV325());window.addEventListener(ENSEMBLE_TIMELINE_EVENT_V325,sync);return()=>window.removeEventListener(ENSEMBLE_TIMELINE_EVENT_V325,sync);},[]);
  useEffect(()=>{manualClock.current=0;},[props.track?.id]);
  const lastEnsembleReport=useRef(0);
  useEffect(()=>{
    const sync=()=>setEnsembleSettings(refreshEnsembleBalanceV324());
    window.addEventListener(ENSEMBLE_BALANCE_EVENT_V324,sync);
    return()=>window.removeEventListener(ENSEMBLE_BALANCE_EVENT_V324,sync);
  },[]);
  useEffect(()=>{ensembleState.current=createEnsembleStateV324();lastEnsembleReport.current=0;},[props.track?.id]);
  const previousMode = useRef(mode);
  const leadHand = useRef<PartnerHandCue>({...NEUTRAL_HAND});
  const partnerHand = useRef<PartnerHandCue>({...NEUTRAL_HAND});
  useEffect(() => { interaction.current = createPartnerInteractionState(); partnerSync.current = createPartnerSyncState(); }, [props.track?.id]);
  useEffect(()=>{ensembleStateV392.current=initialEnsembleV392();ensembleCueV392.current=null;},[props.track?.id]);
  useFrame((_state, delta) => {
    evaluateAnimationBudget(_state.clock.elapsedTime);
    if (shouldRunScheduledTask("duo", "formation", _state.clock.elapsedTime, previousMode.current !== mode || !cachedFormation.current)) {
      cachedFormation.current = measureProfilerPhase("formation", () => duoFormationTargets(mode, props.audio.beatStrength, props.audio.rhythmPhrasePosition, props.reducedMotion));
      previousMode.current = mode;
    }
    const scene = cachedFormation.current!;
    // V143: keep adequate spacing while partner-facing adds subtle stage interaction.
    // V230: shared phrase-based formations, preserving the existing separation/IK pipeline.
    if(props.isPlaying)manualClock.current+=Math.max(0,Math.min(.15,delta));
    const manualActive=canPlayEnsembleTimelineV325(manualTimeline,props.track?.id)&&mode!=="solo"&&!props.reducedMotion;
    const manualTime=manualTimeline.songSync?props.cameraDirectorProgressMs!==undefined&&Number.isFinite(props.cameraDirectorProgressMs)?props.cameraDirectorProgressMs/1000:null:manualClock.current;
    const manualPose=manualActive&&manualTime!==null?evaluateEnsembleTimelineV325(manualTimeline,manualTime):null;
    const formation = choreography?.formation ?? "line";
    const smart = choreography && "interactionMode" in choreography ? choreography as ChoreographyCueV312 : null;
    const leadTarget: [number,number,number] = [...scene.lead];
    const partnerTarget: [number,number,number] = [...scene.partner];
    if (mode !== "solo" && formation === "diagonal") { leadTarget[2] -= .32; partnerTarget[2] += .32; }
    if (mode !== "solo" && formation === "wide") { leadTarget[0] -= .34; partnerTarget[0] += .34; }
    if(manualPose){leadTarget[0]=manualPose.lead[0];leadTarget[1]=manualPose.lead[1];leadTarget[2]=manualPose.lead[2];
      partnerTarget[0]=manualPose.partner[0];partnerTarget[1]=manualPose.partner[1];partnerTarget[2]=manualPose.partner[2];}
    const safe = separatePartners(leadTarget, partnerTarget, 1.35);
    const ensemble=advanceEnsembleBalanceV324(ensembleState.current,{
      trackId:props.track?.id??'',lead:safe.lead,partner:safe.partner,
      role:manualPose?.role ?? choreography?.role,dropAccent:manualPose?.drop ?? choreography?.dropAccent ?? (props.showCue?.enabled===true && props.showCue.section==='drop'),
      beatStrength:props.audio.beatStrength,delta,playing:props.isPlaying,
      reducedMotion:props.reducedMotion,duo:mode!=='solo',footLockEnabled:readFootLockV322().enabled,
      settings:manualPose?{...ensembleSettings,enabled:true}:ensembleSettings,
    });
    // Group transforms only: skinned GLB actions, V322 foot targets and V323 rig offsets stay independent.
    if(ensemble.active&&_state.clock.elapsedTime-lastEnsembleReport.current>=1&&typeof window!=='undefined'){
      lastEnsembleReport.current=_state.clock.elapsedTime;
      window.dispatchEvent(new CustomEvent(ENSEMBLE_BALANCE_DIAGNOSTIC_V324,{detail:{
        separation:Math.round(ensemble.separation*100)/100,
        protectionActive:ensemble.protectionActive,role:ensemble.role,
        footLockEnabled:readFootLockV322().enabled,
      }}));
    }
    const cue = partnerCue(mode, ensemble.lead, ensemble.partner, props.audio.beatStrength, props.reducedMotion);
    const travel = props.reducedMotion ? 20 : 4.5;
    const update = (group: Group | null, target: [number,number,number]) => {
      if (!group) return;
      group.position.x = formationApproach(group.position.x, target[0], delta, travel);
      group.position.y = formationApproach(group.position.y, target[1], delta, travel);
      group.position.z = formationApproach(group.position.z, target[2], delta, travel);
    };
    // V324 directly controls group-space targets when opted in. Do not apply a second high-speed easing.
    if(ensemble.active){
      if(lead.current)lead.current.position.set(...ensemble.lead);
      if(partner.current)partner.current.position.set(...ensemble.partner);
    } else {
      update(lead.current, mode === "solo" ? scene.lead : safe.lead);
      update(partner.current, mode === "solo" ? scene.partner : safe.partner);
    }
    // V312: slight partner-facing invitation during call/response; manual scenes unchanged.
    const interactionStrength = smart && props.isPlaying && !props.reducedMotion ? smart.interactionStrength : 0;
    const leadInvitation = smart?.interactionMode === "exchange" && smart.role === "partner-solo" ? .2 * interactionStrength : 0;
    const partnerInvitation = smart?.interactionMode === "exchange" && smart.role === "lead-solo" ? -.2 * interactionStrength : 0;
    if (lead.current) {
      lead.current.rotation.y = formationApproach(lead.current.rotation.y, cue.leadYaw + leadInvitation + (ensembleCueV392.current?.yaw[0]??0), delta, 3.5);
      lead.current.rotation.z = formationApproach(lead.current.rotation.z, -cue.leadLean, delta, 3.5);
    }
    if (partner.current) {
      partner.current.rotation.y = formationApproach(partner.current.rotation.y, cue.partnerYaw + partnerInvitation + (ensembleCueV392.current?.yaw[1]??0), delta, 3.5);
      partner.current.rotation.z = formationApproach(partner.current.rotation.z, cue.partnerLean, delta, 3.5);
    }
    // V375: stage-root casting only. Manual V325 timelines, authored choreography and
    // explicit show formations take priority; source GLB clips and foot IK are untouched.
    const autoPerformanceV375=resolveAdaptiveVocalPerformanceV375({
      lyrics:props.lipSync?.lyrics,progressMs:props.lipSync?.progressMs??0,
      playing:props.isPlaying,reducedMotion:props.reducedMotion,
      section:props.cameraDirectorSection,bpm:props.audio.bpm,energy:props.audio.energyEnvelope,
      beatAccent:props.audio.beatStrength,count:2,
      mode:props.lipSync?.performanceModeV375??"off",strength:props.lipSync?.performanceStrengthV375??65,
      manualPriority:!!manualPose||!!choreography||props.showCue?.formationsEnabled===true||mode==="solo",
    });
    const displayPerformanceV375=!props.isPlaying&&!props.reducedMotion&&props.lipSync?.performanceModeV375!=="off"&&performanceCueRefV375.current?.enabled
      ?performanceCueRefV375.current:autoPerformanceV375;
    performanceCueRefV375.current=displayPerformanceV375;
    const duetV376=resolveDuetInteractionV376({lyrics:props.lipSync?.lyrics,progressMs:props.lipSync?.progressMs??0,
      playing:props.isPlaying,reducedMotion:props.reducedMotion,count:2,
      mode:props.lipSync?.duetModeV376??"off",strength:props.lipSync?.duetStrengthV376??60,
      performance:displayPerformanceV375,manualPriority:!!manualPose||!!choreography||props.showCue?.formationsEnabled===true||mode==="solo"});
    const manualCueV385=resolveManualVocalCueV385({lyrics:props.lipSync?.lyrics,progressMs:props.lipSync?.progressMs??0,
      playing:props.isPlaying,count:2,enabled:props.lipSync?.manualVocalEnabledV385===true&&
      !!props.track?.id&&props.track.id===props.lipSync?.manualVocalTrackIdV385,
      assignments:props.lipSync?.manualVocalAssignmentsV385,manualPriority:!!manualPose||!!choreography||
      props.showCue?.formationsEnabled===true||mode==="solo"});
    const rapDuetCueV416=resolveRapDuetCueV416({
      lyrics:props.lipSync?.lyrics,progressMs:(props.lipSync?.progressMs??0)+effectiveRapTimingOffsetV418(!!props.lipSync?.rapTimingLiveEnabledV418,props.lipSync?.rapRoleOffsetMsV418??0),playing:props.isPlaying,
      reducedMotion:props.reducedMotion,count:2,
      enabled:props.lipSync?.rapDuetEnabledV416===true&&!manualCueV385.active&&
        !!props.track?.id&&props.track.id===props.lipSync?.rapDuetTrackIdV416,
      assignments:props.lipSync?.rapDuetAssignmentsV416,
      manualPriority:!!manualPose||!!choreography||props.showCue?.formationsEnabled===true||mode==="solo"
    });
    const liveSingerCueV416=rapDuetCueV416.active?toVocalCueV416(rapDuetCueV416):manualCueV385;
    manualVocalCueRefV385.current=liveSingerCueV416;
    const finalDuetV385=applyRapDuetInteractionV416(
      applyManualVocalCueV385(duetV376,manualCueV385,props.reducedMotion),rapDuetCueV416);
    interactionCueRefV376.current=finalDuetV385;
    // V392 blends only reactive role accents; authored and manually assigned roles win.
    const ensembleV392=advanceEnsembleV392(ensembleStateV392.current,{
      settings:resolveEnsembleSettingsV396(readEnsembleV392(),props.experienceCueV396),trackId:props.track?.id,progressMs:props.cameraDirectorProgressMs,
      delta,playing:props.isPlaying,reducedMotion:props.reducedMotion,count:2,
      section:props.cameraDirectorSection,genre:props.genre,bpm:props.audio.bpm,
      energy:props.audio.energyEnvelope,beat:props.audio.beatStrength,kick:props.audio.kickAccentIntensity,
      leader:displayPerformanceV375.enabled?displayPerformanceV375.leadSlot:0,
      manualPriority:!!manualPose||!!choreography||props.showCue?.formationsEnabled===true||mode==='solo'||
        !!manualActive||!!manualCueV385.active,
    });
    ensembleCueV392.current=ensembleV392;
    concertCueRefV386.current=resolveConcertCueV386({mode:props.lipSync?.concertModeV386,
      strength:props.lipSync?.concertStrengthV386,playing:props.isPlaying,reducedMotion:props.reducedMotion,
      count:2,manual:liveSingerCueV416,duet:finalDuetV385,section:props.cameraDirectorSection,
      beat:props.audio.beatStrength,manualPriority:!!manualPose||!!choreography||props.showCue?.formationsEnabled===true||mode==="solo"});
    const interactiveSlotsV376=finalDuetV385.enabled?finalDuetV385.activeSlots:null;
    const activePartnerV375=interactiveSlotsV376?interactiveSlotsV376.includes(1):displayPerformanceV375.enabled ? displayPerformanceV375.activeSlots.includes(1):scene.partnerVisible;
    const activeLeadV375=interactiveSlotsV376?interactiveSlotsV376.includes(0):displayPerformanceV375.enabled ? displayPerformanceV375.activeSlots.includes(0):true;
    visibility.current = formationApproach(visibility.current,activePartnerV375 ? 1 : 0, delta, props.reducedMotion ? 20 : 3.2);
    if(lead.current){
      const target=activeLeadV375?1:.001;
      const scale=formationApproach(lead.current.scale.x,target,delta,props.reducedMotion?20:3.2);
      lead.current.scale.setScalar(Math.max(.001,scale));
      lead.current.visible=scale>.003;
    }
    // React refs are stable; no per-frame React updates, GLB reloads or mixer resets.
    const watching = props.isPlaying && !props.reducedMotion;
    const a = lead.current?.position ?? {x: 0, y: 0, z: 0};
    const b = partner.current?.position ?? {x: 0, y: 0, z: 0};
    leadLook.current = partnerLookCue(mode, [a.x,a.y,a.z], [b.x,b.y,b.z], watching, visibility.current);
    partnerLook.current = partnerLookCue(mode, [b.x,b.y,b.z], [a.x,a.y,a.z], watching, visibility.current);
    const beat = props.audio.beatStrength;
    // V159: use a single bounded, musical clock for both dancers and partner contact.
    const sync = advancePartnerSync(partnerSync.current, props.audio, delta, mode, watching, props.reducedMotion);
    const phrase = sync.phase;
    // V146: one shared choreography clock; distinct smoothly weighted cues for each dancer.
    const directed = advancePartnerInteraction(interaction.current, props.audio, delta, mode, props.genre, watching, props.reducedMotion, props.duoDirectorEnabled === true);
    const baseLead = props.duoDirectorEnabled === true ? directed.lead : 1;
    const directedLead = (manualPose?(manualPose.role==='partner-solo'?.35:1):(choreography?.leadGain ?? 1) * (choreography ? 1 : baseLead))*(ensembleCueV392.current?.gains[0]??1);
    const basePartner = props.duoDirectorEnabled === true ? directed.partner : 1;
    const directedPartner = (manualPose?(manualPose.role==='lead-solo'?.35:1):(choreography?.partnerGain ?? 1) * (choreography ? 1 : basePartner))*(ensembleCueV392.current?.gains[1]??1);
    leadGesture.current = partnerGestureCue(mode, beat * directedLead, sync.leadPhase, watching, props.reducedMotion, false, visibility.current);
    partnerGesture.current = partnerGestureCue(mode, beat * directedPartner, sync.partnerPhase - (choreography?.partnerDelayBeats ?? 0) * Math.PI / 2, watching, props.reducedMotion, true, visibility.current);
    // V445 in duet mode: only neutral *guest reaction* to a possible mix change.
    // It cannot identify the speaker, choose the lead, or alter mouth/motion clips.
    const duoProgressV445=props.lipSync?.progressMs??0;
    duoVocalEvidenceV445.current=advanceVocalEvidenceV445(duoVocalEvidenceV445.current,{
      trackId:props.track?.id??"",progressMs:duoProgressV445,
      enabled:props.vocalChangeEnabledV445===true&&mode!=="solo"&&
        !!props.artistBubblePlanV441?.enabled,
      microphoneActive:props.vocalChangeMicrophoneActiveV445===true,
      playing:props.isPlaying,reducedMotion:props.reducedMotion,
      manualPriority:!!manualPose||!!choreography||!!manualActive||
        props.showCue?.formationsEnabled===true||!!manualCueV385.active||
        !!rapDuetCueV416.active||!!props.lipSync?.manualVocalEnabledV385||
        !!props.lipSync?.rapDuetEnabledV416&&!!props.lipSync.rapDuetAssignmentsV416?.length,
      lyrics:props.lipSync?.lyrics,audio:props.audio,
      sensitivity:props.vocalChangeSensitivityV445??60,
    });
    const duoHintV445=duoVocalEvidenceV445.current.hint;
    const duoHintKeyV445=duoHintV445?`${props.track?.id??""}:${duoHintV445.atMs}`:"";
    if(duoHintV445&&duoLastHintV445.current!==duoHintKeyV445){
      duoLastHintV445.current=duoHintKeyV445;
      window.dispatchEvent(new CustomEvent(VOCAL_CHANGE_EVENT_V445,{detail:{
        trackId:props.track?.id??"",atMs:duoHintV445.atMs,confidence:duoHintV445.confidence,
      }}));
    }
    const duoResponseV445=vocalHintPulseV445(duoHintV445,duoProgressV445);
    if(duoResponseV445>0){
      partnerGesture.current={...partnerGesture.current,
        rightLift:Math.min(.24,partnerGesture.current.rightLift+duoResponseV445*.12),
        intensity:Math.min(1,partnerGesture.current.intensity+duoResponseV445*.18)};
    }
    // V452: two-person crew accent uses the existing duo contexts. It cannot
    // replace manual duets, authored formations, hand contact or singer IDs.
    const crewDuoV452=planCrewAccentsV452({
      enabled:props.artistInteractionEnabledV444===true&&!!props.artistBubblePlanV441?.enabled&&mode!=="solo",
      playing:props.isPlaying,reducedMotion:props.reducedMotion,
      manualPriority:!!manualPose||!!manualActive||!!choreography||
        props.showCue?.formationsEnabled===true||!!manualCueV385.active||!!rapDuetCueV416.active||
        displayPerformanceV375.enabled||finalDuetV385.enabled||
        (props.lipSync?.manualVocalEnabledV385===true&&props.track?.id===props.lipSync?.manualVocalTrackIdV385)||
        (props.lipSync?.rapDuetEnabledV416===true&&props.track?.id===props.lipSync?.rapDuetTrackIdV416&&
          !!props.lipSync.rapDuetAssignmentsV416?.length),
      count:2,positions:[[a.x,a.y,a.z],[b.x,b.y,b.z]],
      focus:props.cameraDirectorSection==='hook'?-1:0,
      drop:props.cameraDirectorSection==='hook',section:props.cameraDirectorSection,
      seconds:Number.isFinite(props.cameraDirectorProgressMs)?(props.cameraDirectorProgressMs??0)/1000:manualClock.current,
      cueSeconds:Math.floor((Number.isFinite(props.cameraDirectorProgressMs)?(props.cameraDirectorProgressMs??0)/1000:manualClock.current)/6)*6,
      beat:props.audio.beatStrength,energy:props.audio.energyEnvelope,
      strength:props.artistInteractionStrengthV444??60,
    });
    // V458 refines only the bounded upper-body overlay in duo mode;
    // partner hand-IK and root contacts always remain controlled by V145/V159.
    const crewDuoV458=refineNaturalCrewV458(crewDuoV452,{
      seconds:Number.isFinite(props.cameraDirectorProgressMs)?(props.cameraDirectorProgressMs??0)/1000:manualClock.current,
      cueSeconds:Math.floor((Number.isFinite(props.cameraDirectorProgressMs)?(props.cameraDirectorProgressMs??0)/1000:manualClock.current)/6)*6,
      beat:props.audio.beatStrength??0,energy:props.audio.energyEnvelope??0,
      positions:[[a.x,a.y,a.z],[b.x,b.y,b.z]],quality:getActivePerformanceTier(),footLocked:true,
    });
    if(crewDuoV458.active){
      leadGesture.current=combineCrewGesturesV452(leadGesture.current,crewDuoV458.slots[0].gesture);
      partnerGesture.current=combineCrewGesturesV452(partnerGesture.current,crewDuoV458.slots[1].gesture);
      leadLook.current=combineCrewLooksV452(leadLook.current,crewDuoV458.slots[0].look);
      partnerLook.current=combineCrewLooksV452(partnerLook.current,crewDuoV458.slots[1].look);
    }
    // Both hands approach a shared point only during greeting / together phases.
    const handWeight = handInteractionWeight(mode, directed.phase, watching, props.reducedMotion, props.duoDirectorEnabled === true, visibility.current) * sync.contactGain;
    const target: [number, number, number] = [(a.x + b.x) / 2, Math.max(a.y, b.y) + 1.1, (a.z + b.z) / 2];
    leadHand.current = {enabled: handWeight > 0, strength: handWeight, target};
    partnerHand.current = {enabled: handWeight > 0, strength: handWeight, target};

    if (partner.current) {
      // Shrink/expand without unmounting the skinned character (keeps animation clips alive).
      const visibleScale = Math.max(0.001, visibility.current);
      const mirror = mode === "mirror" ? -1 : 1;
      partner.current.scale.set(visibleScale * mirror, visibleScale, visibleScale);
      partner.current.visible = visibility.current > 0.003 || dual;
    }
  });
  return <>
    <group name="v377-vocal-stage-slot-0" ref={lead} position={[0,0,0]}><PartnerLookContext.Provider value={leadLook}><PartnerGestureContext.Provider value={leadGesture}><PartnerHandContext.Provider value={leadHand}><PartnerCalibrationContext.Provider value={props.partnerContactCalibration ?? null}><Dancer props={leadProps} /><ArtistNameBubbleV441 plan={props.artistBubblePlanV441} slot={0} reducedMotion={props.reducedMotion}/></PartnerCalibrationContext.Provider></PartnerHandContext.Provider></PartnerGestureContext.Provider></PartnerLookContext.Provider></group>
    <group name="v377-vocal-stage-slot-1" ref={partner} position={[1.9,0,-0.5]} scale={[0.001,0.001,0.001]}>
      <PartnerLookContext.Provider value={partnerLook}><PartnerGestureContext.Provider value={partnerGesture}><PartnerHandContext.Provider value={partnerHand}><PartnerCalibrationContext.Provider value={props.secondaryContactCalibration ?? null}><Dancer props={partnerProps} secondary /><ArtistNameBubbleV441 plan={props.artistBubblePlanV441} slot={1} reducedMotion={props.reducedMotion}/></PartnerCalibrationContext.Provider></PartnerHandContext.Provider></PartnerGestureContext.Provider></PartnerLookContext.Provider>
    </group>
  </>;
}

/** V326: optional four independent mixers/IK rigs, one shared formation clock.
 * Stage roots only; legacy V325 duo path remains untouched when V326 is off. */
function GroupDancersV326({props,settings}:{props:VisualizerProps;settings:GroupStudioV326}){
 const refs=useRef<(Group|null)[]>([null,null,null,null]);
 // Stable mutable contexts: individual avatar rigs read these inside their existing
 // V144/V145 head/arm overlay without React renders or resetting motion mixers.
 const looksV444=useRef(Array.from({length:4},()=>({current:{...NEUTRAL_LOOK}})));
 const lowPosesV481=useRef(Array.from({length:4},()=>({current:{mode:"stand" as LowPoseSlotV481["mode"],depth:0}})));
 const danceMotionV485=useRef(Array.from({length:4},()=>({current:{offsetX:0,offsetZ:0,step:0,lean:0} as NaturalDanceSlotV485})));
 const footworkV486=useRef(Array.from({length:4},()=>({current:{offsetX:0,offsetZ:0,liftLeft:0,liftRight:0,rootSpeed:1,weightShift:0} as FootworkSlotV486})));
 const supportV486=useRef(Array.from({length:4},()=>({current:{tracked:false,leftPlanted:false,rightPlanted:false} as FootSupportV486})));
 const groundV487=useRef(Array.from({length:4},()=>({current:emptyGroundObservationV487()})));
 const lastGroundReportV487=useRef(-1);
 const lowInteractionV483=useRef(newLowInteractionStateV483());
 const [lowSettingsV481,setLowSettingsV481]=useState(readLowPoseV481);
 useEffect(()=>{const update=()=>setLowSettingsV481(readLowPoseV481());window.addEventListener(LOW_POSE_EVENT_V481,update);return()=>window.removeEventListener(LOW_POSE_EVENT_V481,update);},[]);
 const gesturesV444=useRef(Array.from({length:4},()=>({current:{...NEUTRAL_GESTURE}})));
 // V445: ephemeral track-scoped band summaries; no waveform, uploads or artist identities.
 const vocalEvidenceV445=useRef(emptyVocalEvidenceV445());
 const lastPublishedV445=useRef("");
 const ensembleStateV392=useRef(initialEnsembleV392());
 const performanceCueRefV375=useRef<ReturnType<typeof resolveAdaptiveVocalPerformanceV375>|null>(null);
 const interactionCueRefV376=useRef<ReturnType<typeof resolveDuetInteractionV376>|null>(null);
  const concertCueRefV386=useRef<ReturnType<typeof resolveConcertCueV386>|null>(null);
 const manualVocalCueRefV385=useRef<ReturnType<typeof resolveManualVocalCueV385>|null>(null);
 const time=useRef(0);
 const contact=useRef(readFootLockV322());
 const [motionSyncV328,setMotionSyncV328]=useState<MotionSyncV328>(readMotionSyncV328);
 const [phraseSettingsV329,setPhraseSettingsV329]=useState<PhraseSettingsV329>(readPhraseV329);
 const [phraseProfilesV329,setPhraseProfilesV329]=useState<readonly (readonly PhraseSignatureV329[])[]>([[],[],[],[]]);
 const registerPhrasesV329=useCallback((slot:number,profiles:readonly PhraseSignatureV329[])=>{
  if(slot<0||slot>3)return;
  setPhraseProfilesV329(prior=>{
   const old=prior[slot];
   const identity=(xs:readonly PhraseSignatureV329[])=>xs.map(s=>`${s.index}:${s.name}:${s.duration}:${s.evidence}:${s.wave.join(',')}`).join('|');
   if(identity(old)===identity(profiles))return prior;
   const next=[...prior];next[slot]=profiles;return next;
  });
 },[]);
 const phrasePlanV329=useMemo(()=>planGroupPhrasesV329(phraseProfilesV329,settings.count,phraseSettingsV329,motionSyncV328.enabled?motionSyncV328.clipIndexes:[],motionSyncV328.beatCycle),[phraseProfilesV329,settings.count,phraseSettingsV329,motionSyncV328.clipIndexes,motionSyncV328.beatCycle]);
 const motionClocksV328=useRef<Array<{current:MotionSyncClockV328}>>(Array.from({length:4},(_,slot)=>({current:{enabled:false,seconds:0,bpm:128,playing:false,reducedMotion:false,slot}})));
 const [rhythm,setRhythm]=useState<GroupSyncV327>(readGroupSyncV327);
 const beatAnalysis=useRef<TrackAnalysisV318|null>(null);
 const beatSeconds=useRef<number[]>([]);
 // Each dancer receives an independent normalized audio object. Never mutate the
 // shared microphone/Spotify source, and never rewrite imported GLB keyframes.
 const groupAudio=useRef<VisualizerProps['audio'][]>(Array.from({length:4},()=>({...props.audio})));
 useEffect(()=>{const sync=()=>setRhythm(readGroupSyncV327());window.addEventListener(GROUP_SYNC_EVENT_V327,sync);return()=>window.removeEventListener(GROUP_SYNC_EVENT_V327,sync);},[]);
 useEffect(()=>{const sync=()=>setMotionSyncV328(readMotionSyncV328());window.addEventListener(MOTION_SYNC_EVENT_V328,sync);return()=>window.removeEventListener(MOTION_SYNC_EVENT_V328,sync);},[]);
 useEffect(()=>{const sync=()=>setPhraseSettingsV329(readPhraseV329());window.addEventListener(PHRASE_EVENT_V329,sync);return()=>window.removeEventListener(PHRASE_EVENT_V329,sync);},[]);
 useEffect(()=>{const refresh=()=>{beatAnalysis.current=readTrackAnalysisV318(props.track?.id??'');beatSeconds.current=beatAnalysis.current?.beats.map(b=>b.startMs/1000)??[];};refresh();window.addEventListener(ANALYSIS_EVENT_V318,refresh);return()=>window.removeEventListener(ANALYSIS_EVENT_V318,refresh);},[props.track?.id]);
 useEffect(()=>{const sync=()=>{contact.current=readFootLockV322();};window.addEventListener(FOOT_LOCK_EVENT_V322,sync);return()=>window.removeEventListener(FOOT_LOCK_EVENT_V322,sync);},[]);
 useEffect(()=>{time.current=0;},[props.track?.id]);
 useEffect(()=>{ensembleStateV392.current=initialEnsembleV392();},[props.track?.id]);
 const urls=useMemo(()=>settings.modelIds.map(id=>id?getAvatarModel(id):null),[settings.modelIds]);
 useFrame((_state,delta)=>{
  if(props.isPlaying)time.current+=Math.min(.15,Math.max(0,delta));
  const seconds=settings.songSync ? (Number.isFinite(props.cameraDirectorProgressMs)?(props.cameraDirectorProgressMs??0)/1000:null):time.current;
  if(seconds===null)return;
  const pose=evaluateGroupV326(settings,seconds);
  if(!pose)return;
  const analysis=settings.songSync?beatAnalysis.current:null;
  // V392: one shared section/phrase clock, with the existing V326 authored stage
  // positions left intact. Never reinterpret manually assigned singer roles.
  const ensembleV392=advanceEnsembleV392(ensembleStateV392.current,{
   settings:resolveEnsembleSettingsV396(readEnsembleV392(),props.experienceCueV396),trackId:props.track?.id,progressMs:props.cameraDirectorProgressMs,
   delta,playing:props.isPlaying,reducedMotion:props.reducedMotion,count:settings.count,
   section:props.cameraDirectorSection,genre:props.genre,bpm:analysis?.tempo??props.audio.bpm,
   energy:props.audio.energyEnvelope,beat:props.audio.beatStrength,kick:props.audio.kickAccentIntensity,
   leader:interactionCueRefV376.current?.enabled?interactionCueRefV376.current.leadSlot:
     performanceCueRefV375.current?.enabled?performanceCueRefV375.current.leadSlot:0,
   manualPriority:!!settings.trackId||(props.lipSync?.manualVocalEnabledV385===true&&
     props.track?.id===props.lipSync?.manualVocalTrackIdV385),
  });
  const music=evaluateGroupSyncV327(rhythm,{seconds,bpm:analysis?.tempo??props.audio.bpm??settings.bpm,count:settings.count,
    focus:pose.focus,drop:pose.drop,playing:props.isPlaying,reducedMotion:props.reducedMotion,
    beatTimes:beatSeconds.current,beatsPerBar:analysis?.timeSignature});
  for(let i=0;i<settings.count;i++){
   const target=groupAudio.current[i],gain=music.gains[i]*ensembleV392.gains[i],pulse=music.pulses[i];
   // A modest, evidence-gated echo lets a later dancer accent an existing onset;
   // beat-grid prediction alone cannot synthesize a missing audio beat.
   const onset=Math.max(props.audio.beatStrength??0,props.audio.kickAccentIntensity??0,props.audio.snare??0);
   const echo=music.playing&&rhythm.enabled?Math.min(.18,onset*.18)*pulse*gain:0;
   const weight=music.playing&&rhythm.enabled?gain*(rhythm.mode==='stagger'?.55+.45*pulse:1):1;
   Object.assign(target,props.audio,{
     beatStrength:Math.min(1,(props.audio.beatStrength??0)*weight+echo),
     kickAccentIntensity:Math.min(1,(props.audio.kickAccentIntensity??0)*weight+echo),
     kick:(props.audio.kick??0)*weight,
     snare:(props.audio.snare??0)*weight,
     rhythmPhraseAccent:(props.audio.rhythmPhraseAccent??0)*weight,
   });
  }
  // Shared clock published without React setState/rerenders on every frame.
  // Imported beats are only safe when this group follows the song timeline.
  for(let slot=0;slot<settings.count;slot++){
   Object.assign(motionClocksV328.current[slot].current,{enabled:canRunGroupV326(settings,props.track?.id),seconds,
    bpm:analysis?.tempo??props.audio.bpm??settings.bpm,beatTimes:settings.songSync?beatSeconds.current:undefined,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,slot});
  }
  const performanceV375=resolveAdaptiveVocalPerformanceV375({
    lyrics:props.lipSync?.lyrics,progressMs:props.lipSync?.progressMs??0,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,
    section:props.cameraDirectorSection,bpm:analysis?.tempo??props.audio.bpm,
    energy:props.audio.energyEnvelope,beatAccent:props.audio.beatStrength,
    count:settings.count,mode:props.lipSync?.performanceModeV375??"off",
    strength:props.lipSync?.performanceStrengthV375??65,
    // Track-specific manually authored stage scripts must never be overridden.
    manualPriority:!!settings.trackId,
  });
  const displayPerformanceV375=!props.isPlaying&&!props.reducedMotion&&props.lipSync?.performanceModeV375!=="off"&&performanceCueRefV375.current?.enabled
    ?performanceCueRefV375.current:performanceV375;
  performanceCueRefV375.current=displayPerformanceV375;
  const duetV376=resolveDuetInteractionV376({lyrics:props.lipSync?.lyrics,progressMs:props.lipSync?.progressMs??0,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,count:settings.count,
    mode:props.lipSync?.duetModeV376??"off",strength:props.lipSync?.duetStrengthV376??60,
    performance:displayPerformanceV375,manualPriority:!!settings.trackId});
  const manualCueV385=resolveManualVocalCueV385({lyrics:props.lipSync?.lyrics,progressMs:props.lipSync?.progressMs??0,
    playing:props.isPlaying,count:settings.count,enabled:props.lipSync?.manualVocalEnabledV385===true&&
    !!props.track?.id&&props.track.id===props.lipSync?.manualVocalTrackIdV385,
    assignments:props.lipSync?.manualVocalAssignmentsV385,manualPriority:!!settings.trackId});
  const rapDuetCueV416=resolveRapDuetCueV416({
    lyrics:props.lipSync?.lyrics,progressMs:(props.lipSync?.progressMs??0)+effectiveRapTimingOffsetV418(!!props.lipSync?.rapTimingLiveEnabledV418,props.lipSync?.rapRoleOffsetMsV418??0),playing:props.isPlaying,
    reducedMotion:props.reducedMotion,count:settings.count,
    enabled:props.lipSync?.rapDuetEnabledV416===true&&!manualCueV385.active&&
      !!props.track?.id&&props.track.id===props.lipSync?.rapDuetTrackIdV416,
    assignments:props.lipSync?.rapDuetAssignmentsV416,manualPriority:!!settings.trackId
  });
  const liveSingerCueV416=rapDuetCueV416.active?toVocalCueV416(rapDuetCueV416):manualCueV385;
  manualVocalCueRefV385.current=liveSingerCueV416;
  const finalDuetV385=applyRapDuetInteractionV416(
    applyManualVocalCueV385(duetV376,manualCueV385,props.reducedMotion),rapDuetCueV416);
  interactionCueRefV376.current=finalDuetV385;
  concertCueRefV386.current=resolveConcertCueV386({mode:props.lipSync?.concertModeV386,
    strength:props.lipSync?.concertStrengthV386,playing:props.isPlaying,reducedMotion:props.reducedMotion,
    count:settings.count,manual:liveSingerCueV416,duet:finalDuetV385,section:props.cameraDirectorSection,
    beat:props.audio.beatStrength,manualPriority:!!settings.trackId});
  const activeSlotsV376=finalDuetV385.enabled?finalDuetV385.activeSlots:null;
  const spotlightPoseV443=props.artistSpotlightV443?.enabled&&settings===props.autoMultiArtistGroupV442;
  const currentCueAtV443=spotlightPoseV443?settings.cues.find(c=>c.id===pose.cueId)?.at??0:0;
  const spotlightV443=featureSpotlightV460(planArtistSpotlightV443({pose,count:settings.count,seconds,cueAt:currentCueAtV443,
    enabled:!!spotlightPoseV443,playing:props.isPlaying,reducedMotion:props.reducedMotion,
    manualPriority:!!manualCueV385.active||!!rapDuetCueV416.active||
      !!displayPerformanceV375.enabled||!!finalDuetV385.enabled||
      props.artistBubblePlanV441?.source==="manual-stage",
    strength:props.artistSpotlightV443?.strength??65}),
    props.featureDirectionV460??{active:false,moment:"off",lead:0,partner:0,group:false,eventId:"",responseGain:0,cameraCue:null});
  // V444: user-authored V385/V416 singer assignment wins over visually inferred
  // spotlight. Never infer real recorded singers from track credits.
  const selectedSingerV444=rapDuetCueV416.active?toVocalCueV416(rapDuetCueV416):
    manualCueV385.active?manualCueV385:null;
  vocalEvidenceV445.current=advanceVocalEvidenceV445(vocalEvidenceV445.current,{
    trackId:props.track?.id??"",progressMs:props.lipSync?.progressMs??0,
    enabled:props.vocalChangeEnabledV445===true&&settings===props.autoMultiArtistGroupV442,
    microphoneActive:props.vocalChangeMicrophoneActiveV445===true,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,
    manualPriority:!!settings.trackId||!!selectedSingerV444||
      (props.lipSync?.manualVocalEnabledV385===true)||
      (props.lipSync?.rapDuetEnabledV416===true&&!!props.lipSync.rapDuetAssignmentsV416?.length),
    lyrics:props.lipSync?.lyrics,audio:props.audio,
    sensitivity:props.vocalChangeSensitivityV445??60,
  });
  const hintV445=vocalEvidenceV445.current.hint;
  const hintKeyV445=hintV445?`${props.track?.id??""}:${hintV445.atMs}`:"";
  if(hintV445&&lastPublishedV445.current!==hintKeyV445){
    lastPublishedV445.current=hintKeyV445;
    // Only bounded time/confidence metadata; no samples, lyrics or inferred artist.
    window.dispatchEvent(new CustomEvent(VOCAL_CHANGE_EVENT_V445,{detail:{
      trackId:props.track?.id??"",atMs:hintV445.atMs,confidence:hintV445.confidence,
    }}));
  }
  const mixChangePulseV445=!selectedSingerV444?
    vocalHintPulseV445(hintV445,props.lipSync?.progressMs??0):0;
  const interactionBaseV444=planMultiArtistInteractionV444({
    pose,count:settings.count,enabled:!!props.artistInteractionEnabledV444&&
      settings===props.autoMultiArtistGroupV442,playing:props.isPlaying,
    reducedMotion:props.reducedMotion,manualStage:!!settings.trackId||
      // Existing explicitly selected duet/performance directors own these cues.
      (!selectedSingerV444&&(displayPerformanceV375.enabled||
        (props.lipSync?.duetModeV376??"off")!=="off")),
    singer:selectedSingerV444,beat:props.audio.beatStrength,
    seconds,cueAt:currentCueAtV443,strength:props.artistInteractionStrengthV444??60,
    audioChangePulse:mixChangePulseV445,
  });
  const interactionV444=featureInteractionV460(interactionBaseV444,
    props.featureDirectionV460??{active:false,moment:"off",lead:0,partner:0,group:false,eventId:"",responseGain:0,cameraCue:null});
  // V475: only refine automatically directed visual interactions. Explicit singer
  // assignments, saved stage cues, GLB clips and lip-sync ownership are untouched.
  const interactionV475=refineMultiAvatarInteractionV475({
    base:interactionV444,pose,feature:props.featureDirectionV460,
    trackId:props.track?.id,count:settings.count,seconds,cueSeconds:currentCueAtV443,
    beat:props.audio.beatStrength??0,strength:props.artistInteractionStrengthV444??60,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,
    manualPriority:!!settings.trackId||!!selectedSingerV444||
      displayPerformanceV375.enabled||finalDuetV385.enabled,
    tier:getActivePerformanceTier(),
  });
  // V452: additive visual crew accents. Explicitly authored V385/V416 singer
  // parts, manual stage cues and alternative performance directors keep priority.
  const crewV452=planCrewAccentsV452({
    enabled:props.artistInteractionEnabledV444===true&&settings===props.autoMultiArtistGroupV442,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,
    manualPriority:!!settings.trackId||!!selectedSingerV444||
      displayPerformanceV375.enabled||finalDuetV385.enabled||
      (props.lipSync?.duetModeV376??"off")!=="off"||
      (props.lipSync?.manualVocalEnabledV385===true&&props.track?.id===props.lipSync?.manualVocalTrackIdV385)||
      (props.lipSync?.rapDuetEnabledV416===true&&props.track?.id===props.lipSync?.rapDuetTrackIdV416&&
        !!props.lipSync.rapDuetAssignmentsV416?.length),
    count:settings.count,positions:pose.positions,focus:pose.focus,drop:pose.drop,
    section:props.cameraDirectorSection,seconds,cueSeconds:currentCueAtV443,
    beat:props.audio.beatStrength,energy:props.audio.energyEnvelope,
    strength:props.artistInteractionStrengthV444??60,blend:pose.blend,
  });
  // V458: keep existing V452 gating and all manual stage/vocal priorities.
  // Contact IK prohibits additional stage-root translation; the existing
  // performance tier limits only optional accents, not imported motion clips.
  const footLock=contact.current.enabled;
  const crewV458=refineNaturalCrewV458(crewV452,{
    seconds,cueSeconds:currentCueAtV443,beat:props.audio.beatStrength??0,
    energy:props.audio.energyEnvelope??0,positions:pose.positions,
    quality:getActivePerformanceTier(),footLocked:footLock,
  });
  for(let i=0;i<settings.count;i++){
    const accent=crewV458.slots[i];
    Object.assign(looksV444.current[i].current,accent?
      combineCrewLooksV452(interactionV475.slots[i]?.look??NEUTRAL_LOOK,accent.look):
      interactionV475.slots[i]?.look??NEUTRAL_LOOK);
    Object.assign(gesturesV444.current[i].current,accent?
      combineCrewGesturesV452(interactionV475.slots[i]?.gesture??NEUTRAL_GESTURE,accent.gesture):
      interactionV475.slots[i]?.gesture??NEUTRAL_GESTURE);
  }
  // V481: bounded automatic group-only body-pose intentions. No manual V326
  // cue, karaoke foreground or authored vocal/timeline may trigger low poses.
  const lowPlanV481=planLowPosesV481({
    settings:lowSettingsV481,count:settings.count,trackId:props.track?.id,
    seconds,cueSeconds:settings.cues.find(c=>c.id===pose.cueId)?.at??0,focus:pose.focus,drop:pose.drop,
    section:props.cameraDirectorSection,genre:props.genre,
    beat:props.audio.beatStrength??0,kick:props.audio.kickAccentIntensity??0,
    energy:props.audio.energyEnvelope??0,playing:props.isPlaying,reducedMotion:props.reducedMotion,
    automaticGroup:settings===props.autoMultiArtistGroupV442,
    manualPriority:!!selectedSingerV444||displayPerformanceV375.enabled||finalDuetV385.enabled||
      (props.avatarMotionMode==='choreography')||
      (props.lipSync?.manualVocalEnabledV385===true)||
      (props.lipSync?.rapDuetEnabledV416===true&&!!props.lipSync.rapDuetAssignmentsV416?.length),
    lyricsForeground:props.lipSync?.cinematicLyricsVisibleV378===true && !props.lipSync?.cinematicLyricsSideV378,
    tier:getActivePerformanceTier(),
  });
  // V483: stage-wide crouch responses are layered on top of V475/V458 gaze
  // and gestures. Only the fresh V481 plan is updated; existing rigs own IK.
  const lowInteractionPlanV483=stepLowInteractionV483(lowInteractionV483.current,{
    plan:lowPlanV481,positions:pose.positions,count:settings.count,
    trackId:props.track?.id,seconds,
    cueSeconds:settings.cues.find(c=>c.id===pose.cueId)?.at??0,
    focus:pose.focus,drop:pose.drop,beat:props.audio.beatStrength??0,
    energy:props.audio.energyEnvelope??0,playing:props.isPlaying,
    reducedMotion:props.reducedMotion,
    manualPriority:!!selectedSingerV444||!!settings.trackId||displayPerformanceV375.enabled||
      finalDuetV385.enabled||props.avatarMotionMode==='choreography'||
      props.lipSync?.manualVocalEnabledV385===true||
      (props.lipSync?.rapDuetEnabledV416===true&&!!props.lipSync.rapDuetAssignmentsV416?.length),
    automaticGroup:settings===props.autoMultiArtistGroupV442,
    lyricsForeground:props.lipSync?.cinematicLyricsVisibleV378===true&&!props.lipSync?.cinematicLyricsSideV378,
    enabled:lowSettingsV481.enabled,tier:getActivePerformanceTier(),
    maxConcurrent:lowSettingsV481.maxConcurrent,
  });
  for(let i=0;i<settings.count;i++){
    Object.assign(lowPosesV481.current[i].current,lowInteractionPlanV483.plan.slots[i]);
    const accent=lowInteractionPlanV483.slots[i];
    if(accent){
      Object.assign(looksV444.current[i].current,combineCrewLooksV452(looksV444.current[i].current,accent.look));
      Object.assign(gesturesV444.current[i].current,combineCrewGesturesV452(gesturesV444.current[i].current,accent.gesture));
    }
  }
  // V484: optional whole-body expressive accents on existing partner gesture
  // channels. A low-pose scene must already have passed V481/V483 priority
  // guards; no new rig, GLB retarget or beat/voice inference is introduced.
  const expressiveV484=planExpressiveLowPoseV484({
    plan:lowInteractionPlanV483.plan,count:settings.count,focus:pose.focus,
    seconds,cueSeconds:settings.cues.find(c=>c.id===pose.cueId)?.at??0,
    genre:props.genre,section:props.cameraDirectorSection,
    beat:props.audio.beatStrength??0,kick:props.audio.kickAccentIntensity??0,
    snare:props.audio.snare??0,energy:props.audio.energyEnvelope??0,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,
    manualPriority:!!selectedSingerV444||!!settings.trackId||displayPerformanceV375.enabled||
      finalDuetV385.enabled||props.avatarMotionMode==='choreography'||
      props.lipSync?.manualVocalEnabledV385===true||
      (props.lipSync?.rapDuetEnabledV416===true&&!!props.lipSync.rapDuetAssignmentsV416?.length),
    automaticGroup:settings===props.autoMultiArtistGroupV442,
    lyricsForeground:props.lipSync?.cinematicLyricsVisibleV378===true&&!props.lipSync?.cinematicLyricsSideV378,
    tier:getActivePerformanceTier(),
  });
  if(expressiveV484.active)for(let i=0;i<settings.count;i++){
    Object.assign(gesturesV444.current[i].current,
      combineCrewGesturesV452(gesturesV444.current[i].current,expressiveV484.accents[i]));
  }
  // V485: deterministic, corridor-safe near-passes and synchronized returns.
  // Every avatar retains its own original stage slot, mixer and Foot IK. A
  // crowding/foot-lock/manual cue inhibits all optional translations.
  const naturalMotionV485=planNaturalDanceMotionV485({
    plan:lowInteractionPlanV483.plan,count:settings.count,positions:pose.positions,
    focus:pose.focus,trackId:props.track?.id,seconds,
    cueSeconds:settings.cues.find(c=>c.id===pose.cueId)?.at??0,
    beat:props.audio.beatStrength??0,kick:props.audio.kickAccentIntensity??0,
    energy:props.audio.energyEnvelope??0,genre:props.genre,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,
    manualPriority:!!selectedSingerV444||!!settings.trackId||displayPerformanceV375.enabled||
      finalDuetV385.enabled||props.avatarMotionMode==='choreography'||
      props.lipSync?.manualVocalEnabledV385===true||
      (props.lipSync?.rapDuetEnabledV416===true&&!!props.lipSync.rapDuetAssignmentsV416?.length),
    lyricsForeground:props.lipSync?.cinematicLyricsVisibleV378===true&&!props.lipSync?.cinematicLyricsSideV378,
    automaticGroup:settings===props.autoMultiArtistGroupV442,
    footLocked:footLock,tier:getActivePerformanceTier(),
  });
  // V486: single song-time foot cadence + existing GLB Foot-IK stance reports;
  // scale only OPTIONAL V485 translation, never authored formation or clips.
  const advancedFootworkV486=planAdvancedDanceFootworkV486({
    motion:naturalMotionV485,count:settings.count,seconds,
    cueSeconds:settings.cues.find(c=>c.id===pose.cueId)?.at??0,
    bpm:props.audio.bpm,playing:props.isPlaying,reducedMotion:props.reducedMotion,
    manualPriority:!!selectedSingerV444||!!settings.trackId||displayPerformanceV375.enabled||
      finalDuetV385.enabled||props.avatarMotionMode==='choreography'||
      props.lipSync?.manualVocalEnabledV385===true||
      (props.lipSync?.rapDuetEnabledV416===true&&!!props.lipSync.rapDuetAssignmentsV416?.length),
    footLocked:footLock,tier:getActivePerformanceTier(),
    support:supportV486.current.map(ref=>ref.current),
  });
  const contactReportV487=buildGroundContactReportV487(
    groundV487.current.map(item=>item.current),advancedFootworkV486.slots,settings.count,
    props.isPlaying&&!props.reducedMotion);
  // Reuse the existing group frame callback. Emit at most twice per second;
  // React controls never update component state from individual frame reports.
  if(typeof window!=='undefined'&&seconds-lastGroundReportV487.current>=.5){
    lastGroundReportV487.current=seconds;
    window.dispatchEvent(new CustomEvent(GROUND_CONTACT_REPORT_EVENT_V487,{detail:contactReportV487}));
  } else if(seconds<lastGroundReportV487.current-0.2){
    lastGroundReportV487.current=seconds-0.5; // seek backwards
  }
  for(let i=0;i<settings.count;i++){
    Object.assign(footworkV486.current[i].current,advancedFootworkV486.slots[i]);
    Object.assign(danceMotionV485.current[i].current,naturalMotionV485.slots[i]);
    // Add only small expressive upper-body compensation to existing clamps.
    if(naturalMotionV485.active){
      const g=gesturesV444.current[i].current;
      Object.assign(g,combineCrewGesturesV452(g,{leftLift:0,rightLift:0,shoulder:0,
        lean:naturalMotionV485.slots[i].lean,intensity:Math.abs(naturalMotionV485.slots[i].lean)}));
    }
  }
  const groundTravelV487=contactReportV487.slots.map(slot=>slot.travelMultiplier);
  const speed=props.reducedMotion?20:footLock?1.65:3.4;
  const beat=props.isPlaying&&!props.reducedMotion?Math.max(0,Math.min(1,props.audio.beatStrength??0)):0;
  for(let i=0;i<settings.count;i++){
   const g=refs.current[i];if(!g)continue;
   const p=pose.positions[i];
   // Root translation only: keep each imported clip and its IK isolated.
   const dropWidth=pose.drop?beat*.08:0;
   const present=activeSlotsV376?activeSlotsV376.includes(i):displayPerformanceV375.enabled?displayPerformanceV375.activeSlots.includes(i):true;
   const focus=finalDuetV385.enabled?finalDuetV385.leadSlot===i:displayPerformanceV375.enabled&&displayPerformanceV375.leadSlot===i;
   // V376 facial call-and-response must not reorder existing group roots every lyric line.
   // V375 keeps the phrase-stable cast; temporarily reintroduced dancers keep their stage slot.
   const inV375Cast=displayPerformanceV375.activeSlots.includes(i);
   const targetX=displayPerformanceV375.enabled&&present&&inV375Cast
     ?(displayPerformanceV375.activeSlots.indexOf(i)-(displayPerformanceV375.activeCount-1)/2)*Math.max(1.28,settings.minSpacing+.2)
     :p[0]+Math.sign(p[0])*dropWidth;
   const targetZ=(displayPerformanceV375.enabled&&present?(focus?-.18-.20*(duetV376.enabled?duetV376.emphasis:displayPerformanceV375.emphasis):0):p[2]+(pose.focus===i?-.18:0))+(spotlightV443.slots[i]?.offsetZ??0);
   // V452 accents are stage-root translations, below 5 cm; spacing preserved
   // for hooks (all dancers receive the same lateral offset).
   g.position.x=formationApproach(g.position.x,targetX+(crewV458.slots[i]?.offsetX??0)+advancedFootworkV486.slots[i].offsetX,delta,speed*advancedFootworkV486.slots[i].rootSpeed*(groundTravelV487[i]??1));
   g.position.z=formationApproach(g.position.z,targetZ+(crewV458.slots[i]?.offsetZ??0)+advancedFootworkV486.slots[i].offsetZ,delta,speed*advancedFootworkV486.slots[i].rootSpeed*(groundTravelV487[i]??1));
   g.position.y=0;
   g.rotation.y=formationApproach(g.rotation.y,ensembleV392.yaw[i]+(spotlightV443.slots[i]?.turnY??0)+(crewV458.slots[i]?.turnY??0),delta,props.reducedMotion?20:3.1);
   const desiredScale=present?1:.001;
   const scaled=formationApproach(g.scale.x,desiredScale,delta,props.reducedMotion?20:3.2);
   g.scale.setScalar(Math.max(.001,scaled));
   g.visible=scaled>.003;
  }
 });
 return <>{Array.from({length:settings.count},(_,i)=>{
  const chosen=urls[i];
  const usingPartner=i%2===1;
  const modelUrl=chosen?chosen.url:(usingPartner?props.secondaryAvatarModelUrl:props.avatarModelUrl);
  const animationUrl=chosen?('animationUrl' in chosen?chosen.animationUrl:undefined):(usingPartner?props.secondaryAvatarAnimationUrl:props.avatarAnimationUrl);
  const modelId=chosen?.id??(usingPartner?props.secondaryAvatarModelId:props.avatarModelId);
  const groupProps:VisualizerProps={...props,lipSync:props.lipSync?{...props.lipSync,ensembleCountV374:settings.count,performanceCueRefV375,interactionCueRefV376,manualVocalCueRefV385,concertCueRefV386}:undefined,audio:groupAudio.current[i],multiAvatarMode:'sync',avatarModelUrl:modelUrl,avatarAnimationUrl:animationUrl,avatarModelId:modelId,preferredMotionUrlV440:props.multiArtistMotionsV442?.[i]??(usingPartner?props.secondaryPreferredMotionUrlV440:props.preferredMotionUrlV440),
   avatarDancePreset:usingPartner?props.secondaryDancePreset??props.avatarDancePreset:props.avatarDancePreset,
   danceVariation:Math.min(1,(props.danceVariation??.5)+(i>1?.07:0))};
  return <group key={i} name={`v377-vocal-stage-slot-${i}`} ref={node=>{refs.current[i]=node;}} position={[(-settings.count+1)/2*1.4+i*1.4,0,0]}>
   <PartnerCalibrationContext.Provider value={usingPartner?props.secondaryContactCalibration??null:props.partnerContactCalibration??null}>
    <GroupMotionClockContextV328.Provider value={{settings:motionSyncV328,clock:motionClocksV328.current[i]}}>
     <GroupPhraseContextV329.Provider value={{settings:phraseSettingsV329,plan:phrasePlanV329,register:registerPhrasesV329}}>
      <GroupLowPoseContextV481.Provider value={lowPosesV481.current[i]}>
      <GroupDanceMotionContextV485.Provider value={danceMotionV485.current[i]}>
      <GroupFootworkContextV486.Provider value={footworkV486.current[i]}>
      <GroupFootSupportContextV486.Provider value={supportV486.current[i]}>
      <GroupGroundObservationContextV487.Provider value={groundV487.current[i]}>
      <PartnerLookContext.Provider value={looksV444.current[i]}>
       <PartnerGestureContext.Provider value={gesturesV444.current[i]}>
        <Dancer props={groupProps} slot={i}/>
       </PartnerGestureContext.Provider>
      </PartnerLookContext.Provider>
      </GroupGroundObservationContextV487.Provider>
      </GroupFootSupportContextV486.Provider>
      </GroupFootworkContextV486.Provider>
      </GroupDanceMotionContextV485.Provider>
      </GroupLowPoseContextV481.Provider>
      <ArtistNameBubbleV441 plan={props.artistBubblePlanV441} slot={i} reducedMotion={props.reducedMotion} spotlightV443={props.artistSpotlightV443}/>
     </GroupPhraseContextV329.Provider>
    </GroupMotionClockContextV328.Provider>
   </PartnerCalibrationContext.Provider>
  </group>;
 })}</>;
}

class SceneErrorBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}
function WebGLWatch({ onLost, onRestored, onStable }: {onLost: () => void; onRestored: () => void; onStable: () => void}) {
  const gl = useThree(state => state.gl);
  const stability = useRef({seconds:0,reported:false});
  useFrame((_state,delta)=>{
    if(stability.current.reported||!Number.isFinite(delta)||delta<=0||delta>.20||
       gl.getContext().isContextLost()||
       (typeof document!=='undefined'&&document.hidden))return;
    stability.current.seconds+=delta;
    if(stability.current.seconds>=2.5){stability.current.reported=true;onStable();}
  });
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault();stability.current={seconds:0,reported:false};onLost(); };
    const restored = () => {stability.current={seconds:0,reported:false};onRestored();};
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    return () => { canvas.removeEventListener("webglcontextlost", lost); canvas.removeEventListener("webglcontextrestored", restored); };
  }, [gl, onLost, onRestored]);
  return null;
}
export function ThreeAvatar(props: VisualizerProps) {
  const piConcertBudgetV479=usePiConcertBudgetV479();
  // V466: voluntary, read-only live QA – no extra sampling while closed.
  const [qualityInspectorEnabledV466,setQualityInspectorEnabledV466]=useState(false);
  useEffect(()=>()=>resetConcertQualityV466(),[]);
  useEffect(()=>{resetConcertQualityV466();},[props.track?.id]);
  const [autoScene, setAutoScene] = useState<DuoScene>("solo");
  const [groupSettingsV326,setGroupSettingsV326]=useState(readGroupV326);
  useEffect(()=>{const sync=()=>setGroupSettingsV326(readGroupV326());window.addEventListener(GROUP_EVENT_V326,sync);return()=>window.removeEventListener(GROUP_EVENT_V326,sync);},[]);
  const [multiSettings,setMultiSettings]=useState(readMultiAvatarSettings);
  const [choreography,setChoreography]=useState<MultiAvatarCue | null>(null);
  const [intelligentSettings,setIntelligentSettings]=useState(readChoreographyV312);
  const [intelligentCue,setIntelligentCue]=useState<ChoreographyCueV312|null>(null);
  useEffect(()=>{const sync=()=>setIntelligentSettings(readChoreographyV312());window.addEventListener(CHOREOGRAPHY_V312_EVENT,sync);return()=>window.removeEventListener(CHOREOGRAPHY_V312_EVENT,sync);},[]);
  useEffect(()=>{const cb=()=>setMultiSettings(readMultiAvatarSettings());window.addEventListener(MULTI_AVATAR_EVENT,cb);return()=>window.removeEventListener(MULTI_AVATAR_EVENT,cb);},[]);
  useEffect(()=>setChoreography(null),[props.track?.id,multiSettings.enabled]);
  const [authoredTimeline,setAuthoredTimeline]=useState(readEnsembleTimelineV325);
  useEffect(()=>{const sync=()=>setAuthoredTimeline(readEnsembleTimelineV325());window.addEventListener(ENSEMBLE_TIMELINE_EVENT_V325,sync);return()=>window.removeEventListener(ENSEMBLE_TIMELINE_EVENT_V325,sync);},[]);
  const authoredEnabled=canPlayEnsembleTimelineV325(authoredTimeline,props.track?.id)&&(!authoredTimeline.songSync||Number.isFinite(props.cameraDirectorProgressMs));
  const manualGroupOnV326=canRunGroupV326(groupSettingsV326,props.track?.id)&&(!groupSettingsV326.songSync||Number.isFinite(props.cameraDirectorProgressMs));
  const autoGroupOnV442=!groupSettingsV326.enabled&&!manualGroupOnV326&&!multiSettings.enabled&&!authoredEnabled&&
    !props.duoDirectorEnabled&&!props.reducedMotion&&!!props.autoMultiArtistGroupV442?.enabled&&
    props.autoMultiArtistGroupV442.trackId===props.track?.id&&Number.isFinite(props.cameraDirectorProgressMs);
  const groupOnV326=manualGroupOnV326||autoGroupOnV442;
  const effectiveGroupSettingsV442=autoGroupOnV442?props.autoMultiArtistGroupV442!:groupSettingsV326;
  const [showTimelineV354,setShowTimelineV354]=useState(readTimelineV354);
  useEffect(()=>{const sync=()=>setShowTimelineV354(readTimelineV354());window.addEventListener(SHOW_TIMELINE_EVENT_V354,sync);return()=>window.removeEventListener(SHOW_TIMELINE_EVENT_V354,sync);},[]);
  const [autoShowSettingsV356,setAutoShowSettingsV356]=useState(readAutoShowV356);
  useEffect(()=>{const sync=()=>setAutoShowSettingsV356(readAutoShowV356());window.addEventListener(AUTONOMOUS_SHOW_EVENT_V356,sync);return()=>window.removeEventListener(AUTONOMOUS_SHOW_EVENT_V356,sync);},[]);
  const [showQualitySettingsV357,setShowQualitySettingsV357]=useState(readShowQualityV357);
  useEffect(()=>{const sync=()=>setShowQualitySettingsV357(readShowQualityV357());window.addEventListener(SHOW_QUALITY_EVENT_V357,sync);return()=>window.removeEventListener(SHOW_QUALITY_EVENT_V357,sync);},[]);
  const lyricsActiveV356=props.lyricsSignalV350?.active??hasActiveLyricsV350(props.lyricsScene?.lyrics,props.lyricsScene?.activeIndex,props.lyricsScene?.progressMs);
  const authoredCueV354=evaluateTimelineV354(showTimelineV354,{progressMs:props.cameraDirectorProgressMs,
    trackId:props.track?.id,playing:props.isPlaying,reducedMotion:props.reducedMotion,
    lyricsActive:lyricsActiveV356});
  const autoPlanV356=planAutonomousShowV356({trackId:props.track?.id,progressMs:props.cameraDirectorProgressMs,
    durationMs:props.track?.durationMs,bpm:props.audio.bpm,genre:props.genre,section:props.cameraDirectorSection,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,lyricsActive:lyricsActiveV356,
    avatarCount:groupOnV326?effectiveGroupSettingsV442.count:multiSettings.enabled?2:props.duoDirectorEnabled?2:props.showCue?.formationsEnabled?2:1,
    automaticShowEnabled:props.showCue?.enabled===true,authoredTimeline:showTimelineV354},
    {...autoShowSettingsV356,formations:autoShowSettingsV356.formations&&props.showCue?.formationsEnabled===true,
      camera:autoShowSettingsV356.camera&&props.showCue?.cameraEnabled===true,
      lighting:autoShowSettingsV356.lighting&&props.showCue?.lightingEnabled===true,
      effects:autoShowSettingsV356.effects&&props.showCue?.fxEnabled===true});
  // V357 only refines the automatic V356 proposal: manual V354 scores always win.
  // No new clock/renderer. V351 lyrics protection and V355 effect caps remain downstream.
  const qualityResultV357=refineShowQualityV357(autoPlanV356,{
    trackId:props.track?.id,section:props.cameraDirectorSection,
    lyricsActive:lyricsActiveV356,
    mediaCount:props.stageScreenSettingsV330?.enabled
      ?(props.stageLayoutEnabledV333?(props.stageScreensV333??[]).filter(screen=>screen.enabled).length:props.stageScreenV330?1:0):0,
    avatarCount:groupOnV326?effectiveGroupSettingsV442.count:multiSettings.enabled?2:props.duoDirectorEnabled?2:props.showCue?.formationsEnabled?2:1,
    reducedMotion:props.reducedMotion,playing:props.isPlaying,manualOverride:authoredCueV354.active,
  },showQualitySettingsV357);
  // V358: opt-in local aggregates; never store track identities, lyrics or frame-by-frame data.
  const [showLearningSettingsV358,setShowLearningSettingsV358]=useState(readShowLearningSettingsV358);
  const [showLearningHistoryV358,setShowLearningHistoryV358]=useState(readShowLearningHistoryV358);
  useEffect(()=>{const sync=()=>{setShowLearningSettingsV358(readShowLearningSettingsV358());setShowLearningHistoryV358(readShowLearningHistoryV358());};
    window.addEventListener(SHOW_LEARNING_EVENT_V358,sync);return()=>window.removeEventListener(SHOW_LEARNING_EVENT_V358,sync);},[]);
  const learningContextV358:ShowLearningContextV358={genre:props.genre,section:props.cameraDirectorSection,
    lyricsActive:lyricsActiveV356,mediaCount:props.stageScreenSettingsV330?.enabled
      ?(props.stageLayoutEnabledV333?(props.stageScreensV333??[]).filter(screen=>screen.enabled).length:props.stageScreenV330?1:0):0,
    avatarCount:groupOnV326?effectiveGroupSettingsV442.count:multiSettings.enabled?2:props.duoDirectorEnabled?2:props.showCue?.formationsEnabled?2:1,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,manualOverride:authoredCueV354.active};
  const learnedResultV358=refineLearnedShowV358(qualityResultV357,learningContextV358,showLearningSettingsV358,showLearningHistoryV358);
  // Observe one played phrase at a time. Only commit a result on the next consecutive
  // phrase boundary with fresh renderer FPS/P95; no timers and no writes while rendering.
  const observedPhraseV358=useRef<null|{track:string;index:number;firstMs:number;lastMs:number;
    phraseMs:number;context:ShowLearningContextV358;shot:NonNullable<typeof qualityResultV357.cue.cameraShot>;
    formation:NonNullable<typeof qualityResultV357.cue.danceFormation>;planScore:number}>(null);
  useEffect(()=>{
    const p=autoPlanV356,nowMs=props.cameraDirectorProgressMs,track=props.track?.id;
    const valid=showLearningSettingsV358.enabled&&showLearningSettingsV358.mode!=='off'&&
      qualityResultV357.active&&p.active&&!!track&&typeof nowMs==='number'&&Number.isFinite(nowMs)&&
      learningContextV358.playing&&!learningContextV358.manualOverride&&!learningContextV358.reducedMotion;
    if(!valid||!track||typeof nowMs!=="number"){observedPhraseV358.current=null;return;}
    const moment=learnedResultV358.moments[0]??qualityResultV357.moments[0];
    if(!moment)return;
    const prev=observedPhraseV358.current;
    if(prev&&prev.track===track&&prev.index===p.index){
      if(nowMs>=prev.lastMs&&nowMs<=(p.index+1)*p.phraseMs+200){prev.lastMs=nowMs;}
      else observedPhraseV358.current=null;
      return;
    }
    if(prev&&prev.track===track&&p.index===prev.index+1&&nowMs>=prev.lastMs){
      const metric=getRenderMetricsSnapshot();
      const observedAt=Date.now();
      const observation:ShowLearningObservationV358={context:prev.context,shot:prev.shot,formation:prev.formation,
        fps:metric.fps,p95FrameMs:metric.p95FrameMs??NaN,metricAt:metric.updatedAt,observedAt,
        planScore:prev.planScore,playedMs:prev.lastMs-prev.firstMs,phraseMs:prev.phraseMs,automatic:true};
      const next=recordShowLearningV358(readShowLearningHistoryV358(),observation,showLearningSettingsV358);
      // Reject stale/unavailable measurements: never write if there is no new observation.
      if(next.entries.length!==showLearningHistoryV358.entries.length||
        next.entries.some((e,i)=>e.observations!==showLearningHistoryV358.entries[i]?.observations||e.lastSeen!==showLearningHistoryV358.entries[i]?.lastSeen)){
        storeShowLearningHistoryV358(next,showLearningSettingsV358);
      }
    }
    observedPhraseV358.current={track,index:p.index,firstMs:nowMs,lastMs:nowMs,phraseMs:p.phraseMs,
      context:learningContextV358,shot:moment.shot,formation:moment.formation,planScore:qualityResultV357.after.score};
  });
  const autoCueV357=learnedResultV358.active?learnedResultV358.cue:qualityResultV357.active?qualityResultV357.cue:autoPlanV356.cue;
  // Authored V354 scores win globally. V356/V357 only fill in when no matching score is enabled.
  const timelineCueV354=authoredCueV354.active?authoredCueV354:autoPlanV356.active?autoCueV357:authoredCueV354;
  const manualFormationV354=!!timelineCueV354.danceFormation&&!groupOnV326&&!multiSettings.enabled&&!authoredEnabled&&
    (props.multiAvatarMode??'solo')==='solo'&&!props.duoDirectorEnabled;
  const multiEnabled=multiSettings.enabled;
  // V306 only directs formations when no manual multi-avatar/duo director was chosen.
  const showFormation=props.showCue?.enabled && props.showCue.formationsEnabled && (props.multiAvatarMode??"solo")==="solo" && !multiEnabled && !props.duoDirectorEnabled;
  // V312 directs automatic V306 shows, including preset-enabled legacy Duo Director.
  // Explicit V206/V274 settings and manual duet/mirror/sync scenes remain authoritative.
  const intelligentEnabled = intelligentSettings.enabled && !!props.showCue?.enabled && !!props.showCue.formationsEnabled
    && !multiEnabled && (props.duoDirectorEnabled === true || (props.multiAvatarMode ?? "solo") === "solo");
  const auto = !multiEnabled && !intelligentEnabled && props.duoDirectorEnabled === true;
  const mode = manualFormationV354 ? timelineCueV354.danceFormation! : authoredEnabled ? "sync" : multiEnabled ? (choreography?.scene ?? "sync") : intelligentEnabled ? (intelligentCue?.scene ?? props.showCue!.formation) : auto ? autoScene : showFormation ? props.showCue!.formation : (props.multiAvatarMode ?? "solo");
  const dual = groupOnV326 || mode !== "solo";
  // V351: stage-wide cues are computed once and shared by camera, lighting, lyrics and media.
  const [smartStageSettingsV351,setSmartStageSettingsV351]=useState(readSmartStageV351);
  useEffect(()=>{const sync=()=>setSmartStageSettingsV351(readSmartStageV351());window.addEventListener(SMART_STAGE_EVENT_V351,sync);return()=>window.removeEventListener(SMART_STAGE_EVENT_V351,sync);},[]);
  const visibleMediaCountV351=props.stageScreenSettingsV330?.enabled ?
    (props.stageLayoutEnabledV333 ? (props.stageScreensV333??[]).filter(x=>x.enabled).length : props.stageScreenV330?1:0) : 0;
  const [genreSettingsV352,setGenreSettingsV352]=useState(readGenreVisualV352);
  useEffect(()=>{const sync=()=>setGenreSettingsV352(readGenreVisualV352());window.addEventListener(GENRE_VISUAL_EVENT_V352,sync);return()=>window.removeEventListener(GENRE_VISUAL_EVENT_V352,sync);},[]);
  const lyricsActiveV352=props.lyricsSignalV350?.active??hasActiveLyricsV350(props.lyricsScene?.lyrics,props.lyricsScene?.activeIndex,props.lyricsScene?.progressMs);
  const compositionV351=decideSmartStageV351({
    lyricsActive:lyricsActiveV352,
    lyricsSide:props.lyricsSignalV350?.side??props.lyricsScene?.side??null,
    section:props.cameraDirectorSection,screenCount:visibleMediaCountV351,
    avatarCount:groupOnV326?effectiveGroupSettingsV442.count:dual?2:1,
    playing:props.isPlaying,reducedMotion:props.reducedMotion,beatAccent:props.audio?.kickAccentIntensity,
  },smartStageSettingsV351);
  // V352 drives the same canvas. V351 content protection still caps unsafe effects.
  const genreCueV352=decideGenreVisualV352({
    genre:props.genre,fusion:props.genreFusion,section:props.cameraDirectorSection,playing:props.isPlaying,reducedMotion:props.reducedMotion,
    beatAccent:props.audio?.kickAccentIntensity,lyricsActive:lyricsActiveV352,
    screenCount:visibleMediaCountV351,avatarCount:compositionV351.avatarCount,currentTheme:props.stageTheme??'classic',
  },genreSettingsV352);
  const compositionV352=mergeGenreCompositionV352(compositionV351,genreCueV352);
  // V354 applies only active lanes, without removing V351/V352 content safety caps.
  const compositionV354=timelineCueV354.active && (timelineCueV354.activeLanes.includes('photos')||timelineCueV354.lyricsFocus)
    ? {...compositionV352,photoOpacity:Math.min(compositionV352.photoOpacity,timelineCueV354.photoOpacity),
        fxGain:timelineCueV354.lyricsFocus?Math.min(compositionV352.fxGain,.75):compositionV352.fxGain,
        beamGain:timelineCueV354.lyricsFocus?Math.min(compositionV352.beamGain,.8):compositionV352.beamGain}
    :compositionV352;
  const [visualFxSettingsV353,setVisualFxSettingsV353]=useState(readVisualFxV353);
  useEffect(()=>{const sync=()=>setVisualFxSettingsV353(readVisualFxV353());window.addEventListener(VISUAL_FX_EVENT_V353,sync);return()=>window.removeEventListener(VISUAL_FX_EVENT_V353,sync);},[]);
  const visualFxCueV353=decideVisualFxV353({playing:props.isPlaying,reducedMotion:props.reducedMotion,
    lyricsActive:lyricsActiveV352,beatAccent:props.audio?.kickAccentIntensity,section:props.cameraDirectorSection,
    genre:genreCueV352.genre??resolveGenreVisualV352(props.genre),genreCue:genreCueV352,composition:compositionV354,quality:'high'},visualFxSettingsV353);
  const stabilityCapV355=useStabilityCapV355();
  const stabilityGainV355=stabilityEffectFactorV355(stabilityCapV355);
  const fxScaleV354=timelineCueV354.active&&timelineCueV354.activeLanes.includes('effects')?timelineCueV354.fxGain:1;
  const visualFxCueV354=fxScaleV354===1?visualFxCueV353:{...visualFxCueV353,
    particleCount:Math.floor(visualFxCueV353.particleCount*Math.min(1.8,fxScaleV354)),
    particleOpacity:Math.min(1,visualFxCueV353.particleOpacity*fxScaleV354),
    shaderStrength:Math.min(1,visualFxCueV353.shaderStrength*fxScaleV354),
    glowGain:Math.min(1.8,visualFxCueV353.glowGain*fxScaleV354)};
  // V355 reduces only optional presentation layers; V351/V354 remain authoritative.
  const visualFxCueV355=stabilityGainV355===1?visualFxCueV354:{...visualFxCueV354,
    particleCount:Math.floor(visualFxCueV354.particleCount*stabilityGainV355),
    particleOpacity:visualFxCueV354.particleOpacity*stabilityGainV355,
    shaderStrength:visualFxCueV354.shaderStrength*stabilityGainV355,
    glowGain:visualFxCueV354.glowGain*stabilityGainV355};
  // Pass only an optional phrase hint to the existing GLB mixer; no second mixer or timers.
  const dancerPropsV356:VisualizerProps=autoPlanV356.active&&autoShowSettingsV356.motions&&!groupOnV326&&!multiSettings.enabled&&!authoredEnabled&&!props.duoDirectorEnabled
    ? {...props,autonomousShowPhraseV356:{index:autoPlanV356.index,enabled:true}}:props;
  const directedThemeV352=genreCueV352.theme;
  const directedPaletteV352=genreCueV352.palette??props.stagePalette;
  // V395: browser context restoration gets a grace period; repeated renderer errors
  // are retried at most three times. Paused Spotify is *not* a recovery trigger.
  const productionV395=useDisplayProductionV395();
  const recoveryEnabledV395=productionV395.enabled&&productionV395.kiosk;
  const [recoveryV395,setRecoveryV395]=useState(initialRecoveryV395);
  const [graphicsLost, setGraphicsLost] = useState(false);
  const [graphicsFailure, setGraphicsFailure] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const onLost = useCallback(() => {
    resetConcertQualityV466();
    setGraphicsLost(true);
    setRecoveryV395(previous=>advanceRecoveryV395(previous,{type:'lost',now:Date.now(),enabled:recoveryEnabledV395}));
    appendProductionEventV395('webgl','Kontext verloren');
  },[recoveryEnabledV395]);
  const onRestored = useCallback(() => {
    appendProductionEventV395('webgl','Kontext durch Browser wiederhergestellt');
    if(!recoveryEnabledV395){setGraphicsLost(false);setRecoveryV395(initialRecoveryV395());return;}
    setRecoveryV395(previous=>advanceRecoveryV395(previous,{type:'restored',now:Date.now(),enabled:true}));
  },[recoveryEnabledV395]);
  const onFailure = useCallback(() => {
    resetConcertQualityV466();
    setGraphicsFailure(true);
    setRecoveryV395(previous=>advanceRecoveryV395(previous,{type:'error',now:Date.now(),enabled:recoveryEnabledV395}));
    appendProductionEventV395('renderer','3D-Szene konnte nicht gezeichnet werden');
  },[recoveryEnabledV395]);
  const onStableV395=useCallback(() => {
    setGraphicsLost(false);
    setGraphicsFailure(false);
    setRecoveryV395(previous=>previous.phase==='ready'?previous:advanceRecoveryV395(previous,{type:'healthy',now:Date.now(),enabled:recoveryEnabledV395}));
  },[recoveryEnabledV395]);
  const manualRetryV395=useCallback(()=>{
    appendProductionEventV395('retry','Manueller 3D-Neustart');
    setRecoveryV395(previous=>advanceRecoveryV395(previous,{type:'manual',now:Date.now(),enabled:true}));
  },[]);
  useEffect(()=>{
    setProductionRecoveryStateV395(recoveryV395.phase,recoveryV395.cause,recoveryV395.attempts);
  },[recoveryV395.phase,recoveryV395.cause,recoveryV395.attempts]);
  useEffect(()=>{
    // Only wall-clock supervision of a *known* context/renderer fault.
    // Stale FPS, track changes, slow music and a paused stage never trigger remounts.
    if(recoveryV395.phase!=='lost'&&recoveryV395.phase!=='waiting'&&recoveryV395.phase!=='ready')return;
    const tick=()=>setRecoveryV395(previous=>advanceRecoveryV395(previous,{type:'tick',now:Date.now(),enabled:recoveryEnabledV395,visible:!document.hidden}));
    const timer=window.setInterval(tick,recoveryV395.phase==='ready'?10000:500);
    return()=>window.clearInterval(timer);
  },[recoveryV395.phase,recoveryEnabledV395]);
  const lastRestartV395=useRef(-1);
  useEffect(()=>{
    if(recoveryV395.phase!=='restarting')return;
    // React Strict Mode and repeated renders may not remount the Canvas twice.
    if(lastRestartV395.current===recoveryV395.attempts)return;
    lastRestartV395.current=recoveryV395.attempts;
    appendProductionEventV395('retry',`3D-Neustart ${recoveryV395.attempts}/3`);
    setGraphicsLost(false);setGraphicsFailure(false);setRetryKey(key=>key+1);
  },[recoveryV395.phase,recoveryV395.attempts]);
  useEffect(()=>{
    if(recoveryV395.phase==='ready')lastRestartV395.current=-1;
  },[recoveryV395.phase]);
  const piConcertEffectsV479=resolvePiConcertEffectsV479(piConcertBudgetV479,{
    avatarCount:groupOnV326?effectiveGroupSettingsV442.count:dual||auto||multiEnabled||Boolean(showFormation)?2:1,
    manualFx:props.danceFxEnabled===true,
    manualPostProcess:props.dancePostEnabledV468===true,
    manualShader:props.shaderEnvironmentV468!==undefined&&props.shaderEnvironmentV468!=='auto',
  });
  return <div className="visualizer-stage three-avatar-stage" role="group" aria-label={groupOnV326 ? `${effectiveGroupSettingsV442.count} music-reactive 3D avatars` : dual ? "Two music-reactive 3D avatars" : "3D music-reactive avatar"}>
    <RaspberryPiProfileBootstrap />
    <LongRunStabilityControllerV355 graphicsReady={!graphicsLost&&!graphicsFailure} />
    {(graphicsLost || graphicsFailure) && <div role="status" className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white gap-2 p-6 text-center">
      <strong>2D-Modus · Sonic Display</strong><span>{graphicsLost ? "WebGL-Kontext vorübergehend verloren – Wiederherstellung läuft." : "3D-Darstellung nicht verfügbar."}</span>
      {(recoveryV395.phase==='lost'||recoveryV395.phase==='waiting')&&recoveryEnabledV395&&<span>Automatische Wiederherstellung begrenzt auf drei Versuche.</span>}
      {(recoveryV395.phase==='manual'||!recoveryEnabledV395)&&<span>Automatischer Neustart nicht aktiv oder Versuche ausgeschöpft.</span>}
      <button type="button" onClick={manualRetryV395} className="rounded border px-3 py-1">3D erneut versuchen</button>
    </div>}
    {!graphicsFailure && <SceneErrorBoundary key={retryKey} onFailure={onFailure}><Canvas camera={{ position: [0, 0.1, groupOnV326 ? 8.8 : dual || auto ? 5.9 : 4.2], fov: 38 }} dpr={[1, 1.5]} shadows={false} gl={{ powerPreference: "high-performance" }}>
      <WebGLWatch onLost={onLost} onRestored={onRestored} onStable={onStableV395} />
      <LiveStageCanvasBridgeV301 />
      {qualityInspectorEnabledV466&&<ConcertQualityProbeV466 enabled />}
      {!groupOnV326 && auto && <DuoDirectorTick props={props} onScene={setAutoScene} />}
      {!groupOnV326 && multiEnabled && <MultiAvatarDirectorTick props={props} settings={multiSettings} onCue={setChoreography} />}
      {!groupOnV326 && intelligentEnabled && <IntelligentChoreographyTickV312 props={props} settings={intelligentSettings} onCue={setIntelligentCue} />}
      <AdaptivePerformanceController avatarCount={groupOnV326?effectiveGroupSettingsV442.count:dual||auto||multiEnabled||Boolean(showFormation)?2:1} playing={props.isPlaying}/>{props.cameraDirectorEnabled || props.lipSync?.concertCameraArmedV454===true || props.lipSync?.rapCameraArmedV429===true || (props.lipSync?.vocalCameraModeV401!=="off" && props.lipSync?.vocalCameraModeV401!==undefined) || props.lipSync?.visualDirectorModeV397!=="off" && props.lipSync?.visualDirectorModeV397!==undefined || (props.lipSync?.cinematicLyricsModeV378!=="off" && props.lipSync?.cinematicLyricsSideV378 && props.lipSync?.cinematicLyricsVisibleV378 || (props.lipSync?.cinematicDuetCameraModeV377!=="off" && props.lipSync?.cinematicDuetCameraModeV377!==undefined && props.lipSync?.duetModeV376!=="off" && dual || props.lipSync?.manualVocalEnabledV385===true && props.lipSync.manualVocalCameraV385!==false && (dual||groupOnV326) || props.lipSync?.rapDuetEnabledV416===true && props.lipSync.rapDuetCameraV416!==false && (dual||groupOnV326) || props.lipSync?.concertModeV386!=="off" && props.lipSync?.concertModeV386!==undefined && props.lipSync?.concertCameraV386!==false && (dual||groupOnV326) || props.concertShowCueV387?.active && props.concertShowCameraV387!==false || props.festivalShowCueV394?.active && props.festivalShowCameraV394!==false)) ? <StageCameraDirectorV289 section={props.cameraDirectorSection ?? "verse"} progressMs={props.cameraDirectorProgressMs ?? 0} intensity={props.cameraDirectorIntensity ?? 55} playing={props.isPlaying} reducedMotion={props.reducedMotion} duo={dual || auto || !!showFormation || intelligentEnabled} showCue={props.showCue} concertShowCueV387={props.concertShowCueV387} festivalShowCueV394={props.festivalShowCueV394} festivalShowCameraV394={props.festivalShowCameraV394}
      concertShowCameraV387={props.concertShowCameraV387} composition={compositionV354} genreCue={genreCueV352} timelineCue={timelineCueV354} lipSync={props.lipSync?{...props.lipSync,cameraCastCountV377:groupOnV326?effectiveGroupSettingsV442.count:dual?2:1,cameraManualStagePriorityV377:authoredEnabled||manualFormationV354||authoredCueV354.active||props.showCue?.formationsEnabled===true||manualGroupOnV326&&!!groupSettingsV326.trackId||canPlayEnsembleTimelineV325(readEnsembleTimelineV325(),props.track?.id)}:undefined} genre={props.genre} /> : <SmartStageCameraV236 audio={props.audio} genre={props.genre} playing={props.isPlaying} reducedMotion={props.reducedMotion} duo={dual || auto} composition={compositionV354} genreCue={genreCueV352} timelineCue={timelineCueV354} lipSync={props.lipSync} />}<DynamicStage musicPalette={directedPaletteV352} theme={directedThemeV352} genre={props.genre} audio={props.audio} showCue={props.showCue} isPlaying={props.isPlaying} reducedMotion={props.reducedMotion} reactive={props.stageReactive ?? true} strength={props.stageLightStrength ?? 60} composition={compositionV354} glowGainV353={visualFxCueV355.glowGain} timelineGainV354={timelineCueV354.active&&timelineCueV354.activeLanes.includes("lighting")?timelineCueV354.lightGain:1}
       concertShowCueV387={props.concertShowCueV387} festivalShowCueV394={props.festivalShowCueV394} festivalShowLightingV394={props.festivalShowLightingV394} festivalShowAtmosphereV394={props.festivalShowAtmosphereV394} festivalShowLasersV394={props.festivalShowLasersV394} concertShowLightingV387={props.concertShowLightingV387}
       concertShowAtmosphereV387={props.concertShowAtmosphereV387} concertLipSyncV386={props.lipSync?{...props.lipSync,cameraCastCountV377:groupOnV326?effectiveGroupSettingsV442.count:dual?2:1,
         cameraManualStagePriorityV377:authoredEnabled||manualFormationV354||authoredCueV354.active||props.showCue?.formationsEnabled===true||manualGroupOnV326&&!!groupSettingsV326.trackId||canPlayEnsembleTimelineV325(readEnsembleTimelineV325(),props.track?.id)}:undefined} />
      <StageVisualEffectsV353 cue={visualFxCueV355}/>
      {props.stageScreenSettingsV330?.enabled && props.stageLayoutEnabledV333 && <StageContentScreensV333 screens={props.stageScreensV333??[]} slides={props.stageSlidesV333??[]} push={props.stageLivePushV333??null} index={props.stageRotationIndexV333??0} settings={props.stageScreenSettingsV330} playing={props.isPlaying} reducedMotion={props.reducedMotion} albumCoverUrl={props.track?.albumCoverUrl??null} section={props.cameraDirectorSection??"verse"} beatAccent={props.audio?.kickAccentIntensity??0} genre={props.genre??undefined} lyricsActive={props.lyricsSignalV350?.active??hasActiveLyricsV350(props.lyricsScene?.lyrics,props.lyricsScene?.activeIndex,props.lyricsScene?.progressMs)} lyricsSide={props.lyricsSignalV350?.side??props.lyricsScene?.side??null} composition={compositionV354} genreCue={genreCueV352} fxCue={visualFxCueV355}/>}
      {props.stageScreenSettingsV330?.enabled && !props.stageLayoutEnabledV333 && <StageContentScreenV330 content={props.stageScreenV330??null} settings={props.stageScreenSettingsV330} playing={props.isPlaying} reducedMotion={props.reducedMotion} albumCoverUrl={props.track?.albumCoverUrl??null} section={props.cameraDirectorSection??"verse"} beatAccent={props.audio?.kickAccentIntensity??0} genre={props.genre??undefined} lyricsActive={props.lyricsSignalV350?.active??hasActiveLyricsV350(props.lyricsScene?.lyrics,props.lyricsScene?.activeIndex,props.lyricsScene?.progressMs)} lyricsSide={props.lyricsSignalV350?.side??props.lyricsScene?.side??null} composition={compositionV354} genreCue={genreCueV352} fxCue={visualFxCueV355}/>}
      <ProceduralShaderEnvironmentV468 mode={piConcertEffectsV479.automaticShader?props.shaderEnvironmentV468??'auto':'off'} theme={directedThemeV352} audio={props.audio} playing={props.isPlaying} reducedMotion={props.reducedMotion} color={directedPaletteV352?.primary}/>
      <StageEnvironment theme={directedThemeV352} audio={props.audio} isPlaying={props.isPlaying} reducedMotion={props.reducedMotion} reactive={props.stageReactive ?? true} />
      <DancePostProcessingV468 audio={props.audio} playing={props.isPlaying} reducedMotion={props.reducedMotion}
        enabled={(props.dancePostEnabledV468??true) && piConcertEffectsV479.automaticPostProcess && Boolean(props.danceFxEnabled || props.showCue?.fxEnabled) && compositionV354.fxGain>0.15 && stabilityGainV355>.35}
        strength={(props.danceFxStrength??60)*compositionV354.fxGain*stabilityGainV355}
        drop={props.cameraDirectorSection==='drop' || props.showCue?.section==='drop'}/>
      <DanceFX audio={props.audio} isPlaying={props.isPlaying} reducedMotion={props.reducedMotion} settings={{ tint:visualFxCueV355.active?visualFxCueV355.color:undefined, enabled: props.danceFxEnabled || (piConcertEffectsV479.automaticFx && props.showCue?.fxEnabled), strength: (props.showCue?.fxEnabled ? Math.max(props.danceFxEnabled ? (props.danceFxStrength ?? 0) : 0,Math.round(props.showCue.fxGain*85)) : (props.danceFxStrength ?? 0)) * compositionV354.fxGain * fxScaleV354 * stabilityGainV355, shockwaves: props.danceFxShockwaves || (props.showCue?.fxGain ?? 0) > .7, footprints: props.danceFxFootprints, trails: props.danceFxTrails }} />
      {props.lyricsScene && <Suspense fallback={null}><Lyrics3DScene scene={props.lyricsScene} audio={props.audio} reducedMotion={props.reducedMotion} composition={compositionV354} /></Suspense>}
      <group name={TRACKING_ROOT_NAME}>{groupOnV326 ? <GroupDancersV326 props={autoGroupOnV442?dancerPropsV356:{...dancerPropsV356,multiArtistMotionsV442:undefined}} settings={effectiveGroupSettingsV442}/> : (dual || auto || multiEnabled || showFormation) ? <FormationDancers props={dancerPropsV356} mode={mode} choreography={authoredEnabled ? null : multiEnabled ? choreography : intelligentEnabled ? intelligentCue : null} /> : <group><Dancer props={dancerPropsV356}/><ArtistNameBubbleV441 plan={props.artistBubblePlanV441} slot={0} reducedMotion={props.reducedMotion}/></group>}</group>
    </Canvas></SceneErrorBoundary>}
    <ConcertQualityInspectorV466 enabled={qualityInspectorEnabledV466} onToggle={()=>{
      if(qualityInspectorEnabledV466)resetConcertQualityV466();
      setQualityInspectorEnabledV466(value=>!value);
    }}/>
  </div>;
}
