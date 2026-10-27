/** V509 – Natural Ensemble Choreography.
 * Extra phrase-synchronised stage-expression layer, not a second animation mixer.
 * For automatic 3/4-person ensembles V495 supplies a visual (NOT inferred vocal)
 * lead and V494 authorises optional Z travel. For a two-person performance only
 * V504's explicitly track-matched singer interactions can activate this layer.
 * V506/V508 collision risk suppresses new accents. Nothing writes GLB bones,
 * contact/foot IK, manual authoring, or any lateral root coordinates.
 */
import type {FormationPlanV495} from './multiAvatarFormationDirectorV495';
import type {StageInteractionPlanV504} from './naturalMultiAvatarStageInteractionV504';
import type {LookAtCue} from './partnerLookAtEngine';
import type {PartnerGestureCue} from './partnerGestureEngine';

export type EnsembleKindV509='off'|'verse'|'hook'|'drop'|'duet'|'reply';
export type EnsembleSlotV509={slot:number;offsetZ:number;turnY:number;look:LookAtCue;gesture:PartnerGestureCue;phase:number};
export type EnsemblePlanV509={active:boolean;kind:EnsembleKindV509;lead:number;slots:EnsembleSlotV509[]};
export type EnsembleGroundV509={active:boolean;phase:string;support:string;gain:number;driftCm:number};
export type EnsembleRiskV509={risk:number;accentScale:number;gestureScale:number};
export interface EnsembleInputV509 {
 mode:'automatic-group'|'authored-duet';count:number;trackId?:string|null;
 cueTrackId?:string|null;seconds:number;bpm?:number|null;
 positions:readonly (readonly [number,number,number])[];
 playing:boolean;reducedMotion:boolean;manualPriority:boolean;
 tier:'low'|'balanced'|'high';beat:number;energy:number;footLocked?:boolean;
 formation?:FormationPlanV495;interaction?:StageInteractionPlanV504;
 risks?:readonly (EnsembleRiskV509|undefined)[];
}
const clamp=(x:number,lo:number,hi:number)=>Number.isFinite(x)?Math.max(lo,Math.min(hi,x)):lo;
const smooth=(x:number)=>{const n=clamp(x,0,1);return n*n*(3-2*n);};
const zeroLook=():LookAtCue=>({yaw:0,pitch:0,eyeYaw:0,weight:0});
const zeroGesture=():PartnerGestureCue=>({leftLift:0,rightLift:0,shoulder:0,lean:0,intensity:0});
const off=():EnsemblePlanV509=>({active:false,kind:'off',lead:-1,slots:[]});
const validPoint=(p:readonly number[])=>p?.length===3&&p.every(Number.isFinite);
/** An intentionally slow, triangular/smooth choreographic phrase, never a
 * per-word/syllable twitch; offsets are relative to the current song clock. */
