'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {coordinateFestivalFxV871:plan,estimateFestivalCoverageV871:cover}=load('components/visualizer/festivalFxCoordinationV871');
const {normalizeConcertFxV810:normalize,planConcertFxV810:planFx}=load('components/visualizer/concertFxStudioV810');
let passed=0;
function check(name,fn){try{fn();passed++;}catch(e){e.message=`V871 ${name}: ${e.message}`;throw e;}}
const settings=normalize({enabled:true,quality:'ultra',intensity:100,festivalFxV844:true,
 festivalCoordinationV871:true,festivalClarityV871:70});
function setup(opts={}){
 const st=opts.settings??settings;
 const section=opts.section??'drop';
 const fx=planFx({settings:st,genre:opts.genre??'hardtekk',section,progressMs:6000,
 startMs:0,endMs:10000,active:true,verified:true,playing:true,reactive:true,
 reducedMotion:false,authored:false,blackout:false,lyricsProtected:false,vocalFocus:false,
 groupCount:2,tier:'high',energy:.99,kick:.99,bass:.95,mids:.8,highs:.77,
 ledBudget:1,laserBudget:1});
 return {settings:st,fx,playing:true,reducedMotion:false,blackout:false,manualLighting:false,
 lyricsProtected:false,vocalFocus:false,cameraCloseup:false,groupCount:2,tier:'high',authoredLanes:[],
 festival:{active:true,moment:'co2',co2Count:48,co2Opacity:.38,sparkGain:0,
 confettiGain:0,strobeGain:0,phase:fx.phase},
 foam:{active:true,bubbles:128,mist:160,opacity:.62,power:1,phase:fx.phase,side:'both',color:'#fff'},
 bubbles:{active:true,count:64,opacity:.27,phase:fx.phase,riseSpeed:1},
 streamers:{active:true,count:56,opacity:.34,phase:fx.phase,fallSpeed:1,spread:1,curl:1},
 finale:{active:true,moment:'metallic-rain',rainCount:80,wheelCount:0,rainOpacity:.38,
 wheelOpacity:0,phase:fx.phase,fallSpeed:1,wheelSpeed:0,palette:'gold'},
 flash:{active:true,opacity:.12,phase:fx.phase},...opts};
}
const cueKeys=['festival','foam','bubbles','streamers','finale','flash'];
const dimKeys={festival:['co2Count','co2Opacity','sparkGain','confettiGain','strobeGain'],
 foam:['bubbles','mist','opacity','power'],bubbles:['count','opacity'],
 streamers:['count','opacity'],finale:['rainCount','wheelCount','rainOpacity','wheelOpacity'],
 flash:['opacity']};
