'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {Group,Bone,Quaternion,QuaternionKeyframeTrack,VectorKeyframeTrack,AnimationClip}=require('three');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {assessTargetRigFootQuality:assess}=load('components/visualizer/retargetedFootQualityPhase1');

function rig(scale=1,names='target'){
 const group=new Group(),bones={};
 for(const [name,position] of [
  ['Hips',[0,1,0]],['Spine',[0,.35,0]],['Head',[0,.48,0]],
  ['LeftUpLeg',[-.22,-.30,0]],['LeftLeg',[0,-.35,0]],['LeftFoot',[0,-.35,0]],
  ['RightUpLeg',[.22,-.30,0]],['RightLeg',[0,-.35,0]],['RightFoot',[0,-.35,0]],
 ]){
  const node=new Bone();
  node.name=names==='source'?'mixamorig:'+name:name;
  node.position.set(...position.map(v=>v*scale));
  bones[name]=node;
 }
 group.add(bones.Hips);
 bones.Hips.add(bones.Spine,bones.LeftUpLeg,bones.RightUpLeg);
 bones.Spine.add(bones.Head);
 for(const side of ['Left','Right']){
  bones[side+'UpLeg'].add(bones[side+'Leg']);
  bones[side+'Leg'].add(bones[side+'Foot']);
 }
 group.updateMatrixWorld(true);
 return {group,bones};
}
const original=()=>{
 const half=new Quaternion().setFromAxisAngle({x:0,y:1,z:0,clone(){return this},lengthSq(){return 1}},.72);
 // Construct values explicitly to avoid any external animation asset.
 const tracks=[
  new QuaternionKeyframeTrack('mixamorig:Hips.quaternion',
    [0,.5,1],[0,0,0,1,half.x,half.y,half.z,half.w,0,0,0,1]),
  new QuaternionKeyframeTrack('mixamorig:LeftUpLeg.quaternion',
    [0,.5,1],[0,0,0,1,0,0,0,1,0,0,0,1]),
  new QuaternionKeyframeTrack('mixamorig:RightUpLeg.quaternion',
    [0,.5,1],[0,0,0,1,0,0,0,1,0,0,0,1]),
  new VectorKeyframeTrack('mixamorig:Hips.position',
    [0,.5,1],[0,0,0,12,0,0,0,0,0]),
 ];
 return new AnimationClip('Mixamo Synthetic Footwork',1,tracks);
};
function test(name,check){try{check();}catch(e){e.message='Target rig '+name+': '+e.message;throw e;}}
test('retargeted movement evaluates real target joints, not source positions',()=>{
 const source=rig(1,'source'),target=rig();
 const clip=original(),originalSerialized=JSON.stringify(clip.toJSON());
 const report=assess([clip],source.group,target.group,0);
 assert.equal(report.status,'analyzed');
 assert.equal(report.matchedTracks,3);assert.equal(report.skippedTracks,1);
 assert.equal(report.totalTracks,4);assert.equal(report.sampleCount,25);
 assert(report.footPlant.left.observedPairs>0&&report.footPlant.right.observedPairs>0);
 assert.equal(report.footPlant.left.nearFloorPairs>0,true);
 assert.equal(JSON.stringify(clip.toJSON()),originalSerialized,'original FBX animation stays unchanged');
 assert(Number.isFinite(report.footPlant.left.maxHorizontalSpeedBodyHeightsPerSec));
});
test('different avatar scale yields comparable relative foot quality',()=>{
 const clip=original(),source=rig(1,'source');
 const standard=assess([clip],source.group,rig(1).group,0);
 const large=assess([clip],source.group,rig(2.4).group,0);
 assert.equal(standard.status,'analyzed');
 assert.equal(large.status,'analyzed');
 assert.equal(standard.footPlant.left.possibleSlidePairs,large.footPlant.left.possibleSlidePairs);
 assert.equal(standard.footPlant.left.nearFloorPairs,large.footPlant.left.nearFloorPairs);
 assert(Math.abs(standard.footPlant.left.maxHorizontalSpeedBodyHeightsPerSec-
  large.footPlant.left.maxHorizontalSpeedBodyHeightsPerSec)<.03);
});
test('missing valid target bones never invents a compatible rig',()=>{
 const s=rig(1,'source'),empty=new Group();
 const res=assess([original()],s.group,empty,0);
 assert.equal(res.status,'unavailable');assert.equal(res.matchedTracks,0);
 assert.equal(res.sampleCount,0);
});
test('no foot landmark never reports a fake grounded leg',()=>{
 const s=rig(1,'source'),t=rig();
 t.bones.LeftFoot.name='unknown-left';t.bones.RightFoot.name='unknown-right';
 const res=assess([original()],s.group,t.group,0);
 assert.equal(res.status,'unavailable');assert.equal(res.footPlant.status,'unavailable');
});
test('invalid and oversized clip fail without launching a simulation',()=>{
 const s=rig(1,'source'),t=rig();
 assert.equal(assess([original()],s.group,t.group,-1).status,'unavailable');
 const huge=new AnimationClip('huge',800,original().tracks);
 assert.equal(assess([huge],s.group,t.group,0).status,'unavailable');
});
test('no extra live frame loop and preview is invoked only by user click',()=>{
 const module=fs.readFileSync('components/visualizer/retargetedFootQualityPhase1.ts','utf8');
 const ui=fs.readFileSync('components/CharacterMotionBatchInstaller.tsx','utf8');
 const workflow=fs.readFileSync('.github/workflows/v965-room-wave-production.yml','utf8');
 for(const x of ['useFrame(', 'requestAnimationFrame(', 'setInterval(', 'fetch(', 'new WebGLRenderer('])
  assert(!module.includes(x),x);
 assert(module.includes('withPrivateGltfV769(motionUrl'));
 assert(module.includes('withPrivateGltfV769(avatarUrl'));
 assert(ui.includes('await inspectTargetRigFootQuality(item.url,avatarUrl,index)'));
 assert(ui.includes('item.kind==="motion"?item.target:"original"'));
 assert(ui.includes('Ziel-Avatar · Foot Stability Check'));
 assert(workflow.includes('tests/phase1-target-rig-quality-regression.cjs'));
});
console.log('PASS Phase1 target-rig foot analysis: real skeletal mixer, cross-rig scale, safe fallback and private lifetime');
