/** V353 Visual Effects Studio. A pure, bounded effect policy for the existing R3F scene.
 * Existing V347 transition enablement, V351 content safety, and V352 genre choices win. */
import type {GenreVisualCueV352,GenreVisualIdV352} from './genreVisualDirectorV352';
import type {SmartStageCueV351} from './smartStageCompositionV351';
export type VisualFxModeV353='auto'|'builtin'|'custom'|'saved'|'off';
export type VisualFxPresetIdV353='balanced'|'rave'|'cinematic'|'dreamy'|'minimal';
export type VisualFxTransitionV353='fade'|'zoom'|'slide';
export type VisualFxQualityV353='high'|'balanced'|'low';
export interface VisualFxTuningV353 {
 particles:number; glow:number; shader:number; transition:number; speed:number;
 color:string; photoStyle:VisualFxTransitionV353;
}
export interface VisualFxSavedPresetV353 {id:string;name:string;tuning:VisualFxTuningV353}
export interface VisualFxSettingsV353 {
 enabled:boolean;mode:VisualFxModeV353;preset:VisualFxPresetIdV353;selectedId:string;
 custom:VisualFxTuningV353;saved:VisualFxSavedPresetV353[];
 particlesEnabled:boolean;glowEnabled:boolean;shaderEnabled:boolean;transitionsEnabled:boolean;
}
export interface VisualFxInputV353 {
 playing:boolean;reducedMotion:boolean;lyricsActive:boolean;beatAccent?:number;
 section?:string|null;genre?:GenreVisualIdV352|null;
 genreCue?:GenreVisualCueV352;composition?:SmartStageCueV351;
 quality?:VisualFxQualityV353;
}
export interface VisualFxCueV353 {
 active:boolean;label:string;color:string;particleCount:number;particleSpeed:number;
 particleOpacity:number;glowGain:number;shaderStrength:number;
 transitionMs:number;photoStyle:VisualFxTransitionV353;transitionsActive:boolean;
 reason:string;
}
export const VISUAL_FX_KEY_V353='sonic-visual-effects-studio-v353';
export const VISUAL_FX_EVENT_V353='sonic:visual-effects-studio-v353';
export const VISUAL_FX_PRESETS_V353:Record<VisualFxPresetIdV353,{label:string;tuning:VisualFxTuningV353}>={
 balanced:{label:'Balanced',tuning:{particles:.42,glow:.42,shader:.35,transition:.55,speed:.48,color:'#62c7ff',photoStyle:'fade'}},
 rave:{label:'Rave / Festival',tuning:{particles:.83,glow:.84,shader:.62,transition:.75,speed:.85,color:'#f759e9',photoStyle:'zoom'}},
 cinematic:{label:'Cinematic',tuning:{particles:.28,glow:.58,shader:.65,transition:.85,speed:.30,color:'#a88dff',photoStyle:'fade'}},
 dreamy:{label:'Ambient / Dreamy',tuning:{particles:.31,glow:.35,shader:.44,transition:.91,speed:.19,color:'#9bc7fa',photoStyle:'fade'}},
 minimal:{label:'Minimal / Low Power',tuning:{particles:0,glow:.1,shader:0,transition:.38,speed:0,color:'#bcd3df',photoStyle:'fade'}},
};
export const DEFAULT_VISUAL_FX_V353:VisualFxSettingsV353={
 enabled:true,mode:'auto',preset:'balanced',selectedId:'',
 custom:{...VISUAL_FX_PRESETS_V353.balanced.tuning},saved:[],
 particlesEnabled:true,glowEnabled:true,shaderEnabled:true,transitionsEnabled:true,
};
const clamp=(n:number,lo=0,hi=1)=>Math.max(lo,Math.min(hi,n));
const number=(n:unknown,fallback:number)=>typeof n==='number'&&Number.isFinite(n)?clamp(n):fallback;
const color=(n:unknown,fallback:string)=>typeof n==='string'&&/^#[0-9a-fA-F]{6}$/.test(n)?n:fallback;
const style=(s:unknown):VisualFxTransitionV353=>s==='zoom'||s==='slide'?s:'fade';
const keys=Object.keys(VISUAL_FX_PRESETS_V353) as VisualFxPresetIdV353[];
const isPreset=(s:unknown):s is VisualFxPresetIdV353=>typeof s==='string'&&keys.includes(s as VisualFxPresetIdV353);
export function sanitizeVisualFxTuningV353(raw:unknown):VisualFxTuningV353 {
 const v=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<VisualFxTuningV353>:{};
 const d=VISUAL_FX_PRESETS_V353.balanced.tuning;
 return {particles:number(v.particles,d.particles),glow:number(v.glow,d.glow),shader:number(v.shader,d.shader),
  transition:number(v.transition,d.transition),speed:number(v.speed,d.speed),color:color(v.color,d.color),photoStyle:style(v.photoStyle)};
}
export function sanitizeVisualFxV353(raw:unknown):VisualFxSettingsV353 {
 const v=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<VisualFxSettingsV353>:{};
 const saved:VisualFxSavedPresetV353[]=[];
 if(Array.isArray(v.saved))for(const entry of v.saved.slice(0,20)){
  if(saved.length>=8)break;
  if(!entry||typeof entry!=='object')continue;
  const e=entry as Partial<VisualFxSavedPresetV353>;
  if(typeof e.id!=='string'||!/^fx-[a-z0-9-]{1,45}$/.test(e.id)||saved.some(p=>p.id===e.id))continue;
  const name=typeof e.name==='string'?e.name.trim().slice(0,36):'';
  if(!name)continue;
  saved.push({id:e.id,name,tuning:sanitizeVisualFxTuningV353(e.tuning)});
 }
 return {enabled:v.enabled!==false,
  mode:v.mode==='off'||v.mode==='builtin'||v.mode==='custom'||v.mode==='saved'?v.mode:'auto',
  preset:isPreset(v.preset)?v.preset:'balanced',selectedId:typeof v.selectedId==='string'?v.selectedId.slice(0,48):'',
  custom:sanitizeVisualFxTuningV353(v.custom),saved,
  particlesEnabled:v.particlesEnabled!==false,glowEnabled:v.glowEnabled!==false,
  shaderEnabled:v.shaderEnabled!==false,transitionsEnabled:v.transitionsEnabled!==false};
}
export function readVisualFxV353():VisualFxSettingsV353 {
 if(typeof window==='undefined')return sanitizeVisualFxV353(DEFAULT_VISUAL_FX_V353);
 try {return sanitizeVisualFxV353(JSON.parse(window.localStorage.getItem(VISUAL_FX_KEY_V353)||'null'));}catch{return sanitizeVisualFxV353(null);}
}
export function saveVisualFxV353(settings:VisualFxSettingsV353):VisualFxSettingsV353 {
 const safe=sanitizeVisualFxV353(settings);
 if(typeof window!=='undefined'){
  try{window.localStorage.setItem(VISUAL_FX_KEY_V353,JSON.stringify(safe));}catch{}
  window.dispatchEvent(new Event(VISUAL_FX_EVENT_V353));
 }
 return safe;
}
export function upsertVisualFxPresetV353(settings:VisualFxSettingsV353,name:string,tuning:VisualFxTuningV353):VisualFxSettingsV353 {
 const safe=sanitizeVisualFxV353(settings);const title=name.trim().slice(0,36);
 if(!title)return safe;
 const existing=safe.saved.find(p=>p.name.toLowerCase()===title.toLowerCase());
 if(!existing&&safe.saved.length>=8)return safe;
 // Deterministic monotonic local identifier within the bounded list, no external id/source.
 let serial=1;while(safe.saved.some(p=>p.id===`fx-${serial}`))serial++;
 const id=existing?.id??`fx-${serial}`;
 const entry={id,name:title,tuning:sanitizeVisualFxTuningV353(tuning)};
 return {...safe,mode:'saved',selectedId:id,saved:[...safe.saved.filter(p=>p.id!==id),entry]};
}
export function removeVisualFxPresetV353(settings:VisualFxSettingsV353,id:string):VisualFxSettingsV353 {
 const safe=sanitizeVisualFxV353(settings);
 return {...safe,saved:safe.saved.filter(p=>p.id!==id),mode:safe.mode==='saved'&&safe.selectedId===id?'builtin':safe.mode,
  selectedId:safe.selectedId===id?'':safe.selectedId};
}
export function resolveVisualFxTuningV353(settings:VisualFxSettingsV353,genre?:GenreVisualIdV352|null):{label:string;tuning:VisualFxTuningV353} {
 const s=sanitizeVisualFxV353(settings);
 if(s.mode==='custom')return {label:'Eigene Einstellungen',tuning:s.custom};
 if(s.mode==='saved'){
  const selected=s.saved.find(p=>p.id===s.selectedId);
  if(selected)return {label:selected.name,tuning:selected.tuning};
 }
 const match:VisualFxPresetIdV353= s.mode==='auto'
  ?genre==='hardstyle'||genre==='hardtekk'?'rave':genre==='ambient'?'dreamy':genre==='hiphop'||genre==='rock'?'cinematic':'balanced'
  :s.preset;
 return VISUAL_FX_PRESETS_V353[match];
}
/** Hard safety budget: 0 points on low tier, <=96 on high tier, glows subdued with lyrics.
 * Existing authored photo transitions are never force-enabled by this cue. */
