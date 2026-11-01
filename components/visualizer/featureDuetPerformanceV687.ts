/** V687 – Feature & Duet Performance.
 * Read-only, seek-safe finishing accents for already VERIFIED lead/feature vocal
 * assignments. V385/V416/V496/V517 remain the only singer authority; this
 * module never assigns singing, edits clips/faces/lyrics or moves stage roots.
 */
import type {GroupPlanV517,GroupRiskV517,VerifiedVocalCueV517} from './advancedGroupPerformanceV517';
import type {PartnerGestureCue} from './partnerGestureEngine';
import type {LookAtCue} from './partnerLookAtEngine';

export type FeatureDuetMomentV687='off'|'handoff'|'duet'|'feature'|'hook';
export type FeatureDuetSlotV687=Readonly<{
  slot:number;role:'incoming'|'outgoing'|'partner'|'listener'|'chorus';
  target:number|null;look:LookAtCue;gesture:PartnerGestureCue;accent:number;
}>;
export type FeatureDuetPlanV687=Readonly<{
  active:boolean;source:'none'|'verified-vocal-cue';moment:FeatureDuetMomentV687;
  lead:number;slots:readonly FeatureDuetSlotV687[];
}>;
export type FeatureDuetInputV687=Readonly<{
  trackId?:string|null;cueTrackId?:string|null;cue?:VerifiedVocalCueV517|null;
  count:number;progressMs:number;playing:boolean;reducedMotion:boolean;
  manualPriority:boolean;tier:'low'|'balanced'|'high';strength?:number;
  positions:readonly (readonly number[])[];risks?:readonly (GroupRiskV517|undefined)[];
  footLocked?:boolean;
}>;
const clamp=(v:number,lo:number,hi:number)=>Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):lo;
const smooth=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
const bell=(t:number,mid:number,halfWidth:number)=>smooth(1-Math.abs(t-mid)/halfWidth);
const zeroLook=():LookAtCue=>({yaw:0,pitch:0,eyeYaw:0,weight:0});
const OFF:FeatureDuetPlanV687={active:false,source:'none',moment:'off',lead:-1,slots:[]};
const positionOK=(p:readonly number[]|undefined)=>!!p&&p.length>=3&&p.slice(0,3).every(Number.isFinite);
function safeGlance(a:readonly number[],b:readonly number[],power:number):LookAtCue{
  const dx=b[0]-a[0],dz=b[2]-a[2];
  const distance=Math.hypot(dx,dz);
  if(!Number.isFinite(distance)||distance<.95||distance>5.0||power<=0)return zeroLook();
  const yaw=clamp(Math.atan2(dx,2.8+Math.abs(dz))*.082*power,-.035,.035);
  return {yaw,pitch:0,eyeYaw:yaw*.24,weight:clamp(power*.085,0,.05)};
}
/** A track-verified cue gives visual timing authority, not acoustic evidence.
 * Handoff accents last < 1.1 s, duet glances span slow phrase arcs, and all
 * gestures fade smoothly at authored interval boundaries. */
