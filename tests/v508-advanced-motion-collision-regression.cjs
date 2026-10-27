'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const Module=require('node:module');
require('./helpers/threeAvatarSourcesV492.cjs').install();
const {load}=require('./helpers/ts-loader-v404.cjs');
const {segmentDistanceV508:distance,smoothRiskV508:risk,validCapsuleV508:valid,
  planAnimatedCollisionV508:plan,mergeAnimatedSlotV508:merge,
  createAnimatedBodyRegistryV508:registry}=load('components/visualizer/animatedCollisionV508');
const point=(x,y,z)=>[x,y,z];
const arm=(x0,y0,z0,x1,y1,z1,r=.1)=>({a:point(x0,y0,z0),b:point(x1,y1,z1),radius:r,part:'arm'});
const torso=(x,z)=>({a:point(x,.7,z),b:point(x,1.55,z),radius:.20,part:'torso'});
const sample=(at,...capsules)=>({at,capsules});
const base={count:2,now:2,playing:true,reducedMotion:false,manualPriority:false,tier:'high'};
const close=[sample(1.95,torso(0,0),arm(0,1.2,0,.75,1.2,0)),
             sample(1.95,torso(1.4,0),arm(1.4,1.2,0,.68,1.2,0))];
const far=[sample(1.95,torso(0,0),arm(0,1.2,0,.38,1.2,0)),
           sample(1.95,torso(2.3,0),arm(2.3,1.2,0,1.92,1.2,0))];
