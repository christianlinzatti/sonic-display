/** V505 – Intelligent Stage Interaction 2.0.
 * Read-only, stage-space-aware refinement of V504 look/gesture cues.
 * For automatically generated group stages only, reports tiny Z clearance
 * intentions; V494 alone decides whether a root may actually travel.
 * Never rewrites authored stage cues, imported animations, lips, bones or IK.
 */
import type {StageInteractionPlanV504} from './naturalMultiAvatarStageInteractionV504';
import type {RapDuetCueV416} from './rapDuetStudioV416';
import type {LookAtCue} from './partnerLookAtEngine';
import type {PartnerGestureCue} from './partnerGestureEngine';
export interface SpatialSlotV505 {
 look:LookAtCue; gesture:PartnerGestureCue;
 depthOffset:number; turnFactor:number; nearestDistance:number;
}
export interface SpatialPlanV505 {
 active:boolean; mode:'off'|'vocal'|'spacing'|'vocal-spacing';
 slots:SpatialSlotV505[]; closePairs:number;
}
export interface SpatialInputV505 {
 base:StageInteractionPlanV504;cue:RapDuetCueV416;
 positions:readonly (readonly [number,number,number])[];
 trackId?:string|null;cueTrackId?:string|null;
 count:number;playing:boolean;reducedMotion:boolean;manualPriority:boolean;
 automaticGroup:boolean;minSpacing?:number;tier:'low'|'balanced'|'high';
}
const clamp=(v:number,lo:number,hi:number)=>Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):lo;
const smooth=(n:number)=>{const t=clamp(n,0,1);return t*t*(3-2*t);};
const emptyLook=():LookAtCue=>({yaw:0,pitch:0,eyeYaw:0,weight:0});
const emptyGesture=():PartnerGestureCue=>({leftLift:0,rightLift:0,shoulder:0,lean:0,intensity:0});
const inactive=():SpatialPlanV505=>({active:false,mode:'off',slots:[],closePairs:0});
const validPos=(p:readonly number[])=>p.length===3&&p.every(Number.isFinite);
function targetSlot(slot:number,cue:RapDuetCueV416,count:number):number|null {
 if(!cue.active||!Number.isInteger(cue.leadSlot)||cue.leadSlot<0||cue.leadSlot>=count)return null;
 if(cue.style==='hook')return null;
 if(cue.style==='duet'&&Number.isInteger(cue.partnerSlot)&&cue.partnerSlot!==null&&cue.partnerSlot>=0&&cue.partnerSlot<count){
  return slot===cue.leadSlot?cue.partnerSlot:cue.leadSlot;
 }
 return slot===cue.leadSlot?null:cue.leadSlot;
}
/** Computes mutual safe-space intent from REAL group positions. Does not infer
 * artist identity or trust audio alone for a singer assignment. Zero distance
 * never produces a divide-by-zero, violent turn or a fabricated vocal cue.
 */
