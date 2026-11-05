#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const load=file=>{
 const translated=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(translated.diagnostics?.length??0,0,`Transpile diagnostics in ${file}`);
 const module={exports:{}};
 vm.runInNewContext(translated.outputText,{module,exports:module.exports,require(name){throw Error(`Unexpected runtime import ${name}`);}},
  {filename:file,timeout:12000});
 return module.exports;
};
const policy=load('lib/ultimateConcertRoadmapV958.ts');
const v966=load('lib/immersiveConcertEngineV966.ts');
const v972=load('lib/volumetricStageAtmosphereV972.ts');
const settings={...policy.DEFAULT_CONCERT_V958,enabled:true,virtualFx:true,immersiveV966:true,
 immersiveStrengthV966:70,volumetricV972:true,volumetricStrengthV972:65,volumetricQualityV972:'balanced'};
const scene=(phase='hook',overrides={})=>({id:'TRACK|0|hook',phase,verified:true,genre:'hardtekk',camera:'wide',formation:'sync',
 wall:'pulse',palette:['#a34cff','#65ffff'],effects:['beams'],intensity:.8,transition:1,spotlight:.7,lightGain:1,
 finale:false,reason:'verified',timelineOverride:false,...overrides});
const options=(overrides={})=>({scene:scene(),settings,sectionLabel:'hook',sectionConfidence:.98,
 sectionStartMs:10000,sectionDurationMs:12000,trackId:'TRACK',analysisTrackId:'TRACK',
 positionMs:16000,durationMs:48000,energy:.65,bass:.8,playing:true,reducedMotion:false,
 authoredStage:false,lyricsVisible:false,lowPerformance:false,...overrides});
