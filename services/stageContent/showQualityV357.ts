/** V357 – deterministic quality supervision for *automatic* V356 show cues.
 * Pure, bounded and synchronous: no sampling loop, AI service or invented audio forecast.
 * Never edits an authored V354 timeline or the V356 planner itself.
 */
import type {AutoShowResultV356,AutoShowSectionV356,PlannedMomentV356} from './autonomousShowV356';
import type {CameraShotV354,DanceFormationV354,ShowTimelineCueV354} from './showTimelineV354';

export const SHOW_QUALITY_KEY_V357='sonic-show-quality-v357';
export const SHOW_QUALITY_EVENT_V357='sonic:show-quality-v357';
export type ShowQualityModeV357='balanced'|'cinematic'|'energetic';
export type ShowQualitySettingsV357={enabled:boolean;mode:ShowQualityModeV357;variety:number;calmness:number;
  maxFxGain:number;protectContent:boolean};
export const DEFAULT_SHOW_QUALITY_V357:ShowQualitySettingsV357={enabled:true,mode:'balanced',variety:75,
 calmness:55,maxFxGain:1.18,protectContent:true};
const clamp=(value:unknown,fallback:number,min:number,max:number)=>typeof value==='number'&&Number.isFinite(value)
 ?Math.min(max,Math.max(min,value)):fallback;
export function sanitizeShowQualityV357(raw:unknown):ShowQualitySettingsV357{
 const s=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<ShowQualitySettingsV357>:{};
 return {enabled:s.enabled!==false,
  mode:s.mode==='cinematic'||s.mode==='energetic'?s.mode:'balanced',
  variety:Math.round(clamp(s.variety,75,0,100)),calmness:Math.round(clamp(s.calmness,55,0,100)),
  maxFxGain:Number(clamp(s.maxFxGain,1.18,.4,1.55).toFixed(2)),protectContent:s.protectContent!==false};
}
export function readShowQualityV357():ShowQualitySettingsV357{
 if(typeof window==='undefined')return {...DEFAULT_SHOW_QUALITY_V357};
 try{return sanitizeShowQualityV357(JSON.parse(window.localStorage.getItem(SHOW_QUALITY_KEY_V357)||'null'));}
 catch{return {...DEFAULT_SHOW_QUALITY_V357};}
}
export function saveShowQualityV357(raw:ShowQualitySettingsV357):ShowQualitySettingsV357{
 const settings=sanitizeShowQualityV357(raw);
 if(typeof window!=='undefined'){
  try{window.localStorage.setItem(SHOW_QUALITY_KEY_V357,JSON.stringify(settings));}catch{/* private browsing */}
  window.dispatchEvent(new Event(SHOW_QUALITY_EVENT_V357));
 }
 return settings;
}
export type ShowQualityInputV357={trackId?:string|null;section?:string|null;lyricsActive:boolean;
 mediaCount:number;avatarCount:number;reducedMotion:boolean;playing:boolean;manualOverride?:boolean};
export type ShowQualityScoreV357={score:number;repetition:number;cameraActivity:number;visualLoad:number;
 notes:string[]};
export type ShowQualityResultV357={active:boolean;reason:string;cue:ShowTimelineCueV354;
 moments:PlannedMomentV356[];before:ShowQualityScoreV357;after:ShowQualityScoreV357;changes:string[]};
