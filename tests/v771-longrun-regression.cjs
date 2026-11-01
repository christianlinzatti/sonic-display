'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {assessLongRunV771,STAGES,median}=require('../scripts/v771-longrun-assessment.cjs');
const root=path.resolve(__dirname,'..');
const sample=(cycle,step,stage,avatar,phase,g,t,p,draw=10)=>({cycle,step,stage,avatar,phase,
 geometries:g,textures:t,programs:p,drawCalls:draw,triangles:100,contextLost:false,jsHeapBytes:null});
function batch(index,{cycles=15,g=12,t=8,p=4,models=[],noise=0,heap=25*1048576,cache=null,invalid=null}={}){
 const avatars=['procedural-a','procedural-b',...models.map((_,i)=>`glb-${i}`)];
 const data=[];let step=0;
 for(let cycle=-2;cycle<cycles;cycle++){
  const phase=cycle<0?'warmup':'measure';
  for(const stage of STAGES)for(const avatar of avatars){
    data.push(sample(cycle+1,++step,stage,avatar,phase,g,t,p));
  }
  // Single end-of-cycle anchor; transient noise in some cycles may not mean a leak.
  data.push(sample(cycle+1,++step,'classic','procedural-a',phase,g+(cycle===cycles-1?noise:0),t,p));
 }
 const record={format:'sonic-v767-gpu-memory',version:1,cycles,warmupCycles:2,models,samples:data,
   afterGc:{jsHeapUsedBytes:heap,cache}};
 if(invalid==='context')record.samples[20].contextLost=true;
 if(invalid==='missing')record.samples.pop();
 if(invalid==='stages')record.samples=record.samples.map(s=>s.stage==='galaxy'?{...s,stage:'classic'}:s);
 if(invalid==='draw')record.samples=record.samples.map(s=>({...s,drawCalls:0}));
 return record;
}
const stable=[batch(0),batch(1),batch(2),batch(3)];
const result=assessLongRunV771(stable);
assert.equal(result.status,'stable');assert.equal(result.totalCycles,60);assert.equal(result.checkpoints,60);
assert.equal(result.transitions,60*6*2);assert.equal(result.growth.geometries.delta,0);
assert.equal(assessLongRunV771(stable.slice(0,2)).status,'inconclusive');
assert.equal(assessLongRunV771([batch(0,{cycles:8}),batch(1,{cycles:8}),batch(2,{cycles:8})]).status,'stable');
assert.equal(assessLongRunV771([batch(0),batch(1,{noise:200}),batch(2),batch(3)]).status,'stable','single spike cannot trigger alarm');
assert.equal(assessLongRunV771([batch(0),batch(1,{g:13}),batch(2,{g:20}),batch(3,{g:30})]).status,'suspect','persistent geometry growth');
assert.equal(assessLongRunV771([batch(0),batch(1,{t:10}),batch(2,{t:14}),batch(3,{t:16})]).status,'suspect','persistent texture growth');
assert.equal(assessLongRunV771([batch(0),batch(1,{p:8}),batch(2,{p:10}),batch(3,{p:11})]).status,'suspect','persistent program growth');
assert.equal(assessLongRunV771([batch(0,{p:null}),batch(1,{p:null}),batch(2,{p:null})]).status,'stable','optional programs');
assert.equal(assessLongRunV771([batch(0),batch(1,{invalid:'context'}),batch(2)]).status,'inconclusive','webgl context loss');
assert.equal(assessLongRunV771([batch(0),batch(1,{invalid:'missing'}),batch(2)]).status,'inconclusive','missing samples');
assert.equal(assessLongRunV771([batch(0),batch(1,{invalid:'draw'}),batch(2)]).status,'inconclusive','no actual draw');
assert.equal(assessLongRunV771([batch(0),batch(1,{invalid:'stages'}),batch(2)]).status,'inconclusive','missing stage');
assert.equal(assessLongRunV771([batch(0),batch(1,{models:['/x.glb']}),batch(2)]).status,'inconclusive','changing assets');
assert.equal(assessLongRunV771([batch(0,{heap:20e6}),batch(1,{heap:30e6}),batch(2,{heap:58e6}),batch(3,{heap:90e6})]).status,'suspect','persistent JS heap after GC');
assert.equal(assessLongRunV771([batch(0,{heap:20e6}),batch(1,{heap:30e6}),batch(2,{heap:22e6}),batch(3,{heap:19e6})]).status,'stable','GC fluctuations');
assert.equal(assessLongRunV771([batch(0),batch(1,{cache:{idleEstimatedBytes:10,idleByteBudget:8}}),batch(2)]).status,'suspect','cache budget overrun');
assert.equal(median([2,1,3,7]),2.5);
const runner=fs.readFileSync(path.join(root,'scripts/v771-longrun-browser.cjs'),'utf8');
const ui=fs.readFileSync(path.join(root,'components/visualizer/GpuMemoryStressV767.tsx'),'utf8');
const pkg=require('../package.json');
assert.match(runner,/HeapProfiler\.collectGarbage/);assert.match(runner,/Performance\.getMetrics/);
assert.match(runner,/window\.__sonicV767\.run/);assert.match(runner,/assessLongRunV771\(batches/);
assert.match(runner,/maxMinutes/);assert.match(runner,/report\.progress/);
assert.match(runner,/isLoopback\(origin\)/);assert.match(runner,/maxMinutes\*60000/);
assert.doesNotMatch(runner,/new Canvas|new WebGLRenderer/);
assert.match(ui,/snapshot:\(\)=>capture\.current\?\.\(\)\?\?null/);
assert.match(ui,/cache:\(\)=>getPreviewGltfCacheStatsV768\(\)/);
assert.match(ui,/data-v771-longrun/);
assert.match(ui,/\['localhost','127\.0\.0\.1','::1','\[::1\]'\]/,'IPv6 loopback opt-in works');
assert.equal(pkg.scripts['test:v771:browser'],'node scripts/v771-longrun-browser.cjs');
assert(pkg.scripts['check:fast'].includes('npm run test:v771 &&'),'V771 must remain in the release gate after newer versions');
console.log('PASS V771: multi-batch anchor comparisons, noise suppression, sustained GPU/heap/cache growth, invalid/incomplete/context-lost data, real browser runner and release hooks');
