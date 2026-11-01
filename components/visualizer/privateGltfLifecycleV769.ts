import type { Material, Object3D, Texture, WebGLRenderTarget } from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

/** V769: A GLTF returned by a NEW loader for one-off inspection is privately owned.
 * NEVER call this on assets returned by useGLTF, on SkeletonUtils clones sharing
 * source geometry/material, or while a private asset is still being rendered.
 * Render targets belong to their creating composer/pass, not to an arbitrary GLTF.
 */
const alreadyDisposedPrivateAssetsV833=new WeakSet<object>();
export function disposePrivateGltfV769(asset: Pick<GLTF, 'scene'|'scenes'>): {geometries:number;materials:number;textures:number;skeletons:number} {
  if(alreadyDisposedPrivateAssetsV833.has(asset))return {geometries:0,materials:0,textures:0,skeletons:0};
  alreadyDisposedPrivateAssetsV833.add(asset);
  const geometries = new Set<{dispose():void}>();
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  const skeletons = new Set<{dispose():void}>();
  const visitMaterial = (material: Material) => {
    if (materials.has(material)) return;
    materials.add(material);
    // Map slots (map, normalMap, envMap, etc.) and custom shader uniforms.
    const values = Object.values(material) as unknown[];
    const uniforms = (material as Material & {uniforms?: Record<string,{value?:unknown}>}).uniforms;
    if (uniforms) for (const u of Object.values(uniforms)) values.push(u?.value);
    for (const value of values) {
      if (value && typeof value==='object' && (value as Texture).isTexture) textures.add(value as Texture);
      if (Array.isArray(value)) for (const item of value)
        if (item && typeof item==='object' && (item as Texture).isTexture) textures.add(item as Texture);
    }
  };
  const visited = new Set<Object3D>();
  const scenes = asset.scenes?.length ? asset.scenes : [asset.scene];
  for (const scene of scenes) scene?.traverse(node => {
    if (visited.has(node)) return;
    visited.add(node);
    const item = node as Object3D & {geometry?: {dispose():void};material?: Material|Material[];skeleton?:{dispose():void}};
    if (item.geometry) geometries.add(item.geometry);
    if (item.skeleton) skeletons.add(item.skeleton);
    if (item.material) for (const mat of Array.isArray(item.material)?item.material:[item.material]) visitMaterial(mat);
  });
  // Do not close decoded ImageBitmaps: they can also be held by the browser's
  // URL/ImageBitmapLoader cache, and closing would break other consumers.
  // Always attempt every owned resource. One invalid WebGL handle must not
  // prevent the remaining private geometry/material/skeleton releases.
  for (const t of textures) try{t.dispose();}catch{}
  for (const s of skeletons) try{s.dispose();}catch{}
  for (const g of geometries) try{g.dispose();}catch{}
  for (const m of materials) try{m.dispose();}catch{}
  return {geometries:geometries.size,materials:materials.size,textures:textures.size,skeletons:skeletons.size};
}

/** Run a bounded-lifetime inspection/export. Late loader completions (even after
 * component unmount) are cleaned up in finally; callback returns derived values,
 * never a scene or GPU resource from the temporary GLTF.
 */
export async function withPrivateGltfV769<T>(
  url:string, inspect:(asset:GLTF)=>T|Promise<T>,
  load:(url:string)=>Promise<GLTF> = path => new GLTFLoader().loadAsync(path),
): Promise<T> {
  const asset=await load(url);
  try { return await inspect(asset); }
  finally { disposePrivateGltfV769(asset); }
}

/** Dispose render targets created and owned by the calling effect/pass only.
 * Call after the final render; reuse across quality switches is not assumed.
 */
export function disposeOwnedRenderTargetsV769(targets:readonly WebGLRenderTarget[]):number {
  const unique=new Set(targets);
  for (const target of unique) try{target.dispose();}catch{}
  return unique.size;
}
