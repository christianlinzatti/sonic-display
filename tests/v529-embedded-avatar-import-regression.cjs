'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {inspectEmbeddedAvatarFileV529,analyzeEmbeddedAvatarJsonV529}=load('components/visualizer/embeddedAvatarBundleV529');
const root=path.join(__dirname,'..');
// Wiring check: character GLBs retain all embedded motions; separate motion GLBs
// may now be split into one or several selected clips (V533).
const importer=fs.readFileSync(path.join(root,'components/CharacterMotionBatchInstaller.tsx'),'utf8');
const preview=fs.readFileSync(path.join(root,'components/visualizer/AvatarPreview3D.tsx'),'utf8');
for(const marker of ['inspectEmbeddedAvatarFileV529(item.file)','embeddedBundles[current.id].animations.map',
  'selectedEmbeddedClipIndex={clipIndices[current.id]??0}','isolateMotionClip(item.url,index,item.file.name)','if(item.kind==="motion")'])
  assert(importer.includes(marker),`V529 installer missing: ${marker}`);
assert(preview.includes('clips.some(clip => clip.id === requested)'));
assert(preview.includes('setClipId(current => current === requested ? current : requested)'));

const filenames=['sonic-performer-v3.glb','sonic-pulsebot-v1.glb','sonic-nova-v1.glb','sonic-rae-v1.glb','sonic-jax-v1.glb'];
const sampleDir=process.env.SONIC_V529_SAMPLES || '/mnt/data';
(async()=>{
 let count=0;
 for (const filename of filenames) {
   const full=path.join(sampleDir,filename);
   if(!fs.existsSync(full)) {console.log(`SKIP fixture ${filename} (not bundled in project)`);continue;}
   const source=fs.readFileSync(full);
   const file=new File([source],filename,{type:'model/gltf-binary'});
   const result=await inspectEmbeddedAvatarFileV529(file);
   assert.equal(result.animations.length,20,filename);
   assert.equal(result.skins,1,filename);
   assert.equal(result.joints,55,filename);
   assert.equal(result.morphTargets.length,5,filename);
   assert.deepEqual(result.morphTargets,['jawOpen','mouthSmile','eyeBlinkLeft','eyeBlinkRight','browInnerUp']);
   assert.equal(result.animations.find(c=>c.name==='Dance_RapTwoStep').channels,165);
   assert(Math.abs(result.animations.find(c=>c.name==='Greeting_Wave').durationSeconds-3.0333333333)<.01);
   assert(result.animations.some(c=>c.name==='Idle_Groove'));
   assert(result.animations.every(c=>c.targetNodes===55));
   assert(result.warnings.some(w=>w.includes('Lip-Sync')));
   console.log(`PASS ${filename}: ${result.animations.length} clips, ${result.joints} joints, ${result.morphTargets.length} morphs`);
   count++;
 }
 if (fs.existsSync(sampleDir) && count && count!==5) throw Error('Incomplete five-file fixture set.');
 // Minimal synthetic glTF metadata: unsupported/no mesh, duplicated names and missing time metadata.
 const asset={asset:{version:'2.0'},meshes:[{primitives:[{targets:[{}]}]}],skins:[{joints:[0,1]}],animations:[{name:'Dance',channels:[],samplers:[]},{name:'Dance',channels:[],samplers:[]}]};
 const duplicate=analyzeEmbeddedAvatarJsonV529(asset);
 assert.equal(duplicate.animations.length,2);
 assert(duplicate.warnings.some(w=>w.includes('Doppelter')));
 assert(duplicate.warnings.some(w=>w.includes('Zeitdauer')));
 assert.throws(()=>analyzeEmbeddedAvatarJsonV529({asset:{version:'2.0'},meshes:[]}),/keinen Avatar-Mesh/);
 assert.throws(()=>analyzeEmbeddedAvatarJsonV529({asset:{version:'1.0'},meshes:[{}]}),/glTF 2.0/);
 assert.throws(()=>analyzeEmbeddedAvatarJsonV529(null),/Ungültige/);
 const invalid=new File([Buffer.alloc(28)],'broken.glb');
 await assert.rejects(()=>inspectEmbeddedAvatarFileV529(invalid),/Header/);
 if(count)console.log(`PASS V529: all ${count} real avatar files + synthetic integrity tests`);
 else console.log('PASS V529: synthetic validation; set SONIC_V529_SAMPLES for real GLB fixtures');
})().catch(e=>{console.error(e);process.exitCode=1;});
