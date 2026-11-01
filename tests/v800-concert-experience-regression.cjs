'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {auditConcertExperienceV800:audit,sampleConcertExperienceV800:sample}=
  load('components/visualizer/concertExperienceMilestoneV800');
let passed=0;
function test(name,fn){try{fn();passed++}catch(e){e.message='V800 '+name+': '+e.message;throw e}}
const intents=['portrait','portrait','portrait','wide','rise','pulse','breath','dialogue','wide','ensemble'];
const scenes=intents.map((intent,index)=>({index,actIndex:index,startMs:index*11000,
  endMs:(index+1)*11000,intent,section:index===5?'drop':index===3?'hook':index===6?'break':'verse',
  role:index===5?'main-peak':index===3?'support-peak':index===6?'rest':'foundation',
  moment:index===5||index===3?'payoff':index===6?'breath':'focus',
  variation:1,emphasis:index===5?.95:index===3?.37:index===6?-.6:.1}));
const plan={source:'verified-storyboard',trackId:'v800-rap-feat',durationMs:110000,scenes,peakAct:5};
const report=audit(plan);
const base={active:true,genre:'deutschrap',section:'verse',source:'imported',
  evidence:'labeled',dance:1,camera:1,lighting:1,lyrics:.45};
const peerOff={active:false,sceneIndex:-1};
function input(i=2,ms=i*11000+5500,patch={}){
 const scene=scenes[i];return {trackId:plan.trackId,durationMs:plan.durationMs,positionMs:ms,
  playing:true,enabled:true,reducedMotion:false,tier:'high',lyricsProtected:false,
  manualDance:false,manualCamera:false,manualLighting:false,
  show:{active:true,reason:'verified-show',sceneIndex:i,actIndex:scene.actIndex,
    moment:scene.moment,intent:scene.intent,blend:1,emphasis:scene.emphasis,dynamics:base},
  handoff:peerOff,camera:peerOff,peak:peerOff,stage:peerOff,
  base:{...base,section:scene.section},...patch};
}
const run=(i=2,ms=i*11000+5500,patch={})=>sample(report,input(i,ms,patch));
test('audits full verified ten scene song',()=>{assert.equal(report.source,'verified-show');assert.equal(report.sceneCount,10);assert.equal(report.actCount,10);assert.equal(report.coverage,1);assert.equal(report.uncoveredMs,0);});
test('reports actual repeated shots instead of inventing variety',()=>{assert.equal(report.maxRepeatedIntent,3);assert(report.issues.includes('repeated-camera-intent'));assert.equal(report.scenes[2].repeatRun,3);assert.equal(report.scenes[2].moment,'focus-hold');});
test('distinguishes support hook from main climax',()=>{assert.equal(report.mainPeakScenes,1);assert.equal(report.supportPeakScenes,1);assert.equal(report.scenes[3].moment,'accent');assert.equal(report.scenes[5].moment,'highlight');});
test('detects breath',()=>{assert.equal(report.breathScenes,1);assert.equal(report.scenes[6].moment,'breath')});
test('healthy coverage and distinct intents',()=>{assert.equal(report.intentKinds,7);assert(!report.issues.includes('under-covered'));assert(!report.issues.includes('weak-section-variety'))});
test('camera repetition modestly restrains intensity',()=>{const r=run();assert(r.active);assert.equal(r.moment,'focus-hold');assert(r.dynamics.camera<1);assert.equal(r.dynamics.lyrics,.45)});
test('main climax dominates minor hook',()=>{const main=run(5),minor=run(3);assert(main.active&&minor.active);assert(main.dynamics.lighting>minor.dynamics.lighting);assert(main.dynamics.dance>minor.dynamics.dance)});
test('breath is quieter',()=>{const r=run(6);assert(r.dynamics.lighting<1&&r.dynamics.camera<1&&r.dynamics.dance<1)});
test('flow is exact identity',()=>assert.deepEqual(run(7).dynamics,input(7).base));
test('respects authored camera and lighting',()=>{const r=run(5,60500,{manualCamera:true,manualLighting:true});assert.equal(r.dynamics.camera,1);assert.equal(r.dynamics.lighting,1);assert(r.dynamics.dance>1)});
test('all manual lanes identity',()=>{const x=input(5,60500,{manualCamera:true,manualDance:true,manualLighting:true});assert.deepEqual(sample(report,x).dynamics,x.base)});
test('neutral scene preserves arbitrary already-capped base, not hard reset',()=>{
 const b={...base,dance:.52,camera:1.27,lighting:.63};
 const x=input(7,82500,{base:b});assert.deepEqual(sample(report,x).dynamics,b);
});
test('fade edge preserves existing non-unity automatic gains exactly',()=>{
 const b={...base,dance:.65,camera:1.30,lighting:.5};
 const x=input(5,55000,{base:b});assert.deepEqual(sample(report,x).dynamics,b);
});
test('main peak scales existing values without unexpectedly brightening a dim baseline',()=>{
 const b={...base,dance:.56,camera:.72,lighting:.35};
 const r=sample(report,input(5,60500,{base:b}));assert(r.active);
 assert(r.dynamics.lighting>.35&&r.dynamics.lighting<.37);
 assert(r.dynamics.dance>.56&&r.dynamics.dance<.58);
});

