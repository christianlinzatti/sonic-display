import type {Lyrics} from '../types/playbackCore';
import type {ShowHistory} from './showExperience';
import type {MotifTaste} from './showTaste';
import {musicFamilyV1129,type MusicFamilyV1129} from './musicPerformanceV1129';
export const PRODUCTION_IDS=['neon','cinema','groove','festival'] as const;
export type ProductionId=typeof PRODUCTION_IDS[number];
export type ProductionScene='portrait'|'dialogue'|'wide'|'refrain'|'suspense'|'reprise'|'reading'|'breath';
type Profile={id:ProductionId;name:string;families:readonly MusicFamilyV1129[];colors:readonly [string,string];motif:string;scenes:readonly ProductionScene[];motion:number;light:number;beam:number;camera:number};
export const SHOW_PRODUCTIONS:readonly Profile[]=[
 {id:'neon',name:'Neon-Pulse',families:['electronic','hard','urban'],colors:['#48e4ff','#be7bff'],motif:'Dance_RobotGroove',scenes:['dialogue','wide','portrait'],motion:1.05,light:1.03,beam:1.08,camera:1.035},
 {id:'cinema',name:'Lichtkino',families:['classical','ambient','rock'],colors:['#f4c59a','#91b9ff'],motif:'Dance_FluidArc',scenes:['portrait','dialogue','wide'],motion:.88,light:.94,beam:.83,camera:1.025},
 {id:'groove',name:'Groove-Session',families:['jazz','latin','afro','pop','global'],colors:['#ffbd79','#79e1c5'],motif:'Dance_JazzRebound',scenes:['dialogue','portrait','dialogue','wide'],motion:1,light:1,beam:.94,camera:1.015},
 {id:'festival',name:'Festivalbogen',families:['rock','hard','pop','global'],colors:['#ff8dbe','#a8baff'],motif:'Dance_FrontmanDrive',scenes:['wide','dialogue','portrait','wide'],motion:1.08,light:1.08,beam:1.12,camera:1.055},
];
export const isProductionId=(value:unknown):value is ProductionId=>typeof value==='string'&&(PRODUCTION_IDS as readonly string[]).includes(value);
export const productionTake=(value:unknown)=>typeof value==='number'&&Number.isFinite(value)?Math.max(0,Math.min(999,Math.round(value))):0;
const hash=(text:string)=>{let h=2166136261;for(const c of text)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h;};
const structures=new WeakMap<Lyrics,{rap:number;repeat:number}>();
/** Only observable repetition and line density; never infer emotion or invented word times. */
function structure(lyrics:Lyrics|null|undefined){
 if(!lyrics?.synced)return {rap:0,repeat:0};
 const cached=structures.get(lyrics);if(cached)return cached;
 const lines=lyrics.lines.slice(0,2000).filter(l=>Number.isFinite(l.startMs)&&Number.isFinite(l.endMs)&&l.endMs!>l.startMs);
 const counts=new Map<string,number>();let rapid=0;
 for(const line of lines){const text=line.text.toLowerCase().replace(/\s+/g,' ').trim();if(!text)continue;counts.set(text,(counts.get(text)??0)+1);if(text.split(' ').length/Math.max(.5,(line.endMs!-line.startMs)/1000)>3.2)rapid++;}
 const value={rap:rapid/Math.max(1,lines.length),repeat:[...counts.values()].filter(n=>n>1).reduce((a,n)=>a+n,0)/Math.max(1,lines.length)};
 structures.set(lyrics,value);return value;
}
export type ProductionPlan={id:ProductionId;name:string;take:number;scene:ProductionScene;color:string;baseColor:string;motif:string;crewGain:number;lightGain:number;beamGain:number;cameraGain:number;reason:string};
export function planShowProduction(input:{trackId:string;genre?:string|null;lyrics?:Lyrics|null;taste?:MotifTaste;history?:ShowHistory;choice?:ProductionId;take?:number;act:string;phrase:number;chorusVisit:number;reading:boolean;lyricFocus:boolean}):ProductionPlan{
 const take=productionTake(input.take),current=input.history?.find(row=>row.track===input.trackId),family=musicFamilyV1129(input.genre),facts=structure(input.lyrics);
 const manual=isProductionId(input.choice);
 let chosen=manual?input.choice:undefined;
 // Actual performed plans are pinned for this take, including after reloads and seeks.
 if(!chosen&&current?.take===take&&isProductionId(current.production))chosen=current.production;
 if(!chosen){
  let best=-Infinity;
  for(const profile of SHOW_PRODUCTIONS){
   if(current?.production===profile.id&&current.take!==take)continue;
   if((family==='ambient'||family==='classical')&&profile.id!=='cinema'&&profile.id!=='groove')continue;
   const recent=(input.history??[]).filter(row=>row.track!==input.trackId).slice(0,8);
   const repeat=recent.reduce((n,row,i)=>n+(row.production===profile.id?(8-i)/8:0),0);
   const preference=input.taste?.[profile.motif as keyof MotifTaste]??0;
   const score=(profile.families.includes(family)?1.1:0)+(profile.id==='cinema'?facts.rap*.9:profile.id==='festival'?facts.repeat*.8:profile.id==='groove'?facts.rap*.2:0)+
    Math.max(-3,Math.min(3,Number.isFinite(preference)?preference:0))*.12+hash(`${input.trackId}:${take}:${profile.id}`)/4294967295*.55-repeat*.8;
   if(score>best){best=score;chosen=profile.id;}
  }
 }
 const profile=SHOW_PRODUCTIONS.find(p=>p.id===chosen)??SHOW_PRODUCTIONS[0];
 const phrase=Number.isFinite(input.phrase)?Math.max(0,Math.floor(input.phrase)):0;
 const protectedText=input.reading||input.lyricFocus;
 const scene:ProductionScene=protectedText?'reading':input.act==='breathe'?'breath':input.act==='build'?'suspense':input.act==='finale'?'reprise':input.act==='lift'?'refrain':profile.scenes[(phrase+(take?hash(`${input.trackId}:${take}`)%profile.scenes.length:0))%profile.scenes.length];
 const expansive=scene==='wide'||scene==='refrain'||scene==='reprise';
 const visit=Number.isFinite(input.chorusVisit)?Math.max(0,Math.floor(input.chorusVisit)):0;
 const color=profile.colors[protectedText||scene==='breath'?0:(Math.floor(phrase/2)+visit+take)%2];
 return {id:profile.id,name:profile.name,take,scene,color,baseColor:profile.colors[0],motif:profile.motif,crewGain:protectedText||scene==='breath'?1:profile.motion,
  lightGain:protectedText||scene==='breath'?1:profile.light,beamGain:protectedText||scene==='breath'?1:profile.beam,
  cameraGain:protectedText||scene==='breath'||scene==='suspense'?1:expansive?profile.camera:scene==='portrait'?(profile.id==='cinema'?.97:.985):1,
  reason:manual?'Deine gewählte Inszenierung':current?.take===take&&current.production===profile.id?'Für diesen Song gespeicherte Inszenierung':'Genre, Lyrics-Struktur und Abwechslung im lokalen Verlauf'};
}
