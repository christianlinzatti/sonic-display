/** V1040 · Local Concert Show Designer.
 * A transparent, deterministic prompt-to-timeline assistant, NOT a remote AI model.
 * Timelines are percentage-based templates, not claims of detected song structure.
 * Existing beat/section detection retains exclusive authority for pyro/drop triggers.
 * All data stays local. No storage, microphone, network or hardware actions here.
 */
import {resolveHologramGenreV1039,type HologramGenreV1039} from './arena360HolographyV1039';
export type ArenaShowSceneV1040='intro'|'verse'|'build'|'hook'|'interlude'|'finale';
export type ArenaShowDeckV1040='fan'|'spiral'|'halo';
export type ArenaShowFloatV1040='wave'|'orbit'|'rise';
export type ArenaShowLaserV1040='halo'|'tunnel'|'spiral';
export type ArenaShowCameraV1040='wide'|'orbit'|'lead'|'group';
export type ArenaShowDanceV1040='calm'|'groove'|'group'|'peak';
export type ArenaShowSegmentV1040={
 id:string;scene:ArenaShowSceneV1040;start:number;end:number;intensity:number;
 deck:ArenaShowDeckV1040;floating:ArenaShowFloatV1040;lasers:ArenaShowLaserV1040;
 camera:ArenaShowCameraV1040;dance:ArenaShowDanceV1040;
};
export type ArenaShowPlanV1040={version:1040;title:string;prompt:string;genre:HologramGenreV1039;
 durationMs:number;segments:ArenaShowSegmentV1040[]};
export type ArenaShowCueV1040={active:boolean;scene:ArenaShowSceneV1040|null;segmentIndex:number;
 intensity:number;deck:ArenaShowDeckV1040;floating:ArenaShowFloatV1040;lasers:ArenaShowLaserV1040;
 camera:ArenaShowCameraV1040;dance:ArenaShowDanceV1040;fade:number;};
