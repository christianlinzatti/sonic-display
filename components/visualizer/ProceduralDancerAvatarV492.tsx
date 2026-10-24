"use client";
// Extracted unchanged from ThreeAvatar.tsx (V492 modular refactor).
// --- Extracted dependencies (V492 refactor) ---
import { observeReviewMotionV314 } from "./dancePerformanceReviewV314";
import { createEmotionV233State, updateEmotionV233 } from "./emotionExpressionV233";
import { recordAvatarFrame, releaseAvatarFrame } from "./avatarFrameProfiler";
import { shouldRunScheduledTask, releaseScheduledInstance } from "./adaptiveAnimationScheduler";
import { createDanceQualityState, enhanceDanceQuality, readDanceQualitySettings, NEUTRAL_QUALITY_MOTION } from "./danceQualityV307";
import { createAdvancedDanceStateV311, refineDancePerformanceV311, readDancePerformanceV311 } from "./advancedDancePerformanceV311";
import { createDanceFlowStateV391, refineDanceFlowV391, readDanceFlowV391 } from "./naturalDanceIntelligenceV391";
import { createNaturalDanceStateV320, refineNaturalDanceV320, readNaturalDanceV320 } from "./naturalDanceIntelligenceV320";
import { useUiPreferences } from "@/context/UiPreferencesContext";
import { useFrame } from "@react-three/fiber";
import { useId, useContext, useEffect, useRef } from "react";
import { type Group, type Mesh } from "three";
import type { VisualizerProps } from "./registry";
import { resolveVocalPerformanceQualityV374 } from "./vocalPerformanceQualityV374";
import { composeVocalBodyV393 } from "./vocalPerformanceIntelligenceV393";
import { composeRapFaceV406, composeRapStageV406 } from "./rapStagePerformanceV406";
import { enhanceExpressiveLipV453, addExpressiveHeadV453 } from "./expressiveLipSyncV453";
import { refineAdvancedVocalV459, addAdvancedVocalHeadV459 } from "./advancedVocalPerformanceV459";
import { refineExpressiveLipV476 } from "./expressiveLipSyncV476";
import { composeRapRhythmStageV407 } from "./rapRhythmPerformanceV407";
import { overlayDuetV376 } from "./interactiveVocalDuetsV376";
import { overlayConcertExpressionV386 } from "./expressiveConcertDirectorV386";
import { resolveRapDuetCueV416 } from "./rapDuetStudioV416";
import { resolveVocalDanceAccentV472 } from "./vocalAwareChoreographyV472";
import { enhanceRapAccentV473 } from "./rapFlowIntelligenceV473";
import { resolveNaturalRapGestureV474 } from "./naturalRapGestureVarietyV474";
import { solveProceduralLowLegV481 } from "./intelligentLowPoseV481";
import { newNaturalLowPoseStateV482, stepNaturalLowPoseV482 } from "./naturalLowPoseTransitionsV482";
import { planNaturalFullBodyV488 } from "./naturalFullBodyDanceV488";
import { getAvatarAnimationState } from "./avatarAnimationEngine";
import { createDanceIntelligenceState, getDanceIntelligenceMultipliers, updateDanceIntelligence } from "./danceIntelligence";
import { getAvatarExpressionState } from "./avatarExpressionEngine";
import { createPerformanceDirectorState, updatePerformanceDirector } from "./performanceDirector";
import { createMusicalStructureState, getMusicalStructure, updateMusicalStructure } from "./musicalStructureEngine";
import { resolveGenreMotionV471 } from "./genreChoreographyV471";
import { publishDancePerformance, nextPhraseBoundary } from "./dancePerformanceStore";
import { createFrameSampler, sampleAvatarFrame } from "./danceDiagnosticsStore";
import { getActivePerformanceTier } from "./adaptivePerformance";
import { rapGroovePose, DEFAULT_RAP_GROOVE } from "./rapGrooveEngine";
import { GroupDanceMotionContextV485, GroupFootworkContextV486, GroupLowPoseContextV481, usePartnerGesture, usePartnerLook } from './ThreeAvatarContextsV492';

export function ProceduralAvatar({ audio, isPlaying, reducedMotion, genre, genreFusion, avatarScale = 1, avatarOffsetY = 0, avatarAnimationIntensity = 1, avatarDancePreset = "auto", danceAggression = 0.5, danceMotionStyle = "balanced", avatarMotionMode = "hybrid", avatarArmResponse = 1, avatarLegResponse = 1, track, lipSync, showCue, workloadSlot = 0 }: VisualizerProps & {workloadSlot?:number}) {
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

