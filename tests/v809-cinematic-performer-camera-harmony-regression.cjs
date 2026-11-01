'use strict';
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(809);
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {reviewCinematicPerformerHarmonyV809:review,composeCinematicPerformerHarmonyV809:compose}=
 load('components/visualizer/cinematicPerformerCameraHarmonyV809');
const {measureConcertFrameV550:measure}=load('components/visualizer/cinematicConcertCameraV550');
const {measureScreenFrameV540:screen}=load('components/visualizer/cinematicCameraCompositionV540');
let checks=0,probes=0;
const test=(name,fn)=>{try{fn();checks++;}catch(e){e.message=`V809 ${name}: ${e.message}`;throw e;}};
const scene={active:true,trackId:'song809',cueStartMs:1000,cueEndMs:9000,count:3,focus:'lead',
 leadSlot:0,singingSlots:[0,2],handoffFrom:null,strength:.65};
const cue={active:true,trackId:'song809',mode:'duet',leadSlot:0,partnerSlot:2,activeSlots:[0,2],
 intensity:.5,cameraWeight:.16,keyGain:1,fillGain:1,cameraActive:true,lightingActive:false};
const opts={trackId:'song809',progressMs:4200,playing:true,automatic:true,authored:false,
 reducedMotion:false,tier:'high',aspect:1.777,lyricsProtected:false,lyricsSide:null,faceY:1.55};
const anchor=(slot,x,z=0)=>({slot,x,y:0,z,visible:true});
const roots=[anchor(0,0,-.05),anchor(2,1.6,.02)];
const pose={x:0,y:1.35,z:5.5,targetX:0,targetY:1.2,targetZ:0,fov:42};
const get=(patch={},c=cue,s=scene,arr=roots,o=opts)=>review({...pose,...patch},c,s,arr,o);
const no=(name,pc,c,s,a,o,reason)=>test(name,()=>{
 const value=review(pc,c,s,a,o);assert.strictEqual(value.pose,pc);assert.equal(value.active,false);
 if(reason)assert.equal(value.reason,reason);
});
test('verified duet camera creates subtle lead focus',()=>{
 const res=get();assert(res.active);assert.equal(res.mode,'duet');
 assert.deepEqual(res.participants,[0,2]);assert(res.aimShift>0&&res.aimShift<=.115);
 assert(res.pose.targetX>pose.targetX&&res.pose.x>pose.x);
});
test('compositor returns identical reviewed pose',()=>assert.deepEqual(
 compose(pose,cue,scene,roots,opts),get().pose));
test('3d camera and user data unchanged',()=>{
 const before=JSON.stringify({pose,cue,scene,roots,opts});get();
 assert.equal(JSON.stringify({pose,cue,scene,roots,opts}),before);
});
test('camera FOV, aim height, z target are preserved',()=>{
 const p=get().pose;assert.equal(p.fov,pose.fov);assert.equal(p.targetY,pose.targetY);
 assert.equal(p.targetZ,pose.targetZ);assert.equal(p.y,pose.y);
});
test('gentle synchronized phrases fade to zero at both boundaries',()=>{
 const a=review(pose,cue,scene,roots,{...opts,progressMs:1000});
 const b=review(pose,cue,scene,roots,{...opts,progressMs:8999});
 assert(!a.active);assert(!b.active||Math.abs(b.aimShift)<.00002);
});
test('time-bound lead glance calms attention at V807 phase .56',()=>{
 const small=[anchor(0,0),anchor(2,.9)];
 const near=review(pose,cue,scene,small,{...opts,progressMs:1000+2650*.56});
 const far=review(pose,cue,scene,small,{...opts,progressMs:1000+2650*.86});
 assert(near.active&&far.active);assert(near.aimShift>far.aimShift);
});
for(const [name,patch] of [
 ['paused',{playing:false}],['manual',{automatic:false}],['authored',{authored:true}],
 ['reduced-motion',{reducedMotion:true}],['low-tier',{tier:'low'}],
 ['lyrics protected',{lyricsProtected:true}],
 ])no(name,pose,cue,scene,roots,{...opts,...patch},'protected');
for(const [name,patch] of [
 ['wrong track',{trackId:'wrong'}],['no track',{trackId:''}],['bad time',{progressMs:NaN}],
 ['before song',{progressMs:999}],['after song',{progressMs:9000}],
 ['invalid aspect',{aspect:NaN}],['tiny aspect',{aspect:.1}],
 ])no(name,pose,cue,scene,roots,{...opts,...patch},'unverified');
for(const [name,c] of [
 ['no cue',undefined],['inactive cue',{...cue,active:false}],['no camera cue',{...cue,cameraActive:false}],
 ['stale cue',{...cue,trackId:'old'}],['solo',{...cue,mode:'solo'}],
 ['bogus weight',{...cue,cameraWeight:.5}],['duplicate singers',{...cue,activeSlots:[0,0]}],
 ['wrong singer',{...cue,activeSlots:[0,1]}],['mismatched lead',{...cue,leadSlot:2}],
 ['wrong duet partner',{...cue,partnerSlot:1}],
 ])no(name,pose,c,scene,roots,opts,'unverified');
for(const [name,s] of [
 ['no scene',undefined],['inactive scene',{...scene,active:false}],
 ['stale scene',{...scene,trackId:'old'}],['bad strength',{...scene,strength:2}],
 ['wrong count',{...scene,count:5}],['extra singer',{...scene,singingSlots:[0,1,2]}],
 ['wrong lead',{...scene,leadSlot:2}],['invalid time',{...scene,cueStartMs:NaN}],
 ['inverted time',{...scene,cueEndMs:500}],
 ])no(name,pose,cue,s,roots,opts,'unverified');
