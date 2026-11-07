/** V1057 · Intelligent Laser Director.
 * Pure, opt-in authored laser cues for the EXISTING V1036 + V1039 mesh batches.
 * A planned hook/finale is not evidence of a real downbeat or music drop.
 * No extra lights, laser hardware, network, audio clock, randomness or flashes.
 */
import {normalizeArenaShowPlanV1040} from './arena360ShowDesignerV1040';
import type {ArenaShowPlanV1040,ArenaShowCueV1040,ArenaShowLaserV1040} from './arena360ShowDesignerV1040';

export type IntelligentLaserCueV1057={
 active:boolean;reason:'disabled'|'paused'|'motion'|'quality'|'clock'|'show'|'planned';
 chapter:number;pattern:ArenaShowLaserV1040;
 fanSpread:number;fanLift:number;sweep:number;fanGain:number;beamGain:number;
 colorA:string;colorB:string;
};
const clamp=(value:unknown,min:number,max:number,fallback:number):number=>
 typeof value==='number'&&Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;
const smooth=(value:number):number=>{const t=clamp(value,0,1,0);return t*t*(3-2*t);};
const OFF:Readonly<IntelligentLaserCueV1057>={active:false,reason:'disabled',chapter:-1,
 pattern:'halo',fanSpread:1,fanLift:0,sweep:0,fanGain:1,beamGain:1,
 colorA:'#49d8ff',colorB:'#dc78f5'};
const off=(reason:IntelligentLaserCueV1057['reason']='disabled'):IntelligentLaserCueV1057=>({...OFF,reason});
const PALETTES={
 rap:[['#53c5ff','#a38cff'],['#70b9ff','#d47aff']],
 hard:[['#30e7f5','#db65e9'],['#55baff','#ef72bd']],
 rock:[['#ffaa67','#ec6774'],['#ffc079','#e87c56']],
 pop:[['#88e7ec','#d3a4f8'],['#77d2fd','#f4a5d7']],
} as const;
/** Never overrides manually selected V1039 patterns; caller chooses that precedence. */
export function planIntelligentLaserV1057(input:{
 enabled:boolean;stageIsArena:boolean;fanEnabled:boolean;architectureEnabled:boolean;
 playing:boolean;reducedMotion:boolean;reactive?:boolean;
 performanceTier?:'low'|'balanced'|'high'|null;
 trackId?:string|null;progressMs?:number|null;durationMs?:number|null;
 plan?:ArenaShowPlanV1040|null;show?:ArenaShowCueV1040|null;strength?:number|null;
}):IntelligentLaserCueV1057{
 if(!input.enabled||!input.stageIsArena||(!input.fanEnabled&&!input.architectureEnabled)||input.reactive===false)return off();
 if(!input.playing)return off('paused');
 if(input.reducedMotion)return off('motion');
 if(input.performanceTier==='low')return off('quality');
 const {trackId,progressMs,durationMs}=input;
 if(!trackId?.trim()||!Number.isFinite(progressMs)||!Number.isFinite(durationMs)||
  (durationMs??0)<30000||(progressMs??-1)<0||(progressMs??0)>(durationMs??0))return off('clock');
 const valid=normalizeArenaShowPlanV1040(input.plan),show=input.show;
 if(!valid||!show?.active||!Number.isInteger(show.segmentIndex)||
  show.segmentIndex<0||show.segmentIndex>=valid.segments.length||
  !Number.isFinite(show.fade)||show.fade<=0||
  !Number.isFinite(show.intensity)||show.intensity<=0)return off('show');
 const chapter=show.segmentIndex,segment=valid.segments[chapter];
 const pos=(progressMs??0)/(durationMs??1);
 if(show.scene!==segment.scene||show.lasers!==segment.lasers||
  pos<segment.start-1e-8||pos>segment.end+1e-8)return off('show');
 const strength=clamp(input.strength,0,80,55)/100;
 if(strength===0)return off();
 const progress=(pos-segment.start)/(segment.end-segment.start);
 // Fade after chapter boundaries. No one-frame laser cut or autonomous strobe.
 const power=strength*clamp(show.intensity/100,0,1,0)*clamp(show.fade,0,1,0)*
  smooth(progress/.12)*(input.performanceTier==='balanced'?.65:1);
 if(power<=0)return off('show');
 const pattern=segment.lasers;
 const [colorA,colorB]=PALETTES[valid.genre][chapter%2];
 // Every modulation is optical and capped; existing V1036/V1039 beam budgets win.
 const fanSpread=clamp(1+power*(pattern==='tunnel'?.20:pattern==='spiral'?.09:-.12),.88,1.17,1);
 const fanLift=clamp(power*(pattern==='spiral'?.25:pattern==='tunnel'?.12:-.10),-.1,.22,0);
 const sweep=clamp(pattern==='spiral'?power*.32:pattern==='tunnel'?power*.12:power*.025,0,.26,0);
 const fanGain=clamp(1-power*(pattern==='halo'?.36:.12),.65,1,1);
 const beamGain=clamp(1-power*(pattern==='halo'?.48:.10),.62,1,1);
 return {active:true,reason:'planned',chapter,pattern,fanSpread,fanLift,sweep,fanGain,beamGain,colorA,colorB};
}
