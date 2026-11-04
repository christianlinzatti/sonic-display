/** V914 – Advanced, deterministic transitions for custom V912 Govee concert shows.
 * Whole-lamp RGB and brightness only, no power commands, strobe, or network operations.
 * This module is pure so preview and opt-in live lighting can use the same planner.
 */
import type {GoveeLookV909} from '@/lib/goveeLanV909';
import type {GoveePhaseV911} from '@/lib/goveeConcertDirectorV911';
import {planGoveeShowLookV912,type GoveeLookPlannerV912,type GoveeShowV912} from '@/lib/goveeLightShowV912';

export const GOVEE_TRANSITION_CURVES_V914=['smooth','linear','sine','ease-in','ease-out','cinematic'] as const;
export const GOVEE_MOTION_STYLES_V914=['steady','breath','lift'] as const;
export type GoveeTransitionCurveV914=typeof GOVEE_TRANSITION_CURVES_V914[number];
export type GoveeMotionStyleV914=typeof GOVEE_MOTION_STYLES_V914[number];

const clamp=(value:number,min:number,max:number):number=>Math.max(min,Math.min(max,Number.isFinite(value)?value:min));
export function normalizeGoveeCurveV914(input:unknown):GoveeTransitionCurveV914{
 return typeof input==='string'&&GOVEE_TRANSITION_CURVES_V914.some(item=>item===input)?input as GoveeTransitionCurveV914:'smooth';
}
export function normalizeGoveeMotionV914(input:unknown):GoveeMotionStyleV914{
 return typeof input==='string'&&GOVEE_MOTION_STYLES_V914.some(item=>item===input)?input as GoveeMotionStyleV914:'steady';
}
/** Curve domain and range are [0,1]; every curve is nondecreasing with fixed endpoints.
 * Cinematic has a short hold, then a gradual rise, never an instantaneous flash.
 */
export function easeGoveeTransitionV914(progress:number,curve:GoveeTransitionCurveV914):number{
 const t=clamp(progress,0,1);
 switch(normalizeGoveeCurveV914(curve)){
  case 'linear':return t;
  case 'sine':return (1-Math.cos(Math.PI*t))/2;
  case 'ease-in':return t*t*t;
  case 'ease-out':return 1-(1-t)**3;
  case 'cinematic':{
   if(t<=.14)return 0;
   const u=clamp((t-.14)/.86,0,1);
   return u*u*(3-2*u);
  }
  default:return t*t*(3-2*t);
 }
}
const lerp=(a:number,b:number,t:number)=>Math.round(a+(b-a)*t);
export function blendGoveeTransitionV914(from:GoveeLookV909,to:GoveeLookV909,progress:number,curve:GoveeTransitionCurveV914):GoveeLookV909{
 const t=easeGoveeTransitionV914(progress,curve);
 return {brightness:lerp(from.brightness,to.brightness,t),color:{
  r:lerp(from.color.r,to.color.r,t),g:lerp(from.color.g,to.color.g,t),b:lerp(from.color.b,to.color.b,t)}};
}
/** Slow brightness-only motion: 9-second breathing or a restrained 4% transition crest.
 * Capped by the current master setting, with no intentional blackout or flashing.
 */
export function applyGoveeMotionV914(look:GoveeLookV909,style:GoveeMotionStyleV914,progressMs:number,transition:number,masterBrightness:number):GoveeLookV909{
 const motion=normalizeGoveeMotionV914(style);
 if(motion==='steady')return look;
 const phase=clamp(transition,0,1);
 const wave=motion==='breath'
  ?(Math.sin(2*Math.PI*Math.max(0,Number.isFinite(progressMs)?progressMs:0)/9000)-1)*.025
  :.04*Math.sin(Math.PI*phase);
 const ceiling=clamp(masterBrightness,20,100);
 const brightness=Math.round(clamp(look.brightness*(1+wave),20,ceiling));
 return {...look,brightness};
}
export function getGoveeTransitionOptionsV914(show:GoveeShowV912,ip:string,phase:GoveePhaseV911):{curve:GoveeTransitionCurveV914;motion:GoveeMotionStyleV914}{
 const cue=show.cues[ip]?.[phase];
 return {curve:normalizeGoveeCurveV914(cue?.curveV914),motion:normalizeGoveeMotionV914(cue?.motionV914)};
}
/** Reuses the exact legacy phase look planner (including fallback and master cap),
 * but interpolates via V914 curves. No changes to old V912 calls or storage schema.
 */
export function planGoveeAdvancedShowLookV914(args:GoveeLookPlannerV912&{show:GoveeShowV912;ip:string}):GoveeLookV909{
 const previous=args.phase.previous,current=args.phase.phase;
 const single=(phase:typeof current)=>planGoveeShowLookV912({...args,phase:{...args.phase,phase,previous:phase,transition:1}});
 const start=single(previous);
 const target=previous===current?start:single(current);
 const opts=getGoveeTransitionOptionsV914(args.show,args.ip,current);
 const blended=blendGoveeTransitionV914(start,target,args.phase.transition,opts.curve);
 return applyGoveeMotionV914(blended,opts.motion,args.progressMs,args.phase.transition,args.config.masterBrightness);
}
