/** V982 — lightweight 3D depth accents for verified high-energy scenes.
 * Three bounded transparent rings on the existing canvas; no timers, lights,
 * assets, external network or new render pass. V966 controls all opt-out gates.
 */
import type {ImmersiveCueV966} from './immersiveConcertEngineV966';
export interface DepthRingV982 { readonly z:number;readonly radius:number;readonly opacity:number;readonly width:number }
export function planImmersiveDepthV982(cue:ImmersiveCueV966):readonly DepthRingV982[]{
 if(!cue.active||!['anthem','anticipation','impact','finale'].includes(cue.mood)||
  !Number.isFinite(cue.sideGlowOpacity)||cue.sideGlowOpacity<=.015||
  !Number.isFinite(cue.archScale))return [];
 const gain=Math.max(0,Math.min(.055,cue.sideGlowOpacity*.28));
 if(gain<.004)return [];
 return [
  {z:-4.55,radius:2.55,opacity:gain,width:.022},
  {z:-4.75,radius:3.05,opacity:gain*.68,width:.025},
  {z:-5.05,radius:3.58,opacity:gain*.46,width:.03},
 ];
}
