/** V148: bounded, pose-preserving torso assistance for reachable partner hand cues. */
import { Quaternion, Vector3, type Object3D } from "three";
export type PartnerTorsoRig = { chest?: Object3D; spine?: Object3D; upper?: Object3D; hand?: Object3D };
export type PartnerTorsoState = { offset: Quaternion; node?: Object3D; blend: number };
export const createPartnerTorsoState = (): PartnerTorsoState => ({offset: new Quaternion(), blend: 0});
const jointPosition = new Vector3();
const handPosition = new Vector3();
const targetPosition = new Vector3();
const direction = new Vector3();
const parentRotation = new Quaternion();
const relativeRotation = new Quaternion();
const deltaRotation = new Quaternion();
const neutral = new Quaternion();
export const clamp01 = (n: number) => Number.isFinite(n) ? Math.min(1,Math.max(0,n)) : 0;
export function contactAssistWeight(distance: number, reach: number, strength: number): number {
  if (![distance,reach,strength].every(Number.isFinite) || reach < 0.05 || distance < 0) return 0;
  // Only assist near the normal reach envelope. Never bend toward an impossible target.
  const extension = clamp01((distance / reach - 0.65) / 0.6);
  const unreachable = 1 - clamp01((distance / reach - 1.35) / 0.25);
  return clamp01(strength) * extension * unreachable;
}
/** Undo the additive offset before applying this frame's new target. */
export function resetPartnerTorso(rig: PartnerTorsoRig, state: PartnerTorsoState): void {
  const node = state.node;
  if (node) node.quaternion.premultiply(state.offset.clone().invert());
  state.offset.identity(); state.node = undefined;
}
export function updatePartnerTorso(rig: PartnerTorsoRig, state: PartnerTorsoState, target: readonly [number,number,number], strength: number, delta: number, reachScale = 1): boolean {
  resetPartnerTorso(rig,state);
  const node = rig.chest ?? rig.spine;
  if (!node || !rig.upper || !rig.hand || !target.every(Number.isFinite)) { state.blend = 0; return false; }
  rig.upper.updateWorldMatrix(true,true);
  rig.upper.getWorldPosition(jointPosition);
  rig.hand.getWorldPosition(handPosition);
  targetPosition.set(target[0],target[1],target[2]);
  const reach = handPosition.distanceTo(jointPosition);
  const distance = targetPosition.distanceTo(jointPosition);
  const requested = contactAssistWeight(distance,reach * (Number.isFinite(reachScale) ? Math.max(0.65,Math.min(1.45,reachScale)) : 1),strength);
  const dt = Number.isFinite(delta) ? Math.min(0.1,Math.max(0,delta)) : 0;
  state.blend += (requested - state.blend) * (1 - Math.exp(-8*dt));
  if (state.blend < 0.002 || distance < 0.0001) return false;
  // Turn the torso slightly toward the partner without fighting the original clip.
  node.getWorldPosition(jointPosition);
  direction.subVectors(targetPosition,jointPosition);
  if (direction.lengthSq() < 1e-8) return false;
  node.getWorldQuaternion(parentRotation);
  const forward = new Vector3(0,0,1).applyQuaternion(parentRotation);
  forward.y = 0; direction.y = 0;
  if (forward.lengthSq() < 1e-8 || direction.lengthSq() < 1e-8) return false;
  forward.normalize(); direction.normalize();
  const signedAngle = Math.atan2(forward.x*direction.z-forward.z*direction.x,forward.dot(direction));
  const yaw = Math.max(-0.09, Math.min(0.09, signedAngle * state.blend * 0.2));
  if (!Number.isFinite(yaw) || Math.abs(yaw) < 0.00001) return false;
  deltaRotation.setFromAxisAngle(new Vector3(0,1,0),yaw);
  node.parent?.getWorldQuaternion(parentRotation);
  if (!node.parent) parentRotation.identity();
  relativeRotation.copy(parentRotation).invert().multiply(deltaRotation).multiply(parentRotation);
  node.quaternion.premultiply(relativeRotation);
  state.offset.copy(relativeRotation); state.node = node;
  node.updateWorldMatrix(false,true);
  return true;
}
