/** V894 Ultimate Genre Stage — opt-in architectural accents behind the cast.
 * Uses only the verified V604/V885 storyboard, existing lighting playback clock,
 * and the user's explicit genre choice. Never switches stored stage presets,
 * manufactures audio/lyrics evidence, or overwrites authored lighting. */
import type {AtmospherePlanV885} from './dynamicConcertAtmosphereV885';

export type GenreStageLookV894='noir'|'reactor'|'rock-arena'|'prism';
export type GenreStageChoiceV894='auto'|GenreStageLookV894;
export type GenreStagePaceV894='smooth'|'concert'|'festival';
export interface GenreStageSettingsV894 {
 enabled:boolean;look:GenreStageChoiceV894;intensity:number;pace:GenreStagePaceV894;
 architecture:boolean;lightTint:boolean;protectLyrics:boolean;
}
export const GENRE_STAGE_KEY_V894='sonic-ultimate-genre-stage-v894';
export const DEFAULT_GENRE_STAGE_V894:Readonly<GenreStageSettingsV894>={
 enabled:true,look:'auto',intensity:60,pace:'concert',architecture:true,lightTint:true,protectLyrics:true,
};
const looks:readonly GenreStageChoiceV894[]=['auto','noir','reactor','rock-arena','prism'];
const paces:readonly GenreStagePaceV894[]=['smooth','concert','festival'];
const validSections=new Set(['intro','verse','hook','build','drop','break','finale','outro']);
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const smooth=(n:number)=>{const x=clamp(n,0,1);return x*x*(3-2*x);};
export function normalizeGenreStageV894(raw:unknown):GenreStageSettingsV894 {
 const r=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<GenreStageSettingsV894> : {};
 const flag=(key:'enabled'|'architecture'|'lightTint'|'protectLyrics',def:boolean)=>
  typeof r[key]==='boolean'?r[key] as boolean:def;
 return {enabled:flag('enabled',true),look:looks.includes(r.look as GenreStageChoiceV894)?r.look as GenreStageChoiceV894:'auto',
  intensity:finite(r.intensity)?Math.round(clamp(r.intensity,0,100)):60,
  pace:paces.includes(r.pace as GenreStagePaceV894)?r.pace as GenreStagePaceV894:'concert',
  architecture:flag('architecture',true),lightTint:flag('lightTint',true),protectLyrics:flag('protectLyrics',true)};
}
export function resolveGenreStageLookV894(choice:GenreStageChoiceV894,genre:string|null|undefined):GenreStageLookV894 {
 if(choice!=='auto')return choice;
 const name=(genre??'').toLowerCase();
 if(/hardtekk|hardstyle|hardcore|techno|rave|gabber|edm/.test(name))return 'reactor';
 if(/rock|metal|punk|industrial|deutschrock|ndh/.test(name))return 'rock-arena';
 if(/rap|hip.?hop|trap|drill|grime/.test(name))return 'noir';
 return 'prism';
}
export const GENRE_STAGE_LOOKS_V894:Readonly<Record<GenreStageLookV894,{label:string;primary:string;secondary:string;description:string}>>={
 noir:{label:'Deutschrap · Noir Skyline',primary:'#5d88db',secondary:'#d15b9e',description:'Dunkle Skyline mit vertikalen Lichtachsen'},
 reactor:{label:'Hardtekk · Reactor Grid',primary:'#18e6ff',secondary:'#9f55ff',description:'Neon-Reaktor, Winkel und symmetrische Energieachsen'},
 'rock-arena':{label:'Deutschrock · Arena Truss',primary:'#ffa23f',secondary:'#f04b39',description:'Breite Arena-Traversen und warmes Backlight'},
 prism:{label:'Pop · Prism Stage',primary:'#75dfff',secondary:'#ed8ed7',description:'Helle Diamantrahmen und klare vertikale Lichtfelder'},
};
export interface GenreStageSceneV894 {index:number;startMs:number;endMs:number;section:string;intent:string;name:string}
export interface GenreStagePlanV894 {trackId:string;durationMs:number;source:'verified-v604'|'unavailable';scenes:readonly GenreStageSceneV894[]}
export function buildGenreStagePlanV894(atmosphere:AtmospherePlanV885|null|undefined):GenreStagePlanV894 {
 const trackId=atmosphere?.trackId??'',durationMs=atmosphere?.durationMs??0;
 const off:GenreStagePlanV894={trackId,durationMs,source:'unavailable',scenes:[]};
 if(atmosphere?.source!=='verified-v604'||typeof trackId!=='string'||!trackId||trackId.length>160||
  !finite(durationMs)||durationMs<10000||durationMs>1800000||!Array.isArray(atmosphere.scenes))return off;
 const scenes:GenreStageSceneV894[]=[];
 for(const s of atmosphere.scenes){
  if(!Number.isInteger(s.index)||s.index<0||!finite(s.startMs)||!finite(s.endMs)||s.startMs<0||
   s.endMs>durationMs||s.endMs<=s.startMs||!validSections.has(s.section)||
   typeof s.intent!=='string'||s.intent.length>80||typeof s.name!=='string')continue;
  if(scenes.length&&s.startMs<scenes[scenes.length-1].endMs)continue;
  scenes.push({index:s.index,startMs:s.startMs,endMs:s.endMs,section:s.section,intent:s.intent,name:s.name.slice(0,64)});
  if(scenes.length>=64)break;
 }
 return scenes.length?{trackId,durationMs,source:'verified-v604',scenes}:off;
}
export interface GenreStageCueV894 {
 active:boolean;look:GenreStageLookV894;sceneIndex:number;section:string;
 architectureOpacity:number;lightMix:number;primary:string;secondary:string;fade:number;
}
export const GENRE_STAGE_OFF_V894:Readonly<GenreStageCueV894>={
 active:false,look:'noir',sceneIndex:-1,section:'',architectureOpacity:0,lightMix:0,
 primary:'#000000',secondary:'#000000',fade:0,
};
export interface GenreStageInputV894 {
 plan?:GenreStagePlanV894|null;settings:GenreStageSettingsV894;
 trackId:string;durationMs:number;positionMs:number;playing:boolean;autoEnabled:boolean;
 genre?:string|null;reducedMotion:boolean;tier:'low'|'balanced'|'high';
 seekBlocked?:boolean;blackout?:boolean;manualLighting?:boolean;manualFx?:boolean;
 lyricsProtected?:boolean;lyricsVisible?:boolean;vocalFocus?:boolean;lightsAllowed?:boolean;
}
/** Single pure scene clock, no frame-index dependence and no seek ghosts. */
export function sampleGenreStageV894(i:GenreStageInputV894):GenreStageCueV894 {
 const p=i.plan,s=i.settings;
 if(!s.enabled||s.intensity<=0||(!s.architecture&&!s.lightTint)||!i.autoEnabled||!i.playing||
  i.reducedMotion||i.seekBlocked||i.blackout||i.manualLighting||i.manualFx||i.tier==='low'||
  !p||p.source!=='verified-v604'||!i.trackId||p.trackId!==i.trackId||
  p.durationMs!==i.durationMs||!finite(i.durationMs)||!finite(i.positionMs)||
  i.positionMs<0||i.positionMs>=i.durationMs)return GENRE_STAGE_OFF_V894;
 const scene=p.scenes.find(x=>i.positionMs>=x.startMs&&i.positionMs<x.endMs);
 if(!scene)return GENRE_STAGE_OFF_V894;
 const look=resolveGenreStageLookV894(s.look,i.genre);
 const palette=GENRE_STAGE_LOOKS_V894[look];
 const fadeMs=s.pace==='smooth'?3400:s.pace==='festival'?950:2000;
 const age=i.positionMs-scene.startMs;
 const boundary=smooth(age/fadeMs)*smooth((scene.endMs-i.positionMs)/Math.max(700,fadeMs*.5));
 const quiet=scene.section==='break'||scene.section==='outro'||
  ['breath','dialogue','portrait'].includes(scene.intent);
 const protectedView=s.protectLyrics&&(i.lyricsProtected||i.lyricsVisible||i.vocalFocus);
 const peak=scene.section==='drop'||scene.section==='finale';
 const sectionGain=quiet?.25:peak?1:scene.section==='hook'?.78:scene.section==='build'?.68:.48;
 const gain=clamp(s.intensity/100,0,1)*sectionGain*boundary*
  (protectedView?.28:1)*(i.tier==='balanced'?.74:1);
 const architectureOpacity=s.architecture?Math.min(.58,gain*.58):0;
 const lightMix=s.lightTint&&i.lightsAllowed!==false?Math.min(.14,gain*.14):0;
 return {active:architectureOpacity>.001||lightMix>.001,look,sceneIndex:scene.index,
  section:scene.section,architectureOpacity,lightMix,primary:palette.primary,
  secondary:palette.secondary,fade:boundary};
}
export function exportGenreStageV894(plan:GenreStagePlanV894,settings:GenreStageSettingsV894,genre:string|null|undefined):string|null {
 if(plan.source!=='verified-v604'||!plan.trackId||!plan.scenes.length)return null;
 const look=resolveGenreStageLookV894(settings.look,genre);
 return JSON.stringify({schema:'sonic-ultimate-genre-stage-v894',version:1,source:plan.source,
  trackId:plan.trackId,durationMs:plan.durationMs,genreLook:look,
  settings:normalizeGenreStageV894(settings),scenes:plan.scenes,
  note:'Virtuelle, optionale Instancing-Dekoration hinter den Künstlern; keine echten Licht-/Bühnengeräte.'},null,2);
}
