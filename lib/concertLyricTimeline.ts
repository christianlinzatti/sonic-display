import type {Lyrics} from '../types/playbackCore';

type Entry = {index:number;start:number;end:number;repeated:boolean};
type Timeline = {entries:Entry[];refrains:{start:number;visit:number}[];starts:{start:number;visit:number}[]};
// Provider updates replace the Lyrics object. Weak ownership releases old tracks.
const timelines = new WeakMap<Lyrics,Timeline>();
const normalize = (text:string) => text.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
function timeline(lyrics:Lyrics|null|undefined):Timeline|null {
 if(!lyrics?.synced)return null;
 const cached=timelines.get(lyrics);if(cached)return cached;
 const rows=lyrics.lines.map((line,index)=>({line,index}))
  .filter(({line})=>Number.isFinite(line.startMs)&&line.startMs>=0&&typeof line.text==='string')
  .sort((a,b)=>a.line.startMs-b.line.startMs)
  .filter(({line},i,all)=>i===0||line.startMs!==all[i-1].line.startMs);
 const keys=rows.map(({line})=>normalize(line.text)),counts=new Map<string,number>();
 for(const key of keys)if(key.length>8)counts.set(key,(counts.get(key)??0)+1);
 const entries=rows.map(({line,index},i)=>({index,start:line.startMs,
  end:Math.min(rows[i+1]?.line.startMs??Infinity,
   typeof line.endMs==='number'&&Number.isFinite(line.endMs)&&line.endMs>line.startMs?line.endMs:line.startMs+4000),
  repeated:(counts.get(keys[i])??0)>1}));
 let visit=0,last=-Infinity;
 const refrains:Timeline['refrains']=[];
 for(const entry of entries)if(entry.repeated){
  if(entry.start-last>12000)visit++;
  refrains.push({start:entry.start,visit});last=entry.start;
 }
 const starts=refrains.filter((entry,i)=>i===0||entry.visit!==refrains[i-1].visit);
 const result={entries,refrains,starts};timelines.set(lyrics,result);return result;
}
function after<T extends {start:number}>(items:readonly T[],position:number):number {
 let low=0,high=items.length;
 while(low<high){const middle=(low+high)>>>1;if(items[middle].start<=position)low=middle+1;else high=middle;}
 return low;
}
/** Half-open lyric intervals: gaps and exact line ends never retain an old line. */
export function activeConcertLyric(lyrics:Lyrics|null|undefined,position:number):number {
 if(!Number.isFinite(position))return -1;
 const data=timeline(lyrics);if(!data)return -1;
 const entry=data.entries[after(data.entries,position)-1];
 return entry&&position<entry.end?entry.index:-1;
}
export function concertRefrainVisit(lyrics:Lyrics|null|undefined,position:number):number {
 if(!Number.isFinite(position))return 0;
 const data=timeline(lyrics);return data?.refrains[after(data.refrains,position)-1]?.visit??0;
}
export function concertLyricSection(lyrics:Lyrics|null|undefined,position:number):'hook'|'verse'|'quiet'|null {
 if(!Number.isFinite(position))return null;
 const data=timeline(lyrics);if(!data)return null;
 const entry=data.entries[after(data.entries,position)-1];
 return !entry||position>=entry.end?'quiet':entry.repeated?'hook':'verse';
}
export function nextConcertRefrain(lyrics:Lyrics|null|undefined,position:number):number|null {
 if(!Number.isFinite(position))return null;
 const data=timeline(lyrics);return data?.refrains[after(data.refrains,position)]?.start??null;
}
/** Section entries only: several repeated lines within one refrain are one scene. */
export function concertRefrainStarts(lyrics:Lyrics|null|undefined):readonly {start:number;visit:number}[]{
 return timeline(lyrics)?.starts??[];
}
/** Only bounded gaps between known lyric lines can justify an instrumental picture. */
export function concertInstrumentalGap(lyrics:Lyrics|null|undefined,position:number):{start:number;end:number}|null{
 if(!Number.isFinite(position))return null;
 const data=timeline(lyrics);if(!data)return null;
 const next=after(data.entries,position),previous=data.entries[next-1],following=data.entries[next];
 if(!previous||!following||position<previous.end||following.start-previous.end<10000)return null;
 return {start:previous.end,end:following.start};
}
