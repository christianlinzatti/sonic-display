/** V511: low-rate, factual diagnostics of the existing V508 capsule checks.
 * No GPU/mesh collision claims and no ownership of IK, clips or stage roots.
 */
import type {AnimatedCollisionPlanV508} from './animatedCollisionV508';
import type {PiConcertBudgetV479} from '../../services/monitoring/piConcertBudgetV479';
export type StageSafetyReadingV511=Readonly<{
 at:number;source:'duo'|'group';avatars:number;checkedPairs:number;possiblePairs:number;
 nearPairs:number;maxRisk:number;closestSurface:number|null;
}>;
export type StageSafetySnapshotV511=Readonly<{readings:readonly StageSafetyReadingV511[];lastAt:number}>;
export const STAGE_SAFETY_LIMIT_V511=45;
export const EMPTY_STAGE_SAFETY_V511:StageSafetySnapshotV511={readings:[],lastAt:0};
const clamp=(n:number,low:number,high:number)=>Math.max(low,Math.min(high,n));
/** Critical lip sync / foot locks are excluded. Only *optional* V508 bones are sampled less on Pi. */
export function optionalBodySampleHzV511(tier:'high'|'balanced'|'low',budget:Pick<PiConcertBudgetV479,'enabled'|'level'>,avatars:number):number{
 if(tier==='low')return 0;
 const baseline=tier==='high'?12:7;
 if(!budget.enabled||!Number.isInteger(avatars)||avatars<3||avatars>4)return baseline;
 return budget.level==='eco'?4:budget.level==='balanced'?Math.min(baseline,6):baseline;
}
export function captureStageSafetyV511(previous:StageSafetySnapshotV511,
 input:{at:number;source:'duo'|'group';avatars:number;plan:AnimatedCollisionPlanV508;playing:boolean;visible:boolean}
):StageSafetySnapshotV511{
 const {at,avatars,plan}=input;
 if(!input.playing||!input.visible||!Number.isSafeInteger(at)||at<=0||at<=previous.lastAt||
   (previous.lastAt>0&&at-previous.lastAt<950)||!Number.isInteger(avatars)||avatars<2||avatars>4||
   !plan||!Number.isInteger(plan.pairsChecked)||!Number.isInteger(plan.nearPairs)||
   plan.pairsChecked<0||plan.pairsChecked>avatars*(avatars-1)/2||
   plan.nearPairs<0||plan.nearPairs>plan.pairsChecked||
   (input.source!=='duo'&&input.source!=='group'))return previous;
 const risks=plan.slots.map(s=>s.risk);
 if(risks.some(r=>!Number.isFinite(r)||r<0||r>1))return previous;
 const surfaces=plan.slots.map(s=>s.closestSurface).filter(Number.isFinite);
 const reading:StageSafetyReadingV511={at,source:input.source,avatars,
   checkedPairs:plan.pairsChecked,possiblePairs:avatars*(avatars-1)/2,
   nearPairs:plan.nearPairs,maxRisk:clamp(risks.length?Math.max(...risks):0,0,1),
   closestSurface:surfaces.length?Math.min(...surfaces):null};
 return {readings:[...previous.readings,reading].slice(-STAGE_SAFETY_LIMIT_V511),lastAt:at};
}
export type StageSafetyStatusV511='no-data'|'unverified'|'partial'|'close'|'measured';
export function stageSafetyStatusV511(snapshot:StageSafetySnapshotV511,now:number):{
 status:StageSafetyStatusV511;latest:StageSafetyReadingV511|null;details:string;
}{
 const latest=snapshot.readings[snapshot.readings.length-1]??null;
 if(!latest||!Number.isFinite(now)||now-latest.at<0||now-latest.at>5000)
   return {status:'no-data',latest:null,details:'Keine aktuellen Kapselmessungen.'};
 if(latest.checkedPairs===0)return {status:'unverified',latest,details:'Kein vollständiges Paar mit aktuellen GLB-Knochenmessungen geprüft.'};
 if(latest.nearPairs>0||latest.maxRisk>=.5)return {status:'close',latest,details:'Mindestens eine Arm-/Oberkörper-Kapsel nähert sich einer anderen.'};
 if(latest.checkedPairs<latest.possiblePairs)return {status:'partial',latest,details:'Nur ein Teil der Avatar-Paare konnte geprüft werden.'};
 return {status:'measured',latest,details:'Alle Avatar-Paare wurden mit vereinfachten GLB-Kapseln geprüft.'};
}
