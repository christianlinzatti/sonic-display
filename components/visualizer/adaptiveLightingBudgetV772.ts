/**
 * V772: one budget for the EXISTING concert lighting rig. This does not create
 * another renderer, frame sampler or timer. The V640 governor supplies the
 * measured, hysteretic pressure level (~1 Hz), while the performance tier is
 * the existing user/auto preference. Count includes only actual Three lights.
 *
 * Priorities: vocalist key + fill first, then one expressive beam, then
 * atmosphere, floor and detail spots. Rock truss uses one actual spotlight;
 * the other two fixtures remain emissive, without costly lighting uniforms.
 * Authored cues / blackouts still own intensity and timing of retained lights.
 */
export type LightingTierV772 = 'high'|'balanced'|'low';
export type LightingPressureV772 = 'full'|'trimmed'|'minimal';
export type LightingBudgetV772 = Readonly<{
  level:'full'|'balanced'|'essential'; maxLights:number;
  key:boolean; fill:boolean; centerSpot:boolean; floor:boolean;
  atmosphereLeft:boolean; atmosphereRight:boolean; detailSpot:boolean;
  rockSpot:boolean;
}>;
// No allocations in useFrame; these six frozen plans are shared by every light.
const BUDGETS:readonly (readonly LightingBudgetV772[])[] = [
  [Object.freeze({level:'essential',maxLights:3,key:true,fill:true,
    centerSpot:false,floor:false,atmosphereLeft:false,atmosphereRight:false,
    detailSpot:false,rockSpot:false}),
   Object.freeze({level:'essential',maxLights:3,key:true,fill:true,
    centerSpot:false,floor:false,atmosphereLeft:false,atmosphereRight:false,
    detailSpot:false,rockSpot:true})],
  [Object.freeze({level:'balanced',maxLights:5,key:true,fill:true,
    centerSpot:true,floor:false,atmosphereLeft:true,atmosphereRight:false,
    detailSpot:false,rockSpot:false}),
   Object.freeze({level:'balanced',maxLights:5,key:true,fill:true,
    centerSpot:true,floor:false,atmosphereLeft:true,atmosphereRight:false,
    detailSpot:false,rockSpot:true})],
  [Object.freeze({level:'full',maxLights:8,key:true,fill:true,
    centerSpot:true,floor:true,atmosphereLeft:true,atmosphereRight:true,
    detailSpot:true,rockSpot:false}),
   Object.freeze({level:'full',maxLights:8,key:true,fill:true,
    centerSpot:true,floor:true,atmosphereLeft:true,atmosphereRight:true,
    detailSpot:true,rockSpot:true})],
];
export function resolveLightingBudgetV772(
  tier:LightingTierV772, pressure:LightingPressureV772, theme:string,
):LightingBudgetV772 {
  // V640 only changes after sustained measured pressure/recovery.
  // Lyrics, dancers, the song clock and authored cue timings are unaffected.
  const requested=tier==='low'?0:tier==='balanced'?1:2;
  const pressureCap=pressure==='minimal'?0:pressure==='trimmed'?1:2;
  return BUDGETS[Math.min(requested,pressureCap)][theme==='rock'?1:0];
}
/** Tests and diagnostics can verify the cap without querying WebGL internals. */
export function plannedLightsV772(budget:LightingBudgetV772):number{
  return Number(budget.key)+Number(budget.fill)+Number(budget.centerSpot)+
    Number(budget.floor)+Number(budget.atmosphereLeft)+
    Number(budget.atmosphereRight)+Number(budget.detailSpot)+Number(budget.rockSpot);
}
