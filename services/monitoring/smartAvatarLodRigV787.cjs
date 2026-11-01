'use strict';
/** Strict same-rig GLB metadata comparison for V787. No geometric simplification. */
const {parseGlbV786,profileGlbV786}=require('./avatarComplexityV786.cjs');
const list=(v)=>Array.isArray(v)?v:[];
function rigV787(input){
 const parsed=parseGlbV786(input),g=parsed.gltf,nodes=list(g.nodes),meshes=list(g.meshes);
 const named=(i)=>{const name=nodes[i]?.name;return typeof name==='string'&&name.length?name:null};
 const warnings=[];
 const skins=list(g.skins).map(s=>{
  const joints=list(s.joints).map(named);if(joints.some(n=>!n)||new Set(joints).size!==joints.length)warnings.push('Joints unbenannt/mehrdeutig');
  return joints;
 });
 const morph=meshes.flatMap((mesh,i)=>list(mesh.primitives).filter(p=>list(p.targets).length).map(p=>{
  const count=list(p.targets).length, names=list(mesh.extras?.targetNames);
  if(names.length!==count||names.some(n=>typeof n!=='string'||!n))warnings.push('Morph-Target-Namen fehlen: Mesh '+i);
  return {mesh:mesh.name||`#${i}`,names:count===names.length?names:[],count};
 }));
 const animations=list(g.animations).map((clip,i)=>({name:clip.name||`#${i}`,
  targets:list(clip.channels).map(c=>{
   const node=named(c.target?.node);if(!node)warnings.push('Animationskanal ohne benannten Zielknoten');
   return `${node||'?'}:${c.target?.path||'?'}`;
  }).sort()}));
 // Compare by exact stable semantic target names, not unreliable numeric node/accessor IDs.
 const signature=JSON.stringify({skins:skins.map(v=>v.slice().sort()).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))),
   morph:morph.sort((a,b)=>a.mesh.localeCompare(b.mesh)),animations:animations.sort((a,b)=>a.name.localeCompare(b.name))});
 return {signature,skins,morph,animations,warnings,profile:profileGlbV786(input)};
}
function evaluateLodSetV787(input){
 const names=['LOD0','LOD1','LOD2'],base=input.LOD0;
 if(!base)return {status:'blocked',issues:['LOD0 fehlt'],variants:[]};
 let root;try{root=rigV787(base)}catch(e){return {status:'blocked',issues:['LOD0 ungueltig: '+e.message],variants:[]};}
 const issues=root.warnings.map(w=>'LOD0: '+w),variants=[];
 for(const name of names){let file=input[name];if(!file){issues.push(name+' fehlt');variants.push({name,status:'missing'});continue;}
  try{const item=name==='LOD0'?root:rigV787(file),compatible=item.signature===root.signature&&item.warnings.length===0&&root.warnings.length===0;
   if(!compatible)issues.push(name+' Rig, Clips oder Morph-Targets abweichend');
   if(name!=='LOD0'&&item.profile.scene.triangles>=root.profile.scene.triangles)issues.push(name+' verringert die Dreieckszahl nicht (nur Qualitaetsdemo)');
   variants.push({name,status:compatible?'compatible':'incompatible',sha256:item.profile.sha256,triangles:item.profile.scene.triangles,
    bytes:item.profile.sourceBytes,clips:item.profile.animations.clips,skinJoints:item.profile.scene.usedSkinJoints,
    mouthMorphs:item.profile.morph.mouthCandidates,rigWarnings:item.warnings});
  }catch(e){variants.push({name,status:'invalid',error:e.message});issues.push(name+' ungueltig: '+e.message)}
 }
 return {status:variants.every(v=>v.status==='compatible')?'ready':'blocked',issues,variants,
  note:'Nur gleiche Rig-Namen, Animationsziele und Morph-Bezeichnungen verifiziert. Bewegung/Deformation visuell pruefen; keine GPU-Messung.'};
}
module.exports={rigV787,evaluateLodSetV787};
