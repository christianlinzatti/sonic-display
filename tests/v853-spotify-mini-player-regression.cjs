'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('./typescript-loader.cjs');
const read=p=>fs.readFileSync(p,'utf8');
function load(file,deps={}){
 const src=read(file),result=ts.transpileModule(src,{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
 assert(!result.diagnostics?.some(d=>d.category===ts.DiagnosticCategory.Error),`TypeScript syntax: ${file}`);
 const m={exports:{}};new Function('module','exports','require',result.outputText)(m,m.exports,id=>{assert(Object.hasOwn(deps,id),`Unexpected dependency ${id}`);return deps[id];});return m.exports;
}
const core=load('lib/spotify-mini-player-v853.ts');
for(const action of ['pause','resume','next','previous'])assert.equal(core.parseMiniPlayerActionV853({action}),action);
for(const raw of [null,{},[],{action:'play'},{action:'seek'},{action:'next?device=evil'},{action:1}])assert.equal(core.parseMiniPlayerActionV853(raw),null);
assert.deepEqual(core.playbackPathV853('pause'),{path:'/me/player/pause',method:'PUT'});
assert.deepEqual(core.playbackPathV853('resume'),{path:'/me/player/play',method:'PUT'});
assert.deepEqual(core.playbackPathV853('next'),{path:'/me/player/next',method:'POST'});
assert.deepEqual(core.playbackPathV853('previous'),{path:'/me/player/previous',method:'POST'});
assert.equal(core.formatPlayerTimeV853(125300),'2:05');assert.equal(core.playerProgressV853(5000,0),0);assert.equal(core.playerProgressV853(15000,10000),100);
const packageVersion=require('../package.json');const lock=require('../package-lock.json');
assert(Number(packageVersion.version.match(/^0\.1\.0-v(\d+)$/)?.[1]??0)>=853);assert.equal(lock.version,packageVersion.version);assert.equal(lock.packages[''].version,packageVersion.version);
assert(packageVersion.scripts['build:preflight'].includes('npm run test:v853 && npm run test:v853:types')); 
const ui=read('components/SpotifyMiniPlayerV853.tsx'),parent=read('components/SpotifyPlaylistsV851.tsx'),css=read('app/globals.css');
for(const f of ['components/SpotifyMiniPlayerV853.tsx','components/SpotifyPlaylistsV851.tsx','app/api/spotify/player/control/route.ts'])assert.equal(ts.createSourceFile(f,read(f),ts.ScriptTarget.Latest,true,f.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS).parseDiagnostics.length,0,`${f} parses`);
for(const str of ['useMusic()','/api/spotify/devices','/api/spotify/player/control','sonic-mini-timeline-v853','sonic-mini-output-v853','sonic-mini-toggle-v853','control("next")','control("previous")','DEVICE_POLL_MS_V853=45000','return()=>{window.clearInterval(timer);','disabled={!track||!connected||busy}'])assert(ui.includes(str),str);
assert(!ui.includes('/api/spotify/current'), 'No additional track polling – use MusicContext');
for(const str of ['<SpotifyMiniPlayerV853/>','sonic-mini-dock-v853','sonic:spotify-playback-v853','sonic-playlist-launch-v852'])assert(parent.includes(str),str);
for(const str of ['.sonic-mini-dock-v853','.sonic-mini-player-v853','.sonic-mini-cover-v853','.sonic-mini-controls-v853','.sonic-mini-output-v853','@media(max-width:650px)','@media(prefers-reduced-motion:reduce)'])assert(css.includes(str),str);
const write=read('app/api/spotify/playlists/play/route.ts');assert(write.includes('sonic:spotify-playback-v853')===false,'Notify clients only after successful UI fetch, not server route');
const serverFile=read('lib/spotify-playlists-server-v851.ts');assert(serverFile.includes('"GET"|"PUT"|"POST"'), 'Helper supports Spotify skip commands');
const json=(body,{status=200}={})=>({body,status,headers:{set(){}}});
let scopes='user-modify-playback-state',calls=[],replies=[];
const fakeServer={
 spotifyRouteV851:async(required,cb)=>required.every(s=>scopes.includes(s))?cb({session:{},refreshed:false}):json({code:'consent_required'},{status:403}),
 spotifyCallV851:async(v,path,method)=>{calls.push({path,method});const status=replies.shift()??204;return {response:{status,ok:status>=200&&status<300,headers:{get:()=>null}},valid:v};},
 playlistErrorV851:r=>json({code:'spotify_error'},{status:r.status}),
 playlistFinishV851:r=>r,playlistJsonV851:(body,status=200)=>json(body,{status}),playlistUnauthV851:()=>json({code:'reauth_required'},{status:401})
};
const route=load('app/api/spotify/player/control/route.ts',{'@/lib/spotify-origin':{spotifyCallbackUrl:()=>new URL('http://127.0.0.1:3000/api/spotify/callback')},'@/lib/spotify-mini-player-v853':core,'@/lib/spotify-playlists-server-v851':fakeServer});
const request=(body,origin='http://127.0.0.1:3000')=>({headers:{get:name=>name==='origin'?origin:null},json:async()=>body});
(async()=>{
 let r=await route.POST(request({action:'pause'},'https://attacker.test'));assert.equal(r.status,403);assert.equal(calls.length,0);
 r=await route.POST(request({action:'skip'}));assert.equal(r.status,400);assert.equal(calls.length,0);
 scopes='user-read-playback-state';r=await route.POST(request({action:'next'}));assert.equal(r.status,403);assert.equal(calls.length,0);
 scopes='user-modify-playback-state';for(const action of ['pause','resume','next','previous']){r=await route.POST(request({action}));assert.equal(r.status,200);assert.equal(r.body.action,action);assert.deepEqual(calls.at(-1),core.playbackPathV853(action));}
 replies=[403];r=await route.POST(request({action:'pause'}));assert.equal(r.status,403);
 replies=[429];r=await route.POST(request({action:'next'}));assert.equal(r.status,429);
 replies=[401];r=await route.POST(request({action:'previous'}));assert.equal(r.status,401);
 console.log('PASS V853 Spotify mini-player: commands, CSRF, scopes, statuses, shared state, device refresh, UI and responsive styling');
})().catch(e=>{console.error(e);process.exitCode=1;});
