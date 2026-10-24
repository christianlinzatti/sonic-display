require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {newLowInteractionStateV483:make,stepLowInteractionV483:step}=load('components/visualizer/naturalLowPoseInteractionV483');
const positions=[[-2.3,0,0],[-.75,0,0],[.75,0,0],[2.3,0,0]];
const makePlan=(depths)=>({active:depths.some(x=>x>.001),slots:depths.map(d=>({mode:d?'crouch':'stand',depth:d})),source:depths.some(x=>x>.001)?'automatic-stage':'disabled'});
const scene=(state,depths,overrides={})=>step(state,{
  plan:makePlan(depths),positions,count:4,trackId:'song-1',seconds:4,cueSeconds:3,
  focus:1,drop:true,beat:.9,energy:.8,playing:true,reducedMotion:false,
  manualPriority:false,automaticGroup:true,lyricsForeground:false,enabled:true,
  tier:'high',maxConcurrent:4,...overrides,
});
const st=make();
let result=scene(st,[.4,.4,.4,.4]);
assert(result.active,'shared drop has active group cues');
assert(result.slots.every(s=>Number.isFinite(s.look.yaw)&&Number.isFinite(s.gesture.shoulder)));
assert(result.slots[0].look.yaw>0,'left dancer glances right');
assert(result.slots[1].look.yaw<0,'right dancer glances left');
assert(result.slots.some(s=>s.gesture.leftLift!==s.gesture.rightLift),'responses alternate');
for(const slot of result.slots){
  assert(Math.abs(slot.look.yaw)<=.095&&Math.abs(slot.look.eyeYaw)<=.036);
  assert(Math.abs(slot.gesture.lean)<=.012&&slot.gesture.shoulder<=.025);
}
// Recovery begins at a shared boundary, but adjacent dancers stand at different times.
result=scene(st,[0,0,0,0],{seconds:4.03});
assert.equal(result.plan.slots[0].depth,0);
assert(result.plan.slots[1].depth>.3,'partner holds very briefly for delayed rise');
assert(result.plan.slots[2].depth>.3,'second pair staggers its release');
assert(result.plan.slots[3].depth>.3,'fourth dancer staggers its release');
result=scene(st,[0,0,0,0],{seconds:4.16});
assert.equal(result.plan.slots[1].depth,0);
assert(result.plan.slots[3].depth>.3);
result=scene(st,[0,0,0,0],{seconds:4.28});
assert(result.plan.slots.every(s=>s.depth===0),'all recover within 240 ms');
// The explicit synchronized-drop override is preserved through its exit even
// when normal maxConcurrent defaults to two. New formations still take priority.
const shared=make();scene(shared,[.3,.3,.3,.3],{seconds:5,drop:true,maxConcurrent:2});
result=scene(shared,[0,0,0,0],{seconds:5.01,drop:false,maxConcurrent:2});
assert(result.plan.slots.filter(s=>s.depth>.001).length>=3,'synchronized group drop finishes staggered even under default normal limit');
result=scene(shared,[0,0,0,0],{seconds:5.30,drop:false,maxConcurrent:2});
assert(result.plan.slots.every(s=>s.depth===0));
// A new formation never exceeds the per-group concurrency cap.
const capped=make();scene(capped,[.3,.3,0,0],{seconds:8,maxConcurrent:2});
result=scene(capped,[0,0,.3,0],{seconds:8.01,maxConcurrent:2});
assert(result.plan.slots.filter(s=>s.depth>.001).length<=2);
// Manual cue, pause, foreground lyrics, non-auto group, reduced motion and track
// changes cancel release immediately and never change the choreography decision.
for(const guard of [{manualPriority:true},{playing:false},{reducedMotion:true},{lyricsForeground:true},
                    {automaticGroup:false},{enabled:false},{trackId:null},{count:2},{seconds:NaN}]){
 const state=make();scene(state,[.42,.42,.42,.42]);
 const next=scene(state,[0,0,0,0],{seconds:4.01,...guard});
 assert.equal(next.active,false,JSON.stringify(guard));
 assert(next.plan.slots.every(s=>s.depth===0),JSON.stringify(guard));
}
const switchState=make();scene(switchState,[.42,.42,.42,.42]);
result=scene(switchState,[0,0,0,0],{trackId:'next-song',seconds:4.01});
assert.equal(result.active,false,'song change invalidates previous low scene');
scene(switchState,[.3,.3,.3,.3],{trackId:'next-song',seconds:10});
result=scene(switchState,[0,0,0,0],{trackId:'next-song',seconds:2});
assert.equal(result.active,false,'seek backwards invalidates stale release');
// A full 30-minute playback simulation: four finite slots; no histories or timers.
const long=make();for(let i=0;i<108000;i++){
 const t=i/60;const down=i%480<270;
 const x=scene(long,down?[.32,.32,.32,.32]:[0,0,0,0],{seconds:t,cueSeconds:0,drop:down});
 if(i%200===0){
  assert(x.slots.every(s=>Object.values(s.look).every(Number.isFinite)));
  assert(x.plan.slots.every(s=>Number.isFinite(s.depth)&&s.depth>=0&&s.depth<=.58));
 }
}
assert.equal(long.heldDepth.length,4);
const source=fs.readFileSync('components/visualizer/naturalLowPoseInteractionV483.ts','utf8');
assert(!/fetch\(|setInterval\(|requestAnimationFrame\(|Math\.random\(|Date\.now\(/.test(source));
const avatar=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
assert(avatar.includes('stepLowInteractionV483(lowInteractionV483.current'));
assert(avatar.includes('combineCrewLooksV452(looksV444.current[i].current,accent.look)'));
assert(avatar.includes('combineCrewGesturesV452(gesturesV444.current[i].current,accent.gesture)'));
assert(avatar.includes('lowInteractionPlanV483.plan.slots[i]'));
assert(avatar.includes('stepNaturalLowPoseV482(naturalLowV482.current'));
assert(avatar.includes('stepLowClipV482(clipLatchV482.current'));
const pkg=require('../package.json');
assert(Number(pkg.version.match(/-v(\d+)$/)?.[1])>=483);
assert(pkg.scripts['build:preflight'].includes('npm run test:v483 && npm run test:v483:types'));
console.log('PASS V483: interactive low-pose glances, staggered rise, limits, overrides, seek reset, 30-minute stability, R3F wiring');
