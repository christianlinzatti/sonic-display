'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planIntelligentCrowdInteractionV877:plan,timedLyricPulseV877:lyric,
 applyCrowdInteractionMotionV877:sample}=load('components/visualizer/intelligentCrowdInteractionV877');
const {planDynamicFestivalCrowdChoreographyV876:choreo,
 createCrowdMotionScratchV876:scratch,sampleCrowdChoreographyV876:sampleParent}=load('components/visualizer/dynamicFestivalCrowdChoreographyV876');
const {planSmartFestivalAtmosphereV875:festival}=load('components/visualizer/smartFestivalAtmosphereV875');
const {planIntelligentAudienceV874:audience}=load('components/visualizer/intelligentAudienceExperienceV874');
const {planVirtualConcertCrowdV815:crowd,createVirtualCrowdLayoutV815:layout}=load('components/visualizer/virtualConcertCrowdPlannerV815');
const {normalizeConcertFxV810:normalize}=load('components/visualizer/concertFxStudioV810');
const settings=normalize({quality:'ultra',crowdIntensity:100,intensity:100,crowdDensity:'arena',
 festivalAtmosphereStrengthV875:100,festivalAtmosphereStyleV875:'immersive',
 crowdChoreographyStrengthV876:100,crowdChoreographyStyleV876:'festival',
 crowdInteractionStrengthV877:100,crowdInteractionStyleV877:'lively'});
const fx={active:true,reason:'music',genre:'hardtekk',section:'drop',phase:8,
 primary:'#23fff1',secondary:'#f326b8'};
const common={fx,settings,tier:'high',energy:.91,kick:.97,lyricsProtected:false,vocalFocus:false,
 reducedMotion:false};
const parent=crowd({...common,groupCount:2,crowdBudget:1});
const a=audience({...common,base:parent});
const fest=festival({...common,base:a,playing:true,manualLighting:false,blackout:false});
const base=choreo({...common,base:fest,playing:true,manualLighting:false,blackout:false});
const lines={synced:true,lines:[
 {startMs:1000,endMs:2100,text:'Eins'},
 {startMs:2200,endMs:3900,text:'Alle Hände hoch'},
 {startMs:4000,endMs:null,text:'Noch einmal'}]};
const input={...common,base,playing:true,manualLighting:false,blackout:false,
 groupCount:2,focusSlot:0,focusVerified:true,lyrics:lines,lyricsVisible:true,progressMs:2500};
