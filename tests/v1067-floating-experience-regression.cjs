#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {planFloatingExperienceV1067:plan,sampleFloatingExperienceV1067:sample,
 stepFloatingExperienceV1067:step,REST_FLOAT_V1067:REST,OFF_FLOAT_V1067:OFF}=load('lib/arena360FloatingExperienceV1067');
const show={active:true,scene:'hook',segmentIndex:2,intensity:88,fade:1,
 deck:'fan',floating:'orbit',lasers:'tunnel',camera:'group',dance:'group'};
const opts={enabled:true,stageIsArena:true,playing:true,reducedMotion:false,reactive:true,
 showDesignerEnabled:true,floatingEnabled:true,showDirectorEnabled:true,
 floatMode:'auto',performanceTier:'high',progressMs:70000,durationMs:220000,
 strength:75,show};
const cue=plan(opts);
assert(cue.active&&cue.formation==='orbit');
assert.deepEqual(cue,plan(opts),'deterministic cue');
const phases=[['intro','halo'],['verse','ripple'],['build','staircase'],
 ['hook','orbit'],['interlude','breath'],['finale','crown']];
for(const [scene,formation] of phases){
 const c=plan({...opts,show:{...show,scene}});
 assert(c.active&&c.formation===formation,scene);
 const poses=Array.from({length:6},(_,i)=>sample(i,6,c));
 assert(poses.some(v=>v.rise>0),scene+' changes height');
 assert(poses.every(v=>v.rise>=0&&v.rise<=.18&&Math.abs(v.radial)<=.035&&
  Math.abs(v.yaw)<=.028&&v.glow>=0&&v.glow<=.04),scene+' bounded');
}
const phaseCue=plan({...opts,stageCueV1066:{active:true,shape:'bloom',amount:.75,phase:.21},
 show:{...show,scene:'finale'}});
assert.equal(phaseCue.phase,.21,'V1066 phase aligns with floating choreography');
assert(phaseCue.power>plan({...opts,show:{...show,scene:'finale'}}).power,
 'finale synchronizes modestly with V1066 bloom');
assert.equal(plan({...opts,stageCueV1066:{active:false,shape:'bloom',amount:1,phase:.12}}).phase,
 70000/220000,'invalid V1066 stage cue ignored');
assert(plan({...opts,strength:35}).power<cue.power);
assert(plan({...opts,performanceTier:'balanced'}).power<cue.power);
for(const override of [
 {enabled:false},{stageIsArena:false},{playing:false},{reducedMotion:true},
 {reactive:false},{showDesignerEnabled:false},{floatingEnabled:false},
 {showDirectorEnabled:false},{floatMode:'orbit'},{floatMode:'wave'},
 {floatMode:'rise'},{floatMode:null},{performanceTier:'low'},
 {strength:0},{strength:NaN},{strength:Infinity},{strength:101},
 {progressMs:NaN},{progressMs:Infinity},{progressMs:-1},{progressMs:999999},
 {durationMs:NaN},{durationMs:29000},{durationMs:Infinity},
 {show:null},{show:{...show,active:false}},
 {show:{...show,scene:null}},{show:{...show,scene:'drop'}},
 {show:{...show,intensity:0}},{show:{...show,intensity:101}},
 {show:{...show,intensity:NaN}},{show:{...show,fade:0}},
 {show:{...show,fade:NaN}},{show:{...show,fade:1.4}},
 ]){
 const disabled=plan({...opts,...override});
 assert.equal(disabled.active,false,'fails closed: '+JSON.stringify(override));
 assert.deepEqual(sample(2,6,disabled),REST);
}
for(let k=0;k<18000;k++){
 const scene=phases[k%6][0];
 const options={...opts,progressMs:(k*79)%220000,strength:(k%80)+1,
 show:{...show,scene,intensity:(k%99)+1,fade:((k%100)+1)/100},
 performanceTier:k%2?'balanced':'high'};
 const current=plan(options);
 for(const count of [2,4,6]){
  const offset=sample(k%count,count,current);
  assert(Object.values(offset).every(Number.isFinite),'finite offsets');
  assert(offset.rise>=0&&offset.rise<=.18,'bounded rise');
  assert(Math.abs(offset.radial)<=.035,'bounded radial');
  assert(Math.abs(offset.yaw)<=.028,'bounded yaw');
  assert(offset.glow>=0&&offset.glow<=.04,'bounded glow');
  // Original V1038 satellites have min radius 3.27m, body radius .30m.
  assert(3.27+offset.radial-.30>2.83,'outside the avatar ground disk');
  assert(1.46+offset.rise<=1.64+1e-9,'scenic height remains bounded');
 }
}
let current={...REST};const target=sample(1,6,cue);
for(let i=0;i<240;i++){
 const updated=step(current,.016,target,{enabled:true,playing:true,reducedMotion:false,lowTier:false});
 assert(Math.abs(updated.radial-current.radial)<=.08*.016+1e-9);
 assert(updated.rise-current.rise<=.28*.016+1e-9);
 assert(Math.abs(updated.yaw-current.yaw)<=.08*.016+1e-9);
 current=updated;
}
assert(Math.abs(current.rise-target.rise)<.0015,'smoothly reaches target');
assert.deepEqual(step(current,.016,REST,{enabled:true,playing:false,reducedMotion:false,lowTier:false}),
 current,'pause must hold the last position');
