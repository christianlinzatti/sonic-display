"use client";
/** GLB selected-clip crossfades, V489 low-pose alignment and foot-plant protection. */
import {useEffect,useRef} from "react";
import type {AnimationAction,AnimationClip} from "three";
import type {VisualizerProps} from "./registry";
import {planDanceTransition,matchedClipTime} from "./smartDanceTransition";
import {findMotionMatch} from "./smartMotionMatching";
import {resolveLiveTransitionDuration} from "./liveMotionTransitionDirector";
import type {readMotionTransitionSettings} from "./motionTransitionStudioSettings";
import {planNaturalGlbMotionV489} from "./naturalGlbFullBodyMotionV489";
import {polishAutomaticCrossfadeV311,readDancePerformanceV311} from "./advancedDancePerformanceV311";
import {getActivePerformanceTier} from "./adaptivePerformance";
import type {BeatFlowResult} from "./beatFlowDetector";
import type {GltfFootIKRefV492} from "./useGltfFootContactV492";
import type {AvatarLoopPreset} from "./avatarLoopPresets";
import type {getActiveChoreography} from "./avatarChoreographies";
import type {resolveEvolutionCrossfade} from "./smartChoreographyEvolution";

type Args={
  actions:Record<string,AnimationAction|null|undefined>;selectedClip:string|undefined;
  audio:VisualizerProps['audio'];genre:VisualizerProps['genre'];isPlaying:boolean;reducedMotion:boolean;
  activeSequence:ReturnType<typeof getActiveChoreography>;rapLiveEnabledV412:boolean;
  timelineEnabled:boolean;timeline:{segments:unknown[]};
  avatarBlendEnabled:boolean;avatarBlendClip:string;maskedOverlay:AnimationClip|null;
  liveTransition:ReturnType<typeof readMotionTransitionSettings>;
  stableLibraryClip:string|undefined;sequenceCrossfade:ReturnType<typeof resolveEvolutionCrossfade>;
  lowClipV481:string|null;smartDanceOverride:string;avatarMotionMode:NonNullable<VisualizerProps['avatarMotionMode']>;
  activeLoop:AvatarLoopPreset|null;autoUpperGestureV490:AnimationClip|null;
  activeLiveBlendV492:{actionName:string}|null;avatarCrossfadeSeconds:number;
  footIK:GltfFootIKRefV492;beatFlowData:{current:BeatFlowResult};
};
export function useGltfClipTransitionsV492({actions,selectedClip,audio,genre,isPlaying,reducedMotion,
  activeSequence,rapLiveEnabledV412,timelineEnabled,timeline,avatarBlendEnabled,avatarBlendClip,
  maskedOverlay,liveTransition,stableLibraryClip,sequenceCrossfade,lowClipV481,smartDanceOverride,
  avatarMotionMode,activeLoop,autoUpperGestureV490,activeLiveBlendV492,avatarCrossfadeSeconds,
  footIK,beatFlowData}:Args) {
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
}
