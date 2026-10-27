"use client";
/** Builds safe upper-body overlays from installed GLB clips and saved per-model presets. */
import {useState,useEffect,useMemo} from "react";
import {AnimationClip} from "three";
import {GLB_BLEND_CHANGE_V492,readBlendPresetsV492,chooseLiveBlendPresetV492,type GlbBlendPresetV492} from "./glbBlendPresetsV492";
import {isPreviewBlendTrackV491} from "./glbMotionBlendPreviewV491";
import {createMaskedAnimationClip} from "./animationBoneMask";
import {chooseUpperGestureClipV490} from "./automaticGlbUpperBlendV490";
import {createAutomaticUpperClipV490} from "./automaticGlbUpperClipV490";
import type {VisualizerProps} from "./registry";
export type PreparedGltfBlendV492={baseName:string;actionName:string;clip:AnimationClip;weight:number;
  presetId:string;region:'arms'|'upper';genre:'all'|'rap'|'hard'};
export function useGltfBlendSetupV492({clips,url,animationUrl,genre,avatarBlendMask,avatarBlendClip}: {
  clips:AnimationClip[];url:string;animationUrl?:string;genre:VisualizerProps['genre'];
  avatarBlendMask:NonNullable<VisualizerProps['avatarBlendMask']>;avatarBlendClip:string;
}) {
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
    const output:PreparedGltfBlendV492[]=[];
    const eligible=savedBlendsV492.filter(p=>p.autoEnabled&&p.modelUrl===url&&p.animationUrl===(animationUrl??''));
    for(const preset of eligible){
      if(output.length>=8)break;
      const baseName=preset.base.id.startsWith('external:')?`Imported: ${preset.base.name}`:preset.base.name;
      const match=chooseLiveBlendPresetV492([preset],clips,url,animationUrl??'',baseName,genre);
      if(!match)continue;
      const safe=match.overlay.tracks.filter(t=>isPreviewBlendTrackV491(t.name,preset.region)).map(t=>t.clone());
      if(!safe.length)continue;
      const actionName=`GlbPresetV492:${preset.id}`;
      output.push({baseName,actionName,clip:new AnimationClip(actionName,match.overlay.duration,safe),
        weight:preset.weight,presetId:preset.id,region:preset.region,genre:preset.genre});
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
  return {preparedBlendsV492,maskedOverlay,autoUpperGestureV490,playbackClips};
}
