import type {Lyrics} from '../types/playbackCore';
import {lyricSectionV1130} from './showIntelligenceV1130';
export type LyricSpotlightV1133={mode:'none'|'verse'|'anthem'|'rap';lineIndex:number;wordsPerSecond:number;
 currentWord:number;keyWord:number;protectCamera:boolean;effectGain:number;lineScale:number;};
const STOP=new Set(['der','die','das','ein','eine','und','oder','wir','ich','du','sie','the','and','you','with','that','nicht','noch','sind']);
/** Uses real line/word timestamps. Density is a reading cue, never a vocal/audio classifier. */
export function lyricSpotlightV1133(lyrics:Lyrics|null|undefined,progressMs:number):LyricSpotlightV1133{
 const empty:LyricSpotlightV1133={mode:'none',lineIndex:-1,wordsPerSecond:0,currentWord:-1,keyWord:-1,protectCamera:false,effectGain:1,lineScale:1};
 if(!lyrics?.lines.length||!Number.isFinite(progressMs))return empty;
 const i=lyrics.synced?lyrics.lines.findIndex((l,j)=>progressMs>=l.startMs&&progressMs<(l.endMs??lyrics.lines[j+1]?.startMs??l.startMs+4000)):-1;
 if(i<0)return empty;
 const line=lyrics.lines[i],end=line.endMs??lyrics.lines[i+1]?.startMs??line.startMs+4000;
 const tokens=line.words?.map(w=>w.text)??line.text.match(/\S+/g)??[];
 const rate=tokens.length/Math.max(.5,(end-line.startMs)/1000);
 const rap=rate>=3.5||line.text.length/Math.max(.5,(end-line.startMs)/1000)>=22;
 const mode=rap?'rap':lyricSectionV1130(lyrics,progressMs)==='hook'?'anthem':'verse';
 let current=-1,key=-1,longest=0;
 for(let w=0;w<(line.words?.length??0);w++){
  const word=line.words![w],wordEnd=word.endMs??line.words![w+1]?.startMs??end;
  if(Number.isFinite(word.startMs)&&wordEnd>word.startMs&&progressMs>=word.startMs&&progressMs<wordEnd)current=w;
  const clean=word.text.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
  if(!STOP.has(clean)&&clean.length>longest){key=w;longest=clean.length;}
 }
 return {mode,lineIndex:i,wordsPerSecond:rate,currentWord:current,keyWord:key,
 protectCamera:rap||mode==='anthem',effectGain:rap?.55:mode==='anthem'?.78:1,lineScale:mode==='anthem'?1.12:1};
}
