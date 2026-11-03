'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planSmartFestivalAtmosphereV875:plan}=load('components/visualizer/smartFestivalAtmosphereV875');
const {planIntelligentAudienceV874:audience}=load('components/visualizer/intelligentAudienceExperienceV874');
const {planVirtualConcertCrowdV815:parent}=load('components/visualizer/virtualConcertCrowdPlannerV815');
const {normalizeConcertFxV810:normalize}=load('components/visualizer/concertFxStudioV810');
const s=normalize({quality:'ultra',intensity:100,crowdIntensity:100,crowdDensity:'arena',festivalAtmosphereStrengthV875:100,festivalAtmosphereStyleV875:'immersive'});
const fx={active:true,reason:'music',genre:'hardtekk',section:'drop',phase:14,
 primary:'#23fff1',secondary:'#f326b8'};
const from=(x,settings=s)=>{
 const base=parent({fx:x,settings,tier:'high',lyricsProtected:false,vocalFocus:false,
  groupCount:1,energy:.88,kick:.94,crowdBudget:1});
 return audience({base,fx:x,settings,energy:.88,kick:.94,tier:'high',
  lyricsProtected:false,vocalFocus:false,reducedMotion:false});
};
const base=from(fx);
const input={base,fx,settings:s,energy:.88,kick:.94,tier:'high',playing:true,
 manualLighting:false,blackout:false,lyricsProtected:false,vocalFocus:false,reducedMotion:false};
