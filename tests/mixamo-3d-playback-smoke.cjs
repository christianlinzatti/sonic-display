'use strict';
// Headless 3D skeletal playback of synthetic Mixamo-style animation-only GLB
// content. This checks actual AnimationMixer/bone poses, not visual quality
// or parsing a vendor-supplied FBX. No WebGL/GPU or network is required.
const assert=require('node:assert/strict');
const {
  Group,Object3D,Bone,Quaternion,Vector3,AnimationClip,
  QuaternionKeyframeTrack,VectorKeyframeTrack,AnimationMixer,
}=require('three');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {retargetHumanoidClips}=load('components/visualizer/avatarAnimationRetarget');

const joints=['Hips','Spine','LeftUpLeg','RightUpLeg','LeftLeg',
  'RightLeg','LeftFoot','RightFoot','LeftArm','RightArm'];
const source=new Group();
for(const name of joints){
  const node=new Object3D();
  node.name='mixamorig:'+name;
  source.add(node);
}
const avatar=new Group();
const nodes=new Map();
for(const name of joints){
  const bone=new Bone();
  bone.name=name;
  nodes.set(name,bone);
}
avatar.add(nodes.get('Hips'));
nodes.get('Hips').add(nodes.get('Spine'),nodes.get('LeftUpLeg'),nodes.get('RightUpLeg'));
nodes.get('LeftUpLeg').add(nodes.get('LeftLeg'));
nodes.get('RightUpLeg').add(nodes.get('RightLeg'));
nodes.get('LeftLeg').add(nodes.get('LeftFoot'));
nodes.get('RightLeg').add(nodes.get('RightFoot'));
nodes.get('Spine').add(nodes.get('LeftArm'),nodes.get('RightArm'));
nodes.get('Hips').position.set(0,1,0);

const neutral=new Quaternion();
const axis=new Vector3(1,0,0);
const values=amplitude=>{
  const mid=new Quaternion().setFromAxisAngle(axis,amplitude);
  return [...neutral.toArray(),...mid.toArray(),...neutral.toArray()];
};
function motion(label,amount){
  const tracks=joints.map((name,index)=>{
    const opposite=name.startsWith('Right')?-1:1;
    const multiplier=name==='Spine'?.16:name==='Hips'?.08:index%2===0?.7:1;
    return new QuaternionKeyframeTrack('mixamorig:'+name+'.quaternion',
      [0,.5,1],values(amount*opposite*multiplier));
  });
  // The original FBX root motion is deliberately not safe for arbitrary
  // avatar proportions. Verify it cannot teleport or lift the destination.
  tracks.push(new VectorKeyframeTrack('mixamorig:Hips.position',
    [0,.5,1],[0,0,0,8,3,0,0,0,0]));
  return new AnimationClip(label,1,tracks);
}
const originals=[motion('Mixamo Rap Groove',.55),motion('Mixamo Hakken Footwork',-.65)];
const output=retargetHumanoidClips(originals,source,avatar);
assert.equal(output.report.matchedTracks,2*joints.length);
assert.equal(output.report.skippedTracks,2,'unsafe root translation must be dropped');
assert.equal(output.clips.length,2);
assert(output.clips.every(c=>c.tracks.length===joints.length));
assert(output.clips.every(c=>c.tracks.every(t=>t.name.endsWith('.quaternion'))));
assert(originals.every(c=>c.tracks.some(t=>t.name.endsWith('.position'))),
  'source files remain untouched');

const mixer=new AnimationMixer(avatar);
const first=mixer.clipAction(output.clips[0]);
first.reset().setEffectiveWeight(1).play();
mixer.update(.24);
const before=nodes.get('LeftUpLeg').quaternion.clone();
mixer.update(.25);
const during=nodes.get('LeftUpLeg').quaternion.clone();
assert(before.angleTo(during)>.05,'a real avatar leg must respond to the loaded clip');
assert(Math.abs(nodes.get('Hips').position.y-1)<1e-9);
assert(Math.abs(nodes.get('Hips').position.x)<1e-9);

const second=mixer.clipAction(output.clips[1]);
second.reset().setEffectiveWeight(1).play();
first.crossFadeTo(second,.45,false);
let maximumStep=0;
for(let frame=0;frame<22;frame++){
  const previous=new Map(joints.map(name=>[name,nodes.get(name).quaternion.clone()]));
  mixer.update(.025);
  for(const name of joints){
    const bone=nodes.get(name),q=bone.quaternion;
    assert([q.x,q.y,q.z,q.w].every(Number.isFinite),name+' quaternion must stay finite');
    assert(Math.abs(q.length()-1)<1e-4,name+' quaternion must stay normalized');
    maximumStep=Math.max(maximumStep,q.angleTo(previous.get(name)));
  }
  assert.equal(nodes.get('Hips').position.y,1,'root height remains in author-defined avatar pose');
  assert.equal(nodes.get('Hips').position.x,0,'no unsafe root drift');
}
assert(maximumStep<.4,'crossfade must not create a single-frame angular snap: '+maximumStep);
assert(second.getEffectiveWeight()>.95,'incoming action must take over after crossfade');
assert(first.getEffectiveWeight()<.05,'outgoing action must fade away');
mixer.stopAllAction();
mixer.uncacheRoot(avatar);

// Deliberately mismatched, non-humanoid targets must never play fake poses.
const invalid=new Group();
invalid.add(new Object3D());
const rejected=retargetHumanoidClips(originals,source,invalid);
assert.equal(rejected.clips.length,0);
assert.equal(rejected.report.matchedTracks,0);
console.log('PASS Mixamo synthetic headless 3D: 10-bone retargeting, live mixer playback, crossfade, no root drift');
