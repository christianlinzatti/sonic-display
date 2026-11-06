#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const load=require('./helpers/loader-v733.cjs')();
const {adaptLiveShowV1022}=load('lib/aiLiveShowAdaptationV1022');
const trackId='private-song-not-for-diagnostics';
const scenes=[
 {index:0,actIndex:0,section:'verse',startMs:0,endMs:30000},
 {index:1,actIndex:1,section:'build',startMs:30000,endMs:50000},
 {index:2,actIndex:2,section:'hook',startMs:50000,endMs:85000},
 {index:3,actIndex:3,section:'break',startMs:85000,endMs:95000},
 {index:4,actIndex:4,section:'verse',startMs:95000,endMs:125000},
 {index:5,actIndex:5,section:'drop',startMs:125000,endMs:160000},
 {index:6,actIndex:6,section:'hook',startMs:160000,endMs:180000},
 ];
const durationMs=180000;
function audio(extra={}){return {source:'live-normalized-audio',trackId,durationMs,positionMs:61000,
 samples:12,smoothed:.88,baseline:.55,trend:.3,bass:.8,pulse:.6,...extra};}
function renderer(extra={}){return {available:true,playing:true,verified:true,sampleCount:90,
 fps:56,targetFps:60,slowFrameShare:.06,...extra};}
function input(extra={}){return {trackId,durationMs,positionMs:61000,playing:true,enabled:true,
 genre:'Hardtekk',timeline:{trackId,durationMs,progressMs:61000,playing:true,
 source:'verified-v604',scenes},audio:audio(),renderer:renderer(),...extra};}
const p=adaptLiveShowV1022(input());
assert.equal(p.status,'adapted');assert.equal(p.genre,'hardtekk');
assert.equal(p.actOrdinal,2);assert.equal(p.phase,'peak');
assert.equal(p.audioEvidence,'measured-v896');
assert.equal(p.rendererEvidence,'measured-v826');
assert.equal(p.performanceBudget,'healthy');
assert.equal(p.source,'verified-v604');
assert(p.suggestedIntensity>p.baselineIntensity);
assert(p.suggestedIntensity<=p.baselineIntensity+.11);
assert.equal(p.fxDensity,'expressive');
assert(!JSON.stringify(p).includes(trackId),'No private track identity in the plan');
assert.equal(JSON.stringify(p),JSON.stringify(adaptLiveShowV1022(input())),
 'Same input => deterministic recommendation');
