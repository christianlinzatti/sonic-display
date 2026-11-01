/** V749 – Performance-aware lighting envelope for the existing V462/V542/V551 rig.
 * It never creates lights, invents singers, or overrides authored timelines/blackouts.
 * Verified vocal slots are supplied by the V551 cast validator; no inferred voices.
 */
import type {StageAtmospherePlanV551} from './intelligentStageAtmosphereV551';
import type {LightingTierV462,LightingSectionV462} from './concertLightingDirectorV462';

export type PerformanceLightingSettingsV749={
  enabled:boolean;strength:number;vocalPortraits:boolean;groupHooks:boolean;dropAccents:boolean;
  protectLyrics:boolean;transitionMs:number;
};
export const DEFAULT_PERFORMANCE_LIGHTING_V749:PerformanceLightingSettingsV749={
  enabled:true,strength:60,vocalPortraits:true,groupHooks:true,dropAccents:true,protectLyrics:true,transitionMs:900,
};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
export function normalizePerformanceLightingV749(value?:Partial<PerformanceLightingSettingsV749>|null):PerformanceLightingSettingsV749{
  const d=DEFAULT_PERFORMANCE_LIGHTING_V749;
  const numeric=(n:unknown,def:number,a:number,b:number)=>finite(n)?clamp(n,a,b):def;
  return {
    enabled:typeof value?.enabled==='boolean'?value.enabled:d.enabled,
    strength:numeric(value?.strength,d.strength,0,100),
    vocalPortraits:typeof value?.vocalPortraits==='boolean'?value.vocalPortraits:d.vocalPortraits,
    groupHooks:typeof value?.groupHooks==='boolean'?value.groupHooks:d.groupHooks,
    dropAccents:typeof value?.dropAccents==='boolean'?value.dropAccents:d.dropAccents,
    protectLyrics:typeof value?.protectLyrics==='boolean'?value.protectLyrics:d.protectLyrics,
    transitionMs:numeric(value?.transitionMs,d.transitionMs,250,2500),
  };
}
export type PerformanceLightingSceneV749='off'|'vocal'|'handoff'|'ensemble'|'hook'|'build'|'drop'|'calm';
export type PerformanceLightingCueV749={
  active:boolean;scene:PerformanceLightingSceneV749;
  key:number;fill:number;beam:number;sweep:number;focusSlot:number|null;partnerSlot:number|null;
  reason:'v551-cast'|'section'|'protected';
};
export const NEUTRAL_LIGHTING_V749:Readonly<PerformanceLightingCueV749>={
  active:false,scene:'off',key:1,fill:1,beam:1,sweep:1,focusSlot:null,partnerSlot:null,reason:'protected'
};
export type PerformanceLightingInputV749={
  settings?:Partial<PerformanceLightingSettingsV749>|null;
  cast?:StageAtmospherePlanV551|null;
  section:LightingSectionV462;
  energy:number;kick:number;
  playing:boolean;reactive:boolean;reducedMotion:boolean;tier:LightingTierV462;
  authored:boolean;blackout:boolean;lyricsProtected:boolean;
  groupCount:number;cameraFocus:boolean;
};
const validSlot=(n:number|null|undefined,count:number)=>n!==null&&n!==undefined&&Number.isInteger(n)&&n>=0&&n<count;
/** Note: V551's cast has already been checked against V528. Never treat a camera
 * preference or a dancer's lead role as proof of a singing voice. */
