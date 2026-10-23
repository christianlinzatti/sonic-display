import { applyIKJointSafety } from "./ikJointSafety";
import type { JointConstraintMap } from "./jointConstraintCalibration";
import { Quaternion, Vector3, type Object3D } from "three";

/** Conservative two-joint CCD targeting. Targets are expressed in world space. */
export type PartnerHandCue = { enabled: boolean; strength: number; target: [number, number, number] };
export const NEUTRAL_HAND: PartnerHandCue = { enabled: false, strength: 0, target: [0, 0, 0] };
export type HandIKRig = { upper?: Object3D; lower?: Object3D; hand?: Object3D };
export type HandIKState = { upperOffset: Quaternion; lowerOffset: Quaternion; blend: number };
export const createHandIKState = (): HandIKState => ({ upperOffset: new Quaternion(), lowerOffset: new Quaternion(), blend: 0 });
const finite = (n: number) => Number.isFinite(n);
export function handInteractionWeight(scene: string, phase: string, playing: boolean, reducedMotion: boolean, director: boolean, visibility: number) {
  if (!director || !playing || reducedMotion || scene === "solo" || !finite(visibility)) return 0;
  const phaseGain = phase === "together" ? 1 : phase === "greeting" ? 0.45 : 0;
  const sceneGain = scene === "duet" ? 1 : scene === "mirror" ? 0.6 : 0.35;
  return Math.max(0, Math.min(0.65, phaseGain * sceneGain * Math.max(0, Math.min(1, visibility))));
}
const tmpJoint = new Vector3();
const tmpHand = new Vector3();
const targetV = new Vector3();
const from = new Vector3();
const to = new Vector3();
const worldQ = new Quaternion();
const localQ = new Quaternion();
const deltaQ = new Quaternion();
const IDENTITY = new Quaternion();
function aim(joint: Object3D, hand: Object3D, target: Vector3, strength: number, limit: number, previous: Quaternion, constraints?: JointConstraintMap) {
  const baseline = joint.quaternion.clone();
  joint.getWorldPosition(tmpJoint);
  hand.getWorldPosition(tmpHand);
  from.subVectors(tmpHand, tmpJoint);
  to.subVectors(target, tmpJoint);
  if (from.lengthSq() < 1e-6 || to.lengthSq() < 1e-6) return;
  from.normalize(); to.normalize();
  const angle = Math.acos(Math.max(-1, Math.min(1, from.dot(to))));
  if (!finite(angle) || angle < 0.001) return;
  deltaQ.setFromUnitVectors(from, to);
  deltaQ.slerp(IDENTITY, 1 - Math.min(1, angle ? limit / angle : 1) * strength);
  // Convert a world-space rotation into this joint's local parent space.
  joint.parent?.getWorldQuaternion(worldQ);
  if (!joint.parent) worldQ.identity();
  localQ.copy(worldQ).invert().multiply(deltaQ).multiply(worldQ);
  joint.quaternion.premultiply(localQ);
  applyIKJointSafety(joint, baseline, constraints);
  previous.copy(joint.quaternion).multiply(baseline.invert()).normalize();
  joint.updateWorldMatrix(false, true);
}
/** Apply after source animation. Undo our own prior-frame overlay before solving. */
export function updatePartnerHandIK(rig: HandIKRig, state: HandIKState, cue: PartnerHandCue, delta: number, reachScale = 1, constraints?: JointConstraintMap): boolean {
  const upper = rig.upper, lower = rig.lower, hand = rig.hand;
  if (!upper || !lower || !hand) return false;
  upper.quaternion.premultiply(state.upperOffset.clone().invert());
  lower.quaternion.premultiply(state.lowerOffset.clone().invert());
  state.upperOffset.identity(); state.lowerOffset.identity();
  const wanted = cue.enabled && cue.target.every(finite) ? Math.max(0, Math.min(0.65, cue.strength)) : 0;
  const dt = finite(delta) ? Math.max(0, Math.min(0.1, delta)) : 0;
  state.blend += (wanted - state.blend) * (1 - Math.exp(-8 * dt));
  if (state.blend < 0.005) return false;
  targetV.set(...cue.target);
  upper.updateWorldMatrix(true, true);
  upper.getWorldPosition(tmpJoint);
  hand.getWorldPosition(tmpHand);
  const reach = hand.getWorldPosition(tmpHand).distanceTo(tmpJoint);
  // Do not pull limbs across the stage or into impossible IK configurations.
  if (reach < 0.05 || targetV.distanceTo(tmpJoint) > Math.max(0.55, reach * 1.6 * (Number.isFinite(reachScale) ? Math.max(0.65,Math.min(1.45,reachScale)) : 1))) return false;
  aim(lower, hand, targetV, state.blend, 0.10, state.lowerOffset, constraints);
  aim(upper, hand, targetV, state.blend, 0.075, state.upperOffset, constraints);
  return true;
}
