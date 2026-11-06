#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..');
const read=(name)=>fs.readFileSync(path.join(root,name),'utf8');
const {floatingStagePlatformCountV1038,INITIAL_FLOATING_STAGE_V1038,
 planFloatingStageV1038,stepFloatingStageV1038,sampleFloatingPlatformV1038}=load('lib/arena360FloatingStageV1038');
const base={enabled:true,playing:true,reducedMotion:false,reactive:true,mode:'auto',intensity:95,energy:.85};
assert.deepEqual(['low','balanced','high'].map(floatingStagePlatformCountV1038),[2,4,6]);
const cues=Object.fromEntries(['break','verse','build','hook','drop'].map(section=>[section,planFloatingStageV1038({...base,section})]));
assert(cues.break.lift<cues.verse.lift&&cues.verse.lift<cues.build.lift&&cues.build.lift<cues.hook.lift);
assert(cues.hook.lift<=cues.drop.lift);
assert.equal(cues.break.orbitSpeed,0);
assert(cues.drop.orbitSpeed>0);
assert.equal(planFloatingStageV1038({...base,mode:'rise'}).orbitSpeed,0);
assert(planFloatingStageV1038({...base,mode:'wave'}).orbitSpeed>0);
assert.equal(planFloatingStageV1038({...base,mode:'orbit'}).wave,.03*.95);
for(const opts of [{enabled:false},{reducedMotion:true},{reactive:false}]){
 const cue=planFloatingStageV1038({...base,...opts});
 assert.equal(cue.lift,.42);assert.equal(cue.orbitSpeed,0);assert.equal(cue.wave,0);
}
assert.equal(planFloatingStageV1038({...base,intensity:0}).lift,.42);
assert(planFloatingStageV1038({...base,intensity:250}).lift<=1.32);
for(const energy of [NaN,Infinity,-12,999,undefined]){
 const cue=planFloatingStageV1038({...base,energy});
 for(const key of Object.keys(cue))assert(Number.isFinite(cue[key]));
}
let state={...INITIAL_FLOATING_STAGE_V1038};
const cue=planFloatingStageV1038({...base,mode:'orbit',section:'drop',intensity:100});
for(let i=0;i<600;i++)state=stepFloatingStageV1038(state,1/60,cue,{enabled:true,playing:true,reducedMotion:false});
assert(state.lift>.95&&state.lift<=1.32);assert(Number.isFinite(state.angle));
assert(state.time>0);assert(state.spread>=0&&state.spread<=.08);
for(const count of [2,4,6])for(let i=0;i<count;i++){
 const p=sampleFloatingPlatformV1038(i,count,state,cue);
 assert(p.outerRadius<=3.74,'must not enter audience ring');
 assert(p.outerRadius>=3.55&&p.y>=.28&&p.y<=1.46);
 assert(Math.hypot(p.x,p.z)<=3.43+1e-8);
 assert(Object.values(p).every(Number.isFinite));
}
const paused=stepFloatingStageV1038(state,1/60,cue,{enabled:true,playing:false,reducedMotion:false});
assert.deepEqual(paused,state,'pause must preserve location and time');
const parked=stepFloatingStageV1038(state,1/60,cue,{enabled:true,playing:true,reducedMotion:true});
assert.deepEqual(parked,INITIAL_FLOATING_STAGE_V1038);
assert.deepEqual(stepFloatingStageV1038(state,1/60,cue,{enabled:false,playing:true,reducedMotion:false}),INITIAL_FLOATING_STAGE_V1038);
const wild=stepFloatingStageV1038({lift:Infinity,spread:NaN,angle:Infinity,time:NaN},Infinity,
 {lift:Infinity,spread:Infinity,orbitSpeed:Infinity,wave:NaN,brightness:NaN},
 {enabled:true,playing:true,reducedMotion:false});
assert(Object.values(wild).every(Number.isFinite));
for(const name of ['types/music.ts','components/visualizer/registry.tsx','context/UiPreferencesContext.tsx',
 'components/SettingsPanel.tsx','components/visualizer/ThreeAvatar.tsx','components/visualizer/VisualizerStage.tsx']) {
 const txt=read(name);
 for(const key of ['arenaFloatingStageEnabledV1038','arenaFloatingStageModeV1038','arenaFloatingStageIntensityV1038'])
  assert(txt.includes(key),`missing ${key} in ${name}`);
}
const stageColors=read('components/visualizer/DynamicStage.tsx');
assert(stageColors.includes('arena360: {base:"#080f24",primary:"#00e4ff",secondary:"#d756ff",floor:"#17213c"}'),
 'Arena360 must have a light palette in DynamicStage');
assert(stageColors.includes('satisfies Record<StageTheme,'),
 'All StageTheme variants must be covered by the palette at compile time');
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(stage.includes('<ArenaFloatingPlatformsV1038'));
const world=stage.indexOf('<ArenaFloatingPlatformsV1038');
const moving=stage.indexOf('ref={turntable}');
assert(world>=0&&world<moving,'floating satellites must stay separate from turntable + avatar cast');
assert(stage.includes('ref={scenicTier}')&&stage.includes('{children}'));
const component=read('components/visualizer/stages/ArenaFloatingPlatformsV1038.tsx');
for(const token of ['useAdaptivePerformance','useFrame','cylinderGeometry','ringGeometry','stepFloatingStageV1038','name="v1038-world-fixed-floating-stage"'])
 assert(component.includes(token));
for(const risky of ['setInterval(','setTimeout(','spotLight','pointLight','fetch(','new WebSocket'])
 assert(!component.includes(risky),`unsafe extra work: ${risky}`);
for(const key of ['floatingStageEnabled={floatingStageEnabled}','floatingStageMode={floatingStageMode}',
 'floatingStageIntensity={floatingStageIntensity}'])assert(read('components/visualizer/stages/index.tsx').includes(key));
assert(read('components/visualizer/StageThemeCardScene.tsx').includes('v1038-preview-floating-'));
console.log('V1038 Floating Stage: section plans, tier budgets, safe spatial envelope, pause, reduced motion, settings, preview, integration PASS');
