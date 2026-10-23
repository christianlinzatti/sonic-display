/** V472: bounded vocal-timeline dance accents. Word and line clocks are provided by
 * synchronised lyrics; singer changes are ONLY sourced from user-authored casting.
 * The timing does not imply speech separation, phoneme or stress recognition. */

type TimedWordV472={text:string;startMs:number;endMs?:number|null};
type TimedLineV472={text:string;startMs:number;endMs?:number|null;words?:readonly TimedWordV472[]};
type TimedLyricsV472={synced:boolean;lines:readonly TimedLineV472[]};
/** Structural projection of V385/V416 cast information, without coupling to their
 * React/3D dependencies. An unassigned song is never treated as recognized speech. */
export type AuthoredVocalCastV472={active:boolean;lineIndex:number;singingSlots:readonly number[];
  handoffFrom:number|null;phase:number;role?:'lead'|'feature'|'hook'|null;
  style?:'solo'|'reply'|'duet'|'hook'|null};
export type VocalDanceAccentV472 = {
  active:boolean; source:'none'|'line'|'word'; lineIndex:number; wordIndex:number;
  role:'general'|'lead'|'feature'|'hook'|'duet'|'reply'|'background';
  /** Radians, deliberately small enough not to override animation clips. */
  head:number; chest:number; arms:number; side:number; confidence:'none'|'lyrics-line'|'lyrics-word';
};
const NONE:VocalDanceAccentV472=Object.freeze({active:false,source:'none',lineIndex:-1,wordIndex:-1,role:'general',head:0,chest:0,arms:0,side:0,confidence:'none'});
const unit=(value:number)=>Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;
const isNonVocal=(line:string)=>!/[a-zäöüß]/i.test(line)||/^\s*(?:\[[^\]]+\]|\((?:instrumental|musik|music|pause|intro|outro|solo)[^)]*\))\s*$/i.test(line);

export function resolveVocalDanceAccentV472(input:{
  lyrics?:TimedLyricsV472|null;progressMs?:number;playing:boolean;reducedMotion:boolean;
  /** Must be an authenticated rap genre decision, not an artist-name guess. */
  rap:boolean;section?:string|null;slot?:number;authored?:boolean;
  bodyEnabled?:boolean;gesturesEnabled?:boolean;strength?:number;offsetMs?:number;
  /** Resolved, track-bound user-authored role/cast; never inferred from a recording. */
  casting?:AuthoredVocalCastV472|null;
}):VocalDanceAccentV472{
  if(!input.rap||!input.playing||input.reducedMotion||input.bodyEnabled===false||input.gesturesEnabled===false||
     !input.lyrics?.synced||!Number.isFinite(input.progressMs)||!input.lyrics.lines.length)return NONE;
  const ms=input.progressMs!;
  const offset=Number.isFinite(input.offsetMs)?Math.max(-2000,Math.min(2000,input.offsetMs!)):0;
  const t=ms+offset;
  const lines=input.lyrics.lines;
  // Binary search the sync timeline without creating a sorted copy on every frame.
  let lo=0,hi=lines.length-1,index=-1;
  while(lo<=hi){const mid=(lo+hi)>>>1;
    if(lines[mid].startMs<=t){index=mid;lo=mid+1;}else hi=mid-1;
  }
  if(index<0)return NONE;
  const line=lines[index];
  if(!Number.isFinite(line.startMs)||isNonVocal(line.text))return NONE;
  const nextStart=lines[index+1]?.startMs??Infinity;
  const end=Math.min(line.endMs!=null&&Number.isFinite(line.endMs)&&line.endMs>line.startMs?line.endMs:Infinity,
    nextStart,line.startMs+15000);
  if(t>=end||t<line.startMs)return NONE;
  let wordIndex=-1,wordStarted=-Infinity,wordEnd=Infinity;
  const words=line.words??[];
  // This short loop tolerates out-of-order provider words. It never synthesises word timestamps.
  for(let i=0;i<words.length&&i<120;i++){
    const word=words[i];
    if(!word.text?.trim()||!Number.isFinite(word.startMs)||word.startMs<line.startMs||word.startMs>=end)continue;
    if(word.startMs<=t&&word.startMs>=wordStarted){wordIndex=i;wordStarted=word.startMs;}
  }
  if(wordIndex>=0){
    const word=words[wordIndex];
    wordEnd=Math.min(word.endMs!=null&&Number.isFinite(word.endMs)&&word.endMs>wordStarted?word.endMs:Infinity,end,wordStarted+1600);
    for(let i=0;i<words.length&&i<120;i++)if(words[i].startMs>wordStarted&&words[i].startMs<wordEnd)wordEnd=words[i].startMs;
  }
  const wordTiming=wordIndex>=0&&t<wordEnd;
  const source:VocalDanceAccentV472['source']=wordTiming?'word':'line';
  const within=ms+offset-line.startMs;
  // Use actual word timestamps for word pulses; line-only providers offer only a soft cue.
  const section=input.section??'verse';
  const hook=section==='hook'||section==='chorus'||section==='drop';
  const tail=line.endMs!=null&&Number.isFinite(line.endMs)&&line.endMs>line.startMs
    ?unit((line.endMs-(ms+offset))/210):1;
  const linePulse=unit(1-within/310);
  // Lyric punctuation/typography are only expressive hints, never measured vocal stress.
  const token=wordTiming?words[wordIndex].text.trim():'';
  const typographicAccent=/[!?]$/.test(token)||(/^[A-ZÄÖÜ]{3,}$/.test(token))?1.13:1;
  const wordPulse=wordTiming?unit(1-(t-wordStarted)/175)*typographicAccent:0;
  const lyricPulse=wordTiming?Math.max(linePulse*.4,wordPulse):
    .32*linePulse; // no artificially precise word accents on line-only lyrics
  const baseline=wordTiming?.16:.075;
  const phraseGain=hook?1.17:.86;
  const strength=unit(input.strength??.7);
  let role:VocalDanceAccentV472['role']='general';
  let singerGain=1;
  let handoff=0;
  const cast=input.casting;
  if(cast?.active&&cast.lineIndex===index){
    const thisSlot=Math.max(0,Math.trunc(input.slot??0));
    const singing=cast.singingSlots.includes(thisSlot);
    role=singing?(cast.role==='hook'||cast.style==='hook'?'hook':cast.role==='feature'?'feature':cast.style==='duet'?'duet':cast.style==='reply'?'reply':'lead'):'background';
    singerGain=singing?1:.08; // background dancers still retain THEIR base clips
    handoff=singing&&cast.handoffFrom!==null?unit(1-cast.phase)*.32:0;
  }
  const authored=input.authored?.26:1; // user-authored choreography owns primary motion
  const size=Math.min(.11,(baseline+lyricPulse*.14+handoff*.15)*strength*phraseGain*tail*singerGain*authored*.45);
  const side=wordTiming?(wordIndex%2===0?1:-1):index%2===0?1:-1;
  return {active:size>.0001,source,lineIndex:index,wordIndex:wordTiming?wordIndex:-1,
    role,head:size*.48,chest:size*.75,arms:size,side:side*(1-handoff*.35),
    confidence:wordTiming?'lyrics-word':'lyrics-line'};
}
