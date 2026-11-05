'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planLedWallCreativeV886:plan,LED_CREATIVE_OFF_V886:OFF,LED_CREATIVE_NAMES_V886:names}=
 load('components/visualizer/ledWallCreativeDirectorV886');
const {LED_WALL_FRAGMENT_V886:shader}=load('components/visualizer/ledWallCreativeShaderV886');
const {LED_WALL_FRAGMENT_V842:oldShader}=load('components/visualizer/ledWallExperienceShaderV842');
const {planConcertFxV810:fxPlan,normalizeConcertFxV810:normalize}=load('components/visualizer/concertFxStudioV810');
const {planLedWallExperienceV821:wallPlan}=load('components/visualizer/ledWallExperiencePlannerV821');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
let checks=0;
function check(label,fn){try{fn();checks++}catch(e){e.message=`V886 ${label}: ${e.message}`;throw e}}
const settings=normalize({enabled:true,intensity:100,quality:'ultra',ledIntensityV821:100,
 ledCreativeV886:true,ledCreativeStrengthV886:100,ledCreativeStyleV886:'auto',
 ledCreativeMotionV886:'balanced',ledCreativeCameraGuardV886:true});
function input({section='drop',genre='hardtekk',st=settings,...overrides}={}){
 const fx=fxPlan({settings:st,genre,section,progressMs:8500,startMs:0,endMs:12000,
  active:true,verified:true,playing:true,reactive:true,reducedMotion:false,
  authored:false,blackout:false,lyricsProtected:false,vocalFocus:false,groupCount:2,
  tier:'high',energy:.95,kick:.93,bass:.9,mids:.76,highs:.7,ledBudget:1,laserBudget:1});
 const wall=wallPlan({fx,settings:st,tier:'high',budget:1,lyricsProtected:false,vocalFocus:false,groupCount:2});
 return {fx,wall,section:fx.section,settings:st,playing:true,reducedMotion:false,tier:'high',
  budget:1,timelineGain:1,manualLed:false,manualLighting:false,blackout:false,
  lyricsProtected:false,lyricsVisible:false,vocalFocus:false,cameraCloseup:false,
  manualCamera:false,groupCount:2,...overrides};
}
const good=plan(input());
check('verified cue active',()=>assert(good.active));
check('verified drop gets vortex',()=>assert.equal(good.mode,4));
check('power strictly bounded',()=>assert(good.power>0&&good.power<=.045));
check('phase from parent, no timer',()=>assert.equal(good.phase,input().fx.phase));
check('deterministic on seek',()=>assert.deepEqual(plan(input()),good));
check('no input mutation',()=>{const i=input(),snapshot=JSON.stringify(i);plan(i);assert.equal(JSON.stringify(i),snapshot)});
check('off cue frozen',()=>assert(Object.isFrozen(OFF)));
check('off cue explicitly clears all uniforms',()=>assert.deepEqual(OFF,{active:false,reason:'disabled',mode:0,power:0,phase:0,bass:0,mids:0,highs:0,motion:0,camera:0}));
check('all four names for UI',()=>assert.deepEqual(Object.keys(names),['0','1','2','3','4']));
for(const genre of ['rap','hardtekk','hardstyle','rock','pop','neutral']){
 for(const [section,mode] of Object.entries({intro:1,verse:1,hook:2,build:3,drop:4,break:1,finale:4})){
  check(`${genre}/${section} verified creative look`,()=>{
   const i=input({genre,section}),q=plan(i);
   if(i.fx.active&&i.wall.active){assert(q.active,`inactive reason ${q.reason}`);assert.equal(q.mode,mode);assert(q.power<=.045)}
   else assert(!q.active);
  });
 }
}
for(const [label,over,reason] of [
 ['pause',{playing:false},'protected'],['reduce-motion',{reducedMotion:true},'protected'],
 ['low tier',{tier:'low'},'protected'],['blackout',{blackout:true},'protected'],
 ['manual LED',{manualLed:true},'protected'],['authored lights',{manualLighting:true},'protected'],
 ['invalid budget 0',{budget:0},'unverified'],['invalid budget negative',{budget:-1},'unverified'],
 ['invalid budget NaN',{budget:NaN},'unverified'],['invalid budget >1',{budget:2},'unverified'],
 ['missing timeline',{timelineGain:0},'unverified'],['invalid timeline',{timelineGain:NaN},'unverified'],
 ['invalid timeline >1',{timelineGain:1.2},'unverified'],['zero dancers',{groupCount:0},'unverified'],
 ['five dancers',{groupCount:5},'unverified'],['fraction dancers',{groupCount:1.5},'unverified'],
 ['fx unverified',{fx:{...input().fx,reason:'unverified'}},'unverified'],
 ['fx inactive',{fx:{...input().fx,active:false}},'unverified'],
 ['wrong section',{section:'verse',fx:input().fx},'unverified'],
 ['bass NaN',{fx:{...input().fx,bass:NaN}},'unverified'],
 ['bass >1',{fx:{...input().fx,bass:2}},'unverified'],
 ['mids NaN',{fx:{...input().fx,mids:NaN}},'unverified'],
 ['highs negative',{fx:{...input().fx,highs:-1}},'unverified'],
 ['phase Infinity',{fx:{...input().fx,phase:Infinity}},'unverified'],
 ['phase negative',{fx:{...input().fx,phase:-.5}},'unverified'],
 ['wall off',{wall:{...input().wall,active:false}},'unverified'],
 ['wall gain over',{wall:{...input().wall,power:.9}},'unverified'],
 ])check(label,()=>{const q=plan(input(over));assert.equal(q.active,false);assert.equal(q.reason,reason);assert.equal(q.power,0)});
