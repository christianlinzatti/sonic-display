'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planIntelligentAudienceV874:plan}=load('components/visualizer/intelligentAudienceExperienceV874');
const {normalizeConcertFxV810:normalize}=load('components/visualizer/concertFxStudioV810');
const {planVirtualConcertCrowdV815:parent}=load('components/visualizer/virtualConcertCrowdPlannerV815');
const s=normalize({quality:'ultra',intensity:100,crowdIntensity:100,crowdDensity:'arena'});
const fx={active:true,reason:'music',genre:'hardtekk',section:'drop',phase:15,
 primary:'#88ffff',secondary:'#ff00ff'};
const source={fx,settings:s,tier:'high',lyricsProtected:false,vocalFocus:false,
 groupCount:1,energy:.86,kick:.94,crowdBudget:1};
const base=parent(source);
const input={base,fx,settings:s,energy:.86,kick:.94,tier:'high',
 lyricsProtected:false,vocalFocus:false,reducedMotion:false};
let checks=0;
const check=(name,fn)=>{try{fn();checks++}catch(e){e.message=name+': '+e.message;throw e}};
const drop=plan(input);
check('verified drop produces bounded reactive arms and phones',()=>{
 assert(base.active);assert(drop.armLift>0&&drop.armLift<=.88);
 assert(drop.phoneWave>0&&drop.phoneWave<=.74);assert(drop.cheer>0&&drop.cheer<=.75);
 assert.equal(drop.style,'rave');assert(drop.count<=72);assert(drop.phoneOpacity<=base.phoneOpacity);
});
check('never mutates original',()=>{const before=JSON.stringify(input);assert.deepEqual(plan(input),drop);assert.equal(JSON.stringify(input),before)});
check('genre movement differs',()=>{const rap=plan({...input,fx:{...fx,genre:'rap'}});const rock=plan({...input,fx:{...fx,genre:'rock'}});assert(rap.armLift<drop.armLift);assert.equal(rock.style,'clap')});
check('verse, break and hook reactions are ordered',()=>{const verse=plan({...input,fx:{...fx,section:'verse'}});const hook=plan({...input,fx:{...fx,section:'hook'}});const brk=plan({...input,fx:{...fx,section:'break'}});assert(brk.armLift<verse.armLift&&verse.armLift<hook.armLift&&hook.armLift<drop.armLift)});
check('lyrics and vocals outrank audience',()=>{assert(plan({...input,lyricsProtected:true}).armLift<drop.armLift);assert(plan({...input,vocalFocus:true}).armLift<drop.armLift)});
check('disabled options and old backups handled',()=>{assert.equal(normalize({crowdExperienceV874:false}).crowdExperienceV874,false);assert.equal(normalize({}).crowdArmWaveV874,true);assert.equal(plan({...input,settings:{...s,crowdExperienceV874:false}}).armLift,0);assert.equal(plan({...input,settings:{...s,crowdArmWaveV874:false}}).armLift,0);assert.equal(plan({...input,settings:{...s,crowdPhoneWaveV874:false}}).phoneWave,0)});
check('phones never wake when parent phones muted',()=>{assert.equal(plan({...input,base:{...base,phoneOpacity:0}}).phoneWave,0);assert.equal(plan({...input,settings:{...s,crowdPhones:false}}).phoneWave,0)});
check('fails closed for unverified, suppressed and reduced motion',()=>{for(const x of [
 {base:{...base,active:false}},{base:{...base,movement:0}},{fx:{...fx,reason:'unverified'}},
 {tier:'low'},{reducedMotion:true},{energy:NaN},{kick:Infinity},
 {settings:{...s,virtualCrowd:false}},{base:{...base,count:0}},
 ])assert.equal(plan({...input,...x}).armLift,0)});
check('small source gain cannot produce large motion',()=>assert(plan({...input,base:{...base,movement:.002}}).armLift<drop.armLift*.02));
check('performance tier reduces response',()=>assert(plan({...input,tier:'balanced'}).armLift<drop.armLift));
check('rendering bounds and stage integration',()=>{
 const arms=fs.readFileSync('components/visualizer/IntelligentAudienceArmsV874.tsx','utf8');
 const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
 const panel=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
 assert.equal((arms.match(/<instancedMesh\s/g)||[]).length,2);
 assert(!arms.includes('<pointLight')&&!arms.includes('<spotLight'));
 assert(arms.includes('CROWD_MAX_V815')&&arms.includes('depthWrite={false}'));
 assert(stage.includes('planIntelligentAudienceV874')&&stage.includes('<IntelligentAudienceArmsV874 cueRef={crowdCueV815}/>'));
 assert(panel.includes('crowdExperienceV874')&&panel.includes('crowdPhoneWaveV874'));
});
console.log(`PASS V874: ${checks} audience response, safety, settings, rendering and integration tests`);
