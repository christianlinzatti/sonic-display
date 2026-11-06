'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const ts=require('./typescript-loader.cjs');const pure=require('./helpers/ts-loader-v404.cjs').load('lib/alexaVoiceV1008');
const values=new Map(),nonces=new Set();let authenticated=true,configured=true,probeStatus=204;
async function redis(cmd,key,...args){
 if(cmd==='SET'){if(args.includes('NX')&&values.has(key))return null;values.set(key,args[0]);return 'OK';}
 if(cmd==='GET')return values.get(key)??null;
 if(cmd==='MGET')return [key,...args].map(k=>values.get(k)??null);
 if(cmd==='RPUSH'){const list=values.get(key)||[];list.push(args[0]);values.set(key,list);return list.length;}
 if(cmd==='LTRIM'){values.set(key,(values.get(key)||[]).slice(Number(args[0])));return 'OK';}
 if(cmd==='LRANGE')return values.get(key)||[];
 if(cmd==='EXPIRE')return 1;
 if(cmd==='PING')return 'PONG';throw Error('Unexpected Redis '+cmd);
}
function load(file,deps){const mod={exports:{}};const source=ts.transpileModule(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(source,{module:mod,exports:mod.exports,require:name=>{assert.ok(name in deps,name);return deps[name];},process,Buffer,Response,Request,Date,console,AbortSignal,fetch:async()=>({status:probeStatus})});return mod.exports;}
const store=load('lib/alexaVoiceStoreV1008.ts',{'node:crypto':crypto,'./push-storage-v365':{redis}});
const relay={alexaRelayConfiguredV967:()=>configured,claimAlexaNonceV967:async nonce=>{if(nonces.has(nonce))return false;nonces.add(nonce);return true;}};
const voice=load('app/api/alexa/voice/route.ts',{'node:crypto':crypto,'@/lib/alexaRedisV967':relay,'@/lib/alexaVoiceV1008':pure,'@/lib/alexaVoiceStoreV1008':store});
const browser=load('app/api/alexa/voice-result/route.ts',{'next/server':{NextResponse:{json:(value,options)=>Object.assign(Response.json(value,options),{cookies:{set(){}}})}},'@/lib/session':{setSessionCookie(){},clearSessionCookie(){}},'@/lib/spotify':{getValidSession:async()=>authenticated?{session:{}}:null,ReauthRequiredError:class extends Error{}},'@/lib/spotify-origin':{spotifyCallbackUrl:()=>new URL('https://sonic-display.test')},'@/lib/alexaVoiceV1008':pure,'@/lib/alexaVoiceStoreV1008':store});
const old=process.env.ALEXA_BRIDGE_SECRET;const secret=process.env.ALEXA_BRIDGE_SECRET='unit-only-bridge-secret-at-least-32-characters';
function signed(body,overrides={}){const raw=JSON.stringify(body),stamp=String(Date.now()),nonce=crypto.randomUUID();const sig=crypto.createHmac('sha256',secret).update(`${stamp}.${nonce}.${raw}`).digest('hex');return new Request('https://sonic-display.test/api/alexa/voice',{method:'POST',headers:{'content-type':'application/json','x-sonic-timestamp':stamp,'x-sonic-nonce':nonce,'x-sonic-signature':sig,...overrides},body:raw});}
function request(body,origin='https://sonic-display.test'){return new Request(origin+'/api/alexa/voice-result',{method:'POST',headers:{Origin:origin,'content-type':'application/json'},body:JSON.stringify(body)});}
(async()=>{try{
 let req=signed({command:'artist-follow-all'});const replay=req.clone();let r=await voice.POST(req);assert.equal(r.status,200);const {id}=await r.json();assert.equal((await voice.POST(replay)).status,409);
 assert.equal((await voice.POST(signed({command:'play'}))).status,400);
 assert.equal((await voice.POST(signed({command:'artist-follow'},{'x-sonic-signature':'0'.repeat(64)}))).status,401);
 const queue=await store.pendingVoiceV1008();assert.equal(queue.length,1);assert.equal(queue[0].id,id);
 assert.equal((await browser.POST(request({phase:'claim',id},'https://foreign.invalid'))).status,403);
 authenticated=false;assert.equal((await browser.POST(request({phase:'claim',id}))).status,401);authenticated=true;
 r=await browser.POST(request({phase:'claim',id}));assert.equal(r.status,200);const {token}=await r.json();assert.equal((await store.pendingVoiceV1008()).length,0);assert.equal((await browser.POST(request({phase:'claim',id}))).status,409);
 const result={kind:'complete',text:'Confirmed by Spotify'};
 assert.equal((await browser.POST(request({phase:'complete',id,token:crypto.randomUUID(),result}))).status,409);
 assert.equal((await browser.POST(request({phase:'complete',id,token,result}))).status,200);
 assert.equal((await browser.POST(request({phase:'complete',id,token,result}))).status,409);
 r=await voice.POST(signed({read:id}));assert.equal((await r.json()).result.text,result.text);
 r=await voice.POST(signed({read:'latest'}));assert.equal((await r.json()).result.text,result.text);
 const health=load('app/api/alexa/status/route.ts',{
  '@/lib/spotify':{getValidSession:async()=>authenticated?{session:{accessToken:'unit-token',scopes:'user-follow-read user-follow-modify'},refreshed:false}:null,refreshSession:async()=>{throw Error('Probe rejected');},ReauthRequiredError:class extends Error{}},
  '@/lib/session':{setSessionCookie(){},clearSessionCookie(){}},'next/server':{NextResponse:{json:(data,options)=>Object.assign(Response.json(data,options),{cookies:{set(){}}})}},
  '@/lib/alexaRedisV967':relay,'@/lib/push-storage-v365':{redis},'@/lib/artist-follow-v359':require('./helpers/ts-loader-v404.cjs').load('lib/artist-follow-v359')});
 r=await health.GET();assert.equal(r.status,200);assert.equal((await r.json()).relay,'ready');
 authenticated=false;assert.equal((await health.GET()).status,401);authenticated=true;
 probeStatus=500;r=await health.GET();assert.equal(r.status,503);assert.equal((await r.json()).spotify,false);probeStatus=204;
 configured=false;r=await health.GET();assert.equal((await r.json()).relay,'not-configured');
 assert.equal((await voice.POST(signed({read:id}))).status,503);
 console.log('PASS V1008 real relay/store: HMAC, replay denial, FIFO delivery, auth/Origin, exclusive claim, result token and duplicate completion');
 }finally{if(old===undefined)delete process.env.ALEXA_BRIDGE_SECRET;else process.env.ALEXA_BRIDGE_SECRET=old;}
})().catch(e=>{console.error(e);process.exitCode=1;});
