/** V616 – Natural Multi-Performer Interaction.
 * Two small, deterministic refinements of the existing track-confirmed V500
 * and V539 performer plans. No inferred singers, autonomous root motion,
 * new dance actions, gaze targets, animation clocks or facial ownership.
 * Seeks/replays produce the same gesture pose for the same song timestamp.
 */
import type {RapDuetPlanV500,RapDuetInputV500} from './intelligentRapDuetPerformanceV500';
import type {CrewPlanV539,CrewInputV539} from './crewConcertInteractionV539';
const clamp=(n:number,a:number,b:number)=>Number.isFinite(n)?Math.max(a,Math.min(b,n)):a;
const smooth=(n:number)=>{const x=clamp(n,0,1);return x*x*(3-2*x);};
const bell=(n:number,centre:number,width:number)=>smooth(1-Math.abs(n-centre)/width);
const distance=(a:readonly number[],b:readonly number[])=>Math.hypot(a[0]-b[0],a[2]-b[2]);
const nearby=(a:readonly number[]|undefined,b:readonly number[]|undefined)=>
 !!a&&!!b&&a.length>=3&&b.length>=3&&a.slice(0,3).every(Number.isFinite)&&
 b.slice(0,3).every(Number.isFinite)&&distance(a,b)>=.9&&distance(a,b)<=5.5;
/** Position-safe, positive-only refinement: never invent a partner gaze, only
 * slightly deepen an existing gaze to the assigned singer and release it. */
function deepenLook<T extends {yaw:number;eyeYaw:number;weight:number}>(look:T,self:readonly number[],target:readonly number[],pulse:number,maxYaw:number,maxWeight:number):T{
 if(pulse<=0||look.weight<=.000001||!nearby(self,target))return look;
 const heading=Math.atan2(target[0]-self[0],Math.max(1.6,3+target[2]-self[2]));
 if(!Number.isFinite(heading)||Math.abs(look.yaw)<.000001||heading*look.yaw<=0)return look;
 const change=Math.sign(heading)*Math.min(pulse*.20,.003);
 return {...look,yaw:clamp(look.yaw+change,-maxYaw,maxYaw),
   eyeYaw:clamp(look.eyeYaw+change*.22,-.11,.11),weight:clamp(look.weight+pulse,0,maxWeight)};
}
/** V500 channel: specifically authored duets, call/replies and supporting
 * listeners. An inline V416 response begins no earlier than .62 of its line;
 * an edited V496 time segment already starts on its own true boundary. */