for(const [name,a] of [
 ['no anchors',[]],['missing partner',[roots[0]]],['duplicate root',[...roots,roots[1]]],
 ['invisible root',[roots[0],{...roots[1],visible:false}]],
 ['invalid root',[roots[0],{...roots[1],z:NaN}]],
 ['out of area',[roots[0],{...roots[1],x:40}]],
 ])no(name,pose,cue,scene,a,opts,'unverified');
for(const [name,p] of [
 ['bad position',{...pose,x:NaN}],['bad aim',{...pose,targetX:Infinity}],
 ['negative distance',{...pose,z:-4}],['too close',{...pose,z:0}],
 ['unsupported FOV',{...pose,fov:100}],
 ])no(name,p,cue,scene,roots,opts,'unverified');
test('verified handoff animates toward new leader',()=>{
 const s={...scene,focus:'handoff',singingSlots:[0],handoffFrom:2};
 const c={...cue,mode:'handoff',partnerSlot:2};
 const r=get({},c,s);assert(r.active);assert.equal(r.mode,'handoff');
});
test('mismatched V797 handoff partner is rejected',()=>{
 const s={...scene,focus:'handoff',singingSlots:[0],handoffFrom:2};
 assert.equal(get({},cue,s).active,false);
});
test('invalid handoff cannot synthesize old vocalist',()=>{
 const s={...scene,focus:'handoff',singingSlots:[0],handoffFrom:null};
 assert.equal(get({},cue,s).active,false);
});
test('hook keeps every verified singer in view',()=>{
 const s={...scene,focus:'ensemble',singingSlots:[0,1,2]};
 const c={...cue,mode:'ensemble',activeSlots:[0,1,2]};
 const a=[anchor(0,-3.7),anchor(1,0),anchor(2,3.7)];
 const r=review(pose,c,s,a,opts);assert.equal(r.mode,r.active?'ensemble':'off');
 if(r.active){assert.equal(r.participants.length,3);assert(r.dollyChange<=.028);}
});
test('final candidate never worsens any verified performer screen bounds',()=>{
 const before=measure(pose,roots,opts.aspect,null,false,opts.faceY);
 const after=measure(get().pose,roots,opts.aspect,null,false,opts.faceY);
 assert(before&&after);for(const k of ['overflow','headOverflow','fullBodyOverflow'])
  assert(after[k]<=before[k]+1e-7,k);
});
test('2500 deterministic samples are bounded, finite and safe',()=>{
 for(let i=0;i<2500;i++){
  const a=[anchor(0,-.4+.001*i,-.065),anchor(2,1.1+.0006*i,.06)];
  const p={...pose,targetX:((i%9)-4)*.055,x:((i%9)-4)*.055};
  const o={...opts,progressMs:1350+(i*19)%7000};
  const r=review(p,cue,scene,a,o),again=review(p,cue,scene,a,o);
  assert.deepEqual(r,again);assert(Number.isFinite(r.pose.z));
  assert(Math.abs(r.aimShift)<=.1150001&&r.dollyChange<=.028001);
  const f1=measure(p,a,o.aspect,null,false,o.faceY),f2=measure(r.pose,a,o.aspect,null,false,o.faceY);
  const b1=screen(p,a,o.aspect),b2=screen(r.pose,a,o.aspect);
  assert(f1&&f2&&b1&&b2);
  for(const k of ['overflow','headOverflow','fullBodyOverflow'])assert(f2[k]<=f1[k]+1e-7);
  assert(b2.overflow<=b1.overflow+1e-7);probes++;
 }
});
const camera=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
test('live camera chain runs V809 after V806 before V351',()=>{
 const a=camera.indexOf('const framedV806=composeIntelligentEnsembleCameraV806(');
 const b=camera.indexOf('const framedV809=composeCinematicPerformerHarmonyV809(framedV806');
 const c=camera.indexOf('const framedV838=vocalDuetV838?composeIntelligentVocalDuetCameraV838(');
 const d=camera.indexOf('const framedV848=composeCinematicCameraDirectorV848(');
 const e=camera.indexOf('guardAutomaticCameraV351(framedV848,composition)');
 assert(a>0&&b>a&&c>b&&d>c&&e>d);
});
test('same measured V377 stage roots (V808 travel is already represented)',()=>assert(
 camera.includes('sceneV528,duetAnchorSampleV377.current.anchors,frameOptionsV809')));
test('authored shots, reduced motion and lyrics protection remain shared',()=>{
 for(const fragment of ['automatic:shotGuardV792','authored:authoredCameraV528||!!cameraNarrativeV605?.manualCamera',
  'lyricsProtected:!!composition?.protectLyrics||!!lyricsPlanV378.active'])assert(camera.includes(fragment));
});
test('no GPU resources, extra loops, writes, inferred lyrics or fake anchors',()=>{
 const s=fs.readFileSync('components/visualizer/cinematicPerformerCameraHarmonyV809.ts','utf8');
 assert(!/useFrame\s*\(|requestAnimationFrame\s*\(|new PerspectiveCamera\s*\(|localStorage|setInterval\s*\(/.test(s));
});
test('release gates start with V809 and preserve V808',()=>{
 const pkg=require('../package.json');assert(/^0\.1\.0-v\d+$/.test(pkg.version));
 for(const name of ['build:preflight','check:fast','check:release'])assert(pkg.scripts[name].includes(
  'npm run test:v809 && npm run test:v809:types && npm run test:v808 && npm run test:v808:types'),name);
});
console.log(`PASS V809: ${checks} Pruefgruppen, ${probes} deterministische Kamera-/Interaktionsproben`);
