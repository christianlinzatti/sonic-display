#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const load=require('./helpers/loader-v733.cjs')();
const {buildConcertStoryV1020,MAX_STORY_ACTS_V1020}=load('lib/aiConcertStorytellingV1020');
assert.equal(MAX_STORY_ACTS_V1020,96);
const durationMs=180000, trackId='a-private-song';
const scenes=[
 {index:0,actIndex:0,section:'verse',intent:'intro',startMs:0,endMs:18000},
 {index:1,actIndex:0,section:'verse',intent:'different-camera',startMs:18000,endMs:36000},
 {index:2,actIndex:1,section:'build',intent:'build',startMs:36000,endMs:58000},
 {index:3,actIndex:2,section:'hook',intent:'hook-1',startMs:58000,endMs:83000},
 {index:4,actIndex:3,section:'break',intent:'break',startMs:83000,endMs:95000},
 {index:5,actIndex:4,section:'verse',intent:'rap',startMs:95000,endMs:128000},
 {index:6,actIndex:5,section:'drop',intent:'drop',startMs:128000,endMs:154000},
 {index:7,actIndex:6,section:'hook',intent:'final',startMs:154000,endMs:180000}
];
function make(extra={}){
 const positionMs=extra.positionMs??26000;
 return {trackId,durationMs,positionMs,playing:true,genre:'Deutschrap',enabled:true,
  timeline:{trackId,durationMs,progressMs:positionMs,playing:true,source:'verified-v604',scenes},
  ...extra};
}
let story=buildConcertStoryV1020(make());
assert.equal(story.status,'verified');assert.equal(story.source,'verified-v604');
assert.equal(story.acts.length,7,'camera scenes are not new sections');
assert.deepEqual(Array.from(story.acts,a=>a.phase),['opening','build','peak','breather','focus','peak','finale']);
assert.equal(story.acts[0].endMs,36000);assert.equal(story.currentOrdinal,0);
assert.equal(story.nextOrdinal,1);assert.equal(story.next?.section,'build');
assert.equal(story.genreDirection,'rap');assert.equal(story.measuredAudio,false);
assert(story.acts.every(a=>a.intendedIntensity>=0&&a.intendedIntensity<=1));
assert(story.acts[6].intendedIntensity>story.acts[5].intendedIntensity);
assert.equal(story.acts[6].look.stage,'finale');
assert(story.acts[2].look.camera!==story.acts[5].look.camera,'successive peaks get different shots');
assert(!JSON.stringify(story).includes('a-private-song'),'no title / account / track information leaked in the storyboard');
// Transition and end-of-song progression; must be deterministic for identical inputs.
story=buildConcertStoryV1020(make({positionMs:161000}));
assert.equal(story.current?.phase,'finale');assert.equal(story.next,null);
assert(story.progression>.89&&story.progression<1);
assert.equal(JSON.stringify(story),JSON.stringify(buildConcertStoryV1020(make({positionMs:161000}))));
// Reduced motion affects looks only; never changes verified structure.
const low=buildConcertStoryV1020(make({reducedMotion:true}));
assert.equal(low.status,'verified');assert.equal(low.acts.length,7);
assert(low.acts.every(a=>a.look.camera==='steady'&&a.look.stage==='minimal'&&a.look.avatars==='hold'));
for(const [label,extra,reason] of [
 ['paused',{playing:false},'paused'],['disabled',{enabled:false},'disabled'],
 ['manual',{manualOverride:true},'manual'],['seeking',{seekBlocked:true},'seek'],
 ['blackout',{blackout:true},'blackout'],['wrong-track',{trackId:'another-song'},'missing-evidence'],
 ['wrong-duration',{durationMs:120000},'missing-evidence'],
 ['stale', {timeline:{...make().timeline,progressMs:90000}},'missing-evidence'],
 ['unverified', {timeline:{...make().timeline,source:'unavailable'}},'missing-evidence'],
 ['missing', {timeline:null},'missing-evidence'],
 ['bad-marker', {timeline:{...make().timeline,scenes:scenes.map((s,i)=>i===2?{...s,section:'untrusted'}:s)}},'missing-evidence'],
 ['out-of-order',{timeline:{...make().timeline,scenes:scenes.map((s,i)=>i===3?{...s,startMs:52000}:s)}},'missing-evidence'],
 ['incomplete-start',{timeline:{...make().timeline,scenes:scenes.map(s=>({...s,startMs:s.startMs+5000,endMs:s.endMs+5000})).filter(s=>s.endMs<=180000)}},'incomplete-timeline']
]){
 const v=buildConcertStoryV1020(make(extra));
 assert.equal(v.status,'unavailable',label);assert.equal(v.reason,reason,label);
 assert.equal(v.acts.length,0,label);assert.equal(v.current,null,label);
}
const partial=make({timeline:{...make().timeline,scenes:scenes.slice(0,6)}});
assert.equal(buildConcertStoryV1020(partial).reason,'incomplete-timeline');
const gapScenes=scenes.map((s,i)=>i===7?{...s,startMs:156000}:s);
const gapStory=buildConcertStoryV1020(make({timeline:{...make().timeline,scenes:gapScenes}}));
assert.equal(gapStory.status,'verified','gaps between acts are not fabricated');
const reused=scenes.map((s,i)=>i===6?{...s,actIndex:1}:s);
assert.equal(buildConcertStoryV1020(make({timeline:{...make().timeline,scenes:reused}})).reason,'invalid-acts');
const inconsistent=scenes.map((s,i)=>i===1?{...s,section:'hook'}:s);
assert.equal(buildConcertStoryV1020(make({timeline:{...make().timeline,scenes:inconsistent}})).reason,'invalid-acts');
const short=[scenes[0],{...scenes[1],actIndex:1,section:'hook',endMs:180000}];
assert.equal(buildConcertStoryV1020(make({timeline:{...make().timeline,scenes:short}})).reason,'incomplete-timeline',
 'only two acts cannot certify a whole-song narrative');
