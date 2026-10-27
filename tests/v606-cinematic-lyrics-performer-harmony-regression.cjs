'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planConcertLyricsHarmonyV606:plan,lyricHarmonyWordAccentV606:word,
  composeConcertHarmonyCameraV606:compose,activeLyricLineV606:active}=load('components/visualizer/concertLyricsPerformerHarmonyV606');
const {measureConcertFrameV550:measure}=load('components/visualizer/cinematicConcertCameraV550');
const {measureScreenFrameV540:screen}=load('components/visualizer/cinematicCameraCompositionV540');
let n=0;
function test(label,fn){try{fn();n++}catch(e){e.message=`V606 ${label}: ${e.message}`;throw e;}}
const scene={active:true,trackId:'song',count:2,focus:'handoff',leadSlot:1,
  singingSlots:[0,1],handoffFrom:0,cueStartMs:0,cueEndMs:12000,strength:.6};
const cue={active:true,source:'verified-v600',act:1,chapter:'payoff',motif:'wide',repetition:0,transition:.8};
const line={startMs:0,endMs:12000,text:'Wir stehen hier und singen gemeinsam auf dieser Bühne',words:[
  {text:'Wir',startMs:0,endMs:900},{text:'stehen',startMs:900,endMs:1950},
  {text:'hier',startMs:1950,endMs:2700},{text:'und',startMs:2700,endMs:3450},
  {text:'singen',startMs:3450,endMs:5100},{text:'gemeinsam',startMs:5100,endMs:7150},
  {text:'auf',startMs:7150,endMs:7800},{text:'dieser',startMs:7800,endMs:9000},
  {text:'Bühne',startMs:9000,endMs:12000}]};
const denseLine={...line,text:(line.text+' ').repeat(3)};
const input={line,progressMs:5500,playing:true,synchronized:true,reducedMotion:false,
  immersive:true,cast:2,trackId:'song',scene,cue,hookSection:true,wordHighlight:true};
const p=(extra={})=>plan({...input,...extra});
const off={...input,playing:false};
test('requires synced lyrics',()=>assert.equal(p({synchronized:false}).active,false));
test('paused returns quiet',()=>assert.deepEqual(plan(off).active,false));
test('reduced motion retains legibility',()=>{const x=p({reducedMotion:true});assert(x.active&&x.plateBoost>0&&x.hookAccent===0&&x.motionGain===1)});
test('no lines returns quiet',()=>assert.equal(p({line:null}).active,false));
test('end boundary ends lyric',()=>assert.equal(p({progressMs:12000}).active,false));
test('negative time ends lyric',()=>assert.equal(p({progressMs:-1}).active,false));
test('invalid time ends lyric',()=>assert.equal(p({progressMs:NaN}).active,false));
test('line next boundary clips accent',()=>assert.equal(p({nextLineStart:5000}).active,false));
test('hook requires verified section',()=>{assert.equal(p().mode,'hook');assert.notEqual(p({cue:null}).mode,'hook');assert.notEqual(p({cue:{...cue,source:'off'}}).mode,'hook');assert.notEqual(p({hookSection:false}).mode,'hook')});
test('unverified scene cannot name singers',()=>assert.equal(p({scene:{...scene,trackId:'another'}}).confirmedLead,false));
test('incorrect lead cannot name singers',()=>assert.equal(p({scene:{...scene,leadSlot:9}}).confirmedLead,false));
test('incorrect cast cannot name singers',()=>assert.equal(p({cast:3}).confirmedLead,false));
test('no handoff remains rap focus',()=>{const x=p({hookSection:false,scene:{...scene,focus:'lead',handoffFrom:null}});assert.equal(x.mode,'rap-focus');assert.equal(x.confirmedDuet,false)});
test('duet requires verified paired roles',()=>{assert.equal(p({hookSection:false}).mode,'duet');assert.equal(p({hookSection:false,scene:{...scene,singingSlots:[1]}}).confirmedDuet,false)});
test('very dense lyrics narrow and calm',()=>{const x=p({line:denseLine});assert(x.dense&&x.widthCh<48&&x.motionGain<p({line:{...line,text:"Schneller Rap"}}).motionGain)});
test('three or four performers keep narrower text',()=>{assert(p({cast:3,scene:null}).widthCh<=40);assert(p({cast:4,scene:null}).widthCh<=40)});
test('invalid cast disables harmony',()=>assert.equal(p({cast:6}).active,false));
test('word accents need actual word timestamps',()=>{assert(word(line,5,6000,p())>0);assert.equal(word(line,5,3000,p()),0);assert.equal(word(line,5,8000,p()),0)});
test('reduced motion disables decorative word glows',()=>{const x=p({reducedMotion:true});assert(!x.verifiedWords);assert.equal(word(line,5,6000,x),0)});
test('no timed words means no animation of pretend syllables',()=>{const x=p({line:{...line,words:undefined}});assert(!x.verifiedWords);assert.equal(word({...line,words:undefined},0,100,x),0)});
test('word highlights disabled means zero accents',()=>{const x=p({wordHighlight:false});assert(!x.verifiedWords);assert.equal(word(line,3,3000,x),0)});
test('out-of-order timestamp fails closed for words',()=>{const x=p({line:{...line,words:[line.words[1],line.words[0]]}});assert(!x.verifiedWords)});
test('no karaoke duration computed outside source',()=>assert.equal(word(line,1,900,p()),0));
const pose={x:0,y:1.1,z:7.8,targetX:0,targetY:.1,targetZ:0,fov:40};
const roots=[{slot:0,x:-.8,y:0,z:0,visible:true},{slot:1,x:.8,y:0,z:0,visible:true}];
const opts={trackId:'song',progressMs:5500,playing:true,reducedMotion:false,automatic:true,
 authored:false,aspect:16/9,quality:'high',lyricsProtected:true,lyricsSide:'right',cue};
