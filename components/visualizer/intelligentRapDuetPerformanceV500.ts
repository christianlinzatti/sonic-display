/** V500 — editorially directed rap duet attention and short response accents.
 * Consumes ONLY user-authored V416/V496 singer cues. A 'reply' is an authored
 * stage cue, NOT speaker recognition. No new audio sampling or render loop.
 * Outputs are conservative additive V144/V145 overlays (never bone/clip/root IK).
 */
import type {RapDuetCueV416} from './rapDuetStudioV416';
import {refineDuetResponseV575} from './duetResponseV575';
import type {LookAtCue} from './partnerLookAtEngine';
import type {PartnerGestureCue} from './partnerGestureEngine';
export type RapDuetTierV500='high'|'balanced'|'low';
export type RapDuetSlotV500={look:LookAtCue;gesture:PartnerGestureCue;role:'singing'|'listening'|'handoff'|'chorus'};
export type RapDuetPlanV500={active:boolean;kind:'off'|'solo'|'reply'|'duet'|'hook';slots:RapDuetSlotV500[]};
export interface RapDuetInputV500 {
  trackId:string|undefined|null;cueTrackId:string|undefined|null;
  cue:RapDuetCueV416;progressMs:number;
  count:number;positions:readonly (readonly [number,number,number])[];
  playing:boolean;reducedMotion:boolean;manualPriority:boolean;
  beat:number;strength?:number;tier:RapDuetTierV500;
}
const clamp=(value:number,low:number,high:number)=>Number.isFinite(value)?Math.min(high,Math.max(low,value)):low;
const smooth=(v:number)=>{const x=clamp(v,0,1);return x*x*(3-2*x);};
const pulse=(v:number,centre:number,width:number)=>smooth(1-Math.abs(v-centre)/width);
const valid=(p:readonly number[])=>p.length>=3&&p.slice(0,3).every(Number.isFinite);
const emptyLook=():LookAtCue=>({yaw:0,pitch:0,eyeYaw:0,weight:0});
const emptyGesture=():PartnerGestureCue=>({leftLift:0,rightLift:0,shoulder:0,lean:0,intensity:0});
const off=():RapDuetPlanV500=>({active:false,kind:'off',slots:[]});
/** A small stage-space look toward a partner; distance and angle limit excessive
 * head turns. No attention target if the performers almost overlap.
 */
function attention(self:readonly number[],other:readonly number[],amount:number):LookAtCue{
  const dx=other[0]-self[0],dz=other[2]-self[2];
  const distance=Math.hypot(dx,dz);
  if(!Number.isFinite(distance)||distance<.75||distance>7)return emptyLook();
  const yaw=clamp(Math.atan2(dx,Math.max(1.6,3+dz)),-.38,.38)*amount;
  return {yaw,pitch:0,eyeYaw:clamp(yaw*.24,-.09,.09),weight:clamp(amount*.35,0,.46)};
}
/** Pure deterministic timebase: identical track/cue/time always yields same result.
 * Strict track matching prevents a stale singer assignment reaching a new song.
 */
