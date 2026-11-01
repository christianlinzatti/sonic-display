/** V690 – song-arc-dependent scenic expansion of EXISTING stage materials.
 * Verified V604 chapter/section evidence, V622 safety and playback clock are the
 * sole authorities. Never loads a venue, changes a user-selected theme, creates
 * geometry, invents a finale or overrides authored light/scene/timeline settings.
 */
import type {StageTransformationContextV622,StageTransformationV622} from './dynamicStageTransformationV622';
import type {NarrativeActV604,NarrativePlanV604} from './fullSongConcertDramaturgyV604';

export type StageScaleV690='intimate'|'opening'|'rising'|'arena'|'finale'|'breath';
export type AdaptiveStageInputV690=StageTransformationContextV622&{
  foundation:StageTransformationV622;visualsEnabled:boolean;groupCount:number;
};
export type AdaptiveStageCueV690={active:boolean;act:number;scale:StageScaleV690|null;
  /** Reusable perimeter-projection depth, 0..0.75. */morph:number;
  /** Additional bounded ambient/floor COLOR blending, never light gain. */
  ambientMix:number;floorMix:number;warmth:number;
  /** Extra fog *distance* only; no new fog nor higher fog density. */fogClearance:number;
};
export const NEUTRAL_ADAPTIVE_STAGE_V690:Readonly<AdaptiveStageCueV690>=Object.freeze({
  active:false,act:-1,scale:null,morph:0,ambientMix:0,floorMix:0,warmth:0,fogClearance:0,
});
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const smooth=(x:number)=>{const t=clamp(x,0,1);return t*t*(3-2*t);};
const round=(v:number)=>Math.round(v*100000)/100000;
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const supported=['deutschrap','hiphop','rap','trap','drill','hardstyle','hardtekk','rock','pop','electronic'];
function desired(a:NarrativeActV604,p:NarrativePlanV604):number{
  // Only a documented, verified last act is called a finale.
  const finale=p.endingSupported&&a.chapter==='ending-arc'&&a.index===p.acts.length-1;
  const progress=clamp((a.startMs+a.endMs)*.5/p.durationMs,0,1);
  const chapter=a.chapter==='setup'?.08:a.chapter==='develop'?.23:
    a.chapter==='rise'?.46:a.chapter==='payoff'?.57:
    a.chapter==='respite'?.14:finale?.87:.32;
  const section=a.section==='break'?-.04:a.section==='build'?.065:
    a.section==='hook'?.075:a.section==='drop'?.11:0;
  return clamp(chapter+progress*.20+section,0,1);
}
function scaleFor(a:NarrativeActV604,p:NarrativePlanV604):StageScaleV690{
  if(p.endingSupported&&a.chapter==='ending-arc'&&a.index===p.acts.length-1)return 'finale';
  return a.section==='break'?'breath':a.section==='build'?'rising':
    a.section==='hook'||a.section==='drop'?'arena':a.chapter==='setup'?'intimate':'opening';
}
/** Neighbor-aware boundary fade: continuous for contiguous sections, zero at gaps.
 * Act boundaries use one shared 50/50 target; no hard jumps during seeking.
 */
function expansionAt(a:NarrativeActV604,p:NarrativePlanV604,ms:number):number{
  const target=desired(a,p),prev=p.acts[a.index-1],next=p.acts[a.index+1];
  const length=a.endMs-a.startMs;
  const enter=Math.min(1800,length*.18,prev?(prev.endMs-prev.startMs)*.18:1800);
  const leave=Math.min(1800,length*.18,next?(next.endMs-next.startMs)*.18:1800);
  if(ms-a.startMs<enter){
    const atStart=prev&&prev.endMs===a.startMs?(desired(prev,p)+target)*.5:0;
    return lerp(atStart,target,smooth((ms-a.startMs)/Math.max(1,enter)));
  }
  if(a.endMs-ms<leave){
    const atEnd=next&&next.startMs===a.endMs?(target+desired(next,p))*.5:0;
    return lerp(atEnd,target,smooth((a.endMs-ms)/Math.max(1,leave)));
  }
  return target;
}
export function planAdaptiveStageTransformationV690(input:AdaptiveStageInputV690):AdaptiveStageCueV690{
  const p=input.narrative?.plan,c=input.narrative?.cue,b=input.foundation;
  const genre=typeof input.genre==='string'?input.genre.trim().toLowerCase():'';
  if(!supported.includes(genre)||!input.visualsEnabled||!input.playing||!input.reactive||
    input.reducedMotion||input.tier==='low'||input.authored||input.blackout||
    !p||p.source!=='verified-v600'||!c||!c.active||c.source!=='verified-v600'||
    !b||!b.active||b.act!==c.act||!input.trackId||input.trackId!==p.trackId||
    !finite(p.durationMs)||p.durationMs<=0||!finite(input.durationMs)||
    input.durationMs!==p.durationMs||!finite(input.positionMs)||
    input.positionMs<0||input.positionMs>=p.durationMs||
    !Number.isInteger(c.act)||c.act<0||c.act>=p.acts.length||
    !finite(c.transition)||c.transition<=0||c.transition>1||
    !Number.isInteger(input.groupCount)||input.groupCount<1||input.groupCount>4||
    !finite(b.blend)||b.blend<0||b.blend>1||!finite(b.background)||b.background<0||b.background>.16||
    !finite(b.floor)||b.floor<0||b.floor>.18)return {...NEUTRAL_ADAPTIVE_STAGE_V690};
  const a=p.acts[c.act];
  if(!a||a.index!==c.act||a.chapter!==c.chapter||a.motif!==c.motif||
    a.repetition!==c.repetition||a.section!==input.section||
    !finite(a.startMs)||!finite(a.endMs)||a.startMs<0||a.endMs>p.durationMs||
    a.endMs<=a.startMs||input.positionMs<a.startMs||input.positionMs>=a.endMs)
    return {...NEUTRAL_ADAPTIVE_STAGE_V690};
  const balance=(input.tier==='balanced'?.62:1)*
    (input.lyricsProtected?.44:1)*(input.vocalFocus?.65:1)*
    (input.groupCount===4?.64:input.groupCount===3?.77:1)*c.transition;
  const envelope=clamp(expansionAt(a,p,input.positionMs)*balance,0,1);
  // No amplification of existing light/LED alpha budgets. Even a verified
  // finale changes only color/perimeter geometry and small fog distance.
  const warm=genre==='rock'||genre==='pop'?.42:genre==='hardtekk'?-.48:genre==='deutschrap'?-.18:.12;
  return {active:true,act:a.index,scale:scaleFor(a,p),
    morph:round(clamp(envelope*.72,0,.75)),
    ambientMix:round(clamp(envelope*.045,0,.05)),
    floorMix:round(clamp(envelope*.052,0,.055)),
    warmth:round(clamp(envelope*warm,-.35,.35)),
    fogClearance:round(clamp(envelope*.38,0,.4))};
}