assert(Math.abs(distance(point(0,0,0),point(1,0,0),point(.5,-1,0),point(.5,1,0)))<1e-9,'crossing segments');
assert(Math.abs(distance(point(0,0,0),point(1,0,0),point(0,0,1),point(1,0,1))-1)<1e-9,'parallel segments');
assert(Math.abs(distance(point(0,0,0),point(0,0,0),point(2,0,0),point(2,0,0))-2)<1e-9,'degenerate');
assert.equal(distance(point(NaN,0,0),point(0,0,0),point(0,0,0),point(1,0,0)),Infinity);
assert.equal(valid(arm(0,0,0,0,0,0)),false);
assert.equal(valid(arm(0,0,0,1,0,0,99)),false);
assert.equal(risk(Infinity),0);assert.equal(risk(1),0);assert.equal(risk(-.2),1);
const n=plan({...base,samples:close}),f=plan({...base,samples:far});
assert(n.active&&n.slots[0].risk>.6&&n.slots[1].risk>.6);
assert.equal(n.nearPairs,1);assert.equal(n.pairsChecked,1);
assert(!f.active&&f.slots[0].gestureScale===1,'well separated arms need no intervention');
assert(!plan({...base,samples:close,manualPriority:true}).active,'manual poses must own choreography');
assert(!plan({...base,samples:close,reducedMotion:true}).active);
assert(!plan({...base,samples:close,playing:false}).active);
assert(!plan({...base,samples:close,tier:'low'}).active);
assert(!plan({...base,samples:[sample(.2,torso(0,0)),close[1]]}).active,'stale sample cannot actuate');
assert(!plan({...base,samples:[undefined,close[1]]}).active,'missing GLB cannot invent collision');
assert(!plan({...base,samples:close,count:5}).active);
const less=plan({...base,samples:close,tier:'balanced'});
assert(less.slots[0].risk<n.slots[0].risk,'balanced tier requires damped accents');
const grounded={risk:.15,gestureScale:.78,accentScale:.83,depthOffset:.07,closestApproach:.25};
const merged=merge(grounded,n.slots[0]);
assert(merged.risk>=n.slots[0].risk&&merged.gestureScale<n.slots[0].gestureScale+.01);
assert.equal(merged.depthOffset,grounded.depthOffset,'V508 must not request new root motion');
assert.equal(merge(undefined,undefined).gestureScale,1);
const store=registry();store.set(0,'first',close[0]);store.set(1,'second',close[1]);
assert.equal(store.get(0,2),close[0]);assert.equal(store.get(0,3),undefined);
store.set(0,'new',sample(2,torso(.1,0)));store.clear(0,'first');
assert(store.get(0,2),'stale cleanup must not delete replacement');
store.clear(0,'new');assert.equal(store.get(0,2),undefined);
store.set(4,'invalid',close[0]);assert.equal(store.get(4,2),undefined);
store.set(2,'broken',sample(2,arm(0,0,0,0,0,0)));assert.equal(store.get(2,2),undefined);
// Runtime adapter tests use mocked THREE; never require node_modules in isolated CI.
const originalLoad=Module._load;
class Vector3 {constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}}
class Box3 {setFromObject(){return this;}isEmpty(){return true;}getSize(v){return v;}}
Module._load=function(id,...args){if(id==='three')return {Vector3,Box3};return originalLoad.call(this,id,...args);};
let adapter;
try {adapter=load('components/visualizer/measureAnimatedGlbV508');}
finally{Module._load=originalLoad;}
const rig=[];
const bone=(name,x,y,z)=>{const n={name,isBone:true,x,y,z,getWorldPosition(out){out.x=this.x;out.y=this.y;out.z=this.z;return out;}};rig.push(n);return n;};
const shoulderL=bone('mixamorigLeftShoulder',-.23,1.4,0), shoulderR=bone('mixamorigRightShoulder',.23,1.4,0);
const hipL=bone('mixamorigLeftUpLeg',-.16,.88,0),hipR=bone('mixamorigRightUpLeg',.16,.88,0);
const elbowL=bone('mixamorigLeftForeArm',-.50,1.15,0), wristL=bone('mixamorigLeftHand',-.8,1.15,0);
const elbowR=bone('mixamorigRightForeArm',.50,1.15,0),wristR=bone('mixamorigRightHand',.8,1.15,0);
const fake={traverse(cb){rig.forEach(cb);}};
const bones=adapter.findAnimatedBonesV508(fake);
const profile={source:'skeletal',confidence:1,torsoRadius:.42,armReach:.12};
const first=adapter.sampleAnimatedGlbV508(bones,profile,2);
assert.equal(first.capsules.length,5,'torso plus four arm pieces');
wristR.x=.95;
const after=adapter.sampleAnimatedGlbV508(bones,profile,2.1);
assert(after.capsules.some(c=>c.b[0]===.95),'read animated wrist each sample, not rest pose');
assert(first.capsules.some(c=>c.b[0]===.8),'prior sampling must not mutate shared snapshot');
assert.equal(adapter.sampleAnimatedGlbV508({},profile,2),undefined,'unsupported rig has safe fallback');
assert.equal(adapter.sampleAnimatedGlbV508(bones,profile,NaN),undefined);
// Performance and numerical robustness: 4 rigs, 5 capsules each => 150 pair tests/frame.
let iterations=0;
for(let k=0;k<32000;k++){
  const separation=.25+(k%90)*.029;
  const bodies=[0,1,2,3].map(i=>sample(k/100+1,
    torso(i*separation,.1*i),
    arm(i*separation,1.4,0,i*separation+.55,1.35,0),
    arm(i*separation+.55,1.35,0,i*separation+.9,1.2,0)));
  const now=k/100+1.03;
  const out=plan({count:4,now,playing:true,reducedMotion:false,manualPriority:false,tier:k%2?'high':'balanced',samples:bodies});
  assert(out.pairsChecked===6&&out.slots.length===4);
  assert(out.slots.every(s=>Number.isFinite(s.risk)&&s.risk>=0&&s.risk<=1&&s.gestureScale>=.28));
  iterations++;
}
const dir='components/visualizer/';
const glb=fs.readFileSync(dir+'GltfDancerAvatarV492.tsx','utf8');
const duo=fs.readFileSync(dir+'DanceFormationActorsV492.tsx','utf8');
const group=fs.readFileSync(dir+'GroupDancersV326SceneV492.tsx','utf8');
const context=fs.readFileSync(dir+'ThreeAvatarContextsV492.tsx','utf8');
const sampler=fs.readFileSync(dir+'useAnimatedCollisionSamplingV508.ts','utf8');
assert(glb.includes('useAnimatedCollisionSamplingV508({model,root,profile:bodyProfileV507'));
assert(sampler.includes('findAnimatedBonesV508(model)')&&sampler.includes('sampleAnimatedGlbV508('));
assert(sampler.includes('registry.set(workloadSlot')&&sampler.includes('registry?.clear(workloadSlot'));
assert(sampler.includes('getActivePerformanceTier()')&&sampler.includes('cadence=')&&sampler.includes("if(tier==='low')return"));
assert(context.includes('AnimatedBodyContextV508=createContext'));
for(const text of [duo,group]){
  assert(text.includes('<AnimatedBodyContextV508.Provider value={animatedRegistryV508.current}>'));
  assert(text.includes('planAnimatedCollisionV508')&&text.includes('mergeAnimatedSlotV508'));
  assert(text.includes('softenCollisionGestureV506'));
  assert(text.includes('planMultiAvatarCollisionV506'));
}
assert(!duo.includes('safeCollisionDepthV506('),'duo roots must not move');
assert(group.includes('safeCollisionDepthV506(collisionSlotV506,groundDecisionsV494[i])'),'V494 guards remain');
console.log(`PASS V508: ${iterations.toLocaleString('en-US')} 4-avatar frames; live rig capsules, 3D segment distance, staleness/manual/low-tier guards and duo/group wiring`);
