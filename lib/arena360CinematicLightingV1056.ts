/** V1056 · Cinematic Concert Lighting 2.0.
 * Pure optical cue for the EXISTING two V1032 spotlights. It never owns music,
 * camera, Govee, a timer, an extra light or an inferred beat/drop.
 * The seven chapters are authored templates, not detected song sections.
 */
import {normalizeArenaShowPlanV1040} from './arena360ShowDesignerV1040';
import type {ArenaShowPlanV1040,ArenaShowCueV1040} from './arena360ShowDesignerV1040';

export type LightingFocusV1056='center'|'lead'|'duet'|'wide';
export type CinematicLightCueV1056={
 active:boolean;reason:'disabled'|'paused'|'motion'|'quality'|'clock'|'show'|'planned';
 chapter:number;focus:LightingFocusV1056;colorA:string;colorB:string;
 gainA:number;gainB:number;followWeight:number;
};
const clamp=(n:unknown,min:number,max:number,fallback:number):number=>
 typeof n==='number'&&Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;
const smooth=(n:number)=>{const t=clamp(n,0,1,0);return t*t*(3-2*t);};
const LOOKS:readonly LightingFocusV1056[]=['center','lead','wide','duet','wide','lead','duet'];
const PALETTES={
 rap:[['#72baff','#db69ee'],['#75c9ff','#a27eff'],['#80b3ff','#d16ae7']],
 rock:[['#fdb76b','#ee5677'],['#fca268','#e8805b'],['#ffcc77','#fb6786']],
 hard:[['#60d8fa','#cc72ff'],['#71e2fa','#eb65c2'],['#78caff','#b18aff']],
 pop:[['#87dcff','#ef98de'],['#91f2cf','#d6a1fa'],['#8bbefd','#f0a5cb']],
} as const;
const off=(reason:CinematicLightCueV1056['reason']='disabled'):CinematicLightCueV1056=>({
 active:false,reason,chapter:-1,focus:'center',colorA:'#6edfff',colorB:'#f57bfb',
 gainA:1,gainB:1,followWeight:0,
});
function stableHash(value:string):number{
 let h=2166136261;
 for(let i=0;i<Math.min(256,value.length);i++)h=Math.imul(h^value.charCodeAt(i),16777619)>>>0;
 return h;
}
/** Fails closed for edited/mismatched timelines, stale clocks and explicit motion
 * /quality limits. Intensity is a smooth bounded multiplier, never a flash.
 */
export function planCinematicLightingV1056(input:{
 enabled:boolean;stageIsArena:boolean;lightsEnabled:boolean;playing:boolean;
 reducedMotion:boolean;reactive?:boolean;performanceTier?:'low'|'balanced'|'high'|null;
 trackId?:string|null;progressMs?:number|null;durationMs?:number|null;
 plan?:ArenaShowPlanV1040|null;show?:ArenaShowCueV1040|null;strength?:number|null;
}):CinematicLightCueV1056{
 if(!input.enabled||!input.stageIsArena||!input.lightsEnabled||input.reactive===false)return off();
 if(!input.playing)return off('paused');
 if(input.reducedMotion)return off('motion');
 if(input.performanceTier==='low')return off('quality');
 const {trackId,progressMs,durationMs}=input;
 if(!trackId?.trim()||!Number.isFinite(progressMs)||!Number.isFinite(durationMs)||
  (durationMs??0)<30000||(progressMs??-1)<0||(progressMs??0)>(durationMs??0))return off('clock');
 const plan=normalizeArenaShowPlanV1040(input.plan),show=input.show;
 if(!plan||!show?.active||!Number.isInteger(show.segmentIndex)||
  show.segmentIndex<0||show.segmentIndex>=plan.segments.length||
  !Number.isFinite(show.fade)||show.fade<=0||
  !Number.isFinite(show.intensity)||show.intensity<=0)return off('show');
 const chapter=show.segmentIndex,segment=plan.segments[chapter],at=(progressMs??0)/(durationMs??1);
 if(show.scene!==segment.scene||at<segment.start-1e-8||at>segment.end+1e-8)return off('show');
 const strength=clamp(input.strength,0,80,55)/100;
 if(strength<=0)return off();
 const local=(at-segment.start)/(segment.end-segment.start);
 const crossfade=smooth(local/.17);
 const power=strength*(input.performanceTier==='balanced'?.6:1)*
  clamp(show.intensity/100,0,1,0)*clamp(show.fade,0,1,0)*crossfade;
 if(power<=0)return off('show');
 const genre=plan.genre;
 const palette=PALETTES[genre][stableHash(trackId+'|'+chapter)%PALETTES[genre].length];
 const focus=LOOKS[chapter];
 // The plan is cinematic emphasis, NOT evidence of a real vocal lead or drop.
 const preset=focus==='lead'?[.88,.31]:focus==='duet'?[.82,.78]:
  focus==='wide'?[.68,.66]:[.56,.53];
 // No more than ~80% tracking of an observed singer's WORLD transform.
 const followWeight=(focus==='lead'||focus==='duet')?clamp(power*.92,0,.8,0):0;
 return {active:true,reason:'planned',chapter,focus,colorA:palette[0],colorB:palette[1],
  gainA:clamp(1-power*(1-preset[0]),.2,1,1),
  gainB:clamp(1-power*(1-preset[1]),.2,1,1),followWeight};
}
