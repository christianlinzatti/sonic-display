/** V529 · Fast, dependency-free inspection of avatar GLBs with embedded animation clips.
 * Reads only the JSON chunk, leaving the mesh, textures and all clips untouched.
 * This is advisory metadata: runtime GLTFLoader still validates the full scene/rig.
 */
export type EmbeddedClipV529 = {
  index: number;
  name: string;
  durationSeconds: number | null;
  channels: number;
  targetNodes: number;
  paths: string[];
};
export type EmbeddedAvatarBundleV529 = {
  animations: EmbeddedClipV529[];
  meshes: number;
  skins: number;
  joints: number;
  morphTargets: string[];
  warnings: string[];
};

const MAX_JSON_CHUNK = 8 * 1024 * 1024;
const asList = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? value.filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === 'object' && !Array.isArray(x)) : [];
const nonnegativeInteger = (value: unknown): value is number => Number.isInteger(value) && (value as number) >= 0;

export function analyzeEmbeddedAvatarJsonV529(value: unknown): EmbeddedAvatarBundleV529 {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Ungültige GLB-JSON-Struktur.');
  const data = value as Record<string, unknown>;
  if ((data.asset as Record<string,unknown>|undefined)?.version !== '2.0') throw new Error('Nur glTF 2.0 wird unterstützt.');
  const meshes = asList(data.meshes);
  if (!meshes.length) throw new Error('Die GLB enthält keinen Avatar-Mesh. Für reine Motions bitte den Motion-Import verwenden.');
  const skins = asList(data.skins);
  const accessors = asList(data.accessors);
  const warnings: string[] = [];
  const jointIds = new Set<number>();
  for (const skin of skins) {
    if (Array.isArray(skin.joints)) for (const joint of skin.joints) if (nonnegativeInteger(joint)) jointIds.add(joint);
  }
  if (!skins.length) warnings.push('Kein Skin/Skelett gefunden: Skelettanimationen möglicherweise nicht verfügbar.');
  const morphNames = new Set<string>();
  for (const mesh of meshes) {
    const primitives = asList(mesh.primitives);
    const morphCount = Math.max(0, ...primitives.map(p => Array.isArray(p.targets) ? p.targets.length : 0));
    const targetNames = (mesh.extras as Record<string, unknown>|undefined)?.targetNames;
    for (let i=0; i<morphCount; i++) {
      const name = Array.isArray(targetNames) && typeof targetNames[i] === 'string' && targetNames[i].trim()
        ? targetNames[i].trim() : `Morph ${i+1}`;
      morphNames.add(name);
    }
  }
  const animations = asList(data.animations).map((animation,index): EmbeddedClipV529 => {
    const channels = asList(animation.channels);
    const samplers = asList(animation.samplers);
    const targets = new Set<number>();
    const paths = new Set<string>();
    for (const channel of channels) {
      const target = channel.target as Record<string, unknown>|undefined;
      if (target && nonnegativeInteger(target.node)) targets.add(target.node);
      if (target && typeof target.path === 'string') paths.add(target.path);
    }
    let duration: number | null = null;
    for (const sampler of samplers) {
      const accessor = nonnegativeInteger(sampler.input) ? accessors[sampler.input] : undefined;
      const max = accessor?.max;
      const final = Array.isArray(max) && typeof max[0]==='number' && Number.isFinite(max[0]) ? max[0] : null;
      // Three.js AnimationClip.duration uses the final keyframe timestamp, not end minus start.
      if (final !== null) duration = Math.max(duration??0, Math.max(0, final));
    }
    if (duration===null) warnings.push(`Clip ${index+1}: Zeitdauer nicht im GLB-Metadatenblock angegeben.`);
    return {index,name:typeof animation.name==='string'&&animation.name.trim()?animation.name.trim():`Clip ${index+1}`,
      durationSeconds:duration,channels:channels.length,targetNodes:targets.size,paths:[...paths]};
  });
  if (!animations.length) warnings.push('Keine eingebetteten Animationen gefunden.');
  const seen = new Set<string>();
  for (const clip of animations) {
    if (seen.has(clip.name)) warnings.push(`Doppelter Animationsname „${clip.name}“: Auswahl erfolgt eindeutig per Index.`);
    seen.add(clip.name);
    if (!clip.channels) warnings.push(`Clip „${clip.name}“ enthält keine animierten Spuren.`);
  }
  if (morphNames.size && !animations.some(clip=>clip.paths.includes('weights')))
    warnings.push('Gesichts-Morph-Targets vorhanden, aber nicht als Animationskanal gespeichert; Lip-Sync benötigt eine separate Steuerung.');
  return {animations,meshes:meshes.length,skins:skins.length,joints:jointIds.size,morphTargets:[...morphNames],warnings};
}

export async function inspectEmbeddedAvatarFileV529(file: Pick<File,'size'|'slice'>): Promise<EmbeddedAvatarBundleV529> {
  if (file.size < 20 || file.size > 35*1024*1024) throw new Error('GLB-Datei zwischen 20 Byte und 35 MB erforderlich.');
  const header = new DataView(await file.slice(0,20).arrayBuffer());
  if (header.getUint32(0,true) !== 0x46546c67 || header.getUint32(4,true)!==2 || header.getUint32(8,true)!==file.size)
    throw new Error('Ungültiger GLB-2.0-Header.');
  const size = header.getUint32(12,true);
  if (header.getUint32(16,true)!==0x4e4f534a || !size || size > MAX_JSON_CHUNK || 20+size > file.size)
    throw new Error('Ungültiger oder zu großer GLB-JSON-Chunk.');
  try {
    const json = JSON.parse(new TextDecoder().decode(await file.slice(20,20+size).arrayBuffer()).trimEnd());
    return analyzeEmbeddedAvatarJsonV529(json);
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error('GLB-Metadaten sind kein gültiges JSON.');
    throw error;
  }
}