for(const [label,patch] of Object.entries({
 globalOff:{enabled:false},ledOff:{ledWall:false},legacyOff:{ledExperienceV821:false},
 creativeOff:{ledCreativeV886:false},masterZero:{intensity:0},creativeZero:{ledCreativeStrengthV886:0},
 baseZero:{ledIntensityV821:0}}))check(`${label} settings`,()=>{
 const q=plan(input({st:normalize({...settings,...patch})}));assert(!q.active);assert.equal(q.reason,'disabled');
});
for(const [label,patch] of Object.entries({
 fixedParent:{ledLookV821:'tunnel'},fixedDepth:{ledDepthStyleV842:'tunnel'}}))check(`fixed user ${label}`,()=>{
 const q=plan(input({st:normalize({...settings,...patch})}));assert(!q.active);assert.equal(q.reason,'protected');
});
for(const [style,mode] of [['skyline',1],['kaleidoscope',2],['chevrons',3],['vortex',4]])
 check(`explicit ${style}`,()=>assert.equal(plan(input({st:normalize({...settings,ledCreativeStyleV886:style})})).mode,mode));
check('manual vortex cannot create verse drop',()=>assert(!plan(input({section:'verse',st:normalize({...settings,ledCreativeStyleV886:'vortex'})})).active));
check('manual vortex cannot create hook drop',()=>assert(!plan(input({section:'hook',st:normalize({...settings,ledCreativeStyleV886:'vortex'})})).active));
check('manual vortex cannot create build drop',()=>assert(!plan(input({section:'build',st:normalize({...settings,ledCreativeStyleV886:'vortex'})})).active));
check('skyline respects V821 equalizer disabled',()=>assert(!plan(input({section:'verse',st:normalize({...settings,ledEqualizerV821:false})})).active));
check('kaleidoscope respects V821 geometry disabled',()=>assert(!plan(input({section:'hook',st:normalize({...settings,ledGeometryV821:false})})).active));
check('chevrons respects V821 geometry disabled',()=>assert(!plan(input({section:'build',st:normalize({...settings,ledGeometryV821:false})})).active));
check('vortex respects V821 drop mode disabled',()=>assert(!plan(input({st:normalize({...settings,ledDropVisualsV821:false})})).active));
check('lower strength means lower power',()=>assert(plan(input({st:normalize({...settings,ledCreativeStrengthV886:25})})).power<good.power));
check('balanced tier lower than high',()=>assert(plan(input({tier:'balanced'})).power<good.power));
check('camera closeup protects performer',()=>assert(plan(input({cameraCloseup:true})).power<good.power));
check('manual camera protects performer',()=>assert(plan(input({manualCamera:true})).power<good.power));
check('camera guard can be disabled',()=>assert.equal(plan(input({cameraCloseup:true,st:normalize({...settings,ledCreativeCameraGuardV886:false})})).power,good.power));
check('lyrics protection attenuates',()=>assert(plan(input({lyricsProtected:true})).power<good.power));
check('visible lyrics attenuate',()=>assert(plan(input({lyricsVisible:true})).power<good.power));
check('vocal focus attenuates',()=>assert(plan(input({vocalFocus:true})).power<good.power));
check('four dancers attenuate',()=>assert(plan(input({groupCount:4})).power<good.power));
check('genre-safe different speeds',()=>assert(plan(input({genre:'hardtekk'})).motion>plan(input({genre:'rap'})).motion));
check('calm slower than dynamic',()=>assert(plan(input({st:normalize({...settings,ledCreativeMotionV886:'calm'})})).motion<
 plan(input({st:normalize({...settings,ledCreativeMotionV886:'dynamic'})})).motion));
