'use strict';
require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planStageSpatialInteractionV505:plan,safeStageDepthV505:safeDepth}=load('components/visualizer/stageSpatialInteractionV505');
const {planNaturalMultiAvatarStageV504:oldPlan}=load('components/visualizer/naturalMultiAvatarStageInteractionV504');
const {planIntelligentRapDuetV500:plan500}=load('components/visualizer/intelligentRapDuetPerformanceV500');
const near=[[-.2,0,0],[.2,0,0],[1.6,0,.1],[3.2,0,0]];
const far=[[-2.5,0,0],[-.8,0,0],[.9,0,0],[2.6,0,0]];
const cue={active:true,style:'duet',lineIndex:-1,leadSlot:0,partnerSlot:1,singingSlots:[0,1],handoffFrom:null,phase:1,emphasis:.8,startMs:1000,endMs:6200,source:'none',count:4};
const input={trackId:'track',cueTrackId:'track',count:4,positions:near,playing:true,reducedMotion:false,manualPriority:false,automaticGroup:true,tier:'high',cue,minSpacing:1.2};
function sample(patch={}){
 const v={...input,...patch};
 const old=plan500({...v,progressMs:1700,beat:.8,strength:70});
 const base=oldPlan({...v,base:old,progressMs:1700,beat:.8,strength:70});
 return plan({...v,base:patch.base??base});
}
const nearPlan=sample();
assert(nearPlan.active&&nearPlan.mode==='vocal-spacing'&&nearPlan.closePairs>=1);
assert(nearPlan.slots[0].depthOffset<0&&nearPlan.slots[1].depthOffset>0,'opposite Z lanes avoid overlap');
assert(nearPlan.slots[0].turnFactor<.5,'a crowded artist turns less');
assert(nearPlan.slots.every(s=>Number.isFinite(s.nearestDistance)));
const farPlan=sample({positions:far});
assert(farPlan.active&&farPlan.mode==='vocal'&&farPlan.closePairs===0);
assert(farPlan.slots.every(s=>s.depthOffset===0));
assert(nearPlan.slots[0].gesture.intensity<=farPlan.slots[0].gesture.intensity+1e-9,'crowding does not raise gesture');
assert.deepEqual(sample(),nearPlan,'deterministic replay');
const immutable=JSON.stringify(input);sample();assert.equal(JSON.stringify(input),immutable);
const noCue={...cue,active:false};
assert.deepEqual(sample({cue:noCue,automaticGroup:false}),{active:false,mode:'off',slots:[],closePairs:0});
assert(sample({cue:noCue}).mode==='spacing','automatic layout can prevent physical overlap without singing roles');
assert.deepEqual(sample({cue:noCue,positions:far}),{active:false,mode:'off',slots:[],closePairs:0});
const solo=sample({cue:{...cue,style:'solo',singingSlots:[0],partnerSlot:null}});
assert(solo.slots[0].look.weight===0,'lead stays facing audience');
const hook=sample({cue:{...cue,style:'hook',singingSlots:[0,1,2,3],partnerSlot:null}});
assert(hook.slots.every(s=>s.look.yaw===0&&s.look.weight===0),'hook remains audience-facing');
for(const patch of [{playing:false},{reducedMotion:true},{manualPriority:true},{trackId:''},{trackId:null},
 {count:5},{count:1},{count:2,positions:near.slice(0,1)},
 {positions:[[NaN,0,0],...near.slice(1)]},{positions:[[Infinity,0,0],...near.slice(1)]}]){
 assert(!sample(patch).active,'invalid/manual inputs do not move the stage');
}
assert(sample({automaticGroup:false}).slots.every(s=>s.depthOffset===0),'duo and manual-like stages never translate');
assert(sample({tier:'low'}).slots.every(s=>s.depthOffset===0),'low quality never translates');
assert(sample({tier:'balanced'}).slots[0].depthOffset>nearPlan.slots[0].depthOffset,'quality changes magnitude');
const grounded={active:true,phase:'moving',support:'none',gain:1,driftCm:0};
assert(safeDepth(nearPlan.slots[0],grounded)<0&&safeDepth(nearPlan.slots[1],grounded)>0);
assert(safeDepth(nearPlan.slots[0],{...grounded,support:'left'})<0);
for(const override of [{active:false},{phase:'low'},{phase:'lowering'},{phase:'rising'},
 {support:'both'},{driftCm:5},{driftCm:NaN},{gain:NaN}])assert.equal(safeDepth(nearPlan.slots[0],{...grounded,...override}),0,'V494 ground contact wins');
