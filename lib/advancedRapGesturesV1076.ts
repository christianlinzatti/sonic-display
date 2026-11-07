/**
 * V1076 – Advanced Rap Gestures 8.0.
 * A deterministic phrasing pass for already verified V1023/V1062 word accents.
 * No audio inference, new animation channel, singer/viseme assignment, timers,
 * IK modification or clip manipulation. All limits belong to the existing rig.
 */
import type {RapGestureV1062,RapPhrasingInputV1062} from './advancedRapPerformanceV1062';

export type RapGestureMoodV1076='pocket'|'statement'|'release'|'groove';
export type RapGesturesInputV1076=RapPhrasingInputV1062;

const isFiniteNumber=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const smooth=(value:number)=>{const t=clamp(value,0,1);return t*t*(3-2*t);};
/** Select gestures only from trusted timings; not from guessed beats or syllables. */
export function refineRapGesturesV1076<T extends RapGestureV1062>(base:T,input:RapGesturesInputV1076):T{
 if(!input.enabled||!input.playing||input.reducedMotion||input.manualPriority||input.tier==='low'||
    !isFiniteNumber(input.strength)||input.strength<=0||input.strength>80||
    !input.trackId?.trim()||!input.lyrics?.synced||
    !isFiniteNumber(input.effectiveTimeMs)||input.effectiveTimeMs<0||
    !base.active||base.evidence!=='timed-word'||!base.accent.active||
    base.accent.source!=='word'||base.accent.confidence!=='lyrics-word'||
    !Number.isSafeInteger(base.accent.lineIndex)||base.accent.lineIndex<0||
    !Number.isSafeInteger(base.accent.wordIndex)||base.accent.wordIndex<0||
    !isFiniteNumber(base.accent.head)||!isFiniteNumber(base.accent.chest)||!isFiniteNumber(base.accent.arms)||
    base.accent.head<0||base.accent.chest<0||base.accent.arms<0||
    base.accent.head>.055||base.accent.chest>.09||base.accent.arms>.11)return base;

 const line=input.lyrics.lines[base.accent.lineIndex];
 const words=line?.words;
 const index=base.accent.wordIndex;
 if(!line||!words||index>=Math.min(120,words.length)||
    !isFiniteNumber(line.startMs)||line.startMs<0)return base;
 const word=words[index],previous=words[index-1],next=words[index+1];
 if(!word?.text?.trim()||!isFiniteNumber(word.startMs)||word.startMs<line.startMs)return base;
 // Do not extend an individual word beyond its own timestamp or the next word.
 const wordEnd=Math.min(
   isFiniteNumber(word.endMs)&&word.endMs>word.startMs?word.endMs:Infinity,
   isFiniteNumber(next?.startMs)&&next.startMs>word.startMs?next.startMs:Infinity,
   isFiniteNumber(line.endMs)&&line.endMs>word.startMs?line.endMs:Infinity,
   word.startMs+1300);
 const length=wordEnd-word.startMs;
 if(!isFiniteNumber(wordEnd)||length<80||length>1300||
    input.effectiveTimeMs<word.startMs||input.effectiveTimeMs>=wordEnd)return base;
 // For rapid, tightly-spaced rap, compress the arms and emphasize head rhythm.
 const rapid=length<=250||Boolean(isFiniteNumber(previous?.startMs)&&
     word.startMs-previous.startMs>0&&word.startMs-previous.startMs<=235);
 const last=(!next||!isFiniteNumber(next.startMs)||next.startMs-wordEnd>=290)&&
    isFiniteNumber(line.endMs)&&line.endMs>=wordEnd&&line.endMs-wordEnd<=520;
 const hook=/hook|chorus|drop|finale/i.test(input.section??'');
 const mood:RapGestureMoodV1076=rapid?'pocket':last?'release':hook?'statement':'groove';
 // Smooth entry/release avoids snapping at word boundaries. No own beat clock.
 const t=(input.effectiveTimeMs-word.startMs)/length;
 const envelope=smooth(t/.24)*smooth((1-t)/.30);
 const tierGain=input.tier==='balanced'?.60:1;
 const weight=envelope*(input.strength/80)*tierGain;
 if(weight<=0)return base;
 const profile=mood==='pocket'?{head:.105,chest:.018,arms:-.105}:
   mood==='release'?{head:.025,chest:.095,arms:-.035}:
   mood==='statement'?{head:.075,chest:.085,arms:.105}:
   {head:.055,chest:.042,arms:.037};
 // A restrained line/performer alternation keeps the same gesture palette for
 // neighboring words, without random numbers or changing the role/side channel.
 const phraseShape=(base.accent.lineIndex%2===0?1:.92);
 const accent=base.accent;
 return {...base,accent:{...accent,
    head:clamp(accent.head*(1+profile.head*weight*phraseShape),0,.055),
    chest:clamp(accent.chest*(1+profile.chest*weight),0,.09),
    arms:clamp(accent.arms*(1+profile.arms*weight*phraseShape),0,.11)
 }} as T;
}