export function planPerformanceLightingV749(input:PerformanceLightingInputV749):PerformanceLightingCueV749{
  const settings=normalizePerformanceLightingV749(input.settings);
  if(!settings.enabled||settings.strength<=0||!input.playing||!input.reactive||input.reducedMotion||
    input.authored||input.blackout||input.tier==='low'||!finite(input.energy)||!finite(input.kick)||
    input.energy<0||input.energy>1||input.kick<0||input.kick>1||
    !Number.isInteger(input.groupCount)||input.groupCount<1||input.groupCount>4)return {...NEUTRAL_LIGHTING_V749};
  const cast=input.cast?.active===true?input.cast:null;
  const left=cast&&validSlot(cast.leftSingerSlot,input.groupCount)?cast.leftSingerSlot:null;
  const right=cast&&validSlot(cast.rightSingerSlot,input.groupCount)&&cast.rightSingerSlot!==left?cast.rightSingerSlot:null;
  const reliableSinger=left!==null&&finite(cast?.focusStrength)&&cast!.focusStrength>0&&cast!.focusStrength<=.7;
  const group=input.groupCount>=2;
  const vocal=settings.vocalPortraits&&reliableSinger&&input.cameraFocus;
  const handoff=vocal&&right!==null&&cast?.moment==='handoff';
  const ensemble=vocal&&right!==null&&cast?.moment==='ensemble';
  const hook=settings.groupHooks&&group&&input.section==='hook';
  const drop=settings.dropAccents&&input.section==='drop'&&input.kick>.14&&input.energy>.32;
  const build=input.section==='build'&&input.energy>.2;
  const scene:PerformanceLightingSceneV749=handoff?'handoff':ensemble?'ensemble':vocal?'vocal':hook?'hook':drop?'drop':build?'build':'calm';
  const level=(settings.strength/100)*(input.tier==='high'?1:.58);
  const voices=reliableSinger?Math.min(.7,cast!.focusStrength):0;
  const kick=Math.min(1,input.kick*input.energy);
  let key=1,fill=1,beam=1,sweep=1;
  if(scene==='vocal'){
    key+=.045*voices;fill+=.06*voices;beam-=.085;sweep-=.15;
  }else if(scene==='handoff'){
    key+=.025*voices;fill+=.07*voices;beam-=.11;sweep-=.23;
  }else if(scene==='ensemble'){
    key+=.025*voices;fill+=.08*voices;beam-=.025;sweep-=.13;
  }else if(scene==='hook'){
    key+=.025;fill+=.07;beam+=.045;sweep+=.02;
  }else if(scene==='drop'){
    // No strobe, white flash or laser. Existing beam only; real kick is mandatory.
    key+=.015*kick;fill+=.025*kick;beam+=.12*kick;sweep+=.07*kick;
  }else if(scene==='build'){
    fill+=.015*input.energy;beam+=.025*input.energy;sweep+=.025*input.energy;
  }
  if(input.lyricsProtected&&settings.protectLyrics){
    // Lyrics win over stage effects even if a verified singer and drop coincide.
    key=Math.max(key,1+.015);fill=Math.max(fill,1+.04);
    beam=Math.min(beam,.81);sweep=Math.min(sweep,.75);
  }
  return {active:true,scene,reason:reliableSinger&&vocal?'v551-cast':'section',
    key:clamp(1+(key-1)*level,.96,1.055),fill:clamp(1+(fill-1)*level,.97,1.09),
    beam:clamp(1+(beam-1)*level,.75,1.12),sweep:clamp(1+(sweep-1)*level,.72,1.08),
    focusSlot:vocal?left:null,partnerSlot:vocal?right:null};
}
export type PerformanceLightingStateV749={key:number;fill:number;beam:number;sweep:number};
export function createPerformanceLightingStateV749():PerformanceLightingStateV749{return {key:1,fill:1,beam:1,sweep:1};}
/** In-place attack/release, no allocations. Off/blackout snaps back to neutral. */
export function advancePerformanceLightingV749(state:PerformanceLightingStateV749,cue:PerformanceLightingCueV749,
 deltaSeconds:number,transitionMs:number):PerformanceLightingStateV749{
  if(!cue.active||!finite(deltaSeconds)||deltaSeconds<0){state.key=state.fill=state.beam=state.sweep=1;return state;}
  const ms=finite(transitionMs)?clamp(transitionMs,250,2500):900;
  const alpha=1-Math.exp(-Math.min(deltaSeconds,.1)*1000/ms*2.2);
  state.key+=(cue.key-state.key)*alpha;state.fill+=(cue.fill-state.fill)*alpha;
  state.beam+=(cue.beam-state.beam)*alpha;state.sweep+=(cue.sweep-state.sweep)*alpha;
  return state;
}
