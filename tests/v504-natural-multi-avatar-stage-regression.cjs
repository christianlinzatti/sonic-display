'use strict';
require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planNaturalMultiAvatarStageV504:plan}=load('components/visualizer/naturalMultiAvatarStageInteractionV504');
const {planIntelligentRapDuetV500:oldPlan}=load('components/visualizer/intelligentRapDuetPerformanceV500');
const {combineCrewGesturesV452,combineCrewLooksV452}=load('components/visualizer/advancedMultiAvatarPerformanceV452');
const positions=[[-2,0,0],[-.65,0,-.05],[.7,0,.1],[2.1,0,0]];
const cue={active:true,style:'solo',lineIndex:-1,leadSlot:1,partnerSlot:null,
 singingSlots:[1],handoffFrom:null,phase:1,emphasis:.8,startMs:1000,endMs:6200,source:'none',count:4};
const source={trackId:'song1',cueTrackId:'song1',cue,progressMs:1840,count:4,positions,
 playing:true,reducedMotion:false,manualPriority:false,beat:.85,strength:70,tier:'high'};
function sample(patch={}){const input={...source,...patch};return plan({...input,base:patch.base??oldPlan(input)});}
const solo=sample();
assert(solo.active&&solo.kind==='solo'&&solo.slots.length===4);
assert.equal(solo.slots[1].intent,'lead');
assert.equal(solo.slots[1].look.yaw,0,'authored lead must face the crowd');
assert(solo.slots.some((slot,i)=>i!==1&&slot.look.weight>0),'supporting cast watches authored lead');
assert.deepEqual(sample(),solo,'replay and seek deterministic');
const before=JSON.stringify(source);sample();assert.equal(JSON.stringify(source),before,'read-only input');
const paused=sample({playing:false});assert.deepEqual(paused,{active:false,kind:'off',slots:[]});
const early=sample({progressMs:1015});assert(early.slots[0].gesture.intensity<solo.slots[0].gesture.intensity);
const nearEnd=sample({progressMs:6195});assert(nearEnd.slots.every(slot=>slot.look.weight<.005),'fade away by end');
const duetCue={...cue,style:'duet',partnerSlot:2,singingSlots:[1,2],handoffFrom:null};
const duet=sample({cue:duetCue,progressMs:1636});
assert(duet.active&&duet.kind==='duet');
assert(duet.slots[1].intent==='duet'&&duet.slots[2].intent==='duet');
assert(duet.slots[1].look.yaw>0,'leader glances towards guest');
const duetOther=sample({cue:duetCue,progressMs:2643});
assert(duetOther.slots[2].look.yaw<0,'guest can acknowledge lead in a different phrase');
const hookCue={...cue,style:'hook',singingSlots:[0,1,2,3],handoffFrom:null};
const hook=sample({cue:hookCue,progressMs:1800});
assert(hook.active&&hook.slots.every(slot=>slot.intent==='chorus'&&slot.look.yaw===0&&slot.look.weight===0),
 'shared hooks stay crowd-facing');
assert(hook.slots[0].gesture.intensity===hook.slots[1].gesture.intensity,'shared chorus pulse');
const replyCue={...cue,style:'reply',partnerSlot:0,handoffFrom:0};
const reply=sample({cue:replyCue,progressMs:1480});
assert(reply.slots[0].intent==='answer'&&reply.slots[0].look.yaw>0,
 'only the authored outgoing vocalist reacts to the incoming singer');
