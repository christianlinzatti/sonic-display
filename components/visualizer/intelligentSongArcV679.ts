/** V679 — Intelligent Song Arc Director.
 * One strategic, cross-section dramaturgical score over the existing V604/V671
 * timeline. Every named moment comes from verified, track-bound imported labels.
 * No section inference, camera cuts, new stage objects, audio reads or storage.
 */
import type {NarrativePlanV604,NarrativeCueV604,NarrativeChapterV604} from './fullSongConcertDramaturgyV604';
import type {PacingPlanV671,PacingCueV671} from './fullSongPacingV671';
import type {ConcertDynamicsV502,ConcertTierV502} from './smartConcertDynamicsV502';

export type SongArcRoleV679='foundation'|'build'|'main-peak'|'support-peak'|'rest'|'release';
export type SongArcMomentV679={index:number;startMs:number;endMs:number;chapter:NarrativeChapterV604;
  section:string;role:SongArcRoleV679;intensity:number;motif:string};
export type SongArcPlanV679={trackId:string;durationMs:number;source:'verified-timeline'|'unavailable';
  moments:readonly SongArcMomentV679[];peakIndex:number;supportIndices:readonly number[]};
export type SongArcCueV679={active:boolean;evidence:'verified-arc'|'off';role:SongArcRoleV679|null;
  index:number;emphasis:number;dance:number;camera:number;lighting:number;reason:string};
export type SongArcInputV679={trackId:string;durationMs:number;progressMs:number;playing:boolean;
  enabled:boolean;reducedMotion:boolean;tier:ConcertTierV502;lyricsProtected:boolean;
  manualDance:boolean;manualCamera:boolean;manualLighting:boolean;
  narrativeCue:NarrativeCueV604|null;pacingCue:PacingCueV671|null};
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const smooth=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
const round=(n:number)=>Math.round(n*10000)/10000;
const empty=(trackId:string,durationMs:number):SongArcPlanV679=>({trackId,durationMs,
  source:'unavailable',moments:[],peakIndex:-1,supportIndices:[]});
const off:SongArcCueV679={active:false,evidence:'off',role:null,index:-1,emphasis:0,
  dance:1,camera:1,lighting:1,reason:'Keine bestätigte Songdramaturgie'};

/** Choose the strongest *existing* hook/drop; prefer later payoffs and verified
 * build-to-payoff transitions. Other separated payoffs remain smaller contrasts.
 * Nothing can turn a verse or missing interval into a fabricated drop.
 */
export function planIntelligentSongArcV679(narrative:NarrativePlanV604,pacing:PacingPlanV671):SongArcPlanV679{
  const unavailable=empty(narrative.trackId,narrative.durationMs);
  if(!narrative.trackId||!finite(narrative.durationMs)||narrative.durationMs<12000||
    narrative.durationMs>7200000||!Array.isArray(narrative.acts)||
    !Array.isArray(pacing.beats)||narrative.source!=='verified-v600'||
    pacing.source!=='verified-v604'||pacing.trackId!==narrative.trackId||
    pacing.durationMs!==narrative.durationMs||narrative.acts.length<3||
    narrative.acts.length!==pacing.beats.length||narrative.acts.length>160)return unavailable;
  let previousEnd=0;
  for(let i=0;i<narrative.acts.length;i++){
    const a=narrative.acts[i],b=pacing.beats[i];
    if(!a||!b||a.index!==i||b.index!==i||!finite(a.startMs)||!finite(a.endMs)||
      a.startMs<previousEnd||a.endMs-a.startMs<2600||a.endMs>narrative.durationMs||
      b.startMs!==a.startMs||b.endMs!==a.endMs||b.chapter!==a.chapter||
      b.motif!==a.motif||b.repetition!==a.repetition||!finite(b.strength)||
      !['verse','hook','build','drop','break'].includes(a.section))return unavailable;
    previousEnd=a.endMs;
  }
  const eligible=narrative.acts.map((a,i)=>({a,i})).filter(({a})=>
    (a.section==='hook'||a.section==='drop')&&
    (a.chapter==='payoff'||a.chapter==='ending-arc'));
  if(eligible.length===0)return unavailable;
  const candidateScore=({a,i}:{a:typeof narrative.acts[number];i:number})=>{
    const at=(a.startMs+a.endMs)/2/narrative.durationMs;
    const before=narrative.acts[i-1];
    // Prefer a verified build immediately before the payoff, not a fabricated cue.
    const buildup=before?.section==='build'&&before.endMs===a.startMs ? .22 : 0;
    return at*.62+buildup+Math.min(a.repetition,3)*.045+(a.section==='drop'?.045:0);
  };
  const ranked=[...eligible].sort((a,b)=>candidateScore(b)-candidateScore(a)||a.i-b.i);
  const peakIndex=ranked[0].i;
  // Only add supporting peaks when they are not adjacent to the main highlight.
  const supportIndices:number[]=[];
  for(const candidate of ranked.slice(1)){
    if(supportIndices.length>=2)break;
    const at=(candidate.a.startMs+candidate.a.endMs)/2/narrative.durationMs;
    const tooNear=[peakIndex,...supportIndices].some(i=>{
      const prev=narrative.acts[i],pos=(prev.startMs+prev.endMs)/2/narrative.durationMs;
      return Math.abs(i-candidate.i)<=1||Math.abs(at-pos)<.17;
    });
    if(!tooNear)supportIndices.push(candidate.i);
  }
  const moments=narrative.acts.map((a,index):SongArcMomentV679=>{
    const next=narrative.acts[index+1];
    let role:SongArcRoleV679='foundation';
    let intensity=0;
    if(index===peakIndex){role='main-peak';intensity=.8;}
    else if(supportIndices.includes(index)){role='support-peak';intensity=.35;}
    else if(a.chapter==='respite'){role='rest';intensity=-.53;}
    else if(a.section==='build'&&next?.startMs===a.endMs&&
      (next.index===peakIndex||supportIndices.includes(next.index))){role='build';intensity=.29;}
    else if(a.section==='hook'||a.section==='drop'){role='release';intensity=.08;}
    else if(a.chapter==='setup'){role='foundation';intensity=-.13;}
    else if(a.chapter==='rise'){role='build';intensity=.10;}
    else if(a.chapter==='ending-arc'){role='release';intensity=.14;}
    else {role='foundation';intensity=-.025;}
    // Consecutive high-energy moments should not create a relentless crescendo.
    if(index>0&&a.chapter==='payoff'&&narrative.acts[index-1].chapter==='payoff'&&
      role!=='main-peak')intensity=Math.min(intensity,.05);
    return {index,startMs:a.startMs,endMs:a.endMs,chapter:a.chapter,section:a.section,
      motif:a.motif,role,intensity:round(intensity)};
  });
  return {...unavailable,source:'verified-timeline',moments,peakIndex,supportIndices};
}

