'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ts=require('./typescript-loader.cjs');
function load(path){const src=fs.readFileSync(path,'utf8');const js=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;const exports={};vm.runInNewContext(js,{exports,URL,Date,Set,Number,Math,Array,Boolean,Object,RegExp}, {filename:path});return exports;}
const model=load('lib/recently-played-v672.ts');
let n=0;function test(name,fn){try{fn();n++;}catch(e){e.message=`V672 ${name}: ${e.message}`;throw e;}}
const id='4iV5W9uYEdYUVa79Axb7Rh';
const event=(played_at='2026-10-28T16:10:30.000Z')=>({played_at,track:{id,name:'Wieder da',duration_ms:207111,artists:[{name:'Künstlerin 1'},{name:'Künstler 2'}],album:{name:'Album A',images:[{url:'https://i.scdn.co/image/abc'}]}}});
const page={items:[event(),event('2026-10-27T09:30:00.000Z')],cursors:{before:'1793100000000'},next:'https://api.spotify.com/v1/me/player/recently-played?before=1793100000000'};
test('two history events remain visible for same track',()=>{const p=model.normalizeRecentlyPlayedV672(page);assert.equal(p.tracks.length,2);assert.equal(p.tracks[0].artist,'Künstlerin 1, Künstler 2');assert.equal(p.tracks[0].durationMs,207111);});
test('safe Spotify URLs, no raw external URL',()=>{const p=model.normalizeRecentlyPlayedV672(page);assert.equal(p.tracks[0].spotifyUrl,`https://open.spotify.com/track/${id}`);assert.equal(p.tracks[0].albumCoverUrl,'https://i.scdn.co/image/abc');});
test('invalid or malicious cover rejected',()=>{for(const url of ['javascript:alert(1)','https://evil.com/img.png','http://i.scdn.co/image/x']){const e=event();e.track.album.images=[{url}];assert.equal(model.normalizeRecentlyPlayedV672({items:[e]}).tracks[0].albumCoverUrl,null);}});
test('malformed items rejected without poisoning list',()=>{const result=model.normalizeRecentlyPlayedV672({items:[{},null,event('not-a-date'),{...event(),track:{id:'bad'}} ,event()],next:null});assert.equal(result.tracks.length,1);assert.equal(result.hasMore,false);});
test('cursor validation and pagination',()=>{assert.equal(model.recentBeforeV672(null),null);assert.equal(model.recentBeforeV672('1793100000000'),'1793100000000');for(const v of ['-1','11 OR 1=1','https://evil.com','Infinity','0','1'.repeat(50)])assert.equal(model.recentBeforeV672(v),false);const p=model.normalizeRecentlyPlayedV672(page);assert.equal(p.hasMore,true);assert.equal(p.nextBefore,'1793100000000');});
test('missing response data rejected',()=>{for(const x of [undefined,null,{}, {items:'abc'}, []])assert.equal(model.normalizeRecentlyPlayedV672(x),null);});
test('history is bounded per page',()=>assert.equal(model.normalizeRecentlyPlayedV672({items:Array(100).fill(event())}).tracks.length,50));
const login=fs.readFileSync('app/api/spotify/login/route.ts','utf8'),api=fs.readFileSync('app/api/spotify/recently-played/route.ts','utf8'),ui=fs.readFileSync('components/RecentlyPlayedV672.tsx','utf8'),display=fs.readFileSync('components/SonicDisplay.tsx','utf8'),pkg=require('../package.json');
test('OAuth requests read-only Spotify history scope',()=>assert(login.includes('user-read-recently-played')));
test('server route requires scope and protects tokens',()=>{assert(api.includes("'/me/player/recently-played")||api.includes('`/me/player/recently-played'));assert(api.includes('getValidSession()')&&api.includes('refreshSession('));assert(api.includes("'Cache-Control':'private, no-store'"));assert(api.includes('consent_required')&&api.includes('rate_limited'));assert(!api.includes('localStorage')&&!api.includes('setInterval'));});
test('client only fetches when open, visible states',()=>{assert(ui.includes('if(!open)return;'));for(const field of ['recent-search-v672','recent-day-v672','recent-grid-v672','recent-feature-v672','recent-error-v672','recent-more-v672','recent-empty-v672','close();'])assert(ui.includes(field),field);});
test('history launcher in both connected display views, never disconnected',()=>{assert.equal(display.match(/<RecentlyPlayedV672\/>/g).length,2);assert(display.includes('import("@/components/RecentlyPlayedV672")'));});
test('new version included in release checks',()=>{assert(pkg.scripts['check:release'].includes('test:v672'));assert(pkg.scripts['test:smoke:v672'].includes('test:smoke:v671'));});
console.log(`PASS V672 Recently Played: ${n} checks`);
