#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {reviewCinematicCameraV1025:review,composeCinematicCameraV1025:compose}=load('components/visualizer/cinematicCameraIntelligenceV1025');
const {measureConcertFrameV550:frame}=load('components/visualizer/cinematicConcertCameraV550');
const {measureScreenFrameV540:screen}=load('components/visualizer/cinematicCameraCompositionV540');
const pose={x:0,y:1.35,z:5.8,targetX:0,targetY:1.2,targetZ:0,fov:42};
const roots=[{slot:0,x:-.6,y:0,z:0,visible:true},{slot:1,x:.6,y:0,z:0,visible:true}];
const plan={source:'verified-v604',trackId:'song-1025',durationMs:48000,scenes:[
 {index:0,startMs:0,endMs:3000,section:'intro'},
 {index:1,startMs:3000,endMs:16000,section:'verse'},
 {index:2,startMs:16000,endMs:30000,section:'hook'},
 {index:3,startMs:30000,endMs:48000,section:'finale'}]};
const scene={active:true,trackId:'song-1025',cueStartMs:3000,cueEndMs:16000,
 count:2,focus:'lead',leadSlot:0,singingSlots:[0],handoffFrom:null,strength:.7};
const opts={pose,plan,vocalScene:scene,anchors:roots,trackId:'song-1025',durationMs:48000,
 positionMs:9000,playing:true,automatic:true,directorEnabled:true,cameraEnabled:true,
 tier:'high',aspect:16/9,lyricsProtected:false,lyricsVisible:false,faceY:1.55};
