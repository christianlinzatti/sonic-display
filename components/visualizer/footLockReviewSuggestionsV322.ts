/** Phase 1: optional, evidence-gated suggestions for the EXISTING V322
 * foot-lock controls. This module never writes settings, enables IK or
 * treats sampled low feet as confirmed ground contacts.
 */
import type {FootPlantQualityReport} from "./estimatedFootPlantQuality";
import {normalizeFootLockV322,type FootLockSettingsV322} from "./intelligentFootLockV322";

export type FootLockReviewSuggestion = {
  settings:FootLockSettingsV322;
  changeRequired:boolean;
  suspectedIntervals:number;
  observedNearFloorIntervals:number;
  explanation:string;
};

/** Small conservative tuning hint. Deliberately cannot enable V322, increase
 * the correction radius, weaken an already strong user lock, or invent ground.
 * Consumers must require an explicit manual action before saving settings.
 */
export function suggestFootLockFromQualityV322(
  report:FootPlantQualityReport|undefined,
  raw:FootLockSettingsV322,
):FootLockReviewSuggestion|null {
  if(!report||report.status!=="inspect"||
     report.assumption!=="sampled-lowest-foot"||
     !Number.isInteger(report.sampleCount)||report.sampleCount<8)return null;
  const sides=[report.left,report.right];
  const everyFinite=sides.every(side=>
    [side.observedPairs,side.nearFloorPairs,side.nearFloorSeconds,
     side.possibleSlidePairs,side.possibleSlideSeconds,
     side.maxHorizontalSpeedBodyHeightsPerSec].every(n=>Number.isFinite(n)&&n>=0) &&
    Number.isInteger(side.observedPairs)&&Number.isInteger(side.nearFloorPairs)&&
    Number.isInteger(side.possibleSlidePairs)&&side.nearFloorPairs<=side.observedPairs&&
    side.possibleSlidePairs<=side.nearFloorPairs&&
    side.possibleSlideSeconds<=side.nearFloorSeconds+.001);
  if(!everyFinite)return null;
  const observed=sides.reduce((n,side)=>n+side.observedPairs,0);
  const near=sides.reduce((n,side)=>n+side.nearFloorPairs,0);
  const suspected=sides.reduce((n,side)=>n+side.possibleSlidePairs,0);
  const suspectedSeconds=sides.reduce((n,side)=>n+side.possibleSlideSeconds,0);
  // Sparse/ambiguous observations must remain diagnostic only.
  if(observed<12||near<8||suspected<3||
     suspectedSeconds<.10||suspected/near<.15)return null;
  const current=normalizeFootLockV322(raw);
  const settings:FootLockSettingsV322={
    ...current,
    // No automatic enabling. Preserve stronger settings explicitly chosen.
    anchorStrength:Math.max(current.anchorStrength,75),
    // Release sooner when the animation actually lifts its foot.
    releaseSpeed:Math.max(current.releaseSpeed,70),
    // Never enlarge world-space IK correction to chase a presumed sliding foot.
    maxCorrectionCm:Math.min(current.maxCorrectionCm,6),
    // Floor height cannot be inferred robustly from these samples.
    floorTracking:current.floorTracking,
  };
  const changeRequired=Object.keys(settings).some(k=>
    settings[k as keyof FootLockSettingsV322]!==current[k as keyof FootLockSettingsV322]);
  return {
    settings,changeRequired,suspectedIntervals:suspected,observedNearFloorIntervals:near,
    explanation:"Vorsichtiger Einstellvorschlag auf Grundlage geschätzter Fußverschiebungen. Nur nach Sichtprüfung übernehmen; die Einstellungen gelten global und die Fußfixierung wird nicht automatisch eingeschaltet.",
  };
}
