'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {normalizeRapCameraOverridesV430:normalize,normalizeRapCameraLibraryV430:normalizeLib,
  saveRapCameraOverrideV430:save,saveRapCameraLibraryV430:saveLib,
  applyRapCameraShotV430:apply}=load('components/visualizer/rapCameraShotStudioV430');
const {planRapCameraV429,composeRapCameraV429,INACTIVE_RAP_CAMERA_V429}=load('components/visualizer/cinematicRapCameraV429');
const makeCue=(lineIndex=3)=>({active:true,scene:'solo',faceStrength:.4,gestureStrength:.3,cameraEnergy:.5,
  lineIndex,leadSlot:0,startMs:1000,endMs:2500,articulationWeight:.7,source:'authored-lyrics'});
const rawPlan=planRapCameraV429({enabled:true,playing:true,reducedMotion:false,manualPriority:false,
  trackId:'song-A',assignmentTrackId:'song-A',progressMs:1500,strength:80,cue:makeCue()});
assert.equal(rawPlan.shot,'solo-close');
assert.equal(rawPlan.gain,.4);
assert.deepEqual(normalize(null),[]);
assert.deepEqual(normalize({oops:true}),[]);
const dirty=[{lineIndex:3,shot:'reply-side',strength:61.2},
  {lineIndex:3,shot:'hook-push',strength:70.4},
  {lineIndex:-1,shot:'off',strength:50},{lineIndex:4,shot:'fast-cut',strength:50},
  {lineIndex:99999,shot:'off',strength:100},{lineIndex:5,shot:'off',strength:Infinity},
  {lineIndex:6,shot:'off',strength:-20},{lineIndex:7,shot:'duet-wide',strength:140}];
const dirtyClone=JSON.stringify(dirty);
assert.deepEqual(normalize(dirty),[{lineIndex:3,shot:'hook-push',strength:70},
  {lineIndex:6,shot:'off',strength:0},{lineIndex:7,shot:'duet-wide',strength:100}]);
assert.equal(JSON.stringify(dirty),dirtyClone,'normalization is immutable');
assert.deepEqual(save([],3,'hook-push',65),[{lineIndex:3,shot:'hook-push',strength:65}]);
assert.deepEqual(save([{lineIndex:3,shot:'hook-push',strength:65}],3,'auto',100),[]);
assert.deepEqual(save([],3,'off',100),[{lineIndex:3,shot:'off',strength:100}]);
assert.deepEqual(save([],3,'hook-push',Infinity),[],'unsafe values rejected');
assert.deepEqual(save([],NaN,'hook-push',100),[]);
assert.equal(save([],5,'solo-close',101)[0].strength,100);
assert.equal(save([],5,'solo-close',-1)[0].strength,0);
assert.equal(normalize(Array.from({length:350},(_,i)=>({lineIndex:i,shot:'solo-close',strength:80}))).length,256);
const edits=[{lineIndex:3,shot:'reply-side',strength:50}];
const amended=apply(rawPlan,'song-A','song-A',edits);
assert.equal(amended.shot,'reply-side');assert.equal(amended.gain,.2);
assert.deepEqual(rawPlan.shot,'solo-close','original plan not mutated');
assert.equal(apply(rawPlan,'song-B','song-A',edits),rawPlan,'track mismatch');
assert.equal(apply(rawPlan,'','',edits),rawPlan,'no track');
assert.equal(apply(rawPlan,'song-A','song-A',null),rawPlan,'no override');
assert.equal(apply(INACTIVE_RAP_CAMERA_V429,'song-A','song-A',edits),INACTIVE_RAP_CAMERA_V429,
  'cannot override disabled, reduced-motion or manual precedence gates');
