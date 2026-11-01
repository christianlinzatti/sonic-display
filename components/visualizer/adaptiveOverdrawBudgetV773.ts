/** V773 – allocation-free, scene-local transparency budget. The V640 frame governor
 * already measures pressure with hysteresis; no new timers, canvases or samplers.
 * Optional back haze and second light shaft are progressively culled. The
 * primary beam and floor haze retain the original music/lyrics/blackout cues.
 * A manually authored lighting timeline bypasses only the pressure cap, not
 * the user's explicit low/balanced performance tier.
 */
export type OverdrawTierV773 = 'low'|'balanced'|'high';
export type OverdrawPressureV773 = 'full'|'trimmed'|'minimal';
export type OverdrawBudgetV773 = Readonly<{
  level:OverdrawPressureV773;
  rightBeam:boolean;
  backHaze:boolean;
  floorScale:number;
}>;
const LEVELS:readonly OverdrawBudgetV773[] = [
  Object.freeze({level:'minimal',rightBeam:false,backHaze:false,floorScale:.70}),
  Object.freeze({level:'trimmed',rightBeam:false,backHaze:false,floorScale:.86}),
  Object.freeze({level:'full',rightBeam:true,backHaze:true,floorScale:1}),
];
export function resolveOverdrawBudgetV773(tier:OverdrawTierV773,
  pressure:OverdrawPressureV773,authored=false):OverdrawBudgetV773 {
  const tierLimit=tier==='high'?2:tier==='balanced'?1:0;
  const pressureLimit=authored||pressure==='full'?2:pressure==='trimmed'?1:0;
  return LEVELS[Math.min(tierLimit,pressureLimit)];
}
/** Avoid queuing a transparent draw call at 0 opacity; hysteresis is handled by V552. */
export function allowOverdrawLayerV773(draw:boolean,allowed:boolean):boolean {
  return draw&&allowed;
}
