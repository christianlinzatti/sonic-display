import type {Object3D, Skeleton, SkinnedMesh} from "three";

/** Dispose ONLY private SkeletonUtils.clone() instances, never cached useGLTF scenes.
 * Skeleton.dispose() frees its boneTexture; meshes, materials and geometry remain
 * owned by useGLTF/other renderers. Shared skeletons within one clone are deduped.
 */
export function disposeClonedAvatarSkeletonsV654(instance:Object3D):number {
  const seen=new Set<Skeleton>();
  let disposed=0;
  instance.traverse(node=>{
    const skinned=node as SkinnedMesh;
    if(!skinned.isSkinnedMesh||!skinned.skeleton||seen.has(skinned.skeleton))return;
    seen.add(skinned.skeleton);
    try {skinned.skeleton.dispose();disposed++;} catch { /* continue releasing the other private skeletons */ }
  });
  return disposed;
}
