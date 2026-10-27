'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
require('./helpers/threeAvatarSourcesV492.cjs').install();
const {load}=require('./helpers/ts-loader-v404.cjs');
const {profileAvatarBodyV507:profile,createBodyRegistryV507:registry}=load('components/visualizer/avatarBodyAwarenessV507');
const {planMultiAvatarCollisionV506:collision}=load('components/visualizer/multiAvatarCollisionAvoidanceV506');
const humanoid={
  head:[0,1.75,0],leftShoulder:[-.25,1.36,0],rightShoulder:[.25,1.36,0],
  leftElbow:[-.63,1.1,0],rightElbow:[.63,1.1,0],
  leftWrist:[-.87,.77,0],rightWrist:[.87,.77,0],
  leftHip:[-.15,.91,0],rightHip:[.15,.91,0],
  leftKnee:[-.15,.46,.05],rightKnee:[.15,.46,.05],
  leftFoot:[-.15,.05,.12],rightFoot:[.15,.05,.12],
};
const a=profile({landmarks:humanoid,bounds:{height:1.8,width:1.92,depth:.4}});
assert.equal(a.source,'skeletal');
assert.equal(a.confidence,1);
assert(a.shoulderWidth>.49&&a.shoulderWidth<.51);
assert(a.armLength>.7&&a.legLength>.8&&a.height>1.6);
assert(a.torsoRadius>.42&&a.torsoRadius<=.58&&a.armReach>.12);
assert.deepEqual(profile({landmarks:humanoid,bounds:{height:1.8,width:1.92,depth:.4}}),a);
const small={...humanoid,leftShoulder:[-.18,1.36,0],rightShoulder:[.18,1.36,0]};
const slender=profile({landmarks:small,bounds:{height:1.75,width:1.4,depth:.35}});
assert(slender.torsoRadius<a.torsoRadius);
const tall=profile({landmarks:humanoid,bounds:{height:1.8,width:1.8,depth:.4},scale:1.15});
assert(tall.height>a.height&&tall.armLength>a.armLength);
const boxOnly=profile({landmarks:{},bounds:{height:1.7,width:1.55,depth:.3}});
assert.equal(boxOnly.source,'bounds');assert(boxOnly.confidence<.5);
assert.equal(boxOnly.shoulderWidth,null,'never invent shoulders from T-pose bounds');
assert(boxOnly.torsoRadius>=.30&&boxOnly.torsoRadius<=.58);
const invalid=profile({landmarks:{leftShoulder:[NaN,0,0],rightShoulder:[1,0,0]},bounds:{height:Infinity,width:Infinity,depth:0},scale:NaN});
assert.equal(invalid.source,'fallback');assert.equal(invalid.confidence,0);
assert(Number.isFinite(invalid.torsoRadius)&&Number.isFinite(invalid.armReach));
const store=registry();
assert.equal(store.get(0),undefined);
store.set(0,'modelA',a);store.set(1,'modelB',slender);store.set(4,'badSlot',a);
assert.equal(store.get(0),a);assert.equal(store.get(1),slender);assert.equal(store.get(4),undefined);
store.clear(0,'staleModel');assert.equal(store.get(0),a,'stale model cleanup must not unregister new one');
store.set(0,'modelC',tall);store.clear(0,'modelA');assert.equal(store.get(0),tall);
store.clear(0,'modelC');assert.equal(store.get(0),undefined);
store.set(2,'empty',invalid);assert.equal(store.get(2),undefined,'unknown rig must use V506 fallback');
const safety={positions:[[0,0,0],[1.12,0,0]],targets:[[0,0,0],[1.12,0,0]],
 count:2,playing:true,reducedMotion:false,manualPriority:false,automaticGroup:true,tier:'high'};
const base=collision(safety),wide=collision({...safety,torsoRadii:[a.torsoRadius,a.torsoRadius],armReaches:[a.armReach,a.armReach]});
const narrow=collision({...safety,torsoRadii:[.30,.30],armReaches:[.085,.085]});
assert(wide.slots[0].risk>=base.slots[0].risk);
assert(narrow.slots[0].risk<wide.slots[0].risk,'measured dimensions must affect existing safety planner');
assert(collision({...safety,manualPriority:true,torsoRadii:[a.torsoRadius,a.torsoRadius]}).active===false);
assert(collision({...safety,reducedMotion:true,torsoRadii:[a.torsoRadius,a.torsoRadius]}).active===false);
let samples=0;
for(let k=0;k<30000;k++){
 const gain=.25+(k%23)*.13;
 const landmarks={...humanoid,leftShoulder:[-.25*gain,1.36,0],rightShoulder:[.25*gain,1.36,0]};
 const m=profile({landmarks,bounds:{height:1.78,width:1.75,depth:.4},scale:1+(k%11)*.02});
 assert(['skeletal','bounds','fallback'].includes(m.source));
 for(const v of [m.torsoRadius,m.armReach,m.confidence])assert(Number.isFinite(v));
 assert(m.torsoRadius>=.30&&m.torsoRadius<=.58&&m.armReach>=.085&&m.armReach<=.19);
 const out=collision({...safety,torsoRadii:[m.torsoRadius,a.torsoRadius],armReaches:[m.armReach,a.armReach],
    positions:[[0,0,k%7*.04],[1.12,0,k%5*.04]],targets:[[0,0,k%7*.04],[1.12,0,k%5*.04]]});
 assert(out.slots.length===2&&out.slots.every(slot=>Number.isFinite(slot.risk)));
 samples++;
}
const dir='components/visualizer/';
const glb=fs.readFileSync(dir+'GltfDancerAvatarV492.tsx','utf8');
const group=fs.readFileSync(dir+'GroupDancersV326SceneV492.tsx','utf8');
const duo=fs.readFileSync(dir+'DanceFormationActorsV492.tsx','utf8');
const context=fs.readFileSync(dir+'ThreeAvatarContextsV492.tsx','utf8');
const reader=fs.readFileSync(dir+'measureGlbBodyV507.ts','utf8');
assert(glb.includes('measureGlbBodyV507(scene,avatarScale)')&&glb.includes('bodyRegistryV507?.set(workloadSlot')&&glb.includes('bodyRegistryV507?.clear(workloadSlot'));
assert(reader.includes('new WeakMap')&&reader.includes('scene.traverse')&&reader.includes('isBone')&&reader.includes('new Box3'));
assert(context.includes('AvatarBodyContextV507=createContext'));
for(const source of [group,duo]){
 assert(source.includes('<AvatarBodyContextV507.Provider value={bodyRegistryV507.current}>'));
 assert(source.includes('torsoRadii:')&&source.includes('armReaches:'));
 assert(source.includes('planMultiAvatarCollisionV506'));
}
assert(group.includes('safeCollisionDepthV506')&&group.includes('groundDecisionsV494'));
assert(duo.includes('softenCollisionGestureV506')&&!duo.includes('safeCollisionDepthV506('));
console.log(`PASS V507: ${samples.toLocaleString('en-US')} deterministic body profiles, rest-pose measurement, stale-cleanup registry, 2-4 avatar body-envelope integration`);
