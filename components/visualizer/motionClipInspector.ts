import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { retargetHumanoidClips } from "./avatarAnimationRetarget";
import { analyzeGLBMotionClip, type ClipQualityReport } from "./glbMotionQualityAnalyzer";
import { fingerprintAnimationClipV535 } from "./motionLibraryIntelligenceV535";
import { withPrivateGltfV769 } from "./privateGltfLifecycleV769";

export type MotionInspection = { names: string[]; durations: number[]; tracks: number[]; matched: number; skipped: number; total: number; status: "unknown" | "compatible" | "partial" | "incompatible" };
/** Advisory only: name-based matching, not a guarantee of realistic animation. */
export async function inspectMotion(motionUrl: string, avatarUrl?: string): Promise<MotionInspection> {
  return withPrivateGltfV769(motionUrl, async motion => {
    const names = motion.animations.map((clip, i) => clip.name || `Clip ${i + 1}`);
    const durations = motion.animations.map(clip => clip.duration);
    const tracks = motion.animations.map(clip => clip.tracks.length);
    if (!avatarUrl) return { names, durations, tracks, matched: 0, skipped: 0, total: 0, status: "unknown" as const };
    return withPrivateGltfV769(avatarUrl, avatar => {
      const report = retargetHumanoidClips(motion.animations, motion.scene, avatar.scene).report;
      return {names, durations, tracks, matched: report.matchedTracks,
        skipped: report.skippedTracks, total: report.totalTracks,
        status: report.matchedTracks === 0 ? "incompatible" as const : report.skippedTracks > 0 ? "partial" as const : "compatible" as const};
    });
  });
}
/** Exports only the explicitly selected clip, while retaining its source rig. */
export async function isolateMotionClip(url: string, clipIndex: number, originalName: string): Promise<File> {
  return withPrivateGltfV769(url, async gltf => {
    const clip = gltf.animations[clipIndex];
    if (!clip) throw new Error("Animationsclip nicht gefunden");
    const exported = await new GLTFExporter().parseAsync(gltf.scene, { binary: true, animations: [clip], onlyVisible: false, trs: true });
    if (!(exported instanceof ArrayBuffer)) throw new Error("GLB-Export fehlgeschlagen");
    const base = originalName.replace(/\.glb$/i, "").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 36);
    return new File([exported], `${base}-clip-${clipIndex + 1}.glb`, { type: "model/gltf-binary" });
  });
}

/** V533: Inspect ONLY a user-selected clip, keeping cost bounded as the library grows.
 * Heuristic foot-slide and joint warnings are not a rendered visual-quality verdict.
 */
export async function inspectSelectedMotionQualityV533(motionUrl: string, clipIndex: number): Promise<ClipQualityReport> {
  if (!Number.isInteger(clipIndex) || clipIndex < 0 || clipIndex > 1024) throw new Error("Ungültige Animation ausgewählt");
  return withPrivateGltfV769(motionUrl, gltf => {
    const clip=gltf.animations[clipIndex];
    if(!clip)throw new Error("Animationsclip nicht gefunden");
    return analyzeGLBMotionClip(clip);
  });
}

/** V535: fingerprint source clip curves only when a person explicitly inspects a file. */
export async function fingerprintMotionClipsV535(url:string):Promise<(string|undefined)[]> {
  return withPrivateGltfV769(url, async gltf => {
    if(gltf.animations.length>64)throw new Error('Fingerabdrücke sind auf 64 Clips pro GLB begrenzt');
    const result:(string|undefined)[]=[];
    for (const clip of gltf.animations)result.push(await fingerprintAnimationClipV535(clip));
    return result;
  });
}
/** Legacy individual exports must contain exactly one clip to be unambiguous. */
export async function fingerprintInstalledMotionV535(url:string):Promise<string|undefined>{
  return withPrivateGltfV769(url,gltf=>gltf.animations.length===1?fingerprintAnimationClipV535(gltf.animations[0]):undefined);
}