const camera=(changes={},h=p(),r=roots,s=scene,v=pose)=>compose(v,h,r,s,{...opts,...changes});
test('authored camera returns EXACT same pose',()=>assert.strictEqual(camera({authored:true}),pose));
test('manual mode returns EXACT same pose',()=>assert.strictEqual(camera({automatic:false}),pose));
test('paused camera remains unchanged',()=>assert.strictEqual(camera({playing:false}),pose));
test('reduced motion camera remains unchanged',()=>assert.strictEqual(camera({reducedMotion:true}),pose));
test('low Pi quality camera remains unchanged',()=>assert.strictEqual(camera({quality:'low'}),pose));
test('no protected lyrics implies no camera correction',()=>assert.strictEqual(camera({lyricsProtected:false}),pose));
test('stale cue cannot move camera',()=>assert.strictEqual(camera({cue:{...cue,source:'off'}}),pose));
test('zero transition cue cannot move camera',()=>assert.strictEqual(camera({cue:{...cue,transition:0}}),pose));
test('no active lyrics cannot move camera',()=>assert.strictEqual(camera({},p({playing:false})),pose));
test('unverified roots cannot move camera',()=>assert.strictEqual(camera({},p(),[]),pose));
test('invisible roots cannot move camera',()=>assert.strictEqual(camera({},p(),[{...roots[0],visible:false},roots[1]]),pose));
test('duplicate roots cannot move camera',()=>assert.strictEqual(camera({},p(),[roots[0],roots[0]]),pose));
test('out of range aspect cannot move camera',()=>assert.strictEqual(camera({aspect:0}),pose));
test('NaN pose not modified',()=>assert.strictEqual(camera({},p(),roots,scene,{...pose,x:NaN}).x,NaN));
test('song line binary lookup ignores gaps, avoids array scans',()=>{
  const l=[line,{...line,startMs:15000,endMs:20000}];
  assert.equal(active(l,3000).line,line);assert.equal(active(l,12000),null);
  assert.equal(active(l,16000).line.startMs,15000);assert.equal(active(l,20000),null);
});
test('binary lookup rejects invalid time',()=>assert.equal(active([line],NaN),null));
test('source protects clocks and never fetches/creates camera',()=>{
  const s=fs.readFileSync('components/visualizer/concertLyricsPerformerHarmonyV606.ts','utf8');
  assert.doesNotMatch(s,/requestAnimationFrame|setInterval|setTimeout|Math\.random|localStorage|fetch\(|new PerspectiveCamera|document\.|window\./);
});
test('actual R3F camera pass is after V605 before V351 safety',()=>{
  const s=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
  assert(s.indexOf('composeFullSongCameraV605(duetFramedV585')<s.indexOf('composeConcertHarmonyCameraV606(framedV605'));
  assert(s.indexOf('composeConcertHarmonyCameraV606(framedV605')<s.indexOf('guardAutomaticCameraV351(genreFramedV610,composition)'));
  assert(s.includes('authored:authoredCameraV528||cameraNarrativeV605?.manualCamera===true'));
});
test('active DOM lyric line shares planner and V604 cue',()=>{
  const s=fs.readFileSync('components/KineticLyrics.tsx','utf8'),stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
  assert(s.includes('planConcertLyricsHarmonyV606'));assert(s.includes('lyricHarmonyWordAccentV606'));
  assert(stage.includes('fullSongCueV604={fullSongCueV604} immersive'));
  assert(s.includes('"--word-fill": `${(shownAmountV382 * 100).toFixed(1)}%`'));
});
let checks=0,accepted=0;
for(let ms=260;ms<11700;ms+=87)for(const quality of ['high','balanced'])for(const side of [null,'left','right']){
 const h=p({progressMs:ms,line:denseLine});const x=camera({progressMs:ms,quality,lyricsSide:side},h);
 const a=measure(pose,roots,opts.aspect,side,true),b=measure(x,roots,opts.aspect,side,true);
 const c=screen(pose,roots,opts.aspect,side),d=screen(x,roots,opts.aspect,side);
 assert(a&&b&&c&&d);
 assert(b.overflow<=a.overflow+1e-6&&b.headOverflow<=a.headOverflow+1e-6&&b.fullBodyOverflow<=a.fullBodyOverflow+1e-6);
 assert(d.overflow<=c.overflow+1e-6);
 assert(Math.abs(x.fov-pose.fov)<=.36);
 assert.deepEqual(x,camera({progressMs:ms,quality,lyricsSide:side},h));
 if(x!==pose)accepted++;checks++;
}
test('screen-safe deterministic samples',()=>assert(checks>500&&accepted>20,`${checks} ${accepted}`));
const pkg=require('../package.json');
test('release scripts and version',()=>{assert.match(pkg.version,/^0\.1\.0-v(?:60[6-9]|6[1-9][0-9])$/);assert(pkg.scripts['build:preflight'].includes('test:smoke:v606'));assert(pkg.scripts['test:smoke:v606'].includes('test:v605'));});
console.log(`PASS V606: ${n} test groups; ${checks} sampled camera frames; ${accepted} guarded refinements.`);
