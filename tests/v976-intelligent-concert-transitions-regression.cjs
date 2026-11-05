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
 const transpiled=ts.transpileModule(read(p),{fileName:p,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(transpiled.diagnostics?.length??0,0,'transpile '+p);
 const module={exports:{}};
 vm.runInNewContext(transpiled.outputText,{module,exports:module.exports,require(){throw Error('unexpected require');}},
  {filename:p,timeout:12000});
 return module.exports;
}
const {applyIntelligentConcertTransitionV976:plan}=load('lib/intelligentConcertTransitionsV976.ts');
const policy=load('lib/ultimateConcertRoadmapV958.ts');
const settings={...policy.DEFAULT_CONCERT_V958,enabled:true,virtualFx:true,intelligentTransitionsV976:true,
 transitionStyleV976:'balanced',transitionStrengthV976:100,cameraHandoffsV976:true};
const scene={id:'song|3|hook',phase:'hook',verified:true,genre:'hardtekk',camera:'orbit',formation:'sync',
 wall:'equalizer',palette:['#ff6699','#0066ff'],effects:['beams','lasers','sweep'],intensity:.82,
 transition:.9,spotlight:.83,lightGain:.99,finale:false,reason:'verified',timelineOverride:false};
const previous={...scene,id:'song|2|verse',phase:'verse',camera:'wide',palette:['#000000','#ff0000'],
 intensity:.4,spotlight:.42,lightGain:.62,effects:['beams','fog']};
const make=(patch={})=>({scene,previous,settings,elapsedMs:400,sectionDurationMs:12000,
 playing:true,authoredStage:false,lowPerformance:false,reducedMotion:false,lyricsVisible:false,...patch});
const run=(patch={})=>plan(make(patch));
const clone=o=>JSON.parse(JSON.stringify(o));
let checks=0;
function test(name,fn){fn();checks++;console.log('PASS V976 '+name);}
test('verified verse -> hook blends palette and lighting within current section',()=>{
 const x=run({elapsedMs:0});assert(x.active);assert.equal(x.kind,'verse-to-hook');
 assert.equal(x.scene.palette[0],'#000000');assert.equal(x.scene.intensity,previous.intensity);
 assert.equal(x.scene.camera,previous.camera);assert(x.cameraHandoff);assert.equal(x.blend,0);
});
test('transition ends deterministically with unchanged final scene',()=>{
 assert(!run({elapsedMs:9000}).active);
 assert.equal(run({elapsedMs:9000}).scene,scene);
 assert(!run({elapsedMs:9000}).cameraHandoff);
});
test('camera handoff changes to existing automatic shot and no invented camera type',()=>{
 const a=run({elapsedMs:100}),b=run({elapsedMs:1500});
 assert.equal(a.scene.camera,'wide');assert.equal(b.scene.camera,'orbit');
 assert.equal(b.cameraHandoff,false);
});
test('manual camera preference can disable automatic handoff independently',()=>{
 const x=run({settings:{...settings,cameraHandoffsV976:false},elapsedMs:200});
 assert(x.active);assert.equal(x.scene.camera,scene.camera);assert(!x.cameraHandoff);
});
test('build -> drop is faster; breaks and outros deliberately ease longer',()=>{
 const base=run({previous:{...previous,phase:'build'},scene:{...scene,phase:'drop'}});
 const pause=run({scene:{...scene,phase:'break'}});
 const outro=run({scene:{...scene,phase:'outro'}});
 assert.equal(base.kind,'build-to-drop');assert(base.durationMs<pause.durationMs);
 assert.equal(pause.kind,'into-break');assert.equal(outro.kind,'into-outro');
 assert(outro.durationMs>base.durationMs);
});
test('style setting affects duration within safe bounds',()=>{
 const g=run({settings:{...settings,transitionStyleV976:'gentle'}});
 const d=run({settings:{...settings,transitionStyleV976:'dramatic'}});
 assert(g.durationMs>d.durationMs);assert(d.durationMs>=400);assert(g.durationMs<=3200);
});
test('lyrics visibility caps transition window without damaging readability',()=>{
 const a=run({scene:{...scene,phase:'break'}}),b=run({scene:{...scene,phase:'break'},lyricsVisible:true});
 assert(b.durationMs<=1700);assert(b.durationMs<a.durationMs);
});
test('bounded strength reduces crossfade magnitude and zero disables',()=>{
 const small=run({settings:{...settings,transitionStrengthV976:30},elapsedMs:0});
 const big=run({elapsedMs:0});
 assert(small.scene.intensity>big.scene.intensity);
 assert(!run({settings:{...settings,transitionStrengthV976:0}}).active);
});
test('FX suppression avoids fresh bass-impact, laser, and paper at boundary',()=>{
 const out=run({scene:{...scene,effects:['beams','lasers','bass-impact','confetti','streamers']},elapsedMs:0});
 assert.deepEqual(clone(out.scene.effects),['beams']);
 const nearEnd=run({scene:{...scene,effects:['beams','lasers','bass-impact']},elapsedMs:1800});
 assert.deepEqual(clone(nearEnd.scene.effects),['beams','lasers','bass-impact']);
});
test('no mutation of scene, previous, settings or song structure',()=>{
 const old=clone({scene,previous,settings});const output=run();
 assert.deepEqual(clone({scene,previous,settings}),old);
 for(const field of ['id','phase','verified','genre','formation','wall','finale','reason','timelineOverride'])
  assert.deepEqual(clone(output.scene[field]),clone(scene[field]),field);
 assert.notEqual(output.scene,scene);
});
test('paused, no virtual FX, or missing opt-in never modify scenes',()=>{
 for(const patch of [{playing:false},{settings:{...settings,enabled:false}},
  {settings:{...settings,virtualFx:false}},
  {settings:{...settings,intelligentTransitionsV976:false}}]){
  const result=run(patch);assert(!result.active);assert.equal(result.scene,scene);
 }
});
test('manual timeline and saved shows win over everything',()=>{
 for(const patch of [{authoredStage:true},{savedShowActive:true},
  {scene:{...scene,timelineOverride:true}},{previous:{...previous,timelineOverride:true}}])
  assert.equal(run(patch).active,false);
});
test('Raspberry Pi economy and reduced-motion remain safe',()=>{
 for(const patch of [{lowPerformance:true},{reducedMotion:true}]){
  const x=run(patch);assert.equal(x.active,false);assert.equal(x.scene,scene);
 }
});
test('no fabricated sections, no same-phase crossfade, no unverified transitions',()=>{
 for(const patch of [{previous:null},{scene:null},{scene:{...scene,verified:false}},
  {previous:{...previous,verified:false}},{previous:{...previous,phase:'hook'}},
  {previous:{...previous,phase:'unknown'}}])
  assert(!run(patch).active);
});
test('malformed timestamps and settings fail closed, never produce NaN',()=>{
 for(const patch of [{elapsedMs:NaN},{elapsedMs:-1},{elapsedMs:Infinity},
 {sectionDurationMs:NaN},{sectionDurationMs:100},{scene:{...scene,intensity:Infinity}},
 {scene:{...scene,spotlight:NaN}},{previous:{...previous,lightGain:1.7}},
 {settings:{...settings,transitionStrengthV976:NaN}}])
  assert(!run(patch).active,JSON.stringify(patch));
});
test('seek-stable crossfade produces no visible per-frame light spikes',()=>{
 const x=run();assert.deepEqual(clone(x),clone(run()));
 let prev=null;
 for(let t=0;t<1900;t+=50){const o=run({elapsedMs:t});
  assert(o.active);if(prev!==null)assert(Math.abs(o.scene.intensity-prev)<.024,`frame spike ${t}`);
  prev=o.scene.intensity;
 }
});
test('10,000 simulated scene transitions stay finite and bounded',()=>{
 const labels=['verse','hook','build','drop','break','outro'];
 for(let i=0;i<10000;i++){
  let phase=labels[i%6],before=labels[(i+5)%6];
  const x=run({scene:{...scene,phase,intensity:.12+(i%85)/100,spotlight:.4,lightGain:.7},
   previous:{...previous,phase:before,intensity:.4,spotlight:.55,lightGain:.8},
   elapsedMs:i%1000,settings:{...settings,transitionStyleV976:['gentle','balanced','dramatic'][i%3]}});
  assert(x.active);
  for(const v of [x.blend,x.durationMs,x.scene.intensity,x.scene.spotlight,x.scene.lightGain])assert(Number.isFinite(v));
  assert(x.scene.intensity>=.12&&x.scene.intensity<=.97);
  assert(x.scene.spotlight>=.1&&x.scene.spotlight<=1);
  assert(x.scene.lightGain>=.3&&x.scene.lightGain<=1.1);
  assert(x.scene.effects.length<=3);
 }
});
test('persistence opt-in and user controls normalize consistently',()=>{
 assert.equal(policy.DEFAULT_CONCERT_V958.intelligentTransitionsV976,false);
 const normalized=policy.normalizeConcertRoadmapV958({intelligentTransitionsV976:true,
  transitionStyleV976:'injected',transitionStrengthV976:155,cameraHandoffsV976:false});
 assert.equal(normalized.intelligentTransitionsV976,true);
 assert.equal(normalized.transitionStrengthV976,100);
 assert.equal(normalized.transitionStyleV976,'balanced');
 assert.equal(normalized.cameraHandoffsV976,false);
});
test('both virtual FX renderer and automatic camera cue use same policy',()=>{
 const fx=read('components/visualizer/ConcertFestivalFxV958.tsx');
 const avatars=read('components/visualizer/ThreeAvatar.tsx');
 assert(fx.includes('applyIntelligentConcertTransitionV976({'));
 assert(avatars.includes('applyIntelligentConcertTransitionV976({'));
 assert(avatars.indexOf('applyIntelligentConcertTransitionV976({')<avatars.indexOf('overlayConcertStageV958('));
 const ui=read('components/ConcertRoadmapStudioV958.tsx');
 for(const key of ['intelligentTransitionsV976','transitionStyleV976','transitionStrengthV976','cameraHandoffsV976'])assert(ui.includes(key));
 assert(!read('components/GoveeMusicSyncV909.tsx').includes('applyIntelligentConcertTransitionV976'));
});
test('no additional network, R3F loop or device path and release gates wired',()=>{
 const code=read('lib/intelligentConcertTransitionsV976.ts');
 for(const forbidden of ['useFrame(', 'setTimeout(', 'setInterval(', 'fetch(', 'WebSocket(',
  'goveeBridgeRequest','AudioContext(', 'localStorage', 'window.'])assert(!code.includes(forbidden),forbidden);
 const pkg=JSON.parse(read('package.json'));
 assert(Number.parseInt(String(pkg.sonicRoadmapRelease).replace(/^v/,''),10)>=976);assert.equal(pkg.sonicRoadmapRelease,pkg.sonicFeatureRelease);
 assert(pkg.scripts['test:v976'].includes('v976-intelligent-concert-transitions-regression.cjs'));
 assert(pkg.scripts['test:v976:types'].includes('tsconfig.v976-core.json'));
 assert(read('scripts/v931-production-gate.cjs').includes('v976-intelligent-concert-transitions-regression.cjs'));
 assert(read('scripts/vercel-production-build.cjs').includes('v976-intelligent-concert-transitions-regression.cjs'));
});
console.log(`PASS V976: ${checks} test groups and 10,000 simulated transitions`);
