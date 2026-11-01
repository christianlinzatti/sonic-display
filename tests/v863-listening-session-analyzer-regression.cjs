'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('./typescript-loader.cjs');
const path='lib/lastfm-listening-sessions-v863.ts',code=fs.readFileSync(path,'utf8');
const compiled=ts.transpileModule(code,{fileName:path,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
assert.equal(compiled.diagnostics.filter(x=>x.category===ts.DiagnosticCategory.Error).length,0);
const exportsV863={};new Function('exports','require',compiled.outputText)(exportsV863,()=>{throw Error('Core must contain erased type imports only');});
const build=exportsV863.buildListeningSessionsV863;
const play=(artist,title,playedAt)=>({artist,title,album:'Album',playedAt,url:null,cover:null});
const now=new Date('2026-11-01T18:00:00.000Z');
const history=[
 play('Artist A','First','2026-10-31T23:30:00.000Z'), // November, 00:30 in Vienna
 play('ARTIST A','Second','2026-10-31T23:50:00.000Z'),
 play('Artist B','Third','2026-11-01T00:20:00.000Z'),
 play('Artist C','Fourth','2026-11-01T01:21:00.000Z'), // new group after >60 minutes
 play('Artist C','Fifth','2026-11-01T01:41:00.000Z'),
 play('Artist C','Fifth','2026-11-01T01:41:00.000Z'), // exact duplicate
 play('Lonely','Alone','2026-11-01T03:00:00.000Z'),
 play('Future','NotYet','2026-12-01T03:00:00.000Z'),
 play('Invalid','Impossible','2026-02-30T03:00:00.000Z'),
 null,{},
 ];
const r30=build(history,{gap:30,range:'all',zone:'Europe/Vienna',now});
assert.equal(r30.total,6);
assert.equal(r30.sessionCount,2);assert.equal(r30.singletons,1);assert.equal(r30.sessionScrobbles,5);
assert.equal(r30.averageSpanMinutes,35);assert.equal(r30.longestSpanMinutes,50);
assert.equal(r30.sessions[0].scrobbles,2);assert.equal(r30.sessions[1].scrobbles,3);
assert.equal(r30.sessions[1].day,'2026-11-01');assert.equal(r30.sessions[1].daypart,'night');
assert.equal(r30.dayparts.find(x=>x.key==='night').plays,6);
assert.equal(r30.hours[0].plays,2);assert.equal(r30.hours[1].plays,1);assert.equal(r30.hours[2].plays,2);assert.equal(r30.hours[4].plays,1);
assert.equal(r30.weekdays.find(x=>x.day===0).plays,6);
const r20=build(history,{gap:20,range:'all',zone:'UTC',now});
assert.equal(r20.sessionCount,2,'The 30-minute gap splits an exact 20-minute session');
assert.equal(r20.singletons,2);assert.equal(r20.sessionScrobbles,4);
assert.equal(r20.sessions[1].scrobbles,2);
const r60=build(history,{gap:60,range:'all',zone:'UTC',now});assert.equal(r60.sessionCount,2);assert.equal(r60.singletons,1);
const r90=build(history,{gap:30,range:90,zone:'UTC',now});assert.equal(r90.total,6);
const ancient=build([play('Older','Track','2025-01-01T12:00:00.000Z'),...history],{range:30,now});assert.equal(ancient.total,6);
const blank=build([],{now});assert.equal(blank.total,0);assert.equal(blank.averageSpanMinutes,0);assert.equal(blank.dayparts.every(p=>p.topArtist===null),true);
const midnight=build([play('X','S','2026-10-31T23:30:00.000Z'),play('X','T','2026-10-31T23:50:00.000Z')],{now,zone:'UTC'});
assert.equal(midnight.sessions[0].day,'2026-10-31');assert.equal(r30.sessions[1].day,'2026-11-01');
const dst=build([play('A','A','2026-03-29T00:30:00.000Z'),play('A','B','2026-03-29T01:00:00.000Z')],{range:'all',now,zone:'Europe/Vienna'});
assert.equal(dst.sessionCount,1);assert.equal(dst.sessions[0].spanMinutes,30);assert.equal(dst.hours[1].plays,1);assert.equal(dst.hours[3].plays,1);
const frozen=Object.freeze(history.map(x=>x&&Object.freeze({...x})));const snapshot=JSON.stringify(frozen);build(frozen,{range:'all',now});assert.equal(JSON.stringify(frozen),snapshot);
assert.equal(build(history,{gap:999,range:999,zone:'Mars',now}).gapMinutes,30);assert.equal(build(history,{gap:999,range:999,zone:'Mars',now}).zone,'Europe/Vienna');
const uiPath='components/LastFmListeningSessionAnalyzerV863.tsx',ui=fs.readFileSync(uiPath,'utf8'),parent=fs.readFileSync('components/LastFmHistoryPanelV706.tsx','utf8'),home=fs.readFileSync('components/LastFmDiscoveryHomeV858.tsx','utf8'),css=fs.readFileSync('app/globals.css','utf8');
assert.equal(ts.createSourceFile(uiPath,ui,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX).parseDiagnostics.length,0);
for(const phrase of ['buildListeningSessionsV863','20,30,60','30,90,365','onOpenArtist','onOpenSong','aria-pressed','Hörzeit','lastfm-listening-sessions-v863'])assert(ui.includes(phrase),phrase);
assert(!/\bfetch\s*\(|\blocalStorage\b|\bindexedDB\b|sessionStorage/.test(ui+code),'No new calls or persistence');
assert(parent.includes('<LastFmListeningSessionAnalyzerV863 key={`sessions-v863-${user}`} events={archive.events}'),'Account-scoped integration');
assert(home.includes('href="#lastfm-listening-sessions-v863"'));
for(const phrase of ['.lastfm-sessions-v863','.lastfm-sessions-stats-v863','@media(max-width:740px)','@media(prefers-reduced-motion:reduce)'])assert(css.includes(phrase),phrase);
const pkg=require('../package.json'),lock=require('../package-lock.json');assert(/^0\.1\.0-v\d+$/.test(pkg.version)&&Number(pkg.version.split('-v')[1])>=863);assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
for(const script of ['test:v863','test:v863:types','test:v863:ui-types'])assert(pkg.scripts[script]);
for(const script of ['build:preflight','prebuild','check:fast','check:release'])assert(pkg.scripts[script].includes('npm run test:v863 && npm run test:v863:types && npm run test:v863:ui-types && npm run test:v862 &&'),script);
console.log('PASS V863: bounded scrobble grouping, exact time gaps, DST Vienna, UTC, dayparts, artists, duplicate protection, range filters, read-only archive, navigation and release integration');
