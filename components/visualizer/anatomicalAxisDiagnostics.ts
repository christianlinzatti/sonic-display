/** V156: conservative diagnostic recommendations for IK hinge axes.
 * Suggestions never modify runtime constraints without an explicit user action.
 */
import { Bone, Vector3, type Object3D } from "three";
import { inferAnatomicalHinge, type AnatomicalJointKind } from "./anatomicalJointAxes";
import { DEFAULT_JOINT_LIMITS, type JointAxis, type JointLimits } from "./jointConstraintCalibration";

export type AxisDiagnostic = {
  bone: string;
  kind: AnatomicalJointKind;
  axis: [number, number, number];
  confidence: number;
  suggestedAxis: JointAxis | null;
  maxDeltaDegrees: number;
  warning: string | null;
};
const COMPONENTS: JointAxis[] = ["x", "y", "z"];
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export function diagnosticsForRig(root: Object3D): AxisDiagnostic[] {
  const result: AxisDiagnostic[] = [];
  root.traverse(node => {
    if (!(node instanceof Bone)) return;
    const hinge = inferAnatomicalHinge(node);
    if (!hinge) return;
    const a = hinge.localAxis;
    const values = [a.x, a.y, a.z];
    const best = values.reduce((i, v, j) => Math.abs(v) > Math.abs(values[i]) ? j : i, 0);
    const aligned = Math.abs(values[best]) >= 0.82 && hinge.confidence >= 0.5;
    result.push({
      bone: node.name,
      kind: hinge.kind,
      axis: [a.x, a.y, a.z],
      confidence: clamp(hinge.confidence, 0, 1),
      suggestedAxis: aligned ? COMPONENTS[best] : null,
      maxDeltaDegrees: Math.round(hinge.maxDeltaRadians * 180 / Math.PI),
      warning: !aligned ? "Achse nicht eindeutig einer lokalen XYZ-Achse zuordenbar; manuell prüfen." : null,
    });
  });
  return result;
}
/** Compose a per-joint XYZ editor suggestion. Does NOT write to localStorage.
 * The recommended limits apply to IK deltas, not a full anatomical range.
 */
export function proposeJointLimits(d: AxisDiagnostic): JointLimits | null {
  if (!d.suggestedAxis || d.confidence < 0.5) return null;
  const result: JointLimits = JSON.parse(JSON.stringify(DEFAULT_JOINT_LIMITS));
  for (const axis of COMPONENTS) {
    // Hinge-only suggestion suppresses off-axis IK rotation.
    result[axis] = axis === d.suggestedAxis
      ? { min: -d.maxDeltaDegrees, max: d.maxDeltaDegrees, preview: 0 }
      : { min: 0, max: 0, preview: 0 };
  }
  return result;
}
export function axisEndPoint(origin: Vector3, axis: Vector3, size = 0.3): Vector3 {
  return origin.clone().add(axis.clone().normalize().multiplyScalar(size));
}
