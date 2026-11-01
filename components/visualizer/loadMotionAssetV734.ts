import {GLTFLoader,type GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {LoadingManager,type Mesh,type Texture,type Material,type SkinnedMesh} from 'three';
import {withDeadlineV734} from '@/lib/requestDeadlineV734';

/** Only for privately loaded conversion sources, never the shared useGLTF cache. */
export function disposeMotionAssetV734(asset:GLTF){
 const geometries=new Set<Mesh['geometry']>(),materials=new Set<Material>(),textures=new Set<Texture>(),skeletons=new Set<SkinnedMesh['skeleton']>(),images=new Set<{close?:()=>void}>();
 for(const scene of asset.scenes?.length?asset.scenes:[asset.scene])scene.traverse(node=>{
  const mesh=node as Mesh; if(mesh.geometry)geometries.add(mesh.geometry);
  for(const material of Array.isArray(mesh.material)?mesh.material:mesh.material?[mesh.material]:[]){materials.add(material);for(const value of Object.values(material))if(value&&typeof value==='object'&&'isTexture' in value)textures.add(value as Texture);}
  const skeleton=(node as SkinnedMesh).skeleton;if(skeleton)skeletons.add(skeleton);
 });
 for(const texture of textures){const data=texture.source?.data;for(const image of Array.isArray(data)?data:[data])if(image&&typeof image.close==='function')images.add(image);try{texture.dispose();}catch{}}
 for(const image of images)try{image.close?.();}catch{}
 for(const skeleton of skeletons)try{skeleton.dispose();}catch{}
 for(const geometry of geometries)try{geometry.dispose();}catch{}
 for(const material of materials)try{material.dispose();}catch{}
}
export function loadMotionAssetV734(url:string,signal:AbortSignal):Promise<GLTF>{
 return withDeadlineV734(async bounded=>{
  const response=await fetch(url,{signal:bounded});if(!response.ok)throw Error(`Animation nicht erreichbar (${response.status})`);
  const buffer=await response.arrayBuffer();if(bounded.aborted)throw bounded.reason;
  const resourcePath=new URL('.',new URL(url,window.location.href)).href;
  const manager=new LoadingManager();const abort=()=>manager.abort();
  bounded.addEventListener('abort',abort,{once:true});
  try{return await new GLTFLoader(manager).parseAsync(buffer,resourcePath);}
  finally{bounded.removeEventListener('abort',abort);}
 },20000,signal,disposeMotionAssetV734);
}
