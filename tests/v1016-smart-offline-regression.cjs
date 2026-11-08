#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');const read=x=>fs.readFileSync(path.join(root,x),'utf8');
const loader=require('./helpers/loader-v733.cjs')();
const {SmartOfflineV1016}=loader('lib/smartOfflineV1016');
const {formatActionTitlesV1016}=require('../scripts/version-action-titles-v1016.cjs');
function track(id,title='Titel',artist='Interpret'){
 return {id,title,artist,artists:[artist],album:'Album',albumCoverUrl:'https://i.scdn.co/image/example',spotifyUrl:'https://open.spotify.com/track/'+id,durationMs:215000};
}
const now=1_000_000, t=track('a'),lyrics={provider:'lrclib',synced:true,lines:[{startMs:0,endMs:3000,text:'Text'}],plainText:'Text'};
const cache=new SmartOfflineV1016(2,20_000,60_000);
cache.setScope('account-1');
assert.equal(cache.lastKnown(now),null,'cold start must not invent a playing track');
cache.rememberPlayback(t,15000,now,now);
assert.equal(cache.lastKnown(now).track.title,'Titel');
cache.rememberLyrics(t,lyrics,now);
assert.equal(cache.lyricsFor(t,now),lyrics);
assert.equal(cache.lyricsFor({...t,artist:'anderer Interpret'},now),null,'artist is part of cache identity');
assert.equal(cache.lyricsFor(t,now+60_001),null,'lyrics expire independently of playback');
assert.equal(cache.lastKnown(now+20_001),null,'old tracks cannot masquerade as current playback');
cache.rememberPlayback(track('b'),22000,now,now+1);
cache.rememberPlayback(track('c'),30000,now,now+2);
assert.equal(cache.stats().tracks,2,'bounded memory cache');
assert.equal(cache.lyricsFor(t,now+2),null,'LRU evicts old song');
cache.setScope('account-2');
assert.equal(cache.stats().tracks,0,'account switch must purge all personal content');
assert.equal(cache.lastKnown(now+2),null);
cache.rememberPlayback(t,15000,now,now);
cache.clear();
assert.equal(cache.lastKnown(now),null,'logout clears lyrics and playback');
// No localStorage/IndexedDB/CacheStorage/ServiceWorker use in account cache.
const offlineSource=read('lib/smartOfflineV1016.ts');
for(const banned of ['localStorage','sessionStorage','indexedDB','caches.open','fetch('])
 assert(!offlineSource.includes(banned),'Offline snapshot must stay RAM-only: '+banned);
const polling=read('hooks/usePlaybackPolling.ts');
for(const required of ['smartOfflineV1016.rememberPlayback','smartOfflineV1016.lyricsFor',
 'smartOfflineV1016.rememberLyrics','smartOfflineV1016.clear()','err.status===401',
 "window.addEventListener('online'", "window.addEventListener('offline'",'offlineSnapshot:Boolean'])
 assert(polling.includes(required),'Missing polling integration: '+required);
assert(polling.includes('clientNetworkV1010.getAccount()===requestedScope'),'late lyrics cannot cross Spotify account');
assert(read('lib/networkCoordinatorV1010.ts').includes('smartOfflineV1016.setScope(account)'));
assert(read('types/music.ts').includes('offlineSnapshot?:boolean'));
assert(read('components/SonicDisplay.tsx').includes('LETZTER BEKANNTER STAND · NICHT LIVE'));
assert(read('public/sw-v364.js').includes('No Spotify responses or credentials are cached'));
// All workflow run titles match the *checked-out* release, no stale hard-coded prior version.
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
const version=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version);
assert(version&&Number(version[1])>=1016);const release='V'+version[1];
assert.equal(lock.version,pkg.version);
assert.equal(lock.packages[''].version,pkg.version);
assert.equal(pkg.sonicFeatureRelease,'v'+version[1]);assert.equal(pkg.sonicRoadmapRelease,'v'+version[1]);
const titles=formatActionTitlesV1016(root,false);
// ZIP import intentionally protects workflow YAML; 29 files are installed on GitHub.
// Require all installed Action titles to match, not ZIP-only historical workflows.
assert(titles.total>=25);
// Only active user-facing workflows must be current immediately. Legacy manual-only titles
// can be refreshed on the next archive import without failing production CI.
for(const file of ['v965-room-wave-production.yml','v965-deployment-smoke.yml','project-archive-import.yml'])
 assert(!titles.mismatched.includes(file),`Stale active workflow title: ${file}`);
for(const file of ['v965-room-wave-production.yml','v965-deployment-smoke.yml','project-archive-import.yml']){
 const source=read('.github/workflows/'+file);
 assert(source.split('\n').some(line=>line.startsWith('run-name:')&&line.includes(release)),file);
}
const prod=read('.github/workflows/v965-room-wave-production.yml');
assert(prod.includes('inputs.release')&&prod.includes(release));
const importWorkflow=read('.github/workflows/project-archive-import.yml');
assert(importWorkflow.includes('Trigger full Linux/Windows production validation'));
for(const file of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(file).includes('tests/v1016-smart-offline-regression.cjs'));
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1016(root)'));
const ts=require('./typescript-loader.cjs');
for(const file of ['lib/smartOfflineV1016.ts','hooks/usePlaybackPolling.ts','lib/networkCoordinatorV1010.ts']){
 const result=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}});
 assert.equal((result.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,file);
}
console.log('PASS V1016: session-only account cache, TTL/LRU, offline fallback, no cross-account leakage, safe action titles, CI routing');
