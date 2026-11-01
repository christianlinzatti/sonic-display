'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {reviewEnsembleCameraV806:review,composeIntelligentEnsembleCameraV806:compose}=
 load('components/visualizer/intelligentEnsembleCameraV806');
const {planMultiVocalSpotlightV797:plan}=load('components/visualizer/multiVocalSpotlightDirectorV797');
const {measureConcertFrameV550:measure}=load('components/visualizer/cinematicConcertCameraV550');
const {measureScreenFrameV540:screen}=load('components/visualizer/cinematicCameraCompositionV540');
let count=0,probes=0;
const test=(name,fn)=>{try{fn();count++;}catch(e){e.message=`V806 ${name}: ${e.message}`;throw e;}};
const scene={active:true,trackId:'track-806',cueStartMs:1000,cueEndMs:9000,count:3,
 focus:'lead',leadSlot:0,singingSlots:[0,2],handoffFrom:null,strength:.6};
const opts={trackId:'track-806',progressMs:4500,playing:true,automatic:true,authored:false,
 reducedMotion:false,tier:'high',aspect:1.7,lyricsProtected:false,lyricsSide:null,faceY:1.6};
const cueFor=(s=scene,patch={})=>plan({scene:s,trackId:s.trackId,progressMs:4500,
 playing:true,enabled:true,count:s.count,reducedMotion:false,tier:'high',lyricsProtected:false,
 manualCamera:false,manualLighting:false,...patch});
const duet=cueFor();
const anchor=(slot,x,y=0)=>({slot,x,y,z:0,visible:true});
const roots=[anchor(0,0),anchor(2,2)];
const pose={x:0,y:1.3,z:5,targetX:0,targetY:1.1,targetZ:0,fov:39};
const result=review(pose,duet,scene,roots,opts);
const unchanged=(name,pc=pose,c=duet,s=scene,a=roots,o=opts,reason)=>test(name,()=>{
 const x=review(pc,c,s,a,o);assert.strictEqual(x.pose,pc);
 assert.equal(x.review.active,false);
 if(reason)assert.equal(x.review.reason,reason);
});
test('genuine vocal duet is accepted',()=>assert.equal(duet.mode,'duet'));
test('undefined vocal cue never alters live camera',()=>assert.strictEqual(compose(pose,undefined,scene,roots,opts),pose));
test('real measured two-shot adjusts existing camera',()=>assert.equal(result.review.active,true));
test('aim and camera x move together without a cut',()=>assert(result.pose.x>pose.x&&result.pose.targetX>pose.targetX));
test('dolly is limited to 12 percent per frame',()=>assert(result.pose.z<=pose.z*1.12+1e-9));
test('camera bounds remain finite',()=>Object.values(result.pose).forEach(v=>assert(Number.isFinite(v))));
test('camera movement is small and bounded',()=>assert(result.pose.targetX-pose.targetX<=.38+1e-9));
test('no FOV mutation',()=>assert.equal(result.pose.fov,pose.fov));
test('no vertical aim change',()=>assert.equal(result.pose.targetY,pose.targetY));
test('before/after improvement really measured',()=>assert(result.review.afterBalance<result.review.beforeBalance));
test('pose compositing matches detailed review',()=>assert.deepEqual(compose(pose,duet,scene,roots,opts),result.pose));
test('all selected singer slots verified',()=>assert.deepEqual(result.review.selectedSlots,[0,2]));
test('head, feet and horizontal framing do not regress',()=>{
 const before=measure(pose,roots,opts.aspect,null,false,opts.faceY),after=measure(result.pose,roots,opts.aspect,null,false,opts.faceY);
 assert(before&&after);for(const key of ['headOverflow','fullBodyOverflow','overflow'])
 assert(after[key]<=before[key]+1e-6,key);
 assert(screen(result.pose,roots,opts.aspect).overflow<=screen(pose,roots,opts.aspect).overflow+1e-6);
});
test('same inputs produce same values without mutating them',()=>{
 const original=JSON.stringify({pose,duet,scene,roots,opts});
 assert.deepEqual(review(pose,duet,scene,roots,opts),result);
 assert.equal(JSON.stringify({pose,duet,scene,roots,opts}),original);
});
for(const [name,patch] of [
 ['authored',{authored:true}],['manual',{automatic:false}],['pause',{playing:false}],
 ['reduced motion',{reducedMotion:true}],['low tier',{tier:'low'}],
 ['lyrics protected',{lyricsProtected:true}],
 ])unchanged(name,pose,duet,scene,roots,{...opts,...patch},'protected');
for(const [name,patch] of [
 ['wrong track',{trackId:'different'}],['invalid position',{progressMs:NaN}],
 ['before cue',{progressMs:999}],['after cue',{progressMs:9000}],
 ['invalid aspect',{aspect:0}],['non finite aspect',{aspect:Infinity}],
 ])unchanged(name,pose,duet,scene,roots,{...opts,...patch},'unverified');
for(const [name,c] of [
 ['no cue',null],['off cue',{...duet,active:false}],
 ['stale track',{...duet,trackId:'stale'}],['solo',{...duet,mode:'solo',activeSlots:[0]}],
 ['disabled camera',{...duet,cameraActive:false}],['zero camera',{...duet,cameraWeight:0}],
 ['nonfinite camera',{...duet,cameraWeight:NaN}],['excessive camera',{...duet,cameraWeight:1}],
 ['duplicate singers',{...duet,activeSlots:[0,0]}],['unknown singer',{...duet,activeSlots:[0,9]}],
 ['solo masquerading as duet',{...duet,activeSlots:[0]}],
 ])unchanged(name,pose,c,scene,roots,opts,'unverified');
