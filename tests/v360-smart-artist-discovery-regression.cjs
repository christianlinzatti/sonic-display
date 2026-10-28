'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('./typescript-loader.cjs');
function transpile(file, deps={}) {
  const source = fs.readFileSync(file,'utf8');
  const result = ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
  assert(!result.diagnostics.some(d=>d.category===ts.DiagnosticCategory.Error),file);
  const mod={exports:{}};
  new Function('module','exports','require',result.outputText)(mod,mod.exports,id=>{if(!Object.hasOwn(deps,id))throw new Error('Unmocked import '+id);return deps[id];});
  return mod.exports;
}
const model = transpile('lib/artist-discovery-v360.ts');
const A='2takcwOaAZWiXQijPHIx7B', B='74ASZWbe4lXaubB36ztrGX';
const demo = {id:A,name:' Künstler A ',type:'artist',images:[{url:'https://i.scdn.co/image/abc'}],genres:['Hardstyle']};
assert.deepEqual(model.normalizeDiscoveryArtists([demo,demo,{id:B,name:' Künstlerin B ',images:[{url:'https://malicious.example/image.png'}]},{name:'invalid'},{id:'bad',name:'X'}]),[
  {id:A,name:'Künstler A',imageUrl:'https://i.scdn.co/image/abc',genres:['Hardstyle'],spotifyUrl:`https://open.spotify.com/artist/${A}`},
  {id:B,name:'Künstlerin B',imageUrl:null,genres:[],spotifyUrl:`https://open.spotify.com/artist/${B}`}
]);
assert.equal(model.safeSpotifyImage('javascript:alert(1)'),null);
assert.equal(model.safeSpotifyImage('https://i.scdn.co.evil.com/abc'),null);
assert.equal(model.normalizeDiscoverySearch('     test   band   '),'test band');
assert.equal(model.normalizeDiscoverySearch('\na'),null);
assert.equal(model.normalizeDiscoverySearch('a'),null);
assert.equal(model.spotifyDiscoveryPath('search',{q:'a'}),null);
assert.equal(model.spotifyDiscoveryPath('genre',{genre:'invalid'}),null);
assert.equal(model.spotifyDiscoveryPath('genre',{genre:'hardtekk'}).includes('genre%3Ahardtekk'),true);
assert.equal(new URL('https://api.spotify.com/v1'+model.spotifyDiscoveryPath('search',{q:'Hardtekk',offset:80})).searchParams.get('limit'),'10');
assert.equal(new URL('https://api.spotify.com/v1'+model.spotifyDiscoveryPath('search',{q:'Hardtekk',offset:80})).searchParams.get('offset'),'50');
assert.equal(new URL('https://api.spotify.com/v1'+model.spotifyDiscoveryPath('search',{q:'Hardtekk',offset:NaN})).searchParams.get('offset'),'0');
assert.equal(model.spotifyDiscoveryPath('top',{}),'/me/top/artists?limit=10&time_range=medium_term');
assert.equal(model.spotifyDiscoveryPath('songs',{artistId:'wrong',artistName:'test'}),null);
assert.equal(new URL('https://api.spotify.com/v1'+model.spotifyDiscoveryPath('songs',{artistId:A,artistName:'Example'})).searchParams.get('q'),'artist:"Example"');
assert.deepEqual(model.normalizeDiscoverySongs([{id:B,name:'Matching',artists:[{id:A}],album:{name:'Album'}},{id:A,name:'Other',artists:[{id:B}]}],A),[{id:B,name:'Matching',album:'Album',spotifyUrl:`https://open.spotify.com/track/${B}`}]);

