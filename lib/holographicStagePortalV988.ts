/** V988 – Holographic Stage Portal.
 * Pure, deterministic, virtual-only geometry plan for an existing R3F canvas.
 * Musical sections must be verified by V318/V966. No new timeline, lights,
 * timers, network, sound, postprocessing or physical-device commands.
 */
import type {ImmersiveCueV966} from './immersiveConcertEngineV966';
import type {ConcertSceneV958,ConcertSettingsV958} from './ultimateConcertRoadmapV958';

export type PortalModeV988='arch'|'tunnel';
export type PortalRingV988=Readonly<{z:number;radius:number;width:number;opacity:number;rotation:number;arc:number}>;
export type PortalRayV988=Readonly<{x:number;y:number;length:number;opacity:number}>;
export type HolographicPortalV988=Readonly<{
 active:boolean;mode:PortalModeV988;colorA:string;colorB:string;
 rings:readonly PortalRingV988[];rays:readonly PortalRayV988[];
}>;
export type HolographicPortalInputV988=Readonly<{
 cue:ImmersiveCueV966;scene:ConcertSceneV958|null|undefined;
 settings:ConcertSettingsV958;lowPerformance:boolean;reducedMotion:boolean;
 lyricsVisible:boolean;showBackdrop:boolean;playing:boolean;
}>;

const OFF: HolographicPortalV988=Object.freeze({active:false,mode:'arch',colorA:'#000000',colorB:'#000000',rings:[],rays:[]});
const HEX=/^#[0-9a-f]{6}$/i;
const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));

/** An elegant open arch in verses, long geometric tunnel at verified peaks.
 * Safety gates are deliberately repeated even after V966's own protections.
 */
export function planHolographicStagePortalV988(i:HolographicPortalInputV988):HolographicPortalV988{
 const {settings:s,scene,cue}=i;
 if(!s.enabled||!s.virtualFx||!s.immersiveV966||!s.portalV988||
  !i.playing||!cue.active||!scene?.verified||scene.timelineOverride||
  i.lowPerformance||!i.showBackdrop||
  !HEX.test(cue.colorA)||!HEX.test(cue.colorB)||
  !Number.isFinite(s.portalStrengthV988)||s.portalStrengthV988<=0||s.portalStrengthV988>100||
  !Number.isFinite(cue.sideGlowOpacity)||cue.sideGlowOpacity<.012||cue.sideGlowOpacity>.2||
  !Number.isFinite(cue.motionPhase)||!Number.isFinite(cue.archScale)||
  cue.archScale<.9||cue.archScale>1.1||
  !['auto','arch','tunnel'].includes(s.portalModeV988))return OFF;
 const peak=['anthem','anticipation','impact','finale'].includes(cue.mood);
 const mode:PortalModeV988=s.portalModeV988==='auto'?(peak?'tunnel':'arch'):s.portalModeV988;
 const strength=clamp(s.portalStrengthV988/100,0,1);
 const lyricFactor=i.lyricsVisible?.60:1;
 // Soft alpha, never a full-screen or high-frequency flash. V966 section fade
 // and its accessibility/sensitivity adjustments remain authoritative.
 const alpha=clamp(cue.sideGlowOpacity*.55*strength*lyricFactor,0,.085);
 if(alpha<.003)return OFF;
 const count=mode==='arch'?2:i.reducedMotion?2:4;
 const motion=i.reducedMotion?0:Math.sin(cue.motionPhase)*.04;
 const rings:PortalRingV988[]=Array.from({length:count},(_,index)=>({
  z:-5.30-index*.58,
  radius:(mode==='arch'?2.55-index*.13:2.62-index*.33)*cue.archScale,
  width:mode==='arch'?.030:.025,
  opacity:Math.min(.085,alpha*(1-index*.14)),
  rotation:motion*(index%2===0?1:-1),
  arc:mode==='arch'?Math.PI:Math.PI*2,
 }));
 // Four weak perspective rails only at verified high energy, kept behind cast.
 const rays:PortalRayV988[]=(mode==='tunnel'&&!i.reducedMotion&&alpha>.012)?[
  {x:-1.72,y:-.66,length:1.5,opacity:Math.min(.045,alpha*.45)},
  {x:1.72,y:-.66,length:1.5,opacity:Math.min(.045,alpha*.45)},
  {x:-1.72,y:3.92,length:1.5,opacity:Math.min(.045,alpha*.35)},
  {x:1.72,y:3.92,length:1.5,opacity:Math.min(.045,alpha*.35)},
 ]:[];
 return {active:true,mode,colorA:cue.colorA,colorB:cue.colorB,rings,rays};
}
