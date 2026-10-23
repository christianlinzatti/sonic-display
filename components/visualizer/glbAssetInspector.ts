/** Dependency-free GLB 2.0 inspector. Metadata only; no upload or GPU allocation. */
export interface GlbAssetReport {
  bytes: number;
  meshes: number;
  primitives: number;
  estimatedTriangles: number;
  materials: number;
  textures: number;
  images: number;
  animations: number;
  skins: number;
  nodes: number;
  embeddedImageBytes: number;
  animationChannels: number;
  lodFamilies: string[];
  warnings: string[];
}
export function inspectGlb(buffer: ArrayBuffer): GlbAssetReport {
  const bytes = buffer.byteLength;
  if (bytes < 20) throw new Error('GLB ist zu kurz.');
  const view = new DataView(buffer);
  if (view.getUint32(0, true) !== 0x46546c67) throw new Error('Keine GLB-Datei (Magic fehlt).');
  if (view.getUint32(4, true) !== 2) throw new Error('Nur glTF 2.0 wird unterstützt.');
  if (view.getUint32(8, true) !== bytes) throw new Error('GLB-Längenangabe ist ungültig.');
  let offset = 12;
  let json: any = null;
  let binaryBytes = 0;
  while (offset + 8 <= bytes) {
    const size = view.getUint32(offset, true);
    const type = view.getUint32(offset + 4, true);
    offset += 8;
    if (size > bytes - offset) throw new Error('Beschädigter GLB-Chunk.');
    if (type === 0x4e4f534a && json === null) {
      const raw = new Uint8Array(buffer, offset, size);
      json = JSON.parse(new TextDecoder().decode(raw).trimEnd());
    }
    if (type === 0x004e4942) binaryBytes += size;
    offset += size;
  }
  if (offset !== bytes || !json || json.asset?.version !== '2.0') throw new Error('Keine gültige glTF-2.0-Struktur.');
  const arr = (key: string): any[] => Array.isArray(json[key]) ? json[key] : [];
  const meshes = arr('meshes');
  const accessors = arr('accessors');
  const views = arr('bufferViews');
  const images = arr('images');
  let estimatedTriangles = 0;
  let primitives = 0;
  for (const mesh of meshes) for (const primitive of mesh.primitives ?? []) {
    primitives++;
    const count = primitive.indices === undefined ? (accessors[primitive.attributes?.POSITION]?.count || 0) : (accessors[primitive.indices]?.count || 0);
    const mode = primitive.mode ?? 4;
    if (mode === 4) estimatedTriangles += Math.floor(count / 3);
    else if (mode === 5 || mode === 6) estimatedTriangles += Math.max(0, count - 2);
  }
  let embeddedImageBytes = 0;
  for (const image of images) if (Number.isInteger(image.bufferView)) embeddedImageBytes += views[image.bufferView]?.byteLength ?? 0;
  const families = new Set<string>();
  for (const node of arr('nodes')) {
    const match = /^(.*)[_.-]LOD[012]$/i.exec(node.name || '');
    if (match) families.add(match[1].toLowerCase());
  }
  const warnings: string[] = [];
  if (!families.size) warnings.push('Keine benannten LOD0/LOD1/LOD2-Varianten erkannt.');
  if (arr('skins').length) warnings.push('Skinned Meshes: Vereinfachung kann Gewichte/Bones beeinflussen; Animationen unbedingt visuell prüfen.');
  if (estimatedTriangles > 100000) warnings.push('Hohe Dreiecksanzahl – vereinfachte Varianten können hilfreich sein.');
  if (embeddedImageBytes > 8_000_000) warnings.push('Große eingebettete Bilder: Texturkompression prüfen.');
  if (!binaryBytes) warnings.push('Keine eingebetteten Binärdaten gefunden.');
  return {bytes,meshes:meshes.length,primitives,estimatedTriangles,materials:arr('materials').length,textures:arr('textures').length,images:images.length,animations:arr('animations').length,skins:arr('skins').length,nodes:arr('nodes').length,embeddedImageBytes,animationChannels:arr('animations').reduce((n:number,a:any)=>n+(a.channels?.length||0),0),lodFamilies:[...families].sort(),warnings};
}
