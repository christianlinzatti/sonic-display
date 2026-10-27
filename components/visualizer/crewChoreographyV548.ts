/** V548 – Multi-Avatar Crew Choreography 6.0.
 * Pure, seek-safe role differentiation on top of the existing V517/V527/V539
 * director. A V547/496 track-bound vocal cue is the only authority for actual
 * singers; non-singers remain visual backing/dance roles. Supports selective
 * hooks without silently expanding the singer set. No stage-root travel,
 * GLB keyframe edits, IK overrides, extra animation mixers or render loops.
 */
import type {GroupPlanV517,GroupRiskV517,VerifiedVocalCueV517} from './advancedGroupPerformanceV517';
import type {PartnerGestureCue} from './partnerGestureEngine';
import type {LookAtCue} from './partnerLookAtEngine';
export type CrewRoleV548='lead'|'feature'|'backing'|'dancer';
export type CrewSlotV548={slot:number;role:CrewRoleV548;singing:boolean;phase:number;
  grooveGain:number;gesture:PartnerGestureCue;look:LookAtCue};
export type CrewPlanV548={active:boolean;source:'none'|'authored-singer'|'visual-only';
  moment:'off'|'verse'|'handoff'|'hook'|'drop';lead:number;slots:CrewSlotV548[]};
export type CrewInputV548={trackId?:string|null;cueTrackId?:string|null;
 count:number;seconds:number;progressMs:number;bpm?:number|null;
 playing:boolean;reducedMotion:boolean;manualPriority:boolean;
 tier:'low'|'balanced'|'high';beat:number;energy:number;strength?:number;
 footLocked?:boolean;positions:readonly (readonly number[])[];
 cue?:VerifiedVocalCueV517|null;visualGroup?:GroupPlanV517|null;
 risks?:readonly (GroupRiskV517|undefined)[]};
const clamp=(n:number,lo:number,hi:number)=>Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):lo;
const smooth=(x:number)=>{const v=clamp(x,0,1);return v*v*(3-2*v);};
const lookZero=():LookAtCue=>({yaw:0,pitch:0,eyeYaw:0,weight:0});
const off=():CrewPlanV548=>({active:false,source:'none',moment:'off',lead:-1,slots:[]});
const positionOK=(p:readonly number[]|undefined)=>!!p&&p.length>=3&&p.slice(0,3).every(Number.isFinite);
/** Deterministic one-bar pulse: a real audio onset scales it; phase alone
 * never synthesizes a beat or claims a vocal event. */
