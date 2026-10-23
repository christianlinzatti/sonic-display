/** V327: opt-in group-level rhythm accents for the existing 3/4-avatar V326 stage.
 * Never edits source clips, animation mixers, skeletal IK or stage-space formations.
 * Evaluation is deterministic at a supplied song clock, including backward seeks.
 */
export type GroupSyncModeV327='unison'|'stagger'|'call-response'|'alternating';
export type GroupSyncV327={enabled:boolean;mode:GroupSyncModeV327;accentStrength:number;staggerBeats:number;barsPerResponse:number;dropTogether:boolean;softBackground:number};
export type GroupSyncFrameV327={gains:number[];pulses:number[];beatIndex:number;activeSlot:number;source:'imported'|'bpm';playing:boolean};
export const GROUP_SYNC_KEY_V327='sonic-group-dance-sync-v327';
export const GROUP_SYNC_EVENT_V327='sonic:group-dance-sync-v327';
export const GROUP_SYNC_DEFAULT_V327:GroupSyncV327={enabled:false,mode:'unison',accentStrength:.72,staggerBeats:.25,barsPerResponse:2,dropTogether:true,softBackground:.36};
const beatValidationCache = new WeakMap<object,boolean>();
function validBeatSequence(beats:readonly number[]):boolean {
 const cached=beatValidationCache.get(beats);if(cached!==undefined)return cached;
 const ok=beats.length>0&&beats.length<=4500&&beats.every((x,i)=>Number.isFinite(x)&&x>=0&&(i===0||x>beats[i-1]));
 beatValidationCache.set(beats,ok);return ok;
}
const finite=(x:unknown,d:number)=>typeof x==='number'&&Number.isFinite(x)?x:d;
const clamp=(x:number,min:number,max:number)=>Math.min(max,Math.max(min,x));
export function normalizeGroupSyncV327(raw:unknown):GroupSyncV327{
 const r=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<GroupSyncV327>:{};
 return {enabled:r.enabled===true,
 mode:r.mode==='stagger'||r.mode==='call-response'||r.mode==='alternating'?r.mode:'unison',
 accentStrength:clamp(finite(r.accentStrength,.72),0,1),
 staggerBeats:clamp(finite(r.staggerBeats,.25),0,.75),
 barsPerResponse:Math.round(clamp(finite(r.barsPerResponse,2),1,8)),
 dropTogether:r.dropTogether!==false,
 softBackground:clamp(finite(r.softBackground,.36),0,1)};
}
/** A sorted, externally validated collection of beat starts, in seconds. Maximum 4500 entries.
 * Imported markers are optional. With no markers, use an explicitly labeled BPM estimate.
 */
export function evaluateGroupSyncV327(settings:GroupSyncV327,
 input:{seconds:number;bpm:number;count:3|4;focus:number;drop:boolean;playing:boolean;reducedMotion:boolean;beatTimes?:readonly number[];beatsPerBar?:number}):GroupSyncFrameV327{
 const n=input.count===3?3:4;
 const empty=()=>({gains:Array(n).fill(1),pulses:Array(n).fill(0),beatIndex:0,activeSlot:-1,source:'bpm' as const,playing:false});
 if(!settings.enabled||!input.playing||input.reducedMotion)return empty();
 const seconds=clamp(finite(input.seconds,0),0,7200);
 const bpm=clamp(finite(input.bpm,120),40,260),beatLength=60/bpm;
 const beats=input.beatTimes;
 let beatIndex=0,beatAt=0,period=beatLength,source:'imported'|'bpm'='bpm';
 if(beats&&validBeatSequence(beats)){
  // Binary search; before the first imported beat, continue the fallback grid.
  if(seconds>=beats[0]){
   let lo=0,hi=beats.length;
   while(lo<hi){const mid=(lo+hi)>>>1;if(beats[mid]<=seconds)lo=mid+1;else hi=mid;}
   beatIndex=Math.max(0,lo-1);beatAt=beats[beatIndex];
   const next=beats[beatIndex+1],prev=beats[beatIndex-1];
   period=clamp(finite(next,NaN)>beatAt?next-beatAt:beatIndex>0?beatAt-prev:beatLength,.2,2);
   // Do not extrapolate pulses indefinitely beyond the last verified beat.
   if(beatIndex<beats.length-1||seconds-beatAt<=period*1.5)source='imported';
   else {beatIndex=Math.floor(seconds/beatLength);beatAt=beatIndex*beatLength;period=beatLength;}
  }else{beatIndex=Math.floor(seconds/beatLength);beatAt=beatIndex*beatLength;}
 }else{beatIndex=Math.floor(seconds/beatLength);beatAt=beatIndex*beatLength;}
 const meter=Math.round(clamp(finite(input.beatsPerBar,4),1,12));
 const barsPerResponse=settings.barsPerResponse;
 const cycle=Math.floor(beatIndex/(meter*barsPerResponse));
 const activeSlot=input.focus>=0&&input.focus<n?input.focus:cycle%n;
 const pulseAt=(offset:number)=>{
  // A stagger can only delay the current accent; never anticipate a future beat.
  const elapsed=seconds-beatAt-offset*period;
  return elapsed<0?0:clamp(1-elapsed/(period*.56),0,1);
 };
 const pulses=Array.from({length:n},(_,i)=>{
  const delayed=settings.mode==='stagger'?i*settings.staggerBeats:0;
  return pulseAt(delayed);
 });
 const gains=Array.from({length:n},(_,i)=>{
  const base=settings.mode==='unison'||settings.mode==='stagger'?1:
   settings.mode==='alternating'?(i===beatIndex%n?1:settings.softBackground):
   (i===activeSlot?1:settings.softBackground);
  const boost=input.drop&&settings.dropTogether?1:
   input.focus>=0&&input.focus<n&&i!==input.focus?Math.max(settings.softBackground,base*.85):base;
  return clamp((1-settings.accentStrength)+settings.accentStrength*boost,0,1);
 });
 return {gains,pulses,beatIndex,activeSlot,source,playing:true};
}
export function readGroupSyncV327():GroupSyncV327{
 if(typeof window==='undefined')return {...GROUP_SYNC_DEFAULT_V327};
 try{return normalizeGroupSyncV327(JSON.parse(window.localStorage.getItem(GROUP_SYNC_KEY_V327)||'null'));}catch{return {...GROUP_SYNC_DEFAULT_V327};}
}
export function writeGroupSyncV327(raw:unknown):GroupSyncV327{
 const value=normalizeGroupSyncV327(raw);
 if(typeof window!=='undefined'){
  try{window.localStorage.setItem(GROUP_SYNC_KEY_V327,JSON.stringify(value));}catch{/* unavailable storage */}
  window.dispatchEvent(new Event(GROUP_SYNC_EVENT_V327));
 }
 return value;
}
