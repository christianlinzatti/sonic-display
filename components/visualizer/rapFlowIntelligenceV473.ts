/**
 * Sonic Display V473 — conservative, lyrics-timed rap flow hints.
 * No vocal isolation, audio prosody, diarization, or invented word timestamps.
 * Only the current and previous line are inspected: constant-size render workload.
 */
import type {VocalDanceAccentV472} from './vocalAwareChoreographyV472';

type Word={text:string;startMs:number;endMs?:number|null};
type Line={text:string;startMs:number;endMs?:number|null;words?:readonly Word[]};
type Lyrics={synced:boolean;lines:readonly Line[]};
export type RapFlowHintV473={
  active:boolean;
  kind:'none'|'phrase'|'dense'|'relaxed'|'flow-change'|'adlib-hint';
  evidence:'none'|'line-timestamp'|'word-timestamps';
  lineIndex:number;
  /** A textual adlib candidate is NOT a separately detected voice. */
  adlibCandidate:boolean;
  /** Words per second, only when sufficient genuine word timestamps exist. */
  wordsPerSecond:number|null;
  change:'none'|'faster'|'slower';
  /** Deliberately capped multiplier for V472 gestures. */
  gestureMultiplier:number;
  phrasePulse:number;
};
const NONE:RapFlowHintV473=Object.freeze({
  active:false,kind:'none',evidence:'none',lineIndex:-1,
  adlibCandidate:false,wordsPerSecond:null,change:'none',gestureMultiplier:1,phrasePulse:0,
});
const clamp=(v:number,lo:number,hi:number)=>Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):lo;
const instrumental=(s:string)=> !/[a-zäöüß]/i.test(s) ||
  /^\s*(?:\[(?:instrumental|music|musik|pause|solo|intro|outro|interlude)[^\]]*\]|\((?:instrumental|music|musik|pause|solo|intro|outro)[^)]*\))\s*$/i.test(s);
/** Only *explicitly formatted* lyric snippets count as textual adlib candidates.
 * No positive claim is made about artist identity, vocal layer, or recording source. */