const clamp=(n:number,lo:number,hi:number)=>Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):lo;
const safeText=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):'';
const isOneOf=<T extends string>(value:unknown,choices:readonly T[]):value is T=>typeof value==='string'&&choices.includes(value as T);
const SCENES=['intro','verse','build','hook','interlude','finale'] as const;
const DECKS=['fan','spiral','halo'] as const;
const FLOATS=['wave','orbit','rise'] as const;
const LASERS=['halo','tunnel','spiral'] as const;
const CAMERAS=['wide','orbit','lead','group'] as const;
const DANCES=['calm','groove','group','peak'] as const;
const LAYOUT:readonly {scene:ArenaShowSceneV1040;start:number;end:number}[]=[
 {scene:'intro',start:0,end:.085},{scene:'verse',start:.085,end:.29},
 {scene:'build',start:.29,end:.43},{scene:'hook',start:.43,end:.62},
 {scene:'interlude',start:.62,end:.76},{scene:'verse',start:.76,end:.88},
 {scene:'finale',start:.88,end:1},
];
const PATTERNS:{[K in ArenaShowSceneV1040]:[ArenaShowDeckV1040,ArenaShowFloatV1040,ArenaShowLaserV1040,ArenaShowCameraV1040,ArenaShowDanceV1040]}={
 intro:['halo','wave','halo','wide','calm'],verse:['halo','wave','halo','lead','groove'],
 build:['spiral','rise','spiral','orbit','groove'],hook:['fan','orbit','tunnel','group','group'],
 interlude:['halo','wave','halo','wide','calm'],finale:['fan','rise','tunnel','group','peak'],
};
/** Generate an editable *show template*. No claim about actual downbeats, phrases or sections. */
export function generateArenaShowPlanV1040(opts:{prompt?:string;genre?:string|null;durationMs?:number;title?:string}):ArenaShowPlanV1040{
 const prompt=safeText(opts.prompt,400);
 const q=prompt.toLowerCase(),genre=resolveHologramGenreV1039(opts.genre||prompt);
 const hard=/hart|aggressiv|heftig|explosiv|spektakul|massiv|intensiv|dramatisch|energi/.test(q);
 const soft=/sanft|ruhig|entspannt|elegant|minimal|chill|dezent|slow/.test(q);
 const dark=/dunkel|düster|mystisch|dramatisch|dark|cinematic/.test(q);
 const base=genre==='hard'?77:genre==='rock'?70:genre==='rap'?58:54;
 const adjust=(hard?12:0)-(soft?18:0)+(dark?3:0);
 const levels:[number,number,number,number,number,number,number]=[.38,.6,.72,.92,.33,.66,1];
 const segmentPlan=LAYOUT.map((item,index)=>{
  const [deck,floating,lasers,camera,dance]=PATTERNS[item.scene];
  return {id:`act-${index+1}`,scene:item.scene,start:item.start,end:item.end,
   intensity:Math.round(clamp((base+adjust)*levels[index],8,92)),
   deck:dark&&item.scene==='intro'?'halo':deck,
   floating,lasers:soft&&item.scene==='hook'?'halo':lasers,camera,dance};
 });
 return {version:1040,title:safeText(opts.title,75)||'Meine 360°-Konzertshow',prompt,genre,
  durationMs:Math.round(clamp(opts.durationMs??210000,30000,900000)),segments:segmentPlan};
}
/** Accept only safely-shaped, non-overlapping, bounded plans from persisted preferences. */
export function normalizeArenaShowPlanV1040(input:unknown):ArenaShowPlanV1040|null{
 if(!input||typeof input!=='object')return null;
 const raw=input as Partial<ArenaShowPlanV1040>;
 if(raw.version!==1040||!Array.isArray(raw.segments)||raw.segments.length!==LAYOUT.length)return null;
 if(!isOneOf(raw.genre,['rap','hard','rock','pop'] as const))return null;
 if(typeof raw.durationMs!=='number'||!Number.isFinite(raw.durationMs)||raw.durationMs<30000||raw.durationMs>900000)return null;
 const segments:ArenaShowSegmentV1040[]=[];
 for(let i=0;i<LAYOUT.length;i++){
  const s=raw.segments[i];if(!s||typeof s!=='object')return null;
  const l=LAYOUT[i];
  // V1094: user-authored scene boundaries are permitted, but never gaps, overlaps,
  // backwards time, non-finite numbers or zero-length segments.
  const startOk=typeof s.start==='number'&&Number.isFinite(s.start)&&s.start>=0;
  const endOk=typeof s.end==='number'&&Number.isFinite(s.end)&&s.end<=1;
  if(s.id!==`act-${i+1}`||s.scene!==l.scene||!startOk||!endOk||
   s.end-s.start<.02-1e-8||(i===0?s.start!==0:s.start!==segments[i-1].end)||
   (i===LAYOUT.length-1&&s.end!==1)||
   !isOneOf(s.deck,DECKS)||!isOneOf(s.floating,FLOATS)||!isOneOf(s.lasers,LASERS)||
   !isOneOf(s.camera,CAMERAS)||!isOneOf(s.dance,DANCES)||
   typeof s.intensity!=='number'||!Number.isFinite(s.intensity)||s.intensity<0||s.intensity>100)return null;
  segments.push({...s});
 }
 return {version:1040,title:safeText(raw.title,75)||'Meine 360°-Konzertshow',
  prompt:safeText(raw.prompt,400),genre:raw.genre,durationMs:Math.round(raw.durationMs),segments};
}
export function editArenaShowSegmentV1040(plan:ArenaShowPlanV1040,id:string,patch:Partial<Pick<ArenaShowSegmentV1040,'intensity'|'deck'|'floating'|'lasers'|'camera'|'dance'>>):ArenaShowPlanV1040{
 const valid=normalizeArenaShowPlanV1040(plan);if(!valid)return plan;
 return {...valid,segments:valid.segments.map(s=>s.id!==id?s:{...s,
  intensity:patch.intensity===undefined?s.intensity:Math.round(clamp(patch.intensity,0,100)),
  deck:isOneOf(patch.deck,DECKS)?patch.deck:s.deck,
  floating:isOneOf(patch.floating,FLOATS)?patch.floating:s.floating,
  lasers:isOneOf(patch.lasers,LASERS)?patch.lasers:s.lasers,
  camera:isOneOf(patch.camera,CAMERAS)?patch.camera:s.camera,
  dance:isOneOf(patch.dance,DANCES)?patch.dance:s.dance})};
}
const INACTIVE:ArenaShowCueV1040={active:false,scene:null,segmentIndex:-1,intensity:0,
 deck:'halo',floating:'wave',lasers:'halo',camera:'wide',dance:'calm',fade:0};
/** Musical authority is preserved: planned "hook/finale" never implies a real drop. */
export function sampleArenaShowPlanV1040(plan:unknown,opts:{enabled:boolean;playing:boolean;
 reducedMotion:boolean;progressMs?:number|null;durationMs?:number|null;observedSection?:string|null}):ArenaShowCueV1040{
 if(!opts.enabled||!opts.playing||opts.reducedMotion)return INACTIVE;
 const valid=normalizeArenaShowPlanV1040(plan);
 if(!valid||!Number.isFinite(opts.durationMs)||!Number.isFinite(opts.progressMs)||
  (opts.durationMs??0)<=0||(opts.progressMs??-1)<0)return INACTIVE;
 const progress=clamp((opts.progressMs??0)/(opts.durationMs??1),0,1);
 const found=valid.segments.findIndex(s=>progress<s.end);
 const index=found<0?valid.segments.length-1:found;
 const s=valid.segments[index];if(!s)return INACTIVE;
 // A short crossfade avoids visual hard-cuts when adjacent authored segments change.
 const fade=Math.min(1,Math.max(0,(progress-s.start)/.012));
 const verifiedDrop=opts.observedSection==='drop';
 const capped=s.scene==='finale'&&!verifiedDrop?Math.min(s.intensity,80):s.intensity;
 return {active:true,scene:s.scene,segmentIndex:index,intensity:Math.round(capped*fade),
  deck:s.deck,floating:s.floating,lasers:s.lasers,camera:s.camera,dance:s.dance,fade};
}
