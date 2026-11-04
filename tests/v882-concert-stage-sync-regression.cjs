'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {
 DEFAULT_CONCERT_SYNC_V882:defaults,normalizeConcertSyncV882:normalize,
 readConcertStageSyncV882:read,publishConcertStageSyncV882:publish,
 subscribeConcertStageSyncV882:subscribe,planConcertStageV882:plan,
 OFF_CONCERT_STAGE_V882:off,
}=load('components/visualizer/concertStageSyncV882');
let checks=0;
function check(name,fn){try{fn();checks++}catch(error){error.message=`V882 ${name}: ${error.message}`;throw error;}}
const active={trackId:'a',durationMs:120000,playing:true,reducedMotion:false,enabled:true,
 intensity:.65,sceneSource:'verified',section:'drop',look:'neon',sceneStartMs:60000,
 manual:null,manualId:0,manualStartMs:-1,sync:{...defaults}};
const clock={trackId:'a',durationMs:120000,positionMs:60500,playing:true,reducedMotion:false,tier:'high'};
const at=(s={},c={})=>plan({...active,...s},{...clock,...c});
const manual=(kind,startMs=60000)=>({manual:kind,manualStartMs:startMs,manualId:13});
const allZero=q=>{assert.deepEqual(q,{...off});};
check('defaults and invalid settings safe',()=>{
 for(const v of [null,undefined,42,'evil',[],{}])assert.deepEqual(normalize(v),defaults);
 assert.deepEqual(normalize({lights:false,dance:false,stage:false}),{stage:false,lights:false,dance:false});
 assert.deepEqual(normalize({lights:42,dance:null,stage:'false'}),defaults);
});
check('no cue when off, paused, or reduced motion',()=>{
 for(const s of [{enabled:false},{playing:false},{reducedMotion:true},{intensity:0}])allZero(at(s));
 for(const c of [{playing:false},{reducedMotion:true}])allZero(at({},c));
});
check('different track, duration or invalid position disabled',()=>{
 for(const c of [{trackId:'b'},{durationMs:90000},{positionMs:NaN},
  {positionMs:-1},{positionMs:121501}])allZero(at({},c));
});
check('blackout is absolute kill switch',()=>allZero(at(manual('shockwave'),{blackout:true})));
check('automatic verified drop has single soft floor ring',()=>{
 const cue=at();assert(cue.ringOpacity>0&&cue.ringOpacity<.3);
 assert(cue.ringScale>.8);assert.equal(cue.confettiOpacity,0);assert.equal(cue.look,'neon');
});
check('automatic drop ring disappears after 1.7s',()=>{
 const cue=at({}, {positionMs:62000});assert.equal(cue.ringOpacity,0);
});
check('no invented drop when verified source unavailable',()=>{
 const cue=at({sceneSource:'unavailable'});
 assert.equal(cue.ringOpacity,0);assert.equal(cue.look,'none');
});
check('manual bass wave works without verified timeline',()=>{
 const cue=at({...manual('shockwave'),sceneSource:'unavailable'}, {positionMs:60800});
 assert(cue.ringOpacity>0);assert(cue.ringScale>1);
});
check('manual wave expires after 2.3 sec',()=>{
 const cue=at(manual('shockwave'),{positionMs:62400});assert.equal(cue.ringOpacity,0);
});
check('manual shock does not revive after seek backwards',()=>{
 const cue=at(manual('shockwave'),{positionMs:59999});assert.equal(cue.ringOpacity,0);
});
check('3D confetti actually samples 3D fade',()=>{
 const cue=at(manual('confetti'),{positionMs:61200});
 assert(cue.confettiOpacity>0&&cue.confettiOpacity<=.82);
 assert(cue.confettiProgress>0&&cue.confettiProgress<1);
});
check('confetti expires after 4.2 sec',()=>{
 const cue=at(manual('confetti'),{positionMs:64401});assert.equal(cue.confettiOpacity,0);
});
check('gentle manual sweep increases existing beam, not new light',()=>{
 const cue=at(manual('sweep'),{positionMs:60500});
 assert(cue.beamGain>1&&cue.beamGain<=1.3);assert.notEqual(cue.beamOffset,0);
});
check('manual sweep is not strobe – its gain is bounded',()=>{
 for(let p=60000;p<63300;p+=77){const cue=at(manual('sweep'),{positionMs:p});
  assert(cue.beamGain>=1&&cue.beamGain<=1.3);assert(Math.abs(cue.beamOffset)<=1.1);}
});
check('authored lighting keeps beam exactly neutral',()=>{
 const q=at(manual('sweep'),{manualLighting:true});assert.equal(q.beamGain,1);assert.equal(q.beamOffset,0);
});
check('lyrics protection guards light spotlight',()=>{
 const q=at(manual('sweep'),{lyricsProtected:true});assert.equal(q.beamGain,1);assert.equal(q.beamOffset,0);
});
check('per-channel light switch leaves stage & dance',()=>{
 const q=at({...manual('shockwave'),sync:{...defaults,lights:false}});
 assert.equal(q.beamGain,1);assert(q.ringOpacity>0);assert(q.danceGain>1);
});
check('per-channel stage switch leaves lights & dance',()=>{
 const q=at({...manual('confetti'),sync:{...defaults,stage:false}});
 assert.equal(q.confettiOpacity,0);assert.equal(q.ringOpacity,0);assert(q.beamGain>1);
});
check('per-channel dance switch leaves stage & light',()=>{
 const q=at({...manual('shockwave'),sync:{...defaults,dance:false}});
 assert.equal(q.danceGain,1);assert(q.ringOpacity>0);assert(q.beamGain>1);
});
check('authored dance stays fully unmodified',()=>{
 const q=at(manual('shockwave'),{manualDance:true});assert.equal(q.danceGain,1);
});
check('low tier opts out of ALL new 3D channels',()=>{
 const q=at(manual('shockwave'),{tier:'low'});assert.equal(q.ringOpacity,0);
 assert.equal(q.danceGain,1);assert.equal(q.beamGain,1);
});
check('dance gains bounded on all high-intensity manual cues',()=>{
 for(const kind of ['shockwave','sweep','confetti'])for(let p=60000;p<66000;p+=99){
  const q=at({...manual(kind),intensity:1},{positionMs:p});assert(q.danceGain>=1&&q.danceGain<=1.12);
 }
});
check('cinema look does not impose beam brightness',()=>{
 const q=at({section:'verse',look:'cinema',sceneStartMs:20000});assert.equal(q.beamGain,1);
});
check('unverified look cannot auto-boost dancers',()=>{
 const q=at({sceneSource:'unavailable',section:'drop'});assert.equal(q.danceGain,1);
});
check('store starts inactive',()=>assert.equal(read().enabled,false));
check('publishing a cue and reading is stable',()=>{
 publish(active);let a=read();assert.equal(a.trackId,'a');assert.equal(a.look,'neon');
 publish({...active,sync:{...defaults}});assert.equal(read(),a);
});
check('listeners only notified for semantic updates',()=>{
 let n=0;const unsub=subscribe(()=>n++);
 publish({...active,section:'hook'});assert.equal(n,1);
 publish({...active,section:'hook'});assert.equal(n,1);
 publish({...active,section:'drop'});assert.equal(n,2);
 unsub();publish({...active,section:'hook'});assert.equal(n,2);
});
check('store sanitizes invalid track and resets',()=>{
 publish({...active,trackId:''});assert.equal(read().enabled,false);
 publish({...active,trackId:'wrong',durationMs:NaN});assert.equal(read().enabled,false);
});
check('store never accepts invalid manual event',()=>{
 publish({...active,manual:'shockwave',manualId:1,manualStartMs:-10});assert.equal(read().manual,null);
 publish({...active,manual:'shockwave',manualId:0,manualStartMs:60000});assert.equal(read().manual,null);
 publish({...active,manual:'shockwave',manualId:2,manualStartMs:60000});assert.equal(read().manual,'shockwave');
});
check('store rejects invalid look/source and bounds intensity',()=>{
 publish({...active,sceneSource:'unavailable',look:'neon',intensity:55});
 assert.equal(read().look,'none');assert.equal(read().intensity,1);
});
check('pausing source clears semantic active cue',()=>{
 publish({...active,playing:false,manual:'shockwave',manualId:6,manualStartMs:60000});
 assert.equal(read().manual,null);assert.equal(read().enabled,false);
});
check('null publication revokes every channel',()=>{
 publish(active);publish(null);assert.equal(read().enabled,false);assert.deepEqual(read().sync,defaults);
});
check('UI publishes source from existing V881 cue only',()=>{
 const src=fs.readFileSync('components/visualizer/LiveFxDeckV881.tsx','utf8');
 assert(src.includes('publishConcertStageSyncV882({trackId,durationMs,playing'));
 assert(src.includes('sceneStartMs:scenes[cue.sceneIndex]?.startMs??-1'));
 assert(src.includes('concert-sync-options-v882'));
});
check('actual 3D stage mounts preallocated 3D emitter',()=>{
 const src=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
 assert(src.includes('<ConcertStageFxV882 cueRef={liveStageV882}/>'));
 assert(src.includes('manualLighting:manualLightingV763||authoredLightsV386'));
 const fx=fs.readFileSync('components/visualizer/ConcertStageFxV882.tsx','utf8');
 assert(fx.includes('<instancedMesh')&&fx.includes('<ringGeometry'));
 assert(!fx.includes('new THREE.Mesh'));
});
check('automatic stage dancers honor manual mode',()=>{
 const src=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
 assert(src.includes('useSyncExternalStore(subscribeConcertStageSyncV882'));
 assert(src.includes('concertDanceCueV882.danceGain'));
 assert(src.includes('manualDance:manualQualityV670.dance||manualDanceV678'));
});
console.log(`V882 Concert Stage Sync: ${checks}/${checks} tests PASS`);