assert.equal(apply(rawPlan,'song-A','song-A',[{lineIndex:3,shot:'off',strength:100}]).active,false);
assert.equal(apply(rawPlan,'song-A','song-A',[{lineIndex:3,shot:'hook-push',strength:0}]).active,false);
assert.equal(apply(rawPlan,'song-A','song-A',[{lineIndex:3,shot:'hook-push',strength:100}]).holdMs,1400);
assert.equal(apply(rawPlan,'song-A','song-A',[{lineIndex:3,shot:'duet-wide',strength:100}]).holdMs,1100);
const rawPose={x:0,y:0,z:5.5,targetY:0,fov:38};
assert.equal(composeRapCameraV429(rawPose,apply(rawPlan,'song-A','song-A',[{lineIndex:3,shot:'off',strength:100}])),rawPose,
  'no camera adjustment while authored line disabled');
const stored=saveLib({},'song-A',3,'hook-push',80);
const withSecond=saveLib(stored,'song-B',1,'off',100);
assert.equal(withSecond['song-A'][0].lineIndex,3);
assert.equal(withSecond['song-B'][0].shot,'off');
assert.equal(Object.keys(saveLib(withSecond,'song-A',3,'auto',100)).length,1,'auto deletes edit, other tracks intact');
assert.equal(Object.keys(saveLib(withSecond,'song-B',1,'auto',100)).length,1);
assert.deepEqual(normalizeLib({'__proto__':[{lineIndex:0,shot:'off',strength:50}],
  'song-A':[{lineIndex:0,shot:'off',strength:50}]} )['song-A'],[{lineIndex:0,shot:'off',strength:50}]);
const proto=JSON.parse('{"__proto__":[{"lineIndex":0,"shot":"off","strength":99}]}');
assert.equal(Object.keys(normalizeLib(proto)).length,0,'unsafe property keys rejected');
assert.equal(Object.prototype.polluted,undefined);
assert.equal(Object.keys(saveLib({},'__proto__',3,'off',100)).length,0);
const panel=fs.readFileSync('components/visualizer/RapCameraShotStudioPanelV430.tsx','utf8');
for(const token of ['Kameraeinstellung für diese Zeile speichern','Zeile auf Automatik zurücksetzen',
  'onClick={save}', 'disabled={!changed}','RapCameraShotStudioPanelV430','onChange={e=>setShot',
  'Spotify-Position','gespeicherte Kamera-Keyframes'])assert(panel.includes(token),`missing UI: ${token}`);
const parent=fs.readFileSync('components/visualizer/ExpressiveRapDirectorPanelV425.tsx','utf8');
assert(parent.includes('<RapCameraShotStudioPanelV430 key={`${id}:${rapCameraPreview.lineIndex}`}'));
const camera=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
assert(camera.includes('const editedRapPlanV430=applyRapCameraShotV430(rapPlanV429'));
assert(camera.includes('advanceRapCameraHoldV429(rapCameraHoldV429.current,editedRapPlanV430'));
const view=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
assert(view.includes('rapCameraOverridesV430:rapCameraEditsV436'));
assert(view.includes('combineRapCameraAutoFixV436(rapAutoFixPlanV436.overrides,original)'));
assert(view.includes('const original=track?.id?(preferences.rapCameraOverridesV430??{})[track.id]??[]:[];'));
const registry=fs.readFileSync('components/visualizer/registry.tsx','utf8');
assert(registry.includes('rapCameraOverridesV430?:'));
const prefs=fs.readFileSync('context/UiPreferencesContext.tsx','utf8');
assert(prefs.includes('rapCameraOverridesV430:{}'));
assert(prefs.includes('normalizeRapCameraLibraryV430(parsed.rapCameraOverridesV430)'));
const pkg=require('../package.json');
assert.ok(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1]) >= 430);
assert(pkg.scripts['build:preflight'].includes('test:v430'));
assert(pkg.scripts['verify:offline:fast'].includes('test:v430'));
console.log('PASS V430 per-line camera edits, safety gates, track isolation, saved JSON normalization, manual save/reset UI and camera integration');
