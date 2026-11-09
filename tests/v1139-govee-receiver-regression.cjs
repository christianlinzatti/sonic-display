'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const ts=require('./typescript-loader.cjs');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const old={receiver:process.env.ALEXA_GOVEE_RECEIVER_TOKEN,bridge:process.env.ALEXA_BRIDGE_SECRET};
process.env.ALEXA_GOVEE_RECEIVER_TOKEN='govee-private-receiver-abcdefghijklmnopqrstuvwxyz_12345';
process.env.ALEXA_BRIDGE_SECRET='alexa-signature-secret-totally-different-123456';
const token=process.env.ALEXA_GOVEE_RECEIVER_TOKEN;
function load(file,deps){const result=ts.transpileModule(read(file),{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
 assert.equal(result.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
 const mod={exports:{}};vm.runInNewContext(result.outputText,{module:mod,exports:mod.exports,require:id=>{assert(id in deps,id);return deps[id];},process,Buffer,Request,Response,Date,console});
 return mod.exports;}
const guard=load('lib/alexaGoveeReceiverServerV1139.ts',{'node:crypto':crypto,'./spotify-origin':{spotifyCallbackUrl:()=>new URL('https://sonic-display.test')}});
const auth=guard.authorizedAlexaGoveeReceiverV1139;
const req=(method='GET',value=token,origin='https://sonic-display.test')=>new Request('https://sonic-display.test/api/alexa/govee-pending',{method,headers:{'x-sonic-govee-receiver-token':value,...(method==='POST'?{Origin:origin}:{})}});
let command={id:'12345678-1234-1234-1234-123456789abc',command:'govee-power-on',createdAt:Date.now()};
const valid=v=>v&&typeof v==='object'&&Object.keys(v).length===1&&Number.isInteger(v.fixtureNumber)&&v.fixtureNumber>=1&&v.fixtureNumber<=4;
const deps={
 '@/lib/alexaGoveeReceiverServerV1139':{authorizedAlexaGoveeReceiverV1139:auth},
 '@/lib/alexaRedisV967':{alexaRelayConfiguredV967:()=>true},
 '@/lib/alexaVoiceStoreV1008':{pendingVoiceV1008:async()=>[
  {...command,command:'artist-follow'},{...command,command:'lyrics-off'},command,
  {...command,goveeTarget:{fixtureNumber:2}},{...command,goveeTarget:{ip:'8.8.8.8'}}],
  readVoiceMessageV1008:async()=>command,claimVoiceV1008:async()=> 'b2345678-1234-1234-1234-123456789abc',
  completeVoiceV1008:async()=>true},
 '@/lib/goveePowerV1138':{isGoveePowerCommandV1138:v=>v==='govee-power-on'||v==='govee-power-off'},
 '@/lib/goveeVoiceTargetV1141':{validGoveeVoiceTargetV1141:valid},
 '@/lib/alexaVoiceV1008':{voiceIdV1008:v=>typeof v==='string'&&/^[a-f0-9-]{36}$/i.test(v),validVoiceResultV1008:v=>v?.kind==='complete'&&typeof v.text==='string'}
};
(async()=>{try{
 assert(auth(req()));assert(!auth(req('GET','wrong-secret')));assert(!auth(req('GET',process.env.ALEXA_BRIDGE_SECRET)));
 assert(!auth(new Request('https://sonic-display.test/api/alexa/govee-pending',{headers:{'x-sonic-govee-receiver-token':token,'sec-fetch-site':'cross-site'}})));
 assert(!auth(req('POST',token,'https://evil.invalid')));assert(auth(req('POST')));
 const pending=load('app/api/alexa/govee-pending/route.ts',deps);
 let resp=await pending.GET(req());assert.equal(resp.status,200);
 const body=await resp.json();assert.equal(body.commands.length,2);assert(body.commands.every(v=>v.command==='govee-power-on'));
 assert.equal((await pending.GET(req('GET','bad'))).status,401);
 const result=load('app/api/alexa/govee-result/route.ts',deps);
 const request=(payload)=>new Request('https://sonic-display.test/api/alexa/govee-result',{method:'POST',headers:{Origin:'https://sonic-display.test','x-sonic-govee-receiver-token':token,'content-type':'application/json'},body:JSON.stringify(payload)});
 const ok=await result.POST(request({id:command.id,phase:'claim'}));assert.equal(ok.status,200);
 const fake={...deps,'@/lib/alexaVoiceStoreV1008':{...deps['@/lib/alexaVoiceStoreV1008'],readVoiceMessageV1008:async()=>({...command,command:'artist-follow'})}};
 const forbidden=load('app/api/alexa/govee-result/route.ts',fake);
 assert.equal((await forbidden.POST(request({id:command.id,phase:'claim'}))).status,403);
 assert.equal((await result.POST(request({id:command.id,phase:'complete',token:'b2345678-1234-1234-1234-123456789abc',result:{kind:'complete',text:'Okay'}}))).status,200);
 assert.equal((await result.POST(request({id:command.id,phase:'complete',token:'b2345678-1234-1234-1234-123456789abc',result:{kind:'selection',text:'Unsafe'}}))).status,400);
 for(const f of ['components/AlexaSettingsV1137.tsx','components/AlexaVoiceControlV1008.tsx'])assert(read(f).includes('alexaGoveeReceiver'),f);
 console.log('PASS V1139: standalone secret, origin, cross-site, Govee-only queue, claim and completion, no Spotify commands');
 }finally{for(const [key,value] of [['ALEXA_GOVEE_RECEIVER_TOKEN',old.receiver],['ALEXA_BRIDGE_SECRET',old.bridge]]){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
})().catch(error=>{console.error(error);process.exitCode=1;});
