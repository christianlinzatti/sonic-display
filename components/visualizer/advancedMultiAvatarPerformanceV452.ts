/** V452 – Advanced Multi-Avatar Performance. Pure, deterministic choreography accents.
 * Takes *visual stage cues*, never treats artist credits or spectral hints as a singer ID.
 * Does not replace GLB actions, speaker assignments, hand IK or manual choreography.
 */
import type {LookAtCue} from './partnerLookAtEngine';
import type {PartnerGestureCue} from './partnerGestureEngine';
export interface CrewAccentSlotV452 {
  slot:number;offsetX:number;offsetZ:number;turnY:number;
  look:LookAtCue;gesture:PartnerGestureCue;
}
export interface CrewAccentPlanV452 {
  active:boolean;mode:'hook'|'verse'|'none';lead:number|null;slots:CrewAccentSlotV452[];
}
export interface CrewAccentInputV452 {
  enabled:boolean;playing:boolean;reducedMotion:boolean;manualPriority:boolean;
  count:number;positions:readonly (readonly [number,number,number])[];
  focus:number;drop:boolean;section?:string|null;
  seconds:number;cueSeconds?:number;beat:number;energy?:number;
  strength?:number;blend?:number;
}
const clamp=(v:number,lo:number,hi:number)=>Number.isFinite(v)?Math.min(hi,Math.max(lo,v)):lo;
const smooth=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
const zeroLook=():LookAtCue=>({yaw:0,pitch:0,eyeYaw:0,weight:0});
const zeroGesture=():PartnerGestureCue=>({leftLift:0,rightLift:0,shoulder:0,lean:0,intensity:0});
/** Plan only micro-movements. Root coordinates remain in stage space and share the
 * same phase for group hooks. Verse replies are intentionally offset by slot.
 * No frames, GLBs, recordings or persistent user data are created. */
export function planCrewAccentsV452(input:CrewAccentInputV452):CrewAccentPlanV452{
  const blank:CrewAccentPlanV452={active:false,mode:'none',lead:null,slots:[]};
  const count=Number.isFinite(input.count)?Math.trunc(input.count):0;
  if(!input.enabled||!input.playing||input.reducedMotion||input.manualPriority||
    count<2||count>4||input.positions.length<count||!Number.isFinite(input.seconds)||input.seconds<0||
    !input.positions.slice(0,count).every(p=>p?.length>=3&&p.every(Number.isFinite)))return blank;
  const amount=clamp(input.strength??60,0,100)/100;
  if(amount===0)return blank;
  const group=input.drop===true||input.section==='hook'||input.focus===-1;
  const lead=group?null:Number.isInteger(input.focus)&&input.focus>=0&&input.focus<count?input.focus:null;
  if(!group&&lead===null)return blank;
  // A fade-in after authored/automatic formation changes avoids abrupt accent changes.
  const transition=.38+.62*smooth(input.blend??1);
  const beat=clamp(input.beat,0,1),energy=clamp(input.energy??.5,0,1);
  const gain=amount*transition*(.28+.45*energy+.27*beat);
  const t=Math.max(0,input.seconds-(Number.isFinite(input.cueSeconds)?input.cueSeconds!:0));
  // 2.4 s phrase is intentionally a *visual* rhythm; only actual beat energy
  // can produce a strong shared gesture, never a fabricated acoustic beat.
  const phase=((t/2.4)%1+1)%1;
  const wave=Math.sin(phase*Math.PI*2);
  const window=(center:number,width:number)=>Math.max(0,1-Math.abs(phase-center)/width);
  const lift=(value:number)=>clamp(value,0,1);
  const slots=Array.from({length:count},(_,slot):CrewAccentSlotV452=>{
    const inLead=slot===lead;
    const reply=lead!==null&&(slot===((lead+1)%count));
    const pulse=group?(.25+.75*beat)*window(.26,.29):
      inLead?(.2+.8*beat)*window(.19,.17):
      reply?(.2+.8*beat)*window(.56,.18):(.15+.5*beat)*window(.69,.15);
    const intensity=lift(pulse*gain);
    const self=input.positions[slot],target=lead===null?null:input.positions[lead];
    const dx=target?target[0]-self[0]:0;
    const yaw=group?0:inLead?0:clamp(Math.atan2(dx,Math.max(1.5,3+(target![2]-self[2]))),-.42,.42)*gain*.15;
    // Identical X offset for *all* hook members preserves inter-avatar spacing.
    const sharedX=group?wave*.045*gain:0;
    const offsetZ=group?(-.035*beat*gain):inLead?-.05*intensity:0;
    const turnY=group?Math.sin(phase*Math.PI*2)*.035*gain:
      inLead?0:clamp(yaw*.48,-.045,.045);
    const look:LookAtCue={yaw,pitch:group?-.018*intensity:0,eyeYaw:yaw*.25,
      weight:group?.08*intensity:inLead?0:.19*gain};
    const gesture:PartnerGestureCue={
      leftLift:group?.055*intensity:reply?.070*intensity:inLead?.020*intensity:.015*intensity,
      rightLift:group?.055*intensity:inLead?.075*intensity:reply?.025*intensity:.012*intensity,
      shoulder:.034*intensity,
      lean:group?0:inLead?-.012*intensity:.008*intensity,
      intensity:.22*intensity,
    };
    return {slot,offsetX:sharedX,offsetZ,turnY,look,gesture};
  });
  return {active:true,mode:group?'hook':'verse',lead,slots};
}
/** Merge with existing V444/V145 overlays without ever exceeding rig safety limits. */
export function combineCrewGesturesV452(base:PartnerGestureCue,accent:PartnerGestureCue):PartnerGestureCue{
  return {leftLift:clamp(base.leftLift+accent.leftLift,0,.35),
    rightLift:clamp(base.rightLift+accent.rightLift,0,.35),
    shoulder:clamp(base.shoulder+accent.shoulder,-.13,.13),
    lean:clamp(base.lean+accent.lean,-.05,.05),
    intensity:clamp(base.intensity+accent.intensity,0,1)};
}
export function combineCrewLooksV452(base:LookAtCue,accent:LookAtCue):LookAtCue{
  return {yaw:clamp(base.yaw+accent.yaw,-.42,.42),
    pitch:clamp(base.pitch+accent.pitch,-.16,.16),
    eyeYaw:clamp(base.eyeYaw+accent.eyeYaw,-.11,.11),
    weight:clamp(base.weight+accent.weight,0,1)};
}
export const emptyCrewLookV452=zeroLook;
export const emptyCrewGestureV452=zeroGesture;
