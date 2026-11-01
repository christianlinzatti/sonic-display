'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const m=load('components/visualizer/realConcertBenchmarkV753');
let checks=0;
const ok=(v,message)=>{assert.ok(v,message);checks++;};
const eq=(a,b,message)=>{assert.deepEqual(a,b,message);checks++;};
const baseAt=1761850000000;
const probe=(at=baseAt,avatars=1,options={})=>({
 at,fps:57,frameMs:17.8,p95FrameMs:24,drawCalls:113,triangles:240000,qualityTier:'balanced',samples:64,
 canvas:{width:1200,height:800},avatars:Array.from({length:avatars},()=>({loaded:true})),
 assessment:{activeAvatarCount:avatars},renderWidthPx:1200,renderHeightPx:800,metricsAt:at,geometries:57,textures:31,jsHeapMb:null,...options});
for(let n=1;n<=4;n++){
 const baseline=probe(baseAt,n);
 eq(m.validateProbeV753(baseline,baseAt,n),null);
 let run=m.startBenchmarkV753(baseline,baseAt,n);
 ok(run&&run.status==='running',`start ${n}`);
 for(let i=1;i<=12;i++){
  const reading=probe(baseAt+i*1000,n,{fps:58-i/8,jsHeapMb:i%2?null:123});
  const next=m.collectBenchmarkV753(run,reading,baseAt+i*1000);
  eq(next.samples.length,i);
  eq(next.status,i===12?'complete':'running');
  run=next;
 }
 eq(m.summarizeBenchmarkV753(run).environment.avatars,n);
 eq(m.summarizeBenchmarkV753(run).jsHeapMb,null);
 eq(m.summarizeBenchmarkV753(run).geometries,57);
 eq(m.collectBenchmarkV753(run,probe(baseAt+13000,n),baseAt+13000),run);
 eq(m.stopBenchmarkV753(run),run);
 const copy=m.startBenchmarkV753(baseline,baseAt,n);
 eq(m.collectBenchmarkV753(copy,probe(baseAt-500,n),baseAt),copy);
 eq(m.summarizeBenchmarkV753(copy),null);
 eq(m.collectBenchmarkV753(copy,probe(baseAt+1000,n,{fps:null}),baseAt+1000).status,'stopped');
 eq(m.collectBenchmarkV753(copy,probe(baseAt+1000,n,{qualityTier:'low'}),baseAt+1000).status,'stopped');
 eq(m.collectBenchmarkV753(copy,probe(baseAt+1000,n,{renderWidthPx:800}),baseAt+1000).status,'stopped');
 eq(m.collectBenchmarkV753(copy,probe(baseAt+1000,n,{avatars:[...baseline.avatars,{loaded:true}]}),baseAt+1000).status,'stopped');
 eq(m.collectBenchmarkV753(copy,probe(baseAt+1000,n,{jsHeapMb:NaN,geometries:-7}),baseAt+1000).samples[0].geometries,null);
 const after=m.collectBenchmarkV753(copy,probe(baseAt+1000,n),baseAt+1000);
 eq(m.collectBenchmarkV753(after,probe(baseAt+2000,n,{metricsAt:baseAt+1000}),baseAt+2000),after);
 eq(m.collectBenchmarkV753(after,probe(baseAt+2000,n,{renderWidthPx:1300}),baseAt+2000).status,'stopped');
 eq(m.collectBenchmarkV753(after,probe(baseAt+5000,n),baseAt+5000).status,'stopped');
}
for(const pair of [
 [probe(),baseAt-3000,1],[probe(),baseAt+5000,1],[probe(baseAt+10),baseAt,1],
 [probe(),baseAt,5],[probe(),baseAt,2],[probe(baseAt,1,{samples:0}),baseAt,1],
 [probe(baseAt,1,{fps:0}),baseAt,1],[probe(baseAt,1,{frameMs:Infinity}),baseAt,1],
 [probe(baseAt,1,{p95FrameMs:null}),baseAt,1],
 [probe(baseAt,1,{canvas:null}),baseAt,1],
 [probe(baseAt,1,{renderWidthPx:0}),baseAt,1],
 [probe(baseAt,1,{metricsAt:baseAt-3000}),baseAt,1],
 [probe(baseAt,1,{qualityTier:'?'}),baseAt,1],
 [probe(baseAt,1,{avatars:[{loaded:false}]}),baseAt,1]]){
 ok(typeof m.validateProbeV753(pair[0],pair[1],pair[2])==='string','invalid reading accepted');
 eq(m.startBenchmarkV753(pair[0],pair[1],pair[2]),null);
}
const done=n=>{let r=m.startBenchmarkV753(probe(baseAt,n),baseAt,n);
 for(let i=1;i<=12;i++)r=m.collectBenchmarkV753(r,probe(baseAt+1000*i,n,{fps:60-n*5}),baseAt+1000*i);
 return m.summarizeBenchmarkV753(r);};
