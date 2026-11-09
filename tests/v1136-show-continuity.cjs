const assert=require('node:assert/strict'),load=require('./helpers/load-stage-typescript.cjs');
const {showJumpV1136,previewSampleV1136,readingCameraBlendV1136,sampledJumpV1136}=load('lib/showContinuityV1136.ts');
const {concertScoreV1134,composeScoreCameraV1134,newScoreCameraV1134}=load('lib/concertScoreV1134.ts');
const {rapLyrics}=require('./fixtures/concertStressV1134.cjs');
const point={source:'a',positionMs:8000};
assert(!showJumpV1136(point,{...point,positionMs:8250}));assert(!showJumpV1136(point,{...point,positionMs:7800}));
for(const next of [{source:'b',positionMs:8000},{source:'a',positionMs:11000},{source:'a',positionMs:2000}])assert(showJumpV1136(point,next));
assert(!showJumpV1136(point,{source:'a',positionMs:NaN}));
assert.deepEqual(previewSampleV1136(point,{...point},false),{sample:false,cut:false});
assert.deepEqual(previewSampleV1136(point,{...point,positionMs:8100},false),{sample:true,cut:true});
assert.deepEqual(previewSampleV1136(point,{...point,positionMs:8100},true),{sample:true,cut:false});
assert.deepEqual(previewSampleV1136(point,{...point,positionMs:Infinity},true),{sample:false,cut:false});
const guard={playing:true,reducedMotion:false,protectedShot:false};
const camera={x:0,y:1,z:6,fov:40,targetY:0};
const make=(trackId,progressMs)=>concertScoreV1134({trackId,progressMs,lyrics:rapLyrics,durationMs:100000,count:3});
const state=newScoreCameraV1134(),cue=make('a',10000);assert(cue.reading);
assert.deepEqual(composeScoreCameraV1134({...camera,x:4},cue,state,guard,camera),camera);
for(let i=1;i<8;i++)assert.deepEqual(composeScoreCameraV1134({...camera,x:i},make('a',10000+i*100),state,guard,camera),camera);
const target={...camera,x:-1,z:7,fov:43,targetY:.2};
assert.deepEqual(composeScoreCameraV1134(target,make('a',16000),state,guard,camera),target,'Seek reframes from the new composed target');
assert.deepEqual(composeScoreCameraV1134({...camera,x:9},make('a',16100),state,guard,target),target,'Hold stays still after the seek');
const trackB={...camera,x:2,z:8};
assert.deepEqual(composeScoreCameraV1134(trackB,make('b',16100),state,guard,target),trackB,'Another track cannot inherit the old rap anchor');
const backward={...camera,x:-2};assert.deepEqual(composeScoreCameraV1134(backward,make('b',9000),state,guard,trackB),backward);
assert.deepEqual(composeScoreCameraV1134(target,make('b',9000),state,{...guard,playing:false},backward),backward,'Pause holds actual pose');
assert.deepEqual(composeScoreCameraV1134(target,make('b',9000),state,guard,backward),backward,'Resume keeps the same pose');
for(const patch of [{protectedShot:true},{reducedMotion:true}])assert.strictEqual(composeScoreCameraV1134(target,cue,state,{...guard,...patch},camera),target);
// Repeated random-looking deterministic seeks must never latch a stale source or poison a pose.
let pos=8000,track='fuzz0';const fuzz=newScoreCameraV1134();
for(let i=0;i<3000;i++){
 pos=i%37===0?8000+(i*97)%12000:Math.min(22000,pos+16);if(i%83===0)track='fuzz'+i;
 const c=make(track,pos),base={...camera,x:Math.sin(i),fov:40+i%5};
 const p=composeScoreCameraV1134(base,c,fuzz,guard,camera);for(const n of ['x','y','z','fov'])assert(Number.isFinite(p[n]));assert.equal(fuzz.clock.source,'track:'+track);
}
console.log('PASS V1136: paused scrubbing, polling jitter, forward/backward seeks, track identity, rap camera reacquisition, pause/resume, manual ownership and 3000 discontinuity samples');

