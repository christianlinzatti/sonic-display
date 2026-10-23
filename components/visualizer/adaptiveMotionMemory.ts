/** V213 – bounded usage-aware clip eviction, without retaining motion histories across sessions. */
export const ADAPTIVE_MOTION_MEMORY_EVENT='sonic:adaptive-motion-memory-v213-changed';
const KEY='sonic.motion.memory.v213';
export type MotionMemoryProfile='auto'|'desktop'|'pi';
export type MotionMemorySettings={enabled:boolean;profile:MotionMemoryProfile;minClips:number;maxClips:number;favorFrequentlyUsed:boolean};
export const DEFAULT_MOTION_MEMORY:MotionMemorySettings={enabled:false,profile:'auto',minClips:3,maxClips:10,favorFrequentlyUsed:true};
const clamp=(v:unknown,def:number,min:number,max:number)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Math.round(Number(v)))):def;
export function sanitizeMotionMemory(value:unknown):MotionMemorySettings {
 const v=value && typeof value==='object'?value as Record<string,unknown>:{};
 const minClips=clamp(v.minClips,3,2,12);
 return {enabled:v.enabled===true,profile:v.profile==='pi'||v.profile==='desktop'?v.profile:'auto',minClips,maxClips:clamp(v.maxClips,10,minClips,16),favorFrequentlyUsed:v.favorFrequentlyUsed!==false};
}
export function readMotionMemory():MotionMemorySettings {
 if(typeof window==='undefined')return {...DEFAULT_MOTION_MEMORY};
 try{return sanitizeMotionMemory(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{return {...DEFAULT_MOTION_MEMORY};}
}
export function writeMotionMemory(value:MotionMemorySettings):MotionMemorySettings {
 const safe=sanitizeMotionMemory(value);
 if(typeof window!=='undefined')try{localStorage.setItem(KEY,JSON.stringify(safe));window.dispatchEvent(new Event(ADAPTIVE_MOTION_MEMORY_EVENT));}catch{}
 return safe;
}
export type MotionMemoryHardware={deviceMemoryGB?:number;logicalCores?:number;reducedMotion?:boolean};
export type MotionMemoryStats={uses:number;lastUsed:number};
export type MotionMemoryLedger=Record<string,MotionMemoryStats>;
export function resolveMotionMemoryLimit(s:MotionMemorySettings,hw:MotionMemoryHardware={},pinnedCount=0):number {
 const safe=sanitizeMotionMemory(s);
 const low=safe.profile==='pi'||(safe.profile==='auto'&&((hw.deviceMemoryGB!==undefined&&hw.deviceMemoryGB<=4)||(hw.logicalCores!==undefined&&hw.logicalCores<=4)));
 const large=safe.profile==='desktop'||(safe.profile==='auto'&&(hw.deviceMemoryGB??4)>=8&&(hw.logicalCores??4)>=6);
 const desired=low?4:large?10:6;
 const reduced=hw.reducedMotion?Math.min(desired,4):desired;
 // Pinned current/upcoming tracks must never be evicted, even above maxClips.
 return Math.max(pinnedCount,Math.max(safe.minClips,Math.min(safe.maxClips,reduced)));
}
export function recordMotionUse(ledger:MotionMemoryLedger,id:string,tick:number):MotionMemoryLedger {
 if(!id||!Number.isFinite(tick))return ledger;
 const old=ledger[id];
 return {...ledger,[id]:{uses:Math.min(10000,(old?.uses??0)+1),lastUsed:tick}};
}
/** Select cached entries to evict: oldest/least-used first, with pinned protection. */
export function chooseAdaptiveMotionEvictions(ids:string[],pinned:string[],capacity:number,ledger:MotionMemoryLedger,favorFrequentlyUsed=true):string[] {
 const unique=[...new Set(ids)];const protectedIds=new Set(pinned.filter(Boolean));
 const excess=Math.max(0,unique.length-Math.max(0,Math.floor(Number.isFinite(capacity)?capacity:0)));
 return unique.filter(id=>!protectedIds.has(id)).sort((a,b)=>{
  const sa=ledger[a],sb=ledger[b];
  if(favorFrequentlyUsed&&(sa?.uses??0)!==(sb?.uses??0))return (sa?.uses??0)-(sb?.uses??0);
  return (sa?.lastUsed??0)-(sb?.lastUsed??0)||a.localeCompare(b);
 }).slice(0,excess);
}
export function pruneMotionLedger(ledger:MotionMemoryLedger,keptIds:string[]):MotionMemoryLedger {
 const out:MotionMemoryLedger={};for(const id of keptIds)if(ledger[id])out[id]=ledger[id];return out;
}
export function readMotionMemoryHardware():MotionMemoryHardware {
 if(typeof navigator==='undefined')return {};
 const n=navigator as Navigator & {deviceMemory?:number};
 return {deviceMemoryGB:typeof n.deviceMemory==='number'?n.deviceMemory:undefined,logicalCores:typeof navigator.hardwareConcurrency==='number'?navigator.hardwareConcurrency:undefined,reducedMotion:typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false};
}
