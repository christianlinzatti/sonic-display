/** V153 editor-only constraints. Angles are degrees, XYZ local Euler axes. */
export type JointAxis = "x" | "y" | "z";
export type JointRange = { min: number; max: number; preview: number };
export type JointLimits = Record<JointAxis, JointRange>;
export type JointConstraintMap = Record<string, JointLimits>;
export const DEFAULT_JOINT_LIMITS: JointLimits = {
  x: { min: -45, max: 45, preview: 0 },
  y: { min: -45, max: 45, preview: 0 },
  z: { min: -45, max: 45, preview: 0 },
};
export const jointConstraintKey = (url: string) => `sonic-display:v153:joints:${url}`;
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
export const clampAngle = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const normalizeAxis = (input: unknown): JointRange => {
  const v = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const min = finite(v.min) ? clampAngle(v.min, -180, 180) : -45;
  const max = finite(v.max) ? clampAngle(v.max, min, 180) : 45;
  const lo = Math.min(min, max), hi = Math.max(min, max);
  return { min: lo, max: hi, preview: clampAngle(finite(v.preview) ? v.preview : 0, lo, hi) };
};
export const normalizeJointLimits = (value: unknown): JointLimits => {
  const obj = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return { x: normalizeAxis(obj.x), y: normalizeAxis(obj.y), z: normalizeAxis(obj.z) };
};
export const normalizeConstraintMap = (value: unknown): JointConstraintMap => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const entries = Object.entries(value).slice(0, 512);
  const result: JointConstraintMap = {};
  for (const [name, limits] of entries) {
    if (!name || name.length > 255 || name === "__proto__" || name === "constructor" || name === "prototype") continue;
    Object.defineProperty(result, name, { value: normalizeJointLimits(limits), enumerable: true, writable: true, configurable: true });
  }
  return result;
};
export const setJointAxis = (current: JointLimits, axis: JointAxis, field: keyof JointRange, raw: number): JointLimits => {
  const old = current[axis], next = { ...old, [field]: Number.isFinite(raw) ? raw : old[field] };
  if (field === "min") next.min = Math.min(next.min, next.max);
  if (field === "max") next.max = Math.max(next.min, next.max);
  return { ...current, [axis]: normalizeAxis(next) };
};
