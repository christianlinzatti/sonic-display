/** V1060 · AI Lighting Choreographer (deterministic, local concert-score director).
 * Coordinates V1056 spots, V1057 lasers, V1058 beams/fog and V1059 LED belt
 * by *reducing* existing optical cue strengths. It never creates a light,
 * Govee command, audio clock, timer, renderer or synthetic music event.
 */
import {normalizeArenaShowPlanV1040} from './arena360ShowDesignerV1040';
import type {ArenaShowCueV1040,ArenaShowPlanV1040} from './arena360ShowDesignerV1040';

export type LightingLaneV1060='spots'|'lasers'|'fog'|'led';
export type LightingChannelV1060={spots:boolean;lasers:boolean;fog:boolean;led:boolean};
export type LightingChoreographerCueV1060={
 active:boolean;reason:'disabled'|'paused'|'motion'|'quality'|'clock'|'show'|'channels'|'planned';
 chapter:number;focus:LightingLaneV1060;spots:number;lasers:number;fog:number;led:number;
 /** Maximum combined gain requested by active channels (for diagnostic tests). */
 total:number;
};
const clamp=(n:unknown,lo:number,hi:number,fallback:number):number=>
 typeof n==='number'&&Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):fallback;
const smooth=(n:number):number=>{const t=clamp(n,0,1,0);return t*t*(3-2*t);};
const CHANNELS:readonly LightingLaneV1060[]=['spots','lasers','fog','led'];
/** Seven authored looks: attention shifts from performers to laser, pixel wall,
 * atmospheric breathing room, and the coordinated finale. No invented drops. */
const SCORE:readonly (readonly [number,number,number,number])[]=[
 [.90,.42,.60,.54],  // intro: spotlit entrance
 [1.00,.38,.49,.52], // verse: artists first
 [.69,.95,.54,.73],  // build: laser architecture
 [.79,.82,.50,1.00],// hook: led panorama
 [.78,.29,.94,.46],  // interlude: atmosphere
 [.97,.59,.65,.59],  // bridge / reprise: lead performance
 [.86,.86,.66,1.00],// finale: shared arena climax, still capped
];
const FOCUS:readonly LightingLaneV1060[]=['spots','spots','lasers','led','fog','spots','led'];
const off=(reason:LightingChoreographerCueV1060['reason']='disabled'):LightingChoreographerCueV1060=>({
 active:false,reason,chapter:-1,focus:'spots',spots:1,lasers:1,fog:1,led:1,total:0,
});

export function planLightingChoreographerV1060(input:{
 enabled:boolean;stageIsArena:boolean;playing:boolean;reducedMotion:boolean;reactive?:boolean;
 performanceTier?:'low'|'balanced'|'high'|null;
 trackId?:string|null;progressMs?:number|null;durationMs?:number|null;
 plan?:ArenaShowPlanV1040|null;show?:ArenaShowCueV1040|null;
 strength?:number|null;channels?:Partial<LightingChannelV1060>|null;
}):LightingChoreographerCueV1060{
 if(!input.enabled||!input.stageIsArena||input.reactive===false)return off();
 if(!input.playing)return off('paused');
 if(input.reducedMotion)return off('motion');
 if(input.performanceTier==='low')return off('quality');
 const {trackId,progressMs,durationMs}=input;
 if(!trackId?.trim()||!Number.isFinite(progressMs)||!Number.isFinite(durationMs)||
   (durationMs??0)<30000||(progressMs??-1)<0||(progressMs??0)>(durationMs??0))return off('clock');
 const plan=normalizeArenaShowPlanV1040(input.plan),show=input.show;
 if(!plan||!show?.active||!Number.isInteger(show.segmentIndex)||
  show.segmentIndex<0||show.segmentIndex>=SCORE.length||show.segmentIndex>=plan.segments.length||
  !Number.isFinite(show.fade)||show.fade<=0||
  !Number.isFinite(show.intensity)||show.intensity<=0)return off('show');
 const chapter=show.segmentIndex,segment=plan.segments[chapter];
 const at=(progressMs??0)/(durationMs??1);
 if(show.scene!==segment.scene||at<segment.start-1e-8||at>segment.end+1e-8)return off('show');
 const strength=clamp(input.strength,0,80,55)/80;
 if(strength<=0)return off();
 const channels=CHANNELS.map(k=>input.channels?.[k]===true);
 if(!channels.some(Boolean))return off('channels');
 // Chapter boundary crossfade is smooth and clocked only by the existing song.
 const local=(at-segment.start)/(segment.end-segment.start);
 const transition=smooth(local/.13);
 const previous=SCORE[Math.max(0,chapter-1)],current=SCORE[chapter];
 const intensity=clamp(show.intensity/100,0,1,0)*clamp(show.fade,0,1,0);
 const weight=strength*intensity*(input.performanceTier==='balanced'?.72:1);
 const gains=CHANNELS.map((_,i)=>{
  if(!channels[i])return 1; // Existing manual effect toggle always wins.
  const target=previous[i]*(1-transition)+current[i]*transition;
  return clamp(1-weight*(1-target),.30,1,1);
 });
 // Shared optical budget: when all four channels are enabled, never make four
 // simultaneous full-strength effects. Only attenuation; no auto-brightening.
 const combined=gains.reduce((sum,x,i)=>sum+(channels[i]?x:0),0);
 const laneCount=channels.filter(Boolean).length;
 // The ceiling scales with the user strength and the active show fade.
 // At very low strength the coordinator cannot suddenly dim all four lanes.
 const maximum=laneCount===4?4-1.15*weight:laneCount===3?3-.6*weight:laneCount;
 const factor=combined>maximum?maximum/combined:1;
 const result=gains.map((v,i)=>channels[i]?clamp(v*factor,.25,1,1):1);
 return {active:true,reason:'planned',chapter,focus:FOCUS[chapter],
  spots:result[0],lasers:result[1],fog:result[2],led:result[3],
  total:result.reduce((sum,x,i)=>sum+(channels[i]?x:0),0)};
}
