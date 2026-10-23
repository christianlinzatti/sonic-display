'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {normalizeRapCameraKeyframesV432:normal,normalizeRapCameraKeyframeLibraryV432:normalizeLib,
  normalizeRapCameraPoseV432:poseSafe,saveRapCameraKeyframeV432:save,
  lineRapCameraKeyframesV432:line,sampleRapCameraKeyframesV432:sample,
  composeRapCameraKeyframeV432:compose}=load('components/visualizer/rapCameraKeyframesV432');
const {INACTIVE_RAP_CAMERA_V429}=load('components/visualizer/cinematicRapCameraV429');
const pose={x:0,y:.2,z:4,targetX:0,targetY:0,targetZ:0,fov:38};
const offset={x:2,y:1,z:5,targetX:.5,targetY:1,targetZ:1,fov:41};
let library=save({},'track-A',4,0,pose);
library=save(library,'track-A',4,1000,offset);
assert.equal(library['track-A'].length,2);
assert.equal(line(library['track-A'],4).length,2);
assert.equal(sample(library['track-A'],4,0).x,0);
assert.equal(sample(library['track-A'],4,1000).x,2);
assert.equal(sample(library['track-A'],4,500).x,1);
assert.equal(sample(library['track-A'],4,250).x,.3125,'smoothstep is not linear');
assert.equal(sample(library['track-A'],4,2000).x,2,'hold last frame');
assert.equal(sample(library['track-A'],4,50).x>0,true);
assert.equal(sample(library['track-A'],3,500),null,'never leak into adjacent lines');
assert.equal(sample(library['track-A'],4,-1),null);
const source=JSON.stringify(library);
let next=save(library,'track-B',1,0,offset);
assert.equal(next['track-A'].length,2,'preserve other track');
assert.equal(JSON.stringify(library),source,'pure update');
assert.equal(save(next,'__proto__',1,0,pose)['__proto__'],undefined);
assert.equal(save(next,'track-B',-1,0,pose)['track-B'].length,1);
assert.equal(save(next,'track-B',1,Infinity,pose)['track-B'].length,1);
assert.equal(save(next,'track-B',1,0,null)['track-B'],undefined,'remove empty track');
assert.equal(normal([{lineIndex:4,offsetMs:0,pose},{lineIndex:4,offsetMs:0,pose:offset}])[0].pose.x,2,'last valid wins');
assert.equal(normal([{lineIndex:0,offsetMs:NaN,pose},{lineIndex:1,offsetMs:15000,pose},null]).length,0);
assert.equal(normal(Array.from({length:300},(_,i)=>({lineIndex:i,offsetMs:0,pose}))).length,128,'memory bound');
assert.equal(normalizeLib({'__proto__':[{lineIndex:0,offsetMs:0,pose}]}).__proto__,undefined);
assert.equal(Object.getPrototypeOf(normalizeLib(JSON.parse('{"__proto__": []}'))),null);
assert.equal(poseSafe({x:1e10,y:NaN,z:-50,fov:200}).x,20);
assert.equal(poseSafe({x:1e10,y:NaN,z:-50,fov:200}).z,-20);
assert.equal(poseSafe({x:1e10,y:NaN,z:-50,fov:200}).fov,95);
const plan={active:true,shot:'solo-close',lineIndex:4,leadSlot:0,startMs:1000,endMs:3000,gain:1,holdMs:1100};
assert.equal(compose(pose,plan,library['track-A'],1500,{enabled:true,lyricsProtected:false}).x,1);
assert.equal(compose(pose,plan,library['track-A'],2000,{enabled:true,lyricsProtected:true}).x,.6,'lyrics protection');
assert.equal(compose(pose,plan,library['track-A'],1500,{enabled:false,lyricsProtected:false}),pose);
assert.equal(compose(pose,INACTIVE_RAP_CAMERA_V429,library['track-A'],1500,{enabled:true,lyricsProtected:false}),pose);
assert.equal(compose(pose,plan,library['track-A'],3001,{enabled:true,lyricsProtected:false}),pose);
assert.equal(compose(pose,plan,[],1500,{enabled:true,lyricsProtected:false}),pose);
const far={...pose,x:19,y:9,z:-9,fov:90};
const safe=compose(pose,plan,[{lineIndex:4,offsetMs:0,pose:far}],1200,{enabled:true,lyricsProtected:false});
assert(safe.x<=2.2&&safe.y<=1.5&&safe.z>=1.2&&safe.fov<=45,'camera move is bounded');
const files={
  parent:fs.readFileSync('components/visualizer/ExpressiveRapDirectorPanelV425.tsx','utf8'),
  panel:fs.readFileSync('components/visualizer/RapCameraKeyframeStudioPanelV432.tsx','utf8'),
  stage:fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8'),
  visual:fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8'),
  prefs:fs.readFileSync('context/UiPreferencesContext.tsx','utf8'),
  type:fs.readFileSync('types/music.ts','utf8')
};
for (const field of ['rapCameraKeyframesEnabledV432','rapCameraKeyframesV432']) {
  for(const section of ['stage','visual','prefs','type'])assert(files[section].includes(field),`${section} missing ${field}`);
}
assert(files.parent.includes('<RapCameraKeyframeStudioPanelV432'));
assert(files.panel.includes('CameraLivePreviewV291')&&files.panel.includes('Keyframe speichern')&&files.panel.includes('Keyframe löschen'));
assert(!files.panel.includes('seekTo(')&&!files.panel.includes('setProgressMs('));
assert(files.stage.indexOf('composeRapCameraV429(')<files.stage.indexOf('composeRapCameraKeyframeV432('));
assert(files.stage.indexOf('composeRapCameraKeyframeV432(')<files.stage.indexOf('guardAutomaticCameraV351('));
assert(files.stage.includes('rapCameraBlockedV429')&&files.stage.includes('applyRapCameraShotV430'));
const pkg=require('../package.json');
assert.ok(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1])>=432);
assert(pkg.scripts['build:preflight'].includes('test:v432'));
assert(pkg.scripts['verify:offline:fast'].includes('test:v432'));
console.log('PASS V432: local keyframes, safety gates, interpolation, preview integration, per-track isolation, no Spotify seek');
