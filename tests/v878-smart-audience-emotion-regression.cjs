'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planSmartAudienceEmotionV878:plan,applyAudienceEmotionMotionV878:sample}=load('components/visualizer/smartAudienceEmotionDirectorV878');
const {planIntelligentCrowdInteractionV877:interact}=load('components/visualizer/intelligentCrowdInteractionV877');
const {planDynamicFestivalCrowdChoreographyV876:choreography,
 createCrowdMotionScratchV876:scratch,sampleCrowdChoreographyV876:sampleBase}=load('components/visualizer/dynamicFestivalCrowdChoreographyV876');
const {planSmartFestivalAtmosphereV875:festival}=load('components/visualizer/smartFestivalAtmosphereV875');
const {planIntelligentAudienceV874:audience}=load('components/visualizer/intelligentAudienceExperienceV874');
const {planVirtualConcertCrowdV815:crowd,createVirtualCrowdLayoutV815:layout}=load('components/visualizer/virtualConcertCrowdPlannerV815');
const {normalizeConcertFxV810:normalize}=load('components/visualizer/concertFxStudioV810');
const settings=normalize({quality:'ultra',crowdIntensity:100,intensity:100,crowdDensity:'arena',
 festivalAtmosphereStrengthV875:100,festivalAtmosphereStyleV875:'immersive',
 crowdChoreographyStrengthV876:100,crowdChoreographyStyleV876:'festival',
 crowdInteractionStrengthV877:100,crowdInteractionStyleV877:'lively',
 crowdEmotionStrengthV878:100,crowdEmotionStyleV878:'balanced'});
const fx={active:true,reason:'music',genre:'hardtekk',section:'drop',phase:8,
 primary:'#23fff1',secondary:'#f326b8'};
const c={fx,settings,tier:'high',energy:.91,kick:.97,lyricsProtected:false,
 vocalFocus:false,reducedMotion:false};
const crowdBase=crowd({...c,groupCount:2,crowdBudget:1});
const arms=audience({...c,base:crowdBase});
const fest=festival({...c,base:arms,playing:true,manualLighting:false,blackout:false});
const choreo=choreography({...c,base:fest,playing:true,manualLighting:false,blackout:false});
const base=interact({...c,base:choreo,playing:true,manualLighting:false,blackout:false,
 groupCount:2,focusSlot:0,focusVerified:true,lyrics:null,lyricsVisible:false,progressMs:1000});
const input={...c,base,playing:true,manualLighting:false,blackout:false,
 previous:null,trackId:'song-A',positionMs:1000};