const values=[done(1),done(2),done(3),done(4)];
ok(values.every(x=>!!x));
ok(values.every(x=>m.comparableBenchmarksV753(x,values[0])));
const csv=m.exportBenchmarkCsvV753(values);
eq(csv.split('\r\n').length,6);
ok(csv.includes('avatars,quality,canvasWidth'));
ok(!csv.includes('trackId')&&!csv.includes('lyrics')&&!csv.includes('userAgent'));
ok(!m.comparableBenchmarksV753(values[0],{...values[1],environment:{...values[1].environment,qualityTier:'high'}}));
ok(!m.comparableBenchmarksV753(values[0],{...values[1],environment:{...values[1].environment,canvasHeight:900}}));
for(let i=0;i<50000;i++){
 const n=1+i%4,at=baseAt+i*20000;
 const p=probe(at,n,{fps:30+(i%90)/2,p95FrameMs:10+(i%37),frameMs:15+(i%41)/3,jsHeapMb:i%3===0?128:null});
 const run=m.startBenchmarkV753(p,at,n);
 ok(!!run,`unable to start sample ${i}`);
 const one=m.collectBenchmarkV753(run,probe(at+1000,n,{...p,at:at+1000}),at+1000);
 eq(one.samples.length,1);
 eq(one.status,'running');
 eq(one.samples[0].jsHeapMb,p.jsHeapMb);
 const wrong=probe(at+2000,n,{qualityTier:i%2===0?'high':'balanced',renderWidthPx:i%2===0?1200:1100});
 const changed=m.collectBenchmarkV753(one,wrong,at+2000);
 eq(changed.status,'stopped');
 eq(changed.samples.length,1);
}
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
for(const s of ['RealConcertBenchmarkPanelV753','BENCHMARK_TARGET_SAMPLES_V753'])ok(read('components/visualizer/RealConcertBenchmarkPanelV753.tsx').includes(s));
for(const s of ['<RealConcertBenchmarkPanelV753/>','useConcertQualityV466'])ok(read('components/visualizer/ConcertQualityDashboardV751.tsx').includes(s));
for(const s of ['geometries:fpsFresh?m.geometries:null','textures:fpsFresh?m.textures:null','jsHeapMb:','renderWidthPx:gl.domElement.width'])ok(read('components/visualizer/ConcertQualityProbeV466.tsx').includes(s));
for(const s of ['CSV exportieren','Messung starten','keine automatischen','setResults([])','isConcertDashboardFreshV751(stage','sectionAtStart'])ok(read('components/visualizer/RealConcertBenchmarkPanelV753.tsx').includes(s));
for(const s of ['V751_OPEN_RENDER_QA_EVENT','onClick={exportCsv}','Keine GPU-Zeit-'])ok(read('components/visualizer/RealConcertBenchmarkPanelV753.tsx').includes(s));
ok(!read('components/visualizer/realConcertBenchmarkV753.ts').includes('localStorage'));
ok(!read('components/visualizer/RealConcertBenchmarkPanelV753.tsx').includes('setPerformanceMode'));
console.log(`PASS V753 Real Concert Performance Benchmark: ${checks.toLocaleString('en-US')} assertions`);
