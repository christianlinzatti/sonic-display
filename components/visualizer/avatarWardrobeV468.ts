import {CanvasTexture,Color,Material,Mesh,MeshStandardMaterial,Object3D,SRGBColorSpace,Texture} from 'three';
export type WardrobeModeV468='off'|'album'|'custom';
export type WardrobePatternV468='original'|'neon-grid'|'stripes';
const CLOTHING=/(shirt|jacket|hood|coat|dress|pant|trouser|jean|cloth|outfit|garment|fabric|skirt|suit|top|bottom|shoe|boot|sneaker|vest|uniform|sock)/i;
const EXCLUDE=/(face|skin|eye|hair|teeth|mouth|tongue|head|body|hand|finger|nail)/i;
export function isClothingMaterialV468(nodeName:string,materialName:string){
 const marker=`${nodeName} ${materialName}`;
 return CLOTHING.test(marker)&&!EXCLUDE.test(marker);
}
type Fabric={material:MeshStandardMaterial;baseColor:Color;baseEmissive:Color;tempColor:Color;tempEmissive:Color;baseIntensity:number;originalMap:Texture|null};
/** Replace only clothing materials on the SkeletonUtils instance; cached GLTF is untouched. */
export function prepareAvatarWardrobeV468(model:Object3D){
 const fabrics:Fabric[]=[];
 const clones:Material[]=[];
 model.traverse(node=>{
  const mesh=node as Mesh;
  if(!mesh.isMesh||!mesh.material)return;
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  const updated=materials.map(material=>{
   if(!(material as MeshStandardMaterial).isMeshStandardMaterial||!isClothingMaterialV468(mesh.name,material.name))return material;
   const original=material as MeshStandardMaterial;
   const copy=original.clone();clones.push(copy);
   fabrics.push({material:copy,baseColor:original.color.clone(),baseEmissive:original.emissive.clone(),tempColor:new Color(),tempEmissive:new Color(),baseIntensity:original.emissiveIntensity,originalMap:original.map});
   return copy;
  });
  if(updated.some((m,i)=>m!==materials[i]))mesh.material=Array.isArray(mesh.material)?updated:updated[0];
 });
 const target=new Color();
 let currentPattern:WardrobePatternV468='original';
 let patternTexture:CanvasTexture|null=null;
 const createTexture=(pattern:Exclude<WardrobePatternV468,'original'>)=>{
  if(typeof document==='undefined')return null;
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
  const ctx=canvas.getContext('2d');if(!ctx)return null;
  ctx.fillStyle=pattern==='neon-grid'?'#303043':'#acb4ce';ctx.fillRect(0,0,128,128);
  ctx.strokeStyle=pattern==='neon-grid'?'#d6f9ff':'#f3f8ff';ctx.lineWidth=pattern==='neon-grid'?3:10;
  if(pattern==='neon-grid'){
   for(let x=0;x<=128;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,128);ctx.stroke();}
   for(let y=0;y<=128;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(128,y);ctx.stroke();}
  }else{
   for(let x=-128;x<256;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+128,128);ctx.stroke();}
  }
  const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;return texture;
 };
 return {
  count:fabrics.length,
  apply(mode:WardrobeModeV468,color:string,delta:number,playing:boolean,pattern:WardrobePatternV468='original',glow=35){
   const effectivePattern=mode==='off'?'original':pattern;
   if(effectivePattern!==currentPattern){
    patternTexture?.dispose();
    patternTexture=effectivePattern==='original'?null:createTexture(effectivePattern);
    currentPattern=effectivePattern;
    for(const fabric of fabrics){
      fabric.material.map=patternTexture??fabric.originalMap;
      fabric.material.needsUpdate=true;
    }
   }
   target.set(color);
   const alpha=Math.min(1,1-Math.exp(-Math.max(0,Math.min(.1,delta))*3.2));
   for(const f of fabrics){
    const final=mode==='off'?f.baseColor:f.tempColor.copy(f.baseColor).lerp(target,.68);
    f.material.color.lerp(final,alpha);
    const emissive=mode==='off'?f.baseEmissive:f.tempEmissive.copy(f.baseEmissive).lerp(target,playing?.32:.12);
    f.material.emissive.lerp(emissive,alpha);
    f.material.emissiveIntensity=mode==='off'?f.baseIntensity:Math.min(1.2,f.baseIntensity+Math.max(0,Math.min(100,glow))*.006);
   }
  },
  dispose(){patternTexture?.dispose();for(const material of clones)material.dispose();}
 };
}