const initial=newScoreCameraV1134();
const noSong=concertScoreV1134({progressMs:0});
composeScoreCameraV1134(camera,noSong,initial,guard,camera);
assert.deepEqual(composeScoreCameraV1134(target,make('first-song',10000),initial,guard,camera),camera,'First rap arrival holds the visible camera instead of flying to a target');
console.log('PASS V1136: first-track arrival preserves the existing visible reading pose');

for(const hz of [30,60,120]){let error=10;for(let i=0;i<hz;i++)error*=1-readingCameraBlendV1136(.001,1/hz,true);assert(error<.03,'A new reading shot must settle within one second');}
assert.equal(readingCameraBlendV1136(.02,1/60,false),.02,'Manual/protected rates stay unchanged');
console.log('PASS V1136: prompt reading-shot settling at 30/60/120 FPS with protected rates unchanged');

assert(!showJumpV1136(point,{...point,positionMs:13000},5000),'A rendering stall is not a seek');
assert(showJumpV1136(point,{...point,positionMs:13000},250),'Extra song advance beyond elapsed time is a seek');
const stalled=newScoreCameraV1134();let wall=0,song=10000;
composeScoreCameraV1134(camera,make('stall',song),stalled,{...guard,nowMs:wall},camera);
for(let i=0;i<20;i++){
 const dt=i===8?5000:250;wall+=dt;song+=dt;
 assert.deepEqual(composeScoreCameraV1134(target,make('stall',song),stalled,{...guard,nowMs:wall},camera),camera,'A long render pause must keep the existing reading anchor');
}
assert.deepEqual(composeScoreCameraV1134(target,make('stall',song+3000),stalled,{...guard,nowMs:wall+250},camera),target,'A real seek after a render pause must still reframe');
console.log('PASS V1136: elapsed-time-aware render stalls preserve reading anchors while real seeks still reframe');

const pausedSeek=newScoreCameraV1134();
composeScoreCameraV1134(camera,make('paused-seek',10000),pausedSeek,{...guard,nowMs:0},camera);
composeScoreCameraV1134(camera,make('paused-seek',10000),pausedSeek,{...guard,playing:false,nowMs:1000},camera);
assert.deepEqual(composeScoreCameraV1134(target,make('paused-seek',13000),pausedSeek,{...guard,playing:false,nowMs:21000},camera),target,'A long pause must not hide a forward seek');
composeScoreCameraV1134(target,make('paused-seek',13000),pausedSeek,{...guard,nowMs:22000},target);
assert.deepEqual(composeScoreCameraV1134(camera,make('paused-seek',16000),pausedSeek,{...guard,nowMs:22250},target),camera,'Resume resets the elapsed-time reference before the next seek');
console.log('PASS V1136: paused forward seeks and immediate post-resume seeks retain correct elapsed-time semantics');

const provider=newScoreCameraV1134(),a={positionMs:10000,fetchedAt:100000,playing:true};
const withSample=(positionMs,playback)=>({...make('provider',positionMs),playback});
composeScoreCameraV1134(camera,withSample(10000,a),provider,guard,camera);
for(const ui of [11952,18682,18736,21702,12000])assert.deepEqual(composeScoreCameraV1134(target,withSample(ui,a),provider,guard,camera),camera,'Delayed UI frames do not constitute a provider seek');
const b={positionMs:15000,fetchedAt:105000,playing:true};
assert(!sampledJumpV1136(a,b));assert.deepEqual(composeScoreCameraV1134(target,withSample(15000,b),provider,guard,camera),camera);
const c={positionMs:42000,fetchedAt:105250,playing:true};assert(sampledJumpV1136(b,c));
assert.deepEqual(composeScoreCameraV1134(target,withSample(16000,c),provider,guard,camera),target,'Only an actual provider correction should replace the reading anchor');
assert(!sampledJumpV1136(c,a),'Older provider responses cannot rewind the shot');
assert(sampledJumpV1136({...b,playing:false},{...c,playing:false}),'Paused provider seeks remain detectable');
console.log('PASS V1136: authoritative playback samples reject delayed/stale UI jumps and detect real provider seeks');
