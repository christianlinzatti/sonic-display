#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const file='components/visualizer/livingAudienceDirectorV973.ts';
const compiled=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
 compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
assert.equal(compiled.diagnostics?.length??0,0,'V973 TypeScript transpilation');
const loadedModule={exports:{}};
vm.runInNewContext(compiled.outputText,{
 module:loadedModule,exports:loadedModule.exports,
 require(name){if(name==='./virtualConcertCrowdPlannerV815')return {CROWD_MAX_V815:72};
  throw Error('Unexpected runtime import '+name);}
},{filename:file,timeout:15000});
const {planLivingAudienceV973,createLivingMotionScratchV973,sampleLivingAudienceV973}=loadedModule.exports;
const settings={enabled:true,virtualCrowd:true,livingAudienceV973:true,livingWavesV973:true,
 livingIndividualV973:true,livingStrengthV973:85,livingQualityV973:'cinematic',
 intensity:90,crowdIntensity:85,crowdArmWaveV874:true};
const base={active:true,count:72,movement:.21,phoneOpacity:.2,lightGain:.19,
 armLift:.68,phase:5.1,primary:'#b96efe',secondary:'#62dbff',harmonyFocusV879:0};
const fx={active:true,reason:'music',genre:'hardtekk',section:'drop'};
const opts=(extra={})=>({base,fx,settings,positionMs:12500,energy:.9,kick:.9,
 tier:'high',playing:true,manualLighting:false,manualCamera:false,blackout:false,
 reducedMotion:false,lyricsProtected:false,vocalFocus:false,groupCount:2,...extra});
