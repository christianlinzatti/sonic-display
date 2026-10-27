'use strict';
require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {sweptDistanceV506:swept,planMultiAvatarCollisionV506:plan,
 safeCollisionDepthV506:safeDepth,softenCollisionGestureV506:soften}=load('components/visualizer/multiAvatarCollisionAvoidanceV506');
const crossing={positions:[[-1,0,0],[1,0,0]],targets:[[1,0,0],[-1,0,0]],
 count:2,playing:true,reducedMotion:false,manualPriority:false,automaticGroup:true,tier:'high'};
assert.equal(swept(...crossing.positions,...crossing.targets),0,'crossing routes must be detected despite distant endpoints');
assert.equal(swept([-1,0,0],[1,0,0],[-.8,0,0],[.8,0,0]),1.6);
assert.equal(swept([0,0,0],[0,0,0],[0,0,0],[0,0,0]),0,'zero separation is safe numerically');
const mid=plan(crossing);
assert(mid.active&&mid.closePairs===0&&mid.predictedPairs===1,'detect forecast crossing');
assert(mid.slots.every(s=>s.risk>.9&&s.gestureScale<1&&s.accentScale<1));
assert(mid.slots[0].depthOffset<0&&mid.slots[1].depthOffset>0,'opposite stage Z intentions');
assert(Math.abs(mid.slots[0].depthOffset)<=.14&&Math.abs(mid.slots[1].depthOffset)<=.14);
assert.deepEqual(plan(crossing),mid,'song-time deterministic planning');
assert.equal(JSON.stringify(crossing),JSON.stringify({...crossing}),'planner must not mutate caller values');
const quiet=plan({...crossing,positions:[[-3,0,0],[3,0,0]],targets:[[-3,0,0],[3,0,0]]});
assert(!quiet.active&&quiet.predictedPairs===0&&quiet.closePairs===0);
const mixed=plan({...crossing,count:3,positions:[[-1,0,0],[1,0,0],[8,0,0]],targets:[[1,0,0],[-1,0,0],[8,0,0]]});
assert(mixed.active&&mixed.slots.every(s=>Number.isFinite(s.closestApproach)),'unaffected third avatar has finite clearance');
const crowded=plan({...crossing,positions:[[0,0,0],[.36,0,0]],targets:[[0,0,0],[.36,0,0]]});
assert(crowded.active&&crowded.closePairs===1);
assert(crowded.slots.every(s=>s.depthOffset===0),'never propose a root move that cannot improve closest approach');
const duo=plan({...crossing,automaticGroup:false});
assert(duo.active&&duo.slots.every(s=>s.depthOffset===0&&s.gestureScale<1),'duo body warning never changes stage roots');
const low=plan({...crossing,tier:'low'});
assert(low.active&&low.slots.every(s=>s.depthOffset===0),'low-tier only gesture safety');
const medium=plan({...crossing,tier:'balanced'});
assert(medium.slots.every(s=>Math.abs(s.depthOffset)<=Math.abs(mid.slots[0].depthOffset)+1e-9));
const radius=plan({...crossing,positions:[[0,0,0],[1.22,0,0]],targets:[[0,0,0],[1.22,0,0]],torsoRadii:[.58,.58],gestureIntensity:[.8,.8]});
assert(radius.active,'optional calibrated larger bodies/arms increase sensitivity');
const small=plan({...crossing,positions:[[0,0,0],[1.22,0,0]],targets:[[0,0,0],[1.22,0,0]],torsoRadii:[.3,.3]});
assert(!small.active,'slender body envelopes do not invent contacts');
for(const patch of [{playing:false},{reducedMotion:true},{manualPriority:true},{count:1},{count:5},
 {positions:[[NaN,0,0],[1,0,0]]},{targets:[[1,0,Infinity],[-1,0,0]]},
 {targets:[[1,0,0]]},{count:2.5}]){
 assert(!plan({...crossing,...patch}).active,'invalid, paused or manual frames must do nothing');
}
const grounded={active:true,phase:'moving',support:'none',gain:1,driftCm:0};
assert(safeDepth(mid.slots[0],grounded)<0&&safeDepth(mid.slots[1],grounded)>0);
assert(Math.abs(safeDepth(mid.slots[0],grounded))<=.11);
assert(safeDepth(mid.slots[0],{...grounded,support:'left'})<0);
for(const override of [{active:false},{phase:'low'},{phase:'lowering'},
 {phase:'rising'},{support:'both'},{gain:NaN},{driftCm:NaN},{driftCm:5}]){
 assert.equal(safeDepth(mid.slots[0],{...grounded,...override}),0,'V494 foot observations veto movement');
}
assert.equal(safeDepth(undefined,grounded),0);
const gesture={leftLift:.2,rightLift:.18,shoulder:-.12,lean:.035,intensity:.78};
const softened=soften(gesture,mid.slots[0]);
assert(softened.leftLift<gesture.leftLift&&softened.rightLift<gesture.rightLift&&softened.intensity<gesture.intensity);
assert(softened.shoulder>gesture.shoulder&&softened.lean<gesture.lean);
assert.deepEqual(soften(gesture,undefined),gesture,'no collision preserves gesture');
let actorSamples=0,plannedCrossings=0;
for(let k=0;k<28000;k++){
 const count=2+k%3,phase=k*.002;
 const positions=Array.from({length:count},(_,i)=>[i*.48+Math.sin(phase+i)*.13,0,Math.cos(phase+i)*.19]);
 const targets=positions.map(([x,y,z],i)=>[x+(i%2===0?.24:-.23),y,z+(i%2===0?.3:-.25)]);
 const out=plan({...crossing,count,positions,targets,tier:['high','balanced','low'][k%3],
  gestureIntensity:Array.from({length:count},()=>k%11/10)});
 assert(out.active&&out.slots.length===count);
 plannedCrossings+=out.predictedPairs;
 for(const slot of out.slots){
  actorSamples++;
  for(const v of [slot.risk,slot.gestureScale,slot.accentScale,slot.depthOffset,slot.closestApproach]){
   assert(Number.isFinite(v),'all active slot values must remain finite');
  }
  assert(slot.risk>=0&&slot.risk<=1&&slot.gestureScale>=.22&&slot.gestureScale<=1);
  assert(slot.accentScale>=.1&&slot.accentScale<=1&&Math.abs(slot.depthOffset)<=.14);
  assert(Math.abs(safeDepth(slot,grounded))<=.11);
 }
}
const group=fs.readFileSync('components/visualizer/GroupDancersV326SceneV492.tsx','utf8');
const duoSource=fs.readFileSync('components/visualizer/DanceFormationActorsV492.tsx','utf8');
for(const [name,src] of [['duo',duoSource],['group',group]]){
 assert(src.includes('planMultiAvatarCollisionV506('),name+' runtime wired');
 assert(src.includes('softenCollisionGestureV506('),name+' softens gestures');
 assert(src.includes('planStageSpatialInteractionV505('),name+' preserves V505');
}
assert(group.includes('safeCollisionDepthV506(collisionSlotV506,groundDecisionsV494[i])'),'group foot-contact guard');
assert(!duoSource.includes('safeCollisionDepthV506('),'duo roots may never be changed');
assert(group.includes('formationApproach(')&&group.includes('finalDepthV506'),'existing smooth root travel reused');
assert(group.includes('accentScaleV506'),'unsafe optional formation turns and accents damped');
const src=fs.readFileSync('components/visualizer/multiAvatarCollisionAvoidanceV506.ts','utf8');
for(const forbidden of ['useFrame(', 'setInterval(', 'requestAnimationFrame(', 'localStorage', 'window.', 'Box3(', 'new AnimationMixer'])
 assert(!src.includes(forbidden),'pure bounded planner without render or persistence side effects');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
assert(Number(pkg.version.match(/-v(\d+)$/)?.[1])>=506,'V506 remains available on later versions');
assert(pkg.scripts['build:preflight'].includes('npm run test:v506 && npm run test:v506:types && npm run test:v505'), 'retain the V506/V505 preflight order');
console.log('PASS V506: 28,000 deterministic frames, '+actorSamples+' actor samples, '+plannedCrossings+' forecast close pairs, swept crossing, gesture and foot guards, 2-4 actors');
