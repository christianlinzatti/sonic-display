'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {createPreviewGltfCacheV654:createCache}=load('components/visualizer/previewGltfCacheV654');
const {estimateGltfCacheBytesV768:estimate}=load('components/visualizer/estimateGltfCacheBytesV768');
const removed=[];
const cache=createCache(url=>removed.push(url),3,100);
const stage=cache.retain('/stage.glb');cache.setEstimatedBytes('/stage.glb',1000);
assert.equal(cache.stats().activeEstimatedBytes,1000);
assert.equal(cache.stats().idleEstimatedBytes,0);
const make=(id,n)=>{const free=cache.retain(id);cache.setEstimatedBytes(id,n);free();};
make('a.glb',40);make('b.glb',40);make('c.glb',15);
assert.equal(cache.stats().idleEstimatedBytes,95);
assert.equal(cache.stats().idleEntries,3);
// The combined idle byte budget evicts the oldest entry even though the count fits.
make('d.glb',40);
assert.deepEqual(removed,['a.glb']);
assert.equal(cache.stats().idleEstimatedBytes,95);
// Count limit is independent of byte budget; MRU is retained.
make('e.glb',1);
assert.deepEqual(removed,['a.glb','b.glb']);
assert.deepEqual(cache.snapshot().filter(x=>!x.owners).map(x=>x.url),['c.glb','d.glb','e.glb']);
// Recently reused item must survive and the oldest must leave.
const reuse=cache.retain('c.glb');reuse();make('f.glb',1);
assert.deepEqual(removed,['a.glb','b.glb','d.glb']);
assert.ok(!removed.includes('/stage.glb'));
assert.equal(cache.snapshot().find(x=>x.url==='/stage.glb').owners,1);
// Oversized idle items are cleared on last release; active budget never forces eviction.
const large=cache.retain('oversized.glb');cache.setEstimatedBytes('oversized.glb',10000);
assert.equal(cache.snapshot().find(x=>x.url==='oversized.glb').owners,1);
assert.ok(!removed.includes('oversized.glb'));
large();large();assert.equal(removed.filter(x=>x==='oversized.glb').length,1);
// Two simultaneous consumers and immediate transient URL cleanup.
const a=cache.retain('shared.glb'),b=cache.retain('shared.glb');cache.setEstimatedBytes('shared.glb',500);
a();assert.ok(!removed.includes('shared.glb'));b();assert.equal(removed.filter(x=>x==='shared.glb').length,1);
for(const url of ['blob:test-1','data:model/gltf;base64,123']){
 const x=cache.retain(url);x();x();assert.equal(removed.filter(v=>v===url).length,1);
}
stage();assert.equal(cache.snapshot().find(x=>x.url==='/stage.glb'),undefined,'oversized stage clears on final release');
const empty=createCache(()=>{},0,0);
const p=empty.retain('zero.glb');p();assert.equal(empty.stats().entries,0);

const arr=new Float32Array(9);const shared=new Float32Array(arr.buffer);
const geo={attributes:{position:{array:arr},normal:{array:shared}},morphAttributes:{position:[{array:new Float32Array(3)}]},index:{array:new Uint16Array(3)}};
const tex={isTexture:true,image:{width:2,height:2}};
const material={map:tex,normalMap:tex};
const nodes=[{geometry:geo,material}, {geometry:geo,material}];
const scene={traverse(fn){nodes.forEach(fn);}};
const animations=[{tracks:[{times:new Float32Array(2),values:new Float32Array(4)}]}];
const bytes=estimate({scene,animations});
// 36 + 12 + 6 bytes geometry; 2x2x4x4/3 texture; 8+16 animation.
assert.equal(bytes,Math.ceil(36+12+6+64/3+8+16));
assert.equal(estimate({scene,animations}),bytes,'scene estimate is memoized');
assert.equal(estimate({scene:null}),0);
const hook=fs.readFileSync('components/visualizer/usePreviewGltfCacheV654.ts','utf8');
assert.match(hook,/createPreviewGltfCacheV654\(url=>useGLTF\.clear\(url\),6,96\*1024\*1024\)/);
assert.match(hook,/previewCache\.setEstimatedBytes\(url,estimatedBytes\)/);
assert.match(hook,/return release/);
const stageSource=fs.readFileSync('components/visualizer/GltfDancerAvatarV492.tsx','utf8');
assert.match(stageSource,/usePreviewGltfCacheV654\(assetUrl \?\? url\)/);
assert.match(stageSource,/usePreviewGltfCacheV654\(props\.animationUrl\)/);
assert.match(stageSource,/usePreviewGltfCacheV654\(props\.sharedMotionUrlV531\)/);
const browser=fs.readFileSync('components/visualizer/GpuMemoryStressV767.tsx','utf8');
assert.match(browser,/usePreviewGltfCacheV654\(url\)/);
assert.match(browser,/getPreviewGltfCacheStatsV768\(/);
console.log('PASS V768: idle byte & count budgets, true LRU, pinned stage/duets, transient URLs, dedup geometry/texture/motion estimation and GLB integrations');
