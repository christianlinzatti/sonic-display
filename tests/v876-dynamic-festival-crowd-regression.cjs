'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planDynamicFestivalCrowdChoreographyV876:plan,
 sampleCrowdChoreographyV876:sample,createCrowdMotionScratchV876:scratch,
 CROWD_SECTORS_V876:sectors}=load('components/visualizer/dynamicFestivalCrowdChoreographyV876');
const {planSmartFestivalAtmosphereV875:festival}=load('components/visualizer/smartFestivalAtmosphereV875');
const {planIntelligentAudienceV874:audience}=load('components/visualizer/intelligentAudienceExperienceV874');
const {planVirtualConcertCrowdV815:crowd,createVirtualCrowdLayoutV815:layout}=load('components/visualizer/virtualConcertCrowdPlannerV815');
const {normalizeConcertFxV810:normalize}=load('components/visualizer/concertFxStudioV810');
const settings=normalize({quality:'ultra',crowdIntensity:100,intensity:100,crowdDensity:'arena',
 festivalAtmosphereStrengthV875:100,festivalAtmosphereStyleV875:'immersive',
 crowdChoreographyStrengthV876:100,crowdChoreographyStyleV876:'festival'});
const fx={active:true,reason:'music',genre:'hardtekk',section:'drop',phase:8,
 primary:'#23fff1',secondary:'#f326b8'};
const parent=crowd({fx,settings,tier:'high',lyricsProtected:false,vocalFocus:false,groupCount:1,
 energy:.9,kick:.95,crowdBudget:1});
const audienceCue=audience({base:parent,fx,settings,tier:'high',lyricsProtected:false,vocalFocus:false,
 reducedMotion:false,energy:.9,kick:.95});
const base=festival({base:audienceCue,fx,settings,tier:'high',lyricsProtected:false,
 vocalFocus:false,reducedMotion:false,energy:.9,kick:.95,playing:true,manualLighting:false,blackout:false});
const input={base,fx,settings,energy:.9,kick:.95,tier:'high',playing:true,manualLighting:false,
 blackout:false,lyricsProtected:false,vocalFocus:false,reducedMotion:false};
