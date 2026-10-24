"use client";
/** Owns the one existing Drei AnimationMixer and group phrase clip registration. */
import {useContext,useMemo,useEffect,type RefObject} from "react";
import {useAnimations} from "@react-three/drei";
import type {AnimationClip,Group} from "three";
import {GroupMotionClockContextV328,GroupPhraseContextV329} from "./ThreeAvatarContextsV492";
import {describeAnimationClipsV329} from "./intelligentMotionPhraseV329";
import type {PreparedGltfBlendV492} from "./useGltfBlendSetupV492";
export function useGltfAnimationMixerV492({playbackClips,root,autoUpperGestureV490,preparedBlendsV492}: {
  playbackClips:AnimationClip[];root:RefObject<Group|null>;
  autoUpperGestureV490:AnimationClip|null;preparedBlendsV492:PreparedGltfBlendV492[];
}) {
  const groupClockV328=useContext(GroupMotionClockContextV328);
  const groupPhraseV329=useContext(GroupPhraseContextV329);
  const phraseProfilesV329=useMemo(()=>groupPhraseV329?.settings.enabled?describeAnimationClipsV329(playbackClips,groupPhraseV329.settings.maxCandidates):[],[playbackClips,groupPhraseV329?.settings.enabled,groupPhraseV329?.settings.maxCandidates]);
  useEffect(()=>{if(groupClockV328 && groupPhraseV329?.settings.enabled)groupPhraseV329.register(groupClockV328.clock.current.slot,phraseProfilesV329);},[groupClockV328?.clock,groupPhraseV329?.register,groupPhraseV329?.settings.enabled,phraseProfilesV329]);
  const { actions, names:allActionNamesV490, mixer:groupMixerV328 } = useAnimations(playbackClips, root);
  // Never offer the generated overlay as a standalone selectable/beat-aligned dance.
  const names=useMemo(()=>allActionNamesV490.filter(n=>n!==autoUpperGestureV490?.name&&
    !preparedBlendsV492.some(p=>p.actionName===n)),
    [allActionNamesV490,autoUpperGestureV490?.name,preparedBlendsV492]);
  return {groupClockV328,groupPhraseV329,actions,names,groupMixerV328};
}
