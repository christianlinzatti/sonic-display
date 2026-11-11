import type {Lyrics} from '../types/playbackCore';
import {concertRefrainStarts} from './concertLyricTimeline';
export type PlannedConcertScene={kind:'refrain'|'finale';atMs:number;leader:number;partner:number;source:'lyrics'|'duration'};
export type ConcertScenePlan={upcoming:readonly PlannedConcertScene[];prepare:number;next:PlannedConcertScene|null;horizonMs:number};
const ease=(t:number)=>{const x=Math.max(0,Math.min(1,t));return x*x*x*(x*(x*6-15)+10);};
/** Two existing eight-second phrases of lookahead; no prediction of unheard audio. */
export function planConcertScenes(input:{lyrics?:Lyrics|null;positionMs:number;durationMs?:number;count:number;reading:boolean;lyricFocus:boolean;act:string}):ConcertScenePlan{
 const pos=Number.isFinite(input.positionMs)?Math.max(0,input.positionMs):0,count=Math.max(1,Math.min(4,Math.round(input.count)||1));
 const duration=typeof input.durationMs==='number'&&Number.isFinite(input.durationMs)&&input.durationMs>0?input.durationMs:0;
 const finale=duration*.9;
 const starts=concertRefrainStarts(input.lyrics);let lo=0,hi=starts.length;
 while(lo<hi){const middle=(lo+hi)>>>1;if(starts[middle].start<=pos)lo=middle+1;else hi=middle;}
 const upcoming:PlannedConcertScene[]=[];
 for(let i=lo;i<starts.length&&upcoming.length<2;i++){
  const entry=starts[i];if(entry.start-pos>16000||duration&&entry.start>=finale)break;
  const leader=(entry.visit-1)%count,partner=count>1?(leader+1+Math.floor(Math.floor(entry.start/16000)/count)%(count-1))%count:0;
  upcoming.push({kind:'refrain',atMs:entry.start,leader,partner,source:'lyrics'});
 }
 if(duration&&finale>pos&&finale-pos<=16000&&upcoming.length<2)upcoming.push({kind:'finale',atMs:finale,leader:0,partner:count>1?1:0,source:'duration'});
 const next=upcoming[0]??null;
 const allowed=!input.reading&&!input.lyricFocus&&input.act!=='lift'&&input.act!=='finale'&&input.act!=='impact'&&input.act!=='breathe';
 return {upcoming,next,horizonMs:16000,prepare:allowed&&next?ease(1-(next.atMs-pos)/8000):0};
}
const hash=(text:string)=>{let n=2166136261;for(const c of text)n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;return n;};
export type CrewRelationship={id:string;first:number;second:number;visit:number;chapter:'kennenlernen'|'antworten'|'wiederfinden'};
/** A pair stays together for three dialogue scenes, then another pair takes over. */
export function concertCrewRelationship(seed:string,count:number,scene:number,finale=false):CrewRelationship|null{
 const n=Math.max(1,Math.min(4,Math.round(count)||1));if(n<2)return null;
 const pairs:number[][]=[];for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)pairs.push([a,b]);
 const index=Number.isFinite(scene)?Math.max(0,Math.floor(scene)):0,episode=Math.floor(index/3);
 const pair=pairs[((finale?0:episode)+hash(seed))%pairs.length];
 return {id:`${pair[0]}:${pair[1]}`,first:pair[0],second:pair[1],visit:finale?2:index%3,chapter:finale||index%3===2?'wiederfinden':index%3===1?'antworten':'kennenlernen'};
}

/** Live AI paths share actual lyric structure; display-only audio fallbacks are not song observations. */
export function liveConcertContext(input:{energy?:number|null;section?:string|null;lyrics?:Lyrics|null},microphoneActive:boolean){
 return {energy:microphoneActive?input.energy:undefined,section:input.lyrics?.synced&&input.lyrics.lines.length?undefined:input.section};
}