for(const flags of [{enabled:false,playing:true,reducedMotion:false,lowTier:false},
 {enabled:true,playing:true,reducedMotion:true,lowTier:false},
 {enabled:true,playing:true,reducedMotion:false,lowTier:true}])
 assert.deepEqual(step(current,.016,target,flags),REST,'turning off parks overlay');
const wild=step({radial:Infinity,rise:NaN,yaw:Infinity,glow:-10},Infinity,
 {radial:Infinity,rise:Infinity,yaw:NaN,glow:Infinity},
 {enabled:true,playing:true,reducedMotion:false,lowTier:false});
assert(Object.values(wild).every(Number.isFinite));
const pure=read('lib/arena360FloatingExperienceV1067.ts');
for(const token of ['Math.random(','Date.now(','fetch(','setInterval(','setTimeout(',
 'requestAnimationFrame(','WebSocket(','localStorage','goveeBridgeRequest'])
 assert(!pure.includes(token),'planner has no IO/timing: '+token);
const render=read('components/visualizer/stages/ArenaFloatingPlatformsV1038.tsx');
assert.equal((render.match(/useFrame\(/g)||[]).length,1,'one V1038 frame owner');
assert(render.includes('stepFloatingExperienceV1067('));
assert(render.includes('offsetsV1067.current[i]=offset'));
assert(render.includes('enabled:floatingEnabledV1067&&enabled,playing'),
 'V1040 auto scene may resolve to orbit/wave/rise without losing V1067 permission');
assert(render.includes('sample.y+offset.rise'));
assert(render.includes('Math.min(.75,sample.glow+offset.glow)'));
for(const risky of ['setInterval(','setTimeout(','spotLight','pointLight','fetch(','new WebSocket'])
 assert(!render.includes(risky),'no renderer hardware additions '+risky);
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(stage.includes('planFloatingExperienceV1067({'));
assert(stage.includes('floatMode:floatingStageMode'));
assert(stage.includes('stageCueV1066:stageFormationV1066'));
assert(stage.includes('floatingCueV1067={flowFloatingV1071}'));
assert(stage.includes('floatingExperienceV1067.power*ultimateFinaleV1070.floating')); // bounded V1070 forwarding
assert(stage.indexOf('<ArenaFloatingPlatformsV1038')<stage.indexOf('ref={turntable}'),
 'platforms remain world-fixed outside the moving avatar floor');
for(const f of ['types/music.ts','components/visualizer/registry.tsx','context/UiPreferencesContext.tsx',
 'components/visualizer/VisualizerStage.tsx','components/visualizer/ThreeAvatar.tsx',
 'components/visualizer/stages/index.tsx'])
 assert(read(f).includes('arenaFloatingExperienceEnabledV1067')||read(f).includes('floatingExperienceEnabledV1067'),f);
assert(read('context/UiPreferencesContext.tsx').includes('arenaFloatingExperienceEnabledV1067:false'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1067 · Floating Platform Experience 2.0'));
for(const f of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(f).includes('tests/v1067-floating-experience-regression.cjs'));
const pkg=JSON.parse(read('package.json'));
const lock=JSON.parse(read('package-lock.json'));
assert.ok(Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1])>=1067,'V1067 or newer supported');
assert.equal(pkg.version,lock.version);assert.equal(pkg.version,lock.packages[''].version);
console.log('PASS V1067: 54,000 platform samples, six scenes, V1066 sync, manual/tier/ground protections, bounded speed');
