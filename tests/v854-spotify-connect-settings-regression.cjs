'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('./typescript-loader.cjs');
const read=p=>fs.readFileSync(p,'utf8');
function load(file,deps={}){
 const result=ts.transpileModule(read(file),{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
 assert(!result.diagnostics.some(d=>d.category===ts.DiagnosticCategory.Error),`TS syntax ${file}`);
 const module={exports:{}};
 new Function('module','exports','require',result.outputText)(module,module.exports,id=>{assert(Object.hasOwn(deps,id),`Unexpected dependency ${id}`);return deps[id];});
 return module.exports;
}
const basics=load('lib/spotify-playlists-v851.ts');
const core=load('lib/spotify-connect-v854.ts',{'./spotify-playlists-v851':basics});
const id='device_with-dash_1';
const transfer={action:'transfer',deviceId:id,play:true};
const volume={action:'volume',deviceId:id,volume:67};
const shuffle={action:'shuffle',deviceId:id,enabled:true};
const repeat={action:'repeat',deviceId:id,mode:'context'};
for(const x of [transfer,volume,shuffle,repeat,{...repeat,mode:'track'},{...repeat,mode:'off'},{...volume,volume:0},{...volume,volume:100}])assert.deepEqual(core.parseConnectCommandV854(x),x);
for(const bad of [null,{},[],{action:'volume',deviceId:id},{...volume,volume:1.2},{...volume,volume:-1},{...volume,volume:101},{...volume,volume:'50'},{...volume,volume:NaN},{...volume,volume:Infinity},{...shuffle,enabled:1},{...repeat,mode:'playlist'},{...transfer,play:'true'},{...transfer,deviceId:'../../danger'},{...shuffle,extra:'injection'},{action:'pause',deviceId:id}])assert.equal(core.parseConnectCommandV854(bad),null,JSON.stringify(bad));
assert.deepEqual(core.spotifyConnectRequestV854(transfer),{path:'/me/player',method:'PUT',body:{device_ids:[id],play:true}});
assert.deepEqual(core.spotifyConnectRequestV854({...transfer,play:false}).body,{device_ids:[id],play:false});
assert.equal(core.spotifyConnectRequestV854(volume).path,`/me/player/volume?device_id=${id}&volume_percent=67`);
assert.equal(core.spotifyConnectRequestV854(shuffle).path,`/me/player/shuffle?device_id=${id}&state=true`);
assert.equal(core.spotifyConnectRequestV854(repeat).path,`/me/player/repeat?device_id=${id}&state=context`);
const state=core.normalizeConnectStateV854({device:{id,name:'Wohnzimmer',supports_volume:true,volume_percent:71,is_restricted:false},shuffle_state:true,repeat_state:'track',is_playing:true});
assert.deepEqual(state,{activeDeviceId:id,activeDeviceName:'Wohnzimmer',supportsVolume:true,volumePercent:71,shuffle:true,repeat:'track',isPlaying:true});
assert.equal(core.normalizeConnectStateV854(null).activeDeviceId,null);
assert.equal(core.normalizeConnectStateV854({device:{id,volume_percent:103,supports_volume:true,is_restricted:true},repeat_state:'invalid'}).supportsVolume,false);
assert.equal(core.normalizeConnectStateV854({device:{id,volume_percent:103,supports_volume:true}}).volumePercent,null);
const pkg=require('../package.json'),lock=require('../package-lock.json');
assert(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1]??0)>=854);assert.equal(pkg.version,lock.version);assert.equal(pkg.version,lock.packages[''].version);
assert(pkg.scripts['build:preflight'].includes('npm run test:v854 && npm run test:v854:types && '));
assert(pkg.scripts.prebuild.includes('npm run test:v854 && npm run test:v854:types && '));
assert(pkg.scripts.prebuild.includes('npm run check:fast'));
for(const file of ['components/SpotifyMiniPlayerV853.tsx','components/SpotifyPlaylistsV851.tsx','app/api/spotify/player/settings/route.ts']){
 const s=read(file),parsed=ts.createSourceFile(file,s,ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 assert.equal(parsed.parseDiagnostics.length,0,`${file}: valid TypeScript`);
}
const mini=read('components/SpotifyMiniPlayerV853.tsx');
for(const needle of ['sonic-connect-panel-v854','/api/spotify/player/settings','settingsCommand({action:"volume"','action:"transfer"','action:"shuffle"','action:"repeat"','type="range"','aria-expanded={panelOpen}','onPointerUp={commitVolume}','onKeyUp={event=>','document.addEventListener("pointerdown"','document.addEventListener("keydown"','return()=>controller.abort()','sonic:spotify-connect-v854']){
 assert(mini.includes(needle),`UI missing ${needle}`);
}
assert(!mini.includes('"/api/spotify/current"'),'Existing MusicContext should own track polling');
const parent=read('components/SpotifyPlaylistsV851.tsx');assert(parent.includes('sonic:spotify-connect-v854'));
const css=read('app/globals.css');for(const selector of ['.sonic-connect-panel-v854','.sonic-connect-volume-v854','.sonic-connect-modes-v854','.sonic-connect-device-v854','@media(max-width:650px)','focus-visible'])assert(css.includes(selector),selector);
const response=(body,status=200)=>({body,status,headers:{set(){}}});
let scopes=['user-read-playback-state','user-modify-playback-state'];const calls=[],results=[];
const mockServer={
 spotifyRouteV851:async(required,callback)=>required.every(s=>scopes.includes(s))?callback({session:{},refreshed:false}):response({code:'consent_required'},403),
 spotifyCallV851:async(valid,path,method='GET',body)=>{calls.push({path,method,body});const next=results.shift()??{status:204,body:null};return {valid,response:{status:next.status,ok:next.status>=200&&next.status<300,headers:{get:()=>null},json:async()=>next.body}};},
 playlistErrorV851:r=>response({code:'spotify_unavailable'},r.status),playlistFinishV851:r=>r,
 playlistJsonV851:response,playlistUnauthV851:()=>response({code:'reauth_required'},401)
};
const route=load('app/api/spotify/player/settings/route.ts',{
 '@/lib/spotify-origin':{spotifyCallbackUrl:()=>new URL('http://127.0.0.1:3000/api/spotify/callback')},
 '@/lib/spotify-connect-v854':core,'@/lib/spotify-playlists-server-v851':mockServer
});
const req=(body,origin='http://127.0.0.1:3000')=>({headers:{get:key=>key==='origin'?origin:null},json:async()=>body});
(async()=>{
 let r=await route.POST(req(transfer,'https://evil.example'));assert.equal(r.status,403);assert.equal(calls.length,0);
 r=await route.POST({...req(null),json:async()=>{throw Error('malformed');}});assert.equal(r.status,400);
 r=await route.POST(req({...volume,volume:110}));assert.equal(r.status,400);assert.equal(calls.length,0);
 scopes=['user-read-playback-state'];r=await route.POST(req(transfer));assert.equal(r.status,403);assert.equal(calls.length,0);
 scopes=['user-modify-playback-state'];r=await route.GET();assert.equal(r.status,403);assert.equal(calls.length,0);
 for(const cmd of [transfer,{...transfer,play:false},volume,shuffle,repeat,{...repeat,mode:'off'},{...repeat,mode:'track'}]){
  r=await route.POST(req(cmd));assert.equal(r.status,200);assert.equal(r.body.ok,true);
  assert.deepEqual(calls.at(-1),{...core.spotifyConnectRequestV854(cmd),body:core.spotifyConnectRequestV854(cmd).body});
 }
 results.push({status:403});r=await route.POST(req(shuffle));assert.equal(r.status,403);
 results.push({status:429});r=await route.POST(req(volume));assert.equal(r.status,429);
 results.push({status:401});r=await route.POST(req(repeat));assert.equal(r.status,401);
 scopes=['user-read-playback-state'];r=await route.GET();assert.equal(r.status,200);assert.equal(r.body.state.activeDeviceId,null);
 results.push({status:200,body:{device:{id,name:'Box',supports_volume:false,volume_percent:10},repeat_state:'context',shuffle_state:true}});
 r=await route.GET();assert.equal(r.status,200);assert.equal(r.body.state.repeat,'context');assert.equal(r.body.state.supportsVolume,false);
 results.push({status:429});r=await route.GET();assert.equal(r.status,429);
 console.log('PASS V854 Spotify Connect: transfer, volume, shuffle, repeat, validation, scopes, CSRF, 204/401/403/429, responsive UI');
})().catch(err=>{console.error(err);process.exitCode=1;});
