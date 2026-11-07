/** V1045 · Intelligent Concert Atmosphere 2.0 for the *virtual* 360° arena.
 * Smooth, song-relative show-template crossfades; no inferred audio events, external
 * devices, fog machines, flash triggers, network requests or new render passes.
 */
import {normalizeArenaShowPlanV1040,type ArenaShowCueV1040,type ArenaShowSceneV1040} from './arena360ShowDesignerV1040';
import type {ArenaTierV1036} from './arena360AtmosphereV1036';

export type ArenaAtmosphereDirectorCueV1045={
 active:boolean;scene:ArenaShowSceneV1040|null;transition:number;
 fogGain:number;laserGain:number;skyGain:number;drift:number;laserSpread:number;laserLift:number;
 fogColor:string;laserA:string;laserB:string;skyA:string;skyB:string;
};
const INACTIVE:ArenaAtmosphereDirectorCueV1045={active:false,scene:null,transition:0,
 fogGain:1,laserGain:1,skyGain:1,drift:1,laserSpread:1,laserLift:0,
 fogColor:'#478eae',laserA:'#dc78f5',laserB:'#49d8ff',skyA:'#42dbe9',skyB:'#d97cff'};
const LEVELS:Record<ArenaShowSceneV1040,{fog:number;laser:number;sky:number;drift:number;warm:number;spread:number;lift:number}>={
 intro:{fog:.88,laser:.52,sky:.68,drift:.70,warm:.12,spread:.78,lift:-.12},
 verse:{fog:.92,laser:.78,sky:.88,drift:.92,warm:.22,spread:.96,lift:0},
 build:{fog:1.16,laser:1.12,sky:1.08,drift:1.15,warm:.37,spread:1.08,lift:.14},
 hook:{fog:1.10,laser:1.25,sky:1.22,drift:1.16,warm:.52,spread:1.13,lift:.16},
 interlude:{fog:.72,laser:.43,sky:.62,drift:.58,warm:.10,spread:.78,lift:-.09},
 finale:{fog:1.27,laser:1.32,sky:1.29,drift:1.20,warm:.78,spread:1.17,lift:.23},
};
type RGB=readonly [number,number,number];
const COLORS:Record<'rap'|'hard'|'rock'|'pop',{fog:RGB;laserA:RGB;laserB:RGB;skyA:RGB;skyB:RGB}>={
 rap:{fog:[43,99,137],laserA:[159,87,232],laserB:[44,180,236],skyA:[53,178,221],skyB:[183,79,223]},
 hard:{fog:[82,63,149],laserA:[215,57,234],laserB:[64,141,245],skyA:[76,139,243],skyB:[215,61,204]},
 rock:{fog:[111,91,81],laserA:[248,137,72],laserB:[255,195,95],skyA:[241,151,77],skyB:[224,95,78]},
 pop:{fog:[65,114,144],laserA:[245,111,181],laserB:[70,208,218],skyA:[65,203,218],skyB:[222,124,216]},
};
const clamp=(v:number,lo:number,hi:number)=>Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):lo;
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const smooth=(t:number)=>{const v=clamp(t,0,1);return v*v*(3-2*v);};
const mixColor=(a:RGB,b:RGB,alpha:number):RGB=>[
 Math.round(mix(a[0],b[0],alpha)),Math.round(mix(a[1],b[1],alpha)),Math.round(mix(a[2],b[2],alpha))];
const hex=(rgb:RGB)=>'#'+rgb.map(x=>clamp(Math.round(x),0,255).toString(16).padStart(2,'0')).join('');

/** Every scene transition spans the first ~1.5% of the track section.
 * When a new section begins, its initial look equals the previous one's final look.
 * Strength=0 and all safety gates preserve the V1044 visuals exactly.
 */
export function planArenaAtmosphereDirectorV1045(i:{enabled:boolean;playing:boolean;reducedMotion:boolean;
 reactive:boolean;show:ArenaShowCueV1040|null|undefined;showPlan:unknown;
 progressMs?:number|null;durationMs?:number|null;strength?:number|null;
 performanceTier?:ArenaTierV1036|null}):ArenaAtmosphereDirectorCueV1045{
 const strength=clamp((i.strength??55)/100,0,1);
 if(!i.enabled||!i.playing||i.reducedMotion||!i.reactive||!i.show?.active||
  !(strength>0)||!Number.isFinite(i.progressMs)||!Number.isFinite(i.durationMs)||
  (i.progressMs??-1)<0||(i.durationMs??0)<=0)return INACTIVE;
 const plan=normalizeArenaShowPlanV1040(i.showPlan);
 if(!plan)return INACTIVE;
 const progress=clamp((i.progressMs??0)/(i.durationMs??1),0,1);
 const index=plan.segments.findIndex(s=>progress<s.end);
 const idx=index<0?plan.segments.length-1:index;
 const current=plan.segments[idx],previous=plan.segments[Math.max(0,idx-1)];
 if(!current||!previous||i.show.segmentIndex!==idx)return INACTIVE;
 const width=current.end-current.start;
 const transition=smooth((progress-current.start)/Math.min(.015,width*.22));
 const before=LEVELS[previous.scene],after=LEVELS[current.scene];
 const intensity=clamp(mix(previous.intensity,current.intensity,transition)/100,0,1);
 // Low-power devices retain effects but avoid heavy high-contrast visual changes.
 const perf=i.performanceTier==='low'?.60:i.performanceTier==='balanced'?.85:1;
 const influence=strength*intensity*perf;
 const value=(key:'fog'|'laser'|'sky'|'drift')=>{
  const pattern=mix(before[key],after[key],transition);
  const cap=key==='fog'?1.20:key==='laser'?1.27:key==='sky'?1.22:1.15;
  return clamp(mix(1,pattern,influence),.55,cap);
 };
 const colors=COLORS[plan.genre];
 const warmth=clamp(mix(before.warm,after.warm,transition)*influence,0,.75);
 const amber:RGB=[250,170,104],gold:RGB=[255,205,125];
 return {active:true,scene:current.scene,transition,
  fogGain:value('fog'),laserGain:value('laser'),skyGain:value('sky'),drift:value('drift'),
  laserSpread:clamp(mix(1,mix(before.spread,after.spread,transition),influence),.80,1.17),
  laserLift:clamp(mix(before.lift,after.lift,transition)*influence,-.12,.23),
  fogColor:hex(mixColor(colors.fog,amber,warmth*.32)),
  laserA:hex(mixColor(colors.laserA,amber,warmth*.48)),
  laserB:hex(mixColor(colors.laserB,gold,warmth*.36)),
  skyA:hex(mixColor(colors.skyA,gold,warmth*.22)),
  skyB:hex(mixColor(colors.skyB,amber,warmth*.40))};
}
