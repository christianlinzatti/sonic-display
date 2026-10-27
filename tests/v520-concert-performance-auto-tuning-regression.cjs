'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {proposeConcertTuneV520:propose,assessConcertTrialV520:assess,validV520Trial:validTrial}=load('services/monitoring/concertAutoTuningV520');
const {capturePiStudioV518:capture}=load('services/monitoring/piConcertPerformanceStudioV518');
const {compareOptimizationCapturesV519:compare}=load('services/monitoring/concertOptimizationAdvisorV519');
const at=1720000000000;
function make(offset=0,overrides={}){
 const arr=Array.from({length:7},(_,i)=>({at:at+offset+i*1000,avatarCount:4,tier:'high',dpr:1.5,
  fps:24+(i%3),p95FrameMs:50,slowPercent:22,drawCalls:620,triangles:475000,
  piProfile:'off',piLevel:'disabled',features:{lyrics:true,lipSync:true,reactiveLighting:true},heapMb:null,...overrides}));
 const c=capture(arr,arr[arr.length-1].at+100);
 assert.equal(c.status,'ready');return c.capture;
}
const baseline=make();
const ready={mode:'high',tier:'high'};
const config=baseline.configuration;
const permitted=propose(baseline,ready,'off',baseline.at+100,30,config);
assert.equal(permitted.allowed,true);assert.equal(permitted.targetMode,'balanced');
assert(permitted.reason.includes('DPR'));
assert.equal(propose(null,ready,'off',baseline.at+100,30,config).allowed,false);
assert.equal(propose(baseline,ready,'off',baseline.at+180001,30,config).allowed,false);
assert.equal(propose(baseline,ready,'off',baseline.at+100,30,null).allowed,false);
assert.equal(propose(baseline,ready,'off',baseline.at+100,30,'different').allowed,false);
assert.equal(propose(baseline,{mode:'auto',tier:'high'},'off',baseline.at+100,30,config).allowed,false);
assert.equal(propose(baseline,ready,'pi-balanced',baseline.at+100,30,config).allowed,false);
assert.equal(propose(baseline,{mode:'balanced',tier:'high'},'off',baseline.at+100,30,config).allowed,false);
const low=make(100000,{tier:'low',dpr:.8,fps:55,p95FrameMs:14,slowPercent:1});
assert.equal(propose(low,{mode:'low',tier:'low'},'off',low.at+100,60,low.configuration).allowed,false);
const middle=make(200000,{tier:'balanced',dpr:1.15,fps:21,p95FrameMs:58});
assert.equal(propose(middle,{mode:'balanced',tier:'balanced'},'off',middle.at+100,30,middle.configuration).targetMode,'low');
const trial={version:520,previousMode:'high',targetMode:'balanced',startedAt:baseline.at+100,baseline};
assert(validTrial(trial));
assert(!validTrial({...trial,targetMode:'high'}));
assert(!validTrial({...trial,previousMode:'auto'}));
assert(!validTrial({...trial,baseline:null}));
assert(!validTrial({...trial,startedAt:baseline.at-1}));
const improved=make(10000,{tier:'balanced',dpr:1.15,fps:43,p95FrameMs:22,slowPercent:2});
const done=assess(trial,[baseline,improved],'balanced','off');
assert.equal(done.status,'ready');assert(done.positiveObservation);
assert.deepEqual(done.changes,['Grafikprofil','DPR']);
assert(done.reason.includes('nicht kausal'));
assert.equal(assess(trial,[baseline],'balanced','off').status,'awaiting');
assert.equal(assess(trial,[baseline,improved],'high','off').status,'interference');
assert.equal(assess(trial,[baseline,improved],'balanced','pi-low').status,'interference');
assert.equal(assess(null,[improved],'balanced','off').status,'invalid');
const confounded=make(25000,{tier:'balanced',dpr:1.15,avatarCount:3,fps:48,p95FrameMs:20});
assert.equal(assess(trial,[confounded],'balanced','off').status,'interference');
assert.equal(compare(baseline,confounded).status,'confounded');
const afterOnlyDpr=make(30000,{tier:'high',dpr:1.15});
assert.equal(assess(trial,[afterOnlyDpr],'balanced','off').status,'interference');
let checks=0;
for(let i=0;i<45000;i++){
 const fps=15+(i%50);
 const capture={...baseline,avgFps:fps,minFps:Math.min(fps,baseline.minFps),avgSlowPercent:i%33,
  worstWindowP95Ms:25+(i%53)};
 const p=propose(capture,ready,'off',capture.at+100,[30,45,60][i%3],capture.configuration);
 assert.equal(typeof p.allowed,'boolean');
 if(p.allowed)assert(p.targetMode==='balanced'&&p.changedControl==='Renderqualitaet');
 const t={...trial,baseline:capture};
 const r=assess(t,[improved],'balanced','off');
 assert(['ready','awaiting','interference'].includes(r.status));checks++;
}
const ui=fs.readFileSync('components/visualizer/PiConcertAutoTuningStudioV520.tsx','utf8');
const parent=fs.readFileSync('components/visualizer/PiConcertPerformanceStudioV518.tsx','utf8');
assert(parent.includes('<PiConcertAutoTuningStudioV520 captures={captures}'));
assert(ui.includes('sessionStorage.setItem')&&ui.includes('sessionStorage.removeItem'));
assert(ui.includes('setPerformanceMode(pending.targetMode)')&&ui.includes('setPerformanceMode(trial.previousMode)'));
assert(ui.indexOf('sessionStorage.setItem(STORAGE,JSON.stringify(pending))')<ui.indexOf('setPerformanceMode(pending.targetMode)'));
assert(ui.includes('measured.status!==\'ready\'')&&ui.includes('readPiProfile()'));
assert(!ui.includes('requestAnimationFrame')&&!ui.includes('setInterval')&&!ui.includes('setTimeout('));
const pkg=require('../package.json');assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]??0)>=521);
assert(pkg.scripts['build:preflight'].includes('npm run test:v520 && npm run test:v520:types && npm run test:v519'));
console.log(`PASS V520: ${checks} bounded quality-trial cases; explicit opt-in/rollback, session recovery, coupled DPR, guarded A/B captures, no autoplay`);