const plan=(i={})=>{
 const props=options(i);
 const immersive=v966.planImmersiveConcertV966(props);
 return v972.planVolumetricStageV972({immersive,scene:props.scene,settings:props.settings,
  positionMs:props.positionMs,playing:props.playing,authoredStage:props.authoredStage,
  lowPerformance:props.lowPerformance,reducedMotion:props.reducedMotion,lyricsVisible:props.lyricsVisible});
};
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('PASS V972 '+name)};
test('new quality settings remain opt-in, with safe defaults',()=>{
 assert.equal(policy.DEFAULT_CONCERT_V958.volumetricV972,false);
 assert.equal(policy.DEFAULT_CONCERT_V958.volumetricQualityV972,'balanced');
 assert.equal(policy.DEFAULT_CONCERT_V958.volumetricStrengthV972,55);
 assert.equal(policy.normalizeConcertRoadmapV958({volumetricV972:'true'}).volumetricV972,false);
});
test('quality and intensity input normalize safely',()=>{
 for(const [raw,expected] of [['eco','eco'],['balanced','balanced'],['cinematic','cinematic'],['max','balanced'],[null,'balanced']])
  assert.equal(policy.normalizeConcertRoadmapV958({volumetricQualityV972:raw}).volumetricQualityV972,expected);
 for(const [raw,expected] of [[-100,0],[999,100],[42.8,43]])
  assert.equal(policy.normalizeConcertRoadmapV958({volumetricStrengthV972:raw}).volumetricStrengthV972,expected);
});
test('verified song section produces a bounded depth effect',()=>{
 const c=plan();assert(c.active);assert(c.beamOpacity>0);assert(c.hazeOpacity>0);
 assert.equal(c.colorA,'#a34cff');assert.equal(c.colorB,'#65ffff');
});
test('no light stage without explicit scene, immersion and V972 opt-in',()=>{
 for(const key of ['enabled','virtualFx','immersiveV966','volumetricV972'])
  assert.equal(plan({settings:{...settings,[key]:false}}).active,false,key);
 assert.equal(plan({scene:null}).active,false);
 assert.equal(plan({settings:{...settings,volumetricStrengthV972:0}}).active,false);
});
test('manual stage timeline and unverified scene retain priority',()=>{
 assert.equal(plan({authoredStage:true}).active,false);
 assert.equal(plan({scene:scene('hook',{timelineOverride:true})}).active,false);
 assert.equal(plan({scene:scene('hook',{verified:false})}).active,false);
});
test('live track confirmation gates continue to apply through V966',()=>{
 for(const extra of [{sectionConfidence:.74},{analysisTrackId:'stale'},{sectionLabel:'wrong'},
  {trackId:''},{positionMs:9999},{sectionStartMs:-1},{sectionDurationMs:0},{playing:false}])
  assert.equal(plan(extra).active,false,JSON.stringify(extra));
});
test('slow hardware and invalid time fail closed',()=>{
 assert.equal(plan({lowPerformance:true}).active,false);
 for(const time of [NaN,Infinity,-1])assert.equal(plan({positionMs:time}).active,false);
});
test('eco profile bounds planes to Raspberry-Pi-friendly budget',()=>{
 const eco=plan({settings:{...settings,volumetricQualityV972:'eco'}});
 const mid=plan();const high=plan({settings:{...settings,volumetricQualityV972:'cinematic'}});
 assert.equal(2*eco.beamLayers+eco.hazeLayers+1,4);
 assert.equal(2*mid.beamLayers+mid.hazeLayers+1,7);
 assert.equal(2*high.beamLayers+high.hazeLayers+1,10);
});
test('no flashing; motion reduction freezes procedural atmosphere',()=>{
 const a=plan({reducedMotion:true});const b=plan({reducedMotion:true,positionMs:18000});
 assert(a.active&&b.active);assert.equal(a.phase,0);assert.equal(b.phase,0);
 assert.equal(a.fanWidth,1);assert.equal(b.fanWidth,1);
});
test('performer and lyrics remain legible with additional dimming',()=>{
 const focused=plan({lyricsVisible:true}),normal=plan();
 assert(focused.beamOpacity<normal.beamOpacity);
 assert(focused.hazeOpacity<normal.hazeOpacity);
});
test('phase-dependent atmosphere does not override verified scene palette',()=>{
 for(const phase of ['verse','hook','build','drop','break','outro']){
  const v=plan({scene:scene(phase),sectionLabel:phase});assert(v.active,phase);
  assert.equal(v.colorA,'#a34cff');
 }
});
test('smooth near section boundaries and deterministic without wall clock',()=>{
 const near=plan({positionMs:10200}),center=plan();
 assert(near.beamOpacity<center.beamOpacity);
 assert.deepEqual(JSON.parse(JSON.stringify(plan())),JSON.parse(JSON.stringify(plan())));
});
test('10,000 simulated frames stay bounded across all three render profiles',()=>{
 for(let i=0;i<10000;i++){
  const quality=['eco','balanced','cinematic'][i%3];const phase=['verse','hook','build','drop','break','outro'][i%6];
  const v=plan({scene:scene(phase),sectionLabel:phase,
   settings:{...settings,volumetricQualityV972:quality,volumetricStrengthV972:Math.max(12,(i%100)+1)},
   energy:i%2?10:-10,bass:i%5?20:-20,positionMs:10600+(i%9000)});
  assert(v.active);for(const [key,max] of [['beamOpacity',.072],['hazeOpacity',.065],['floorOpacity',.075]])
   assert(Number.isFinite(v[key])&&v[key]>=0&&v[key]<=max,key);
  assert(2*v.beamLayers+v.hazeLayers+1<=10);
 }
});
test('shader does not perform volumetric raymarching or fake aggressive flashes',()=>{
 const s=read('components/visualizer/volumetricShaderV972.ts');
 assert(s.includes('uOpacity')&&s.includes('smoothstep')&&s.includes('vUv'));
 assert(!s.includes('for(')&&!s.includes('while(')&&!s.includes('discard;gl_FragColor'));
});
test('renderer uses bounded transparent planes, no new render loop',()=>{
 const src=read('components/visualizer/VolumetricStageAtmosphereV972.tsx');
 assert(src.includes('cue.beamLayers')&&src.includes('cue.hazeLayers'));
 assert(src.includes('depthWrite={false}')&&src.includes('VolumetricStageAtmosphereV972'));
 for(const bad of ['useFrame(','setInterval(','setTimeout(','requestAnimationFrame(','new WebSocket(','fetch(','goveeBridgeRequestV909('])
  assert(!src.includes(bad),bad);
});
test('mounted behind existing virtual stage within same R3F canvas',()=>{
 const src=read('components/visualizer/ConcertFestivalFxV958.tsx');
 assert(src.includes('planVolumetricStageV972({immersive:immersiveV966,scene,settings'));
 assert(src.includes('<VolumetricStageAtmosphereV972 cue={volumetricV972}/>'));
 assert(src.includes('<ImmersiveConcertEnvironmentV966 cue={immersiveV966}/>'));
});
test('studio contains opt-in, slider and quality selection',()=>{
 const src=read('components/ConcertRoadmapStudioV958.tsx');
 assert(src.includes('volumetricV972:e.target.checked'));
 assert(src.includes('volumetricStrengthV972:Number(e.target.value)'));
 assert(src.includes("volumetricQualityV972:e.target.value as"));
});
test('Govee/Alexa/Spotify hardware settings remain unmodified',()=>{
 const s=policy.DEFAULT_CONCERT_V958;
 assert.equal(s.hardwareSync,false);assert.equal(settings.hardwareSync,false);
 assert(!read('lib/volumetricStageAtmosphereV972.ts').includes('fetch('));
});
test('V972 package and release docs are included',()=>{
 const p=JSON.parse(read('package.json'));
 assert(/^v\d+$/.test(p.sonicRoadmapRelease)&&Number(p.sonicRoadmapRelease.slice(1))>=972);
 assert(p.scripts['test:v972'].includes('v972-volumetric-stage-regression'));
 assert(p.scripts['test:v972:types'].includes('tsconfig.v972-core'));
 assert(read('docs/versions/V972-VOLUMETRIC-STAGE-ATMOSPHERE.md').includes('Raspberry Pi'));
});
console.log(`V972 volumetric atmosphere: ${passed} test groups / 10000 simulated frames passed`);
