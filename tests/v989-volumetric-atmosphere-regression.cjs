#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs');const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
function load(f){const r=ts.transpileModule(read(f),{fileName:f,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert(!(r.diagnostics||[]).some(d=>d.category===ts.DiagnosticCategory.Error),f);
 const module={exports:{}};vm.runInNewContext(r.outputText,{module,exports:module.exports,Math,Number,Object,Array});return module.exports;}
const roadmap=load('lib/ultimateConcertRoadmapV958.ts');
const planner=load('lib/volumetricAtmosphereV989.ts').planVolumetricAtmosphereV989;
const settings={...roadmap.DEFAULT_CONCERT_V958,enabled:true,virtualFx:true,immersiveV966:true,
 volumetricV972:true,depthAtmosphereV989:true,depthStyleV989:'auto',depthStrengthV989:75};
const scene={verified:true,timelineOverride:false,phase:'hook'};
const base={active:true,quality:'balanced',beamOpacity:.06,hazeOpacity:.045,floorOpacity:.05,colorA:'#66AAFF',colorB:'#332299',phase:.4};
const props={base,scene,settings,playing:true,authoredStage:false,lowPerformance:false,reducedMotion:false,lyricsVisible:false,positionMs:20000};
const plan=(x={})=>planner({...props,...x});
let passed=0;function test(label,fn){fn();passed++;console.log('PASS V989 '+label);}
test('opt-in default remains off and old persisted settings load safely',()=>{
 assert.equal(roadmap.DEFAULT_CONCERT_V958.depthAtmosphereV989,false);
 const old=roadmap.normalizeConcertRoadmapV958({enabled:true,volumetricV972:true});
 assert.equal(old.depthAtmosphereV989,false);assert.equal(old.depthStyleV989,'auto');assert.equal(old.depthStrengthV989,50);
 assert(!plan({settings:old}).active);
});
test('strictly normalized style, intensity and Boolean opt-in',()=>{
 assert.equal(roadmap.normalizeConcertRoadmapV958({depthAtmosphereV989:'true'}).depthAtmosphereV989,false);
 for(const [input,expected] of [['auto','auto'],['soft-beams','soft-beams'],['ground-fog','ground-fog'],['flash','auto']])
  assert.equal(roadmap.normalizeConcertRoadmapV958({depthStyleV989:input}).depthStyleV989,expected);
 for(const [input,expected] of [[-12,0],[101,100],[36.6,37]])
  assert.equal(roadmap.normalizeConcertRoadmapV958({depthStrengthV989:input}).depthStrengthV989,expected);
});
test('auto-style follows verified song phases deterministically',()=>{
 for(const phase of ['hook','build','drop'])assert.equal(plan({scene:{...scene,phase}}).style,'soft-beams');
 for(const phase of ['verse','break','outro'])assert.equal(plan({scene:{...scene,phase}}).style,'ground-fog');
 assert.deepEqual(JSON.parse(JSON.stringify(plan())),JSON.parse(JSON.stringify(plan())));
});
test('explicit manual styles work independently from scene mood',()=>{
 const fog=plan({settings:{...settings,depthStyleV989:'ground-fog'}});
 const beam=plan({settings:{...settings,depthStyleV989:'soft-beams'}});
 assert(fog.active&&beam.active);assert(fog.layers.every(l=>l.kind==='fog'));
 assert(beam.layers.some(l=>l.kind==='beam'));
});
test('Eco Balanced and Cinematic have strict two/four/six layer budgets',()=>{
 for(const [quality,n] of [['eco',2],['balanced',4],['cinematic',6]]){
  const p=plan({base:{...base,quality}});assert(p.active);assert.equal(p.layers.length,n);
  assert.equal(p.quality,quality);for(const layer of p.layers){assert(layer.opacity>0&&layer.opacity<=.025);
   assert(layer.z<-.5&&layer.z>-8);assert(layer.width>=1&&layer.width<=9);
  }
 }
});
test('parent V972 and immersive/virtual opt-in gates always win',()=>{
 for(const flag of ['enabled','virtualFx','immersiveV966','volumetricV972','depthAtmosphereV989'])
  assert(!plan({settings:{...settings,[flag]:false}}).active,flag);
 assert(!plan({base:{...base,active:false}}).active);
 assert(!plan({settings:{...settings,depthStrengthV989:0}}).active);
});
test('manual show, timeline override, paused playback and weak hardware cannot render',()=>{
 assert(!plan({scene:{...scene,verified:false}}).active);
 assert(!plan({scene:{...scene,timelineOverride:true}}).active);
 assert(!plan({authoredStage:true}).active);assert(!plan({playing:false}).active);
 assert(!plan({lowPerformance:true}).active);
 assert(!plan({settings:{...settings,compactFxV960:true}}).active);
});
test('malformed palette, opacity, time, profile and shader state fail closed',()=>{
 for(const color of ['red','#abc','rgba(0,0,0,1)','#1234567'])assert(!plan({base:{...base,colorB:color}}).active);
 for(const n of [NaN,Infinity,-1,101])assert(!plan({settings:{...settings,depthStrengthV989:n}}).active);
 for(const n of [NaN,Infinity,-1])assert(!plan({positionMs:n}).active);
 assert(!plan({base:{...base,phase:NaN}}).active);
 assert(!plan({base:{...base,hazeOpacity:Infinity}}).active);
 assert(!plan({base:{...base,quality:'ultra'}}).active);
 assert(!plan({settings:{...settings,depthStyleV989:'strobe'}}).active);
});
test('accessibility: reduced motion freezes shader drift; lyrics reduce alpha',()=>{
 const quiet=plan({reducedMotion:true});assert(quiet.active);
 assert(quiet.layers.every(l=>l.phase===0));
 const lyrics=plan({lyricsVisible:true});assert(lyrics.active);
 assert(lyrics.layers.every((l,i)=>l.opacity<=plan().layers[i].opacity));
});
test('10,000 bounded plans never produce a flash or geometry overload',()=>{
 for(let i=0;i<10000;i++){
  const quality=['eco','balanced','cinematic'][i%3];
  const p=plan({base:{...base,quality,phase:i/100,beamOpacity:(i%75)/1000,
   hazeOpacity:(i%80)/1000},settings:{...settings,depthStrengthV989:1+i%100},
   lyricsVisible:i%4===0,reducedMotion:i%5===0});
  assert(p.layers.length<=6);
  for(const layer of p.layers){assert(Number.isFinite(layer.opacity)&&layer.opacity>=0&&layer.opacity<=.025);
   assert(Number.isFinite(layer.phase));assert(layer.width<9);}
 }
});
test('actual canvas, settings and shaders are wired without new rendering loop',()=>{
 const canvas=read('components/visualizer/ConcertFestivalFxV958.tsx');
 assert(canvas.includes('planVolumetricAtmosphereV989({base:volumetricV972,scene,settings'));
 assert(canvas.includes('<VolumetricDepthV989 cue={depthV989}/>'));
 const ui=read('components/ConcertRoadmapStudioV958.tsx');
 for(const item of ['settings.depthAtmosphereV989','depthAtmosphereV989:e.target.checked',
  'settings.depthStyleV989','depthStyleV989:e.target.value','settings.depthStrengthV989','depthStrengthV989:Number(e.target.value)'])assert(ui.includes(item),item);
 const render=read('components/visualizer/VolumetricDepthV989.tsx');
 assert(render.includes('cue.layers.map')&&render.includes('depthWrite={false}'));
 assert(read('components/visualizer/volumetricDepthShaderV989.ts').includes('smoothstep'));
 for(const file of ['lib/volumetricAtmosphereV989.ts','components/visualizer/VolumetricDepthV989.tsx'])
  for(const forbidden of ['useFrame(', 'fetch(', 'setInterval(', 'setTimeout(', 'requestAnimationFrame(', 'WebSocket(', 'goveeBridgeRequest'])
   assert(!read(file).includes(forbidden),`${file} contains ${forbidden}`);
});
test('new source files parse and production gates include V989',()=>{
 for(const file of ['lib/volumetricAtmosphereV989.ts','components/visualizer/VolumetricDepthV989.tsx',
  'components/visualizer/volumetricDepthShaderV989.ts','lib/ultimateConcertRoadmapV958.ts',
  'components/visualizer/ConcertFestivalFxV958.tsx','components/ConcertRoadmapStudioV958.tsx']){
  const r=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
   compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});
  assert(!(r.diagnostics||[]).some(d=>d.category===ts.DiagnosticCategory.Error),file);
 }
 const pkg=JSON.parse(read('package.json'));assert(Number(pkg.sonicRoadmapRelease.slice(1))>=989);
 assert(pkg.scripts.prebuild.includes('npm run test:v989 && npm run test:v989:types &&')); 
 assert(read('scripts/vercel-production-build.cjs').includes('V989 Volumetric Atmosphere 2.0'));
 assert(read('.github/workflows/v832-continuous-validation.yml').includes('V989 Volumetric Atmosphere 2.0'));
 assert(read('tests/tsconfig.v989-core.json').includes('volumetricAtmosphereV989.ts'));
});
console.log('V989 PASS '+passed+' regression groups, including 10,000 bounded profiles');
