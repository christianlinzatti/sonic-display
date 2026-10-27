'use strict';
require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planCinematicConcertV497:plan,composeCinematicConcertCameraV497:camera,concertLightMultiplierV497:light}=load('components/visualizer/cinematicConcertChoreographyV497');
const segs=[
 {startMs:0,endMs:10000,leadSlot:0,partnerSlot:1,style:'solo',strength:80},
 {startMs:10000,endMs:20000,leadSlot:1,partnerSlot:0,style:'duet',strength:90},
 {startMs:20000,endMs:30000,leadSlot:2,partnerSlot:3,style:'hook',strength:100},
];
const baseline={trackId:'track-v497',cueTrackId:'track-v497',progressMs:4000,playing:true,
 reducedMotion:false,enabled:true,castCount:4,segments:segs,manualVocalPriority:false,
 manualCameraPriority:false,manualLightingPriority:false,cameraEnabled:true,
 lightingEnabled:true,lyricsActive:false};
const get=(patch={})=>plan({...baseline,...patch});
const solo=get();
assert(solo.active&&solo.cameraActive&&solo.lightingActive);
assert.equal(solo.beat,'solo');
assert.equal(solo.leadSlot,0);
assert.equal(solo.focusSlot,0);
assert.deepEqual(solo.singerSlots,[0]);
assert(solo.cameraWeight>0&&solo.cameraWeight<=.85);
assert(solo.lightGain>1&&solo.lightGain<=1.11);
assert(solo.beamGain>1&&solo.beamGain<=1.13);
const duet=get({progressMs:14500});
assert.equal(duet.beat,'duet');
assert.equal(duet.leadSlot,1);
assert.deepEqual(duet.singerSlots,[1,0]);
const hook=get({progressMs:24500});
assert.equal(hook.beat,'hook');
assert.equal(hook.focusSlot,null);
assert.deepEqual(hook.singerSlots,[0,1,2,3]);
const lyrics=get({lyricsActive:true});
assert(lyrics.lyricsProtected);
assert(lyrics.cameraWeight<solo.cameraWeight&&lyrics.beamGain<solo.beamGain);
assert.equal(get({progressMs:30000}).active,false,'ends exclusive');
for(const patch of [
 {enabled:false},{playing:false},{trackId:'other'},{cueTrackId:''},
 {manualVocalPriority:true},{castCount:1},{castCount:5},
 {progressMs:NaN},{progressMs:-2},{segments:[]},
]){
 const v=get(patch);assert.equal(v.active,false,JSON.stringify(patch));
 assert.equal(v.lightGain,1);assert.equal(v.beamGain,1);
}
const reduced=get({reducedMotion:true});
assert(reduced.active&&!reduced.cameraActive&&!reduced.lightingActive);
assert.equal(reduced.cameraWeight,0);
assert.equal(reduced.lightGain,1);
assert.equal(reduced.beamGain,1);
assert(!get({manualCameraPriority:true}).cameraActive);
assert(get({manualCameraPriority:true}).lightingActive);
assert(!get({manualLightingPriority:true}).lightingActive);
assert(get({manualLightingPriority:true}).cameraActive);
const base={fov:38,z:6,x:0,targetX:1,targetY:0.2};
const cs=camera(base,solo,{authored:false,lyricsProtected:false});
assert(cs!==base&&cs.fov<base.fov&&cs.z<base.z);
assert.equal(cs.targetX,base.targetX);
assert.equal(camera(base,solo,{authored:true,lyricsProtected:false}),base);
assert.equal(camera(base,reduced,{authored:false,lyricsProtected:false}),base);
const ch=camera(base,hook,{authored:false,lyricsProtected:false});
assert(ch.fov>base.fov&&ch.z>base.z);
const protectedCamera=camera(base,lyrics,{authored:false,lyricsProtected:true});
assert(Math.abs(protectedCamera.fov-base.fov)<Math.abs(cs.fov-base.fov));
const guarded=(cue,kind,patch={})=>light(cue,kind,{authored:false,blackout:false,
 playing:true,reducedMotion:false,lowTier:false,...patch});
assert(guarded(solo,'key')>1&&guarded(solo,'key')<=1.11);
assert(guarded(hook,'beam')>1&&guarded(hook,'beam')<=1.13);
assert.equal(guarded(solo,'beam',{authored:true}),1);
assert.equal(guarded(solo,'beam',{blackout:true}),1);
assert.equal(guarded(solo,'beam',{playing:false}),1);
assert.equal(guarded(solo,'key',{reducedMotion:true}),1);
assert(guarded(solo,'beam',{lowTier:true})<guarded(solo,'beam'));
let active=0,maxFov=0,large=0;
for(let t=0;t<108000;t++){
 const time=t*1000/60;
 const q=get({progressMs:time%30000});
 if(q.active){active++;const f=camera(base,q,{authored:false,lyricsProtected:Math.floor(time/1000)%2===0});
  maxFov=Math.max(maxFov,f.fov);if(Math.abs(f.fov-base.fov)>1.5)large++;}
}
assert(active>100000&&maxFov<40&&large===0,'30-minute continuous live display remains bounded');
const src=file=>fs.readFileSync('components/visualizer/'+file,'utf8');
for(const [file,tokens] of Object.entries({
 'ThreeAvatar.tsx':['planCinematicConcertV497(','cinematicCueV497={cinematicCueV497}','compositionV497','<Lyrics3DScene','cameraEnabled:props.lipSync?.rapDuetCameraV416!==false','vocalTimeEnabledV496===true && props.lipSync.vocalTimeSegmentsV496?.length'],
 'StageCameraDirectorV289.tsx':['composeCinematicConcertCameraV497(','authored:!automaticShot','guardAutomaticCameraV351(concertFramedV497,composition)'],
 'DynamicStage.tsx':['concertLightMultiplierV497(','authored:authoredLightsV386','cinematicKeyV497','cinematicBeamV497','lightFocusV497','timelineCue.blackout>0'],
}))for(const token of tokens)assert(src(file).includes(token),`${file}: missing ${token}`);
assert(src('ThreeAvatar.tsx').includes('manualVocalPriority:props.lipSync?.manualVocalEnabledV385'));
assert(src('StageCameraDirectorV289.tsx').includes('!!authoredCueV400'));
const pkg=require('../package.json');
assert(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1])>=497);
assert(pkg.scripts['build:preflight'].includes('npm run test:v497 && npm run test:v497:types && npm run test:v496'));
console.log('PASS V497: joined solo/duet/hook camera & lights, lyric and manual priority, 30-minute simulation');
