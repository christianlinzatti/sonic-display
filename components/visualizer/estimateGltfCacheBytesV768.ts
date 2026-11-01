/** V768: inexpensive *estimate* of GLTF decoded geometry, texture and animation payloads.
 * Not VRAM telemetry: texture compression, drivers, GPU mip levels and shared uploads vary.
 * Only sample a newly decoded scene once; never traverse meshes in the render loop.
 */
type ArrayLikeBytes = {byteLength?:number;buffer?:object};
type GltfResource = {scene:unknown;animations?:readonly unknown[]};
const cached = new WeakMap<object,number>();
const validSize=(value:unknown)=>typeof value==='number'&&Number.isFinite(value)&&value>0?Math.min(value,2**35):0;

export function estimateGltfCacheBytesV768({scene,animations=[]}:GltfResource):number{
  if(!scene||typeof scene!=='object')return 0;
  const previous=cached.get(scene);
  if(previous!==undefined)return previous;
  const seenArrays=new WeakSet<object>(),seenTextures=new WeakSet<object>(),seenGeometries=new WeakSet<object>();
  const seenMaterials=new WeakSet<object>();
  let total=0;
  const bytesOfArray=(arr:unknown)=>{
    if(!arr||typeof arr!=='object')return;
    const a=arr as ArrayLikeBytes;
    // Multiple BufferAttributes can share one ArrayBuffer or interleaved buffer.
    const owner=a.buffer&&typeof a.buffer==='object'?a.buffer:arr;
    if(seenArrays.has(owner))return;
    seenArrays.add(owner);
    total+=validSize((owner as ArrayLikeBytes).byteLength??a.byteLength);
  };
  const visitAttribute=(attr:unknown)=>{
    if(!attr||typeof attr!=='object')return;
    const a=attr as {array?:unknown;data?:{array?:unknown}};
    bytesOfArray(a.data?.array??a.array);
  };
  const visitGeometry=(geometry:unknown)=>{
    if(!geometry||typeof geometry!=='object'||seenGeometries.has(geometry))return;
    seenGeometries.add(geometry);
    const g=geometry as {attributes?:Record<string,unknown>;morphAttributes?:Record<string,unknown[]>;index?:unknown};
    Object.values(g.attributes??{}).forEach(visitAttribute);
    Object.values(g.morphAttributes??{}).forEach(a=>a.forEach(visitAttribute));
    visitAttribute(g.index);
  };
  const visitTexture=(value:unknown)=>{
    if(!value||typeof value!=='object')return;
    const t=value as {isTexture?:boolean;image?:unknown;source?:{data?:unknown};mipmaps?:unknown[]};
    if(!t.isTexture||seenTextures.has(t))return;
    seenTextures.add(t);
    const image=t.source?.data??t.image;
    const estimateImage=(img:unknown)=>{
      if(!img||typeof img!=='object')return 0;
      const data=img as {width?:number;height?:number;depth?:number;data?:ArrayLikeBytes};
      if(data.data?.byteLength)return validSize(data.data.byteLength);
      // RGBA8 with an allowance for mip levels. Compressed/HDR images differ.
      return Math.min(2**35,validSize(data.width)*validSize(data.height)*Math.max(1,validSize(data.depth))*4*4/3);
    };
    if(Array.isArray(image))total+=image.reduce<number>((n,item)=>n+estimateImage(item),0);
    else total+=estimateImage(image);
    for(const level of t.mipmaps??[])total+=estimateImage(level);
  };
  const visitMaterial=(material:unknown)=>{
    if(!material||typeof material!=='object'||seenMaterials.has(material))return;
    seenMaterials.add(material);
    // Standard, physical and shader uniforms may reference textures.
    const m=material as Record<string,unknown>;
    for(const value of Object.values(m)){
      visitTexture(value);
      if(value&&typeof value==='object'&&'value' in value)visitTexture((value as {value:unknown}).value);
    }
    const uniforms=m.uniforms;
    if(uniforms&&typeof uniforms==='object')for(const value of Object.values(uniforms)){
      if(value&&typeof value==='object'&&'value' in value)visitTexture((value as {value:unknown}).value);
    }
  };
  const root=scene as {traverse?:(fn:(node:unknown)=>void)=>void};
  root.traverse?.(node=>{
    if(!node||typeof node!=='object')return;
    const obj=node as {geometry?:unknown;material?:unknown};
    visitGeometry(obj.geometry);
    if(Array.isArray(obj.material))obj.material.forEach(visitMaterial);
    else visitMaterial(obj.material);
  });
  for(const clip of animations){
    if(!clip||typeof clip!=='object')continue;
    const tracks=(clip as {tracks?:{times?:unknown;values?:unknown}[]}).tracks;
    for(const track of tracks??[]){bytesOfArray(track.times);bytesOfArray(track.values);}
  }
  const result=Math.max(0,Math.ceil(total));
  cached.set(scene,result);
  return result;
}
