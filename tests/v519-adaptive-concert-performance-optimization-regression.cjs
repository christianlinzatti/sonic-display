'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planConcertOptimizationV519:plan,compareOptimizationCapturesV519:compare,validOptimizationCaptureV519:valid}=load('services/monitoring/concertOptimizationAdvisorV519');
const {capturePiStudioV518:capture}=load('services/monitoring/piConcertPerformanceStudioV518');
const at=1710000000000;
function observed(i,overrides={}){
 return {at:at+i*1000,avatarCount:4,tier:'high',dpr:1.5,fps:24+(i%3),p95FrameMs:50+(i%4),slowPercent:24,
  drawCalls:650,triangles:500000,piProfile:'pi',piLevel:'balanced',features:{lyrics:true,lipSync:true,reactiveLighting:true},heapMb:null,...overrides};
}
const mk=(offset=0,overrides={})=>{
 const arr=Array.from({length:7},(_,i)=>observed(i+offset,overrides));
 const result=capture(arr,arr.at(-1).at+100);
 assert.equal(result.status,'ready');return result.capture;
};
const base=mk(),nice=mk(12,{avatarCount:3,tier:'balanced',dpr:1,piLevel:'eco',fps:51,p95FrameMs:20,slowPercent:2});
assert(valid(base));assert.equal(plan(base,30).severity,'constrained');
assert.deepEqual(plan(base,30).actions.map(x=>x.id),['quality','pi-budget','lighting','avatars','lyrics']);
assert.equal(plan(base,60).severity,'constrained');
assert(plan(nice,30).severity==='ok');
assert.deepEqual(plan(nice,30).actions.map(x=>x.id),['long-run']);
assert(plan(nice,60).severity!=='ok');
assert.equal(plan(null,30).valid,false);
assert.equal(plan({...base,count:5},30).valid,false);
assert.equal(plan({...base,avgFps:NaN},30).valid,false);
assert.equal(plan({...base,minFps:base.avgFps+1},30).valid,false);
assert.equal(plan({...base,peakHeapMb:-1},30).valid,false);
assert.equal(plan(base,123).target,30);
let iterations=0;
for(let i=0;i<40000;i++){
 const avgFps=18+(i%52),worstWindowP95Ms=10+(i%67),slowPercent=i%41;
 const data={...base,avgFps,minFps:Math.min(base.minFps,avgFps),worstWindowP95Ms,avgSlowPercent:slowPercent};
 const result=plan(data,[30,45,60][i%3]);
 assert(result.valid);assert(result.actions.length>=1);
 assert(result.actions.every(action=>action.title&&action.test&&action.reason&&action.guard));
 assert(!result.actions.some(action=>action.id==='disable-lipsync'));
 iterations++;
}
const qualityOnly=mk(24,{tier:'balanced'});
assert.equal(compare(base,qualityOnly).status,'single-change');
assert.deepEqual(compare(base,qualityOnly).changes,['Grafikprofil']);
assert.equal(compare(base,base).status,'invalid');
assert.equal(compare(base,null).status,'invalid');
assert.equal(compare(base,mk(40)).status,'repeat');
assert.equal(compare(base,nice).status,'confounded');
assert.equal(compare(base,mk(60,{features:{lyrics:true,lipSync:true,reactiveLighting:false}})).status,'single-change');
assert.equal(compare(base,mk(75,{avatarCount:3})).status,'single-change');
assert.equal(compare(base,mk(90,{tier:'balanced',avatarCount:3})).status,'confounded');
assert.equal(compare(base,mk(105,{features:{lyrics:true,lipSync:false,reactiveLighting:true}})).changes[0],'Lip-Sync');
assert(compare(base,nice).description.includes('nur beobachtete Differenz'));
const ui=fs.readFileSync('components/visualizer/PiConcertOptimizationAdvisorV519.tsx','utf8');
const studio=fs.readFileSync('components/visualizer/PiConcertPerformanceStudioV518.tsx','utf8');
const sampler=fs.readFileSync('components/visualizer/adaptivePerformance.tsx','utf8');
assert(studio.includes('<PiConcertOptimizationAdvisorV519 captures={captures} />'));
assert(ui.includes('planConcertOptimizationV519(a,target)')&&ui.includes('compareOptimizationCapturesV519(a,b)'));
assert(!ui.includes('setPerformanceMode(')&&!ui.includes('setPiStudioFeaturesV518(')&&!ui.includes('requestAnimationFrame')&&!ui.includes('setInterval'));
assert(sampler.includes('recordPiStudioV518({at:nowV518'),'read existing 1Hz sampler');
const pkg=require('../package.json');assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]??0)>=521);
assert(pkg.scripts['build:preflight'].includes('npm run test:v520 && npm run test:v520:types && npm run test:v519 && npm run test:v519:types && npm run test:v518'));
console.log(`PASS V519 adaptive concert optimization: ${iterations} synthetic observed-capture variations, isolated A/B changes, quality/lyrics/light/avatar guards, manual-only readout`);
