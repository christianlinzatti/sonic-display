import {loadContextMemory,rankContextMotions} from "./choreographyContextMemory";
/** V196: Opt-in locally learned choreography preferences, not a Spotify song prediction. */
import type {TimelinePhase,TimelineObservation} from "./musicStructureTimeline";
import type {InstalledCharacterMotion} from "./characterMotionLibrary";
export const ADAPTIVE_CHOREOGRAPHY_EVENT="sonic:adaptive-choreography-changed";
const KEY="sonic.adaptive.choreography.v196";
export type PhaseAssignments=Partial<Record<TimelinePhase,string>>;
export type PhaseCount={avatarId:string;phase:TimelinePhase;motionId:string;count:number};
export type AdaptiveChoreographyState={version:1;enabled:boolean;learn:boolean;assignments:Record<string,PhaseAssignments>;counts:PhaseCount[]};
export const EMPTY_ADAPTIVE_STATE:AdaptiveChoreographyState={version:1,enabled:false,learn:false,assignments:{},counts:[]};
export const PHASES:TimelinePhase[]=["verse","build","drop","break"];
const validId=(s:unknown):s is string=>typeof s==="string"&&/^[\w:-]{1,160}$/.test(s);
export function sanitizeAdaptiveState(raw:unknown):AdaptiveChoreographyState {
 if(!raw||typeof raw!=="object")return {...EMPTY_ADAPTIVE_STATE,assignments:{},counts:[]};
 const x=raw as Record<string,unknown>;const assignments:Record<string,PhaseAssignments>={};
 if(x.assignments&&typeof x.assignments==="object")for(const [avatar,v] of Object.entries(x.assignments).slice(0,100)){
  if(!validId(avatar)||!v||typeof v!=="object")continue;
  const a:PhaseAssignments={};for(const p of PHASES){const id=(v as Record<string,unknown>)[p];if(validId(id))a[p]=id;}
  assignments[avatar]=a;
 }
 const counts:PhaseCount[]=[];
 if(Array.isArray(x.counts))for(const v of x.counts.slice(-1000)){
  if(!v||typeof v!=="object")continue;const c=v as Record<string,unknown>;
  if(validId(c.avatarId)&&validId(c.motionId)&&PHASES.includes(c.phase as TimelinePhase)&&Number.isFinite(c.count)){
   const count=Math.min(10000,Math.max(0,Math.floor(Number(c.count))));
   if(count>0)counts.push({avatarId:c.avatarId,phase:c.phase as TimelinePhase,motionId:c.motionId,count});
  }
 }
 return {version:1,enabled:x.enabled===true,learn:x.learn===true,assignments,counts:counts.slice(-500)};
}
export function loadAdaptiveState():AdaptiveChoreographyState {
 if(typeof window==="undefined")return sanitizeAdaptiveState(null);
 try{return sanitizeAdaptiveState(JSON.parse(window.localStorage.getItem(KEY)||"null"));}catch{return sanitizeAdaptiveState(null);}
}
export function saveAdaptiveState(state:AdaptiveChoreographyState):AdaptiveChoreographyState {
 const safe=sanitizeAdaptiveState(state);
 if(typeof window!=="undefined"){
  try{window.localStorage.setItem(KEY,JSON.stringify(safe));window.dispatchEvent(new Event(ADAPTIVE_CHOREOGRAPHY_EVENT));}catch{/* Storage may be disabled */}
 }
 return safe;
}
/** Count a phase once per segment change, rather than rewarding every audio frame. */
export function learnFromObservation(state:AdaptiveChoreographyState,obs:TimelineObservation,motions:InstalledCharacterMotion[]):AdaptiveChoreographyState {
 if(!state.learn||!obs.avatarId||obs.evidence.confidence<0.55)return state;
 const matched=motions.find(m=>m.avatarId===obs.avatarId&&m.name===obs.motion);
 if(!matched)return state;
 const counts=state.counts.slice();const at=counts.findIndex(c=>c.avatarId===obs.avatarId&&c.phase===obs.phase&&c.motionId===matched.id);
 if(at>=0)counts[at]={...counts[at],count:Math.min(10000,counts[at].count+1)};
 else counts.push({avatarId:obs.avatarId,phase:obs.phase,motionId:matched.id,count:1});
 return {...state,counts:counts.slice(-500)};
}
/** Manual mapping takes precedence; automatic learning requires 3 independent samples and 60% support. */
export function resolveAdaptiveMotion(state:AdaptiveChoreographyState,avatarId:string,phase:TimelinePhase,motions:InstalledCharacterMotion[],context?:{genre:string;bpm:number}):InstalledCharacterMotion|undefined {
 if(!state.enabled)return undefined;
 const candidates=motions.filter(m=>m.avatarId===avatarId);
 const manual=state.assignments[avatarId]?.[phase];
 if(manual){const found=candidates.find(m=>m.id===manual);if(found)return found;}
 const memoryChoice=context?rankContextMotions(loadContextMemory(),{avatarId,phase,...context},candidates):undefined;
 if(memoryChoice)return memoryChoice;
 const counts=state.counts.filter(c=>c.avatarId===avatarId&&c.phase===phase&&candidates.some(m=>m.id===c.motionId));
 const total=counts.reduce((n,c)=>n+c.count,0);
 if(total<3)return undefined;
 const best=counts.slice().sort((a,b)=>b.count-a.count)[0];
 return best&&best.count/total>=0.6?candidates.find(m=>m.id===best.motionId):undefined;
}
