'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planLedWallMotifsV870:plan,LED_MOTIF_OFF_V870:OFF}=load('components/visualizer/ledWallMotifDirectorV870');
const {planConcertFxV810:fxPlan,normalizeConcertFxV810:normalize}=load('components/visualizer/concertFxStudioV810');
const {planLedWallExperienceV821:wallPlan}=load('components/visualizer/ledWallExperiencePlannerV821');
const {planLedWallExperienceV842:depthPlan}=load('components/visualizer/ledWallExperiencePlannerV842');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
let passed=0;function check(label,fn){try{fn();passed++;}catch(e){console.error('FAILED V870:',label);e.message=`V870 ${label}: ${e.message}`;throw e;}}
const settings=normalize({enabled:true,intensity:100,quality:'ultra',ledIntensityV821:100,ledDepthStrengthV842:100,
 ledMotifStrengthV870:100,ledMotifsV870:true,ledMotifStyleV870:'auto'});
function setup({section='drop',genre='hardtekk',st=settings,...patch}={}){
 const fx=fxPlan({settings:st,genre,section,progressMs:8500,startMs:0,endMs:12000,
  active:true,verified:true,playing:true,reactive:true,reducedMotion:false,authored:false,
  blackout:false,lyricsProtected:false,vocalFocus:false,groupCount:2,tier:'high',
  energy:.95,kick:.93,bass:.9,mids:.76,highs:.7,ledBudget:1,laserBudget:1});
 const wall=wallPlan({fx,settings:st,tier:'high',budget:1,lyricsProtected:false,vocalFocus:false,groupCount:2});
 const depth=depthPlan({fx,wall,settings:st,section:fx.section,playing:true,reducedMotion:false,
  tier:'high',budget:1,timelineGain:1,manualLed:false,manualLighting:false,blackout:false,
  lyricsProtected:false,vocalFocus:false,groupCount:2});
 return {fx,wall,depth,settings:st,section:fx.section,playing:true,reducedMotion:false,
  tier:'high',budget:1,timelineGain:1,manualLed:false,manualLighting:false,blackout:false,
  lyricsProtected:false,lyricsVisible:false,vocalFocus:false,cameraCloseup:false,
  manualCamera:false,groupCount:2,...patch};
}
const good=plan(setup());
check('verified drop active',()=>assert(good.active));
check('drop shockwave',()=>assert.equal(good.mode,3));
check('drop power bounded',()=>assert(good.power>0&&good.power<=.09));
check('phase from V810 only',()=>assert.equal(good.phase,setup().fx.phase));
check('seek deterministic',()=>assert.deepEqual(plan(setup()),good));
check('no input mutation',()=>{const input=setup(),original=JSON.stringify(input);plan(input);assert.equal(JSON.stringify(input),original)});
check('off sentinel immutable',()=>assert(Object.isFrozen(OFF)));
check('off sentinel complete',()=>assert.deepEqual({...OFF},{active:false,reason:'disabled',mode:0,power:0,phase:0,bass:0,mids:0,camera:0}));
for(const genre of ['rap','hardstyle','hardtekk','rock','pop','neutral']){
 for(const [section,mode] of Object.entries({intro:1,verse:1,hook:2,build:2,drop:3,break:1,finale:3})){
  check(`${genre}/${section} verified motif`,()=>{const input=setup({section,genre});const output=plan(input);
   if(input.wall.active&&input.depth.active){assert(output.active,`not active: ${output.reason}`);assert.equal(output.mode,mode);assert(output.power<=.09)}
   else assert(!output.active);
  });
 }
}
for(const [label,patch,reason] of [
 ['paused',{playing:false},'protected'],['reduced',{reducedMotion:true},'protected'],
 ['low-tier',{tier:'low'},'protected'],['blackout',{blackout:true},'protected'],
 ['manual-LED',{manualLed:true},'protected'],['manual-lighting',{manualLighting:true},'protected'],
 ['zero-budget',{budget:0},'unverified'],['negative-budget',{budget:-1},'unverified'],
 ['nan-budget',{budget:NaN},'unverified'],['too-high-budget',{budget:1.01},'unverified'],
 ['timeline-zero',{timelineGain:0},'unverified'],['timeline-over',{timelineGain:1.1},'unverified'],
 ['timeline-nan',{timelineGain:NaN},'unverified'],['group-zero',{groupCount:0},'unverified'],
 ['group-five',{groupCount:5},'unverified'],['group-frac',{groupCount:1.25},'unverified'],
 ['bad-parent-reason',{fx:{...setup().fx,reason:'unverified'}},'unverified'],
 ['bad-parent-active',{fx:{...setup().fx,active:false}},'unverified'],
 ['wrong-section',{section:'verse',fx:setup().fx},'unverified'],
 ['bad-bass',{fx:{...setup().fx,bass:Infinity}},'unverified'],
 ['bad-mids',{fx:{...setup().fx,mids:NaN}},'unverified'],
 ['bad-phase',{fx:{...setup().fx,phase:-.5}},'unverified'],
 ['wall-off',{wall:{...setup().wall,active:false}},'unverified'],
 ['depth-off',{depth:{...setup().depth,active:false}},'unverified'],
 ['depth-protected',{depth:{...setup().depth,reason:'protected'}},'unverified'],
 ['wall-over',{wall:{...setup().wall,power:.41}},'unverified'],
 ['depth-over',{depth:{...setup().depth,power:.15}},'unverified'],
 ]) check(label,()=>{const cue=plan(setup(patch));assert.equal(cue.active,false);assert.equal(cue.reason,reason);assert.equal(cue.power,0)});
