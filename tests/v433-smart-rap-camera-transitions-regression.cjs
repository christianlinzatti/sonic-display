'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {newRapCameraTransitionStateV433:newState,
  rapCameraBeatDelayV433:beatDelay,
  rapCameraTransitionDurationV433:duration,
  advanceRapCameraTransitionV433:advance}=load('components/visualizer/smartRapCameraTransitionsV433');
const plan=(shot='solo-close',leadSlot=0)=>({active:true,shot,lineIndex:0,leadSlot,startMs:1000,endMs:10000,gain:.8,holdMs:1100});
const base={x:0,y:.1,z:5,targetX:0,targetY:0,targetZ:0,fov:38};
const close={...base,z:3.5,x:-.2,fov:36};
const reply={...base,x:1.5,z:4.4,fov:40};
const opts=(ms,overrides={})=>({enabled:true,playing:true,reducedMotion:false,trackId:'a',progressMs:ms,bpm:120,kick:0,beatSync:false,smoothness:55,...overrides});
assert.equal(beatDelay(1400,120,0,true),100);
assert.equal(beatDelay(1300,120,0,true),0,'grid wait capped at 160ms');
assert.equal(beatDelay(1400,120,.9,true),0,'kick accent is immediate');
assert.equal(beatDelay(1400,999,0,true),0,'out-of-range tempo must not predict beats');
assert.equal(beatDelay(1400,120,0,false),0);
assert.ok(duration(plan('duet-wide'),50)>duration(plan('solo-close'),50));
let state=newState();
assert.equal(advance(state,close,base,plan(),opts(1000)).z,5,'starts from base pose');
assert.ok(advance(state,close,base,plan(),opts(1250)).z<5);
assert.equal(advance(state,close,base,plan(),opts(2200)).z,close.z);
// Repeated lines with the same lead and shot should not retrigger a blend.
const finished=advance(state,close,base,{...plan(),lineIndex:1},opts(2300));
assert.equal(finished.z,close.z);
assert.equal(state.startMs,1000);
// A singer handoff triggers a new smooth transition from prior output, without sudden jump.
const handoff=advance(state,reply,base,plan('reply-side',1),opts(2350));
assert.equal(handoff.z,close.z);
const middle=advance(state,reply,base,plan('reply-side',1),opts(2530));
assert.ok(middle.z>close.z&&middle.z<reply.z);
assert.equal(advance(state,reply,base,plan('reply-side',1),opts(3450)).z,reply.z);
assert.equal(advance(state,reply,base,plan('reply-side',1),opts(3500,{enabled:false})),reply);
assert.equal(state.trackId,'');
// Pausing, seeking and switching track must not transfer stale camera poses.
state=newState();advance(state,close,base,plan(),opts(1100));
assert.equal(advance(state,close,base,plan(),opts(1101,{playing:false})),close);
assert.equal(state.key,'');
advance(state,close,base,plan(),opts(2000));
const jumped=advance(state,reply,base,plan('reply-side',1),opts(1050));
assert.equal(jumped.z,base.z);
assert.equal(advance(state,reply,base,plan('reply-side',1),opts(1080,{trackId:'b'})).z,base.z);
assert.equal(advance(state,reply,base,plan('reply-side',1),opts(1090,{reducedMotion:true})),reply);
const offPlan={...plan(),active:false};
assert.equal(advance(state,close,base,offPlan,opts(1100)),close);
assert.equal(state.key,'');
const source=JSON.stringify(close);advance(newState(),close,base,plan(),opts(1200));
assert.equal(JSON.stringify(close),source,'must not mutate upstream poses');
// Invalid clock and shot inputs reset safe state.
assert.equal(advance(state,close,base,plan(),opts(NaN)),close);
assert.equal(advance(state,close,base,plan(),opts(-10)),close);
// Beat alignment only waits when <=160ms from predicted grid.
state=newState();
assert.equal(advance(state,close,base,plan(),opts(1400,{beatSync:true})).z,base.z);
assert.equal(state.startMs,1500);
assert.equal(advance(state,close,base,plan(),opts(1450,{beatSync:true})).z,base.z);
assert.ok(advance(state,close,base,plan(),opts(1690,{beatSync:true})).z<base.z);
const stage=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
const visual=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
const registry=fs.readFileSync('components/visualizer/registry.tsx','utf8');
const panel=fs.readFileSync('components/visualizer/ExpressiveRapDirectorPanelV425.tsx','utf8');
const types=fs.readFileSync('types/music.ts','utf8');
const prefs=fs.readFileSync('context/UiPreferencesContext.tsx','utf8');
for(const key of ['rapCameraTransitionsEnabledV433','rapCameraBeatSyncV433','rapCameraTransitionSmoothnessV433']){
  for(const [name,src] of Object.entries({visual,registry,panel,types,prefs}))assert(src.includes(key),`${name} missing ${key}`);
}
assert(stage.indexOf('composeRapCameraV429(')<stage.indexOf('advanceRapCameraTransitionV433('));
assert(stage.indexOf('advanceRapCameraTransitionV433(')<stage.indexOf('composeRapCameraKeyframeV432('));
assert(stage.indexOf('composeRapCameraKeyframeV432(')<stage.indexOf('guardAutomaticCameraV351('));
assert(stage.includes('!rapCameraBlockedV429')&&stage.includes('newRapCameraTransitionStateV433'));
assert(visual.includes('rapCameraBpmV433:audio.bpm'));
assert(visual.includes('rapCameraKickV433:audio.kickAccentIntensity'));
assert(prefs.includes('rapCameraTransitionsEnabledV433:false'),'feature must be opt-in');
assert(!panel.includes('seekTo('),'studio never controls Spotify position');
const pkg=require('../package.json');
assert.ok(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1])>=433);
require('./helpers/release-coverage-v651.cjs').assertIncluded('test:v433');
assert(pkg.scripts['verify:offline:fast'].includes('test:v433'));
console.log('PASS V433: tempo/kick alignment, role transitions, ease, reset, opt-in, manual priority, V432 precedence');
