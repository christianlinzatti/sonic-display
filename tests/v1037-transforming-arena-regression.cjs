#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const {planArenaTransformationV1037,stepArenaTransformationV1037,
 sampleArenaPetalV1037,arenaPetalCountV1037,INITIAL_ARENA_TRANSFORMATION_V1037}=load('lib/arena360TransformationV1037');
const base={enabled:true,playing:true,reducedMotion:false,reactive:true,section:'hook',mode:'auto',strength:100,energy:.9};
const hook=planArenaTransformationV1037(base),verse=planArenaTransformationV1037({...base,section:'verse'});
const build=planArenaTransformationV1037({...base,section:'build'});
const breakCue=planArenaTransformationV1037({...base,section:'break'});
assert.equal(hook.pattern,'fan');assert.equal(build.pattern,'spiral');assert.equal(verse.pattern,'halo');
assert.equal(breakCue.pattern,'closed');assert.equal(breakCue.extension,0);
assert(hook.extension>verse.extension&&hook.extension>build.extension);
assert.equal(planArenaTransformationV1037({...base,mode:'spiral'}).pattern,'spiral');
assert.equal(planArenaTransformationV1037({...base,mode:'fan',strength:0}).extension,0);
for(const opts of [{enabled:false},{playing:false},{reducedMotion:true},{reactive:false}]){
 const cue=planArenaTransformationV1037({...base,...opts});assert.equal(cue.extension,0);assert.equal(cue.lift,0);
}
for(const energy of [NaN,Infinity,-50,100,undefined]){
 const cue=planArenaTransformationV1037({...base,energy});
 for(const k of ['extension','lift','twist','brightness'])assert(Number.isFinite(cue[k]));
}
const low=arenaPetalCountV1037('low'),balanced=arenaPetalCountV1037('balanced'),high=arenaPetalCountV1037('high');
assert.deepEqual([low,balanced,high],[4,6,8]);
let state={...INITIAL_ARENA_TRANSFORMATION_V1037};
for(let i=0;i<600;i++)state=stepArenaTransformationV1037(state,1/60,hook,{playing:true,enabled:true,reducedMotion:false});
assert(state.extension>.3&&state.extension<=.46&&state.lift<=.16);
for(const count of [low,balanced,high]){
 for(let i=0;i<count;i++)for(const pattern of ['fan','spiral','halo','closed']){
  const sample=sampleArenaPetalV1037(i,count,state,pattern);
  assert(sample.outerRadius<=3.60+1e-9,'petals must never touch fixed crowd');
  assert(sample.outerRadius>=3.14&&sample.y>=0&&sample.y<=.16);
  assert(Math.abs(sample.x*Math.sin(sample.angle)+sample.z*Math.cos(sample.angle))<1e-9,
   'expansion must align with actual mesh rotation');
  assert(Number.isFinite(sample.x)&&Number.isFinite(sample.z)&&Number.isFinite(sample.twist));
 }
}
const frozen=stepArenaTransformationV1037(state,1/30,hook,{playing:false,enabled:true,reducedMotion:false});
assert.deepEqual(frozen,state,'pause must keep last geometry pose');
const off=stepArenaTransformationV1037(state,1/60,hook,{playing:true,enabled:false,reducedMotion:false});
assert.deepEqual(off,INITIAL_ARENA_TRANSFORMATION_V1037);
const reduced=stepArenaTransformationV1037(state,1/60,hook,{playing:true,enabled:true,reducedMotion:true});
assert.deepEqual(reduced,INITIAL_ARENA_TRANSFORMATION_V1037);
const huge=stepArenaTransformationV1037({extension:Infinity,lift:NaN,twist:Infinity},Infinity,hook,{playing:true,enabled:true,reducedMotion:false});
assert(Object.values(huge).every(Number.isFinite));
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(stage.includes('<ArenaTransformingDeckV1037'));
const turntable=stage.indexOf('ref={turntable}'),petals=stage.indexOf('<ArenaTransformingDeckV1037');
assert(turntable>=0&&petals>turntable&&petals<stage.indexOf('{children}',turntable),'petals must share turning cast root');
assert(stage.includes('ref={scenicTier}')&&stage.includes('{children}'),'keep old stage & avatars');
const part=read('components/visualizer/stages/ArenaTransformingDeckV1037.tsx');
for(const token of ['useAdaptivePerformance','useFrame','ringGeometry','name="v1037-transforming-petal-deck"','stepArenaTransformationV1037'])assert(part.includes(token));
assert(!part.includes('setInterval(')&&!part.includes('spotLight')&&!part.includes('pointLight'));
for(const k of ['arenaTransformingDeckEnabledV1037','arenaTransformingDeckModeV1037','arenaTransformingDeckStrengthV1037']){
 for(const rel of ['types/music.ts','components/visualizer/registry.tsx','context/UiPreferencesContext.tsx',
  'components/visualizer/ThreeAvatar.tsx','components/visualizer/VisualizerStage.tsx','components/SettingsPanel.tsx'])
  assert(read(rel).includes(k),`${k} missing in ${rel}`);
}
assert(read('components/visualizer/stages/index.tsx').includes('transformingDeckEnabled={transformingDeckEnabled}'));
assert(read('components/visualizer/StageThemeCardScene.tsx').includes('v1037-preview-petal-'));
console.log('V1037 transforming arena: sections, safe segmented movement, pause, performance, settings, preview, stage integration PASS');
