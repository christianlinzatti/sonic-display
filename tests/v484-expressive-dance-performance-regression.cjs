'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planExpressiveLowPoseV484:plan}=load('components/visualizer/expressiveLowPosePerformanceV484');
const original={active:true,source:'automatic-stage',slots:[
  {mode:'crouch',depth:.42},{mode:'low-bounce',depth:.37},
  {mode:'crouch',depth:.4},{mode:'kneel',depth:.36},
]};
const input=(change={})=>({plan:original,count:4,focus:1,seconds:8.2,cueSeconds:8,
  genre:'Deutschrap',section:'verse',beat:.88,kick:.55,snare:.82,energy:.8,
  playing:true,reducedMotion:false,manualPriority:false,automaticGroup:true,
  lyricsForeground:false,tier:'high',...change});
const result=plan(input());
assert(result.active&&result.mode==='rap','rap gestures active with evidence');
assert.equal(result.accents.length,4);
assert(result.accents[0].leftLift>result.accents[0].rightLift,'left member accents left arm');
assert(result.accents[1].rightLift>result.accents[1].leftLift,'right member accents right arm');
for(const a of result.accents){
  for(const v of Object.values(a))assert(Number.isFinite(v));
  assert(a.leftLift>=0&&a.leftLift<=.17&&a.rightLift>=0&&a.rightLift<=.17);
  assert(a.shoulder>=0&&a.shoulder<=.05&&a.lean>=-.032&&a.lean<=.008&&a.intensity<=.29);
}
const hard=plan(input({genre:'Hardstyle',section:'drop',kick:.96,beat:.94}));
assert(hard.active&&hard.mode==='group','hardstyle group drop');
assert.notDeepEqual(hard.accents[0],result.accents[0],'genre director shapes gestures differently');
assert.deepEqual(plan(input()),result,'seek-safe deterministic result for identical time and inputs');
const kneel=result.accents[3],squat=result.accents[2];
assert(kneel.intensity<squat.intensity,'one-knee pose has smaller accents for stability');
const weak=plan(input({beat:0,kick:0,snare:0}));
assert(!weak.active,'no invented vocal punchline or beat when evidence absent');
const balanced=plan(input({tier:'balanced'})),low=plan(input({tier:'low'}));
assert(result.accents[0].intensity>balanced.accents[0].intensity);
assert(balanced.accents[0].intensity>low.accents[0].intensity,'quality tiers damp extra gestures');
const start=plan(input({seconds:8.001}));
assert(start.accents[0].intensity<result.accents[0].intensity*.01,'fade on section entry');
const subset={active:true,source:'automatic-stage',slots:[
  {mode:'crouch',depth:.38},{mode:'stand',depth:0},{mode:'stand',depth:0},{mode:'crouch',depth:.36}
]};
const subsetResult=plan(input({plan:subset}));
assert(subsetResult.active);
assert.deepEqual(subsetResult.accents[2],{leftLift:0,rightLift:0,shoulder:0,lean:0,intensity:0},'standing nonlead gets no unsolicited gestures');
assert(subsetResult.accents[1].intensity>0,'standing lead receives only restrained accent');
assert(subsetResult.accents[1].intensity<subsetResult.accents[0].intensity,'standing lead remains subtle');
for(const guard of [
  {playing:false},{reducedMotion:true},{manualPriority:true},{automaticGroup:false},
  {lyricsForeground:true},{count:2},{count:5},{seconds:NaN},{cueSeconds:NaN},
  {beat:NaN},{kick:Infinity},{energy:NaN},{seconds:1,cueSeconds:8},
  {plan:{...original,source:'manual-stage'}},
  {plan:{...original,active:false}},
  {plan:{...original,slots:original.slots.slice(0,3)}},
]){
  const inactive=plan(input(guard));
  assert(!inactive.active,JSON.stringify(guard));
  assert(inactive.accents.every(a=>Object.values(a).every(v=>v===0)));
}
const allStand=plan(input({plan:{active:true,source:'automatic-stage',slots:original.slots.map(()=>({mode:'stand',depth:0}))}}));
assert(!allStand.active);
// Playback simulation checks finite, bounded and stable values without accumulating timers/state.
for(let i=0;i<120000;i++){
  const t=i/60;
  const next=plan(input({seconds:t,cueSeconds:Math.max(0,Math.floor(t/12)*12),beat:Math.sin(t)**2,
    kick:Math.cos(t)**2,snare:Math.sin(t*.7)**2,energy:.65}));
  if(i%397===0)for(const a of next.accents)assert(Object.values(a).every(Number.isFinite));
}
const avatar=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
assert(avatar.includes('planExpressiveLowPoseV484({'));
assert(avatar.includes('combineCrewGesturesV452(gesturesV444.current[i].current,expressiveV484.accents[i])'));
assert(avatar.includes('lowWeightV484'));
assert(avatar.includes("avatarMotionMode!=='choreography'"));
assert(avatar.includes('stepLowInteractionV483(lowInteractionV483.current'));
assert(avatar.includes('stepNaturalLowPoseV482(naturalLowV482.current'));
const moduleSource=fs.readFileSync('components/visualizer/expressiveLowPosePerformanceV484.ts','utf8');
assert(!/\b(fetch|setInterval|setTimeout|requestAnimationFrame|Math\.random|Date\.now|new THREE)\b/.test(moduleSource));
const pkg=require('../package.json');
assert(Number(pkg.version.match(/-v(\d+)$/)?.[1])>=484);
assert(pkg.scripts['build:preflight'].includes('npm run test:v484 && npm run test:v484:types'));
console.log('PASS V484: expressive low-pose arms, rap/hardstyle patterns, GLB-safe layering, overrides, tiers, seek safety, 33-minute simulation');
