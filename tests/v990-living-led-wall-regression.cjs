'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planLivingLedWallV990:plan,LIVING_LED_OFF_V990:OFF,LIVING_LED_NAMES_V990:names}=
 load('components/visualizer/livingLedWallDirectorV990');
const {LED_WALL_FRAGMENT_V990:shader}=load('components/visualizer/livingLedWallShaderV990');
const {LED_WALL_FRAGMENT_V886:prior}=load('components/visualizer/ledWallCreativeShaderV886');
const {planConcertFxV810:fxPlan,normalizeConcertFxV810:normalize}=load('components/visualizer/concertFxStudioV810');
const {planLedWallExperienceV821:wallPlan}=load('components/visualizer/ledWallExperiencePlannerV821');
const read=f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8');
let n=0;function check(name,fn){try{fn();n++;console.log('PASS V990 '+name)}catch(e){e.message=`V990 ${name}: ${e.message}`;throw e}}
const settings=normalize({enabled:true,intensity:100,quality:'ultra',ledIntensityV821:100,
 ledCreativeV886:true,ledCreativeStrengthV886:100,ledCreativeStyleV886:'auto',
 livingLedWallV990:true,livingLedStrengthV990:85,livingLedStyleV990:'auto',livingLedMotionV990:'balanced'});
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
check('opt-in defaults off and migrated configuration remains off',()=>{
 assert.equal(normalize({}).livingLedWallV990,false);
 assert.equal(normalize({livingLedWallV990:'true'}).livingLedWallV990,false);
 assert(!plan(input({st:normalize({})})).active);
});
check('confirmed cue active with bounded power and inherited phase',()=>{
 const i=input(),x=plan(i);assert(x.active,x.reason);assert(x.power>0&&x.power<=.022);
 assert.equal(x.phase,i.fx.phase);assert.equal(x.mode,2);
 assert.equal(JSON.stringify(plan(i)),JSON.stringify(x));
});
check('four genre looks with independent explicit overrides',()=>{
 for(const [genre,mode] of [['rap',1],['hardtekk',2],['hardstyle',2],['rock',3],['pop',4],['neutral',1]]){
  const x=plan(input({genre}));assert(x.active,`${genre}: ${x.reason}`);assert.equal(x.mode,mode,genre);
 }
 for(const [style,mode] of [['city',1],['matrix',2],['arena',3],['prism',4]]){
  assert.equal(plan(input({st:normalize({...settings,livingLedStyleV990:style})})).mode,mode,style);
 }
 assert.equal(Object.keys(names).length,5);
});
check('phase styles adapt measured energy without asserting guessed timestamps',()=>{
 const verse=plan(input({section:'verse'})),drop=plan(input({section:'drop'}));
 assert(verse.active&&drop.active);assert(drop.power>verse.power);
 assert(drop.accent>verse.accent);
});
check('all manual and accessibility protections win',()=>{
 for(const v of [{playing:false},{reducedMotion:true},{tier:'low'},{manualLed:true},
  {manualLighting:true},{blackout:true},{timelineGain:0},{budget:0},
  {cameraCloseup:true,manualCamera:true,st:normalize({...settings,ledCreativeStyleV886:'vortex'})}]){
  const x=plan(input(v));assert(!x.active,JSON.stringify(v));assert.equal(x.power,0);
 }
});
check('unknown or malformed spectral evidence fails closed',()=>{
 const valid=input();
 for(const patch of [{reason:'estimated'},{active:false},{phase:NaN},{bass:NaN},
  {mids:Infinity},{highs:-1},{phase:-1},{genre:'invented'}]){
  const x=plan(input({fx:{...valid.fx,...patch}}));assert(!x.active,JSON.stringify(patch));
 }
 assert(!plan(input({wall:{...valid.wall,power:Infinity}})).active);
});
check('fading protects lyrics, vocalists, camera and lower hardware tier',()=>{
 const strong=plan(input());
 for(const prop of [{lyricsVisible:true},{lyricsProtected:true},{vocalFocus:true},
  {cameraCloseup:true},{manualCamera:true},{groupCount:4},{tier:'balanced'}]){
  assert(plan(input(prop)).power<strong.power,JSON.stringify(prop));
 }
 assert(plan(input({cameraCloseup:true,st:normalize({...settings,livingLedCameraGuardV990:false})})).power>
  plan(input({cameraCloseup:true})).power); // V886's earlier camera protection is still active
});
check('existing V821 switches and prior V886 opt-in remain authoritative',()=>{
 for(const patch of [{enabled:false},{ledWall:false},{ledExperienceV821:false},
  {ledCreativeV886:false},{livingLedWallV990:false},{ledIntensityV821:0},
  {ledCreativeStrengthV886:0},{livingLedStrengthV990:0},
  {ledLookV821:'geometry'},{ledDepthStyleV842:'tunnel'}]){
  assert(!plan(input({st:normalize({...settings,...patch})})).active,JSON.stringify(patch));
 }
 assert(!plan(input({genre:'rap',st:normalize({...settings,ledEqualizerV821:false})})).active);
 assert(!plan(input({st:normalize({...settings,ledGeometryV821:false})})).active);
});
check('strength, movement and invalid saved preferences are normalized',()=>{
 assert.equal(normalize({livingLedStrengthV990:999}).livingLedStrengthV990,100);
 assert.equal(normalize({livingLedStrengthV990:-5}).livingLedStrengthV990,0);
 assert.equal(normalize({livingLedStyleV990:'strobe'}).livingLedStyleV990,'auto');
 assert.equal(normalize({livingLedMotionV990:'blink'}).livingLedMotionV990,'balanced');
 assert(plan(input({st:normalize({...settings,livingLedStrengthV990:20})})).power<plan(input()).power);
 const slow=plan(input({st:normalize({...settings,livingLedMotionV990:'calm'})}));
 const fast=plan(input({st:normalize({...settings,livingLedMotionV990:'energetic'})}));
 assert(slow.motion<fast.motion&&fast.motion<=.35);
});
check('10,000 simulated configurations stay deterministic and bounded',()=>{
 for(let k=0;k<10000;k++){
  const i=input({section:['intro','verse','hook','build','drop','break','finale'][k%7],
    genre:['rap','hardtekk','hardstyle','rock','pop','neutral'][k%6],
    st:normalize({...settings,livingLedStrengthV990:k%101}),
    tier:k%8===0?'low':k%2===0?'balanced':'high',
    lyricsVisible:k%3===0,manualLed:k%37===0});
  const q=plan(i);assert(Number.isFinite(q.power)&&q.power>=0&&q.power<=.022);
  assert(Number.isFinite(q.phase)&&q.phase>=0);assert(q.motion>=0&&q.motion<=.35);
  assert(q.accent>=0&&q.accent<=.9);assert(q.mode>=0&&q.mode<=4);
 }
});
check('shader extends V886 in place, no new pass, no flash and alpha still clipped',()=>{
 assert(prior.includes('uniform float uLed86Power;'));
 for(const name of ['Power','Mode','Phase','Motion','Bass','Mids','Highs','Accent'])
  assert(shader.includes(`uniform float uLed90${name};`),name);
 for(const name of ['city90','matrix90','arena90','prism90'])assert(shader.includes(name));
 assert(shader.includes('clamp(uLed90Power,0.0,.022)'));
 assert(shader.includes('rim*vignette*.32'));
 assert(shader.includes('clamp(uOpacity*backdrop*vignette+ledAlpha,0.0,.15)'));
 assert(!/uniform\s+sampler|uLed90Clock|uLed90Time|strobe90|flash90/.test(shader));
});
check('studio, stage, performance gates, releases and source syntax',()=>{
 const stage=read('components/visualizer/DynamicStage.tsx');
 assert(stage.includes('planLivingLedWallV990({'));
 assert(stage.includes('fragmentShader={LED_WALL_FRAGMENT_V990}'));
 assert(stage.includes('<mesh ref={ledWallV635}'));
 for(const name of ['Power','Mode','Phase','Motion','Bass','Mids','Highs','Accent']){
  assert(stage.includes(`uLed90${name}:{value:0}`),name);
  assert(stage.includes(`u.uLed90${name}.value=`),name);
 }
 const ui=read('components/visualizer/ConcertFxStudioPanelV810.tsx');
 for(const name of ['V990 · Living LED Wall 3.0','livingPreviewV990',
  'livingLedWallV990:e.target.checked','livingLedStyleV990:e.target.value',
  'livingLedStrengthV990:Number(e.target.value)','livingLedMotionV990:e.target.value'])
  assert(ui.includes(name),name);
 const pkg=JSON.parse(read('package.json'));const lock=JSON.parse(read('package-lock.json'));
 assert.match(pkg.version,/^0\.1\.0-v(?:99[0-9]|[1-9][0-9]{3,})$/);assert.equal(lock.version,pkg.version);
 assert.equal(lock.packages[''].version,pkg.version);assert.equal(pkg.sonicFeatureRelease,'v'+pkg.version.split('-v')[1]);
 assert(pkg.scripts.prebuild.includes('npm run test:v990 && npm run test:v990:types &&'));
 assert(read('scripts/vercel-production-build.cjs').includes('V990 Living LED Wall 3.0'));
 assert(read('.github/workflows/v832-continuous-validation.yml').includes('V990 Living LED Wall 3.0'));
 assert(read('tests/tsconfig.v990-core.json').includes('livingLedWallDirectorV990.ts'));
 const ts=require('./typescript-loader.cjs');
 for(const file of ['components/visualizer/livingLedWallDirectorV990.ts',
  'components/visualizer/livingLedWallShaderV990.ts',
  'components/visualizer/ConcertFxStudioPanelV810.tsx',
  'components/visualizer/DynamicStage.tsx']){
  const x=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,compilerOptions:{
   target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}});
  assert(!(x.diagnostics||[]).some(d=>d.category===ts.DiagnosticCategory.Error),file);
 }
});
check('zero new GPU/async loops or external side effects',()=>{
 for(const f of ['components/visualizer/livingLedWallDirectorV990.ts',
  'components/visualizer/livingLedWallShaderV990.ts']){
  const src=read(f);
  for(const forbidden of ['fetch(', 'useFrame(', 'setTimeout(', 'setInterval(',
   'requestAnimationFrame(', 'WebSocket(', 'new Mesh(', 'goveeBridgeRequest'])
   assert(!src.includes(forbidden),f+' '+forbidden);
 }
});
console.log('V990 Living LED Wall: '+n+' test groups, including 10,000 profiles passed.');
