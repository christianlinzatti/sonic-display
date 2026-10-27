/** V604 – an evidence-preserving, full-track dramaturgical layer over V600.
 * Never detects sections, vocals, beats or camera poses. Works ONLY with validated
 * V600 authored acts and the currently confirmed V318 live section. No new clocks.
 */
import type {ConcertArcV600,ConcertArcCueV600,ConcertActV600} from './ultimateConcertDirectorV600';
import type {ConcertDynamicsV502} from './smartConcertDynamicsV502';
import type {GroupStudioV326,GroupFormationV326} from './multiAvatarStageDirectorV326';
import {layoutV326} from './multiAvatarStageDirectorV326';

export type NarrativeChapterV604='setup'|'develop'|'rise'|'payoff'|'respite'|'ending-arc';
export type NarrativeMotifV604='portrait'|'dialogue'|'ensemble'|'wide'|'breath'|'crescendo';
export type NarrativeActV604={
  index:number;startMs:number;endMs:number;section:ConcertActV600['section'];
  chapter:NarrativeChapterV604;motif:NarrativeMotifV604;repetition:number;
  /** Small signed modulation coefficients; these are not camera shot commands. */
  danceGain:number;cameraGain:number;lightGain:number;
};
export type NarrativePlanV604={trackId:string;durationMs:number;genre:ConcertArcV600['genre'];
  source:'verified-v600'|'unavailable';acts:readonly NarrativeActV604[];
  endingSupported:boolean;};
export type NarrativeCueV604={active:boolean;source:'verified-v600'|'off';
  act:number;chapter:NarrativeChapterV604|null;motif:NarrativeMotifV604|null;
  repetition:number;transition:number;dynamics:ConcertDynamicsV502};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,a:number,b:number)=>Math.min(b,Math.max(a,n));
const smooth=(t:number)=>{const x=clamp(t,0,1);return x*x*(3-2*x);};
const round=(n:number)=>Math.round(n*100000)/100000;
const motifs:NarrativeMotifV604[]=['portrait','dialogue','ensemble','wide'];

/** Every cue comes from a V600-validated, non-overlapping, high-confidence import.
 * The ending-arc label describes a small intensity envelope, never an inferred outro.
 */
export function planFullSongDramaturgyV604(arc:ConcertArcV600):NarrativePlanV604{
  const empty:NarrativePlanV604={trackId:arc.trackId,durationMs:arc.durationMs,genre:arc.genre,
    source:'unavailable',acts:[],endingSupported:false};
  if(arc.source!=='authored'||!arc.trackId||!finite(arc.durationMs)||arc.durationMs<=0||
    !Array.isArray(arc.acts)||!arc.acts.length||arc.acts.length>160)return empty;
  let previousEnd=0;
  for(const [i,a] of arc.acts.entries()){
    if(!finite(a.startMs)||!finite(a.endMs)||!Number.isInteger(a.index)||a.index!==i||a.startMs<previousEnd||
      a.endMs-a.startMs<2600||a.endMs>arc.durationMs||a.startMs<0||
      !['verse','hook','build','drop','break'].includes(a.section))return empty;
    previousEnd=a.endMs;
  }
  const last=arc.acts[arc.acts.length-1];
  const endingSupported=arc.acts.length>=4&&last.endMs>=arc.durationMs-1500&&
    last.startMs>=arc.durationMs*.75;
  const repeats:Record<string,number>={};
  let lastMotif:NarrativeMotifV604|null=null;
  const result:NarrativeActV604[]=arc.acts.map((a,i)=>{
    const repetition=repeats[a.section]??0;repeats[a.section]=repetition+1;
    const at=(a.startMs+a.endMs)/2/arc.durationMs;
    const chapter:NarrativeChapterV604=endingSupported&&i===arc.acts.length-1?'ending-arc':
      a.section==='break'?'respite':a.section==='hook'||a.section==='drop'?'payoff':
      a.section==='build'?'rise':at<.24?'setup':'develop';
    // Repeated hooks alternate between audience-wide and duet/portrait focus;
    // avoid any neighboring identical *motif* even across different sections.
    const suggested:NarrativeMotifV604=chapter==='ending-arc'?'crescendo':chapter==='respite'?'breath':
      a.section==='hook'||a.section==='drop'?(repetition%2===0?'wide':'ensemble'):
      a.section==='build'?'ensemble':motifs[(i+repetition+(arc.genre==='hardtekk'?1:0))%motifs.length];
    const motif:NarrativeMotifV604=suggested===lastMotif&&chapter!=='ending-arc'&&chapter!=='respite'
      ?motifs[(motifs.indexOf(suggested)+1)%motifs.length]:suggested;
    lastMotif=motif;
    const lift=clamp(.45+.38*at+.12*repetition,.45,1);
    const genre=arc.genre==='hardstyle'?1.08:arc.genre==='hardtekk'?1.04:1;
    const weight=chapter==='respite'?-0.55:chapter==='setup'?0.26:
      chapter==='rise'?0.56:chapter==='payoff'?0.83:chapter==='ending-arc'?1:0.38;
    const scale=weight*lift*genre;
    return {index:a.index,startMs:a.startMs,endMs:a.endMs,section:a.section,
      chapter,motif,repetition,danceGain:round(scale*.019),cameraGain:round(scale*(motif==='portrait'?.014:.022)),
      lightGain:round(scale*.027)};
  });
  return {...empty,source:'verified-v600',acts:result,endingSupported};
}

