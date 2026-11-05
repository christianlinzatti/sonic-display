#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function loadPure(name){
 const src=ts.transpileModule(read(name),{fileName:name,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(src.diagnostics?.length||0,0);
 const m={exports:{}};vm.runInNewContext(src.outputText,{module:m,exports:m.exports,require(){throw Error('Unexpected runtime dependency');}},{timeout:9000,filename:name});
 return m.exports;
}
const policy=loadPure('lib/alexaConcertV967.ts');
const base={enabled:false,hardwareSync:true,virtualFx:false,immersiveV966:false,strength:55,immersiveStrengthV966:60,
 schema:'ultimate-concert-v958',timeline:{track:[{atMs:1}]},presets:[{id:'foo'}],roleOverrides:{}};
let count=0;const test=(title,fn)=>{count++;Promise.resolve().then(fn).then(()=>console.log('PASS V967 '+title),e=>{console.error('FAIL '+title,e);process.exitCode=1;});};
test('opt-in is explicit and no voice command can enable hardware',()=>{
 assert(policy.ALEXA_LOCAL_ENABLED_KEY_V967.includes('v967'));
 for(const cmd of policy.ALEXA_CONCERT_COMMANDS_V967){
  const out=policy.applyAlexaConcertCommandV967(base,cmd);
  assert.equal(out.hardwareSync,false,cmd);
  assert.equal(out.timeline,base.timeline);
  assert.equal(out.presets,base.presets);
 }
});
test('recognizes only predefined command names',()=>{
 for(const command of ['play','next','volume','govee-on','strobe',null,{},'Arena','spotify'])
  assert.equal(policy.isAlexaConcertCommandV967(command),false,String(command));
 for(const cmd of policy.ALEXA_CONCERT_COMMANDS_V967)assert.equal(policy.isAlexaConcertCommandV967(cmd),true);
});
test('show modes and virtual FX work while stop fails closed',()=>{
 const arena=policy.applyAlexaConcertCommandV967(base,'arena');
 assert.equal(arena.enabled,true);assert.equal(arena.immersiveV966,true);
 const festival=policy.applyAlexaConcertCommandV967(base,'festival');
 assert(festival.immersiveStrengthV966>arena.immersiveStrengthV966);
 const calm=policy.applyAlexaConcertCommandV967(base,'calm');
 assert(calm.immersiveStrengthV966<arena.immersiveStrengthV966);
 const stopped=policy.applyAlexaConcertCommandV967(festival,'stop');
 assert.equal(stopped.enabled,false);assert.equal(stopped.virtualFx,false);assert.equal(stopped.hardwareSync,false);
 const fxOff=policy.applyAlexaConcertCommandV967(festival,'fx-off');assert.equal(fxOff.virtualFx,false);
 const fxOn=policy.applyAlexaConcertCommandV967(fxOff,'fx-on');assert.equal(fxOn.virtualFx,true);
});
test('stale, forged and future commands cannot apply',()=>{
 const now=Date.now();const valid={id:'12345678-1234-1234-1234-123456789abc',command:'festival',createdAt:now};
 assert(policy.canApplyAlexaCommandV967(valid,now-1000,now));
 for(const command of [null,{...valid,command:'play'},{...valid,id:'bad'},{...valid,createdAt:now-76000},
  {...valid,createdAt:now+7000},{...valid,createdAt:now-5000}])
  assert.equal(policy.canApplyAlexaCommandV967(command,now,now),false,JSON.stringify(command));
});
test('forbidden APIs absent from pure policy and Lambda',()=>{
 for(const f of ['lib/alexaConcertV967.ts','integrations/alexa/handler.cjs','app/api/alexa/command/route.ts']){
  const source=read(f).toLowerCase();
  for(const bad of ['api/spotify','/v1/me/player','goveebridgerequest','strobe','microphone','volume'])
   assert(!source.includes(bad),`${f}: ${bad}`);
 }
});
test('server request authentication is mandatory and serverless-safe',()=>{
 const backend=read('app/api/alexa/command/route.ts');
 for(const marker of ['createHmac','timingSafeEqual','claimAlexaNonceV967','Date.now()-Number(stamp)','alexaRelayConfiguredV967','saveAlexaCommandV967'])
  assert(backend.includes(marker),marker);
 const pending=read('app/api/alexa/pending/route.ts');
 assert(pending.includes('getValidSession()'));
 assert(!pending.includes('ALEXA_BRIDGE_SECRET:'));
 assert(read('lib/alexaRedisV967.ts').includes("'EX',75"));
 assert(read('lib/alexaRedisV967.ts').includes("'NX'"));
});
test('client polls only opt-in and propagates settings events',()=>{
 const ui=read('components/AlexaConcertControlV967.tsx');
 assert(ui.includes('if(!enabled||enabledSince<=0)return'));
 assert(ui.includes('canApplyAlexaCommandV967'));
 assert(ui.includes('loadConcertRoadmapV958()'));
 assert(ui.includes('saveConcertRoadmapV958('));
 assert(ui.includes('clearInterval(timer)'));
 const studio=read('components/ConcertRoadmapStudioV958.tsx');
 assert(studio.includes('<AlexaConcertControlV967/>'));
 assert(studio.includes('window.addEventListener(CONCERT_ROADMAP_EVENT_V958,refresh)'));
});
test('integration model and protected AWS skill identities',()=>{
 const model=JSON.parse(read('integrations/alexa/interaction-model.de-DE.json'));
 assert.equal(model.interactionModel.languageModel.invocationName,'sonic display');
 const intents=model.interactionModel.languageModel.intents.map(i=>i.name);
 for(const i of ['ArenaIntent','FestivalIntent','ClubIntent','CalmIntent','StopShowIntent','VirtualFxOnIntent','VirtualFxOffIntent','StatusIntent'])assert(intents.includes(i));
 const c=read('integrations/alexa/handler.cjs');assert(c.includes('incomingSkill!==skill||incomingUser!==allowed'));
 assert(c.includes("new URL('/api/alexa/command',origin)"));
});
const lambda=require('../integrations/alexa/handler.cjs');
const originalFetch=global.fetch;
const originalEnv={...process.env};
const setup=()=>{
 process.env.ALEXA_SKILL_ID='amzn1.ask.skill.00000000-0000-0000-0000-000000000000';
 process.env.ALEXA_ALLOWED_USER_ID='alexa-private-user';
 process.env.ALEXA_BRIDGE_SECRET='this-is-a-long-test-secret-that-is-over-32-chars';
 process.env.SONIC_DISPLAY_ORIGIN='https://sonic.example';
};
const event=(name='FestivalIntent')=>({
 session:{application:{applicationId:process.env.ALEXA_SKILL_ID},user:{userId:process.env.ALEXA_ALLOWED_USER_ID}},
 request:{type:'IntentRequest',timestamp:new Date().toISOString(),intent:{name}}
});
// Serialized Lambda cases avoid fake-fetch races and restore globals afterwards.
test('Lambda rejects unlinked user, invalid skill, stale time and fake endpoint; sends only signed commands',async()=>{
 setup();let calls=0;let payload=null;
 global.fetch=async (url,init)=>{
  calls++;payload={url:String(url),headers:init.headers,body:init.body};
  return {ok:true,json:async()=>({queued:true})};
 };
 try{
  let e=event();e.session.user.userId='intruder';await lambda.handler(e);assert.equal(calls,0);
  e=event();e.session.application.applicationId='other';await lambda.handler(e);assert.equal(calls,0);
  e=event();e.request.timestamp='2000-01-01T00:00:00Z';await lambda.handler(e);assert.equal(calls,0);
  process.env.SONIC_DISPLAY_ORIGIN='http://localhost:3000';await lambda.handler(event());assert.equal(calls,0);
  process.env.SONIC_DISPLAY_ORIGIN='https://sonic.example';
  const res=await lambda.handler(event());assert.equal(calls,1);assert.equal(payload.url,'https://sonic.example/api/alexa/command');
  assert.equal(JSON.parse(payload.body).command,'festival');
  const h=payload.headers;
  const expected=require('node:crypto').createHmac('sha256',process.env.ALEXA_BRIDGE_SECRET)
   .update(`${h['x-sonic-timestamp']}.${h['x-sonic-nonce']}.${payload.body}`).digest('hex');
  assert.equal(h['x-sonic-signature'],expected);
  assert.match(res.response.outputSpeech.text,/gesendet/);
  await lambda.handler(event('SpotifyPlayIntent'));assert.equal(calls,1);
 }finally{global.fetch=originalFetch;process.env=originalEnv;}
});
process.on('beforeExit',()=>{if(!process.exitCode)console.log(`V967 PASS ${count} regression groups`);});
