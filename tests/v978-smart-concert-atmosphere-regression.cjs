#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function load(p){
 const compiled=ts.transpileModule(read(p),{fileName:p,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(compiled.diagnostics?.length??0,0,'transpile '+p);
 const mod={exports:{}};
 vm.runInNewContext(compiled.outputText,{module:mod,exports:mod.exports,
  require(){throw Error('V978 planner must not require runtime modules');}},
 {filename:p,timeout:12000});return mod.exports;
}
const {planConcertAtmosphereV978:plan}=load('lib/concertAtmosphereV978.ts');
const policy=load('lib/ultimateConcertRoadmapV958.ts');
const settings={...policy.DEFAULT_CONCERT_V958,enabled:true,virtualFx:true,
 atmosphereV978:true,atmosphereModeV978:'balanced',atmosphereStrengthV978:75,
 atmosphereFogV978:true,atmosphereBeamsV978:true,atmosphereCrowdV978:true};
const scene={id:'verified-song|4|hook',phase:'hook',verified:true,genre:'hardtekk',
 camera:'wide',formation:'sync',wall:'equalizer',palette:['#0099cc','#ee33aa'],
 effects:['beams'],intensity:.72,transition:.8,spotlight:.7,lightGain:.9,
 finale:false,reason:'verified',timelineOverride:false};
const baseline={scene,settings,trackId:'song',analysisTrackId:'song',sectionLabel:'hook',
 sectionConfidence:.91,positionMs:62000,durationMs:210000,sectionStartMs:50000,
 sectionDurationMs:24000,playing:true,authoredStage:false,lowPerformance:false,
 reducedMotion:false,lyricsVisible:false,energy:.7,bass:.8,
 immersiveActive:false,volumetricActive:false};
const run=(patch={})=>plan({...baseline,...patch});
const plain=x=>JSON.parse(JSON.stringify(x));
let count=0;
function check(name,fn){fn();count++;console.log('PASS V978 '+name);}
check('verified hook renders 3 bounded atmosphere layers',()=>{
 const c=run();assert.equal(c.active,true);assert.equal(c.mood,'rave');
 assert(c.fogOpacity>0&&c.fogOpacity<=.052);
 assert(c.beamOpacity>0&&c.beamOpacity<=.047);
 assert(c.crowdOpacity>0&&c.crowdOpacity<=.064);
});
check('Deutschrap = urban fog-focused dark stage',()=>{
 const c=run({scene:{...scene,genre:'deutschrap'}});
 assert.equal(c.mood,'urban');assert(c.fogOpacity>c.beamOpacity);
 assert(c.fogOpacity>c.crowdOpacity);
});
check('Hardtekk = rave beams and crowd, less fog',()=>{
 const c=run();assert(c.beamOpacity>c.fogOpacity);assert(c.crowdOpacity>c.fogOpacity);
});
check('Hardstyle remains related to Hardtekk',()=>{
 const c=run({scene:{...scene,genre:'hardstyle'}});
 assert.equal(c.mood,'rave');assert(c.beamOpacity>c.fogOpacity);
});
check('Deutschrock = arena audience focus',()=>{
 const c=run({scene:{...scene,genre:'deutschrock'}});
 assert.equal(c.mood,'arena');assert(c.crowdOpacity>c.fogOpacity);
});
check('Other genres remain neutral and bounded',()=>{
 const c=run({scene:{...scene,genre:'other'}});
 assert.equal(c.mood,'neutral');assert(c.active);
});
check('Break fog dominates while energetic drops favor beams',()=>{
 const br=run({scene:{...scene,phase:'break'},sectionLabel:'break'});
 const dr=run({scene:{...scene,phase:'drop'},sectionLabel:'drop'});
 assert(br.fogOpacity>br.beamOpacity);assert(dr.beamOpacity>dr.fogOpacity);
 assert(dr.crowdOpacity>br.crowdOpacity);
});
check('Verse stays calmer than same-genre hook',()=>{
 const v=run({scene:{...scene,phase:'verse'},sectionLabel:'verse'});
 assert(v.crowdOpacity<run().crowdOpacity);
});
check('Start/end fade without sudden flash',()=>{
 const start=run({positionMs:50000});const end=run({positionMs:73999});
 assert(!start.active);assert(end.fogOpacity<.000001);
 assert(run({positionMs:50350}).fogOpacity<run({positionMs:51800}).fogOpacity);
});
check('Opt-in defaults off; legacy settings remain disabled',()=>{
 assert.equal(policy.DEFAULT_CONCERT_V958.atmosphereV978,false);
 assert.equal(policy.normalizeConcertRoadmapV958({enabled:true}).atmosphereV978,false);
 assert.equal(run({settings:{...settings,atmosphereV978:false}}).active,false);
});
check('Intensity and modes bound atmosphere',()=>{
 const subtle=run({settings:{...settings,atmosphereModeV978:'subtle'}});
 const immersive=run({settings:{...settings,atmosphereModeV978:'immersive'}});
 assert(subtle.fogOpacity<immersive.fogOpacity);
 assert(!run({settings:{...settings,atmosphereStrengthV978:0}}).active);
});
check('Each atmosphere layer can be disabled independently',()=>{
 for(const [field,out] of [['atmosphereFogV978','fogOpacity'],
 ['atmosphereBeamsV978','beamOpacity'],['atmosphereCrowdV978','crowdOpacity']]){
  const result=run({settings:{...settings,[field]:false}});
  assert.equal(result[out],0);assert(result.active);
 }
 assert(!run({settings:{...settings,atmosphereFogV978:false,
  atmosphereBeamsV978:false,atmosphereCrowdV978:false}}).active);
});
check('Missing or inconsistent verified sections never enable visuals',()=>{
 for(const patch of [{scene:null},{scene:{...scene,verified:false}},
  {sectionLabel:'verse'},{sectionConfidence:.74},{sectionConfidence:NaN},
  {trackId:'other'}, {analysisTrackId:''},{positionMs:10000},
  {positionMs:75000},{durationMs:0},{sectionDurationMs:500},
  {sectionStartMs:-1},{positionMs:Infinity}, {bass:NaN}]){
  const c=run(patch);assert(!c.active,JSON.stringify(patch));
 }
});
check('Manual scenes, active shows and authoring always take priority',()=>{
 for(const patch of [{scene:{...scene,timelineOverride:true}},
  {authoredStage:true},{savedShowActive:true}])assert(!run(patch).active);
});
check('Paused playback, disabled virtual FX, and voice effects off are respected',()=>{
 for(const patch of [{playing:false},{settings:{...settings,enabled:false}},
  {settings:{...settings,virtualFx:false}},
  {settings:{...settings,voiceFxV968:'off'}}])assert(!run(patch).active);
});
check('Pi low-performance, reduced motion and compact FX never allocate visuals',()=>{
 for(const patch of [{lowPerformance:true},{reducedMotion:true},
  {settings:{...settings,compactFxV960:true}}]){
  const c=run(patch);assert(!c.active);assert.equal(c.fogOpacity,0);
 }
});
check('Lyrics and existing V966/V972 volumetrics reduce extra overdraw',()=>{
 const base=run(),lyrics=run({lyricsVisible:true}),layers=run({immersiveActive:true,volumetricActive:true});
 assert(lyrics.fogOpacity<base.fogOpacity&&lyrics.crowdOpacity<base.crowdOpacity);
 assert(layers.fogOpacity<base.fogOpacity&&layers.beamOpacity<base.beamOpacity);
});
check('Deterministic, time-anchored and seek-stable',()=>{
 assert.deepEqual(plain(run()),plain(run()));
 const moved=run({positionMs:63200});assert.notEqual(moved.drift,run().drift);
 assert.deepEqual(plain(run()),plain(run({positionMs:62000})));
});
check('Storage normalization clamps strength and rejects invalid mode',()=>{
 const normal=policy.normalizeConcertRoadmapV958({atmosphereV978:true,
  atmosphereModeV978:'bad',atmosphereStrengthV978:999,
  atmosphereFogV978:false,atmosphereBeamsV978:false,atmosphereCrowdV978:false});
 assert.equal(normal.atmosphereV978,true);assert.equal(normal.atmosphereModeV978,'balanced');
 assert.equal(normal.atmosphereStrengthV978,100);assert.equal(normal.atmosphereFogV978,false);
 assert.equal(normal.atmosphereBeamsV978,false);assert.equal(normal.atmosphereCrowdV978,false);
});
check('10,000 simulated section positions stay bounded, finite and stable',()=>{
 const phases=['verse','hook','build','drop','break','outro'];
 const genres=['deutschrap','hardtekk','hardstyle','deutschrock','other'];
 for(let n=0;n<10000;n++){
  const phase=phases[n%6],genre=genres[n%5];
  const c=run({scene:{...scene,phase,genre},sectionLabel:phase,
   positionMs:50000+(n%23999),energy:(n%101)/100,bass:((n*17)%101)/100,
   settings:{...settings,atmosphereModeV978:['subtle','balanced','immersive'][n%3]}});
  for(const [key,max] of [['fogOpacity',.052],['beamOpacity',.047],['crowdOpacity',.064]]){
   assert(Number.isFinite(c[key]));assert(c[key]>=0&&c[key]<=max);
  }
  assert(Number.isFinite(c.drift)&&Number.isFinite(c.crowdWave));
 }
});
check('Integration is virtual-only: no physical hardware, no extra render loop',()=>{
 const lib=read('lib/concertAtmosphereV978.ts');
 for(const token of ['fetch(', 'setInterval(', 'setTimeout(', 'WebSocket(', 'dispatchEvent(',
  'localStorage.', 'navigator.', 'GoveeMusicSyncV909', 'useFrame(', 'window.']){
  assert(!lib.includes(token),token);
 }
 const fx=read('components/visualizer/ConcertFestivalFxV958.tsx');
 const renderer=read('components/visualizer/ConcertGenreAtmosphereV978.tsx');
 assert(fx.includes('planConcertAtmosphereV978({scene,settings'));
 assert(fx.includes('coordinateAtmosphereV979(atmosphereV978,concert.direction)'));
 assert(fx.includes('<ConcertGenreAtmosphereV978 cue={atmosphereDirectedV979}'));
 assert(!renderer.includes('useFrame('));assert(!renderer.includes('directionalLight'));
 for(const token of ['circleGeometry','coneGeometry','planeGeometry','fogOpacity','beamOpacity','crowdOpacity'])assert(renderer.includes(token));
 assert(read('components/ConcertRoadmapStudioV958.tsx').includes('atmosphereStrengthV978'));
 assert(read('scripts/v931-production-gate.cjs').includes('V978 Smart Concert Atmosphere'));
 assert(read('scripts/vercel-production-build.cjs').includes('V978 Smart Concert Atmosphere'));
});
console.log(`V978 PASS: ${count} regression groups (including 10,000 synthetic song states)`);
