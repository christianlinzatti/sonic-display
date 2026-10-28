'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planContinuousConcertV611:plan}=load('components/visualizer/continuousConcertExperienceV611');
const {planGenreConcertV610:genrePlan}=load('components/visualizer/genreConcertExperienceV610');
let groups=0;
const test=(name,fn)=>{try{fn();groups++}catch(error){error.message=`V611 ${name}: ${error.message}`;throw error}};
const acts=[
 {index:0,startMs:0,endMs:30000,section:'verse',chapter:'setup',motif:'portrait',repetition:0},
 {index:1,startMs:30000,endMs:48000,section:'build',chapter:'rise',motif:'ensemble',repetition:0},
 {index:2,startMs:48000,endMs:71000,section:'hook',chapter:'payoff',motif:'wide',repetition:0},
 {index:3,startMs:71000,endMs:101000,section:'verse',chapter:'develop',motif:'dialogue',repetition:1},
 {index:4,startMs:101000,endMs:123000,section:'hook',chapter:'payoff',motif:'ensemble',repetition:1},
 {index:5,startMs:123000,endMs:137000,section:'break',chapter:'respite',motif:'breath',repetition:0},
 {index:6,startMs:137000,endMs:168000,section:'drop',chapter:'payoff',motif:'wide',repetition:0},
 {index:7,startMs:168000,endMs:200000,section:'hook',chapter:'ending-arc',motif:'crescendo',repetition:2},
];
const original={trackId:'continuity-song',durationMs:200000,genre:'deutschrap',source:'verified-v600',acts,endingSupported:true};
const cue=(n,transition=1)=>({active:true,source:'verified-v600',act:n,chapter:acts[n].chapter,motif:acts[n].motif,repetition:acts[n].repetition,transition,dynamics:{dance:1,camera:1,lighting:1,lyrics:1}});
const input=(n=0,extra={})=>{
 const song=extra.narrative?.plan??original;
 const nc=extra.narrative?.cue??cue(n);
 const generic={narrative:{plan:song,cue:nc},trackId:'continuity-song',durationMs:200000,
   positionMs:(acts[n].startMs+acts[n].endMs)/2,section:acts[n].section,
   energy:.87,kick:.66,playing:true,reducedMotion:false,tier:'high',lyricsProtected:false,
   manualDance:false,manualCamera:false,manualLighting:false};
 const combined={...generic,...extra};
 const genreCue=genrePlan({...combined,genre:song.genre});
 return {...combined,genreCue,...(extra.genreCue?{genreCue:extra.genreCue}:{})};
};
const run=(n=0,extra={})=>plan(input(n,extra));
const neutral=run(0,{playing:false});
const gains=['dance','cameraDrift','cameraRate','key','fill','beam','spot','haze','sweep'];
test('Only validated same-song act activates',()=>{const a=run();assert(a.active);assert.equal(a.moment,'portrait');assert.equal(a.act,0)});
test('Intro portraits calm dance/camera/light but support face',()=>{const a=run(0);assert(a.dance<1&&a.cameraDrift<1&&a.beam<1&&a.haze<1&&a.key>1&&a.fill>1)});
test('Build grows without inventing a drop',()=>{const a=run(1,{energy:.18}),b=run(1,{energy:.95});assert(b.beam>a.beam);assert(b.dance>a.dance);assert.equal(a.moment,'build')});
test('First hook uses ensemble and a wider camera',()=>{const a=run(2);assert.equal(a.moment,'ensemble');assert(a.cameraFov>0);assert(a.beam>1)});
test('Second hook focuses spotlight and portrait',()=>{const a=run(2),b=run(4);assert.equal(b.moment,'spotlight');assert(b.spot>a.spot);assert(b.cameraFov<a.cameraFov)});
test('Quiet break reduces dance and decorative FX',()=>{const a=run(5);assert.equal(a.moment,'respite');assert(a.dance<1&&a.sweep<1&&a.haze<1)});
test('Supported drop can accent live kick',()=>{const a=run(6);assert.equal(a.moment,'drop');assert(a.beam>1&&a.dance>1)});
test('Unsupported drop produces no extra V611 accent',()=>{for(const overrides of [{kick:.01},{energy:.01}]){const a=run(6,overrides);for(const k of gains)assert.equal(a[k],1,k);assert.equal(a.cameraFov,0)}});
test('Finale requires V604 evidence',()=>{const a=run(7);assert.equal(a.moment,'finale');assert(a.beam>1&&a.cameraFov>0)});
test('Last labelled drop without measured kick never becomes fake finale',()=>{const dropEnd={...acts[7],section:'drop'};const song={...original,acts:[...acts.slice(0,7),dropEnd]};const a=run(7,{narrative:{plan:song,cue:{...cue(7),section:'drop'}},section:'drop',kick:0});for(const k of gains)assert.equal(a[k],1,k);assert.equal(a.cameraFov,0)});
test('No fake finale if ending is unconfirmed',()=>{const a=run(7,{narrative:{plan:{...original,endingSupported:false},cue:cue(7)}});assert.equal(a.moment,'ensemble')});
test('No fake finale if act no longer last',()=>{const a=run(7,{narrative:{plan:{...original,acts:[...acts,{...acts[7],index:8,startMs:200000,endMs:202000}]},cue:cue(7)}});assert.notEqual(a.moment,'finale')});
test('Signed modulation fades to neutral at scene edge',()=>{const a=run(2,{narrative:{plan:original,cue:cue(2,0)}});for(const k of gains)assert.equal(a[k],1,k);assert.equal(a.cameraFov,0)});
test('Same act/frame sampling is deterministic and immutable',()=>{const a=input(4);const before=JSON.stringify(a);assert.deepEqual(plan(a),plan(a));assert.equal(JSON.stringify(a),before)});
test('Missing narrative neutral',()=>assert.deepEqual(run(2,{narrative:null}),neutral));
test('Unverified source neutral',()=>assert.deepEqual(run(2,{narrative:{plan:{...original,source:'unavailable'},cue:cue(2)}}),neutral));
test('Inactive cue neutral',()=>assert.deepEqual(run(2,{narrative:{plan:original,cue:{...cue(2),active:false}}}),neutral));
test('Foreign spotify track neutral',()=>assert.deepEqual(run(2,{trackId:'wrong-song'}),neutral));
test('Foreign track duration neutral',()=>assert.deepEqual(run(2,{durationMs:100000}),neutral));
test('Incorrect section neutral',()=>assert.deepEqual(run(2,{section:'verse'}),neutral));
test('Genre source not confirmed neutral',()=>assert.deepEqual(run(2,{genreCue:{...input(2).genreCue,active:false}}),neutral));
test('Unknown/disabled V610 genre neutral',()=>{const i=input(2);assert.deepEqual(plan({...i,genreCue:{...i.genreCue,genre:null}}),neutral)});
test('Invalid offsets neutral',()=>{for(const t of [-10,NaN,Infinity,200001,acts[4].startMs])assert.deepEqual(run(2,{positionMs:t}),neutral)});
test('Invalid indices neutral',()=>{for(const n of [-1,8,1.5,NaN,Infinity])assert.deepEqual(run(2,{narrative:{plan:original,cue:{...cue(2),act:n}}}),neutral)});
test('Mismatch chapter, motif or repetition neutral',()=>{for(const override of [{chapter:'respite'},{motif:'portrait'},{repetition:5}])assert.deepEqual(run(2,{narrative:{plan:original,cue:{...cue(2),...override}}}),neutral)});
test('Invalid evidence amplitudes neutral',()=>{for(const x of [-1,2,NaN,Infinity]){assert.deepEqual(run(2,{energy:x}),neutral);assert.deepEqual(run(2,{kick:x}),neutral)}});
test('Invalid transition neutral',()=>{for(const n of [-.1,1.01,NaN,Infinity])assert.deepEqual(run(2,{narrative:{plan:original,cue:cue(2,n)}}),neutral)});
test('No playback or reduced motion remains neutral',()=>{assert.deepEqual(run(2,{playing:false}),neutral);assert.deepEqual(run(2,{reducedMotion:true}),neutral)});
test('Low tier remains neutral',()=>assert.deepEqual(run(2,{tier:'low'}),neutral));
test('Balanced tier reduces accents',()=>{const high=run(2),balanced=run(2,{tier:'balanced'});assert(Math.abs(balanced.cameraFov)<Math.abs(high.cameraFov));assert(Math.abs(balanced.beam-1)<Math.abs(high.beam-1))});
test('Lyrics density suppresses moving beams and haze',()=>{const a=run(2),b=run(2,{lyricsProtected:true});assert(b.beam<=1&&b.haze<=1);assert(Math.abs(b.cameraFov)<Math.abs(a.cameraFov))});
test('Manual dance remains untouched independently',()=>{const a=run(2,{manualDance:true});assert.equal(a.dance,1);assert(a.beam>1&&a.cameraFov>0)});
test('Manual camera remains untouched independently',()=>{const a=run(2,{manualCamera:true});assert.equal(a.cameraDrift,1);assert.equal(a.cameraRate,1);assert.equal(a.cameraFov,0);assert(a.dance>1)});
test('Manual lights remain untouched independently',()=>{const a=run(2,{manualLighting:true});for(const k of ['key','fill','beam','spot','haze','sweep'])assert.equal(a[k],1);assert(a.cameraFov>0)});
test('All manual lanes have exact neutral gains',()=>{const a=run(2,{manualLighting:true,manualCamera:true,manualDance:true});for(const k of gains)assert.equal(a[k],1);assert.equal(a.cameraFov,0)});
test('Verified mid-section phrase remains bounded',()=>{const a=run(2,{positionMs:acts[2].startMs+5000});assert(Number.isFinite(a.beam))});
test('No additional render loops, fetch, shader or lights',()=>{const s=fs.readFileSync('components/visualizer/continuousConcertExperienceV611.ts','utf8');assert.doesNotMatch(s,/useFrame\(|fetch\(|requestAnimationFrame\(|new SpotLight|new ShaderMaterial|setInterval\(|Date\.now\(/)});
test('Live song DOM includes verifiable V611 stage story metadata',()=>{const s=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');assert(s.includes('data-v611-story={concertContinuityV611.moment}'));assert(s.includes('data-v611-act={concertContinuityV611.act}'))});
test('All four live stage files invoke V611 from verified narrative and V610 cue',()=>{for(const f of ['VisualizerStage.tsx','DynamicStage.tsx','ConcertAtmosphereRendererV308.tsx','StageCameraDirectorV289.tsx']){const s=fs.readFileSync('components/visualizer/'+f,'utf8');assert(s.includes('planContinuousConcertV611({'),f);assert(s.includes('genreCue:concertGenreV610'),f);assert(s.includes('concertContinuityV611.'),f)}});
test('Camera v611 tweaks only the previous automatic guarded frame',()=>{const s=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');assert(s.indexOf('const genreFramedV610=')<s.indexOf('guardAutomaticCameraV351(composedV620'));assert(s.includes('concertContinuityV611.cameraFov'));assert(s.includes('concertContinuityV611.cameraRate'))});
test('Dance V611 never changes manual clip speed or choreography',()=>{const s=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');assert(s.includes('motionEnergy*concertGenreV610.dance*concertContinuityV611.dance'));assert(s.includes('(motionStore.automatic?concertContinuityV611.dance:1)'))});
test('Existing lighting budget and blackouts remain final',()=>{const s=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');assert(s.includes('Math.min(3,Math.max('));assert(s.includes('concertContinuityV611.beam'));const a=fs.readFileSync('components/visualizer/ConcertAtmosphereRendererV308.tsx','utf8');assert(a.includes('Math.min(.3,frame.leftOpacity'));assert(a.includes('concertContinuityV611.haze'))});
let frames=0;
for(let i=0;i<30000;i++){
 const n=i%acts.length,act=acts[n],genre=['deutschrap','hardstyle','hardtekk'][i%3];
 const song={...original,genre};
 const p=act.startMs+((i*2749)%(act.endMs-act.startMs));
 const a=run(n,{positionMs:p,narrative:{plan:song,cue:cue(n,Math.min(1,(Math.min(p-act.startMs,act.endMs-p)/2400)))},
  energy:(i%100)/99,kick:(i%51)/50,tier:i%4===0?'balanced':'high',lyricsProtected:i%9===0});
 for(const k of gains){assert(Number.isFinite(a[k]),k);assert(a[k]>=.93&&a[k]<=1.06,`${k}:${a[k]}`)}
 assert(Math.abs(a.cameraFov)<=.35);frames++;
}
test('30,000 bounded song snapshots',()=>assert.equal(frames,30000));
console.log(`PASS V611: ${groups} test groups and ${frames} concert snapshots.`);
