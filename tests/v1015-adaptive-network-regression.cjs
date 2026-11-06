#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const loader=require('./helpers/loader-v733.cjs')();
const {AdaptiveCapacityV1015}=loader('lib/networkAdaptiveV1015');
const {NetworkCoordinatorV1010,NetworkErrorV1010}=loader('lib/networkCoordinatorV1010');
const wait=(n=0)=>new Promise(resolve=>setTimeout(resolve,n));
const gate=()=>{let release;const p=new Promise(r=>release=r);return {p,release};};
(async()=>{
 const a=new AdaptiveCapacityV1015({regular:3,optional:2});
 assert.deepEqual(Array.from(a.snapshot().lanes,x=>x.effective),[3,2]);
 a.observe('regular',{status:401,latencyMs:10000,succeeded:false});
 a.observe('regular',{status:403,latencyMs:10000,succeeded:false});
 assert.equal(a.limit('regular'),3,'auth must not throttle');
 a.observe('optional',{status:0,latencyMs:500,succeeded:false,cancelled:true});
 assert.equal(a.limit('optional'),2,'cancellation must not throttle');
 a.observe('regular',{status:503,latencyMs:200,succeeded:false});
 assert.equal(a.limit('regular'),3,'one transient error should not throttle');
 a.observe('regular',{status:503,latencyMs:200,succeeded:false});
 assert.equal(a.limit('regular'),2,'two transient failures reduce concurrency');
 for(let i=0;i<6;i++)a.observe('regular',{status:200,latencyMs:20,succeeded:true});
 assert.equal(a.limit('regular'),3,'healthy responses restore at most one slot');
 for(let i=0;i<3;i++)a.observe('regular',{status:200,latencyMs:5000,succeeded:true});
 assert.equal(a.limit('regular'),2,'three slow requests reduce concurrency');
 a.observe('regular',{status:429,latencyMs:5,succeeded:false});
 assert.equal(a.limit('regular'),1,'429 reduces speculative load immediately');
 for(let i=0;i<100;i++)a.observe('regular',{status:429,latencyMs:5,succeeded:false});
 assert.equal(a.limit('regular'),1,'never fall below one slot');
 for(let i=0;i<18;i++)a.observe('regular',{status:200,latencyMs:20,succeeded:true});
 assert.equal(a.limit('regular'),3,'gradual recovery remains capped');
 a.reset();assert.deepEqual(Array.from(a.snapshot().lanes,x=>x.effective),[3,2]);
 assert(a.snapshot().lanes.every(x=>x.observations===0&&x.reductions===0));
 const c=new NetworkCoordinatorV1010({action:1,playback:1,regular:2,optional:2},5,10,1);
 const initial=c.snapshotV1011();
 assert.deepEqual(Array.from(initial.adaptive.lanes,x=>x.effective),[2,2]);
 await assert.rejects(c.request({key:'private-spotify-token',provider:'spotify',priority:'lyrics',retry:0,
  execute:async()=>{throw new NetworkErrorV1010('not available',429,1200);}}),/not available/);
 assert.equal(c.snapshotV1011().limits.regular,1,'network coordinator uses reduced limit');
 const held=gate();let started=0;
 const r1=c.request({key:'slow-lyrics-1',provider:'lrclib',priority:'lyrics',retry:0,
  execute:async()=>{started++;await held.p;return 'one';}});
 await wait(5);
 const r2=c.request({key:'slow-lyrics-2',provider:'lrclib',priority:'lyrics',retry:0,
  execute:async()=>{started++;return 'two';}});
 await wait(8);
 assert.equal(started,1,'adaptive scheduler limits background requests');
 assert.equal(c.snapshotV1011().queue,1);
 const action=await c.request({key:'follow-click',provider:'other',priority:'action',retry:0,execute:async()=>true});
 const playback=await c.request({key:'now-playing',provider:'other',priority:'playback',retry:0,execute:async()=>42});
 assert.equal(action,true);assert.equal(playback,42);
 assert.equal(c.snapshotV1011().limits.action,1);
 assert.equal(c.snapshotV1011().limits.playback,1);
 held.release();assert.equal(await r1,'one');assert.equal(await r2,'two');
 for(let i=0;i<6;i++)await c.request({key:'healthy:'+i,provider:'genius',priority:'lyrics',retry:0,execute:async()=>i});
 assert.equal(c.snapshotV1011().limits.regular,2,'recovery unlocks second regular slot');
 const snapshot=c.snapshotV1011();
 const serialized=JSON.stringify(snapshot.adaptive);
 for(const forbidden of ['private-spotify-token','slow-lyrics-1','follow-click','spotify','account-secret'])
  assert(!serialized.includes(forbidden),'private identity in telemetry: '+forbidden);
 snapshot.adaptive.lanes[0].effective=9999;
 assert.notEqual(c.snapshotV1011().adaptive.lanes[0].effective,9999,'snapshots must be detached');
 c.setAccount('account-secret');
 assert.deepEqual(Array.from(c.snapshotV1011().adaptive.lanes,x=>x.effective),[2,2]);
 assert.equal(c.snapshotV1011().adaptive.lanes[0].observations,0);
 const panel=read('components/NetworkPerformanceDashboardV1011.tsx');
 assert(panel.includes('state.adaptive.lanes.map')&&panel.includes('data-v1015-adaptive-network'));
 assert(!panel.includes('fetch(')&&!panel.includes('localStorage'));
 assert(read('app/globals.css').includes('.network-v1015-adaptive'));
 const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
 const current=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version);assert(current&&Number(current[1])>=1015);
 assert.equal(pkg.sonicRoadmapRelease,'v'+current[1]);
 assert.equal(pkg.sonicFeatureRelease,'v'+current[1]);assert.equal(lock.version,pkg.version);
 assert.equal(lock.packages[''].version,pkg.version);
 assert(pkg.scripts.prebuild.startsWith('npm run test:v'+current[1]+' &&'));
 assert(pkg.scripts.prebuild.includes('npm run test:v1015 &&'));
 for(const f of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
  assert(read(f).includes('tests/v1015-adaptive-network-regression.cjs'),f);
 assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1015(root)'));
 const ts=require('./typescript-loader.cjs');
 for(const file of ['lib/networkCoordinatorV1010.ts','lib/networkAdaptiveV1015.ts','components/NetworkPerformanceDashboardV1011.tsx']){
  const t=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
   compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}});
  assert.equal((t.diagnostics||[]).filter(e=>e.category===ts.DiagnosticCategory.Error).length,0,file);
 }
 console.log('PASS V1015: adaptive limits, auth/cancel isolation, 429, bounded decreases, slow provider, gradual recovery, private telemetry and release gates');
})().catch(error=>{console.error(error);process.exitCode=1;});
