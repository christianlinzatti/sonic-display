/** V504 – Natural Multi-Avatar Stage Interaction.
 * Small, immutable stage-space cues layered AFTER the V500 editorial singer
 * director. It only reacts to track-matched, user-authored V416/V496 singer
 * assignments. Visual reactions are not evidence of audio speaker identity.
 * No new frame loop, bone transforms, IK, clips, timers or state.
 */
import type {RapDuetCueV416} from './rapDuetStudioV416';
import type {RapDuetPlanV500, RapDuetTierV500} from './intelligentRapDuetPerformanceV500';
import type {LookAtCue} from './partnerLookAtEngine';
import type {PartnerGestureCue} from './partnerGestureEngine';

export type StageInteractionSlotV504={look:LookAtCue;gesture:PartnerGestureCue;intent:'lead'|'listener'|'answer'|'duet'|'chorus'};
export type StageInteractionPlanV504={active:boolean;kind:'off'|'solo'|'reply'|'duet'|'hook';slots:StageInteractionSlotV504[]};
export interface StageInteractionInputV504 {
 trackId?:string|null;cueTrackId?:string|null;cue:RapDuetCueV416;
 base:RapDuetPlanV500;progressMs:number;count:number;
 positions:readonly (readonly [number,number,number])[];
 playing:boolean;reducedMotion:boolean;manualPriority:boolean;
 beat:number;strength?:number;tier:RapDuetTierV500;
}
const clamp=(v:number,low:number,high:number)=>Number.isFinite(v)?Math.max(low,Math.min(high,v)):low;
const smooth=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
const pulse=(phase:number,at:number,width:number)=>smooth(1-Math.abs(phase-at)/width);
const zeroLook=():LookAtCue=>({yaw:0,pitch:0,eyeYaw:0,weight:0});
const zeroGesture=():PartnerGestureCue=>({leftLift:0,rightLift:0,shoulder:0,lean:0,intensity:0});
const off=():StageInteractionPlanV504=>({active:false,kind:'off',slots:[]});
const validPosition=(p:readonly number[])=>p.length>=3&&p.slice(0,3).every(Number.isFinite);
/** Mild, distance-gated eye/head turns. The existing V452 combiner enforces
 * final rig limits; these values are purposely much lower than V500's.
 */
function glance(a:readonly number[],b:readonly number[],strength:number):LookAtCue{
 const dx=b[0]-a[0],dz=b[2]-a[2];
 const distance=Math.hypot(dx,dz);
 if(!Number.isFinite(distance)||distance<.75||distance>7)return zeroLook();
 const yaw=clamp(Math.atan2(dx,Math.max(1.8,3+dz)),-.36,.36)*strength*.22;
 return {yaw,pitch:0,eyeYaw:clamp(yaw*.25,-.09,.09),weight:clamp(strength*.13,0,.18)};
}
/** Deterministic, read-only, conservative performance responses. V500 is an
 * explicit evidence gate: no cue -> no new V504 movement. Each role gets a
 * different, deliberately sparse reaction phase, not a gesture per word.
 */
