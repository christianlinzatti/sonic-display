'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planUltimateAutomaticShowV456:plan,motionForUltimateShowV456:motion,
  energyForUltimateShowV456:energy,lightStrengthForUltimateShowV456:light}=load('services/show/ultimateAutomaticShowV456');
const {buildSmartRapShowV446:build,sampleSmartRapShowV446:sample}=load('components/visualizer/smartAutomaticRapShowV446');
const {planVisualBalanceV451:balance}=load('services/show/visualBalanceV451');
const lyric={synced:true,lines:[
  {startMs:1000,endMs:3200,text:'Das ist der Hook für uns'},
  {startMs:3500,endMs:5300,text:'Wir feiern diesen Beat heute'},
  {startMs:5500,endMs:7000,text:'Das ist der Hook für uns'},
  {startMs:7300,endMs:8600,text:'Wir feiern diesen Beat heute'},
  {startMs:14000,endMs:16000,text:'Das ist der Hook für uns'},
  {startMs:16300,endMs:18000,text:'Wir feiern diesen Beat heute'},
  {startMs:20000,endMs:22500,text:'Eine neue Zeile und ein Rhythmus'},
  {startMs:22800,endMs:25300,text:'Die Rapper sind am Singen zusammen'},
]};
const trackPlan=build({trackId:'track-456',count:3,lyrics:lyric,durationMs:45000,bpm:110,enabled:true});
assert.equal(trackPlan.source,'synced-lyrics');
const cue=sample(trackPlan,14500,{enabled:true,playing:true,reducedMotion:false,manualProtected:false});
assert.equal(cue.active,true); assert.equal(cue.group,true);
const open={attention:'insights',allowAutomaticInsight:true,allowCinematic:true,
  allowConnectionSpotlight:true,reason:'long-break'};
const blocked={attention:'lyrics',allowAutomaticInsight:false,allowCinematic:false,
  allowConnectionSpotlight:false,reason:'active-lyrics'};
const input={enabled:true,playing:true,reducedMotion:false,automaticDance:true,
  cue, balance:open,count:3,energy:.82};
const live=plan(input);
assert.equal(live.active,true);
assert.equal(live.moment,'crew');
assert.equal(live.balance.reason,'group-show');
assert.equal(live.balance.allowAutomaticInsight,false);
assert.equal(live.balance.allowConnectionSpotlight,false);
assert.equal(live.cameraCue, cue);
assert.equal(live.lightMultiplier>1,true);
assert.equal(live.interactionMultiplier>1,true);
assert.equal(motion(live,0,'verse'),'hook');
assert.equal(motion(live,2,'verse'),'hook');
assert(energy(live,0,.05)>=.64);
assert(light(live,60,true)>60);
assert.equal(light(live,60,false),60);
const manual=plan({...input,manualVocal:true});
assert.equal(manual.active,false);
assert.equal(manual.balance.allowAutomaticInsight,true); // never seize information budget when manual
assert.equal(light(manual,60,true),60);
assert.equal(motion(manual,1,'reply'),'reply');
assert.equal(energy(manual,1,.33),.33);
const paused=plan({...input,playing:false});assert.equal(paused.active,false);
const reduced=plan({...input,reducedMotion:true});assert.equal(reduced.active,false);
const off=plan({...input,enabled:false});assert.equal(off.active,false);
assert.equal(plan({...input,manualCamera:true}).cameraCue,null);
const soloCue={active:true,section:'verse',focus:1,group:false,phrase:2,eventId:'v446:verse',motionScene:'verse'};
const solo=plan({...input,cue:soloCue,balance:blocked});
assert.equal(solo.moment,'solo');
assert.equal(solo.balance,blocked);
assert.equal(motion(solo,1,'reply'),'verse');
assert.equal(motion(solo,0,'reply'),'break');
assert(energy(solo,0,.9)<=.26);
assert.equal(energy(solo,1,.4),.4);
assert.equal(solo.lightMultiplier>=1,true);
const outro=plan({...input,cue:{...soloCue,section:'outro'}});
assert.equal(outro.moment,'interlude');assert.equal(motion(outro,1,'verse'),'break');
assert.equal(light(outro,100,true)<=100,true);
const noRecord=plan({...input,cue:null});assert.equal(noRecord.active,false);
const unsynced=balance({enabled:true,playing:true,progressMs:11000,lyricsVisible:true,
  immersiveLyrics:false,lyrics:null,activeIndex:-1});
assert.equal(plan({...input,balance:unsynced,cue:soloCue}).balance.allowAutomaticInsight,true);
// Invalidation is deterministic: no state, timer or stale previous-track cue.
assert.equal(plan({...input,cue:{...cue,active:false}}).active,false);
const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
const root=fs.readFileSync('components/SonicDisplay.tsx','utf8');
assert(stage.includes('planUltimateAutomaticShowV456('));
assert(stage.includes('motionForUltimateShowV456('));
assert(stage.includes('energyForUltimateShowV456(')||stage.includes('motionEnergyForContinuityV457('));
assert(stage.includes('lightStrengthForUltimateShowV456('));
require('./helpers/concert-camera-contract-v4737.cjs').assertConcertCameraCueContract(stage);
assert(root.includes('planUltimateAutomaticShowV456('));
assert(root.includes('visualBalanceV451={unifiedShowV456.balance}'));
assert(root.includes('visualBalanceV451={visualBalanceV451}'));
assert(Number(require('../package.json').version.match(/v(\d+)$/)?.[1])>=456);
console.log('PASS V456: shared stage/info director, hook priority, solo/crew/interlude, lighting, camera, motion, pause, manual & reduced-motion safeguards');
