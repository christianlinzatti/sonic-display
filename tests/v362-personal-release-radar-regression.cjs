'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const ts=require('./typescript-loader.cjs');
function transpile(file,deps={}){
 const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
 assert(!output.diagnostics.some(d=>d.category===ts.DiagnosticCategory.Error),`syntax ${file}`);
 const mod={exports:{}};new Function('module','exports','require',output.outputText)(mod,mod.exports,id=>{if(!Object.hasOwn(deps,id))throw Error(`Unexpected import ${id}`);return deps[id];});return mod.exports;
}
const A='2takcwOaAZWiXQijPHIx7B',B='74ASZWbe4lXaubB36ztrGX',C='0TnOYISbd1XYRBk9myaseg';
const artist=transpile('lib/artist-discovery-v360.ts');
const music=transpile('lib/music-discovery-v361.ts',{'@/lib/artist-discovery-v360':artist});
const radar=transpile('lib/release-radar-v362.ts',{'@/lib/artist-discovery-v360':artist,'@/lib/music-discovery-v361':music});
const sampleArtist=(id=A,name='Rap Künstler')=>({id,name,images:[{url:'https://i.scdn.co/image/ABCDEF'}]});
const sampleAlbum=(id=B,date='2026-10-10',precision='day')=>({id,name:'Album Name',artists:[sampleArtist()],release_date:date,release_date_precision:precision,album_type:'single',images:[{url:'https://i.scdn.co/image/123'}]});
const now=Date.parse('2026-10-19T12:00:00Z');
assert.equal(radar.radarDays('30'),30);assert.equal(radar.radarDays('90'),90);assert.equal(radar.radarDays('365'),null);
assert.equal(radar.radarFollowedPath(null),'/me/following?type=artist&limit=4');
assert(radar.radarFollowedPath(A).includes('after='+A));assert.equal(radar.radarFollowedPath('../hack'),null);
assert(radar.radarArtistAlbumsPath(A).includes('/artists/'+A+'/albums?'));
assert.equal(radar.radarArtistAlbumsPath('../bad'),null);
const followed={artists:{items:[sampleArtist(A),sampleArtist(C,'Techno Künstler')],next:`https://api.spotify.com/v1/me/following?type=artist&after=${C}`,cursors:{after:C}}};
assert.deepEqual(radar.normalizeRadarFollowed(followed).artists.map(v=>v.id),[A,C]);
assert.equal(radar.normalizeRadarFollowed(followed).cursor,C);
assert.equal(radar.normalizeRadarFollowed({artists:{items:[sampleArtist(A)],next:'https://evil.example/',cursors:{after:A}}}).hasMore,false);
assert.equal(radar.normalizeRadarFollowed({artists:{items:[],next:null,cursors:{}}}).cursor,null);
assert.equal(radar.normalizeRadarFollowed({}),null);
const normalizedArtist=artist.normalizeDiscoveryArtists([sampleArtist()])[0];
let entries=radar.normalizeRadarReleases([sampleAlbum(),sampleAlbum(C,'2026-01-01'),sampleAlbum(A,'2026-10','month'),sampleAlbum(C,'2026-10-20')],normalizedArtist,30,now);
assert.equal(entries.length,1);assert.equal(entries[0].id,B);assert.equal(entries[0].group,'single');assert.equal(entries[0].daysOld,9);
assert.equal(radar.normalizeRadarReleases([sampleAlbum(B,'2026-06-10')],normalizedArtist,180,now).length,1);
assert.equal(radar.normalizeRadarReleases([sampleAlbum(B,'2026-02-29')],normalizedArtist,180,now).length,0);
assert.deepEqual(radar.mergeRadarReleases([...entries,...entries]).map(r=>r.id),[B]);
assert.deepEqual(radar.parseSeenRadarIds([A,A,B,'bad!']),[A,B]);
assert.equal(radar.parseSeenRadarIds('invalid').length,0);
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(362);
assert(require('../package.json').scripts['verify:offline'].includes('test:v362'));
const main=fs.readFileSync('components/SonicDisplay.tsx','utf8');assert.equal((main.match(/<ReleaseRadarV362\/>/g)||[]).length,2);
const comp=fs.readFileSync('components/ReleaseRadarV362.tsx','utf8');
for(const marker of ['Personal Release Radar','Nur ungesehene','Meine Künstler','Genres','RADAR_SEEN_KEY_V362','role="dialog"','aria-modal="true"','AbortController','Als angesehen markieren','Spotify'])assert(comp.includes(marker),`missing ${marker}`);
assert(!comp.includes('Bearer '));
const login=fs.readFileSync('app/api/spotify/login/route.ts','utf8');assert(login.includes('user-follow-read'));
const calls=[],pending=[];let scopes='user-follow-read';
const session=()=>({session:{accessToken:'testSecret',refreshToken:'refresh',scopes,expiresAt:Date.now()+100000},refreshed:false});
const deps={
 'next/server':{NextResponse:{json(body,{status=200}={}){return {body,status,headers:{set(){}},cookies:{set(){}}};}}},
 '@/lib/spotify':{getValidSession:async()=>session(),refreshSession:async()=>{throw Error('Unexpected refresh');},ReauthRequiredError:class extends Error{}},
 '@/lib/session':{clearSessionCookie(){},setSessionCookie(){}},
 '@/lib/release-radar-v362':radar
};
const route=transpile('app/api/spotify/release-radar/route.ts',deps);
const req=(path)=>({nextUrl:new URL('http://localhost:3000'+path)});
global.fetch=async(url,options)=>{calls.push({url,options});const item=pending.shift();assert(item,'Unexpected Spotify request: '+url);return {ok:item.status>=200&&item.status<300,status:item.status,headers:{get:()=>item.retry??null},json:async()=>item.body};};
(async()=>{
 let before=calls.length;
 let result=await route.GET(req('/api/spotify/release-radar?days=15'));assert.equal(result.status,400);assert.equal(calls.length,before);
 result=await route.GET(req('/api/spotify/release-radar?after=../../malicious'));assert.equal(result.status,400);assert.equal(calls.length,before);
 scopes='user-follow-modify';result=await route.GET(req('/api/spotify/release-radar'));assert.equal(result.status,403);assert.equal(calls.length,before);
 scopes='user-follow-read';pending.push({status:200,body:{artists:{items:[sampleArtist(A)],next:null,cursors:{}}}},{status:200,body:{items:[sampleAlbum()]}});
 result=await route.GET(req('/api/spotify/release-radar?days=90'));assert.equal(result.status,200);assert.equal(result.body.releases[0].id,B);assert.equal(result.body.artists[0].id,A);
 assert(calls.at(-2).url.includes('/me/following?'));assert(calls.at(-1).url.includes('/artists/'+A+'/albums?'));
 assert(!JSON.stringify(result.body).includes('testSecret'));
 pending.push({status:200,body:{artists:{items:[],next:null,cursors:{}}}});
 result=await route.GET(req('/api/spotify/release-radar?days=30'));assert.equal(result.status,200);assert.equal(result.body.releases.length,0);
 pending.push({status:429,retry:'50'});
 result=await route.GET(req('/api/spotify/release-radar'));assert.equal(result.status,429);assert.equal(result.body.code,'rate_limited');
 pending.push({status:200,body:{artists:{items:[sampleArtist(A)],next:null,cursors:{}}}},{status:503});
 result=await route.GET(req('/api/spotify/release-radar'));assert.equal(result.status,200);assert.equal(result.body.partial,true);assert.deepEqual(result.body.failedArtists,[A]);
 console.log('V362 Personal Release Radar regression passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
