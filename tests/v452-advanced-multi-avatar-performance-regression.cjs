require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planCrewAccentsV452:plan,combineCrewGesturesV452:gestures,combineCrewLooksV452:looks}=load('components/visualizer/advancedMultiAvatarPerformanceV452');
const coords=[[-1.9,0,0],[-.6,0,.3],[.6,0,.3],[1.9,0,0]];
const base={enabled:true,playing:true,reducedMotion:false,manualPriority:false,count:4,positions:coords,focus:1,drop:false,section:'verse',seconds:8.9,cueSeconds:8,beat:.9,energy:.8,strength:85,blend:1};
const verse=plan(base);
assert.equal(verse.active,true);assert.equal(verse.mode,'verse');assert.equal(verse.lead,1);assert.equal(verse.slots.length,4);
assert.deepEqual(plan(base),verse,'deterministic plan');
assert(verse.slots[1].offsetZ<=0,'visual lead may step slightly forwards');
assert.equal(verse.slots[0].offsetX,0,'verse formation may not spread sideways');
assert(verse.slots[0].look.yaw>0&&verse.slots[3].look.yaw<0,'listeners glance towards central visual focus');
assert(verse.slots[1].gesture.rightLift>=0);
const hook=plan({...base,focus:-1,drop:true,section:'hook',seconds:8.6});
assert.equal(hook.mode,'hook');assert.equal(hook.lead,null);assert.equal(hook.slots.length,4);
const commonX=hook.slots[0].offsetX;
assert(hook.slots.every(s=>s.offsetX===commonX&&s.turnY===hook.slots[0].turnY),'group accents stay synchronized');
assert(hook.slots.every(s=>s.look.yaw===0),'hook does not assign an artificial lead');
assert(hook.slots.every(s=>s.gesture.leftLift===s.gesture.rightLift),'shared hook accent');
const fade=plan({...base,blend:0});
assert(fade.slots[1].gesture.rightLift<=verse.slots[1].gesture.rightLift,'soft formation transition');
for (const n of [2,3,4]){
 const p=plan({...base,count:n,positions:coords.slice(0,n),focus:0,section:'verse'});
 assert(p.active&&p.slots.length===n);
 for (const slot of p.slots){
  assert(Math.abs(slot.offsetX)<=.05&&Math.abs(slot.offsetZ)<=.06&&Math.abs(slot.turnY)<=.05);
  assert(slot.gesture.rightLift<=.08&&slot.gesture.leftLift<=.08);
  assert(slot.gesture.intensity<=.22&&slot.gesture.intensity>=0);
  assert(Math.abs(slot.look.yaw)<=.42&&slot.look.weight<=1);
  assert(Object.values(slot.gesture).every(Number.isFinite));
 }
}
for (const patch of [{enabled:false},{playing:false},{reducedMotion:true},{manualPriority:true},{count:1},
 {count:5},{positions:coords.slice(0,1)},{positions:[[NaN,0,0],...coords.slice(1)]},
 {seconds:NaN},{seconds:-1},{strength:0}]){
 const result=plan({...base,...patch});assert.equal(result.active,false,JSON.stringify(patch));assert.deepEqual(result.slots,[]);
}
const manualHook=plan({...base,focus:-1,drop:true,manualPriority:true});assert(!manualHook.active);
assert.equal(plan({...base,focus:99}).active,false,'invalid focus does not invent a lead artist');
const muted=plan({...base,beat:0,energy:0});assert(muted.slots.every(s=>s.gesture.intensity<.1));
const oldGesture={leftLift:.34,rightLift:.33,shoulder:.12,lean:.049,intensity:.94};
const merged=gestures(oldGesture,{leftLift:.5,rightLift:.5,shoulder:.1,lean:.05,intensity:.8});
assert.deepEqual(merged,{leftLift:.35,rightLift:.35,shoulder:.13,lean:.05,intensity:1});
const mergedLook=looks({yaw:.40,pitch:.15,eyeYaw:.105,weight:.98},{yaw:.2,pitch:.1,eyeYaw:.1,weight:.3});
assert.deepEqual(mergedLook,{yaw:.42,pitch:.16,eyeYaw:.11,weight:1});
assert.deepEqual(coords,[[-1.9,0,0],[-.6,0,.3],[.6,0,.3],[1.9,0,0]],'positions unchanged');
const renderer=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
assert(renderer.includes('planCrewAccentsV452('));
assert(renderer.includes('const crewDuoV452=planCrewAccentsV452('),'two-person live branch');
assert(renderer.includes('const crewV452=planCrewAccentsV452('),'three/four person branch');
assert(renderer.includes('g.position.x=formationApproach(g.position.x,targetX+(crewV458.slots[i]?.offsetX??0)'));
assert(renderer.includes('const interactionV444=featureInteractionV460(interactionBaseV444,'),'V444/V460 stage cue remains upstream');
assert(renderer.includes('base:interactionV444,pose,feature:props.featureDirectionV460'),'V475 takes original V444 cue as input');
assert(renderer.includes('combineCrewGesturesV452(interactionV475.slots[i]?.gesture??NEUTRAL_GESTURE'),'V452 still merges refined V444/V475 cues');
assert(renderer.includes('!!selectedSingerV444'),'manual vocal controls retain priority');
assert(renderer.includes('manualPriority:!!manualPose||!!manualActive||!!choreography'),'duo manual guards');
assert(!fs.readFileSync('components/visualizer/advancedMultiAvatarPerformanceV452.ts','utf8').includes('localStorage'),'no extra setup/storage');
assert(/^0\.1\.0-v(?:45[2-9]|4[6-9]\d|[5-9]\d\d)$/.test(require('../package.json').version));
console.log('PASS V452: 2-4 avatars, shared hook groove, staggered verse responses, stable positions, easing, manual guards, no inferred artist or GLB rewrites');
