/** V887 Cinematic Fog & Haze: song-scoped, scene-driven shaping of the TWO V814 haze meshes.
 * No new light/mesh, independent beat inference, global scene.fog, or browser dependency.
 * Verified V885 storyboard is used only as source of song sections and palette.
 */
import type {AtmospherePlanV885,AtmosphereSceneV885} from './dynamicConcertAtmosphereV885';
import type {ConcertAtmosphereCueV814} from './atmosphericConcertFxV814';
export type FogMoodV887='auto'|'noir'|'electric'|'arena'|'dream';
export type FogMotionV887='still'|'rolling'|'festival';
export interface CinematicFogSettingsV887 {
 enabled:boolean;mood:FogMoodV887;motion:FogMotionV887;
 intensity:number;floor:boolean;shafts:boolean;protectLyrics:boolean;
}
export const FOG_STORAGE_KEY_V887='sonic-cinematic-fog-haze-v887';
export const DEFAULT_FOG_V887:Readonly<CinematicFogSettingsV887>={
 enabled:true,mood:'auto',motion:'rolling',intensity:65,
 floor:true,shafts:true,protectLyrics:true,
};
const moods:readonly FogMoodV887[]=['auto','noir','electric','arena','dream'];
const motions:readonly FogMotionV887[]=['still','rolling','festival'];
const valid=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const cap=(n:number,low=0,high=1)=>Math.min(high,Math.max(low,n));
const palette:{[key in Exclude<FogMoodV887,'auto'>]:{label:string;color:string;floorFactor:number;shaftFactor:number}}={
 noir:{label:'Deutschrap · Rauchschleier',color:'#606db5',floorFactor:1.10,shaftFactor:.72},
 electric:{label:'Hardtekk · Neon-Dunst',color:'#48dce5',floorFactor:.76,shaftFactor:1.18},
 arena:{label:'Deutschrock · Arena-Nebel',color:'#ffb477',floorFactor:1.18,shaftFactor:1.04},
 dream:{label:'Pop · Dream-Haze',color:'#b4b0f4',floorFactor:.86,shaftFactor:.84},
};
export const FOG_MOODS_V887=Object.freeze(Object.fromEntries(
 Object.entries(palette).map(([key,val])=>[key,val.label])) as Record<Exclude<FogMoodV887,'auto'>,string>);
export function normalizeCinematicFogV887(raw:unknown):CinematicFogSettingsV887 {
 const s=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<CinematicFogSettingsV887>:{};
 return {enabled:typeof s.enabled==='boolean'?s.enabled:true,
  mood:moods.includes(s.mood as FogMoodV887)?s.mood as FogMoodV887:'auto',
  motion:motions.includes(s.motion as FogMotionV887)?s.motion as FogMotionV887:'rolling',
  intensity:valid(s.intensity)?Math.round(cap(s.intensity,0,100)):65,
  floor:typeof s.floor==='boolean'?s.floor:true,
  shafts:typeof s.shafts==='boolean'?s.shafts:true,
  protectLyrics:typeof s.protectLyrics==='boolean'?s.protectLyrics:true};
}
export function selectFogMoodV887(genre:string,mood:FogMoodV887='auto'):Exclude<FogMoodV887,'auto'>{
 if(mood!=='auto')return mood;
 const n=genre.trim().toLowerCase();
 if(/hardtekk|hardstyle|techno|rave|tekk/.test(n))return 'electric';
 if(/deutschrock|rock|metal|ndh|industrial/.test(n))return 'arena';
 if(/deutschrap|rap|hip.hop|trap/.test(n))return 'noir';
 return 'dream';
}
export function previewFogV887(genre:string,mood:FogMoodV887){
 const key=selectFogMoodV887(genre,mood);return {...palette[key],mood:key};
}
export interface CinematicFogCueV887 {
 mode:'legacy'|'off'|'cinematic';active:boolean;label:string;floorOpacity:number;
 shaftsOpacity:number;phase:number;color:string;drift:number;softness:number;warp:number;
}
const off:Readonly<CinematicFogCueV887>={mode:'off',active:false,label:'',floorOpacity:0,shaftsOpacity:0,
 phase:0,color:'#ffffff',drift:0,softness:0,warp:0};
const legacy=(base:ConcertAtmosphereCueV814):CinematicFogCueV887=>({
 mode:'legacy',active:base.active, label:'V814',floorOpacity:cap(base.floorOpacity,0,.17),
 shaftsOpacity:cap(base.shaftsOpacity,0,.09),phase:base.phase,color:base.color,
 drift:0,softness:0,warp:0});
