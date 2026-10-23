import { AnimationClip, Bone, Quaternion, QuaternionKeyframeTrack, Euler, type Object3D } from "three";

/** A conservative name-based humanoid retargeter. It deliberately does not synthesize missing joints. */
export const aliases: Record<string, string[]> = {
  hips: ["hips", "pelvis", "root", "mixamorighips"],
  spine: ["spine", "spine1", "lowerback"],
  chest: ["spine2", "chest", "upperchest", "upperback"],
  neck: ["neck"], head: ["head"],
  leftshoulder: ["leftshoulder", "leftclavicle", "lclavicle", "shoulderl"],
  rightshoulder: ["rightshoulder", "rightclavicle", "rclavicle", "shoulderr"],
  leftupperarm: ["leftarm", "leftupperarm", "lupperarm", "upperarml"],
  rightupperarm: ["rightarm", "rightupperarm", "rupperarm", "upperarmr"],
  leftlowerarm: ["leftforearm", "leftlowerarm", "lforearm", "lowerarml"],
  rightlowerarm: ["rightforearm", "rightlowerarm", "rforearm", "lowerarmr"],
  lefthand: ["lefthand", "lhand", "handl"],
  righthand: ["righthand", "rhand", "handr"],
  leftupperleg: ["leftupleg", "leftupperleg", "leftthigh", "lthigh", "upperlegl"],
  rightupperleg: ["rightupleg", "rightupperleg", "rightthigh", "rthigh", "upperlegr"],
  leftlowerleg: ["leftleg", "leftlowerleg", "leftshin", "lshin", "lowerlegl"],
  rightlowerleg: ["rightleg", "rightlowerleg", "rightshin", "rshin", "lowerlegr"],
  leftfoot: ["leftfoot", "lfoot", "footl"],
  rightfoot: ["rightfoot", "rfoot", "footr"],
  lefttoe: ["lefttoebase", "lefttoe", "ltoe"],
  righttoe: ["righttoebase", "righttoe", "rtoe"],
};

export function normalized(name: string): string {
  return name.toLowerCase().replace(/^.*[|:]/, "").replace(/[^a-z0-9]/g, "");
}
export function semantic(name: string): string | null {
  const n = normalized(name);
  for (const [key, names] of Object.entries(aliases)) if (names.includes(n)) return key;
  return null;
}
function bonesByName(scene: Object3D): Map<string, Bone> {
  const bones = new Map<string, Bone>();
  scene.traverse(object => { if ((object as Bone).isBone) bones.set(object.name, object as Bone); });
  return bones;
}
function resolveTrackName(trackName: string): { node: string; property: string } | null {
  // Three.js GLTF tracks typically use `BoneName.quaternion`; Blender may include armature prefixes.
  const match = /^(.*)\.(quaternion|position|scale)$/.exec(trackName);
  if (!match) return null;
  const node = match[1].replace(/^.*\.bones\[([^\]]+)\]$/, "$1");
  return { node, property: match[2] };
}

export type RetargetCalibration = { enabled: boolean; mapping: Record<string, string>; rotation: Record<string, [number, number, number]> };
export const RETARGET_EVENT = "sonic:retarget-calibration";
const KEY = "sonic:retarget:v103:";
export const defaultCalibration = (): RetargetCalibration => ({ enabled: true, mapping: {}, rotation: {} });
export function readRetargetCalibration(modelUrl: string): RetargetCalibration {
  if (typeof window === "undefined") return defaultCalibration();
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY + modelUrl) || "null");
    if (!raw || typeof raw !== "object") return defaultCalibration();
    const mapping: Record<string, string> = {};
    const rotation: Record<string, [number, number, number]> = {};
    for (const [key, val] of Object.entries(raw.mapping || {})) if (key in aliases && typeof val === "string" && val.length < 180) mapping[key] = val;
    for (const [key, val] of Object.entries(raw.rotation || {})) if (key in aliases && Array.isArray(val) && val.length === 3 && val.every(x => typeof x === "number" && Number.isFinite(x) && Math.abs(x) <= 180)) rotation[key] = val as [number,number,number];
    return { enabled: raw.enabled !== false, mapping, rotation };
  } catch { return defaultCalibration(); }
}
export function saveRetargetCalibration(modelUrl: string, calibration: RetargetCalibration): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY + modelUrl, JSON.stringify(calibration));
  window.dispatchEvent(new CustomEvent(RETARGET_EVENT, { detail: modelUrl }));
}
export function humanoidBoneNames(scene: Object3D): string[] { return [...bonesByName(scene).keys()]; }

export type RetargetReport = { matchedTracks: number; skippedTracks: number; totalTracks: number };
export function retargetHumanoidClips(
  clips: readonly AnimationClip[], sourceScene: Object3D, targetScene: Object3D, calibration: RetargetCalibration = defaultCalibration(),
): { clips: AnimationClip[]; report: RetargetReport } {
  const sourceBones = bonesByName(sourceScene);
  const targetBones = bonesByName(targetScene);
  const targetBySemantic = new Map<string, Bone>();
  for (const bone of targetBones.values()) {
    const key = semantic(bone.name);
    if (key && !targetBySemantic.has(key)) targetBySemantic.set(key, bone);
  }
  let matchedTracks = 0, skippedTracks = 0, totalTracks = 0;
  const output = clips.map(clip => {
    const converted = [];
    const used = new Set<string>();
    for (const track of clip.tracks) {
      totalTracks++;
      const parsed = resolveTrackName(track.name);
      if (!parsed || parsed.property !== "quaternion" || !(track instanceof QuaternionKeyframeTrack)) {
        // Exclude translation/scale: these are strongly rig- and proportion-dependent.
        skippedTracks++; continue;
      }
      const source = sourceBones.get(parsed.node) ?? [...sourceBones.values()].find(b => normalized(b.name) === normalized(parsed.node));
      const key = semantic(parsed.node) ?? (source ? semantic(source.name) : null);
      const override = key && calibration.enabled ? calibration.mapping[key] : undefined;
      const target = (override ? targetBones.get(override) : undefined) ?? targetBones.get(parsed.node) ?? (key ? targetBySemantic.get(key) : undefined);
      if (!target || !source || used.has(target.name)) { skippedTracks++; continue; }
      used.add(target.name);
      const values = new Float32Array(track.values.length);
      const sourceRestInverse = source.quaternion.clone().invert();
      const targetRest = target.quaternion.clone();
      const animated = new Quaternion(), result = new Quaternion();
      const angles = key && calibration.enabled ? calibration.rotation[key] : undefined;
      const correction = angles ? new Quaternion().setFromEuler(new Euler(angles[0] * Math.PI / 180, angles[1] * Math.PI / 180, angles[2] * Math.PI / 180, "XYZ")) : null;
      for (let i = 0; i < track.values.length; i += 4) {
        animated.set(track.values[i], track.values[i+1], track.values[i+2], track.values[i+3]).normalize();
        // Local rotation delta from the source rest pose, applied to the target rest pose.
        result.copy(targetRest).multiply(sourceRestInverse).multiply(animated);
        if (correction) result.multiply(correction);
        result.normalize();
        values.set([result.x, result.y, result.z, result.w], i);
      }
      converted.push(new QuaternionKeyframeTrack(`${target.name}.quaternion`, track.times.slice(), values));
      matchedTracks++;
    }
    return new AnimationClip(clip.name, clip.duration, converted);
  }).filter(clip => clip.tracks.length > 0);
  return { clips: output, report: { matchedTracks, skippedTracks, totalTracks } };
}
