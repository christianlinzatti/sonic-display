#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const load=require('./helpers/loader-v733.cjs')();
const {predictConcertV1019,PREP_HORIZON_MS_V1019,IMMINENT_WINDOW_MS_V1019}=
 load('lib/predictiveConcertDirectorV1019');
assert.equal(PREP_HORIZON_MS_V1019,12000);assert.equal(IMMINENT_WINDOW_MS_V1019,3000);
const base={trackId:'song-A',durationMs:180000,positionMs:39000,playing:true,genre:'Deutschrap',enabled:true};
const timeline={trackId:'song-A',durationMs:180000,progressMs:39000,playing:true,source:'verified-v604',scenes:[
 {index:0,actIndex:0,section:'verse',intent:'portrait',startMs:0,endMs:50000},
 {index:1,actIndex:1,section:'hook',intent:'wide',startMs:50000,endMs:95000},
 {index:2,actIndex:2,section:'drop',intent:'pulse',startMs:95000,endMs:120000}
]};
const audio={trackId:'song-A',durationMs:180000,positionMs:38900,samples:10,smoothed:.67,
 baseline:.5,trend:.16,bass:.9,pulse:.5,source:'live-normalized-audio'};
const input={...base,timeline,audio};
let plan=predictConcertV1019(input);
assert.equal(plan.phase,'prepare');assert.equal(plan.nextSection,'hook');assert.equal(plan.nextStartMs,50000);
assert.equal(plan.etaMs,11000);assert.equal(plan.evidence,'verified-v604');assert.equal(plan.preview.length,4);
assert.equal(Array.from(plan.preview,x=>x.channel).join(','),'camera,stage,avatars,lights');
assert.equal(plan.audioMeasured,true);
// A V761 cinematic scene split inside one authored act is not a new verse/drop.
const split={...timeline,scenes:[
 {index:0,actIndex:0,section:'verse',intent:'portrait',startMs:0,endMs:25000},
 {index:1,actIndex:0,section:'verse',intent:'wide',startMs:25000,endMs:50000},
 {index:2,actIndex:1,section:'hook',intent:'ensemble',startMs:50000,endMs:95000},
 {index:3,actIndex:2,section:'drop',intent:'pulse',startMs:95000,endMs:120000}
]};
const splitPlan=predictConcertV1019({...input,timeline:split});
assert.equal(splitPlan.nextSection,'hook','skip internal camera scenes in the same verified act');
assert.equal(splitPlan.nextStartMs,50000);

plan=predictConcertV1019({...input,positionMs:48000,timeline:{...timeline,progressMs:48000},audio:null});
assert.equal(plan.phase,'imminent');assert.equal(plan.etaMs,2000);assert.equal(plan.audioMeasured,false);
plan=predictConcertV1019({...input,positionMs:25000,timeline:{...timeline,progressMs:25000},audio:null});
assert.equal(plan.phase,'standby');assert.equal(plan.preview.length,0);
// No timer, no speculative 429/AI network request, no special event triggered at the boundary.
plan=predictConcertV1019({...input,positionMs:50000,timeline:{...timeline,progressMs:50000},audio:null});
assert.equal(plan.phase,'standby');assert.equal(plan.nextSection,'drop');
for(const [label,changes,reason] of [
 ['pause',{playing:false},'paused'],['disabled',{enabled:false},'disabled'],
 ['manual',{manualOverride:true},'manual'],['seek',{seekBlocked:true},'seek'],
 ['blackout',{blackout:true},'blackout'],['other-track',{trackId:'other'},'missing-evidence'],
 ['other-duration',{durationMs:90000},'missing-evidence'],
 ['stale-timeline',{timeline:{...timeline,progressMs:60000}},'missing-evidence'],
 ['invalid-source',{timeline:{...timeline,source:'unavailable'}},'missing-evidence'],
 ['malformed',{timeline:{...timeline,scenes:[...timeline.scenes.slice(0,1),
   {...timeline.scenes[1],startMs:35000},timeline.scenes[2]]}},'missing-evidence']
]){
 const s=predictConcertV1019({...input,...changes});
 assert.equal(s.phase,'unavailable',label);assert.equal(s.reason,reason,label);
 assert.equal(s.preview.length,0,label);assert.equal(s.etaMs,null,label);
}
plan=predictConcertV1019({...input,reducedMotion:true});
assert.equal(plan.phase,'prepare');assert.equal(Array.from(plan.preview,x=>x.look).join(','),
 'stable-shot,minimal,rest,soft-wash','reduced motion disables aggressive suggestions');
// Gap or last section cannot fabricate a new section or prepare a cue.
let inGap={...input,positionMs:130000,timeline:{...timeline,progressMs:130000},audio:null};
assert.equal(predictConcertV1019(inGap).phase,'unavailable');
let last={...input,positionMs:114000,timeline:{...timeline,progressMs:114000},audio:null};
assert.equal(predictConcertV1019(last).reason,'no-next-section');
// Single next boundary even with hostile intent strings: not echoed to the UI.
plan=predictConcertV1019({...input,timeline:{...timeline,scenes:timeline.scenes.map((s,n)=>n===1?{...s,intent:'<script>alert(1)</script>'}:s)}});
assert(!JSON.stringify(plan).includes('<script>'));
const host=read('components/visualizer/LiveFxDeckV881.tsx'),panel=read('components/visualizer/PredictiveConcertPanelV1019.tsx');
assert(host.includes('<PredictiveConcertPanelV1019 trackId={trackId} durationMs={durationMs}'));
for(const needle of ['getConcertTimelineV763','readEnergyV896','predictConcertV1019','data-v1019-predictive-director','Keine gültige bevorstehende Songpassage'])assert(panel.includes(needle),needle);
for(const file of ['lib/predictiveConcertDirectorV1019.ts','components/visualizer/PredictiveConcertPanelV1019.tsx']){
 const source=read(file);
 for(const banned of ['fetch(','localStorage','sessionStorage','indexedDB','setInterval(','setTimeout(','window.dispatchEvent','goveeApi','api/spotify','Date.now('])
  assert(!source.includes(banned),'V1019 must be pure/read-only: '+file+' '+banned);
}
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
const version=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version);
assert(version&&Number(version[1])>=1019);
assert.equal(pkg.sonicFeatureRelease,'v'+version[1]);assert.equal(pkg.sonicRoadmapRelease,'v'+version[1]);
assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
assert(pkg.scripts.prebuild.startsWith(`npm run test:v${version[1]} &&`));
assert.equal(pkg.scripts['test:v1019'],'node tests/v1019-predictive-concert-regression.cjs');
for(const file of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])assert(read(file).includes('tests/v1019-predictive-concert-regression.cjs'));
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1019(root)'));
const ts=require('./typescript-loader.cjs');
for(const file of ['lib/predictiveConcertDirectorV1019.ts','components/visualizer/PredictiveConcertPanelV1019.tsx','components/visualizer/LiveFxDeckV881.tsx']){
 const result=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((result.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,'TS source '+file);
}
console.log('PASS V1019: verified timeline pre-cues, timing, pause, seek, manual, blackout, reduced motion, no invented markers or device calls, CI wiring');