/** Sample only with TWO agreeing confirmations (current V604 + current V671).
 * No extra envelope without evidence. Exact identity multipliers for manual lanes.
 */
export function sampleIntelligentSongArcV679(plan:SongArcPlanV679,input:SongArcInputV679):SongArcCueV679{
  if(!input.enabled||!input.playing||input.reducedMotion||input.tier==='low'||
    plan.source!=='verified-timeline'||!input.trackId||input.trackId!==plan.trackId||
    input.durationMs!==plan.durationMs||!finite(input.progressMs)||
    input.progressMs<0||input.progressMs>=plan.durationMs)return off;
  const current=plan.moments.find(m=>input.progressMs>=m.startMs&&input.progressMs<m.endMs);
  const v604=input.narrativeCue,v671=input.pacingCue;
  if(!current||!v604?.active||v604.source!=='verified-v600'||v604.act!==current.index||
    v604.chapter!==current.chapter||v604.motif!==current.motif||
    !finite(v604.transition)||v604.transition<0||v604.transition>1||
    !v671?.active||v671.evidence!=='verified-arc'||v671.beatIndex!==current.index)return off;
  const distance=Math.min(input.progressMs-current.startMs,current.endMs-input.progressMs);
  const fadeMs=Math.min(3200,(current.endMs-current.startMs)*.24);
  const fade=smooth(distance/Math.max(1,fadeMs))*v604.transition;
  const tierGain=input.tier==='balanced'?.65:1;
  const emphasis=round(current.intensity*fade*tierGain*(input.lyricsProtected?.32:1));
  const factor=(bias:number,manual:boolean)=>manual?1:round(clamp(1+emphasis*bias,.975,1.025));
  return {active:true,evidence:'verified-arc',role:current.role,index:current.index,emphasis,
    dance:factor(.023,input.manualDance),camera:factor(.014,input.manualCamera),
    lighting:factor(.027,input.manualLighting),reason:`Bestätigter Songbogen: ${current.role}`};
}

export function coordinateIntelligentSongArcV679(base:ConcertDynamicsV502,cue:SongArcCueV679):ConcertDynamicsV502{
  if(!cue.active||!base.active||(cue.dance===1&&cue.camera===1&&cue.lighting===1))return base;
  const apply=(n:number,g:number)=>round(clamp(n*g,.88,1.12));
  return {...base,dance:apply(base.dance,cue.dance),camera:apply(base.camera,cue.camera),
    lighting:apply(base.lighting,cue.lighting)};
}
