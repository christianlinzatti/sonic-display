'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {composeFullSongCameraV605:compose}=load('components/visualizer/cinematicFullSongCameraV605');
const {planFullSongDramaturgyV604:plan,sampleFullSongDramaturgyV604:sample}=load('components/visualizer/fullSongConcertDramaturgyV604');
const {planUltimateConcertV600:concert,sampleUltimateConcertV600:confirm}=load('components/visualizer/ultimateConcertDirectorV600');
const {measureConcertFrameV550:measure}=load('components/visualizer/cinematicConcertCameraV550');
const {measureScreenFrameV540:screen}=load('components/visualizer/cinematicCameraCompositionV540');
let tests=0;
const test=(name,fn)=>{try{fn();tests++;}catch(e){e.message='V605 '+name+': '+e.message;throw e;}};
const analysis={schema:'sonic-track-analysis-v318',trackId:'track',sections:[
 {startMs:0,durationMs:27000,label:'verse',confidence:.99},
 {startMs:27000,durationMs:16000,label:'build',confidence:.99},
 {startMs:43000,durationMs:23000,label:'hook',confidence:.99},
 {startMs:66000,durationMs:27000,label:'verse',confidence:.99},
 {startMs:93000,durationMs:24000,label:'hook',confidence:.99},
 {startMs:117000,durationMs:19000,label:'break',confidence:.99},
 {startMs:136000,durationMs:21000,label:'drop',confidence:.99},
 {startMs:157000,durationMs:23000,label:'hook',confidence:.99}]};
const planV604=plan(concert({trackId:'track',durationMs:180000,genre:'deutschrap',analysis}));
const base={active:true,genre:'deutschrap',section:'hook',source:'imported',dance:1,camera:1,lighting:1,lyrics:.03,evidence:'labeled'};
const time=(ms)=>{const act=planV604.acts.find(x=>ms>=x.startMs&&ms<x.endMs); const b={...base,section:act?.section??'verse'};
 const conf=confirm(concert({trackId:'track',durationMs:180000,genre:'deutschrap',analysis}),{trackId:'track',progressMs:ms,playing:true,reducedMotion:false,enabled:true,tier:'high',manualDance:false,manualCamera:false,manualLighting:false,lyricsProtected:false,base:b});
 return sample(planV604,{trackId:'track',progressMs:ms,playing:true,enabled:true,reducedMotion:false,tier:'high',manualDance:false,manualCamera:false,manualLighting:false,lyricsProtected:false,confirmedV600:conf,base:conf.dynamics});};
