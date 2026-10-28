/** V623 – single, evidence-bound concert priority score. A shared reading of
 * the SAME verified V604/V600 song acts for dance, camera, lyrics and lighting.
 * It never generates sections, vocalist roles, word timings, beats or stage cues.
 * Stateless by design: seeks and repeated hooks are deterministic.
 */
import type {NarrativePlanV604,NarrativeCueV604} from './fullSongConcertDramaturgyV604';
import type {AdvancedStageLightingPlanV621} from './advancedStageLightingV621';
import type {CinematicLyricsPerformanceV619} from './cinematicLyricsPerformanceV619';

export type ConcertPriorityV623='quiet'|'vocal'|'lyrics'|'ensemble'|'build'|'drop'|'finale';
export type ConcertDramaturgyCueV623={
  active:boolean;act:number;priority:ConcertPriorityV623;chapter:string;repetition:number;
  /** Multipliers only for already authorised, automatic lanes. */
  dance:number;camera:number;decoration:number;face:number;lyrics:number;
};
export type ConcertDramaturgyInputV623={
  narrative?:{plan:NarrativePlanV604;cue:NarrativeCueV604}|null;
  trackId:string;durationMs:number;positionMs:number;section?:string|null;
  playing:boolean;enabled?:boolean;reducedMotion:boolean;tier:'low'|'balanced'|'high';
  energy?:number;kick?:number;lyricsProtected:boolean;vocalFocus?:boolean;
  manualDance?:boolean;manualCamera?:boolean;manualLighting?:boolean;
};
export const NEUTRAL_CONCERT_DRAMATURGY_V623:Readonly<ConcertDramaturgyCueV623>=Object.freeze({
  active:false,act:-1,priority:'quiet',chapter:'unavailable',repetition:0,
  dance:1,camera:1,decoration:1,face:1,lyrics:1,
});
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const round=(n:number)=>Math.round(n*100000)/100000;
/** The cue AND a plan act must match the actual current playback position.
 * We never accept an unverified imported act or mismatched live section. */
