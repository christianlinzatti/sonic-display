'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planIntelligentConcertFlowV654:plan,coordinateConcertDynamicsV654:dynamics,
 coordinateConcertPhotosV654:photos}=load('components/visualizer/intelligentConcertFlowV654');
const acts=[
 {index:0,startMs:0,endMs:24000,section:'verse',chapter:'setup',motif:'portrait',repetition:0},
 {index:1,startMs:24000,endMs:48000,section:'hook',chapter:'payoff',motif:'wide',repetition:0},
 {index:2,startMs:48000,endMs:65000,section:'break',chapter:'respite',motif:'breath',repetition:0},
 {index:3,startMs:65000,endMs:89000,section:'hook',chapter:'payoff',motif:'ensemble',repetition:1},
 {index:4,startMs:89000,endMs:110000,section:'drop',chapter:'ending-arc',motif:'crescendo',repetition:0},
];
const source={plan:{trackId:'verified-song',durationMs:110000,source:'verified-v600',genre:'deutschrap',acts},
 cue:{active:true,source:'verified-v600',act:1,chapter:'payoff',motif:'wide',transition:1,repetition:0}};
const input={narrative:source,trackId:'verified-song',positionMs:35000,playing:true,enabled:true,
 reducedMotion:false,tier:'high',lyricsProtected:false,manualCamera:false,manualLighting:false,manualDance:false};
let groups=0;const check=(name,fn)=>{try{fn();groups++}catch(e){e.message=`V654 ${name}: ${e.message}`;throw e;}};
const hook=plan(input);
check('verified hook is active, song-bound',()=>{assert(hook.active);assert.equal(hook.act,1);assert.equal(hook.motif,'wide');assert.equal(hook.phase,'hold');});
check('cinematic hold slows an existing camera instead of cutting',()=>{assert(hook.cameraRate<1&&hook.cameraRate>=.65);assert.equal(hook.photoLimit,3);});
check('no invented section during unconfirmed data',()=>{
 for(const override of [{narrative:null},{narrative:{...source,plan:{...source.plan,source:'unavailable'}}},
 {narrative:{...source,cue:{...source.cue,active:false}}},{trackId:'other'},
 {positionMs:Infinity},{positionMs:110000},{positionMs:-1},
 {playing:false},{enabled:false},{reducedMotion:true},{tier:'low'}]){
  const c=plan({...input,...override});assert.equal(c.active,false);assert.equal(c.cameraRate,1);
 }
});
check('stale act or claimed motif is refused',()=>{
 for(const cue of [{...source.cue,act:2},{...source.cue,motif:'portrait'},{...source.cue,chapter:'respite'},
 {...source.cue,transition:NaN},{...source.cue,act:200}]){
  assert(!plan({...input,narrative:{...source,cue}}).active);
 }
});
check('entire act enters and leaves with zero modulation',()=>{
 for(const positionMs of [24000,47999]){
  const x=plan({...input,positionMs});assert(x.active);assert(x.strength<=.001);assert.equal(x.cameraRate,1);
  assert.equal(x.lightMultiplier,1);assert.equal(x.danceMultiplier,1);
 }
});
check('repeated hook is deliberately different, with no duplicate shot creation',()=>{
 const next=plan({...input,positionMs:75000,narrative:{...source,cue:{...source.cue,act:3,motif:'ensemble',repetition:1}}});
 assert(next.active);assert.notEqual(next.motif,hook.motif);assert.notEqual(next.lightMultiplier,hook.lightMultiplier);
});
check('light is softer during a real break',()=>{
 const x=plan({...input,positionMs:56000,narrative:{...source,cue:{...source.cue,act:2,chapter:'respite',motif:'breath'}}});
 assert(x.active);assert(x.lightMultiplier<1);assert(x.danceMultiplier<1);assert.equal(x.photoLimit,2);
});
check('lyrics have priority over drops and photos',()=>{
 const x=plan({...input,lyricsProtected:true,positionMs:97000,narrative:{...source,cue:{...source.cue,act:4,chapter:'ending-arc',motif:'crescendo'}}});
 assert(x.active);assert.equal(x.photoLimit,1);assert(x.lightMultiplier<1.02);
});
check('authored lanes retain identity',()=>{
 const x=plan({...input,manualCamera:true,manualLighting:true,manualDance:true});
 assert(x.active);assert.equal(x.cameraRate,1);assert.equal(x.lightMultiplier,1);assert.equal(x.danceMultiplier,1);
});
check('low intensity tier stays more conservative',()=>{
 const low=plan({...input,tier:'balanced'});assert(low.active);assert(low.strength<hook.strength);assert(low.cameraRate>hook.cameraRate);
});
const base={active:true,section:'hook',source:'imported',genre:'deutschrap',evidence:'labeled',
 camera:1.02,dance:1.03,lighting:1.04,lyrics:.07};
