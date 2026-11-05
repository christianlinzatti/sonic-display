'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v=load('components/visualizer/continuousConcertFlowV997');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const base={trackId:'songA',durationMs:180000,positionMs:178000,atMs:100000,
 playing:true,autoEnabled:true,reducedMotion:false,manualOverride:false,lyricsProtected:false,
 settings:{...v.DEFAULT_FLOW_V997,enabled:true}};
function pair(old={},fresh={}){
 let state=v.advanceFlowV997(v.EMPTY_FLOW_V997,{...base,...old});
 state=v.advanceFlowV997(state,{...base,trackId:'songB',positionMs:3200,atMs:105000,...fresh});
 return state;
}
let checks=0;function test(label,fn){fn();checks++;console.log('PASS V997 '+label);}
test('explicit opt-in and strict settings normalization',()=>{
 assert.equal(v.DEFAULT_FLOW_V997.enabled,false);
 assert.equal(v.normalizeFlowV997({enabled:'yes'}).enabled,false);
 assert.equal(v.normalizeFlowV997({intensity:Infinity}).intensity,45);
 assert.equal(v.normalizeFlowV997({intensity:-12}).intensity,0);
 assert.equal(v.normalizeFlowV997({intensity:150}).intensity,100);
 assert.equal(v.normalizeFlowV997({style:'flash'}).style,'subtle');
 assert.equal(v.normalizeFlowV997({style:'festival'}).style,'festival');
 assert.equal(v.normalizeFlowV997({protectLyrics:'false'}).protectLyrics,true);
});
test('observed playing end-to-start creates only a short virtual handover',()=>{
 const r=pair();assert(r.handover);assert.equal(r.handover.fromTrackId,'songA');
 assert.equal(r.handover.toTrackId,'songB');assert.equal(r.handover.durationMs,2400);
 const start=v.sampleFlowV997(r.handover,'songB',105000,true,false);
 const middle=v.sampleFlowV997(r.handover,'songB',106200,true,false);
 const end=v.sampleFlowV997(r.handover,'songB',107400,true,false);
 assert.equal(start.active,true);assert.equal(start.opacity,0);
 assert(middle.opacity>0&&middle.opacity<=.32);assert.equal(end.active,false);
});
test('no transitions when opt-in is disabled',()=>{
 assert.equal(pair({settings:v.DEFAULT_FLOW_V997}).handover,null);
 assert.equal(pair({settings:{...base.settings,intensity:0}}).handover,null);
 assert.equal(pair({}, {settings:v.DEFAULT_FLOW_V997}).handover,null);
});
test('no fabricated transitions for casual skips or starts deep in next song',()=>{
 assert.equal(pair({positionMs:90000}).handover,null);
 assert.equal(pair({positionMs:164000}).handover,null);
 assert.equal(pair({}, {positionMs:12001}).handover,null);
 assert.equal(pair({}, {atMs:118000}).handover,null);
 assert.equal(pair({}, {trackId:'songA'}).handover,null);
});
test('pauses, missing player info, manual shows, reduced motion, lyrics protection',()=>{
 for(const field of ['playing','autoEnabled','manualOverride','reducedMotion','lyricsProtected']){
  const off=field==='playing'||field==='autoEnabled'?false:true;
  assert.equal(pair({[field]:off}).handover,null,field+' old');
  assert.equal(pair({}, {[field]:off}).handover,null,field+' new');
 }
 assert.equal(pair({}, {trackId:''}).handover,null);
 assert.equal(pair({}, {durationMs:0}).handover,null);
 assert.equal(pair({}, {positionMs:NaN}).handover,null);
});
test('seek and stale timing cancel visual transitions',()=>{
 let state=v.advanceFlowV997(v.EMPTY_FLOW_V997,{...base,positionMs:167000});
 state=v.advanceFlowV997(state,{...base,positionMs:179000,atMs:100100});
 assert.equal(state.seekDetected,true);
 state=v.advanceFlowV997(state,{...base,trackId:'songB',positionMs:0,atMs:101000});
 assert.equal(state.handover,null);
 assert.equal(pair({}, {atMs:1000}).handover,null);
});
test('track switch clears old effect; pause/seek always dismiss it',()=>{
 const live=pair();assert(live.handover);
 assert.equal(v.advanceFlowV997(live,{...base,trackId:'songB',positionMs:4000,atMs:106000,playing:false}).handover,null);
 assert.equal(v.advanceFlowV997(live,{...base,trackId:'songB',positionMs:60000,atMs:106000}).handover,null);
 assert.equal(v.advanceFlowV997(live,{...base,trackId:'songC',positionMs:0,atMs:106000}).handover,null);
});
test('untrusted signals cannot leak into other songs or set unbounded opacity',()=>{
 const h=pair().handover;
 assert.equal(v.validateFlowV997(h,'songC'),null);
 assert.equal(v.validateFlowV997({...h,intensity:99},'songB'),null);
 assert.equal(v.validateFlowV997({...h,startedAtMs:Infinity},'songB'),null);
 assert.equal(v.validateFlowV997({...h,fromTrackId:'songB'},'songB'),null);
 assert(v.validateFlowV997(h,'songB'));
 assert.equal(v.sampleFlowV997(h,'songC',106000,true,false).active,false);
 assert.equal(v.sampleFlowV997(h,'songB',106000,false,false).active,false);
 assert.equal(v.sampleFlowV997(h,'songB',106000,true,true).active,false);
 assert.equal(v.sampleFlowV997(h,'songB',104999,true,false).active,false);
});
test('three styles remain bounded and do not flash',()=>{
 for(const style of ['subtle','cinematic','festival']){
  const h=pair({settings:{...base.settings,style}}, {settings:{...base.settings,style}}).handover;
  assert(h);for(let i=0;i<=h.durationMs;i+=11){
   const x=v.sampleFlowV997(h,'songB',h.startedAtMs+i,true,false);
   assert(x.opacity>=0&&x.opacity<=.32);assert(Number.isFinite(x.progress));
  }
 }
});
test('10,000 adversarial samples are finite and fail-closed',()=>{
 for(let i=0;i<10000;i++){
  const r=pair({positionMs:140000+i*10},{positionMs:(i%2?16000:500),atMs:102000+i%17000});
  const h=r.handover;
  if(h){assert.equal(h.toTrackId,'songB');assert(h.intensity<=1);}
 }
});
test('renderer and stage bridge do not create new audio/device control or ticker',()=>{
 const files=['components/visualizer/ConcertFlowBridgeV997.tsx','components/visualizer/concertStageSyncV882.ts','components/visualizer/DynamicStage.tsx','components/visualizer/LiveFxDeckV881.tsx','components/SonicDisplay.tsx'];
 const data=files.map(read);
 assert(data[0].includes('useFrame('));assert(data[0].includes('readConcertStageSyncV882'));
 assert(data[1].includes('validateFlowV997(input.flowCueV997,input.trackId)'));
 assert(data[2].includes('<ConcertFlowBridgeV997'));
 assert(data[3].includes('advanceFlowV997('));assert(data[4].includes('lyricsProtected='));
 for(const token of ['setInterval(','setTimeout(','fetch(','navigator.mediaDevices','govee','new Audio(']){
  assert(!data[0].includes(token),'bridge '+token);
 }
});
test('prebuild and Vercel gates include V997',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert(/^v\d+$/.test(pkg.sonicRoadmapRelease)&&Number(pkg.sonicRoadmapRelease.slice(1))>=997);
 assert(/^v\d+$/.test(pkg.sonicFeatureRelease)&&Number(pkg.sonicFeatureRelease.slice(1))>=997);
 assert(pkg.scripts.prebuild.includes('test:v997'));
 assert(read('scripts/vercel-production-build.cjs').includes('tests/v997-continuous-concert-flow-regression.cjs'));
});
console.log('PASS V997 total '+checks+' groups');
