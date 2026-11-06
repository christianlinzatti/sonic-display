'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const loader=require('./helpers/loader-v733.cjs')();
const {NetworkCoordinatorV1010,NetworkErrorV1010}=loader('lib/networkCoordinatorV1010');
const {evaluateNetworkHealthV1012}=loader('lib/networkHealthV1012');
const ts=require('./typescript-loader.cjs');
const pause=(ms=0)=>new Promise(resolve=>setTimeout(resolve,ms));
const latch=()=>{let release;const promise=new Promise(resolve=>{release=resolve});return {promise,release};};
(async()=>{
 const c=new NetworkCoordinatorV1010({action:1,playback:1,regular:1,optional:2},5,12,1);
 let view=evaluateNetworkHealthV1012(c.snapshotV1011());
 assert.equal(view.level,'unverified');assert.equal(view.advice[0].code,'normal');
 const initial=c.snapshotV1011();
 assert.equal(evaluateNetworkHealthV1012({...initial,offline:true}).level,'offline');
 const noFetch=read('lib/networkHealthV1012.ts');
 assert(!noFetch.includes('fetch(')&&!noFetch.includes('localStorage')&&!noFetch.includes('Authorization'));
 // Repeated failures open the optional service circuit. No extra synthetic probes.
 let failures=0;
 for(let i=0;i<3;i++)await assert.rejects(c.request({key:'optional:fail:'+i,provider:'genius',priority:'optional',retry:0,
  execute:async()=>{failures++;throw new NetworkErrorV1010('temporary',503);}}),/temporary/);
 assert.equal(failures,3);
 let state=c.snapshotV1011();
 let genius=state.providers.find(provider=>provider.name==='Genius');
 assert(genius&&genius.circuitForMs>0&&genius.failureStreak===3);
 assert.equal(state.recovery.circuitsOpened,1);
 assert.equal(evaluateNetworkHealthV1012(state).level,'paused');
 assert(evaluateNetworkHealthV1012(state).advice.some(item=>item.code==='circuit'));
 // User actions aren't blocked by circuit protection on an optional provider.
 const success=await c.request({key:'action',provider:'genius',priority:'action',execute:async()=>77});
 assert.equal(success,77);
 assert(c.snapshotV1011().recovery.restored>=1);
 // Restore an open circuit: one half-open probe must block another optional request.
 c.circuits.set('genius',{failures:3,openUntil:Date.now()+30_000,probe:false});
 const probeGate=latch();let opened=0;
 const p1=c.request({key:'probe1',provider:'genius',priority:'optional',retry:0,execute:async()=>{opened++;await probeGate.promise;return 'restored';}});
 const p2=c.request({key:'probe2',provider:'genius',priority:'optional',retry:0,execute:async()=>{opened++;return 'second';}});
 await pause(5);assert.equal(opened,0);
 c.circuits.get('genius').openUntil=Date.now()-1;c.wake();
 await pause(5);assert.equal(opened,1);
 assert.equal(c.snapshotV1011().recovery.probes,1);
 assert(c.snapshotV1011().providers.find(p=>p.name==='Genius').probing);
 probeGate.release();assert.equal(await p1,'restored');assert.equal(await p2,'second');
 state=c.snapshotV1011();assert.equal(state.providers.find(p=>p.name==='Genius').circuitForMs,0);
 assert.equal(state.providers.find(p=>p.name==='Genius').failureStreak,0);
 // 429 is a provider-wide pause; even a deliberate action must honour Retry-After.
 await assert.rejects(c.request({key:'limit',provider:'spotify',priority:'action',retry:0,
  execute:async()=>{throw new NetworkErrorV1010('limited',429,30);}}),/limited/);
 state=c.snapshotV1011();assert(state.providers.find(p=>p.name==='Spotify').blockedForMs>=20);
 assert.equal(evaluateNetworkHealthV1012(state).level,'rate-limit');
 let actionStarted=false;
 const next=c.request({key:'after-limit',provider:'spotify',priority:'action',retry:0,
  execute:async()=>{actionStarted=true;return 1;}});
 await pause(5);assert.equal(actionStarted,false);
 assert.equal(await next,1);
 assert.equal(actionStarted,true);
 // Authentication issues must be explicitly resolved, not automatically retried.
 let authCalls=0;
 await assert.rejects(c.request({key:'auth',provider:'spotify',priority:'playback',retry:4,
  execute:async()=>{authCalls++;throw new NetworkErrorV1010('auth',401);}}),/auth/);
 assert.equal(authCalls,1);
 assert.equal(evaluateNetworkHealthV1012(c.snapshotV1011()).level,'login');
 // Account changes drop every secret, counter and pending recovery state.
 let serialized=JSON.stringify(c.snapshotV1011());
 for(const secret of ['optional:fail','probe1','after-limit','auth','temporary'])assert(!serialized.includes(secret));
 c.setAccount('next-session');state=c.snapshotV1011();
 assert.equal(JSON.stringify(state.recovery),JSON.stringify({staged:0,probes:0,restored:0,circuitsOpened:0}));
 assert.equal(state.providers.length,0);assert.equal(state.counters.started,0);
 // Emulate offline-to-online without issuing HTTP calls; replay is staggered.
 let online=false;const nav={get onLine(){return online;}};
 const offlineLoader=require('./helpers/loader-v733.cjs')({}, {navigator:nav});
 const OfflineCoordinator=offlineLoader('lib/networkCoordinatorV1010').NetworkCoordinatorV1010;
 const oc=new OfflineCoordinator({action:1,playback:1,regular:1,optional:2},8,10,1);
 const launches=[];
 const optional=[0,1,2].map(i=>oc.request({key:'image:'+i,provider:'genius',priority:'optional',retry:0,
  execute:async()=>{launches.push(i);return i;}}));
 await pause(5);assert.equal(launches.length,0);
 online=true;oc.wake();
 assert.equal(oc.snapshotV1011().recovery.staged,3);
 // Playback is unaffected by delayed optional reconnection work.
 assert.equal(await oc.request({key:'now-playing',priority:'playback',execute:async()=>42}),42);
 await pause(30);assert.equal(launches.length,0);
 assert.deepEqual(await Promise.all(optional),[0,1,2]);
 assert.equal(launches.length,3);
 oc.reset();assert.equal(oc.snapshotV1011().recovery.staged,0);
 const ui=read('components/NetworkPerformanceDashboardV1011.tsx');
 assert(ui.includes('evaluateNetworkHealthV1012')&&ui.includes('data-v1012-network-health'));
 assert(ui.includes('clientNetworkV1010.wake()')&&ui.includes('disabled={state.offline}'));
 assert(read('app/globals.css').includes('.network-v1012-health'));
 for(const file of ['lib/networkCoordinatorV1010.ts','lib/networkHealthV1012.ts','components/NetworkPerformanceDashboardV1011.tsx']){
  const result=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
   compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}});
  assert.equal(result.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,file);
 }
 const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
 assert.match(pkg.version,/^0\.1\.0-v\d+$/);
 const version=Number(pkg.version.split('-v')[1]);assert(version>=1012);
 assert.equal(pkg.version,lock.version);assert.equal(pkg.version,lock.packages[''].version);
 assert.equal(pkg.sonicRoadmapRelease,'v'+version);assert.equal(pkg.sonicFeatureRelease,'v'+version);
 assert(pkg.scripts.prebuild.includes('npm run test:v1012 && npm run test:v1012:types &&'));
 assert(read('scripts/vercel-production-build.cjs').includes('V1012 network health & auto recovery'));
 console.log('PASS V1012: outage diagnosis, optional circuit, half-open probe, action priority, Retry-After, auth safety, reconnection staggering, account isolation, dashboard and release');
})().catch(error=>{console.error(error);process.exitCode=1;});