check('existing stage dynamics receive ONLY bounded dance and lighting changes',()=>{
 const next=dynamics(base,hook);assert.notStrictEqual(next,base);assert.equal(next.camera,base.camera);
 assert.equal(next.lyrics,base.lyrics);assert(next.dance>=.88&&next.dance<=1.12);assert(next.lighting>=.88&&next.lighting<=1.12);
 assert.deepEqual(base,{active:true,section:'hook',source:'imported',genre:'deutschrap',evidence:'labeled',camera:1.02,dance:1.03,lighting:1.04,lyrics:.07});
 assert.strictEqual(dynamics({...base,section:'verse'},hook).section,'verse');
 assert.strictEqual(dynamics({...base,active:false},hook).active,false);
});
const photoBase={active:true,cue:'photos',visiblePhotos:4,photoOpacity:.63,photoMotion:.6,
 avoidLyricsX:.2,transitionMs:500,reason:'existing composer'};
check('photo coordinates never increase counts or override V350 manual',()=>{
 const next=photos(photoBase,hook,{manual:false,lyricsActive:false});
 assert(next.visiblePhotos<=3);assert(next.photoMotion<=photoBase.photoMotion);
 assert.equal(next.photoOpacity,photoBase.photoOpacity);assert.equal(next.avoidLyricsX,photoBase.avoidLyricsX);
 assert.deepEqual(photos(photoBase,hook,{manual:true,lyricsActive:false}),photoBase);
 assert.deepEqual(photos(photoBase,null,{manual:false,lyricsActive:false}),photoBase);
 assert.equal(photos(photoBase,hook,{manual:false,lyricsActive:true}).visiblePhotos,1);
});
check('performance and track seek remain deterministic (25k samples)',()=>{
 for(let i=0;i<25000;i++){
  const idx=i%acts.length,a=acts[idx],positionMs=a.startMs+(i*719)% (a.endMs-a.startMs);
  const cue={...source.cue,act:idx,motif:a.motif,chapter:a.chapter,repetition:a.repetition};
  const at={...input,positionMs,narrative:{...source,cue},tier:i%2?'high':'balanced'};
  const a0=plan(at),a1=plan(at);assert.deepEqual(a0,a1);assert(a0.active);
  for(const k of ['strength','cameraRate','lightMultiplier','danceMultiplier','photoMotionMultiplier'])assert(Number.isFinite(a0[k]));
  assert(a0.cameraRate>=.65&&a0.cameraRate<=1);assert(a0.photoLimit>=1&&a0.photoLimit<=3);
 }
});
check('no new timers, network access, artificial beats or camera poses',()=>{
 const src=fs.readFileSync('components/visualizer/intelligentConcertFlowV654.ts','utf8');
 assert(!/fetch\(|setInterval\(|setTimeout\(|requestAnimationFrame\(|Math\.random\(|Date\.now\(|localStorage/.test(src));
});
check('flow really reaches existing camera, dance, light and photo pipelines',()=>{
 const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
 const avatar=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
 const cam=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
 const single=fs.readFileSync('components/visualizer/StageContentScreenV330.tsx','utf8');
 const multi=fs.readFileSync('components/visualizer/StageContentScreensV333.tsx','utf8');
 assert(stage.includes('planIntelligentConcertFlowV654('));assert(stage.includes('coordinateConcertDynamicsV654('));
 assert(stage.includes('coordinateUniversalConcertV669(directedDynamicsV654,universalShowV669)'));
 assert(stage.includes('directedDynamicsV670.lighting'));assert(stage.includes('directedDynamicsV670)'));
 assert(stage.includes('applyShowQualityGuardV670('));
 assert(stage.includes('concertFlowV654={concertFlowV654}'));assert(stage.includes('data-v654-flow='));
 assert(avatar.includes('concertFlowV654={props.concertFlowV654}'));
 assert(cam.includes('concertFlowRateV654')&&cam.includes('*concertFlowRateV654*'));
 assert(single.includes('coordinateConcertPhotosV654('));assert(multi.includes('concertFlowV654={concertFlowV654}'));
});
assert(Number(require('../package.json').version.match(/v(\d+)$/)?.[1])>=654);
console.log(`PASS V654: ${groups} groups, 25,000 deterministic act samples, verified flow across camera/dance/light/artist photos.`);
