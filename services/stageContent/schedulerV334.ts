/** V334: bounded, deterministic content scheduler. All policy data stays client-side; API secrets remain server-side. */
import type {StageContentSourceV330,StageContentV330} from './stageContentV330';
import type {ContentScreenV333} from './layoutV333';
export type SectionV334='verse'|'hook'|'drop'|'build'|'break';
export const SECTIONS_V334:SectionV334[]=['verse','hook','drop','build','break'];
export const SOURCES_V334:StageContentSourceV330[]=['canvas','cover','text','photos','concerts'];
export interface RuleV334 { enabled:boolean; priority:number; durationSeconds:number; sections:SectionV334[]; }
export interface SchedulerV334 { enabled:boolean; screens:Record<string,Partial<Record<StageContentSourceV330,RuleV334>>>; }
export const SCHEDULER_KEY_V334='sonic-stage-content-scheduler-v334';
export const SCHEDULER_EVENT_V334='sonic:stage-content-scheduler-v334';
export const DEFAULT_SCHEDULER_V334:SchedulerV334={enabled:false,screens:{}};
const baseline:Record<StageContentSourceV330,RuleV334>={
 canvas:{enabled:true,priority:2,durationSeconds:18,sections:[...SECTIONS_V334]},
 cover:{enabled:true,priority:1,durationSeconds:10,sections:[...SECTIONS_V334]},
 text:{enabled:true,priority:2,durationSeconds:12,sections:[...SECTIONS_V334]},
 photos:{enabled:true,priority:2,durationSeconds:12,sections:[...SECTIONS_V334]},
 concerts:{enabled:true,priority:1,durationSeconds:20,sections:[...SECTIONS_V334]},
};
const isRecord=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const clamp=(x:unknown,def:number,min:number,max:number)=>typeof x==='number'&&Number.isFinite(x)?Math.max(min,Math.min(max,Math.round(x))):def;
export function sanitizeRuleV334(raw:unknown,source:StageContentSourceV330):RuleV334 {
 const b=baseline[source];if(!isRecord(raw))return {...b,sections:[...b.sections]};
 const inputSections=raw.sections;
 const sections=Array.isArray(inputSections)?SECTIONS_V334.filter(section=>inputSections.includes(section)):[...b.sections];
 return {enabled:raw.enabled!==false,priority:clamp(raw.priority,b.priority,0,3),durationSeconds:clamp(raw.durationSeconds,b.durationSeconds,3,120),sections};
}
export function sanitizeSchedulerV334(raw:unknown):SchedulerV334 {
 if(!isRecord(raw))return {enabled:false,screens:{}};
 const screens:SchedulerV334['screens']={};
 if(isRecord(raw.screens))Object.entries(raw.screens).slice(0,20).forEach(([id,value])=>{
  if(!/^[a-zA-Z0-9_-]{1,32}$/.test(id)||!isRecord(value))return;
  const bySource:Partial<Record<StageContentSourceV330,RuleV334>>={};
  for(const source of SOURCES_V334)if(value[source]!==undefined)bySource[source]=sanitizeRuleV334(value[source],source);
  screens[id]=bySource;
 });
 return {enabled:raw.enabled===true,screens};
}
export function readSchedulerV334():SchedulerV334 {
 if(typeof window==='undefined')return sanitizeSchedulerV334(null);
 try{return sanitizeSchedulerV334(JSON.parse(localStorage.getItem(SCHEDULER_KEY_V334)||'null'));}catch{return sanitizeSchedulerV334(null);}
}
export function saveSchedulerV334(value:SchedulerV334):SchedulerV334 {
 const clean=sanitizeSchedulerV334(value);
 if(typeof window!=='undefined'){try{localStorage.setItem(SCHEDULER_KEY_V334,JSON.stringify(clean));}catch{}window.dispatchEvent(new Event(SCHEDULER_EVENT_V334));}
 return clean;
}
export const getRuleV334=(settings:SchedulerV334,screenId:string,source:StageContentSourceV330)=>sanitizeRuleV334(settings.screens[screenId]?.[source],source);
/** Weighted interleaving: high priority occurs more often, low priority is never excluded. */
export function scheduleSlotsV334(screen:ContentScreenV333,slides:StageContentV330[],settings:SchedulerV334,section:SectionV334){
 const available=slides.filter(s=>screen.source==='rotation'||s.source===screen.source).filter(s=>{
  const rule=getRuleV334(settings,screen.id,s.source);
  return rule.enabled&&rule.sections.includes(section);
 });
 const result:{slide:StageContentV330;durationSeconds:number}[]=[];
 for(let weight=0;weight<4;weight++)for(const slide of available){
  const rule=getRuleV334(settings,screen.id,slide.source);
  if(rule.priority>=weight)result.push({slide,durationSeconds:rule.durationSeconds});
 }
 return result;
}
/** Selects by elapsed time in seconds. Rollover and seek are deterministic, no frame-level work required. */
export function chooseScheduledV334(screen:ContentScreenV333,slides:StageContentV330[],settings:SchedulerV334,section:SectionV334,elapsedSeconds:number):StageContentV330|null {
 const slots=scheduleSlotsV334(screen,slides,settings,section);
 if(!slots.length)return null;
 const total=slots.reduce((sum,s)=>sum+s.durationSeconds,0);
 let cursor=(Number.isFinite(elapsedSeconds)?Math.max(0,elapsedSeconds):0)%total;
 for(const slot of slots){if(cursor<slot.durationSeconds)return slot.slide;cursor-=slot.durationSeconds;}
 return slots[0].slide;
}
