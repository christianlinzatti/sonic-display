'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const foot=load('components/visualizer/estimatedFootPlantQuality');
const lock=load('components/visualizer/intelligentFootLockV322');
const test=(name,fn)=>{try{fn();}catch(e){e.message='Phase 1 '+name+': '+e.message;throw e;}};
const step=(t,left,right)=>({time:t,leftFoot:left,rightFoot:right,hips:{x:0,y:1,z:0}});
const point=(x,y=.01,z=0)=>({x,y,z});
const moving=Array.from({length:13},(_,i)=>step(i*.05,point(i*.08),point(0)));
test('estimated stance reports per-side near-floor movement without inventing contact',()=>{
 const result=foot.inspectFootPlantQuality(moving,1.8);
 assert.equal(result.status,'inspect');assert.equal(result.assumption,'sampled-lowest-foot');
 assert.equal(result.left.observedPairs,12);assert.equal(result.right.observedPairs,12);
 assert.equal(result.left.nearFloorPairs,12);assert.equal(result.right.nearFloorPairs,12);
 assert.equal(result.left.possibleSlidePairs,12);assert.equal(result.right.possibleSlidePairs,0);
 assert(Math.abs(result.left.possibleSlideSeconds-.6)<.001);
 assert.equal(result.left.maxHorizontalSpeedBodyHeightsPerSec,.89);
 assert.equal(result.right.nearFloorSeconds,.6);
});
test('true airborne foot travel is not flagged as planted',()=>{
 const jumping=Array.from({length:13},(_,i)=>step(i*.05,point(i*.08,.7),point(0)));
 const result=foot.inspectFootPlantQuality(jumping,1.8);
 assert.equal(result.status,'no-obvious-slip');
 assert.equal(result.left.nearFloorPairs,0);
 assert.equal(result.left.possibleSlidePairs,0);
});
test('when no foot landmarks exist results remain unavailable',()=>{
 assert.equal(foot.inspectFootPlantQuality([{time:0},{time:.05}],1.8).status,'unavailable');
 assert.equal(foot.inspectFootPlantQuality(moving,NaN).status,'unavailable');
 assert.equal(foot.inspectFootPlantQuality(moving,0).status,'unavailable');
});
test('gaps and duplicate timestamps cannot produce fictitious velocities',()=>{
 const bad=[step(0,point(0),point(0)),step(.8,point(.9),point(0))];
 assert.equal(foot.inspectFootPlantQuality(bad,1.8).status,'insufficient');
 const repeated=[step(0,point(0),point(0)),step(0,point(4),point(0))];
 assert.equal(foot.inspectFootPlantQuality(repeated,1.8).left.observedPairs,0);
 const invalid=[step(0,point(0),point(0)),step(.05,point(NaN),point(NaN))];
 assert.equal(foot.inspectFootPlantQuality(invalid,1.8).status,'insufficient');
});
test('sampling is bounded and deterministic; source poses never mutate',()=>{
 const old=JSON.stringify(moving);
 const a=foot.inspectFootPlantQuality(moving,1.8);
 const b=foot.inspectFootPlantQuality(moving,1.8);
 assert.deepEqual(a,b);assert.equal(JSON.stringify(moving),old);
 const huge=Array.from({length:5000},(_,i)=>step(i/60,point(0),point(0)));
 assert(foot.inspectFootPlantQuality(huge,1.8).sampleCount<=121);
});
// Fast downward landings and fast upward lifts are not valid stable anchors.
const settings={...lock.DEFAULT_FOOT_LOCK_V322,enabled:true};
const probe=(position,verticalSpeed=0)=>({
  position,phase:'planted',confidence:1,verticalSpeed,legLength:1.6,delta:1/60,floorY:0,
});
test('fast negative vertical speed cannot acquire a plant anchor',()=>{
 const state=lock.createFootAnchorV322();
 const out=lock.updateFootLockTargetV322(state,probe(point(0,0),-4),settings);
 assert.equal(out.locked,false);assert.equal(out.weight,0);
});
test('fast positive velocity cannot acquire a plant anchor',()=>{
 const state=lock.createFootAnchorV322();
 assert.equal(lock.updateFootLockTargetV322(state,probe(point(0,0),4),settings).locked,false);
});
test('ongoing anchor releases under sudden downward motion',()=>{
 const state=lock.createFootAnchorV322();
 lock.updateFootLockTargetV322(state,probe(point(0,0)),settings);
 assert.equal(state.active,true);
 const out=lock.updateFootLockTargetV322(state,probe(point(.03,0),-6),settings);
 assert.equal(out.locked,false);assert.equal(state.active,false);
});
test('invalid sensor frame cannot capture/reuse anchor and keeps target finite',()=>{
 const state=lock.createFootAnchorV322();
 lock.updateFootLockTargetV322(state,probe(point(0,0)),settings);
 for(const change of [
  {verticalSpeed:NaN},{position:point(NaN,0)},{position:point(Infinity,0)},
  {floorY:NaN},{legLength:Infinity},{delta:0},{delta:NaN},{confidence:NaN}
 ]){
  const out=lock.updateFootLockTargetV322(state,{...probe(point(0,0)),...change},settings);
  assert.equal(out.locked,false);assert.equal(out.weight,0);
  assert([out.x,out.y,out.z,out.weight,out.slip].every(Number.isFinite));
  assert.equal(state.active,false);assert.equal(state.blend,0);
  lock.updateFootLockTargetV322(state,probe(point(0,0)),settings);
 }
});
test('valid stationary plant still captures and is bounded',()=>{
 const state=lock.createFootAnchorV322();
 lock.updateFootLockTargetV322(state,probe(point(0,0)),settings);
 const out=lock.updateFootLockTargetV322(state,probe(point(.04,0)),settings);
 assert.equal(out.locked,true);assert(out.x<.04);assert(out.weight>0);
});
test('existing advanced inspector and Foot IK remain connected',()=>{
 const sampler=fs.readFileSync('components/visualizer/motionQualitySamplerV534.ts','utf8');
 const ui=fs.readFileSync('components/CharacterMotionBatchInstaller.tsx','utf8');
 const ik=fs.readFileSync('components/visualizer/avatarFootIK.ts','utf8');
 assert(sampler.includes('footPlant=inspectFootPlantQuality(poses,bodyHeight)'));
 assert(ui.includes('report.footPlant.left')||ui.includes('report.footPlant[side].nearFloorSeconds'));
 assert(ui.includes('Foot Stability Check · Phase 1'));
 assert(ik.includes('updateFootLockTargetV322('));
 assert(ik.includes('solveLeg('));
});
const src=fs.readFileSync('components/visualizer/estimatedFootPlantQuality.ts','utf8');
for(const forbidden of ['Math.random(', 'fetch(', 'requestAnimationFrame(', 'useFrame(', 'AnimationMixer(', 'document.', 'window.'])
 assert(!src.includes(forbidden),forbidden);
console.log('PASS Phase 1: foot-contact quality estimates, bounded sampling, fast-landing and invalid-sensor fail-closed guards');
