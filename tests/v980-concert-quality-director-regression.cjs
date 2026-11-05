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
 const js=ts.transpileModule(read(p),{fileName:p,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(js.diagnostics?.length??0,0,p);
 const mod={exports:{}};
 vm.runInNewContext(js.outputText,{module:mod,exports:mod.exports,
  require(name){if(name==='./visualFxTimelineV823')return load('components/visualizer/visualFxTimelineV823.ts');throw Error('Unexpected runtime dependency: '+p+' '+name)}},{filename:p,timeout:15000});
 return mod.exports;
}
const d=load('components/visualizer/concertQualityDirectorV980.ts');
const perf=load('components/visualizer/concertFxPerformanceOptimizerV825.ts');
const settings=load('components/visualizer/concertFxStudioV810.ts');
const valid={available:true,playing:true,verified:true,sampleCount:30,
 fps:60,frameMs:16.67,p95FrameMs:19,slowFrameShare:0,targetFps:60};
const inputs={enabled:true,optimizerEnabled:true,telemetryEnabled:true,
 tier:'high',allowLowTier:false,restore:true,mode:'balanced',scopeKey:'song-A'};
let count=0;
const test=(name,cb)=>{cb();count++;console.log('PASS V980 '+name);};
const push=(state,snapshot=valid,other={})=>d.advanceConcertQualityDirectorV980(state,{...inputs,snapshot,...other});
const worse={...valid,fps:31,frameMs:32,p95FrameMs:48,slowFrameShare:.55};
const good={...valid,fps:60,frameMs:16.7,p95FrameMs:19,slowFrameShare:.02};
test('disabled by default with explicit Raspberry Pi opt-in',()=>{
 const s=settings.DEFAULT_CONCERT_FX_V810;
 assert.equal(s.concertQualityDirectorV980,false);assert.equal(s.concertQualityPiV980,false);
 assert.equal(s.concertQualityRecoveryV980,true);
});
test('no pressure without three consecutive slow windows',()=>{
 const s=d.createConcertQualityDirectorV980();push(s,worse);push(s,worse);
 assert.equal(s.pressure,0);assert.equal(s.reason,'observing');
 push(s,worse);assert(s.pressure>0);assert.equal(s.reason,'reducing');
});
test('a single spike followed by normal performance does not throttle',()=>{
 const s=d.createConcertQualityDirectorV980();push(s,worse);push(s,good);push(s,worse);
 assert.equal(s.pressure,0);assert.equal(s.badWindows,1);
});
test('long-term poor FPS triggers bounded shedding and readable state',()=>{
 const s=d.createConcertQualityDirectorV980();for(let i=0;i<40;i++)push(s,worse);
 assert(s.pressure>0&&s.pressure<=.85);assert.equal(s.reason,'reducing');
 assert.equal(s.observations,40);assert.equal(s.lastFps,31);
});
test('good FPS gradually reactivates cosmetic FX only after recovery hysteresis',()=>{
 const s=d.createConcertQualityDirectorV980();for(let i=0;i<20;i++)push(s,worse);
 const at=s.pressure;for(let i=0;i<5;i++)push(s,good);
 assert.equal(s.pressure,at);push(s,good);
 assert(s.pressure<at);assert.equal(s.reason,'restoring');
 for(let i=0;i<100;i++)push(s,good);
 assert.equal(s.pressure,0);assert.equal(s.reason,'stable');
});
test('recovery is optional and does not restore when switched off',()=>{
 const s=d.createConcertQualityDirectorV980();for(let i=0;i<10;i++)push(s,worse);
 const at=s.pressure;for(let i=0;i<20;i++)push(s,good,{restore:false});
 assert.equal(s.pressure,at);assert.equal(s.reason,'holding');
});
test('visual mode preserves quality longer than performance mode',()=>{
 const visual=d.createConcertQualityDirectorV980(),performance=d.createConcertQualityDirectorV980();
 for(let i=0;i<3;i++){push(visual,worse,{mode:'visual'});push(performance,worse,{mode:'performance'});}
 assert.equal(visual.pressure,0);assert(performance.pressure>0);
});
test('intermediate frame times hold stable pressure, avoiding oscillations',()=>{
 const s=d.createConcertQualityDirectorV980();for(let i=0;i<8;i++)push(s,worse);
 const at=s.pressure;for(let i=0;i<30;i++)push(s,{...valid,frameMs:19.5,p95FrameMs:22,slowFrameShare:.15});
 assert.equal(s.pressure,at);assert.equal(s.reason,'holding');
});
test('pauses, stale readings, missing telemetrics and unverified tracks fail closed',()=>{
 const bad=[{...valid,playing:false},{...valid,verified:false},{...valid,available:false},
 {...valid,sampleCount:0},{...valid,fps:NaN},{...valid,frameMs:Infinity},
 {...valid,p95FrameMs:-1},{...valid,slowFrameShare:1.5},{...valid,targetFps:45}];
 for(const q of bad){const s=d.createConcertQualityDirectorV980();for(let i=0;i<6;i++)push(s,worse);
  push(s,q);assert.equal(s.pressure,0);assert.equal(s.reason,'waiting');}
});
test('scope changes reset automatic pressure across songs',()=>{
 const s=d.createConcertQualityDirectorV980();for(let i=0;i<10;i++)push(s,worse);
 push(s,good,{scopeKey:'song-B'});assert.equal(s.pressure,0);assert.equal(s.observations,1);
});
test('completed-window seek scope increments only for discontinuities',()=>{
 const stage=read('components/visualizer/DynamicStage.tsx');
 assert(stage.includes('const qualityTrackScopeV980=useRef('));
 assert(stage.includes('Math.abs(playback.positionMs-trackScopeV980.positionMs)>5000'));
 assert(stage.includes('scopeKey:songIdV980?`${songIdV980}:${trackScopeV980.epoch}`'));
});
test('ineligible low-power tier remains unchanged',()=>{
 const s=d.createConcertQualityDirectorV980();
 const low={...worse,targetFps:30,frameMs:48,p95FrameMs:72,fps:21};
 for(let i=0;i<9;i++)push(s,low,{tier:'low'});
 assert.equal(s.pressure,0);assert.equal(s.reason,'off');
});
test('low-power profile explicitly enabled can shed FX using a 30fps goal',()=>{
 const s=d.createConcertQualityDirectorV980();
 const low={...worse,targetFps:30,frameMs:50,p95FrameMs:70,fps:20};
 for(let i=0;i<7;i++)push(s,low,{tier:'low',allowLowTier:true});
 assert(s.pressure>0);assert.equal(s.targetFps,30);
});
test('wrong target FPS cannot activate low-profile controller',()=>{
 const s=d.createConcertQualityDirectorV980();for(let i=0;i<10;i++)push(s,worse,{tier:'low',allowLowTier:true});
 assert.equal(s.pressure,0);assert.equal(s.reason,'waiting');
});
test('disabling optimizer, telemetry, or director clears pressure',()=>{
 for(const field of ['enabled','optimizerEnabled','telemetryEnabled']){
  const s=d.createConcertQualityDirectorV980();for(let i=0;i<8;i++)push(s,worse);
  push(s,worse,{[field]:false});assert.equal(s.pressure,0);assert.equal(s.reason,'off');}
});
test('V980 never reduces existing V825 pressure or exceeds 85% extra',()=>{
 const s=d.createConcertQualityDirectorV980();s.pressure=.99;
 assert.equal(d.qualityPressureV980(.3,s,true),.85);
 assert.equal(d.qualityPressureV980(.96,s,true),.96);
 assert.equal(d.qualityPressureV980(.2,s,false),.2);
 assert.equal(d.qualityPressureV980(NaN,s,false),0);
});
test('V825 respects manually disabled FX and preserves LED/vocal priority',()=>{
 const scene={active:true,reason:'music'},cfg={...settings.DEFAULT_CONCERT_FX_V810,
 concertQualityDirectorV980:true,concertQualityPiV980:true};
 const plan=perf.planFxPerformanceV825({settings:cfg,fx:scene,tier:'high',pressure:.85,
  lyricsProtected:true,vocalFocus:true,groupCount:3});
 assert(plan.active);assert(plan.gains.foam<=plan.gains.led);assert(plan.gains.particles<=plan.gains.vocal);
 assert(plan.gains.led>=.65&&plan.gains.vocal>=.78);
 const disabled=perf.planFxPerformanceV825({settings:{...cfg,enabled:false},fx:scene,
  tier:'high',pressure:.85,lyricsProtected:false,vocalFocus:false,groupCount:2});
 assert(!disabled.active);
});
test('V825 never alters Pi legacy low-tier behavior unless both opt-ins',()=>{
 const scene={active:true,reason:'music'},cfg=settings.DEFAULT_CONCERT_FX_V810;
 const plan=other=>perf.planFxPerformanceV825({settings:{...cfg,...other},fx:scene,
  tier:'low',pressure:.85,lyricsProtected:true,vocalFocus:false,groupCount:2});
 assert.equal(plan({}).active,false);
 assert.equal(plan({concertQualityDirectorV980:true}).active,false);
 assert.equal(plan({concertQualityPiV980:true}).active,false);
 const opted=plan({concertQualityDirectorV980:true,concertQualityPiV980:true});
 assert.equal(opted.active,true);assert(opted.throttled.length>0);
});

test('Pi diagnostic opt-in cannot re-enable heavy V810 song FX',()=>{
 const cfg=settings.normalizeConcertFxV810({concertQualityDirectorV980:true,concertQualityPiV980:true});
 const cue=settings.planConcertFxV810({settings:cfg,genre:'hardtekk',section:'drop',progressMs:5000,
  startMs:0,endMs:10000,active:true,verified:true,playing:true,reactive:true,reducedMotion:false,
  authored:false,blackout:false,lyricsProtected:false,vocalFocus:false,groupCount:2,tier:'low',
  energy:.9,kick:.8,bass:.8,mids:.6,highs:.5,ledBudget:1,laserBudget:1});
 assert.equal(cue.active,false);assert.equal(cue.reason,'guarded');
});
test('settings normalize safely and retain older V827 tuning',()=>{
 const s=settings.normalizeConcertFxV810({concertQualityDirectorV980:true,
  concertQualityPiV980:true,concertQualityModeV980:'unsafe',concertQualityRecoveryV980:false,
  autoQualityV827:false});
 assert(s.concertQualityDirectorV980&&s.concertQualityPiV980);
 assert.equal(s.concertQualityModeV980,'balanced');assert.equal(s.concertQualityRecoveryV980,false);
 assert.equal(s.autoQualityV827,false);
});
test('10,000 measured frame windows stay finite, within budget and deterministic',()=>{
 const s=d.createConcertQualityDirectorV980();
 for(let i=0;i<10000;i++){
  const fps=17+i%50,avg=1000/fps,p95=avg*(1+i%6/10);
  const q={...valid,fps,frameMs:avg,p95FrameMs:p95,slowFrameShare:i%101/100};
  push(s,q);assert(Number.isFinite(s.pressure));assert(s.pressure>=0&&s.pressure<=.85);
 }
 const a=d.createConcertQualityDirectorV980(),b=d.createConcertQualityDirectorV980();
 for(let i=0;i<100;i++){push(a,i%2?worse:good);push(b,i%2?worse:good);}
 assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)));
});
test('no side effects or extra renderer loop; exact V826/V825 integration',()=>{
 const controller=read('components/visualizer/concertQualityDirectorV980.ts');
 for(const forbidden of ['fetch(', 'WebSocket(', 'setTimeout(', 'setInterval(', 'useFrame(', 'navigator.', 'localStorage.', 'document.', 'goveeBridgeRequest('])assert(!controller.includes(forbidden),forbidden);
 const stage=read('components/visualizer/DynamicStage.tsx');
 assert(stage.includes('advanceConcertQualityDirectorV980(qualityDirectorStateV980.current'));
 assert(stage.includes('qualityPressureV980(fxPerfStateV825.current.pressure'));
 assert(stage.includes('enabled:!qualityEnabledV980&&concertFxV810?.autoQualityV827'));
 assert(stage.indexOf('const fxPressureV980=')<stage.indexOf('planFxPerformanceV825({settings:concertFxV810'));
 assert(stage.indexOf('advanceConcertQualityDirectorV980(qualityDirectorStateV980.current')<stage.indexOf('publishConcertQualityV826(snapshot)'));
 assert(read('components/visualizer/ConcertQualityDashboardV826.tsx').includes('V980 Live Quality Director'));
 assert(read('components/visualizer/ConcertFxStudioPanelV810.tsx').includes('V980 · Concert Quality & Performance Director'));
 assert(!read('components/GoveeMusicSyncV909.tsx').includes('concertQualityDirectorV980'));
});
console.log(`V980 PASS: ${count} regression groups (incl. 10,000 simulated windows)`);
