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
 const result=ts.transpileModule(read(p),{fileName:p,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(result.diagnostics?.length??0,0,'transpile '+p);
 const mod={exports:{}};
 vm.runInNewContext(result.outputText,{module:mod,exports:mod.exports,require(){throw Error('unexpected runtime import');}},
  {filename:p,timeout:12000});return mod.exports;
}
const {applyConcertStorytellingV977:plan}=load('lib/concertStorytellingV977.ts');
const policy=load('lib/ultimateConcertRoadmapV958.ts');
const settings={...policy.DEFAULT_CONCERT_V958,enabled:true,virtualFx:true,storytellingV977:true,
 storytellingModeV977:'cinematic',storytellingStrengthV977:70,storytellingAccentsV977:true};
const scene={id:'song|4|hook',phase:'hook',verified:true,genre:'hardtekk',camera:'wide',formation:'sync',
 wall:'equalizer',palette:['#0099cc','#ff33aa'],effects:['beams','sweep'],intensity:.7,
 transition:.8,spotlight:.65,lightGain:.9,finale:false,reason:'verified',timelineOverride:false};
const baseline={scene,settings,positionMs:61000,durationMs:210000,sectionStartMs:50000,
 sectionDurationMs:21000,sectionIndex:4,sectionConfidence:.9,hookOrdinal:2,
 playing:true,authoredStage:false,lowPerformance:false,reducedMotion:false,lyricsVisible:false};
const run=(patch={})=>plan({...baseline,...patch});
const snap=o=>JSON.parse(JSON.stringify(o));
let checks=0;
function test(name,fn){fn();checks++;console.log('PASS V977 '+name);}
test('opt-in applies a bounded arc on confirmed current hook',()=>{
 const x=run();assert(x.active);assert.equal(x.beat,'crest');assert(x.gain>=.88&&x.gain<=1.12);
 assert(x.scene.intensity>=.12&&x.scene.intensity<=.97);
});
test('verified opening is quieter than same-phase mid-song when other inputs match',()=>{
 const beginning=run({sectionIndex:0,positionMs:12000,sectionStartMs:5000,sectionDurationMs:19000,hookOrdinal:1});
 const later=run({positionMs:112000,sectionStartMs:105000,sectionDurationMs:19000,hookOrdinal:1});
 assert(beginning.gain<later.gain);assert.equal(beginning.beat,'crest');
});
test('verse, hook, build, drop, break and outro have different story beats',()=>{
 const got=['verse','hook','build','drop','break','outro'].map(phase=>run({scene:{...scene,phase}}).beat);
 assert.deepEqual(snap(got),['journey','crest','rising','crest','breather','journey']);
});
test('breather softens intensity more than a drop',()=>{
 const a=run({scene:{...scene,phase:'break'}}),b=run({scene:{...scene,phase:'drop'}});
 assert(a.gain<b.gain);
});
test('a build ramps up inside an actual confirmed build section',()=>{
 const start=run({scene:{...scene,phase:'build'},positionMs:54000});
 const end=run({scene:{...scene,phase:'build'},positionMs:67000});
 assert(end.gain>start.gain);
});
test('finale requires an actual outro, verified finale flag and actual late playhead',()=>{
 const candidate={...scene,phase:'outro',finale:true};
 assert.equal(run({scene:candidate,positionMs:202000,sectionStartMs:196000,sectionDurationMs:14000}).beat,'finale');
 assert.notEqual(run({scene:{...candidate,finale:false},positionMs:202000,sectionStartMs:196000,sectionDurationMs:14000}).beat,'finale');
 assert.notEqual(run({scene:{...candidate,phase:'hook'},positionMs:202000,sectionStartMs:196000,sectionDurationMs:14000}).beat,'finale');
});
test('repeated confirmed hooks vary gently but not with fabricated song sections',()=>{
 const a=run({hookOrdinal:1}),b=run({hookOrdinal:2}),c=run({hookOrdinal:3});
 assert.notEqual(a.gain,b.gain);assert.notEqual(b.gain,c.gain);
 for(const x of [a,b,c])assert.equal(x.scene.phase,'hook');
});
test('visual sweep accent in drop enters only in the middle and stays under 3 effects',()=>{
 const candidate={...scene,phase:'drop',effects:['beams','lasers']};
 const start=run({scene:candidate,positionMs:51000});
 const middle=run({scene:candidate,positionMs:61000});
 const end=run({scene:candidate,positionMs:69000});
 assert(!start.accent);assert(middle.accent);assert(!end.accent);
 assert.deepEqual(snap(middle.scene.effects),['beams','lasers','sweep']);
});
test('repeated hook receives a quiet haze accent only if effect budget allows',()=>{
 const x=run();assert(x.accent);assert.deepEqual(snap(x.scene.effects),['beams','sweep','fog']);
 assert.equal(run({hookOrdinal:1}).accent,false);
});
test('subtle style and disabled accents never introduce new FX',()=>{
 assert(!run({settings:{...settings,storytellingModeV977:'subtle'}}).accent);
 assert(!run({settings:{...settings,storytellingAccentsV977:false}}).accent);
 assert(!run({settings:{...settings,compactFxV960:true}}).accent);
});
test('three-effect budget never grows and original scene effects stay intact',()=>{
 const full={...scene,effects:['beams','lasers','bass-impact']};
 const x=run({scene:full});assert(!x.accent);assert.equal(x.scene.effects,full.effects);
});
test('lyrics readability reduces strength and disables accent',()=>{
 const a=run(),b=run({lyricsVisible:true});
 assert(Math.abs(b.gain-1)<Math.abs(a.gain-1));assert(!b.accent);
});
test('seek-stable results and easing at the section edges',()=>{
 assert.deepEqual(snap(run()),snap(run()));
 const begin=run({positionMs:50000}),end=run({positionMs:70999});
 assert(begin.active&&end.active);assert(Math.abs(begin.gain-1)<.05);assert(Math.abs(end.gain-1)<.05);
});
test('manual cues, saved shows and authored stage always win',()=>{
 for(const patch of [{authoredStage:true},{savedShowActive:true},{scene:{...scene,timelineOverride:true}}]){
  const x=run(patch);assert(!x.active);assert.equal(x.scene,patch.scene??scene);
 }
});
test('playback disabled, feature disabled and zero strength always return original',()=>{
 for(const patch of [{playing:false},{settings:{...settings,storytellingV977:false}},
  {settings:{...settings,enabled:false}},{settings:{...settings,virtualFx:false}},
  {settings:{...settings,storytellingStrengthV977:0}}]){
  const x=run(patch);assert(!x.active);assert.equal(x.scene,scene);
 }
});
test('Pi economy, reduced motion and low-performance mode bypass stage changes',()=>{
 for(const patch of [{lowPerformance:true},{reducedMotion:true}]){
  const x=run(patch);assert(!x.active);assert.equal(x.scene,scene);
 }
});
test('confidence, timing and unverified data are never treated as real sections',()=>{
 for(const patch of [{scene:null},{scene:{...scene,verified:false}},
  {sectionConfidence:.49},{sectionConfidence:NaN},{sectionConfidence:2},
  {positionMs:10000},{positionMs:Infinity},{durationMs:0},
  {sectionStartMs:NaN},{sectionDurationMs:0}, {sectionIndex:-1},
  {sectionIndex:1.5},{hookOrdinal:-1},{hookOrdinal:1.25}])assert(!run(patch).active);
});
test('invalid scene values and invalid strength fail closed',()=>{
 for(const patch of [{scene:{...scene,intensity:Infinity}},
  {scene:{...scene,spotlight:NaN}},{scene:{...scene,lightGain:2}},
  {scene:{...scene,palette:['bad','#aabbcc']}},
  {scene:{...scene,effects:['beams','lasers','sweep','fog']}},
  {settings:{...settings,storytellingStrengthV977:NaN}}])assert(!run(patch).active);
});
test('the source scene, choreography, camera and current section label never mutate',()=>{
 const original=snap({scene,settings}),x=run();assert.deepEqual(snap({scene,settings}),original);
 for(const key of ['id','phase','verified','genre','camera','formation','wall','palette',
  'transition','finale','timelineOverride','reason'])assert.deepEqual(snap(x.scene[key]),snap(scene[key]));
});
test('10,000 deterministic simulated states stay finite and within all budgets',()=>{
 const phases=['verse','hook','build','drop','break','outro'];
 for(let n=0;n<10000;n++){
  const local=50000+(n%21000),phase=phases[n%6];
  const s={...scene,phase,intensity:.12+(n%80)/100,spotlight:.5,lightGain:.75};
  const r=run({scene:s,positionMs:local,sectionIndex:n%160,hookOrdinal:n%8,
   settings:{...settings,storytellingModeV977:['subtle','cinematic','festival'][n%3]}});
  assert(r.active);
  for(const v of [r.gain,r.scene.intensity,r.scene.lightGain,r.scene.spotlight])assert(Number.isFinite(v));
  assert(r.scene.intensity>=.12&&r.scene.intensity<=.97);
  assert(r.scene.lightGain>=.3&&r.scene.lightGain<=1.1);
  assert(r.scene.effects.length<=3);
 }
});
test('settings safely roundtrip with conservative defaults and bounded values',()=>{
 assert.equal(policy.DEFAULT_CONCERT_V958.storytellingV977,false);
 const x=policy.normalizeConcertRoadmapV958({storytellingV977:true,
  storytellingModeV977:'invalid',storytellingStrengthV977:150,storytellingAccentsV977:false});
 assert.equal(x.storytellingV977,true);assert.equal(x.storytellingModeV977,'cinematic');
 assert.equal(x.storytellingStrengthV977,100);assert.equal(x.storytellingAccentsV977,false);
 assert.equal(policy.normalizeConcertRoadmapV958({}).storytellingStrengthV977,60);
});
test('V977 is after V975/V976 and before virtual preset, never the device sender or camera',()=>{
 const fx=read('components/visualizer/ConcertFestivalFxV958.tsx');
 const ui=read('components/ConcertRoadmapStudioV958.tsx');
 assert(fx.includes('applyConcertStorytellingV977({scene:energyArcV975.scene??continuity'));
 assert(fx.indexOf('applyConcertStorytellingV977(')>fx.indexOf('applyConcertEnergyArcV975('));
 assert(fx.indexOf('applyConcertStorytellingV977(')<fx.indexOf('applySmartConcertPresetV969('));
 for(const k of ['storytellingV977','storytellingModeV977','storytellingStrengthV977','storytellingAccentsV977'])assert(ui.includes(k));
 for(const file of ['components/GoveeMusicSyncV909.tsx','components/visualizer/ThreeAvatar.tsx'])
  assert(!read(file).includes('applyConcertStorytellingV977'));
});
test('no timers, networking, hardware commands, new R3F loop or fake prediction',()=>{
 const content=read('lib/concertStorytellingV977.ts');
 for(const forbidden of ['useFrame(', 'setTimeout(', 'setInterval(', 'fetch(',
  'WebSocket(', 'AudioContext(', 'localStorage', 'window.', 'goveeBridgeRequest',
  'createElement(', 'new THREE.', 'Math.random(', 'Date.now('])assert(!content.includes(forbidden),forbidden);
 const pkg=JSON.parse(read('package.json'));
 assert(Number.parseInt(String(pkg.sonicRoadmapRelease).replace(/^v/,''),10)>=977);
 assert.equal(pkg.sonicRoadmapRelease,pkg.sonicFeatureRelease);
 assert(pkg.scripts['test:v977'].includes('v977-concert-storytelling-regression.cjs'));
 assert(pkg.scripts['test:v977:types'].includes('tsconfig.v977-core.json'));
 assert(read('scripts/v931-production-gate.cjs').includes('v977-concert-storytelling-regression.cjs'));
 assert(read('scripts/vercel-production-build.cjs').includes('v977-concert-storytelling-regression.cjs'));
});
console.log(`PASS V977: ${checks} test groups and 10,000 simulated song states`);
