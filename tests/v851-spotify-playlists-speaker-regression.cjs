'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('./typescript-loader.cjs');
function transpile(source,deps={}){
 const result=ts.transpileModule(fs.readFileSync(source,'utf8'),{fileName:source,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
 assert(!result.diagnostics.some(d=>d.category===ts.DiagnosticCategory.Error),`${source}: TS syntax error`);
 const module={exports:{}};
 new Function('module','exports','require',result.outputText)(module,module.exports,id=>{
  assert(Object.hasOwn(deps,id),`Unexpected ${id} in ${source}`);return deps[id];
 });return module.exports;
}
const lib=transpile('lib/spotify-playlists-v851.ts');
const ID='4wJSd9WzVFxLoIT6LQS4Mh',TRACK='2takcwOaAZWiXQijPHIx7B',DEVICE='2cfd93c6b70aca74';
assert.equal(lib.validSpotifyIdV851(ID),true);assert.equal(lib.validSpotifyIdV851('x/'.repeat(12)),false);
assert.equal(lib.validSpotifyDeviceIdV851('device_with-dash_1'),true);
assert.equal(lib.validSpotifyDeviceIdV851('../devices'),false);
assert.equal(lib.pageParamsV851(new URLSearchParams('offset=300'),30).offset,300);
for(const offset of ['-1','1.5','1e3','100001','1/2','abc'])assert.equal(lib.pageParamsV851(new URLSearchParams({offset}),30),null);
assert.equal(lib.hasSpotifyScopesV851('playlist-read-private user-read-playback-state',['playlist-read-private']),true);
assert.equal(lib.hasSpotifyScopesV851('playlist-read-private',['user-modify-playback-state']),false);
assert.deepEqual(lib.sanitizeFavoritePlaylistsV851([ID,ID,'evil',TRACK]),[ID,TRACK]);
const normalized=lib.normalizePlaylistPageV851({total:45,next:'next',items:[{id:ID,name:'Deutschrap',owner:{display_name:'Nutzer'},images:[{url:'https://i.scdn.co/cover'}],items:{total:53}}]},0);
assert.equal(normalized.items[0].total,53);assert.equal(normalized.items[0].imageUrl,'https://i.scdn.co/cover');assert.equal(normalized.hasMore,true);
const legacy=lib.normalizePlaylistPageV851({total:1,items:[{id:ID,name:'Rock',tracks:{total:123}}]},0);
assert.equal(legacy.items[0].total,123);
const trackPage=lib.normalizePlaylistTracksV851({total:4,items:[{item:{type:'track',id:TRACK,name:'Track 1',artists:[{name:'BHZ'}],album:{images:[{url:'https://i.scdn.co/a'}]},duration_ms:192300}},{item:null},{track:{type:'track',id:TRACK,name:'Track 2',is_playable:false}},{item:{type:'episode',id:TRACK,name:'Podcast'}}]},20);
assert.deepEqual(trackPage.items.map(t=>t.position),[20,22]);assert.equal(trackPage.items[0].artist,'BHZ');assert.equal(trackPage.items[1].playable,false);
assert.deepEqual(lib.normalizeDevicesV851({devices:[{id:DEVICE,name:'Wohnzimmer',type:'Speaker',is_active:true,is_restricted:false,volume_percent:33},{id:null}]}),[{id:DEVICE,name:'Wohnzimmer',type:'Speaker',active:true,restricted:false,volume:33}]);
assert.deepEqual(lib.parsePlayRequestV851({playlistId:ID,deviceId:DEVICE,position:0}),{playlistId:ID,deviceId:DEVICE,position:0});
for(const value of [NaN,-1,1.2,100001,'1'])assert.equal(lib.parsePlayRequestV851({playlistId:ID,deviceId:DEVICE,position:value}),null);
assert.equal(lib.parsePlayRequestV851({playlistId:'invalid',deviceId:DEVICE}),null);
let scopes='playlist-read-private playlist-read-collaborative user-read-playback-state user-modify-playback-state';
let refreshed=0;let validSession={session:{accessToken:'valid',refreshToken:'refresh',scopes},refreshed:false};
const resJson=(body,{status=200,headers={}}={})=>({body,status,headers:{items:headers,set(name,value){this.items[name]=value}},cookies:{set(){}}});
const server=transpile('lib/spotify-playlists-server-v851.ts',{
 'next/server':{NextResponse:{json:resJson}},'@/lib/spotify':{getValidSession:async()=>({...validSession,session:{...validSession.session,scopes}}),refreshSession:async s=>{refreshed++;return {...s,accessToken:'refreshed'};},ReauthRequiredError:class extends Error{}},
 '@/lib/session':{clearSessionCookie(){},setSessionCookie(){}},'@/lib/spotify-playlists-v851':lib
});
const deps={'@/lib/spotify-playlists-v851':lib,'@/lib/spotify-playlists-server-v851':server,'@/lib/spotify-origin':{spotifyCallbackUrl:()=>new URL('http://127.0.0.1:3000/api/spotify/callback')}};
const routes={list:transpile('app/api/spotify/playlists/route.ts',deps),items:transpile('app/api/spotify/playlists/[id]/items/route.ts',deps),devices:transpile('app/api/spotify/devices/route.ts',deps),play:transpile('app/api/spotify/playlists/play/route.ts',deps)};
const originReq=(body,origin='http://127.0.0.1:3000')=>({headers:{get:field=>field==='origin'?origin:null},json:async()=>body});
const getReq=(suffix='')=>({nextUrl:new URL('http://127.0.0.1:3000'+suffix)});
const calls=[];let responses=[];
global.fetch=async(url,opts)=>{calls.push({url:String(url),...opts});const r=responses.shift();assert(r,'Unexpected Spotify request');return {status:r.status,ok:r.status>=200&&r.status<300,json:async()=>r.body,headers:{get:()=>r.retry??null}};};
(async()=>{
 let r=await routes.play.POST(originReq({playlistId:ID,deviceId:DEVICE},'https://evil.test'));
 assert.equal(r.status,403);assert.equal(calls.length,0);
 r=await routes.play.POST(originReq({playlistId:'../a',deviceId:DEVICE}));assert.equal(r.status,400);
 scopes='user-read-playback-state';r=await routes.play.POST(originReq({playlistId:ID,deviceId:DEVICE}));assert.equal(r.status,403);assert.equal(r.body.code,'consent_required');assert.equal(calls.length,0);
 scopes='playlist-read-private playlist-read-collaborative user-read-playback-state user-modify-playback-state';
 responses=[{status:204}];r=await routes.play.POST(originReq({playlistId:ID,deviceId:DEVICE,position:24}));
 assert.equal(r.status,200);assert.equal(r.body.started,true);assert.equal(calls.at(-1).method,'PUT');
 assert(calls.at(-1).url.endsWith(`/me/player/play?device_id=${DEVICE}`));
 assert.deepEqual(JSON.parse(calls.at(-1).body),{context_uri:`spotify:playlist:${ID}`,offset:{position:24}});
 responses=[{status:204}];r=await routes.play.POST(originReq({playlistId:ID,deviceId:DEVICE}));
 assert.deepEqual(JSON.parse(calls.at(-1).body),{context_uri:`spotify:playlist:${ID}`});
 responses=[{status:200,body:{total:1,items:[{id:ID,name:'Deutschrap',items:{total:3}}]}}];r=await routes.list.GET(getReq('/api/spotify/playlists?offset=0'));assert.equal(r.body.items[0].name,'Deutschrap');
 responses=[{status:200,body:{devices:[{id:DEVICE,name:'Lautsprecher',type:'Speaker',is_restricted:true}]}}];r=await routes.devices.GET();assert.equal(r.body.devices[0].restricted,true);
 responses=[{status:403}];r=await routes.items.GET(getReq(`/api/spotify/playlists/${ID}/items`),{params:Promise.resolve({id:ID})});assert.equal(r.status,403);assert.match(r.body.message,/eigen/);
 assert(calls.at(-1).url.includes(`/playlists/${ID}/items?`));assert(!calls.at(-1).url.includes('/tracks'));
 responses=[{status:429,retry:'4'}];r=await routes.list.GET(getReq('/api/spotify/playlists'));assert.equal(r.status,429);assert.equal(r.headers.items['Retry-After'],'4');
 const currentCount=calls.length;
 r=await routes.items.GET(getReq('/api/spotify/playlists/bad/items'),{params:Promise.resolve({id:'bad'})});assert.equal(r.status,400);assert.equal(calls.length,currentCount);
 responses=[{status:401},{status:204}];r=await routes.play.POST(originReq({playlistId:ID,deviceId:DEVICE}));assert.equal(r.status,200);assert.equal(refreshed,1);
 const login=fs.readFileSync('app/api/spotify/login/route.ts','utf8');for(const scope of ['playlist-read-private','playlist-read-collaborative','user-modify-playback-state'])assert(login.includes(scope));
 const ui=fs.readFileSync('components/SpotifyPlaylistsV851.tsx','utf8');assert(ui.includes('sonic.spotify')===false || ui.includes('PLAYLIST_FAVORITES_KEY_V851'));assert(ui.includes('Ausgewählte'));assert(ui.includes('Weitere Titel laden'));assert(ui.includes('Lautsprecher starten'));assert(ui.includes('disabled={playing||!selectedDevice||!t.playable}'));
 const home=fs.readFileSync('components/SonicDisplay.tsx','utf8');assert(home.includes('<SpotifyPlaylistsV851/>'));assert(home.includes('dynamic(() => import("@/components/SpotifyPlaylistsV851")'));
 console.log('PASS V851 Spotify playlists: secure requests, scopes, new 2026 items API, playlist/track normalization, favorites, device restrictions, position, playback and UI integration');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{delete global.fetch;});
