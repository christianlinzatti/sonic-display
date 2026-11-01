'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planMotionPlaybackV659:plan,keepCurrentMotionWhileLoadingV659:hold}=load('components/visualizer/motionPlaybackWindowV659');
const motions=Array.from({length:250},(_,i)=>({id:`motion-${i+1}`,url:`/api/motions/${i+1}.glb`}));
// Catch the original regression: the renderer had only the newest 24 entries.
const oldest=plan(motions,'motion-1',[],undefined,6);
assert.equal(oldest.targets[0].id,'motion-1');
assert(hold('motion-1',[]));
assert(!hold('motion-1',['motion-1']));
// Last, middle, and first entries are all individually loadable.
for(const i of [1,24,25,26,60,100,249,250]){
 const result=plan(motions,`motion-${i}`,[],undefined,6);
 assert.deepEqual(result.targets,[motions[i-1]],`motion ${i} must load on demand`);
}
// Predictive mode does not displace the current/active animation or exceed capacity.
const upcoming=motions.slice(1,40);
const window=plan(motions,'motion-250',upcoming,'motion-150',6);
assert.deepEqual(window.targets.map(x=>x.id),['motion-250','motion-150','motion-2','motion-3','motion-4','motion-5']);
assert.equal(window.pinned.length,6);
// URLs are checked against the installed catalog (no stale injected plans).
assert.deepEqual(plan(motions,'motion-4',[{id:'motion-2',url:'/wrong.glb'},{id:'missing',url:'/ghost.glb'}],undefined,5).targets,[motions[3]]);
assert.deepEqual(plan([], 'motion-1', [], 'motion-2', 6).targets,[]);
// Simulate 100 sequential selections with LRU eviction: the cache is bounded
// while the whole 250-entry catalog remains addressable.
const cache=new Map();let decodes=0;
for(let i=0;i<100;i++){
 const target=plan(motions,`motion-${i+1}`,[],i>0?`motion-${i}`:'',6);
 for(const item of target.targets){if(!cache.has(item.id)){decodes++;cache.set(item.id,{name:item.id});}}
 for(const key of [...cache.keys()])if(cache.size>6&&!target.pinned.includes(key))cache.delete(key);
 assert(cache.size<=6);
 assert(cache.has(`motion-${i+1}`));
}
assert.equal(decodes,100);
// Prior versions silently discarded every item beyond 250. Larger catalog
// storage and the automatic profile index now preserve all entries.
const {sanitizeCharacterMotionStore:sanitize}=load('components/visualizer/characterMotionLibrary');
const extended=Array.from({length:620},(_,i)=>({id:`extra-${i}`,avatarId:'a',name:`Motion ${i}`,url:`/m/${i}.glb`,genre:'',bpmMin:0,bpmMax:300,section:'any',addedAt:i}));
const stored=sanitize({version:1,automatic:true,motions:extended});
assert.equal(stored.motions.length,620);
assert.equal(stored.motions[0].id,'extra-0');
assert.equal(stored.motions.at(-1).id,'extra-619');
const profileSource=fs.readFileSync(path.join(__dirname,'../components/visualizer/automaticMotionIntelligenceV438.ts'),'utf8');
assert(!profileSource.includes('.filter(m=>m.avatarId===avatarId).slice(0,250)'), 'automatic catalog must keep all motions');
const previewSource=fs.readFileSync(path.join(__dirname,'../components/visualizer/rapMotionPreviewV410.ts'),'utf8');
assert(!previewSource.includes('.slice(0,250)'), 'motion preview must include every installed clip');

const root=path.join(__dirname,'..');const source=fs.readFileSync(path.join(root,'components/visualizer/GltfDancerAvatarV492.tsx'),'utf8');
assert(!source.includes('library.motions.filter(m => m.avatarId === avatarModelId).slice(-24)'));
for(const signature of ['planMotionPlaybackV659','setRequestedMotionIdV659(requestedIdV659)','keepCurrentMotionWhileLoadingV659','prefetchGeneration.current','Library:${target.id}:${index}'])assert(source.includes(signature),signature);
assert(!source.includes('Array.from({length: installed.length}, () => [])'),'do not eagerly allocate/retarget the full library');
console.log('PASS: V659 620 stored motions, 250 motion choices, 100 demand switches, bounded cache and predictive queue');
