/** V1058 · Volumetric Light Experience (GPU-bounded approximation).
 * Authored optical cues for the TWO EXISTING V1032 cone meshes and V1036 fog
 * batches. This is not ray-marched true volumetrics or actual music analysis.
 * It never creates lights, extra scene objects, hardware commands or timers.
 */
import {normalizeArenaShowPlanV1040} from './arena360ShowDesignerV1040';
import type {ArenaShowPlanV1040,ArenaShowCueV1040} from './arena360ShowDesignerV1040';

export type VolumetricLightCueV1058={
 active:boolean;reason:'disabled'|'paused'|'motion'|'quality'|'clock'|'show'|'planned';
 chapter:number;beamOpacity:number;beamFeather:number;fogGain:number;
 colorA:string;colorB:string;fogTint:string;
};
const finite=(n:unknown,min:number,max:number,fallback:number):number=>
 typeof n==='number'&&Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;
const smooth=(n:number):number=>{const t=finite(n,0,1,0);return t*t*(3-2*t);};
const INACTIVE:Readonly<VolumetricLightCueV1058>={active:false,reason:'disabled',chapter:-1,
 beamOpacity:.075,beamFeather:.40,fogGain:1,colorA:'#4cbdff',colorB:'#ce71ff',fogTint:'#478eae'};
const off=(reason:VolumetricLightCueV1058['reason']='disabled'):VolumetricLightCueV1058=>({...INACTIVE,reason});
const LOOKS={
 rap:[['#428dd8','#ac67bf','#547cba'],['#8ca7ea','#8f5ac6','#568ba6']],
 hard:[['#2cc6dd','#a96cfa','#389db1'],['#6e9eff','#d97dbb','#5a8abe']],
 rock:[['#ef995a','#d46b76','#a8806d'],['#f4b268','#c46a90','#9a7b69']],
 pop:[['#69c5e3','#d899d4','#77aab8'],['#90d6be','#c4a6ee','#7c9fb0']],
} as const;
const CHAPTER_GAIN=[.55,.70,.83,1,.5,.76,.96] as const;
/** Fail-closed if track, timeline, playback or rendering budget is unreliable. */
export function planVolumetricLightingV1058(input:{
 enabled:boolean;stageIsArena:boolean;lightsEnabled:boolean;fogEnabled:boolean;
 playing:boolean;reducedMotion:boolean;reactive?:boolean;
 performanceTier?:'low'|'balanced'|'high'|null;
 trackId?:string|null;progressMs?:number|null;durationMs?:number|null;
 plan?:ArenaShowPlanV1040|null;show?:ArenaShowCueV1040|null;
 strength?:number|null;
}):VolumetricLightCueV1058{
 if(!input.enabled||!input.stageIsArena||(!input.lightsEnabled&&!input.fogEnabled)||input.reactive===false)return off();
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
 const chapter=show.segmentIndex,segment=plan.segments[chapter];
 const at=(progressMs??0)/(durationMs??1);
 if(show.scene!==segment.scene||at<segment.start-1e-8||at>segment.end+1e-8)return off('show');
 const strength=finite(input.strength,0,80,55)/100;
 if(strength===0)return off();
 const local=(at-segment.start)/(segment.end-segment.start);
 const power=finite(strength*finite(show.intensity/100,0,1,0)*finite(show.fade,0,1,0)*
  smooth(local/.14)*CHAPTER_GAIN[chapter]*(input.performanceTier==='balanced'?.62:1),0,.8,0);
 if(power<=0)return off('show');
 const [colorA,colorB,fogTint]=LOOKS[plan.genre][chapter%2];
 // Every value stays below the old optical brightness/opacity safety budget.
 return {active:true,reason:'planned',chapter,
  beamOpacity:finite(.075+.08*power,.075,.14,.075),
  beamFeather:finite(.38+.32*power,.38,.65,.38),
  fogGain:finite(1+.40*power,1,1.32,1),colorA,colorB,fogTint};
}
