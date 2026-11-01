'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('./typescript-loader.cjs');
const path='lib/spotify-playlist-taste-v864.ts',code=fs.readFileSync(path,'utf8');
const transpiled=ts.transpileModule(code,{fileName:path,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
assert.equal(transpiled.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
const core={};new Function('exports','require',transpiled.outputText)(core,()=>{throw Error('Core must not import runtime dependencies');});
const {buildPlaylistTasteV864:analyze,playlistSongKeyV864:key,V864_MAX_TRACKS:limit}=core;
assert.equal(limit,500);
const track=(position,id,title,artist)=>({position,id,title,artist,playable:true,durationMs:200000,imageUrl:null,spotifyUrl:`https://open.spotify.com/track/${id}`});
const scrobble=(title,artist,date='2026-09-01T10:00:00.000Z')=>({title,artist,album:'An Album',playedAt:date,cover:null,url:null});
assert.equal(key('Sänger','Musik (feat. Gast)'),key('Sanger','musik'));
assert.notEqual(key('Artist','Track Live'),key('Artist','Track'));
assert.notEqual(key('Artist','Track (Remix)'),key('Artist','Track'));
const playlist=[
 track(0,'1234567890','Rap Track','Sänger, Gast'),
 track(1,'1234567890','Rap Track','Sänger, Gast'),
 track(2,'1234567891','Undiscovered','Else'),
 track(3,'1234567892','Love (Remix)','Artist'),
 track(4,'1234567893','Song','Artist'),
 track(5,'1234567894','SONG','artist'),
];
const archive=[...Array.from({length:4},(_,i)=>scrobble('Rap Track','Sanger',`2026-09-0${i+1}T10:00:00.000Z`)),scrobble('Song','Artist'),scrobble('Love','Artist')];
const result=analyze(playlist,archive);
assert.equal(result.playlistItems,6);assert.equal(result.uniqueTracks,4);assert.equal(result.duplicates,2);
assert.equal(result.matchedTracks,2);assert.equal(result.favoriteTracks,1);assert.equal(result.missingTracks,2);
assert.equal(result.matchingScrobbles,5);
assert.equal(result.tracks[0].playlistOccurrences,2);assert.equal(result.tracks[0].plays,4);assert.equal(result.tracks[0].status,'favorite');
assert.equal(result.tracks.find(x=>x.track.title==='Love (Remix)').status,'not-in-archive');
assert.equal(result.tracks.find(x=>x.track.title==='Song').playlistOccurrences,2);
assert.equal(result.topArtists[0].name,'Artist');assert.equal(result.topArtists[0].tracks,2);
assert.equal(analyze(playlist,null).historyAvailable,false);
assert(analyze(playlist,null).tracks.every(x=>x.status==='no-history'));
assert.equal(analyze([],[]).uniqueTracks,0);
const huge=Array.from({length:620},(_,i)=>track(i,`${i}`.padStart(10,'0'),`Song ${i}`,'Band'));
assert.equal(analyze(huge,[]).scanned,500);
assert.equal(analyze(huge.slice(490),[]).scanned,10,'Never include positions >=500 even when fewer than 500 valid tracks were supplied');
assert.equal(analyze(huge.slice(500),[]).scanned,0,'Raw playlist position cap prevents lookups beyond 500');
const frozen=Object.freeze(playlist.map(x=>Object.freeze({...x}))),hist=Object.freeze(archive.map(x=>Object.freeze({...x})));
const old=JSON.stringify([frozen,hist]);analyze(frozen,hist);assert.equal(JSON.stringify([frozen,hist]),old);
const uiFile='components/SpotifyPlaylistTasteAnalyzerV864.tsx',ui=fs.readFileSync(uiFile,'utf8');
const parent=fs.readFileSync('components/SpotifyPlaylistsV851.tsx','utf8');const css=fs.readFileSync('app/globals.css','utf8');
assert.equal(ts.createSourceFile(uiFile,ui,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX).parseDiagnostics.length,0);
assert.equal(ts.createSourceFile('components/SpotifyPlaylistsV851.tsx',parent,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX).parseDiagnostics.length,0);
for(const phrase of ['V864_MAX_TRACKS','AbortController','readLongtermHistoryV713','readLastFmArchiveV706','V706_USERNAME_KEY','validLastFmUsernameV706','playlistId','playlistName','playlistTotal','aria-pressed','Son','Nicht im Archiv','fetch(`/api/spotify/playlists/','setShowCount','noopener noreferrer']) assert(ui.includes(phrase),phrase);
assert(ui.includes('onClick={()=>void analyze()}'),'Opt-in and no automatic fetch');
assert(ui.includes('response.status===403'),'Spotify API permission warning');
assert(ui.includes('item.position<V864_MAX_TRACKS'),'Bound raw Spotify playlist positions');
assert(ui.includes('if(lastFm!==null&&!lastFm.length)'),'Fallback for legacy local archive');
assert(!/fetch\s*\(|indexedDB|localStorage|sessionStorage/.test(code),'Pure core has no side effects');
assert(parent.includes('<SpotifyPlaylistTasteAnalyzerV864 key={selected.id} playlistId={selected.id}'),'Scoped per selection; no stale results');
assert(parent.includes('<SpotifyMiniPlayerV853/>'),'Mini-player retained');
for(const phrase of ['.sonic-taste-v864','.sonic-taste-metrics-v864','@media(max-width:740px)','@media(prefers-reduced-motion:reduce)']) assert(css.includes(phrase),phrase);
const pkg=require('../package.json'),lock=require('../package-lock.json');assert(/^0\.1\.0-v(?:864|86[5-9]|8[7-9]\d|9\d\d)$/.test(pkg.version));assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
for(const script of ['test:v864','test:v864:types','test:v864:ui-types'])assert(pkg.scripts[script],script);
for(const script of ['build:preflight','prebuild','check:fast','check:release'])assert(pkg.scripts[script].includes('npm run test:v864 && npm run test:v864:types && npm run test:v864:ui-types &&'),script);
console.log('PASS V864: exact identity, remix protection, feature normalization, duplicates, archive presence/absence, bounded loading, immutable input, UI opt-in, account-bound local reading, release integration');
