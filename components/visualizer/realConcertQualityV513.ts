/** V513 – independent, preview-only spatial projection and collision report.
 * Real preview capsules are measured from cloned, *animated* bones via V508.
 * No inference of actual mesh collisions; absent samples remain unknown.
 */
import {planAnimatedCollisionV508,type MotionSampleV508} from './animatedCollisionV508';
import type {VisualFrameV512} from './visualConcertQualityV512';
export type PreviewTierV513='high'|'balanced'|'low';
export type PreviewPiV513='off'|'balanced'|'eco';
export type PreviewPositionV513=readonly [number,number,number];
export interface PreviewStageV513 {points:readonly PreviewPositionV513[];rescaled:boolean;}
export interface PreviewReportV513 {checkedPairs:number;possiblePairs:number;nearPairs:number;maxRisk:number;risks:readonly (number|null)[];status:'unavailable'|'partial'|'checked';}
const finite=(v:number)=>Number.isFinite(v)&&Math.abs(v)<1e4;
const clamp=(v:number,a:number,b:number)=>Math.min(b,Math.max(a,v));
/** Preserve relative stage positions whenever they fit. Large recorded stages
 * are uniformly scaled to the 3D preview footprint, never silently clipped.
 */
export function previewStageV513(frame:VisualFrameV512|undefined):PreviewStageV513 {
 const points=frame?.positions??[];
 if(points.length<2||points.length>4||!points.every(p=>p.length===3&&p.every(finite)))return {points:[],rescaled:false};
 const cx=points.reduce((a,p)=>a+p[0],0)/points.length;
 const cz=points.reduce((a,p)=>a+p[2],0)/points.length;
 const span=Math.max(1,...points.map(p=>Math.max(Math.abs(p[0]-cx),Math.abs(p[2]-cz))));
 const scale=Math.min(1,2.5/span);
 return {points:points.map(p=>[(p[0]-cx)*scale,0,(p[2]-cz)*scale] as const),rescaled:scale<1};
}
export function previewSampleRateV513(tier:PreviewTierV513,pi:PreviewPiV513,count:number):number {
 if(!Number.isInteger(count)||count<2||count>4||tier==='low')return 0;
 if(pi==='eco')return 2;
 if(pi==='balanced')return tier==='high'?5:3;
 return tier==='high'?8:5;
}
/** Unlike the V512 historical stage-risk report, this report only concerns
 * independently animated preview rigs. No tests => never show 'safe'.
 */
export function previewReportV513(samples:readonly (MotionSampleV508|undefined)[], count:number,at:number,tier:PreviewTierV513):PreviewReportV513 {
 const possiblePairs=Number.isInteger(count)&&count>=2&&count<=4?count*(count-1)/2:0;
 const empty:PreviewReportV513={checkedPairs:0,possiblePairs,nearPairs:0,maxRisk:0,risks:Array.from({length:Math.max(0,Math.min(4,count||0))},()=>null),status:'unavailable'};
 if(!possiblePairs||!Number.isFinite(at)||tier==='low')return empty;
 const plan=planAnimatedCollisionV508({samples,count,now:at,playing:true,reducedMotion:false,manualPriority:false,tier});
 if(plan.pairsChecked===0)return empty;
 // Per-avatar zero can be called clear only when ALL possible pairs have been checked.
 const checked=plan.pairsChecked===possiblePairs;
 const risks=Array.from({length:count},(_,i)=>{
  const value=plan.slots[i]?.risk;
  if(!Number.isFinite(value))return null;
  return (value !== undefined && value > 0)||checked?clamp(value!,0,1):null;
 });
 return {checkedPairs:plan.pairsChecked,possiblePairs,nearPairs:plan.nearPairs,
   maxRisk:Math.max(0,...risks.filter((r):r is number=>r!==null)),risks,status:checked?'checked':'partial'};
}