let checks=0;
function check(name,fn){try{fn();checks++;}catch(e){e.message=name+': '+e.message;throw e;}}
const drop=plan(input);
check('drop cheer follows verified cue',()=>{
 assert.equal(drop.interactionModeV877,'drop-cheer');assert(drop.interactionStrengthV877>0);
 assert.equal(drop.count,base.count);assert.equal(drop.lightGain,base.lightGain);
 assert.equal(drop.phoneOpacity,base.phoneOpacity);assert.equal(drop.festivalWave,base.festivalWave);
});
check('hook singalong requires timed line',()=>{
 const r=plan({...input,fx:{...fx,section:'hook'}});
 assert.equal(r.interactionModeV877,'singalong');assert(r.interactionLyricPulseV877>0);
});
check('rap verse response based on actual line',()=>{
 const r=plan({...input,fx:{...fx,genre:'rap',section:'verse'}});
 assert.equal(r.interactionModeV877,'rap-response');
});
check('no invented lyric response when only plain text',()=>{
 const r=plan({...input,fx:{...fx,section:'hook'},lyrics:{...lines,synced:false}});
 assert.notEqual(r.interactionModeV877,'singalong');
});
check('no response when lyrics hidden',()=>{
 const r=plan({...input,fx:{...fx,section:'hook'},lyricsVisible:false});
 assert.notEqual(r.interactionModeV877,'singalong');
});
check('no response in timestamp gaps',()=>{
 assert.equal(lyric(lines,true,2150),0);assert.equal(lyric(lines,true,3990),0);
 assert.equal(lyric(lines,true,5900),0);
});
check('timed lyric boundaries are seek-stable',()=>{
 assert.equal(lyric(lines,true,500),0);assert.equal(lyric(lines,true,1000),0);
 assert(lyric(lines,true,1500)>0);assert.equal(lyric(lines,true,2100),0);
 assert.equal(lyric(lines,true,-1),0);assert.equal(lyric(lines,true,NaN),0);
 assert.equal(lyric(lines,false,1500),0);
});
check('expired lyric does not linger',()=>assert.equal(lyric(lines,true,6900),0));
check('reject malformed timing',()=>{
 assert.equal(lyric({synced:true,lines:[{startMs:NaN,endMs:3500,text:'x'}]},true,1500),0);
 assert.equal(lyric({synced:true,lines:[{startMs:1000,endMs:900,text:'x'}]},true,1001),0);
 assert.equal(lyric({synced:true,lines:[{startMs:1000,endMs:3000,text:' '}]},true,1500),0);
});
check('performer focus only from validated slot',()=>{
 const args={...input,fx:{...fx,section:'verse',genre:'rock'},lyricsVisible:false};
 const r=plan(args);assert.equal(r.interactionModeV877,'performer-follow');
 assert.equal(r.interactionSectorV877,0);
 assert.equal(plan({...args,focusSlot:1}).interactionSectorV877,2);
 assert.notEqual(plan({...args,focusVerified:false}).interactionModeV877,'performer-follow');
 assert.notEqual(plan({...args,focusSlot:9}).interactionModeV877,'performer-follow');
});
check('ensemble echo for group without spotlight',()=>{
 const r=plan({...input,fx:{...fx,section:'verse',genre:'rock'},focusVerified:false,lyricsVisible:false});
 assert.equal(r.interactionModeV877,'ensemble-echo');
});
check('break and intro stay quiet',()=>{
 for(const section of ['break','intro']){
  assert.equal(plan({...input,fx:{...fx,section}}).interactionModeV877,'none');
 }
});
check('finale creates bounded wave',()=>{
 assert.equal(plan({...input,fx:{...fx,section:'finale'}}).interactionModeV877,'finale-wave');
});
check('blocked without FX verification or parent safety permission',()=>{
 for(const patch of [{playing:false},{manualLighting:true},{blackout:true},
  {reducedMotion:true},{tier:'low'},
  {fx:{...fx,active:false}},{fx:{...fx,reason:'unverified'}},
  {base:{...base,active:false}},{base:{...base,count:99}},
  {base:{...base,movement:0}},{base:{...base,choreographyStrength:0}},
  {groupCount:0},{groupCount:5}]){
  assert.equal(plan({...input,...patch}).interactionStrengthV877,0);
 }
});
check('settings and parent toggles are respected',()=>{
 for(const settingsPatch of [{enabled:false},{virtualCrowd:false},
  {crowdExperienceV874:false},{smartFestivalAtmosphereV875:false},
  {crowdChoreographyV876:false},{crowdInteractionV877:false},
  {crowdInteractionStrengthV877:0},{crowdIntensity:0}]){
  assert.equal(plan({...input,settings:{...settings,...settingsPatch}}).interactionStrengthV877,0);
 }
});
check('user toggles suppress specific interactions',()=>{
 const hook={...input,fx:{...fx,section:'hook'},settings:{...settings,crowdCallResponseV877:false}};
 assert.notEqual(plan(hook).interactionModeV877,'singalong');
 assert.notEqual(plan({...hook,focusVerified:false,groupCount:1}).interactionModeV877,'singalong');
 const focus={...input,fx:{...fx,section:'verse',genre:'rock'},lyricsVisible:false,
  settings:{...settings,crowdFollowPerformerV877:false}};
 assert.notEqual(plan(focus).interactionModeV877,'performer-follow');
 assert.equal(plan({...focus,settings:{...focus.settings,crowdDanceEchoV877:false}}).interactionModeV877,'none');
});
check('bad numerics fail closed',()=>{
 for(const patch of [{energy:NaN},{kick:Infinity},{progressMs:NaN},
 {base:{...base,phase:NaN}},{base:{...base,movement:Infinity}},
 {base:{...base,choreographyStrength:NaN}},
 {settings:{...settings,crowdInteractionStrengthV877:NaN}}]){
  const r=plan({...input,...patch});
  if('progressMs' in patch){assert.equal(r.interactionModeV877,'drop-cheer');}
  else assert.equal(r.interactionStrengthV877,0);
 }
});
check('style, lyrics and tier throttle rather than override',()=>{
 assert(plan({...input,settings:{...settings,crowdInteractionStyleV877:'subtle'}}).interactionStrengthV877<drop.interactionStrengthV877);
 assert(plan({...input,lyricsProtected:true}).interactionStrengthV877<drop.interactionStrengthV877);
 assert(plan({...input,vocalFocus:true}).interactionStrengthV877<drop.interactionStrengthV877);
 assert(plan({...input,tier:'balanced'}).interactionStrengthV877<drop.interactionStrengthV877);
});
check('normalizes historical settings and clamps input',()=>{
 const old=normalize({});assert.equal(old.crowdInteractionV877,true);
 assert.equal(old.crowdCallResponseV877,true);assert.equal(old.crowdFollowPerformerV877,true);
 assert.equal(old.crowdDanceEchoV877,true);assert.equal(old.crowdInteractionStrengthV877,65);
 assert.equal(old.crowdInteractionStyleV877,'balanced');
 assert.equal(normalize({crowdInteractionStrengthV877:-20}).crowdInteractionStrengthV877,0);
 assert.equal(normalize({crowdInteractionStrengthV877:250}).crowdInteractionStrengthV877,100);
 assert.equal(normalize({crowdInteractionStrengthV877:Infinity}).crowdInteractionStrengthV877,65);
 assert.equal(normalize({crowdInteractionStyleV877:'bad'}).crowdInteractionStyleV877,'balanced');
});
check('pure and deterministic',()=>{
 const before=JSON.stringify(input),a=plan(input),b=plan(input);
 assert.deepEqual(a,b);assert.equal(JSON.stringify(input),before);
});
check('applies bounded scratch per-person for 72 viewers',()=>{
 const people=layout(),s=scratch();
 for(const mode of ['singalong','rap-response','performer-follow','ensemble-echo','drop-cheer','finale-wave']){
  for(const phase of [0,.12,1,4,8,12,26])for(let k=0;k<72;k++){
   const cue={...drop,interactionModeV877:mode,phase,
    interactionStrengthV877:1,interactionSectorV877:1,interactionLyricPulseV877:.75};
   sampleParent(k,people[k],cue,s);sample(k,people[k],cue,s);
   assert(Math.abs(s.horizontal)<=.0850001);assert(Math.abs(s.bob)<=.0750001);
   assert(Math.abs(s.tilt)<=.090001);assert(s.armAccent>=0&&s.armAccent<=.350001);
   assert(Math.abs(s.wavePhase)<=.550001);
   assert(Math.abs(people[k].x+s.horizontal)>=2.90);
  }
 }
});
check('silent mode never modifies scratch',()=>{
 const s=scratch(),person=layout()[5];
 sample(5,person,{...drop,interactionStrengthV877:0},s);assert.deepEqual(s,scratch());
 sample(5,person,{...drop,interactionModeV877:'none'},s);assert.deepEqual(s,scratch());
 sample(500,person,drop,s);assert.deepEqual(s,scratch());
});
check('audience groups respond differently',()=>{
 const p=layout(),vals=[];
 for(const k of [0,12,24,36,48,60]){
  const s=scratch();sampleParent(k,p[k],drop,s);sample(k,p[k],drop,s);
  vals.push([s.horizontal,s.armAccent,s.wavePhase].join(','));
 }
 assert(new Set(vals).size>=4);
});
check('installer wiring uses V825 parent and verified inputs',()=>{
 const st=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
 assert(st.indexOf('planIntelligentCrowdInteractionV877({')>st.indexOf('planDynamicFestivalCrowdChoreographyV876({'));
 assert(st.indexOf('planIntelligentCrowdInteractionV877({')>st.indexOf('fxPerfV825.gains.crowd'));
 assert(st.includes('lyrics:lyricsV813,lyricsVisible:lyricsVisibleV813,progressMs:playback.positionMs'));
 assert(st.includes('focusVerified:vocalSpotlightV797?.lightingActive===true'));
});
check('all three renderers reuse same scratch and draw calls',()=>{
 for(const file of ['VirtualConcertCrowdV815.tsx','IntelligentAudienceArmsV874.tsx','FestivalWristbandsV875.tsx']){
  const text=fs.readFileSync('components/visualizer/'+file,'utf8');
  assert(text.includes('applyCrowdInteractionMotionV877(index,p,cue,choreographyMotion)'));
  assert(text.indexOf('applyCrowdInteractionMotionV877(index,p,cue,choreographyMotion)')>
    text.indexOf('sampleCrowdChoreographyV876(index,p,cue,choreographyMotion)'));
  assert(!/<(pointLight|spotLight|directionalLight)/.test(text));
 }
});
check('panel toggles and release preflight registered',()=>{
 const ui=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
 const scripts=JSON.parse(fs.readFileSync('package.json','utf8')).scripts;
 assert(ui.includes('V877 · Intelligent Crowd Interaction 4.0'));
 assert(ui.includes('interactionV877.interactionModeV877'));
 assert(scripts['build:preflight'].includes('test:v877:types'));
 assert(scripts.prebuild.includes('test:v877'));
});
console.log(`PASS V877: ${checks} planner, safety, lyrics, performance and integration tests`);
