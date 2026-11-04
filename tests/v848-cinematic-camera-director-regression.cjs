'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {reviewCinematicCameraDirectorV848:review,composeCinematicCameraDirectorV848:compose}=load('components/visualizer/cinematicCameraDirectorV848');
const {measureConcertFrameV550:measure}=load('components/visualizer/cinematicConcertCameraV550');
const {measureScreenFrameV540:screen}=load('components/visualizer/cinematicCameraCompositionV540');
let count=0;
function test(name,fn){try{fn();count++}catch(e){e.message=`V848 ${name}: ${e.message}`;throw e;}}
const pose={x:0,y:1.35,z:5.8,targetX:0,targetY:1.2,targetZ:0,fov:42};
const anchor=(slot,x,z=0)=>({slot,x,y:0,z,visible:true});
const roots=[anchor(0,0),anchor(1,1.3)];
const opts={trackId:'song848',progressMs:5000,playing:true,automatic:true,authored:false,
 reducedMotion:false,tier:'high',aspect:1.777,lyricsProtected:false,lyricsSide:null,faceY:1.55,section:'verse'};
const scene={active:true,trackId:'song848',cueStartMs:1000,cueEndMs:9000,count:2,
 focus:'lead',leadSlot:0,singingSlots:[0],handoffFrom:null,strength:.75};
const vocal={active:true,trackId:'song848',mode:'solo',leadSlot:0,partnerSlot:null,
 activeSlots:[0],cameraActive:true,cameraWeight:.2};
const duetScene={...scene,singingSlots:[0,1]};
const duetCue={...vocal,mode:'duet',partnerSlot:1,activeSlots:[0,1]};
const story={active:true,sceneIndex:2,reason:'verified-scene',move:'dolly-out',weight:.65,phase:.5};
const get=(o=opts,s=scene,v=vocal,st=null,a=roots,p=pose)=>review(p,s,v,st,a,o);
const checkUnchanged=(name,o=opts,s=scene,v=vocal,st=null,a=roots,p=pose)=>test(name,()=>{
 const x=review(p,s,v,st,a,o);assert.strictEqual(x.pose,p,`unexpected camera edit ${name}`);assert.equal(x.active,false);
});
function safe(before,after,arr,aspect=opts.aspect,side=null,lyric=false){
 const f=measure(before,arr,aspect,side,lyric,opts.faceY),g=measure(after,arr,aspect,side,lyric,opts.faceY);
 const x=screen(before,arr,aspect,side),y=screen(after,arr,aspect,side);
 assert(f&&g&&x&&y);const eps=1e-6;
 assert(g.overflow<=f.overflow+eps);assert(g.headOverflow<=f.headOverflow+eps);
 assert(g.fullBodyOverflow<=f.fullBodyOverflow+eps);assert(y.overflow<=x.overflow+eps);
}
test('verified lead opens a subtle closer portrait',()=>{
 const r=get();assert(r.active&&r.mode==='portrait');assert(r.dollyRatio<1&&r.dollyRatio>=.97);
 assert(r.pose.z<pose.z);assert.deepEqual(r.participants,[0]);safe(pose,r.pose,[roots[0]]);
});
test('duet balanced picture uses both real stage roots',()=>{
 const r=get({...opts,section:'hook'},duetScene,duetCue);
 assert(r.active&&r.mode==='duet');assert.deepEqual(r.participants,[0,1]);assert(r.dollyRatio>1);
 safe(pose,r.pose,roots);
});
test('verified drop wide opens a generous stage picture',()=>{
 const r=get({...opts,section:'drop'},null,null,story);
 assert(r.active&&r.mode==='wide');assert(r.dollyRatio>1&&r.dollyRatio<=1.07);
 assert(r.pose.fov>pose.fov);safe(pose,r.pose,roots);
});
test('works with storyboard crane intent',()=>{
 const r=get({...opts,section:'drop'},null,null,{...story,move:'crane'});assert(r.active&&r.mode==='wide');
});
test('one-performer stage wide is possible on storyboard',()=>{
 const r=get({...opts,section:'drop'},null,null,story,[roots[0]]);assert(r.active);safe(pose,r.pose,[roots[0]]);
});
test('duet handoff gets shared framing without a false vocal identity',()=>{
 const s={...scene,focus:'handoff',singingSlots:[0],handoffFrom:1};
 const v={...vocal,mode:'handoff',partnerSlot:1,activeSlots:[0,1]};
 const r=get(opts,s,v);assert(r.active&&r.mode==='duet');safe(pose,r.pose,roots);
});
test('unchanged fields for natural camera blending',()=>{
 const r=get();assert.equal(r.pose.targetY,pose.targetY);assert.equal(r.pose.targetZ,pose.targetZ);
 assert.equal(r.pose.x,pose.x);assert(!('transition' in r.pose));
});
test('composer matches reviewer without allocations or mutations',()=>{
 const before=JSON.stringify({pose,scene,vocal,roots,opts});
 assert.deepEqual(compose(pose,scene,vocal,null,roots,opts),get().pose);
 assert.equal(JSON.stringify({pose,scene,vocal,roots,opts}),before);
});
for(const [name,patch] of Object.entries({
 pause:{playing:false},manual:{automatic:false},authored:{authored:true},
 reduce:{reducedMotion:true},'low-tier':{tier:'low'},
 'no track':{trackId:''},'stale track':{trackId:'stale'},'long track':{trackId:'a'.repeat(181)},
 'bad time':{progressMs:NaN},'negative time':{progressMs:-1},
 'wrong aspect':{aspect:4},'tiny aspect':{aspect:0},
 }))checkUnchanged(`portrait protected ${name}`,{...opts,...patch});
