import type {Lyrics,LyricWord} from "@/types/music";
import type {VocalQualityOptionsV374,VocalQualityResultV374} from "./vocalPerformanceQualityV374";
import {resolveVocalPerformanceV368} from "./vocalPerformanceV368";
import {resolveFacialPoseV369} from "./facialPerformanceV369";

/** V384 only refines a *visual estimate* based on synchronized written words.
 * It is not speech recognition, phoneme alignment or a claim to singer identity.
 * Pure clock-driven maths keeps pause, seek, multi-avatar playback deterministic. */
export type NaturalArticulationSettingsV384={
  naturalArticulationEnabledV384?:boolean;
  articulationStrengthV384?:number; // 0..100
  lipSealV384?:number; // 0..100
  jawStabilityV384?:number; // 0..100
};
export type NaturalArticulationDiagnosticV384={
  active:boolean;
  word:string|null;
  rapid:boolean;
  bilabial:"initial"|"final"|"none";
  closure:number;
  jawDamping:number;
  vowelBlend:number;
};
export type NaturalArticulationCueV384=VocalQualityResultV374&{
  articulationV384:NaturalArticulationDiagnosticV384;
};
const clamp=(n:number,lo=0,hi=1)=>Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):lo;
const smooth=(x:number)=>{const y=clamp(x);return y*y*(3-2*y);};
const pct=(n:number|undefined,fallback:number)=>clamp((n??fallback)/100);
const wordsCache=new WeakMap<object,LyricWord[]>();
const inactive:NaturalArticulationDiagnosticV384=Object.freeze({active:false,word:null,rapid:false,bilabial:"none",closure:0,jawDamping:0,vowelBlend:0});
type Mark={word:LyricWord;start:number;end:number;rapid:boolean};
function activeMark(lyrics:Lyrics|null,ms:number):Mark|null{
  if(!lyrics?.synced||!Number.isFinite(ms))return null;
  const lines=lyrics.lines;
  let li=-1;
  for(let i=0;i<lines.length;i++){if(Number.isFinite(lines[i].startMs)&&lines[i].startMs<=ms)li=i;else if(Number.isFinite(lines[i].startMs)&&lines[i].startMs>ms)break;}
  if(li<0)return null;
  const line=lines[li];
  let words=wordsCache.get(line);
  if(!words){
    words=(line.words??[]).filter(w=>typeof w.text==="string"&&!!w.text.trim()&&Number.isFinite(w.startMs)&&w.startMs>=line.startMs&&(w.endMs==null||Number.isFinite(w.endMs)&&w.endMs>w.startMs)).slice().sort((a,b)=>a.startMs-b.startMs);
    wordsCache.set(line,words);
  }
  let wi=-1;
  for(let i=0;i<words.length;i++){if(words[i].startMs<=ms)wi=i;else break;}
  if(wi<0)return null;
  const word=words[wi],start=word.startMs;
  const end=Math.min(word.endMs??Infinity,words[wi+1]?.startMs??Infinity,line.endMs!=null&&line.endMs>line.startMs?line.endMs:Infinity,lines[li+1]?.startMs??Infinity,start+2100,line.startMs+12000);
  if(!(end>start)||ms>=end)return null;
  return {word,start,end,rapid:(wi>0&&start-words[wi-1].startMs<370)||(wi+1<words.length&&words[wi+1].startMs-start<370)};
}
/** Keep all V374 body/role/camera cue fields untouched; refine only the calibrated facial pose. */
export function applyNaturalVocalArticulationV384(
  lyrics:Lyrics|null,
  cue:VocalQualityResultV374,
  playing:boolean,
  options:VocalQualityOptionsV374={}
):NaturalArticulationCueV384{
  const unchanged=():NaturalArticulationCueV384=>({...cue,articulationV384:inactive});
  if(options.naturalArticulationEnabledV384!==true||options.qualityEnabledV374===false||!playing||options.reducedMotion||!lyrics?.synced||cue.confidence!=="word"||cue.vocal.style==="silent"||!(options.lipStrength??90))return unchanged();
  const mark=activeMark(lyrics,cue.effectiveTimeMs);
  if(!mark||cue.vocal.activeWord!==mark.word.text.trim())return unchanged();
  const {word,start,end,rapid}=mark;
  const amount=pct(options.articulationStrengthV384,70),seal=pct(options.lipSealV384,90),stability=pct(options.jawStabilityV384,65);
  if(amount<=0)return unchanged();
  const rap=cue.vocal.style==="rap";
  const initial=/^[\s"'„“(]*[bmp]/i.test(word.text);
  const final=/[bmp][\s\p{P}]*$/iu.test(word.text);
  const duration=end-start;
  // Bounds are fractions of the REAL word window, never independently invented phoneme timings.
  const sealWindow=Math.min(105,duration*.30);
  const releaseWindow=Math.min(90,duration*.26);
  const enter=initial?(1-smooth((cue.effectiveTimeMs-start)/Math.max(1,sealWindow))):0;
  const leave=final?smooth((cue.effectiveTimeMs-(end-releaseWindow))/Math.max(1,releaseWindow)):0;
  const closureTarget=clamp(Math.max(enter,leave)*seal*(.65+.35*amount));
  const closure=clamp(Math.max(cue.face.lipsClosed,closureTarget));
  // Small adjacent samples are used solely to temper abrupt vowel-target switches.
  // Never blend a lip-closure sample into a vowel shape.
  const sampleOffset=Math.min(38,duration*.17);
  const sampled=[-sampleOffset,sampleOffset].map(offset=>{
    const time=cue.effectiveTimeMs+offset;
    if(time<start||time>=end)return null;
    const sample=resolveVocalPerformanceV368(lyrics,time,true,{
      style:options.style??"auto",genre:options.genre,mode:options.mode??"lyrics",mids:options.mids??0,
      expression:options.expression??.55,avatarSlot:options.avatarSlot??0,
    });
    return sample.confidence==="word"&&sample.activeWord===word.text.trim()
      ? resolveFacialPoseV369(sample,{strength:options.lipStrength??90,jawFollow:options.jawFollow??65}) : null;
  }).filter((item):item is NonNullable<typeof item>=>item!==null&&item.lipsClosed<.25);
  const vowelBlend=closure<.35&&sampled.length?amount*(rap?.19:.13):0;
  const average=(key:"jaw"|"round"|"wide")=>sampled.reduce((s,part)=>s+part[key],0)/sampled.length;
  const adjacent=sampled.length?average("jaw"):cue.face.jaw;
  const jawDamping=rap&&rapid?stability*amount*.20:0;
  let jaw=clamp((cue.face.jaw*(1-vowelBlend)+adjacent*vowelBlend)*(1-jawDamping));
  jaw=Math.min(jaw,1-closure*.985);
  let round=clamp((cue.face.round*(1-vowelBlend)+(sampled.length?average("round"):cue.face.round)*vowelBlend)*(1-closure*.90));
  let wide=clamp((cue.face.wide*(1-vowelBlend)+(sampled.length?average("wide"):cue.face.wide)*vowelBlend)*(1-closure*.93));
  // Avoid competing wide and round mouth targets on rigs with independently tuned channels.
  wide*=1-round*.28;
  if(!Number.isFinite(wide)||!Number.isFinite(round))return unchanged();
  const face={...cue.face,jaw,round,wide,lipsClosed:closure,
    cheek:clamp(cue.face.cheek*(1-.22*closure)+jaw*.025),
    smile:clamp(cue.face.smile*(1-.35*closure))};
  return {...cue,face,articulationV384:{active:true,word:word.text.trim(),rapid:rap&&rapid,
    bilabial:enter>leave&&enter>0?"initial":leave>0?"final":"none",
    closure,jawDamping,vowelBlend}};
}
