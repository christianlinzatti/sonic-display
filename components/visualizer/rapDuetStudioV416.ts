import type {Lyrics} from "@/types/music";
// Structural contracts kept pure so this deterministic timebase is independently type-checkable.
type DuetInteractionV376={
 enabled:boolean;leadSlot:number;partnerSlot:number|null;activeSlots:number[];
 fromSlot:number|null;toSlot:number;event:"none"|"handoff"|"reply";phase:number;emphasis:number;
 source:"word-timed"|"line-timed"|"none";lineIndex:number;count:number;
};
type VocalCueV385={
 active:boolean;role:"lead"|"feature"|"hook"|null;lineIndex:number;leadSlot:number;
 singingSlots:number[];startMs:number;endMs:number;handoffFrom:number|null;
 phase:number;source:"line-timed"|"word-timed"|"none";count:number;
};

/** A *visual, user-authored* cast; never claims recognition of recorded speakers. */
export type RapDuetStyleV416="solo"|"reply"|"duet"|"hook";
export type RapDuetAssignmentV416={
  fromLine:number;toLine:number;leadSlot:number;partnerSlot:number;style:RapDuetStyleV416;strength:number;
};
export type RapDuetCueV416={
  active:boolean;style:RapDuetStyleV416|null;lineIndex:number;
  leadSlot:number;partnerSlot:number|null;singingSlots:number[];handoffFrom:number|null;
  phase:number;emphasis:number;startMs:number;endMs:number;source:"none"|"line-timed"|"word-timed";count:number;
};
const clamp=(n:number,lo:number,hi:number)=>Number.isFinite(n)?Math.min(hi,Math.max(lo,n)):lo;
const neutral=(count:number):RapDuetCueV416=>({
  active:false,style:null,lineIndex:-1,leadSlot:0,partnerSlot:null,singingSlots:[],
  handoffFrom:null,phase:1,emphasis:0,startMs:0,endMs:0,source:"none",count,
});
/** Remove corrupted, out-of-range or cross-track data before it can reach the stage. */
export function normalizeRapDuetAssignmentsV416(value:unknown,lineCount:number):RapDuetAssignmentV416[]{
  if(!Array.isArray(value))return [];
  const limit=Math.trunc(clamp(lineCount,0,5000));
  return value.slice(0,150).flatMap((item):RapDuetAssignmentV416[]=>{
    if(!item||typeof item!=="object"||Array.isArray(item))return [];
    const x=item as Record<string,unknown>;
    const style=x.style;
    if(style!=="solo"&&style!=="reply"&&style!=="duet"&&style!=="hook")return [];
    if(!Number.isInteger(x.fromLine)||!Number.isInteger(x.toLine)||
      !Number.isInteger(x.leadSlot)||!Number.isInteger(x.partnerSlot))return [];
    const a=x.fromLine as number,b=x.toLine as number,lead=x.leadSlot as number,partner=x.partnerSlot as number;
    if(a<0||b<a||b>=limit||lead<0||lead>3||partner<0||partner>3||
      ((style==="duet"||style==="reply")&&lead===partner))return [];
    const strength=typeof x.strength==="number"?x.strength:65;
    return [{fromLine:a,toLine:b,leadSlot:lead,partnerSlot:partner,style,strength:Math.round(clamp(strength,0,100))}];
  });
}
const choose=(items:readonly RapDuetAssignmentV416[],line:number,count:number):RapDuetAssignmentV416|null=>{
  // The last edited assignment wins on overlapping ranges.
  for(let i=Math.min(items.length,150)-1;i>=0;i--){
    const item=items[i];
    if(item&&item.fromLine<=line&&item.toLine>=line&&item.leadSlot<count&&
       item.leadSlot>=0&&item.partnerSlot<count&&item.partnerSlot>=0&&
       ((item.style!=="duet"&&item.style!=="reply")||item.partnerSlot!==item.leadSlot))return item;
  }
  return null;
};
export function resolveRapDuetCueV416({lyrics,progressMs,playing,count,enabled=false,assignments=[],
  reducedMotion=false,manualPriority=false}:{
  lyrics?:Lyrics|null;progressMs:number;playing:boolean;count:number;enabled?:boolean;
  assignments?:readonly RapDuetAssignmentV416[];reducedMotion?:boolean;manualPriority?:boolean;
}):RapDuetCueV416{
  const n=Math.trunc(clamp(count,1,4)),none=neutral(n);
  if(!enabled||!playing||manualPriority||!lyrics?.synced||!lyrics.lines?.length||
    n<2||!Number.isFinite(progressMs)||progressMs<0)return none;
  const lines=lyrics.lines;
  let index=-1;
  for(let i=0;i<lines.length;i++){
    if(!Number.isFinite(lines[i].startMs)||lines[i].startMs<0)continue;
    if(lines[i].startMs>progressMs)break;
    index=i;
  }
  if(index<0||!lines[index].text?.trim())return none;
  const line=lines[index];
  const end=Math.min(line.endMs!=null&&line.endMs>line.startMs?line.endMs:Infinity,
    lines[index+1]?.startMs??Infinity,line.startMs+14000);
  if(progressMs>=end||end<=line.startMs)return none;
  const selected=choose(assignments,index,n);
  if(!selected)return none;
  const previous=index>0?choose(assignments,index-1,n):null;
  const duration=end-line.startMs,elapsed=progressMs-line.startMs;
  const tail=Math.min(1,(end-progressMs)/150);
  const emphasis=(reducedMotion?0:1)*clamp(selected.strength/100,0,1)*Math.min(1,elapsed/150)*Math.max(0,tail);
  const words=line.words?.some(w=>Number.isFinite(w.startMs)&&w.startMs>=0&&!!w.text?.trim());
  const source=words?"word-timed":"line-timed";
  if(selected.style==="hook")
    return {active:true,style:"hook",lineIndex:index,leadSlot:selected.leadSlot,
      partnerSlot:null,singingSlots:Array.from({length:n},(_,i)=>i),
      handoffFrom:null,phase:1,emphasis,startMs:line.startMs,endMs:end,source,count:n};
  if(selected.style==="duet")
    return {active:true,style:"duet",lineIndex:index,leadSlot:selected.leadSlot,
      partnerSlot:selected.partnerSlot,singingSlots:[selected.leadSlot,selected.partnerSlot],
      handoffFrom:null,phase:1,emphasis,startMs:line.startMs,endMs:end,source,count:n};
  // Authored call/response: second performer answers during the last part of the assigned line.
  // Timing is a visual arrangement, NOT an inferred singer or phoneme event.
  if(selected.style==="reply"&&elapsed>=duration*.62){
    const from=selected.leadSlot;
    const responseElapsed=elapsed-duration*.62;
    return {active:true,style:"reply",lineIndex:index,leadSlot:selected.partnerSlot,
      partnerSlot:selected.leadSlot,singingSlots:[selected.partnerSlot],
      handoffFrom:reducedMotion?null:from,phase:clamp(responseElapsed/550,0,1),
      emphasis,startMs:line.startMs,endMs:end,source,count:n};
  }
  const previousLead=previous?.style==="reply"?previous.partnerSlot:previous?.leadSlot;
  const from=previousLead!==undefined&&previousLead!==selected.leadSlot&&elapsed<700&&!reducedMotion?previousLead:null;
  return {active:true,style:selected.style,lineIndex:index,leadSlot:selected.leadSlot,
    partnerSlot:selected.style==="reply"?selected.partnerSlot:null,singingSlots:[selected.leadSlot],
    handoffFrom:from,phase:from===null?1:clamp(elapsed/700,0,1),
    emphasis,startMs:line.startMs,endMs:end,source,count:n};
}
/** Reuse the existing V376 stage gestures; don't introduce a second arm/head controller. */
export function applyRapDuetInteractionV416(original:DuetInteractionV376,cue:RapDuetCueV416):DuetInteractionV376{
  if(!cue.active||cue.count!==original.count)return original;
  return {...original,enabled:true,leadSlot:cue.leadSlot,partnerSlot:cue.partnerSlot,
    activeSlots:Array.from({length:cue.count},(_,i)=>i),
    fromSlot:cue.handoffFrom,toSlot:cue.leadSlot,event:cue.handoffFrom!==null?"handoff":
      cue.style==="reply"&&cue.phase<1?"reply":"none",
    phase:cue.phase,emphasis:cue.emphasis,source:cue.source,lineIndex:cue.lineIndex};
}
/** Use the existing vocal-rig singer mask, including explicit simultaneous voices. */
export function toVocalCueV416(cue:RapDuetCueV416):VocalCueV385{
  return {active:cue.active,role:cue.style==="hook"?"hook":cue.style==="reply"?"feature":"lead",
    lineIndex:cue.lineIndex,leadSlot:cue.leadSlot,singingSlots:[...cue.singingSlots],
    startMs:cue.startMs,endMs:cue.endMs,handoffFrom:cue.handoffFrom,phase:cue.phase,
    source:cue.source,count:cue.count};
}
