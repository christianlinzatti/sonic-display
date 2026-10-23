import type {Lyrics} from "@/types/music";
import type {StageSection} from "./stageDirectorV287";

/** Stage casting is a visual direction based on existing section labels + timed text.
 * Neither singer diarization nor audio source separation is performed. */
export type PerformanceModeV375="off"|"balanced"|"dynamic";
export type PerformanceFormationV375="solo"|"duo"|"group";
export type VocalPerformanceInputV375={
  lyrics?:Lyrics|null; progressMs:number; playing:boolean; reducedMotion?:boolean;
  section?:StageSection; bpm?:number|null; energy?:number; beatAccent?:number;
  count:number; mode?:PerformanceModeV375; strength?:number;
  /** Authored song-specific stage cues, or manually scripted performance, always win. */
  manualPriority?:boolean;
};
export type PerformanceCueV375={
  enabled:boolean; formation:PerformanceFormationV375; activeCount:number;
  leadSlot:number; activeSlots:number[]; weights:number[];
  section:StageSection; source:"lyrics"|"section"|"manual";
  phraseIndex:number; phraseMs:number; emphasis:number;
};
const bound=(x:number,lo:number,hi:number)=>Number.isFinite(x)?Math.min(hi,Math.max(lo,x)):lo;
const sectionOrVerse=(section?:StageSection):StageSection=>section==="hook"||section==="drop"||section==="break"||section==="build"?section:"verse";
function phraseAt(lyrics:Lyrics|null|undefined,progressMs:number,bpm:number):{index:number;source:"lyrics"|"section";phraseMs:number}{
  // Four actual lyric lines roughly define a phrase; when absent use an 8-beat clock,
  // without pretending to know where the sung syllables occur.
  if(lyrics?.synced&&Array.isArray(lyrics.lines)){
    let index=-1;
    for(let i=0;i<lyrics.lines.length;i++){
      const line=lyrics.lines[i];
      if(!Number.isFinite(line.startMs)||line.startMs<0)continue;
      if(line.startMs<=progressMs) index=i;
      else break;
    }
    if(index>=0)return {index:Math.floor(index/4),source:"lyrics",phraseMs:Math.max(0,lyrics.lines[index].startMs)};
  }
  const msPerPhrase=8*60000/bpm;
  return {index:Math.floor(progressMs/msPerPhrase),source:"section",phraseMs:Math.floor(progressMs/msPerPhrase)*msPerPhrase};
}
/** Stateless/seek-safe: the same song position always produces the same cast. */
export function resolveAdaptiveVocalPerformanceV375(input:VocalPerformanceInputV375):PerformanceCueV375{
  const count=Math.trunc(bound(input.count,1,4));
  const section=sectionOrVerse(input.section);
  const at=bound(input.progressMs,0,Number.MAX_SAFE_INTEGER);
  const bpm=bound(input.bpm??120,55,210);
  const phrase=phraseAt(input.lyrics,at,bpm);
  const mode=input.mode??"dynamic";
  const enabled=mode!=="off"&&input.playing&&!input.reducedMotion&&!input.manualPriority&&count>1;
  const strength=bound(input.strength??65,0,100)/100;
  if(!enabled){return {enabled:false,formation:count===1?"solo":count===2?"duo":"group",activeCount:count,
    leadSlot:0,activeSlots:Array.from({length:count},(_,i)=>i),weights:Array.from({length:count},()=>1),
    section,source:"manual",phraseIndex:phrase.index,phraseMs:phrase.phraseMs,emphasis:0};}
  let activeCount:number;
  switch(section){
    case "hook":case "drop":activeCount=count;break;
    case "break":activeCount=1;break;
    case "build":activeCount=Math.min(count,2);break;
    default:activeCount=mode==="balanced"?Math.min(count,2):phrase.index%3===1?Math.min(count,2):1;
  }
  // Lower strength does not fake a group: it relaxes toward a stable duo.
  if(strength<.30&&activeCount===1)activeCount=Math.min(count,2);
  const leadSlot=phrase.index%count;
  const activeSlots=Array.from({length:activeCount},(_,i)=>(leadSlot+i)%count);
  const baseEmphasis=section==="drop"?1:section==="hook"?.85:section==="build"?.52:section==="break"?.20:.48;
  // Musical energy affects depth/emphasis, not the cast: isolated kick peaks never
  // cause rapid solo/duo/group flicker. Section and phrase cues govern casting.
  const energy=bound(input.energy??.5,0,1);
  const accent=bound(input.beatAccent??0,0,1);
  const emphasis=bound(baseEmphasis*(.68+.32*energy)+accent*.07,0,1);
  const weights=Array.from({length:count},(_,slot)=>!activeSlots.includes(slot)?0:slot===leadSlot?1:.64+.25*strength);
  return {enabled:true,formation:activeCount===1?"solo":activeCount===2?"duo":"group",activeCount,
    leadSlot,activeSlots,weights,section,source:phrase.source,phraseIndex:phrase.index,phraseMs:phrase.phraseMs,
    emphasis:bound(emphasis*(.5+.5*strength),0,1)};
}
