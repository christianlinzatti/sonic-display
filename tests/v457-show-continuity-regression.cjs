'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planShowContinuityV457:plan,motionEnergyForContinuityV457:energy}=load('services/show/showContinuityV457');
const {planUltimateAutomaticShowV456:director}=load('services/show/ultimateAutomaticShowV456');
const base={attention:'lyrics',reason:'active-lyrics',allowAutomaticInsight:false,allowCinematic:false,allowConnectionSpotlight:false};
const cue=(section,focus,id)=>({active:true,section,focus,group:section==='hook',motionScene:section==='hook'?'hook':'verse',phrase:0,eventId:id});
const create=(moment,focus,section,id)=>director({enabled:true,playing:true,reducedMotion:false,automaticDance:true,
  count:3,energy:.7,balance:base,cue:cue(section,focus,id)});
const beats=[
 {id:'one',atMs:0,untilMs:12000,section:'verse',focus:0},
 {id:'two',atMs:12000,untilMs:24000,section:'hook',focus:-1},
 {id:'three',atMs:24000,untilMs:36000,section:'verse',focus:1},
 {id:'four',atMs:36000,untilMs:47000,section:'verse',focus:2},
];
const timeline={trackId:'a',source:'synced-lyrics',count:3,beats};
const opts={plan:timeline,trackId:'a',quality:'high'};
const opening=create('solo',0,'verse','one');
assert.equal(plan({...opts,direction:opening,progressMs:200}).blend,1);
const hook=create('crew',0,'hook','two');
const enter=plan({...opts,direction:hook,progressMs:12000});
assert.equal(enter.blend,0);
assert.equal(enter.previous.moment,'solo');
assert.equal(enter.direction.moment,'crew');
assert.equal(enter.direction.interactionMultiplier,1);
assert(energy(enter,2,.2)<.74,'hook energy must ramp, not jump to its maximum');
const middle=plan({...opts,direction:hook,progressMs:12625});
assert(middle.blend>.45&&middle.blend<.55);
assert(middle.direction.interactionMultiplier>1&&middle.direction.interactionMultiplier<1.1);
assert(energy(middle,2,.2)>energy(enter,2,.2));
const settled=plan({...opts,direction:hook,progressMs:13400});
assert.equal(settled.blend,1);assert.equal(settled.previous,null);
assert.equal(settled.direction.interactionMultiplier,1.1);
const balanced=plan({...opts,quality:'balanced',direction:hook,progressMs:13700});
const low=plan({...opts,quality:'low',direction:hook,progressMs:13700});
assert(low.blend<1,'low tier prolongs the settled transition a little');
assert(low.direction.lightMultiplier<=balanced.direction.lightMultiplier);
assert(balanced.direction.lightMultiplier<=settled.direction.lightMultiplier);
assert(low.direction.interactionMultiplier<balanced.direction.interactionMultiplier);
assert(low.lowCost);
assert.equal(energy(low,2,.98),.98,'low tier must preserve strong live energy');
assert(energy(plan({...opts,quality:'low',direction:hook,progressMs:14500}),2,.03)<=.78,'low tier caps only the automatic boost');
const verse=create('solo',1,'verse','three');
const returnToVerse=plan({...opts,direction:verse,progressMs:24000});
assert.equal(returnToVerse.previous.moment,'crew');
assert(energy(returnToVerse,0,.15)>.26,'non-lead avatar must not instantly drop at the boundary');
const handoff=create('solo',2,'verse','four');
assert.equal(plan({...opts,direction:handoff,progressMs:36020}).previous.leadSlot,1);
const later=plan({...opts,direction:handoff,progressMs:39000});
assert.equal(later.previous,null);
const manual=director({enabled:true,playing:true,reducedMotion:false,automaticDance:true,manualVocal:true,
  count:3,balance:base,cue:cue('hook',0,'manual')});
const disabled=plan({...opts,direction:manual,progressMs:12000});
assert.equal(disabled.direction,manual);assert.equal(disabled.lowCost,false);
const paused=director({enabled:true,playing:false,reducedMotion:false,automaticDance:true,count:3,balance:base,cue:cue('hook',0,'paused')});
assert.equal(plan({...opts,direction:paused,progressMs:12000}).previous,null);
assert.equal(plan({...opts,direction:hook,plan:{...timeline,trackId:'previous'},progressMs:12000}).previous,null);
assert.equal(plan({...opts,direction:hook,progressMs:NaN}).previous,null);
assert.equal(plan({...opts,direction:hook,progressMs:-1}).previous,null);
assert.equal(plan({...opts,direction:hook,progressMs:12000,quality:'high'}).direction.cameraCue,hook.cameraCue,'camera cue must remain authored/held');
assert.equal(plan({...opts,direction:hook,progressMs:12000}).direction.balance,hook.balance,'lyrics information budget must be unchanged');
for(const tier of ['high','balanced','low'])for(const ms of [0,12000,12200,13200,24000,24300,36000]){
 const d=ms>=36000?handoff:ms>=24000?verse:ms>=12000?hook:opening;
 const r=plan({...opts,direction:d,progressMs:ms,quality:tier});
 for(const n of [r.blend,r.direction.lightMultiplier,r.direction.interactionMultiplier,energy(r,0,.45)]) assert(Number.isFinite(n));
 assert(r.direction.lightMultiplier>=.9&&r.direction.lightMultiplier<=1.15);
}
// Long playback simulation is a deterministic policy test, NOT a browser FPS benchmark.
const four={...hook,count:4};
const longBeats=Array.from({length:90},(_,i)=>({id:`b-${i}`,atMs:i*20000,
  untilMs:(i+1)*20000,section:i%4===0?'hook':'verse',focus:i%4===0?-1:i%4}));
const longPlan={...timeline,count:4,beats:longBeats};
let checks=0;
for(let ms=0;ms<1_800_000;ms+=1000){
  const i=Math.floor(ms/20000);
  const b=longBeats[i];
  const d=director({enabled:true,playing:true,reducedMotion:false,
    automaticDance:true,count:4,energy:.4,balance:base,
    cue:cue(b.section,b.focus,b.id)});
  for(const quality of ['high','balanced','low']){
    const c=plan({direction:d,plan:longPlan,progressMs:ms,trackId:'a',quality});
    assert(c.blend>=0&&c.blend<=1);
    assert(c.direction.lightMultiplier>=.9&&c.direction.lightMultiplier<=1.15);
    for(let slot=0;slot<4;slot++) assert(Number.isFinite(energy(c,slot,.48)));
    checks++;
  }
}
assert.equal(checks,5400);
const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
assert(stage.includes('planShowContinuityV457({'));
assert(stage.includes('motionEnergyForContinuityV457('));
assert(stage.includes('quality:getActivePerformanceTier()'));
assert(stage.includes('const ultimateShowV456=continuityV457.direction;')||
  (stage.includes('direction:continuityV457.direction,')&&
   stage.includes('const ultimateShowV456=concertExperienceV464.direction;')),
  'V464 may refine only V457 automatic accents, not skip its output');
assert(/^0\.1\.0-v(?:45[7-9]|4[6-9]\d|[5-9]\d\d)$/.test(require('../package.json').version),'V457 regression must support later project versions');
console.log('PASS V457: deterministic phrase-boundary continuity, 3-4 avatar energy, adaptive quality budgets, manual protections, track/pause guards and stage wiring');
