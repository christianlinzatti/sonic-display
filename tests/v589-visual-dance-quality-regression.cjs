'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {inspectSampledMotionV534,compareMotionTransitionV534}=load('components/visualizer/advancedMotionInspectorV534');
const {buildVisualDanceReviewV589,emptyVisualDanceChecklistV589,visualDanceReviewStatusV589,exportDanceReviewV589}=load('components/visualizer/visualDanceReviewV589');
const {probeLongSongQualityV589}=load('components/visualizer/longSongQualityProbeV589');
const P=(x,y,z)=>({x,y,z});
const scene=(time,footX)=>({time,hips:P(0,1,0),leftFoot:P(footX,0,0),rightFoot:P(0,0,0)});
let groups=0;
function test(label,fn){try{fn();groups++;}catch(e){e.message=`V589: ${label}: ${e.message}`;throw e;}}
const make=(pose,transition=null)=>({clipName:'Dance_RapTwoStep',source:'original-glb',pose,
 keyframes:{name:'Dance_RapTwoStep',duration:2,score:80,sampledTracks:40,keyframes:500,issues:[]},
 curveEvents:[],transition,transitionCurveDegrees:null,transitionTo:transition?'Dance_ClubGroove':null,summary:'Prüfen'});
const stationary=inspectSampledMotionV534(Array.from({length:49},(_,i)=>scene(i/24,0)),1.8);
const sliding=inspectSampledMotionV534(Array.from({length:49},(_,i)=>scene(i/24,i/24)),1.8);
test('real V534 original pose sampler feeds the new timeline',()=>{const review=buildVisualDanceReviewV589(make(sliding),2);assert(review.flags.some(f=>f.kind==='possible-foot-slide'));assert(review.validFootSamples);assert(review.counts.slides>0);});
test('no automatic pass even with clean original pose track',()=>{const r=buildVisualDanceReviewV589(make(stationary),2);assert.equal(r.flags.length,0);assert.equal(r.needsVisualReview,true);assert.match(r.disclaimer,/kein automatischer Beweis/i);});
test('unknown feet is explicitly not measured',()=>{const pose=inspectSampledMotionV534([{time:0,hips:P(0,1,0)},{time:.1,hips:P(0,1,0)}],1.8);const r=buildVisualDanceReviewV589(make(pose),2);assert.equal(r.validFootSamples,false);assert.equal(r.counts.slides,0);});
test('actual foot probes do not pretend recognized contacts',()=>{const r=buildVisualDanceReviewV589(make(sliding),2);assert.match(r.disclaimer,/geschätzt/);assert.equal(r.coverage,'sampled-rig');});
test('high contrast next-clip transition gets timed review at duration',()=>{
 const big=compareMotionTransitionV534(scene(2,0),{time:0,hips:P(0,1,0),leftFoot:P(2,0,0),rightFoot:P(0,0,0)},1.8);
 assert.equal(big.status,'high-contrast');const r=buildVisualDanceReviewV589(make(stationary,big),2);
 assert(r.flags.some(f=>f.kind==='clip-transition'&&f.importance==='check'&&f.atSeconds===2));
 assert(r.crossfadeSeconds>0);assert.equal(r.counts.transitionChecks,1);
});
test('smooth transition is still human-reviewed, without false marker',()=>{
 const t=compareMotionTransitionV534(scene(2,0),scene(0,0),1.8);
 const r=buildVisualDanceReviewV589(make(stationary,t),2);
 assert.equal(r.counts.transitionChecks,0);assert(r.needsVisualReview);
});
test('flag ordering and bounded marker cap',()=>{
 const fake=make(stationary);fake.curveEvents=Array.from({length:200},(_,i)=>({atSeconds:i/60,kind:'rotation-step',severity:'warning',detail:'Curve',track:'spine',autoFixable:false}));
 const r=buildVisualDanceReviewV589(fake,2,11);assert.equal(r.flags.length,11);
 assert(r.flags.every(f=>f.atSeconds>=0&&f.atSeconds<=2));
 for(let i=1;i<r.flags.length;i++)assert(r.flags[i].atSeconds>=r.flags[i-1].atSeconds);
});
test('invalid cursor values cannot escape bounds and NaN is dropped',()=>{
 const fake=make(stationary);fake.curveEvents=[{atSeconds:NaN,severity:'warning',detail:'?',track:'x'},{atSeconds:10_000,severity:'warning',detail:'over',track:'y'}];
 const r=buildVisualDanceReviewV589(fake,2);assert.equal(r.flags.length,1);assert.equal(r.flags[0].atSeconds,2);
});
test('zero/invalid duration produce safe empty interval',()=>{
 const fake=make(sliding);const r=buildVisualDanceReviewV589(fake,NaN);assert.equal(r.durationSeconds,0);
 assert(r.flags.every(f=>f.atSeconds===0));
});
test('negative or infinite source times are dropped',()=>{
 const fake=make(stationary);fake.curveEvents=[{atSeconds:-1,severity:'warning',detail:'no',track:'x'},{atSeconds:Infinity,severity:'warning',detail:'no',track:'x'}];
 assert.equal(buildVisualDanceReviewV589(fake,2).flags.length,0);
});
test('user must explicitly confirm 3 real checks for single GLB clip',()=>{
 const c=emptyVisualDanceChecklistV589();assert.equal(visualDanceReviewStatusV589(c,false).completed,false);
 assert.equal(visualDanceReviewStatusV589({...c,motionSeen:true,footContactSeen:true,fullSongSeen:true},false).completed,true);
});
test('transition requires additional manual signoff',()=>{
 const c={motionSeen:true,footContactSeen:true,transitionSeen:false,fullSongSeen:true};
 assert.equal(visualDanceReviewStatusV589(c,true).completed,false);
 assert.equal(visualDanceReviewStatusV589({...c,transitionSeen:true},true).stepsDone,4);
});
test('export is explicit record and retains honest limitations',()=>{
 const data=exportDanceReviewV589(buildVisualDanceReviewV589(make(sliding),2),emptyVisualDanceChecklistV589(),false);
 assert.equal(data.format,'sonic-v589-visual-dance-review');assert.equal(data.originalGlbUntouched,true);
 assert.equal(data.visualReview.completed,false);assert.match(data.limitations,/Skelett/);
});
const clip=(name,cat='')=>({name:`${name}${cat}`,duration:2.2,trackCount:36});
const clips=[...Array.from({length:15},(_,i)=>clip(`Rap_${i}`)),...Array.from({length:11},(_,i)=>clip(`Dance_${i}`)),...Array.from({length:10},(_,i)=>clip(`Hardstyle_Stomp_${i}`)),...Array.from({length:5},(_,i)=>clip(`Idle_${i}`))];
const probe=(changes={})=>probeLongSongQualityV589(clips,{minutes:4,bpm:110,genre:'Deutschrap',modelKey:'avatar-x',...changes});
test('4 min rehearsal uses actual GLB clip metadata and V588 selector',()=>{
 const p=probe();assert(p.totalWindows>=10&&p.totalWindows<40);assert(p.uniqueClips>=2);assert.equal(p.mode,'hypothetical-not-playback');
 assert(p.entries.every(e=>e.clipIndex===null||clips[e.clipIndex]?.name===e.clipName));
});
test('stable rehearsal ignores call history, only supplied user parameters count',()=>{
 assert.deepEqual(probe(),probe());probe({bpm:150});assert.deepEqual(probe(),probe());
});
test('clamps unreasonable clock and handles invalid BPM without NaN',()=>{
 for(const x of [{minutes:Infinity,bpm:NaN},{minutes:-5,bpm:-300},{minutes:999,bpm:900}]){
  const p=probe(x);assert(p.totalWindows>0&&p.totalWindows<=50);
  assert(p.entries.every(e=>Number.isFinite(e.atSeconds)));
 }
});
test('empty, invalid and single-clip libraries never claim good performance',()=>{
 for(const source of [[],[clip('Only')],[{name:'Broken',duration:0,trackCount:0}]]){
  const p=probeLongSongQualityV589(source,{minutes:4,bpm:110,genre:'Deutschrap',modelKey:'s'});
  assert.equal(p.unavailableWindows,p.totalWindows);assert.equal(p.uniqueClips,0);
 }
});
test('song section coverage is sample only not real Spotify analysis',()=>{
 const p=probe();assert(p.entries.some(e=>e.section==='hook'));assert(p.entries.some(e=>e.section==='verse'));
 assert.match(p.note,/kein echter Track/);assert.equal(p.mode,'hypothetical-not-playback');
});
test('2-8 min coverage with data from many imported clips',()=>{
 for(let minutes=2;minutes<=8;minutes++){
  const p=probe({minutes});assert(p.totalWindows>0&&p.totalWindows<=50);
  assert(p.entries.every(e=>e.atSeconds>=0&&e.atSeconds<minutes*60));
 }
});
test('all sources read only: GLB clips and source report unchanged',()=>{
 const original=JSON.stringify(clips);const report=make(sliding),snapshot=JSON.stringify(report);
 probe();buildVisualDanceReviewV589(report,2);
 assert.equal(JSON.stringify(clips),original);assert.equal(JSON.stringify(report),snapshot);
});
test('distinct tempo or genre inputs influence the rehearsal where candidates exist',()=>{
 const rap=probe({genre:'Deutschrap'}),hard=probe({genre:'Hardstyle',bpm:145});
 assert.notDeepEqual(rap.entries,hard.entries);
});
test('rehearsal never loads remote files or creates mixers',()=>{
 const code=fs.readFileSync('components/visualizer/longSongQualityProbeV589.ts','utf8');
 for(const phrase of ['planLongFormChoreographyV588','suggestMotionCategoryV535','hypothetical-not-playback'])assert(code.includes(phrase));
 assert(!/fetch\(|AnimationMixer\(|GLTFLoader\(|window\./.test(code));
});
test('wired to real GLB import and installed Motion Quality Studio',()=>{
 const importer=fs.readFileSync('components/CharacterMotionBatchInstaller.tsx','utf8');
 const studio=fs.readFileSync('components/visualizer/MotionQualityOptimizerDashboard.tsx','utf8');
 const ui=fs.readFileSync('components/visualizer/VisualDanceReviewPanelV589.tsx','utf8');
 const preview=fs.readFileSync('components/visualizer/MotionQualityPreviewV321.tsx','utf8');
 for(const token of ['VisualDanceReviewPanelV589','advancedPanelV534','onSeek={seconds=>setPreviewSeekV534','inspectAdvancedMotionV534'])assert(importer.includes(token));
 for(const token of ['VisualDanceReviewPanelV589','LongSongReviewPanelV589','inspectAdvancedMotionV534','MotionQualityPreviewV321'])assert(studio.includes(token));
 assert(ui.includes('onSeek(flag.atSeconds)')&&ui.includes('visualDanceReviewStatusV589')&&ui.includes('JSON exportieren'));
 assert(preview.includes('cloneSkinnedScene')&&preview.includes('retargetHumanoidClips'));
});
test('manual signoff not persisted as arbitrary verified clip status',()=>{
 const ui=fs.readFileSync('components/visualizer/VisualDanceReviewPanelV589.tsx','utf8');
 assert(!/localStorage|saveCharacterMotionStore|set.*verified/i.test(ui));
});
test('10,000 deterministic fake-scene marker probes and long-form rewinds',()=>{
 for(let i=0;i<10000;i++){
  const cursor=i%81,shift=(i%6===0?0:cursor*.001);
  const poses=[scene(0,0),scene(.04,shift),scene(.08,shift)];
  const r=buildVisualDanceReviewV589(make(inspectSampledMotionV534(poses,1.8)),.08,10);
  assert(r.flags.length<=10&&r.flags.every(f=>f.atSeconds>=0&&f.atSeconds<=.08));
  if(i%300===0)assert.deepEqual(probe({minutes:2,bpm:110}),probe({minutes:2,bpm:110}));
 }
});
console.log(`PASS V589: ${groups} groups, 10,000 sample probes, real-source review, manual signoff and long-song V588 rehearsal`);
