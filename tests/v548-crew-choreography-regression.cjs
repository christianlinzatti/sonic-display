"use strict";
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planCrewChoreographyV548:plan,crewPhraseV548:phrase}=load('components/visualizer/crewChoreographyV548');
const positions=[[-2,0,0],[-.6,0,.35],[.8,0,.1],[2.2,0,-.3]];
const hook={active:true,role:'hook',leadSlot:0,singingSlots:[0,2],startMs:2000,endMs:7000,handoffFrom:null,count:4};
const base={trackId:'song-548',cueTrackId:'song-548',count:4,seconds:3,progressMs:3500,bpm:125,
 playing:true,reducedMotion:false,manualPriority:false,tier:'high',beat:.9,energy:.8,strength:100,
 positions,cue:hook,footLocked:false};
const at=(change={})=>plan({...base,...change});
const result=at();
assert.equal(result.active,true);
assert.equal(result.source,'authored-singer');
assert.equal(result.moment,'hook');
assert.deepEqual(result.slots.map(s=>s.role),['lead','backing','feature','dancer']);
assert.deepEqual(result.slots.map(s=>s.singing),[true,false,true,false],
 'V547 selective hooks must never grow into four vocalists');
assert.equal(result.slots.length,4);
assert(result.slots.every(s=>s.look.yaw===0),'all selected hook singers face forward');
assert(result.slots.some(s=>s.grooveGain!==1));
assert.equal(at({footLocked:true}).slots.every(s=>s.grooveGain===1),true);
assert.deepEqual(at(),at(),'planning must be seek and render-order deterministic');
assert.equal(phrase(NaN,2,.1),0);
assert.equal(phrase(3,0,.1),0);
assert.equal(phrase(3,2,.1),phrase(3,2,.1));
const allSingers={...hook,singingSlots:[0,1,2,3]};
assert.deepEqual(at({cue:allSingers}).slots.map(s=>s.singing),[true,true,true,true]);
const feat={...hook,role:'feature',leadSlot:2,singingSlots:[2],handoffFrom:0};
assert.equal(at({cue:feat,progressMs:2600}).moment,'handoff');
assert.equal(at({cue:feat}).lead,2);
const duet={...hook,count:2,leadSlot:1,singingSlots:[1,0]};
const d=at({cue:duet,count:2,positions:positions.slice(0,2)});
assert.equal(d.active,true);
assert.deepEqual(d.slots.map(s=>s.role),['feature','lead']);
const solo={...duet,singingSlots:[1],role:'lead'};
assert.deepEqual(at({cue:solo,count:2,positions:positions.slice(0,2)}).slots.map(s=>s.role),['backing','lead']);
const visual={active:true,source:'visual-only',scene:'hook',lead:2,slots:Array.from({length:4},(_,slot)=>({slot}))};
const v=at({cue:null,visualGroup:visual});
assert.equal(v.active,true);assert.equal(v.source,'visual-only');
assert.equal(v.slots.some(s=>s.singing),false,'automatic visual cast is never a vocalist');
assert.deepEqual(v.slots.map(s=>s.role),['backing','dancer','lead','dancer']);
assert.equal(at({cue:null,count:2,positions:positions.slice(0,2),visualGroup:{...visual,slots:visual.slots.slice(0,2)}}).active,false);
assert.equal(at({cue:{...hook,leadSlot:3},visualGroup:visual}).active,false,'bad manual cues never fall back to visual');
const invalid=[
 {cueTrackId:'different'},{trackId:'different'}, {manualPriority:true},{playing:false},
 {reducedMotion:true},{tier:'low'},{count:5}, {count:1}, {progressMs:7000},
 {progressMs:1900},{progressMs:NaN}, {seconds:NaN}, {beat:NaN}, {energy:NaN},
 {strength:NaN},{cue:{...hook,singingSlots:[0,0]}},
 {cue:{...hook,singingSlots:[0,4]}},{cue:{...hook,singingSlots:[2]}},
 {cue:{...hook,startMs:8000}}, {cue:{...hook,endMs:2000}},
 {cue:{...hook,count:3}}, {cue:{...hook,handoffFrom:4}},
 {positions:[[0,0,0],[0,0,0],[0,NaN,0],[0,0,0]]}
];
for(const change of invalid)assert.equal(at(change).active,false,JSON.stringify(change));
const danger=at({risks:Array.from({length:4},()=>({risk:1,gestureScale:0,accentScale:0}))});
assert(danger.slots.every(s=>s.gesture.intensity===0&&s.gesture.leftLift===0&&s.grooveGain===1));
assert.equal(at({strength:0}).slots.every(s=>s.gesture.intensity===0&&s.grooveGain===1),true);
assert.equal(at({beat:0,energy:0}).slots.every(s=>s.gesture.intensity===0&&s.grooveGain===1),true,'silence never synthesizes a groove');
for(const s of [10,90,130,185,210,300]){
 const q=at({bpm:s});assert.equal(q.active,true);
 for(const slot of q.slots){assert(slot.grooveGain>=.90&&slot.grooveGain<=1.08);assert(Math.abs(slot.gesture.lean)<=.0055);
 assert(slot.gesture.leftLift<=.025&&slot.gesture.rightLift<=.025&&slot.gesture.shoulder<=.017);}
}
let checked=0;
for(let i=0;i<14000;i++){
 const progressMs=2000+(i%5000),beat=(i%100)/100,energy=((i*13)%100)/100;
 const r=at({progressMs,seconds:progressMs/1000,beat,energy,footLocked:i%13===0,
   tier:i%7===0?'balanced':'high'});
 assert.equal(r.active,true);
 for(const slot of r.slots){
  assert(Number.isFinite(slot.phase)); assert(slot.grooveGain>=.9&&slot.grooveGain<=1.08);
  assert(slot.gesture.intensity>=0&&slot.gesture.intensity<=.038);
  assert(slot.look.weight>=0&&slot.look.weight<=.047);
 }
 checked++;
}
for(const file of ['GroupDancersV326SceneV492.tsx','DanceFormationActorsV492.tsx']){
 const s=fs.readFileSync('components/visualizer/'+file,'utf8');
 assert(s.includes('planCrewChoreographyV548('),file+' runtime integration');
 assert(s.includes('combineCrewGesturesV452('),file+' clamp owner');
 assert(s.includes('mergeAnimatedSlotV508('),file+' animated collision');
 assert(s.includes('cueTrackId:'),file+' strict singer identity');
}
const group=fs.readFileSync('components/visualizer/GroupDancersV326SceneV492.tsx','utf8');
assert(group.indexOf('const roleCrewV548=')>group.indexOf('const crewV539='));
assert(group.indexOf('const roleCrewV548=')<group.indexOf('if(collisionV506.active||motionV508.active)'));
assert(group.includes('audio.beatStrength=Math.min(1,Math.max(0,(audio.beatStrength??0)*slot.grooveGain))'));
assert(!fs.readFileSync('components/visualizer/crewChoreographyV548.ts','utf8').includes('useFrame('));
const pkg=require('../package.json');assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]||0)>=548);
assert(pkg.scripts['build:preflight'].includes('npm run test:v548 && npm run test:v548:types &&'));
console.log(`PASS V548: ${checked} deterministic frames, selective V547 hooks, role separation, safety, legacy singer control, duo/group wiring`);
