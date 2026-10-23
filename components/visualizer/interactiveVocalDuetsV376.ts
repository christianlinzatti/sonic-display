import type {Lyrics} from "@/types/music";
import type {PerformanceCueV375} from "./adaptiveVocalPerformanceV375";

/** Visual acting only: never infers which human voice is singing. */
export type DuetModeV376="off"|"handoff"|"dialogue";
export type DuetInteractionV376={enabled:boolean;leadSlot:number;partnerSlot:number|null;
  activeSlots:number[];fromSlot:number|null;toSlot:number;
  event:"none"|"handoff"|"reply";phase:number;emphasis:number;
  source:"word-timed"|"line-timed"|"none";lineIndex:number;count:number};
export type DuetOptionsV376={lyrics?:Lyrics|null;progressMs:number;playing:boolean;reducedMotion?:boolean;
  count:number;mode?:DuetModeV376;strength?:number;performance?:PerformanceCueV375|null;
  manualPriority?:boolean};
const limit=(n:number,lo:number,hi:number)=>Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):lo;
const smooth=(n:number)=>{const t=limit(n,0,1);return t*t*(3-2*t);};
export function resolveDuetInteractionV376(input:DuetOptionsV376):DuetInteractionV376{
 const count=Math.trunc(limit(input.count,1,4));
 const at=limit(input.progressMs,0,Number.MAX_SAFE_INTEGER);
 const performance=input.performance?.enabled?input.performance:null;
 const neutralLead=performance?.leadSlot??0;
 const neutralSlots=performance?.activeSlots??Array.from({length:count},(_,i)=>i);
 const neutral=(lineIndex=-1,source:DuetInteractionV376["source"]="none"):DuetInteractionV376=>({
   enabled:false,leadSlot:neutralLead,partnerSlot:null,activeSlots:[...neutralSlots],
   fromSlot:null,toSlot:neutralLead,event:"none",phase:0,emphasis:0,source,lineIndex,count});
 if(input.mode==="off"||!input.mode||!input.playing||input.reducedMotion||input.manualPriority||count<2) return neutral();
 const lines=input.lyrics?.synced?input.lyrics.lines:null;
 if(!lines?.length)return neutral();
 // Only actual lyric line timestamps may trigger a cue; no inferred word timestamps.
 let li=-1;
 for(let i=0;i<lines.length;i++){
   const line=lines[i];if(!Number.isFinite(line.startMs)||line.startMs<0)continue;
   if(line.startMs<=at)li=i;else break;
 }
 if(li<0)return neutral();
 const line=lines[li];
 const next=lines[li+1]?.startMs??Infinity;
 const end=Math.min(line.endMs!=null&&line.endMs>line.startMs?line.endMs:Infinity,next,line.startMs+14000);
 if(at>=end||!line.text?.trim())return neutral(li,"line-timed");
 const elapsed=at-line.startMs;
 const phrase=Math.floor(li/4);
 const mode=input.mode;
 const toSlot=mode==="dialogue"?li%count:(performance?.leadSlot??phrase%count);
 const fromSlot=mode==="dialogue"?(li===0?null:(li-1)%count):(phrase>0&&li%4===0?(phrase-1)%count:null);
 const changed=fromSlot!==null&&fromSlot!==toSlot;
 const handoffDuration=mode==="dialogue"?640:850;
 const transition=changed&&elapsed<handoffDuration;
 const phase=transition?limit(elapsed/handoffDuration,0,1):1;
 const strength=limit((input.strength??60)/100,0,1);
 const easeIn=smooth(elapsed/160);
 const tail=smooth(Math.min(end-at,750)/240);
 const emphasis=strength*easeIn*tail;
 const event:DuetInteractionV376["event"]=transition?(mode==="dialogue"?"reply":"handoff"):"none";
 // Do not switch the whole cast when inactive; preserve solo/duo/group intent.
 let activeSlots=performance?.enabled?
   Array.from({length:performance.activeCount},(_,i)=>(toSlot+i)%count):[...neutralSlots];
 if(transition&&fromSlot!==null&&!activeSlots.includes(fromSlot))activeSlots=[...activeSlots,fromSlot];
 const partnerSlot=transition?fromSlot:(activeSlots.length>1?activeSlots.find(s=>s!==toSlot)??null:null);
 return {enabled:true,leadSlot:toSlot,partnerSlot,activeSlots,fromSlot:transition?fromSlot:null,
   toSlot,event,phase,emphasis,source:line.words?.some(w=>Number.isFinite(w.startMs)&&w.text?.trim())?"word-timed":"line-timed",lineIndex:li,count};
}
/** Small additive targets blended into the V371 pose, never into GLB source animations. */
export function overlayDuetV376<T extends {headPitch:number;headYaw:number;headTilt:number;eyeYaw:number;
  chestLean:number;leftArm:number;rightArm:number}>(body:T, cue:DuetInteractionV376|null|undefined,
  slot:number, enabled:boolean, gestures=true,eyeContact=true, authoredPriority=false):T{
 if(!cue?.enabled||!enabled||slot<0||slot>=cue.count||!cue.activeSlots.includes(slot))return body;
 const isLead=cue.leadSlot===slot;
 const isOutgoing=cue.fromSlot===slot;
 const isPartner=cue.partnerSlot===slot;
 if(!isLead&&!isOutgoing&&!isPartner)return body;
 const gain=cue.emphasis*(authoredPriority?.35:1);
 // The outgoing artist looks toward the incoming lead, not toward themself.
 const other=isLead?(cue.partnerSlot??((slot+1)%cue.count)):cue.leadSlot;
 const facing=other>slot?1:-1;
 const envelope=cue.event!=="none"?Math.sin(Math.PI*cue.phase):.18;
 const glance=(eyeContact?1:0)*gain*(isLead?.11:isOutgoing?.10:.06)*envelope*facing;
 const gesture=(gestures?1:0)*gain*(isLead?.115:isOutgoing?.08:.035)*envelope;
 return {...body,headYaw:limit(body.headYaw+glance,-.19,.19),
   eyeYaw:limit(body.eyeYaw+glance*.55,-.16,.16),
   headPitch:limit(body.headPitch+(isLead?-.025:.015)*gain*envelope,-.18,.18),
   headTilt:limit(body.headTilt+(isOutgoing?.012:-.008)*gain*envelope,-.12,.12),
   chestLean:limit(body.chestLean+(isLead?-.018:.012)*gain*envelope,-.12,.12),
   leftArm:limit(body.leftArm+(facing<0?-gesture:gesture*.24),-.25,.25),
   rightArm:limit(body.rightArm+(facing>0?gesture:-gesture*.24),-.25,.25)};
}
