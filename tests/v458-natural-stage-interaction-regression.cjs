'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planCrewAccentsV452}=load('components/visualizer/advancedMultiAvatarPerformanceV452');
const {refineNaturalCrewV458:refine}=load('components/visualizer/naturalStageInteractionV458');
const coords=[[-2,0,0],[-.7,0,.3],[.7,0,.3],[2,0,0]];
const base={enabled:true,playing:true,reducedMotion:false,manualPriority:false,count:4,
  positions:coords,focus:1,drop:false,section:'verse',seconds:9.1,cueSeconds:8,
  beat:.9,energy:.8,strength:75,blend:1};
const input={seconds:9.1,cueSeconds:8,beat:.9,energy:.8,positions:coords,quality:'high',footLocked:false};
const old=planCrewAccentsV452(base);
const result=refine(old,input);
assert(result.active&&result.mode==='verse'&&result.slots.length===4);
assert.deepEqual(refine(old,input),result,'pure and deterministic');
assert.notDeepEqual(result,old,'new expressive accents actually change results');
assert.deepEqual(old,planCrewAccentsV452(base),'V452 plan is not mutated');
assert.equal(result.lead,1,'vocal stage priority cannot be reassigned');
assert(result.slots[1].gesture.rightLift>=old.slots[1].gesture.rightLift,'lead gets natural accent');
assert(result.slots[2].gesture.leftLift>=old.slots[2].gesture.leftLift,'reply gets small response gesture');
assert(result.slots[0].gesture.intensity<=.3);
assert(result.slots.every(s=>Math.abs(s.offsetX)<=.055&&Math.abs(s.offsetZ)<=.057));
assert(result.slots.every(s=>Math.abs(s.turnY)<=.06));
assert(result.slots.every(s=>Object.values(s.gesture).every(Number.isFinite)&&Object.values(s.look).every(Number.isFinite)));
assert(result.slots.every(s=>s.offsetX===0),'verse does not create new sideways drift');
const hookBase=planCrewAccentsV452({...base,focus:-1,section:'hook',drop:true});
const hook=refine(hookBase,input);
assert(hook.slots.every(s=>s.offsetX===hook.slots[0].offsetX),'hook root motion is shared');
assert(hook.slots.every(s=>s.offsetZ===hook.slots[0].offsetZ),'hook depth motion is shared');
assert(hook.slots.every(s=>s.look.pitch===hook.slots[0].look.pitch),'hook head nods are shared');
assert(hook.slots.every(s=>s.gesture.leftLift===s.gesture.rightLift),'hook gesturing remains symmetric');
assert.equal(hook.lead,null);
const first=refine(old,{...input,seconds:8});
assert.deepEqual(first,old,'phrase starts without a jump');
const near=refine(old,{...input,positions:[[-.3,0,0],[0,0,0],[.3,0,0],[.6,0,0]]});
assert(near.slots.every(s=>s.offsetX===0&&s.offsetZ===0),'unsafe spacing suppresses all automatic root movement');
const foot=refine(old,{...input,footLocked:true});
assert(foot.slots.every(s=>s.offsetX===0&&s.offsetZ===0),'foot contact is never overridden');
assert(foot.slots.some(s=>s.gesture.rightLift>0),'safe upper body gestures may continue');
const balanced=refine(old,{...input,quality:'balanced'});
const low=refine(old,{...input,quality:'low'});
assert(low.slots[1].gesture.rightLift<=balanced.slots[1].gesture.rightLift);
assert(balanced.slots[1].gesture.rightLift<=result.slots[1].gesture.rightLift);
const off=planCrewAccentsV452({...base,reducedMotion:true});
assert.deepEqual(refine(off,input),off,'reduce motion retains V452 gate');
for (const patch of [{playing:false},{enabled:false},{manualPriority:true},{count:1}]){
 const inactive=planCrewAccentsV452({...base,...patch});
 assert.deepEqual(refine(inactive,input),inactive,JSON.stringify(patch));
}
for (const patch of [{seconds:NaN},{energy:Infinity},{beat:NaN},{cueSeconds:Infinity},{positions:[[-1,0,NaN],...coords.slice(1)]}]){
 assert.deepEqual(refine(old,{...input,...patch}),old,'invalid data fall back to V452');
}
for(const count of [2,3,4])for(const quality of ['high','balanced','low']){
 const positions=coords.slice(0,count);
 for(let second=0;second<1800;second+=.5){
  const beat=(Math.cos(second*.9)+1)/2;
  const scene=second%24<8?'hook':'verse';
  const previous=planCrewAccentsV452({...base,count,positions,seconds:second,cueSeconds:Math.floor(second/6)*6,
    section:scene,focus:scene==='hook'?-1:0,drop:scene==='hook',beat});
  const current=refine(previous,{seconds:second,cueSeconds:Math.floor(second/6)*6,positions,
    beat,energy:.5,quality,footLocked:second%5<1});
  assert.equal(current.slots.length,count);
  for(const s of current.slots){
   for(const v of [...Object.values(s.gesture),...Object.values(s.look),s.offsetX,s.offsetZ,s.turnY])assert(Number.isFinite(v));
   assert(Math.abs(s.offsetX)<=.055&&Math.abs(s.offsetZ)<=.057);
  }
 }
}
const renderer=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
assert(renderer.includes('const crewDuoV458=refineNaturalCrewV458(crewDuoV452'));
assert(renderer.includes('const crewV458=refineNaturalCrewV458(crewV452'));
assert(renderer.includes('footLocked:footLock'));
assert(renderer.includes('footLocked:true'));
assert(renderer.includes('quality:getActivePerformanceTier()'));
assert(renderer.includes('manualPriority:!!settings.trackId||!!selectedSingerV444'));
assert(renderer.includes('manualPriority:!!manualPose||!!manualActive||!!choreography'));
assert(renderer.includes('crewV458.slots[i]?.offsetX'));
assert(!fs.readFileSync('components/visualizer/naturalStageInteractionV458.ts','utf8').includes('localStorage'));
assert(Number(require('../package.json').version.match(/v(\d+)$/)?.[1])>=458);
console.log('PASS V458: 2-4 avatar natural accents, hooks/verse, partner spacing, foot-IK, tiers, all manual/reduced-motion guards, 30-minute deterministic simulation');
