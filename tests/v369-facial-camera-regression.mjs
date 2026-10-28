import './helpers/threeAvatarSourcesV492.cjs';
import { install as installThreeAvatarCompatV492 } from './helpers/threeAvatarSourcesV492.cjs';
installThreeAvatarCompatV492();
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolveVocalPerformanceV368} from '../components/visualizer/vocalPerformanceV368.ts';
import {resolveFacialPoseV369} from '../components/visualizer/facialPerformanceV369.ts';
import {planVocalCameraV369,composeVocalCameraV369,approachVocalFocusV369,newVocalShotHoldV369,holdVocalShotV369} from '../components/visualizer/vocalCameraV369.ts';
const lyrics={provider:'spotify',synced:true,plainText:null,lines:[
 {startMs:1000,endMs:3500,text:'Bam superklasse Wunderbar!',words:[
 {text:'Bam',startMs:1000,endMs:1400},
 {text:'superklasse',startMs:1450,endMs:1950},
 {text:'Wunderbar!',startMs:2050,endMs:3370}]},
 {startMs:3500,endMs:4200,text:'♪'},
 {startMs:4300,endMs:6300,text:'Eine lange Zeile ohne Wörter'},
 {startMs:6400,endMs:8000,text:'[Instrumental]'}]};
const cue=resolveVocalPerformanceV368(lyrics,1050,true,{genre:'Deutschrap'});
const face=resolveFacialPoseV369(cue,{strength:90,jawFollow:65});
assert.ok(face.lipsClosed>0,'labial onset triggers lip seal');
assert.ok(face.jaw<=cue.jaw,'jaw is constrained during lip closure');
assert.ok(resolveFacialPoseV369(cue,{jawFollow:100}).jaw>resolveFacialPoseV369(cue,{jawFollow:0}).jaw);
const bright=resolveFacialPoseV369(resolveVocalPerformanceV368(lyrics,1650,true));
assert.ok(bright.wide>=0&&bright.round>=0);
assert.ok(bright.wide+bright.round<=2);
for(const ms of [250,3900,7000]) {
 const idle=resolveFacialPoseV369(resolveVocalPerformanceV368(lyrics,ms,true));
 assert.equal(idle.jaw,0,'silence and instrumental suppress jaw');
}
assert.equal(planVocalCameraV369(lyrics,1050,true,{mode:'off'}),0);
assert.equal(planVocalCameraV369(lyrics,1050,false,{mode:'performance'}),0);
assert.equal(planVocalCameraV369({...lyrics,synced:false},1650,true,{mode:'auto'}),0);
assert.equal(planVocalCameraV369(lyrics,1050,true,{mode:'auto'}),0,'short filler word has no automatic cut');
assert.ok(planVocalCameraV369(lyrics,1650,true,{mode:'auto'})>0,'long emphasized word triggers auto cut');
assert.ok(planVocalCameraV369(lyrics,2400,true,{mode:'auto'})>0,'phrase-ending word triggers auto cut');
assert.equal(planVocalCameraV369(lyrics,4700,true,{mode:'performance'}),0,'line timestamps are not enough for a face close-up');
assert.equal(planVocalCameraV369(lyrics,7000,true,{mode:'auto'}),0);
const base={x:0,y:.1,z:4.2,targetY:0,fov:38};
assert.deepEqual(composeVocalCameraV369(base,0),base);
const zoom=composeVocalCameraV369(base,1,{intensity:85,duo:false,headY:.65});
assert.ok(zoom.z<base.z&&zoom.z>=2.75&&zoom.targetY>base.targetY&&zoom.fov>=28);
const lyricsProtected=composeVocalCameraV369(base,1,{intensity:85,lyricsProtected:true});
assert.ok(lyricsProtected.z>zoom.z,'lyrics protection reduces zoom');
const duo=composeVocalCameraV369({...base,z:5.9},1,{duo:true,intensity:90});
assert.ok(duo.z>=4.5,'multi-avatar safe minimum distance');
assert.ok(approachVocalFocusV369(0,1,1/60)>0&&approachVocalFocusV369(0,1,1/60)<1);
const state=newVocalShotHoldV369();
assert.ok(holdVocalShotV369(state,1,1650,true)>.9);
assert.ok(holdVocalShotV369(state,0,1955,true)>.2,'brief hold across word gap');
assert.equal(holdVocalShotV369(state,0,2150,false),0,'pause resets hold');
assert.equal(holdVocalShotV369(state,1,1000,true),0,'backward seek clears old shot on first frame');
assert.equal(holdVocalShotV369(state,1,1001,true),1,'new shot can start on next frame');
assert.equal(holdVocalShotV369(state,0,5000,true),0,'seek clears hold');
const files=['components/visualizer/ThreeAvatar.tsx','components/visualizer/VocalRigV368.tsx','components/visualizer/StageCameraDirectorV289.tsx','components/visualizer/SmartStageCameraV236.tsx','components/visualizer/VisualizerStage.tsx','components/SettingsPanel.tsx'];
for(const f of files)assert.ok(readFileSync(f,'utf8').length>100);
const stage=readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
assert.match(stage,/StageCameraDirectorV289[^>]*lipSync=\{props.lipSync\?\{\.\.\.props.lipSync,/);
assert.match(stage,/SmartStageCameraV236[^>]*lipSync=\{props.lipSync\}/);
const manual=readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
assert.match(manual,/const automaticShot=!editingPose && manual==='auto' && !userHasPreset/);
assert.match(manual,/automaticShot[\s\S]*composeVocalCameraV369/);
assert.match(readFileSync('components/SettingsPanel.tsx','utf8'),/avatarVocalCameraStrengthV369/);
assert.match(readFileSync('components/visualizer/vocalPerformanceDirectorV372.ts','utf8'),/resolveFacialPoseV369/);
assert.ok(/^0\.1\.0-v(\d+)$/.test(JSON.parse(readFileSync('package.json','utf8')).version) && Number(JSON.parse(readFileSync('package.json','utf8')).version.match(/v(\d+)$/)?.[1])>=369);
console.log('PASS V369 facial coordination, performance close-ups, lyrics protection, holds and wiring');