for(const [label,patch] of Object.entries({
 disabled:{ledMotifsV870:false},ledOff:{ledWall:false},baseOff:{ledExperienceV821:false},
 depthOff:{ledExperienceV842:false},globalOff:{enabled:false},powerZero:{ledMotifStrengthV870:0},
 intensityZero:{intensity:0}}))check(`${label} settings off`,()=>{
 const cue=plan(setup({st:normalize({...settings,...patch})}));assert(!cue.active);assert.equal(cue.reason,'disabled');
});
for(const [label,patch] of Object.entries({
 ledFixed:{ledLookV821:'geometry'},depthFixed:{ledDepthStyleV842:'tunnel'}}))
 check(`${label} manual fixed look`,()=>{
  const cue=plan(setup({st:normalize({...settings,...patch})}));assert.equal(cue.reason,'protected');
 });
for(const [name,field,mode] of [['eq','equalizer',1],['prism','prism',2],['shock','shockwave',3]]){
 check(`${name} explicit mode for drop`,()=>assert.equal(plan(setup({st:normalize({...settings,ledMotifStyleV870:field})})).mode,mode));
}
check('shockwave never inferred for verse',()=>{const c=plan(setup({section:'verse',st:normalize({...settings,ledMotifStyleV870:'shockwave'})}));assert(!c.active)});
check('shockwave never inferred for hook',()=>{const c=plan(setup({section:'hook',st:normalize({...settings,ledMotifStyleV870:'shockwave'})}));assert(!c.active)});
check('EQ respects V821 EQ off',()=>assert(!plan(setup({section:'verse',st:normalize({...settings,ledEqualizerV821:false})})).active));
check('prism respects V821 geometry off',()=>assert(!plan(setup({section:'hook',st:normalize({...settings,ledGeometryV821:false})})).active));
check('shockwave respects drop visual off',()=>assert(!plan(setup({st:normalize({...settings,ledDropVisualsV821:false})})).active));
check('strength ratio',()=>{const low=plan(setup({st:normalize({...settings,ledMotifStrengthV870:25})}));assert(low.power<good.power)});
check('camera closeup reduces intensity',()=>assert(plan(setup({cameraCloseup:true})).power<good.power));
check('manual camera reduces intensity',()=>assert(plan(setup({manualCamera:true})).power<good.power));
check('camera protection can be explicitly disabled',()=>assert.equal(plan(setup({cameraCloseup:true,st:normalize({...settings,ledCameraProtectionV870:false})})).power,good.power));
check('lyrics visible reduces intensity',()=>assert(plan(setup({lyricsVisible:true})).power<good.power));
check('lyrics protected reduces intensity',()=>assert(plan(setup({lyricsProtected:true})).power<good.power));
check('vocal lead reduces intensity',()=>assert(plan(setup({vocalFocus:true})).power<good.power));
check('large group reduces intensity',()=>assert(plan(setup({groupCount:4})).power<good.power));
check('balanced tier dimmer',()=>assert(plan(setup({tier:'balanced'})).power<good.power));
check('timeline fade reduces intensity',()=>assert(plan(setup({timelineGain:.5})).power<good.power));
check('low budget dimmer',()=>assert(plan(setup({budget:.4})).power<good.power));
check('no artificial source: cue verified required',()=>assert.equal(plan(setup({fx:{...setup().fx,reason:'other'}})).power,0));
for(const [name,patch,expected] of [
 ['clamp-plus',{ledMotifStrengthV870:150},100],['clamp-minus',{ledMotifStrengthV870:-30},0],
 ['bad-NaN',{ledMotifStrengthV870:NaN},60],['bad-inf',{ledMotifStrengthV870:Infinity},60]])
 check(`settings ${name}`,()=>assert.equal(normalize(patch).ledMotifStrengthV870,expected));
