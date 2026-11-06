#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const load=require('./helpers/loader-v733.cjs')();
const {planGenreConcertV1021,genreProfileV1021,MAX_GENRE_ACTS_V1021}=load('lib/genreIntelligenceV1021');
assert.equal(MAX_GENRE_ACTS_V1021,96);
const durationMs=180000,trackId='private-genre-track',scenes=[
 {index:0,actIndex:0,section:'verse',startMs:0,endMs:32000},
 {index:1,actIndex:0,section:'verse',startMs:32000,endMs:42000},
 {index:2,actIndex:1,section:'build',startMs:42000,endMs:60000},
 {index:3,actIndex:2,section:'hook',startMs:60000,endMs:84000},
 {index:4,actIndex:3,section:'break',startMs:84000,endMs:98000},
 {index:5,actIndex:4,section:'verse',startMs:98000,endMs:125000},
 {index:6,actIndex:5,section:'drop',startMs:125000,endMs:156000},
 {index:7,actIndex:6,section:'hook',startMs:156000,endMs:180000}
];
function input(extra={}){const positionMs=extra.positionMs??25000;return {
 trackId,durationMs,positionMs,playing:true,enabled:true,genre:'Deutschrap',
 timeline:{trackId,durationMs,progressMs:positionMs,playing:true,source:'verified-v604',scenes},
 ...extra};}
for(const [name,expected] of [
 ['Deutschrap','deutschrap'],['hip-hop','deutschrap'],['German Drill','deutschrap'],
 ['Hardtekk','hardtekk'],['Hard-Tekk','hardtekk'],['Hardstyle','hardstyle'],
 ['Rawstyle','hardstyle'],['Deutschrock','deutschrock'],['NDH','deutschrock'],
 ['Industrial Metal','deutschrock'],['','other'],['Pop','other'],[null,'other']])
 assert.equal(genreProfileV1021(name),expected,String(name));
const profiles=['deutschrap','hardtekk','hardstyle','deutschrock','other'];
const outputs=profiles.map((expected,i)=>{
 const genre=['Deutschrap','Hardtekk','Hardstyle','Deutschrock','Pop'][i];
 const plan=planGenreConcertV1021(input({genre}));
 assert.equal(plan.profile,expected);assert.equal(plan.status,'verified');
 assert.equal(plan.source,'verified-v604');assert.equal(plan.acts.length,7);
 assert.equal(plan.current.ordinal,0);assert.equal(plan.next.ordinal,1);
 assert.equal(plan.current.startMs,0);assert.equal(plan.acts[0].endMs,42000,
  'two camera scenes in the same authored act are not independent sections');
 assert(plan.acts.every(a=>a.plannedIntensity>=0&&a.plannedIntensity<=1));
 assert.equal(JSON.stringify(plan),JSON.stringify(planGenreConcertV1021(input({genre}))),
  'deterministic profile');
 assert(!JSON.stringify(plan).includes(trackId),'no track id in storyboard');
 return plan;
});
assert.equal(outputs[0].current.look.camera,'close');
assert.equal(outputs[0].current.look.lyrics,'foreground');
assert.equal(outputs[1].current.look.stage,'geometry');
assert.equal(outputs[1].current.look.avatars,'footwork');
assert.equal(outputs[2].current.look.stage,'festival');
assert.equal(outputs[3].current.look.avatars,'frontline');
assert.equal(outputs[4].profileSource,'unclassified');
assert.equal(outputs[4].current.look.lights,'soft');
assert.notDeepEqual(outputs[1].acts[2].look,outputs[2].acts[2].look,
 'hardtekk and hardstyle must have different peak looks');
