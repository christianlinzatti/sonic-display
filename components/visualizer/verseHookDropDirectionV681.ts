/** V681 — Verse / Hook / Drop Intelligence.
 * Evidence-bound *section contrast* on the one V604/V671/V679 timeline.
 * This is not a section detector, camera cutter, lighting cue scheduler or vocal
 * assignment system. All three automatic multipliers remain small and the
 * existing V670 quality guard is downstream of this module.
 */
import type {NarrativePlanV604,NarrativeCueV604,NarrativeChapterV604,NarrativeMotifV604} from './fullSongConcertDramaturgyV604';
import type {PacingPlanV671,PacingCueV671} from './fullSongPacingV671';
import type {SongArcPlanV679,SongArcCueV679,SongArcRoleV679} from './intelligentSongArcV679';
import type {ConcertDynamicsV502,ConcertTierV502} from './smartConcertDynamicsV502';

export type SectionV681='verse'|'hook'|'build'|'drop'|'break';
export type SectionFlavorV681='lyric-space'|'wide-hook'|'answer-hook'|'rising-build'|'drop-impact'|'breathing-room';
export type SectionMomentV681={index:number;startMs:number;endMs:number;section:SectionV681;chapter:NarrativeChapterV604;motif:NarrativeMotifV604;
  flavor:SectionFlavorV681;repetition:number;arcRole:SongArcRoleV679};
export type SectionPlanV681={trackId:string;durationMs:number;source:'verified-v604-v671-v679'|'unavailable';
  moments:readonly SectionMomentV681[]};
export type SectionCueV681={active:boolean;evidence:'verified-section'|'off';index:number;
  section:SectionV681|null;flavor:SectionFlavorV681|null;emphasis:number;
  dance:number;camera:number;lighting:number;reason:string};
export type SectionInputV681={trackId:string;durationMs:number;progressMs:number;playing:boolean;
  enabled:boolean;reducedMotion:boolean;tier:ConcertTierV502;lyricsProtected:boolean;
  manualDance:boolean;manualCamera:boolean;manualLighting:boolean;
  narrativeCue:NarrativeCueV604|null;pacingCue:PacingCueV671|null;arcCue:SongArcCueV679|null};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(n,min));
const smooth=(n:number)=>{const x=clamp(n,0,1);return x*x*(3-2*x);};
const round=(n:number)=>Math.round(n*10000)/10000;
const empty=(trackId:string,durationMs:number):SectionPlanV681=>({trackId,durationMs,source:'unavailable',moments:[]});
const off:SectionCueV681={active:false,evidence:'off',index:-1,section:null,flavor:null,emphasis:0,
  dance:1,camera:1,lighting:1,reason:'Keine aktuell bestätigte Abschnittsregie'};
const sections:readonly SectionV681[]=['verse','hook','build','drop','break'];

/** The V679 arc already validates all V604/V671 boundaries. Recheck exact
 * association with the current plans so that stale or spoofed arcs never apply.
 */
export function planSectionDirectionV681(narrative:NarrativePlanV604,pacing:PacingPlanV671,
  arc:SongArcPlanV679):SectionPlanV681{
  const unavailable=empty(narrative.trackId,narrative.durationMs);
  if(!narrative.trackId||!finite(narrative.durationMs)||narrative.source!=='verified-v600'||
    pacing.source!=='verified-v604'||arc.source!=='verified-timeline'||
    pacing.trackId!==narrative.trackId||arc.trackId!==narrative.trackId||
    pacing.durationMs!==narrative.durationMs||arc.durationMs!==narrative.durationMs||
    !Array.isArray(narrative.acts)||!Array.isArray(pacing.beats)||!Array.isArray(arc.moments)||
    narrative.acts.length<3||narrative.acts.length>160||
    pacing.beats.length!==narrative.acts.length||arc.moments.length!==narrative.acts.length)return unavailable;
  const moments:SectionMomentV681[]=[];
  let previousEnd=0;
  for(let index=0;index<narrative.acts.length;index++){
    const n=narrative.acts[index],p=pacing.beats[index],a=arc.moments[index];
    if(!n||!p||!a||n.index!==index||p.index!==index||a.index!==index||
      !finite(n.startMs)||!finite(n.endMs)||n.startMs<previousEnd||n.endMs-n.startMs<2600||
      n.endMs>narrative.durationMs||n.startMs!==p.startMs||n.endMs!==p.endMs||
      n.startMs!==a.startMs||n.endMs!==a.endMs||n.chapter!==p.chapter||
      n.chapter!==a.chapter||n.motif!==p.motif||n.motif!==a.motif||
      n.section!==a.section||n.repetition!==p.repetition||
      !Number.isInteger(n.repetition)||n.repetition<0||!sections.includes(n.section as SectionV681))return unavailable;
    previousEnd=n.endMs;
    const section=n.section as SectionV681;
    const flavor:SectionFlavorV681=section==='verse'?'lyric-space':
      section==='hook'?(n.repetition%2===0?'wide-hook':'answer-hook'):
      section==='build'?'rising-build':section==='drop'?'drop-impact':'breathing-room';
    moments.push({index,startMs:n.startMs,endMs:n.endMs,section,chapter:n.chapter,motif:n.motif,flavor,
      repetition:n.repetition,arcRole:a.role});
  }
  return {...unavailable,source:'verified-v604-v671-v679',moments};
}

