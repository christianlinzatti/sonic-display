import {AnimationClip} from 'three';
import {safeUpperGestureTrackV490} from './automaticGlbUpperBlendV490';
/** Clone only relevant rotation channels. Original clips remain untouched.
 * Stable name makes the overlay invisible to the normal clip chooser. */
export function createAutomaticUpperClipV490(source:AnimationClip|null):AnimationClip|null{
  if(!source)return null;
  const tracks=source.tracks.filter(t=>safeUpperGestureTrackV490(t.name));
  if(tracks.length<2)return null;
  return new AnimationClip(`AutoUpper V490: ${source.name}`,source.duration,
    tracks.map(track=>track.clone()),source.blendMode);
}