export function planStageSpatialInteractionV505(input:SpatialInputV505):SpatialPlanV505 {
 const {base,count,positions}=input;
 if(!input.playing||input.reducedMotion||input.manualPriority||
  !input.trackId?.trim()||count<2||count>4||!Number.isInteger(count)||
  positions.length<count||!positions.slice(0,count).every(validPos))return inactive();
 const hasVocal=base.active&&base.slots.length===count&&input.cue.active&&
  input.trackId===input.cueTrackId&&input.cue.count===count&&
  input.cue.singingSlots.includes(input.cue.leadSlot)&&
  input.cue.leadSlot>=0&&input.cue.leadSlot<count;
 const canSpace=input.automaticGroup&&input.tier!=='low';
 if(!hasVocal&&!canSpace)return inactive();
 const spacing=clamp(input.minSpacing??1.24,1,2);
 const nearest=Array.from({length:count},()=>({distance:Infinity,slot:-1}));
 let closePairs=0;
 for(let i=0;i<count;i++)for(let j=i+1;j<count;j++){
  const d=Math.hypot(positions[j][0]-positions[i][0],positions[j][2]-positions[i][2]);
  if(d<nearest[i].distance)nearest[i]={distance:d,slot:j};
  if(d<nearest[j].distance)nearest[j]={distance:d,slot:i};
  if(d<spacing)closePairs++;
 }
 if(!hasVocal&&closePairs===0)return inactive();
 const slots=Array.from({length:count},(_,i):SpatialSlotV505=>{
  const near=nearest[i];
  // Dampen crowded performers rather than making them spin or wave into one another.
  const space=smooth((near.distance-.52)/.68);
  const turnFactor=clamp(.18+.82*space,.18,1);
  const source=hasVocal?base.slots[i]:null;
  const target=source?targetSlot(i,input.cue,count):null;
  let look=emptyLook();
  if(source){
   const old=source.look;
   let gazeGain=0,yaw=0;
   if(target!==null&&target!==i&&old.weight>0){
    const other=positions[target],me=positions[i];
    const dx=other[0]-me[0],dz=other[2]-me[2];
    const distance=Math.hypot(dx,dz);
    // Strong head turns to people behind the performer would look wrong on stage.
    gazeGain=smooth((distance-.70)/.65)*smooth((6.1-distance)/1.8)*
      smooth((2.6-Math.abs(dz))/1.5);
    yaw=clamp(Math.atan2(dx,Math.max(2.5,3+dz)),-.42,.42)*.20;
   }
   const weight=clamp(old.weight*gazeGain*turnFactor,0,.18);
   look={yaw:clamp(yaw*gazeGain*turnFactor,-.08,.08),
    pitch:clamp(old.pitch*gazeGain,-.04,.04),
    eyeYaw:clamp(yaw*.24*gazeGain*turnFactor,-.022,.022),weight};
  }
  const gestureFactor=.24+.76*space;
  const old=source?.gesture??emptyGesture();
  const gesture:PartnerGestureCue={
   leftLift:clamp(old.leftLift*gestureFactor,0,.034),
   rightLift:clamp(old.rightLift*gestureFactor,0,.034),
   shoulder:clamp(old.shoulder*gestureFactor,-.025,.025),
   lean:clamp(old.lean*gestureFactor,-.01,.01),
   intensity:clamp(old.intensity*gestureFactor,0,.06),
  };
  // Only automatic groups receive a *desired* depth staggering. The V494
  // contact guard below is required before this value reaches any root.
  let depthOffset=0;
  if(canSpace&&near.slot>=0&&near.distance<spacing){
   const other=positions[near.slot];
   const dz=positions[i][2]-other[2];
   const side=Math.abs(dz)>.005?Math.sign(dz):(i<near.slot?-1:1);
   const tier=input.tier==='balanced'?.55:1;
   depthOffset=side*clamp((spacing-near.distance)*.19*tier,0,.16);
  }
  return {look,gesture,depthOffset,turnFactor,nearestDistance:near.distance};
 });
 return {active:true,mode:hasVocal?(closePairs&&canSpace?'vocal-spacing':'vocal'):'spacing',slots,closePairs};
}
/** Only existing V494 movement/ground observations authorize positional clearance.
 * The small Z displacement cannot resolve a severe collision by itself.
 */
export function safeStageDepthV505(slot:SpatialSlotV505|undefined,ground:{
 active:boolean;phase:string;support:string;gain:number;driftCm:number;
}|undefined):number {
 if(!slot||!ground?.active||!Number.isFinite(ground.gain)||
  !Number.isFinite(ground.driftCm)||ground.driftCm>4||
  ground.phase==='low'||ground.phase==='lowering'||ground.phase==='rising'||
  ground.support==='both')return 0;
 const factor=ground.support==='none'?.65:.38;
 return clamp(slot.depthOffset*factor*clamp(ground.gain,0,1),-.105,.105);
}
