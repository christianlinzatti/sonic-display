'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('./typescript-loader.cjs');
const path='lib/lastfm-song-rediscovery-v861.ts';
const code=fs.readFileSync(path,'utf8');
const result=ts.transpileModule(code,{fileName:path,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
assert.equal(result.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
const mod={exports:{}};new Function('module','exports','require',result.outputText)(mod,mod.exports,()=>{throw Error('Core requires runtime dependency')});
const build=mod.exports.buildSongRediscoveryV861;
const NOW=new Date('2026-11-01T12:00:00.000Z'),DAY=86400000;
const iso=ms=>new Date(ms).toISOString();
const record=(artist,title,when)=>({artist,title,album:'Album A',cover:null,url:null,playedAt:when});
const start=Date.parse('2025-01-01T12:00:00.000Z');
const records=[
 record('Deutschrap','Track A',iso(start)),
 record('DEUTSCHRAP','Ｔｒａｃｋ   Ａ',iso(start+90*DAY)),
 record('Deutschrap','Track A',iso(start+90*DAY)), // duplicate UTC timestamp with normalized title
 record('Deutschrap','Track A',iso(start+179*DAY)), // later replay, 89 days: no second comeback
 record('Hardtekk','Track A',iso(start)), // separate artist should not collide
 record('Hardtekk','Track A',iso(start+89*DAY)),
 record('Old Rock','Old Favorite',iso(start)),
 record('Old Rock','Old Favorite',iso(start+5*DAY)), // dormant favorite
 record('One-Off','Once',iso(start)), // excluded from favorites (only one play)
 record('Back','Long Break',iso(start)),
 record('Back','Long Break',iso(start+365*DAY)),
 record('Back','Long Break',iso(start+365*DAY+1*DAY)),
];
const output=build(records,90,NOW);
assert.equal(output.events,records.length);assert.equal(output.songs,5);
assert.equal(output.comebacks.length,2);assert.equal(output.comebacks[0].artist,'Back');
assert.equal(output.comebacks.find(x=>x.artist==='Deutschrap').gapDays,90);
assert.equal(output.comebacks.find(x=>x.artist==='Deutschrap').plays,3);
assert.equal(output.comebacks.find(x=>x.artist==='Deutschrap').playsSinceReturn,2);
assert.equal(output.comebacks.find(x=>x.artist==='Back').gapDays,365);
assert.equal(output.comebacks.find(x=>x.artist==='Back').playsSinceReturn,2);
assert(!output.comebacks.some(x=>x.artist==='Hardtekk'));
assert(output.dormant.some(x=>x.artist==='Old Rock'));
assert(!output.dormant.some(x=>x.artist==='One-Off'));
assert(output.dormant.some(x=>x.artist==='Back')); // January 2026 last archived, now November 2026
const half=build(records,180,NOW);assert.equal(half.comebacks.length,1);assert.equal(half.comebacks[0].artist,'Back');
const full=build(records,365,NOW);assert.equal(full.comebacks.length,1);assert.equal(full.comebacks[0].gapDays,365);
assert.equal(build(records,1,NOW).threshold,90);
// Exact 24h boundaries, not calendar-day/DST-dependent.
const boundary=[record('Exact','X',iso(start)),record('Exact','X',iso(start+90*DAY-1))];
assert.equal(build(boundary,90,NOW).comebacks.length,0);
assert.equal(build([boundary[0],record('Exact','X',iso(start+90*DAY))],90,NOW).comebacks[0].gapDays,90);
const bad=[null,{},record('Future','X',iso(NOW.getTime()+DAY)),record('Invalid','X','2026-02-30T00:00:00.000Z'),record('','X',iso(start)),record('Bad','\n',iso(start)),record('Old','X','1999-12-31T00:00:00.000Z')];
assert.equal(build(bad,90,NOW).events,0);
assert.equal(build([],365,NOW).comebacks.length,0);assert.equal(build([],365,NOW).dormant.length,0);
const input=Object.freeze(records.map(e=>Object.freeze({...e}))),snapshot=JSON.stringify(input);build(input,90,NOW);assert.equal(JSON.stringify(input),snapshot);
const ui=fs.readFileSync('components/LastFmSongRediscoveryV861.tsx','utf8'),parent=fs.readFileSync('components/LastFmHistoryPanelV706.tsx','utf8'),home=fs.readFileSync('components/LastFmDiscoveryHomeV858.tsx','utf8'),css=fs.readFileSync('app/globals.css','utf8');
assert.equal(ts.createSourceFile('components/LastFmSongRediscoveryV861.tsx',ui,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX).parseDiagnostics.length,0);
for(const token of ['buildSongRediscoveryV861','lastfm-song-rediscovery-v861','aria-pressed','90,180,365','onOpenSong','setPage','setSearch'])assert(ui.includes(token),token);
assert(parent.includes('LastFmSongRediscoveryV861 key={`rediscovery-v861-${user}`} events={archive.events} onOpenSong={(artist,title)=>openExplorer({artist,title})}/>'));
assert(home.includes('href="#lastfm-song-rediscovery-v861"'));
assert(!/\bfetch\s*\(|localStorage|indexedDB|sessionStorage|\bwindow\./.test(ui+code),'Only read-only archive');
for(const token of ['.lastfm-rediscovery-v861','.lastfm-rediscovery-list-v861','@media(max-width:700px)','@media(prefers-reduced-motion:reduce)'])assert(css.includes(token),token);
const pkg=require('../package.json'),lock=require('../package-lock.json');assert(/^0\.1\.0-v\d+$/.test(pkg.version)&&Number(pkg.version.split('-v')[1])>=861);assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
for(const name of ['test:v861','test:v861:types','test:v861:ui-types'])assert(pkg.scripts[name],name);
for(const name of ['build:preflight','prebuild','check:fast','check:release'])assert(pkg.scripts[name].includes('npm run test:v861 && npm run test:v861:types && npm run test:v861:ui-types && npm run test:v860 &&'),name);
console.log('PASS V861: 90/180/365 exact UTC boundaries, normalized song identities, duplicates, newest returns, dormant songs, invalid data, archive immutability, no network, panel integration, quality gates');
