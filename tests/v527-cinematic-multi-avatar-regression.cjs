"use strict";
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planCinematicMultiAvatarV527:plan,performerStyleV527:style,performerPhraseV527:phrase}=load('components/visualizer/cinematicMultiAvatarV527');
const {planAdvancedGroupV517:group}=load('components/visualizer/advancedGroupPerformanceV517');
const pts=[[-2,0,0],[-.6,0,0],[.6,0,0],[2,0,0]];
const authored={active:true,role:'feature',leadSlot:1,singingSlots:[1],startMs:1000,endMs:12000,handoffFrom:0,count:3};
const base={count:3,trackId:'rap-song',cueTrackId:'rap-song',seconds:2.1,progressMs:2100,
  bpm:106,positions:pts.slice(0,3),playing:true,reducedMotion:false,manualPriority:false,
  tier:'high',beat:.8,energy:.7, cue:authored,risks:[]};
const old=group(base);assert(old.active&&old.source==='authored-singer'&&old.lead===1);
const q=plan(old,base);
assert(q.active&&q.source==='authored-singer'&&q.lead===1&&q.focus==='handoff');
assert.equal(q.slots.length,3);assert.deepEqual(q,plan(old,base));
assert(q.slots.every(x=>x.turnY===0));
assert.deepEqual(q.slots.map(x=>x.singing),[false,true,false]);
assert(q.slots.every(x=>Number.isFinite(x.phase)&&x.phase>=0&&x.phase<=1));
assert.equal(new Set(q.slots.map(x=>x.style)).size,3);
assert.equal(style('rap-song',1),style('rap-song',1));
assert.notEqual(style('rap-song',0),style('rap-song',1));
assert.equal(phrase(1,0,0),0);assert.equal(phrase(-1,4,0),0);
const frozen=JSON.stringify(base);plan(old,base);assert.equal(JSON.stringify(base),frozen);
const zero=plan(old,{...base,risks:[{risk:1,accentScale:1,gestureScale:1},null,null]});
assert.equal(zero.slots[0].gesture.intensity,0);
for(const changed of [{playing:false},{reducedMotion:true},{manualPriority:true},{tier:'low'},
  {trackId:''},{progressMs:NaN},{energy:NaN},{count:5},{positions:[[0,0,NaN],...pts]}]){
  assert(!plan(old,{...base,...changed}).active);
}
for(const changed of [{cueTrackId:'wrong'},{cue:null},{cue:{...authored,active:false}},
  {cue:{...authored,leadSlot:0}},{cue:{...authored,singingSlots:[0]}},
  {cue:{...authored,endMs:2000}},{cue:{...authored,singingSlots:[1,1]}}]){
  assert(!plan(old,{...base,...changed}).active,JSON.stringify(changed));
}
const vFormation={active:true,lead:0,moment:'hook',slots:[{},{},{},{}]};
const visualInput={...base,count:4,cue:null,formation:vFormation,positions:pts};
const visualBase=group(visualInput);assert(visualBase.active&&visualBase.source==='visual-only');
const visual=plan(visualBase,visualInput);
assert(visual.active&&visual.focus==='ensemble'&&visual.slots.every(x=>!x.singing));
assert(visual.slots.every(x=>x.look.yaw===0));
assert(!plan(visualBase,{...visualInput,cue:{...authored}}).active);
assert(!plan(visualBase,{...visualInput,count:2}).active);
const lowBase=group({...base, tier:'low'});assert(!plan(lowBase,base).active);
const hookCue={...authored,role:'hook',singingSlots:[0,1,2],handoffFrom:null};
const hookInput={...base,cue:hookCue};
const hook=plan(group(hookInput),hookInput);assert(hook.active&&hook.focus==='ensemble');
assert(hook.slots.every(s=>s.singing&&s.look.yaw===0));
for(const [file,tokens] of [
 ['components/visualizer/GroupDancersV326SceneV492.tsx',['planCinematicMultiAvatarV527(groupV517','cinematicV527.slots[i].gesture','cinematicV527.slots[i]?.turnY','softenCollisionGestureV506']],
 ['components/visualizer/DanceFormationActorsV492.tsx',['planCinematicMultiAvatarV527(groupDuoV517','cinematicDuoV527.slots[1].gesture','softenCollisionGestureV506']]]){
 const src=fs.readFileSync(file,'utf8');for(const token of tokens)assert(src.includes(token),`${file} missing ${token}`);
}
const src=fs.readFileSync('components/visualizer/cinematicMultiAvatarV527.ts','utf8');
for(const x of ['requestAnimationFrame(','setInterval(','new Audio(','localStorage','navigator.mediaDevices'])assert(!src.includes(x));
const pkg=require('../package.json');assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]||0)>=527);
assert(pkg.scripts['build:preflight'].includes('npm run test:v527 && npm run test:v527:types'));
let cases=0;
for(const count of [2,3,4])for(const moment of ['verse','feature','handoff','hook','drop']){
 for(let i=0;i<820;i++){
  const activeCue={...authored,count,role:moment==='hook'?'hook':moment==='feature'?'feature':'lead',
   leadSlot:i%count,singingSlots:moment==='hook'?Array.from({length:count},(_,k)=>k):[i%count],
   handoffFrom:moment==='handoff'?(i+1)%count:null,startMs:1000,endMs:12000};
  const t=1000+(i%600)*16;
  const input={...base,count,cue:activeCue,seconds:t/1000,progressMs:t,
   bpm:75+i%95,energy:(i%100)/100,beat:(i%13)/12,
   tier:i%2?'balanced':'high',positions:pts.slice(0,count),
   risks:Array.from({length:count},(_,n)=>({risk:n===0?(i%100)/100:0,gestureScale:1,accentScale:1}))};
  const b=group(input),v=plan(b,input);
  assert(v.active,`active ${count} ${moment} ${i}`);
  assert.equal(v.slots.length,count);
  assert(v.slots.every((s,n)=>s.slot===n&&Number.isFinite(s.gesture.intensity)&&s.gesture.intensity>=0&&s.gesture.intensity<=.018&&
    Math.abs(s.look.yaw)<=.030&&s.turnY===0&&s.phase>=0&&s.phase<=1));
  cases++;
 }
}
console.log(`PASS V527 cinematic multi-avatar: ${cases} feature/hook/verse/drop frames, identity authority, collision controls, stage hooks`);
