/** V599 — user-authored feature/duet performance polish for the *existing* V500
 * upper-body look/gesture overlay. No inferred singer identities, new bones,
 * clip controls, animation timers, stage-root translations or IK ownership.
 * The single source of vocal roles and section timing is the track-bound V416
 * (or V496) authored cue already validated by V500.
 */
import type {RapDuetInputV500,RapDuetPlanV500} from './intelligentRapDuetPerformanceV500';

const clamp=(n:number,lo:number,hi:number)=>Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):lo;
const smooth=(x:number)=>{const y=clamp(x,0,1);return y*y*(3-2*y);};
const peak=(at:number,centre:number,spread:number)=>smooth(1-Math.abs(at-centre)/spread);
const near=(a:readonly number[],b:readonly number[])=>{
 const distance=Math.hypot(a[0]-b[0],a[2]-b[2]);
 return Number.isFinite(distance)&&distance>=.85&&distance<=6;
};
/** Human-readable, read-only inspection for an author-assigned performance.
 * It never pretends to detect an acoustic speaker or create lyric timestamps.
 */
export type FeatureDuetEvidenceV599={
 status:'active'|'protected'|'invalid';kind:RapDuetPlanV500['kind'];
 singers:readonly number[];lead:number|null;handoffFrom:number|null;
 reason:string;
};
export function featureDuetEvidenceV599(base:RapDuetPlanV500,input:RapDuetInputV500):FeatureDuetEvidenceV599{
 const protectedOff=():FeatureDuetEvidenceV599=>({status:'protected',kind:'off',singers:[],lead:null,handoffFrom:null,reason:'manual/reduced-motion/quality/track'});
 if(!base.active||base.kind==='off'||!input.playing||input.manualPriority||input.reducedMotion||input.tier==='low'||
   !input.trackId||input.trackId!==input.cueTrackId)return protectedOff();
 const {cue,count,positions,progressMs}=input;
 if(!cue.active||cue.style!==base.kind||cue.count!==count||!Number.isInteger(count)||count<2||count>4||
   base.slots.length!==count||!Number.isFinite(progressMs)||!Number.isFinite(cue.startMs)||
   !Number.isFinite(cue.endMs)||cue.endMs<=cue.startMs||progressMs<cue.startMs||progressMs>=cue.endMs||
   !Number.isInteger(cue.leadSlot)||cue.leadSlot<0||cue.leadSlot>=count||
   !Array.isArray(cue.singingSlots)||!cue.singingSlots.length||new Set(cue.singingSlots).size!==cue.singingSlots.length||
   cue.singingSlots.some(s=>!Number.isInteger(s)||s<0||s>=count)||!cue.singingSlots.includes(cue.leadSlot)||
   positions.length<count||positions.slice(0,count).some(p=>p.length!==3||p.some(v=>!Number.isFinite(v)||Math.abs(v)>100))||
   !Number.isFinite(input.beat)||!Number.isFinite(input.strength??65)||
   (cue.handoffFrom!==null&&(!Number.isInteger(cue.handoffFrom)||cue.handoffFrom<0||cue.handoffFrom>=count))||
   (cue.style==='hook'&&(cue.singingSlots.length!==count||cue.partnerSlot!==null))||
   (cue.style==='duet'&&(!Number.isInteger(cue.partnerSlot)||cue.partnerSlot===cue.leadSlot||
     cue.partnerSlot===null||cue.partnerSlot<0||cue.partnerSlot>=count||!cue.singingSlots.includes(cue.partnerSlot))))
   return {status:'invalid',kind:'off',singers:[],lead:null,handoffFrom:null,reason:'incomplete or contradictory authored cue'};
 return {status:'active',kind:base.kind,singers:[...cue.singingSlots],lead:cue.leadSlot,
   handoffFrom:cue.handoffFrom,reason:'explicit track-matched timed singer cue'};
}
/** Upper-body refinement. Never touches roles, singing slots, camera, root or mouth.
 * Most gestures are around 0.01–0.03 and fade in/out at authored boundaries.
 */