let checks=0;
function check(label,fn){try{fn();checks++}catch(e){e.message=label+': '+e.message;throw e}}
const result=plan(input);
check('drop produces bounded choreography',()=>{
 assert.equal(result.choreographyMode,'bounce');assert(result.choreographyStrength>0);
 assert(result.choreographyStrength<=1);assert.equal(result.count,base.count);
 assert.equal(result.lightGain,base.lightGain);assert.equal(result.festivalWave,base.festivalWave);
});
check('six fixed crowd sectors',()=>assert.equal(sectors,6));
check('sections change choreography',()=>{
 for(const [section,expected] of Object.entries({intro:'sway',verse:'groove',hook:'clap',
  build:'ripple',drop:'bounce',break:'rest',finale:'surge'})){
  const r=plan({...input,fx:{...fx,section}});assert.equal(r.choreographyMode,expected);
 }
});
check('genre-specific patterns',()=>{
 assert.equal(plan({...input,fx:{...fx,genre:'rap',section:'hook'}}).choreographyMode,'groove');
 assert.equal(plan({...input,fx:{...fx,genre:'rock'}}).choreographyMode,'clap');
 assert.equal(plan({...input,fx:{...fx,genre:'pop',section:'drop'}}).choreographyMode,'sway');
});
check('no choreography during break',()=>assert.equal(plan({...input,fx:{...fx,section:'break'}}).choreographyStrength,0));
check('genre and style influence strength',()=>{
 const natural=plan({...input,settings:{...settings,crowdChoreographyStyleV876:'natural'}});
 assert(natural.choreographyStrength<result.choreographyStrength);
 assert(plan({...input,fx:{...fx,genre:'rap'}}).choreographyStrength<result.choreographyStrength);
});
check('parent manual/off/blackout and lowered tier fail closed',()=>{
 for(const patch of [{playing:false},{manualLighting:true},{blackout:true},
  {reducedMotion:true},{tier:'low'},{fx:{...fx,reason:'unverified'}},
  {base:{...base,active:false}},{base:{...base,movement:0}},
  {base:{...base,count:1}},{base:{...base,count:99}}]){
  const r=plan({...input,...patch});assert.equal(r.choreographyStrength,0);
 }
});
check('disabled parents and settings fail closed',()=>{
 for(const over of [{virtualCrowd:false},{crowdExperienceV874:false},
  {smartFestivalAtmosphereV875:false},{crowdChoreographyV876:false},
  {crowdChoreographyStrengthV876:0}]){
  assert.equal(plan({...input,settings:{...settings,...over}}).choreographyStrength,0);
 }
});
check('lyrics, vocals and balanced tier reduce motion',()=>{
 assert(plan({...input,lyricsProtected:true}).choreographyStrength<result.choreographyStrength);
 assert(plan({...input,vocalFocus:true}).choreographyStrength<result.choreographyStrength);
 assert(plan({...input,tier:'balanced'}).choreographyStrength<result.choreographyStrength);
});
check('invalid numeric values fail closed',()=>{
 for(const patch of [{energy:NaN},{kick:Infinity},{base:{...base,phase:NaN}},
  {base:{...base,movement:Infinity}},{settings:{...settings,crowdChoreographyStrengthV876:NaN}}]){
  assert.equal(plan({...input,...patch}).choreographyStrength,0);
 }
});
check('historical config defaults and normalization',()=>{
 const old=normalize({});assert.equal(old.crowdChoreographyV876,true);
 assert.equal(old.crowdSectorSyncV876,true);assert.equal(old.crowdChoreographyStrengthV876,65);
 assert.equal(old.crowdChoreographyStyleV876,'concert');
 assert.equal(normalize({crowdChoreographyStrengthV876:Infinity}).crowdChoreographyStrengthV876,65);
 assert.equal(normalize({crowdChoreographyStrengthV876:-100}).crowdChoreographyStrengthV876,0);
 assert.equal(normalize({crowdChoreographyStrengthV876:400}).crowdChoreographyStrengthV876,100);
 assert.equal(normalize({crowdChoreographyStyleV876:'invalid'}).crowdChoreographyStyleV876,'concert');
});
check('pure planner and repeatable motion',()=>{
 const before=JSON.stringify(input);assert.deepEqual(plan(input),plan(input));
 assert.equal(JSON.stringify(input),before);
 const out=scratch(),p=layout()[0];sample(0,p,result,out);
 const first={...out};sample(0,p,result,out);assert.deepEqual(out,first);
});
check('motion remains in safe bounds for all 72 spectators',()=>{
 const people=layout();assert.equal(people.length,72);
 const out=scratch();
 for(const time of [0,.1,1.2,3.25,18.2,47.8])for(let j=0;j<72;j++){
  sample(j,people[j],{...result,phase:time},out);
  assert(Math.abs(out.horizontal)<=.0850001);
  assert(Math.abs(out.bob)<=.0750001);
  assert(Math.abs(out.tilt)<=.0900001);
  assert(out.armAccent>=0&&out.armAccent<=.240001);
  assert(Math.abs(out.wavePhase)<=.450001);
  assert(Math.abs(people[j].x+out.horizontal)>2.90);
 }
});
check('all sectors react differently but stay stable',()=>{
 const people=layout(),out=scratch(),values=[];
 for(const j of [0,12,24,36,48,60]){
  sample(j,people[j],result,out);values.push(out.horizontal.toFixed(6));
 }
 assert(new Set(values).size>=4);
});
check('sector sync can be disabled',()=>{
 const a=plan({...input,settings:{...settings,crowdSectorSyncV876:false}});
 assert.equal(a.choreographySectorSync,false);
 assert.equal(a.choreographyStrength,result.choreographyStrength);
 const p=layout()[24],o=scratch();sample(24,p,a,o);const unsynced=o.horizontal;
 sample(24,p,result,o);assert.notEqual(o.horizontal,unsynced);
});
check('disabled choreography yields exact zero sample and reuses scratch',()=>{
 const out=scratch(),person=layout()[0];sample(0,person,result,out);
 sample(0,person,{...result,choreographyStrength:0},out);
 assert.deepEqual(out,scratch());
 sample(999,person,result,out);assert.deepEqual(out,scratch());
});
check('integration stays behind the safety governors and uses shared cues',()=>{
 const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
 const i=stage.indexOf('crowdCueV815.current=planDynamicFestivalCrowdChoreographyV876(');
 assert(i>stage.indexOf('crowdCueV815.current=planSmartFestivalAtmosphereV875('));
 assert(i>stage.indexOf('fxPerfV825.gains.crowd'));
 assert(stage.includes('base:crowdCueV815.current as FestivalAtmosphereCueV875'));
});
check('all existing renderers reuse instanced meshes and sample same motion',()=>{
 for(const rel of ['VirtualConcertCrowdV815.tsx','IntelligentAudienceArmsV874.tsx','FestivalWristbandsV875.tsx']){
  const source=fs.readFileSync('components/visualizer/'+rel,'utf8');
  assert(source.includes('sampleCrowdChoreographyV876(index,p,cue,choreographyMotion)'));
  assert(source.includes('useMemo(createCrowdMotionScratchV876,[])'));
  assert(!/<(pointLight|spotLight|directionalLight)/.test(source));
 }
});
check('UI controls and preflight hooks are present',()=>{
 const ui=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
 const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
 assert(ui.includes('V876 · Dynamic Festival Crowd Choreography'));
 assert(ui.includes('choreographyV876.choreographyMode'));
 assert(pkg.scripts['build:preflight'].includes('test:v876:types'));
 assert(pkg.scripts.prebuild.includes('test:v876'));
});
console.log(`PASS V876: ${checks} choreography, safety, geometry and integration checks`);
