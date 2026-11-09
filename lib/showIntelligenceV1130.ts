import {activeConcertLyric,concertLyricSection} from './concertLyricTimeline';
import {genreClipsV1129,musicFamilyV1129} from './musicPerformanceV1129';
import type {Lyrics} from '../types/playbackCore';
export const HEADLINERS_V1130=[
 {id:'sonic-atlas-prism',slug:'atlas-prism',label:'Atlas Prism',variant:2,genres:['Techno','Electro','House'],preset:'robot'},
 {id:'sonic-aurora-synth',slug:'aurora-synth',label:'Aurora Synth',variant:1,genres:['Synthpop','Trance','Ambient'],preset:'freestyle'},
 {id:'sonic-rio-carnival',slug:'rio-carnival',label:'Rio Carnival',variant:1,genres:['Latin','Afrobeat','Pop'],preset:'freestyle'},
 {id:'sonic-quantum-bass',slug:'quantum-bass',label:'Quantum Bass',variant:2,genres:['Hardstyle','Drum and Bass','Hip-Hop'],preset:'robot'},
] as const;
const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a));
export type ShowActV1130='breathe'|'story'|'build'|'lift'|'impact'|'finale';
export type ShowCueV1130={act:ShowActV1130;label:string;mode:'individual'|'spotlight'|'canon'|'unison';
 energy:number;lyricDensity:number;phrase:number;intensity:number;reason:string;palette:string;};
/** Timed lyrics provide a vocal-density cue, never audio energy or singer identification. */
export function lyricDensityV1130(lyrics:Lyrics|null|undefined,progressMs:number):number{
 if(!lyrics?.synced||!Number.isFinite(progressMs))return 0;
 const index=activeConcertLyric(lyrics,progressMs);
 if(index<0)return 0;
 const line=lyrics.lines[index],end=line.endMs??Math.min(lyrics.lines[index+1]?.startMs??Infinity,line.startMs+4000);
 return clamp((line.text.match(/\S+/g)?.length??0)/Math.max(1,(end-line.startMs)/1000)/4);
}
export function showCueV1130(input:{section?:string|null;energy?:number|null;bpm?:number|null;
 progressMs:number;durationMs?:number;genre?:string|null;lyricDensity?:number}):ShowCueV1130{
 const seconds=clamp(input.progressMs,0,86400000)/1000;
 const bpm=clamp(input.bpm??120,55,210),phrase=Math.floor(seconds*bpm/60/16);
 const density=clamp(input.lyricDensity??0),energy=clamp(input.energy??.5);
 const section=input.section??'',family=musicFamilyV1129(input.genre);
 let act:ShowActV1130=/intro|outro|break|quiet|bridge/i.test(section)||energy<.23?'breathe':
 /build|riser|pre.?chorus/i.test(section)?'build':/drop|peak|climax/i.test(section)?'impact':
 /hook|chorus|refrain/i.test(section)?'lift':'story';
 if(input.durationMs&&input.progressMs/input.durationMs>.92&&energy>.55&&act!=='breathe')act='finale';
 const mode=act==='breathe'?'individual':act==='impact'||act==='finale'?'unison':
 act==='build'?'canon':act==='lift'?(phrase%2?'unison':'canon'):density>.65?'spotlight':phrase%3===2?'canon':'spotlight';
 const labels:Record<ShowActV1130,string>={breathe:'Atemholen',story:'Call & Response',build:'Spannung aufbauen',lift:'Refrain im Rampenlicht',impact:'Gemeinsamer Drop',finale:'Finale'};
 const base={breathe:.2,story:.52,build:.64,lift:.76,impact:.9,finale:.95}[act];
 return {act,label:labels[act],mode,energy,lyricDensity:density,phrase,
 intensity:clamp(base*(.75+.25*energy)*(density>.7&&act==='story'?.8:1),.12,.95),
 reason:density>.65&&act==='story'?'Viele Lyrics: Solo-Fokus und ruhigere Begleitung':
 act==='breathe'?'Kontrast schafft Platz für den nächsten Höhepunkt':
 act==='impact'?'Gemeinsamer Hit aus dem vorhandenen Abschnittssignal':'Phrasen, Genre und Bewegungs-Gedächtnis bestimmen den nächsten Kontrast',
 palette:family==='latin'||family==='afro'?'#ffb64c':family==='hard'||family==='rock'?'#ff647c':family==='ambient'||family==='classical'?'#bbabff':'#65e6ff'};
}
const energyFor=(clip:string)=>/Idle|Liquid|Waltz|Ripple/.test(clip)?.2:/PowerHit|Stomp|FestivalBounce|Shuffle|RockDrive/.test(clip)?.9:/Robot|HipHop|Afro|Techno/.test(clip)?.65:.48;
/** Rank only loaded clips. A bounded recent history penalizes repetition over three phrases. */
export function intelligentClipV1130(input:{clips:readonly string[];genre?:string|null;cue:ShowCueV1130;
 recent:readonly string[];trackId:string;slot:number;shared:boolean;signature?:string}):string|null{
 const genre=genreClipsV1129(input.genre),cue=input.cue;
 let pool=[...new Set(input.clips)].filter(x=>/^Dance_|^Idle_Breathe$/.test(x));
 if(input.shared)pool=pool.filter(x=>['Dance_Groove','Dance_Techno','Dance_House','Dance_HipHop','Dance_Disco','Dance_Shuffle','Dance_Robot','Dance_FestivalBounce','Idle_Breathe'].includes(x));
 if(!pool.length)return null;
 const target=cue.act==='breathe'?.15:cue.intensity;
 let seed=0;for(const c of input.trackId)seed=(Math.imul(seed,31)+c.charCodeAt(0))>>>0;
 let rankingPhrase=cue.phrase,rankingRecent:readonly string[]=input.recent;
 const rank=(name:string)=>{
  let h=seed;for(const c of name)h=(Math.imul(h,33)^c.charCodeAt(0))>>>0;
  const novelty=((h+Math.imul(rankingPhrase+1,2654435761)+(input.shared?0:input.slot*97))>>>0)%997/997;
  const recentIndex=rankingRecent.indexOf(name);
  return 3-Math.abs(energyFor(name)-target)*3+(genre.includes(name)?1.5:0)+novelty*.9-
   (recentIndex>=0?(3-recentIndex)*1.25:0)+(name===input.signature&&cue.mode==='spotlight'?1.2:0)+
   (cue.act==='breathe'&&name==='Idle_Breathe'?4:0)+
   ((cue.act==='impact'||cue.act==='finale')&&/PowerHit|Stomp/.test(name)?1.5:0);
 };
 const choose=()=>pool.map(name=>({name,score:rank(name)})).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name))[0].name;
 if(input.shared){
  // Reconstruct a shared short history so solos cannot desynchronize the next group hit.
  let history:string[]=[],selected=pool[0];
  for(let phrase=Math.max(0,cue.phrase-3);phrase<=cue.phrase;phrase++){
   rankingPhrase=phrase;rankingRecent=history;selected=choose();history=[selected,...history].slice(0,3);
  }
  return selected;
 }
 return choose();
}
/** Conservative lyric structure heuristic, explicitly separate from audio analysis. */
export function lyricSectionV1130(lyrics:Lyrics|null|undefined,progressMs:number):string|null{
 return concertLyricSection(lyrics,progressMs);
}
