/** V560: conservative PBR skin highlight normalization. No textures, colors, normal maps,
 * lip-sync morph targets, animation data, geometry, shadow maps or shaders are modified.
 * Material/mesh labels are hints only; unknown/ambiguous materials must be left alone.
 */
export type PortraitMaterialCandidateV560 = Readonly<{
  meshName:string; materialName:string; kind:string;
  roughness:number; metalness:number; transparent:boolean;
  opacity:number; emissive:boolean; metalnessMap:boolean;
}>;
export type PortraitMaterialAdjustmentV560 = Readonly<{
  eligible:boolean; roughness:number; metalness:number; reason:'skin'|'unknown'|'special'|'invalid';
}>;
const clamp01=(v:number)=>Number.isFinite(v)?Math.min(1,Math.max(0,v)):0;
const face=/\b(face|head|neck|skin|cheek|jaw|nose|ear|lip|wolf3d_head)\b/i;
const disallowed=/eye|iris|pupil|lash|brow|hair|teeth|tooth|tongue|glass|gem|metal|jewel|helmet|visor|cloth/i;
const tokenize=(value:string)=>value.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[_\-.0-9]+/g,' ');
export function planPortraitMaterialV560(candidate:PortraitMaterialCandidateV560,strength=65):PortraitMaterialAdjustmentV560 {
  const {roughness,metalness,kind,meshName,materialName,transparent,opacity,emissive,metalnessMap}=candidate;
  if(!Number.isFinite(roughness)||!Number.isFinite(metalness)||roughness<0||roughness>1||metalness<0||metalness>1){
    return {eligible:false,roughness,metalness,reason:'invalid'};
  }
  const name=tokenize(`${meshName} ${materialName}`);
  if(kind!=='MeshStandardMaterial'&&kind!=='MeshPhysicalMaterial'||transparent||opacity<.999||emissive||metalnessMap||disallowed.test(name)){
    return {eligible:false,roughness,metalness,reason:'special'};
  }
  if(!face.test(name))return {eligible:false,roughness,metalness,reason:'unknown'};
  // A metal-looking piece called only 'Head' could be armor/helmet, not skin.
  if(metalness>.45&&!/skin|face|flesh|complexion/i.test(materialName))
    return {eligible:false,roughness,metalness,reason:'special'};
  // Conservatively limit wet/plastic specular glare on face/skin. Never darken or
  // recolor textures, and never force metallic PBR changes on tagged metalness maps.
  const factor=clamp01(strength/100);
  return {eligible:true,roughness:roughness+Math.max(0,.47-roughness)*factor,
    metalness:metalness-Math.max(0,metalness-.16)*factor,reason:'skin'};
}
