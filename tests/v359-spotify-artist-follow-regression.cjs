'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('./typescript-loader.cjs');
function transpile(path, deps = {}) {
  const code = fs.readFileSync(path, 'utf8');
  const result = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX }, reportDiagnostics: true });
  assert(!result.diagnostics.some(x => x.category === ts.DiagnosticCategory.Error));
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', result.outputText)(mod, mod.exports, id => {
    if (!Object.hasOwn(deps, id)) throw new Error(`Unexpected import: ${id}`);
    return deps[id];
  });
  return mod.exports;
}
const lib = transpile('lib/artist-follow-v359.ts');
const A = '2takcwOaAZWiXQijPHIx7B';
const B = '74ASZWbe4lXaubB36ztrGX';
assert.equal(lib.artistUri(A), `spotify:artist:${A}`);
assert.equal(lib.artistUri('unsafe/id'), null);
assert.equal(lib.artistLink(A), `https://open.spotify.com/artist/${A}`);
assert.equal(lib.libraryUrisQuery([A]), `uris=spotify%3Aartist%3A${A}`);
assert.equal(decodeURIComponent(lib.libraryUrisQuery([A, B]).replace(/^uris=/, '')), `spotify:artist:${A},spotify:artist:${B}`);
assert.equal(lib.libraryUrisQuery([]), null);
assert.deepEqual(lib.parseArtistIds(`${A},${B},${A}`), [A,B]);
assert.equal(lib.parseArtistIds(`bad,id`), null);
assert.deepEqual(lib.normalizeContainsResponse([true, false], [A, B]), { [A]: true, [B]: false });
assert.equal(lib.normalizeContainsResponse([true], [A, B]), null);
assert.equal(lib.hasFollowScope('user-read-currently-playing user-follow-read', lib.FOLLOW_READ_SCOPE), true);

const serverSource = fs.readFileSync('app/api/spotify/artists/follow/route.ts', 'utf8');
assert.match(serverSource, /\/me\/library\/contains/);
assert.match(serverSource, /\/me\/library\?/);
assert(!serverSource.includes('/me/following'));
const loginSource = fs.readFileSync('app/api/spotify/login/route.ts', 'utf8');
assert.match(loginSource, /user-follow-read user-follow-modify/);
assert.match(fs.readFileSync('app/api/spotify/current/route.ts', 'utf8'), /artistDetails:/);
assert.match(fs.readFileSync('components/SonicDisplay.tsx', 'utf8'), /<ArtistFollowV359/);
const ui = fs.readFileSync('components/ArtistFollowV359.tsx', 'utf8');
assert(ui.includes('Noch nicht gefolgt') && ui.includes('Entfolgen') && ui.includes('Spotify neu verbinden'));

const calls = [];
let currentScopes = 'user-read-currently-playing user-follow-read user-follow-modify';
let canned = [];
const mockSession = () => ({session:{accessToken:'test-token',refreshToken:'test-refresh',expiresAt:Date.now()+100000,scopes:currentScopes},refreshed:false});
const routes = transpile('app/api/spotify/artists/follow/route.ts', {
  'next/server': {NextResponse: {json(body, {status = 200} = {}) {return {body, status, cookies:{set(){}}};}}},
  '@/lib/spotify': {getValidSession: async()=>mockSession(), refreshSession: async()=>{throw new Error('unexpected refresh');}, ReauthRequiredError: class extends Error{}},
  '@/lib/session': {clearSessionCookie(){},setSessionCookie(){}},
  '@/lib/artist-follow-v359': lib,
  '@/lib/spotify-origin': {spotifyCallbackUrl:()=>new URL('http://127.0.0.1:3000/api/spotify/callback')}
});
global.fetch = async (url, options) => {
  calls.push({url,method:options.method});
  const response = canned.shift();
  assert(response, 'unexpected Spotify API request');
  return {ok:response.status >= 200 && response.status < 300, status:response.status, json:async()=>response.body};
};
const reqGet = ids=>({nextUrl:new URL(`http://127.0.0.1:3000/api/spotify/artists/follow?ids=${ids}`)});
const reqPost = (artistId, follow)=>({headers:{get(name){return name==='origin'?'http://127.0.0.1:3000':null;}},json:async()=>({artistId, follow})});
(async()=>{
  canned=[{status:200,body:[false,true]}];
  let result=await routes.GET(reqGet(`${A},${B}`));
  assert.equal(result.status,200); assert.deepEqual(result.body.statuses,{[A]:false,[B]:true});
  assert.equal(calls.at(-1).method,'GET');
  assert(calls.at(-1).url.includes('/me/library/contains?uris=spotify%3Aartist%3A'));

  calls.length=0;canned=[{status:200},{status:200,body:[true]}];
  result=await routes.POST(reqPost(A,true));
  assert.equal(result.status,200);assert.equal(result.body.following,true);
  assert.deepEqual(calls.map(c=>c.method),['PUT','GET']);
  assert(calls[0].url.includes('/me/library?uris=spotify%3Aartist%3A'));
  assert(calls[1].url.includes('/me/library/contains?uris=spotify%3Aartist%3A'));

  calls.length=0;canned=[{status:200},{status:200,body:[false]}];
  result=await routes.POST(reqPost(A,false));
  assert.equal(result.status,200);assert.equal(result.body.following,false);
  assert.deepEqual(calls.map(c=>c.method),['DELETE','GET']);

  calls.length=0;canned=[{status:400}];
  result=await routes.POST(reqPost(A,true));
  assert.equal(result.status,503);assert.equal(result.body.code,'unsupported');assert.equal(calls.length,1);

  calls.length=0;canned=[{status:200},{status:200,body:[false]}];
  result=await routes.POST(reqPost(A,true));
  assert.equal(result.status,409);assert.equal(result.body.code,'unconfirmed');

  calls.length=0; currentScopes='user-read-currently-playing';
  result=await routes.POST(reqPost(A,true));
  assert.equal(result.status,403);assert.equal(result.body.code,'consent_required');assert.equal(calls.length,0);

  result=await routes.POST({headers:{get:()=> 'https://malicious.example'},json:async()=>({artistId:A,follow:true})});
  assert.equal(result.status,403);assert.equal(result.body.code,'invalid_origin');
  delete global.fetch;
  require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(359);
  console.log('PASS V359 Spotify library API /contains, PUT, DELETE, URI encoding, confirmation, auth, rate/error-safe flow, UI integration');
})().catch(e=>{delete global.fetch;console.error(e);process.exitCode=1;});
