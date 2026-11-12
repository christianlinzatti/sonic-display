'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { load } = require('./helpers/ts-loader-v404.cjs');
const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');

const convert = read('components/visualizer/mixamoFbxImporter.ts');
const batch = read('components/CharacterMotionBatchInstaller.tsx');
const installer = read('components/MotionInstaller.tsx');
const retarget = read('components/visualizer/avatarAnimationRetarget.ts');
const library = read('components/visualizer/characterMotionLibrary.ts');
const api = read('app/api/avatars/animations/import/route.ts');

for (const [name, value, pattern] of [
  ['FBXLoader', convert, /FBXLoader/],
  ['GLTFExporter', convert, /GLTFExporter/],
  ['user file validation', convert, /Kaydara FBX Binary/],
  ['FBX size boundary', convert, /25 \* 1024 \* 1024/],
  ['converted GLB size boundary', convert, /35 \* 1024 \* 1024/],
  ['retain original FBX animation skeleton', convert, /animations: clips/],
  ['reject FBX without quaternion animation', convert, /\.quaternion\$/],
  ['reject exported clipless GLB', convert, /gltf\.animations\?\.some/],
  ['one-at-a-time conversion', batch, /for\(const original of selected\)/],
  ['FBX batch importer', batch, /convertMixamoFbxToGlb\(original\)/],
  ['motion preview and rig inspection retained', batch, /inspectMotion\(item\.url/],
  ['add clips to existing motion library', batch, /addCharacterMotion\(item\.target/],
  ['batch file chooser supports FBX', batch, /accept="\.glb,\.fbx,model\/gltf-binary"/],
  ['single-file importer supports FBX', installer, /convertMixamoFbxToGlb\(file\)/],
  ['single-file importer saves to library', installer, /addCharacterMotion\(model\.id/],
  ['Vercel blob path remains GLB', installer, /sonic\/animations/],
  ['no-skin source node fallback', retarget, /if \(!sourceBones\.size\)/],
  ['target still requires real bones', retarget, /const targetBones = bonesByName/],
  ['existing motion library preserved', library, /chooseCharacterMotion/],
  ['server still accepts only GLB', api, /\.glb\$\/i\.test\(file\.name\)/],
]) {
  assert.match(value, pattern, name);
}

// Actual quaternion retargeting with an animation-only (no SkinnedMesh)
// Mixamo-style hierarchy. The target must still be a humanoid Bone rig.
const { Group, Object3D, Bone, AnimationClip, QuaternionKeyframeTrack, VectorKeyframeTrack } = require('three');
const { retargetHumanoidClips } = load('components/visualizer/avatarAnimationRetarget');
const source = new Group();
const motionNode = new Object3D();
motionNode.name = 'mixamorig:Hips';
source.add(motionNode);
const target = new Group();
const targetHip = new Bone();
targetHip.name = 'Hips';
target.add(targetHip);
const quaternion = new QuaternionKeyframeTrack('mixamorig:Hips.quaternion',
  [0, 1], [0, 0, 0, 1, 0, Math.sin(Math.PI / 8), 0, Math.cos(Math.PI / 8)]);
const rootMotion = new VectorKeyframeTrack('mixamorig:Hips.position', [0, 1], [0, 0, 0, 5, 0, 0]);
const clip = new AnimationClip('Mixamo test animation', 1, [quaternion, rootMotion]);
const result = retargetHumanoidClips([clip], source, target);
assert.equal(result.report.matchedTracks, 1, 'rotation is mapped');
assert.equal(result.report.skippedTracks, 1, 'untrusted root motion is dropped');
assert.equal(result.clips.length, 1);
assert.equal(result.clips[0].tracks[0].name, 'Hips.quaternion');
assert.deepEqual(Array.from(result.clips[0].tracks[0].times), [0, 1]);
assert.equal(clip.tracks.length, 2, 'source clip remains unchanged');

const nonRig = new Group();
nonRig.add(new Object3D());
assert.equal(retargetHumanoidClips([clip], source, nonRig).report.matchedTracks, 0,
  'source node fallback must never target an arbitrary object');
console.log('PASS Mixamo FBX integration and animation-only retargeting');
