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
 const output=ts.transpileModule(read(p),{fileName:p,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(output.diagnostics?.length??0,0,'compile '+p);
 const mod={exports:{}};
 vm.runInNewContext(output.outputText,{module:mod,exports:mod.exports,
  require(){throw Error('Unexpected runtime import in virtual director');}},
  {filename:p,timeout:15000});return mod.exports;
}
const {coordinateLiveShowV979:direct,coordinateAtmosphereV979:atmosphere}=load('lib/intelligentLiveShowDirectorV979.ts');
const {DEFAULT_CONCERT_V958:defaults,normalizeConcertRoadmapV958:normalize}=load('lib/ultimateConcertRoadmapV958.ts');
const settings={...defaults,enabled:true,virtualFx:true,liveShowDirectorV979:true,liveShowStyleV979:'adaptive',
 liveShowStrengthV979:80,energyArcV975:true,intelligentTransitionsV976:true,storytellingV977:true,atmosphereV978:true};
const original={id:'song|4|hook',phase:'hook',verified:true,genre:'hardtekk',camera:'wide',formation:'sync',
 wall:'equalizer',palette:['#0099cc','#ff33aa'],effects:['beams','lasers'],intensity:.70,
 transition:.85,spotlight:.65,lightGain:.9,finale:false,reason:'verified',timelineOverride:false};
const scene={...original,intensity:.89,spotlight:.86,lightGain:1.09,effects:['beams','lasers','sweep']};
const inputs={scene,original,settings,trackId:'song',analysisTrackId:'song',sectionLabel:'hook',
 sectionConfidence:.92,sectionIndex:4,positionMs:61000,durationMs:210000,
 sectionStartMs:50000,sectionDurationMs:21000,playing:true,authoredStage:false,
 savedShowActive:false,lowPerformance:false,reducedMotion:false,lyricsVisible:false};
const run=(patch={})=>direct({...inputs,...patch});
const copy=v=>JSON.parse(JSON.stringify(v));
let count=0;
function test(name,fn){fn();count++;console.log('PASS V979 '+name);}
test('disabled-by-default settings preserve original scene object',()=>{
 assert.equal(defaults.liveShowDirectorV979,false);
 const a=run({settings:{...settings,liveShowDirectorV979:false}});
 assert.equal(a.active,false);assert.equal(a.scene,scene);assert.equal(a.atmosphereGain,1);
});
test('verified current hook limits stacked V975 and V977 intensity',()=>{
 const p=run();assert(p.active);assert.equal(p.focus,'peak');
 assert(p.scene.intensity<scene.intensity);
 assert(p.scene.intensity<=original.intensity*1.09);
 assert(p.combinedGain>0&&p.combinedGain<=1);
});
test('automatic choreography, camera, wall and song metadata remain untouched',()=>{
 const p=run().scene;
 for(const key of ['id','phase','genre','verified','camera','formation','wall','palette',
  'transition','finale','reason','timelineOverride'])assert.deepEqual(copy(p[key]),copy(scene[key]),key);
});
test('only a confirmed actual outro can be a finale',()=>{
 const outro={...scene,phase:'outro',finale:true};const base={...original,phase:'outro',finale:true};
 assert.equal(run({scene:outro,original:base,sectionLabel:'outro',positionMs:200000,
  sectionStartMs:195000,sectionDurationMs:14000}).focus,'finale');
 assert.equal(run({scene:{...outro,finale:false},original:{...base,finale:false},sectionLabel:'outro',
  positionMs:200000,sectionStartMs:195000,sectionDurationMs:14000}).focus,'release');
 assert.equal(run({scene:outro,original:base,sectionLabel:'outro',positionMs:110000,
  sectionStartMs:105000,sectionDurationMs:14000}).focus,'release');
});
test('verse, build, drop, break and opening receive distinct priorities',()=>{
 const phases=['verse','build','drop','break','outro'];
 const expectations=['journey','build','peak','breather','release'];
 const output=phases.map(phase=>run({scene:{...scene,phase},original:{...original,phase},sectionLabel:phase}).focus);
 assert.deepEqual(copy(output),expectations);
 assert.equal(run({scene:{...scene,phase:'verse'},original:{...original,phase:'verse'},sectionLabel:'verse',
  positionMs:6000,sectionStartMs:1000,sectionDurationMs:16000}).focus,'intro');
});
test('break removes only inappropriate peak FX, leaving fog and beams',()=>{
 const breakScene={...scene,phase:'break',effects:['fog','lasers','beams']};
 const p=run({scene:breakScene,original:{...original,phase:'break'},sectionLabel:'break'});
 assert(p.active);assert.deepEqual(copy(p.scene.effects),['fog','beams']);
 assert(p.scene.effects.length<=2);
});
test('Deutschrap verse does not use aggressive laser accents',()=>{
 const s={...scene,phase:'verse',genre:'deutschrap',effects:['beams','lasers']};
 const p=run({scene:s,original:{...original,phase:'verse',genre:'deutschrap'},sectionLabel:'verse'});
 assert.deepEqual(copy(p.scene.effects),['beams']);
});
test('style and strength modify the shared budget without breaking caps',()=>{
 const values=['adaptive','cinematic','festival','club'].map(style=>
  run({settings:{...settings,liveShowStyleV979:style}}));
 assert(values.every(p=>p.active));
 assert(values.every(p=>p.scene.intensity<=.97&&p.scene.effects.length<=3));
 assert(values[2].influence>values[0].influence);
 assert(run({settings:{...settings,liveShowStrengthV979:25}}).influence<values[0].influence);
});
test('lyrics cap the director influence and extra atmosphere',()=>{
 const a=run(),b=run({lyricsVisible:true});
 assert(b.influence<a.influence);
 assert(b.atmosphereGain>=a.atmosphereGain);
});
test('section edges return to unmodified brightness gradually',()=>{
 const middle=run();const start=run({positionMs:50000});const end=run({positionMs:70999});
 assert.equal(start.influence,0);
 assert(end.influence<middle.influence);
 assert(start.atmosphereGain===1);assert.equal(start.scene.intensity,scene.intensity);
});
test('physical or saved manual timelines are never overridden',()=>{
 for(const patch of [{authoredStage:true},{savedShowActive:true},
  {scene:{...scene,timelineOverride:true}},{original:{...original,timelineOverride:true}}]){
  const p=run(patch);assert(!p.active);assert.equal(p.scene,patch.scene??scene);
 }
});
test('paused, no virtual FX, reduced motion, Pi and compact FX fail closed',()=>{
 for(const patch of [{playing:false},{lowPerformance:true},{reducedMotion:true},
  {settings:{...settings,enabled:false}},{settings:{...settings,virtualFx:false}},
  {settings:{...settings,compactFxV960:true}},
  {settings:{...settings,liveShowStrengthV979:0}}]){
  const p=run(patch);assert(!p.active);assert.equal(p.scene,scene);
 }
});
test('unverified, stale or mismatched analysis does not activate a show',()=>{
 for(const patch of [{scene:{...scene,verified:false}},{original:{...original,verified:false}},
  {analysisTrackId:'other'},{trackId:''},{sectionLabel:'verse'},{sectionConfidence:.5},
  {sectionConfidence:NaN},{sectionConfidence:1.1}])assert(!run(patch).active);
});
test('invalid playback, section, index and strength fail closed',()=>{
 for(const patch of [{positionMs:NaN},{positionMs:48000},{positionMs:74000},
  {durationMs:0},{sectionDurationMs:0},{sectionStartMs:Infinity},
  {sectionIndex:-1},{sectionIndex:160},{sectionIndex:2.5},
  {settings:{...settings,liveShowStyleV979:'nonsense'}},
  {settings:{...settings,liveShowStrengthV979:101}},
  {scene:{...scene,intensity:Infinity}}, {original:{...original,intensity:1.4}}])assert(!run(patch).active);
});
test('existing V978 opacity only decreases and source cue stays immutable',()=>{
 const cue={active:true,mood:'rave',fogOpacity:.04,beamOpacity:.035,crowdOpacity:.061,
  drift:0,beamTilt:0,crowdWave:.4,spread:1,colorA:'#0099cc',colorB:'#ff33aa'};
 const before=copy(cue);const aligned=atmosphere(cue,run());
 assert(aligned.fogOpacity<=cue.fogOpacity&&aligned.crowdOpacity<=cue.crowdOpacity);
 assert.equal(aligned.colorA,cue.colorA);assert.deepEqual(cue,before);
 assert.equal(atmosphere(cue,run({playing:false})),cue);
 assert.equal(atmosphere({...cue,active:false},run()).active,false);
});
test('song-aware plan is deterministic and playback-seek-stable',()=>{
 assert.deepEqual(copy(run()),copy(run()));
 const a=run({positionMs:63000});assert.deepEqual(copy(a),copy(run({positionMs:63000})));
 assert(a.active);assert(run({positionMs:50000}).focus===a.focus);
});
test('10,000 synthetic confirmed states never exceed intensity and opacity budgets',()=>{
 const phases=['verse','hook','build','drop','break','outro'];
 const genres=['deutschrap','hardtekk','hardstyle','deutschrock','other'];
 for(let n=0;n<10000;n++){
  const phase=phases[n%6],genre=genres[n%5],v=.12+(n%82)/100;
  const candidate={...scene,phase,genre,intensity:v,effects:n%3===0?['beams','fog','sweep']:['lasers','sweep']};
  const baseline={...original,phase,genre,intensity:.25+(n%64)/100};
  const p=run({scene:candidate,original:baseline,sectionLabel:phase,positionMs:50000+n%20000,
   settings:{...settings,liveShowStyleV979:['adaptive','cinematic','festival','club'][n%4]}});
  assert(p.active);
  for(const value of [p.scene.intensity,p.scene.spotlight,p.scene.lightGain,p.atmosphereGain,
   p.crowdGain,p.influence,p.combinedGain])assert(Number.isFinite(value));
  assert(p.scene.intensity>=0&&p.scene.intensity<=.97);
  assert(p.scene.effects.length<=3);
  assert(p.atmosphereGain>0&&p.atmosphereGain<=1);
  assert(p.crowdGain>0&&p.crowdGain<=1);
 }
});
test('storage schema persists opt-in and rejects invalid values',()=>{
 const t=normalize({liveShowDirectorV979:true,liveShowStyleV979:'bogus',liveShowStrengthV979:800});
 assert.equal(t.liveShowDirectorV979,true);assert.equal(t.liveShowStyleV979,'adaptive');
 assert.equal(t.liveShowStrengthV979,100);
 assert.equal(normalize({liveShowStrengthV979:NaN}).liveShowStrengthV979,0);
});
test('virtual-only integration stays inside existing stage and renderer',()=>{
 const code=read('lib/intelligentLiveShowDirectorV979.ts');
 for(const bad of ['fetch(', 'setTimeout(', 'setInterval(', 'useFrame(', 'WebSocket(',
  'localStorage.', 'window.', 'navigator.', 'goveeBridgeRequest('])assert(!code.includes(bad),bad);
 const renderer=read('components/visualizer/ConcertFestivalFxV958.tsx');
 assert(renderer.includes('coordinateLiveShowV979({'));
 assert(renderer.indexOf('applyConcertStorytellingV977(')<renderer.indexOf('coordinateLiveShowV979('));
 assert(renderer.indexOf('coordinateLiveShowV979(')>renderer.indexOf('applySmartConcertPresetV969('));
 assert(renderer.indexOf('coordinateLiveShowV979(')>renderer.indexOf('applyAlexaVirtualSceneV968('));
 assert(renderer.includes('coordinateAtmosphereV979(atmosphereV978,concert.direction)'));
 assert(renderer.includes('<ConcertGenreAtmosphereV978 cue={atmosphereDirectedV979}'));
 assert(!read('components/GoveeMusicSyncV909.tsx').includes('coordinateLiveShowV979'));
 assert(!read('components/visualizer/ThreeAvatar.tsx').includes('coordinateLiveShowV979'));
});
test('one-click UI and production gates are registered',()=>{
 const ui=read('components/ConcertRoadmapStudioV958.tsx');
 for(const name of ['liveShowDirectorV979','liveShowStrengthV979','liveShowStyleV979',
  'energyArcV975:true','intelligentTransitionsV976:true','storytellingV977:true',
  'atmosphereV978:true'])assert(ui.includes(name),name);
 const pkg=JSON.parse(read('package.json'));
 assert.equal(pkg.sonicRoadmapRelease,'v979');assert.equal(pkg.sonicFeatureRelease,'v979');
 for(const script of ['test:v979','test:v979:types'])assert(pkg.scripts[script],script);
 for(const file of ['scripts/vercel-production-build.cjs','scripts/v931-production-gate.cjs']){
  assert(read(file).includes('V979 Intelligent Live Show Director 3.0'),file);
  assert(read(file).includes('tsconfig.v979-core.json'),file);
 }
});
console.log(`V979 PASS: ${count} regression groups (including 10,000 synthetic states)`);
