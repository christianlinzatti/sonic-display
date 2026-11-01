'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ts=require('./typescript-loader.cjs');
const id='4iV5W9uYEdYUVa79Axb7Rh';
const track={id,name:'Test Song',duration_ms:190000,artists:[{name:'Artist'}],album:{name:'Test Album',images:[{url:'https://i.scdn.co/image/x'}]}};
const response=(status,body={},headers={})=>({status,ok:status>=200&&status<300,headers:new Headers(headers),json:async()=>body});
const history={items:[{played_at:'2026-10-27T11:35:00.000Z',track}],next:null,cursors:{}};
let session, calls=[], answer, refreshed=0, failures=0, cookies=0;
const statusBody=(body,{status=200,headers={}}={})=>({body,status,headers:new Headers(headers),cookies:{set(){cookies++;}}});
const mocks={
 'next/server':{NextResponse:{json:statusBody}},
 '@/lib/spotify':{getValidSession:async()=>session,refreshSession:async()=>{refreshed++;return {accessToken:'new',scopes:'user-read-recently-played'};},ReauthRequiredError:class ReauthRequiredError extends Error{}},
 '@/lib/session':{clearSessionCookie:(res)=>res.cookies.set(),setSessionCookie:(res)=>res.cookies.set()},
 '@/lib/recently-played-v672':(function(){const exports={};const js=ts.transpileModule(fs.readFileSync('lib/recently-played-v672.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(js,{exports,Date,Array,Number,Math,Boolean,Object,RegExp,URL});return exports;})(),
};
const source=ts.transpileModule(fs.readFileSync('app/api/spotify/recently-played/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const routeExports={};
vm.runInNewContext(source,{exports:routeExports,require:(x)=>{if(!mocks[x])throw Error(`Unknown import ${x}`);return mocks[x];},fetch:async(url,init)=>{calls.push({url,init});return answer;},Headers,AbortSignal,URL,URLSearchParams,Date,Number,Object,Boolean,Error,RegExp,Math});
const req=(before)=>({nextUrl:{searchParams:new URLSearchParams(before?{before}:{})}});
const test=async(name,fn)=>{try{await fn();console.log(`PASS V672 API: ${name}`);}catch(e){failures++;console.error(`FAIL V672 API: ${name}`,e);}};
async function run(){
 await test('invalid cursor blocked before Spotify',async()=>{calls=[];const r=await routeExports.GET(req('notanumber'));assert.equal(r.status,400);assert.equal(calls.length,0);});
 await test('not signed in',async()=>{session=null;calls=[];const r=await routeExports.GET(req());assert.equal(r.status,401);assert.equal(calls.length,0);});
 await test('missing user-read-recently-played scope',async()=>{session={session:{accessToken:'old',scopes:'user-read-currently-playing'},refreshed:false};calls=[];const r=await routeExports.GET(req());assert.equal(r.status,403);assert.equal(r.body.code,'consent_required');assert.equal(calls.length,0);});
 await test('one authorized request, normalized response',async()=>{session={session:{accessToken:'old',scopes:'user-read-recently-played'},refreshed:false};answer=response(200,history);calls=[];const r=await routeExports.GET(req());assert.equal(r.status,200);assert.equal(r.body.tracks.length,1);assert.equal(r.body.tracks[0].id,id);assert(!JSON.stringify(r.body).includes('accessToken'));assert.equal(r.headers.get('Cache-Control'),'private, no-store');assert(calls[0].url.includes('limit=30'));assert.equal(calls[0].init.cache,'no-store');});
 await test('cursor is forwarded only after validation',async()=>{answer=response(200,history);calls=[];const r=await routeExports.GET(req('1793100000000'));assert.equal(r.status,200);assert(calls[0].url.endsWith('&before=1793100000000'));});
 await test('Spotify 429 signals retry-after',async()=>{answer=response(429,{}, {'Retry-After':'17'});const r=await routeExports.GET(req());assert.equal(r.status,429);assert.equal(r.headers.get('Retry-After'),'17');});
 await test('Spotify 401 refreshes and retries exactly once',async()=>{let count=0;const old=mocks['@/lib/spotify'].refreshSession;answer=response(401); // emulate sequential fetch
 const originalCalls=calls;calls=[];
 const mockFetch=async(url,init)=>{calls.push({url,init});return ++count===1?response(401):response(200,history);};
 const next={};vm.runInNewContext(source,{exports:next,require:(x)=>mocks[x],fetch:mockFetch,Headers,AbortSignal,URL,URLSearchParams,Date,Number,Object,Boolean,Error,RegExp,Math});
 const c=cookies;const r=await next.GET(req());assert.equal(r.status,200);assert.equal(calls.length,2);assert.equal(refreshed,1);assert.equal(cookies,c+1);calls=originalCalls;mocks['@/lib/spotify'].refreshSession=old;
 });
 if(failures)process.exitCode=1;else console.log('PASS V672 API integration: 7 scenarios');
}
run().catch(err=>{console.error(err);process.exitCode=1;});
