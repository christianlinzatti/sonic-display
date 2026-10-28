/** V629 – Intelligent Song Dramaturgy.
 * Track-bound whole-song *editorial* plan, composed only with the existing V628
 * automatic V623 multipliers. No inferred sections, extra timers or render passes.
 */
import type {NarrativePlanV604,NarrativeCueV604,NarrativeActV604} from './fullSongConcertDramaturgyV604';
import type {ConcertDramaturgyCueV623} from './ultimateConcertDramaturgyV623';
import type {ConcertExperienceV628} from './concertExperienceV628';

export type StoryBeatV629='opening'|'verse'|'breathing-room'|'first-hook'|'reprise'|
  'third-hook'|'build'|'drop'|'interlude'|'verified-finale';
export type StoryActV629={index:number;startMs:number;endMs:number;section:NarrativeActV604['section'];
  beat:StoryBeatV629;hookIndex:number;position:'early'|'middle'|'late';
  /** This is a conservative stage emphasis, not a camera shot or choreography. */
  emphasis:'performer'|'conversation'|'ensemble'|'atmosphere'|'crescendo';
};
export type SongStoryPlanV629={source:'verified-v604'|'off';trackId:string;durationMs:number;
  acts:readonly StoryActV629[];hookCount:number;hasVerifiedFinale:boolean;};
export type SongStoryCueV629={active:boolean;act:number;beat:StoryBeatV629|null;
  emphasis:StoryActV629['emphasis']|null;hookIndex:number;envelope:number;
  cue:ConcertDramaturgyCueV623;};
export type SongStoryInputV629={plan:SongStoryPlanV629;
  narrative?:{plan:NarrativePlanV604;cue:NarrativeCueV604}|null;
  experience:ConcertExperienceV628;trackId:string;durationMs:number;positionMs:number;
  section:string|null;playing:boolean;reducedMotion:boolean;tier:'low'|'balanced'|'high';
  lyricsProtected:boolean;manualDance:boolean;manualCamera:boolean;manualLighting:boolean;};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const round=(n:number)=>Math.round(n*100000)/100000;
const SECTIONS=['verse','hook','build','drop','break'];
const MOTIFS=['portrait','dialogue','ensemble','wide','breath','crescendo'];
/** Precompute once per V604 plan, not inside the render-time sampler. The
 * distinction between a final hook and a real ending requires V604 evidence. */
export function planIntelligentSongDramaturgyV629(n:NarrativePlanV604):SongStoryPlanV629{
  const off:SongStoryPlanV629={source:'off',trackId:n.trackId,durationMs:n.durationMs,
    acts:[],hookCount:0,hasVerifiedFinale:false};
  if(n.source!=='verified-v600'||!n.trackId||!finite(n.durationMs)||n.durationMs<=0||
    !Array.isArray(n.acts)||n.acts.length<3||n.acts.length>160)return off;
  let end=0;const count:Record<string,number>={};let hooks=0;
  for(const [index,a] of n.acts.entries()){
    if(!a||a.index!==index||!SECTIONS.includes(a.section)||!MOTIFS.includes(a.motif)||
      !finite(a.startMs)||!finite(a.endMs)||a.startMs<end||a.startMs<0||
      a.endMs-a.startMs<2600||a.endMs>n.durationMs||
      !Number.isInteger(a.repetition)||a.repetition!==(count[a.section]??0))return off;
    end=a.endMs;count[a.section]=(count[a.section]??0)+1;
    if(a.section==='hook')hooks++;
  }
  const last=n.acts[n.acts.length-1];
  const finale=!!n.endingSupported&&n.acts.length>=4&&last.chapter==='ending-arc'&&
    last.endMs>=n.durationMs-1500&&last.startMs>=n.durationMs*.75;
  const acts=n.acts.map((a,index):StoryActV629=>{
    const progress=(a.startMs+a.endMs)/2/n.durationMs;
    const position=progress<.32?'early':progress<.7?'middle':'late';
    const previous=n.acts[index-1];
    const afterPayoff=previous&&(previous.section==='hook'||previous.section==='drop');
    const beat:StoryBeatV629=finale&&index===n.acts.length-1?'verified-finale':
      a.section==='hook'?(a.repetition===0?'first-hook':a.repetition%2===1?'reprise':'third-hook'):
      a.section==='verse'?(afterPayoff?'breathing-room':index===0?'opening':'verse'):
      a.section==='build'?'build':a.section==='drop'?'drop':'interlude';
    // Cross-song variety: repeating hooks are deliberately not the same pose
    // emphasis; this never changes the pre-existing V604 stage motif itself.
    const emphasis:StoryActV629['emphasis']=beat==='first-hook'?'ensemble':
      beat==='reprise'?'performer':beat==='third-hook'?'conversation':
      beat==='verified-finale'||beat==='build'?'crescendo':
      beat==='interlude'||beat==='breathing-room'?'atmosphere':
      a.motif==='dialogue'?'conversation':a.motif==='ensemble'?'ensemble':'performer';
    return {index,startMs:a.startMs,endMs:a.endMs,section:a.section,
      beat,hookIndex:a.section==='hook'?a.repetition:-1,position,emphasis};
  });
  return {source:'verified-v604',trackId:n.trackId,durationMs:n.durationMs,
    acts,hookCount:hooks,hasVerifiedFinale:finale};
}

