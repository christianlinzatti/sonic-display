#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const compiled=(f,jsx=false)=>{
 const result=ts.transpileModule(read(f),{fileName:f,reportDiagnostics:true,compilerOptions:{
  target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:jsx?ts.JsxEmit.ReactJSX:ts.JsxEmit.Preserve}});
 const diagnostics=(result.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);
 assert.equal(diagnostics.length,0,`${f}: ${diagnostics.map(d=>d.messageText).join(', ')}`);
 return result.outputText;
};
const mod={exports:{}};vm.runInNewContext(compiled('components/visualizer/intelligentPerformanceGovernorV999.ts'),{module:mod,exports:mod.exports});
const v=mod.exports;
let checks=0;
const test=(title,fn)=>{fn();checks++;console.log('PASS V999 '+title);};
const healthy=(o={})=>({fps:60,p95FrameMs:18,slowRatio:.03,elapsed:1,drawCalls:80,triangles:100000,
 avatarCount:2,playing:true,visible:true,transitioning:false,auto:true,targetFps:45,...o});
const pressured=healthy({fps:25,p95FrameMs:52,slowRatio:.41});
const step=(w,n,from=v.initialConcertBudgetV999())=>{let s=from;for(let k=0;k<n;k++)s=v.advanceConcertBudgetV999(s,w);return s;};
test('neutral default with reduced-only factor ordering',()=>{
 const n=v.initialConcertBudgetV999();assert.equal(n.level,0);
 let prev=v.concertBudgetFactorsV999(0);
 for(let i=1;i<=3;i++){
  const f=v.concertBudgetFactorsV999(i);
  for(const k of ['depth','crowd','led','bass'])assert(f[k]>=0&&f[k]<=prev[k],`${i}.${k}`);
  prev=f;
 }
 assert.equal(prev.depth,0);assert.equal(prev.bass,0);
});
test('requires sustained measured performance pressure, not one glitch',()=>{
 assert.equal(step(pressured,1).level,0);
 assert.equal(step(pressured,2).level,0);
 assert.equal(step(pressured,3).level,1);
});
test('cooldown prevents oscillating under alternating measurement windows',()=>{
 const s=step(pressured,3);assert.equal(s.level,1);
 const a=step(healthy(),4,s);assert.equal(a.level,1);
 assert.equal(v.advanceConcertBudgetV999(a,pressured).level,1);
});
test('sustained pressure reduces by stages and eventually stops optional depth',()=>{
 const s=step(pressured,40);assert.equal(s.level,3);
 assert.equal(v.concertBudgetFactorsV999(s.level).depth,0);
});
test('recovery is slower and re-enables only one stage per cooldown',()=>{
 const severe=step(pressured,40);const a=step(healthy(),15,severe);assert.equal(a.level,3);
 const b=step(healthy(),5,a);assert.equal(b.level,2);
 const c=step(healthy(),2,b);assert.equal(c.level,2);
 const d=step(healthy(),75,c);assert.equal(d.level,0);
});
test('30/45/60 fps targets reflect distinct budgets',()=>{
 const m=healthy({fps:35,p95FrameMs:30,slowRatio:.08});
 const pi=step({...m,targetFps:30},7),desktop=step({...m,targetFps:60},7);
 assert.equal(pi.level,0);assert(desktop.level>=1);
});
test('invalid, paused, hidden, manual, and transitional measurements fail safe',()=>{
 const pressuredState=step(pressured,18);assert(pressuredState.level>0);
 for(const options of [{playing:false},{visible:false},{transitioning:true},{auto:false}])
  assert.equal(v.advanceConcertBudgetV999(pressuredState,healthy(options)).level,0);
 for(const options of [{fps:NaN},{p95FrameMs:Infinity},{elapsed:10},{slowRatio:-.1},{drawCalls:-1},
  {triangles:NaN},{avatarCount:-1},{avatarCount:65},{fps:0},{targetFps:37}])
  assert.equal(v.advanceConcertBudgetV999(pressuredState,healthy(options)),pressuredState);
});
test('trims only optional depth layers, preserves original and colors',()=>{
 const cue={active:true,colorA:'#00ff00',quality:'cinematic',layers:Array.from({length:6},(_,i)=>({opacity:.01,z:i}))};
 const original=JSON.stringify(cue);const scaled=v.limitDepthV999(cue,.25);
 assert.equal(cue.active,true);assert.equal(JSON.stringify(cue),original);assert.equal(scaled.layers.length,2);
 assert(scaled.layers[0].opacity<cue.layers[0].opacity);
 const off=v.limitDepthV999(cue,0);assert.equal(off.active,false);assert.equal(off.layers.length,0);
 assert.equal(v.limitDepthV999(cue,1),cue);
});
test('crowd reduction never increases or enables previously disabled audience',()=>{
 const cue={crowdActiveV996:true,crowdSticksV996:24,crowdGlowV996:.25,crowdWaveV996:.04,crowdReactionV996:.02};
 for(let i=0;i<10000;i++){
  const gain=i%101/100;const r=v.limitCrowdV999(cue,gain);
  assert(r.crowdSticksV996<=cue.crowdSticksV996);assert(r.crowdGlowV996<=cue.crowdGlowV996);
  assert(r.crowdReactionV996<=cue.crowdReactionV996);
 }
 const inactive={...cue,crowdActiveV996:false};assert.equal(v.limitCrowdV999(inactive,0),inactive);
});
test('UI, render measurement, and four V98x/V99x effect surfaces are wired',()=>{
 const controller=read('components/visualizer/adaptivePerformance.tsx');
 assert(controller.includes('sampleConcertGovernorV999({fps,p95FrameMs,slowRatio,elapsed,drawCalls:info.render.calls'));
 assert(controller.includes('transitioning:transitioningV640,auto:mode===\'auto\''));
 const stage=read('components/visualizer/DynamicStage.tsx');
 for(const key of ['getConcertFactorsV999().bass','getConcertFactorsV999().led','getConcertFactorsV999().crowd','limitCrowdV999(planCrowdExperienceV996('])
  assert(stage.includes(key),key);
 const depth=read('components/visualizer/VolumetricDepthV989.tsx');
 assert(depth.includes('limitDepthV999(cue,getConcertFactorsV999().depth)'));
 const ui=read('components/visualizer/ConcertQualityDashboardV751.tsx');
 assert(ui.includes('<ConcertPerformanceGovernorPanelV999/>'));
 const panel=read('components/visualizer/ConcertPerformanceGovernorPanelV999.tsx');
 assert(panel.includes('30 FPS · Raspberry Pi'));assert(panel.includes('60 FPS · Desktop'));
});
test('store keeps TTL expiry, manual override and stale fail-open guard',()=>{
 const code=read('components/visualizer/concertPerformanceGovernorStoreV999.ts');
 for(const part of ['GOVERNOR_TTL_V999=5000','!status.enabled||!status.active','now-status.at>GOVERNOR_TTL_V999',
  '!window.auto||!window.playing||!window.visible||window.transitioning','initialConcertBudgetV999()'])assert(code.includes(part),part);
 for(const forbidden of ['navigator.bluetooth','navigator.serial','govee/command','alexa/command','fetch(','setInterval(','requestAnimationFrame('])
  assert(!code.includes(forbidden),forbidden);
});
test('V999 release metadata and production/CI gates are connected',()=>{
 const pkg=JSON.parse(read('package.json'));
 const lock=JSON.parse(read('package-lock.json'));
 assert(/^0\.1\.0-v\d+$/.test(pkg.version)&&Number(pkg.version.split('-v')[1])>=999);
 assert(/^v\d+$/.test(pkg.sonicRoadmapRelease)&&Number(pkg.sonicRoadmapRelease.slice(1))>=999);
 assert(/^v\d+$/.test(pkg.sonicFeatureRelease)&&Number(pkg.sonicFeatureRelease.slice(1))>=999);
 assert.equal(lock.packages[''].version,pkg.version);
 assert(pkg.scripts.prebuild.includes('npm run test:v999 && npm run test:v999:types'));
 const gate=read('scripts/vercel-production-build.cjs');
 assert(gate.includes("run('V999 Intelligent Performance Governor','tests/v999-performance-governor-regression.cjs')"));
 assert(gate.includes("tests/tsconfig.v999-core.json"));
 const ci=read('.github/workflows/v999-performance-governor-validation.yml');
 assert(ci.includes('npm run test:v999'));assert(ci.includes('npm run build:next'));
});
test('TypeScript transpilation catches source, integration, UI and store syntax',()=>{
 for(const file of ['components/visualizer/concertPerformanceGovernorStoreV999.ts',
 'components/visualizer/ConcertPerformanceGovernorPanelV999.tsx',
 'components/visualizer/adaptivePerformance.tsx','components/visualizer/VolumetricDepthV989.tsx',
 'components/visualizer/DynamicStage.tsx','components/visualizer/ConcertQualityDashboardV751.tsx'])compiled(file,file.endsWith('.tsx'));
});
console.log(`V999 ${checks} regression groups passed`);
