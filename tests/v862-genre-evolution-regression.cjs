'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('./typescript-loader.cjs');
const file='lib/lastfm-genre-evolution-v862.ts',src=fs.readFileSync(file,'utf8');
const parsed=ts.transpileModule(src,{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
assert.equal(parsed.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
const pkgExports={};new Function('exports','require',parsed.outputText)(pkgExports,()=>{throw Error('Core may only have erased imports');});
const {buildGenreEvolutionV862:build,genreChangeV862:diff,genreTrackKeyV862:key,V862_MAX_LOOKUPS:limit}=pkgExports;
assert.equal(limit,72);assert.equal(key('ＫＡ',' TEST  Song '),key('ka','test song'));
const now=new Date('2026-11-01T12:00:00.000Z');
const play=(artist,title,date)=>({artist,title,album:'Example',playedAt:date,cover:null,url:null});
const history=[
 ...Array.from({length:11},(_,i)=>play('Deutschrap','RapTrack',`2025-01-${String(i+1).padStart(2,'0')}T10:00:00.000Z`)),
 ...Array.from({length:10},(_,i)=>play('Hardtekk','Track T',`2025-01-${String(i+1).padStart(2,'0')}T11:00:00.000Z`)),
 play('Old','Track','2017-03-22T10:00:00.000Z'),
 play('UTC','Boundary','2026-10-31T23:30:00.000Z'),
 play('Bad','Future','2026-12-01T00:00:00.000Z'),
 play('Bad','Invalid','2026-02-30T00:00:00.000Z'),
 play('Bad','Too Old','1999-01-01T00:00:00.000Z'),null,{},
];
const valid=new Map([
 [key('Deutschrap','RapTrack'),{genre:'deutschrap',source:'track',matchedTag:'german rap',confidence:80}],
 [key('Hardtekk','Track T'),{genre:'hardtekk',source:'artist',matchedTag:'hardtekk',confidence:50}],
 [key('UTC','Boundary'),{genre:'rock',source:'track',matchedTag:'Titel/Interpret',confidence:99}],
 [key('Old','Track'),{genre:'rock',source:'track',matchedTag:'rock',confidence:74}],
]);
const years=build(history,valid,'years',now,'UTC');
assert.equal(years.buckets.length,10);assert.equal(years.buckets[0].period,'2017');assert.equal(years.buckets[9].period,'2026');
assert.equal(years.buckets.find(x=>x.period==='2025').total,21);
assert.equal(years.buckets.find(x=>x.period==='2025').covered,21);
assert.equal(years.buckets.find(x=>x.period==='2025').trackBased,11);
assert.equal(years.buckets.find(x=>x.period==='2025').artistBased,10);
assert.equal(years.buckets.find(x=>x.period==='2025').genres[0].plays,11);
assert.equal(years.buckets.find(x=>x.period==='2026').total,1);
assert.equal(years.buckets.find(x=>x.period==='2026').covered,0,'Title-derived guess excluded');
assert.equal(years.total,23);assert.equal(years.covered,22);
assert.equal(years.genres.find(x=>x.genre==='rock').plays,1);
assert(years.samples.length<=limit);
const monthlyVienna=build(history,valid,'months',now,'Europe/Vienna');
const monthlyUTC=build(history,valid,'months',now,'UTC');
assert.equal(monthlyVienna.buckets.length,24);assert.equal(monthlyUTC.buckets.length,24);
assert.equal(monthlyVienna.buckets.at(-1).period,'2026-11');assert.equal(monthlyUTC.buckets.at(-1).period,'2026-11');
assert.equal(monthlyVienna.buckets.at(-1).total,1);
assert.equal(monthlyUTC.buckets.at(-1).total,0,'DST boundary stays October in UTC');
assert.equal(monthlyUTC.buckets.find(x=>x.period==='2025-01').total,21);
assert.equal(monthlyUTC.buckets.find(x=>x.period==='2025-01').covered,21);
assert(!monthlyUTC.samples.some(s=>s.key===key('Bad','Future')));
assert.equal(build([],new Map(),'months',now,'UTC').total,0);
assert.equal(build(history,new Map(),'months',now,'UTC').covered,0);
assert.equal(build(history,new Map(),'nonsense',now,'UTC').mode,'months');
assert.equal(diff(undefined,years.buckets[0],'rock'),null);
assert.equal(diff(years.buckets[0],years.buckets[1],'rock'),null,'Min coverage gate');
assert.equal(diff({total:20,covered:10,genres:[{genre:'rock',plays:4}]},{total:30,covered:12,genres:[{genre:'rock',plays:9}]},'rock').percentagePoints,35);
assert.equal(diff({total:100,covered:10,genres:[]},{total:30,covered:12,genres:[]},'rock'),null,'Low coverage gate');
const huge=Array.from({length:200},(_,i)=>play(`Band${i}`,`Track${i}`,`2026-10-${String(i%28+1).padStart(2,'0')}T12:00:00.000Z`));
assert(build(huge,new Map(),'months',now,'UTC').samples.length<=3);
const immutable=Object.freeze(history.map(x=>x&&Object.freeze({...x}))),old=JSON.stringify(immutable);build(immutable,valid,'years',now,'UTC');assert.equal(JSON.stringify(immutable),old);
const ui=fs.readFileSync('components/LastFmGenreEvolutionV862.tsx','utf8');
const parent=fs.readFileSync('components/LastFmHistoryPanelV706.tsx','utf8');
const home=fs.readFileSync('components/LastFmDiscoveryHomeV858.tsx','utf8');
const css=fs.readFileSync('app/globals.css','utf8');
for(const path of ['components/LastFmGenreEvolutionV862.tsx','components/LastFmHistoryPanelV706.tsx'])assert.equal(ts.createSourceFile(path,fs.readFileSync(path,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX).parseDiagnostics.length,0);
for(const text of ['async function enrich()','onClick={()=>{void enrich();}}','Math.min(3,pending.length)','validateGenreResponseV857','AbortController','disabled={busy}','aria-pressed','24 Monate','10 Jahre'])assert(ui.includes(text),text);
assert(!/\bfetch\s*\(|localStorage|indexedDB|sessionStorage/.test(src),'Core is pure');
assert(parent.includes('<LastFmGenreEvolutionV862 key={`genre-evolution-v862-${user}`} events={archive.events}/>'),'Account scoped UI');
assert(home.includes('href="#lastfm-genre-evolution-v862"'));
for(const token of ['.lastfm-genre-evolution-v862','.lastfm-genre-periods-v862','@media(max-width:720px)','@media(prefers-reduced-motion:reduce)'])assert(css.includes(token),token);
const pkg=require('../package.json'),lock=require('../package-lock.json');assert(/^0\.1\.0-v\d+$/.test(pkg.version)&&Number(pkg.version.split('-v')[1])>=862);assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
for(const script of ['test:v862','test:v862:types','test:v862:ui-types'])assert(pkg.scripts[script],script);
for(const script of ['build:preflight','prebuild','check:fast','check:release'])assert(pkg.scripts[script].includes('npm run test:v862 && npm run test:v862:types && npm run test:v862:ui-types && npm run test:v861 &&'),script);
console.log('PASS V862: 24-month/10-year trends, evidence-only tags, local DST month, bounded sampling, unknown genres, coverage and confidence gates, read-only privacy, opt-in API and release integration');
