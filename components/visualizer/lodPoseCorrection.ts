import { Quaternion } from "three";
import type { LodPoseSample } from "./lodContinuityDiagnostics";

/** Apply a bounded correction only when both rigs share an identifiable bone.
 * Local-space rotations are used; mismatched rest poses are not force-aligned.
 */
export function correctedLodQuaternion(current:Quaternion, reference:readonly number[], maxErrorDeg=30, maxStepDeg=5, influence=0.25):Quaternion|null {
  if(reference.length!==4 || reference.some(v=>!Number.isFinite(v)) || !Number.isFinite(current.lengthSq()) || current.lengthSq()<1e-10) return null;
  const target=new Quaternion(reference[0],reference[1],reference[2],reference[3]);
  if(target.lengthSq()<1e-10) return null;
  target.normalize();
  const angle=current.angleTo(target);
  if(!Number.isFinite(angle) || angle>maxErrorDeg*Math.PI/180 || angle<0.001) return null;
  // Approach at most 5 degrees per rendered frame, with a gentle 25% influence.
  return current.clone().rotateTowards(target,Math.min(maxStepDeg*Math.PI/180,angle*Math.max(0,Math.min(0.5,influence))));
}
export function applyLodPoseCorrection(bones:Record<string,Quaternion>, reference:LodPoseSample, enabled=true, influence=0.25) {
  if(!enabled) return 0;
  let changed=0;
  for(const [name,q] of Object.entries(bones)) {
    const source=reference.bones[name];
    if(!source) continue;
    const next=correctedLodQuaternion(q,source,30,5,influence);
    if(next) {q.copy(next); changed++;}
  }
  return changed;
}
