import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { retargetHumanoidClips } from "./avatarAnimationRetarget";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export type MotionInspection = { names: string[]; durations: number[]; tracks: number[]; matched: number; skipped: number; total: number; status: "unknown" | "compatible" | "partial" | "incompatible" };
const loader = new GLTFLoader();
export function readGLB(url: string): Promise<GLTF> {
  return new Promise((resolve, reject) => loader.load(url, resolve, undefined, reject));
}
/** Advisory only: name-based matching, not a guarantee of realistic animation. */
export async function inspectMotion(motionUrl: string, avatarUrl?: string): Promise<MotionInspection> {
  const motion = await readGLB(motionUrl);
  const names = motion.animations.map((clip, i) => clip.name || `Clip ${i + 1}`);
  const durations = motion.animations.map(clip => clip.duration);
  const tracks = motion.animations.map(clip => clip.tracks.length);
  if (!avatarUrl) return { names, durations, tracks, matched: 0, skipped: 0, total: 0, status: "unknown" };
  const avatar = await readGLB(avatarUrl);
  const report = retargetHumanoidClips(motion.animations, motion.scene, avatar.scene).report;
  return {
    names, durations, tracks,
    matched: report.matchedTracks, skipped: report.skippedTracks, total: report.totalTracks,
    status: report.matchedTracks === 0 ? "incompatible" : report.skippedTracks > 0 ? "partial" : "compatible",
  };
}
/** Exports only the explicitly selected clip, while retaining its source rig. */
export async function isolateMotionClip(url: string, clipIndex: number, originalName: string): Promise<File> {
  const gltf = await readGLB(url);
  const clip = gltf.animations[clipIndex];
  if (!clip) throw new Error("Animationsclip nicht gefunden");
  const exported = await new GLTFExporter().parseAsync(gltf.scene, { binary: true, animations: [clip], onlyVisible: false, trs: true });
  if (!(exported instanceof ArrayBuffer)) throw new Error("GLB-Export fehlgeschlagen");
  const base = originalName.replace(/\.glb$/i, "").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 36);
  return new File([exported], `${base}-clip-${clipIndex + 1}.glb`, { type: "model/gltf-binary" });
}
