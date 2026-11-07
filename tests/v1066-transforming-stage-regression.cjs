#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {
 planStageFormationV1066:plan,sampleStagePetalV1066:sample,
 stepStagePetalV1066:step,INITIAL_STAGE_PETAL_V1066:REST,
}=load('lib/arena360TransformingStageV1066');
const show={active:true,scene:'hook',segmentIndex:3,intensity:90,fade:1,
 deck:'fan',floating:'orbit',lasers:'tunnel',camera:'group',dance:'group'};
const base={enabled:true,stageIsArena:true,playing:true,reducedMotion:false,
 showDesignerEnabled:true,decorEnabled:true,manualDeckMode:'auto',performanceTier:'high',
 progressMs:50000,durationMs:240000,strength:70,show};
const cue=plan(base);
assert(cue.active&&cue.shape==='fan');
assert.deepEqual(cue,plan(base),'same input must produce same pure cue');
assert(sample(0,8,cue).radial>0,'scenic petals actually move');
const chapters=[['intro','crown'],['verse','iris'],['build','helix'],['hook','fan'],
 ['interlude','halo'],['finale','bloom']];
for(const [scene,shape] of chapters){
 const out=plan({...base,show:{...show,scene}});
 assert(out.active&&out.shape===shape,scene);
 const samples=Array.from({length:8},(_,i)=>sample(i,8,out));
 assert(samples.some(s=>s.radial>0),scene+' affects geometry');
 assert(samples.every(s=>s.radial>=0&&s.radial<=.065 &&s.lift>=0&&s.lift<=.085 &&
 Math.abs(s.yaw)<=.045&&s.ledBonus>=0&&s.ledBonus<=.05));
}
assert(sample(0,8,plan({...base,show:{...show,scene:'finale'}})).radial>
 sample(0,8,plan({...base,show:{...show,scene:'interlude'}})).radial,
 'finale expands existing scenery more than the break');
for(const invalid of [{enabled:false},{stageIsArena:false},{playing:false},
 {reducedMotion:true},{showDesignerEnabled:false},{decorEnabled:false},
 {manualDeckMode:'fan'},{manualDeckMode:'spiral'},{manualDeckMode:'halo'},
 {manualDeckMode:null},{performanceTier:'low'},
 {progressMs:-1},{progressMs:Infinity},{progressMs:NaN},{progressMs:240001},
 {durationMs:29000},{durationMs:Infinity},{strength:0},{strength:NaN},
 {strength:Infinity},{show:null},{show:{...show,active:false}},
 {show:{...show,scene:'drop'}},{show:{...show,scene:null}},
 {show:{...show,intensity:0}},{show:{...show,intensity:Infinity}},
 {show:{...show,intensity:101}},{show:{...show,fade:0}},
 {show:{...show,fade:1.2}},{show:{...show,fade:NaN}}]){
 const out=plan({...base,...invalid});
 assert.equal(out.active,false,'fail closed '+JSON.stringify(invalid));
 assert.deepEqual(sample(0,8,out),REST);
}
assert(plan({...base,strength:10}).amount<cue.amount,'strength monotonically scales formation');
assert(plan({...base,performanceTier:'balanced'}).amount<cue.amount,'balanced is gentler');
for(let i=0;i<36000;i++){
 const scene=chapters[i%chapters.length][0];
 const v=plan({...base,show:{...show,scene,intensity:i%101,fade:(i%111)/110},
  progressMs:(i*379)%240000,strength:i%100,performanceTier:i%3===0?'balanced':'high'});
 for(let count of [4,6,8]){
  const p=sample(i%count,count,v);
  assert(Number.isFinite(p.radial)&&p.radial>=0&&p.radial<=.065,'radial');
  assert(Number.isFinite(p.lift)&&p.lift>=0&&p.lift<=.085,'lift');
  assert(Number.isFinite(p.yaw)&&Math.abs(p.yaw)<=.045,'yaw');
  assert(Number.isFinite(p.ledBonus)&&p.ledBonus>=0&&p.ledBonus<=.05,'LED');
  // V1037 petals end at 3.14 + .46: V1066 cannot collide with arena audience.
  assert(3.14+.46+p.radial<3.7,'outer radius remains world-fixed audience-safe');
 }
}
const target=sample(0,8,cue);
let pos={...REST};
for(let i=0;i<150;i++){
 const next=step(pos,.016,target,{enabled:true,playing:true,reducedMotion:false,lowTier:false});
 assert(next.radial<=.065&&next.lift<=.085&&Math.abs(next.yaw)<=.045);
 assert(Math.abs(next.radial-pos.radial)<=.065*(1-Math.exp(-.016*2.5))+1e-9);
 pos=next;
}
assert(Math.abs(pos.radial-target.radial)<.001,'smooth approach converges');
assert.deepEqual(step(pos,.016,{...REST},{enabled:true,playing:false,reducedMotion:false,lowTier:false}),pos,'pause holds');
for(const flags of [{enabled:false,playing:true,reducedMotion:false,lowTier:false},
 {enabled:true,playing:true,reducedMotion:true,lowTier:false},
 {enabled:true,playing:true,reducedMotion:false,lowTier:true}])
 assert.deepEqual(step(pos,.016,target,flags),REST,'disable/motion/tier parks');
const source=read('lib/arena360TransformingStageV1066.ts');
for(const forbidden of ['Math.random(','Date.now(','fetch(','setInterval(','setTimeout(',
 'requestAnimationFrame(','WebSocket(','navigator.','localStorage','microphone','goveeBridgeRequest'])
 assert(!source.includes(forbidden),'no new clock or hardware: '+forbidden);
const deck=read('components/visualizer/stages/ArenaTransformingDeckV1037.tsx');
assert(deck.includes('stageOffsetsV1066.current[i]'));
assert(deck.includes('stepStagePetalV1066('));
assert(deck.includes('petal.position.set(sample.x+Math.cos(angle)*extra.radial'));
assert.equal((deck.match(/useFrame\(/g)||[]).length,1,'exactly one existing frame owner');
assert(!deck.includes('setInterval(')&&!deck.includes('requestAnimationFrame('));
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(stage.includes('planStageFormationV1066({'));
assert(stage.includes('manualDeckMode:transformingDeckMode'));
assert(stage.includes('stageCueV1066={stageFormationV1066}'));
for(const f of ['types/music.ts','components/visualizer/registry.tsx',
 'context/UiPreferencesContext.tsx','components/visualizer/VisualizerStage.tsx',
 'components/visualizer/ThreeAvatar.tsx','components/visualizer/stages/index.tsx',
 'components/visualizer/stages/Arena360StageV1031.tsx'])
 assert(read(f).includes('arenaTransformingStageEnabledV1066')||read(f).includes('transformingStageEnabledV1066'),f);
assert(read('context/UiPreferencesContext.tsx').includes('arenaTransformingStageEnabledV1066:false'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1066 · Transforming Stage 3.0'));
for(const file of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(file).includes('tests/v1066-transforming-stage-regression.cjs'));
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert.ok(Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1])>=1066, 'V1066 or newer supported');
assert.equal(pkg.version,lock.version);assert.equal(pkg.version,lock.packages[''].version);
console.log('PASS V1066: 108,000 bounded scenic samples, six shapes, manual / low-tier / pause protections, one frame owner');
