'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('./typescript-loader.cjs');
const file='lib/lastfm-artist-deep-dive-v860.ts';
const src=fs.readFileSync(file,'utf8');
const transpiled=ts.transpileModule(src,{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
assert.equal(transpiled.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
const mod={exports:{}};new Function('module','exports','require',transpiled.outputText)(mod,mod.exports,()=>{throw Error('core must use only type imports')});
const build=mod.exports.buildArtistDeepDiveV860;
const NOW=new Date('2026-11-20T12:00:00.000Z');
const e=(artist,title,album,at,cover=null)=>({artist,title,album,playedAt:at,url:null,cover});
const events=[
 e('Rap Artist','Track A','Album A','2022-03-01T08:00:00.000Z'),e('RAP  ARTIST','track a','Album A','2022-03-01T09:00:00.000Z'),
 e('Rap Artist','Track B','Album B','2024-04-01T09:00:00.000Z'),e('Ｒａｐ Artist','Track A','Album A','2024-04-01T10:00:00.000Z'),
 e('Rap Artist','Unreleased','Album unbekannt','2026-10-31T23:30:00.000Z'),e('Rap Artist','Track A','Album A','2026-11-01T10:00:00.000Z'),
 e('Other Artist','Other','Other Album','2022-03-01T10:00:00.000Z'),e('Other Artist','Other','Other Album','2024-04-01T11:00:00.000Z'),
 e('Other Artist','Other','Other Album','2026-11-01T11:00:00.000Z')];
const all=build(events,'Rap Artist',null,NOW,'UTC');
assert.equal(all.total,9);assert.equal(all.artists.length,2);
assert.equal(all.profile.plays,6);assert.equal(all.profile.uniqueSongs,3);assert.equal(all.profile.uniqueAlbums,2);assert.equal(all.profile.unassignedAlbumPlays,1);
assert.equal(all.profile.first,'2022-03-01T08:00:00.000Z');assert.equal(all.profile.last,'2026-11-01T10:00:00.000Z');
assert.equal(all.profile.years.length,5);assert.equal(all.profile.years.find(v=>v.year===2023).plays,0);assert.equal(all.profile.years.find(v=>v.year===2024).share,2/3);
assert.equal(all.profile.peakYear,2022);assert.equal(all.profile.peakYearPlays,2); // 2022, 2024, 2026 tie => earliest
assert.equal(all.profile.songs[0].plays,4);assert.equal(all.profile.songs[0].title,'Track A');assert.equal(all.profile.albums[0].plays,4);
const year=build(events,'RAP ARTIST',2026,NOW,'UTC');assert.equal(year.profile.selectedYear,2026);assert.equal(year.profile.yearSongs.length,2);assert.equal(year.profile.yearAlbums.length,1);assert.equal(year.profile.yearAlbums[0].plays,1);
const gap=build(events,'Rap Artist',2023,NOW,'UTC');assert.equal(gap.profile.selectedYear,2023);assert.equal(gap.profile.yearSongs.length,0);
const invalidYear=build(events,'Rap Artist',3000,NOW,'UTC');assert.equal(invalidYear.profile.selectedYear,null);
const missing=build(events,'Unheard Artist',null,NOW,'UTC');assert(missing.profile&&missing.profile.artist); // fallback to first by plays
const empty=build([],null,null,NOW);assert.equal(empty.profile,null);assert.equal(empty.total,0);
const vienna=build([e('Time','Time','A','2026-10-31T23:30:00.000Z')],null,null,NOW,'Europe/Vienna');
assert.equal(vienna.profile.firstMonth,'2026-11');assert.equal(build([e('Time','Time','A','2026-10-31T23:30:00.000Z')],null,null,NOW,'UTC').profile.firstMonth,'2026-10');
const invalid=build([null,{},e('Future','X','X','2027-01-01T00:00:00.000Z'),e('Invalid','X','X','2026-02-30T00:00:00.000Z')],null,null,NOW);assert.equal(invalid.profile,null);
const snapshot=JSON.stringify(events),frozen=Object.freeze(events.map(x=>Object.freeze({...x})));build(frozen,'Rap Artist',2022,NOW);assert.equal(JSON.stringify(events),snapshot);assert.equal(JSON.stringify(frozen),snapshot);
const ui=fs.readFileSync('components/LastFmArtistDeepDiveV860.tsx','utf8'),parent=fs.readFileSync('components/LastFmHistoryPanelV706.tsx','utf8'),home=fs.readFileSync('components/LastFmDiscoveryHomeV858.tsx','utf8'),css=fs.readFileSync('app/globals.css','utf8');
assert.equal(ts.createSourceFile('components/LastFmArtistDeepDiveV860.tsx',ui,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX).parseDiagnostics.length,0);
for(const token of ['buildArtistDeepDiveV860','profile.years.map','profile.yearSongs.map','profile.yearAlbums.map','onOpenArtist','onOpenSong','aria-pressed','setYear','setSearch'])assert(ui.includes(token),token);
assert(parent.includes('LastFmArtistDeepDiveV860 key={`artist-v860-${user}`} events={archive.events}'));assert(home.includes('href="#lastfm-artist-deep-dive-v860"'));
assert(!/\bfetch\s*\(|localStorage|indexedDB|sessionStorage|\bwindow\./.test(ui+src));
for(const token of ['.lastfm-deep-v860','.lastfm-deep-years-v860','.lastfm-deep-ranking-v860','@media(max-width:850px)','@media(prefers-reduced-motion:reduce)'])assert(css.includes(token),token);
const pkg=require('../package.json'),lock=require('../package-lock.json');assert(/^0\.1\.0-v\d+$/.test(pkg.version)&&Number(pkg.version.split('-v')[1])>=860);assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
for(const name of ['test:v860','test:v860:types','test:v860:ui-types'])assert(pkg.scripts[name],name);
for(const name of ['build:preflight','prebuild','check:fast','check:release'])assert(pkg.scripts[name].includes('npm run test:v860 && npm run test:v860:types && npm run test:v860:ui-types && npm run test:v859 &&'),name);
console.log('PASS V860: artist aliases, song/album ranking, unknown albums, yearly shares/gaps, valid dates, timezone boundary, immutable archive, integrated no-fetch UI and gates');
