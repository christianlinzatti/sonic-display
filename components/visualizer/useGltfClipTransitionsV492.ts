"use client";
/** GLB selected-clip crossfades, V489 low-pose alignment and foot-plant protection. */
import {useEffect,useRef} from "react";
import type {AnimationAction,AnimationClip} from "three";
import type {VisualizerProps} from "./registry";
import {planDanceTransition,matchedClipTime} from "./smartDanceTransition";
import {findMotionMatch} from "./smartMotionMatching";
import {planNaturalMotionTransitionV537} from "./naturalMotionTransitionsV537";
import {planIntelligentDanceTransitionV565} from "./intelligentDanceTransitionsV565";
import {createNaturalMotionFlowStateV614,planNaturalMotionFlowV614} from "./naturalMotionFlowV614";
import {planNaturalDancePerformanceV630} from "./naturalDancePerformanceV630";
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
  footIK:GltfFootIKRefV492;beatFlowData:{current:BeatFlowResult};musicSectionV565?:string|null;manualSelectionV565?:boolean;
  trackIdV614?:string|null;progressMsV614?:number|null;energyV614?:number|null;
};
export function useGltfClipTransitionsV492({actions,selectedClip,audio,genre,isPlaying,reducedMotion,
  activeSequence,rapLiveEnabledV412,timelineEnabled,timeline,avatarBlendEnabled,avatarBlendClip,
  maskedOverlay,liveTransition,stableLibraryClip,sequenceCrossfade,lowClipV481,smartDanceOverride,
  avatarMotionMode,activeLoop,autoUpperGestureV490,activeLiveBlendV492,avatarCrossfadeSeconds,
  footIK,beatFlowData,musicSectionV565,manualSelectionV565,trackIdV614,progressMsV614,energyV614}:Args) {
  const previousClipRef = useRef<string | null>(null);
  const previousWasLowClipV489 = useRef(false);
  const naturalFlowStateV614=useRef(createNaturalMotionFlowStateV614());
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
      // V537: leg/foot-weighted matching is limited to automatic clip changes.
      // Manual timelines, saved motion loops and explicit dance selections keep V492 entry semantics.
      const automaticV537 = avatarMotionMode !== 'choreography' && !stableLibraryClip &&
        !smartDanceOverride && !activeLoop && !avatarBlendEnabled && !rapLiveEnabledV412 &&
        !timelineEnabled && !activeSequence && !lowMotionV489.active && isPlaying && !reducedMotion;
      const naturalV537 = planNaturalMotionTransitionV537({
        outgoing: outgoingClip, incoming: incomingClip, outgoingSeconds: previousAction?.time ?? NaN,
        baselineSeconds: plan.duration, fallbackSeconds: usableMatch ? match.time :
          plan.preservePhase ? matchedClipTime(plan,incomingClip.duration) : 0,
        plantedLeft: footIK.current.left?.contact.phase === 'planted',
        plantedRight: footIK.current.right?.contact.phase === 'planted',
        automatic: automaticV537, reducedMotion,
      });
      if (naturalV537.mode === 'matched')
        nextAction.time = naturalV537.entrySeconds;
      else if (usableMatch && (!lowMotionV489.active || lowMotionV489.allowPoseMatch))
        nextAction.time = Math.max(0, Math.min(match.time, Math.max(0, incomingClip.duration - 0.001)));
      else if (plan.preservePhase && (!lowMotionV489.active || lowMotionV489.allowPhaseFallback))
        nextAction.time = matchedClipTime(plan, incomingClip.duration);
      const fadeDurationV311 = polishAutomaticCrossfadeV311(plan, {
        settings:readDancePerformanceV311(), bpm:audio.bpm, genre, planted:grounded,
        manual:avatarMotionMode==="choreography" || !!stableLibraryClip, reducedMotion, playing:isPlaying,
        matchScore:usableMatch ? match?.score : undefined,
      });
      effectiveFadeDurationV311 = lowMotionV489.active ? lowMotionV489.fadeSeconds :
        naturalV537.mode === 'matched' ? Math.max(fadeDurationV311,naturalV537.fadeSeconds) : fadeDurationV311;
      // V565 only refines automatic duration after V537/V489/V311 decisions.
      // Never alters the matched entry time, manual priorities, planted IK anchors
      // or any prepared V493 blend action's own lifecycle.
      const autoV565=automaticV537 && !lowMotionV489.active && !manualSelectionV565;
      const intelligentV565=planIntelligentDanceTransitionV565({
        baselineSeconds:effectiveFadeDurationV311,section:musicSectionV565,
        playing:isPlaying,reducedMotion,automatic:autoV565,
        quality:getActivePerformanceTier(),
        plantedLeft:footIK.current.left?.contact.phase==='planted',
        plantedRight:footIK.current.right?.contact.phase==='planted',
        kickOnset:beatFlowData.current.kickOnset,snareOnset:beatFlowData.current.snareOnset,
        matchScore:naturalV537.mode==='matched'?naturalV537.score:usableMatch?match?.score:null,
        outgoingSeconds:previousAction?.time,outgoingDuration:outgoingClip?.duration,
        incomingDuration:incomingClip.duration,
      });
      if(intelligentV565.enabled)effectiveFadeDurationV311=intelligentV565.fadeSeconds;
      // V614: refine only the already selected automatic clip. V537 matched
      // entry time, V565 beat evidence, V135 foot anchors and manual priorities win.
      // No additional render loop, timers, stop/reset of the outgoing action.
      const flowV614=planNaturalMotionFlowV614(naturalFlowStateV614.current,{
        trackId:trackIdV614,progressMs:progressMsV614,
        outgoingName:previousName,incomingName:selectedClip,
        outgoingDuration:outgoingClip?.duration,incomingDuration:incomingClip.duration,
        baseSeconds:effectiveFadeDurationV311,section:musicSectionV565,genre,bpm:audio.bpm,
        energy:energyV614,kickOnset:beatFlowData.current.kickOnset,
        snareOnset:beatFlowData.current.snareOnset,
        plantedLeft:footIK.current.left?.contact.phase==='planted',
        plantedRight:footIK.current.right?.contact.phase==='planted',
        matchScore:naturalV537.mode==='matched'?naturalV537.score:usableMatch?match?.score:null,
        automatic:autoV565,playing:isPlaying,reducedMotion,quality:getActivePerformanceTier(),
      });
      naturalFlowStateV614.current=flowV614.state;
      if(flowV614.enabled)effectiveFadeDurationV311=flowV614.fadeSeconds;
      // V630 reads real lower-body GLB keyframes at the EXISTING V537/V492 seek.
      // Only a supported mismatch can extend the already approved automatic fade.
      // Manual clip selection, low-pose transitions and locked IK anchors are untouched.
      const naturalPerformanceV630=planNaturalDancePerformanceV630({
        outgoing:outgoingClip,incoming:incomingClip,
        outgoingSeconds:previousAction?.time,incomingSeconds:nextAction.time,
        baseSeconds:effectiveFadeDurationV311,bpm:audio.bpm,
        plantedLeft:footIK.current.left?.contact.phase==='planted',
        plantedRight:footIK.current.right?.contact.phase==='planted',
        rapidSwitch:flowV614.previousSwitchWasRapid,
        automatic:autoV565&&!manualSelectionV565,playing:isPlaying,
        reducedMotion,quality:getActivePerformanceTier(),
      });
      if(naturalPerformanceV630.enabled)effectiveFadeDurationV311=naturalPerformanceV630.fadeSeconds;
      nextAction.paused = !isPlaying || reducedMotion;
      nextAction.fadeIn(effectiveFadeDurationV311).play();
      // A valid foot plant remains anchored by V135 IK while both actions overlap.
      // Never reset foot-contact trackers as part of a clip transition.
    } else if (nextAction) {
      nextAction.paused = !isPlaying || reducedMotion;
    }
    Object.entries(actions).forEach(([name, action]) => {
      // V493 owns the fade of *every* prepared GLB preset action, including the
      // outgoing preset. Otherwise a primary-clip effect could cut the overlay.
      if (name !== selectedClip && name !== autoUpperGestureV490?.name &&
          !name.startsWith('GlbPresetV492:') && name !== activeLiveBlendV492?.actionName &&
          !(avatarBlendEnabled && name === (maskedOverlay?.name ?? avatarBlendClip))) action?.fadeOut(effectiveFadeDurationV311);
    });
    previousClipRef.current = selectedClip ?? null;
    previousWasLowClipV489.current = !!lowClipV481 && selectedClip === lowClipV481;
  }, [actions, selectedClip, avatarCrossfadeSeconds, audio.bpm, genre, isPlaying, reducedMotion, activeSequence, timelineEnabled, timeline.segments.length, rapLiveEnabledV412, avatarBlendEnabled, avatarBlendClip, maskedOverlay, liveTransition, stableLibraryClip, sequenceCrossfade, lowClipV481, smartDanceOverride, avatarMotionMode, activeLoop, autoUpperGestureV490?.name, activeLiveBlendV492?.actionName, musicSectionV565, manualSelectionV565, trackIdV614]);
}