function momentAt(plan:SectionPlanV681,ms:number):SectionMomentV681|null{
  let low=0,high=plan.moments.length;
  while(low<high){const mid=(low+high)>>1;if(plan.moments[mid].startMs<=ms)low=mid+1;else high=mid;}
  const m=plan.moments[low-1];return m&&ms<m.endMs?m:null;
}

/** Small section-specific accents. At every boundary, including section gaps,
 * output EXACT identity multipliers; never create a jump or fake a drop.
 */
export function sampleSectionDirectionV681(plan:SectionPlanV681,input:SectionInputV681):SectionCueV681{
  if(plan.source!=='verified-v604-v671-v679'||!input.enabled||!input.playing||
    input.reducedMotion||input.tier==='low'||!input.trackId||input.trackId!==plan.trackId||
    input.durationMs!==plan.durationMs||!finite(input.progressMs)||input.progressMs<0||
    input.progressMs>=plan.durationMs)return off;
  const m=momentAt(plan,input.progressMs),n=input.narrativeCue,p=input.pacingCue,a=input.arcCue;
  if(!m||!n?.active||n.source!=='verified-v600'||n.act!==m.index||
    n.chapter!==m.chapter||n.motif!==m.motif||n.repetition!==m.repetition||
    !finite(n.transition)||n.transition<0||n.transition>1||
    !p?.active||p.evidence!=='verified-arc'||p.beatIndex!==m.index||
    !a?.active||a.evidence!=='verified-arc'||a.index!==m.index||a.role!==m.arcRole)return off;
  const duration=m.endMs-m.startMs;
  const elapsed=input.progressMs-m.startMs;
  const endDistance=m.endMs-input.progressMs;
  const edge=Math.min(2800,duration*.23);
  const envelope=smooth(elapsed/edge)*smooth(endDistance/edge);
  const tierGain=input.tier==='balanced'?.66:1;
  const lyricGain=input.lyricsProtected?.28:1;
  // A build slowly climbs *within its verified interval*, no new fake countdown.
  const buildRise=m.section==='build'?.35+.65*smooth(elapsed/duration):1;
  const emphasis=round(envelope*n.transition*tierGain*lyricGain*buildRise);
  // Distinct, intentionally conservative stage directions. "wide" and "answer"
  // are descriptive visual accents, NOT actual camera cuts or avatar formations.
  const targets:Record<SectionFlavorV681,readonly [number,number,number]>={
    'lyric-space':[-.006,-.009,-.006],
    'wide-hook':[.008,.011,.011],
    'answer-hook':[.012,.004,.009],
    'rising-build':[.004,.003,.012],
    'drop-impact':[.016,.005,.020],
    'breathing-room':[-.012,-.009,-.019],
  };
  const [danceBias,cameraBias,lightBias]=targets[m.flavor];
  // The V679 main-peak is the unique dramatic headline; the other payoffs
  // receive less V681 pressure instead of all becoming equally loud.
  const peakScale=m.section==='hook'||m.section==='drop'?
    m.arcRole==='main-peak'?1:m.arcRole==='support-peak'?.75:.52:1;
  const factor=(bias:number,manual:boolean,lyricFactor:number)=>manual?1:
    round(clamp(1+bias*emphasis*peakScale*lyricFactor,.978,1.022));
  return {active:true,evidence:'verified-section',index:m.index,section:m.section,
    flavor:m.flavor,emphasis,dance:factor(danceBias,input.manualDance,1),
    camera:factor(cameraBias,input.manualCamera,input.lyricsProtected?.55:1),
    lighting:factor(lightBias,input.manualLighting,1),
    reason:`Bestätigter Abschnitt ${m.index+1}: ${m.section} (${m.flavor})`};
}

export function coordinateSectionDirectionV681(base:ConcertDynamicsV502,cue:SectionCueV681):ConcertDynamicsV502{
  if(!base.active||!cue.active||(cue.dance===1&&cue.camera===1&&cue.lighting===1))return base;
  const apply=(value:number,factor:number)=>round(clamp(value*factor,.88,1.12));
  return {...base,dance:apply(base.dance,cue.dance),camera:apply(base.camera,cue.camera),
    lighting:apply(base.lighting,cue.lighting)};
}