export function isPossibleAdlibTextV473(text:string):boolean{
  const value=text.trim();
  if(value.length>48)return false;
  if(/^\((?:ad[\s-]?lib|background vocal)\s*:\s*.{1,30}\)$/i.test(value))return true;
  const match=value.match(/^\s*[\[(]\s*([^\]\)]{1,30})\s*[\])]\s*$/);
  if(!match)return false;
  const tokens=match[1].trim().split(/\s+/);
  return tokens.length<=3 && /^(?:ey+|aye+|yeah+|yea+|yo+|uh+|huh+|ah+|oh+|woo+|woah+|brr+|skrr+|hey+|okay+|ok+|hah+|ha+|yeah\s+yeah)$/i.test(match[1].trim());
}
const MAX_WORDS=120;
/** Returns null if there are fewer than three trustworthy word starts. */
function wordRate(line:Line,capMs:number):number|null{
 const words=line.words;
 if(!words?.length)return null;
 let first=Infinity,last=-Infinity,count=0;
 let prev=-Infinity;
 for(let i=0;i<Math.min(MAX_WORDS,words.length);i++){
  const w=words[i];
  if(!w.text?.trim()||!Number.isFinite(w.startMs)||w.startMs<line.startMs||
      w.startMs>=capMs||w.startMs<=prev)continue;
  count++;first=Math.min(first,w.startMs);last=w.startMs;prev=w.startMs;
 }
 if(count<3)return null;
 const interval=(last-first)/1000;
 if(interval<.22||interval>18)return null;
 const rate=(count-1)/interval;
 return rate>=.7&&rate<=12?rate:null;
}
export function resolveRapFlowHintV473(input:{
 lyrics?:Lyrics|null;progressMs?:number;offsetMs?:number;playing:boolean;rap:boolean;
 reducedMotion:boolean;section?:string|null;
}):RapFlowHintV473{
 if(!input.rap||!input.playing||input.reducedMotion||!input.lyrics?.synced||
    !Number.isFinite(input.progressMs)||!input.lyrics.lines.length)return NONE;
 const lines=input.lyrics.lines;
 const t=input.progressMs!+clamp(input.offsetMs??0,-2000,2000);
 let lo=0,hi=lines.length-1,index=-1;
 while(lo<=hi){const mid=(lo+hi)>>>1;
   if(lines[mid].startMs<=t){index=mid;lo=mid+1;}else hi=mid-1;
 }
 if(index<0)return NONE;
 const line=lines[index];
 if(!Number.isFinite(line.startMs)||instrumental(line.text))return NONE;
 const next=lines[index+1]?.startMs??Infinity;
 const end=Math.min(
   line.endMs!=null&&Number.isFinite(line.endMs)&&line.endMs>line.startMs?line.endMs:Infinity,
   next,line.startMs+15000,
 );
 if(t>=end||t<line.startMs)return NONE;
 const elapsed=t-line.startMs;
 const adlibCandidate=isPossibleAdlibTextV473(line.text);
 const rate=wordRate(line,end);
 const prev=index>0?lines[index-1]:null;
 const prevEnd=prev?Math.min(
   prev.endMs!=null&&Number.isFinite(prev.endMs)&&prev.endMs>prev.startMs?prev.endMs:Infinity,
   line.startMs,prev.startMs+15000
 ):0;
 const oldRate=prev&&!instrumental(prev.text)?wordRate(prev,prevEnd):null;
 // A flow change needs BOTH lines to have actual timed words; line-only lyrics
 // cannot justify claims of fast delivery or technical flow switches.
 const ratio=rate!=null&&oldRate!=null?rate/oldRate:1;
 const change:RapFlowHintV473['change']=ratio>=1.6?'faster':ratio<=.625?'slower':'none';
 const phrasePulse=clamp(1-elapsed/480,0,1);
 const switchPulse=change!=='none'&&elapsed<550;
 const kind:RapFlowHintV473['kind']=adlibCandidate?'adlib-hint':
   switchPulse?'flow-change':rate!=null&&rate>=4?'dense':
   rate!=null&&rate<=1.85?'relaxed':'phrase';
 const sectionPeak=['hook','chorus','drop'].includes(input.section??'');
 const factor=kind==='adlib-hint'?1.16:
   kind==='flow-change'?1.13:
   kind==='dense'?1.075:
   kind==='relaxed'?.91:1;
 // Tiny first-phrase impulse only when a synced line really begins.
 const multiplier=clamp(factor+phrasePulse*(sectionPeak?.035:.018),.82,1.22);
 return {active:true,kind,evidence:rate!=null?'word-timestamps':'line-timestamp',
    lineIndex:index,adlibCandidate,wordsPerSecond:rate,change:switchPulse?change:'none',
    gestureMultiplier:multiplier,phrasePulse};
}
/** Modifies only an already-accepted V472 vocal accent.
 * Never resurrects a silent/background/disabled cue or modifies casting labels.
 * Head, chest and arms remain bounded, and authored gestures remain dominant. */
export function applyRapFlowToAccentV473(
 original:VocalDanceAccentV472,
 hint:RapFlowHintV473,
):VocalDanceAccentV472{
 if(!original.active||!hint.active||original.lineIndex!==hint.lineIndex)return original;
 const multiplier=hint.gestureMultiplier;
 return {
  ...original,
  head:clamp(original.head*(1+(multiplier-1)*.46),0,.055),
  chest:clamp(original.chest*(1+(multiplier-1)*.7),0,.09),
  arms:clamp(original.arms*multiplier,0,.11),
 };
}

/** Convenience entry point for GLB and procedural dancer render paths. */
export function enhanceRapAccentV473(
 original:VocalDanceAccentV472,
 input:Parameters<typeof resolveRapFlowHintV473>[0],
):VocalDanceAccentV472 {
 if(!original.active)return original;
 return applyRapFlowToAccentV473(original,resolveRapFlowHintV473(input));
}
