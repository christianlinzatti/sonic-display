/** V487 – bounded observation and safe optional travel damping.
 * Measured IK world-space contact data are model-relative ESTIMATES, not a
 * physical sole collision sensor. This planner never edits clips, pelvis, IK
 * constraints or original formation targets. Pure and deterministic.
 */
import type {FootworkSlotV486} from './advancedDanceFootworkV486';
export type GroundObservationV487={
 tracked:boolean;leftPlanted:boolean;rightPlanted:boolean;
 leftConfidence:number;rightConfidence:number;
 leftDriftCm:number;rightDriftCm:number;
};
export type GroundContactAssessmentV487={
 status:'unavailable'|'airborne'|'stable'|'watch'|'drifting';
 support:'none'|'left'|'right'|'both';driftCm:number;confidence:number;
 travelMultiplier:number;
};
const clamp=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,x));
const safe=(x:number)=>Number.isFinite(x)?x:0;
export const emptyGroundObservationV487=():GroundObservationV487=>({tracked:false,leftPlanted:false,rightPlanted:false,leftConfidence:0,rightConfidence:0,leftDriftCm:0,rightDriftCm:0});
export function assessGroundContactV487(observation:GroundObservationV487,footwork:FootworkSlotV486,enabled=true):GroundContactAssessmentV487{
 const empty:GroundContactAssessmentV487={status:'unavailable',support:'none',driftCm:0,confidence:0,travelMultiplier:1};
 if(!enabled||!observation.tracked)return empty;
 const left=observation.leftPlanted&&safe(observation.leftConfidence)>=.35;
 const right=observation.rightPlanted&&safe(observation.rightConfidence)>=.35;
 const support=left&&right?'both':left?'left':right?'right':'none';
 if(support==='none')return {...empty,status:'airborne'};
 const confidence=clamp(Math.max(left?safe(observation.leftConfidence):0,right?safe(observation.rightConfidence):0),0,1);
 const driftCm=clamp(Math.max(left?safe(observation.leftDriftCm):0,right?safe(observation.rightDriftCm):0),0,99);
 const status=driftCm>=4?'drifting':driftCm>=1.5?'watch':'stable';
 const optionalTravel=Math.abs(footwork.offsetX)+Math.abs(footwork.offsetZ)>.00001;
 // V486 already damps both planted feet to 0.12. V487 only additionally
 // reduces OPTIONAL auto-stage travel when genuine anchor drift is observed.
 // Keep a nonzero path for normal return; never mask or zero authored poses.
 const travelMultiplier=optionalTravel&&status!=='stable'?status==='drifting'?.32:.65:1;
 return {status,support,driftCm:Math.round(driftCm*10)/10,confidence:Math.round(confidence*100)/100,travelMultiplier};
}
export type GroundContactReportV487={count:number;slots:GroundContactAssessmentV487[];active:boolean};
export function buildGroundContactReportV487(observations:readonly GroundObservationV487[],footwork:readonly FootworkSlotV486[],count:number,enabled=true):GroundContactReportV487{
 const length=Number.isInteger(count)?clamp(count,0,4):0;
 const slots=Array.from({length},(_,i)=>assessGroundContactV487(observations[i]??emptyGroundObservationV487(),
  footwork[i]??{offsetX:0,offsetZ:0,liftLeft:0,liftRight:0,rootSpeed:1,weightShift:0},enabled));
 return {count:length,slots,active:enabled&&slots.some(s=>s.status!=='unavailable')};
}
export const GROUND_CONTACT_REPORT_EVENT_V487='sonic:ground-contact-report-v487';
