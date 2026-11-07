'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..');
const {generateArenaShowPlanV1040,sampleArenaShowPlanV1040}=load('lib/arena360ShowDesignerV1040');
const {planArenaTransitionsV1044,applyArenaTransitionV1044}=load('lib/arena360TransitionsV1044');
const plan=generateArenaShowPlanV1040({genre:'Hardtekk',durationMs:210000});
const boundary=plan.segments[0].end*210000;
const base={enabled:true,playing:true,reducedMotion:false,stageIsArena:true,
 plan,progressMs:boundary,durationMs:210000,strength:75};
const middle=planArenaTransitionsV1044(base);
assert.equal(middle.phase,'incoming');assert.equal(middle.boundaryIndex,0);
for(const key of ['stageGain','cameraGain','danceGain','goveeGain'])
 assert(Number.isFinite(middle[key])&&middle[key]>=.55&&middle[key]<1);
const before=planArenaTransitionsV1044({...base,progressMs:boundary-200});
const after=planArenaTransitionsV1044({...base,progressMs:boundary+200});
assert.equal(before.phase,'outgoing');assert.equal(after.phase,'incoming');
assert(Math.abs(before.stageGain-after.stageGain)<1e-12);
assert(Math.abs(before.goveeGain-after.goveeGain)<1e-12);
const far=planArenaTransitionsV1044({...base,progressMs:1000});
assert.equal(far.phase,'steady');assert.equal(far.stageGain,1);
for(const block of [{enabled:false},{playing:false},{reducedMotion:true},
 {stageIsArena:false},{plan:null},{progressMs:-1},{progressMs:NaN},
 {durationMs:0},{durationMs:Infinity},{strength:0}]){
 const t=planArenaTransitionsV1044({...base,...block});
 assert.equal(t.active,false);assert.equal(t.stageGain,1);
}
for(const strength of [-300,NaN,Infinity,50,200,undefined]){
 for(const durationMs of [30000,210000,900000]){
  const t=planArenaTransitionsV1044({...base,durationMs,progressMs:durationMs*.29,strength});
  for(const key of ['stageGain','cameraGain','danceGain','goveeGain','windowMs'])
   assert(Number.isFinite(t[key]));
  assert(t.stageGain>=.55&&t.stageGain<=1);
 }
}
const cue=sampleArenaShowPlanV1040(plan,{enabled:true,playing:true,reducedMotion:false,
 progressMs:boundary-250,durationMs:210000,observedSection:'verse'});
for(const channel of ['stage','camera','dance','govee']){
 const adjusted=applyArenaTransitionV1044(cue,before,channel);
 assert(adjusted.intensity<=cue.intensity&&adjusted.intensity>=0);
 assert.equal(adjusted.scene,cue.scene);assert.equal(adjusted.deck,cue.deck);
 assert.equal(adjusted.lasers,cue.lasers);assert.equal(adjusted.fade,cue.fade);
 assert.strictEqual(applyArenaTransitionV1044(cue,far,channel),cue);
}
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
for(const file of ['components/visualizer/ThreeAvatar.tsx',
 'components/visualizer/stages/Arena360StageV1031.tsx','components/GoveeMusicSyncV909.tsx'])
 assert(read(file).includes('applyArenaTransitionV1044'),file);
assert(read('context/UiPreferencesContext.tsx').includes('arenaTransitionsEnabledV1044:false'));
for(const token of ['setInterval(','setTimeout(','fetch(','localStorage','WebSocket('])
 assert(!read('lib/arena360TransitionsV1044.ts').includes(token));
console.log('PASS V1044 transition continuity, guards and integration');
