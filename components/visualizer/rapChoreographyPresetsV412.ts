/** V412: portable, avatar-scoped rap-timeline presets. No GLB binaries or arbitrary URLs. */
import {normalizeRapTimelineV411,sampleRapTimelineV411,type RapTimelineItemV411,type RapTimelineSectionV411} from './rapMotionTimelineV411';
export type RapPresetV412={id:string;name:string;avatarId:string;loop:boolean;mode:'timeline'|'section';items:RapTimelineItemV411[]};
export type RapPresetLibraryV412={version:1;presets:RapPresetV412[]};
export type RapLiveSampleV412={id:string;motionId:string;localSec:number;weight:number;rapGain:number};
export const RAP_PRESETS_STORAGE_V412='sonic.rap.choreography.presets.v412';
export const RAP_PRESETS_CHANGE_V412='sonic:rap-presets-v412';
const validId=(id:unknown)=>typeof id==='string'&&/^[\w.-]{1,100}$/.test(id);
const validAvatarId=(id:unknown)=>typeof id==='string'&&id.length>0&&id.length<=160&&!/[\\/\u0000-\u001f]/.test(id);
export function normalizeRapPresetV412(raw:unknown):RapPresetV412|null{
  if(!raw||typeof raw!=='object')return null;
  const obj=raw as Partial<RapPresetV412>;
  if(!validId(obj.id)||!validAvatarId(obj.avatarId)||obj.avatarId==='procedural')return null;
  const name=typeof obj.name==='string'?obj.name.trim().slice(0,72):'';
  if(!name)return null;
  const items=normalizeRapTimelineV411(obj.items);
  if(!items.length)return null;
  return {id:obj.id!,name,avatarId:obj.avatarId!,loop:obj.loop!==false,mode:obj.mode==='section'?'section':'timeline',items};
}
export function normalizeRapPresetLibraryV412(raw:unknown):RapPresetLibraryV412{
  const result:RapPresetV412[]=[];
  const entries=raw&&typeof raw==='object'&&Array.isArray((raw as Partial<RapPresetLibraryV412>).presets)?(raw as RapPresetLibraryV412).presets:[];
  for(const item of entries.slice(-100)){
    const preset=normalizeRapPresetV412(item);
    if(!preset)continue;
    const old=result.findIndex(p=>p.id===preset.id);
    if(old>=0)result.splice(old,1);
    result.push(preset);
  }
  return {version:1,presets:result.slice(-40)};
}
export function upsertRapPresetV412(library:RapPresetLibraryV412,preset:RapPresetV412):RapPresetLibraryV412{
  return normalizeRapPresetLibraryV412({version:1,presets:[...library.presets,preset]});
}
export function removeRapPresetV412(library:RapPresetLibraryV412,id:string):RapPresetLibraryV412{
  return normalizeRapPresetLibraryV412({version:1,presets:library.presets.filter(p=>p.id!==id)});
}
export function loadRapPresetLibraryV412():RapPresetLibraryV412{
  if(typeof window==='undefined')return {version:1,presets:[]};
  try{return normalizeRapPresetLibraryV412(JSON.parse(window.localStorage.getItem(RAP_PRESETS_STORAGE_V412)??'null'));}
  catch{return {version:1,presets:[]};}
}
export function saveRapPresetLibraryV412(library:RapPresetLibraryV412):RapPresetLibraryV412{
  const safe=normalizeRapPresetLibraryV412(library);
  if(typeof window!=='undefined'){
    window.localStorage.setItem(RAP_PRESETS_STORAGE_V412,JSON.stringify(safe));
    window.dispatchEvent(new Event(RAP_PRESETS_CHANGE_V412));
  }
  return safe;
}
/** Live sampling. In section mode detected verse/hook changes crossfade between authored slots;
 * timeline mode uses the editor's exact deterministic overlap schedule. */
export function sampleRapLiveV412(preset:RapPresetV412,time:number,section:RapTimelineSectionV411,
  previousSection:RapTimelineSectionV411|null,changeAt:number):{section:RapTimelineSectionV411;active:RapLiveSampleV412[]}{
  const safe=normalizeRapPresetV412(preset);
  if(!safe)return {section:'verse',active:[]};
  if(safe.mode==='timeline'){
    const frame=sampleRapTimelineV411(safe.items,time,safe.loop);
    return {section:frame.section,active:frame.active.map(({id,motionId,localSec,weight,rapGain})=>({id,motionId,localSec,weight,rapGain}))};
  }
  const current=safe.items.find(item=>item.section===section)??safe.items[0];
  const prior=previousSection&&previousSection!==section?safe.items.find(item=>item.section===previousSection):null;
  const elapsed=Math.max(0,Number.isFinite(time)&&Number.isFinite(changeAt)?time-changeAt:0);
  const fade=prior&&prior.id!==current.id?Math.min(2,Math.max(.10,prior.crossfadeSec)):.0;
  const progress=fade>0?Math.max(0,Math.min(1,elapsed/fade)):1;
  const weight=progress*progress*(3-2*progress);
  const active:RapLiveSampleV412[]=[];
  if(prior&&prior.id!==current.id&&weight<1)active.push({id:prior.id,motionId:prior.motionId,localSec:elapsed,weight:1-weight,rapGain:prior.rapGain});
  active.push({id:current.id,motionId:current.motionId,localSec:elapsed,weight,rapGain:current.rapGain});
  return {section:current.section,active};
}
export function liveRapClipNameV412(motionId:string,embeddedNames:ReadonlyArray<string>):string|null{
  if(/^embedded:\d+$/.test(motionId))return embeddedNames[Number(motionId.slice(9))]??null;
  if(/^installed:[\w.-]+$/.test(motionId))return `Library:${motionId.slice(10)}:0`;
  if(motionId==='configured:active')return null; // V412 explicitly refuses ambiguous active-url aliases
  return null;
}
/** Exclude presets pointing at uninstalled assets before enabling a live performance. */
export function checkRapPresetMotionsV412(preset:RapPresetV412,installedIds:ReadonlyArray<string>,embeddedCount:number):string[]{
  return preset.items.filter(item=>{
    if(item.motionId.startsWith('installed:'))return !installedIds.includes(item.motionId.slice(10));
    if(item.motionId.startsWith('embedded:'))return Number(item.motionId.slice(9))>=embeddedCount;
    return true;
  }).map(item=>item.motionId);
}
