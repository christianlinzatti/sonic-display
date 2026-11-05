#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
function load(file){
 const transpiled=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(transpiled.diagnostics?.length??0,0,`${file}: transpilation diagnostics`);
 const module={exports:{}};
 vm.runInNewContext(transpiled.outputText,{module,exports:module.exports,
  require(){throw Error('Unexpected network or side-effect import');}}, {filename:file,timeout:12000});
 return module.exports;
}
const v=load('lib/immersiveConcertEngineV966.ts');
const settings=load('lib/ultimateConcertRoadmapV958.ts');
const defaultSettings={...settings.DEFAULT_CONCERT_V958,enabled:true,virtualFx:true,immersiveV966:true,immersiveStrengthV966:60};
const scene=(phase='hook',extra={})=>({id:'TRACK|0|hook',phase,verified:true,
 genre:'hardtekk',camera:'wide',formation:'sync',wall:'pulse',palette:['#6b20ff','#00c1ff'],
 effects:['beams'],intensity:.78,transition:1,spotlight:.7,lightGain:1,finale:false,
 reason:'verified',timelineOverride:false,...extra});
const opts=(overrides={})=>({scene:scene(),settings:defaultSettings,sectionLabel:'hook',
 sectionConfidence:.96,sectionStartMs:10000,sectionDurationMs:12000,
 trackId:'TRACK',analysisTrackId:'TRACK',positionMs:14500,durationMs:48000,
 energy:.7,bass:.6,playing:true,reducedMotion:false,authoredStage:false,
 lyricsVisible:false,lowPerformance:false,...overrides});
