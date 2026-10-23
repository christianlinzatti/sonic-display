import type {Lyrics,LyricLine,LyricWord} from "@/types/music";
import type {RapArticulationCueV405} from "./rapArticulationV405";

/** V415 is a deterministic, text-estimated mouth refinement. It is NOT audio-to-phoneme alignment.
 * The mouth may use an independently shifted clock; body and lyric text keep the V372 clock. */
export interface RapLipPrecisionOptionsV415 {
  rapLipEnabledV415?:boolean;
  rapLipPrecisionV415?:number; // 0..100
  rapLipOffsetMsV415?:number;  // -150..150; mouth ONLY
  reducedMotion?:boolean;
}
export type RapLipDiagnosticV415={
  active:boolean; word:string|null; source:"estimated-word"|"none";
  rapid:boolean; closure:"bilabial"|"none"; bridge:number; mouthTimeMs:number;
};
export type RapLipPrecisionCueV415=RapArticulationCueV405&{rapLipV415:RapLipDiagnosticV415};
const bound=(n:number,lo=0,hi=1)=>Number.isFinite(n)?Math.min(hi,Math.max(lo,n)):lo;
const ease=(value:number)=>{const x=bound(value);return x*x*(3-2*x);};
const OFF:RapLipDiagnosticV415={active:false,word:null,source:"none",rapid:false,closure:"none",bridge:0,mouthTimeMs:0};
type Mark={word:LyricWord;start:number;end:number;next:LyricWord|null;nextGap:number;previousGap:number};

/** Reject invalid/unsynced marks and do not extrapolate invented words across silences. */
export function rapLipWordAtV415(lyrics:Lyrics|null,timeMs:number):Mark|null {
  if(!lyrics?.synced||!Number.isFinite(timeMs)||timeMs<0)return null;
  const lines=lyrics.lines;
  let i=-1;
  for(let j=0;j<lines.length;j++){
    if(Number.isFinite(lines[j].startMs)&&lines[j].startMs<=timeMs)i=j;
    else if(Number.isFinite(lines[j].startMs))break;
  }
  if(i<0)return null;
  const line:LyricLine=lines[i];
  const nextLine=lines[i+1]?.startMs??Infinity;
  const lineEnd=Math.min(line.endMs!=null&&Number.isFinite(line.endMs)&&line.endMs>line.startMs?line.endMs:Infinity,nextLine,line.startMs+12000);
  if(timeMs>=lineEnd)return null;
  const words=(line.words??[]).filter(w=>typeof w.text==="string"&&!!w.text.trim()&&
    Number.isFinite(w.startMs)&&w.startMs>=line.startMs&&
    (w.endMs==null||Number.isFinite(w.endMs)&&w.endMs>w.startMs))
    .slice().sort((a,b)=>a.startMs-b.startMs);
  let wi=-1;
  for(let j=0;j<words.length;j++){if(words[j].startMs<=timeMs)wi=j;else break;}
  if(wi<0)return null;
  const word=words[wi];
  const next=words[wi+1]??null,previous=words[wi-1]??null;
  const end=Math.min(word.endMs??Infinity,next?.startMs??Infinity,lineEnd,word.startMs+2100);
  if(!(end>word.startMs)||timeMs>=end)return null;
  return {word,start:word.startMs,end,next,nextGap:next?next.startMs-end:Infinity,previousGap:previous?word.startMs-(previous.endMs??previous.startMs):Infinity};
}
const nextVowels=(word:string)=>{
  const graphemes=word.toLocaleLowerCase("de-DE").match(/[aeiouyäöü]+/giu)??[];
  const nucleus=graphemes[0]??"";
  return {round:/[oöuü]/iu.test(nucleus)?1:0,wide:/[aeiä]/iu.test(nucleus)?1:0};
};
/** One pure sampled frame. The incoming face is the already aligned V384/V405 facial pose;
 * when an offset is requested, callers sample that face at the shifted mouth clock.
 * Do not affect gesture, singer role, camera, or independent choreography tracks. */
export function refineFastRapMouthV415(
  lyrics:Lyrics|null,cue:RapArticulationCueV405,playing:boolean,options:RapLipPrecisionOptionsV415={},
):RapLipPrecisionCueV415 {
  const inactive=():RapLipPrecisionCueV415=>({...cue,rapLipV415:{...OFF,mouthTimeMs:Number.isFinite(cue.effectiveTimeMs)?cue.effectiveTimeMs:0}});
  if(options.rapLipEnabledV415!==true||!playing||options.reducedMotion||!lyrics?.synced||
    cue.confidence!=="word"||cue.vocal.style!=="rap"||!Number.isFinite(cue.effectiveTimeMs))return inactive();
  const precision=bound(options.rapLipPrecisionV415??70,0,100)/100;
  if(precision<=0)return inactive();
  const mark=rapLipWordAtV415(lyrics,cue.effectiveTimeMs);
  if(!mark||cue.vocal.activeWord?.trim()!==mark.word.text.trim())return inactive();
  const elapsed=cue.effectiveTimeMs-mark.start,duration=mark.end-mark.start;
  const rapid=duration<380||mark.previousGap<85||mark.nextGap<85;
  const text=mark.word.text.toLocaleLowerCase("de-DE").replace(/^[^a-zäöüß]+/iu,"");
  const bilabial=/^[bmp]/iu.test(text);
  // Strictly at the start of the *verified word*, not a made-up phoneme boundary.
  const sealMs=Math.min(72,duration*.31);
  const seal=bilabial? (1-ease(elapsed/Math.max(1,sealMs))):0;
  const base=cue.face;
  const lipsClosed=bound(Math.max(base.lipsClosed,seal*precision*.97));
  const jaw=bound(Math.min(base.jaw,1-lipsClosed*.985));
  const canBridge=!!mark.next&&mark.nextGap>=0&&mark.nextGap<=70&&
    duration<600&&elapsed>duration*.70&& !/^[bmp]/iu.test(mark.next.text.trim()) && !bilabial;
  const bridge=canBridge?precision*.22*ease((elapsed/duration-.70)/.30):0;
  const vowel=mark.next?nextVowels(mark.next.text):{round:0,wide:0};
  const round=bound(base.round*(1-bridge)+vowel.round*bridge)*(1-lipsClosed*.33);
  const wide=bound(base.wide*(1-bridge)+vowel.wide*bridge)*(1-lipsClosed*.38);
  return {...cue,face:{...base,jaw,round:bound(round),wide:bound(wide),lipsClosed},
    rapLipV415:{active:true,word:mark.word.text,source:"estimated-word",rapid,
      closure:bilabial&&seal>.05?"bilabial":"none",bridge,mouthTimeMs:cue.effectiveTimeMs}};
}
export function rapLipMouthOffsetV415(options:RapLipPrecisionOptionsV415):number {
  return options.rapLipEnabledV415===true && bound(options.rapLipPrecisionV415??70,0,100)>0
    ?bound(options.rapLipOffsetMsV415??0,-150,150):0;
}
