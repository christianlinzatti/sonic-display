/** V495 — automatic, additive multi-GLB ensemble direction.
 * This never alters the authored V326 cue layout, a GLB clip, bone transforms,
 * the V494 foot solver, recorded vocal roles or the existing animation mixer.
 * Lateral stage lanes (X) are never changed, preserving V326 minimum spacing.
 */
import type {GroupPointV326} from './multiAvatarStageDirectorV326';

export type FormationRoleV495='lead'|'support'|'background';
export type FormationMomentV495='verse'|'hook'|'drop'|'idle';
export type FormationSlotV495={slot:number;role:FormationRoleV495;
 offsetZ:number;turnY:number;leftLift:number;rightLift:number;shoulder:number;lookYaw:number;intensity:number};
export type FormationPlanV495={active:boolean;moment:FormationMomentV495;lead:number;
 slots:FormationSlotV495[]};
export type FormationStateV495={trackId:string;lastSeconds:number;lead:number;leadSince:number;
 lastMoment:FormationMomentV495;fade:number};
export type FormationInputV495={state:FormationStateV495;trackId:string;seconds:number;delta:number;
 count:number;positions:readonly GroupPointV326[];focus:number;section?:string|null;drop:boolean;
 energy:number;beat:number;kick:number;bpm?:number|null;playing:boolean;reducedMotion:boolean;
 automaticGroup:boolean;manualPriority:boolean;footLocked:boolean;quality:string;};
const limit=(value:number,lo:number,hi:number)=>Number.isFinite(value)?Math.min(hi,Math.max(lo,value)):lo;
const smooth=(n:number)=>{const t=limit(n,0,1);return t*t*(3-2*t);};
const safeZero=(slot:number):FormationSlotV495=>({slot,role:'background',offsetZ:0,turnY:0,
 leftLift:0,rightLift:0,shoulder:0,lookYaw:0,intensity:0});
export const newFormationStateV495=():FormationStateV495=>({trackId:'',lastSeconds:-1,lead:0,
 leadSince:0,lastMoment:'idle',fade:0});
function inactive(input:FormationInputV495):{state:FormationStateV495;plan:FormationPlanV495}{
 return {state:newFormationStateV495(),plan:{active:false,moment:'idle',lead:0,
  slots:Array.from({length:Number.isInteger(input.count)?Math.max(0,Math.min(4,input.count)):0},(_,i)=>safeZero(i))}};
}
/** Smooth phrase-stable lead/support/background interplay for 3/4 automatic
 * dancers only. Explicit singer assignments and manual timeline always win.
 * Changes after seeks and track swaps fade in from zero and cannot reuse state.
 */
export function stepMultiAvatarFormationV495(input:FormationInputV495):{state:FormationStateV495;plan:FormationPlanV495}{
 const {count,seconds,delta}=input;
 if(!input.automaticGroup||input.manualPriority||!input.playing||input.reducedMotion||
    input.quality==='low'||!input.trackId||!Number.isFinite(seconds)||seconds<0||
    !Number.isFinite(delta)||delta<=0||delta>.25||(count!==3&&count!==4)||
    input.positions.length<count||!input.positions.slice(0,count).every(p=>
      p.length===3&&p.every(Number.isFinite)))return inactive(input);
 const reset=input.state.trackId!==input.trackId||input.state.lastSeconds<0||
    seconds<input.state.lastSeconds-.15||seconds-input.state.lastSeconds>.8;
 const before=reset?newFormationStateV495():input.state;
 const section=(input.section??'').toLowerCase();
 const moment:FormationMomentV495=input.drop||section.includes('drop')?'drop':
    section.includes('hook')||section.includes('chorus')||section.includes('refrain')?'hook':'verse';
 // Only an existing stage focus provides a real explicit lead. Otherwise use a
 // deterministic visual leader — never claim to identify the recorded singer.
 const focal=Number.isInteger(input.focus)&&input.focus>=0&&input.focus<count?input.focus:-1;
 const phrasePeriod=Math.max(6,Math.min(12,Number.isFinite(input.bpm??NaN)&&input.bpm!>0?
   60/(input.bpm as number)*16:8));
 const candidate=focal>=0?focal:Math.floor(Math.max(0,seconds)/phrasePeriod)%count;
 // Never flicker singer/visual leader inside a short music phrase. A provided
 // stage focus does still take precedence when the group itself changes cue.
 const change=reset||focal>=0&&candidate!==before.lead||
    candidate!==before.lead&&seconds-before.leadSince>=Math.max(5,phrasePeriod*.65);
 const lead=change?candidate:before.lead;
 const leadSince=change?seconds:before.leadSince;
 const fade=reset?0:limit(before.fade+delta/(moment===before.lastMoment?.45:.75),0,1);
 const strength=smooth(fade)*(.35+.65*limit(input.energy,0,1));
 const accent=limit(Math.max(input.beat,input.kick),0,1);
 const rhythm=smooth(accent);
 const slots=Array.from({length:count},(_,slot):FormationSlotV495=>{
  const role:FormationRoleV495=slot===lead?'lead':slot===(lead+1)%count?'support':'background';
  const relative=(slot-lead+count)%count;
  // Z-only offsets: no lane crossing. All dancers regain the original cue
  // positions automatically as soon as the director is disabled.
  const base=moment==='drop'?role==='lead'?-.075:role==='support'?-.015:.045:
   moment==='hook'?-.04:role==='lead'?-.075:role==='support'?-.025:.025;
  const dropPulse=moment==='drop'?rhythm*.032:moment==='hook'?rhythm*.012:0;
  const offsetZ=input.footLocked?0:limit((base-dropPulse)*strength,-.11,.065);
  const stagger=moment==='verse'?(relative===1?1:relative===0?-.5:-.4):0;
  const beatGesture=moment==='drop'?(.45+.55*rhythm):moment==='hook'?(.35+.65*rhythm):(.22+.78*rhythm);
  const intensity=limit(strength*beatGesture*(role==='lead'?1:role==='support'?.7:.42),0,.9);
  return {slot,role,offsetZ,turnY:limit(stagger*.038*strength,-.04,.04),
   lookYaw:role==='lead'?0:limit(Math.sign(lead-slot)*.075*strength,-.075,.075),
   leftLift:limit((role==='support'?.033:role==='lead'?.018:.011)*intensity,0,.038),
   rightLift:limit((role==='lead'?.042:role==='support'?.014:.009)*intensity,0,.045),
   shoulder:limit((moment==='drop'?.025:.012)*intensity,-.03,.03),intensity:.095*intensity};
 });
 return {state:{trackId:input.trackId,lastSeconds:seconds,lead,leadSince,lastMoment:moment,fade},
  plan:{active:true,moment,lead,slots}};
}

/** V494 owns planted-foot safety. V495 only makes an additive stage-root offset
 * when the existing V494 diagnostics indicate a safe moving or supported foot.
 * There is no second IK or fabricated contact signal.
 */
export function safeFormationTravelV495(slot:FormationSlotV495|undefined,ground:{
 active:boolean;phase:string;support:string;gain:number;driftCm:number}|undefined):number{
 if(!slot||!ground?.active||!Number.isFinite(ground.gain)||
    ground.phase==='lowering'||ground.phase==='rising'||ground.phase==='low'||
    ground.support==='both'||!Number.isFinite(ground.driftCm)||ground.driftCm>4)return 0;
 const factor=ground.support==='none'?.48:.28;
 return limit(slot.offsetZ*limit(ground.gain,0,1)*factor,-.055,.04);
}