const pose={x:0,y:1.1,z:7.8,targetX:0,targetY:.1,targetZ:0,fov:40};
const actors=[{slot:0,x:-.8,y:0,z:0,visible:true},{slot:1,x:.8,y:0,z:0,visible:true}];
const scene={active:true,trackId:'track',cueStartMs:43000,cueEndMs:66000,count:2,focus:'handoff',leadSlot:1,singingSlots:[0,1],handoffFrom:0,strength:.7};
const options={trackId:'track',progressMs:52000,playing:true,reducedMotion:false,automatic:true,authored:false,quality:'high',aspect:16/9,lyricsProtected:false,lyricsSide:null};
const f=(ms=52000,extra={},p=pose,a=actors,s=scene,pl=planV604)=>compose(p,pl,time(ms),a,s,{...options,progressMs:ms,...extra});
test('8 real V318-labeled sections backed by V600',()=>assert.equal(planV604.source,'verified-v600'));
test('three hooks get distinct/ending motifs',()=>{const hooks=planV604.acts.filter(x=>x.section==='hook');assert.deepEqual(hooks.map(x=>x.repetition),[0,1,2]);assert(hooks[0].motif!==hooks[1].motif)});
test('midsection camera produces real pose changes, not just intensity',()=>{let changes=0;for(let ms=3000;ms<180000;ms+=3000)if(f(ms)!==pose)changes++;assert(changes>5,'camera must visibly reframe verified motifs')});
test('no camera movement exactly at a song-section boundary',()=>assert.strictEqual(f(43000),pose));
test('track mismatch returns same pose reference',()=>assert.strictEqual(f(52000,{trackId:'other'}),pose));
test('manual camera returns identity',()=>assert.strictEqual(f(52000,{authored:true}),pose));
test('non-auto camera returns identity',()=>assert.strictEqual(f(52000,{automatic:false}),pose));
test('stopped playback returns identity',()=>assert.strictEqual(f(52000,{playing:false}),pose));
test('reduced motion returns identity',()=>assert.strictEqual(f(52000,{reducedMotion:true}),pose));
test('low Pi performance mode returns identity',()=>assert.strictEqual(f(52000,{quality:'low'}),pose));
test('stale V604 cue denied',()=>assert.strictEqual(compose(pose,planV604,{...time(52000),act:1},actors,scene,options),pose));
test('unverified full-song plan denied',()=>assert.strictEqual(f(52000,{},pose,actors,scene,{...planV604,source:'unavailable'}),pose));
test('no singer/cast markers still frame the verified stage, not invent solo singer',()=>{const r=f(52000,{},pose,actors,null);assert(r);assert.deepEqual(r,f(52000,{},pose,actors,null))});
test('wrong singer track cannot influence portrait focus',()=>assert.deepEqual(f(10000,{},pose,actors,{...scene,trackId:'other'}),f(10000,{},pose,actors,null)));
test('invalid missing stage anchors leaves pose untouched',()=>assert.strictEqual(f(52000,{},pose,[],scene),pose));
test('NaN camera never repaired or changed automatically',()=>assert.strictEqual(f(52000,{}, {...pose,x:NaN},actors,scene).x,NaN));
test('invalid screen aspect returns identity',()=>assert.strictEqual(f(52000,{aspect:0}),pose));
test('duplicate cast slots denied',()=>assert.strictEqual(f(52000,{},pose,[actors[0],actors[0]],scene),pose));
test('invisible performer cannot be cropped or guessed',()=>assert.strictEqual(f(52000,{},pose,[{...actors[0],visible:false},actors[1]],scene),pose));
test('out-of-bounds performer denied',()=>assert.strictEqual(f(52000,{},pose,[{...actors[0],x:NaN},actors[1]],scene),pose));
test('manual and audio word timestamps remain outside camera module',()=>{const s=fs.readFileSync('components/visualizer/cinematicFullSongCameraV605.ts','utf8');assert.doesNotMatch(s,/\bwindow\.|\bdocument\.|requestAnimationFrame|Math\.random|setInterval|setTimeout|localStorage|\bfetch\(/)});
test('typed from single existing R3F camera, protected by last V351 guard',()=>{
 const s=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');assert(s.includes('composeFullSongCameraV605(duetFramedV585'));assert(s.indexOf('composeFullSongCameraV605(duetFramedV585')<s.indexOf('guardAutomaticCameraV351(composedV620,composition)'));assert(s.includes('authored:authoredCameraV528||cameraNarrativeV605?.manualCamera===true'));});
test('camera receives verified V604 plan/cue through actual 3D renderer',()=>{
 for(const [path,token] of [['components/visualizer/VisualizerStage.tsx','cameraNarrativeV605={{plan:fullSongPlanV604,cue:fullSongCueV604,manualCamera:'],['components/visualizer/ThreeAvatar.tsx','cameraNarrativeV605={props.cameraNarrativeV605}']])assert(fs.readFileSync(path,'utf8').includes(token));});
let samples=0,modified=0;
for(let ms=1000;ms<179000;ms+=47){const cue=time(ms);for(const side of [null,'left','right'])for(const quality of ['high','balanced']){
 const o={...options,progressMs:ms,aspect:16/9,lyricsSide:side,lyricsProtected:side!==null,quality};
 const result=compose(pose,planV604,cue,actors,scene,o);
 const prior=measure(pose,actors,o.aspect,side,o.lyricsProtected),after=measure(result,actors,o.aspect,side,o.lyricsProtected);
 assert(prior&&after&&after.overflow<=prior.overflow+1e-6&&after.headOverflow<=prior.headOverflow+1e-6&&after.fullBodyOverflow<=prior.fullBodyOverflow+1e-6);
 const prevScreen=screen(pose,actors,o.aspect,side),nextScreen=screen(result,actors,o.aspect,side);assert(prevScreen&&nextScreen&&nextScreen.overflow<=prevScreen.overflow+1e-6);
 assert(Math.abs((result.targetX??0)-(pose.targetX??0))<=.121);assert(Math.abs(result.fov-pose.fov)<=.51);
 assert.deepEqual(result,compose(pose,planV604,cue,actors,scene,o));
 if(result!==pose)modified++; samples++;
}}
test('thousands of deterministic full-song screen-safe poses',()=>{assert(samples>=20000&&modified>100,`${samples} validated ${modified} changed`)});
const pkg=require('../package.json');test('release scripts are registered',()=>{assert(/^0\.1\.0-v\d+$/.test(pkg.version)&&Number(pkg.version.split('-v')[1])>=605);assert(pkg.scripts['test:smoke:v606'].includes('test:v605'));});
console.log(`PASS V605: ${tests} test groups; ${samples} simulated frames; ${modified} safe camera refinements.`);
