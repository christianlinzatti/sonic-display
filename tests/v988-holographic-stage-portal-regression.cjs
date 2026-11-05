#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const ts=require('./typescript-loader.cjs');const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const compile=(file,tsx=false)=>{
 const r=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,compilerOptions:{
  target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,
  jsx:tsx?ts.JsxEmit.ReactJSX:ts.JsxEmit.Preserve}});
 assert(!r.diagnostics?.some(d=>d.category===ts.DiagnosticCategory.Error),file+' parse failed');
 return r.outputText;
};
const mod={exports:{}};
vm.runInNewContext(compile('lib/holographicStagePortalV988.ts'),{module:mod,exports:mod.exports,
 Math,Number,Object,Array,Set,JSON});
const planner=mod.exports.planHolographicStagePortalV988;
const base={cue:{active:true,mood:'impact',colorA:'#00BBFA',colorB:'#CC33FF',
 sideGlowOpacity:.18,beamOpacity:.05,archScale:1,motionPhase:0},
 scene:{verified:true,phase:'drop',timelineOverride:false},
 settings:{enabled:true,virtualFx:true,immersiveV966:true,portalV988:true,portalModeV988:'auto',portalStrengthV988:65},
 playing:true,lowPerformance:false,reducedMotion:false,lyricsVisible:false,showBackdrop:true};
