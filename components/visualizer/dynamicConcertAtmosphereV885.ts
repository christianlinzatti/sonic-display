/** V885 – intentional stage atmosphere from V604/V763 VERIFIED scene intervals.
 * Deterministic song-time palette; no inferred audio, second light rig, timers, strobe or GPU assets.
 * Authored lighting/lyrics/blackouts always override the suggested visuals. */
import {verifiedLiveFxScenesV881,resolveLiveFxStyleV881,
 type LiveFxTimelineV881,type LiveFxSceneV881,type LiveFxStyleV881} from './liveFxDeckPlannerV881';

export type AtmospherePaletteV885='auto'|'noir'|'electric'|'arena'|'dream';
export type AtmospherePaceV885='gentle'|'cinematic'|'festival';
export interface AtmosphereSettingsV885 {
 enabled:boolean;palette:AtmospherePaletteV885;pace:AtmospherePaceV885;
 intensity:number;lights:boolean;environment:boolean;haze:boolean;overlay:boolean;
}
export const ATMOSPHERE_STORAGE_KEY_V885='sonic-dynamic-concert-atmosphere-v885';
export const DEFAULT_ATMOSPHERE_V885:Readonly<AtmosphereSettingsV885>={
 enabled:true,palette:'auto',pace:'cinematic',intensity:55,
 lights:true,environment:true,haze:true,overlay:true,
};
export interface AtmosphereSceneV885 {
 index:number;startMs:number;endMs:number;section:string;intent:string;
 name:string;primary:string;secondary:string;ambient:string;
 strength:number;fadeMs:number;
}
export interface AtmospherePlanV885 {
 trackId:string;durationMs:number;source:'verified-v604'|'unavailable';
 palette:Exclude<AtmospherePaletteV885,'auto'>|null;
 scenes:readonly AtmosphereSceneV885[];
}
export interface AtmosphereCueV885 {
 active:boolean;sceneIndex:number;label:string;primary:string;secondary:string;ambient:string;
 lightsMix:number;environmentMix:number;hazeOpacity:number;overlayOpacity:number;
 blend:number;palette:string;
}
export const OFF_ATMOSPHERE_V885:Readonly<AtmosphereCueV885>={
 active:false,sceneIndex:-1,label:'',primary:'#000000',secondary:'#000000',ambient:'#000000',
 lightsMix:0,environmentMix:0,hazeOpacity:0,overlayOpacity:0,blend:0,palette:'none',
};
const palettes:readonly AtmospherePaletteV885[]=['auto','noir','electric','arena','dream'];
const paces:readonly AtmospherePaceV885[]=['gentle','cinematic','festival'];
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const smooth=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
const colors:{[key in Exclude<AtmospherePaletteV885,'auto'>]:readonly [string,string,string,string]}={
 noir:['#465f9b','#a271ba','#10182d','#dc6a9a'],
 electric:['#16dce6','#9a56ff','#071c35','#ffae56'],
 arena:['#ffab62','#ffe0a4','#352035','#f4606d'],
 dream:['#73caff','#f0a4de','#18274b','#a7ffda'],
};
export function normalizeAtmosphereV885(raw:unknown):AtmosphereSettingsV885 {
 const v=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<AtmosphereSettingsV885>:{};
 return {
  enabled:typeof v.enabled==='boolean'?v.enabled:true,
  palette:palettes.includes(v.palette as AtmospherePaletteV885)?v.palette as AtmospherePaletteV885:'auto',
  pace:paces.includes(v.pace as AtmospherePaceV885)?v.pace as AtmospherePaceV885:'cinematic',
  intensity:finite(v.intensity)?Math.round(clamp(v.intensity,0,100)):55,
  lights:typeof v.lights==='boolean'?v.lights:true,
  environment:typeof v.environment==='boolean'?v.environment:true,
  haze:typeof v.haze==='boolean'?v.haze:true,
  overlay:typeof v.overlay==='boolean'?v.overlay:true,
 };
}
export function resolveAtmospherePaletteV885(palette:AtmospherePaletteV885,genre:string,
 liveFxStyle:LiveFxStyleV881='auto'):Exclude<AtmospherePaletteV885,'auto'> {
 if(palette!=='auto')return palette;
 const style=resolveLiveFxStyleV881(liveFxStyle,genre);
 return style==='hardtekk'?'electric':style==='rock'?'arena':style==='rap'?'noir':'dream';
}
function rgb(hex:string):[number,number,number]{
 return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)) as [number,number,number];
}
function hexBlend(a:string,b:string,mix:number):string{
 const x=rgb(a),y=rgb(b),t=clamp(mix,0,1);
 return '#'+x.map((n,i)=>Math.round(n+(y[i]-n)*t).toString(16).padStart(2,'0')).join('');
}
/** Color chips for settings UI only. This preview does not activate a stage effect. */
export function previewAtmospherePaletteV885(palette:Exclude<AtmospherePaletteV885,'auto'>):
 {primary:string;secondary:string;ambient:string} {
 const [primary,secondary,ambient]=colors[palette];return {primary,secondary,ambient};
}
function findAtmosphereSceneV885(scenes:readonly AtmosphereSceneV885[],positionMs:number):number {
 let low=0,high=scenes.length-1;
 while(low<=high){
  const mid=(low+high)>>>1,scene=scenes[mid];
  if(positionMs<scene.startMs)high=mid-1;
  else if(positionMs>=scene.endMs)low=mid+1;
  else return mid;
 }
 return -1;
}
function scenePalette(s:LiveFxSceneV881,palette:Exclude<AtmospherePaletteV885,'auto'>):Pick<AtmosphereSceneV885,'primary'|'secondary'|'ambient'|'strength'|'name'> {
 const [main,side,deep,highlight]=colors[palette];
 const quiet=['breath','portrait','dialogue'].includes(s.intent)||['break','outro'].includes(s.section);
 const rising=s.section==='build'||s.intent==='rise';
 const peak=s.section==='drop'||s.section==='hook';
 const strength=quiet?.35:peak?s.section==='drop'?1:.82:rising?.64:.52;
 const primary=quiet?hexBlend(main,deep,.44):rising?hexBlend(side,highlight,.24):peak?hexBlend(main,highlight,.22):main;
 const secondary=quiet?hexBlend(side,deep,.47):peak?hexBlend(side,highlight,.32):side;
 const ambient=quiet?hexBlend(deep,main,.10):peak?hexBlend(deep,main,.29):hexBlend(deep,side,.15);
 const name=quiet?'Intimate':rising?'Rise':s.section==='drop'?'Drop':s.section==='hook'?'Hook':'Verse';
 return {primary,secondary,ambient,strength,name};
}
export function buildAtmospherePlanV885(input:{timeline?:LiveFxTimelineV881|null;
 trackId:string;durationMs:number;genre:string;settings:AtmosphereSettingsV885;
 liveFxStyle?:LiveFxStyleV881}):AtmospherePlanV885 {
 const fallback:AtmospherePlanV885={trackId:input.trackId,durationMs:input.durationMs,source:'unavailable',palette:null,scenes:[]};
 const valid=verifiedLiveFxScenesV881(input.timeline,input.trackId,input.durationMs);
 if(!valid.length)return fallback;
 const palette=resolveAtmospherePaletteV885(input.settings.palette,input.genre,input.liveFxStyle);
 const scenes=valid.map((scene,i):AtmosphereSceneV885=>{
  const prior=valid[i-1];const continuous=prior?.endMs===scene.startMs;
  const fadeMs=continuous?Math.round(Math.min(scene.endMs-scene.startMs,
   input.settings.pace==='gentle'?4800:input.settings.pace==='festival'?1600:3000)):0;
  return {...scene,...scenePalette(scene,palette),fadeMs};
 });
 return {trackId:input.trackId,durationMs:input.durationMs,source:'verified-v604',palette,scenes};
}
/** Sample the stage's authoritative song clock. Song gaps, seek guards, low-tier and
 * manual controls do not create new inferred scenes or leftover 3D atmosphere. */