for(const [name,patch] of Object.entries({
 pause:{playing:false},manual:{automatic:false},authored:{authored:true},
 reduce:{reducedMotion:true},'low-tier':{tier:'low'},
 'no track':{trackId:''},'invalid time':{progressMs:Infinity},
 'invalid aspect':{aspect:NaN},
 }))checkUnchanged(`wide protected ${name}`,{...opts,...patch,section:'drop'},null,null,story);
for(const [name,s] of Object.entries({
 'scene missing':null,'scene inactive':{...scene,active:false},
 'scene wrong track':{...scene,trackId:'wrong'},
 'invalid length':{...scene,count:5},'duplicate singers':{...scene,singingSlots:[0,0]},
 'wrong lead':{...scene,leadSlot:1},'outside cue start':{...scene,cueStartMs:6000},
 'outside cue end':{...scene,cueEndMs:4000},'bogus strength':{...scene,strength:2},
 'no singer':{...scene,singingSlots:[]}
}))checkUnchanged(`portrait unverified ${name}`,opts,s,vocal);
for(const [name,v] of Object.entries({
 'no vocal':null,'no camera authority':{...vocal,cameraActive:false},
 'inactive vocal':{...vocal,active:false},'wrong track':{...vocal,trackId:'wrong'},
 'bogus weight':{...vocal,cameraWeight:.5},'zero weight':{...vocal,cameraWeight:0},
 'wrong lead slot':{...vocal,leadSlot:1},'wrong mode':{...vocal,mode:'ensemble'},
 'wrong singers':{...vocal,activeSlots:[1]},'duplicate active':{...vocal,activeSlots:[0,0]},
 }))checkUnchanged(`portrait wrong vocal ${name}`,opts,scene,v);
for(const [name,s,v] of [
 ['duet incorrect partner',duetScene,{...duetCue,partnerSlot:3}],
 ['duet missing singer',duetScene,{...duetCue,activeSlots:[0]}],
 ['handoff without evidence',{...scene,focus:'handoff',handoffFrom:null},{...vocal,mode:'handoff',activeSlots:[0,1],partnerSlot:1}],
 ['handoff unsupported old slot',{...scene,focus:'handoff',handoffFrom:4},{...vocal,mode:'handoff',activeSlots:[0,4],partnerSlot:4}],
 ['ensemble no hidden closeup',{...scene,focus:'ensemble',singingSlots:[0,1]},{...duetCue,mode:'ensemble'}],
 ])checkUnchanged(name,opts,s,v);
for(const [name,patch] of [
 ['no story',null],['inactive',{...story,active:false}],
 ['unverified',{...story,reason:'off'}],['not a wide move',{...story,move:'dolly-in'}],
 ['bad index',{...story,sceneIndex:-1}],['bad weight',{...story,weight:2}],
 ['bad phase',{...story,phase:2}],['wrong phase',{...story,phase:NaN}]
])checkUnchanged(`wide requires verified storyboard ${name}`,{...opts,section:'drop'},null,null,patch);
for(const section of ['verse','hook','build','break'])checkUnchanged(`no wide outside confirmed drop ${section}`,
 {...opts,section},null,null,story);
