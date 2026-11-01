'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {retainImportQueueV654}=load('components/importQueueRetentionV654');
const {disposeClonedAvatarSkeletonsV654}=load('components/visualizer/disposeClonedAvatarSkeletonsV654');
const {createSingleFlightPollingV654}=load('hooks/playbackPollingSchedulerV654');
const read=file=>fs.readFileSync(file,'utf8');

// Reproduce reported case: 90 imports, at most 60 live URLs, 30 immediately released.
let retained=[],revoked=[];
for(let batch=0;batch<3;batch++){
 const next=Array.from({length:30},(_,i)=>({id:String(batch*30+i),url:'blob:'+String(batch*30+i)}));
 const result=retainImportQueueV654(retained,next,60);
 result.evicted.forEach(x=>revoked.push(x.url));
 retained=result.kept;
}
assert.equal(retained.length,60);assert.equal(revoked.length,30);
assert.deepEqual(retained.map(x=>Number(x.id)),Array.from({length:60},(_,i)=>i+30));
assert.deepEqual(revoked,Array.from({length:30},(_,i)=>'blob:'+i));
const empty=retainImportQueueV654(retained,[],60);
assert.equal(empty.evicted.length,0);
const importer=read('components/CharacterMotionBatchInstaller.tsx');
assert(importer.includes('releaseQueueEntries(evicted)'));
assert(importer.includes('URL.revokeObjectURL(url)')&&importer.includes('ownedBlobUrls.current.delete(item.id)'));
assert(importer.includes('ownedBlobUrls.current.clear();queueRef.current=[]'));
assert(!importer.includes('blobUrls.current.push('));

// Several skinned meshes can share one private Skeleton; never dispose it twice.
let cleanedA=0,cleanedB=0,geometryCalls=0;
const skA={dispose(){cleanedA++;}},skB={dispose(){cleanedB++;}};
const cloned={traverse(fn){for(const node of [
 {isSkinnedMesh:true,skeleton:skA}, {isSkinnedMesh:true,skeleton:skA},
 {isSkinnedMesh:false,skeleton:skA}, {isSkinnedMesh:true,skeleton:skB},
 {isSkinnedMesh:true,skeleton:null}, {dispose(){geometryCalls++;}},
])fn(node);}};
assert.equal(disposeClonedAvatarSkeletonsV654(cloned),2);
assert.equal(cleanedA,1);assert.equal(cleanedB,1);assert.equal(geometryCalls,0);
for(const component of ['GltfDancerAvatarV492','AvatarPreview3D','AvatarSkeletonEditor',
 'MultiAvatarCameraCanvasV399','MultiAvatarPreviewV326','RapRealAvatarPreviewV409']){
 assert(read(`components/visualizer/${component}.tsx`).includes('disposeClonedAvatarSkeletonsV654('),component);
}

function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
const nextMicrotasks=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
(async()=>{
 let clockId=0,requests=0,delay=5000;
 const timers=new Map();
 const clock={setTimeout(fn,ms){const id=++clockId;timers.set(id,{fn,ms});return id;},clearTimeout(id){timers.delete(id);}};
 const jobs=[];
 const poll=createSingleFlightPollingV654({run(){requests++;const job=deferred();jobs.push(job);return job.promise;},delayMs:()=>delay,clock});
 poll.start();poll.start();poll.wake();poll.wake();
 await nextMicrotasks();
 assert.equal(requests,1,'tab switch while request in flight must not start another');
 assert.equal(timers.size,0,'no timer while request in flight');
 jobs[0].resolve();await nextMicrotasks();
 assert.equal(timers.size,1,'only one timer after request settles');
 delay=10000;
 poll.wake();poll.wake();await nextMicrotasks();
 assert.equal(requests,2,'multiple visibility events may start only one new request');
 assert.equal(timers.size,0);
 jobs[1].reject(new Error('spotify temporarily unavailable'));await nextMicrotasks();
 assert.equal(timers.size,1);assert.equal([...timers.values()][0].ms,10000,'new delay must be honored');
 const last=[...timers.values()][0];last.fn();await nextMicrotasks();
 assert.equal(requests,3);assert.equal(timers.size,0);
 poll.stop();jobs[2].resolve();await nextMicrotasks();
 assert.equal(timers.size,0,'no timer may survive cleanup');
 poll.wake();await nextMicrotasks();assert.equal(requests,3,'stopped poll does not issue requests');
 const hook=read('hooks/usePlaybackPolling.ts');
 assert(hook.includes('pending.current')&&hook.includes('generation.current'));
 assert(hook.includes('poll.stop()')&&hook.includes('poll.wake()'));
 assert(!hook.includes('setRetryDelay('),'backoff state must not restart React effect');
 console.log('PASS V654 resource lifecycle: 90/60/30 Blob URLs, clone-only skeleton disposal, single-flight Spotify polling, visibility, backoff, cleanup');
})().catch(error=>{console.error(error);process.exitCode=1;});
