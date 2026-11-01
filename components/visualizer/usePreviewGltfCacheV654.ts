'use client';
import {useEffect,useMemo} from 'react';
import {useGLTF} from '@react-three/drei';
import {createPreviewGltfCacheV654} from './previewGltfCacheV654';
import {estimateGltfCacheBytesV768} from './estimateGltfCacheBytesV768';
import {setCacheReaderV770} from './performanceMemoryHistoryV770';

// V768: 6 inactive decoded models OR ~96 MiB estimated payload, whichever is
// reached first. Active dancers/previews are pinned independently of the budget.
// This is NOT a GPU VRAM cap; never dispose shared GLTF GPU assets here.
const previewCache=createPreviewGltfCacheV654(url=>useGLTF.clear(url),6,96*1024*1024);
// Cache statistics are sampled only when existing render diagnostics publish.
setCacheReaderV770(()=>previewCache.stats());
export function usePreviewGltfCacheV654(url:string){
  // useGLTF resolves from the same Drei Suspense cache as the caller, so this
  // second read never starts a second network request for the same URL.
  const gltf=useGLTF(url);
  const estimatedBytes=useMemo(()=>estimateGltfCacheBytesV768(gltf),[gltf]);
  useEffect(()=>{
    const release=previewCache.retain(url);
    previewCache.setEstimatedBytes(url,estimatedBytes);
    return release;
  },[url,estimatedBytes]);
}
export function getPreviewGltfCacheStatsV768(){return previewCache.stats();}
/** V833: explicitly drop only idle decoded payloads (not shared GPU assets). */
export function trimInactivePreviewGltfCacheV833(){return previewCache.trimInactive();}
