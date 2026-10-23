"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, type Material } from "three";
import { getActivePerformanceTier } from "./adaptivePerformance";
import { normalizeManifest, pickManifestVariant, variantUrl, inferLodSiblings, type LODManifest } from "./lodAssetManifest";

/** Opt-in: manifest lives next to the selected GLB, in the same folder as generated LOD variants.
 * Changes entire rig via React remount. Clips remain available but playback restarts on a tier change.
 * Existing single-GLB avatars are left entirely unchanged.
 */
export function AutomaticLODAssetLoader({ sourceUrl, children }: {sourceUrl: string; children: (assetUrl: string) => ReactNode}) {
  const [manifest, setManifest] = useState<LODManifest | null>(null);
  const [tier, setTier] = useState(getActivePerformanceTier);
  const lastTier = useRef(tier);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [resolved, setResolved] = useState<string | null>(null);
  const inferred = inferLodSiblings(sourceUrl);
  useEffect(() => {
    let live = true;
    const controller = new AbortController();
    setManifest(null); setBlocked([]); setResolved(null);
    const folder = sourceUrl.substring(0, sourceUrl.lastIndexOf("/") + 1);
    const uri = folder + "lod-manifest.json";
    fetch(uri, {signal: controller.signal}).then(async r => r.ok ? normalizeManifest(await r.json()) : null)
      .then(value => { if (live && value?.variants.some(v => variantUrl(uri, v.file) === new URL(sourceUrl, window.location.href).toString())) setManifest(value); })
      .catch(() => {});
    return () => { live = false; controller.abort(); };
  }, [sourceUrl]);
  useFrame(() => {
    const next = getActivePerformanceTier();
    if (next !== lastTier.current) {lastTier.current = next; setTier(next);}
  });
  const manifestUrl = sourceUrl.slice(0, sourceUrl.lastIndexOf("/")+1) + "lod-manifest.json";
  const activeManifest = manifest ?? inferred;
  const candidate = activeManifest && pickManifestVariant({...activeManifest, variants: activeManifest.variants.filter(v => !blocked.includes(v.name))}, tier);
  const nextUrl = candidate ? variantUrl(manifestUrl, candidate.file) : sourceUrl;
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    if (nextUrl === sourceUrl) {setResolved(sourceUrl);return;}
    // Probe variant existence before passing the URL to Suspense/useGLTF.
    fetch(nextUrl, {method:"HEAD", signal: controller.signal}).then(r => {
      if (cancelled) return;
      if (!r.ok) setBlocked(old=>old.includes(candidate!.name)?old:[...old,candidate!.name]);
      else setResolved(nextUrl);
    }).catch(()=>{if (!cancelled)setBlocked(old=>old.includes(candidate!.name)?old:[...old,candidate!.name]);});
    return ()=>{cancelled=true;controller.abort();};
  }, [nextUrl,sourceUrl,candidate?.name]);
  return <LODVisualTransition assetUrl={resolved ?? sourceUrl}>{children}</LODVisualTransition>;
}

/** Short opacity crossfade. Newly-loaded GLBs remain separate objects, and their
 * materials are cloned by the transition wrapper to avoid changing useGLTF cache.
 * There is a brief peak in GPU memory; no geometry or animation clips are edited.
 */
function FadeLayer({ children, fadeIn }: {children: ReactNode; fadeIn: boolean}) {
  const group = useRef<Group>(null);
  const start = useRef<number | null>(null);
  const previousDirection = useRef(fadeIn);
  const originals = useRef<Array<{mesh: Mesh; material: Material | Material[]}>>([]);
  useEffect(() => {
    const root = group.current;
    if (!root) return;
    const entries: typeof originals.current = [];
    root.traverse(object => {
      if (!(object instanceof Mesh)) return;
      const old = object.material;
      const list = Array.isArray(old) ? old : [old];
      object.material = Array.isArray(old) ? list.map(m => m.clone()) : old.clone();
      const newList = Array.isArray(object.material) ? object.material : [object.material];
      for (const mat of newList) {mat.transparent = true; mat.depthWrite = false;}
      entries.push({mesh:object, material:old});
    });
    originals.current = entries;
    start.current = null;
    return () => {
      for (const {mesh, material} of entries) {
        const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mesh.material = material;
        for (const mat of list) mat.dispose();
      }
      originals.current = [];
    };
  }, []);
  useFrame(({clock}) => {
    if (previousDirection.current !== fadeIn) {
      previousDirection.current = fadeIn;
      start.current = clock.elapsedTime;
    }
    if (!fadeIn && originals.current.length === 0) return;
    if (start.current === null) start.current = clock.elapsedTime;
    const elapsed = Math.max(0, clock.elapsedTime - start.current);
    const t = Math.min(1, elapsed / 0.28);
    const alpha = fadeIn ? t : 1 - t;
    for (const {mesh} of originals.current) {
      const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of list) {
        if ('opacity' in mat) (mat as Material & {opacity:number}).opacity = alpha;
      }
    }
  });
  return <group ref={group}>{children}</group>;
}
function LODVisualTransition({assetUrl,children}:{assetUrl:string;children:(url:string)=>ReactNode}) {
  const [active,setActive] = useState(assetUrl);
  const [old,setOld] = useState<string | null>(null);
  useEffect(() => {
    if (assetUrl === active) return;
    setOld(active);
    setActive(assetUrl);
  }, [assetUrl, active]);
  useEffect(() => {
    if (!old) return;
    const timeout = setTimeout(() => setOld(null), 340);
    return () => clearTimeout(timeout);
  }, [old]);
  return <>
    {old && <FadeLayer key={old} fadeIn={false}>{children(old)}</FadeLayer>}
    <FadeLayer key={active} fadeIn>{children(active)}</FadeLayer>
  </>;
}
