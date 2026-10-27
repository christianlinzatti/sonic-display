/** V552 – Raspberry Pi transparent-mesh draw-call protection.
 * An alpha-blended object can still incur draw calls and overdraw at opacity 0.
 * Keep a tiny dead band with hysteresis, without altering choreography,
 * lip-sync, lyrics clocks, camera directions or user-authored effects.
 * Runs on existing renderer frames; no timers or allocations required.
 */
export type PiAlphaLevelV552='full'|'balanced'|'eco';
export function shouldDrawTransparentV552(
 opacity:number, wasVisible:boolean, piEnabled:boolean,
 level:PiAlphaLevelV552, authored:boolean,
):boolean {
 if(!Number.isFinite(opacity)||opacity<=0)return false;
 // Manual timelines and explicit lighting always retain their faint details.
 const cutoff=authored||!piEnabled?0.0001:level==='eco'?0.006:level==='balanced'?0.002:0.0001;
 // Re-enter only above the threshold and hide after falling below half of it.
 return wasVisible?opacity>=cutoff*0.5:opacity>=cutoff;
}
/** Cheap, allocation-free guard for unchanged spotlight world matrices.
 * Does not freeze fixture intensity, color, motion or animated cast tracking.
 */
export function needsSpotTargetMatrixV552(previousX:number,targetX:number):boolean {
 return Number.isFinite(targetX)&&(!Number.isFinite(previousX)||Math.abs(targetX-previousX)>0.0001);
}
/** Lightweight invariant used by the inactive-FX path. */
export function shouldSkipDormantFxV552(enabled:boolean,wasEnabled:boolean):boolean {
 return !enabled&&!wasEnabled;
}