const get=(more={})=>review({...opts,...more});
const safe=(before,after,actors=roots,side=null)=>{
 const b=frame(before,actors,opts.aspect,side,false,opts.faceY),a=frame(after,actors,opts.aspect,side,false,opts.faceY);
 const c=screen(before,actors,opts.aspect,side),d=screen(after,actors,opts.aspect,side);
 assert(b&&a&&c&&d);for(const field of ['overflow','headOverflow','fullBodyOverflow'])assert(a[field]<=b[field]+1e-6,field);
 assert(d.overflow<=c.overflow+1e-6);
 for(const actor of actors){const x=frame(before,[actor],opts.aspect,side,false,opts.faceY),y=frame(after,[actor],opts.aspect,side,false,opts.faceY);
  assert(x&&y);for(const field of ['overflow','headOverflow','fullBodyOverflow'])assert(y[field]<=x[field]+1e-6,`actor ${actor.slot}: ${field}`);}
};
const lead=get();assert(lead.active,'verified lead cue should refine camera');
assert.equal(lead.shot,'portrait');assert.deepEqual(lead.participants,[0]);
assert(lead.pose.z<pose.z);assert(lead.cameraRate<1);safe(pose,lead.pose);
assert.deepEqual(compose({...opts}),lead.pose);assert.deepEqual(pose,{x:0,y:1.35,z:5.8,targetX:0,targetY:1.2,targetZ:0,fov:42});
const handoff=get({vocalScene:{...scene,focus:'handoff',handoffFrom:1,singingSlots:[0]},positionMs:9800});
assert(handoff.active&&handoff.shot==='handoff');assert.deepEqual(handoff.participants,[1,0]);safe(pose,handoff.pose);
const multiLead=get({vocalScene:{...scene,focus:'lead',singingSlots:[0,1]}});
assert(multiLead.active&&multiLead.shot==='ensemble','two singers cannot be reframed as a solo');safe(pose,multiLead.pose);
const duet=get({vocalScene:{...scene,focus:'ensemble',singingSlots:[0,1]}});
assert(duet.active&&duet.shot==='ensemble');assert.deepEqual(duet.participants,[0,1]);safe(pose,duet.pose);
const wide=get({positionMs:20500,vocalScene:null});assert(wide.active&&wide.shot==='arena');
assert.deepEqual(wide.participants,[0,1]);assert(wide.pose.z>pose.z);safe(pose,wide.pose);
const noSinger=get({vocalScene:null});assert(noSinger.active&&noSinger.shot==='glide');safe(pose,noSinger.pose);
const noSingerBadTrack=get({vocalScene:{...scene,trackId:'wrong'}});
assert(noSingerBadTrack.active&&noSingerBadTrack.shot==='glide','unverified singer must never make a portrait');
const lyric=get({lyricsVisible:true});assert(!lyric.active&&lyric.shot==='lyrics-hold');assert.strictEqual(lyric.pose,pose);
for(const [name,patch] of Object.entries({
 paused:{playing:false},manual:{manualCamera:true},manualFx:{manualFx:true},
 automatic:{automatic:false},director:{directorEnabled:false},camera:{cameraEnabled:false},
 seek:{seekBlocked:true},blackout:{blackout:true},reduced:{reducedMotion:true},
 low:{tier:'low'},lyrics:{lyricsProtected:true},missing:{plan:null},
 fakeSource:{plan:{...plan,source:'unavailable'}},badTrack:{trackId:'wrong'},
 badDuration:{durationMs:12345},badTime:{positionMs:NaN},negative:{positionMs:-3},
 badAspect:{aspect:NaN},badPose:{pose:{...pose,z:NaN}},noAnchor:{anchors:[]},
 duplicated:{anchors:[roots[0],roots[0]]},invisible:{anchors:[{...roots[0],visible:false}]},
 overlaps:{plan:{...plan,scenes:[...plan.scenes,{index:11,startMs:8000,endMs:10000,section:'verse'}]}},
 invalidScene:{plan:{...plan,scenes:[...plan.scenes,{index:4,startMs:1000,endMs:2000,section:'drop'}]}},
 unknownSection:{plan:{...plan,scenes:plan.scenes.map(a=>a.index===1?{...a,section:'guessed-drop'}:a)}},
 })){
 const x=get(patch);assert(!x.active,`rejected ${name}`);assert.strictEqual(x.pose,patch.pose??pose,`same original pose ${name}`);
}
const atStart=get({positionMs:3000});assert(!atStart.active&&atStart.reason==='boundary');
const atEnd=get({positionMs:16000});assert(!atEnd.active&&atEnd.reason==='boundary');
const early=get({positionMs:3050}),end=get({positionMs:15950});
assert(early.pose===pose||Math.abs(early.pose.z-pose.z)<Math.abs(lead.pose.z-pose.z));
assert(end.pose===pose||Math.abs(end.pose.z-pose.z)<Math.abs(lead.pose.z-pose.z));
// No data may be mutated; no network, interval, storage, camera instance or manual authoring.
assert.deepEqual(roots,[{slot:0,x:-.6,y:0,z:0,visible:true},{slot:1,x:.6,y:0,z:0,visible:true}]);
const source=read('components/visualizer/cinematicCameraIntelligenceV1025.ts');
for(const forbidden of ['fetch(','localStorage','sessionStorage','indexedDB','setTimeout(',
 'setInterval(','new PerspectiveCamera','new AudioContext','govee','window.'])
 assert(!source.includes(forbidden),forbidden);
const pipeline=read('components/visualizer/StageCameraDirectorV289.tsx');
const before='const cinematicV1025=reviewCinematicCameraV1025(';
const after='guardAutomaticCameraV351(cinematicV1025.pose,composition)';
assert(pipeline.includes(before)&&pipeline.includes(after));
assert(pipeline.indexOf('const danceCameraV898=sampleDanceCameraV898(')<pipeline.indexOf(before));
assert(pipeline.indexOf(before)<pipeline.indexOf(after));
assert(pipeline.includes('danceShowCameraV899.cameraRate*cinematicV1025.cameraRate'));
assert(pipeline.includes('blackout:cameraSignalV897.intensity<=0,'));
assert.equal((pipeline.match(/useFrame\(/g)||[]).length,1,'no second camera animation loop');
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1])>=1025);assert.equal(pkg.version,lock.version);
assert.equal(pkg.sonicFeatureRelease,pkg.version.split('-')[1]);assert.equal(pkg.sonicRoadmapRelease,pkg.version.split('-')[1]);
assert(pkg.scripts.prebuild.includes('npm run test:v1025 &&'));
for(const path of ['scripts/vercel-production-build.cjs','scripts/v931-production-gate.cjs'])
 assert(read(path).includes('tests/v1025-cinematic-camera-intelligence-regression.cjs'),path);
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1025(root)'));
console.log('PASS V1025: confirmed singer, handoff, ensemble, full-song cinematic framing, lyrics guard, manual controls and CI');