assert.equal(safeDepth(undefined,grounded),0);
assert.equal(safeDepth(nearPlan.slots[0],undefined),0);
const crossed=sample({positions:[[1,0,0],[-1,0,0],[2.4,0,0],[3.8,0,0]]});
assert(crossed.slots[0].look.yaw<0,'gaze direction tracks actual positions rather than stale assigned positions');
const back=sample({positions:[[0,0,-3],[.8,0,0],[2,0,0],[3.5,0,0]]});
assert(back.slots[0].look.weight<farPlan.slots[0].look.weight,'depth separation suppresses unnatural looking behind');
let total=0;
for(let k=0;k<26000;k++){
 const count=2+k%3;
 const points=Array.from({length:count},(_,j)=>[j*.55,0,Math.sin(j+k*.0002)*.12]);
 const style=['solo','reply','duet','hook'][k%4];
 const c={...cue,style,count,singingSlots:style==='hook'?Array.from({length:count},(_,i)=>i):style==='duet'?[0,1]:[0],
  partnerSlot:style==='duet'?1:null,handoffFrom:style==='reply'?1:null};
 const v={...input,cue:c,count,positions:points,tier:['high','balanced','low'][k%3]};
 const old=plan500({...v,progressMs:1800,beat:k%9/8,strength:70});
 const base=oldPlan({...v,base:old,progressMs:1800,beat:k%9/8,strength:70});
 const out=plan({...v,base});assert(out.active&&out.slots.length===count);
 for(const s of out.slots){
  total++;
  for(const value of [...Object.values(s.look),...Object.values(s.gesture),s.turnFactor,s.depthOffset])assert(Number.isFinite(value));
  assert(Math.abs(s.depthOffset)<=.16 && s.turnFactor<=1&&s.turnFactor>=.18);
  assert(Math.abs(s.look.yaw)<=.08&&Math.abs(s.look.eyeYaw)<=.022&&s.look.weight<=.18);
  assert(s.gesture.leftLift<=.034&&s.gesture.rightLift<=.034&&s.gesture.intensity<=.06);
  assert(Math.abs(safeDepth(s,grounded))<=.105);
 }
}
const duoSource=fs.readFileSync('components/visualizer/DanceFormationActorsV492.tsx','utf8');
const groupSource=fs.readFileSync('components/visualizer/GroupDancersV326SceneV492.tsx','utf8');
for(const [name,text] of [['duo',duoSource],['group',groupSource]]){
 assert(text.includes('planStageSpatialInteractionV505('),name+' wired into existing frame');
 assert(text.indexOf('planStageSpatialInteractionV505(')>text.indexOf('planNaturalMultiAvatarStageV504('),name+' refines V504');
 assert(text.includes('combineCrewLooksV452(')&&text.includes('combineCrewGesturesV452('),name+' retains safe clamps');
 assert(text.includes('!!manualCueV385.active'),name+' manual singer precedence');
}
assert(groupSource.includes('safeStageDepthV505(spatialV505.slots[i],groundDecisionsV494[i])'),'V494 contact required for physical travel');
assert(!duoSource.includes('safeStageDepthV505('),'duo roots not modified');
const core=fs.readFileSync('components/visualizer/stageSpatialInteractionV505.ts','utf8');
for(const forbidden of ['useFrame(', 'window.', 'localStorage', 'requestAnimationFrame(', 'setInterval(', 'fetch(', 'new AnimationMixer'])assert(!core.includes(forbidden));
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
assert(/^0\.1\.0-v(?:50[5-9]|5[1-9]\d|[6-9]\d\d)$/.test(pkg.version),'V505+ package');
assert(pkg.scripts['build:preflight'].includes('npm run test:v505 && npm run test:v505:types && npm run test:v504')); 
console.log('PASS V505: 26,000 deterministic frames, '+total+' actor slots, spatial gaze, crowd-distance safety, V494 grounded auto-group spacing, manual priorities');
