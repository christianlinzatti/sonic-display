#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');const read=x=>fs.readFileSync(path.join(root,x),'utf8');
const load=require('./helpers/loader-v733.cjs')();
const {understandSongV1018,genreDirectionV1018}=load('lib/songUnderstandingV1018');
const base={trackId:'song-A',durationMs:180000,positionMs:62000,playing:true,genre:'Deutschrap'};
const audio={trackId:'song-A',durationMs:180000,positionMs:61800,samples:11,
 smoothed:.82,baseline:.55,trend:.21,bass:.73,pulse:.5,source:'live-normalized-audio'};
const timeline={trackId:'song-A',durationMs:180000,progressMs:61800,playing:true,source:'verified-v604',scenes:[
 {index:0,actIndex:0,section:'verse',intent:'portrait',startMs:0,endMs:50000},
 {index:1,actIndex:1,section:'hook',intent:'wide',startMs:50000,endMs:95000},
 {index:2,actIndex:2,section:'drop',intent:'pulse',startMs:95000,endMs:125000}
]};
const both=understandSongV1018({...base,audio,timeline});
assert.equal(both.source,'measured-and-verified');assert.equal(both.section,'hook');
assert.equal(both.sectionStartMs,50000);assert.equal(both.sectionEndMs,95000);
assert.equal(both.nextSection,'drop');assert.equal(both.energy,.82);assert.equal(both.bass,.73);
assert.equal(both.feel,'rising');assert.equal(both.genreDirection,'rap');
assert.equal(both.rapVocalVerified,false,'genre metadata cannot verify vocals');
assert.equal(both.measuredBpm,null,'no invented BPM');
assert.equal(understandSongV1018({...base,audio:null,timeline}).source,'verified-timeline');
assert.equal(understandSongV1018({...base,audio,timeline:null}).source,'measured-audio');
const none=understandSongV1018({...base,audio:null,timeline:null});
assert.equal(none.source,'unavailable');assert.equal(none.section,null);assert.equal(none.energy,null);
assert.equal(understandSongV1018({...base,playing:false,audio,timeline}).source,'unavailable');
for(const bad of [
 {...audio,trackId:'other'}, {...audio,positionMs:50000}, {...audio,samples:2},
 {...audio,smoothed:NaN},{...audio,bass:1.8},{...audio,source:'metadata-only'},
 {...audio,trend:Infinity}, {...audio,durationMs:100000}
])assert.equal(understandSongV1018({...base,audio:bad,timeline:null}).measuredAudio,false,'reject invalid/foreign/stale audio');
for(const bad of [
 {...timeline,trackId:'other'}, {...timeline,source:'unavailable'}, {...timeline,playing:false},
 {...timeline,progressMs:100000}, {...timeline,durationMs:155000},
 {...timeline,scenes:timeline.scenes.map((s,n)=>n===1?{...s,section:'adlib'}:s)},
 {...timeline,scenes:timeline.scenes.map((s,n)=>n===1?{...s,index:22}:s)},
 {...timeline,scenes:timeline.scenes.map((s,n)=>n===1?{...s,startMs:30000}:s)}
])assert.equal(understandSongV1018({...base,timeline:bad,audio:null}).verifiedSection,false,'reject invalid/mismatched timeline');
assert.equal(understandSongV1018({...base,positionMs:160000,timeline,audio:null}).section,null,'never invent a section in a gap');
for(const [genre,direction] of [['Hardtekk','hard-dance'],['Hardstyle','hard-dance'],['Deutschrock','rock'],['Industrial Metal','rock'],['Hip-Hop','rap'],['Ambient','other']])
 assert.equal(genreDirectionV1018(genre),direction);
const ui=read('components/visualizer/SongUnderstandingPanelV1018.tsx');
const host=read('components/visualizer/LiveFxDeckV881.tsx');
for(const x of ['readEnergyV896','getConcertTimelineV763','understandSongV1018','Keine bestätigte Passage','data-v1018-song-understanding'])assert(ui.includes(x),x);
assert(host.includes('<SongUnderstandingPanelV1018 trackId={trackId} durationMs={durationMs}'));
for(const file of ['lib/songUnderstandingV1018.ts','components/visualizer/SongUnderstandingPanelV1018.tsx']){
 const source=read(file);for(const banned of ['localStorage','sessionStorage','indexedDB','fetch(','setInterval(','new AudioContext(','window.dispatchEvent','govee'])
  assert(!source.includes(banned),'Pure local visual interpretation: '+file+' '+banned);
}
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
const v=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version);
assert(v&&Number(v[1])>=1018);assert.equal(pkg.sonicFeatureRelease,'v'+v[1]);assert.equal(pkg.sonicRoadmapRelease,'v'+v[1]);
assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
assert(pkg.scripts.prebuild.startsWith(`npm run test:v${v[1]} &&`));
assert.equal(pkg.scripts['test:v1018'],'node tests/v1018-song-understanding-regression.cjs');
for(const file of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])assert(read(file).includes('tests/v1018-song-understanding-regression.cjs'));
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1018(root)'));
const ts=require('./typescript-loader.cjs');
for(const file of ['lib/songUnderstandingV1018.ts','components/visualizer/SongUnderstandingPanelV1018.tsx','components/visualizer/LiveFxDeckV881.tsx']){
 const output=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((output.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,'TS syntax '+file);
}
console.log('PASS V1018: verified sections, measured audio, bounded evidence, track/seek/pause safety, metadata-only genre, UI wiring, no hardware/network, CI routing');
