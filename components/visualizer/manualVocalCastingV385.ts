import type {Lyrics} from "@/types/music";
import type {DuetInteractionV376} from "./interactiveVocalDuetsV376";

/** User-authored, per-track visual stage cast. Never represents detected human speakers. */
export type VocalRoleV385="lead"|"feature"|"hook";
export type VocalAssignmentV385={fromLine:number;toLine:number;role:VocalRoleV385;slot:number};
export type VocalCueV385={active:boolean;role:VocalRoleV385|null;lineIndex:number;leadSlot:number;
  singingSlots:number[];startMs:number;endMs:number;handoffFrom:number|null;
  phase:number;source:"line-timed"|"word-timed"|"none";count:number};
const clamp=(v:number,a:number,b:number)=>Number.isFinite(v)?Math.max(a,Math.min(b,v)):a;
const empty=(count:number):VocalCueV385=>({active:false,role:null,lineIndex:-1,leadSlot:0,
  singingSlots:[],startMs:0,endMs:0,handoffFrom:null,phase:1,source:"none",count});
/** Persist bounded, plain JSON values only; ignore malformed and unknown assignments. */
export function normalizeVocalAssignmentsV385(raw:unknown,lineCount:number):VocalAssignmentV385[]{
 if(!Array.isArray(raw))return [];
 const max=Math.max(0,Math.min(2000,Math.trunc(lineCount)));
 return raw.slice(0,100).filter((r):r is Record<string,unknown>=>!!r&&typeof r==="object"&&!Array.isArray(r))
 .filter(r=>Number.isInteger(r.fromLine)&&Number.isInteger(r.toLine)&&Number.isInteger(r.slot)&&
  (r.role==="lead"||r.role==="feature"||r.role==="hook")&&
  (r.fromLine as number)>=0&&(r.toLine as number)>=(r.fromLine as number)&&
  (r.toLine as number)<max&&(r.slot as number)>=0&&(r.slot as number)<4)
 .map(r=>({fromLine:r.fromLine as number,toLine:r.toLine as number,
  role:r.role as VocalRoleV385,slot:r.slot as number}));
}
function atLine(segments:readonly VocalAssignmentV385[],i:number,count:number){
 // Last saved segment takes precedence, allowing a corrected line to override a longer verse.
 for(let s=Math.min(segments.length,100)-1;s>=0;s--){
   const a=segments[s];
   if(!a||!Number.isInteger(a.fromLine)||!Number.isInteger(a.toLine)||
     !Number.isInteger(a.slot)||a.slot<0||a.slot>=count||
     (a.role!=="lead"&&a.role!=="feature"&&a.role!=="hook"))continue;
   if(i>=a.fromLine&&i<=a.toLine)return a;
 }
 return null;
}
export function resolveManualVocalCueV385({lyrics,progressMs,playing,count,enabled=false,assignments=[],manualPriority=false}: {
 lyrics?:Lyrics|null;progressMs:number;playing:boolean;count:number;enabled?:boolean;
 assignments?:readonly VocalAssignmentV385[];manualPriority?:boolean;
}):VocalCueV385{
 const n=Math.trunc(clamp(count,1,4));const none=empty(n);
 if(!enabled||!playing||manualPriority||n<2||!lyrics?.synced||!lyrics.lines?.length||
    !Number.isFinite(progressMs)||progressMs<0)return none;
 const lines=lyrics.lines;
 let li=-1;for(let i=0;i<lines.length;i++){
   if(Number.isFinite(lines[i].startMs)&&lines[i].startMs>=0&&lines[i].startMs<=progressMs)li=i;
   else if(lines[i].startMs>progressMs)break;
 }
 if(li<0||!lines[li].text?.trim())return none;
 const line=lines[li],next=lines[li+1]?.startMs??Infinity;
 const end=Math.min(line.endMs!=null&&line.endMs>line.startMs?line.endMs:Infinity,
   next,line.startMs+14000);
 if(progressMs>=end||end<=line.startMs)return none;
 const selected=atLine(assignments,li,n);if(!selected)return none;
 const prior=li>0?atLine(assignments,li-1,n):null;
 const from=prior&&prior.role!=="hook"&&selected.role!=="hook"&&prior.slot!==selected.slot?prior.slot:null;
 const elapsed=progressMs-line.startMs;
 const isNew=li===selected.fromLine;
 const handoffFrom=isNew&&from!==null&&elapsed<850?from:null;
 return {active:true,role:selected.role,lineIndex:li,leadSlot:selected.slot,
   singingSlots:selected.role==="hook"?Array.from({length:n},(_,i)=>i):[selected.slot],
   startMs:line.startMs,endMs:end,handoffFrom,phase:clamp(elapsed/850,0,1),
   source:line.words?.some(w=>w.text?.trim()&&Number.isFinite(w.startMs)&&w.startMs>=0)?"word-timed":"line-timed",count:n};
}
/** Explicit manual stage casting overrides V376 only on assigned, timed lines. */
export function applyManualVocalCueV385(old:DuetInteractionV376,cue:VocalCueV385,
 reducedMotion=false):DuetInteractionV376{
 if(!cue.active||cue.count!==old.count)return old;
 const from=reducedMotion?null:cue.handoffFrom;
 return {enabled:true,count:cue.count,leadSlot:cue.leadSlot,
   partnerSlot:from??(cue.role==="hook"?null:(cue.leadSlot+1)%cue.count),
   activeSlots:Array.from({length:cue.count},(_,i)=>i),
   fromSlot:from,toSlot:cue.leadSlot,event:from!==null?"handoff":"none",
   phase:cue.phase,emphasis:reducedMotion?0:.65,source:cue.source,lineIndex:cue.lineIndex};
}
