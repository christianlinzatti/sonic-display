/** V235 – bounded opt-in choreography context memory. No track/audio content is stored. */
import type {TimelinePhase} from "./musicStructureTimeline";
import type {InstalledCharacterMotion} from "./characterMotionLibrary";
export const CONTEXT_MEMORY_EVENT="sonic:choreography-context-v235";
const KEY="sonic.choreography.context.v235";
export type ContextRecord={avatarId:string;motionId:string;phase:TimelinePhase;genre:string;bpmBand:number;uses:number;last:number};
export type ContextMemory={enabled:boolean;learn:boolean;avoidRepeats:boolean;history:string[];records:ContextRecord[]};
export const DEFAULT_CONTEXT_MEMORY:ContextMemory={enabled:false,learn:false,avoidRepeats:true,history:[],records:[]};
const valid=(s:unknown):s is string=>typeof s==="string"&&s.length>0&&s.length<=160&&/^[\w: .-]+$/.test(s);
const integer=(n:unknown,min:number,max:number,def:number)=>typeof n==="number"&&Number.isFinite(n)?Math.max(min,Math.min(max,Math.floor(n))):def;
export function bpmBand(bpm:number):number{return Number.isFinite(bpm)&&bpm>=40&&bpm<=250?Math.round(bpm/20)*20:0;}
export function sanitizeContextMemory(raw:unknown):ContextMemory {
 const v=raw&&typeof raw==="object"?raw as Record<string,unknown>:{};
 const records:ContextRecord[]=[];
 if(Array.isArray(v.records))for(const r of v.records.slice(-240)){
  if(!r||typeof r!=="object")continue;const x=r as Record<string,unknown>;
  if(!valid(x.avatarId)||!valid(x.motionId)||!["verse","build","drop","break"].includes(String(x.phase)))continue;
  records.push({avatarId:x.avatarId,motionId:x.motionId,phase:x.phase as TimelinePhase,genre:valid(x.genre)?x.genre.toLowerCase().slice(0,50):"",bpmBand:integer(x.bpmBand,0,260,0),uses:integer(x.uses,1,1000,1),last:integer(x.last,0,1000000000,0)});
 }
 return {enabled:v.enabled===true,learn:v.learn===true,avoidRepeats:v.avoidRepeats!==false,history:Array.isArray(v.history)?v.history.filter(valid).slice(-8):[],records:records.slice(-160)};
}
export function loadContextMemory():ContextMemory {if(typeof window==="undefined")return {...DEFAULT_CONTEXT_MEMORY};try{return sanitizeContextMemory(JSON.parse(window.localStorage.getItem(KEY)||"null"));}catch{return {...DEFAULT_CONTEXT_MEMORY};}}
export function saveContextMemory(v:ContextMemory):ContextMemory {const safe=sanitizeContextMemory(v);if(typeof window!=="undefined")try{localStorage.setItem(KEY,JSON.stringify(safe));window.dispatchEvent(new Event(CONTEXT_MEMORY_EVENT));}catch{}return safe;}
/** Called only on observed musical phase boundaries, not on each animation frame. */
export function observeContextMemory(s:ContextMemory,ctx:{avatarId:string;motionId:string;phase:TimelinePhase;genre:string;bpm:number}):ContextMemory {
 if(!s.learn||!valid(ctx.avatarId)||!valid(ctx.motionId))return s;
 const genre=ctx.genre.toLowerCase().trim().slice(0,50),band=bpmBand(ctx.bpm);
 const records=s.records.slice();const index=records.findIndex(r=>r.avatarId===ctx.avatarId&&r.motionId===ctx.motionId&&r.phase===ctx.phase&&r.genre===genre&&r.bpmBand===band);
 const last=Math.max(0,...records.map(r=>r.last))+1;
 if(index>=0)records[index]={...records[index],uses:Math.min(1000,records[index].uses+1),last};
 else records.push({avatarId:ctx.avatarId,motionId:ctx.motionId,phase:ctx.phase,genre,bpmBand:band,uses:1,last});
 return {...s,records:records.slice(-160),history:[...s.history,ctx.motionId].slice(-8)};
}
/** Prefer diverse, evidenced clips, but never override explicit manual assignments. */
export function rankContextMotions(s:ContextMemory,ctx:{avatarId:string;phase:TimelinePhase;genre:string;bpm:number},motions:InstalledCharacterMotion[]):InstalledCharacterMotion|undefined {
 if(!s.enabled)return undefined;
 const genre=ctx.genre.toLowerCase().trim(),band=bpmBand(ctx.bpm);
 const candidates=motions.filter(m=>m.avatarId===ctx.avatarId);if(!candidates.length)return undefined;
 const scores=candidates.map(m=>{
  const rows=s.records.filter(r=>r.avatarId===ctx.avatarId&&r.motionId===m.id&&r.phase===ctx.phase&&(!genre||r.genre===genre||r.genre==="")&&(band===0||r.bpmBand===0||Math.abs(r.bpmBand-band)<=20));
  const count=rows.reduce((n,r)=>n+r.uses,0);
  const last=s.history.slice(-3).lastIndexOf(m.id);
  const penalty=s.avoidRepeats&&last>=0?last===2?0.75:0.45:0;
  return {motion:m,count,score:Math.log1p(count)-penalty};
 });
 // No confidence from one observation; leave normal choreography logic untouched.
 const eligible=scores.filter(x=>x.count>=3).sort((a,b)=>b.score-a.score||a.motion.id.localeCompare(b.motion.id));
 return eligible[0]?.motion;
}
