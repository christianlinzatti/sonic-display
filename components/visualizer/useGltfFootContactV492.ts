"use client";
/**
 * Shared GLB foot grounding. Run updateFootGrounding at the original end-of-frame
 * point, after authored clips / additive rig animation; do not add another useFrame.
 */
import { useContext, useEffect, useRef, type RefObject } from "react";
import { Vector3, type Group, type Object3D } from "three";
import { GroupFootSupportContextV486, GroupGroundObservationContextV487 } from "./ThreeAvatarContextsV492";
import { createFootContactState, updateFootContact } from "./avatarFootContact";
import { createFootIKState, initializeFootIK, updateFootIK } from "./avatarFootIK";
import { createBeatFootworkState, updateBeatFootwork } from "./beatPerfectFootworkV234";
import { readFootLockV322, groundLockReportV322, FOOT_LOCK_DIAGNOSTIC_EVENT_V322 } from "./intelligentFootLockV322";
import { collectAvatarRigNodes, type AvatarRigTargets } from "./avatarRigController";
import type { AvatarRigProfileId } from "./avatarRigProfiles";
import { measureProfilerPhase } from "./runtimeProfiler";
import { sampleIKQuality } from "./ikMotionAnalyzer";
import type { VisualizerProps } from "./registry";
import type { JointConstraintMap } from "./jointConstraintCalibration";
import type { updatePartnerHandIK } from "./partnerHandIK";

export type GltfFootIKRefV492 = {current: ReturnType<typeof createFootIKState>};

type GroundingArgs = {
  delta:number; elapsed:number; root:Group; audio:VisualizerProps['audio'];
  genre:VisualizerProps['genre']; playing:boolean; reducedMotion:boolean;
  enabled:boolean; strength:number; contact:number; lock:number;
  trackId:string; progressMs:number|undefined;
  rigTargets:{current:AvatarRigTargets}; constraints:{current:JointConstraintMap};
  avatarKey:string; ikQualitySampler:{current:Parameters<typeof sampleIKQuality>[0]};
  handIK:{current:Parameters<typeof sampleIKQuality>[1]['handState']};
  activeHandCue:Parameters<typeof updatePartnerHandIK>[2];
};
export function useGltfFootContactV492(root:RefObject<Group|null>,model:Object3D,rigTargets:{current:AvatarRigTargets},profile:AvatarRigProfileId) {
  const groupSupportV486=useContext(GroupFootSupportContextV486);
  const groupGroundV487=useContext(GroupGroundObservationContextV487);
  const groundProbeV487=useRef(new Vector3());
  const footContact=useRef(createFootContactState());
  const footIK=useRef(createFootIKState());
  const footLockLastReportV322=useRef(0);
  const beatFootworkV234=useRef(createBeatFootworkState());
  useEffect(() => {
    if (root.current) {
      rigTargets.current = collectAvatarRigNodes(root.current, profile).targets;
      footContact.current = createFootContactState();
      footIK.current = initializeFootIK(root.current, rigTargets.current);
    }
  }, [model, profile]);

  function updateFootGrounding({delta,elapsed,root:avatarRoot,audio,genre,playing:isPlaying,reducedMotion,
    enabled:avatarFootIKEnabled,strength:avatarFootIKStrength,contact:avatarFootIKContact,
    lock:avatarFootIKLock,trackId,progressMs,rigTargets, constraints:ikConstraints,
    avatarKey,ikQualitySampler,handIK,activeHandCue}:GroundingArgs) {
    // Keep the original IK/fallback/diagnostic order. Neither model nor tracks are mutated here.
    const footCueV234 = updateBeatFootwork(beatFootworkV234.current, {
      beat: audio.beat, beatStrength: audio.beatStrength, kick: audio.kickAccentIntensity,
      bpm: audio.bpm ?? undefined, genre, playing: isPlaying, reducedMotion, delta,
    });
    const enableIK = avatarFootIKEnabled && isPlaying && !reducedMotion;
    const activeIK = measureProfilerPhase("footIK", () => updateFootIK(footIK.current, avatarRoot, delta, enableIK, avatarFootIKStrength / 100, Math.min(1, avatarFootIKContact / 100 + footCueV234.contactBoost), Math.min(1, avatarFootIKLock / 100 + footCueV234.lockBoost), ikConstraints.current, footCueV234, readFootLockV322(), {trackId,playheadMs:progressMs}));
    if(activeIK&&readFootLockV322().enabled&&elapsed-footLockLastReportV322.current>=1&&typeof window!=='undefined'){
      footLockLastReportV322.current=elapsed;
      window.dispatchEvent(new CustomEvent(FOOT_LOCK_DIAGNOSTIC_EVENT_V322,{detail:groundLockReportV322(footIK.current.groundV322)}));
    }
    if (!activeIK) updateFootContact(footContact.current, avatarRoot, rigTargets.current, delta, enableIK, avatarFootIKStrength / 100);
    // V486: publish only the existing measured IK stance to the parent group.
    if(groupSupportV486){
      groupSupportV486.current.tracked=activeIK;
      groupSupportV486.current.leftPlanted=activeIK&&footIK.current.left?.contact.phase==='planted';
      groupSupportV486.current.rightPlanted=activeIK&&footIK.current.right?.contact.phase==='planted';
    }
    // V487: model-relative drift of planted ankles, with a scratch vector reused.
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
    const arm=rigTargets.current;
    sampleIKQuality(ikQualitySampler.current, {dancer:avatarKey, dt:delta, active:isPlaying && !reducedMotion, foot:footIK.current, rig:{upper:arm.rightArm,lower:arm.rightForearm,hand:arm.rightHand}, handState:handIK.current, cue:activeHandCue});
  }
  return {footIK, updateFootGrounding};
}
