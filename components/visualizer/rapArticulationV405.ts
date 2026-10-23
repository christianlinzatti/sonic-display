import type {Lyrics,LyricLine,LyricWord} from "@/types/music";
import type {NaturalArticulationCueV384} from "./naturalVocalArticulationV384";

/** Text-derived *estimated* mouth refinements for fast German rap.
 * No speech recognition, phoneme alignment, audio analysis or singer identification.
 * V405 only operates inside a VERIFIED word timestamp; line-only lyrics are untouched. */
export type RapArticulationOptionsV405 = {
  rapArticulationEnabledV405?: boolean;
  rapClarityV405?: number; // 0..100, default 65
  reducedMotion?: boolean;
};
export type RapArticulationDiagnosticV405 = {
  active:boolean;
  word:string|null;
  class:"round-vowel"|"wide-vowel"|"labiodental"|"sibilant"|"neutral"|"none";
  intensity:number;
  source:"estimated-word"|"none";
};
export type RapArticulationCueV405=NaturalArticulationCueV384&{articulationV405:RapArticulationDiagnosticV405};
const clamp=(n:number,low=0,high=1)=>Number.isFinite(n)?Math.max(low,Math.min(high,n)):low;
const smooth=(n:number)=>{const x=clamp(n);return x*x*(3-2*x);};
const OFF:RapArticulationDiagnosticV405=Object.freeze({active:false,word:null,class:"none",intensity:0,source:"none"});
type TimedWord={word:LyricWord;start:number;end:number};
const sortedWordCache=new WeakMap<LyricLine,LyricWord[]>();
function timedWords(line:LyricLine):LyricWord[]{
  const existing=sortedWordCache.get(line);
  if(existing)return existing;
  const words=(line.words??[]).filter(w=>typeof w.text==="string"&&!!w.text.trim()&&
    Number.isFinite(w.startMs)&&w.startMs>=line.startMs&&
    (w.endMs==null||Number.isFinite(w.endMs)&&w.endMs>w.startMs))
    .slice().sort((a,b)=>a.startMs-b.startMs);
  sortedWordCache.set(line,words);
  return words;
}
function activeWord(lyrics:Lyrics,ms:number,expected:string):TimedWord|null{
  const lines=lyrics.lines;
  let lineIndex=-1;
  for(let i=0;i<lines.length;i++){
    if(!Number.isFinite(lines[i].startMs))continue;
    if(lines[i].startMs<=ms)lineIndex=i;
    else break;
  }
  if(lineIndex<0)return null;
  const line=lines[lineIndex];
  if(!line.words?.length)return null;
  const words=timedWords(line);
  let index=-1;
  for(let i=0;i<words.length;i++){if(words[i].startMs<=ms)index=i;else break;}
  if(index<0)return null;
  const word=words[index],start=word.startMs;
  const end=Math.min(word.endMs??Infinity,words[index+1]?.startMs??Infinity,
    line.endMs!=null&&line.endMs>line.startMs?line.endMs:Infinity,
    lines[lineIndex+1]?.startMs??Infinity,start+2100,line.startMs+12000);
  if(word.text.trim()!==expected||!(end>start)||ms>=end)return null;
  return {word,start,end};
}
/** Apply after V384 and before authored-vocal-role muting. No mutable per-frame state. */
export function refineRapArticulationV405(
  lyrics:Lyrics|null,cue:NaturalArticulationCueV384,playing:boolean,options:RapArticulationOptionsV405={}
):RapArticulationCueV405{
  const unchanged=():RapArticulationCueV405=>({...cue,articulationV405:OFF});
  if(!playing||options.reducedMotion||options.rapArticulationEnabledV405===false||
    !lyrics?.synced||!cue.articulationV384.active||cue.confidence!=="word"||
    cue.vocal.style!=="rap"||!Number.isFinite(cue.effectiveTimeMs))return unchanged();
  const amount=clamp((options.rapClarityV405??65)/100);
  if(amount===0)return unchanged();
  const token=cue.articulationV384.word;
  if(!token)return unchanged();
  const mark=activeWord(lyrics,cue.effectiveTimeMs,token);
  if(!mark)return unchanged();
  const text=token.toLocaleLowerCase("de-DE").replace(/^[^a-zäöüß]+|[^a-zäöüß]+$/giu,"");
  if(!text)return unchanged();
  const ms=cue.effectiveTimeMs,duration=mark.end-mark.start,p=clamp((ms-mark.start)/duration);
  const envelope=smooth(Math.min(1,(ms-mark.start)/Math.min(48,duration*.24))) *
    smooth(Math.min(1,(mark.end-ms)/Math.min(70,duration*.26)));
  const initialWindow=Math.max(1,Math.min(95,duration*.28));
  const finalWindow=Math.max(1,Math.min(85,duration*.25));
  const initial=1-smooth((ms-mark.start)/initialWindow);
  const final=smooth((ms-(mark.end-finalWindow))/finalWindow);
  const labiodental=/^[fvw]/iu.test(text)?initial:0;
  const sibilantStart=/^(?:sch|s|z|ß)/iu.test(text)?initial:0;
  const sibilantEnd=/(?:sch|s|z|ß)$/iu.test(text)?final:0;
  const sibilant=Math.max(sibilantStart,sibilantEnd);
  // Grapheme-based vowel bins are approximations, NOT inferred phoneme boundaries.
  const nuclei=text.match(/[aeiouyäöü]+/giu)??[];
  const vowel=nuclei.length?nuclei[Math.min(nuclei.length-1,Math.floor(p*nuclei.length))]:"";
  const rounded=/[oöuü]/iu.test(vowel);
  const stretched=/[eiä]/iu.test(vowel);
  const vowelGain=amount*envelope;
  const labioGain=labiodental*amount*.22;
  const hissGain=sibilant*amount*.15;
  const prev=cue.face;
  // F/V/W is lip-to-teeth contact: do not fake full B/P/M bilabial closure.
  const lipsClosed=clamp(Math.max(prev.lipsClosed,Math.min(.18,labioGain*.6)));
  const jaw=clamp(Math.min(prev.jaw*(1-labioGain*.64)*(1-hissGain*.18),1-lipsClosed*.985));
  let round=clamp(prev.round+(rounded ? .21*vowelGain : 0));
  let wide=clamp(prev.wide+(stretched ? .18*vowelGain : 0)+labioGain*.18+hissGain);
  if(rounded)wide*=1-.30*vowelGain;
  if(stretched)round*=1-.15*vowelGain;
  wide=clamp(wide*(1-lipsClosed*.15));
  round=clamp(round*(1-lipsClosed*.12));
  const face={...prev,jaw,wide,round,lipsClosed,
    cheek:clamp(prev.cheek+labioGain*.07+hissGain*.05),
    squint:clamp(prev.squint+hissGain*.055)};
  const type:RapArticulationDiagnosticV405["class"]=labiodental>0.01?"labiodental":sibilant>0.01?"sibilant":rounded?"round-vowel":stretched?"wide-vowel":"neutral";
  return {...cue,face,articulationV405:{active:true,word:token,class:type,
    intensity:clamp(Math.max(vowelGain,labioGain,hissGain)),source:"estimated-word"}};
}
