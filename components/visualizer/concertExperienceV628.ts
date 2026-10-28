/** V628 – Concert Experience 2.0.
 * A single, stateless editorial finishing pass over V623's existing live lanes.
 * Verified V604 acts supply only a *motif* and a repeat count; no camera cuts,
 * new animation clips, scene reloads, light sources, song sections or timers.
 */
import type {NarrativePlanV604,NarrativeCueV604,NarrativeMotifV604} from './fullSongConcertDramaturgyV604';
import type {ConcertDramaturgyCueV623} from './ultimateConcertDramaturgyV623';
export type ConcertExperienceMomentV628='off'|'close-up'|'conversation'|'ensemble'|'panorama'|'breathing'|'crescendo';
export type ConcertExperienceV628={
  active:boolean;act:number;moment:ConcertExperienceMomentV628;
  /** Fully identified, not a guessed shot or performer assignment. */
  motif:NarrativeMotifV604|null;repetition:number;strength:number;
  /** Compatible with V623: the four existing render lanes consume one score. */
  cue:ConcertDramaturgyCueV623;
};
export type ConcertExperienceInputV628={
  base:ConcertDramaturgyCueV623;
  narrative?:{plan:NarrativePlanV604;cue:NarrativeCueV604}|null;
  trackId:string;durationMs:number;positionMs:number;section:string|null;
  playing:boolean;reducedMotion:boolean;tier:'low'|'balanced'|'high';
  lyricsProtected:boolean;manualDance:boolean;manualCamera:boolean;manualLighting:boolean;
};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const round=(n:number)=>Math.round(n*100000)/100000;
const momentFor=(motif:NarrativeMotifV604):ConcertExperienceMomentV628=>({
  portrait:'close-up',dialogue:'conversation',ensemble:'ensemble',wide:'panorama',
  breath:'breathing',crescendo:'crescendo',
} as const)[motif];
/** Unlike a stateful scene cycler, seek/replay reproduces exactly the same cue.
 * A new section fades IN and OUT with V604's checked transition envelope.
 * Every multiplier is tiny and bounded and respects the final V351 camera gate.
 */
export function planConcertExperienceV628(i:ConcertExperienceInputV628):ConcertExperienceV628{
  const off:ConcertExperienceV628={active:false,act:-1,moment:'off',motif:null,
    repetition:0,strength:0,cue:i.base};
  const n=i.narrative,p=n?.plan,c=n?.cue,base=i.base;
  if(!base.active||!p||!c||!c.active||p.source!=='verified-v600'||c.source!=='verified-v600'||
    !i.playing||i.reducedMotion||i.tier==='low'||!i.trackId||p.trackId!==i.trackId||
    !finite(i.durationMs)||i.durationMs<=0||p.durationMs!==i.durationMs||
    !finite(i.positionMs)||i.positionMs<0||i.positionMs>=p.durationMs||
    !finite(c.transition)||c.transition<0||c.transition>1||
    !Number.isInteger(c.act)||c.act<0||c.act>=p.acts.length||c.act!==base.act)return off;
  const a=p.acts[c.act];
  if(!a||a.index!==c.act||a.section!==i.section||a.chapter!==c.chapter||
    a.motif!==c.motif||a.repetition!==c.repetition||base.chapter!==a.chapter||
    base.repetition!==a.repetition||!finite(a.startMs)||!finite(a.endMs)||
    a.endMs<=a.startMs||i.positionMs<a.startMs||i.positionMs>=a.endMs||
    !Number.isInteger(a.repetition)||a.repetition<0||a.repetition>160||
    !finite(base.dance)||!finite(base.camera)||!finite(base.decoration)||!finite(base.face)||!finite(base.lyrics)||
    base.dance<.97||base.dance>1.035||base.camera<.8||base.camera>1||
    base.decoration<.72||base.decoration>1||base.face<1||base.face>1.02||
    base.lyrics<.8||base.lyrics>1)return off;
  const motif=a.motif;
  const moment=momentFor(motif);
  if(!moment)return off;
  // A quiet verse should stay calm; the second/third hook shifts emphasis
  // between existing portrait and ensemble lanes, not between loaded stages.
  const centered=clamp((i.positionMs-a.startMs)/(a.endMs-a.startMs),0,1);
  const contour=Math.sin(Math.PI*centered); // zero at each act boundary
  const gain=c.transition*contour*(i.tier==='balanced'?.58:1);
  const protectedLyrics=i.lyricsProtected||base.priority==='lyrics';
  const protectedVocal=base.priority==='vocal';
  const protectedAny=protectedLyrics||protectedVocal;
  const repeat=a.repetition%3;
  // Only a verified, externally confirmed hook/drop/ending may enlarge dance.
  const payoff=base.priority==='ensemble'||base.priority==='drop'||base.priority==='finale';
  let dance=0,camera=0,decoration=0,face=0;
  if(moment==='close-up'){
    dance=-.010;camera=-.022;decoration=-.045;face=.0015;
  }else if(moment==='conversation'){
    dance=-.006;camera=-.018;decoration=-.032;face=.001;
  }else if(moment==='ensemble'){
    dance=payoff?.007:-.004;camera=-.006;decoration=-.013;
  }else if(moment==='panorama'){
    dance=payoff?.004:-.005;camera=-.010;decoration=-.009;
  }else if(moment==='breathing'){
    dance=-.018;camera=-.026;decoration=-.058;
  }else if(moment==='crescendo'){
    dance=payoff?.009:0;camera=-.009;decoration=-.012;
  }
  // Repeated hooks choose subtly different *emphasis*, keeping every lane safe.
  if(a.section==='hook'&&payoff){
    if(repeat===1){dance-=.006;camera-=.012;decoration-=.011;face+=.001;}
    if(repeat===2){dance+=.003;camera-=.004;decoration-=.022;}
  }
  if(protectedAny){dance=Math.min(0,dance);decoration=Math.min(decoration,-.055);
    camera=Math.min(camera,-.026);face=Math.max(face,.0015);}
  if(a.section==='drop'&&base.priority!=='drop'){
    // V623 did not verify an audible drop: no extra celebratory energy.
    dance=Math.min(0,dance);decoration=Math.min(0,decoration);face=0;
  }
  const changed:ConcertDramaturgyCueV623={...base,
    dance:i.manualDance?base.dance:round(clamp(base.dance*(1+dance*gain),.97,1.035)),
    camera:i.manualCamera?base.camera:round(clamp(base.camera*(1+camera*gain),.8,1)),
    decoration:i.manualLighting?base.decoration:round(clamp(base.decoration*(1+decoration*gain),.72,1)),
    face:i.manualLighting?base.face:round(clamp(base.face*(1+face*gain),1,1.02)),
  };
  return {active:true,act:a.index,moment,motif,repetition:a.repetition,strength:round(gain),cue:changed};
}
