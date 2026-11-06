#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const loader=require('./helpers/loader-v733.cjs')();
const {IntelligentCacheV1017,boundedCacheLifetimeV1017}=loader('lib/intelligentCacheV1017');
const {NetworkCoordinatorV1010}=loader('lib/networkCoordinatorV1010');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 const c=new IntelligentCacheV1017(2,1024,512),make=(v,fresh=500,stale=1500)=>({value:v,freshUntil:fresh,staleUntil:stale});
 assert(c.set('a',make({text:'A'}),100));assert(c.set('b',make({text:'B'}),100));
 assert.equal(c.get('a',200).value.text,'A');
 assert(c.set('c',make({text:'C'}),100));
 assert.equal(c.get('b',200),undefined,'LRU removes the least recently used record');
 assert.equal(c.snapshot().evicted,1);
 assert.equal(c.get('a',1501),undefined,'expired data cannot be returned');
 assert.equal(c.snapshot().expired,1);
 assert.equal(c.set('huge',make('x'.repeat(600)),100),false,'oversized response must be rejected');
 assert.equal(c.snapshot().oversized,1);
 assert.equal(c.size,1,'too-large items must not flush the existing cache');
 const tight=new IntelligentCacheV1017(30,75,90);
 assert(tight.set('one',make('x'.repeat(20)),100));
 assert(tight.set('two',make('x'.repeat(20)),100));
 assert(tight.snapshot().usedKiB<=1,'telemetry must not exceed budget');
 assert(tight.snapshot().evicted>0,'byte budget evicts oldest even under entry limit');
 const hot=new IntelligentCacheV1017(2);
 hot.set('hot',make('ok',30000,60000),100);
 assert(!hot.shouldWarm('hot',26000),'a single read is not enough');
 for(let n=0;n<3;n++)hot.get('hot',26000);
 assert(hot.shouldWarm('hot',26000),'hot near-expiry data is eligible');
 hot.markWarmed('hot');assert(!hot.shouldWarm('hot',26000),'one warm per original cache entry');
 hot.clear();assert.equal(hot.snapshot().warmups,0,'clear resets private session counters');
 assert.equal(boundedCacheLifetimeV1017('spotify','/api/spotify/current',20000,20000).ttl,0,'never cache live playback');
 assert.equal(boundedCacheLifetimeV1017('spotify','/api/spotify/artists/follow?ids=x',20000,999999).ttl,15000);
 assert.equal(boundedCacheLifetimeV1017('stage-content','/content',999999999,999999999).ttl,1800000);
 assert.equal(boundedCacheLifetimeV1017('other','/data',0,999999).stale,0,'no stale without a fresh TTL');
 const network=new NetworkCoordinatorV1010({action:1,playback:1,regular:1,optional:1},5,3,2);
 network.setAccount('private-a');let calls=0;
 const opts={key:'optional-hot-image',provider:'stage-content',priority:'optional',ttlMs:30000,staleMs:30000,retry:0,
  execute:async()=>({data:++calls})};
 const realNow=Date.now;let clock=realNow();
 try{
  Date.now=()=>clock;
  assert.equal((await network.request(opts)).data,1);
  clock+=18000;
  for(let i=0;i<3;i++)assert.equal((await network.request(opts)).data,1,'readers keep cached data during warming');
  await pause(15);
  assert.equal(calls,2,'hot optional entry is warmed exactly once');
  assert.equal((await network.request(opts)).data,2,'subsequent reads see refreshed result');
  assert.equal(network.snapshotV1011().cacheV1017.warmups,1);
  assert.equal(network.snapshotV1011().limits.action,1,'user action lane unchanged');
  assert.equal(network.snapshotV1011().limits.playback,1,'playback lane unchanged');
  const live={key:'/api/spotify/current',provider:'spotify',priority:'playback',ttlMs:30000,staleMs:100000,
   execute:async()=>({live:++calls})};
  await network.request(live);await network.request(live);
  assert.equal(network.snapshotV1011().cacheV1017.entries,1,'playback never cached even when caller requests TTL');
  network.setAccount('private-b');
  assert.equal(network.snapshotV1011().cacheV1017.entries,0);
  assert.equal(network.snapshotV1011().cacheV1017.hits,0);
  assert(!JSON.stringify(network.snapshotV1011().cacheV1017).includes('private-a'),'snapshot must not include account IDs or keys');
 }finally{Date.now=realNow;network.reset();}
 const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
 const current=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version);
 assert(current&&Number(current[1])>=1017);
 assert.equal(pkg.sonicFeatureRelease,`v${current[1]}`);assert.equal(pkg.sonicRoadmapRelease,`v${current[1]}`);
 assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
 assert(pkg.scripts.prebuild.startsWith(`npm run test:v${current[1]} &&`));
 assert.equal(pkg.scripts['test:v1017'],'node tests/v1017-intelligent-cache-regression.cjs');
 assert(read('components/NetworkPerformanceDashboardV1011.tsx').includes('data-v1017-cache-manager'));
 for(const file of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
  assert(read(file).includes('tests/v1017-intelligent-cache-regression.cjs'));
 assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1017(root)'));
 const source=read('lib/intelligentCacheV1017.ts');
 for(const banned of ['localStorage','indexedDB','sessionStorage','caches.open','fetch('])assert(!source.includes(banned),`RAM-only cache: ${banned}`);
 const ts=require('./typescript-loader.cjs');
 for(const file of ['lib/intelligentCacheV1017.ts','lib/networkCoordinatorV1010.ts','components/NetworkPerformanceDashboardV1011.tsx']){
  const report=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
   compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}});
  assert.equal((report.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,file);
 }
 console.log('PASS V1017: LRU, memory budget, oversize, expired records, safe TTLs, hot warmup, protected priority lanes, private telemetry, account reset and CI routing');
})().catch(error=>{console.error(error);process.exitCode=1});