export function refineFeatureDuetPerformanceV599(base:RapDuetPlanV500,input:RapDuetInputV500):RapDuetPlanV500{
 const evidence=featureDuetEvidenceV599(base,input);
 if(evidence.status!=='active')return base;
 const {cue,positions,progressMs,count}=input;
 const strength=clamp(input.strength??65,0,100)/100*(input.tier==='balanced'?.52:1);
 if(strength<=0)return base;
 const elapsed=progressMs-cue.startMs;
 const fade=smooth(elapsed/270)*smooth((cue.endMs-progressMs)/330);
 if(fade<=.000001)return base;
 const singers=new Set(evidence.singers);
 const isHook=base.kind==='hook';
 const isDuet=base.kind==='duet'&&cue.partnerSlot!==null;
 const hasHandoff=cue.handoffFrom!==null&&cue.handoffFrom!==cue.leadSlot&&
   (base.kind==='reply'||base.kind==='solo');
 const leader=cue.leadSlot;
 const beat=clamp(input.beat,0,1);
 // Start-of-line timestamps are known; sparse phrase accents never claim a beat grid.
 const phrase=((elapsed%2300)+2300)%2300;
 const hookBeat=peak(phrase,360,325)*(.52+.48*beat);
 // In V416 an authored reply changes vocalist 62% through a line, whereas
 // a V496 timed segment starts exactly at its saved timestamp (lineIndex=-1).
 const handoffElapsed=elapsed-(base.kind==='reply'&&cue.lineIndex>=0?
   (cue.endMs-cue.startMs)*.62:0);
 let changed=false;
 const slots=base.slots.map((performer,slot)=>{
   const singing=singers.has(slot);
   const target=isDuet&&singing?(slot===leader?cue.partnerSlot!:leader):
     hasHandoff&&slot===leader?cue.handoffFrom!:leader;
   const closest=!isHook&&slot!==target&&near(positions[slot],positions[target]);
   let arm=0,attention=0;
   if(isHook){
     // Shared hook with different arm emphasis, all eyes to the audience.
     arm=hookBeat*(slot%2===0?.024:.020);
   } else if(hasHandoff&&(slot===cue.handoffFrom||slot===leader)&&closest){
     // The formerly assigned singer acknowledges the replacement briefly;
     // incoming voice makes its own smaller response. No new singer is assigned.
     arm=slot===cue.handoffFrom?peak(handoffElapsed,510,480)*.021:peak(handoffElapsed,350,390)*.028;
     if(slot===cue.handoffFrom)attention=peak(handoffElapsed,520,530)*.034;
   } else if(isDuet&&singing&&closest){
     const shift=slot===leader?560:1220;
     const accent=peak(phrase,shift,420)*(.6+.4*beat);
     arm=accent*.027;
     attention=accent*.020;
   } else if(!singing&&closest){
     // Listeners quietly acknowledge the actual assigned lead at different times.
     arm=peak(phrase,790+(slot%3)*350,300)*.012;
   }
   const amount=arm*fade*strength;
   const glance=attention*fade*strength;
   if(amount<=.0000005&&glance<=.0000005)return performer;
   changed=true;
   const g=performer.gesture;
   const side=(slot%2===0);
   const gesture={...g,
     leftLift:clamp(g.leftLift+amount*(side?.75:.28),0,.13),
     rightLift:clamp(g.rightLift+amount*(side?.28:.75),0,.13),
     shoulder:clamp(g.shoulder+amount*.35,0,.065),
     intensity:clamp(g.intensity+amount*.8,0,.28),
   };
   // Respect the existing directional gaze: only vary its weight when
   // the original planner already established a valid partner glance.
   const look=glance>0&&performer.look.weight>0&&!isHook?{
     ...performer.look,weight:clamp(performer.look.weight+glance,0,.46)
   }:performer.look;
   return {...performer,gesture,look};
 });
 return changed?{...base,slots}:base;
}
