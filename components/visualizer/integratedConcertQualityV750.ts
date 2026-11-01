/** V750 – Integrated Concert Quality & Performance.
 * One deterministic, track-clock-based, additive attenuation budget for the
 * automatic V735/V746/V747/V748/V749 layers. No extra camera, lights, animation
 * loop, timers, heuristically assigned singers or synthetic audio measurements.
 * These are planning diagnostics; never claim to have measured rendered pixels.
 */
export interface ConcertQualitySettingsV750 {
  enabled:boolean;
  strength:number;                 // 0..100; 0 means no automatic modification
  protectLyrics:boolean;
  protectPerformance:boolean;
  adaptiveLoad:boolean;
}
export const DEFAULT_CONCERT_QUALITY_V750:Readonly<ConcertQualitySettingsV750>={
  enabled:true,strength:65,protectLyrics:true,protectPerformance:true,adaptiveLoad:true,
};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
export function normalizeConcertQualityV750(raw?:Partial<ConcertQualitySettingsV750>|null):ConcertQualitySettingsV750 {
  const d=DEFAULT_CONCERT_QUALITY_V750;
  return {enabled:typeof raw?.enabled==='boolean'?raw.enabled:d.enabled,
    strength:finite(raw?.strength)?clamp(raw.strength,0,100):d.strength,
    protectLyrics:typeof raw?.protectLyrics==='boolean'?raw.protectLyrics:d.protectLyrics,
    protectPerformance:typeof raw?.protectPerformance==='boolean'?raw.protectPerformance:d.protectPerformance,
    adaptiveLoad:typeof raw?.adaptiveLoad==='boolean'?raw.adaptiveLoad:d.adaptiveLoad};
}
export type ConcertQualityModeV750='off'|'calm'|'verse'|'build'|'hook'|'drop'|'outro'|'balanced';
export interface ConcertQualityInputV750 {
  settings?:Partial<ConcertQualitySettingsV750>|null;
  trackId:string; durationMs:number; progressMs:number; playing:boolean; reducedMotion:boolean;
  section?:string|null; tier:'low'|'balanced'|'high';
  ensembleCount:number; lyricVisible:boolean; lyricSynced:boolean; activeLineLength:number;
  /** This is explicitly about existing verified V528 direction, not inferred speakers. */
  verifiedVocal:boolean;
  manualDance:boolean;manualCamera:boolean;manualLighting:boolean;
  repeatedAct:boolean;
}
export interface ConcertQualityPlanV750 {
  active:boolean;mode:ConcertQualityModeV750;
  /** Multipliers at most 1. Existing manual controls are left completely alone. */
  dance:number;vocal:number;camera:number;lighting:number;
  /** Multipliers for additive V748 glows, with 0..100 boost to readability. */
  lyricsAccent:number;readabilityBonus:number;
  reason:'off'|'scene'|'lyrics'|'ensemble'|'performance';
  pressure:number; // planning pressure, NOT measured FPS or occlusion
}
export const NEUTRAL_CONCERT_QUALITY_V750:Readonly<ConcertQualityPlanV750>={
  active:false,mode:'off',dance:1,vocal:1,camera:1,lighting:1,
  lyricsAccent:1,readabilityBonus:0,reason:'off',pressure:0};
const q=(n:number)=>Math.round(n*10000)/10000;
export function planIntegratedConcertQualityV750(input:ConcertQualityInputV750):ConcertQualityPlanV750{
  const s=normalizeConcertQualityV750(input.settings);
  if(!s.enabled||s.strength<=0||!input.playing||input.reducedMotion||!input.trackId.trim()||
    !finite(input.durationMs)||input.durationMs<=0||!finite(input.progressMs)||
    input.progressMs<0||input.progressMs>=input.durationMs||
    !Number.isInteger(input.ensembleCount)||input.ensembleCount<1||input.ensembleCount>4||
    !Number.isInteger(input.activeLineLength)||input.activeLineLength<0||input.activeLineLength>10000||
    !['low','balanced','high'].includes(input.tier))return {...NEUTRAL_CONCERT_QUALITY_V750};
  const section=input.section;
  const mode:ConcertQualityModeV750=section==='intro'||section==='break'?'calm':
    section==='verse'?'verse':section==='build'?'build':section==='hook'?'hook':
    section==='drop'?'drop':section==='outro'?'outro':'balanced';
  const lyrics=!!(s.protectLyrics&&input.lyricVisible&&input.lyricSynced&&input.activeLineLength>0);
  const dense=lyrics&&input.activeLineLength>56;
  const ensemble=s.adaptiveLoad&&input.ensembleCount>=3;
  const tierPressure=s.adaptiveLoad?(input.tier==='low'?.30:input.tier==='balanced'?.13:0):0;
  // Never infer runtime FPS/GPU pressure from the performance tier: these are
  // conservative content-complexity budgets, not frame measurements.
  const pressure=clamp(tierPressure+(ensemble?.14:0)+(lyrics?.13:0)+(dense?.18:0)+
    (input.repeatedAct?.06:0),0,.82);
  const strength=s.strength/100;
  const tension=mode==='drop'?.05:mode==='hook'?.04:mode==='build'?.03:0;
  const lyricGuard=lyrics?(dense?.20:.10):0;
  const performerGuard=s.protectPerformance&&input.verifiedVocal?.10:0;
  // Camera and beam-related layers back off before dance and vocal expression.
  const camera=input.manualCamera?1:q(clamp(1-strength*(pressure*.52+lyricGuard+performerGuard),.48,1));
  const lighting=input.manualLighting?1:q(clamp(1-strength*(pressure*.65+lyricGuard*1.2+tension),.43,1));
  const dance=input.manualDance?1:q(clamp(1-strength*(pressure*.34+(lyrics?.025:0)),.65,1));
  // Keep verified vocal presence legible: only very dense/crowded stages
  // soften *extra* body gestures; the mouth/phonemes are never modified.
  const vocal=q(clamp(1-strength*(pressure*.17+(dense?.045:0)),.82,1));
  const lyricsAccent=q(clamp(1-strength*(pressure*.46+(dense?.22:0)),.5,1));
  const readabilityBonus=lyrics?q(clamp(strength*(dense?19:input.ensembleCount>=3?12:7),0,20)):0;
  const active=[dance,vocal,camera,lighting,lyricsAccent].some(v=>v<.9999)||readabilityBonus>0;
  return {active,mode,dance,vocal,camera,lighting,lyricsAccent,readabilityBonus,
    pressure:q(pressure),reason:lyrics?'lyrics':ensemble?'ensemble':input.verifiedVocal?'performance':'scene'};
}
/** Clamp only automatic *additional* strength; never switches disabled features on. */
export function scaleAutomaticPercentV750(value:number,factor:number):number{
  if(!finite(value))return 0;
  return Math.round(clamp(value,0,100)*clamp(finite(factor)?factor:1,0,1)*100)/100;
}
export function strengthenReadabilityV750(value:number,bonus:number):number{
  return clamp((finite(value)?value:0)+(finite(bonus)?clamp(bonus,0,20):0),0,100);
}
