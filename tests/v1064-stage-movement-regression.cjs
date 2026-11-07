'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planStageMovementV1064:plan,isSafeStageRouteV1064:safe,stepStageTravelV1064:step}=load('lib/arena360StageMovementV1064');
const show={active:true,scene:'hook',segmentIndex:3,intensity:85,fade:1,deck:'fan',floating:'wave',lasers:'tunnel',camera:'group',dance:'group'};
const base={enabled:true,stageIsArena:true,playing:true,reducedMotion:false,manualPriority:false,
  performanceTier:'high',count:4,trackId:'verified-song',progressMs:20000,durationMs:240000,show,strength:70};
const cue=plan(base);
assert.equal(cue.active,true);
assert.equal(cue.reason,'planned');
assert.equal(cue.slots.length,4);
assert.deepEqual(plan(base),cue,'same track clock = same stage path');
assert(cue.slots.some(s=>s.z!==0),'stage actually travels');
for(const s of cue.slots)assert(Math.abs(s.x)<=.08&&Math.abs(s.z)<=.16);
const scenes=['intro','verse','build','hook','interlude','finale','outro'];
for(const scene of scenes){
 const output=plan({...base,show:{...show,scene}});
 assert.equal(output.active,true);
 assert.equal(output.chapter,scene);
 assert.equal(output.slots.length,4);
}
for(const input of [{enabled:false},{stageIsArena:false},{playing:false},{reducedMotion:true},
 {manualPriority:true},{performanceTier:'low'},{count:1},{count:5},{count:2.5},
 {trackId:''},{trackId:null},{progressMs:-1},{progressMs:Infinity},{progressMs:NaN},
 {durationMs:29000},{durationMs:Infinity},{strength:0},{strength:NaN},
 {show:null},{show:{...show,active:false}},{show:{...show,intensity:0}},
 {show:{...show,fade:0}}]){
 const output=plan({...base,...input});
 assert.equal(output.active,false,'fail closed for '+JSON.stringify(input));
 assert.deepEqual(output.slots,[]);
}
for(let count=2;count<=4;count++){
 for(let i=0;i<12000;i++){
  const t=i*17%240000;
  const output=plan({...base,count,progressMs:t,strength:i%110,show:{...show,scene:scenes[i%scenes.length]}});
  if(!output.active)continue;
  assert.equal(output.slots.length,count);
  for(const s of output.slots){
   assert(Number.isFinite(s.x)&&Number.isFinite(s.z));
   assert(Math.abs(s.x)<=.080001&&Math.abs(s.z)<=.160001);
  }
  const lanePositions=Array.from({length:count},(_,slot)=>[(slot-(count-1)/2)*1.25,0,0]);
  assert(safe(lanePositions,output.slots),'corridor stays inside stage with separation');
 }
}
for(let k=0;k<10;k++){
 // 16 s motifs leave from, and return to, neutral without a discontinuity.
 const a=plan({...base,progressMs:k*16000+15999});
 const b=plan({...base,progressMs:(k+1)*16000});
 assert(Math.abs(a.slots[0].x-b.slots[0].x)<.001);
 assert(Math.abs(a.slots[0].z-b.slots[0].z)<.001);
}
assert.equal(safe([[0,0,0],[.3,0,0]],[{x:0,z:0},{x:0,z:0}]),false,'reject collision');
assert.equal(safe([[2.99,0,0],[0,0,0]],[{x:.08,z:0},{x:0,z:0}]),false,'reject stage edge');
assert.equal(safe([[1,0,0],[-1,0,0]],[{x:NaN,z:0},{x:0,z:0}]),false,'reject NaN');
assert.equal(safe([[1,0,0]],[]),false,'reject inconsistent slot counts');
assert.equal(safe([[1,0,0],[-1,0,0]],[{x:.1,z:0},{x:0,z:0}]),false,'reject 10cm lateral');
assert.equal(safe([[1,0,0],[-1,0,0]],[{x:0,z:.2},{x:0,z:0}]),false,'reject 20cm depth');
let current={x:0,z:0},elapsed=0;
const target={x:.08,z:-.16};
for(let n=0;n<100;n++){
 const next=step(current,target,.016,true);
 const move=Math.hypot(next.x-current.x,next.z-current.z);
 assert(move<=.14*.016+1e-9,'hard speed cap');
 assert(Math.abs(next.x)<=.08&&Math.abs(next.z)<=.16);
 current=next;elapsed+=.016;
}
assert(Math.hypot(current.x-target.x,current.z-target.z)<1e-6,'route eventually reaches goal');
assert.deepEqual(step(current,{x:0,z:0},.016,false),current,'footlock does not move');
assert.deepEqual(step(current,{x:0,z:0},NaN,true),current,'invalid delta does not move');
assert.deepEqual(step(current,{x:0,z:0},1,true),current,'frame stall does not teleport');
assert.deepEqual(step(current,{x:NaN,z:0},.01,true),{x:0,z:0},'corrupted offset resets');
const src=read('lib/arena360StageMovementV1064.ts');
for(const forbidden of ['Math.random(','Date.now(','fetch(','setInterval(','setTimeout(','WebSocket(','localStorage','navigator.'])
 assert(!src.includes(forbidden),'pure deterministic stage planner: '+forbidden);
const group=read('components/visualizer/GroupDancersV326SceneV492.tsx');
const stage=read('components/visualizer/ThreeAvatar.tsx');
assert(stage.includes('stageMovementV1064={planStageMovementV1064({'));
assert(group.includes('routeGroundSafeV1064'));
assert(group.includes('canRepositionWithGroundV808(g,footLock)'));
assert(group.includes('routeCollisionSafeV1064'));
assert(group.includes('ensembleActiveV1063?(ensembleV1063!.slots[i]?.spreadX??0):0'));
assert(group.includes('ensembleActiveV1063?(ensembleV1063!.slots[i]?.depth??0):0'));
assert(group.includes('isSafeStageRouteV1064(routeBaseV1064,stageMovementV1064.slots)'));
assert(group.includes('stepStageTravelV1064(routeOffsetsV1064.current[i]'));
assert(group.includes('targetX+routeOffsetsV1064.current[i].x'));
assert(group.includes('targetZ+routeOffsetsV1064.current[i].z'));
const duo=read('components/visualizer/DanceFormationActorsV492.tsx');
assert(!duo.includes('StageMovementV1064'),'do not move duets lacking reliable per-slot observations');
for(const p of ['types/music.ts','components/visualizer/registry.tsx',
 'context/UiPreferencesContext.tsx','components/visualizer/VisualizerStage.tsx',
 'components/visualizer/ArenaShowDesignerPanelV1040.tsx'])
 assert(read(p).includes('arenaStageMovementEnabledV1064'),p+' missing opt-in');
assert(read('context/UiPreferencesContext.tsx').includes('arenaStageMovementEnabledV1064:false'));
console.log('PASS V1064: planned stage zones, 36,000 samples, no slot crossing, hard 14cm/s cap, grounding and collision safeguards');