const unit=(v:number)=>Math.max(0,Math.min(1,v));
const normalizedCount=(v:number)=>Number.isFinite(v)?Math.min(8,Math.max(0,Math.round(v))):0;
const hash=(s:string)=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;};
const sections=['verse','hook','drop','build','break'];
function shotPool(section:string|undefined|null,lyrics:boolean,s:ShowQualitySettingsV357):CameraShotV354[]{
 if(lyrics)return ['wide','medium'];
 if(s.calmness>=80&&(section==='verse'||section==='break'))return ['wide','medium'];
 if(section==='drop')return s.mode==='cinematic'?['wide','medium','orbit']:['wide','orbit','medium','close'];
 if(section==='break')return ['wide','medium','close'];
 if(section==='verse' && s.mode==='balanced')return ['wide','medium','close'];
 if(s.mode==='cinematic')return ['medium','wide','close','orbit'];
 if(s.mode==='energetic')return ['orbit','medium','wide','close'];
 return ['wide','medium','close','orbit'];
}
function formationPool(section:string|undefined|null,count:number):DanceFormationV354[]{
 if(count<2)return ['solo'];
 return section==='drop'?['sync','mirror','duet']:section==='break'?['solo','duet','mirror']:['solo','duet','mirror','sync'];
}
/** Stable shuffle per absolute phrase block: the same phrase gets the same choice
 * regardless of current playhead, preview horizon, or render rate.
 */
function spacedChoice<T>(pool:readonly T[],seed:string,index:number):T{
 if(pool.length===1)return pool[0];
 if(pool.length===2)return pool[(hash(seed)%2+index)%2];
 const block=Math.floor(index/pool.length),position=((index%pool.length)+pool.length)%pool.length;
 const shuffle=(blockId:number)=>{
  const arr=[...pool];let state=hash(`${seed}|${blockId}`);
  for(let k=arr.length-1;k>0;k--){state=(Math.imul(state,1664525)+1013904223)>>>0;
   const j=state%(k+1);[arr[k],arr[j]]=[arr[j],arr[k]];}
  return arr;
 };
 const current=shuffle(block);
 // Prevent an adjacent duplicate across block boundaries without altering other indices.
 if(position===0){const prev=shuffle(block-1);if(current[0]===prev[prev.length-1]){
  const swap=current.length>2?2:1;[current[0],current[swap]]=[current[swap],current[0]];
 }}
 return current[position];
}
/** Evaluates *proposed* presentation cues, not live visual occlusion or render FPS. */
export function scoreShowQualityV357(moments:readonly PlannedMomentV356[],input:ShowQualityInputV357):ShowQualityScoreV357{
 if(!moments.length)return {score:0,repetition:0,cameraActivity:0,visualLoad:0,notes:['Kein aktiver Showplan']};
 let repeats=0,activity=0,overload=0;
 const media=normalizedCount(input.mediaCount);
 const crowd=normalizedCount(input.avatarCount);
 const lyrics=input.lyricsActive;
 for(let i=0;i<moments.length;i++){
  const m=moments[i];
  if(i>0){if(m.shot===moments[i-1].shot)repeats+=2;
   if(m.formation===moments[i-1].formation&&crowd>1)repeats++;
   if(i>1&&m.shot===moments[i-2].shot)repeats+=.5;}
  if(m.shot==='orbit'||m.shot==='close')activity++;
  if(lyrics&&['orbit','close'].includes(m.shot))activity+=3;
  const intensity=Math.max(0,m.fxGain-1)*1.4+Math.max(0,m.lightGain-1);
  overload+=Math.max(0,intensity-(lyrics?.10:media>=2?.22:.5));
 }
 const repetition=Math.round(unit(repeats/Math.max(1,moments.length*2))*100);
 const cameraActivity=Math.round(unit(activity/moments.length)*100);
 const visualLoad=Math.round(unit(overload/moments.length)*100);
 const score=Math.round(Math.max(0,100-repetition*.40-cameraActivity*.12-visualLoad*.48));
 const notes:string[]=[];
 if(repetition>25)notes.push('Wiederkehrende Bewegungs-/Kameramuster');
 if(cameraActivity>65)notes.push('Sehr bewegte Kamera');
 if(visualLoad>10)notes.push('Hohe gleichzeitige Licht-/Effektintensität');
 if(!notes.length)notes.push('Ausgewogene automatische Szenenfolge');
 return {score,repetition,cameraActivity,visualLoad,notes};
}
/** Refines only automatic cues and never increases lighting or FX above V356 output.
 * Same phrase index -> same decision even during seeking and preview changes.
 */