const plan=extra=>planLivingAudienceV973(opts(extra));
let passed=0;
function test(label,fn){fn();passed++;console.log('PASS V973 '+label);}
const json=x=>JSON.parse(JSON.stringify(x));
test('verified, music-controlled drop activates existing crowd only',()=>{
 const c=plan();assert(c.livingActiveV973);assert.equal(c.livingModeV973,'bounce');
 assert.equal(c.count,72);assert.equal(c.phoneOpacity,base.phoneOpacity);
 assert(c.livingStrengthV973>0&&c.livingStrengthV973<=1);
});
test('phase progression is deterministic, seek-stable and continuous',()=>{
 assert.deepEqual(json(plan()),json(plan()));
 assert(Math.abs(plan({positionMs:12501}).livingPhaseV973-plan().livingPhaseV973-.001)<1e-9);
 assert.equal(plan({positionMs:18000}).livingPhaseV973,18);
});
test('section programming has rests, grooves, lifted hands and spatial waves',()=>{
 for(const [section,mode] of [['intro','idle'],['verse','groove'],['hook','hands'],
   ['build','wave'],['drop','bounce'],['break','idle'],['finale','finale']]){
  const result=plan({fx:{...fx,section}});assert.equal(result.livingModeV973,mode,section);
  if(section==='break')assert.equal(result.livingActiveV973,false);
 }
 assert(plan({fx:{...fx,section:'hook'}}).livingHandsV973>0);
 assert(plan({fx:{...fx,section:'build'}}).livingWaveV973>0);
});
test('tier and quality cap existing instance count (Raspberry Pi eco)',()=>{
 for(const [quality,limit] of [['eco',24],['balanced',48],['cinematic',72]]){
  const c=plan({settings:{...settings,livingQualityV973:quality}});
  assert.equal(c.count,limit);
 }
 assert.equal(plan({base:{...base,count:16}}).count,16);
 assert.equal(plan({tier:'balanced',settings:{...settings,livingQualityV973:'eco'}}).count,24);
 assert.equal(plan({tier:'low'}).livingActiveV973,false);
});
test('hard-stop when base crowd is disabled or music unverified',()=>{
 for(const extra of [{base:{...base,active:false}}, {base:{...base,count:1}},
  {fx:{...fx,active:false}}, {fx:{...fx,reason:'preview'}},
  {settings:{...settings,enabled:false}}, {settings:{...settings,virtualCrowd:false}},
  {settings:{...settings,livingAudienceV973:false}}, {playing:false},
  {manualLighting:true},{manualCamera:true},{blackout:true},{reducedMotion:true}]){
  assert.equal(plan(extra).livingActiveV973,false,JSON.stringify(extra));
 }
});
test('individual motion and waves obey inherited arm permission',()=>{
 const noArms=plan({base:{...base,armLift:0}});
 assert.equal(noArms.livingHandsV973,0);assert.equal(noArms.livingWaveV973,0);
 const muted=plan({settings:{...settings,crowdArmWaveV874:false}});
 assert.equal(muted.livingHandsV973,0);
 const waveOff=plan({settings:{...settings,livingWavesV973:false}});
 assert.equal(waveOff.livingWaveV973,0);
});
test('lyrics, vocal focus and cast size only lower new motion strength',()=>{
 const normal=plan(),lyrics=plan({lyricsProtected:true}),focus=plan({vocalFocus:true});
 const bigCast=plan({groupCount:4});
 for(const c of [lyrics,focus,bigCast])assert(c.livingStrengthV973<=normal.livingStrengthV973);
});
test('invalid inputs never generate additional motion',()=>{
 for(const extra of [{energy:NaN},{kick:Infinity},{positionMs:-1},{positionMs:NaN},
  {base:{...base,movement:NaN}},{base:{...base,count:100}},
  {settings:{...settings,livingStrengthV973:NaN}},
  {settings:{...settings,livingStrengthV973:0}},
  {fx:{...fx,section:'invalid'}}])
  assert.equal(plan(extra).livingActiveV973,false,JSON.stringify(extra));
});
test('motion sampler does not act on an inactive cue',()=>{
 const out={horizontal:.02,bob:.01,tilt:.01,armAccent:0,wavePhase:0};
 const limbs=createLivingMotionScratchV973();
 sampleLivingAudienceV973(4,{x:3.6,phase:2,scale:1},plan({playing:false}),out,limbs);
 assert.equal(out.horizontal,.02);assert.equal(limbs.leftRaise,0);
});
test('individual participant motion varies but stays inside side-lane caps',()=>{
 const c=plan({fx:{...fx,section:'hook'}});const readings=[];
 for(let j=0;j<72;j++){
  const out={horizontal:0,bob:0,tilt:0,armAccent:0,wavePhase:0},limbs=createLivingMotionScratchV973();
  sampleLivingAudienceV973(j,{x:j%2?4:-4,phase:j*.61,scale:1},c,out,limbs);
  readings.push(`${limbs.leftRaise.toFixed(4)}|${limbs.rightRaise.toFixed(4)}`);
  assert(Math.abs(out.horizontal)<=.085&&Math.abs(out.bob)<=.075&&Math.abs(out.tilt)<=.09);
  assert(limbs.leftRaise>=0&&limbs.leftRaise<=1&&limbs.rightRaise>=0&&limbs.rightRaise<=1);
 }
 assert(new Set(readings).size>=30,'Individuals must not animate identically');
});
test('camera suppression also applies to new gestures',()=>{
 const a=plan(),b=plan({base:{...base,harmonyFocusV879:.95}});
 const person={x:3.8,phase:1.7,scale:1};const sample=c=>{
  const motion={horizontal:0,bob:0,tilt:0,armAccent:0,wavePhase:0};
  const limbs=createLivingMotionScratchV973();sampleLivingAudienceV973(4,person,c,motion,limbs);
  return {motion,limbs};
 };
 const x=sample(a),y=sample(b);
 assert(Math.abs(y.motion.horizontal)<Math.abs(x.motion.horizontal));
 assert(y.limbs.leftRaise<x.limbs.leftRaise);
});
test('10,000 simulated song frames never exceed existing 72-person cap',()=>{
 for(let i=0;i<10000;i++){
  const quality=['eco','balanced','cinematic'][i%3];
  const section=['verse','hook','build','drop','break','finale'][i%6];
  const c=plan({settings:{...settings,livingQualityV973:quality},fx:{...fx,section},
   positionMs:i*500,energy:i%2?2:-3,kick:i%3?1:-1});
  assert(c.count<=72&&c.count>=2);
  for(const n of [c.livingStrengthV973,c.livingWaveV973,c.livingHandsV973,c.livingIndividualV973])
   assert(Number.isFinite(n)&&n>=0&&n<=1);
 }
});
test('no added meshes, timers, audio sources or Govee traffic',()=>{
 const source=read(file);for(const forbidden of ['useFrame(', 'setInterval(', 'setTimeout(',
 'requestAnimationFrame(', 'fetch(', 'WebSocket(', 'goveeBridgeRequestV909(', 'AudioContext('])
  assert(!source.includes(forbidden),forbidden);
});
test('new release version and CI scripts are present',()=>{
 const p=JSON.parse(read('package.json'));
 assert(Number.parseInt(String(p.sonicRoadmapRelease).replace(/^v/,''),10)>=973);
 assert(Number.parseInt(String(p.sonicFeatureRelease).replace(/^v/,''),10)>=973);
 assert(p.scripts['test:v973'].includes('v973-living-audience-regression'));
 assert(read('scripts/v931-production-gate.cjs').includes('v973-living-audience-regression.cjs'));
 assert(read('scripts/vercel-production-build.cjs').includes('v973-living-audience-regression.cjs'));
});
test('stage applies living motion after camera and arena governors',()=>{
 const stage=read('components/visualizer/DynamicStage.tsx');
 assert(stage.includes('planLivingAudienceV973({'));const pos=stage.indexOf('planLivingAudienceV973({');
 assert(pos>stage.indexOf('planArenaCrowdV893({'));
 assert(stage.includes('manualCamera:cameraNarrativeV605?.manualCamera===true'));
});
test('existing 20 Hz GPU instancing handles V973 motion without new draw calls',()=>{
 const crowd=read('components/visualizer/VirtualConcertCrowdV815.tsx');
 const arms=read('components/visualizer/IntelligentAudienceArmsV874.tsx');
 assert(crowd.includes('sampleLivingAudienceV973(index,p'));
 assert(arms.includes('sampleLivingAudienceV973(index,p'));
 assert(arms.includes('livingMotionV973.leftRaise'));
 assert(arms.includes('accumulator.current<.05'));
 assert(!file.includes('InstancedMesh'));
});
test('settings, UI and performance choices available with safe normalization',()=>{
 const s=read('components/visualizer/concertFxStudioV810.ts');
 const panel=read('components/visualizer/ConcertFxStudioPanelV810.tsx');
 for(const part of ['livingAudienceV973','livingWavesV973','livingIndividualV973',
  'livingStrengthV973','livingQualityV973']){
  assert(s.includes(part+'\u003a'),part+' settings');
  assert(panel.includes('s.'+part),part+' UI');
 }
 assert(panel.includes('Raspberry Pi'));
});
test('V973 uses fixed per-person scratch storage (no per-frame heap objects)',()=>{
 const source=read(file);assert(source.includes('createLivingMotionScratchV973'));
 const start=source.indexOf('export function sampleLivingAudienceV973(');
 const fn=source.slice(start);
 assert(!/new\s+[A-Z]/.test(fn));assert(!fn.includes('Array.from('));
});
console.log(`PASS V973: ${passed} test groups, 10,000 simulated frames`);
