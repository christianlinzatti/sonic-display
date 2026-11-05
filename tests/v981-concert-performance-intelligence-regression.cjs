#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const file='components/visualizer/concertPerformanceIntelligenceV981.ts';
const compiled=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
 compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
assert.equal(compiled.diagnostics?.length??0,0,'V981 TypeScript parses');
const mod={exports:{}};vm.runInNewContext(compiled.outputText,{module:mod,exports:mod.exports}, {filename:file,timeout:10000});
const p=mod.exports;
const valid={available:true,playing:true,verified:true,sampleCount:30,targetFps:60,
 fps:60,frameMs:16.7,p95FrameMs:20,slowFrameShare:0,
 rendererCalls:150,rendererTriangles:100000,fxActive:true,fxCapacity:100,fxCost:45};
const poor={...valid,fps:32,frameMs:31,p95FrameMs:42,slowFrameShare:.4};
let checks=0;function test(label,cb){cb();console.log('PASS V981 '+label);checks++;}
const push=(state,sample=valid,scope='track-1:0')=>p.analyzeConcertPerformanceV981(state,sample,scope);
test('fresh state uses constant-size typed history',()=>{const s=p.createPerformanceIntelligenceV981();assert.equal(s.fps.length,12);assert.equal(s.strained.length,12);assert.equal(s.length,0);});
test('unverified and paused input cannot claim bottlenecks',()=>{
 const s=p.createPerformanceIntelligenceV981();assert.equal(push(s,{...poor,verified:false}),null);
 assert.equal(push(s,{...poor,playing:false}),null);assert.equal(s.length,0);
});
test('invalid, short, and missing data fail closed',()=>{
 for(const q of [{...poor,available:false},{...poor,sampleCount:5},{...poor,fps:NaN},
  {...poor,p95FrameMs:Infinity},{...poor,slowFrameShare:1.2},{...poor,targetFps:24}]){
  const s=p.createPerformanceIntelligenceV981();assert.equal(push(s,q),null);assert.equal(s.length,0);
 }
});
test('first four windows never infer a root cause',()=>{
 const s=p.createPerformanceIntelligenceV981();for(let i=0;i<3;i++){const r=push(s,poor);assert.equal(r.clue,'insufficient');assert.equal(r.trend,'insufficient');}
});
test('single slow window remains healthy',()=>{
 const s=p.createPerformanceIntelligenceV981();push(s,poor);for(let i=0;i<3;i++)push(s,valid);
 assert.equal(push(s,valid).clue,'healthy');
});
test('repeated irregular frame times are distinguished from proof of GPU load',()=>{
 const s=p.createPerformanceIntelligenceV981();let r;for(let i=0;i<4;i++)r=push(s,{...poor,p95FrameMs:58});
 assert.equal(r.clue,'frame-spikes');assert.match(r.disclaimer,/keine gemessene CPU-/);
});
test('scene complexity hint is conditional on repeated pressure',()=>{
 const s=p.createPerformanceIntelligenceV981();let r;for(let i=0;i<4;i++)r=push(s,{...poor,rendererCalls:305,p95FrameMs:34,slowFrameShare:.05});
 assert.equal(r.clue,'scene-complexity');assert.match(r.advice,/Draw Calls/);
});
test('fx cost hint never claims measured GPU usage',()=>{
 const s=p.createPerformanceIntelligenceV981();let r;for(let i=0;i<4;i++)r=push(s,{...poor,fxCost:95,fxCapacity:100,p95FrameMs:34,slowFrameShare:.05});
 assert.equal(r.clue,'fx-budget');assert.match(r.advice,/Schaum/);
});
test('without enough counters strain remains unclassified',()=>{
 const s=p.createPerformanceIntelligenceV981();let r;for(let i=0;i<4;i++)r=push(s,{...poor,p95FrameMs:34,slowFrameShare:.05});
 assert.equal(r.clue,'unclassified');
});
test('trend compares two non-overlapping groups of four windows',()=>{
 const s=p.createPerformanceIntelligenceV981();for(let i=0;i<4;i++)push(s,{...valid,fps:58});
 for(let i=0;i<4;i++)push(s,{...valid,fps:40});assert.equal(push(s,{...valid,fps:40}).trend,'degrading');
 const t=p.createPerformanceIntelligenceV981();for(let i=0;i<4;i++)push(t,{...valid,fps:37});
 for(let i=0;i<4;i++)push(t,valid);assert.equal(push(t,valid).trend,'improving');
});
test('constant FPS is steady once there are eight windows',()=>{
 const s=p.createPerformanceIntelligenceV981();let r;for(let i=0;i<12;i++)r=push(s,valid);assert.equal(r.trend,'steady');assert.equal(r.meanFps,60);
});
test('track change and seek epoch reset historical samples',()=>{
 const s=p.createPerformanceIntelligenceV981();for(let i=0;i<9;i++)push(s,poor);
 const changed=push(s,valid,'track-2:0');assert.equal(changed.examinedWindows,1);
 const seek=push(s,valid,'track-2:1');assert.equal(seek.examinedWindows,1);
});
test('missing track scope or stopped stream discards stored samples',()=>{
 const s=p.createPerformanceIntelligenceV981();for(let i=0;i<8;i++)push(s,poor);
 assert.equal(push(s,valid,''),null);assert.equal(s.length,0);assert.equal(s.scopeKey,'');
});
test('history remains bounded and safe after 10,000 windows',()=>{
 const s=p.createPerformanceIntelligenceV981();let r;
 for(let i=0;i<10000;i++)r=push(s,i%2?valid:poor);
 assert.equal(r.examinedWindows,12);assert.equal(s.fps.length,12);assert.equal(s.strained.length,12);
 assert(Number.isFinite(r.meanFps)&&r.meanFps>0&&r.meanFps<120);
});
test('V981 is read-only and integrated only in existing completed V826 telemetry',()=>{
 const file=read('components/visualizer/DynamicStage.tsx');
 assert.equal((file.match(/analyzeConcertPerformanceV981\(/g)||[]).length,1);
 assert(file.indexOf('analyzeConcertPerformanceV981(')>file.indexOf('completeConcertQualityV826('));
 assert(file.includes('performanceInsightV981=analyzeConcertPerformanceV981'));
 assert(file.includes('clearPerformanceIntelligenceV981('));
 const source=read('components/visualizer/concertPerformanceIntelligenceV981.ts');
 for(const forbidden of ['fetch(','.setInterval(','.setTimeout(','.requestAnimationFrame(','localStorage','navigator.gpu','gl.readPixels'])
  assert(!source.includes(forbidden),'No extra side effects: '+forbidden);
});
test('dashboard explains that evidence is heuristic only',()=>{
 const ui=read('components/visualizer/ConcertQualityDashboardV826.tsx');
 assert(ui.includes('performanceInsightV981'));assert(ui.includes('Keine automatische Änderung'));
 assert(read('components/visualizer/concertQualityTelemetryV826.ts').includes('performanceInsightV981?:PerformanceInsightV981'));
});
console.log(`V981 PASS: ${checks} regression groups (10,000 simulated V826 windows)`);