export function refineNaturalPerformerDuetV616(base:RapDuetPlanV500,input:RapDuetInputV500):RapDuetPlanV500{
 const {cue,progressMs,count,positions}=input;
 if(!base.active||base.kind!==cue.style||!input.playing||input.reducedMotion||input.manualPriority||
 input.tier==='low'||!input.trackId||input.trackId!==input.cueTrackId||!cue.active||
 !Number.isInteger(count)||count<2||count>4||cue.count!==count||base.slots.length!==count||
 positions.length<count||!positions.slice(0,count).every(p=>p.length>=3&&p.every(Number.isFinite))||
 !Number.isFinite(progressMs)||!Number.isFinite(cue.startMs)||!Number.isFinite(cue.endMs)||
 progressMs<cue.startMs||progressMs>=cue.endMs||cue.endMs<=cue.startMs||
 !Number.isInteger(cue.leadSlot)||cue.leadSlot<0||cue.leadSlot>=count||
 !Number.isFinite(cue.emphasis)||cue.emphasis<0||cue.emphasis>1||
 !Number.isFinite(input.beat)||input.beat<0||input.beat>1||
 !Number.isFinite(input.strength??65)||(input.strength??65)<=0||
 !Array.isArray(cue.singingSlots)||cue.singingSlots.length===0||
 new Set(cue.singingSlots).size!==cue.singingSlots.length||
 !cue.singingSlots.every(i=>Number.isInteger(i)&&i>=0&&i<count)||
 !cue.singingSlots.includes(cue.leadSlot)||
 (cue.style==='hook'&&cue.singingSlots.length!==count)||
 (cue.style==='duet'&&(!Number.isInteger(cue.partnerSlot)||cue.partnerSlot===null||
 cue.partnerSlot===cue.leadSlot||!cue.singingSlots.includes(cue.partnerSlot)))||
 (cue.handoffFrom!==null&&(!Number.isInteger(cue.handoffFrom)||cue.handoffFrom<0||cue.handoffFrom>=count))||
 base.slots.some((s,i)=>!s||s.role!==(cue.style==='hook'?'chorus':
   cue.handoffFrom===i&&cue.handoffFrom!==cue.leadSlot?'handoff':
   cue.singingSlots.includes(i)?'singing':'listening'))||
 (cue.style==='duet'&&(!nearby(positions[cue.leadSlot],positions[cue.partnerSlot!])||cue.singingSlots.length!==2))||
 (cue.style==='reply'&&cue.handoffFrom!==null&&cue.handoffFrom!==cue.leadSlot&&
   !nearby(positions[cue.leadSlot],positions[cue.handoffFrom])))return base;
 const elapsed=progressMs-cue.startMs;
 const fade=smooth(elapsed/340)*smooth((cue.endMs-progressMs)/330);
 const gain=fade*clamp(input.strength??65,0,100)/100*(input.tier==='balanced'?.5:1);
 if(gain<.00001)return base;
 const singers=new Set(cue.singingSlots);
 const responseBoundary=cue.style==='reply'&&cue.lineIndex>=0?(cue.endMs-cue.startMs)*.62:0;
 const replyTime=elapsed-responseBoundary;
 let changed=false;
 const slots=base.slots.map((slot,i)=>{
   const singing=singers.has(i),lead=i===cue.leadSlot;
   const outgoing=cue.style==='reply'&&cue.handoffFrom===i&&i!==cue.leadSlot;
   // No new expressive accent before an inline response's saved boundary.
   if(outgoing&&replyTime<0)return slot;
   const partner=cue.style==='duet'&&singing?(lead?cue.partnerSlot:cue.leadSlot):cue.leadSlot;
   // Singer has no new target during a solo; the whole hook faces the audience.
   const hasTarget=partner!==null&&i!==partner&&cue.style!=='hook'&&
      ((cue.style==='duet'&&singing)||outgoing||!singing);
   if(hasTarget&&!nearby(positions[i],positions[partner!]))return slot;
   const phase=((elapsed%3200)+3200)%3200;
   const slotOffset=((i*427+cue.lineIndex*31)%730+730)%730;
   const response=outgoing?bell(replyTime,510,680):
     cue.style==='duet'&&singing?bell(phase,lead?650:1570,510):
     cue.style==='hook'?bell(phase,520+(i%3)*390,440):
     singing?bell(phase,610,500):bell(phase,900+slotOffset,470);
   const beatScale=.65+.35*clamp(input.beat,0,1);
   const boost=response*gain*beatScale*(outgoing?.009:singing?.008:.005);
   if(boost<.0000001)return slot;
   const left=(i+cue.lineIndex)%2===0;
   const g=slot.gesture;
   const gesture={...g,
     leftLift:clamp(g.leftLift+boost*(left?.68:.27),0,.13),
     rightLift:clamp(g.rightLift+boost*(left?.27:.68),0,.13),
     shoulder:clamp(g.shoulder+boost*.30,0,.065),
     intensity:clamp(g.intensity+boost*.64,0,.28)};
   const look=hasTarget?deepenLook(slot.look,positions[i],positions[partner!],
       response*gain*.004,.42,.46):slot.look;
   changed=true;
   return {...slot,gesture,look};
 });
 return changed?{...base,slots}:base;
}
/** V539 crew channel: stagger listener acknowledgements across two–four
 * performers, but only under a verified editorial vocal cast. Visual-only
 * groups are never labelled as vocalists. The original risk and collision
 * clearance wins and manual stage movement remains untouched. */