const neutral=adaptLiveShowV1022(input({audio:null,renderer:null}));
assert.equal(neutral.status,'baseline');assert.equal(neutral.audioEvidence,'unavailable');
assert.equal(neutral.performanceBudget,'unmeasured');
assert.equal(neutral.suggestedIntensity,neutral.baselineIntensity);
assert.equal(neutral.look.stage,'geometry');
for(const invalid of [
 audio({trackId:'another-song'}),audio({durationMs:90000}),audio({positionMs:55000}),
 audio({samples:2}),audio({smoothed:NaN}),audio({baseline:1.3}),
 audio({trend:Infinity}),audio({bass:-1}),audio({source:'fake'}),
 ]){
 const v=adaptLiveShowV1022(input({audio:invalid}));
 assert.equal(v.audioEvidence,'unavailable');
 assert.equal(v.suggestedIntensity,v.baselineIntensity);
}
for(const bad of [renderer({sampleCount:2}),renderer({available:false}),
 renderer({playing:false}),renderer({verified:false}),renderer({fps:NaN}),
 renderer({targetFps:15}),renderer({slowFrameShare:-.2})]){
 const v=adaptLiveShowV1022(input({renderer:bad}));
 assert.equal(v.performanceBudget,'unmeasured');
 assert.equal(v.rendererEvidence,'unavailable');
}
const strained=adaptLiveShowV1022(input({renderer:renderer({fps:38,slowFrameShare:.5})}));
assert.equal(strained.status,'performance-limited');
assert.equal(strained.performanceBudget,'strained');
assert(strained.suggestedIntensity<=.64);
assert.equal(strained.look.camera,'steady');
assert.equal(strained.fxDensity,'low');
const critical=adaptLiveShowV1022(input({renderer:renderer({fps:20,slowFrameShare:.7})}));
assert.equal(critical.status,'performance-limited');
assert(critical.suggestedIntensity<=.42);
assert.equal(critical.look.avatars,'hold');
assert.equal(critical.look.stage,'minimal');
assert.equal(critical.fxDensity,'minimal');
assert(critical.suggestedIntensity<=strained.suggestedIntensity);
const lyrics=adaptLiveShowV1022(input({lyricsProtected:true}));
assert.equal(lyrics.look.camera,'steady');assert.equal(lyrics.look.lights,'soft');
assert.equal(lyrics.look.lyrics,'foreground');
assert(lyrics.suggestedIntensity<=.55);
const reduced=adaptLiveShowV1022(input({reducedMotion:true}));
assert.equal(reduced.look.avatars,'hold');assert.equal(reduced.look.camera,'steady');
assert.equal(reduced.look.stage,'minimal');assert(reduced.suggestedIntensity<=.45);
const quiet=adaptLiveShowV1022(input({audio:audio({smoothed:.12,baseline:.80,trend:-.8})}));
assert(quiet.suggestedIntensity<quiet.baselineIntensity);
assert(quiet.intensityDelta>=-.121,'conservative audio downshift');
for(const [reason,extra] of [
 ['paused',{playing:false}],['disabled',{enabled:false}],['manual',{manualOverride:true}],
 ['seek',{seekBlocked:true}],['blackout',{blackout:true}],
 ['missing-evidence',{timeline:null}],
 ['missing-evidence',{trackId:'new-song'}],
 ['missing-evidence',{timeline:{...input().timeline,progressMs:30000}}],
 ]){
 const v=adaptLiveShowV1022(input(extra));
 assert.equal(v.status,'unavailable',reason);assert.equal(v.reason,reason);
 assert.equal(v.suggestedIntensity,null);
 assert.equal(v.look,null);
 assert.equal(v.rendererEvidence,'unavailable');
}
// No unintended side effects in the planner/UI. No new API, polling or device command.
for(const file of ['lib/aiLiveShowAdaptationV1022.ts',
 'components/visualizer/LiveShowAdaptationPanelV1022.tsx']){
 const s=read(file);
 for(const forbidden of ['fetch(','setInterval(','setTimeout(','localStorage','sessionStorage',
  'window.dispatchEvent','indexedDB','goveeApi','Date.now(','createPortal('])
  assert(!s.includes(forbidden),`${file} unexpectedly contains ${forbidden}`);
}
const ui=read('components/visualizer/LiveShowAdaptationPanelV1022.tsx');
const host=read('components/visualizer/LiveFxDeckV881.tsx');
for(const required of ['getConcertQualityV826','subscribeConcertQualityV826',
 'readEnergyV896','getConcertTimelineV763','adaptLiveShowV1022',
 'data-v1022-live-adaptation','Keine zusätzlichen Anfragen'])
 assert(ui.includes(required),'V1022 UI missing '+required);
assert(host.includes('<LiveShowAdaptationPanelV1022'), 'V1022 panel not in LiveFxDeck');
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
const version=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version);
assert(version&&Number(version[1])>=1022);
assert.equal(pkg.sonicFeatureRelease,`v${version[1]}`);
assert.equal(pkg.sonicRoadmapRelease,`v${version[1]}`);
assert.equal(lock.version,pkg.version);
assert.equal(lock.packages[''].version,pkg.version);
assert(pkg.scripts.prebuild.startsWith(`npm run test:v${version[1]} &&`));
assert.equal(pkg.scripts['test:v1022'],'node tests/v1022-live-show-adaptation-regression.cjs');
for(const required of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(required).includes('tests/v1022-live-show-adaptation-regression.cjs'));
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1022(root)'));
const ts=require('./typescript-loader.cjs');
for(const file of ['lib/aiLiveShowAdaptationV1022.ts','components/visualizer/LiveShowAdaptationPanelV1022.tsx'])
 assert.equal(ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,
   module:ts.ModuleKind.CommonJS}}).diagnostics.length,0,`typescript syntax ${file}`);
console.log('PASS V1022 AI Live Show Adaptation: audio, renderer, privacy, safety, CI');
