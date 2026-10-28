/** V640 – measured frame-pressure governor for OPTIONAL stage decoration only.
 * Pure policy, advanced from the existing V218/V518 once-per-second frame window.
 * Never modifies lyrics, vocal animation, GLB clips, camera timing, or authored cues.
 * R3F frame delta measures end-to-end frame pacing, NOT GPU execution time.
 */
export type VisualLevelV640='full'|'trimmed'|'minimal';
export type VisualBudgetV640={level:VisualLevelV640;pressureSeconds:number;recoverySeconds:number;cooldownSeconds:number};
export type VisualWindowV640={fps:number;p95FrameMs:number;slowRatio:number;elapsed:number;
  drawCalls:number;triangles:number;playing:boolean;visible:boolean;transitioning?:boolean};
export const initialVisualBudgetV640=():VisualBudgetV640=>({level:'full',pressureSeconds:0,recoverySeconds:0,cooldownSeconds:0});
const finite=(x:number)=>Number.isFinite(x);
const round=(x:number)=>Math.round(x*10000)/10000;
export function measuredPressureV640(w:VisualWindowV640):boolean{
  const strained=w.fps<54||w.p95FrameMs>27||w.slowRatio>.14;
  const busy=w.drawCalls>150||w.triangles>350000;
  const severe=w.fps<43||w.p95FrameMs>39||w.slowRatio>.30;
  return severe||(strained&&busy);
}
export function stepVisualBudgetV640(previous:VisualBudgetV640,w:VisualWindowV640):VisualBudgetV640{
  if(!w.playing||!w.visible||w.transitioning||![w.fps,w.p95FrameMs,w.slowRatio,w.elapsed,w.drawCalls,w.triangles].every(finite)||
    w.fps<=0||w.fps>240||w.p95FrameMs<=0||w.p95FrameMs>250||w.slowRatio<0||w.slowRatio>1||
    w.elapsed<.5||w.elapsed>2.5||w.drawCalls<0||w.triangles<0)return previous;
  const cooldownSeconds=Math.max(0,previous.cooldownSeconds-w.elapsed);
  const pressured=measuredPressureV640(w);
  const healthy=w.fps>=56&&w.p95FrameMs<=22&&w.slowRatio<=.08;
  const pressureSeconds=pressured?Math.min(20,previous.pressureSeconds+w.elapsed):0;
  const recoverySeconds=healthy?Math.min(30,previous.recoverySeconds+w.elapsed):0;
  if(cooldownSeconds===0&&pressureSeconds>=3&&previous.level!=='minimal'){
    return {level:previous.level==='full'?'trimmed':'minimal',pressureSeconds:0,recoverySeconds:0,cooldownSeconds:4};
  }
  if(cooldownSeconds===0&&recoverySeconds>=16&&previous.level!=='full'){
    return {level:previous.level==='minimal'?'trimmed':'full',pressureSeconds:0,recoverySeconds:0,cooldownSeconds:8};
  }
  return {level:previous.level,pressureSeconds:round(pressureSeconds),recoverySeconds:round(recoverySeconds),cooldownSeconds:round(cooldownSeconds)};
}
export type DecorationFactorV640={led:number;gobo:number;haze:number;beams:number};
export const visualFactorsV640=(level:VisualLevelV640):DecorationFactorV640=>
  level==='minimal'?{led:0,gobo:0,haze:.15,beams:.28}:
  level==='trimmed'?{led:.45,gobo:.42,haze:.55,beams:.75}:
  {led:1,gobo:1,haze:1,beams:1};
// Mutable render-loop bridge avoids React commits every frame. Writes only on one-second windows.
let active:VisualLevelV640='full';
export const getVisualLevelV640=():VisualLevelV640=>active;
export const setVisualLevelV640=(level:VisualLevelV640)=>{active=level;};
export const getVisualFactorsV640=():DecorationFactorV640=>visualFactorsV640(active);
