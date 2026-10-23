/** Separate-file LOD manifest resolution. Path segments must never escape the manifest folder. */
export type LODVariant = { name: string; file: string; triangles?: number; bytes?: number };
export type LODManifest = { schemaVersion: number; source: string; variants: LODVariant[] };
export type PerformanceTier = "high" | "balanced" | "low";
const lodNames = ["LOD0", "LOD1", "LOD2"] as const;
export function normalizeManifest(input: unknown): LODManifest | null {
  if (!input || typeof input !== "object") return null;
  const data = input as Partial<LODManifest>;
  if (data.schemaVersion !== 1 || !Array.isArray(data.variants)) return null;
  const variants: LODVariant[] = [];
  for (const variant of data.variants) {
    if (!variant || !lodNames.includes(variant.name as typeof lodNames[number]) || typeof variant.file !== "string" || !/^[^/\\:]+\.glb$/i.test(variant.file) || variant.file === "." || variant.file.includes("..") || /[?#%]/.test(variant.file)) return null;
    if (variants.some(v => v.name === variant.name)) return null;
    variants.push({name:variant.name, file:variant.file, triangles:variant.triangles, bytes:variant.bytes});
  }
  return variants.some(v => v.name === "LOD0") ? {schemaVersion:1, source:typeof data.source==="string"?data.source:"", variants} : null;
}
export function pickManifestVariant(manifest: LODManifest, tier: PerformanceTier): LODVariant | undefined {
  const pref = tier === "high" ? ["LOD0","LOD1","LOD2"] : tier === "balanced" ? ["LOD1","LOD0","LOD2"] : ["LOD2","LOD1","LOD0"];
  return pref.map(name => manifest.variants.find(v => v.name === name)).find(Boolean);
}
export function variantUrl(manifestUrl: string, file: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost";
  return new URL(file, new URL(manifestUrl, origin)).toString();
}

/** Discover conventional sibling files when no manifest exists. Only ASCII-safe,
 * same-directory GLB filenames are supported. The caller must probe existence. */
export function inferLodSiblings(sourceUrl: string): LODManifest | null {
  const plain = sourceUrl.split(/[?#]/, 1)[0];
  const basename = plain.slice(plain.lastIndexOf("/") + 1);
  let prefix: string;
  const match = /^(.+?)[_-]LOD[012]\.glb$/i.exec(basename);
  if (match) prefix = match[1];
  else {
    const fallback = /^(.+)\.glb$/i.exec(basename);
    if (!fallback) return null;
    prefix = fallback[1];
  }
  if (!/^[a-zA-Z0-9_ -]+$/.test(prefix)) return null;
  return { schemaVersion: 1, source: basename, variants: [0,1,2].map(i => ({name:`LOD${i}`, file:`${prefix}_LOD${i}.glb`})) };
}
