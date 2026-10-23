'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const precision=load('components/visualizer/rapLipPrecisionV415');
const {resolveVocalPerformanceQualityV374:quality}=load('components/visualizer/vocalPerformanceQualityV374');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const lyrics={synced:true,provider:'spotify',plainText:null,lines:[
 {startMs:1000,endMs:2400,text:'Bam, pop, Boom ganz schnell',words:[
  {text:'Bam,',startMs:1000,endMs:1210},{text:'pop,',startMs:1230,endMs:1430},
  {text:'Boom',startMs:1450,endMs:1710},{text:'ganz',startMs:1750,endMs:1940},
  {text:'schnell',startMs:1970,endMs:2320}]},
 {startMs:2450,endMs:3000,text:'[Instrumental]'},
 {startMs:3200,endMs:4900,text:'Nur eine Zeile'}]};
const opt={style:'rap',genre:'Deutschrap',lipStrength:95,rapArticulationEnabledV405:true,
 naturalArticulationEnabledV384:true,qualityEnabledV374:true,ensembleCountV374:1};
const cue=(ms,extra={},playing=true,source=lyrics)=>quality(source,ms,playing,{...opt,...extra});
const on={rapLipEnabledV415:true,rapLipPrecisionV415:90,rapLipOffsetMsV415:0};
assert.equal(precision.rapLipMouthOffsetV415({...on,rapLipOffsetMsV415:100000}),150);
assert.equal(precision.rapLipMouthOffsetV415({...on,rapLipOffsetMsV415:-100000}),-150);
assert.equal(precision.rapLipMouthOffsetV415({...on,rapLipEnabledV415:false,rapLipOffsetMsV415:100}),0);
assert.equal(precision.rapLipMouthOffsetV415({...on,rapLipPrecisionV415:0,rapLipOffsetMsV415:100}),0);
assert.equal(precision.rapLipWordAtV415(lyrics,1080).word.text,'Bam,');
assert.equal(precision.rapLipWordAtV415(lyrics,1220),null,'silence in a 20ms word gap');
assert.equal(precision.rapLipWordAtV415(lyrics,2500),null,'instrumental');
assert.equal(precision.rapLipWordAtV415(lyrics,3300),null,'line only');
assert.equal(precision.rapLipWordAtV415({...lyrics,synced:false},1100),null);
const bam=cue(1006,on),legacy=cue(1006);
assert(bam.rapLipV415.active&&bam.rapLipV415.closure==='bilabial');
assert(bam.face.lipsClosed>=legacy.face.lipsClosed);
assert(bam.face.jaw+bam.face.lipsClosed*.985<=1+1e-9);
const transition=cue(1408,on);
assert(transition.rapLipV415.active&&transition.rapLipV415.rapid);
assert.equal(transition.rapLipV415.closure,'none','end of an initial B/P/M word must not be sealed');
// A word's vowel blend is allowed only within closely connected marks.
assert(precision.rapLipWordAtV415(lyrics,1408).nextGap<=70);
// Offset shifts the mouth only. V372 body, lyric sync time, speaker role and word remain on common clock.
const base=cue(1030,on);const delayed=cue(1030,{...on,rapLipOffsetMsV415:90});
assert.equal(delayed.effectiveTimeMs,base.effectiveTimeMs);
assert.deepEqual(delayed.body,base.body);assert.deepEqual(delayed.vocal,base.vocal);
assert.equal(delayed.rapLipV415.mouthTimeMs,base.rapLipV415.mouthTimeMs+90);
assert.equal(delayed.songTimeMs,base.songTimeMs);
const backed=cue(1500,{...on,manualSingingSlotsV385:[1],ensembleCountV374:2,avatarSlot:0});
assert(backed.face.jaw<=cue(1500,{...on,ensembleCountV374:2,avatarSlot:0}).face.jaw+1e-9);
for(const [ms,extra,playing,source] of [
 [1100,{rapLipEnabledV415:false},true,lyrics],[1100,{...on,rapLipPrecisionV415:0},true,lyrics],
 [1200,on,false,lyrics],[1400,{...on,reducedMotion:true},true,lyrics],
 [2600,on,true,lyrics],[3500,on,true,lyrics],[1100,on,true,{...lyrics,synced:false}],
 [2450,on,true,lyrics],[900,on,true,lyrics]]){
 assert.equal(cue(ms,extra,playing,source).rapLipV415.active,false,`inactive at ${ms}`);
}
for(const ms of [1000,1008,1030,1160,1210,1230,1408,1450,1570,1710,1760,2000,2390,2600,3500]){
 const a=cue(ms,on),b=cue(ms,on);assert.deepEqual(a,b,`seek/determinism ${ms}`);
 for(const key of ['jaw','wide','round','lipsClosed'])assert(Number.isFinite(a.face[key])&&a.face[key]>=0&&a.face[key]<=1,`${key} not bounded`);
 assert(a.face.jaw+a.face.lipsClosed*.985<=1+1e-9,'jaw must respect closed lips');
}
assert.deepEqual(cue(1450,{rapLipEnabledV415:false}).face,cue(1450).face,'V415 off preserves original face');
assert.equal(cue(1450,{...on,style:'singing'}).rapLipV415.active,false);
for(const text of ['V415 · Advanced Rap Lip-Sync','avatarRapLipEnabledV415','avatarRapLipOffsetMsV415'])assert(read('components/SettingsPanel.tsx').includes(text));
for(const file of ['components/visualizer/ThreeAvatar.tsx','components/visualizer/VisualizerStage.tsx']){
 const content=read(file);assert(content.includes('rapLipEnabledV415'));assert(content.includes('rapLipOffsetMsV415'));
}
const inspector=read('components/visualizer/VocalSyncInspectorV373.tsx');
assert(inspector.includes('rapLipV415'));assert(inspector.includes('V415 · Rap Lip-Sync'));
assert(read('context/UiPreferencesContext.tsx').includes('avatarRapLipEnabledV415:false'));
assert(read('components/visualizer/vocalPerformanceQualityV374.ts').includes('vocal:articulated.vocal'));
console.log('PASS V415: estimated B/P/M closure, bounded coarticulation, independent mouth offset, timed-word trust, pauses/silence, singer roles, deterministic seeks, UI diagnostics');
