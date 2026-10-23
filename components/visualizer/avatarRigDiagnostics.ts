import type { AnimationClip, Object3D } from "three";

export type DiagnosticSeverity = "good" | "warning" | "info";
export type RigDiagnostic = { severity: DiagnosticSeverity; title: string; detail: string };
export type DiagnosticClip = { name: string; duration: number; tracks: number; matched: number; missing: string[]; translations: number };
export type RigDiagnosticReport = { boneCount: number; skinnedMeshes: number; recognized: string[]; clips: DiagnosticClip[]; findings: RigDiagnostic[] };

const aliases: Record<string, string[]> = {
  hips: ["hips", "pelvis", "mixamorighips"],
  spine: ["spine", "spine1", "lowerback"],
  chest: ["chest", "spine2", "upperchest"],
  head: ["head"],
  leftUpperArm: ["leftupperarm", "leftarm", "lupperarm", "upperarml"],
  rightUpperArm: ["rightupperarm", "rightarm", "rupperarm", "upperarmr"],
  leftLowerArm: ["leftlowerarm", "leftforearm", "lforearm", "lowerarml"],
  rightLowerArm: ["rightlowerarm", "rightforearm", "rforearm", "lowerarmr"],
  leftHand: ["lefthand", "lhand", "handl"],
  rightHand: ["righthand", "rhand", "handr"],
  leftUpperLeg: ["leftupperleg", "leftupleg", "leftthigh", "lthigh", "upperlegl"],
  rightUpperLeg: ["rightupperleg", "rightupleg", "rightthigh", "rthigh", "upperlegr"],
  leftLowerLeg: ["leftlowerleg", "leftleg", "leftshin", "lshin", "lowerlegl"],
  rightLowerLeg: ["rightlowerleg", "rightleg", "rightshin", "rshin", "lowerlegr"],
  leftFoot: ["leftfoot", "lfoot", "footl"],
  rightFoot: ["rightfoot", "rfoot", "footr"],
  leftToe: ["lefttoe", "lefttoebase", "ltoe"],
  rightToe: ["righttoe", "righttoebase", "rtoe"],
};

const normalize = (s: string) => s.toLowerCase().replace(/^.*[|:]/, "").replace(/[^a-z0-9]/g, "");
const semantic = (s: string) => Object.keys(aliases).find(key => aliases[key].includes(normalize(s))) ?? null;
const trackNode = (path: string) => {
  const match = /^(.*)\.(quaternion|position|scale|morphTargetInfluences)$/.exec(path);
  if (!match) return { node: path, property: "unknown" };
  return { node: match[1].replace(/^.*\.bones\[([^\]]+)\]$/, "$1"), property: match[2] };
};

export function diagnoseAvatarRig(targetScene: Object3D, clips: readonly AnimationClip[], sourceScene?: Object3D): RigDiagnosticReport {
  const targets = new Set<string>(); const sources = new Set<string>();
  let skinnedMeshes = 0;
  targetScene.traverse(node => { if ((node as { isBone?: boolean }).isBone) targets.add(node.name); if ((node as { isSkinnedMesh?: boolean }).isSkinnedMesh) skinnedMeshes++; });
  sourceScene?.traverse(node => { if ((node as { isBone?: boolean }).isBone) sources.add(node.name); });
  const targetSemantics = new Set([...targets].map(semantic).filter((v): v is string => Boolean(v)));
  const findings: RigDiagnostic[] = [];
  const push = (severity: DiagnosticSeverity, title: string, detail: string) => findings.push({ severity, title, detail });
  if (!targets.size) push("warning", "Keine Bones erkannt", "Dieses Modell hat kein erkennbares Bone-Rig. Two-Bone Foot IK und humanoides Retargeting sind hier nicht verfügbar.");
  else push("good", "Skelett erkannt", `${targets.size} Bones und ${skinnedMeshes} Skinned Meshes gefunden.`);
  for (const side of ["left", "right"] as const) {
    const missing = [`${side}UpperLeg`, `${side}LowerLeg`, `${side}Foot`].filter(part => !targetSemantics.has(part));
    if (missing.length) push("warning", `${side === "left" ? "Linkes" : "Rechtes"} Bein: Foot IK unvollständig`, `Nicht erkannt: ${missing.join(", ")}. Prüfe Bone-Namen oder Rig-Mapping.`);
    else push("good", `${side === "left" ? "Linkes" : "Rechtes"} Bein bereit`, "Oberschenkel, Unterschenkel und Fuß erkannt. Die tatsächliche Fußstabilität muss in der Vorschau geprüft werden.");
  }
  const clipReports = clips.map(clip => {
    let matched = 0, translations = 0;
    const missing = new Set<string>();
    for (const track of clip.tracks) {
      const parsed = trackNode(track.name);
      if (parsed.property === "position") translations++;
      // Embedded clips bind by exact bone or scene-node names. Imported clips are retargeted by semantic bone name.
      const hasDirect = targets.has(parsed.node) || Boolean(targetScene.getObjectByName(parsed.node));
      const meaning = semantic(parsed.node);
      const hasSemantic = Boolean(meaning && targetSemantics.has(meaning));
      const sourceKnown = !sourceScene || sources.has(parsed.node) || [...sources].some(n => normalize(n) === normalize(parsed.node));
      if (hasDirect || (sourceScene && hasSemantic && sourceKnown && parsed.property === "quaternion")) matched++;
      else missing.add(parsed.node);
    }
    return { name: clip.name || "Unbenannter Clip", duration: clip.duration, tracks: clip.tracks.length, matched, missing: [...missing].slice(0, 12), translations };
  });
  if (clipReports.length === 0) push("info", "Keine Animationsclips", "Das GLB enthält keine Animationen. Lade ein separates Animations-GLB oder verwende eine prozedurale Bewegung.");
  for (const clip of clipReports) {
    if (clip.missing.length) push("warning", `Clip „${clip.name}“: mögliche Binding-Probleme`, `${clip.matched}/${clip.tracks} Spuren passen nach Namen. Nicht zugeordnet: ${clip.missing.join(", ")}.`);
    else if (clip.tracks) push("good", `Clip „${clip.name}“`, `Alle ${clip.tracks} Spuren sind namentlich zuordenbar.`);
    if (sourceScene && clip.translations) push("info", `Positionsspuren in „${clip.name}“`, `${clip.translations} Positionsspuren erkannt. Der konservative V88-Retargeter überträgt aus importierten Clips nur Quaternion-Spuren; Root-Motion kann fehlen.`);
  }
  push("info", "Foot Sliding", "Diese statische Analyse misst kein tatsächliches Fußgleiten. Nutze die V92-Vorschau mit/ohne IK und prüfe Kontaktphasen visuell.");
  return { boneCount: targets.size, skinnedMeshes, recognized: [...targetSemantics], clips: clipReports, findings };
}