export function planFeatureDuetPerformanceV687(base:GroupPlanV517,input:FeatureDuetInputV687):FeatureDuetPlanV687{
  const {cue,count,progressMs}=input;
  if(!base.active||base.source!=='authored-singer'||!cue?.active||
    !input.trackId?.trim()||input.cueTrackId!==input.trackId||
    !input.playing||input.reducedMotion||input.manualPriority||input.tier==='low'||
    !Number.isInteger(count)||count<2||count>4||cue.count!==count||
    base.slots.length!==count||base.lead!==cue.leadSlot||
    !Number.isFinite(progressMs)||!Number.isFinite(cue.startMs)||!Number.isFinite(cue.endMs)||
    cue.startMs<0||cue.endMs<=cue.startMs||progressMs<cue.startMs||progressMs>=cue.endMs||
    !Number.isInteger(cue.leadSlot)||cue.leadSlot<0||cue.leadSlot>=count||
    !['lead','feature','hook'].includes(cue.role??'')||
    !Array.isArray(cue.singingSlots)||cue.singingSlots.length===0||
    new Set(cue.singingSlots).size!==cue.singingSlots.length||
    !cue.singingSlots.includes(cue.leadSlot)||
    !cue.singingSlots.every(s=>Number.isInteger(s)&&s>=0&&s<count)||
    (cue.handoffFrom!=null&&(!Number.isInteger(cue.handoffFrom)||cue.handoffFrom<0||cue.handoffFrom>=count))||
    (cue.role==='hook'&&cue.singingSlots.length!==count)||
    !Number.isFinite(input.strength??65)||(input.strength??65)<=0||
    input.positions.length<count||!input.positions.slice(0,count).every(positionOK))return OFF;
  const lead=cue.leadSlot,elapsed=progressMs-cue.startMs;
  const previous=cue.handoffFrom??null;
  const outgoing=previous!==lead?previous:null;
  const singers=new Set(cue.singingSlots);
  const duet=cue.singingSlots.length===2;
  const moment:FeatureDuetMomentV687=cue.role==='hook'?'hook':outgoing!==null?'handoff':duet?'duet':'feature';
  const entrance=smooth(elapsed/360)*smooth((cue.endMs-progressMs)/360);
  const tierGain=input.tier==='balanced' ? .64 : 1;
  const gain=clamp(input.strength??65,0,100)/100*tierGain*(input.footLocked ? .70 : 1)*entrance;
  if(gain<=0)return OFF;
  // Do not fabricate a beat. V687 only uses the supplied vocal segment clock.
  const phrase=((elapsed%3400)+3400)%3400/3400;
  const handoff=bell(elapsed,560,520);
  const duetPartner=duet?cue.singingSlots.find(s=>s!==lead)??null:null;
  const slots=Array.from({length:count},(_,slot):FeatureDuetSlotV687=>{
    const isLead=slot===lead,isOutgoing=outgoing===slot;
    const isPartner=duetPartner===slot;
    const singing=singers.has(slot);
    const risk=input.risks?.[slot];
    const clearance=clamp(1-clamp(risk?.risk??0,0,1)*1.9,0,1)*
      clamp(risk?.gestureScale??1,0,1)*clamp(risk?.accentScale??1,0,1);
    const role:FeatureDuetSlotV687['role']=moment==='hook'?'chorus':
      isOutgoing?'outgoing':isLead?'incoming':isPartner?'partner':'listener';
    let timing=0;
    let target:number|null=null;
    if(moment==='handoff'){
      // Brief mutual acknowledgment, then the incoming vocalist faces front.
      timing=isLead ? bell(elapsed,430,350)*.65:isOutgoing?handoff:.20*bell(elapsed,760,450);
      target=isLead?outgoing:slot===outgoing?lead:lead;
    }else if(moment==='duet'){
      timing=isLead ? bell(phrase,.22,.19):isPartner?bell(phrase,.60,.20):.22*bell(phrase,.52,.22);
      target=isLead?duetPartner:isPartner?lead:lead;
    }else if(moment==='hook'){
      timing=.34*bell(phrase,.26+(slot%2)*.045,.30);
      target=null; // full chorus stays audience-facing
    }else{
      timing=isLead?.15*bell(phrase,.24,.22):.32*bell(phrase,.50+slot*.035,.24);
      target=isLead?null:lead;
    }
    const accent=clamp(gain*clearance*timing*(singing?1:.68),0,.62);
    const look=target!==null&&target!==slot?safeGlance(input.positions[slot],input.positions[target],accent):zeroLook();
    const turn=slot%2===0;
    const gesture:PartnerGestureCue={
      leftLift:clamp(accent*(turn ? .025 : .010),0,.018),
      rightLift:clamp(accent*(turn ? .010 : .025),0,.018),
      shoulder:clamp(accent*.018,0,.013),
      lean:clamp(accent*(isLead ? -.004 : .003),-.0025,.0025),
      intensity:clamp(accent*.038,0,.025),
    };
    return {slot,role,target:look.weight>0?target:null,look,gesture,accent};
  });
  return {active:true,source:'verified-vocal-cue',moment,lead,slots};
}
