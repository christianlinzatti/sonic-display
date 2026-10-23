/** V328: opt-in clip-phase controller for an ensemble of 3-4 isolated GLB mixers.
 * The beat clock is absolute, so every slot seeks to a deterministic clip phase.
 * Imported song beat timestamps are authoritative only with a song-bound clock.
 * Does not alter original clips, clip tracks or the Foot-IK solver. */
export type MotionSyncV328={enabled:boolean;beatCycle:1|2|4|8|16;phaseOffsets:number[];clipIndexes:number[];phaseOrigin:number;mode:'cycle'|'absolute';};
export const MOTION_SYNC_KEY_V328='sonic-ensemble-motion-sync-v328';
export const MOTION_SYNC_EVENT_V328='sonic:ensemble-motion-sync-v328';
export const MOTION_SYNC_DEFAULT_V328:MotionSyncV328={enabled:false,beatCycle:4,phaseOffsets:[0,0,0,0],clipIndexes:[-1,-1,-1,-1],phaseOrigin:0,mode:'cycle'};
const finite=(n:unknown,d:number):number=>typeof n==='number'&&Number.isFinite(n)?n:d;
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const wrap=(n:number,m:number)=>(n%m+m)%m;
// Immutable V318 analysis arrays are reused between frames. Validate once, not
// four full scans per 3D frame (one per dancer).
const markerValidityV328=new WeakMap<object,boolean>();
function validMarkersV328(markers:readonly number[]):boolean{
 const found=markerValidityV328.get(markers);if(found!==undefined)return found;
 const valid=markers.length>=2&&markers.every((b,i)=>Number.isFinite(b)&&(i===0||b>markers[i-1]));
 markerValidityV328.set(markers,valid);return valid;
}
function beatAtV328(markers:readonly number[],seconds:number):number{
 let lo=0,hi=markers.length-2;
 while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(markers[mid]<=seconds)lo=mid;else hi=mid-1;}
 const ix=Math.min(lo,markers.length-2);
 return ix+clamp((seconds-markers[ix])/(markers[ix+1]-markers[ix]),0,1);
}
export function normalizeMotionSyncV328(value:unknown):MotionSyncV328{
 const v=value&&typeof value==='object'&&!Array.isArray(value)?value as Partial<MotionSyncV328>:{};
 const cycle:[1,2,4,8,16]=[1,2,4,8,16];
 return {enabled:v.enabled===true,beatCycle:cycle.includes(v.beatCycle as 1)?v.beatCycle as MotionSyncV328['beatCycle']:4,
 phaseOffsets:Array.from({length:4},(_,i)=>Math.round(clamp(finite(Array.isArray(v.phaseOffsets)?v.phaseOffsets[i]:0,0),-8,8)*100)/100),
 clipIndexes:Array.from({length:4},(_,i)=>Math.round(clamp(finite(Array.isArray(v.clipIndexes)?v.clipIndexes[i]:-1,-1),-1,63))),
 phaseOrigin:Math.round(clamp(finite(v.phaseOrigin,0),0,3600)*100)/100,
 mode:v.mode==='absolute'?'absolute':'cycle'};
}
export function readMotionSyncV328():MotionSyncV328{
 if(typeof window==='undefined')return normalizeMotionSyncV328(MOTION_SYNC_DEFAULT_V328);
 try{return normalizeMotionSyncV328(JSON.parse(window.localStorage.getItem(MOTION_SYNC_KEY_V328)||'null'));}
 catch{return normalizeMotionSyncV328(MOTION_SYNC_DEFAULT_V328);}
}
export function writeMotionSyncV328(value:unknown):MotionSyncV328{
 const v=normalizeMotionSyncV328(value);
 if(typeof window!=='undefined'){
  try{window.localStorage.setItem(MOTION_SYNC_KEY_V328,JSON.stringify(v));}catch{/* privacy mode */}
  window.dispatchEvent(new Event(MOTION_SYNC_EVENT_V328));
 }
 return v;
}
/** Exported so preview and actual mixers use identical phase math. */
export type MotionSyncClockV328={enabled:boolean;seconds:number;bpm:number;beatTimes?:readonly number[];playing:boolean;reducedMotion:boolean;duration?:number;slot:number};
export type MotionPhaseV328={time:number;fraction:number;beat:number;source:'imported'|'bpm';};
export function phaseForClipV328(settings:MotionSyncV328,clock:MotionSyncClockV328,duration:number):MotionPhaseV328|null{
 if(!settings.enabled||!clock.enabled||!clock.playing||clock.reducedMotion||!Number.isFinite(duration)||duration<=.001||!Number.isFinite(clock.seconds))return null;
 const origin=settings.phaseOrigin,seconds=clock.seconds;
 const bpm=clamp(finite(clock.bpm,120),40,240);
 let beats=(seconds-origin)*bpm/60,source:MotionPhaseV328['source']='bpm';
 const markers=clock.beatTimes;
 // Don't extrapolate imported markers outside of their true range.
 if(markers&&seconds>=markers[0]&&seconds<=markers[markers.length-1]&&validMarkersV328(markers)){
  const importedOrigin=origin>=markers[0]&&origin<=markers[markers.length-1]
   ?beatAtV328(markers,origin):origin*bpm/60;
  beats=beatAtV328(markers,seconds)-importedOrigin;
  source='imported';
 }
 const slot=clamp(Math.round(finite(clock.slot,0)),0,3);
 const offset=settings.phaseOffsets[slot];
 const beat=beats+offset;
 const fraction=wrap(beat,settings.beatCycle)/settings.beatCycle;
 // 'absolute': clip progresses in real seconds after start; 'cycle': a single
 // clip period maps to N beats, synchronizing different-duration GLB clips.
 const time=settings.mode==='absolute'?wrap((seconds-origin)+(offset*60/bpm),duration):fraction*duration;
 return {time:Math.min(duration-.0001,Math.max(0,time)),fraction,beat,source};
}