for(const [name,a] of [
 ['missing second root',[roots[0]]],['duplicate second root',[...roots,roots[1]]],
 ['hidden root',[roots[0],{...roots[1],visible:false}]],
 ['nonfinite root',[roots[0],{...roots[1],x:NaN}]],
 ['unreasonably far root',[roots[0],{...roots[1],x:90}]],
 ])unchanged(name,pose,duet,scene,a,opts,'unverified');
for(const [name,s] of [
 ['scene absent',null],['scene inactive',{...scene,active:false}],
 ['scene stale',{...scene,trackId:'elsewhere'}],
 ['scene times inverted',{...scene,cueEndMs:1000}],
 ['lead changed',{...scene,leadSlot:1}],
 ])unchanged(name,pose,duet,s,roots,opts,'unverified');
for(const [name,p] of [
 ['invalid fov',{...pose,fov:NaN}],['behind stage',{...pose,z:-4}],
 ['camera at target',{...pose,z:0,y:1.1}],
 ['extreme target',{...pose,targetX:Infinity}],
 ])unchanged(name,p,duet,scene,roots,opts,'unverified');
const handoffScene={...scene,focus:'handoff',singingSlots:[0],handoffFrom:2};
const handoff=cueFor(handoffScene);
test('explicit vocalist handoff includes prior lead only when authored',()=>{
 assert.equal(handoff.mode,'handoff');
 const res=review(pose,handoff,handoffScene,roots,opts);
 assert.equal(res.review.selectedSlots.length,2);
});
test('unverified prior singer blocks handoff',()=>assert.strictEqual(
 review(pose,handoff,handoffScene,[roots[0]],opts).pose,pose));
const groupScene={...scene,focus:'ensemble',singingSlots:[0,1,2]};
const groupCue=cueFor(groupScene);const groupRoots=[anchor(0,-1.5),anchor(1,0),anchor(2,1.5)];
test('real three-performer cast is accepted',()=>{
 const r=review(pose,groupCue,groupScene,groupRoots,opts);
 assert.equal(r.review.selectedSlots.length,3);assert(r.review.considered>0);
});
test('ensemble cast mismatch fails closed',()=>{
 const bad={...groupCue,activeSlots:[0,2]};
 assert.strictEqual(compose(pose,bad,groupScene,groupRoots,opts),pose);
});
test('already framed group is not forced into unnecessary movement',()=>{
 const centered=review(pose,duet,scene,[anchor(0,-.8),anchor(2,.8)],opts);
 assert.strictEqual(centered.pose,pose);
});
test('2500 deterministic real-position probes with monotone safety limits',()=>{
 for(let i=0;i<2500;i++){
  const t=i/2499, anchors=[anchor(0,-.8+.7*t),anchor(2,1.2+1.1*t)];
  const old=measure(pose,anchors,opts.aspect,null,false,opts.faceY);
  const val=review(pose,duet,scene,anchors,opts);
  const next=measure(val.pose,anchors,opts.aspect,null,false,opts.faceY);
  assert(old&&next);
  for(const field of ['overflow','headOverflow','fullBodyOverflow'])assert(next[field]<=old[field]+1e-6,`sample ${i} ${field}`);
  const frameBefore=screen(pose,anchors,opts.aspect),frameAfter=screen(val.pose,anchors,opts.aspect);
  assert(frameBefore&&frameAfter&&frameAfter.overflow<=frameBefore.overflow+1e-6);
  assert.deepEqual(val,review(pose,duet,scene,anchors,opts));probes++;
 }
});
const camera=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
test('V806 is a real live camera finish',()=>{
 for(const fragment of ['composeIntelligentEnsembleCameraV806(framedV797,vocalSpotlightV797',
 'sceneV528,duetAnchorSampleV377.current.anchors','guardAutomaticCameraV351(framedV848,composition)'])
  assert(camera.includes(fragment),fragment);
});
test('the original V797 camera composition stays in place',()=>assert(camera.includes('composeMultiVocalSpotlightCameraV797(framedV792')));
test('manual camera and captions retain final authority',()=>{
 assert(camera.includes('authored:authoredCameraV528||!!cameraNarrativeV605?.manualCamera'));
 assert(camera.includes('lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active'));
 assert(camera.includes('automatic:shotGuardV792'));
});
test('no second WebGL loop, camera or storage',()=>{
 const s=fs.readFileSync('components/visualizer/intelligentEnsembleCameraV806.ts','utf8');
 assert(!/useFrame\s*\(|requestAnimationFrame\s*\(|new PerspectiveCamera\s*\(|localStorage|setInterval\s*\(/.test(s));
});
test('release gates run V806 before V805',()=>{
 const pkg=require('../package.json');assert(/^0\.1\.0-v(?:850|849|848|847|846|845|844(?:\.1)?|843|842|841|840|(?:80[0-9]|81[0-9]|82[0-9]|83[0-9]))$/.test(pkg.version));
 for(const name of ['build:preflight','check:fast','check:release'])
  assert(pkg.scripts[name].includes('npm run test:v806 && npm run test:v806:types && npm run test:v805 && npm run test:v805:types'),name);
});
console.log(`PASS V806: ${count} Gruppen, ${probes} deterministische Ensemble-Framing-Proben`);