check('settings unknown motif falls back auto',()=>assert.equal(normalize({ledMotifStyleV870:'invalid'}).ledMotifStyleV870,'auto'));
check('setting undefined preserves defaults',()=>assert.equal(normalize().ledMotifsV870,true));
check('settings false remains false',()=>assert.equal(normalize({ledCameraProtectionV870:false}).ledCameraProtectionV870,false));
check('settings intensity 0 off',()=>assert(!plan(setup({st:normalize({...settings,ledMotifStrengthV870:0})})).active));
const {LED_WALL_FRAGMENT_V842:shader}=load('components/visualizer/ledWallExperienceShaderV842');
check('shader is valid string',()=>assert.equal(typeof shader,'string'));
for(const key of ['uLed70Power','uLed70Mode','uLed70Phase','uLed70Bass','uLed70Mids','uLed70Camera'])
 check(`shader defines ${key}`,()=>assert(shader.includes(`uniform float ${key};`)));
for(const code of ['float eq70=','float prism70=','float ring70=','float led70='])
 check(`shader includes ${code}`,()=>assert(shader.includes(code)));
check('shader inherits V842 depth',()=>assert(shader.includes('float led42=clamp(')));
check('shader preserves alpha limit',()=>assert(shader.includes('clamp(uOpacity*backdrop*vignette+ledAlpha,0.0,.15)')));
check('shader references bounded .09 only',()=>assert(shader.includes('clamp(uLed70Power,0.0,.09)')));
check('shader no shader-defined clock',()=>assert(!shader.includes('uLed70Time')));
const stage=read('components/visualizer/DynamicStage.tsx');
check('stage same LED mesh',()=>assert.equal((stage.match(/ref=\{ledWallV635\}/g)||[]).length,1));
check('stage original shader preserved',()=>assert((stage.includes('fragmentShader={LED_WALL_FRAGMENT_V842}') || ((stage.includes('fragmentShader={LED_WALL_FRAGMENT_V886}') || (stage.includes('fragmentShader={LED_WALL_FRAGMENT_V990}') && fs.readFileSync('components/visualizer/livingLedWallShaderV990.ts','utf8').includes('LED_WALL_FRAGMENT_V886'))) && fs.readFileSync('components/visualizer/ledWallCreativeShaderV886.ts','utf8').includes('LED_WALL_FRAGMENT_V842')))));
check('V870 after V842',()=>assert(stage.indexOf('planLedWallMotifsV870({')>stage.indexOf('planLedWallExperienceV842({')));
check('manual LED lane inherited',()=>assert(stage.includes('manualLed:authoredFxV823.led.boost>.001||authoredFxV823.led.mute>.001')));
check('camera close-up observed',()=>assert(stage.includes('cameraCloseup:concertLipSyncV386?.cinematicSceneV528?.active===true&&vocalFocusV542')));
check('lyricsVisible measured from actual state',()=>assert(stage.includes('lyricsVisible:lyricsVisibleV813')));
check('manual camera state observed',()=>assert(stage.includes('manualCamera:cameraNarrativeV605?.manualCamera===true')));
check('no new LED mesh ref',()=>assert(!stage.includes('ledWallV870=useRef')));
check('no new useFrame in V870 module',()=>assert(!read('components/visualizer/ledWallMotifDirectorV870.ts').includes('useFrame')));
check('UI toggle exists',()=>assert(read('components/visualizer/ConcertFxStudioPanelV810.tsx').includes('V870 · LED Wall')));
check('UI camera protection toggle',()=>assert(read('components/visualizer/ConcertFxStudioPanelV810.tsx').includes('ledCameraProtectionV870')));
check('CI includes V870',()=>assert(read('.github/workflows/v832-continuous-validation.yml').includes('npm run test:v870 && npm run test:v870:types')));
check('V870 core config present',()=>assert(read('tests/tsconfig.v870-core.json').includes('ledWallMotifDirectorV870.ts')));
check('release scripts include V870 first',()=>{const scripts=require('../package.json').scripts;
 for(const k of ['build:preflight','check:release','check:fast','prebuild'])
  assert(scripts[k].includes('npm run test:v870 && npm run test:v870:types && '),`${k} missing v870`);
});
console.log(`PASS V870 LED Wall motifs, camera+lyrics protection: ${passed} test groups`);