const ui=fs.readFileSync('components/ArtistDiscoveryV360.tsx','utf8');
assert(ui.includes('mode === "search"') && ui.includes('"genre"') && ui.includes('"top"'));
assert(ui.includes('Promise.all(batches.map') && ui.includes('length === 10'));
assert(ui.includes('/api/spotify/artists/follow?ids=') && ui.includes('artistId:artist.id,follow:following'));
assert(ui.includes('onMouseDown') && ui.includes('aria-modal="true"'));
assert(ui.includes('Songauswahl') && ui.includes('keine Popularitätsrangliste'));
assert(!ui.includes('Bearer '));
assert(ui.includes('new CustomEvent("sonic:artist-follow-changed-v359"'));
assert(fs.readFileSync('components/ArtistFollowV359.tsx','utf8').includes('addEventListener("sonic:artist-follow-changed-v359"'));
const main=fs.readFileSync('components/SonicDisplay.tsx','utf8');
assert.equal((main.match(/<ArtistDiscoveryV360 /g)||[]).length,2);
const login=fs.readFileSync('app/api/spotify/login/route.ts','utf8');
assert(login.includes('user-follow-read user-follow-modify user-top-read'));
const api=fs.readFileSync('app/api/spotify/discovery/route.ts','utf8');
assert(api.includes('AbortSignal.timeout(12000)') && api.includes('refreshSession') && api.includes('private, no-store'));
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(360);

const calls=[];let canned=[];let scopes='user-follow-read user-follow-modify user-top-read';
const session=()=>({session:{accessToken:'secret',refreshToken:'secret2',expiresAt:Date.now()+100000,scopes},refreshed:false});
const route=transpile('app/api/spotify/discovery/route.ts',{
  'next/server':{NextResponse:{json(body,{status=200}={}){return {body,status,headers:{set(){}},cookies:{set(){}}};}}},
  '@/lib/spotify':{getValidSession:async()=>session(),refreshSession:async()=>{throw Error('Unexpected token refresh');},ReauthRequiredError:class extends Error{}},
  '@/lib/session':{clearSessionCookie(){},setSessionCookie(){}},
  '@/lib/artist-discovery-v360':model,
});
global.fetch=async(url,options)=>{calls.push({url,options});const p=canned.shift();assert(p,'Missing mocked request');return {ok:p.status>=200&&p.status<300,status:p.status,headers:{get:()=>null},json:async()=>p.body};};
const req=url=>({nextUrl:new URL('http://127.0.0.1:3000'+url)});
(async()=>{
  canned=[{status:200,body:{artists:{items:[demo],next:'something'}}}];
  let res=await route.GET(req('/api/spotify/discovery?mode=genre&genre=hardstyle'));
  assert.equal(res.status,200);assert.equal(res.body.artists[0].name,'Künstler A');assert.equal(res.body.hasMore,true);
  assert(calls.at(-1).url.includes('/search?') && calls.at(-1).url.includes('limit=10'));
  assert.equal(calls.at(-1).options.headers.Authorization,'Bearer secret');
  canned=[{status:200,body:{tracks:{items:[{id:B,name:'Song',artists:[{id:A}],album:{name:'Single'}}]}}}];
  res=await route.GET(req(`/api/spotify/discovery?mode=songs&artistId=${A}&name=Example`));
  assert.equal(res.status,200);assert.equal(res.body.songs[0].name,'Song');
  scopes='user-follow-read user-follow-modify';calls.length=0;
  res=await route.GET(req('/api/spotify/discovery?mode=top'));
  assert.equal(res.status,403);assert.equal(res.body.code,'consent_required');assert.equal(calls.length,0);
  scopes+=' user-top-read';canned=[{status:200,body:{items:[demo]}}];
  res=await route.GET(req('/api/spotify/discovery?mode=top'));
  assert.equal(res.status,200);assert.equal(res.body.artists.length,1);
  calls.length=0;
  res=await route.GET(req('/api/spotify/discovery?mode=genre&genre=bad'));
  assert.equal(res.status,400);assert.equal(calls.length,0);
  canned=[{status:429}];res=await route.GET(req('/api/spotify/discovery?mode=genre&genre=techno'));
  assert.equal(res.status,429);assert.equal(res.body.code,'rate_limited');
  canned=[{status:403}];res=await route.GET(req('/api/spotify/discovery?mode=genre&genre=techno'));
  assert.equal(res.status,403);
  delete global.fetch;
  console.log('PASS V360 discovery model, genre/search/top/songs, safe URLs, server auth/scopes, 10-result limit, UI and follow integration');
})().catch(e=>{delete global.fetch;console.error(e);process.exitCode=1;});