export function narrativeActAtV604(plan:NarrativePlanV604,ms:number):NarrativeActV604|null{
  if(!finite(ms)||ms<0||ms>=plan.durationMs||plan.source!=='verified-v600')return null;
  let low=0,high=plan.acts.length;
  while(low<high){const mid=(low+high)>>1;if(plan.acts[mid].startMs<=ms)low=mid+1;else high=mid;}
  const act=plan.acts[low-1];return act&&ms<act.endMs?act:null;
}

/** Fade the EXTRA V604 layer to zero at every genuine section boundary (including
 * gaps), so a song section change cannot introduce a camera or lighting step.
 */
export function sampleFullSongDramaturgyV604(plan:NarrativePlanV604,input:{
  trackId:string;progressMs:number;playing:boolean;enabled:boolean;reducedMotion:boolean;
  tier:'low'|'balanced'|'high';manualDance:boolean;manualCamera:boolean;manualLighting:boolean;
  lyricsProtected:boolean;confirmedV600:ConcertArcCueV600;
  base:ConcertDynamicsV502;
}):NarrativeCueV604{
  const off:NarrativeCueV604={active:false,source:'off',act:-1,chapter:null,motif:null,
    repetition:0,transition:0,dynamics:input.base};
  if(!input.enabled||!input.playing||input.reducedMotion||input.tier==='low'||
    plan.source!=='verified-v600'||input.trackId!==plan.trackId||
    !input.base.active||!finite(input.progressMs))return off;
  const act=narrativeActAtV604(plan,input.progressMs);
  // Critical: V600 has independently matched the LIVE V318 section, and is
  // unambiguously authored. Never use a stale import to force an act on screen.
  if(!act||!input.confirmedV600.active||input.confirmedV600.source!=='authored'||
    input.confirmedV600.act!==act.index||input.confirmedV600.section!==act.section)return off;
  const time=Math.min(input.progressMs-act.startMs,act.endMs-input.progressMs);
  const fadeMs=Math.min(2400,(act.endMs-act.startMs)*.28);
  const transition=smooth(time/Math.max(1,fadeMs));
  const tierGain=input.tier==='balanced'?.64:1;
  const lyricGain=input.lyricsProtected?.28:1;
  const gain=transition*tierGain*lyricGain;
  const f=(v:number,mod:number)=>round(clamp(v*(1+mod*gain),.88,1.12));
  const dynamics:ConcertDynamicsV502={...input.base,
    dance:input.manualDance?input.base.dance:f(input.base.dance,act.danceGain),
    camera:input.manualCamera?input.base.camera:f(input.base.camera,act.cameraGain),
    lighting:input.manualLighting?input.base.lighting:f(input.base.lighting,act.lightGain),
    // Lyric strength, word timing and singer are never modified.
  };
  return {active:true,source:'verified-v600',act:act.index,chapter:act.chapter,
    motif:act.motif,repetition:act.repetition,transition:round(transition),dynamics};
}

/** V604 changes NO timestamps, singer focuses, choreography clips or manual cues.
 * Alter only existing auto-group formations outside explicit hooks and drops.
 */
export function refineAutomaticGroupV604(group:GroupStudioV326|null,plan:NarrativePlanV604,
  opts:{enabled:boolean;reducedMotion:boolean;tier:'low'|'balanced'|'high'}):GroupStudioV326|null{
  if(!group||!opts.enabled||opts.reducedMotion||opts.tier==='low'||
    plan.source!=='verified-v600'||group.trackId!==plan.trackId||!group.enabled||
    !group.songSync||![3,4].includes(group.count)||group.cues.length<2||group.cues.length>64||
    !group.cues.every(c=>/^(auto-v442-|v446-)/.test(c.id)))return group;
  let changed=false;
  const cues=group.cues.map(c=>{
    const a=narrativeActAtV604(plan,c.at*1000);
    if(!a||c.drop||c.focus<0||a.section==='hook'||a.section==='drop'||a.chapter==='ending-arc')return c;
    const target:GroupFormationV326=a.motif==='dialogue'?'arc':a.motif==='portrait'?'stagger':
      a.motif==='ensemble'?'wide':a.motif==='breath'?'line':a.motif==='wide'?'wide':'line';
    if(target===c.formation)return c;
    changed=true;
    return {...c,formation:target,positions:layoutV326(target,group.count)};
  });
  return changed?{...group,cues}:group;
}
