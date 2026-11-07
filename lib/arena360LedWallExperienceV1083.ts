/** V1083 · Advanced LED Wall 5.0.
 * Pure, opt-in 3D-inspired optical patterns on the EXISTING V1059 pixel belt.
 * No invented musical events, no song/lyrics analytics, no hardware control.
 */
import type {LedWallPixelV1059,LedWallCueV1059,LedWallAudioV1059} from './arena360LedWallV1059';
import type {ArenaShowCueV1040,ArenaShowSceneV1040} from './arena360ShowDesignerV1040';

export type LedExperienceModeV1083='auto'|'tunnel'|'geometry3d'|'lyrics'|'drop';
export type LedExperienceLookV1083=Exclude<LedExperienceModeV1083,'auto'>;
export type LedExperienceCueV1083={active:boolean;reason:'disabled'|'paused'|'motion'|'quality'|'manual'|'clock'|'show'|'planned';
 look:LedExperienceLookV1083;gain:number;chapter:number;lyric:string;dropAllowed:boolean};
const finite=(v:unknown,lo:number,hi:number,fallback=lo)=>typeof v==='number'&&Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):fallback;
const OFF:Readonly<LedExperienceCueV1083>=Object.freeze({active:false,reason:'disabled',look:'geometry3d',gain:0,chapter:-1,lyric:'',dropAllowed:false});
function off(reason:LedExperienceCueV1083['reason']):LedExperienceCueV1083{return {...OFF,reason};}
const SCENE_LOOK:Record<ArenaShowSceneV1040,LedExperienceLookV1083>={
 intro:'tunnel',verse:'lyrics',build:'geometry3d',hook:'geometry3d',interlude:'lyrics',finale:'tunnel',
};
const MODES:ReadonlyArray<LedExperienceModeV1083>=['auto','tunnel','geometry3d','lyrics','drop'];
/** Render ONLY a real, current, synchronized line from the existing lyrics provider.
 * Never project unsynchronized lyrics or carry old lines across seeks/gaps.
 */
export function currentSyncedLedLyricV1083(lyrics:{synced:boolean;lines:readonly {startMs:number;endMs:number|null;text:string}[]} | null | undefined,
 progressMs:number | null | undefined,playing:boolean):string{
 if(!playing||!lyrics?.synced||!Number.isFinite(progressMs)||progressMs!<0||!Array.isArray(lyrics.lines))return '';
 const lines=lyrics.lines;if(lines.length>20000)return '';
 let lo=0,hi=lines.length-1,index=-1;
 while(lo<=hi){const mid=(lo+hi)>>>1,start=lines[mid]?.startMs;
  if(!Number.isFinite(start))return '';
  if(start<=progressMs!){index=mid;lo=mid+1;}else hi=mid-1;}
 if(index<0)return '';
 const line=lines[index],end=line.endMs;
 if(!Number.isFinite(end)||end!<=line.startMs||progressMs!>end!)return '';
 const cleaned=typeof line.text==='string'?line.text.replace(/[\x00-\x1f\x7f]+/g,' ').replace(/\s+/g,' ').trim():'';
 return Array.from(cleaned).slice(0,64).join('');
}
export function planLedWallExperienceV1083(input:{enabled:boolean;stageIsArena:boolean;playing:boolean;
 reducedMotion:boolean;reactive?:boolean;performanceTier?:'low'|'balanced'|'high'|null;
 manualPattern?:string|null;mode?:LedExperienceModeV1083|null;progressMs?:number|null;durationMs?:number|null;
 show?:ArenaShowCueV1040|null;baseCue?:LedWallCueV1059|null;strength?:number|null;
 observedSection?:string|null;lyricText?:string|null;
}):LedExperienceCueV1083{
 if(!input.enabled||!input.stageIsArena||input.reactive===false)return off('disabled');
 if(!input.playing)return off('paused');
 if(input.reducedMotion)return off('motion');
 if(input.performanceTier==='low')return off('quality');
 if(input.manualPattern!==undefined&&input.manualPattern!=='auto')return off('manual');
 if(!Number.isFinite(input.progressMs)||!Number.isFinite(input.durationMs)||
  input.progressMs!<0||input.durationMs!<30000||input.progressMs!>input.durationMs!||input.durationMs!>1800000)return off('clock');
 const show=input.show,base=input.baseCue;
 if(!base?.active||base.gain<=0||!Number.isFinite(base.gain)||!show?.active||
  !Number.isInteger(show.segmentIndex)||show.segmentIndex<0||!Number.isFinite(show.fade)||show.fade<=0||show.fade>1||
  !Number.isFinite(show.intensity)||show.intensity<=0||show.intensity>100||
  !(['intro','verse','build','hook','interlude','finale'] as string[]).includes(show.scene??''))return off('show');
 if(input.strength!=null&&!Number.isFinite(input.strength))return off('disabled');
 const amount=finite(input.strength,0,80,55)/80;
 if(amount<=0)return off('disabled');
 const mode=MODES.includes(input.mode??'auto')?input.mode??'auto':'auto';
 let look:LedExperienceLookV1083=mode==='auto'?SCENE_LOOK[show.scene as ArenaShowSceneV1040]:mode;
 // Only observed drop classification can opt auto mode into the stronger drop motif.
 if(mode==='auto'&&input.observedSection==='drop'&&look==='geometry3d')look='drop';
 const lyric=typeof input.lyricText==='string'?Array.from(input.lyricText.replace(/[\x00-\x1f\x7f]+/g,' ').trim()).slice(0,64).join(''):'';
 if(look==='lyrics'&&!lyric)look='geometry3d';
 const dropAllowed=input.observedSection==='drop';
 // Drop visuals require measured audio at sample time and an observed drop section.
 if(look==='drop'&&!dropAllowed)look='tunnel';
 const gain=finite(base.gain,0,.55)*amount*(input.performanceTier==='balanced'?.72:1);
 if(gain<=.001)return off('show');
 return {active:true,reason:'planned',look,gain:finite(gain,0,.55),chapter:show.segmentIndex,
  lyric:look==='lyrics'?lyric:'',dropAllowed};
}
/** Spatial 3D illusion on V1059's EXISTING LEDs. Never exceed the old .55 limit.
 * Geometry uses stable world coordinates and the authoritative song clock; not random/RAF.
 */
