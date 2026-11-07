#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planPerformanceDirectorV1065:plan}=load('lib/arena360PerformanceDirectorV1065');
const show={active:true,scene:'verse',segmentIndex:1,intensity:90,fade:1,
 deck:'halo',floating:'wave',lasers:'halo',camera:'lead',dance:'groove'};
const base={enabled:true,stageIsArena:true,playing:true,reducedMotion:false,
 performanceTier:'high',manualCamera:false,manualDance:false,manualRap:false,rapEvidence:true,
 trackId:'existing-track-v1065',progressMs:30000,durationMs:180000,strength:70,show};
const cue=plan(base);
assert.equal(cue.active,true);
assert.equal(cue.chapter,'verse');
assert.equal(cue.focus,'vocal');
assert.equal(cue.rapGain,1,'verse highlights original rap performance');
assert(cue.danceGain<1&&cue.cameraGain<1,'verse deemphasizes competing layers');
assert.deepEqual(cue,plan(base),'stateless and repeatable');
for(const [scene,focus] of [
 ['intro','camera'],['verse','vocal'],['build','energy'],
 ['hook','group'],['interlude','rest'],['finale','group']]){
 const out=plan({...base,show:{...show,scene}});
 assert(out.active&&out.focus===focus,scene);
 for(const key of ['cameraGain','rapGain','danceGain','ensembleGain','travelGain'])
  assert(out[key]>=0&&out[key]<=1,`gain ${key} ${scene}`);
}
const hook=plan({...base,show:{...show,scene:'hook'}}),rest=plan({...base,show:{...show,scene:'interlude'}});
assert(hook.danceGain>rest.danceGain,'hook prioritizes choreography');
assert(hook.ensembleGain>rest.ensembleGain,'hook prioritizes ensemble');
assert(plan({...base,manualCamera:true}).cameraGain===1,'manual camera remains untouched');
assert(plan({...base,manualDance:true}).danceGain===1,'authored choreography stays untouched');
assert(plan({...base,manualDance:true}).ensembleGain===1,'authored ensemble stays untouched');
assert(plan({...base,manualDance:true}).travelGain===1,'authored stage positions stay untouched');
assert(plan({...base,manualRap:true}).rapGain===1,'manually edited syllables stay untouched');
assert(plan({...base,rapEvidence:false}).rapGain===1,'no fabricated word timing');
assert.equal(plan({...base,manualCamera:true,manualDance:true,manualRap:true}).active,false);
for(const invalid of [
 {enabled:false},{stageIsArena:false},{playing:false},{reducedMotion:true},
 {performanceTier:'low'},{trackId:''},{trackId:null},{trackId:123},{progressMs:NaN},
 {progressMs:-1},{progressMs:180001},{durationMs:Infinity},{durationMs:1000},
 {strength:0},{strength:NaN},{strength:Infinity},{show:null},
 {show:{...show,active:false}},{show:{...show,scene:null}},
 {show:{...show,fade:NaN}},{show:{...show,fade:0}},
 {show:{...show,intensity:0}},{show:{...show,intensity:Infinity}},
 ]){
 const out=plan({...base,...invalid});
 assert.equal(out.active,false,`fail closed: ${JSON.stringify(invalid)}`);
 for(const key of ['cameraGain','rapGain','danceGain','ensembleGain','travelGain'])
  assert.equal(out[key],1,'disabled scene leaves existing systems alone');
}
// Transparent 20k-sample envelope: only attenuation, independent of genre or
// input speed. Nothing may activate a user-disabled feature.
for(let i=0;i<20000;i++){
 const scene=['intro','verse','build','hook','interlude','finale'][i%6];
 const p=plan({...base,show:{...show,scene,intensity:i%115,fade:(i%103)/102},
  performanceTier:i%3===0?'balanced':'high',progressMs:(i*257)%180000,
  strength:(i%110)-15,rapEvidence:i%7!==0,
  manualRap:i%13===0,manualCamera:i%11===0,manualDance:i%17===0});
 for(const key of ['cameraGain','rapGain','danceGain','ensembleGain','travelGain'])
  assert(Number.isFinite(p[key])&&p[key]>=0&&p[key]<=1,`sample ${i}: ${key}`);
 if(!p.active)assert.equal(p.cameraGain,1);
}
assert(plan({...base,strength:10}).danceGain>=cue.danceGain,'less intensity can only attenuate less');
assert(plan({...base,performanceTier:'balanced'}).danceGain>=cue.danceGain,'balanced is gentler');
const source=read('lib/arena360PerformanceDirectorV1065.ts');
for(const forbidden of ['fetch(','Math.random(','Date.now(','setInterval(','setTimeout(',
 'WebSocket(','requestAnimationFrame(','localStorage','navigator.','morphTargetInfluences'])
 assert(!source.includes(forbidden),`no new real-time owner: ${forbidden}`);
for(const file of ['types/music.ts','components/visualizer/registry.tsx',
 'context/UiPreferencesContext.tsx','components/visualizer/VisualizerStage.tsx',
 'components/visualizer/ArenaShowDesignerPanelV1040.tsx'])
 assert(read(file).includes('arenaPerformanceDirectorEnabledV1065'),file);
assert(read('context/UiPreferencesContext.tsx').includes('arenaPerformanceDirectorEnabledV1065:false'));
const stage=read('components/visualizer/ThreeAvatar.tsx');
for(const part of ['planPerformanceDirectorV1065({','performanceDirectorV1065.cameraGain',
 'performanceDirectorV1065.rapGain','performanceDirectorV1065.danceGain',
 'performanceDirectorV1065.ensembleGain','performanceDirectorV1065.travelGain',
 'const dancerPropsV1065:VisualizerProps=',
 'props.lipSync?.rapSyllableEditsEnabledV420===true'])
 assert(stage.includes(part),`not integrated: ${part}`);
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes(
 'V1065 · AI Performance Director'));
for(const file of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(file).includes('tests/v1065-performance-director-regression.cjs'));
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert.match(pkg.version,/^0\.1\.0-v(10(?:6[5-9]|[7-9]\d)|1[1-9]\d\d)$/);assert.equal(pkg.version,lock.version);
assert.equal(pkg.version,lock.packages[''].version);
console.log('PASS V1065: 20,000 bounded samples, manual/vocal/camera safeguards, section priorities, CI integration');
