'use strict';
const assert=require('node:assert/strict');
const load=require('./helpers/loader-v733.cjs')();
const {NetworkCoordinatorV1010,NetworkErrorV1010,retryAfterMsV1010}=load('lib/networkCoordinatorV1010');
const wait=(ms=0)=>new Promise(r=>setTimeout(r,ms));
const gate=()=>{let release;const p=new Promise(r=>{release=r;});return {p,release};};
(async()=>{
 const c=new NetworkCoordinatorV1010({action:1,playback:1,regular:1,optional:1},2,3,2);
 // Identical requests coalesce; aborting one consumer doesn't abort another.
 let calls=0;const g=gate();const a=new AbortController();
 const opts={key:'artist:1',account:'accountA',provider:'spotify',priority:'lyrics',execute:async()=>{calls++;await g.p;return {name:'X'};}};
 const first=c.request({...opts,signal:a.signal});const second=c.request(opts);
 await wait();assert.equal(calls,1);a.abort();await assert.rejects(first,/cancel/);g.release();assert.equal((await second).name,'X');
 // A read for another account cannot receive A's cached result.
 let accountCalls=0;const make=(account)=>c.request({key:'artist:1',account,ttlMs:50,execute:async()=>++accountCalls});
 assert.equal(await make('A'),1);assert.equal(await make('A'),1);assert.equal(await make('B'),2);
 // Bounded queue and eviction of outdated optional work. Action never waits for optional lane.
 const block=gate(),start=[];
 const slow=c.request({key:'img:active',priority:'optional',retry:0,execute:async()=>{start.push('image');await block.p;return 1;}});
 await wait();
 const old=c.request({key:'img:old',priority:'optional',execute:async()=>2});
 const evicted=c.request({key:'img:new',priority:'optional',execute:async()=>3});
 const evictedCheck=assert.rejects(evicted,/cancel/);
 await wait();
 const act=await c.request({key:'follow',priority:'action',retry:0,execute:async()=>{start.push('action');return true;}});
 assert.equal(act,true);assert.deepEqual(start.slice(0,2),['image','action']);
 await evictedCheck;
 block.release();await slow;await old;
 assert.equal(c.stats().queued,0);assert(c.stats().cache<=3);
 // Separate playback capacity means multiple slow lyrics requests cannot stall now-playing.
 const capacity=new NetworkCoordinatorV1010({action:1,playback:1,regular:1,optional:1},3,3,1);
 const blockLyrics=gate(),entry=[];
 const lyricRequest=capacity.request({key:'lyrics:stuck',priority:'lyrics',execute:async()=>{entry.push('lyrics');await blockLyrics.p;return 1;}});
 await wait();
 const playback=await capacity.request({key:'now-playing',priority:'playback',execute:async()=>{entry.push('playback');return 2;}});
 assert.equal(playback,2);assert.deepEqual(entry,['lyrics','playback']);blockLyrics.release();await lyricRequest;
 let maxActive=0,active=0;const capGate=gate();
 const lyricWork=i=>capacity.request({key:'lyric:'+i,priority:'lyrics',execute:async()=>{active++;maxActive=Math.max(maxActive,active);await capGate.p;active--;return i;}});
 const firstCapacity=lyricWork(0);await wait();
 const queuedCapacity=[1,2,3].map(lyricWork);
 await assert.rejects(lyricWork(4),/ausgelastet/);
 assert.equal(maxActive,1);assert.equal(capacity.stats().queued,3);
 capGate.release();await Promise.all([firstCapacity,...queuedCapacity]);assert(maxActive<=1);
 // Stale-while-revalidate notifies subscribers; old data is available immediately.
 let v=0;const config={key:'bio:1',priority:'optional',ttlMs:4,staleMs:500,execute:async()=>++v};
 assert.equal(await c.request(config),1);await wait(9);
 const events=[];const unsubscribe=c.subscribe('bio:1',x=>events.push(x));
 assert.equal(await c.request(config),1);await wait(12);assert.deepEqual(events,[2]);unsubscribe();
 // A stale request cancelled by track change must not overwrite new cache.
 const late=gate();const ctrl=new AbortController();
 const outdated=c.request({key:'lyrics:old',priority:'lyrics',signal:ctrl.signal,retry:0,execute:async()=>{await late.p;return 'old';}});
 await wait();ctrl.abort();await assert.rejects(outdated,/cancel/);
 c.setAccount('new-spotify-user');late.release();await wait();assert.equal(c.peek('lyrics:old'),undefined);
 // Spotify 429: respect Retry-After; temporary network faults retry but auth faults don't.
 assert.equal(retryAfterMsV1010('2'),2000);
 assert.equal(retryAfterMsV1010('not-date'),0);
 let attempts=0;
 const limited=new NetworkCoordinatorV1010({action:1,playback:1,regular:1,optional:1},5,5,1);
 const started=Date.now();const rate=await limited.request({key:'rate',provider:'spotify',priority:'playback',retry:1,execute:async()=>{
  attempts++;if(attempts===1)throw new NetworkErrorV1010('rate',429,20);return 'success';
 }});
 assert.equal(rate,'success');assert.equal(attempts,2);assert(Date.now()-started>=19);
 let authCalls=0;await assert.rejects(limited.request({key:'unauthorized',provider:'spotify',retry:4,execute:async()=>{authCalls++;throw new NetworkErrorV1010('auth',401);}}),/auth/);assert.equal(authCalls,1);
 // Retry cannot multiply writes; dedicated action lane is tested with retry=0.
 let writes=0;
 await assert.rejects(limited.request({key:'write',provider:'spotify',priority:'action',retry:0,execute:async()=>{writes++;throw Error('timeout');}}),/timeout/);
 assert.equal(writes,1);
 limited.reset();assert.equal(limited.stats().queued,0);
 // A provider that never observes cancellation must free its slot immediately.
 const ignored=new NetworkCoordinatorV1010({action:1,playback:1,regular:1,optional:1},5,5,1);
 const ignoredAbort=new AbortController();
 const forever=ignored.request({key:'hung',priority:'lyrics',signal:ignoredAbort.signal,execute:()=>new Promise(()=>{})});
 await wait();assert.equal(ignored.stats().inFlight.regular,1);
 ignoredAbort.abort();await assert.rejects(forever,/cancel/);await wait(5);
 assert.equal(ignored.stats().inFlight.regular,0);
 assert.equal(await ignored.request({key:'next',priority:'lyrics',execute:async()=>42}),42);
 // Stale prefetches should also stop when their only screen switches tracks.
 const stale=new NetworkCoordinatorV1010({action:1,playback:1,regular:1,optional:1},4,4,1);
 let number=0;const read={key:'photo:old-track',priority:'optional',ttlMs:1,staleMs:500,execute:async()=>++number};
 assert.equal(await stale.request(read),1);await wait(4);
 const busyCtrl=new AbortController();const hold=gate();
 const busy=stale.request({key:'busy:provider',priority:'optional',signal:busyCtrl.signal,execute:async()=>{await hold.p;return true;}});
 await wait();const oldCtrl=new AbortController();
 assert.equal(await stale.request({...read,signal:oldCtrl.signal}),1);
 assert.equal(stale.stats().queued,1);oldCtrl.abort();await wait(5);
 assert.equal(stale.stats().queued,0);busyCtrl.abort();await assert.rejects(busy,/cancel/);hold.release();
 // A half-open provider admits just one probe even if multiple jobs are waiting.
 const probe=new NetworkCoordinatorV1010({action:1,playback:1,regular:1,optional:2},4,4,1);
 probe.circuits.set('unstable',{failures:3,openUntil:Date.now()-1,probe:false});
 const probeGate=gate();let probes=0;
 const p1=probe.request({key:'probe1',provider:'unstable',priority:'optional',execute:async()=>{probes++;await probeGate.p;return 1;}});
 await wait();const p2=probe.request({key:'probe2',provider:'unstable',priority:'optional',execute:async()=>{probes++;return 2;}});
 await wait();assert.equal(probes,1);probeGate.release();await Promise.all([p1,p2]);assert.equal(probes,2);
 // Browser JSON envelope coalesces matching GETs and does not cache authentication failures.
 let jsonCalls=0;const browser=require('./helpers/loader-v733.cjs')({}, {window:{},fetch:async url=>{
  jsonCalls++;const status=String(url).includes('unauth')?401:200;
  return new Response(JSON.stringify({number:jsonCalls}),{status,headers:{'content-type':'application/json'}});
 }});
 const {networkJsonV1010}=browser('lib/networkJsonV1010');
 const meta={provider:'spotify',priority:'lyrics',ttlMs:5000,staleMs:5000};
 const [jsonA,jsonB]=await Promise.all([networkJsonV1010('/api/spotify/details'),networkJsonV1010('/api/spotify/details')]);
 assert.equal(jsonA.ok,true);assert.equal(jsonB.ok,true);assert.equal(jsonCalls,1);
 await networkJsonV1010('/api/spotify/unauth',{},meta);
 await networkJsonV1010('/api/spotify/unauth',{},meta);assert.equal(jsonCalls,3);
 browser('lib/networkCoordinatorV1010').clientNetworkV1010.reset();
 console.log('PASS V1010: coalescing, per-consumer cancellation, isolation, queue bounds, priority slots, stale refresh, late responses, Spotify 429, auth, no write retries');
})().catch(e=>{console.error(e);process.exitCode=1;});
