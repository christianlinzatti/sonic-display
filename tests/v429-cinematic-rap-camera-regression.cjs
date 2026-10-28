require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {resolveExpressiveRapCueV425}=load('components/visualizer/expressiveRapDirectorV425');
const {planRapCameraV429:plan,composeRapCameraV429:compose,advanceRapCameraHoldV429:advance,
  newRapCameraHoldV429:newHold,INACTIVE_RAP_CAMERA_V429:inactive}=load('components/visualizer/cinematicRapCameraV429');
const lyrics={synced:true,lines:[
  {startMs:1000,endMs:2800,text:'Hook ich bin hier',words:[{startMs:1000,text:'Hook'}]},
  {startMs:2800,endMs:5800,text:'Antwort im Beat',words:[]},
  {startMs:5800,endMs:8000,text:'Zwei am Mic',words:[]},
]};
const assignments=[{fromLine:0,toLine:0,leadSlot:0,partnerSlot:1,style:'hook',strength:100},
  {fromLine:1,toLine:1,leadSlot:1,partnerSlot:0,style:'reply',strength:100},
  {fromLine:2,toLine:2,leadSlot:0,partnerSlot:1,style:'duet',strength:100}];
const cue=(at,as=assignments)=>resolveExpressiveRapCueV425({enabled:true,playing:true,reducedMotion:false,
  lyrics,progressMs:at,trackId:'A',assignmentTrackId:'A',assignments:as,avatarCount:2,strength:100});
const opts=(at)=>({enabled:true,playing:true,reducedMotion:false,trackId:'A',assignmentTrackId:'A',
  progressMs:at,strength:90,cue:cue(at)});
assert.equal(plan(opts(1300)).shot,'hook-push');
assert.equal(plan(opts(3200)).shot,'reply-side');
assert.equal(plan(opts(6100)).shot,'duet-wide');
assert.equal(plan({...opts(1300),enabled:false}).active,false);
assert.equal(plan({...opts(1300),strength:0}).active,false);
assert.equal(plan({...opts(1300),playing:false}).active,false);
assert.equal(plan({...opts(1300),reducedMotion:true}).active,false);
assert.equal(plan({...opts(1300),manualPriority:true}).active,false);
assert.equal(plan({...opts(1300),trackId:'B'}).active,false);
assert.equal(plan({...opts(1300),assignmentTrackId:'B'}).active,false);
assert.equal(plan({...opts(1300),progressMs:-1}).active,false);
assert.equal(plan({...opts(1300),cue:{...cue(1300),source:'inactive'}}).active,false);
assert.equal(plan({...opts(1300),cue:{...cue(1300),endMs:1200}}).active,false);
assert.equal(plan({...opts(1300),strength:Number.NaN}).active,false);
assert.deepEqual(plan({...opts(1300),cue:cue(1300,[])}),inactive);
// Fixed lyrics timing, cue metadata and intensity must not be mutated.
const original=opts(1300),base={x:.15,y:.1,z:5.9,targetX:0,targetY:0,fov:38};
const clone=JSON.stringify(original);
const hook=plan(original);const next=compose(base,hook);
assert.equal(JSON.stringify(original),clone);
assert.equal(next.z<base.z,true);
assert.equal(compose(base,inactive),base,'inactive overlays return original identity');
assert.equal(compose(base,hook,{lyricsProtected:true}).z>next.z,true,'lyrics safety reduces motion');
assert.ok(Number.isFinite(compose({x:0,y:0,z:.2,targetY:0,fov:20},hook).z));
{const small=compose({x:0,y:0,z:.2,targetY:0,fov:20},hook);assert.ok(Math.hypot(small.x,small.y,small.z)>=2.6-1e-8);}
assert.ok(compose({...base,fov:65},hook).fov<=58);
assert.ok(Number.isFinite(compose(base,{...hook,gain:Infinity}).z));
// Play-clock hold: no frame-based flip-flop, seek/track change reset.
const state=newHold();
assert.equal(advance(state,hook,'A',1300,true).shot,'hook-push');
const response=plan(opts(3200));
assert.equal(advance(state,response,'A',1400,true).shot,'hook-push');
assert.equal(advance(state,response,'A',3100,true).shot,'reply-side');
assert.equal(advance(state,response,'B',3150,true).shot,'reply-side');
assert.equal(advance(state,hook,'B',1350,true).shot,'hook-push');
assert.equal(advance(state,response,'B',1350,false).active,false);
assert.equal(state.trackId,'');
// Wire into shared R3F camera, track gated, and browser preferences; no second Canvas.
const stage=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
const view=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
const dancer=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
const panel=fs.readFileSync('components/visualizer/ExpressiveRapDirectorPanelV425.tsx','utf8');
for(const token of ['rapCameraBlockedV429','authoredCueV400','timelineCue?.active','shotV377.active',
  'showCue?.cameraEnabled','studioProfileV398.enabled','rapCameraHoldV429','composeRapCameraV429','guardAutomaticCameraV351(composedV633'])
  assert(stage.includes(token),`camera precedence: ${token}`);
for(const token of ['rapCameraCueV429','rapCameraEnabledV429','rapCameraStrengthV429'])assert(view.includes(token));
assert(dancer.includes('props.lipSync?.rapCameraArmedV429===true'));
assert(view.includes('rapCameraArmedV429=!!preferences.rapCameraEnabledV429'));
for(const token of ['V429 · Cinematic Rap Camera Director','Automatische Rap-Kamerafahrten',
  'rapCameraStrengthV429','Spotify oder die Live-Kamera nicht'])assert(panel.includes(token));
const prefs=fs.readFileSync('context/UiPreferencesContext.tsx','utf8');
assert(prefs.includes('rapCameraEnabledV429:false'));
const pkg=require('../package.json');assert.ok(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1]) >= 429);
require('./helpers/release-coverage-v651.cjs').assertIncluded('test:v429');
console.log('PASS V429 authored rap camera, hold/seek/track/permissions, lyrics framing, collision safety and R3F wiring');
