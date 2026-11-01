'use strict';
/** Fault-injection tests of the shipped V654/V655 production resource helpers.
 * Deliberately use in-memory fakes; GPU/browser integration remains separate.
 */
const assert = require('node:assert/strict');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {retainImportQueueV654:retain}=load('components/importQueueRetentionV654');
const {disposeMixerClipsV654:disposeClips}=load('components/visualizer/disposeMixerClipsV654');
const {disposeClonedAvatarSkeletonsV654:disposeSkeletons}=load('components/visualizer/disposeClonedAvatarSkeletonsV654');
const {createPreviewGltfCacheV654:createCache}=load('components/visualizer/previewGltfCacheV654');
const {createSingleFlightPollingV654:createPolling}=load('hooks/playbackPollingSchedulerV654');
const {createUnifiedBackup,parseUnifiedBackup,previewUnifiedBackup,applyUnifiedBackup}=load('services/settings/unifiedBackup');

// Repeated imports: no replaced queue entry can stay reachable through the retained list.
let queue=[],evicted=0;
for(let n=0;n<960;n+=16){
 const batch=Array.from({length:16},(_,i)=>({id:String(n+i),url:`blob:test-${n+i}`}));
 const result=retain(queue,batch,60);queue=result.kept;evicted+=result.evicted.length;
 assert(queue.length<=60);
}
assert.equal(queue.length,60);assert.equal(evicted,900);
assert.deepEqual(queue.map(x=>x.id),Array.from({length:60},(_,i)=>String(i+900)));

// Eviction never clears pinned stage models, even with hundreds of preview changes.
const removed=[];const cache=createCache(url=>removed.push(url),12);
const unpin=cache.retain('/avatars/onstage.glb');
for(let n=0;n<280;n++)cache.retain(`/avatars/temp-${n}.glb`)();
assert.equal(removed.length,268);
assert(!removed.includes('/avatars/onstage.glb'));
assert.equal(cache.snapshot().filter(x=>x.owners===0).length,12);
unpin();

// Each private skeleton is disposed once; geometry and materials are not owned here.
let disposed=0;
for(let n=0;n<120;n++){
 const skeleton={dispose(){disposed++;}};
 const root={traverse(fn){fn({isSkinnedMesh:true,skeleton});fn({isSkinnedMesh:true,skeleton});}};
 assert.equal(disposeSkeletons(root),1);
}
assert.equal(disposed,120);
// Mixer clip bindings are released with clip *identity*, never with Action objects.
for(let n=0;n<150;n++){
 const clip={name:String(n)};const table=new Map([[clip,{}]]);
 disposeClips({stopAllAction(){},uncacheAction(key){table.delete(key);}},[clip,clip]);
 assert.equal(table.size,0);
}

// The backup must travel across devices, but must not export access tokens.
const data=new Map([
 ['sonic.character.motion.library.v190','{"clips":["one"]}'],
 ['sonic-display-glb-blend-presets-v492','{"presets":["b"]}'],
 ['sonic-camera-presets-v290','{"shots":[]}'],
 ['sonic-show-timeline-v354','{"cues":[]}'],
 ['spotify-auth-token','SECRET-NOT-IN-BACKUP'],
 ['sonic-display:oauth:session','SESSION-SECRET'],
]);
const store={get length(){return data.size;},key(i){return [...data.keys()][i]??null;},
 getItem(key){return data.get(key)??null;},setItem(key,value){data.set(key,value);},removeItem(key){data.delete(key);}};
const backup=createUnifiedBackup(store);
assert.equal(Object.keys(backup.entries).length,4);
assert(!JSON.stringify(backup).includes('SECRET'));
const restored=parseUnifiedBackup(JSON.stringify(backup));
for(const key of Object.keys(backup.entries))data.delete(key);
const preview=previewUnifiedBackup(restored,store);
assert.equal(applyUnifiedBackup(preview,store,{overwrite:false,groups:['avatar','timeline']}),4);
assert.equal(data.get('sonic-show-timeline-v354'),'{"cues":[]}');

const deferred=()=>{let resolve;const promise=new Promise(res=>{resolve=res;});return {promise,resolve};};
const settle=async()=>{for(let j=0;j<10;j++)await Promise.resolve();};
(async()=>{
 const timers=new Map();let nextId=0,calls=0,inFlight=0,maxInFlight=0;
 const requests=[];
 const poll=createPolling({
  run(){calls++;inFlight++;maxInFlight=Math.max(inFlight,maxInFlight);const d=deferred();requests.push(d);
   return d.promise.finally(()=>{inFlight--;});},
  delayMs:()=>1000,
  clock:{setTimeout(fn,ms){const id=++nextId;timers.set(id,{fn,ms});return id;},clearTimeout(id){timers.delete(id);}}
 });
 // 80 tab switches, including stops while promises are still unresolved.
 for(let n=0;n<80;n++){
  poll.start();poll.wake();poll.wake();await settle();
  assert.equal(timers.size,0,'no timer while request is pending');
  assert.equal(inFlight,1,'only one active request');
  if(n%2===0){poll.stop();assert.equal(timers.size,0);}
  requests.at(-1).resolve();await settle();
  assert(timers.size<=1);
  if(n%2===1){
   assert.equal(timers.size,1);
   const [id,item]=[...timers][0];timers.delete(id);item.fn();await settle();
   assert.equal(inFlight,1);
   poll.stop();assert.equal(timers.size,0);
   requests.at(-1).resolve();await settle();
  }
  poll.stop();assert.equal(timers.size,0);
 }
 assert.equal(maxInFlight,1);
 assert.equal(calls,120);
 poll.wake();await settle();assert.equal(calls,120);
 console.log(`PASS V656 stability: 960 imports/900 evictions, 280 GLTF previews, 120 skeletons, 150 mixer clips, 4-key backup, 80 Spotify lifecycles (${calls} polls)`);
})().catch(e=>{console.error(e);process.exitCode=1;});