export function planNaturalMultiAvatarStageV504(input:StageInteractionInputV504):StageInteractionPlanV504{
 const {cue,base,count,positions,progressMs}=input;
 if(!base.active||base.kind==='off'||base.kind!==cue.style||
   !input.playing||input.reducedMotion||input.manualPriority||
   !input.trackId?.trim()||input.trackId!==input.cueTrackId||!cue.active||
   !Number.isInteger(count)||count<2||count>4||cue.count!==count||
   base.slots.length!==count||positions.length<count||!positions.slice(0,count).every(validPosition)||
   !Number.isFinite(progressMs)||!Number.isFinite(cue.startMs)||!Number.isFinite(cue.endMs)||
   cue.endMs<=cue.startMs||progressMs<cue.startMs||progressMs>=cue.endMs||
   !Number.isInteger(cue.leadSlot)||cue.leadSlot<0||cue.leadSlot>=count||
   !Array.isArray(cue.singingSlots)||!cue.singingSlots.length||
   cue.singingSlots.some(s=>!Number.isInteger(s)||s<0||s>=count)||
   !cue.singingSlots.includes(cue.leadSlot)||
   (cue.style==='hook'&&cue.singingSlots.length!==count)||
   (cue.style==='duet'&&(!Number.isInteger(cue.partnerSlot)||cue.partnerSlot===null||
     cue.partnerSlot<0||cue.partnerSlot>=count||cue.partnerSlot===cue.leadSlot||!cue.singingSlots.includes(cue.partnerSlot)))||
   !Number.isFinite(input.beat))return off();
 const tier=input.tier==='low'?.22:input.tier==='balanced'?.58:1;
 const gain=clamp(input.strength??65,0,100)/100*tier;
 if(gain<=0)return off();
 const elapsed=progressMs-cue.startMs;
 const entrance=smooth(elapsed/380);
 const exit=smooth((cue.endMs-progressMs)/320);
 const energy=(.3+.7*clamp(input.beat,0,1))*gain*entrance*exit;
 // Slowly alternating responses, preventing a visible twitch per rap syllable.
 const phase=((elapsed/2650)%1+1)%1;
 const singers=new Set(cue.singingSlots);
 const listeners=Array.from({length:count},(_,i)=>i).filter(i=>!singers.has(i));
 const hook=cue.style==='hook',duet=cue.style==='duet',reply=cue.style==='reply';
 const outgoing=cue.handoffFrom!==null&&cue.handoffFrom!==cue.leadSlot&&
   Number.isInteger(cue.handoffFrom)&&cue.handoffFrom>=0&&cue.handoffFrom<count?cue.handoffFrom:null;
 const slots=Array.from({length:count},(_,slot):StageInteractionSlotV504=>{
   const singing=singers.has(slot);
   const leaving=outgoing===slot&&reply;
   const listenerIndex=listeners.indexOf(slot);
   const listenerPulse=listenerIndex<0?0:pulse(phase,.29+(listenerIndex%3)*.19,.17);
   const leadPulse=pulse(phase,.2,.19);
   const duetPulse=pulse(phase,slot===cue.leadSlot?.24:.62,.17);
   const hookPulse=pulse(phase,.23,.21);
   // Only the authored outgoing vocalist can acknowledge the new lead early.
   const handoffPulse=leaving?smooth(elapsed/110)*smooth((920-elapsed)/380):0;
   const response=hook?hookPulse:duet&&singing?duetPulse:singing?leadPulse:
      Math.max(listenerPulse,handoffPulse);
   const strength=energy*response;
   const gazeTarget=duet&&singing?(slot===cue.leadSlot?cue.partnerSlot:cue.leadSlot):cue.leadSlot;
   // Lead and hook performers remain front-facing. Duets exchange quick,
   // light partner glances; other performers acknowledge the current lead.
   const look=!hook&&gazeTarget!==null&&gazeTarget!==slot&&
      (!singing||duet)?glance(positions[slot],positions[gazeTarget],
       energy*(duet&&singing?duetPulse*.6:Math.max(listenerPulse*.72,handoffPulse*.8))):zeroLook();
   const role:StageInteractionSlotV504['intent']=hook?'chorus':leaving?'answer':duet&&singing?'duet':singing?'lead':'listener';
   const arm=hook?.022:singing?.019:.012;
   return {intent:role,look,gesture:{
     leftLift:clamp(strength*arm*(slot%2===0?1:.45),0,.034),
     rightLift:clamp(strength*arm*(slot%2===1?1:.45),0,.034),
     shoulder:clamp(strength*(hook?.019:.012),0,.025),
     lean:clamp(strength*(singing?-.007:.005),-.01,.01),
     intensity:clamp(strength*.045,0,.06),
   }};
 });
 return {active:true,kind:cue.style,slots};
}
