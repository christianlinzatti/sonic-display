#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function load(p){
 const out=ts.transpileModule(read(p),{fileName:p,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(out.diagnostics?.length??0,0,`transpile ${p}`);
 const module={exports:{}};
 vm.runInNewContext(out.outputText,{module,exports:module.exports,require(){throw Error('unexpected runtime require');}},
  {filename:p,timeout:12000});
 return module.exports;
}
const {applyConcertEnergyArcV975:arc}=load('lib/concertEnergyArcV975.ts');
const policy=load('lib/ultimateConcertRoadmapV958.ts');
const settings={...policy.DEFAULT_CONCERT_V958,enabled:true,virtualFx:true,energyArcV975:true,
 energyArcModeV975:'balanced',energyArcStrengthV975:80};
const scene={id:'track|3|hook',phase:'hook',verified:true,genre:'hardtekk',camera:'orbit',formation:'solo',
 wall:'equalizer',palette:['#0099cc','#d01acf'],effects:['beams','lasers'],intensity:.7,
 transition:.8,spotlight:.65,lightGain:.9,finale:false,reason:'verified',timelineOverride:false};
const make=(patch={})=>({scene,settings,positionMs:16500,durationMs:200000,
 sectionStartMs:10000,sectionDurationMs:12000,sectionIndex:3,playing:true,
 authoredStage:false,lowPerformance:false,reducedMotion:false,lyricsVisible:false,...patch});
const run=(patch={})=>arc(make(patch));
let checks=0;
function test(label,fn){fn();console.log('PASS V975 '+label);checks++;}
const snapshot=o=>JSON.parse(JSON.stringify(o));
test('verified virtual section activates bounded arc',()=>{
 const x=run();assert(x.active);assert(x.gain>=.87&&x.gain<=1.12);assert.equal(x.trajectory,'crest');
 assert(x.scene.intensity>=.12&&x.scene.intensity<=.97);
});
test('does not mutate scene or rewrite any authored camera/formation/effects/phase',()=>{
 const old=snapshot(scene),out=run();assert.deepEqual(snapshot(scene),old);
 for(const field of ['id','phase','genre','camera','formation','wall','palette','effects','transition','finale','reason','timelineOverride'])
  assert.deepEqual(snapshot(out.scene[field]),snapshot(scene[field]),field);
 assert.notEqual(out.scene,scene);
});
test('existing section labels control narrative; no fabricated drop',()=>{
 for(const [phase,expected] of [['verse','release'],['hook','crest'],['build','lift'],['drop','crest'],['break','rest'],['outro','rest']]){
  const x=run({scene:{...scene,phase}});assert(x.active);assert.equal(x.trajectory,expected,phase);
 }
 const verse=run({scene:{...scene,phase:'verse'}});
 const drop=run({scene:{...scene,phase:'drop'}});
 assert(drop.gain>verse.gain);
});
test('energy curve is seek-stable, no accumulation and deterministic',()=>{
 assert.deepEqual(snapshot(run()),snapshot(run()));
 assert.deepEqual(snapshot(run({positionMs:18000})),snapshot(run({positionMs:18000})));
});
test('gradual section variation never flashes',()=>{
 let previous=null;
 for(let t=10000;t<22000;t+=60){const x=run({positionMs:t});assert(x.active);
  if(previous!==null)assert(Math.abs(x.gain-previous)<.012,`jump at ${t}`);previous=x.gain;}
});
test('strength zero and feature disabled return identical scene',()=>{
 for(const patch of [{settings:{...settings,energyArcV975:false}},
  {settings:{...settings,energyArcStrengthV975:0}},
  {settings:{...settings,virtualFx:false}},{settings:{...settings,enabled:false}}]){
  const x=run(patch);assert(!x.active);assert.equal(x.scene,scene);assert.equal(x.gain,1);
 }
});
test('manual timeline, authored stage and stored shows are preserved',()=>{
 for(const patch of [{scene:{...scene,timelineOverride:true}}, {authoredStage:true},
  {savedShowActive:true}])assert.equal(run(patch).active,false);
});
test('paused, low performance and reduced motion modes suppress new effects',()=>{
 for(const patch of [{playing:false},{lowPerformance:true},{reducedMotion:true}])assert(!run(patch).active);
});
test('lyrics visibility reduces fluctuation toward baseline',()=>{
 const a=run(),b=run({lyricsVisible:true});
 assert(b.active);assert(Math.abs(b.gain-1)<=Math.abs(a.gain-1)+1e-10);
});
test('cinematic mode is stronger; subtle is gentler',()=>{
 const tiny=run({settings:{...settings,energyArcModeV975:'subtle'}});
 const big=run({settings:{...settings,energyArcModeV975:'cinematic'}});
 assert(Math.abs(big.gain-1)>Math.abs(tiny.gain-1));
});
test('invalid or unverifiable timing and section metadata always fail closed',()=>{
 for(const patch of [{positionMs:NaN},{positionMs:-1},{positionMs:23000},
 {sectionStartMs:-2},{sectionDurationMs:0},{sectionIndex:-1},
 {sectionIndex:2.5},{durationMs:1000},{sectionDurationMs:Infinity},
 {scene:{...scene,verified:false}},{scene:{...scene,phase:'future-drop'}},
 {scene:{...scene,intensity:NaN}},{scene:{...scene,spotlight:Infinity}}]){
  assert.equal(run(patch).active,false,JSON.stringify(patch));
 }
});
test('10,000 simulated frames keep values finite and within existing budgets',()=>{
 const labels=['verse','hook','build','drop','break','outro'];
 for(let i=0;i<10000;i++){
  const pos=10000+(i%12000),phase=labels[i%6];
  const x=run({positionMs:pos,scene:{...scene,phase,intensity:(i%100)/100,spotlight:.25,
   lightGain:.75},settings:{...settings,energyArcModeV975:['subtle','balanced','cinematic'][i%3]}});
  assert(x.active);
  for(const n of [x.gain,x.scene.intensity,x.scene.spotlight,x.scene.lightGain])assert(Number.isFinite(n));
  assert(x.gain>=.87&&x.gain<=1.12);
  assert(x.scene.intensity>=.12&&x.scene.intensity<=.97);
  assert(x.scene.effects.length===2);
 }
});
test('defaults opt out; invalid persisted values normalize safely',()=>{
 assert.equal(policy.DEFAULT_CONCERT_V958.energyArcV975,false);
 const out=policy.normalizeConcertRoadmapV958({energyArcV975:true,energyArcStrengthV975:170,
  energyArcModeV975:'unsafe'});
 assert.equal(out.energyArcV975,true);assert.equal(out.energyArcStrengthV975,100);
 assert.equal(out.energyArcModeV975,'balanced');
 assert.equal(policy.normalizeConcertRoadmapV958({}).energyArcStrengthV975,55);
});
test('integration acts only in actual virtual FX component',()=>{
 const fx=read('components/visualizer/ConcertFestivalFxV958.tsx');
 assert(fx.includes('applyConcertEnergyArcV975({scene:continuity'));
 assert(fx.indexOf('applyConcertEnergyArcV975({scene:continuity')<fx.indexOf('applySmartConcertPresetV969('));
 assert(!read('components/GoveeMusicSyncV909.tsx').includes('applyConcertEnergyArcV975'));
});
test('settings appear as accessible opt-in and bounded controls',()=>{
 const ui=read('components/ConcertRoadmapStudioV958.tsx');
 for(const name of ['energyArcV975','energyArcModeV975','energyArcStrengthV975'])assert(ui.includes(name));
 assert(ui.includes('type="range"'));assert(ui.includes('V975 · Adaptive Concert Energy Director'));
});
test('no added R3F loop, network access, LED commands or audio capture',()=>{
 const source=read('lib/concertEnergyArcV975.ts');
 for(const word of ['useFrame(', 'fetch(', 'setInterval(', 'setTimeout(', 'requestAnimationFrame(',
  'WebSocket(', 'goveeBridgeRequest', 'AudioContext(', 'localStorage', 'new THREE.'])assert(!source.includes(word),word);
});
test('new scripts, version markers and CI gates remain installed',()=>{
 const packageJson=JSON.parse(read('package.json'));
 assert.equal(packageJson.sonicRoadmapRelease,'v975');assert.equal(packageJson.sonicFeatureRelease,'v975');
 assert(packageJson.scripts['test:v975'].includes('v975-adaptive-concert-energy-regression'));
 assert(packageJson.scripts['test:v975:types'].includes('tsconfig.v975-core.json'));
 assert(read('scripts/v931-production-gate.cjs').includes('v975-adaptive-concert-energy-regression'));
 assert(read('scripts/vercel-production-build.cjs').includes('v975-adaptive-concert-energy-regression'));
});
console.log(`PASS V975: ${checks} test groups and 10,000 simulated frames`);
