"use client";
/**
 * Composes GLB vocal expression in-frame after additive body motion and before
 * hand and foot IK. Does not create another React frame callback or mixer.
 * No singer is inferred where assignments are absent.
 */
import {resolveVocalPerformanceQualityV374} from "./vocalPerformanceQualityV374";
import {overlayDuetV376} from "./interactiveVocalDuetsV376";
import {overlayConcertExpressionV386} from "./expressiveConcertDirectorV386";
import {composeVocalBodyV393} from "./vocalPerformanceIntelligenceV393";
import {composeRapStageV406} from "./rapStagePerformanceV406";
import {composeRapRhythmStageV407} from "./rapRhythmPerformanceV407";
import {normalizeRapEditorV408} from "./rapPerformanceEditorV408";
import {enhanceExpressiveLipV453,addExpressiveHeadV453} from "./expressiveLipSyncV453";
import {refineAdvancedVocalV459,addAdvancedVocalHeadV459} from "./advancedVocalPerformanceV459";
import {applyVocalStageOverlayV371} from "./vocalStageExpressionV371";
import type {createVocalStageOverlayV371} from "./vocalStageExpressionV371";
import type {useUiPreferences} from "@/context/UiPreferencesContext";
import type {usePartnerGesture,usePartnerHand,usePartnerLook} from "./ThreeAvatarContextsV492";
import type {updatePerformanceDirector} from "./performanceDirector";
import type {RapLiveSampleV412} from "./rapChoreographyPresetsV412";
import type {RapGestureSampleV414} from "./rapGestureCuesV414";
import type {RapGrooveSettings} from "./rapGrooveEngine";
import type {AvatarRigTargets} from "./avatarRigController";
import type {VisualizerProps} from "./registry";

type Args={
  propsLipSyncV367:VisualizerProps['lipSync'];audio:VisualizerProps['audio'];
  genre:VisualizerProps['genre'];showCue:VisualizerProps['showCue'];
  reducedMotion:boolean;isPlaying:boolean;workloadSlot:number;
  avatarMotionMode:NonNullable<VisualizerProps['avatarMotionMode']>;stableLibraryClip:string|undefined;
  partnerGesture:ReturnType<typeof usePartnerGesture>;partnerLook:ReturnType<typeof usePartnerLook>;
  partnerHand:ReturnType<typeof usePartnerHand>;
  groovePreferences:ReturnType<typeof useUiPreferences>['preferences'];
  rapLiveEnabledV412:boolean;rapLiveFrameV412:{current:{section:'verse'|'hook';active:RapLiveSampleV412[]}};
  rapLyricsFrameV414:{current:RapGestureSampleV414};preferencesRap:{current:RapGrooveSettings};
  performanceSection:ReturnType<typeof updatePerformanceDirector>['section'];
  rigTargets:{current:AvatarRigTargets};vocalStageOverlayV371:{current:ReturnType<typeof createVocalStageOverlayV371>};
  delta:number;
};
export function applyGltfVocalPerformanceV492({propsLipSyncV367,audio,genre,showCue,reducedMotion,
  isPlaying,workloadSlot,avatarMotionMode,stableLibraryClip,partnerGesture,partnerLook,
  partnerHand,groovePreferences,rapLiveEnabledV412,rapLiveFrameV412,rapLyricsFrameV414,
  preferencesRap,performanceSection,rigTargets,vocalStageOverlayV371,delta}:Args){
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
      section:rapLiveEnabledV412?rapLiveFrameV412.current.section:(showCue?.enabled?showCue.section:performanceSection),
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

 }
