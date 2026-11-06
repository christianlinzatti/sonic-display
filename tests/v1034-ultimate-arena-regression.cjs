#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {INITIAL_ARENA_LIFT_V1034,normalizeArenaSectionV1034,planArenaShowV1034,
 stepArenaLiftV1034,createArenaSkyFixturesV1034,sampleArenaSkyFixtureV1034,
 composeArenaSectionCameraV1034}=load('lib/arena360ShowV1034');

// Real concert section aliases and false drop prevention.
for(const [value,expected] of Object.entries({VERSE:'verse',chorus:'hook',refrain:'hook',
  'pre-chorus':'build',build_up:'build',DROP:'drop',bridge:'break',intro:'break',outro:'break'})){
 assert.equal(normalizeArenaSectionV1034(value),expected,value);
}
assert.equal(normalizeArenaSectionV1034(null),'verse');
assert.equal(normalizeArenaSectionV1034('random'),'verse');
for(const section of ['verse','hook','drop','build','break']){
 const plan=planArenaShowV1034(section);
 assert.equal(plan.section,section);
 assert(plan.lift>=0&&plan.lift<=.27);
 assert(plan.brightness>=0&&plan.brightness<=.9);
}
assert(planArenaShowV1034('drop').lift>planArenaShowV1034('hook').lift);
assert(planArenaShowV1034('hook').lift>planArenaShowV1034('verse').lift);
assert.notEqual(planArenaShowV1034('hook').formation,planArenaShowV1034('drop').formation);
const base={enabled:true,playing:true,reducedMotion:false,reactive:true,section:'drop',energy:1};
let state={...INITIAL_ARENA_LIFT_V1034};
for(let frame=0;frame<400;frame++)state=stepArenaLiftV1034(state,1/60,base);
assert(state.height>.26&&state.height<=.27,'soft lift reaches high energy without exceeding budget');
assert(Number.isFinite(state.rotation));
const paused=stepArenaLiftV1034(state,1/60,{...base,playing:false,section:'break'});
assert.deepEqual(paused,state,'pause freezes mechanical scenic tier');
assert.deepEqual(stepArenaLiftV1034(state,1/60,{...base,reducedMotion:true}),INITIAL_ARENA_LIFT_V1034);
assert.deepEqual(stepArenaLiftV1034(state,1/60,{...base,enabled:false}),INITIAL_ARENA_LIFT_V1034);
assert.deepEqual(stepArenaLiftV1034(state,1/60,{...base,reactive:false}),state);
assert.deepEqual(stepArenaLiftV1034(INITIAL_ARENA_LIFT_V1034,-10,base),INITIAL_ARENA_LIFT_V1034);
assert.deepEqual(stepArenaLiftV1034(INITIAL_ARENA_LIFT_V1034,NaN,base),INITIAL_ARENA_LIFT_V1034);
const move=stepArenaLiftV1034(state,1/60,{...base,section:'break'});
assert(move.height<state.height,'show smoothly comes down after drop');
for(let frame=0;frame<400;frame++)state=stepArenaLiftV1034(state,1/60,{...base,section:'break'});
assert(state.height<.001);

const tiers=['low','balanced','high'].map(t=>createArenaSkyFixturesV1034(t));
assert.deepEqual(tiers.map(t=>t.length),[16,32,48]);
for(const fixtures of tiers){
 for(const f of fixtures){
  assert(Math.abs(Math.hypot(f.x,f.z)-4.15)<.0001,'sky fixed outside dome truss');
  assert(f.y>3.1&&f.y<3.4,'sky must be above crowd');
  for(const section of ['verse','hook','drop','build','break']){
   for(const sec of [0,1.3,4.5]){
    const brightness=sampleArenaSkyFixtureV1034(f,sec,section,.95);
    assert(brightness>=.14&&brightness<=.90&&Number.isFinite(brightness));
   }
  }
 }
}
const first=tiers[2][0];
assert.notEqual(sampleArenaSkyFixtureV1034(first,1,'hook',.7),sampleArenaSkyFixtureV1034(first,1,'drop',.7));
assert(sampleArenaSkyFixtureV1034(first,1,'drop',.7)>sampleArenaSkyFixtureV1034(first,1,'break',.7));

const pose={x:2,y:1.3,z:8,fov:45,targetX:.4,targetY:0,targetZ:.2};
const camera={enabled:true,playing:true,reducedMotion:false,protectedShot:false,section:'hook'};
const hook=composeArenaSectionCameraV1034(pose,camera);
const drop=composeArenaSectionCameraV1034(pose,{...camera,section:'drop'});
const verse=composeArenaSectionCameraV1034(pose,{...camera,section:'verse'});
assert.deepEqual(verse,pose,'verse preserves original shot');
assert(hook.y>pose.y&&hook.fov>pose.fov,'hook is higher and wider');
assert(drop.y>hook.y&&drop.z<pose.z,'drop moves slightly closer and higher');
for(const opt of [{protectedShot:true},{playing:false},{reducedMotion:true},{enabled:false}]){
 assert.deepEqual(composeArenaSectionCameraV1034(pose,{...camera,...opt}),pose,'protected camera untouched');
}
assert.deepEqual(composeArenaSectionCameraV1034({...pose,x:0,z:3.7},camera),{...pose,x:0,z:3.7},'closeup protected');

const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
const sky=read('components/visualizer/stages/ArenaSkyFormationV1034.tsx');
assert(stage.includes('<ArenaSkyFormationV1034')&&stage.includes('stepArenaLiftV1034('));
assert(stage.includes('name="v1034-independent-scenic-lift-ring"'));
assert(stage.indexOf('name="v1034-independent-scenic-lift-ring"')<stage.indexOf('{children}'),
  'lift ring is scenic only, no avatar rig or foot IK disruption');
assert(stage.indexOf('<ArenaSkyFormationV1034')<stage.indexOf('<group ref={turntable}'),
  'overhead illumination remains world fixed');
assert(sky.includes('instancedMesh')&&sky.includes('useAdaptivePerformance'));
assert(!sky.includes('<spotLight')&&!sky.includes('setInterval('),'bounded WebGL and no independent intervals');
for(const file of ['components/visualizer/SmartStageCameraV236.tsx','components/visualizer/StageCameraDirectorV289.tsx']){
 const source=read(file);
 assert(source.includes('composeArenaSectionCameraV1034('),`must compose on existing camera: ${file}`);
 assert(source.includes('protectedShot:'),`manual camera guards: ${file}`);
}
const prefs=['types/music.ts','context/UiPreferencesContext.tsx','components/visualizer/registry.tsx',
 'components/visualizer/VisualizerStage.tsx','components/visualizer/ThreeAvatar.tsx','components/SettingsPanel.tsx'];
for(const key of ['arenaShowDirectorEnabledV1034','arenaSecondLevelEnabledV1034',
 'arenaSkyFormationEnabledV1034','arenaSectionCameraEnabledV1034']){
 for(const file of prefs)assert(read(file).includes(key),`${key} missing in ${file}`);
}
assert(read('components/visualizer/stages/index.tsx').includes('section={section}'));
assert(read('components/visualizer/ThreeAvatar.tsx').includes('section={props.cameraDirectorSection ?? "verse"}'));
console.log('V1034 Ultimate Arena: section dramaturgy, independent moving scenic level, adaptive overhead LEDs, protected camera, settings PASS');
