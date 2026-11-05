#!/usr/bin/env node
'use strict';
/** Exercise signed server request paths without Next runtime, cloud calls or credentials. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createHmac}=require('node:crypto');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
let nonceUsed=new Set(),published=[],loggedIn=true,configured=true,failRedis=false;
const redis={
 alexaRelayConfiguredV967:()=>configured,
 claimAlexaNonceV967:async n=>{if(failRedis)throw Error('Redis unavailable');if(nonceUsed.has(n))return false;nonceUsed.add(n);return true;},
 saveAlexaCommandV967:async m=>{if(failRedis)throw Error('Redis unavailable');published.push(m);},
 readAlexaCommandV967:async()=>published.at(-1)||null
};
function load(file){
 const source=fs.readFileSync(path.join(root,file),'utf8');
 const compiled=ts.transpileModule(source,{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
 assert.equal(compiled.diagnostics?.length||0,0);
 const mod={exports:{}};const dependencies={
  'node:crypto':require('node:crypto'),
  '@/lib/alexaConcertV968':{isAlexaConcertCommandV968:c=>['arena','festival','club','calm','stop','fx-on','fx-off',
   'zone-stage','zone-backdrop','zone-audience','zone-all','mood-warm','mood-cool','mood-neon','mood-auto',
   'effect-beams','effect-fog','effect-confetti','effect-streamers','effect-auto','effect-off'].includes(c)},
  '@/lib/alexaConcertV969':{isAlexaConcertCommandV969:c=>['preset-rap','preset-hardtekk','preset-rock','preset-cinema','preset-auto'].includes(c)},
  '@/lib/alexaGoveeV970':{isAlexaCommandV970:c=>['govee-arena','govee-festival','govee-club','govee-calm','govee-dim','govee-auto',
   'preset-rap','preset-hardtekk','preset-rock','preset-cinema','preset-auto'].includes(c)},
  '@/lib/alexaRedisV967':redis,
  '@/lib/spotify':{getValidSession:async()=>loggedIn?{session:{}}:null}
 };
 vm.runInNewContext(compiled.outputText,{exports:mod.exports,module:mod,require:name=>{
  if(!(name in dependencies))throw Error('Unknown dependency: '+name);return dependencies[name];
 },process,Buffer,Response,Request,Date,Number,JSON,console},{filename:file,timeout:12000});
 return mod.exports;
}
const cmd=load('app/api/alexa/command/route.ts'),pending=load('app/api/alexa/pending/route.ts');
const original=process.env.ALEXA_BRIDGE_SECRET;
process.env.ALEXA_BRIDGE_SECRET='a-long-realistic-test-secret-with-more-than-32-characters';
const base='https://example.test/api/alexa/command';
const signing=(command='festival',override={})=>{
 const body=JSON.stringify({command});const stamp=String(Date.now());const nonce='12345678-1234-1234-1234-'+String(nonceUsed.size+1).padStart(12,'0');
 const signature=createHmac('sha256',process.env.ALEXA_BRIDGE_SECRET).update(`${stamp}.${nonce}.${body}`).digest('hex');
 return new Request(base,{method:'POST',headers:{'content-type':'application/json','x-sonic-timestamp':stamp,'x-sonic-nonce':nonce,'x-sonic-signature':signature,...override},body});
};
(async()=>{
 try{
  let response=await cmd.POST(signing());assert.equal(response.status,200);assert.equal(published.length,1);
  let request=signing();const replay=request.clone();response=await cmd.POST(request);assert.equal(response.status,200);
  // Same timestamp/nonce/body/signature is a replay even if header signatures are valid.
  response=await cmd.POST(replay);assert.equal(response.status,409);assert.equal(published.length,2);
  request=signing('zone-stage');response=await cmd.POST(request);assert.equal(response.status,200);
  assert.equal(published.at(-1).command,'zone-stage');
  request=signing('mood-neon');response=await cmd.POST(request);assert.equal(response.status,200);
  assert.equal(published.at(-1).command,'mood-neon');
  request=signing('effect-fog');response=await cmd.POST(request);assert.equal(response.status,200);
  assert.equal(published.at(-1).command,'effect-fog');
  request=signing('preset-hardtekk');response=await cmd.POST(request);assert.equal(response.status,200);
  assert.equal(published.at(-1).command,'preset-hardtekk');
  request=signing('effect-flash');response=await cmd.POST(request);assert.equal(response.status,400);
  request=signing('play');response=await cmd.POST(request);assert.equal(response.status,400);
  request=signing('arena',{'x-sonic-signature':'0'.repeat(64)});response=await cmd.POST(request);assert.equal(response.status,401);
  request=signing('arena',{'x-sonic-timestamp':String(Date.now()-200000)});response=await cmd.POST(request);assert.equal(response.status,401);
  configured=false;response=await cmd.POST(signing());assert.equal(response.status,503);configured=true;
  failRedis=true;response=await cmd.POST(signing());assert.equal(response.status,503);failRedis=false;
  response=await pending.GET();assert.equal(response.status,200);assert.equal((await response.json()).command.command,'preset-hardtekk');
  request=signing('govee-festival');response=await cmd.POST(request);assert.equal(response.status,200);
  assert.equal(published.at(-1).command,'govee-festival');
  request=signing('govee-on');response=await cmd.POST(request);assert.equal(response.status,400);
  request=signing('govee-strobe');response=await cmd.POST(request);assert.equal(response.status,400);
  loggedIn=false;response=await pending.GET();assert.equal(response.status,401);
  loggedIn=true;configured=false;response=await pending.GET();assert.equal(response.status,503);
  console.log('V967–V970 PASS signed relay including private Govee opt-in command transport');
 }finally{
  if(original===undefined)delete process.env.ALEXA_BRIDGE_SECRET;
  else process.env.ALEXA_BRIDGE_SECRET=original;
 }
})().catch(e=>{console.error('V967 relay FAIL',e);process.exitCode=1;});
