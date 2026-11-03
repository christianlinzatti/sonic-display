'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planCrowdCameraStageHarmonyV879:plan,applyCrowdCameraHarmonyMotionV879:motion}=load('components/visualizer/crowdCameraStageHarmonyV879');
const {normalizeConcertFxV810:normalize}=load('components/visualizer/concertFxStudioV810');
const {planVirtualConcertCrowdV815:planCrowd,createVirtualCrowdLayoutV815:layout}=load('components/visualizer/virtualConcertCrowdPlannerV815');
const {planIntelligentAudienceV874:arms}=load('components/visualizer/intelligentAudienceExperienceV874');
const {planSmartFestivalAtmosphereV875:festival}=load('components/visualizer/smartFestivalAtmosphereV875');
const {planDynamicFestivalCrowdChoreographyV876:choreo,createCrowdMotionScratchV876:scratch,sampleCrowdChoreographyV876:baseMotion}=load('components/visualizer/dynamicFestivalCrowdChoreographyV876');
const {planIntelligentCrowdInteractionV877:interact}=load('components/visualizer/intelligentCrowdInteractionV877');
const {planSmartAudienceEmotionV878:emotion}=load('components/visualizer/smartAudienceEmotionDirectorV878');
const settings=normalize({quality:'ultra',crowdIntensity:100,intensity:100,crowdDensity:'arena',
 crowdCameraStrengthV879:100,crowdCameraStyleV879:'balanced',
 festivalAtmosphereStrengthV875:100,crowdChoreographyStrengthV876:100,
 crowdInteractionStrengthV877:100,crowdEmotionStrengthV878:100});
const fx={active:true,reason:'music',genre:'hardtekk',section:'drop',phase:6,
 primary:'#23fff1',secondary:'#f326b8'};
const c={fx,settings,tier:'high',energy:.91,kick:.97,lyricsProtected:false,
 vocalFocus:false,reducedMotion:false};
const crowd=planCrowd({...c,groupCount:2,crowdBudget:1});
const a=arms({...c,base:crowd});
const f=festival({...c,base:a,playing:true,manualLighting:false,blackout:false});
const ch=choreo({...c,base:f,playing:true,manualLighting:false,blackout:false});
const it=interact({...c,base:ch,playing:true,manualLighting:false,blackout:false,
 groupCount:2,focusSlot:0,focusVerified:true,lyrics:null,lyricsVisible:false,progressMs:1000});
const {cue:base}=emotion({...c,base:it,playing:true,manualLighting:false,blackout:false,
 previous:null,trackId:'song',positionMs:1000});
const input={base,settings,verifiedCamera:true,cameraIntent:'portrait',manualCamera:false,
 lyricsVisible:false,lyricsProtected:false,vocalFocus:false,performerVerified:false,
 groupCount:2,transitionActive:false,transitionProximity:0,playing:true,
 blackout:false,manualLighting:false,reducedMotion:false,tier:'high'};
