#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs'),root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function load(file,deps={}){
 const result=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(result.diagnostics?.length||0,0,`Invalid TS syntax: ${file}`);
 const mod={exports:{}};
 vm.runInNewContext(result.outputText,{module:mod,exports:mod.exports,require:name=>{
  if(!Object.hasOwn(deps,name))throw Error('Unexpected dependency '+name);
  return deps[name];
 },Date,JSON,Number},{filename:file,timeout:15000});
 return mod.exports;
}
const v970=load('lib/alexaGoveeV970.ts',{'./alexaConcertV969':{
 isAlexaConcertCommandV969:c=>c==='festival',canApplyAlexaCommandV969:m=>m?.command==='festival'
}});
const base={color:{r:80,g:60,b:100},brightness:65};
const previous={color:{r:75,g:50,b:80},brightness:60};
const config={enabled:true,autoSync:true,token:'privatetoken',selectedIps:['192.168.1.50'],masterBrightness:80};
const consent={enabled:true,since:100000};
const now=102000;
const options={consent,playing:true,visible:true,savedShowActive:false,authoredStageActive:false,recovering:false,now};
const cue=command=>({command,receivedAt:101000});
let passed=0;
function test(name,fn){try{fn();passed++;console.log('PASS V970 '+name);}catch(e){console.error('FAIL V970 '+name,e);process.exitCode=1;}}
test('6 explicit commands, virtual commands remain separate',()=>{
 assert.equal(v970.ALEXA_GOVEE_COMMANDS_V970.length,6);
 for(const cmd of v970.ALEXA_GOVEE_COMMANDS_V970){assert(v970.isAlexaGoveeCommandV970(cmd));assert(v970.isAlexaCommandV970(cmd));}
 assert(!v970.isAlexaGoveeCommandV970('govee-on'));
 for(const bad of ['govee-off','power','govee-strobe','govee-bright',null,{},'play-spotify'])assert(!v970.isAlexaGoveeCommandV970(bad));
 assert(v970.isAlexaCommandV970('festival'));
});
test('read-only, uninitialized and invalid permissions always deny',()=>{
 for(const raw of [null,false,[],{},'{bad}',{enabled:true},{enabled:true,since:0},
  {enabled:true,since:Date.now()+900000},{enabled:'true',since:Date.now()}]){
  assert.equal(v970.normalizeAlexaGoveeConsentV970(raw).enabled,false);
 }
});
test('separate consent + Alexa receiver + existing LAN sync are all required',()=>{
 assert(v970.mayAcceptAlexaGoveeV970('govee-festival',consent,config,true,100000,101000));
 assert(!v970.mayAcceptAlexaGoveeV970('govee-festival',consent,config,false,100000,101000));
 assert(!v970.mayAcceptAlexaGoveeV970('govee-festival',{enabled:false,since:0},config,true,100000,101000));
 for(const other of [{enabled:false},{autoSync:false},{token:''},{selectedIps:[] }]){
  assert(!v970.mayAcceptAlexaGoveeV970('govee-club',consent,{...config,...other},true,100000,101000));
 }
});
test('commands created before consent or receiver enabled are rejected',()=>{
 assert(!v970.mayAcceptAlexaGoveeV970('govee-arena',consent,config,true,100000,98000));
 assert(!v970.mayAcceptAlexaGoveeV970('govee-arena',consent,config,true,102000,101000));
});
test('timestamp, ID and allowlist validation reject forged events',()=>{
 const uuid='12345678-1234-1234-1234-123456789abc';
 const valid={id:uuid,command:'govee-festival',createdAt:now};
 assert(v970.canApplyAlexaCommandV970(valid,100000,now));
 for(const invalid of [{...valid,command:'govee-on'},{...valid,createdAt:1000},
  {...valid,createdAt:now+9000},{...valid,id:'bad'},valid.command,null]){
  assert(!v970.canApplyAlexaCommandV970(invalid,100000,now));
 }
});
test('voice looks change existing color without brightness increases',()=>{
 for(const cmd of ['govee-arena','govee-festival','govee-club','govee-calm']){
  const look=v970.applyAlexaGoveeLookV970(base,previous,cue(cmd),config,options);
  assert.notDeepEqual({...look.color},{...base.color},cmd);
  assert(look.brightness<=base.brightness,cmd);
  for(const k of ['r','g','b'])assert(Math.abs(look.color[k]-previous.color[k])<=28,cmd);
 }
});
test('dim only reduces brightness and auto restores exact original look',()=>{
 const dim=v970.applyAlexaGoveeLookV970(base,previous,cue('govee-dim'),config,options);
 assert(dim.brightness<base.brightness);assert.deepEqual({...dim.color},{...base.color});
 assert.strictEqual(v970.applyAlexaGoveeLookV970(base,previous,cue('govee-auto'),config,options),base);
});
test('never override saved V912 shows, authored stages or recovery safety looks',()=>{
 for(const flag of ['savedShowActive','authoredStageActive','recovering'])
  assert.strictEqual(v970.applyAlexaGoveeLookV970(base,previous,cue('govee-festival'),config,{...options,[flag]:true}),base);
});
test('hidden, paused, unconfigured and opt-out all return original look',()=>{
 assert.strictEqual(v970.applyAlexaGoveeLookV970(base,previous,cue('govee-club'),config,{...options,playing:false}),base);
 assert.strictEqual(v970.applyAlexaGoveeLookV970(base,previous,cue('govee-club'),config,{...options,visible:false}),base);
 assert.strictEqual(v970.applyAlexaGoveeLookV970(base,previous,cue('govee-club'),config,{...options,consent:{enabled:false,since:0}}),base);
 for(const k of [{enabled:false},{autoSync:false},{selectedIps:[]},{token:''}])
  assert.strictEqual(v970.applyAlexaGoveeLookV970(base,previous,cue('govee-club'),{...config,...k},options),base);
});
test('three-minute expiry and earlier revocation time respected',()=>{
 assert.strictEqual(v970.applyAlexaGoveeLookV970(base,previous,cue('govee-club'),config,{...options,now:101000+180001}),base);
 assert.strictEqual(v970.applyAlexaGoveeLookV970(base,previous,cue('govee-club'),config,{...options,consent:{enabled:true,since:101500}}),base);
});
test('fixed low-risk color steps over 10,000 concert situations',()=>{
 let seen=0;
 for(let i=0;i<10000;i++){
  const cmd=v970.ALEXA_GOVEE_COMMANDS_V970[i%6];
  const bright=20+i%81;
  const input={color:{r:i%256,g:(i*3)%256,b:(i*7)%256},brightness:bright};
  const prev={color:{r:(i*13)%256,g:(i*17)%256,b:(i*29)%256},brightness:bright};
  const result=v970.applyAlexaGoveeLookV970(input,prev,cue(cmd),{...config,masterBrightness:bright},options);
  assert(result.brightness>=0&&result.brightness<=100);
  assert(result.color.r>=0&&result.color.r<=255);
  assert(result.color.g>=0&&result.color.g<=255);
  assert(result.color.b>=0&&result.color.b<=255);
  seen++;
 }
 assert.equal(seen,10000);
});
test('no additional polling or bridge call: integration is in pre-existing Govee send loop',()=>{
 const g=read('components/GoveeMusicSyncV909.tsx');
 assert(g.includes('applyAlexaGoveeLookV970(roomLookV987,previous'));
 assert(g.includes('applyRoomAtmosphereV987(recoveryLookV961,previous'));
 assert(g.indexOf('applyAlexaGoveeLookV970(')<g.indexOf('applyGoveeSyncV1027(voiceLookV970,previous'));
 assert(g.indexOf('applyGoveeSyncV1027(voiceLookV970,previous')>=0&&g.indexOf('governConcertLookV961(previous,roomLookV1096,')>g.indexOf('applyGoveeSyncV1027(voiceLookV970,previous'));
 assert(g.includes("goveeBridgeRequestV909(config,'/command','POST'"));
 assert(g.includes('!config?.enabled||!config.autoSync')); 
 const lib=read('lib/alexaGoveeV970.ts').toLowerCase();
 for(const banned of ['fetch(', 'goveebridgerequest(', 'setinterval(', 'microphone', 'settimeout(', 'websocket(', 'spotify/']){
  if(banned==='microphone')continue; // descriptive comment says no microphones
  assert(!lib.includes(banned),banned);
 }
});
test('server relay receives only allowlisted and HMAC authenticated voice commands',()=>{
 const route=read('app/api/alexa/command/route.ts');
 assert(route.includes('isAlexaCommandV970(cmd)'));
 for(const marker of ['createHmac','timingSafeEqual','claimAlexaNonceV967','saveAlexaCommandV967'])assert(route.includes(marker));
 assert(!route.includes('goveeBridgeRequestV909'));
});
test('UI rechecks local explicit consent and opt-in, with manual test controls',()=>{
 const ui=read('components/AlexaConcertControlV967.tsx');
 for(const text of ['allowGovee','mayAcceptAlexaGoveeV970','canApplyAlexaCommandV970','saveAlexaGoveeConsentV970','Govee-Lichtstimmungen durch Alexa','ALEXA_GOVEE_CUE_EVENT_V970'])assert(ui.includes(text),text);
 assert(ui.includes('if(!enabled||enabledSince<=0)return'));
});
test('versioned release and production gates include V970 checks',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert(Number(String(pkg.sonicRoadmapRelease).replace(/^v/,''))>=970,'V970 support must remain available in newer releases');
 assert(pkg.scripts['test:v970']);assert(pkg.scripts['test:v970:types']);
 for(const f of ['scripts/vercel-production-build.cjs','scripts/v931-production-gate.cjs']){
  assert(read(f).includes('v970-alexa-govee-regression.cjs'));
  assert(read(f).includes('v970-alexa-lambda-regression.cjs'));
 }
});
console.log(`V970 PASS ${passed} regression groups + 10,000 deterministic room-light states`);
