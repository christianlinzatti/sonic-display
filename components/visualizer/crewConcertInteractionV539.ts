/** V539 – Multi-Avatar Concert Interaction 5.0.
 * A read-only, track-bound, collision-aware layer for gaze and small upper-body
 * accents. V517 remains the singer-identity authority; V527 remains the style
 * director; V452 and V506/V508 own rig limits and collision safety. No new
 * animation mixer, React state, actor root motion, facial morphs or timers.
 */
import type {GroupPlanV517,GroupRiskV517,VerifiedVocalCueV517} from './advancedGroupPerformanceV517';
import type {MultiAvatarPlanV527} from './cinematicMultiAvatarV527';
import type {LookAtCue} from './partnerLookAtEngine';
import type {PartnerGestureCue} from './partnerGestureEngine';
import {refineNaturalPerformerCrewV616} from './naturalMultiPerformerInteractionV616';
export type CrewMomentV539='off'|'handoff'|'duet'|'hook'|'call-response'|'visual-hook';
export type CrewSlotV539={slot:number;role:'lead'|'partner'|'outgoing'|'listener'|'chorus'|'visual';
  target:number|null;look:LookAtCue;gesture:PartnerGestureCue;strength:number};
export type CrewPlanV539={active:boolean;moment:CrewMomentV539;source:'authored-singer'|'visual-only'|'none';slots:CrewSlotV539[]};
export type CrewInputV539={
  trackId?:string|null;cueTrackId?:string|null;count:number;
  progressMs:number;playing:boolean;reducedMotion:boolean;manualPriority:boolean;
  tier:'low'|'balanced'|'high';beat:number;energy:number;strength?:number;
  positions:readonly (readonly number[])[];cue?:VerifiedVocalCueV517|null;
  risks?:readonly (GroupRiskV517|undefined)[];
};
const clamp=(x:number,a:number,b:number)=>Number.isFinite(x)?Math.max(a,Math.min(b,x)):a;
const smooth=(x:number)=>{const t=clamp(x,0,1);return t*t*(3-2*t);};
const pulse=(x:number,c:number,r:number)=>smooth(1-Math.abs(x-c)/r);
const emptyLook=():LookAtCue=>({yaw:0,pitch:0,eyeYaw:0,weight:0});
const emptyGesture=():PartnerGestureCue=>({leftLift:0,rightLift:0,shoulder:0,lean:0,intensity:0});
const off=():CrewPlanV539=>({active:false,moment:'off',source:'none',slots:[]});
const positionOK=(p:readonly number[]|undefined)=>!!p&&p.length>=3&&p.slice(0,3).every(Number.isFinite);
/** Small partner glance; never rotate stage roots or interfere with camera. */
function glance(a:readonly number[],b:readonly number[],amount:number):LookAtCue{
  const dx=b[0]-a[0],dz=b[2]-a[2],distance=Math.hypot(dx,dz);
  if(distance<.9||distance>5.5||!Number.isFinite(distance)||amount<=0)return emptyLook();
  const yaw=clamp(Math.atan2(dx,2.5+Math.abs(dz))*.075*amount,-.028,.028);
  return {yaw,pitch:0,eyeYaw:yaw*.25,weight:clamp(amount*.09,0,.042)};
}
/** Pure and seek-safe: no hidden time state; only previously verified singer
 * assignments can produce a duet or handoff. Automatic visual-only groups
 * may share a chorus accent but are NEVER interpreted as audio vocalists. */
