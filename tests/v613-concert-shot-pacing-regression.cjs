'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planConcertShotPacingV613:plan,composeConcertShotPacingV613:compose}=load('components/visualizer/concertShotPacingV613');
const {measureConcertFrameV550:measure}=load('components/visualizer/cinematicConcertCameraV550');
const {measureScreenFrameV540:screen}=load('components/visualizer/cinematicCameraCompositionV540');
let groups=0;
const test=(name,fn)=>{try{fn();groups++;}catch(e){e.message=`V613 ${name}: ${e.message}`;throw e;}};
const acts=[
 {index:0,startMs:0,endMs:28000,section:'verse',chapter:'setup',motif:'portrait',repetition:0},
 {index:1,startMs:28000,endMs:46000,section:'build',chapter:'rise',motif:'ensemble',repetition:0},
 {index:2,startMs:46000,endMs:73000,section:'hook',chapter:'payoff',motif:'wide',repetition:0},
 {index:3,startMs:73000,endMs:103000,section:'verse',chapter:'develop',motif:'dialogue',repetition:1},
 {index:4,startMs:103000,endMs:132000,section:'hook',chapter:'payoff',motif:'ensemble',repetition:1},
 {index:5,startMs:132000,endMs:148000,section:'break',chapter:'respite',motif:'breath',repetition:0},
 {index:6,startMs:148000,endMs:172000,section:'drop',chapter:'payoff',motif:'wide',repetition:0},
 {index:7,startMs:172000,endMs:200000,section:'hook',chapter:'ending-arc',motif:'crescendo',repetition:2},
];
const song={trackId:'s',durationMs:200000,genre:'deutschrap',source:'verified-v600',endingSupported:true,acts};
const cue=n=>({active:true,source:'verified-v600',act:n,chapter:acts[n].chapter,motif:acts[n].motif,repetition:acts[n].repetition,transition:1});
const pose={x:0,y:1.1,z:7.8,targetX:0,targetY:.1,targetZ:0,fov:40};
const anchors=[{slot:0,x:-.9,y:0,z:0,visible:true},{slot:1,x:.9,y:0,z:0,visible:true}];
const singer={active:true,trackId:'s',cueStartMs:0,cueEndMs:200000,count:2,
 focus:'verse',leadSlot:1,singingSlots:[1],handoffFrom:null,strength:.7};
const opts=(ms=53000,extra={})=>({trackId:'s',progressMs:ms,playing:true,reducedMotion:false,
 automatic:true,authored:false,quality:'high',aspect:16/9,lyricsProtected:false,
 lyricsSide:null,energy:.85,kick:.7,...extra});
const idx=ms=>acts.findIndex(a=>ms>=a.startMs&&ms<a.endMs);
const run=(ms=53000,extra={},p=pose,roots=anchors,scene=singer,pl=song,c=cue(idx(ms)))=>
 compose(p,pl,c,roots,scene,opts(ms,extra));
