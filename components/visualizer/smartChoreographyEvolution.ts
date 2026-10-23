/** V198 – deterministic, bounded, locally configured sequences of installed motion IDs. */
import type {InstalledCharacterMotion} from "./characterMotionLibrary";
import type {TimelinePhase} from "./musicStructureTimeline";
export const EVOLUTION_EVENT="sonic:choreography-evolution-changed";
const KEY="sonic.choreography.evolution.v198";
export type EvolutionStep={motionId:string;bars:number;crossfade?:number};
export type EvolutionState={version:1;enabled:boolean;sequences:Record<string,Partial<Record<TimelinePhase,EvolutionStep[]>>>};
export const EMPTY_EVOLUTION:EvolutionState={version:1,enabled:false,sequences:{}};
const PHASES:TimelinePhase[]=["verse","build","drop","break"];
const idOk=(x:unknown):x is string=>typeof x==="string"&&/^[\w:-]{1,160}$/.test(x);
export function sanitizeEvolution(raw:unknown):EvolutionState {
 const data=raw&&typeof raw==="object"?raw as Record<string,unknown>:{};
 const sequences:EvolutionState["sequences"]={};
 const input=data.sequences&&typeof data.sequences==="object"?data.sequences as Record<string,unknown>:{};
 for(const [avatar,phases] of Object.entries(input).slice(0,100)){
  if(!idOk(avatar)||!phases||typeof phases!=="object")continue;
  const result:Partial<Record<TimelinePhase,EvolutionStep[]>>={};
  for(const phase of PHASES){const steps=(phases as Record<string,unknown>)[phase];if(!Array.isArray(steps))continue;
   const valid=steps.slice(0,12).filter((x):x is Record<string,unknown>=>!!x&&typeof x==="object"&&idOk(x.motionId)).map(x=>({motionId:String(x.motionId),bars:Math.max(1,Math.min(16,Math.round(Number(x.bars)||2))),...(Number.isFinite(Number(x.crossfade))?{crossfade:Math.max(0.1,Math.min(4,Number(x.crossfade)))}:{})}));
   if(valid.length)result[phase]=valid;
  }
  if(Object.keys(result).length)sequences[avatar]=result;
 }
 return {version:1,enabled:data.enabled===true,sequences};
}
export function readEvolution():EvolutionState {if(typeof window==="undefined")return sanitizeEvolution(null);try{return sanitizeEvolution(JSON.parse(localStorage.getItem(KEY)||"null"));}catch{return sanitizeEvolution(null);}}
export function writeEvolution(input:EvolutionState):EvolutionState {const state=sanitizeEvolution(input);if(typeof window!=="undefined")try{localStorage.setItem(KEY,JSON.stringify(state));window.dispatchEvent(new Event(EVOLUTION_EVENT));}catch{}return state;}
/** Build a repeatable 3-step playlist; manual phase mapping is handled separately by V196. */
export function suggestEvolution(motions:InstalledCharacterMotion[],phase:TimelinePhase,genre:string):EvolutionStep[] {
 const matches=motions.filter(m=>(!genre||!m.genre||m.genre.toLowerCase()===genre.toLowerCase())&&(m.section==="any"||m.section===phase));
 const pool=matches.length?matches:motions.filter(m=>!genre||!m.genre||m.genre.toLowerCase()===genre.toLowerCase());
 if(!pool.length)return [];
 return Array.from({length:Math.min(3,pool.length)},(_,i)=>({motionId:pool[i].id,bars:phase==="drop"?2:4}));
}
/** Advance using the observed audio clock, not imaginary future Spotify features. */
export function selectEvolutionStep(state:EvolutionState,avatarId:string,phase:TimelinePhase,motions:InstalledCharacterMotion[],secondsSincePhase:number,bpm:number|undefined,beatsPerBar=4):InstalledCharacterMotion|undefined {
 if(!state.enabled)return undefined;
 const steps=(state.sequences[avatarId]?.[phase]||[]).filter(s=>motions.some(m=>m.id===s.motionId&&m.avatarId===avatarId));
 if(!steps.length)return undefined;
 const secondsPerBar=Number.isFinite(bpm)&&bpm!>=50&&bpm!<=240?60/bpm!*Math.max(1,Math.min(16,beatsPerBar)):2;
 const cycle=steps.reduce((n,s)=>n+s.bars*secondsPerBar,0);
 const at=((Math.max(0,secondsSincePhase)%cycle)+cycle)%cycle;
 let elapsed=0;
 for(const step of steps){elapsed+=step.bars*secondsPerBar;if(at<elapsed)return motions.find(m=>m.id===step.motionId);}
 return motions.find(m=>m.id===steps[0].motionId);
}

/** V199: sequence selection by integrated beat count, stable across pauses and tempo changes. */
export function selectEvolutionByBeat(state:EvolutionState,avatarId:string,phase:TimelinePhase,motions:InstalledCharacterMotion[],phaseBeat:number,beatsPerBar=4):InstalledCharacterMotion|undefined {
 if(!state.enabled)return undefined;
 const steps=(state.sequences[avatarId]?.[phase]||[]).filter(s=>motions.some(m=>m.id===s.motionId&&m.avatarId===avatarId));
 if(!steps.length)return undefined;
 const total=steps.reduce((n,s)=>n+s.bars,0);
 const bar=Math.floor(Math.max(0,phaseBeat)/Math.max(1,Math.min(16,beatsPerBar)))%total;
 let cumulative=0;
 for(const step of steps){cumulative+=step.bars;if(bar<cumulative)return motions.find(m=>m.id===step.motionId);}
 return undefined;
}

/** V203: Crossfade belongs to the incoming timeline step; older saves use fallback. */
export function resolveEvolutionCrossfade(state:EvolutionState,avatarId:string,phase:TimelinePhase,motionId:string,phaseBeat:number,beatsPerBar=4):number|undefined {
 if(!state.enabled)return undefined;
 const steps=state.sequences[avatarId]?.[phase]??[];
 if(!steps.length)return undefined;
 const total=steps.reduce((n,s)=>n+s.bars,0);if(!total)return undefined;
 const bar=Math.floor(Math.max(0,phaseBeat)/Math.max(1,Math.min(16,beatsPerBar)))%total;
 let cursor=0;for(const step of steps){cursor+=step.bars;if(bar<cursor)return step.motionId===motionId?step.crossfade:undefined;}
 return undefined;
}
