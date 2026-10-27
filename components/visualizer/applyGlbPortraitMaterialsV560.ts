import type {Object3D,Material,MeshStandardMaterial} from 'three';
import {planPortraitMaterialV560} from './portraitMaterialSafetyV560';

export type PortraitMaterialSessionV560 = Readonly<{
  apply:(enabled:boolean,strength:number,lowTier:boolean)=>void;
  dispose:()=>void;
  diagnostics:Readonly<{skins:number;untouched:number;cloned:number}>;
}>;
/** Works ONLY on a unique SkeletonUtils-cloned avatar instance. The glTF cache owns
 * original geometry/materials. Modified PBR materials belong to this session and
 * are disposed on avatar replacement/unmount; shared textures stay untouched.
 */
export function preparePortraitMaterialsV560(model:Object3D):PortraitMaterialSessionV560 {
  const clones=new Set<MeshStandardMaterial>();
  const baselines=new Map<MeshStandardMaterial,{roughness:number;metalness:number}>();
  let skins=0,untouched=0;
  model.traverse(node=>{
    const mesh=node as Object3D & {isMesh?:boolean;material?:Material|Material[]};
    if(!mesh.isMesh||!mesh.material)return;
    const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
    const prepared=materials.map(original=>{
      const candidate=original as MeshStandardMaterial;
      const plan=planPortraitMaterialV560({
        meshName:node.name,materialName:original.name,kind:original.type,
        roughness:candidate.roughness,metalness:candidate.metalness,
        transparent:original.transparent,opacity:original.opacity,
        emissive:!!candidate.emissive&&candidate.emissive.getHex()>0,
        metalnessMap:!!candidate.metalnessMap,
      },65);
      if(!plan.eligible){untouched++;return original;}
      const local=candidate.clone();
      clones.add(local);
      baselines.set(local,{roughness:candidate.roughness,metalness:candidate.metalness});
      skins++;
      return local;
    });
    mesh.material=Array.isArray(mesh.material)?prepared:prepared[0];
  });
  let disposed=false;
  return {
    diagnostics:Object.freeze({skins,untouched,cloned:clones.size}),
    apply(enabled,strength,lowTier){
      if(disposed)return;
      const amount=enabled&&!lowTier?strength:0;
      for(const [material,baseline] of baselines){
        const result=planPortraitMaterialV560({meshName:'face',materialName:'skin',kind:material.type,
          ...baseline,transparent:material.transparent,opacity:material.opacity,
          emissive:!!material.emissive&&material.emissive.getHex()>0,metalnessMap:!!material.metalnessMap},amount);
        material.roughness=result.roughness;
        material.metalness=result.metalness;
      }
    },
    dispose(){if(disposed)return;disposed=true;for(const material of clones)material.dispose();clones.clear();baselines.clear();},
  };
}