export function decideVisualFxV353(input:VisualFxInputV353,raw:VisualFxSettingsV353):VisualFxCueV353 {
 const s=sanitizeVisualFxV353(raw);
 const neutral:VisualFxCueV353={active:false,label:'Bisherige Effekte',color:'#62c7ff',particleCount:0,particleSpeed:0,particleOpacity:0,
  glowGain:1,shaderStrength:0,transitionMs:0,photoStyle:'fade',transitionsActive:false,reason:'Studio ausgeschaltet'};
 if(!s.enabled||s.mode==='off')return neutral;
 const selection=resolveVisualFxTuningV353(s,input.genreCue?.active?input.genreCue.genre:input.genre);
 const t=selection.tuning,quality=input.quality??'high';
 const motionAllowed=input.playing&&!input.reducedMotion;
 const beat=number(input.beatAccent,0);
 const peak=/drop|hook|chorus|refrain|peak/i.test(input.section??'')?1:/build|rise/i.test(input.section??'')?.6:0;
 const musicGain=.75+.25*clamp(peak*.65+beat*.35);
 const protect=input.lyricsActive||input.composition?.protectLyrics===true;
 const safety=protect?.42:1;
 const capacity=quality==='low'?0:quality==='balanced'?42:96;
 const particleCount=s.particlesEnabled&&motionAllowed?Math.min(capacity,Math.round(capacity*t.particles*musicGain*safety)):0;
 const fxLimit=Math.max(.25,Math.min(1,input.composition?.fxGain??1));
 const glowGain=s.glowEnabled?clamp(1+(t.glow-.5)*.7*fxLimit*safety,.65,1.3):1;
 const shaderStrength=s.shaderEnabled&&quality!=='low'?clamp(t.shader*.32*safety*fxLimit*(input.playing?1:.35),0,.30):0;
 const transitionMs=s.transitionsEnabled&&!input.reducedMotion?Math.round(200+t.transition*1250):0;
 return {active:true,label:selection.label,color:s.mode==='auto'?(input.genreCue?.palette?.glow??t.color):t.color,particleCount,
  particleSpeed:motionAllowed?(.25+t.speed*1.15):0,particleOpacity:particleCount?clamp(.15+.4*t.glow,0,protect?.2:.55):0,
  glowGain,shaderStrength,transitionMs,photoStyle:t.photoStyle,transitionsActive:s.transitionsEnabled&&!input.reducedMotion,
  reason:`${selection.label} · ${protect?'Lyrics-Vorrang · ':''}${quality==='low'?'Eco-Modus · ':''}${!motionAllowed?'Animationen ruhen':'Musikreaktion aktiv'}`};
}
export function resolveVisualFxPhotoV353(cue:VisualFxCueV353|undefined,existingEnabled:boolean,existingDurationMs:number,existingCrossfadeMs:number):{enabled:boolean;durationMs:number;crossfadeMs:number;style:VisualFxTransitionV353} {
 if(!existingEnabled||!cue?.active||!cue.transitionsActive)return {enabled:existingEnabled,durationMs:existingDurationMs,crossfadeMs:existingCrossfadeMs,style:'fade'};
 const duration=Math.max(150,Math.min(1800,cue.transitionMs));
 return {enabled:true,durationMs:duration,crossfadeMs:Math.max(100,Math.min(1400,Math.round(duration*.58))),style:cue.photoStyle};
}