assert.notEqual(outputs[1].acts[2].plannedIntensity,outputs[2].acts[2].plannedIntensity);
assert.equal(planGenreConcertV1021(input({positionMs:160000})).current.phase,'finale');
assert.equal(planGenreConcertV1021(input({positionMs:160000})).next,null);
for(const profile of ['Deutschrap','Hardtekk','Hardstyle','Deutschrock','Pop']){
 const motion=planGenreConcertV1021(input({genre:profile,reducedMotion:true}));
 assert(motion.acts.every(a=>a.look.camera==='steady'&&a.look.stage==='minimal'&&
  a.look.avatars==='hold'&&a.look.lights==='soft'&&a.plannedIntensity<=.5),
  profile+' reduced motion');
 const protectedLyrics=planGenreConcertV1021(input({genre:profile,lyricsProtected:true,positionMs:65000}));
 assert.equal(protectedLyrics.current.look.camera,'steady');
 assert.equal(protectedLyrics.current.look.stage,'minimal');
 assert.equal(protectedLyrics.current.look.lights,'soft');
 assert.equal(protectedLyrics.current.look.lyrics,'foreground');
}
for(const [name,extra,reason] of [
 ['paused',{playing:false},'paused'],['disabled',{enabled:false},'disabled'],
 ['manual',{manualOverride:true},'manual'],['seek',{seekBlocked:true},'seek'],
 ['blackout',{blackout:true},'blackout'],['track',{trackId:'different'},'missing-evidence'],
 ['duration',{durationMs:90000},'missing-evidence'],
 ['stale',{timeline:{...input().timeline,progressMs:80000}},'missing-evidence'],
 ['source',{timeline:{...input().timeline,source:'unverified'}},'missing-evidence'],
 ['missing',{timeline:null},'missing-evidence'],
 ['partial',{timeline:{...input().timeline,scenes:scenes.slice(0,5)}},'incomplete-timeline']
]){
 const plan=planGenreConcertV1021(input(extra));
 assert.equal(plan.status,'unavailable',name);
 assert.equal(plan.reason,reason,name);
 assert.equal(plan.acts.length,0,name);assert.equal(plan.current,null,name);
 assert.equal(plan.next,null,name);
}
const ui=read('components/visualizer/GenreIntelligencePanelV1021.tsx');
const host=read('components/visualizer/LiveFxDeckV881.tsx');
for(const text of ['getConcertTimelineV763','readEnergyV896','planGenreConcertV1021',
 'data-v1021-genre-intelligence','Genre-Angabe, nicht akustisch erkannt',
 'Keine zusätzlichen Requests','lyricsProtected'])assert(ui.includes(text),text);
assert(host.includes('import {GenreIntelligencePanelV1021}'));
assert(host.includes('<GenreIntelligencePanelV1021 trackId={trackId} durationMs={durationMs}'));
assert(host.includes('reducedMotion={motionOff} lyricsProtected={lyricsProtected}'));
for(const p of ['lib/genreIntelligenceV1021.ts','components/visualizer/GenreIntelligencePanelV1021.tsx']){
 const src=read(p);
 for(const token of ['fetch(','setInterval(','setTimeout(','Date.now(','Math.random(',
 'localStorage','sessionStorage','window.dispatchEvent','indexedDB','goveeApi'])
  assert(!src.includes(token),p+' has unexpected side effect '+token);
}
// V1020 Windows/Linux production failure: isolated network type checks must not
// traverse all UI preferences through the large types/music.ts dependency graph.
const playbackCore=read('types/playbackCore.ts');
const sharedMusic=read('types/music.ts');
assert(sharedMusic.includes("export type {Track,Lyrics,LyricWord,LyricLine} from './playbackCore'"));
assert(read('lib/smartOfflineV1016.ts').includes("import type {Track,Lyrics} from '../types/playbackCore'"));
for(const marker of ['export interface Track','export interface LyricWord','export interface LyricLine','export interface Lyrics'])
 assert(playbackCore.includes(marker),'production canonical playback type '+marker);
assert(!playbackCore.includes('react')&&!playbackCore.includes('@/'),
 'network playback DTOs must not depend on optional UI modules');
assert(read('tests/tsconfig.v1021-network-core.json').includes('networkCoordinatorV1010.ts'));
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
const match=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version);
assert(match&&Number(match[1])>=1021);
assert.equal(pkg.sonicFeatureRelease,'v'+match[1]);
assert.equal(pkg.sonicRoadmapRelease,'v'+match[1]);
assert.equal(pkg.version,lock.version);assert.equal(pkg.version,lock.packages[''].version);
assert(pkg.scripts.prebuild.startsWith(`npm run test:v${match[1]} &&`));
assert.equal(pkg.scripts['test:v1021'],'node tests/v1021-genre-intelligence-regression.cjs');
for(const p of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(p).includes('tests/v1021-genre-intelligence-regression.cjs'),p);
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1021(root)'));
const ts=require('./typescript-loader.cjs');
for(const f of ['lib/genreIntelligenceV1021.ts',
 'components/visualizer/GenreIntelligencePanelV1021.tsx','components/visualizer/LiveFxDeckV881.tsx']){
 const result=ts.transpileModule(read(f),{fileName:f,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((result.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,'TS syntax '+f);
}
console.log('PASS V1021: 5 isolated genre profiles, verified-act-only cues, safety, lyric and reduced-motion priorities, UI and release gates');