let checks=0;
function check(label,fn){try{fn();checks++}catch(e){e.message=`${label}: ${e.message}`;throw e}}
const drop=plan(input);
check('drop produces visible but bounded ambience',()=>{
 assert.equal(drop.festivalMood,'peak');assert(drop.festivalWave>0&&drop.festivalWave<=.65);
 assert(drop.wristbandGlow>0&&drop.wristbandGlow<=.42);
 assert(drop.wristbandCount>=2&&drop.wristbandCount<=72);
});
check('every section gets the intended narrative',()=>{
 const moods={intro:'warmup',verse:'warmup',hook:'singalong',build:'anticipation',
  drop:'peak',break:'quiet',finale:'afterglow'};
 for(const [section,mood] of Object.entries(moods))assert.equal(plan({...input,fx:{...fx,section}}).festivalMood,mood);
});
check('section intensity ordering',()=>{
 const response=section=>plan({...input,fx:{...fx,section}}).festivalWave;
 assert(response('break')<response('intro')&&response('intro')<response('verse'));
 assert(response('verse')<response('build')&&response('build')<response('hook'));
 assert(response('hook')<response('drop')&&response('finale')<response('drop'));
});
check('no clock dependence or mutation',()=>{
 const before=JSON.stringify(input);assert.deepEqual(plan(input),plan(input));
 assert.equal(JSON.stringify(input),before);
});
check('genre-specific restraint',()=>{
 const change=genre=>plan({...input,fx:{...fx,genre}}).festivalWave;
 assert(change('rap')<change('hardtekk'));
 assert(change('rock')<change('hardstyle'));
});
check('style and intensity adjust output',()=>{
 const subtle=plan({...input,settings:{...s,festivalAtmosphereStyleV875:'subtle'}});
 const zero=plan({...input,settings:{...s,festivalAtmosphereStrengthV875:0}});
 assert(subtle.wristbandGlow<drop.wristbandGlow);
 assert.equal(zero.wristbandGlow,0);
 assert.equal(zero.festivalWave,0);
});
check('existing backup defaults and sanitization',()=>{
 const old=normalize({});assert.equal(old.smartFestivalAtmosphereV875,true);
 assert.equal(old.festivalWristbandsV875,true);assert.equal(old.festivalAtmosphereStrengthV875,65);
 assert.equal(normalize({festivalAtmosphereStyleV875:'INVALID'}).festivalAtmosphereStyleV875,'balanced');
 assert.equal(normalize({festivalAtmosphereStrengthV875:Infinity}).festivalAtmosphereStrengthV875,65);
 assert.equal(normalize({festivalAtmosphereStrengthV875:-30}).festivalAtmosphereStrengthV875,0);
 assert.equal(normalize({festivalAtmosphereStrengthV875:127}).festivalAtmosphereStrengthV875,100);
});
check('manual FX, blackout, pause and reduced motion always fail closed',()=>{
 for(const over of [{manualLighting:true},{blackout:true},{playing:false},
  {reducedMotion:true},{tier:'low'},{fx:{...fx,reason:'unverified'}},
  {fx:{...fx,active:false}}]){
  const result=plan({...input,...over});assert.equal(result.festivalWave,0);
  assert.equal(result.wristbandGlow,0);assert.equal(result.wristbandCount,0);
 }
});
check('never resurrect disabled parent or low movement',()=>{
 for(const over of [{active:false},{count:1},{count:73},{movement:0}]){
  const r=plan({...input,base:{...base,...over}});assert.equal(r.wristbandGlow,0);
 }
});
check('disabled parent options and independent sub-options',()=>{
 assert.equal(plan({...input,settings:{...s,virtualCrowd:false}}).festivalWave,0);
 assert.equal(plan({...input,settings:{...s,crowdExperienceV874:false}}).wristbandGlow,0);
 assert.equal(plan({...input,settings:{...s,smartFestivalAtmosphereV875:false}}).festivalWave,0);
 assert.equal(plan({...input,settings:{...s,festivalWristbandsV875:false}}).wristbandGlow,0);
 assert.equal(plan({...input,settings:{...s,festivalCrowdWavesV875:false}}).festivalWave,0);
 assert.equal(plan({...input,settings:{...s,crowdArmWaveV874:false}}).festivalWave,0);
});
check('protected lyrics and vocals reduce energy',()=>{
 assert(plan({...input,lyricsProtected:true}).festivalWave<drop.festivalWave);
 assert(plan({...input,vocalFocus:true}).wristbandGlow<drop.wristbandGlow);
});
check('balanced tier reduces gain without new crowd members',()=>{
 const reduced=plan({...input,tier:'balanced'});
 assert(reduced.festivalWave<drop.festivalWave);
 assert(reduced.wristbandCount<=drop.wristbandCount);
});
check('parent budgets cap extra glow and waves',()=>{
 const muted=plan({...input,base:{...base,lightGain:0,armLift:0}});
 assert.equal(muted.wristbandGlow,0);assert.equal(muted.festivalWave,0);
 assert.equal(muted.wristbandCount,0);
 const faint=plan({...input,base:{...base,movement:.001,lightGain:.0001,armLift:.001}});
 assert(faint.wristbandGlow<drop.wristbandGlow*.01);
});
check('invalid numeric inputs fail closed',()=>{
 for(const over of [{energy:NaN},{kick:Infinity},
  {settings:{...s,festivalAtmosphereStrengthV875:NaN}},
  {base:{...base,movement:NaN}},{base:{...base,count:Infinity}}]){
  const result=plan({...input,...over});assert.equal(result.wristbandGlow,0);
 }
});
check('renderer requires max 72 instanced wristbands and zero new lights',()=>{
 const src=fs.readFileSync('components/visualizer/FestivalWristbandsV875.tsx','utf8');
 const arms=fs.readFileSync('components/visualizer/IntelligentAudienceArmsV874.tsx','utf8');
 assert(arms.includes('waveStrength*Math.sin(cue.phase*1.8-p.x*.55)'));
 assert.equal((src.match(/<instancedMesh\s/g)||[]).length,2);
 assert(src.includes('CROWD_MAX_V815')&&src.includes('depthWrite={false}'));
 assert(!/<(pointLight|spotLight|directionalLight)/.test(src));
 assert(src.includes('tick.current<.05')&&src.includes('frustumCulled={false}'));
});
check('stage, settings UI and release preflight integration',()=>{
 const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
 const panel=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
 const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
 assert(stage.includes('crowdCueV815.current=planSmartFestivalAtmosphereV875('));
 assert(stage.indexOf('crowdCueV815.current=planIntelligentAudienceV874(')<stage.indexOf('crowdCueV815.current=planSmartFestivalAtmosphereV875('));
 assert(stage.includes('<FestivalWristbandsV875 cueRef={crowdCueV815}/>'));
 assert(panel.includes('V875 · Smart Festival Atmosphere 3.0'));
 assert(pkg.scripts['build:preflight'].includes('test:v875:types'));
 assert(pkg.scripts.prebuild.includes('test:v875'));
});
console.log(`PASS V875: ${checks} festival atmosphere, safety, rendering and integration tests`);
