import { useSyncExternalStore } from "react";
import type { FootIKState } from "./avatarFootIK";
import type { HandIKRig, HandIKState, PartnerHandCue } from "./partnerHandIK";

/** Diagnostic-only feedback. No automatic changes to calibrated values or authored clips. */
export type IKQualitySnapshot = {
  dancer: string; frames: number; plantedFrames: number; slideMean: number;
  handErrorMean: number | null; handFrames: number; correctionMean: number;
  recommendations: string[];
};
const EMPTY: IKQualitySnapshot = { dancer: "—", frames: 0, plantedFrames: 0, slideMean: 0, handErrorMean: null, handFrames: 0, correctionMean: 0, recommendations: [] };
let current: IKQualitySnapshot = EMPTY;
const listeners = new Set<() => void>();
export const subscribeIKQuality = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const getIKQualitySnapshot = () => current;
export const getIKQualityServerSnapshot = () => EMPTY;
export const useIKQuality = () => useSyncExternalStore(subscribeIKQuality, getIKQualitySnapshot, getIKQualityServerSnapshot);
export type IKQualitySampler = { time: number; frames: number; planted: number; slide: number; handFrames: number; handError: number; correction: number };
export const createIKQualitySampler = (): IKQualitySampler => ({time:0, frames:0, planted:0, slide:0, handFrames:0, handError:0, correction:0});
const safe = (n: number) => Number.isFinite(n) && n >= 0 ? n : 0;
const round = (n: number) => Math.round(n * 1000) / 1000;
/** Feet are measured in model world units per second. Hand error is world-space distance. */
export function sampleIKQuality(s: IKQualitySampler, input: {
  dancer: string; dt: number; active: boolean; foot: FootIKState;
  rig: HandIKRig; handState: HandIKState; cue: PartnerHandCue;
}) {
  const {dancer, dt, active, foot, rig, handState, cue} = input;
  if (!active || !Number.isFinite(dt) || dt <= 0 || dt > 0.25) {
    Object.assign(s, createIKQualitySampler());
    return;
  }
  s.time += dt;
  s.frames++;
  for (const leg of [foot.left, foot.right]) {
    if (!leg || leg.contact.phase !== "planted") continue;
    leg.ankle.updateWorldMatrix(true, false);
    const pos = leg.ankle.getWorldPosition(leg.previous.clone());
    const distance = pos.distanceTo(leg.planted);
    if (Number.isFinite(distance)) { s.slide += distance; s.planted++; }
  }
  if (cue.enabled && cue.target.every(Number.isFinite) && rig.hand) {
    rig.hand.updateWorldMatrix(true, false);
    const pos = rig.hand.getWorldPosition(rig.hand.position.clone());
    const [x,y,z] = cue.target;
    const distance = Math.hypot(pos.x-x,pos.y-y,pos.z-z);
    if (Number.isFinite(distance)) { s.handError += distance; s.handFrames++; }
  }
  const u = 2 * Math.acos(Math.max(-1, Math.min(1, Math.abs(handState.upperOffset.w))));
  const l = 2 * Math.acos(Math.max(-1, Math.min(1, Math.abs(handState.lowerOffset.w))));
  s.correction += safe(u) + safe(l);
  // Throttle store updates so that a 60 FPS render loop does not trigger React renders each frame.
  if (s.time < 1) return;
  const slideMean = s.planted ? s.slide/s.planted : 0;
  const handErrorMean = s.handFrames ? s.handError/s.handFrames : null;
  const correctionMean = s.frames ? s.correction/s.frames : 0;
  const recommendations: string[] = [];
  if (s.planted && slideMean > .045) recommendations.push("Fußanker prüfen: Bodenkontakt-Sensitivität und Lock-Stärke vorsichtig kalibrieren.");
  if (handErrorMean !== null && handErrorMean > .18) recommendations.push("Handziel wird häufig verfehlt: Partnerabstand und Reichweiten-Kalibrierung prüfen.");
  if (correctionMean > .15) recommendations.push("Starke Hand-IK-Korrektur: IK-Intensität oder Gestenstärke reduzieren.");
  current = { dancer, frames:s.frames, plantedFrames:s.planted, slideMean:round(slideMean), handErrorMean:handErrorMean === null ? null : round(handErrorMean), handFrames:s.handFrames, correctionMean:round(correctionMean), recommendations };
  for(const fn of listeners) fn();
  Object.assign(s, createIKQualitySampler());
}
