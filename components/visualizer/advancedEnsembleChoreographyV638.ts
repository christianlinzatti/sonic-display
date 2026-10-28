/** V638 – Advanced Ensemble Choreography.
 * A deterministic, additive layer on the already-authorised V517 ensemble plan.
 * Explicit singer assignments remain the only source of vocal roles; V495's
 * automatic visual lead never becomes a presumed singer. The layer reuses the
 * same R3F frame, V452 gesture clamps, V506/V508 collision estimates, and V494
 * planted-foot permission. No clips, IK, imported GLB poses or X lanes change.
 */
import type {GroupPlanV517,GroupRoleV517,GroupRiskV517} from './advancedGroupPerformanceV517';
import type {FormationPlanV495} from './multiAvatarFormationDirectorV495';
import type {LookAtCue} from './partnerLookAtEngine';
import type {PartnerGestureCue} from './partnerGestureEngine';

export type EnsemblePatternV638='off'|'lead-counterpoint'|'alternating-wings'|'unison-finale'|'duet-response';
export type EnsembleSlotV638={slot:number;role:GroupRoleV517;gesture:PartnerGestureCue;
 look:LookAtCue;turnY:number;depthHintZ:number;phase:number};
export type EnsemblePlanV638={active:boolean;pattern:EnsemblePatternV638;
 source:'none'|'authored-singer'|'visual-only';lead:number;slots:EnsembleSlotV638[]};
export type EnsembleGroundV638={active:boolean;phase:string;support:string;gain:number;driftCm:number};
export interface EnsembleInputV638 {
 base:GroupPlanV517;formation?:FormationPlanV495|null;
 trackId?:string|null;cueTrackId?:string|null;count:number;
 seconds:number;progressMs:number;bpm?:number|null;
 positions:readonly (readonly number[])[];
 playing:boolean;reducedMotion:boolean;manualPriority:boolean;
 tier:'low'|'balanced'|'high';beat:number;energy:number;footLocked:boolean;
 genre?:string|null;risks?:readonly (GroupRiskV517|undefined)[];
}
const clamp=(value:number,min:number,max:number)=>Number.isFinite(value)?Math.min(max,Math.max(min,value)):min;
const smooth=(n:number)=>{const t=clamp(n,0,1);return t*t*(3-2*t);};
const off=():EnsemblePlanV638=>({active:false,pattern:'off',source:'none',lead:-1,slots:[]});
const validPosition=(p:readonly number[]|undefined)=>!!p&&p.length>=3&&p.slice(0,3).every(Number.isFinite);
/** Every song timestamp has a stable phase: seek / replay cannot leave a
 * stale transition. One gesture arc lasts four to eight actual beats. */