check('normalization clamps strength',()=>assert.equal(normalize({ledCreativeStrengthV886:150}).ledCreativeStrengthV886,100));
check('normalization rejects invalid speed',()=>assert.equal(normalize({ledCreativeMotionV886:'sonic'}).ledCreativeMotionV886,'balanced'));
check('normalization rejects invalid look',()=>assert.equal(normalize({ledCreativeStyleV886:'flash'}).ledCreativeStyleV886,'auto'));
check('normalization can disable',()=>assert.equal(normalize({ledCreativeV886:false}).ledCreativeV886,false));
check('default auto enabled',()=>assert.equal(normalize({}).ledCreativeV886,true));
check('shader retains original LED architecture',()=>assert(shader.includes(oldShader.slice(0,110))));
check('shader injects all eight uniforms',()=>{for(const k of ['Power','Mode','Phase','Bass','Mids','Highs','Motion','Camera'])assert(shader.includes(`uniform float uLed86${k};`))});
check('shader has all four distinct motifs',()=>{for(const x of ['skyline86','kaleido86','chevrons86','vortex86'])assert(shader.includes(x))});
check('shader retains original fade protection',()=>assert(shader.includes('rim*vignette*.32')));
check('shader extra alpha bounded',()=>assert(shader.includes('clamp(uLed86Power,0.0,.045)')));
check('shader skips work when V886 disabled',()=>assert(shader.includes('if(uLed86Power>0.00001){')));
check('shader does not add any sampler or time source',()=>assert(!/uniform\s+sampler|uTime86|uClock86/.test(shader)));
check('shader injection complete',()=>assert(!shader.includes('backdrop+=led21*clamp(uLed21Power,0.0,.38)*rim*.92+led42*.7+led70*.67;')));
check('main stage draws same V635 LED plane',()=>{const src=read('components/visualizer/DynamicStage.tsx');assert(src.includes('fragmentShader={LED_WALL_FRAGMENT_V990}') && read('components/visualizer/livingLedWallShaderV990.ts').includes('LED_WALL_FRAGMENT_V886'));assert(src.includes('<mesh ref={ledWallV635}'));assert(src.includes('planLedWallCreativeV886({'));assert(src.includes('u.uLed86Power.value=')&&src.includes('ledCreativeV886.power')&&src.includes('epicV892.ledGain'));});
check('all new uniforms initialized at zero on LED mesh',()=>{const src=read('components/visualizer/DynamicStage.tsx');for(const k of ['Power','Mode','Phase','Bass','Mids','Highs','Motion','Camera'])assert(src.includes(`uLed86${k}:{value:0}`))});
check('panel has live preview and full UI controls',()=>{const src=read('components/visualizer/ConcertFxStudioPanelV810.tsx');for(const x of ['V886 · LED Wall Creative Director','creativePreviewV886','ledCreativeMotionV886','ledCreativeCameraGuardV886','Drop Vortex'])assert(src.includes(x))});
check('package and lock versions match',()=>{const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));assert(/^0\.1\.0-v\d+$/.test(pkg.version)&&Number(pkg.version.split('-v')[1])>=886);assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version)});
check('release CI includes V886 regression',()=>assert(read('.github/workflows/v832-continuous-validation.yml').includes('npm run test:v886 && npm run test:v886:types && npm run test:v886:ui-types')));
console.log(`V886 LED Wall Creative Director: ${checks}/${checks} Tests bestanden.`);
