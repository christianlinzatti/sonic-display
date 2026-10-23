'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('./typescript-loader.cjs');
function transpile(file) {
  const source = fs.readFileSync(file,'utf8');
  const transpiled = ts.transpileModule(source,{ compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true });
  assert(!transpiled.diagnostics.some(x=>x.category===ts.DiagnosticCategory.Error),'syntax: '+file);
  const m={exports:{}};new Function('module','exports','require',transpiled.outputText)(m,m.exports,require);return m.exports;
}
const model=transpile('services/lyrics/providers/spotifyColorLyrics.ts');
const tid='0VjIjW4GlUZAMYd2vXMi3b', aid='74ASZWbe4lXaubB36ztrGX';
assert(model.isSpotifyId(tid));
for(const invalid of ['',null,'../secrets','a'.repeat(100),'0'.repeat(21),'a b'.repeat(11)])assert(!model.isSpotifyId(invalid));
assert.equal(model.colorLyricsUrl('../bad',aid),null);
assert.equal(model.colorLyricsUrl(tid,aid),`https://spclient.wg.spotify.com/color-lyrics/v2/album/${aid}/track/${tid}?format=json&vocalRemoval=false&market=from_token`);
assert.equal(model.colorLyricsUrl(tid,'invalid'),`https://spclient.wg.spotify.com/color-lyrics/v2/track/${tid}?format=json&vocalRemoval=false&market=from_token`);
assert.equal(model.parseSpotifyColorLyrics({lyrics:{syncType:'LINE_SYNCED',lines:[{startTimeMs:'2000',words:'Two'},{startTimeMs:'150',words:'One'},{startTimeMs:'2200',words:'♪'},{startTimeMs:'not-valid',words:'wrong'},{startTimeMs:-1,words:'wrong'}]}}).lines.length,2);
const synced=model.parseSpotifyColorLyrics({lyrics:{syncType:'LINE_SYNCED',lines:[{startTimeMs:'2500',words:'second'},{startTimeMs:'0',words:'first'}]}});
assert(synced&&synced.synced);assert.equal(synced.provider,'spotify');
assert.deepEqual(synced.lines,[{startMs:0,endMs:2500,text:'first'},{startMs:2500,endMs:null,text:'second'}]);
const unsynced=model.parseSpotifyColorLyrics({lyrics:{syncType:'UNSYNCED',lines:[{words:'hello'},{words:'world'}]}});
assert(unsynced&&!unsynced.synced);assert.equal(unsynced.plainText,'hello\nworld');
for(const bad of [{},{lyrics:{lines:null}},{lyrics:{syncType:'LINE_SYNCED',lines:[{words:'text',startTimeMs:'NaN'}]}}])assert.equal(model.parseSpotifyColorLyrics(bad),null);
const client=fs.readFileSync('services/lyrics/client.ts','utf8');
assert(client.includes('params.set("trackId", track.id)'));assert(client.includes('params.set("albumId", track.albumId)'));
const current=fs.readFileSync('app/api/spotify/current/route.ts','utf8');assert(current.includes('albumId:item.album.id'));
const route=fs.readFileSync('app/api/lyrics/route.ts','utf8');
assert(route.includes('getValidSession()'));assert(route.includes('isSpotifyId(trackId)'));assert(route.includes('setSessionCookie(response, refreshed.session)'));
assert(!route.includes('token: token')&&!route.includes('accessToken: token'));
const chain=fs.readFileSync('services/lyrics/server.ts','utf8');
for(const x of ['lookupSpotifyColorLyrics','lookupLrclibLyrics','lookupLyricsOvh','lookupGeniusLyrics'])assert(chain.includes(x));
assert(chain.indexOf('lookupSpotifyColorLyrics(query.trackId')<chain.indexOf('lookupLrclibLyrics(query)'));
const source=fs.readFileSync('services/lyrics/providers/spotifyColorLyrics.ts','utf8');
for(const x of ['SPOTIFY_INTERNAL_LYRICS_ENABLED','cookie','app-platform']) {
  if(x==='SPOTIFY_INTERNAL_LYRICS_ENABLED')assert(route.includes(x));else if(x==='app-platform')assert(source.includes(x));else assert(source.includes(x));
}
assert(source.includes('cache: "no-store"'));assert(source.includes('if (!res.ok) return null'));
const pkg=require('../package.json');assert.ok(['0.1.0-v366','0.1.0-v367','0.1.0-v368','0.1.0-v369','0.1.0-v370','0.1.0-v371','0.1.0-v372','0.1.0-v373','0.1.0-v374','0.1.0-v375','0.1.0-v376','0.1.0-v377','0.1.0-v378','0.1.0-v379','0.1.0-v380','0.1.0-v381','0.1.0-v382','0.1.0-v383','0.1.0-v384','0.1.0-v385','0.1.0-v386','0.1.0-v387','0.1.0-v390','0.1.0-v391','0.1.0-v392','0.1.0-v393','0.1.0-v394','0.1.0-v395','0.1.0-v396','0.1.0-v397','0.1.0-v390','0.1.0-v391','0.1.0-v398','0.1.0-v399','0.1.0-v400','0.1.0-v401', '0.1.0-v402','0.1.0-v403','0.1.0-v404','0.1.0-v405','0.1.0-v406','0.1.0-v407','0.1.0-v408','0.1.0-v409','0.1.0-v411','0.1.0-v412','0.1.0-v413','0.1.0-v414','0.1.0-v415','0.1.0-v416','0.1.0-v417','0.1.0-v418','0.1.0-v419','0.1.0-v420','0.1.0-v422','0.1.0-v424','0.1.0-v425','0.1.0-v426'].includes(pkg.version));assert(pkg.scripts['verify:offline'].includes('test:v366'));
console.log('V366 Spotify Color Lyrics regression passed: IDs, paths, parsing, secure optional Spotify relay, fallbacks');
