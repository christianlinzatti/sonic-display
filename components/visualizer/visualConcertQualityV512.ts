/** V512: compact, read-only storyboard snapshots from V511's accepted 1 Hz samples.
 * Positions and V508 risk are observed, NEVER used to control animations.
 */
import {optionalBodySampleHzV511,type StageSafetyReadingV511} from './concertStageQualityV511';
import type {AnimatedCollisionPlanV508} from './animatedCollisionV508';
export type StagePointV512=readonly [number,number,number];
export interface VisualFrameV512 {
 at:number;source:'duo'|'group';positions:readonly StagePointV512[];
 risks:readonly (number|null)[];checkedPairs:number;possiblePairs:number;nearPairs:number;
 maxRisk:number;closestSurface:number|null;
}
export const MAX_VISUAL_FRAMES_V512=45;
export type VisualHistoryV512=readonly VisualFrameV512[];
const finite=(n:number)=>Number.isFinite(n)&&Math.abs(n)<100;
const clamp=(n:number,low:number,high:number)=>Math.max(low,Math.min(high,n));
/** Only accepted readings from the existing V511 1-Hz gate are eligible.
 * Missing GLB samples remain NULL, never reported as collision-free.
 */
export function appendVisualFrameV512(history:VisualHistoryV512,reading:StageSafetyReadingV511,
 positions:readonly (readonly number[])[]|undefined,plan:AnimatedCollisionPlanV508):VisualHistoryV512{
 const n=reading.avatars;
 if(!Number.isSafeInteger(reading.at)||reading.at<=0||history.length>0&&reading.at<=history[history.length-1].at||
   n<2||n>4||!Number.isInteger(n)||!Array.isArray(positions)||positions.length!==n||
   !positions.every(p=>Array.isArray(p)&&p.length===3&&p.every(finite))||
   !Number.isInteger(reading.checkedPairs)||reading.checkedPairs<0||reading.checkedPairs>n*(n-1)/2||
   !Number.isInteger(reading.nearPairs)||reading.nearPairs<0||reading.nearPairs>reading.checkedPairs||
   !Number.isFinite(reading.maxRisk)||reading.maxRisk<0||reading.maxRisk>1||
   !plan||!Array.isArray(plan.slots)||plan.slots.length>n)return history;
 const risks=Array.from({length:n},(_,i)=>{
   const risk=plan.slots[i]?.risk;
   return reading.checkedPairs===0||!Number.isFinite(risk)||risk===undefined||risk===0&&reading.checkedPairs<reading.possiblePairs?null:clamp(risk,0,1);
 });
 const next:VisualFrameV512={at:reading.at,source:reading.source,
   positions:positions.map(p=>[p[0],p[1],p[2]] as const),risks,
   checkedPairs:reading.checkedPairs,possiblePairs:n*(n-1)/2,nearPairs:reading.nearPairs,
   maxRisk:reading.maxRisk,closestSurface:reading.closestSurface};
 return [...history,next].slice(-MAX_VISUAL_FRAMES_V512);
}
export type DemoScenarioV512='duet'|'crossing'|'formation';
/** Explicit simulation, NEVER passed off as real stage measurements. */
export function demoStageV512(count:number,phase:number,scenario:DemoScenarioV512):VisualFrameV512{
 const n=Number.isInteger(count)?clamp(count,2,4):2;
 const t=clamp(Number.isFinite(phase)?phase:0,0,1);
 const spread=scenario==='crossing'?.78:n===2?1.45:n===3?1.28:1.12;
 const positions=Array.from({length:n},(_,i):StagePointV512=>{
   const x=(i-(n-1)/2)*spread;
   const z=scenario==='duet'?-.15*Math.cos(t*Math.PI*2+i*Math.PI/2):
     scenario==='crossing'?(i%2===0?1:-1)*(.85-1.7*t):
       (i%2===0?-.65:.65)+Math.sin(t*Math.PI*2+i*.8)*.12;
   const slide=scenario==='crossing'&&i%2===0?Math.sin(t*Math.PI)*.36:0;
   return [x+slide,0,z];
 });
 const risks=positions.map((p,i)=>{
   let nearest=Infinity;
   positions.forEach((q,j)=>{if(i!==j)nearest=Math.min(nearest,Math.hypot(p[0]-q[0],p[2]-q[2]));});
   return clamp((1.5-nearest)/.8,0,1);
 });
 return {at:0,source:n===2?'duo':'group',positions,risks,
   checkedPairs:n*(n-1)/2,possiblePairs:n*(n-1)/2,
   nearPairs:risks.some(r=>r>.5)?1:0,maxRisk:Math.max(...risks),closestSurface:null};
}
/** Viewport is a top-down schematic, not a measured bone/mesh projection. */
export function schematicPointsV512(frame:VisualFrameV512):readonly {x:number;y:number;risk:number|null}[]{
 return frame.positions.map((p,i)=>({
   x:clamp(230+p[0]*72,32,428),
   y:clamp(135+p[2]*51,25,245),
   risk:frame.risks[i]??null,
 }));
}
export function qualityComparisonV512(count:number,pi:'off'|'balanced'|'eco'){
 return (['high','balanced','low'] as const).map(tier=>{
   const hz=optionalBodySampleHzV511(tier,{enabled:pi!=='off',level:pi==='off'?'full':pi},count);
   return {tier,hz,maxAvatarReadsPerSecond:hz*count,
     detail:hz===0?'Knochenkollision nicht geprüft':`${hz} Hz · höchstens ${hz*count} Avatar-Abtastungen/s`};
 });
}
