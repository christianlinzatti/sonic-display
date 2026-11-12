import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

const MAX_FBX_BYTES = 25 * 1024 * 1024;
const MAX_GLB_BYTES = 35 * 1024 * 1024;

/** Browser-only import of a user-provided Mixamo animation; no Adobe credentials or scraping. */
export async function convertMixamoFbxToGlb(file: File): Promise<File> {
  if (!/\.fbx$/i.test(file.name) || file.size < 100 || file.size > MAX_FBX_BYTES) {
    throw new Error("Eine Mixamo-FBX zwischen 100 Byte und 25 MB auswählen.");
  }
  const header = new TextDecoder().decode(await file.slice(0, 128).arrayBuffer()).replace(/^\uFEFF/, "");
  if (!header.startsWith("Kaydara FBX Binary") && !/^;\s*FBX\b/i.test(header)) {
    throw new Error("Die Datei besitzt keinen erkennbaren FBX-Header.");
  }

  // Loading the FBX libraries only on explicit import keeps the stage and Pi
  // startup free from a heavyweight converter.
  const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js");
  const source = new FBXLoader().parse(await file.arrayBuffer(), "");
  const clips = source.animations.slice(0, 64);
  if (!clips.length || !clips.some(clip => clip.tracks.some(track => /\.quaternion$/.test(track.name)))) {
    throw new Error("Keine kompatiblen Skelett-Animationen in dieser FBX gefunden.");
  }
  if (source.animations.length > 64) {
    throw new Error("Maximal 64 Clips pro FBX; bitte kleinere Dateien exportieren.");
  }

  // Preserve source bones/rest pose. They are needed for the existing runtime
  // retargeter; stripping the skeleton produces misleading 'valid' GLB files.
  const exported = await new GLTFExporter().parseAsync(source, {
    binary: true, animations: clips, onlyVisible: false, trs: true,
  });
  if (!(exported instanceof ArrayBuffer) || exported.byteLength > MAX_GLB_BYTES) {
    throw new Error("Konvertierte GLB ist ungültig oder über 35 MB. In Mixamo möglichst 'Without Skin' exportieren.");
  }
  // GLTFExporter can silently omit unsupported tracks; never upload a clipless
  // GLB based only on a successful parseAsync call.
  const view = new DataView(exported);
  if (exported.byteLength < 20 || view.getUint32(0, true) !== 0x46546c67 ||
      view.getUint32(4, true) !== 2 || view.getUint32(8, true) !== exported.byteLength ||
      view.getUint32(16, true) !== 0x4e4f534a) {
    throw new Error("Die Konvertierung hat keine gültige GLB erzeugt.");
  }
  const jsonBytes = view.getUint32(12, true);
  if (jsonBytes <= 0 || jsonBytes > exported.byteLength - 20) {
    throw new Error("Die erzeugte GLB enthält keine gültige JSON-Struktur.");
  }
  const gltf = JSON.parse(new TextDecoder().decode(new Uint8Array(exported, 20, jsonBytes))) as {
    animations?: { channels?: unknown[] }[];
  };
  if (!gltf.animations?.some(animation => (animation.channels?.length ?? 0) > 0)) {
    throw new Error("Nach der Konvertierung sind keine abspielbaren Animationsspuren vorhanden.");
  }

  const base = file.name.replace(/\.fbx$/i, "").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 38) || "mixamo";
  return new File([exported], `${base}-mixamo.glb`, { type: "model/gltf-binary" });
}