const noFinale=scenes.map((s,i)=>i===7?{...s,section:'verse'}:s);
const v=buildConcertStoryV1020(make({timeline:{...make().timeline,scenes:noFinale}}));
assert.equal(v.status,'verified');assert.notEqual(v.acts.at(-1).phase,'finale');
const ui=read('components/visualizer/ConcertStorytellingPanelV1020.tsx');
const host=read('components/visualizer/LiveFxDeckV881.tsx');
for(const token of ['getConcertTimelineV763','readEnergyV896','buildConcertStoryV1020',
 'data-v1020-concert-storytelling','Nur Planung aus verifizierter Timeline','geplante Intensität'])
 assert(ui.includes(token),token);
assert(host.includes('<ConcertStorytellingPanelV1020 trackId={trackId} durationMs={durationMs}'));
for(const file of ['lib/aiConcertStorytellingV1020.ts','components/visualizer/ConcertStorytellingPanelV1020.tsx']){
 const src=read(file);
 for(const forbidden of ['fetch(','setInterval(','setTimeout(','Date.now(','localStorage','sessionStorage',
  'window.dispatchEvent','indexedDB','goveeApi'])
  assert(!src.includes(forbidden),'read-only/no extra side effects '+file+' '+forbidden);
}
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
const release=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version);
assert(release&&Number(release[1])>=1020);assert.equal(pkg.sonicFeatureRelease,'v'+release[1]);
assert.equal(pkg.sonicRoadmapRelease,'v'+release[1]);
assert.equal(pkg.version,lock.version);assert.equal(pkg.version,lock.packages[''].version);
assert(pkg.scripts.prebuild.startsWith(`npm run test:v${release[1]} &&`));
assert.equal(pkg.scripts['test:v1020'],'node tests/v1020-concert-storytelling-regression.cjs');
for(const file of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(file).includes('tests/v1020-concert-storytelling-regression.cjs'));
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1020(root)'));
const ts=require('./typescript-loader.cjs');
for(const file of ['lib/aiConcertStorytellingV1020.ts','components/visualizer/ConcertStorytellingPanelV1020.tsx',
 'components/visualizer/LiveFxDeckV881.tsx']){
 const result=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((result.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,'TS syntax '+file);
}
console.log('PASS V1020: verified dramatic arc, act grouping, genre looks, finale evidence, seek/pause/manual/blackout safety, CI, no network/hardware');