const plan=o=>v.planImmersiveConcertV966(opts(o));
let count=0;function test(label,fn){try{fn();count++;console.log('PASS V966 '+label)}catch(e){e.message=label+': '+e.message;throw e}}
test('opt-in defaults OFF and does not change V958 schema',()=>{
 assert.equal(settings.DEFAULT_CONCERT_V958.immersiveV966,false);
 assert.equal(settings.DEFAULT_CONCERT_V958.immersiveStrengthV966,60);
 assert.equal(settings.CONCERT_ROADMAP_KEY_V958,'sonic-display:ultimate-concert-v958');
});
test('settings accept boolean true only, cap intensity',()=>{
 for(const x of [true,false,1,'true',null,{}])assert.equal(settings.normalizeConcertRoadmapV958({immersiveV966:x}).immersiveV966,x===true);
 for(const [x,y] of [[150,100],[-10,0],[45.6,46],['0',0]])assert.equal(settings.normalizeConcertRoadmapV958({immersiveStrengthV966:x}).immersiveStrengthV966,y);
});
test('explicitly enabled verified hook produces spatial mood',()=>{
 const c=plan();assert.equal(c.active,true);assert.equal(c.mood,'anthem');
 assert.equal(c.colorA,'#6b20ff');assert(c.beamOpacity>0);
});
test('requires both concert and virtual 3D settings',()=>{
 for(const key of ['enabled','virtualFx','immersiveV966'])assert(!plan({settings:{...defaultSettings,[key]:false}}).active);
});
test('zero strength is fully disabled',()=>assert.equal(plan({settings:{...defaultSettings,immersiveStrengthV966:0}}).active,false));
test('manual authored stage always wins',()=>{
 assert.equal(plan({authoredStage:true}).active,false);
 assert.equal(plan({scene:scene('hook',{timelineOverride:true})}).active,false);
});
test('pauses, low-performance budget and unverified scenes fail closed',()=>{
 assert.equal(plan({playing:false}).active,false);
 assert.equal(plan({lowPerformance:true}).active,false);
 assert.equal(plan({scene:scene('hook',{verified:false})}).active,false);
});
test('track IDs and section labels must match exactly',()=>{
 for(const o of [{analysisTrackId:'OTHER'},{trackId:''},{sectionLabel:'drop'},
  {scene:scene('verse')},{sectionConfidence:.749}])assert.equal(plan(o).active,false);
});
test('invalid or stale clock and invalid section range are rejected',()=>{
 for(const positionMs of [NaN,Infinity,-1,9999,22000,48010])assert.equal(plan({positionMs}).active,false);
 for(const o of [{sectionStartMs:-1},{sectionDurationMs:0},{sectionDurationMs:NaN},
  {durationMs:0},{sectionStartMs:44000},{sectionConfidence:2}])assert.equal(plan(o).active,false);
});
test('crossfades avoid abrupt virtual flashes at section boundaries',()=>{
 for(const positionMs of [10000,21999])assert(plan({positionMs}).beamOpacity===0);
 assert(plan({positionMs:10200}).beamOpacity<plan({positionMs:11200}).beamOpacity);
});
test('cinematic performer focus dims periferal overlays',()=>{
 assert(plan({lyricsVisible:true}).sideGlowOpacity<plan().sideGlowOpacity);
 assert(plan({scene:scene('hook',{camera:'close'})}).beamOpacity<plan().beamOpacity);
});
test('distinct verified phases yield different moods',()=>{
 const moods=['verse','hook','build','drop','break','outro'].map(phase=>{
  const cue=plan({scene:scene(phase),sectionLabel:phase});assert(cue.active);return cue.mood;
 });assert.equal(new Set(moods).size,6);
});
test('stable cues without randomness and reduced motion freezes animation',()=>{
 const a=plan();assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(plan())));
 const b=plan({reducedMotion:true});assert.equal(b.motionPhase,0);assert.equal(b.archScale,1);
});
test('bound transparent channels and no ambient pop for extreme input',()=>{
 for(let i=0;i<8000;i++){
  const phase=['verse','hook','build','drop','break','outro'][i%6];
  const item=plan({scene:scene(phase),sectionLabel:phase,energy:i%2?5:-3,bass:i%3?2:-1,
   positionMs:10400+i%10500});
  assert(item.active);
  for(const [name,max] of [['beamOpacity',.085],['sideGlowOpacity',.2],['floorGlowOpacity',.14],
    ['backHazeOpacity',.09],['audienceEdgeOpacity',.16]]){
    assert(Number.isFinite(item[name])&&item[name]>=0&&item[name]<=max,name);
  }
 }
});
test('no timers hardware commands or audio APIs in new modules',()=>{
 for(const file of ['lib/immersiveConcertEngineV966.ts','components/visualizer/ImmersiveConcertEnvironmentV966.tsx']){
  const src=read(file);for(const bad of ['fetch(', 'setInterval(', 'setTimeout(', 'requestAnimationFrame(',
   'Date.now(', 'localStorage', 'goveeBridgeRequestV909(', 'spotify', 'new WebSocket('])
    assert(!src.includes(bad),file+': '+bad);
 }
});
test('mounted within existing canvas, manual and eco gates are wired',()=>{
 const r=read('components/visualizer/ConcertFestivalFxV958.tsx');
 const avatar=read('components/visualizer/ThreeAvatar.tsx');
 assert(r.includes('<ImmersiveConcertEnvironmentV966 cue={immersiveV966}/>'));
 assert(r.includes('planImmersiveConcertV966({scene,settings'));
 assert(avatar.includes('authoredStage={authoredCueV354.active||authoredEnabled||'));
 assert(avatar.includes('props.showCue?.lightingEnabled===false||props.stageReactive===false'));
 assert(avatar.includes("piConcertBudgetV479.level==='eco'"));
});
test('studio enables settings explicitly without affecting Govee hardwareSync',()=>{
 const ui=read('components/ConcertRoadmapStudioV958.tsx');
 assert(ui.includes('settings.immersiveV966')&&ui.includes('immersiveV966:e.target.checked'));
 assert(ui.includes('immersiveStrengthV966:Number(e.target.value)'));
 assert(ui.includes('settings.roomWaveV965'));
});
test('new regression in full serial gate and Vercel production gate',()=>{
 const a=read('scripts/v931-production-gate.cjs'),b=read('scripts/vercel-production-build.cjs');
 assert(a.includes('V966 immersive concert'));
 assert(a.includes('tsconfig.v966-core.json'));
 assert(b.includes('v966-immersive-concert-regression.cjs'));
 assert(b.includes('tsconfig.v966-core.json'));
});
console.log(`V966 PASS ${count} groups + 8000 generated, bounded immersive cue states`);