check('V871 enabled by default',()=>assert.equal(normalize().festivalCoordinationV871,true));
check('V871 clarity default 70',()=>assert.equal(normalize().festivalClarityV871,70));
for(const [given,expected] of [[-5,0],[105,100],[45.3,45],[NaN,70],[Infinity,70]]){
 check(`settings clarity normalized ${given}`,()=>assert.equal(normalize({festivalClarityV871:given}).festivalClarityV871,expected));
}
check('false preserves existing setting',()=>assert.equal(normalize({festivalCoordinationV871:false}).festivalCoordinationV871,false));
check('bad toggle falls back enabled',()=>assert.equal(normalize({festivalCoordinationV871:null}).festivalCoordinationV871,true));
const original=setup();const output=plan(original);
check('co2 hero wins when active',()=>assert.equal(output.hero,'co2'));
check('result is deterministic',()=>assert.deepEqual(plan(setup()),output));
check('inputs are untouched',()=>assert.equal(JSON.stringify(original),JSON.stringify(setup())));
check('output is independent object',()=>assert.notEqual(output.festival,original.festival));
check('prioritizes co2 over foam',()=>assert(output.foam.bubbles<original.foam.bubbles));
check('prioritizes co2 over bubbles',()=>assert(output.bubbles.count<original.bubbles.count));
check('prioritizes co2 over streamers',()=>assert(output.streamers.count<original.streamers.count));
check('global coverage is reduced',()=>assert(output.coverageAfter<output.coverageBefore));
check('coverage within budget except explicit flash',()=>assert(output.coverageAfter<=output.visibilityBudget+1e-9));
check('flash opt-in is exactly unchanged',()=>assert.strictEqual(output.flash,original.flash));
check('no new time or beat',()=>assert.equal(output.festival.phase,original.festival.phase));
for(const [label,opts,reason] of [
 ['toggle off',{settings:normalize({...settings,festivalCoordinationV871:false})},'disabled'],
 ['global off',{settings:normalize({...settings,enabled:false})},'disabled'],
 ['festival off',{settings:normalize({...settings,festivalFxV844:false})},'disabled'],
 ['pause',{playing:false},'protected'],['reduced motion',{reducedMotion:true},'protected'],
 ['blackout',{blackout:true},'protected'],['manual lighting',{manualLighting:true},'protected'],
 ['low tier',{tier:'low'},'protected'],['invalid phase',{fx:{...original.fx,phase:NaN}},'unverified'],
 ['unverified source',{fx:{...original.fx,reason:'unverified'}},'unverified'],
 ['invalid cast',{groupCount:7},'unverified'],
 ]){
 check(`${label} preserves ALL cues`,()=>{const i=setup(opts),o=plan(i);assert.equal(o.reason,reason);
   for(const k of cueKeys)assert.strictEqual(o[k],i[k],`${k} changed`);});
}
for(const section of ['intro','verse','hook','build','drop','break','finale'])for(const genre of ['rap','hardtekk','hardstyle','rock','pop','neutral']){
 check(`${section}/${genre}: no activation or gain`,()=>{
  const i=setup({section,genre});const o=plan(i);
  for(const lane of cueKeys){
   assert.equal(o[lane].active&&(!i[lane].active),false,`${lane} activated`);
   for(const k of dimKeys[lane])assert(o[lane][k]<=i[lane][k]+1e-9,`${lane}.${k} increased`);
  }
  assert(o.coverageAfter<=o.coverageBefore+1e-9);
  assert.deepEqual(plan(i),o);
 });
}
for(const [label,patch] of [
 ['lyrics',{lyricsProtected:true}],['vocals',{vocalFocus:true}],
 ['portrait',{cameraCloseup:true}],['4 performers',{groupCount:4}],
 ['balanced hardware',{tier:'balanced'}],['combined',{lyricsProtected:true,vocalFocus:true,cameraCloseup:true,groupCount:4}],
 ]){
 check(`${label} tightens visibility`,()=>{const o=plan(setup(patch));
  assert(o.visibilityBudget<output.visibilityBudget,`${label}: budget`);
  assert(o.coverageAfter<=o.coverageBefore+1e-9,`${label}: density`);
 });
}
for(const clarity of [0,20,50,70,90,100]){
 check(`clarity ${clarity}: bounded visible content`,()=>{
  const o=plan(setup({settings:normalize({...settings,festivalClarityV871:clarity})}));
  assert(o.coverageAfter<=o.visibilityBudget+1e-9);
  assert(o.coverageAfter<=o.coverageBefore+1e-9);
 });
}
check('high clarity dims at least as much as zero clarity',()=>{
 const low=plan(setup({settings:normalize({...settings,festivalClarityV871:0})}));
 const high=plan(setup({settings:normalize({...settings,festivalClarityV871:100})}));
 assert(high.coverageAfter<=low.coverageAfter+1e-9);
});
check('manual particle lane is bit-for-bit preserved',()=>{
 const i=setup({authoredLanes:['particles']});const o=plan(i);
 for(const k of ['festival','bubbles','streamers','finale','flash'])assert.strictEqual(o[k],i[k],k);
});
check('manual foam lane is bit-for-bit preserved',()=>{
 const i=setup({authoredLanes:['foam']});assert.strictEqual(plan(i).foam,i.foam);
});
check('fully locked project is unchanged',()=>{
 const i=setup({authoredLanes:['particles','foam']});const o=plan(i);
 for(const k of cueKeys)assert.strictEqual(o[k],i[k]);
 assert.equal(o.reason,'protected');
});
for(const lane of cueKeys)check(`disabled ${lane} never reactivates`,()=>{
 const i=setup();i[lane]={...i[lane],active:false};const o=plan(i);
 assert.equal(o[lane].active,false);
});
check('foam off when its density too low',()=>{
 const i=setup({foam:{...original.foam,bubbles:2,mist:1}});assert.equal(plan(i).foam.active,false);
});
check('invalid average visibility returns 0 not NaN',()=>{
 const no=setup();no.foam.opacity=NaN;assert(Number.isFinite(cover(no)));
});
// Integration: use actual V817/V844–V847 planners instead of handcrafted counts.
const {planFestivalSpecialFxV844:festivalPlan,coordinateFestivalFoamV844:foamCompat}=load('components/visualizer/festivalSpecialFxPlannerV844');
const {planFoamCannonV817:foamPlan}=load('components/visualizer/foamCannonPlannerV817');
const {planSoapBubblesV8441:bubblePlan}=load('components/visualizer/festivalBubblesFlashPlannerV8441');
const {planPaperStreamersV846:streamerPlan}=load('components/visualizer/festivalPaperStreamersPlannerV846');
const {planFestivalFinaleV847:finalePlan}=load('components/visualizer/festivalFinalePlannerV847');
for(const genre of ['rap','hardtekk','hardstyle','rock','pop'])for(const section of ['verse','hook','build','drop','finale']){
 check(`real upstream planners ${genre}/${section}`,()=>{
  const st=normalize({...settings,festivalIntensityV844:100,foamIntensity:100,festivalFinaleIntensityV847:100,
   festivalStreamerIntensityV846:100,festivalBubblesIntensityV8441:100});
  const input=setup({genre,section,settings:st});
  const f=festivalPlan({fx:input.fx,settings:st,playing:true,reducedMotion:false,
   manualLighting:false,blackout:false,lyricsProtected:false,vocalFocus:false,groupCount:2,
   tier:'high',energy:.99,kick:.99,particleBudget:1,foamBudget:1,timelineGain:1,performanceGain:1});
  const companion={fx:input.fx,settings:st,playing:true,reducedMotion:false,
   manualLighting:false,blackout:false,lyricsProtected:false,vocalFocus:false,groupCount:2,
   tier:'high',energy:.99,kick:.99,budget:1,timelineGain:1,performanceGain:1,moment:f.moment};
  const stages={festival:f,foam:foamCompat(foamPlan({fx:input.fx,settings:st,tier:'high',
    lyricsProtected:false,vocalFocus:false,groupCount:2,energy:.99,kick:.99,foamBudget:1}),f),
   bubbles:bubblePlan(companion),streamers:streamerPlan(companion),
   finale:finalePlan(companion),flash:input.flash};
  const actual=plan({...input,...stages});
  assert.equal(actual.coverageBefore,cover(stages));
  assert(actual.coverageAfter<=actual.coverageBefore+1e-9);
  for(const lane of cueKeys){
   assert(!actual[lane].active||stages[lane].active,`enabled ${lane} without authority`);
   for(const key of dimKeys[lane])assert(actual[lane][key]<=stages[lane][key]+1e-9,`${lane}.${key} gained`);
  }
 });
}
const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
const source=fs.readFileSync('components/visualizer/festivalFxCoordinationV871.ts','utf8');
const ui=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
check('one integration point after V843',()=>assert(stage.indexOf('const coordinatedV871=coordinateFestivalFxV871')>stage.indexOf('planFoamExperienceV843({')));
check('stage keeps original V844 planner',()=>assert(stage.includes('planFestivalSpecialFxV844({')));
check('stage reuses V817 ref',()=>assert(stage.includes('foamCueV817.current=coordinatedV871.foam')));
check('stage reuses V8441 ref',()=>assert(stage.includes('soapBubbleCueV8441.current=coordinatedV871.bubbles')));
check('stage reuses V846 ref',()=>assert(stage.includes('paperStreamersCueV846.current=coordinatedV871.streamers')));
check('stage reuses V847 ref',()=>assert(stage.includes('festivalFinaleCueV847.current=coordinatedV871.finale')));
check('stage passes V850 authored lanes',()=>assert(stage.includes('authoredLanes:authoredLanesV850')));
check('camera portrait taken from live state',()=>assert(stage.includes('cameraCloseup:concertLipSyncV386?.cinematicSceneV528?.active===true&&vocalFocusV542')));
check('no second renderer',()=>assert(!stage.includes('festivalV871=useRef')));
check('no new clock',()=>assert(!/Math\.random|Date\.|setInterval|setTimeout|useFrame/.test(source)));
check('studio includes toggle',()=>assert(ui.includes('festivalCoordinationV871')));
check('studio includes clarity',()=>assert(ui.includes('festivalClarityV871')));
check('studio preview uses real coordinator',()=>assert(ui.includes('coordinateFestivalFxV871({')));
check('CI executes V871',()=>assert(fs.readFileSync('.github/workflows/v832-continuous-validation.yml','utf8').includes('npm run test:v871 && npm run test:v871:types')));
check('version and lock align',()=>{const pkg=require('../package.json'),lock=require('../package-lock.json');
 assert.equal(pkg.version,lock.version);assert.equal(lock.packages[''].version,pkg.version);});
check('V871 first in release gates, retain V870',()=>{const scripts=require('../package.json').scripts;
 for(const k of ['check:release','check:fast','prebuild','build:preflight'])
 assert(scripts[k].includes('npm run test:v871 && npm run test:v871:types && npm run test:v870'),k);
});
console.log(`PASS V871 Festival FX 4.0: ${passed} regression groups`);