function currentScene(plan:AtmospherePlanV885,t:number):AtmosphereSceneV885|null {
 let lo=0,hi=plan.scenes.length-1;
 while(lo<=hi){const mid=(lo+hi)>>>1;const s=plan.scenes[mid];
  if(t<s.startMs)hi=mid-1;else if(t>=s.endMs)lo=mid+1;else return s;
 }
 return null;
}
/** An active V887 setting protects both existing V814 haze meshes from blackouts,
 * manual light cues and reduced motion; disabling V887 restores legacy V814 exactly. */
export function planCinematicFogV887(input:{
 settings:CinematicFogSettingsV887;plan?:AtmospherePlanV885|null;
 base:ConcertAtmosphereCueV814;trackId:string;durationMs:number;positionMs:number;
 genre:string;playing:boolean;autoEnabled:boolean;reducedMotion:boolean;
 seekBlocked?:boolean;blackout?:boolean;manualLighting?:boolean;
 lyricsProtected?:boolean;manualFx?:boolean;tier:'low'|'balanced'|'high';
 hazeBudget:number;performanceGain:number;
}):CinematicFogCueV887 {
 const {settings:s,base,plan,trackId,durationMs,positionMs}=input;
 if(!s.enabled)return legacy(base);
 if(!input.playing||!input.autoEnabled||input.reducedMotion||input.seekBlocked||input.blackout||
  input.manualLighting||input.manualFx||(s.protectLyrics&&input.lyricsProtected)||input.tier==='low'||
  !valid(positionMs)||positionMs<0||!valid(durationMs)||positionMs>=durationMs||
  !valid(input.hazeBudget)||input.hazeBudget<=0||!valid(input.performanceGain)||input.performanceGain<=0||
  !valid(s.intensity)||s.intensity<=0||s.intensity>100||!s.floor&&!s.shafts)return {...off};
 if(!plan||plan.source!=='verified-v604'||plan.trackId!==trackId||plan.durationMs!==durationMs){
  // No story evidence: never invent a cinematic cue; existing V814 visuals remain.
  return legacy(base);
 }
 const scene=currentScene(plan,positionMs);
 if(!scene)return {...off};
 if(!base.active)return {...off};
 const profile=previewFogV887(input.genre,s.mood);
 const quiet=['break','outro'].includes(scene.section)||['breath','portrait','dialogue'].includes(scene.intent);
 const rise=scene.section==='build',peak=scene.section==='drop'||scene.section==='hook';
 const motion=s.motion==='still'?0:s.motion==='rolling'?.45:.9;
 const sectionGain=quiet?.50:rise?.82:peak?1:.72;
 const power=cap(s.intensity/100)*sectionGain*cap(input.hazeBudget)*cap(input.performanceGain)*
  (input.tier==='balanced'?.72:1);
 // Never exceed the legacy V814 shader's alpha and shafts ceilings or create a flash.
 const floorOpacity=s.floor?cap(base.floorOpacity*(.68+power*.92)*profile.floorFactor,0,.17):0;
 const shaftsOpacity=s.shafts?cap(base.shaftsOpacity*(.68+power*.92)*profile.shaftFactor,0,.09):0;
 const color= s.mood==='auto'?scene.primary:profile.color;
 const phase=valid(base.phase)?base.phase:0;
 return {mode:'cinematic',active:floorOpacity>.002||shaftsOpacity>.002,
  label:`${profile.label} · ${scene.section}`,floorOpacity,shaftsOpacity,phase,color,
  drift:motion*(positionMs/1000)*.38,softness:quiet?.7:rise?.50:.32,
  warp:motion*(quiet?.24:.46)};
}
export function exportFogPlanV887(plan:AtmospherePlanV885|null|undefined,settings:CinematicFogSettingsV887,genre:string):string|null {
 if(!plan||plan.source!=='verified-v604'||!plan.scenes.length)return null;
 const p=previewFogV887(genre,settings.mood);
 return JSON.stringify({schema:'sonic-cinematic-fog-v887',version:1,
  note:'Nebel-Looks verwenden ausschließlich bestätigte Songabschnitte und die vorhandenen V814-Meshes.',
  trackId:plan.trackId,durationMs:plan.durationMs,source:plan.source,
  profile:p.mood,settings:normalizeCinematicFogV887(settings),
  scenes:plan.scenes.map(s=>({startMs:s.startMs,endMs:s.endMs,section:s.section,
   intent:s.intent,primary:s.primary,strength:s.strength}))},null,2);
}
