"use strict";
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const read=name=>fs.readFileSync(name,'utf8');
const {disposeDancePostProcessingV654}=load('components/visualizer/disposeDancePostProcessingV654');
const {withProviderDeadlineV654}=load('services/lyrics/providerDeadlineV654');
const {createPreviewGltfCacheV654}=load('components/visualizer/previewGltfCacheV654');
const {releaseMicrophoneResourcesV654}=load('hooks/microphoneResourceCleanupV654');
const {createSingleFlightPollingV654}=load('hooks/playbackPollingSchedulerV654');

// Repeated quality changes must dispose pass-owned targets/materials as well as composer.
let composerDisposes=0,targetDisposes=0,materialDisposes=0;
for(let i=0;i<12;i++){
 const makePass=(targets,materials)=>({dispose(){targetDisposes+=targets;materialDisposes+=materials;}});
 const fx=makePass(2,2), shader=makePass(0,1), output=makePass(0,1);
 disposeDancePostProcessingV654({dispose(){composerDisposes++;}},[fx,shader,output,shader]);
}
assert.equal(composerDisposes,12);assert.equal(targetDisposes,24);assert.equal(materialDisposes,48);
const post=read('components/visualizer/DancePostProcessingV468.tsx');
assert(post.includes('disposeDancePostProcessingV654(composer,[render,shader,echo,output])'));
assert(post.includes('const echo=new AfterimagePass'));

// Preview cache: retain concurrently used models, release 40 sequential previews,
// and never clear an active model. Object URLs are cleared immediately.
const cleared=[];
const cache=createPreviewGltfCacheV654(url=>cleared.push(url),12);
const pinned=cache.retain('/avatars/active.glb');
const twinA=cache.retain('/avatars/shared.glb');
const twinB=cache.retain('/avatars/shared.glb');
twinA();assert.equal(cache.snapshot().find(e=>e.url==='/avatars/shared.glb').owners,1);
for(let i=0;i<40;i++){const release=cache.retain('/avatars/preview-'+i+'.glb');release();}
assert.equal(cleared.filter(x=>x.includes('/preview-')).length,28,'40 sequential previews must keep no more than 12 idle models');
assert(!cleared.includes('/avatars/active.glb'));
assert(!cleared.includes('/avatars/shared.glb'));
const blobRelease=cache.retain('blob:temporary');blobRelease();blobRelease();
assert.equal(cleared.filter(x=>x==='blob:temporary').length,1,'blob URL cache is immediately dropped');
pinned();twinB();
assert(cache.snapshot().filter(e=>e.owners===0).length<=12);
const hook=read('components/visualizer/usePreviewGltfCacheV654.ts');
assert(hook.includes('useGLTF.clear(url)')&&hook.includes('previewCache.retain(url)'));
for(const file of ['AvatarPreview3D','PreviewGlbPortraitV560','RealConcertPreviewCanvasV513','AvatarEditor','AvatarSkeletonEditor']){
 assert(read('components/visualizer/'+file+'.tsx').includes('usePreviewGltfCacheV654(url)'),file);
}

// Cleanup on AudioContext.resume rejection: all device resources are closed at once.
let stops=0,closes=0,terminations=0,cancels=0;
const mic={frame:27,cancelFrame(id){assert.equal(id,27);cancels++;},
 stream:{getTracks(){return [{stop(){stops++;}},{stop(){stops++;}}];}},
 context:{state:'suspended',close(){closes++;return Promise.reject(new Error('device already gone'));}},
 worker:{terminate(){terminations++;}}};
releaseMicrophoneResourcesV654(mic);
assert.deepEqual([stops,closes,terminations,cancels],[2,1,1,1]);
const source=read('hooks/useMicrophoneAnalysis.ts');
assert(source.includes('if (context.state === "suspended") await context.resume();'));
assert(source.includes('cleanup();')&&source.includes('releaseMicrophoneResourcesV654('));
assert(source.includes('if (cancelled) return;'),'late context resume must not start an abandoned analyser');

// The polling scheduler MUST complete even when optional Lyrics is stuck.
const later=()=>{let resolve;const promise=new Promise(done=>resolve=done);return {promise,resolve};};
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
(async()=>{
 let spotifyCalls=0,lyricCalls=0;
 const pendingLyrics=[];const timers=new Map();let serial=0;
 const poll=createSingleFlightPollingV654({
  run:async()=>{spotifyCalls++;const lyrics=later();pendingLyrics.push(lyrics);lyricCalls++;void lyrics.promise;},
  delayMs:()=>5000,
  clock:{setTimeout(fn,ms){const id=++serial;timers.set(id,{fn,ms});return id;},clearTimeout(id){timers.delete(id);}},
 });
 poll.start();await flush();
 for(let i=0;i<2;i++){assert.equal(timers.size,1);const [id,timer]=[...timers][0];timers.delete(id);timer.fn();await flush();}
 assert.equal(spotifyCalls,3);assert.equal(lyricCalls,3);assert.equal(pendingLyrics.length,3);
 poll.stop();assert.equal(timers.size,0);
 const playback=read('hooks/usePlaybackPolling.ts');
 assert(!/await\s+fetchLyrics\(/.test(playback));
 assert(playback.includes('controller.signal')&&playback.includes('lyricsAbort.current?.abort()'));
 const genius=read('services/lyrics/providers/genius.ts');
 assert(genius.includes('withDeadlineV734('));
 assert(!genius.includes('import("genius-lyrics-api")')); // V1009: abort the actual transport too.
 const whole=read('services/lyrics/server.ts');
 assert(whole.includes('requests.map(request=>withProviderDeadlineV654(request,9_000))'));
 const stalled=new Promise(()=>{});
 await assert.rejects(withProviderDeadlineV654(stalled,20),/timeout/);
 assert.equal(await withProviderDeadlineV654(Promise.resolve('sync'),20),'sync');
 console.log('PASS V654 resilience: 12 compositor cleanups, 40 preview cache entries bounded to 12, microphone failure teardown, 3 Spotify cycles despite stuck lyrics, provider deadlines');
})().catch(err=>{console.error(err);process.exitCode=1;});