export function refineShowQualityV357(base:AutoShowResultV356,input:ShowQualityInputV357,
 raw:ShowQualitySettingsV357=DEFAULT_SHOW_QUALITY_V357):ShowQualityResultV357{
 const s=sanitizeShowQualityV357(raw);
 const before=scoreShowQualityV357(base.moments,input);
 const inactive=(reason:string):ShowQualityResultV357=>({active:false,reason,cue:base.cue,
  moments:base.moments,before,after:before,changes:[]});
 if(!s.enabled)return inactive('Qualitätsregie deaktiviert');
 if(!base.active||!base.moments.length||!base.cue.active)return inactive('Keine automatische Show');
 if(!input.playing||input.manualOverride)return inactive('Manuelle Regie oder Pause hat Vorrang');
 if(input.reducedMotion)return inactive('Weniger Bewegung hat Vorrang');
 if(!input.trackId)return inactive('Track-ID fehlt');
 const lanes=base.cue.activeLanes;
 const cameraOn=lanes.includes('camera'),formationOn=lanes.includes('dance');
 const lightOn=lanes.includes('lighting'),fxOn=lanes.includes('effects');
 const media=normalizedCount(input.mediaCount),crowd=normalizedCount(input.avatarCount);
 const fxCap=Math.min(s.maxFxGain,s.protectContent&&input.lyricsActive ? .80 : 1.55,
  s.protectContent&&media>=2 ? .94 : 1.55,s.protectContent&&crowd>=3 ? 1.05 : 1.55);
 const lightCap=Math.min(1.55,s.protectContent&&input.lyricsActive?1.02:1.55,
  s.protectContent&&media>=2?1.16:1.55);
 // Always bounded; preferences never bypass V351 lyrics caps, V355 render limits or authored cues.
 const moments=base.moments.map(m=>{
  const section:AutoShowSectionV356=sections.includes(m.section)?m.section:'verse';
  const shot=cameraOn&&s.variety>=30&&section!=='break'?spacedChoice(shotPool(section,input.lyricsActive,s),`${input.trackId}|camera|${section}|${s.mode}`,m.index):m.shot;
  const formation=formationOn&&crowd>1&&s.variety>=50?
   spacedChoice(formationPool(section,crowd),`${input.trackId}|formation|${section}`,m.index):m.formation;
  return {...m,shot,formation,lightGain:lightOn?Number(Math.min(m.lightGain,lightCap).toFixed(3)):m.lightGain,
   fxGain:fxOn?Number(Math.min(m.fxGain,fxCap).toFixed(3)):m.fxGain};
 });
 const first=moments[0];
 const cue:ShowTimelineCueV354={...base.cue,cameraShot:cameraOn?first.shot:base.cue.cameraShot,
  danceFormation:formationOn?first.formation:base.cue.danceFormation,
  lightGain:lightOn?Math.min(base.cue.lightGain,first.lightGain):base.cue.lightGain,
  fxGain:fxOn?Math.min(base.cue.fxGain,first.fxGain):base.cue.fxGain};
 const changes:string[]=[];
 if(moments.some((m,i)=>m.shot!==base.moments[i].shot))changes.push('Kameraperspektiven über mehrere Phrasen verteilt');
 if(moments.some((m,i)=>m.formation!==base.moments[i].formation))changes.push('Gruppenformationen variiert');
 if(moments.some((m,i)=>m.fxGain<base.moments[i].fxGain))changes.push('Effektbudget reduziert');
 if(moments.some((m,i)=>m.lightGain<base.moments[i].lightGain))changes.push('Lichtbudget reduziert');
 const after=scoreShowQualityV357(moments,input);
 return {active:true,reason:'Deterministische Qualitätsregie für automatische V356-Szenen',cue,moments,before,after,changes};
}
