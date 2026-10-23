import { AnimationClip } from "three";

export type AnimationBoneMask = "full" | "upper" | "arms" | "lower";

/** Filter animation tracks by humanoid bone role. No changes to the source GLB. */
export function createMaskedAnimationClip(source: AnimationClip, mask: AnimationBoneMask): AnimationClip | null {
  if (mask === "full") return null;
  const tracks = source.tracks.filter(track => belongsToMask(track.name, mask));
  if (!tracks.length) return null;
  return new AnimationClip(`Masked [${mask}]: ${source.name}`, source.duration, tracks.map(t => t.clone()), source.blendMode);
}

export function belongsToMask(trackName: string, mask: Exclude<AnimationBoneMask,"full">): boolean {
  // Bone property track examples: 'mixamorig:LeftArm.quaternion', 'Armature/Hips.position'.
  const raw = trackName.split(".")[0].split(/[\/|]/).pop() ?? "";
  const bone = raw.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/^(mixamorig|armature|bip001|bip01|valvebiped)/, "");
  // Avoid transforming root motion and morph targets in an isolated limb overlay.
  if (/morphtarget|blendshape|root|hips|pelvis|spinebase/.test(bone)) return false;
  const arm = /(?:shoulder|clavicle|collar|upperarm|lowerarm|forearm|hand|wrist|thumb|index|middle|ring|pinky|finger|arm)/.test(bone);
  const leg = /(?:upleg|upperleg|lowerleg|thigh|calf|shin|leg|foot|ankle|toe|ball)/.test(bone);
  const torso = /(?:spine|chest|neck|head)/.test(bone);
  if (mask === "arms") return arm;
  if (mask === "upper") return arm || torso;
  return leg;
}