test('preserves singer/lyrics cue values',()=>assert.equal(run(5).dynamics.lyrics,.45));
test('lyrics guard reduces additional gain',()=>{const a=run(5),b=run(5,60500,{lyricsProtected:true});assert(b.dynamics.lighting<a.dynamics.lighting)});
test('balanced tier attenuates gain',()=>assert(run(5,60500,{tier:'balanced'}).dynamics.lighting<run(5).dynamics.lighting));
test('exact boundaries produce untouched gain',()=>{for(const i of [0,1,5,9]){const x=input(i,i*11000);assert.deepEqual(sample(report,x).dynamics,x.base)}});
test('end boundary fades to zero',()=>{const x=input(5,65999);assert(Math.abs(sample(report,x).dynamics.lighting-x.base.lighting)<.0001)});
for(const [name,changes] of Object.entries({paused:{playing:false},disabled:{enabled:false},
  reduced:{reducedMotion:true},low:{tier:'low'},oldTrack:{trackId:'previous'},
  oldDuration:{durationMs:120000},negativeTime:{positionMs:-1},badTime:{positionMs:NaN},
  infiniteTime:{positionMs:Infinity},endTime:{positionMs:110000},
  badShow:{show:{...input().show,sceneIndex:6}},unverified:{show:{...input().show,reason:'estimated'}},
  noBlend:{show:{...input().show,blend:0}},inactiveShow:{show:{...input().show,active:false}},
  noBase:{base:{...base,active:false}},invalidGain:{base:{...base,camera:Infinity}}
}))test('fail closed '+name,()=>{const x=input(2,27500,changes),r=sample(report,x);assert(!r.active);assert.deepEqual(r.dynamics,x.base)});
test('active V791 handoff must agree with scene',()=>{const x=input(5,60500,{handoff:{active:true,sceneIndex:4}});assert(!sample(report,x).active)});
test('active V792 camera must agree with scene',()=>{const x=input(5,60500,{camera:{active:true,sceneIndex:1}});assert(!sample(report,x).active)});
test('active V794 peak must agree with track and scene',()=>{const x=input(5,60500,{peak:{active:true,sceneIndex:5,trackId:'previous',durationMs:plan.durationMs}});assert(!sample(report,x).active)});
test('active V795 stage must agree with song',()=>{const x=input(5,60500,{stage:{active:true,sceneIndex:5,trackId:plan.trackId,durationMs:120000}});assert(!sample(report,x).active)});
test('matching peer cues are accepted',()=>{const x=input(5,60500,{handoff:{active:true,sceneIndex:5},camera:{active:true,sceneIndex:5},peak:{active:true,sceneIndex:5,trackId:plan.trackId,durationMs:plan.durationMs},stage:{active:true,sceneIndex:5,trackId:plan.trackId,durationMs:plan.durationMs}});assert(sample(report,x).active)});
test('declared storyboard gaps are diagnosed and not filled',()=>{const gap={...plan,scenes:scenes.map((s,i)=>i===2?{...s,startMs:s.startMs+100}:s)};const a=audit(gap);assert.equal(a.source,'verified-show');assert(a.issues.includes('timeline-gap'));const x=input(2,22050);assert(!sample(a,x).active);assert.equal(sample(a,{...x,positionMs:27500}).active,true)});
test('under-coverage warning is grounded',()=>{const r=audit({...plan,durationMs:190000});assert(r.issues.includes('under-covered'));assert(r.coverage<.8)});
test('no breath is reported, not synthesized',()=>{const r=audit({...plan,scenes:scenes.map((s,i)=>i===6?{...s,moment:'focus',role:'foundation'}:s)});assert(r.issues.includes('no-breath'))});
test('no support peak warns',()=>{const r=audit({...plan,scenes:scenes.map((s,i)=>i===3?{...s,moment:'focus',role:'foundation'}:s)});assert(r.issues.includes('no-secondary-peak'))});
for(const [name,p] of Object.entries({missing:{...plan,source:'unavailable'},
 wrongTrack:{...plan,trackId:''},badDuration:{...plan,durationMs:NaN},
 missingMain:{...plan,peakAct:15},overlap:{...plan,scenes:scenes.map((s,i)=>i===2?{...s,startMs:21000}:s)},
 wrongIndex:{...plan,scenes:scenes.map((s,i)=>i===3?{...s,index:30}:s)},
 invalidIntent:{...plan,scenes:scenes.map((s,i)=>i===3?{...s,intent:'fantasy'}:s)},
 reversedActs:{...plan,scenes:scenes.map((s,i)=>i===4?{...s,actIndex:0}:s)},
 noMainRole:{...plan,scenes:scenes.map((s,i)=>i===5?{...s,role:'foundation'}:s)}
}))test('invalid storyboard '+name,()=>assert.equal(audit(p).source,'unavailable'));
let checks=0;
for(let t=0;t<1600;t++){
 const ms=t*68.75,scene=Math.min(9,Math.floor(ms/11000));const a=run(scene,ms),b=run(scene,ms);
 assert.deepEqual(a,b);for(const k of ['dance','camera','lighting'])assert(Number.isFinite(a.dynamics[k])&&a.dynamics[k]>=.88&&a.dynamics[k]<=1.12);
 checks++;
}
test('1600 full-song probes including all scene boundaries',()=>assert.equal(checks,1600));
test('no new renderer, wall clock, random or GLB writes',()=>{const s=fs.readFileSync('components/visualizer/concertExperienceMilestoneV800.ts','utf8');assert(!/requestAnimationFrame\s*\(|useFrame\s*\(|Date\.now\s*\(|Math\.random\s*\(|new AnimationMixer\s*\(/.test(s))});
test('V670 guard remains after V800 composition',()=>{const s=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');const a=s.indexOf('const concertExperienceV800='),b=s.indexOf('const showQualityV670='),c=s.indexOf('const directedDynamicsV670=');assert(a>0&&a<b&&b<c);assert(s.includes('base:directedDynamicsV800'));assert(s.includes('directedDynamicsV800,showQualityV670'));for(const k of ['data-v800-moment','data-v800-coverage','data-v800-issues'])assert(s.includes(k))});
const pkg=require('../package.json');test('version and release gates',()=>{assert(/^0\.1\.0-v(?:850|849|848|847|846|845|844(?:\.1)?|843|842|841|840|(?:80[0-9]|81[0-9]|82[0-9]|83[0-9]))$/.test(pkg.version));for(const k of ['build:preflight','check:fast','check:release'])assert(pkg.scripts[k].includes('npm run test:v800 && npm run test:v800:types && npm run test:v799'),k)});
console.log(`PASS V800: ${passed} regression groups, ${checks} deterministic full-song playback probes`);
