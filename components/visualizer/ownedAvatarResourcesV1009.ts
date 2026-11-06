import type {Object3D,Material,BufferGeometry,Texture} from 'three';
/** Apply only to a private SkeletonUtils clone. Cached resources must never acquire
 * a discarded renderer's dispose listeners: those listeners retain its canvas/DOM.
 * Texture objects are private, but their source/image data stays cache-owned. */
export function ownAvatarResourcesV1009(model:Object3D){
 const geometries=new Map<BufferGeometry,BufferGeometry>(),materials=new Map<Material,Material>(),textures=new Map<Texture,Texture>();
 const localMaterial=(source:Material)=>{
  let local=materials.get(source);if(local)return local;
  local=source.clone();materials.set(source,local);
  for(const [key,value] of Object.entries(source)){
   if(value&&typeof value==='object'&&(value as Texture).isTexture){
    const texture=value as Texture;let owned=textures.get(texture);
    if(!owned){owned=texture.clone();textures.set(texture,owned);}
    (local as unknown as Record<string,unknown>)[key]=owned;
   }
  }
  return local;
 };
 model.traverse(node=>{
  const renderable=node as Object3D&{geometry?:BufferGeometry;material?:Material|Material[]};
  if(renderable.geometry?.isBufferGeometry){const source=renderable.geometry;let owned=geometries.get(source);if(!owned){owned=source.clone();geometries.set(source,owned);}renderable.geometry=owned;}
  if(renderable.material)renderable.material=Array.isArray(renderable.material)?renderable.material.map(localMaterial):localMaterial(renderable.material);
 });
 let disposed=false;
 return {dispose(){
  if(disposed)return;disposed=true;
  for(const value of geometries.values())value.dispose();
  for(const value of materials.values())value.dispose();
  for(const value of textures.values())value.dispose();
  geometries.clear();materials.clear();textures.clear();
 }};
}
