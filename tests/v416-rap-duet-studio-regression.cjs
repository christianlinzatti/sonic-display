 'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const m=load('components/visualizer/rapDuetStudioV416');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const lyrics={provider:'spotify',synced:true,plainText:null,lines:[
 {startMs:1000,endMs:2200,text:'Rap geht los',words:[{text:'Rap',startMs:1000,endMs:1230}]},
 {startMs:2300,endMs:3600,text:'Und hier die Antwort'},
 {startMs:3800,endMs:5100,text:'Beide singen zusammen'},
 {startMs:5300,endMs:6600,text:'Hook auf der Bühne'},
 {startMs:6900,endMs:7300,text:''}]};
const assignments=[
 {fromLine:0,toLine:0,style:'solo',leadSlot:0,partnerSlot:1,strength:70},
 {fromLine:1,toLine:1,style:'reply',leadSlot:0,partnerSlot:1,strength:75},
 {fromLine:2,toLine:2,style:'duet',leadSlot:0,partnerSlot:1,strength:60},
 {fromLine:3,toLine:3,style:'hook',leadSlot:0,partnerSlot:1,strength:80}];
assert.deepEqual(m.normalizeRapDuetAssignmentsV416([...assignments,{fromLine:12,toLine:15,
 style:'duet',leadSlot:3,partnerSlot:3,strength:80},null,{fromLine:0,toLine:1,style:'bad'}],5),assignments);
assert.equal(m.normalizeRapDuetAssignmentsV416([{...assignments[0],strength:110}],5)[0].strength,100);
assert.equal(m.normalizeRapDuetAssignmentsV416([{...assignments[0],strength:-500}],5)[0].strength,0);
const cue=(ms,extra={})=>m.resolveRapDuetCueV416({lyrics,progressMs:ms,playing:true,
 count:2,enabled:true,assignments,...extra});
assert.equal(cue(1100).leadSlot,0);
assert.equal(cue(1100).source,'word-timed');
assert.equal(cue(2420).leadSlot,0);
assert.deepEqual(cue(2420).singingSlots,[0]);
assert.equal(cue(3200).leadSlot,1);
assert.deepEqual(cue(3200).singingSlots,[1]);
assert.equal(cue(3200).handoffFrom,0);
assert.deepEqual(cue(4000).singingSlots,[0,1]);
assert.deepEqual(cue(5600).singingSlots,[0,1]);
assert.equal(cue(5600).style,'hook');
assert.equal(cue(5600).source,'line-timed');
assert.equal(cue(7000).active,false,'instrumental/empty lyrics must be neutral');
assert.equal(cue(2200).active,false,'end is exclusive');
assert.equal(cue(900).active,false,'before first lyric');
assert.equal(cue(1100,{playing:false}).active,false);
assert.equal(cue(1100,{enabled:false}).active,false);
assert.equal(cue(1100,{manualPriority:true}).active,false);
assert.equal(cue(1100,{count:1}).active,false);
assert.equal(cue(1100,{lyrics:{...lyrics,synced:false}}).active,false);
assert.equal(cue(1100,{progressMs:NaN}).active,false);
assert.equal(cue(3200,{reducedMotion:true}).handoffFrom,null);
const idle={enabled:false,leadSlot:0,partnerSlot:null,activeSlots:[0,1],fromSlot:null,toSlot:0,
 event:'none',phase:0,emphasis:0,source:'none',lineIndex:-1,count:2};
assert.equal(m.applyRapDuetInteractionV416(idle,cue(3200)).leadSlot,1);
assert.deepEqual(m.applyRapDuetInteractionV416(idle,cue(4000)).activeSlots,[0,1]);
assert.deepEqual(m.toVocalCueV416(cue(4000)).singingSlots,[0,1]);
assert.equal(m.toVocalCueV416(cue(5600)).role,'hook');
assert.deepEqual(m.applyRapDuetInteractionV416(idle,cue(1100,{enabled:false})),idle);
for(const p of ['components/visualizer/ThreeAvatar.tsx','components/visualizer/StageCameraDirectorV289.tsx']){
 const s=read(p);assert(s.includes('resolveRapDuetCueV416'),p+' live integration missing');
 assert(s.includes('!manualCueV385.active')||s.includes('!manualV385.active'),p+' manual vocal priority missing');
}
const stage=read('components/visualizer/VisualizerStage.tsx'),ui=read('components/SettingsPanel.tsx');
assert(stage.includes('rapDuetAssignmentsV416:track?.id?'), 'track-specific live isolation');
assert(ui.includes('<RapDuetStudioV416/>'),'settings panel integration');
assert(read('context/UiPreferencesContext.tsx').includes('rapDuetEnabledV416:false'),'opt-in default');
assert(read('components/visualizer/StageCameraDirectorV289.tsx').includes('!automaticShot'),'manual camera safety');
assert(read('components/visualizer/StageCameraDirectorV289.tsx').includes('shot:"two-shot" as const'),'real duet two-shot');
console.log('PASS V416: authored rap duets, time-coded call/response, simultaneous singers, hook, persistence validation, stage/camera priorities and safe fallback');
