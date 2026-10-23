/** V212: bounded, deterministic per-avatar motion lookahead. No guessed asset URLs. */
import type {EvolutionState} from './smartChoreographyEvolution';
import type {InstalledCharacterMotion} from './characterMotionLibrary';
import type {TimelinePhase} from './musicStructureTimeline';
export const MOTION_PREFETCH_EVENT='sonic:motion-prefetch-v212-changed';
const KEY='sonic.motion.prefetch.v212';
export type MotionPrefetchSettings={enabled:boolean;aheadSteps:number;cacheSize:number;concurrency:number};
export const DEFAULT_MOTION_PREFETCH:MotionPrefetchSettings={enabled:false,aheadSteps:2,cacheSize:6,concurrency:2};
const clamp=(v:unknown,fallback:number,min:number,max:number)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Math.round(Number(v)))):fallback;
export function sanitizeMotionPrefetch(input:unknown):MotionPrefetchSettings {
 const o=input&&typeof input==='object'?input as Record<string,unknown>:{};
 return {enabled:o.enabled===true,aheadSteps:clamp(o.aheadSteps,2,1,4),cacheSize:clamp(o.cacheSize,6,3,12),concurrency:clamp(o.concurrency,2,1,3)};
}
export function readMotionPrefetch():MotionPrefetchSettings{
 if(typeof window==='undefined')return {...DEFAULT_MOTION_PREFETCH};
 try{return sanitizeMotionPrefetch(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{return {...DEFAULT_MOTION_PREFETCH};}
}
export function writeMotionPrefetch(s:MotionPrefetchSettings):MotionPrefetchSettings{
 const safe=sanitizeMotionPrefetch(s);
 if(typeof window!=='undefined')try{localStorage.setItem(KEY,JSON.stringify(safe));window.dispatchEvent(new Event(MOTION_PREFETCH_EVENT));}catch{}
 return safe;
}
export type PrefetchTarget={id:string;url:string};
/** Current motion first, then the next distinct clips in timeline order. */
export function planMotionPrefetch(evolution:EvolutionState,avatarId:string,phase:TimelinePhase,motions:InstalledCharacterMotion[],beat:number,aheadSteps=2,beatsPerBar=4):PrefetchTarget[]{
 if(!evolution.enabled||!Number.isFinite(beat)||beat<0)return [];
 const steps=evolution.sequences[avatarId]?.[phase]??[];
 const eligible=new Map(motions.filter(m=>m.avatarId===avatarId&&!!m.url).map(m=>[m.id,m]));
 const filtered=steps.filter(s=>eligible.has(s.motionId)&&Number.isFinite(s.bars)&&s.bars>0);
 const total=filtered.reduce((n,s)=>n+s.bars,0);if(!total)return [];
 const bar=Math.floor(beat/Math.max(1,beatsPerBar))%total;
 let cursor=0,index=0;
 for(let i=0;i<filtered.length;i++){cursor+=filtered[i].bars;if(bar<cursor){index=i;break;}}
 const result:PrefetchTarget[]=[];const seen=new Set<string>();
 for(let j=0;j<filtered.length&&result.length<clamp(aheadSteps,2,1,4)+1;j++){
  const motion=eligible.get(filtered[(index+j)%filtered.length].motionId)!;
  if(!seen.has(motion.id)){seen.add(motion.id);result.push({id:motion.id,url:motion.url});}
 }
 return result;
}
/** Evict only unpinned older clips; never remove the current/next dance cue. */
export function choosePrefetchEvictions(order:string[],pinned:string[],limit:number):string[]{
 const keep=new Set(pinned);let count=order.length;const removed:string[]=[];
 for(const id of order){if(count<=Math.max(3,limit))break;if(!keep.has(id)){removed.push(id);count--;}}
 return removed;
}

/** V214: only recompute a prefetch plan when its inputs or musical bar change.
 * Object identities are compared deliberately: changed libraries/timelines invalidate
 * the plan immediately, while frame-by-frame beat changes within a bar are ignored.
 */
export type MotionPlanSnapshot={
 evolution:EvolutionState;motions:InstalledCharacterMotion[];avatarId:string;
 phase:TimelinePhase;aheadSteps:number;bar:number;
};
export function shouldReplanMotionPrefetch(previous:MotionPlanSnapshot|undefined,next:MotionPlanSnapshot):boolean {
 return !previous||previous.evolution!==next.evolution||previous.motions!==next.motions||
 previous.avatarId!==next.avatarId||previous.phase!==next.phase||
 previous.aheadSteps!==next.aheadSteps||previous.bar!==next.bar;
}