/** Apply only small, boundary-faded editorial differences to V628's existing
 * shared score. A positive drop/ending boost requires V623's own verified cue;
 * lyrics, faces, manual edits, reduced motion and low-tier always have priority.
 */
export function sampleIntelligentSongDramaturgyV629(i:SongStoryInputV629):SongStoryCueV629{
  const base=i.experience.cue;
  const off:SongStoryCueV629={active:false,act:-1,beat:null,emphasis:null,
    hookIndex:-1,envelope:0,cue:base};
  const {plan:story,narrative}=i,p=narrative?.plan,c=narrative?.cue;
  if(!i.experience.active||!base.active||!p||!c||!c.active||
    p.source!=='verified-v600'||c.source!=='verified-v600'||story.source!=='verified-v604'||
    !i.playing||i.reducedMotion||i.tier==='low'||!i.trackId||i.trackId!==story.trackId||
    p.trackId!==story.trackId||!finite(i.durationMs)||i.durationMs<=0||
    story.durationMs!==i.durationMs||p.durationMs!==i.durationMs||
    !finite(i.positionMs)||i.positionMs<0||i.positionMs>=i.durationMs||
    !Number.isInteger(c.act)||c.act<0||c.act>=story.acts.length||
    p.acts.length!==story.acts.length||c.act!==i.experience.act||c.act!==base.act||
    !finite(c.transition)||c.transition<0||c.transition>1||
    !finite(i.experience.strength)||i.experience.strength<0||i.experience.strength>1||
    !['low','balanced','high'].includes(i.tier))return off;
  const a=story.acts[c.act],verified=p.acts[c.act];
  if(!a||!verified||a.index!==c.act||verified.index!==c.act||
    a.section!==i.section||a.section!==verified.section||
    a.startMs!==verified.startMs||a.endMs!==verified.endMs||
    verified.repetition!==c.repetition||verified.chapter!==c.chapter||
    verified.motif!==c.motif||i.experience.repetition!==c.repetition||
    i.positionMs<a.startMs||i.positionMs>=a.endMs||
    !finite(base.dance)||base.dance<.97||base.dance>1.035||
    !finite(base.camera)||base.camera<.8||base.camera>1||
    !finite(base.decoration)||base.decoration<.72||base.decoration>1||
    !finite(base.face)||base.face<1||base.face>1.02||
    !finite(base.lyrics)||base.lyrics<.8||base.lyrics>1||
    !finite(i.experience.strength)||
    (a.beat==='verified-finale'&&(!story.hasVerifiedFinale||verified.chapter!=='ending-arc')))
    return off;
  // The ACT envelope goes to zero at boundaries and gaps. A slow full-track
  // contour is anchored to known durations, never invented BPM or audio timing.
  const phase=clamp((i.positionMs-a.startMs)/(a.endMs-a.startMs),0,1);
  const songProgress=clamp(i.positionMs/i.durationMs,0,1);
  const envelope=c.transition*Math.sin(Math.PI*phase)*
    (i.tier==='balanced'?.58:1)*(.74+.26*songProgress);
  const quiet=i.lyricsProtected||base.priority==='lyrics'||base.priority==='vocal';
  const authorisedPayoff=base.priority==='ensemble'||base.priority==='drop'||base.priority==='finale';
  let dance=0,camera=0,decoration=0,face=0;
  switch(a.beat){
    case 'opening':dance=-.012;camera=-.014;decoration=-.021;break;
    case 'verse':dance=-.006;camera=-.009;decoration=-.014;break;
    case 'breathing-room':dance=-.022;camera=-.023;decoration=-.042;break;
    case 'first-hook':dance=authorisedPayoff?.005:0;camera=-.003;decoration=-.006;break;
    case 'reprise':dance=-.010;camera=-.025;decoration=-.024;face=.0015;break;
    case 'third-hook':dance=authorisedPayoff?.008:-.006;camera=-.014;decoration=-.014;break;
    case 'build':dance=authorisedPayoff?.002:0;camera=-.011;decoration=-.015;break;
    case 'drop':dance=base.priority==='drop'?.007:-.009;camera=-.008;decoration=-.014;break;
    case 'interlude':dance=-.022;camera=-.024;decoration=-.048;break;
    case 'verified-finale':dance=base.priority==='finale'?.010:-.003;camera=-.010;decoration=-.010;face=.001;break;
  }
  if(quiet){dance=Math.min(dance,0);camera=Math.min(camera,-.015);
    decoration=Math.min(decoration,-.027);face=Math.max(face,.001);}
  if(a.section==='drop'&&base.priority!=='drop')dance=Math.min(0,dance);
  if(!authorisedPayoff)dance=Math.min(0,dance);
  const f=(v:number,delta:number,min:number,max:number)=>round(clamp(v*(1+delta*envelope),min,max));
  const changed:ConcertDramaturgyCueV623={...base,
    dance:i.manualDance?base.dance:f(base.dance,dance,.97,1.035),
    camera:i.manualCamera?base.camera:f(base.camera,camera,.8,1),
    decoration:i.manualLighting?base.decoration:f(base.decoration,decoration,.72,1),
    face:i.manualLighting?base.face:f(base.face,face,1,1.02),
  };
  return {active:true,act:a.index,beat:a.beat,emphasis:a.emphasis,
    hookIndex:a.hookIndex,envelope:round(envelope),cue:changed};
}