export function refineNaturalPerformerCrewV616(base:CrewPlanV539,input:CrewInputV539):CrewPlanV539{
 const {count,cue,positions,progressMs}=input;
 if(!base.active||base.source!=='authored-singer'||!cue?.active||
 !input.trackId||input.cueTrackId!==input.trackId||!input.playing||
 input.reducedMotion||input.manualPriority||input.tier==='low'||
 !Number.isFinite(progressMs)||progressMs<cue.startMs||progressMs>=cue.endMs||
 !Number.isFinite(cue.startMs)||!Number.isFinite(cue.endMs)||cue.startMs>=cue.endMs||
 !Number.isFinite(input.beat)||!Number.isFinite(input.energy)||
 !Number.isFinite(input.strength??65)||(input.strength??65)<=0||
 !Number.isInteger(count)||count<2||count>4||cue.count!==count||
 base.slots.length!==count||positions.length<count||
 !Number.isInteger(cue.leadSlot)||cue.leadSlot<0||cue.leadSlot>=count||
 !Array.isArray(cue.singingSlots)||!cue.singingSlots.includes(cue.leadSlot)||
 new Set(cue.singingSlots).size!==cue.singingSlots.length||
 !cue.singingSlots.every(i=>Number.isInteger(i)&&i>=0&&i<count)||
 base.slots.some((s,i)=>!s||s.slot!==i)||
 !positions.slice(0,count).every(p=>p.length>=3&&p.slice(0,3).every(Number.isFinite)))return base;
 const elapsed=progressMs-cue.startMs;
 const fade=smooth(elapsed/350)*smooth((cue.endMs-progressMs)/350);
 const gain=fade*clamp(input.strength??65,0,100)/100*(input.tier==='balanced'?.48:1);
 if(gain<.00001)return base;
 const singing=new Set(cue.singingSlots);
 let changed=false;
 const slots=base.slots.map((slot,i)=>{
   const listener=!singing.has(i),outgoing=i===cue.handoffFrom&&i!==cue.leadSlot;
   const risk=input.risks?.[i];
   const clearance=clamp(1-clamp(risk?.risk??0,0,1)*1.8,0,1)*
      clamp(risk?.gestureScale??1,0,1)*clamp(risk?.accentScale??1,0,1);
   if(clearance<.00001)return slot;
   const target=slot.target;
   if(target!==null&&(!Number.isInteger(target)||target<0||target>=count||
        !nearby(positions[i],positions[target])))return slot;
   // Do not keep acknowledging an outgoing singer after the handoff window.
   if(outgoing&&elapsed>=880)return slot;
   const phase=((elapsed%3100)+3100)%3100;
   const peak=outgoing?bell(elapsed,500,420):
     base.moment==='hook'?bell(phase,460+(i%3)*310,390):
     listener?bell(phase,950+(i%3)*350,490):
     base.moment==='duet'?bell(phase,i===cue.leadSlot?650:1530,520):bell(phase,680,510);
   const boost=peak*gain*clearance*(outgoing?.007:listener?.0045:.006);
   if(boost<.0000001)return slot;
   const g=slot.gesture;
   const gesture={...g,
     leftLift:clamp(g.leftLift+boost*(i%2===0?.62:.25),0,.014),
     rightLift:clamp(g.rightLift+boost*(i%2===0?.25:.62),0,.014),
     shoulder:clamp(g.shoulder+boost*.25,0,.021),
     intensity:clamp(g.intensity+boost*.70,0,.030)};
   const look=target!==null&&base.moment!=='hook'?
     deepenLook(slot.look,positions[i],positions[target],peak*gain*clearance*.003,.028,.042):slot.look;
   changed=true;
   return {...slot,gesture,look};
 });
 return changed?{...base,slots}:base;
}
