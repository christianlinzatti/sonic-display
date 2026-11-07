#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {planAvatarAudienceInteractionV1074:plan,sampleAvatarAudienceInteractionV1074:sample,
 blendAvatarAudiencePoseV1074:blend,OFF_AVATAR_AUDIENCE_V1074:OFF,
 ZERO_AVATAR_AUDIENCE_POSE_V1074:ZERO}=load('lib/arena360AvatarAudienceInteractionV1074');
const {generateArenaShowPlanV1040:generate,sampleArenaShowPlanV1040:sampleShow}=load('lib/arena360ShowDesignerV1040');
const durationMs=210000;
const show=generate({genre:'Deutschrap',durationMs});
const mk=(ms,extra={})=>({enabled:true,stageIsArena:true,audienceEnabled:true,
 showDesignerEnabled:true,playing:true,reducedMotion:false,reactive:true,
 manualPriority:false,performanceTier:'high',trackId:'concert-v1074',
 show:sampleShow(show,{enabled:true,playing:true,reducedMotion:false,progressMs:ms,durationMs}),
 progressMs:ms,durationMs,strength:60,observedSection:'verse',...extra});
const at=(ms,extra={})=>plan(mk(ms,extra));
const cue=at(55000);
assert.equal(cue.active,true);
assert.equal(cue.gesture,'sweep');
assert.deepEqual(cue,at(55000));
assert.deepEqual(at(55000,{enabled:false}),OFF);
assert.equal(at(55000,{manualPriority:true}).reason,'manual');
assert.equal(at(55000,{reducedMotion:true}).reason,'motion');
assert.equal(at(55000,{playing:false}).reason,'paused');
assert.equal(at(55000,{performanceTier:'low'}).reason,'performance');
assert.equal(at(55000,{progressMs:NaN}).reason,'clock');
for(const bad of [
 {enabled:false},{stageIsArena:false},{audienceEnabled:false},
 {showDesignerEnabled:false},{reactive:false},{playing:false},
 {reducedMotion:true},{manualPriority:true},{performanceTier:'low'},
 {trackId:''},{trackId:null},{progressMs:NaN},{progressMs:Infinity},
 {progressMs:-1},{progressMs:durationMs+1},{durationMs:0},
 {durationMs:Infinity},{durationMs:2000},{strength:0},{strength:-1},
 {strength:81},{strength:NaN},{strength:Infinity},{show:null},
 {show:{...mk(55000).show,active:false}},{show:{...mk(55000).show,scene:'none'}},
 {show:{...mk(55000).show,intensity:0}},{show:{...mk(55000).show,intensity:101}},
 {show:{...mk(55000).show,fade:0}},{show:{...mk(55000).show,fade:NaN}},
 {show:{...mk(55000).show,segmentIndex:7}},
 ])assert.equal(at(55000,bad).active,false,'fail closed: '+JSON.stringify(bad).slice(0,75));
assert.deepEqual(sample(OFF,1,0),ZERO);
assert.deepEqual(sample(null,1,0),ZERO);
assert.deepEqual(sample(cue,NaN,0),ZERO);
assert.deepEqual(sample(cue,-1,0),ZERO);
assert.deepEqual(sample(cue,1000,-2),ZERO);
assert.deepEqual(sample(cue,1000,4),ZERO);
assert.deepEqual(sample(cue,55000,0,Infinity),sample(cue,55000,0,0));
assert(at(55000,{strength:30}).gain<cue.gain);
assert(at(55000,{performanceTier:'balanced'}).gain<cue.gain);
assert.equal(at(55000,{observedSection:'drop'}).gesture,cue.gesture,
 'observed drop must not manufacture a performer gesture event');
assert(at(55000,{observedSection:'hook'}).gain>=cue.gain,
 'only verified hook can moderately increase amplitude');
