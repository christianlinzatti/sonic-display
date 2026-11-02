'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {advanceNaturalCameraV655:advance,composeNaturalCameraV655:compose,
 initialNaturalCameraStateV655:initial}=load('components/visualizer/naturalConcertCameraV655');
const pose={x:0,y:1.6,z:7,targetX:0,targetY:1,targetZ:0,fov:40};
const anchors=[{slot:0,x:-.8,y:0,z:0,visible:true},{slot:1,x:.8,y:0,z:0,visible:true}];
const acts=[{index:0,startMs:0,endMs:60000,section:'verse',chapter:'setup',motif:'portrait',repetition:0},
 {index:1,startMs:60000,endMs:120000,section:'hook',chapter:'payoff',motif:'wide',repetition:0},
 {index:2,startMs:120000,endMs:180000,section:'hook',chapter:'payoff',motif:'ensemble',repetition:1}];
const plan={trackId:'song',durationMs:180000,source:'verified-v600',acts};
const cue={active:true,source:'verified-v600',act:0,chapter:'setup',motif:'portrait',repetition:0,transition:1};
const scene={active:true,trackId:'song',cueStartMs:0,cueEndMs:60000,count:2,focus:'verse',
 leadSlot:0,singingSlots:[0],handoffFrom:null,strength:.8};
const opts={trackId:'song',progressMs:3000,playing:true,reducedMotion:false,automatic:true,
 authored:false,quality:'high',aspect:16/9,lyricsProtected:false};
const run=(state,extras={})=>advance(state,extras.scene===undefined?scene:extras.scene,
 extras.plan===undefined?plan:extras.plan,extras.cue===undefined?cue:extras.cue,
 extras.anchors||anchors,{...opts,...extras});
let s=initial();let v=run(s);s=v.state;
assert.equal(v.cue.shot,'portrait');assert.equal(v.cue.leadSlot,0);assert(v.cue.cameraRate<1);
assert.equal(v.cue.reason,'verified-v528-singer');
// No shot jitter on every rendering frame.
for(let ms=3100;ms<11600;ms+=100){v=run(s,{progressMs:ms});s=v.state;
 assert.equal(v.cue.shot,'portrait');assert.equal(v.cue.variant,0);}
v=run(s,{progressMs:11800});s=v.state;
assert.equal(v.cue.variant,1,'new visual motif only after the minimum hold');
for(let ms=11900;ms<22500;ms+=100){v=run(s,{progressMs:ms});s=v.state;}
assert.equal(v.cue.variant,2,'repeated portraits alternate framing instead of repeating a pose');
const handoff={...scene,leadSlot:1,singingSlots:[1],cueStartMs:12000};
v=run(s,{progressMs:23000,scene:handoff});s=v.state;
assert.equal(v.cue.leadSlot,1,'explicit verified handoff reaches the camera');
const paused=run(s,{progressMs:23010,playing:false});assert(!paused.cue.active);
const authored=run(s,{progressMs:23010,authored:true});assert(!authored.cue.active);
const manual=run(s,{progressMs:23010,automatic:false});assert(!manual.cue.active);
const reduced=run(s,{progressMs:23010,reducedMotion:true});assert(!reduced.cue.active);
const low=run(s,{progressMs:23010,quality:'low'});assert(!low.cue.active);
assert(!run(s,{progressMs:23010,scene:{...scene,trackId:'other'},plan:null}).cue.active);
assert(!run(s,{progressMs:23010,scene:{...scene,singingSlots:[]},plan:null}).cue.active);
assert(!run(s,{progressMs:23010,scene:null,plan:{...plan,source:'unavailable'}}).cue.active);
assert(!run(s,{progressMs:23010,scene:null,plan, cue:{...cue,act:2}}).cue.active);
assert(!run(s,{progressMs:23010,scene:null,anchors:[anchors[0],anchors[0]]}).cue.active);
const verifiedAct=run(initial(),{scene:null,progressMs:73000,cue:{...cue,act:1,chapter:'payoff',motif:'wide'}});
assert(verifiedAct.cue.active);assert.equal(verifiedAct.cue.shot,'wide');assert.equal(verifiedAct.cue.leadSlot,-1);
const repeated=run(verifiedAct.state,{scene:null,progressMs:133000,
 cue:{...cue,act:2,chapter:'payoff',motif:'ensemble',repetition:1}});
assert(repeated.cue.active);assert.equal(repeated.cue.reason,'verified-v604-section');
// Playback seek resets rather than retaining an old hold / wrong singer.
const seek=run(s,{progressMs:1200});assert.equal(seek.cue.variant,0);
const other=run(s,{trackId:'different',progressMs:1200,scene:null,plan:null});assert(!other.cue.active);
const center=run(initial(),{progressMs:4000}).cue;
const next=compose(pose,center,anchors,{aspect:16/9,lyricsProtected:false});
assert(Number.isFinite(next.x)&&Number.isFinite(next.fov));
const safe=compose(pose,center,anchors,{aspect:16/9,lyricsProtected:true});
assert.equal(safe.x,pose.x,'lyrics protection prevents horizontal panning');
assert.strictEqual(compose(pose,{...center,active:false},anchors,{aspect:16/9,lyricsProtected:false}),pose);
assert.strictEqual(compose(pose,center,[],{aspect:16/9,lyricsProtected:false}),pose);
assert.strictEqual(compose({...pose,fov:NaN},center,anchors,{aspect:16/9,lyricsProtected:false}).fov,NaN);
// Multi-minute deterministic render sequence; no new clock, heap work or timers.
let state=initial();let transitions=0,prev=-1;
for(let ms=1000;ms<155000;ms+=37){
 const act=ms>=120000?2:ms>=60000?1:0;
 const currentScene=ms<60000?scene:null;
 const c={...cue,act,chapter:acts[act].chapter,motif:acts[act].motif,repetition:acts[act].repetition};
 const r=run(state,{scene:currentScene,progressMs:ms,cue:c});
 assert(r.cue.active);assert(Number.isFinite(r.cue.cameraRate)&&r.cue.cameraRate>=.6&&r.cue.cameraRate<=1);
 assert(Number.isFinite(r.cue.strength)&&r.cue.strength>=0&&r.cue.strength<=.8);
 if(r.state.serial!==prev){transitions++;prev=r.state.serial;}
 state=r.state;
}
assert(transitions<35,'camera cannot change shot on every frame');
const src=fs.readFileSync('components/visualizer/naturalConcertCameraV655.ts','utf8');
assert(!/fetch\(|setTimeout\(|setInterval\(|requestAnimationFrame\(|Math\.random\(|Date\.now\(|localStorage/.test(src));
const camera=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
assert(camera.includes('advanceNaturalCameraV655(')&&camera.includes('composeNaturalCameraV655('));
assert(camera.includes('composePerformanceCameraV747(\n      naturalFramedV655,') &&
  camera.includes('const framedV848=composeCinematicCameraDirectorV848(framedV838,sceneV528,') &&
  camera.includes('const stageFramed=automaticShot\n      ?guardAutomaticCameraV351(framedV848,composition):to;') &&
  camera.indexOf('const framedV747=')<camera.indexOf('const framedV848=') &&
  camera.indexOf('const framedV848=')<camera.indexOf('guardAutomaticCameraV351(framedV848,composition)'));
assert(camera.includes('naturalV655.cue.cameraRate'));
assert(Number(require('../package.json').version.match(/v(\d+)/)?.[1])>=655);
console.log(`PASS V655: verified vocalist focus, 3 shot variants, hold + seek + manual guards, ${transitions} switches over 154s, safe 3D frame`);
