'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planCinematicConcertV497:plan}=load('components/visualizer/cinematicConcertChoreographyV497');
const {refineVocalConcertHandoffsV498:refine}=load('components/visualizer/vocalHandoffDirectorV498');
const segs=[
 {startMs:0,endMs:8000,leadSlot:0,partnerSlot:1,style:'solo',strength:95},
 {startMs:8000,endMs:17000,leadSlot:1,partnerSlot:0,style:'duet',strength:95},
 {startMs:17000,endMs:28000,leadSlot:2,partnerSlot:3,style:'hook',strength:100},
 {startMs:31000,endMs:36000,leadSlot:3,partnerSlot:0,style:'solo',strength:85},
];
const input={trackId:'demo',cueTrackId:'demo',progressMs:8000,playing:true,reducedMotion:false,
 enabled:true,castCount:4,segments:segs,manualVocalPriority:false,manualCameraPriority:false,
 manualLightingPriority:false,cameraEnabled:true,lightingEnabled:true,lyricsActive:false};
const at=(time,patch={})=>{
 const i={...input,...patch,progressMs:time};
 return refine(plan(i),{trackId:i.trackId,progressMs:i.progressMs,castCount:i.castCount,segments:i.segments});
};
const start=at(8000),handoffStart=at(8001),early=at(8220),middle=at(8500),late=at(8900),hold=at(12500);
assert.equal(start.focusFromV498,null,'V497 activates only once its attack has begun');
assert.equal(handoffStart.focusFromV498,0);
assert(handoffStart.focusBlendV498>0&&handoffStart.focusBlendV498<.01);
assert.equal(start.cameraWeight,0);
assert.equal(start.lightGain,1);
assert.equal(start.beamGain,1);
assert.equal(start.accentEnvelopeV498,0);
assert(early.focusBlendV498>0&&early.focusBlendV498<middle.focusBlendV498);
assert(middle.focusBlendV498<late.focusBlendV498);
assert.equal(late.focusFromV498,null);
assert.equal(late.focusBlendV498,1);
assert.equal(hold.focusFromV498,null);
assert(hold.cameraWeight>start.cameraWeight&&hold.lightGain>start.lightGain);
assert(hold.cameraWeight<=.85&&hold.lightGain<=1.11&&hold.beamGain<=1.13);
assert.equal(at(16999).focusFromV498,null);
assert.equal(at(17000).focusFromV498,null,'hook intentionally has no singled-out spotlight');
assert.equal(at(31000).focusFromV498,null,'long pause must not borrow an earlier singer');
const ending=at(35900),last=at(35999);
assert(last.cameraWeight<ending.cameraWeight);
assert(last.lightGain<ending.lightGain);
assert(!at(36000).active);
const noCamera=at(8600,{manualCameraPriority:true});
assert(!noCamera.cameraActive&&noCamera.cameraWeight===0&&noCamera.lightingActive);
const noLight=at(8600,{manualLightingPriority:true});
assert(!noLight.lightingActive&&noLight.lightGain===1&&noLight.beamGain===1);
assert.equal(noLight.focusFromV498,null);
const reduced=at(8600,{reducedMotion:true});
assert(reduced.active&&!reduced.cameraActive&&!reduced.lightingActive);
assert.equal(reduced.cameraWeight,0);
assert.equal(at(8600,{playing:false}).active,false);
assert.equal(at(8600,{cueTrackId:'other'}).active,false);
assert.equal(at(8600,{manualVocalPriority:true}).active,false);
assert.equal(at(8600,{castCount:1}).active,false);
assert.equal(at(8600,{trackId:'other'}).active,false);
const lyric=at(12000,{lyricsActive:true});
assert(lyric.cameraWeight<hold.cameraWeight&&lyric.beamGain<hold.beamGain);
const zeroBase=plan({...input,progressMs:8500});
assert.equal(refine(zeroBase,{trackId:'other',progressMs:8500,castCount:4,segments:segs}).focusFromV498,null);
assert.equal(refine(zeroBase,{trackId:'demo',progressMs:NaN,castCount:4,segments:segs}).focusFromV498,null);
assert.equal(refine(zeroBase,{trackId:'demo',progressMs:8500,castCount:5,segments:segs}).focusFromV498,null);
// Same singer consecutively does not create a redundant transition.
const same=[segs[0],{...segs[1],leadSlot:0,partnerSlot:1}];
assert.equal(at(8100,{segments:same}).focusFromV498,null);
// Overlapping cues: an active previous cue at the new start is respected.
const overlapping=[{...segs[0],endMs:9000},segs[1]];
assert.equal(at(8100,{segments:overlapping}).focusFromV498,0);
// Short gap: nearest previous authored singer only.
const gap=[{...segs[0],endMs:7650},segs[1]];
assert.equal(at(8100,{segments:gap}).focusFromV498,0);
// Malformed data is filtered by the same strict V496 normalizer.
const invalid=[{...segs[0],leadSlot:17},segs[1]];
assert.equal(at(8100,{segments:invalid}).focusFromV498,null);
// 30 minutes at 60 Hz: deterministic bounded calculations, no accumulation.
let peak=0;let smoothSamples=0;
for(let frame=0;frame<108000;frame++){
 const time=(frame*1000/60)%36000;
 const cue=at(time);
 assert(Number.isFinite(cue.cameraWeight)&&Number.isFinite(cue.lightGain));
 assert(cue.cameraWeight>=0&&cue.cameraWeight<=.85+1e-8);
 assert(cue.lightGain>=1&&cue.lightGain<=1.11+1e-8);
 assert(cue.beamGain>=1&&cue.beamGain<=1.13+1e-8);
 peak=Math.max(peak,cue.focusBlendV498);
 if(cue.focusFromV498!==null)smoothSamples++;
}
assert.equal(peak,1);
assert(smoothSamples>1000);
const scene=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
assert(scene.includes('refineVocalConcertHandoffsV498(cinematicPlanV497'));
assert(scene.includes('cinematicCueV497={cinematicCueV497}'));
const lights=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
assert(lights.includes('focusFromV498')&&lights.includes('focusBlendV498'));
assert(lights.includes('previous.getWorldPosition(concertFocusPositionV386.current)'));
assert(lights.includes('timelineCue.blackout>0')&&lights.includes('authored:authoredLightsV386'));
const camera=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
assert(camera.includes('composeCinematicConcertCameraV497')&&camera.includes('authored:!automaticShot'));
const pkg=require('../package.json');
assert(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1])>=498);
assert(pkg.scripts['build:preflight'].includes('npm run test:v498 && npm run test:v498:types && npm run test:v497'));
console.log('PASS V498: timestamp-safe vocal transitions, cue precedence, actual avatar light handoff and 30-minute bounded simulation');
