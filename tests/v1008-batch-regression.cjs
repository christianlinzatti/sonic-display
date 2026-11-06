'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs'),artist=require('./helpers/ts-loader-v404.cjs').load('lib/artist-follow-v359');
const A='2takcwOaAZWiXQijPHIx7B',B='74ASZWbe4lXaubB36ztrGX',T='1234567890abcdefghij12';
let authenticated=true,scopes='user-follow-read user-follow-modify',currentTrack=T,states={},calls=[],partial=false;
const nativeResponse=(data,status=200)=>({ok:status>=200&&status<300,status,json:async()=>data});
const fetcher=async(raw,options)=>{
 const url=new URL(raw);calls.push({url,method:options.method});
 if(url.pathname.endsWith('currently-playing'))return nativeResponse({item:{id:currentTrack,artists:[{id:A},{id:B}]}});
 const ids=(url.searchParams.get('uris')||'').split(',').map(uri=>uri.replace('spotify:artist:',''));
 if(url.pathname.endsWith('contains'))return nativeResponse(ids.map(id=>states[id]===true));
 assert.equal(url.pathname,'/v1/me/library');
 for(const id of ids)if(!(partial&&id===B))states[id]=options.method==='PUT';return nativeResponse(null,204);
};
const next={json:(data,options={})=>Object.assign(Response.json(data,options),{cookies:{set(){}}})};
const mod={exports:{}};class ReauthRequiredError extends Error{}
const deps={'next/server':{NextResponse:next},'@/lib/spotify':{getValidSession:async()=>authenticated?{session:{accessToken:'unit-token',scopes},refreshed:false}:null,refreshSession:async()=>{throw Error('Unexpected refresh');},ReauthRequiredError},'@/lib/session':{clearSessionCookie(){},setSessionCookie(){}},'@/lib/spotify-origin':{spotifyCallbackUrl:()=>new URL('https://sonic-display.test')},'@/lib/artist-follow-v359':artist};
const source=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../app/api/spotify/artists/follow-batch/route.ts'),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
vm.runInNewContext(source,{module:mod,exports:mod.exports,require:name=>{assert.ok(deps[name],name);return deps[name];},Response,Buffer,AbortSignal,fetch:fetcher});
function request(value,origin='https://sonic-display.test'){return new Request('https://sonic-display.test/api/spotify/artists/follow-batch',{method:'POST',headers:{Origin:origin},body:JSON.stringify(value)});}
const body={changes:[{artistId:A,follow:true},{artistId:B,follow:true}],trackId:T};
(async()=>{
 states={[A]:false,[B]:true};let response=await mod.exports.POST(request(body));assert.equal(response.status,200);let data=await response.json();assert.equal(data.confirmed,true);assert.equal(data.values[0].before,false);assert.equal(data.values[1].before,true);
 assert.equal(calls.filter(c=>c.method==='PUT').length,1);assert.ok(states[A]&&states[B]);
 calls=[];currentTrack='changedtrack12345678901';response=await mod.exports.POST(request(body));assert.equal(response.status,409);assert.equal(calls.some(c=>c.method!=='GET'),false);currentTrack=T;
 calls=[];response=await mod.exports.POST(request({changes:[{artistId:A,follow:false}],expected:{[A]:false}}));assert.equal(response.status,409);assert.equal(calls.some(c=>c.method!=='GET'),false);
 response=await mod.exports.POST(request({changes:[{artistId:A,follow:false}],expected:{[A]:true}}));assert.equal(response.status,200);assert.equal(states[A],false);assert.equal(states[B],true);
 states={[A]:false,[B]:false};partial=true;response=await mod.exports.POST(request(body));assert.equal(response.status,409);assert.equal((await response.json()).confirmed,undefined);partial=false;
 calls=[];response=await mod.exports.POST(request(body,'https://foreign.invalid'));assert.equal(response.status,403);assert.equal(calls.length,0);
 authenticated=false;response=await mod.exports.POST(request(body));assert.equal(response.status,401);authenticated=true;
 scopes='user-follow-read';response=await mod.exports.POST(request(body));assert.equal(response.status,403);scopes='user-follow-read user-follow-modify';
 response=await mod.exports.POST(request({changes:[{artistId:A,follow:true},{artistId:A,follow:true}]}));assert.equal(response.status,400);
 console.log('PASS V1008 batch API: current full artist set, one bulk mutation, prior states, guarded undo, partial failure, auth, Origin and scopes');
})().catch(error=>{console.error(error);process.exitCode=1;});