test('Whole-song planner needs verified evidence',()=>{assert(plan(song,cue(2),opts()).active);assert(!plan({...song,source:'unavailable'},cue(2),opts()).active);});
test('Sustained multi-second holds not frame-speed oscillation',()=>{
 const shots=new Set();for(let t=46000;t<73000;t+=1000){shots.add(plan(song,cue(2),opts(t)).slot);}
 assert(shots.size>=2&&shots.size<=4);assert.equal(plan(song,cue(2),opts(52000)).shot,plan(song,cue(2),opts(53000)).shot);
});
test('Repeated hooks have different planned shot vocabulary',()=>{
 const a=plan(song,cue(2),opts(52000)),b=plan(song,cue(4),opts(110000));assert(a.active&&b.active);assert(a.shot!==b.shot||a.previous!==b.previous);
});
test('Boundary fade to exact original pose',()=>{for(const ms of [0,28000,46000,73000,103000,132000,148000,172000])assert.strictEqual(run(ms),pose);});
test('No fake drop without measured energy and kick',()=>{assert(!plan(song,cue(6),opts(159000,{kick:0})).active);assert(!plan(song,cue(6),opts(159000,{energy:0})).active);});
test('Manual/editor, paused, reduced motion, low tier all preserve pose identity',()=>{
 for(const overrides of [{automatic:false},{authored:true},{playing:false},{reducedMotion:true},{quality:'low'}])assert.strictEqual(run(55000,overrides),pose);
});
test('Foreign track, stale cue, invalid offset fail closed',()=>{
 assert.strictEqual(run(55000,{trackId:'other'}),pose);
 assert.strictEqual(run(55000,{},pose,anchors,singer,song,cue(0)),pose);
 for(const t of [NaN,-1,Infinity,200000])assert(!plan(song,cue(2),opts(t)).active);
});
test('Invalid loudness, aspect, and transition fail closed',()=>{
 for(const energy of [NaN,-.1,1.1,Infinity])assert(!plan(song,cue(2),opts(55000,{energy})).active);
 for(const aspect of [0,NaN,5])assert.strictEqual(run(55000,{aspect}),pose);
 assert.strictEqual(run(55000,{},pose,anchors,singer,song,{...cue(2),transition:0}),pose);
});
test('No unverified performer used for a portrait',()=>{
 const one=run(9000,{},pose,anchors,null),wrong=run(9000,{},pose,anchors,{...singer,trackId:'other'});
 assert.deepEqual(one,wrong);
});
test('Malformed or stale vocalist cue cannot steal the portrait',()=>{
 for(const role of [{...singer,singingSlots:undefined},{...singer,leadSlot:3},
     {...singer,cueEndMs:0},{...singer,count:4}]){
   assert.deepEqual(run(9000,{},pose,anchors,role),run(9000,{},pose,anchors,null));
 }
});
test('Missing, invisible, duplicate or nonfinite anchors cause exact no-op',()=>{
 for(const roots of [[],[{...anchors[0],visible:false},anchors[1]],[anchors[0],anchors[0]],[{...anchors[0],x:NaN},anchors[1]]])assert.strictEqual(run(55000,{},pose,roots),pose);
});
test('Dense lyrics never cause V613 camera pan',()=>{
 const result=run(55000,{lyricsProtected:true,lyricsSide:'right'});assert.equal(result.targetX??0,pose.targetX);
});
test('Conservative measurable poses do get changed when supported',()=>{
 let edited=0;for(let ms=1000;ms<200000;ms+=300){if(run(ms)!==pose)edited++;}
 assert(edited>5,`Only ${edited} changed poses`);
});
test('Camera wiring is between V606 and V610 and before final V351 guard',()=>{
 const s=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
 assert(s.includes('composeConcertShotPacingV613(framedV606'));
 assert(s.indexOf('const framedV606=')<s.indexOf('const framedV613=composeConcertShotPacingV613('));
 assert(s.indexOf('const framedV613=')<s.indexOf('const genreFramedV610='));
 assert(s.indexOf('const framedV613=')<s.indexOf('guardAutomaticCameraV351(composedV620,composition)'));
 assert(s.includes('authored:!!(authoredCameraV528||cameraNarrativeV605?.manualCamera'));
});
test('No new timing mechanisms, singer identification, WebGL lights or render loops',()=>{
 const s=fs.readFileSync('components/visualizer/concertShotPacingV613.ts','utf8');
 assert.doesNotMatch(s,/requestAnimationFrame\s*\(|\buseFrame\s*\(|\bfetch\s*\(|Date\.now\s*\(|Math\.random\s*\(|new SpotLight\s*\(|setInterval\s*\(|setTimeout\s*\(/);
});
let samples=0,modified=0;
for(let ms=10;ms<199990;ms+=79){const n=idx(ms);if(n<0)continue;
 for(const side of [null,'left','right'])for(const quality of ['high','balanced']){
 const o=opts(ms,{lyricsProtected:side!==null,lyricsSide:side,quality});
 const result=compose(pose,song,cue(n),anchors,singer,o);
 const before=measure(pose,anchors,o.aspect,side,side!==null),after=measure(result,anchors,o.aspect,side,side!==null);
 const sb=screen(pose,anchors,o.aspect,side),sa=screen(result,anchors,o.aspect,side);
 assert(before&&after&&sb&&sa);
 assert(after.overflow<=before.overflow+1e-6&&after.headOverflow<=before.headOverflow+1e-6&&after.fullBodyOverflow<=before.fullBodyOverflow+1e-6);
 assert(sa.overflow<=sb.overflow+1e-6);
 assert(Number.isFinite(result.x)&&Number.isFinite(result.fov));
 assert(Math.abs((result.targetX??0)-(pose.targetX??0))<=.086);
 assert(Math.abs(result.fov-pose.fov)<=.53);
 assert.deepEqual(result,compose(pose,song,cue(n),anchors,singer,o));
 if(result!==pose)modified++;samples++;
}}
test('Screen-safe deterministic full-song sample series',()=>{assert(samples>12000);assert(modified>100,`${samples}/${modified}`);});
console.log(`PASS V613: ${groups} test groups, ${samples} full-song snapshots, ${modified} bounded reframings.`);
