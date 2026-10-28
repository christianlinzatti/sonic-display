require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {resolveVocalPerformanceQualityV374:resolve}=load('components/visualizer/vocalPerformanceQualityV374');
const {rapPerformanceAccentsV406,composeRapStageV406,composeRapFaceV406}=load('components/visualizer/rapStagePerformanceV406');
const lyrics={synced:true,provider:'test',lines:[
  {startMs:1000,endMs:2050,text:'Bam flieg Boom',words:[
    {text:'Bam',startMs:1000,endMs:1270},
    {text:'flieg',startMs:1310,endMs:1600},
    {text:'Boom',startMs:1650,endMs:1990}]},
  {startMs:2250,endMs:2750,text:'[Instrumental]'},
  {startMs:3100,endMs:3850,text:'Line only'}
]};
const opts={style:'rap',genre:'Deutschrap',qualityEnabledV374:true,lipStrength:95,
 naturalArticulationEnabledV384:true,rapArticulationEnabledV405:true,rapClarityV405:85,
 ensembleCountV374:2,manualSingingSlotsV385:[0],avatarSlot:0};
const at=(ms,extra={},playing=true,l=lyrics)=>resolve(l,ms,playing,{...opts,...extra});
const context={playing:true,enabled:true,energy:.75,strength:75,slot:0,bodyEnabled:true,gestures:true};
const lead=at(1420);
assert.equal(lead.articulationV405.active,true,'requires a verified V405 word');
assert.equal(lead.qualityV374.role,'lead');
const baseBody=lead.body;
const a=rapPerformanceAccentsV406(lead,context);
assert(a.active&&a.drive>0,'word-timed rap must produce a coordinated accent');
const body=composeRapStageV406(baseBody,lead,context);
const face=composeRapFaceV406(lead.face,lead,context);
assert.notDeepEqual(body,baseBody,'rap phrase must influence upper-body cue');
assert(face.brow>lead.face.brow||face.squint>lead.face.squint||face.cheek>lead.face.cheek);
assert.equal(face.jaw,lead.face.jaw,'must not alter mouth opening');
assert.equal(face.lipsClosed,lead.face.lipsClosed,'must preserve B/P/M lip closure');
assert.equal(face.wide,lead.face.wide,'V405 vowel spreading is authoritative');
assert.equal(face.round,lead.face.round,'V405 vowel rounding is authoritative');
assert.equal(body.headYaw,baseBody.headYaw,'partner head direction is preserved');
assert.equal(body.eyeYaw,baseBody.eyeYaw,'partner eye target is preserved');
for(const [ms,extra,playing,l] of [
  [0,{},true,lyrics],[1290,{},true,lyrics],[2050,{},true,lyrics],
  [2430,{},true,lyrics],[3400,{},true,lyrics],[1420,{},false,lyrics],
  [1420,{qualityEnabledV374:false},true,lyrics],
  [1420,{naturalArticulationEnabledV384:false},true,lyrics],
  [1420,{rapArticulationEnabledV405:false},true,lyrics],
  [1420,{style:'singing'},true,lyrics],[1420,{},true,{...lyrics,synced:false}],
  [1420,{avatarSlot:1},true,lyrics],
 ]) {
 const cue=at(ms,extra,playing,l);
 assert.equal(rapPerformanceAccentsV406(cue,{...context,playing}).active,false,`inactive ${ms} / ${JSON.stringify(extra)}`);
 assert.equal(composeRapFaceV406(cue.face,cue,{...context,playing}),cue.face,'inactive face keeps exact original reference');
 assert.equal(composeRapStageV406(cue.body,cue,{...context,playing}),cue.body,'inactive body keeps exact original reference');
}
for(const overrides of [{enabled:false},{reducedMotion:true},{playing:false},{strength:0},{strength:NaN},{strength:Infinity}]){
 const ctx={...context,...overrides};
 assert.equal(rapPerformanceAccentsV406(lead,ctx).active,false,`invalid context ${JSON.stringify(overrides)}`);
 assert.equal(composeRapStageV406(baseBody,lead,ctx),baseBody);
 assert.equal(composeRapFaceV406(lead.face,lead,ctx),lead.face);
}
assert.equal(composeRapStageV406(baseBody,lead,{...context,authoredPriority:true}),baseBody,'authored choreography must win');
assert.equal(composeRapStageV406(baseBody,lead,{...context,bodyEnabled:false}),baseBody,'body setting must win');
const noGest=composeRapStageV406(baseBody,lead,{...context,gestures:false});
assert.equal(noGest.leftArm,baseBody.leftArm,'gestures disabled');
assert.equal(noGest.rightArm,baseBody.rightArm,'gestures disabled');
for(const ms of [1000,1008,1100,1190,1310,1420,1650,1750,1980,2430,3350]){
 const cue=at(ms);const b=composeRapStageV406(cue.body,cue,context);
 const f=composeRapFaceV406(cue.face,cue,context);
 assert.deepEqual(composeRapStageV406(cue.body,cue,context),b,`deterministic body at ${ms}`);
 assert.deepEqual(composeRapFaceV406(cue.face,cue,context),f,`deterministic face at ${ms}`);
 for(const key of ['brow','cheek','squint','jaw','lipsClosed','wide','round'])
  assert(Number.isFinite(f[key])&&f[key]>=0&&f[key]<=1,`${key} invalid at ${ms}`);
 for(const [key,limit] of [['headPitch',.18],['headTilt',.12],['chestLean',.12],['leftArm',.25],['rightArm',.25]])
  assert(Number.isFinite(b[key])&&Math.abs(b[key])<=limit+1e-9,`${key} out of bounds at ${ms}`);
 assert(f.jaw+f.lipsClosed*.985<=1+1e-9,'bilabial safety never regresses');
}
// Integration checks protect both R3F pipelines and facial preview isolation.
const three=fs.readFileSync(path.resolve(__dirname,'../components/visualizer/gltfVocalPerformanceV492.ts'),'utf8')+'\n'+fs.readFileSync(path.resolve(__dirname,'../components/visualizer/ProceduralDancerAvatarV492.tsx'),'utf8');
assert(three.includes('const rapBodyV406=composeRapStageV406')&&
  /applyVocalStageOverlayV371\(rigTargets.current,\s*addAdvancedVocalHeadV459\(addExpressiveHeadV453\(rapBodyV510/.test(three),
  'GLTF stage must apply the shared accent');
assert(three.includes('expressiveBodyV393.eyeYaw')===false,'procedural avatar must use final accented cue');
assert(three.includes('const face=composeRapFaceV406(synchronizedV372.face,synchronizedV372')&&
  three.includes('ref={browsV406}'),'procedural model must expose V406 facial accents');
const rig=fs.readFileSync(path.resolve(__dirname,'../components/visualizer/VocalRigV368.tsx'),'utf8');
assert(rig.includes('composeRapFaceV406(target,coordinated')&&rig.includes('!previewPoseV370&&!previewTargetV383'),
 'facial stage must preserve preview modes');
console.log('PASS V406: synchronized rap-face/head/shoulder/torso, singer roles, pause/reduced-motion/silence, authored choreography, facial preview, limited poses and deterministic seeking');