export function ensemblePhraseV638(seconds:number,period:number,offset:number):number{
 if(!Number.isFinite(seconds)||seconds<0||!Number.isFinite(period)||period<=0||!Number.isFinite(offset))return 0;
 const phase=((seconds/period-offset)%1+1)%1;
 return smooth(phase<.5?2*phase:2*(1-phase));
}
export function planAdvancedEnsembleV638(input:EnsembleInputV638):EnsemblePlanV638 {
 const {base,count,seconds,progressMs,positions}=input;
 if(!base?.active||base.source==='none'||!input.trackId?.trim()||
    !input.playing||input.reducedMotion||input.manualPriority||input.tier==='low'||
    !Number.isInteger(count)||count<2||count>4||base.slots.length!==count||
    !Number.isInteger(base.lead)||base.lead<0||base.lead>=count||
    base.slots.some((s,i)=>!s||s.slot!==i)||
    positions.length<count||!positions.slice(0,count).every(validPosition)||
    !Number.isFinite(seconds)||seconds<0||!Number.isFinite(progressMs)||progressMs<0||
    // Prevent mixing another song's vocal clock with current-stage choreography.
    Math.abs(progressMs-seconds*1000)>850||
    !Number.isFinite(input.energy)||input.energy<0||input.energy>1||
    !Number.isFinite(input.beat)||input.beat<0||input.beat>1)return off();
 const authored=base.source==='authored-singer';
 if(authored?(!input.cueTrackId||input.cueTrackId!==input.trackId):
    (count<3||!input.formation?.active||input.formation.lead!==base.lead||
     input.formation.slots.length!==count))return off();
 const period=Number.isFinite(input.bpm)&&input.bpm!>0?
   clamp(480/(input.bpm as number),3.8,8.2):5.1;
 const phraseNumber=Math.floor(seconds/period);
 const pattern:EnsemblePatternV638=authored&&count===2?'duet-response':
   base.scene==='hook'&&phraseNumber%3===2?'unison-finale':
   base.scene==='hook'||base.scene==='drop'?'alternating-wings':'lead-counterpoint';
 const gain=(input.tier==='balanced'?.48:1)*
   (.25+.40*smooth(input.energy)+.35*smooth(input.beat))*
   (input.genre==='deutschrap'?.78:input.genre==='hardtekk'?1:.88);
 const source=base.source;
 const slots=base.slots.map((s,i):EnsembleSlotV638=>{
   const isLead=i===base.lead;
   const relative=(i-base.lead+count)%count;
   const risk=input.risks?.[i];
   // Malformed measurements are not proof of clearance. Missing reports can
   // still use the older V517 fallbacks; explicitly invalid ones are vetoed.
   const riskValid=!risk||(Number.isFinite(risk.risk)&&risk.risk>=0&&risk.risk<=1&&
      Number.isFinite(risk.accentScale)&&Number.isFinite(risk.gestureScale));
   const clearance=(riskValid?1:0)*clamp(1-clamp(risk?.risk??0,0,1)*1.9,0,1)*
      clamp(risk?.accentScale??1,0,1)*clamp(risk?.gestureScale??1,0,1);
   const group=pattern==='unison-finale';
   const offset=group ? (.10+(.025*i)) :pattern==='duet-response'?(isLead?.12:.60):
      pattern==='alternating-wings'?(relative%2===0?.12:.53):
      (isLead?.08:.43+relative*.07);
   const phase=ensemblePhraseV638(seconds,period,offset);
   const roleGain=s.role==='lead'?1:s.role==='feature'?.81:
       s.role==='chorus'?.77:s.role==='support'?.52:.34;
   const accent=gain*roleGain*phase*clearance;
   // All singers remain in their confirmed roles. Supporting artists get a
   // counter-rhythm, not copied lip-sync or new singer labels.
   const left=(relative+phraseNumber)%2===0;
   const gesture:PartnerGestureCue={
     leftLift:clamp(accent*(left?.022:.007),0,.022),
     rightLift:clamp(accent*(left?.007:.022),0,.022),
     shoulder:clamp(accent*(group?.014:.011),0,.014),
     lean:clamp(accent*(isLead?-.003:.003),-.003,.003),
     intensity:clamp(accent*.038,0,.038),
   };
   // Never manufacture a new eye target. Only a V517-approved, non-zero gaze
   // to an existing lead may receive a tiny additive same-direction glance.
   const approvedLook=s.look;
   const permitted=!!approvedLook&&Number.isFinite(approvedLook.yaw)&&
      Number.isFinite(approvedLook.weight)&&approvedLook.weight>0&&
      Math.abs(approvedLook.yaw)>.00001;
   const yaw=permitted?Math.sign(approvedLook.yaw)*Math.min(.006,accent*.006):0;
   const look:LookAtCue={yaw,pitch:0,eyeYaw:yaw*.16,
      weight:permitted?clamp(accent*.014,0,.014):0};
   // Existing X-lanes are immutable. A shallow front/back visual arc applies
   // ONLY to automatic, un-authored 3/4-person ensembles; V494's own contact
   // diagnostic and V506/V508 risk must still approve each millimetre.
   const desired=pattern==='unison-finale'?(isLead?-.036:.023):
       pattern==='alternating-wings'?(isLead?-.048:relative%2===0?.030:.010):
       isLead?-.043:.029;
   const depthHintZ=!authored&&count>=3&&!input.footLocked&&riskValid&&
      (risk?.risk??0)<.12?clamp(desired*accent,-.049,.031):0;
   const turnY=!authored&&!isLead&&base.scene==='verse'&&permitted?
      clamp(yaw*.36,-.003,.003):0;
   return {slot:i,role:s.role,gesture,look,turnY,depthHintZ,phase};
 });
 return {active:true,pattern,source,lead:base.lead,slots};
}
/** Planted feet, missing V494 diagnostics, proximity risk or manual/singer
 * formations cannot introduce any further stage-root translation. */
export function safeEnsembleDepthV638(plan:EnsemblePlanV638,
 slot:EnsembleSlotV638|undefined,ground:EnsembleGroundV638|undefined,
 risk:GroupRiskV517|undefined):number {
 if(!plan.active||plan.source!=='visual-only'||!slot||
    !ground?.active||!Number.isFinite(ground.gain)||
    !Number.isFinite(ground.driftCm)||ground.driftCm<0||ground.driftCm>3.5||
    ground.phase==='lowering'||ground.phase==='rising'||ground.phase==='low'||
    ground.support==='both'||
    (risk&&(!Number.isFinite(risk.risk)||risk.risk<0||risk.risk>=.12||
     !Number.isFinite(risk.accentScale)||!Number.isFinite(risk.gestureScale))))return 0;
 const factor=ground.support==='none'?.29:.18;
 return clamp(slot.depthHintZ*clamp(ground.gain,0,1)*factor,-.014,.01);
}
