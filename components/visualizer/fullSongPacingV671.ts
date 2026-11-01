/** V671 — continuous whole-song pacing on the existing V604/V669 director.
 * A deterministic *small* modulation, never an independent scene/shot/audio director.
 * Only confirmed V604 acts are named; gaps and missing data are unclassified.
 */
import type {NarrativePlanV604,NarrativeCueV604,NarrativeChapterV604,NarrativeMotifV604} from './fullSongConcertDramaturgyV604';
import type {ConcertDynamicsV502,ConcertTierV502} from './smartConcertDynamicsV502';
import type {UniversalShowStyleV669} from './universalConcertShowDirectorV669';

export type PacingEvidenceV671='verified-arc'|'continuous-contour'|'off';
export type PacingIntentV671='establish'|'develop'|'lift'|'climax'|'breathe'|'finale'|'neutral';
export type PacingBeatV671={index:number;startMs:number;endMs:number;chapter:NarrativeChapterV604;
  motif:NarrativeMotifV604;intent:PacingIntentV671;repetition:number;strength:number};
export type PacingPlanV671={trackId:string;durationMs:number;source:'verified-v604'|'unclassified';beats:readonly PacingBeatV671[];
  highPointIndex:number};
export type PacingCueV671={active:boolean;evidence:PacingEvidenceV671;intent:PacingIntentV671;
  beatIndex:number;strength:number;dance:number;camera:number;lighting:number;reason:string};
export type PacingInputV671={trackId:string;durationMs:number;progressMs:number;playing:boolean;
  enabled:boolean;reducedMotion:boolean;tier:ConcertTierV502;energy:number;style:UniversalShowStyleV669;
  lyricsProtected:boolean;manualDance:boolean;manualCamera:boolean;manualLighting:boolean;
  narrativeCue:NarrativeCueV604|null};
const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const smooth=(v:number)=>{const x=clamp(v,0,1);return x*x*(3-2*x);};
const round=(v:number)=>Math.round(v*10000)/10000;
const intentFor=(chapter:NarrativeChapterV604):PacingIntentV671=>
  chapter==='setup'?'establish':chapter==='develop'?'develop':chapter==='rise'?'lift':
  chapter==='payoff'?'climax':chapter==='respite'?'breathe':'finale';
const weightFor=(intent:PacingIntentV671)=>intent==='breathe'?-.72:intent==='establish'?-.19:
  intent==='develop'?.08:intent==='lift'?.32:intent==='climax'?.62:intent==='finale'?.46:0;
const empty=(trackId:string,durationMs:number):PacingPlanV671=>({trackId,durationMs,source:'unclassified',beats:[],highPointIndex:-1});

/** Per-track plan only from a validated V604 narrative. Never fills missing intervals. */
export function planFullSongPacingV671(narrative:NarrativePlanV604):PacingPlanV671{
  const fallback=empty(narrative.trackId,narrative.durationMs);
  if(narrative.source!=='verified-v600'||!narrative.trackId||!finite(narrative.durationMs)||
    narrative.durationMs<=0||narrative.durationMs>7200000||!Array.isArray(narrative.acts)||
    narrative.acts.length<1||narrative.acts.length>160)return fallback;
  let prevEnd=0;
  const beats:PacingBeatV671[]=[];
  const repetitions:Record<string,number>=Object.create(null);
  for(const a of narrative.acts){
    if(!Number.isInteger(a.index)||a.index!==beats.length||!finite(a.startMs)||!finite(a.endMs)||
      a.startMs<prevEnd||a.endMs-a.startMs<2600||a.endMs>narrative.durationMs||
      !['setup','develop','rise','payoff','respite','ending-arc'].includes(a.chapter)||
      !['portrait','dialogue','ensemble','wide','breath','crescendo'].includes(a.motif)||
      !['verse','hook','build','drop','break'].includes(a.section)||
      !Number.isInteger(a.repetition)||a.repetition<0)return fallback;
    const previous=repetitions[a.section]??0;
    if(a.repetition!==previous)return fallback;
    repetitions[a.section]=previous+1;
    const intent=intentFor(a.chapter);
    const position=(a.startMs+a.endMs)/(2*narrative.durationMs);
    // A repeated hook evolves but never becomes an ever-growing strobe/drama loop.
    const repeatVariation=intent==='climax'?(Math.min(a.repetition,3)*.075):0;
    const lateLift=(intent==='climax'||intent==='finale')?position*.16:0;
    const prev=beats[beats.length-1];
    // Contrast after a previous payoff; no additional imaginary scene break.
    const contrast=prev?.intent==='climax'&&intent==='climax'?-.17:0;
    const strength=round(clamp(weightFor(intent)+repeatVariation+lateLift+contrast,-.8,.93));
    beats.push({index:a.index,startMs:a.startMs,endMs:a.endMs,chapter:a.chapter,
      motif:a.motif,intent,repetition:a.repetition,strength});
    prevEnd=a.endMs;
  }
  let highPointIndex=-1,highest=-Infinity;
  for(const b of beats){if(b.strength>highest){highest=b.strength;highPointIndex=b.index;}}
  return {...fallback,source:'verified-v604',beats,highPointIndex};
}

