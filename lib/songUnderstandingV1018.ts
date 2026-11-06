/** V1018 Song Understanding 2.0 — read-only evidence fusion.
 * Uses only the existing V896 measured live-audio snapshot and V763 timeline
 * derived from verified V604 acts. Metadata is a genre DIRECTION, not evidence.
 * Never invents section boundaries, rap/vocal detection, tempo or drop events.
 * No network, storage, timers or hardware side effects.
 */
import type {EnergyStateV896} from '../components/visualizer/musicalEnergyIntelligenceV896';
import type {ConcertTimelineSnapshotV763} from '../components/visualizer/concertTimelineBridgeV763';

export type RecognizedSectionV1018='verse'|'hook'|'build'|'drop'|'break';
export type EnergyFeelV1018='quiet'|'steady'|'rising'|'intense';
export type GenreDirectionV1018='rap'|'hard-dance'|'rock'|'other';
export interface SongUnderstandingInputV1018 {
 trackId:string; durationMs:number;positionMs:number;playing:boolean;genre:string;
 audio?:EnergyStateV896|null;timeline?:ConcertTimelineSnapshotV763|null;
}
export interface SongUnderstandingV1018 {
 source:'unavailable'|'measured-audio'|'verified-timeline'|'measured-and-verified';
 section:RecognizedSectionV1018|null;
 sectionStartMs:number|null;sectionEndMs:number|null;nextSection:RecognizedSectionV1018|null;
 energy:number|null;bass:number|null;trend:number|null;feel:EnergyFeelV1018|null;
 genreDirection:GenreDirectionV1018;rapVocalVerified:false;measuredBpm:null;
 /** Evidence is local to the current moment; it never authorizes stage/hardware cues. */
 verifiedSection:boolean;measuredAudio:boolean;
}
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const bounded=(v:unknown,min:number,max:number)=>finite(v)&&v>=min&&v<=max;
const sections:readonly RecognizedSectionV1018[]=['verse','hook','build','drop','break'];
export function genreDirectionV1018(genre:string):GenreDirectionV1018 {
 const g=typeof genre==='string'?genre.slice(0,80).toLowerCase():'';
 return /hardtekk|hardstyle|hardcore|rave|techno/.test(g)?'hard-dance':
  /deutschrap|hip.?hop|rap|trap|drill/.test(g)?'rap':
  /deutschrock|rock|metal|ndh|industrial/.test(g)?'rock':'other';
}
export function understandSongV1018(i:SongUnderstandingInputV1018):SongUnderstandingV1018 {
 const genreDirection=genreDirectionV1018(i?.genre);
 const empty:SongUnderstandingV1018={source:'unavailable',section:null,sectionStartMs:null,
  sectionEndMs:null,nextSection:null,energy:null,bass:null,trend:null,feel:null,
  genreDirection,rapVocalVerified:false,measuredBpm:null,verifiedSection:false,measuredAudio:false};
 if(!i||!i.playing||typeof i.trackId!=='string'||!i.trackId||i.trackId.length>160||
  !Number.isInteger(i.durationMs)||i.durationMs<10000||i.durationMs>1800000||
  !bounded(i.positionMs,0,i.durationMs-1))return empty;
 const a=i.audio;
 // A real V896 state needs >=3 samples, a matching track and a recent timestamp.
 const measured=!!a&&a.source==='live-normalized-audio'&&a.trackId===i.trackId&&
  a.durationMs===i.durationMs&&Number.isInteger(a.samples)&&a.samples>=3&&
  bounded(a.positionMs,0,i.durationMs-1)&&Math.abs(a.positionMs-i.positionMs)<=600&&
  bounded(a.smoothed,0,1)&&bounded(a.baseline,0,1)&&bounded(a.bass,0,1)&&
  bounded(a.pulse,0,1)&&bounded(a.trend,-1,1);
 const t=i.timeline;
 let section:RecognizedSectionV1018|null=null;
 let sceneIndex=-1;
 const verified=!!t&&t.source==='verified-v604'&&t.trackId===i.trackId&&
  t.durationMs===i.durationMs&&t.playing===true&&
  bounded(t.progressMs,0,i.durationMs-1)&&Math.abs(t.progressMs-i.positionMs)<=1200&&
  Array.isArray(t.scenes)&&t.scenes.length>0&&t.scenes.length<=480&&
  t.scenes.every((s,index)=>s.index===index&&Number.isInteger(s.actIndex)&&s.actIndex>=0&&
   bounded(s.startMs,0,i.durationMs)&&bounded(s.endMs,s.startMs+1,i.durationMs)&&
   (index===0||s.startMs>=t.scenes[index-1].endMs)&&
   sections.includes(s.section as RecognizedSectionV1018));
 if(verified&&t){sceneIndex=t.scenes.findIndex(s=>s.startMs<=i.positionMs&&i.positionMs<s.endMs);
  if(sceneIndex>=0)section=t.scenes[sceneIndex].section as RecognizedSectionV1018;}
 const scene=section!==null&&t?t.scenes[sceneIndex]:null;
 const next=section!==null&&t?t.scenes[sceneIndex+1]:null;
 const energy=measured&&a?a.smoothed:null,bass=measured&&a?a.bass:null,trend=measured&&a?a.trend:null;
 const feel:EnergyFeelV1018|null=energy===null||trend===null?null:
  energy<.24?'quiet':trend>.12?'rising':energy>.70?'intense':'steady';
 const hasSection=!!scene;
 return {source:measured?(hasSection?'measured-and-verified':'measured-audio'):(hasSection?'verified-timeline':'unavailable'),
  section,sectionStartMs:scene?scene.startMs:null,sectionEndMs:scene?scene.endMs:null,
  nextSection:next&&sections.includes(next.section as RecognizedSectionV1018)?next.section as RecognizedSectionV1018:null,
  energy,bass,trend,feel,genreDirection,rapVocalVerified:false,measuredBpm:null,
  verifiedSection:hasSection,measuredAudio:measured};
}
