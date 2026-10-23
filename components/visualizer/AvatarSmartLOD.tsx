"use client";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Object3D } from "three";
import { getActivePerformanceTier } from "./adaptivePerformance";
import { parseAvatarLodName, pickAvailableLod, type AvatarLodLevel, type AvatarLodTier } from "./avatarLodPolicy";

/** Only switches pre-authored LOD variants, never removes bones or modifies animation.
 * An unpaired node remains untouched, including SkinnedMesh objects.
 */
export function AvatarSmartLOD({ model }: { model: Object3D }) {
  const entries = useRef<Array<{ node: Object3D; level: AvatarLodLevel; family: string; original: boolean }>>([]);
  const groups = useRef(new Map<string, AvatarLodLevel[]>());
  const previousTier = useRef<AvatarLodTier | null>(null);
  useEffect(() => {
    const found: typeof entries.current = [];
    const variants = new Map<string, AvatarLodLevel[]>();
    model.traverse(node => {
      // Group/mesh naming convention: Body_LOD0 / Body_LOD1 / Body_LOD2.
      // Switch only root members of a LOD family, not nested child variants.
      const parsed = parseAvatarLodName(node.name);
      if (!parsed) return;
      found.push({ node, ...parsed, original: node.visible });
      variants.set(parsed.family, [...(variants.get(parsed.family) ?? []), parsed.level]);
    });
    entries.current = found; groups.current = variants; previousTier.current = null;
    return () => { for (const item of found) item.node.visible = item.original; entries.current = []; groups.current = new Map(); };
  }, [model]);
  useFrame(() => {
    const tier = getActivePerformanceTier();
    if (tier === previousTier.current) return;
    previousTier.current = tier;
    const picked = new Map<string, AvatarLodLevel | null>();
    for (const [family, levels] of groups.current) picked.set(family, pickAvailableLod(levels, tier));
    for (const entry of entries.current) entry.node.visible = entry.original && entry.level === picked.get(entry.family);
  });
  return null;
}