export function planUltimateConcertDramaturgyV623(i:ConcertDramaturgyInputV623):ConcertDramaturgyCueV623{
  const n=i.narrative,p=n?.plan,c=n?.cue;
  if(!p||!c||!i.playing||i.enabled===false||i.reducedMotion||i.tier==='low'||
    p.source!=='verified-v600'||!c.active||c.source!=='verified-v600'||
    !i.trackId||p.trackId!==i.trackId||!finite(i.durationMs)||i.durationMs<=0||p.durationMs!==i.durationMs||
    !finite(i.positionMs)||i.positionMs<0||i.positionMs>=p.durationMs||
    !Number.isInteger(c.act)||c.act<0||c.act>=p.acts.length||
    !finite(c.transition)||c.transition<0||c.transition>1||
    (i.energy!==undefined&&(!finite(i.energy)||i.energy<0||i.energy>1))||
    (i.kick!==undefined&&(!finite(i.kick)||i.kick<0||i.kick>1)))return {...NEUTRAL_CONCERT_DRAMATURGY_V623};
  const a=p.acts[c.act];
  if(!a||a.index!==c.act||c.chapter!==a.chapter||c.motif!==a.motif||c.repetition!==a.repetition||
    (i.section!=null&&i.section!==a.section)||!finite(a.startMs)||!finite(a.endMs)||
    a.endMs<=a.startMs||i.positionMs<a.startMs||i.positionMs>=a.endMs)return {...NEUTRAL_CONCERT_DRAMATURGY_V623};
  const amount=c.transition*(i.tier==='balanced'?.6:1);
  const lyrics=!!i.lyricsProtected;
  const vocal=!!i.vocalFocus;
  // Lyric legibility always wins over decorative stage lighting. A singer's
  // face takes precedence over extra camera drift and aggressive body motion.
  const drop=a.section==='drop'&&(i.energy??0)>.25&&(i.kick??0)>.28;
  const priority:ConcertPriorityV623=lyrics?'lyrics':vocal?'vocal':
    a.chapter==='ending-arc'?'finale':a.section==='break'?'quiet':
    a.section==='build'?'build':drop?'drop':a.section==='hook'?'ensemble':
    a.section==='verse'?'vocal':'quiet';
  // A repeated payoff varies *which* existing lane leads; never invents a cue.
  const alt=a.repetition%2===1;
  const progress=(i.positionMs-a.startMs)/(a.endMs-a.startMs);
  const rise=a.section==='build'?clamp(progress,0,1):1;
  let dance=1,camera=1,decoration=1,face=1,lyricGain=1;
  if(priority==='lyrics'){
    dance=1-.018*amount;camera=1-.16*amount;decoration=1-.23*amount;face=1+.012*amount;lyricGain=1;
  }else if(priority==='vocal'){
    dance=1-.009*amount;camera=1-.13*amount;decoration=1-.16*amount;face=1+.013*amount;
  }else if(priority==='quiet'){
    dance=1-.014*amount;camera=1-.10*amount;decoration=1-.18*amount;
  }else if(priority==='build'){
    dance=1+.012*amount*rise;camera=1-.05*amount;decoration=1-.045*amount*(1-rise);
  }else if(priority==='ensemble'){
    dance=1+(alt?.012:.021)*amount;camera=1-(alt?.08:.035)*amount;
    decoration=1-(alt?.085:.03)*amount;
  }else if(priority==='drop'){
    dance=1+.027*amount*(i.kick??0)*(i.energy??0);camera=1-.03*amount;
  }else if(priority==='finale'){
    dance=1+.012*amount;camera=1-.05*amount;face=1+.012*amount;
  }
  if(i.manualDance)dance=1;
  if(i.manualCamera)camera=1;
  if(i.manualLighting){decoration=1;face=1;}
  return {active:true,act:a.index,priority,chapter:a.chapter,repetition:a.repetition,
    dance:round(clamp(dance,.97,1.035)),camera:round(clamp(camera,.8,1)),
    decoration:round(clamp(decoration,.72,1)),face:round(clamp(face,1,1.02)),lyrics:round(clamp(lyricGain,.8,1))};
}
/** Protect existing V621/V602 budgets; this pass ONLY reduces decorative light
 * and permits a tiny increase to already-present portrait key/fill. */
export function composeConcertLightingV623(base:AdvancedStageLightingPlanV621,
 cue:ConcertDramaturgyCueV623):AdvancedStageLightingPlanV621{
  if(!cue.active||!base.active)return base;
  const scale=(v:number)=>round(clamp(Math.min(v,1+(v-1)*cue.decoration),0,1.11));
  const calm=(v:number)=>round(clamp(v*cue.decoration,0,1.11));
  return {...base,key:round(clamp(base.key*cue.face,.94,1.07)),
    fill:round(clamp(base.fill*cue.face,.94,1.07)),
    beam:calm(base.beam),sweep:calm(base.sweep),haze:calm(base.haze),
    gobo:calm(base.gobo),led:calm(base.led),floorFog:calm(base.floorFog),
    projection:calm(base.projection),spot:scale(base.spot)};
}
/** Existing verified-word timing and V619 readability remain authoritative. */
export function composeConcertLyricsV623(base:CinematicLyricsPerformanceV619,
 cue:ConcertDramaturgyCueV623):CinematicLyricsPerformanceV619{
  if(!cue.active||!base.active)return base;
  if(cue.priority!=='lyrics'&&cue.priority!=='vocal')return base;
  return {...base,wordGain:base.wordGain*cue.lyrics,
    hookUnderline:base.hookUnderline*cue.lyrics,
    plateOpacity:clamp(Math.max(base.plateOpacity,base.plateOpacity+.012*(1-cue.decoration)),0,.95)};
}