const lateReply=sample({cue:replyCue,progressMs:3600});
assert.equal(lateReply.slots[0].look.weight>=0,true);
const duoCue={...cue,count:2,leadSlot:0,singingSlots:[0],handoffFrom:null};
const duo=sample({cue:duoCue,count:2,positions:[[-1,0,0],[1,0,0]]});
assert(duo.active&&duo.slots.length===2&&duo.slots[1].look.yaw<0);
const trioCue={...cue,count:3};
assert(sample({cue:trioCue,count:3,positions:positions.slice(0,3)}).slots.length===3);
for(const patch of [
 {trackId:'another'},{cueTrackId:'another'},{trackId:''},{playing:false},{reducedMotion:true},
 {manualPriority:true},{progressMs:900},{progressMs:6200},{progressMs:NaN},
 {count:1},{count:5},{positions:positions.slice(0,2)},
 {positions:[...positions.slice(0,3),[NaN,0,0]]},{strength:0},
 {cue:{...cue,count:2}},{cue:{...cue,active:false}},
 {cue:{...cue,leadSlot:8}},{cue:{...cue,singingSlots:[9]}},
 {cue:{...cue,startMs:6200,endMs:1000}},
 {cue:{...cue,style:'hook',singingSlots:[1]}},
 {cue:{...cue,style:'duet',partnerSlot:null,singingSlots:[1,2]}},
 {base:{active:false,kind:'off',slots:[]}},
 ]){
  assert.deepEqual(sample(patch),{active:false,kind:'off',slots:[]},`must be safely off ${Object.keys(patch)}`);
}
assert(sample({tier:'low'}).slots[2].gesture.intensity<sample({tier:'balanced'}).slots[2].gesture.intensity);
assert(sample({tier:'balanced'}).slots[2].gesture.intensity<solo.slots[2].gesture.intensity);
// Overlays only target tiny, fully clamped upper-body and gaze channels.
for(let i=0;i<24000;i++){
 const style=['solo','reply','duet','hook'][i%4],count=2+i%3;
 const localCue={...cue,count,style,leadSlot:0,
  singingSlots:style==='hook'?Array.from({length:count},(_,j)=>j):style==='duet'?[0,1]:[0],
  partnerSlot:style==='duet'?1:null,handoffFrom:style==='reply'?1:null,
  startMs:0,endMs:1500000};
 const input={...source,cue:localCue,count,positions:positions.slice(0,count),
  progressMs:1000+i*31,beat:i%13?i%10/9:NaN,tier:['high','balanced','low'][i%3]};
 const b=oldPlan(input),p=plan({...input,base:b});
 if(!Number.isFinite(input.beat))assert(!p.active);
 else {
  assert(p.active&&p.slots.length===count);
  for(const slot of p.slots){
   const {look,gesture}=slot;
   for(const v of [...Object.values(look),...Object.values(gesture)])assert(Number.isFinite(v),'finite cue output');
   assert(Math.abs(look.yaw)<=.08&&Math.abs(look.eyeYaw)<=.03&&look.weight<=.18);
   assert(gesture.leftLift<=.034&&gesture.rightLift<=.034&&gesture.shoulder<=.025);
   assert(Math.abs(gesture.lean)<=.01&&gesture.intensity<=.06);
   const safeLook=combineCrewLooksV452({yaw:.40,pitch:.14,eyeYaw:.10,weight:.9},look);
   const safeGesture=combineCrewGesturesV452({leftLift:.34,rightLift:.34,shoulder:.125,lean:.045,intensity:.95},gesture);
   assert(Math.abs(safeLook.yaw)<=.42&&safeLook.weight<=1);
   assert(safeGesture.leftLift<=.35&&safeGesture.rightLift<=.35);
  }
 }
}
const duoSource=fs.readFileSync('components/visualizer/DanceFormationActorsV492.tsx','utf8');
const groupSource=fs.readFileSync('components/visualizer/GroupDancersV326SceneV492.tsx','utf8');
for(const [name,src] of [['duo',duoSource],['group',groupSource]]){
 assert(src.includes('planNaturalMultiAvatarStageV504('),name+' invokes planner');
 assert(src.includes('base:duetAccentV500'),name+' is strictly gated by V500 authored assignment');
 assert(src.includes('combineCrewGesturesV452(')&&src.includes('combineCrewLooksV452('),name+' protects overlay bounds');
 assert(src.indexOf('planNaturalMultiAvatarStageV504(')>src.indexOf('planIntelligentRapDuetV500('),name+' preserves V500 priority');
 assert(src.includes('!!manualCueV385.active'),name+' honors manual singer casts');
}
const plannerSrc=fs.readFileSync('components/visualizer/naturalMultiAvatarStageInteractionV504.ts','utf8');
for(const forbidden of ['useFrame(', 'setInterval(', 'requestAnimationFrame(', 'window.', 'fetch(', 'localStorage', 'new AnimationMixer'])
 assert(!plannerSrc.includes(forbidden),'must be pure and no extra render path: '+forbidden);
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
assert(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1])>=504);
assert(pkg.scripts['build:preflight'].includes('npm run test:v504 && npm run test:v504:types && npm run test:v503'));
console.log('PASS V504: 24,000 samples, solo/duet/reply/hook, 2-4 avatars, deterministic seeks, manual/cross-track safety, duo/group wiring');
