'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const loader=require('./helpers/loader-v733.cjs')();
const {NetworkCoordinatorV1010,NetworkErrorV1010}=loader('lib/networkCoordinatorV1010');
const {transpileModule,ScriptTarget,ModuleKind,JsxEmit,DiagnosticCategory}=require('./typescript-loader.cjs');
const sleep=(ms=0)=>new Promise(r=>setTimeout(r,ms));
const gate=()=>{let release;const p=new Promise(r=>{release=r;});return {p,release};};
(async()=>{
  const c=new NetworkCoordinatorV1010({action:1,playback:1,regular:1,optional:1},1,3,1);
  let updates=0;
  const unsubscribe=c.subscribeTelemetryV1011(()=>{updates++;});
  const hold=gate();const opts={key:'song:secret',account:'secret-user',provider:'spotify',priority:'lyrics',ttlMs:100,
    execute:async()=>{await hold.p;return 42;}};
  const a=c.request(opts);const b=c.request(opts);
  await sleep();
  let metrics=c.snapshotV1011();
  assert.equal(metrics.counters.joined,1);assert.equal(metrics.inFlight.regular,1);
  assert.equal(metrics.counters.started,1);
  assert(metrics.providers.some(p=>p.name==='Spotify'&&p.active===1));
  // Queued optional work is bounded and deliberate user actions retain their lane.
  const q=c.request({key:'queue',provider:'https://internal.example/credentials',priority:'lyrics',execute:async()=>4});
  const qCancelled=assert.rejects(q,/cancel/);
  await sleep();assert.equal(c.snapshotV1011().queue,1);
  const denied=c.request({key:'low-value',provider:'spotify',priority:'optional',execute:async()=>2});
  await assert.rejects(denied,/ausgelastet/);
  assert.equal(c.snapshotV1011().counters.queueDropped,1);
  assert.equal(await c.request({key:'deliberate:follow',provider:'spotify',priority:'action',retry:0,execute:async()=>true}),true);
  await qCancelled;
  hold.release();assert.equal(await a,42);assert.equal(await b,42);
  assert.equal(await c.request(opts),42);
  metrics=c.snapshotV1011();
  assert.equal(metrics.counters.completed,2); // Shared lyrics and deliberate action.
  assert.equal(metrics.counters.cacheHits,1);
  assert.equal(metrics.peakQueue,1);
  assert.equal(metrics.queue,0);assert(metrics.averageLatencyMs>=0);
  assert(updates>0);
  // Response objects are snapshots: consumer mutation cannot affect coordinator state.
  metrics.counters.completed=10000;metrics.inFlight.regular=999;
  assert.equal(c.snapshotV1011().counters.completed,2);
  assert.equal(c.snapshotV1011().inFlight.regular,0);
  // Provider labels, failure types and returned JSON must never include request identity.
  await assert.rejects(c.request({key:'secret:token:xyz',provider:'https://internal.example/credentials',retry:0,
    execute:async()=>{throw new NetworkErrorV1010('my-password-in-error',401);}}),/my-password/);
  let snap=JSON.stringify(c.snapshotV1011());
  for(const sensitive of ['secret-user','song:secret','secret:token','my-password','internal.example'])
    assert(!snap.includes(sensitive),`private data leaked: ${sensitive}`);
  assert(snap.includes('Anmeldung'));assert(snap.includes('Weitere'));
  await assert.rejects(c.request({key:'rate',provider:'spotify',priority:'playback',retry:0,
    execute:async()=>{throw new NetworkErrorV1010('429',429,2300);}}),/429/);
  metrics=c.snapshotV1011();
  assert.equal(metrics.counters.rateLimits,1);
  assert(metrics.providers.some(p=>p.name==='Spotify'&&p.blockedForMs>1500));
  assert.equal(metrics.lastFailure,'Rate-Limit');
  c.setAccount('new-account');metrics=c.snapshotV1011();
  assert.equal(metrics.counters.completed,0);assert.equal(metrics.counters.rateLimits,0);
  assert.equal(metrics.cacheEntries,0);assert.equal(metrics.providers.length,0);
  assert(metrics.queue===0);await sleep();assert(updates>0);
  unsubscribe();
  // Component is passive, integrated with the existing dashboard and transpiles.
  const panel=read('components/NetworkPerformanceDashboardV1011.tsx');
  const host=read('components/ServiceStatusDashboardV667.tsx');
  assert(panel.includes('subscribeTelemetryV1011')&&panel.includes('snapshotV1011'));
  assert(!panel.includes('fetch(')&&!panel.includes('localStorage'));
  assert(host.includes('<NetworkPerformanceDashboardV1011/>'));
  assert(read('app/globals.css').includes('.network-v1011-stats'));
  for(const filename of ['lib/networkCoordinatorV1010.ts','components/NetworkPerformanceDashboardV1011.tsx']){
    const result=transpileModule(read(filename),{fileName:filename,reportDiagnostics:true,
      compilerOptions:{target:ScriptTarget.ES2022,module:ModuleKind.CommonJS,jsx:JsxEmit.ReactJSX}});
    assert.equal((result.diagnostics||[]).filter(d=>d.category===DiagnosticCategory.Error).length,0,filename);
  }
  const pkg=JSON.parse(read('package.json'));const lock=JSON.parse(read('package-lock.json'));
  assert.match(pkg.version,/^0\.1\.0-v\d+$/);
  const current=Number(pkg.version.split('-v')[1]);assert(current>=1011);
  assert.equal(pkg.version,lock.version);
  assert.equal(pkg.version,lock.packages[''].version);
  assert.equal(pkg.sonicRoadmapRelease,'v'+current);assert.equal(pkg.sonicFeatureRelease,'v'+current);
  assert(pkg.scripts.prebuild.startsWith('npm run test:v'+current+' &&'));
  assert(pkg.scripts.prebuild.includes('npm run test:v1011 && npm run test:v1011:types'));
  const {resolveMetadata}=require('../scripts/production-workflow-metadata.cjs');
  const revision='f'.repeat(40);
  assert.equal(resolveMetadata(pkg,{revision}).release,'V'+current);
  assert.throws(()=>resolveMetadata({...pkg,sonicFeatureRelease:'v1010'},{revision}),/Feature release/);
  assert(read('scripts/production-workflow-metadata.cjs').includes('sonicFeatureRelease'));
  assert(read('scripts/vercel-production-build.cjs').includes('V1011 network performance dashboard'));
  console.log('PASS V1011: live counters, safe providers, bounded queue, priority, dedup, cache, rate limits, account reset, UI, versioned release');
})().catch(error=>{console.error(error);process.exitCode=1;});
