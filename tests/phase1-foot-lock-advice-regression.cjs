'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {suggestFootLockFromQualityV322:recommend}=load('components/visualizer/footLockReviewSuggestionsV322');
const {DEFAULT_FOOT_LOCK_V322:defaults}=load('components/visualizer/intelligentFootLockV322');
const side=(overrides={})=>({
 observedPairs:24,nearFloorPairs:18,nearFloorSeconds:.9,
 possibleSlidePairs:8,possibleSlideSeconds:.4,maxHorizontalSpeedBodyHeightsPerSec:.8,
 ...overrides
});
const review=(overrides={})=>({
 status:'inspect',assumption:'sampled-lowest-foot',sampleCount:25,
 left:side(),right:side({possibleSlidePairs:0,possibleSlideSeconds:0,maxHorizontalSpeedBodyHeightsPerSec:0}),
 ...overrides
});
const test=(name,fn)=>{try{fn();}catch(e){e.message='V322 review '+name+': '+e.message;throw e;}};
test('conservative advice is available for meaningful suspected slide',()=>{
 const input=review(),before=JSON.stringify(input);
 const out=recommend(input,defaults);
 assert(out);
 assert.deepEqual(out.settings,{...defaults,anchorStrength:75,releaseSpeed:70,maxCorrectionCm:6});
 assert.equal(out.settings.enabled,false,'never enable Foot Lock on inspection');
 assert.equal(out.changeRequired,true);
 assert.equal(out.suspectedIntervals,8);
 assert.equal(out.observedNearFloorIntervals,36);
 assert.equal(JSON.stringify(input),before,'input reports are immutable');
 assert.deepEqual(out,recommend(input,defaults),'same input yields same advice');
});
test('explicitly enabled state and stronger manual options are never downgraded',()=>{
 const chosen={enabled:true,anchorStrength:98,releaseSpeed:95,floorTracking:68,maxCorrectionCm:2};
 const out=recommend(review(),chosen);
 assert(out);
 assert.equal(out.settings.enabled,true);
 assert.equal(out.settings.anchorStrength,98);
 assert.equal(out.settings.releaseSpeed,95);
 assert.equal(out.settings.floorTracking,68);
 assert.equal(out.settings.maxCorrectionCm,2);
 assert.equal(out.changeRequired,false);
});
test('do not overreact to ambiguous contact',()=>{
 assert.equal(recommend(undefined,defaults),null);
 assert.equal(recommend(review({status:'unavailable'}),defaults),null);
 assert.equal(recommend(review({status:'insufficient'}),defaults),null);
 assert.equal(recommend(review({status:'no-obvious-slip'}),defaults),null);
 assert.equal(recommend(review({assumption:'none'}),defaults),null);
 assert.equal(recommend(review({sampleCount:4}),defaults),null);
 assert.equal(recommend(review({left:side({nearFloorPairs:3,possibleSlidePairs:1,possibleSlideSeconds:.05}),
   right:side({nearFloorPairs:2,possibleSlidePairs:0,possibleSlideSeconds:0})}),defaults),null);
 assert.equal(recommend(review({left:side({possibleSlidePairs:2,possibleSlideSeconds:.2}),
   right:side({possibleSlidePairs:0,possibleSlideSeconds:0})}),defaults),null);
 assert.equal(recommend(review({left:side({possibleSlidePairs:5,possibleSlideSeconds:.03}),
   right:side({possibleSlidePairs:0,possibleSlideSeconds:0})}),defaults),null);
});
test('malformed reports cannot cause global settings suggestions',()=>{
 const junk=[NaN,Infinity,-1];
 for(const invalid of junk){
   assert.equal(recommend(review({left:side({observedPairs:invalid})}),defaults),null);
   assert.equal(recommend(review({left:side({possibleSlidePairs:invalid})}),defaults),null);
 }
 assert.equal(recommend(review({left:side({possibleSlidePairs:22})}),defaults),null);
 assert.equal(recommend(review({left:side({possibleSlideSeconds:2})}),defaults),null);
});
test('no localStorage write or runtime IK changes in pure suggestion logic',()=>{
 const source=fs.readFileSync('components/visualizer/footLockReviewSuggestionsV322.ts','utf8');
 for(const marker of ['writeFootLockV322','window.', 'document.', 'localStorage','new AnimationMixer','requestAnimationFrame','useFrame(', 'fetch(', 'Math.random(']){
   assert(!source.includes(marker),marker);
 }
});
test('user-visible action requires explicit confirmation; disabled stays disabled',()=>{
 const ui=fs.readFileSync('components/CharacterMotionBatchInstaller.tsx','utf8');
 assert(ui.includes('suggestFootLockFromQualityV322('));
 assert(ui.includes('writeFootLockV322('));
 assert(ui.includes('checked={footLockConfirmed}'));
 assert(ui.includes('footLockReviewConfirmedV322===reviewKey'));
 assert(ui.includes('Ich habe die Bewegung im 3D-Viewer geprüft'));
 assert(ui.includes('disabled={!footLockConfirmed||advancedBusyV534||busy}'));
 assert(ui.includes('...proposed.settings,enabled:now.enabled'));
 assert(ui.includes('V322 ist danach weiterhin'));
 const workflow=fs.readFileSync('.github/workflows/v965-room-wave-production.yml','utf8');
 assert(workflow.includes('tests/phase1-foot-lock-advice-regression.cjs'));
});
console.log('PASS Phase1 V322 suggestion: explicit consent, insufficient evidence, finite guards, manual priority and global opt-in');