let checks=0;
function check(name,fn){try{fn();checks++;}catch(e){e.message=name+': '+e.message;throw e;}}
const at=(patch={})=>plan({...input,...patch});
check('real crowd remains active for camera validation',()=>{assert(base.active);assert(base.count>1);});
check('portrait protects the lead without hiding spectators',()=>{
 const q=at();assert.equal(q.harmonyModeV879,'performer');
 assert(q.harmonyGainV879<1);assert.equal(q.active,true);assert.equal(q.count,base.count);
});
check('wide view preserves more crowd than close-up',()=>{
 const close=at(),wide=at({cameraIntent:'wide'});
 assert.equal(wide.harmonyModeV879,'wide');assert(wide.harmonyGainV879>close.harmonyGainV879);
});
check('unknown view adds no camera-based intervention',()=>{
 const q=at({cameraIntent:'invalid'});
 assert.equal(q.harmonyModeV879,'off');assert.equal(q.armLift,base.armLift);
});
check('unverified camera intent cannot activate camera shaping',()=>{
 const q=at({verifiedCamera:false});assert.equal(q.harmonyModeV879,'off');
});
check('manual camera is respected even with a portrait',()=>{
 const q=at({manualCamera:true,performerVerified:true});
 assert.equal(q.harmonyModeV879,'off');assert.equal(q.movement,base.movement);
});
check('visible lyrics protected without camera certainty',()=>{
 const q=at({verifiedCamera:false,lyricsVisible:true});
 assert.equal(q.harmonyModeV879,'lyrics');assert(q.phoneOpacity<=base.phoneOpacity);
});
check('lyrics flag takes precedence over cinematic camera',()=>{
 const q=at({lyricsProtected:true});assert.equal(q.harmonyModeV879,'lyrics');
 assert(q.harmonyFocusV879>at().harmonyFocusV879);
});
check('manual camera still keeps optional lyric safety',()=>{
 const q=at({manualCamera:true,lyricsVisible:true});assert.equal(q.harmonyModeV879,'lyrics');
});
check('verified performer focus attenuates without a camera cue',()=>{
 const q=at({verifiedCamera:false,performerVerified:true});assert.equal(q.harmonyModeV879,'performer');
});
check('performer opt-out preserves the crowd',()=>{
 const q=at({verifiedCamera:false,performerVerified:true,
 settings:{...settings,crowdPerformerPriorityV879:false}});
 assert.equal(q.harmonyModeV879,'off');
});
check('transition guard is bounded and opt-out',()=>{
 const trans=at({cameraIntent:'wide',transitionActive:true,transitionProximity:1});
 const plain=at({cameraIntent:'wide',transitionActive:false,transitionProximity:1});
 assert(trans.harmonyGainV879<=plain.harmonyGainV879);
 assert(at({cameraIntent:'wide',transitionActive:true,transitionProximity:1,
 settings:{...settings,crowdTransitionSofteningV879:false}}).harmonyGainV879===plain.harmonyGainV879);
});
check('invalid transition proximity does not create a transition',()=>{
 const q=at({cameraIntent:'wide',transitionActive:true,transitionProximity:2});
 assert.equal(q.harmonyModeV879,'wide');
});
check('cinematic protection is stronger than festival',()=>{
 const cinematic=at({settings:{...settings,crowdCameraStyleV879:'cinematic'}});
 const festival=at({settings:{...settings,crowdCameraStyleV879:'festival'}});
 assert(cinematic.harmonyGainV879<festival.harmonyGainV879);
});
check('intensity zero is exact bypass',()=>{
 const q=at({settings:{...settings,crowdCameraStrengthV879:0}});
 assert.equal(q.harmonyModeV879,'off');assert.equal(q.movement,base.movement);
});
check('parent-disabled channels never get re-enabled',()=>{
 const b={...base,phoneOpacity:0,armLift:0,festivalWave:0,cheer:0,wristbandGlow:0};
 const q=at({base:b,lyricsVisible:true});
 for(const k of ['phoneOpacity','armLift','festivalWave','cheer','wristbandGlow'])assert.equal(q[k],0,k);
});
check('every modified channel is attenuated, none is amplified',()=>{
 const q=at({lyricsVisible:true});
 for(const k of ['movement','cheer','armLift','festivalWave','phoneOpacity','lightGain',
   'wristbandGlow','choreographyStrength','interactionStrengthV877','emotionSwellV878']){
  assert(q[k]>=0&&q[k]<=base[k]+1e-12,k);
 }
 for(const k of ['count','active','phase','phoneCount','wristbandCount','primary','secondary'])
  assert.equal(q[k],base[k],k);
});
check('all hard safety vetoes bypass camera modification',()=>{
 for(const patch of [{playing:false},{blackout:true},{manualLighting:true},{reducedMotion:true},
  {tier:'low'},{base:{...base,active:false}},{base:{...base,count:73}},
  {base:{...base,count:1}},{groupCount:0},{groupCount:5},
  {settings:{...settings,enabled:false}},{settings:{...settings,virtualCrowd:false}},
  {settings:{...settings,crowdCameraHarmonyV879:false}}]){
  assert.equal(at(patch).harmonyModeV879,'off',JSON.stringify(patch).slice(0,65));
 }
});
check('nonfinite numeric inputs fail closed',()=>{
 for(const patch of [{base:{...base,armLift:NaN}},{transitionProximity:NaN},
  {base:{...base,lightGain:Infinity}},{settings:{...settings,crowdCameraStrengthV879:Infinity}}])
  assert.equal(at(patch).harmonyModeV879,'off');
});
check('fallback config backward compatible with V878',()=>{
 const s=normalize({});assert.equal(s.crowdCameraHarmonyV879,true);
 assert.equal(s.crowdCameraStrengthV879,70);assert.equal(s.crowdCameraStyleV879,'balanced');
 for(const k of ['crowdLyricsGuardV879','crowdPerformerPriorityV879','crowdTransitionSofteningV879'])
  assert.equal(s[k],true,k);
 assert.equal(normalize({crowdCameraStrengthV879:200}).crowdCameraStrengthV879,100);
 assert.equal(normalize({crowdCameraStrengthV879:-10}).crowdCameraStrengthV879,0);
 assert.equal(normalize({crowdCameraStrengthV879:NaN}).crowdCameraStrengthV879,70);
 assert.equal(normalize({crowdCameraStyleV879:'bad'}).crowdCameraStyleV879,'balanced');
});
check('safety flags can be independently disabled',()=>{
 const none=at({verifiedCamera:false,lyricsVisible:true,
  settings:{...settings,crowdLyricsGuardV879:false}});
 assert.equal(none.harmonyModeV879,'off');
});
check('motion remains within existing 72-instance geometry and bounded scratch',()=>{
 const people=layout(),q=at({lyricsVisible:true});
 assert.equal(people.length,72);
 for(let i=0;i<72;i++)for(const phase of [0,3,10,20]){
  const out=scratch();const cue={...q,phase};baseMotion(i,people[i],cue,out);
  motion(i,people[i],cue,out);
  assert(Math.abs(out.horizontal)<=.08501);assert(Math.abs(out.bob)<=.07501);
  assert(Math.abs(out.tilt)<=.09001);assert(out.armAccent<=.35001);
  assert(Math.abs(out.wavePhase)<=.55001);
  if(people[i].x>0)assert(out.horizontal>=0);
  else assert(out.horizontal<=0);
 }
});
check('invalid motion sample never mutates scratch',()=>{
 const p=layout()[0],s=scratch(),q=at();
 motion(-1,p,q,s);assert.deepEqual(s,scratch());
 motion(999,p,q,s);assert.deepEqual(s,scratch());
 motion(0,p,{...q,active:false},s);assert.deepEqual(s,scratch());
});
check('motion from V879 never increases any displacement',()=>{
 const people=layout(),q=at({lyricsVisible:true});
 for(let i=0;i<72;i++){
  const s=scratch();baseMotion(i,people[i],q,s);
  const old={...s};motion(i,people[i],q,s);
  for(const k of ['horizontal','bob','tilt','armAccent','wavePhase'])
   assert(Math.abs(s[k])<=Math.abs(old[k])+1e-12,k);
 }
});
check('pure function deterministic, input unaffected',()=>{
 const snapshot=JSON.stringify(input);
 assert.deepEqual(at(),at());assert.equal(JSON.stringify(input),snapshot);
});
check('scene integration downstream of V878 and V825 performance gate',()=>{
 const src=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
 assert(src.indexOf('planCrowdCameraStageHarmonyV879({')>src.indexOf('planSmartAudienceEmotionV878({'));
 assert(src.indexOf('planCrowdCameraStageHarmonyV879({')>src.indexOf('fxPerfV825.gains.crowd'));
 assert(src.includes("cameraIntent:cinematicCueV761?.intent??null"));
 assert(src.includes('manualCamera:cameraNarrativeV605?.manualCamera===true'));
 assert(src.includes("verifiedCamera:fxCueV810.active&&fxCueV810.reason==='music'"));
});
check('all existing crowd renderers apply V879 after V878, without extra meshes',()=>{
 for(const file of ['VirtualConcertCrowdV815.tsx','IntelligentAudienceArmsV874.tsx','FestivalWristbandsV875.tsx']){
  const src=fs.readFileSync('components/visualizer/'+file,'utf8');
  assert(src.indexOf('applyCrowdCameraHarmonyMotionV879(index,p,cue,choreographyMotion)')>
    src.indexOf('applyAudienceEmotionMotionV878(index,p,cue,choreographyMotion)'));
 }
});
check('Concert FX panel stores and previews V879 settings',()=>{
 const panel=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
 assert(panel.includes('V879 · Intelligent Crowd Camera &amp; Stage Harmony'));
 assert(panel.includes('harmonyPreviewV879.harmonyGainV879'));
 assert(panel.includes("patch({crowdCameraStrengthV879:+e.target.value})"));
});
console.log('V879 Crowd Camera & Stage Harmony: '+checks+'/'+checks+' Regressionstests erfolgreich.');
