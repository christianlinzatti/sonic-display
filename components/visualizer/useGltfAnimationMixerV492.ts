"use client";
/** Owns the one existing Drei AnimationMixer and group phrase clip registration. */
import {useContext,useMemo,useEffect,type RefObject} from "react";
import {AnimationMixer,Group,type AnimationAction} from "three";
import {useFrame} from "@react-three/fiber";
import type {AnimationClip} from "three";
import {GroupMotionClockContextV328,GroupPhraseContextV329} from "./ThreeAvatarContextsV492";
import {describeAnimationClipsV329} from "./intelligentMotionPhraseV329";
import {disposeMixerClipsV654} from "./disposeMixerClipsV654";
import type {PreparedGltfBlendV492} from "./useGltfBlendSetupV492";
export function useGltfAnimationMixerV492({playbackClips,root,autoUpperGestureV490,preparedBlendsV492}: {
  playbackClips:AnimationClip[];root:RefObject<Group|null>;
  autoUpperGestureV490:AnimationClip|null;preparedBlendsV492:PreparedGltfBlendV492[];
}) {
  const groupClockV328=useContext(GroupMotionClockContextV328);
  const groupPhraseV329=useContext(GroupPhraseContextV329);
  const phraseProfilesV329=useMemo(()=>groupPhraseV329?.settings.enabled?describeAnimationClipsV329(playbackClips,groupPhraseV329.settings.maxCandidates):[],[playbackClips,groupPhraseV329?.settings.enabled,groupPhraseV329?.settings.maxCandidates]);
  useEffect(()=>{if(groupClockV328 && groupPhraseV329?.settings.enabled)groupPhraseV329.register(groupClockV328.clock.current.slot,phraseProfilesV329);},[groupClockV328?.clock,groupPhraseV329?.register,groupPhraseV329?.settings.enabled,phraseProfilesV329]);
  // Own mixer lifetime rather than drei useAnimations cleanup: some installed
  // drei versions call uncacheAction(action) instead of uncacheAction(clip).
  // Three expects AnimationClip, otherwise every clip change retains actions.
  const fallbackRoot=useMemo(()=>new Group(),[]);
  const groupMixerV328=useMemo(()=>new AnimationMixer(fallbackRoot),[fallbackRoot]);
  // useAnimations used to advance the mixer every render frame; preserve that clock.
  useFrame((_,delta)=>groupMixerV328.update(delta));
  const actions=useMemo<Record<string,AnimationAction|undefined>>(()=>{
    const mapped:Record<string,AnimationAction|undefined>={};
    for(const clip of playbackClips){
      if(!clip.name||Object.prototype.hasOwnProperty.call(mapped,clip.name))continue;
      Object.defineProperty(mapped,clip.name,{
        enumerable:true,configurable:true,
        get:()=>groupMixerV328.clipAction(clip,root.current??fallbackRoot),
      });
    }
    return mapped;
  },[playbackClips,groupMixerV328,root,fallbackRoot]);
  const allActionNamesV490=useMemo(()=>Object.keys(actions),[actions]);
  useEffect(()=>()=>{
    disposeMixerClipsV654(groupMixerV328,playbackClips,root.current??fallbackRoot,fallbackRoot);
  },[groupMixerV328,playbackClips,root,fallbackRoot]);
  useEffect(()=>()=>{
    groupMixerV328.stopAllAction();
    if(root.current)groupMixerV328.uncacheRoot(root.current);
    groupMixerV328.uncacheRoot(fallbackRoot);
  },[groupMixerV328,root,fallbackRoot]);
  // Never offer the generated overlay as a standalone selectable/beat-aligned dance.
  const names=useMemo(()=>allActionNamesV490.filter(n=>n!==autoUpperGestureV490?.name&&
    !preparedBlendsV492.some(p=>p.actionName===n)),
    [allActionNamesV490,autoUpperGestureV490?.name,preparedBlendsV492]);
  return {groupClockV328,groupPhraseV329,actions,names,groupMixerV328};
}
