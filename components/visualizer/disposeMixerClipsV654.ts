/** Release Three.js AnimationClip bindings, not AnimationAction instances.
 * Calling uncacheAction(action) is ignored by Three and retains clip bindings.
 */
export function disposeMixerClipsV654<Clip, Root>(mixer:{
  stopAllAction():unknown;
  uncacheAction(clip:Clip,root?:Root):unknown;
}, clips:readonly Clip[],root?:Root,fallback?:Root):void {
  mixer.stopAllAction();
  for(const clip of new Set(clips)) {
    mixer.uncacheAction(clip,root);
    if(fallback!==undefined&&fallback!==root)mixer.uncacheAction(clip,fallback);
  }
}
