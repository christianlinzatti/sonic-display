'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {sampleRapCameraTransitionPreviewV434:sample,
  rapCameraPreviewPathV434:path,normalizeRapCameraPreviewDraftV434:normal}=
  load('components/visualizer/rapCameraTransitionPreviewV434');
const {buildRapCameraTimelineV431}=load('components/visualizer/rapCameraTimelineV431');
const timeline=buildRapCameraTimelineV431({trackId:'song',avatarCount:2,
  lyrics:{synced:true,lines:[
    {startMs:1000,endMs:3200,text:'erste Zeile'},
    {startMs:3200,endMs:5200,text:'Antwort'},
    {startMs:5200,endMs:7200,text:'Hook'}]},
  assignments:[
    {fromLine:0,toLine:0,leadSlot:0,partnerSlot:1,style:'solo',strength:100},
    {fromLine:1,toLine:1,leadSlot:1,partnerSlot:0,style:'reply',strength:100},
    {fromLine:2,toLine:2,leadSlot:0,partnerSlot:1,style:'hook',strength:100}],overrides:[]});
const [previous,current]=timeline.items;
const saved={smoothness:30,beatSync:false};
const candidate={smoothness:95,beatSync:false};
const args={trackId:'song',previous,current,bpm:120,strength:90,duo:true,lyricsProtected:true};
const a=sample({...args,settings:saved,progressMs:current.startMs+100});
const b=sample({...args,settings:candidate,progressMs:current.startMs+100});
assert(a.available&&b.available&&a.changed&&b.changed);
assert.equal(a.startMs,current.startMs);
assert(b.durationMs>a.durationMs,'candidate has slower transition');
assert.equal(a.from.z,b.from.z,'same baseline for A and B');
assert.equal(a.to.z,b.to.z,'same target for A and B');
assert.notEqual(a.pose.z,b.pose.z,'A/B previews differ with smoothing');
assert.notEqual(a.pose.z,a.to.z,'interpolated in-between pose');
assert.equal(sample({...args,settings:saved,progressMs:current.startMs+1900}).pose.z,a.to.z);
const beat=sample({...args,settings:{smoothness:55,beatSync:true},progressMs:3300});
assert.equal(beat.delayMs,0,'3200ms at 120BPM is not within 160ms of next beat');
const beatSoon=sample({...args,current:{...current,startMs:3400},settings:{smoothness:55,beatSync:true},progressMs:3400});
assert.equal(beatSoon.delayMs,100);
assert.equal(beatSoon.startMs,3500);
assert.equal(beatSoon.pose.z,beatSoon.from.z);
assert.equal(sample({...args,settings:saved,previous:{...previous,shot:current.shot,leadSlot:current.leadSlot},progressMs:3300}).changed,false);
assert.equal(sample({...args,settings:saved,previous:null,progressMs:3300}).changed,true);
assert.equal(sample({...args,settings:saved,trackId:'',progressMs:3300}).available,false);
assert.equal(sample({...args,settings:saved,current:{...current,shot:'none'},progressMs:3300}).available,false);
assert.equal(normal({smoothness:Infinity,beatSync:false}).smoothness,0);
assert.deepEqual(normal({smoothness:63,beatSync:false}),{smoothness:65,beatSync:false});
assert.deepEqual(normal(null),{smoothness:55,beatSync:true});
const snapshot=JSON.stringify(args);
const dots=path({...args,settings:saved},16);
assert.equal(dots.length,16);
assert.ok(dots.every(p=>Number.isFinite(p.z)&&Number.isFinite(p.fov)));
assert.equal(JSON.stringify(args),snapshot,'pure, no live-state mutations');
const panel=fs.readFileSync('components/visualizer/RapCameraTransitionPreviewPanelV434.tsx','utf8');
const parent=fs.readFileSync('components/visualizer/ExpressiveRapDirectorPanelV425.tsx','utf8');
const stage=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
for(const keyword of ['Variante B übernehmen','Entwurf zurücksetzen','CameraLivePreviewV291','aria-pressed',
  'RapCameraTransitionPreviewPanelV434','useAudioAnalysis','updatePreferences','playing={false}']){
  assert((panel+parent).includes(keyword),`V434 UI missing ${keyword}`);
}
assert(parent.includes('<RapCameraTransitionPreviewPanelV434'));
assert(!panel.includes('seekTo(')&&!panel.includes('setProgressMs('));
assert(!stage.includes('V434'),'V434 must never insert a second live camera path');
assert(stage.indexOf('advanceRapCameraTransitionV433(')<stage.indexOf('composeRapCameraKeyframeV432('));
const pkg=require('../package.json');
assert.ok(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1])>=434);
require('./helpers/release-coverage-v651.cjs').assertIncluded('test:v434');
assert(pkg.scripts['verify:offline:fast'].includes('test:v434'));
console.log('PASS V434: A/B independent deterministic sampling, BPM delay, saved-only-on-click, safe preview and V432 priority');
