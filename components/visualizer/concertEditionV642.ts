/** V642 – a conservative, single finishing gate over the already verified V629
 * concert score. Deliberately NO new camera pose, singer, stage, animation, timer,
 * shader or audio analysis. Existing renderers share the resulting V623 cue.
 */
import type {NarrativePlanV604,NarrativeCueV604} from './fullSongConcertDramaturgyV604';
import type {SongStoryCueV629} from './intelligentSongDramaturgyV629';
import type {ConcertDramaturgyCueV623} from './ultimateConcertDramaturgyV623';

export type ConcertFocusV642='off'|'lyrics'|'vocal'|'rest'|'ensemble'|'portrait'|'build'|'drop'|'finale';
export type ConcertEditionV642={active:boolean;act:number;focus:ConcertFocusV642;leadLane:'none'|'dance'|'camera'|'light';
  strength:number;cue:ConcertDramaturgyCueV623};
export type ConcertEditionInputV642={
  story:SongStoryCueV629;narrative?:{plan:NarrativePlanV604;cue:NarrativeCueV604}|null;
  trackId:string;durationMs:number;positionMs:number;section:string|null;
  playing:boolean;enabled:boolean;reducedMotion:boolean;tier:'low'|'balanced'|'high';
  lyricsProtected:boolean;verifiedVocalFocus:boolean;
  manualDance:boolean;manualCamera:boolean;manualLighting:boolean;
};
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const round=(v:number)=>Math.round(v*100000)/100000;
/** No feedback from V641 recorder modifies the live show. Full-song QA is
 * advisory ONLY: users must review the exported evidence before changing settings.
 * Deltas remain negative except for tiny already-authorised ensemble emphasis.
 */
export function coordinateConcertEditionV642(i:ConcertEditionInputV642):ConcertEditionV642{
  const base=i.story.cue;
  const off:ConcertEditionV642={active:false,act:-1,focus:'off',leadLane:'none',strength:0,cue:base};
  const p=i.narrative?.plan,c=i.narrative?.cue;
  if(!i.enabled||!i.playing||i.reducedMotion||i.tier==='low'||
    !i.story.active||!base.active||!p||!c||!c.active||
    p.source!=='verified-v600'||c.source!=='verified-v600'||
    !i.trackId||p.trackId!==i.trackId||!finite(i.durationMs)||i.durationMs<=0||p.durationMs!==i.durationMs||
    !finite(i.positionMs)||i.positionMs<0||i.positionMs>=i.durationMs||
    !Number.isInteger(c.act)||c.act<0||c.act>=p.acts.length||
    i.story.act!==c.act||base.act!==c.act||
    !finite(c.transition)||c.transition<0||c.transition>1||
    !finite(i.story.envelope)||i.story.envelope<0||i.story.envelope>1||
    !finite(base.dance)||base.dance<.97||base.dance>1.035||
    !finite(base.camera)||base.camera<.8||base.camera>1||
    !finite(base.decoration)||base.decoration<.72||base.decoration>1||
    !finite(base.face)||base.face<1||base.face>1.02||
    !finite(base.lyrics)||base.lyrics<.8||base.lyrics>1)return off;
  const a=p.acts[c.act];
  if(!a||a.index!==c.act||a.chapter!==c.chapter||a.motif!==c.motif||a.repetition!==c.repetition||
    a.section!==i.section||base.chapter!==a.chapter||base.repetition!==a.repetition||
    !finite(a.startMs)||!finite(a.endMs)||a.endMs-a.startMs<2600||
    i.positionMs<a.startMs||i.positionMs>=a.endMs||
    !Number.isInteger(a.repetition)||a.repetition<0||a.repetition>160)return off;
  // V629 itself validates its authored beat. Strictly cross-check identity.
  if(i.story.hookIndex!==(a.section==='hook'?a.repetition:-1) || !i.story.beat)return off;
  const proportion=(i.positionMs-a.startMs)/(a.endMs-a.startMs);
  // Smooth to original cue at BOTH ends of each authored act, including seeks.
  const envelope=Math.sin(Math.PI*clamp(proportion,0,1))*c.transition*
    (i.tier==='balanced'?.6:1);
  const lyrics=i.lyricsProtected||base.priority==='lyrics';
  const vocal=!!i.verifiedVocalFocus||base.priority==='vocal';
  const protectedMoment=lyrics||vocal;
  const section=a.section;
  const drop=section==='drop'&&base.priority==='drop';
  const finale=a.chapter==='ending-arc'&&base.priority==='finale';
  const hook=section==='hook'&&base.priority==='ensemble';
  const leadLane:ConcertEditionV642['leadLane']=hook?
    (a.repetition%3===0?'dance':a.repetition%3===1?'camera':'light'):
    drop?'light':finale?'dance':vocal?'camera':lyrics?'none':'none';
  const focus:ConcertFocusV642=lyrics?'lyrics':vocal?'vocal':
    section==='break'?'rest':section==='build'?'build':
    drop?'drop':finale?'finale':hook?'ensemble':
    a.motif==='portrait'||a.motif==='dialogue'?'portrait':'rest';
  let dance=0,camera=0,decoration=0,face=0;
  if(protectedMoment){
    dance=-.012;camera=-.022;decoration=-.045;face=.001;
  }else if(section==='break'){
    dance=-.014;camera=-.018;decoration=-.044;
  }else if(section==='verse'){
    dance=-.008;camera=-.012;decoration=-.022;
  }else if(section==='build'){
    dance=-.004;camera=-.007;decoration=-.013;
  }else if(hook){
    // Each verified hook gives just ONE automatic lane breathing room;
    // all other lanes withdraw. No cumulative four-lane peak.
    dance=leadLane==='dance'?.002:-.010;
    camera=leadLane==='camera'?-.003:-.018;
    decoration=leadLane==='light'?-.003:-.024;
  }else if(drop){
    dance=-.007;camera=-.018;decoration=-.004;
  }else if(finale){
    dance=-.003;camera=-.014;decoration=-.018;
  }else{
    dance=-.013;camera=-.017;decoration=-.033;
  }
  // Unsupported drops must never be promoted. Verified singer or text always
  // defeats a scheduled stage payoff, even with strong audio energy.
  if(section==='drop'&&!drop){dance=Math.min(0,dance);decoration=Math.min(decoration,-.03);}
  const scale=(n:number,delta:number,min:number,max:number)=>round(clamp(n*(1+delta*envelope),min,max));
  const cue:ConcertDramaturgyCueV623={...base,
    dance:i.manualDance?base.dance:scale(base.dance,dance,.97,1.035),
    camera:i.manualCamera?base.camera:scale(base.camera,camera,.8,1),
    decoration:i.manualLighting?base.decoration:scale(base.decoration,decoration,.72,1),
    face:i.manualLighting?base.face:scale(base.face,face,1,1.02),
    lyrics:base.lyrics,
  };
  return {active:true,act:a.index,focus,leadLane:protectedMoment?'none':leadLane,
    strength:round(envelope),cue};
}
