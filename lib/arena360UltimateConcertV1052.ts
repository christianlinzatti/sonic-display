/** V1052 · Ultimate Live Concert Experience.
 * One deterministic score for the existing 360° stage, audience, camera and
 * choreography systems. These are visual chapters, not detected audio events.
 * No camera, audio, device, renderer, timer or network ownership.
 */
import {normalizeArenaShowPlanV1040} from './arena360ShowDesignerV1040';
import type {ArenaShowCueV1040,ArenaShowPlanV1040} from './arena360ShowDesignerV1040';

export type ConcertFocusV1052='stage'|'audience'|'camera'|'cast'|'ensemble'|'breath';
export interface UltimateConcertCueV1052 {
 active:boolean;reason:'disabled'|'paused'|'motion'|'performance'|'clock'|'show'|'planned';
 focus:ConcertFocusV1052;chapter:number;energy:number;
 stageGain:number;crowdGain:number;cameraGain:number;choreoGain:number;
 show:ArenaShowCueV1040;
}
const clamp=(value:unknown,lo:number,hi:number,fallback:number):number=>
 typeof value==='number'&&Number.isFinite(value)?Math.max(lo,Math.min(hi,value)):fallback;
const smooth=(value:number)=>{const x=clamp(value,0,1,0);return x*x*(3-2*x);};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const DEPTH:readonly number[]=[.56,.74,.86,.98,.36,.82,1];
const FOCI:readonly ConcertFocusV1052[]=['stage','audience','camera','cast'];
const off=(show:ArenaShowCueV1040,reason:UltimateConcertCueV1052['reason']='disabled'):UltimateConcertCueV1052=>({
 active:false,reason,focus:'stage',chapter:-1,energy:0,stageGain:1,crowdGain:1,cameraGain:1,choreoGain:1,show,
});
function songOffset(trackId:string):number {
 let h=2166136261;
 for(let i=0;i<Math.min(256,trackId.length);i++)h=Math.imul(h^trackId.charCodeAt(i),16777619)>>>0;
 return h%4;
}
function focusFor(index:number,offset:number):ConcertFocusV1052 {
 if(index===4)return 'breath';
 if(index===3||index===6)return 'ensemble';
 return FOCI[(index+offset)%4];
}
/** Pure shared score: identical inputs produce identical cues for every subsystem.
 * All gains are attenuation-only. Authored show fields, manual camera/duo priorities,
 * verified beat/pyro triggers and the Govee LAN governor remain untouched.
 */
export function directUltimateConcertV1052(input:{
 enabled:boolean;stageIsArena:boolean;playing:boolean;reducedMotion:boolean;reactive?:boolean;
 show:ArenaShowCueV1040;plan?:ArenaShowPlanV1040|null;trackId?:string|null;
 progressMs?:number|null;durationMs?:number|null;strength?:number;
 performanceTier?:'low'|'balanced'|'high'|null;
}):UltimateConcertCueV1052 {
 const {show}=input;
 if(!input.enabled||!input.stageIsArena||input.reactive===false)return off(show);
 if(!input.playing)return off(show,'paused');
 if(input.reducedMotion)return off(show,'motion');
 if(input.performanceTier==='low')return off(show,'performance');
 if(typeof input.trackId!=='string'||!input.trackId.trim()||
  !Number.isFinite(input.progressMs)||!Number.isFinite(input.durationMs)||
  (input.durationMs??0)<30000||(input.progressMs??-1)<0||
  (input.progressMs??0)>(input.durationMs??0))return off(show,'clock');
 const plan=normalizeArenaShowPlanV1040(input.plan);
 if(!plan||!show?.active||!Number.isInteger(show.segmentIndex)||show.segmentIndex<0||
  show.segmentIndex>=plan.segments.length||
  !Number.isFinite(show.fade)||show.fade<=0||show.fade>1||
  !Number.isFinite(show.intensity)||show.intensity<=0||show.intensity>100)return off(show,'show');
 const index=show.segmentIndex,segment=plan.segments[index];
 const progress=(input.progressMs??0)/(input.durationMs??1);
 if(segment.scene!==show.scene||progress<segment.start-1e-8||progress>segment.end+1e-8)return off(show,'show');
 const local=clamp((progress-segment.start)/(segment.end-segment.start),0,1,0);
 const strength=clamp(input.strength,0,80,55)/100*(input.performanceTier==='balanced'?.65:1);
 if(strength<=0)return off(show);
 const offset=songOffset(input.trackId);
 const oldFocus=focusFor(Math.max(0,index-1),offset),currentFocus=focusFor(index,offset);
 const transition=smooth(local/.14);
 const prev=index===0?DEPTH[0]:DEPTH[index-1];
 const into=mix(prev,DEPTH[index],transition);
 // A calm, gradual afterglow, never an invented musical drop or full-stage flash.
 const energy=index===6?mix(into,.42,smooth((local-.82)/.18)):into;
 const focus=currentFocus;
 const weight=(part:ConcertFocusV1052,which:'stage'|'audience'|'camera'|'cast')=>
  part==='ensemble'?1:part==='breath'?.45:part===which?1:.7;
 const attenuate=(which:'stage'|'audience'|'camera'|'cast')=>{
  const emphasis=mix(weight(oldFocus,which),weight(currentFocus,which),transition);
  return clamp(1-strength*(1-energy*emphasis)*.65,.38,1,1);
 };
 const stageGain=attenuate('stage');
 const crowdGain=attenuate('audience');
 const cameraGain=attenuate('camera');
 const choreoGain=attenuate('cast');
 // No changes to scene, deck, floating modes, lasers, camera shot or dance selection.
 return {active:true,reason:'planned',focus,chapter:index,energy,
  stageGain,crowdGain,cameraGain,choreoGain,
  show:{...show,intensity:Math.min(show.intensity,Math.round(show.intensity*stageGain))}};
}