const gestures=new Set();let tested=0;
for(const genre of ['Deutschrap','Hardtekk','Deutschrock','Pop']){
 const genrePlan=generate({genre,durationMs});
 for(let i=0;i<10000;i++){
  const ms=durationMs*(i+.5)/10000;
  const q=plan(mk(ms,{trackId:genre,show:sampleShow(genrePlan,{enabled:true,playing:true,
   reducedMotion:false,progressMs:ms,durationMs})}));
  tested++;
  if(!q.active){assert.equal(q.gain,0);continue;}
  gestures.add(q.gesture);
  assert(q.gain>=0&&q.gain<=.7&&q.audienceReply>=0&&q.audienceReply<=.55);
  for(let slot=0;slot<4;slot++){
   const pose=sample(q,ms,slot,(i%23)/23);
   assert(Object.values(pose).every(Number.isFinite));
   assert(Math.abs(pose.headYaw)<=.075&&Math.abs(pose.headPitch)<=.04);
   assert(pose.leftLift>=0&&pose.leftLift<=.22&&pose.rightLift>=0&&pose.rightLift<=.22);
   assert(pose.audienceArms>=0&&pose.audienceArms<=.42);
   assert(Math.abs(pose.audienceHead)<=.06);
  }
 }
}
assert.equal(tested,40000);
for(const s of ['greet','sweep','invite','answer','listen','encore'])assert(gestures.has(s),s);
assert.notDeepEqual(sample(cue,55000,0),sample(cue,55000,1),'staggered group');
for(let i=0;i<500;i++){
 const a=sample(cue,55000+i*8,0),b=sample(cue,55008+i*8,0);
 assert(Math.abs(a.leftLift-b.leftLift)<.01,'continuous arms');
 assert(Math.abs(a.headYaw-b.headYaw)<.01,'continuous gaze');
}
let prev={...ZERO};const goal=sample(cue,55000,0);
for(let i=0;i<60;i++)prev=blend(prev,goal,1/60);
assert(Math.abs(prev.leftLift)<=.22&&Math.abs(prev.headYaw)<=.075);
for(let i=0;i<300;i++)prev=blend(prev,ZERO,1/60);
assert(Math.abs(prev.leftLift)<.0001,'returns to neutral');
assert.deepEqual(blend(ZERO,goal,NaN),ZERO,'invalid delta does not update');
const three=read('components/visualizer/ThreeAvatar.tsx');
const proc=read('components/visualizer/ProceduralDancerAvatarV492.tsx');
const glb=read('components/visualizer/GltfDancerAvatarV492.tsx');
const crowd=read('components/visualizer/stages/ArenaAudienceV1032.tsx');
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(three.includes('planAvatarAudienceInteractionV1074('));
assert(three.includes('arenaAvatarAudienceCueV1074:avatarAudienceV1074'));
assert(proc.includes('sampleAvatarAudienceInteractionV1074(')&&proc.includes('audiencePoseV1074.leftLift'));
assert(glb.includes('sampleAvatarAudienceInteractionV1074(')&&glb.includes('lastAudiencePoseV1074'));
assert(glb.indexOf('applyPartnerGesture(')<glb.indexOf('lastAudiencePoseV1074.current=nextV1074'));
assert(crowd.includes('interactionActiveV1074')&&crowd.includes('gestureArms'));
assert(stage.includes('avatarAudienceCueV1074={avatarAudienceCueV1074}'));
assert(three.includes('avatarMotionMode===\'choreography\''));
for(const p of ['types/music.ts','components/visualizer/registry.tsx',
 'components/visualizer/VisualizerStage.tsx','context/UiPreferencesContext.tsx'])
 assert(read(p).includes('arenaAvatarAudienceEnabledV1074'),p);
assert(read('context/UiPreferencesContext.tsx').includes('arenaAvatarAudienceEnabledV1074:false'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1074 · Avatar & Audience Interaction 2.0'));
for(const file of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(file).includes('tests/v1074-avatar-audience-regression.cjs'));
for(const bad of [/\bMath\.random\(/,/\bDate\.now\(/,/\bfetch\(/,/\bsetTimeout\(/,
 /\bsetInterval\(/,/\brequestAnimationFrame\(/,/\bAudioContext\b/,/\bWebSocket\b/])
 assert(!bad.test(read('lib/arena360AvatarAudienceInteractionV1074.ts')),'pure cue '+bad);
console.log('PASS V1074: 40,000 song samples across four genres, 4 slots, 6 gestures, manual/motion protections and shared crowd cue');