export function sampleLedWallExperienceV1083(pixel:LedWallPixelV1059,cue:LedExperienceCueV1083,
 audio:LedWallAudioV1059 & {energyEnvelope?:number|null},timeSeconds:number):number{
 if(!cue.active||!Number.isFinite(timeSeconds)||!Number.isFinite(pixel.column)||
  !Number.isFinite(pixel.row)||pixel.columns<=0||pixel.rows<=0||pixel.column<0||pixel.row<0||
  pixel.column>=pixel.columns||pixel.row>=pixel.rows)return 0;
 const x=pixel.column/pixel.columns,y=(pixel.row+.5)/pixel.rows,t=finite(timeSeconds,0,1800);
 const bass=finite(audio.bass,0,1),mids=finite(audio.mids,0,1),highs=finite(audio.highs,0,1);
 const verified=cue.dropAllowed&&audio.beat===true&&finite(audio.beatStrength,0,1)>=.75&&
  bass>=.55&&finite(audio.energyEnvelope,0,1)>=.55;
 let brightness=0;
 switch(cue.look){
  case 'tunnel': {
   // Converging ring waves, faux depth bands and vanishing-point rhythm.
   const perspective=Math.abs(Math.sin(x*Math.PI*12-y*2.5-t*.84));
   const cross=Math.abs(Math.cos(x*Math.PI*4+y*5.4+t*.28));
   brightness=.08+.55*Math.pow(perspective,5)+.22*Math.pow(cross,9);
   break;
  }
  case 'geometry3d': {
   const face=Math.sin(x*Math.PI*8+t*.47)+Math.cos(y*8+x*Math.PI*5-t*.31);
   const edge=Math.abs(Math.sin(face*2.6));
   brightness=.10+.52*Math.pow(edge,4)+.13*mids;
   break;
  }
  case 'lyrics': {
   // A deliberately dark background: real words are drawn separately at most once per line.
   const ribbon=.5+.5*Math.sin(x*Math.PI*4-t*.45+y*1.3);
   brightness=.06+.24*ribbon+.08*highs;
   break;
  }
  case 'drop': {
   const radial=Math.pow(.5+.5*Math.cos(x*Math.PI*12+y*4-t*.8),5);
   brightness=.11+.43*radial+(verified?.26:0);
   break;
  }
 }
 return finite(brightness*cue.gain*(1+(verified?.05:0)),0,.55);
}