export function planCrewConcertInteractionV539(base:GroupPlanV517,cinematic:MultiAvatarPlanV527,input:CrewInputV539):CrewPlanV539{
  const {count,cue,progressMs}=input;
  if(!base.active||!cinematic.active||cinematic.source!==base.source||cinematic.lead!==base.lead||
    base.slots.length!==count||cinematic.slots.length!==count||
    !input.trackId?.trim()||!input.playing||input.reducedMotion||input.manualPriority||input.tier==='low'||
    !Number.isInteger(count)||count<2||count>4||!Number.isFinite(progressMs)||progressMs<0||
    !Number.isFinite(input.beat)||!Number.isFinite(input.energy)||
    !Number.isFinite(input.strength??65)||input.positions.length<count||
    !input.positions.slice(0,count).every(positionOK))return off();
  const authored=base.source==='authored-singer';
  const visual=base.source==='visual-only';
  if(!authored&&!visual)return off();
  if(visual&&(count<3||base.scene!=='hook'||cue?.active))return off();
  if(authored&&(!cue?.active||input.cueTrackId!==input.trackId||cue.count!==count||
    cue.leadSlot!==base.lead||!Number.isInteger(cue.leadSlot)||cue.leadSlot<0||cue.leadSlot>=count||
    !Number.isFinite(cue.startMs)||!Number.isFinite(cue.endMs)||cue.endMs<=cue.startMs||
    progressMs<cue.startMs||progressMs>=cue.endMs||
    !Array.isArray(cue.singingSlots)||cue.singingSlots.length===0||
    new Set(cue.singingSlots).size!==cue.singingSlots.length||
    !cue.singingSlots.every(s=>Number.isInteger(s)&&s>=0&&s<count)||
    !cue.singingSlots.includes(cue.leadSlot)||
    (cue.handoffFrom!==null&&(!Number.isInteger(cue.handoffFrom)||cue.handoffFrom<0||cue.handoffFrom>=count))||
    (cue.role==='hook'&&cue.singingSlots.length!==count)))return off();
  const gain=clamp(input.strength??65,0,100)/100*(input.tier==='balanced'?.56:1)*
    (.44+.28*smooth(input.energy)+.28*smooth(input.beat));
  if(gain<=0)return off();
  const elapsed=authored?progressMs-cue!.startMs:progressMs;
  const envelope=authored?smooth(elapsed/440)*smooth((cue!.endMs-progressMs)/330):1;
  const singers=new Set(authored?cue!.singingSlots:[]);
  const groupHook=base.scene==='hook'&&(visual||cue?.role==='hook');
  const outgoing=authored&&cue!.handoffFrom!==null&&cue!.handoffFrom!==cue!.leadSlot?cue!.handoffFrom:null;
  const duo=authored&&!groupHook&&singers.size===2;
  const moment:CrewMomentV539=visual?'visual-hook':groupHook?'hook':outgoing!==null?'handoff':duo?'duet':'call-response';
  // One slow phrase arc with small actor offsets, avoiding syllable jitter.
  const phase=(((elapsed/3100)%1)+1)%1;
  const slots=Array.from({length:count},(_,slot):CrewSlotV539=>{
    const lead=slot===base.lead, singing=singers.has(slot);
    const partner=duo?Array.from(singers).find(s=>s!==slot)??null:null;
    const isOutgoing=outgoing===slot;
    const role:CrewSlotV539['role']=visual?'visual':groupHook?'chorus':isOutgoing?'outgoing':
      lead?'lead':singing?'partner':'listener';
    const risk=input.risks?.[slot];
    const clearance=clamp(1-clamp(risk?.risk??0,0,1)*1.8,0,1)*
      clamp(risk?.gestureScale??1,0,1)*clamp(risk?.accentScale??1,0,1);
    const wave=groupHook?pulse(phase,.26+(slot%2)*.10,.34):
      isOutgoing?pulse(elapsed,460,430):duo&&singing?pulse(phase,lead?.19:.58,.26):
      singing?pulse(phase,.24,.25):pulse(phase,.51+(slot%3)*.09,.23);
    const amount=clamp(gain*envelope*clearance*wave*(groupHook?.78:singing?.72:.48),0,.85);
    const target=groupHook||visual||lead&&!duo?null:
      duo&&singing?partner:base.lead;
    // Only time-bounded, verified performers exchange brief looks; the lead
    // otherwise stays audience-facing, especially during hooks.
    const look=target!==null&&target!==slot?glance(input.positions[slot],input.positions[target],amount):emptyLook();
    return {slot,role,target,look,strength:amount,gesture:{
      leftLift:clamp(amount*(slot%2===0?.016:.006),0,.014),
      rightLift:clamp(amount*(slot%2===1?.016:.006),0,.014),
      shoulder:clamp(amount*(groupHook?.024:.013),0,.021),
      lean:clamp(amount*(lead?-.003:.003),-.003,.003),
      intensity:clamp(amount*.035,0,.030),
    }};
  });
  return refineNaturalPerformerCrewV616({active:true,moment,source:authored?'authored-singer':'visual-only',slots},input);
}
