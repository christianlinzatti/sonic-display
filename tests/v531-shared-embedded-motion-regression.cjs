'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {inspectSharedMotionV531,stripDuplicateAnimationsV531,parseGlbV531,sameSharedMotionV531}=load('components/visualizer/sharedEmbeddedMotionV531');
const {rankEmbeddedClipsV530}=load('components/visualizer/embeddedMotionDirectorV530');
const sha=b=>createHash('sha256').update(Buffer.from(b)).digest('hex');
function assetSignature(glb) {
 const j=glb.json;
 function bvData(i){const v=j.bufferViews[i];const start=v.byteOffset??0;return [v.byteLength,v.byteStride??0,sha(glb.bin.subarray(start,start+v.byteLength))];}
 function accessor(i){
  const a=j.accessors[i];
  return [a.componentType,a.type,a.count,a.normalized??false,a.byteOffset??0,
    a.bufferView===undefined?null:bvData(a.bufferView),
    a.sparse?{count:a.sparse.count,indices:[a.sparse.indices.componentType,a.sparse.indices.byteOffset??0,bvData(a.sparse.indices.bufferView)],
      values:[a.sparse.values.byteOffset??0,bvData(a.sparse.values.bufferView)]}:null];
 }
 return {
  nodes:j.nodes,scenes:j.scenes,scene:j.scene,materials:j.materials,extensionsUsed:j.extensionsUsed,
  meshData:j.meshes.map(m=>m.primitives.map(p=>({material:p.material,mode:p.mode,
   attrs:Object.fromEntries(Object.entries(p.attributes??{}).map(([k,i])=>[k,accessor(i)])),
   indices:p.indices===undefined?null:accessor(p.indices),
   targets:(p.targets??[]).map(t=>Object.fromEntries(Object.entries(t).map(([k,i])=>[k,accessor(i)])))}))),
  skinData:j.skins.map(sk=>({joints:sk.joints,skeleton:sk.skeleton,
   inverseBindMatrices:sk.inverseBindMatrices===undefined?null:accessor(sk.inverseBindMatrices)})),
  images:(j.images??[]).map(img=>img.bufferView===undefined?img:{mimeType:img.mimeType,data:sha(glb.bin.subarray(j.bufferViews[img.bufferView].byteOffset??0,(j.bufferViews[img.bufferView].byteOffset??0)+j.bufferViews[img.bufferView].byteLength))})
 };
}
const filenames=['sonic-performer-v3.glb' ,'sonic-pulsebot-v1.glb','sonic-nova-v1.glb','sonic-rae-v1.glb','sonic-jax-v1.glb'];
(async()=>{
 let samples=[];
 for(const name of filenames){const filename=path.join(process.env.SONIC_V529_SAMPLES||'/mnt/data',name);
  if(!fs.existsSync(filename))continue;
  const original=fs.readFileSync(filename);const file=new File([original],name);
  const signature=await inspectSharedMotionV531(file);
  const slim=stripDuplicateAnimationsV531(file.arrayBuffer?await file.arrayBuffer():original.buffer);
  const compact=parseGlbV531(slim.buffer);
  const source=parseGlbV531(original.buffer.slice(original.byteOffset,original.byteOffset+original.byteLength));
  // Exact mesh, skin, morph, node and material fidelity: the optimized preview
  // has the same geometry and neutral pose as the complete original GLB.
  assert.deepEqual(assetSignature(compact),assetSignature(source),`${name}: changed visible/avatar data`);
  assert(!compact.json.animations,'compact model must not embed duplicate tracks');
  assert.equal(compact.json.meshes.length,1);
  assert.equal(compact.json.skins.length,1);
  assert.equal(compact.json.skins[0].joints.length,55);
  assert.equal(compact.json.meshes[0].primitives.length,source.json.meshes[0].primitives.length);
  assert(slim.length<original.length,'compact model must really be smaller');
  assert.equal(original.readUInt32LE(8),original.length,'source was mutated');
  samples.push({name,signature,original:original.length,slim:slim.length});
 }
 if(samples.length){assert.equal(samples.length,5,'the real GLB fixtures are an indivisible set');
  samples.forEach(s=>assert(sameSharedMotionV531(samples[0].signature,s.signature),`${s.name}: different clips/rig`));
  const total=samples.reduce((n,s)=>n+s.original,0);
  const compact=samples[0].original+samples.slice(1).reduce((n,s)=>n+s.slim,0);
  assert(compact<total);console.log('V531 actual original bytes:',total,'deduplicated bytes:',compact,'saved:',total-compact);
  console.log('V531 individual sizes:',samples.map(s=>`${s.name}: ${s.original}->${s.slim}`).join('; '));
 } else console.log('V531 real GLB fixtures unavailable; content checks skipped');
 // V530 must continue selecting the original 20 movements loaded from the
 // canonical GLB, not reject clips due to the SharedV531 prefix.
 const sharedRank=rankEmbeddedClipsV530({clips:[{name:'SharedV531:Dance_RapTwoStep',duration:2,trackCount:165},
   {name:'SharedV531:Idle_Groove',duration:3,trackCount:165}],trackId:'rap-song',modelKey:'nova',
   progressMs:30_000,section:'verse',genre:'deutschrap',energy:0.7,bpm:90,slot:0,playing:true,
   reducedMotion:false,manualPriority:false},'bar-2');
 assert.equal(sharedRank[0],'SharedV531:Dance_RapTwoStep');
 assert(!sameSharedMotionV531({fingerprint:'a',rigFingerprint:'b',clips:20},{fingerprint:'c',rigFingerprint:'b',clips:20}));
 assert(!sameSharedMotionV531({fingerprint:'a',rigFingerprint:'b',clips:20},{fingerprint:'a',rigFingerprint:'c',clips:20}));
 await assert.rejects(()=>inspectSharedMotionV531(new File(['garbage'],'bad.glb')),/GLB/);
 const root=path.join(__dirname,'..');const dancer=fs.readFileSync(path.join(root,'components/visualizer/GltfDancerAvatarV492.tsx'),'utf8');
 assert(dancer.includes('SharedEmbeddedAvatarV531'),'stage must mount shared animation source');
 const installer=fs.readFileSync(path.join(root,'components/CharacterMotionBatchInstaller.tsx'),'utf8');
 for(const s of ['inspectSharedMotionV531','stripDuplicateAnimationsV531','sharedMotionUrl','sharedMotionFingerprint','installedSharedUrl'])assert(installer.includes(s),`installer ${s} missing`);
 const group=fs.readFileSync(path.join(root,'components/visualizer/GroupDancersV326SceneV492.tsx'),'utf8');
 assert(group.includes('remoteModelsV531[id]??getAvatarModel(id)'),'3-/4-avatar groups must use persisted shared-motion metadata');
 const preview=fs.readFileSync(path.join(root,'components/visualizer/AvatarPreview3D.tsx'),'utf8');
 assert(preview.includes('sharedMotionUrlV531') && preview.includes('external:${selectedEmbeddedClipIndex}'),'the persisted shared model must be animated in the same 3D preview');
 const editor=fs.readFileSync(path.join(root,'components/SettingsPanel.tsx'),'utf8');
 assert(editor.includes('sharedMotionUrlV531={currentAvatar.sharedMotionUrl}'),'Settings preview must show shared clips');
 assert(dancer.includes('sharedMotionV531\n    ? { clips: importedClips, report: null }'),'exact matching clips must NOT be changed by retargeting');
 const config=fs.readFileSync(path.join(root,'app/api/avatars/config/route.ts'),'utf8');
 assert(config.includes('previous.sharedMotionUrl'),'normal settings edits must retain the source reference');
 console.log('PASS V531 exact motion identity, unchanged meshes/morph/skins/materials, preview and stage integration');
})().catch(e=>{console.error(e);process.exitCode=1;});
