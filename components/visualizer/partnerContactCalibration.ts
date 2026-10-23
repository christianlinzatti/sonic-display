/** V149 – user-adjustable, bounded calibration for mismatched partner rigs. */
import type { PartnerHandCue } from "./partnerHandIK";
export type ContactCalibration = { reach: number; height: number; strength: number };
export const DEFAULT_CONTACT_CALIBRATION: ContactCalibration = {reach:1, height:0, strength:1};
const bounded = (value: number, min: number, max: number, fallback: number) => Number.isFinite(value) ? Math.max(min, Math.min(max,value)) : fallback;
export function normalizeContactCalibration(value?: Partial<ContactCalibration> | null): ContactCalibration {
  return { reach: bounded(value?.reach ?? 1,0.65,1.45,1), height: bounded(value?.height ?? 0,-0.35,0.35,0), strength: bounded(value?.strength ?? 1,0,1.5,1) };
}
export function calibratePartnerCue(cue: PartnerHandCue, value?: Partial<ContactCalibration> | null): PartnerHandCue {
  const settings = normalizeContactCalibration(value);
  return {enabled:cue.enabled, strength: Math.max(0,Math.min(0.65,cue.strength * settings.strength)),
    target:[cue.target[0], cue.target[1]+settings.height, cue.target[2]]};
}