export function planIntelligentRapDuetV500(input:RapDuetInputV500):RapDuetPlanV500{
  const {cue,count,positions,progressMs}=input;
  if(!input.playing||input.reducedMotion||input.manualPriority||
    !input.trackId||input.trackId!==input.cueTrackId||!cue.active||
    (cue.style!=='solo'&&cue.style!=='reply'&&cue.style!=='duet'&&cue.style!=='hook')||
    !Number.isInteger(count)||count<2||count>4||cue.count!==count||
    !Number.isFinite(progressMs)||progressMs<cue.startMs||progressMs>=cue.endMs||
    !Number.isFinite(cue.startMs)||!Number.isFinite(cue.endMs)||cue.endMs<=cue.startMs||
    positions.length<count||!positions.slice(0,count).every(valid)||
    !Number.isInteger(cue.leadSlot)||cue.leadSlot<0||cue.leadSlot>=count||
    !Array.isArray(cue.singingSlots)||!cue.singingSlots.length||
    cue.singingSlots.some(s=>!Number.isInteger(s)||s<0||s>=count)||
    cue.singingSlots.indexOf(cue.leadSlot)<0||
    (cue.style==='duet'&&(!Number.isInteger(cue.partnerSlot)||cue.partnerSlot===null||cue.partnerSlot===cue.leadSlot||cue.partnerSlot<0||cue.partnerSlot>=count||!cue.singingSlots.includes(cue.partnerSlot)))||
    (cue.style==='hook'&&cue.singingSlots.length!==count)||
    (cue.handoffFrom!==null&&(!Number.isInteger(cue.handoffFrom)||cue.handoffFrom<0||cue.handoffFrom>=count))||
    !Number.isFinite(input.beat))return off();
  const tier=input.tier==='low'?.22:input.tier==='balanced'?.62:1;
  const amount=clamp(input.strength??65,0,100)/100*tier;
  if(amount<=0)return off();
  const elapsed=progressMs-cue.startMs;
  // Envelope prevents sudden look/gesture snaps on new vocalist boundaries.
  const envelope=smooth(elapsed/270)*smooth((cue.endMs-progressMs)/230);
  const voice=clamp(cue.emphasis,0,1);
  const energy=(.26+.74*clamp(input.beat,0,1))*amount*envelope;
  const phase=((elapsed/2100)%1+1)%1;
  const leadPulse=pulse(phase,.17,.19),answerPulse=pulse(phase,.56,.20);
  const singers=new Set(cue.singingSlots);
  const isHook=cue.style==='hook';
  const isDuet=cue.style==='duet';
  const isReply=cue.style==='reply';
  const handoffValid=cue.handoffFrom!==null&&cue.handoffFrom!==cue.leadSlot;
  const responseTarget=cue.leadSlot;
  const slots=Array.from({length:count},(_,slot):RapDuetSlotV500=>{
    const singing=singers.has(slot);
    const outgoing=handoffValid&&slot===cue.handoffFrom;
    const partner=isDuet?(slot===cue.leadSlot?cue.partnerSlot!:cue.leadSlot):responseTarget;
    // Visible response: spectators only briefly acknowledge the *assigned* singer.
    const listening=!singing;
    const reacts=outgoing?answerPulse:answerPulse*(.78-(slot%2)*.15);
    const accent=isHook?leadPulse:singing?leadPulse:reacts;
    const emphasis=energy*accent*(singing?(.42+.58*voice):.44);
    // During the hook, everyone faces the crowd and shares a low nod pulse.
    // During solo, the singer faces the crowd; the other avatars glance toward them.
    // During an authored handoff, the outgoing singer can glance to the new lead.
    const showLook=!isHook&&envelope>0&&(
      listening||(isDuet&&singing)||(outgoing&&isReply));
    const lookTarget=isDuet&&singing?partner:responseTarget;
    const lookGain=(isDuet&&singing?.14+.09*answerPulse:outgoing?.25:.23+.13*reacts)*amount*envelope;
    const look=showLook&&lookTarget!==slot?attention(positions[slot],positions[lookTarget],lookGain):emptyLook();
    const offset=slot%2===0?1:0;
    const gesture:PartnerGestureCue={
      leftLift:clamp(emphasis*(singing?.080:.045)*(offset?.6:1),0,.13),
      rightLift:clamp(emphasis*(singing?.082:.048)*(offset?1:.6),0,.13),
      shoulder:clamp(emphasis*(singing?.030:.022),0,.065),
      lean:clamp(emphasis*(singing?-.012:.008),-.028,.028),
      intensity:clamp(emphasis*.19,0,.28),
    };
    return {look,gesture,role:isHook?'chorus':outgoing?'handoff':singing?'singing':'listening'};
  });
  return refineDuetResponseV575({active:true,kind:cue.style,slots},input);
}
