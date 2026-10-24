"use client";
/** Manual blend and V490/V492 automatic upper-body overlays. No extra mixer. */
import {useRef,useEffect} from "react";
import {useFrame} from "@react-three/fiber";
import type {AnimationAction,AnimationClip} from "three";
import type {VisualizerProps} from "./registry";
import type {GltfFootIKRefV492} from "./useGltfFootContactV492";
import {targetBlendWeight,smoothBlend,syncedClipSpeed} from "./motionBlendEngine";
import {planUpperBlendV490} from "./automaticGlbUpperBlendV490";
import {getActivePerformanceTier} from "./adaptivePerformance";
import type {getActiveChoreography} from "./avatarChoreographies";
import type {AvatarLoopPreset} from "./avatarLoopPresets";
import type {PreparedGltfBlendV492} from "./useGltfBlendSetupV492";

type Args={
 actions:Record<string,AnimationAction|null|undefined>;maskedOverlay:AnimationClip|null;
 avatarBlendClip:string;avatarBlendEnabled:boolean;avatarBlendWeight:number;
 avatarBlendAutoEnergy:boolean;avatarBlendCurve:NonNullable<VisualizerProps['avatarBlendCurve']>;
 avatarBlendSmoothing:number;avatarBlendSpeed:number;avatarBlendReferenceBpm:number;
 avatarBlendBpmSync:boolean;avatarCrossfadeSeconds:number;
 timelineEnabled:boolean;isPlaying:boolean;reducedMotion:boolean;
 activeSequence:ReturnType<typeof getActiveChoreography>;activeLoop:AvatarLoopPreset|null;
 avatarMotionMode:NonNullable<VisualizerProps['avatarMotionMode']>;
 selectedClip:string|undefined;audio:VisualizerProps['audio'];
 autoUpperGestureV490:AnimationClip|null;lowClipV481:string|null;
 rapLiveEnabledV412:boolean;stableLibraryClip:string|undefined;smartDanceOverride:string;
 groupClockV328:{settings:{enabled:boolean}}|null;
 groupPhraseV329:{settings:{enabled:boolean}}|null;
 activeLiveBlendV492:PreparedGltfBlendV492|null;
 footIK:GltfFootIKRefV492;genre:VisualizerProps['genre'];showCue:VisualizerProps['showCue'];
};
export function useGltfBlendPlaybackV492({actions,maskedOverlay,avatarBlendClip,avatarBlendEnabled,
  avatarBlendWeight,avatarBlendAutoEnergy,avatarBlendCurve,avatarBlendSmoothing,avatarBlendSpeed,
  avatarBlendReferenceBpm,avatarBlendBpmSync,avatarCrossfadeSeconds,timelineEnabled,isPlaying,
  reducedMotion,activeSequence,activeLoop,avatarMotionMode,selectedClip,audio,autoUpperGestureV490,
  lowClipV481,rapLiveEnabledV412,stableLibraryClip,smartDanceOverride,groupClockV328,
  groupPhraseV329,activeLiveBlendV492,footIK,genre,showCue}:Args) {
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
  return overlayName;
}