const plan=(patch={})=>planner({...base,...patch});
let n=0;function test(name,fn){fn();n++;console.log('PASS V988 '+name);}
test('opt-in is off by default, existing roadmap defaults and normalization are backward compatible',()=>{
 const source=read('lib/ultimateConcertRoadmapV958.ts');
 assert(source.includes('portalV988:false,portalModeV988:\'auto\',portalStrengthV988:55'));
 assert(source.includes('portalV988:o.portalV988===true'));
 assert(source.includes("portalModeV988:(['auto','arch','tunnel']"));
 assert(!plan({settings:{...base.settings,portalV988:false}}).active);
});
test('confirmed high-energy drop draws a long tunnel entirely behind stage',()=>{
 const x=plan();assert(x.active);assert.equal(x.mode,'tunnel');
 assert.equal(x.rings.length,4);assert.equal(x.rays.length,4);
 for(let i=0;i<x.rings.length;i++){
  const r=x.rings[i];assert(r.z<=-5.25&&r.z>=-7.5);
  assert(r.radius>1&&r.radius<=3);assert(r.opacity>0&&r.opacity<=.085);
  assert(r.width>0&&r.width<=.03);assert.equal(r.arc,Math.PI*2);
 }
});
test('verse and breathing choose two steady semicircular arches',()=>{
 for(const mood of ['intimate','breathing']){
  const x=plan({cue:{...base.cue,mood}});assert.equal(x.mode,'arch');
  assert.equal(x.rings.length,2);assert.equal(x.rays.length,0);
  assert(x.rings.every(r=>r.arc===Math.PI));
 }
});
test('manual style override is deterministic and not a new sequencer',()=>{
 const a=plan({settings:{...base.settings,portalModeV988:'arch'}});
 const b=plan({settings:{...base.settings,portalModeV988:'arch'}});
 assert.deepEqual({...a},{...b});assert.equal(a.mode,'arch');
 const c=plan({settings:{...base.settings,portalModeV988:'tunnel'},cue:{...base.cue,mood:'intimate'}});
 assert(c.active&&c.rings.length===4);
});
test('explicit gates and manual overrides prevent any rendering',()=>{
 for(const field of ['playing','showBackdrop'])assert(!plan({[field]:false}).active);
 assert(!plan({lowPerformance:true}).active);
 assert(!plan({scene:{...base.scene,timelineOverride:true}}).active);
 assert(!plan({scene:{...base.scene,verified:false}}).active);
 assert(!plan({cue:{...base.cue,active:false}}).active);
 for(const flag of ['enabled','virtualFx','immersiveV966','portalV988'])
  assert(!plan({settings:{...base.settings,[flag]:false}}).active,flag);
});
test('malformed colors, NaNs, and out-of-range options fail closed',()=>{
 for(const color of ['red','#fff','#123456789','rgb(1,2,3)'])
  assert(!plan({cue:{...base.cue,colorA:color}}).active);
 for(const value of [NaN,Infinity,-1,0,101])
  assert(!plan({settings:{...base.settings,portalStrengthV988:value}}).active);
 for(const mode of ['flash','plasma',''] )
  assert(!plan({settings:{...base.settings,portalModeV988:mode}}).active);
 assert(!plan({cue:{...base.cue,motionPhase:NaN}}).active);
 assert(!plan({cue:{...base.cue,sideGlowOpacity:Infinity}}).active);
 assert(!plan({cue:{...base.cue,archScale:Infinity}}).active);
});
test('reduced motion removes perspective rails and freezes animation',()=>{
 const x=plan({reducedMotion:true});assert(x.active);
 assert.equal(x.rings.length,2);assert.equal(x.rays.length,0);
 assert(x.rings.every(r=>r.rotation===0));
});
test('lyrics reduce rather than amplify effect intensity',()=>{
 const x=plan(),y=plan({lyricsVisible:true});assert(y.active);
 for(let i=0;i<x.rings.length;i++)assert(y.rings[i].opacity<=x.rings[i].opacity);
});
test('10,000 stable profiles remain within the geometry and opacity budget',()=>{
 for(let i=0;i<10000;i++){
  const x=plan({cue:{...base.cue,motionPhase:i*.015,sideGlowOpacity:.012+(i%150)*.001,
   archScale:.99+(i%10)*.002},settings:{...base.settings,portalStrengthV988:1+i%100},
   reducedMotion:i%5===0,lyricsVisible:i%3===0});
  assert(x.rings.length<=4&&x.rays.length<=4);
  for(const r of x.rings){assert(Number.isFinite(r.rotation));assert(r.opacity>=0&&r.opacity<=.085);
   assert(r.z<=-5.25&&r.z>=-7.5&&r.radius<=3);}
 }
});
test('existing canvas and explicit studio controls are wired; no extra GPU loop',()=>{
 const scene=read('components/visualizer/ConcertFestivalFxV958.tsx');
 assert(scene.includes('planHolographicStagePortalV988({cue:immersiveV966,scene,settings'));
 assert(scene.includes('<HolographicStagePortalV988 portal={portalV988}/>'));
 const rendered=read('components/visualizer/HolographicStagePortalV988.tsx');
 assert(rendered.includes('portal.rings.map')&&rendered.includes('portal.rays.map'));
 const ui=read('components/ConcertRoadmapStudioV958.tsx');
 for(const guard of ['settings.portalV988','settings.portalModeV988','settings.portalStrengthV988',
  'portalV988:e.target.checked','portalModeV988:e.target.value','portalStrengthV988:Number(e.target.value)'])
  assert(ui.includes(guard),guard);
 for(const item of ['fetch(', 'setInterval(', 'setTimeout(', 'useFrame(', 'requestAnimationFrame(',
  'goveeBridgeRequest', 'window.localStorage', 'WebSocket('])
  for(const file of ['lib/holographicStagePortalV988.ts','components/visualizer/HolographicStagePortalV988.tsx'])
   assert(!read(file).includes(item),file+': '+item);
});
test('changed TS/TSX files parse with TypeScript',()=>{
 for(const file of ['lib/holographicStagePortalV988.ts','lib/ultimateConcertRoadmapV958.ts',
  'components/ConcertRoadmapStudioV958.tsx','components/visualizer/HolographicStagePortalV988.tsx',
  'components/visualizer/ConcertFestivalFxV958.tsx'])compile(file,file.endsWith('.tsx'));
});
test('V988 is first in production checks and metadata is versioned',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert(Number(pkg.sonicRoadmapRelease.replace('v',''))>=988);
 assert(pkg.scripts.prebuild.includes('npm run test:v988 && npm run test:v988:types &&'));
 assert(pkg.scripts['test:v988:types']);
 assert(read('scripts/vercel-production-build.cjs').includes('V988 Holographic Stage Portal'));
 assert(read('.github/workflows/v832-continuous-validation.yml').includes('V988 Holographic Stage Portal'));
 assert(read('tests/tsconfig.v988-core.json').includes('holographicStagePortalV988.ts'));
});
console.log('V988 PASS '+n+' regression groups + 10,000 bounded portal profiles');
