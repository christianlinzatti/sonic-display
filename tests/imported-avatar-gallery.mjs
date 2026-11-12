import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {AnimationMixer,Box3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import load from './helpers/load-stage-typescript.cjs';

const manifest=JSON.parse(readFileSync(new URL('../public/avatars/imported/manifest.json',import.meta.url)));
const {importedAvatarModels}=load('config/avatarModels.imported.ts');
assert.equal(manifest.length,13);
assert.equal(new Set(importedAvatarModels.map(model=>model.id)).size,13);
for(const entry of manifest){
 const model=importedAvatarModels.find(model=>model.id===entry.id);
 assert.equal(model?.label,entry.label);
 assert.equal(model?.url,`/avatars/imported/${entry.file}`);
 const bytes=readFileSync(new URL(`../public${model.url}`,import.meta.url));
 assert.equal(bytes.toString('ascii',0,4),'glTF');
 assert.equal(bytes.readUInt32LE(8),bytes.length);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256,'Preserve the uploaded original');
 const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
 assert(json.buffers.every(buffer=>!buffer.uri),'Self-contained model');
 assert((json.images??[]).every(image=>!image.uri||image.uri.startsWith('data:')),'No remote textures');
 const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 assert.deepEqual(gltf.animations.map(clip=>clip.name),entry.clips);
 assert(model.tags.includes(`${gltf.animations.length} Animationen`));
 const skins=[];gltf.scene.traverse(object=>{if(object.isSkinnedMesh)skins.push(object);});
 assert(skins.length>0);
 const bounds=new Box3().setFromObject(gltf.scene);
 assert([bounds.min,bounds.max].flatMap(v=>v.toArray()).every(Number.isFinite));
 assert(bounds.max.y>bounds.min.y);
 const mixer=new AnimationMixer(gltf.scene);
 const sample=()=>{gltf.scene.updateMatrixWorld(true);return skins.flatMap(mesh=>{mesh.skeleton.update();return Array.from(mesh.skeleton.boneMatrices);});};
 for(const clip of gltf.animations){
  assert(clip.duration>0&&Number.isFinite(clip.duration));
  assert(clip.tracks.every(track=>Array.from(track.values).every(Number.isFinite)));
  mixer.stopAllAction();mixer.clipAction(clip).reset().play();mixer.setTime(0);const start=sample();
  mixer.setTime(clip.duration*.37);const next=sample();
  assert(next.every(Number.isFinite));
  assert(next.some((value,i)=>Math.abs(value-start[i])>1e-6),`${entry.file}/${clip.name} must move the actual skeleton`);
 }
 const preview=readFileSync(new URL(`../public${model.preview}`,import.meta.url));
 assert.equal(preview.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(preview.readUInt32BE(16),384);assert.equal(preview.readUInt32BE(20),384);
 console.log(`PASS ${entry.label}: original hash, ${gltf.animations.length} animated clips, finite rig, gallery metadata and real PNG preview`);
}
