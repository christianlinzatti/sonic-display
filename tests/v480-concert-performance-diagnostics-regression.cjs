'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {initialPiConcertBudgetV479:init,advancePiConcertBudgetV479:advance}=load('services/monitoring/piConcertBudgetV479');
const {emptyConcertSnapshotV480:empty,advanceConcertSnapshotV480:next,
 summarizeConcertV480:summary,CONCERT_HISTORY_LIMIT_V480:limit,CONCERT_EVENT_LIMIT_V480:eventLimit}=load('services/monitoring/concertPerformanceDiagnosticsV480');
const hints={likelyPi:true,platform:'Linux ARM',cores:4,memoryGb:4,reason:'test'};
const input=(before,after,at,fps=60,p95FrameMs=15,avatarCount=3,playing=true,visible=true)=>({
  before,after,
  sample:{at,fps,p95FrameMs,avatarCount,playing,visible},
  render:{updatedAt:at,fps,frameMs:1000/fps,p95FrameMs,slowPercent:fps<30?40:0,
    drawCalls:120,triangles:100000,avatarCount},
});
let snapshot=empty(),budget=init('pi-balanced',hints);
assert.equal(summary([]).grade,'insufficient');
const first=input(budget,budget,1000);
snapshot=next(snapshot,first);
assert.equal(snapshot.readings.length,1);
assert.equal(next(snapshot,first),snapshot,'deduplicate identical timestamp');
assert.equal(next(snapshot,input(budget,budget,1100)),snapshot,'ignore too frequent samples');
for(const invalid of [
 input(budget,budget,2000,20,48,3,false,true),input(budget,budget,2000,20,48,3,true,false),
 input(budget,budget,2000,NaN,48),input(budget,budget,2000,20,NaN),
 {...input(budget,budget,5000),render:{...first.render,updatedAt:1000}},
 {...input(budget,budget,2000),render:{...first.render,updatedAt:2000,drawCalls:Infinity}},
 {...input(budget,budget,2000),render:{...first.render,updatedAt:2000,avatarCount:1}},
 {...input(budget,budget,2000),render:{...first.render,updatedAt:2000,fps:18}},
])assert.equal(next(snapshot,invalid),snapshot,'bad/hidden/paused/unmatched measurements never stored');
let events=0;
for(let i=2;i<=2000;i++){
 const at=i*1000;
 const fps=i<7?22:i<45?55:i%44<12?22:55;
 const p95=fps<30?55:17;
 const before=budget;
 budget=advance(budget,{at,fps,p95FrameMs:p95,avatarCount:3,playing:true,visible:true});
 snapshot=next(snapshot,input(before,budget,at,fps,p95));
 assert(snapshot.readings.length<=limit,'sample history stays bounded');
 assert(snapshot.changes.length<=eventLimit,'transition history stays bounded');
 assert(Number.isFinite(summary(snapshot.readings).avgFps));
 if(before.level!==budget.level)events++;
}
assert.equal(snapshot.readings.length,limit);
assert(events>=1,'V479 recorded actual transitions');
assert.equal(snapshot.changes.length,Math.min(events,eventLimit));
assert(snapshot.changes.every(c=>['eco','balanced'].some(t=>c.from.includes(t)&&c.to.includes(t))));
assert.equal(summary(snapshot.readings).count,30,'summary uses at most 30 recent readings');
assert.equal(summary(snapshot.readings).avatars,3);
const stable=Array.from({length:30},(_,i)=>({...snapshot.readings[0],at:i*1000,fps:60,p95FrameMs:15,slowPercent:0}));
assert.equal(summary(stable).grade,'stable');
assert.equal(summary(stable.slice(0,4)).grade,'insufficient');
assert.equal(summary(stable.map(r=>({...r,fps:32,p95FrameMs:39}))).grade,'limited');
assert.equal(summary(stable.map(r=>({...r,fps:20,p95FrameMs:54}))).grade,'strained');
const off=init('off',hints);let independent=empty();
independent=next(independent,input(off,off,1000));
assert.equal(independent.readings[0].piEnabled,false,'metrics still available without Pi opt-in');
const files={
 runtime:fs.readFileSync('components/visualizer/piConcertRuntimeV479.tsx','utf8'),
 store:fs.readFileSync('components/visualizer/concertDiagnosticsRuntimeV480.tsx','utf8'),
 panel:fs.readFileSync('components/visualizer/ConcertPerformanceDiagnosticsV480.tsx','utf8'),
 diagnostics:fs.readFileSync('components/visualizer/RenderDiagnosticsPanel.tsx','utf8'),
 adaptive:fs.readFileSync('components/visualizer/adaptivePerformance.tsx','utf8'),
};
assert(files.runtime.includes('recordConcertDiagnosticsV480({sample,render:getRenderMetricsSnapshot(),before,after})'));
assert(files.adaptive.includes('samplePiConcertV479({at:Date.now(),fps,p95FrameMs,avatarCount,playing,visible:true})'),'single existing sampling loop retained');
assert(files.diagnostics.includes('<ConcertPerformanceDiagnosticsV480 />'),'panel only mounted in diagnostics tab');
assert(files.panel.includes('useConcertDiagnosticsV480()'));
assert(files.panel.includes('clearConcertDiagnosticsV480()'));
assert(files.panel.includes('application/json'));
assert(!/fetch\(|setInterval\(|requestAnimationFrame\(|localStorage|sessionStorage|navigator\.sendBeacon/.test(files.store+files.panel));
assert(!/fetch\(|setInterval\(|requestAnimationFrame\(|Date\.now\(|Math\.random/.test(fs.readFileSync('services/monitoring/concertPerformanceDiagnosticsV480.ts','utf8')),'pure deterministic policy');
assert(Number(require('../package.json').version.match(/^0\.1\.0-v(\d+)$/)?.[1])>=480,'V480 diagnostics remains available in newer releases');
console.log('PASS V480: 30-min bounded session diagnostics, truthful FPS/P95, pause/hidden/stale guards, budget transition events, Pi off, local report and passive UI wiring');