for(const [name,a] of [
 ['no roots',[]],['invisible',[{...roots[0],visible:false}]],
 ['duplicate slot',[roots[0],roots[0]]],
 ['nonfinite',[{...roots[0],x:NaN}]],
 ['out-of-stage',[{...roots[0],x:40}]],
 ['invalid slot',[{...roots[0],slot:-1}]],
 ['cast overflow',Array.from({length:5},(_,k)=>anchor(k,k))]
 ])checkUnchanged(`no unsafe geometry ${name}`,{...opts,section:'drop'},null,null,story,a);
for(const [name,p] of [
 ['nan pose',{...pose,x:NaN}],['fov out of range',{...pose,fov:90}],
 ['looking backwards',{...pose,z:-5}],['oblique',{...pose,x:8}],
 ['too close',{...pose,z:.1}]
])checkUnchanged(`no unsafe pose ${name}`,{...opts,section:'drop'},null,null,story,roots,p);
test('protected lyrics veto singer closeups',()=>{
 assert.strictEqual(get({...opts,lyricsProtected:true}).pose,pose);
});
test('wide still protects lyrics screen margins',()=>{
 const o={...opts,section:'drop',lyricsProtected:true,lyricsSide:'right'};
 const r=get(o,null,null,story);
 if(r.active)safe(pose,r.pose,roots,o.aspect,'right',true);
});
test('boundary fades out at storyboard start',()=>{
 const r=get({...opts,section:'drop'},null,null,{...story,phase:0});
 assert.strictEqual(r.pose,pose);
});
test('boundary fades out at storyboard end',()=>{
 const r=get({...opts,section:'drop'},null,null,{...story,phase:1});
 assert.strictEqual(r.pose,pose);
});
test('vocal boundaries fade out at cue start',()=>{
 const r=get({...opts,progressMs:1000});assert.strictEqual(r.pose,pose);
});
test('vocal boundaries fade out at cue end',()=>{
 const r=get({...opts,progressMs:8999});
 assert(!r.active||Math.abs(r.dollyRatio-1)<.00001);
});
test('device budget lowers movement',()=>{
 const hi=get({...opts,section:'drop'},null,null,story);
 const lo=get({...opts,section:'drop',tier:'balanced'},null,null,story);
 assert(Math.abs(lo.dollyRatio-1)<Math.abs(hi.dollyRatio-1));
});
for(const x of [0,.5,.7,1.4])test(`no projection regression at ${x}m lead`,()=>{
 const p={...pose,targetX:x*.18,x:x*.18};
 const arr=[anchor(0,x),anchor(1,x+1.1)];
 const r=get({...opts,section:'drop'},null,null,story,arr,p);
 if(r.active){safe(p,r.pose,arr);for(const a of arr)safe(p,r.pose,[a]);}
});
const stage=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
test('V848 stage compositor wired after V838',()=>assert(stage.indexOf('const framedV848=composeCinematicCameraDirectorV848(')>stage.indexOf('const framedV838=')));
test('final V351 lyrics safety follows V848 and V897',()=>assert(stage.includes('sampleCinematicCameraV897({')&&stage.includes('guardAutomaticCameraV351(danceCameraV898.pose,composition)')&&stage.indexOf('const framedV848=')<stage.indexOf('const cinematicCameraV897=')&&stage.indexOf('const cinematicCameraV897=')<stage.indexOf('const danceCameraV898=')&&stage.indexOf('const danceCameraV898=')<stage.indexOf('guardAutomaticCameraV351(danceCameraV898.pose,composition)')));
test('manual/authoring gates are propagated',()=>assert(stage.includes('authored:authoredCameraV528||')));
test('V848 uses only sampled stage roots',()=>assert(stage.includes('choreographyV792,duetAnchorSampleV377.current.anchors')));
test('no extra camera frame loop',()=>assert.equal((stage.match(/useFrame\(/g)||[]).length,1));
test('no randomized motion',()=>{const source=fs.readFileSync('components/visualizer/cinematicCameraDirectorV848.ts','utf8');assert(!source.includes('Math.random(')&&!source.includes('setTimeout(')&&!source.includes('setInterval('));});
test('V848 registered in build gates',()=>{
 const p=require('../package.json');for(const k of ['build:preflight','check:fast','check:release'])
  assert(p.scripts[k].includes('npm run test:v850 && npm run test:v850:types && npm run test:v849 && npm run test:v849:types && npm run test:v848 && npm run test:v848:types && npm run test:v847'));
});
console.log(`PASS V848: ${count} cinematic-camera test groups`);