export function crewPhraseV548(seconds:number,period:number,offset:number):number{
 if(!Number.isFinite(seconds)||seconds<0||!Number.isFinite(period)||period<=0||!Number.isFinite(offset))return 0;
 const p=(((seconds/period-offset)%1)+1)%1;
 return smooth(1-Math.abs(p-.3)/.30);
}
export function planCrewChoreographyV548(input:CrewInputV548):CrewPlanV548{
 const {count,trackId,cue,progressMs,positions}=input;
 if(!trackId?.trim()||!input.playing||input.reducedMotion||input.manualPriority||input.tier==='low'||
   !Number.isInteger(count)||count<2||count>4||positions.length<count||
   !positions.slice(0,count).every(positionOK)||!Number.isFinite(input.seconds)||input.seconds<0||
   !Number.isFinite(progressMs)||progressMs<0||!Number.isFinite(input.beat)||!Number.isFinite(input.energy)||
   !Number.isFinite(input.strength??65))return off();
 const hasCast=cue?.active===true;
 const validCast=hasCast&&input.cueTrackId===trackId&&cue!.count===count&&
   (cue!.role==='lead'||cue!.role==='feature'||cue!.role==='hook')&&
   Number.isInteger(cue!.leadSlot)&&cue!.leadSlot>=0&&cue!.leadSlot<count&&
   Number.isFinite(cue!.startMs)&&Number.isFinite(cue!.endMs)&&cue!.startMs>=0&&
   cue!.endMs>cue!.startMs&&progressMs>=cue!.startMs&&progressMs<cue!.endMs&&
   Array.isArray(cue!.singingSlots)&&cue!.singingSlots.length>0&&
   new Set(cue!.singingSlots).size===cue!.singingSlots.length&&
   cue!.singingSlots.every(s=>Number.isInteger(s)&&s>=0&&s<count)&&
   cue!.singingSlots.includes(cue!.leadSlot)&&
   (cue!.handoffFrom===null||(Number.isInteger(cue!.handoffFrom)&&cue!.handoffFrom>=0&&cue!.handoffFrom<count));
 // An invalid active cue must never be silently replaced by a visual actor.
 if(hasCast&&!validCast)return off();
 const visual=input.visualGroup;
 const visualOnly=!hasCast&&count>=3&&!!visual?.active&&
   visual.source==='visual-only'&&visual.slots.length===count&&
   Number.isInteger(visual.lead)&&visual.lead>=0&&visual.lead<count&&
   (visual.scene==='hook'||visual.scene==='verse'||visual.scene==='drop');
 if(!validCast&&!visualOnly)return off();
 const lead=validCast?cue!.leadSlot:visual!.lead;
 const singers=new Set(validCast?cue!.singingSlots:[]);
 const isHook=validCast?cue!.role==='hook':visual!.scene==='hook';
 const moment:CrewPlanV548['moment']=isHook?'hook':
   validCast&&cue!.handoffFrom!==null&&cue!.handoffFrom!==lead?'handoff':
   visualOnly&&visual!.scene==='drop'?'drop':'verse';
 const remaining=Array.from({length:count},(_,i)=>i).filter(i=>!singers.has(i)&&i!==lead);
 const backing=remaining[0]??-1;
 const strength=clamp(input.strength??65,0,100)/100;
 const envelope=validCast?smooth((progressMs-cue!.startMs)/350)*smooth((cue!.endMs-progressMs)/280):1;
 const quality=input.tier==='balanced'?.60:1;
 const groove=clamp(.42*smooth(input.energy)+.58*smooth(input.beat),0,1);
 const gain=strength*envelope*quality*groove;
 const bpm=Number.isFinite(input.bpm)&&input.bpm!>0?(input.bpm as number):120;
 const period=clamp(240/bpm,1.15,3.6); // four beats per phrase
 const elapsed=validCast?(progressMs-cue!.startMs)/1000:input.seconds;
 const roles:Array<CrewRoleV548>=Array.from({length:count},(_,slot)=>slot===lead?'lead':
   singers.has(slot)?'feature':slot===backing?'backing':'dancer');
 const slots=roles.map((role,slot):CrewSlotV548=>{
   const risk=input.risks?.[slot];
   const clearance=clamp(1-clamp(risk?.risk??0,0,1)*1.9,0,1)*
     clamp(risk?.gestureScale??1,0,1)*clamp(risk?.accentScale??1,0,1);
   const phaseOffset=role==='lead'?.04:role==='feature'?.18+slot*.045:role==='backing'?.38:.59+slot*.052;
   // Feature singers join the same musical phrase but are not mirrored robots.
   const accent=crewPhraseV548(elapsed,period,phaseOffset);
   const roleLevel=role==='lead'?1:role==='feature'?.86:role==='backing'?.64:.48;
   const power=clamp(gain*clearance*accent*roleLevel,0,.82);
   const left=slot%2===0;
   const switchReply=moment==='handoff'&&cue?.handoffFrom===slot&&slot!==lead?
     smooth((progressMs-cue.startMs)/125)*smooth((840-(progressMs-cue.startMs))/350):0;
   const motion=clamp(power+switchReply*gain*.23*clearance,0,.85);
   const lean=clamp(motion*(role==='lead'?-.006:role==='feature'?-.003:.004),-.0055,.0055);
   // Optional role modulation is applied only to already detected audio onsets.
   // It cannot add a kick to a silent frame or bypass foot-lock safety.
   const grooveGain=input.footLocked?1:clamp(1+(role==='lead'?.095:role==='feature'?.045:role==='backing'?-.065:-.11)*
     gain*clearance*(.40+.60*accent),.90,1.08);
   const distance=Math.hypot(positions[lead][0]-positions[slot][0],positions[lead][2]-positions[slot][2]);
   const shouldLook=moment!=='hook'&&moment!=='drop'&&slot!==lead&&distance>=.95&&distance<=5.2;
   const yaw=shouldLook?clamp(Math.atan2(positions[lead][0]-positions[slot][0],2.8+Math.abs(positions[lead][2]-positions[slot][2]))*.065*motion,-.022,.022):0;
   return {slot,role,singing:singers.has(slot),phase:accent,grooveGain,
    gesture:{leftLift:clamp(motion*(left?.027:.011),0,.025),rightLift:clamp(motion*(left?.011:.027),0,.025),
      shoulder:clamp(motion*(isHook?.020:.013),0,.017),lean,intensity:clamp(motion*.045,0,.038)},
    look:shouldLook?{yaw,pitch:0,eyeYaw:yaw*.22,weight:clamp(motion*.085,0,.047)}:lookZero()};
 });
 return {active:true,source:validCast?'authored-singer':'visual-only',moment,lead,slots};
}