let checks=0;
function check(label,fn){try{fn();checks++;}catch(e){e.message=label+': '+e.message;throw e;}}
const at=(section,patch={})=>plan({...input,fx:{...fx,section},...patch});
check('verified drops are euphoric and bounded',()=>{
 const {cue,state}=at('drop');assert.equal(cue.emotionMoodV878,'euphoria');
 assert(state&&state.mood==='euphoria');assert(cue.emotionEnergyV878>0);
 assert.equal(cue.count,base.count);assert.equal(cue.phoneOpacity,base.phoneOpacity);
 assert.equal(cue.lightGain,base.lightGain);
});
check('musical section arc differentiates calm, build, chorus and finale',()=>{
 const moods=['intro','verse','hook','build','drop','break','finale'].map(section=>at(section).cue.emotionMoodV878);
 assert.deepEqual(moods,['curious','engaged','engaged','anticipation','euphoria','calm','finale']);
 assert(at('drop').cue.emotionEnergyV878>at('break').cue.emotionEnergyV878);
 assert(at('hook').cue.emotionEnergyV878>at('verse').cue.emotionEnergyV878);
});
check('singalong is only marked when V877 already verified it',()=>{
 const r=at('hook',{base:{...base,interactionModeV877:'singalong'}});
 assert.equal(r.cue.emotionMoodV878,'singalong');
 assert.equal(at('hook').cue.emotionMoodV878,'engaged');
});
check('audio smoothing uses song position, not frame calls',()=>{
 const first=plan({...input,energy:0,kick:0});
 const same=plan({...input,previous:first.state,energy:1,kick:1});
 assert.equal(same.state.smoothedEnergy,first.state.smoothedEnergy);
 const next=plan({...input,positionMs:1100,previous:first.state,energy:1,kick:1});
 assert(next.state.smoothedEnergy>0&&next.state.smoothedEnergy<.5);
 const later=plan({...input,positionMs:1800,previous:next.state,energy:1,kick:1});
 assert(later.state.smoothedEnergy>next.state.smoothedEnergy);
});
check('responsive reacts faster than cinematic',()=>{
 const zero=plan({...input,energy:0,kick:0});
 const responsive=plan({...input,positionMs:1200,energy:1,kick:1,previous:zero.state,
 settings:{...settings,crowdEmotionStyleV878:'responsive'}});
 const cinematic=plan({...input,positionMs:1200,energy:1,kick:1,previous:zero.state,
 settings:{...settings,crowdEmotionStyleV878:'cinematic'}});
 assert(responsive.state.smoothedEnergy>cinematic.state.smoothedEnergy);
});
check('seek backwards resets without stale smoothing',()=>{
 const first=at('drop');const back=plan({...input,previous:first.state,positionMs:500,energy:0,kick:0});
 assert.equal(back.state.smoothedEnergy,0);assert.equal(back.state.positionMs,500);
});
check('large seek forward resets without stale smoothing',()=>{
 const first=at('drop');const jump=plan({...input,previous:first.state,positionMs:20000,energy:0,kick:0});
 assert.equal(jump.state.smoothedEnergy,0);assert.equal(jump.state.positionMs,20000);
});
check('new track resets, even with nearby song position',()=>{
 const first=at('drop');const next=plan({...input,previous:first.state,trackId:'song-B',energy:0,kick:0});
 assert.equal(next.state.smoothedEnergy,0);assert.equal(next.state.trackId,'song-B');
});
check('verified section switch is immediate, despite hysteresis',()=>{
 const drop=at('drop');const quiet=at('break',{previous:drop.state,positionMs:1100});
 assert.equal(quiet.cue.emotionMoodV878,'calm');
 assert.equal(quiet.state.section,'break');
});
check('mood within same section has min hold',()=>{
 const low=at('verse',{energy:0,kick:0});
 const spike=at('verse',{previous:low.state,positionMs:1100,energy:1,kick:1});
 assert.equal(spike.cue.emotionMoodV878,'calm');
 const late=at('verse',{previous:low.state,positionMs:2400,energy:1,kick:1});
 assert.equal(late.cue.emotionMoodV878,'engaged');
});
check('no independent FX channels created or made brighter',()=>{
 const r=at('drop').cue;
 for(const f of ['cheer','armLift','festivalWave','wristbandGlow','choreographyStrength','interactionStrengthV877']){
  assert(r[f]<=base[f]+1e-8&&r[f]>=0,f);
 }
 for(const f of ['count','movement','phoneOpacity','lightGain','phoneCount','phase']){
  assert.equal(r[f],base[f],f);
 }
});
check('inherited disabled channel cannot be re-enabled',()=>{
 const blocked=plan({...input,base:{...base,armLift:0,cheer:0,festivalWave:0,
 wristbandGlow:0,interactionStrengthV877:0}}).cue;
 for(const f of ['cheer','armLift','festivalWave','wristbandGlow','interactionStrengthV877','emotionSwellV878'])
  assert.equal(blocked[f],0,f);
});
check('manual, blackout, reduced motion, pause and low tier veto',()=>{
 for(const patch of [{playing:false},{manualLighting:true},{blackout:true},
 {reducedMotion:true},{tier:'low'},
 {fx:{...fx,active:false}},{fx:{...fx,reason:'unverified'}},
 {base:{...base,active:false}},{base:{...base,count:73}},{base:{...base,movement:0}},
 {base:{...base,choreographyStrength:0}}]){
  const result=plan({...input,...patch});
  assert.equal(result.state,null);assert.equal(result.cue.emotionSwellV878,0);
  assert.equal(result.cue.emotionEnergyV878,0);
 }
});
check('parent settings, enable switch and strength zero veto',()=>{
 for(const patch of [{enabled:false},{virtualCrowd:false},
 {crowdExperienceV874:false},{smartFestivalAtmosphereV875:false},
 {crowdChoreographyV876:false},{crowdEmotionDirectorV878:false},
 {crowdEmotionStrengthV878:0},{intensity:0},{crowdIntensity:0}]){
  assert.equal(plan({...input,settings:{...settings,...patch}}).state,null);
 }
});
check('motion waves and contrast are separately opt-in',()=>{
 assert(at('drop',{settings:{...settings,crowdEmotionWavesV878:false}}).cue.emotionSwellV878===0);
 assert(at('drop',{settings:{...settings,crowdArmWaveV874:false}}).cue.emotionSwellV878===0);
 const prev=at('break');
 const withContrast=at('drop',{previous:prev.state,positionMs:2000});
 const noContrast=at('drop',{previous:prev.state,positionMs:2000,
 settings:{...settings,crowdEmotionContrastV878:false}});
 assert.equal(noContrast.cue.emotionContrastV878,0);
 assert(withContrast.cue.emotionContrastV878>0);
});
check('lyrics/camera and quality guard emotion',()=>{
 assert(at('drop',{tier:'balanced'}).cue.emotionEnergyV878<at('drop').cue.emotionEnergyV878);
 assert(at('drop',{lyricsProtected:true}).cue.emotionEnergyV878<at('drop').cue.emotionEnergyV878);
 assert(at('drop',{vocalFocus:true}).cue.emotionEnergyV878<at('drop').cue.emotionEnergyV878);
});
check('bad numeric data fails closed',()=>{
 for(const patch of [{positionMs:NaN},{energy:Infinity},{kick:NaN},
 {settings:{...settings,crowdEmotionStrengthV878:Infinity}},
 {base:{...base,choreographyStrength:NaN}}]){
  const r=plan({...input,...patch});assert.equal(r.state,null);assert.equal(r.cue.emotionEnergyV878,0);
 }
});
check('state and input are immutable and deterministic',()=>{
 const first=plan(input),copy=JSON.stringify(input),second=plan(input);
 assert.deepEqual(first,second);assert.equal(JSON.stringify(input),copy);
});
check('bounded scratch across all six sectors, 72 people and moods',()=>{
 const people=layout(),s=scratch();
 for(const phase of [0,.5,2,8,11,20,30])for(let k=0;k<72;k++){
  const cue={...at('drop').cue,phase,emotionSwellV878:1};
  sampleBase(k,people[k],cue,s);sample(k,people[k],cue,s);
  assert(Math.abs(s.horizontal)<=.085001);assert(Math.abs(s.bob)<=.075001);
  assert(Math.abs(s.tilt)<=.090001);assert(s.armAccent>=0&&s.armAccent<=.350001);
  assert(Math.abs(s.wavePhase)<=.550001);assert(Math.abs(people[k].x+s.horizontal)>=2.90);
 }
});
check('inactive and invalid sample leaves scratch unchanged',()=>{
 const p=layout()[0],s=scratch();
 sample(0,p,{...at('drop').cue,emotionSwellV878:0},s);
 assert.deepEqual(s,scratch());
 sample(999,p,{...at('drop').cue,emotionSwellV878:1},s);
 assert.deepEqual(s,scratch());
 sample(0,p,{...at('drop').cue,active:false,emotionSwellV878:1},s);
 assert.deepEqual(s,scratch());
});
check('settings normalized from old config',()=>{
 const old=normalize({});assert.equal(old.crowdEmotionDirectorV878,true);
 assert.equal(old.crowdEmotionWavesV878,true);assert.equal(old.crowdEmotionContrastV878,true);
 assert.equal(old.crowdEmotionStrengthV878,65);assert.equal(old.crowdEmotionStyleV878,'balanced');
 assert.equal(normalize({crowdEmotionStrengthV878:-8}).crowdEmotionStrengthV878,0);
 assert.equal(normalize({crowdEmotionStrengthV878:200}).crowdEmotionStrengthV878,100);
 assert.equal(normalize({crowdEmotionStrengthV878:NaN}).crowdEmotionStrengthV878,65);
 assert.equal(normalize({crowdEmotionStyleV878:'nonsense'}).crowdEmotionStyleV878,'balanced');
});
check('stage installs director only downstream of V877 and V825 budget',()=>{
 const txt=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
 assert(txt.indexOf('planSmartAudienceEmotionV878({')>txt.indexOf('planIntelligentCrowdInteractionV877({'));
 assert(txt.indexOf('planSmartAudienceEmotionV878({')>txt.indexOf('fxPerfV825.gains.crowd'));
 assert(txt.includes('trackId:playback.trackId??null'));
 assert(txt.includes('audienceEmotionStateV878.current=audienceEmotionV878.state'));
});
check('no draw calls or react render loops added',()=>{
 for(const f of ['VirtualConcertCrowdV815.tsx','IntelligentAudienceArmsV874.tsx','FestivalWristbandsV875.tsx']){
  const txt=fs.readFileSync('components/visualizer/'+f,'utf8');
  assert(txt.includes('applyAudienceEmotionMotionV878(index,p,cue,choreographyMotion)'));
  assert(txt.indexOf('applyAudienceEmotionMotionV878(index,p,cue,choreographyMotion)')>
   txt.indexOf('applyCrowdInteractionMotionV877(index,p,cue,choreographyMotion)'));
  assert(!/<(pointLight|spotLight|directionalLight)/.test(txt));
 }
});
check('panel and both release gates registered',()=>{
 const txt=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
 assert(txt.includes('V878 · Smart Audience Emotion &amp; Energy Director'));
 assert(txt.includes('emotionV878.cue.emotionMoodV878'));
 const scripts=JSON.parse(fs.readFileSync('package.json','utf8')).scripts;
 assert(scripts['build:preflight'].includes('test:v878:types'));
 assert(scripts.prebuild.includes('test:v878'));
});
check('retired upgrade payload directories are absent and active sources remain typed',()=>{
 const config=JSON.parse(fs.readFileSync('tsconfig.json','utf8'));
 for(const name of ['v874','v875','v876','v877','v878']){
  assert(!fs.existsSync(name),name+' duplicated root staging directory');
  assert(!config.exclude.includes(name+'/**/*'),name+' obsolete TypeScript exclusion');
 }
 for(const file of ['intelligentAudienceExperienceV874.ts','smartFestivalAtmosphereV875.ts',
  'dynamicFestivalCrowdChoreographyV876.ts','intelligentCrowdInteractionV877.ts',
  'smartAudienceEmotionDirectorV878.ts'])
  assert(fs.existsSync('components/visualizer/'+file),file);
});
console.log(`PASS V878: ${checks} emotion, smoothing, safety, performance and integration tests`);
