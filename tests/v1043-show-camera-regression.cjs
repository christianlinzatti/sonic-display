'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..');
const {planArenaShowCameraV1043,composeArenaShowCameraV1043}=load('lib/arena360ShowCameraV1043');
const show={active:true,camera:'orbit',intensity:85,fade:1};
const base={enabled:true,stageIsArena:true,playing:true,reducedMotion:false,show,trackId:'spotify:track:x',progressMs:80000,strength:55};
const cue=planArenaShowCameraV1043(base);
assert.equal(cue.active,true);assert.equal(cue.shot,'orbit');assert.equal(cue.seconds,80);
assert(cue.strength>0&&cue.strength<=.8);
for(const blocked of [{enabled:false},{stageIsArena:false},{show:null},{playing:false},{reducedMotion:true},{manualPriority:true},{trackId:''},{progressMs:NaN},{progressMs:-1}]){
 assert.equal(planArenaShowCameraV1043({...base,...blocked}).active,false);
}
for(const bad of [NaN,Infinity,-100,999,undefined]){
 const result=planArenaShowCameraV1043({...base,strength:bad});
 assert(Number.isFinite(result.strength)&&result.strength>=0&&result.strength<=.8);
}
// An inactive template, zero-strength show and playback seek cannot cause a cut.
assert.equal(planArenaShowCameraV1043({...base,show:{...show,intensity:0}}).active,false);
assert.equal(planArenaShowCameraV1043({...base,show:{...show,fade:0}}).active,false);
assert.equal(planArenaShowCameraV1043({...base,strength:0}).active,false);
assert.equal(planArenaShowCameraV1043({...base,progressMs:4000}).seconds,4);
const pose={x:0,y:1.35,z:8,fov:45,targetY:.2,targetX:0,targetZ:0};
for(const shot of ['wide','orbit','lead','group']){
 const a=planArenaShowCameraV1043({...base,show:{...show,camera:shot}});
 const result=composeArenaShowCameraV1043(pose,a);
 assert(result!==pose,'modified '+shot);
 assert([result.x,result.y,result.z,result.fov].every(Number.isFinite));
 assert(Math.hypot(result.x,result.z)>=7.5&&Math.hypot(result.x,result.z)<8.9);
 assert(result.fov>=28&&result.fov<=65);
 assert.strictEqual(composeArenaShowCameraV1043(pose,a,true),pose,'protected shot untouched');
 assert.strictEqual(composeArenaShowCameraV1043(pose,null),pose);
}
const near={...pose,z:2};
assert.strictEqual(composeArenaShowCameraV1043(near,cue),near,'near-camera shot never changed');
const source=p=>fs.readFileSync(path.join(root,p),'utf8');
for(const file of ['components/visualizer/StageCameraDirectorV289.tsx','components/visualizer/SmartStageCameraV236.tsx'])
 assert(source(file).includes('composeArenaShowCameraV1043'),'existing camera driver '+file);
assert(source('components/visualizer/ThreeAvatar.tsx').includes('planArenaShowCameraV1043'));
assert(source('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('arenaShowCameraEnabledV1043'));
console.log('PASS V1043 show camera safety, show scenes, steady interpolation and existing camera ownership');
