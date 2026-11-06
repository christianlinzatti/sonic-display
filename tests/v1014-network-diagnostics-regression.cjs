#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const loader=require('./helpers/loader-v733.cjs')();
const {NetworkCoordinatorV1010,NetworkErrorV1010}=loader('lib/networkCoordinatorV1010');
const {evaluateNetworkDiagnosticsV1014}=loader('lib/networkDiagnosticsV1014');
const ts=require('./typescript-loader.cjs');
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
function deferred(){let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};}
(async()=>{
  const c=new NetworkCoordinatorV1010({action:1,playback:1,regular:1,optional:1},5,10,1);
  const hold=deferred();
  const running=c.request({key:'spotify:secret-account:secret-track',account:'secret-account',provider:'spotify',priority:'lyrics',
    retry:0,execute:async()=>{await hold.promise;return {artist:'private-artist'};}});
  await sleep(8);
  const queued=c.request({key:'lyrics:secret-song',account:'secret-account',provider:'spotify',priority:'lyrics',
    retry:0,execute:async()=>42});
  await sleep(15);
  let current=c.snapshotV1011();
  assert(current.diagnostics.oldestActiveMs>=8,'active age must be recorded');
  assert(current.diagnostics.oldestQueuedMs>=8,'queued age must be recorded');
  assert.equal(current.diagnostics.samples,0,'running requests are not completed samples');
  assert(current.diagnostics.lanes.find(x=>x.name==='regular').oldestQueuedMs>=8);
  hold.resolve();await running;assert.equal(await queued,42);
  current=c.snapshotV1011();
  assert.equal(current.diagnostics.samples,2);
  assert.equal(current.diagnostics.providers.find(x=>x.name==='Spotify').samples,2);
  assert(current.diagnostics.queueP95Ms>=8,'p95 must include actual queue delay');
  assert(current.diagnostics.latencyP95Ms>=0);
  assert(current.diagnostics.latencyP95Ms>=current.diagnostics.latencyP50Ms);
  assert.equal(current.diagnostics.oldestActiveMs,0);assert.equal(current.diagnostics.oldestQueuedMs,0);
  assert.equal(current.diagnostics.sampleLimit,120);assert.equal(current.diagnostics.windowMs,300000);
  assert(!evaluateNetworkDiagnosticsV1014(current).isVerified);
  // One user action remains independent of slow optional work.
  const optionalHold=deferred();
  const slowOptional=c.request({key:'image:secret',provider:'genius',priority:'optional',retry:0,
    execute:async()=>{await optionalHold.promise;return true;}});
  await sleep(4);
  assert.equal(await c.request({key:'follow:secret',provider:'spotify',priority:'action',retry:0,
    execute:async()=>true}),true);
  optionalHold.resolve();await slowOptional;
  await assert.rejects(c.request({key:'timeout:private',provider:'Spotify',priority:'playback',retry:0,
    execute:async()=>{throw new NetworkErrorV1010('sensitive-private-error',408);}}),/sensitive/);
  current=c.snapshotV1011();
  assert.equal(current.diagnostics.failureKinds.Timeout,1);
  assert(current.diagnostics.providers.some(p=>p.name==='Genius'));
  assert(current.diagnostics.providers.every(p=>['Spotify','Lyrics','LRCLIB','Genius','Buehneninhalte','Weitere'].includes(p.name)));
  const serialized=JSON.stringify(current.diagnostics);
  for(const value of ['secret-account','private-artist','secret-track','secret-song','secret','sensitive-private-error'])
    assert(!serialized.includes(value),'private request information leaked: '+value);
  // Simulate diagnostics age & p95 without waiting seconds in CI.
  const modified=structuredClone(current);
  modified.diagnostics.samples=6;modified.diagnostics.oldestQueuedMs=2400;
  modified.diagnostics.providers[0].samples=5;modified.diagnostics.providers[0].latencyP95Ms=3600;
  modified.diagnostics.failureKinds.Timeout=3;
  const analysis=evaluateNetworkDiagnosticsV1014(modified);
  assert(analysis.isVerified);
  for(const code of ['waiting','slow-provider','timeouts'])assert(analysis.findings.some(x=>x.code===code),code);
  modified.offline=true;
  assert(evaluateNetworkDiagnosticsV1014(modified).findings.some(x=>x.code==='offline'));
  // Bounded retention of only last 120 attempts, even in a long browser session.
  for(let i=0;i<135;i++){
    assert.equal(await c.request({key:'sample-'+i,provider:'https://secret.example/'+i,
      priority:'action',retry:0,execute:async()=>i}),i);
  }
  current=c.snapshotV1011();
  assert.equal(current.diagnostics.samples,120);
  assert(current.diagnostics.providers.every(x=>x.name!=='https://secret.example'));
  assert(current.diagnostics.providers.some(x=>x.name==='Weitere'));
  assert(!JSON.stringify(current.diagnostics).includes('secret.example'));
  // Snapshots cannot mutate live coordinator state.
  current.diagnostics.lanes[0].samples=9999;
  current.diagnostics.providers[0].failures=9999;
  assert.notEqual(c.snapshotV1011().diagnostics.lanes[0].samples,9999);
  // Contaminated data must not survive an account switch.
  c.setAccount('another-secret-account');
  const reset=c.snapshotV1011();
  assert.equal(reset.diagnostics.samples,0);assert.equal(reset.diagnostics.providers.length,0);
  assert.equal(reset.diagnostics.oldestActiveMs,0);
  assert.equal(reset.diagnostics.failureKinds.Timeout,0);
  assert.equal(reset.counters.completed,0);
  // Component remains passive and is wired to existing service dashboard.
  const panel=read('components/NetworkPerformanceDashboardV1011.tsx');
  assert(panel.includes('evaluateNetworkDiagnosticsV1014')&&panel.includes('data-v1014-network-diagnostics'));
  assert(panel.includes('windowData.providers.map')&&panel.includes('windowData.latencyP95Ms'));
  assert(!panel.includes('fetch(')&&!panel.includes('localStorage'));
  assert(read('components/ServiceStatusDashboardV667.tsx').includes('<NetworkPerformanceDashboardV1011/>'));
  assert(read('app/globals.css').includes('.network-v1014-diagnostics'));
  for(const file of ['lib/networkCoordinatorV1010.ts','lib/networkDiagnosticsV1014.ts',
    'components/NetworkPerformanceDashboardV1011.tsx']){
    const result=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
      compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}});
    assert.equal((result.diagnostics||[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,file);
  }
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  assert(/^0\.1\.0-v(?:101[4-9]|10[2-9]\d|1[1-9]\d{2}|[2-9]\d{3,})$/.test(pkg.version));assert.equal(lock.version,pkg.version);
  assert.equal(lock.packages[''].version,pkg.version);
  const release=pkg.version.split('-')[1];assert.equal(pkg.sonicRoadmapRelease,release);assert.equal(pkg.sonicFeatureRelease,release);
  assert(pkg.scripts.prebuild.startsWith('npm run test:'+release+' &&'));
  assert(pkg.scripts.prebuild.includes('npm run test:v1014 &&'));
  for(const file of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
    assert(read(file).includes('tests/v1014-network-diagnostics-regression.cjs'),file);
  assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1014(root)'));
  console.log('PASS V1014: bounded p50/p95, queue and in-flight age, sanitized provider metrics, read-only advice, account reset, UI and CI routing');
})().catch(e=>{console.error(e);process.exitCode=1;});
