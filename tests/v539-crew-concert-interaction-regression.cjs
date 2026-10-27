'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planCrewConcertInteractionV539:crew}=load('components/visualizer/crewConcertInteractionV539');
const {planAdvancedGroupV517:group}=load('components/visualizer/advancedGroupPerformanceV517');
const {planCinematicMultiAvatarV527:cinematic}=load('components/visualizer/cinematicMultiAvatarV527');
const positions=[[-2,0,0],[-.8,0,0],[.8,0,0],[2,0,0]];
const mk=(count=3)=>({active:true,role:'lead',leadSlot:1,singingSlots:[1],startMs:1000,endMs:12000,handoffFrom:null,count});
const input=(cue=mk(),override={})=>({count:cue?.count??3,trackId:'rap-song',cueTrackId:'rap-song',
  cue,seconds:1.6,progressMs:1600,bpm:110,positions,playing:true,reducedMotion:false,
  manualPriority:false,tier:'high',beat:.9,energy:.75,strength:80,risks:[],...override});
const evaluate=i=>{const g=group(i);const c=cinematic(g,i);return crew(g,c,i);};
const one=evaluate(input());assert(one.active&&one.moment==='call-response');
assert.equal(one.slots[1].role,'lead');assert.equal(one.slots[1].target,null);
assert.equal(one.slots[0].target,1);assert.equal(one.slots[2].target,1);
assert.deepEqual(one,evaluate(input()));
const duetCue={...mk(),singingSlots:[1,2],role:'feature'};
const duet=evaluate(input(duetCue,{progressMs:2200,seconds:2.2}));
assert(duet.active&&duet.moment==='duet');
assert.equal(duet.slots[1].target,2);assert.equal(duet.slots[2].target,1);
const handoffCue={...mk(),handoffFrom:0,role:'feature'};
const handoff=evaluate(input(handoffCue,{progressMs:1500,seconds:1.5}));
assert(handoff.active&&handoff.moment==='handoff');assert.equal(handoff.slots[0].role,'outgoing');
const afterHandoff=evaluate(input(handoffCue,{progressMs:3500,seconds:3.5}));
assert.equal(afterHandoff.slots[0].strength,0,'handoff acknowledgement decays outside handoff window');
const hookCue={...mk(),singingSlots:[0,1,2],role:'hook'};
const hook=evaluate(input(hookCue,{progressMs:1800,seconds:1.8}));
assert(hook.active&&hook.moment==='hook');
assert(hook.slots.every(s=>s.role==='chorus'&&s.target===null&&s.look.yaw===0));
for(const k of [{playing:false},{reducedMotion:true},{manualPriority:true},{tier:'low'},
  {trackId:''},{trackId:'another'},{cueTrackId:'wrong'},{progressMs:NaN},{beat:NaN},
  {count:5},{positions:[[NaN,0,0],...positions]},{strength:0}]){
  const i=input(mk(),k);assert(!evaluate(i).active,JSON.stringify(k));
}
for(const corrupt of [{...mk(),active:false},{...mk(),count:2},{...mk(),leadSlot:0},
  {...mk(),singingSlots:[0]},{...mk(),singingSlots:[1,1]},
  {...mk(),handoffFrom:5},{...mk(),startMs:5000,endMs:2000},
  {...mk(),singingSlots:[1,4]},{...mk(),role:'hook',singingSlots:[1]}]){
  const i=input(corrupt,{count:3});assert(!evaluate(i).active,JSON.stringify(corrupt));
}
const visualI=input(null,{cue:null,count:4,formation:{active:true,lead:0,moment:'hook',slots:[{},{},{},{}]},progressMs:5000,seconds:5});
const visual=evaluate(visualI);
assert(visual.active&&visual.moment==='visual-hook'&&visual.source==='visual-only');
assert(visual.slots.every(s=>s.role==='visual'&&s.target===null),'visual lead cannot claim singer');
assert(!evaluate({...visualI,cue:mk(4),cueTrackId:'wrong'}).active,'unverified cue blocks visual-only');
const verseVisual={...visualI,formation:{...visualI.formation,moment:'verse'}};
assert(!evaluate(verseVisual).active,'visual-only verse is not a singer claim');
const far=input(mk(),{positions:[[99,0,0],[-.8,0,0],[.8,0,0]]});
const farPlan=evaluate(far);assert(farPlan.active&&farPlan.slots[0].look.yaw===0);
const risk=input(mk(),{risks:[{risk:1,gestureScale:1,accentScale:1}]});
const riskPlan=evaluate(risk);assert(riskPlan.active&&riskPlan.slots[0].strength===0);
let frames=0;
for(const count of [2,3,4])for(let tick=0;tick<1800;tick++){
  const start=1000,end=12000,p=1000+(tick%687)*16;
  const cue={...mk(count),leadSlot:tick%count,
    singingSlots:tick%4===0?Array.from({length:count},(_,i)=>i):[tick%count],
    role:tick%4===0?'hook':'feature',handoffFrom:tick%4===1?(tick+1)%count:null};
  const i=input(cue,{count,positions:positions.slice(0,count),progressMs:p,seconds:p/1000,
    tier:tick%2?'balanced':'high',beat:(tick%37)/36,energy:(tick%89)/88,
    risks:Array.from({length:count},(_,j)=>({risk:j===0?(tick%9)/8:0,gestureScale:1,accentScale:1}))});
  const outcome=evaluate(i);assert(outcome.active,`${count}:${tick}`);
  assert.equal(outcome.slots.length,count);
  assert(outcome.slots.every((s,j)=>s.slot===j&&Number.isFinite(s.strength)&&s.strength>=0&&s.strength<=.85&&
    Number.isFinite(s.look.yaw)&&Math.abs(s.look.yaw)<=.028&&s.gesture.intensity>=0&&s.gesture.intensity<=.030));
  frames++;
}
for(const path of ['components/visualizer/GroupDancersV326SceneV492.tsx','components/visualizer/DanceFormationActorsV492.tsx']){
 const src=fs.readFileSync(path,'utf8');
 assert(src.includes('planCrewConcertInteractionV539('),`Not integrated into ${path}`);
 assert(src.includes('combineCrewLooksV452(')&&src.includes('combineCrewGesturesV452('));
 assert(src.includes('planCinematicMultiAvatarV527('));
}
const source=fs.readFileSync('components/visualizer/crewConcertInteractionV539.ts','utf8');
for(const banned of ['requestAnimationFrame(','setInterval(','localStorage','navigator.mediaDevices','new Audio(','setState('])assert(!source.includes(banned));
const pkg=require('../package.json');assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]||0)>=539);
assert(pkg.scripts['build:preflight'].includes('npm run test:v539 && npm run test:v539:types'));
console.log(`PASS V539: ${frames} ensemble samples, duet/handoff/hooks, track priority, risk gates and stage wiring`);