export function ensemblePulseV509(seconds:number,period:number,delay:number):number{
 if(!Number.isFinite(seconds)||seconds<0||!Number.isFinite(period)||period<=0)return 0;
 const phase=((((seconds/period-delay)%1)+1)%1);
 return smooth(phase<.5?phase*2:(1-phase)*2);
}
export function planNaturalEnsembleV509(input:EnsembleInputV509):EnsemblePlanV509 {
 const {count,positions,seconds}=input;
 if(!input.trackId?.trim()||!input.playing||input.reducedMotion||input.manualPriority||
    input.tier==='low'||!Number.isFinite(seconds)||seconds<0||
    !Number.isFinite(input.beat)||!Number.isFinite(input.energy)||
    !Number.isInteger(count)||count<2||count>4||positions.length<count||
    !positions.slice(0,count).every(validPoint))return off();
 const grouped=input.mode==='automatic-group';
 const formed=input.formation;
 const authored=input.interaction;
 if(grouped?count<3||!formed?.active||formed.slots.length!==count||
             !Number.isInteger(formed.lead)||formed.lead<0||formed.lead>=count:
    count!==2||!authored?.active||authored.slots.length!==count||
    !input.cueTrackId||input.cueTrackId!==input.trackId)return off();
 const authoredLead=authored?.slots.findIndex(s=>s.intent==='lead'||s.intent==='duet')??-1;
 // A track-matched all-singer chorus has no distinct lead: the first
 // performer is used only as a visual phase anchor, not a singer identity.
 const lead=grouped?formed!.lead:authored!.kind==='hook'?0:authoredLead;
 if(lead<0)return off();
 const kind:EnsembleKindV509=grouped?(formed!.moment==='drop'?'drop':formed!.moment==='hook'?'hook':'verse'):
   authored!.kind==='reply'?'reply':authored!.kind==='hook'?'hook':authored!.kind==='solo'?'verse':'duet';
 const tier=input.tier==='balanced'?.55:1;
 const energy=smooth(input.energy);
 const intensity=tier*(.26+.44*energy+.3*smooth(input.beat));
 // Musical phrase, approximately eight beats (at most one complete gesture
 // arc every ~3–6 seconds), rather than tightly coupled to rapid rap words.
 const period=Number.isFinite(input.bpm)&&input.bpm!>0?
   clamp(480/(input.bpm as number),3.2,6):4.2;
 const slots=Array.from({length:count},(_,slot):EnsembleSlotV509=>{
   const relative=(slot-lead+count)%count;
   const isLead=slot===lead;
   const pulse=ensemblePulseV509(seconds,period,grouped?relative*.145:(isLead?.12:.42));
   const risk=input.risks?.[slot];
   const clearance=clamp(1-(risk?.risk??0)*1.4,0,1)*
     clamp(risk?.accentScale??1,0,1)*clamp(risk?.gestureScale??1,0,1);
   const amplitude=intensity*pulse*clearance;
   const roleGain=grouped?(isLead?1:relative===1?.72:.48):isLead?1:.66;
   const accent=amplitude*roleGain;
   const dx=positions[lead][0]-positions[slot][0];
   const distance=Math.hypot(dx,positions[lead][2]-positions[slot][2]);
   const turn=grouped&&kind==='verse'&&!isLead&&distance>.9&&distance<6?
      clamp(Math.atan2(dx,3)*.075*accent,-.052,.052):0;
   // Hooks face the audience. Non-leading group performers only glance a few
   // degrees toward the V495 visual lead; no vocal identity is inferred.
   const lookYaw=grouped&&!isLead&&kind==='verse'&&distance>.9&&distance<6?
      clamp(Math.atan2(dx,3)*.11*accent,-.072,.072):0;
   const look:LookAtCue={yaw:lookYaw,pitch:0,eyeYaw:lookYaw*.18,weight:clamp(accent*.12,0,.09)};
   const gesture:PartnerGestureCue={
     leftLift:clamp((relative%2===0?.015:.006)*accent,0,.022),
     rightLift:clamp((relative%2===1?.015:.008)*accent,0,.022),
     shoulder:clamp((kind==='drop'?.016:.009)*accent,0,.019),
     lean:clamp((isLead?-.004:.004)*accent,-.005,.005),
     intensity:clamp(.041*accent,0,.045),
   };
   // Small depth choreography for automatic groups ONLY. Opposite depth
   // bands create a shallow arc, never cross existing X lanes. The V494
   // physical safety gate is applied later, and risks >= 0.12 veto travel.
   const band=kind==='hook'?(Math.abs(slot-(count-1)/2)<.75?-.045:.025):
      kind==='drop'?(isLead?-.050:.018):(isLead?-.042:relative===1?-.015:.032);
   const offsetZ=grouped&&!input.footLocked&&
      (risk?.risk??0)<.12?clamp(band*amplitude,-.053,.037):0;
   return {slot,offsetZ,turnY:turn,look,gesture,phase:pulse};
 });
 return {active:true,kind,lead,slots};
}
/** Reuses the exact *observed* V494 foot-contact authority. Missing/locked
 * reports, planted feet, severe proximity or large drift never move a root.
 * Returns Z-only displacement (max 2 cm) and never modifies a saved cue. */
export function safeEnsembleTravelV509(slot:EnsembleSlotV509|undefined,
 ground:EnsembleGroundV509|undefined,risk:EnsembleRiskV509|undefined):number{
 if(!slot||!ground?.active||!Number.isFinite(ground.gain)||
    !Number.isFinite(ground.driftCm)||ground.driftCm>3.5||
    ground.phase==='lowering'||ground.phase==='rising'||ground.phase==='low'||
    ground.support==='both'||(risk?.risk??0)>=.12)return 0;
 const multiplier=ground.support==='none'?.4:.23;
 return clamp(slot.offsetZ*clamp(ground.gain,0,1)*multiplier,-.02,.02);
}