function beatAt(plan:PacingPlanV671,positionMs:number):PacingBeatV671|null{
  let lo=0,hi=plan.beats.length;
  while(lo<hi){const mid=(lo+hi)>>1;if(plan.beats[mid].startMs<=positionMs)lo=mid+1;else hi=mid;}
  const beat=plan.beats[lo-1];return beat&&positionMs<beat.endMs?beat:null;
}
const off: PacingCueV671={active:false,evidence:'off',intent:'neutral',beatIndex:-1,
  strength:0,dance:1,camera:1,lighting:1,reason:'Automatik inaktiv'};
/** Return bounded multipliers for the already-approved concert dynamics. */
export function sampleFullSongPacingV671(plan:PacingPlanV671,input:PacingInputV671):PacingCueV671{
  if(!input.enabled||!input.playing||input.reducedMotion||input.tier==='low'||!input.trackId||
    input.trackId!==plan.trackId||plan.durationMs!==input.durationMs||!finite(input.durationMs)||
    input.durationMs<=0||!finite(input.progressMs)||input.progressMs<0||input.progressMs>=input.durationMs)return off;
  const b=plan.source==='verified-v604'?beatAt(plan,input.progressMs):null;
  const c=input.narrativeCue;
  // A cue is not evidence unless V604 confirms the exact current index, chapter and motif.
  const verified=Boolean(b&&c&&c.active&&c.source==='verified-v600'&&
    c.act===b.index&&c.chapter===b.chapter&&c.motif===b.motif&&c.repetition===b.repetition&&
    finite(c.transition)&&c.transition>=0&&c.transition<=1);
  const progress=input.progressMs/input.durationMs;
  const tierGain=input.tier==='balanced'?.62:1;
  const lyricGain=input.lyricsProtected?.36:1;
  let drive:number;
  if(verified){
    const fadeMs=Math.min(2800,(b!.endMs-b!.startMs)*.28);
    const remaining=Math.min(input.progressMs-b!.startMs,b!.endMs-input.progressMs);
    const fade=smooth(remaining/Math.max(1,fadeMs));
    drive=b!.strength*fade*tierGain*lyricGain;
  }else{
    // Unknown song passages are *not* inferred as chorus, bridge, intro or outro.
    const contour=smooth(progress/.14)*smooth((1-progress)/.14);
    const energy=finite(input.energy)?clamp(input.energy,0,1):.45;
    drive=(energy-.45)*.18*contour*tierGain*lyricGain;
  }
  // Conservative genre differences on existing automatic lanes only.
  const styleGain=input.style==='acoustic'?.65:input.style==='hard-dance'?1.12:
    input.style==='metal'?1.08:input.style==='neutral'?.75:1;
  const amount=drive*styleGain;
  const factor=(bias:number,manual:boolean)=>manual?1:round(clamp(1+amount*bias,.965,1.035));
  return {active:true,evidence:verified?'verified-arc':'continuous-contour',
    intent:verified?b!.intent:'neutral',beatIndex:verified?b!.index:-1,strength:round(drive),
    dance:factor(.032,input.manualDance),camera:factor(.026,input.manualCamera),
    lighting:factor(.036,input.manualLighting),
    reason:verified?`Belegter dramaturgischer Abschnitt ${b!.index+1}: ${b!.intent}`:
      'Sanfter Songverlauf ohne erfundene Abschnittsmarken'};
}
export function coordinateFullSongPacingV671(base:ConcertDynamicsV502,cue:PacingCueV671):ConcertDynamicsV502{
  if(!base.active||!cue.active)return base;
  const apply=(value:number,factor:number)=>round(clamp(value*factor,.88,1.12));
  return {...base,dance:apply(base.dance,cue.dance),camera:apply(base.camera,cue.camera),
    lighting:apply(base.lighting,cue.lighting)};
}