export function sampleAtmosphereV885(input:{plan?:AtmospherePlanV885|null;settings:AtmosphereSettingsV885;
 trackId:string;durationMs:number;positionMs:number;playing:boolean;reducedMotion:boolean;
 autoEnabled:boolean;seekBlocked?:boolean;blackout?:boolean;manualLighting?:boolean;
 lyricsProtected?:boolean;manualFx?:boolean;tier?:'low'|'balanced'|'high'}):AtmosphereCueV885 {
 const {plan,settings,trackId,durationMs,positionMs}=input;
 if(!plan||plan.source!=='verified-v604'||plan.trackId!==trackId||plan.durationMs!==durationMs||
  !settings.enabled||!input.autoEnabled||!input.playing||input.reducedMotion||input.seekBlocked||
  input.blackout||input.manualFx||input.tier==='low'||
  !finite(positionMs)||positionMs<0||positionMs>=durationMs||
  !finite(settings.intensity)||settings.intensity<=0||settings.intensity>100||
  !(settings.lights||settings.environment||settings.haze||settings.overlay))return OFF_ATMOSPHERE_V885;
 const index=findAtmosphereSceneV885(plan.scenes,positionMs);
 if(index<0)return OFF_ATMOSPHERE_V885;
 const scene=plan.scenes[index];const prev=plan.scenes[index-1];
 const blend=prev&&prev.endMs===scene.startMs&&scene.fadeMs>0?
  smooth((positionMs-scene.startMs)/scene.fadeMs):1;
 const quiet=scene.strength;
 const primary=prev&&blend<1?hexBlend(prev.primary,scene.primary,blend):scene.primary;
 const secondary=prev&&blend<1?hexBlend(prev.secondary,scene.secondary,blend):scene.secondary;
 const ambient=prev&&blend<1?hexBlend(prev.ambient,scene.ambient,blend):scene.ambient;
 const power=clamp(settings.intensity/100,0,1)*(input.tier==='balanced'?.75:1)*quiet;
 const protectedLighting=input.manualLighting||input.lyricsProtected;
 const lightsMix=settings.lights&&!protectedLighting?Math.min(.16,power*.15):0;
 const environmentMix=settings.environment&&!protectedLighting?Math.min(.12,power*.12):0;
 const hazeOpacity=settings.haze&&!input.lyricsProtected&&!input.manualLighting?
  Math.min(.065,power*.055):0;
 const overlayOpacity=settings.overlay&&!input.lyricsProtected?
  Math.min(.14,power*.115):0;
 return {active:lightsMix>0||environmentMix>0||hazeOpacity>0||overlayOpacity>0,
  sceneIndex:scene.index,label:`${scene.name} · ${scene.section}`,primary,secondary,ambient,
  lightsMix,environmentMix,hazeOpacity,overlayOpacity,blend,palette:plan.palette??'none'};
}
export function exportAtmospherePlanV885(plan:AtmospherePlanV885,settings:AtmosphereSettingsV885):string|null {
 if(plan.source!=='verified-v604'||!plan.scenes.length)return null;
 return JSON.stringify({schema:'sonic-dynamic-concert-atmosphere-v885',version:1,
  note:'Genre-/szenenabhängige visuelle Farbvorschläge aus verifizierten Abschnitten – keine Audio- oder Beat-Erkennung.',
  trackId:plan.trackId,durationMs:plan.durationMs,source:plan.source,
  palette:plan.palette,settings:normalizeAtmosphereV885(settings),scenes:plan.scenes},null,2);
}
