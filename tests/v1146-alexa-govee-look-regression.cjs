'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const raw=ts.transpileModule(read('lib/goveeVoiceLookV1146.ts'),{fileName:'lib/goveeVoiceLookV1146.ts',reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
assert.equal(raw.diagnostics.filter(x=>x.category===ts.DiagnosticCategory.Error).length,0);
let cfg={enabled:true,autoSync:true,selectedIps:['192.168.1.10','192.168.1.11'],masterBrightness:55,token:'test-bridge',endpoint:'http://127.0.0.1:8765'};
const calls=[],stored=new Map(),win=new EventTarget(),mod={exports:{}};
const ctx={module:mod,exports:mod.exports,Date,JSON,Number,Object,Event,window:win,
 localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,String(v))},
 require:id=>{
  if(id==='./goveeLanV909')return {loadGoveeConfigV909:()=>({...cfg,selectedIps:[...cfg.selectedIps]}),
   saveGoveeConfigV909:v=>{cfg=v;},goveeBridgeRequestV909:async(_cfg,url,method,value)=>{calls.push({url,method,value});return {ok:true};}};
  if(id==='./goveePowerV1138')return {canExecuteGoveePowerV1138:v=>v.enabled&&!!v.token&&v.selectedIps.length>0};
  throw Error('unexpected import '+id);
 }};
vm.runInNewContext(raw.outputText,ctx);
const lib=mod.exports;
(async()=>{
 for(const obj of [null,{},[],{brightness:0},{brightness:101},{brightness:5.5},{brightness:'50'},{brightness:50,ip:'8.8.8.8'}])
  assert(!lib.validGoveeVoiceLookV1146('govee-brightness',obj));
 for(const obj of [{color:'arbitrary'},{color:{r:255,g:0,b:0}},{color:'red',ip:'8.8.8.8'}])
  assert(!lib.validGoveeVoiceLookV1146('govee-color',obj));
 assert(lib.validGoveeVoiceLookV1146('govee-brightness',{brightness:1}));
 assert(lib.validGoveeVoiceLookV1146('govee-brightness',{brightness:100}));
 assert(lib.validGoveeVoiceLookV1146('govee-color',{color:'warmwhite'}));
 assert(!lib.loadGoveeLookConsentV1146().enabled,'default off');
 const since=Date.now()-1000;
 const message=(command,goveeLook,createdAt=Date.now())=>({command,goveeLook,createdAt});
 const opts={since,now:Date.now,allowed:()=>lib.loadGoveeLookConsentV1146().enabled};
 await assert.rejects(()=>lib.executeAlexaGoveeVoiceLookV1146(message('govee-brightness',{brightness:30}),opts),/widerrufen/);
 lib.saveGoveeLookConsentV1146(true);
 let result=await lib.executeAlexaGoveeVoiceLookV1146(message('govee-brightness',{brightness:40}),opts);
 assert.equal(result.kind,'complete');assert.equal(cfg.autoSync,false);assert.equal(cfg.masterBrightness,40);
 assert.equal(calls.filter(x=>x.url==='/command').length,2);
 assert(calls.filter(x=>x.url==='/command').every(x=>x.value.action==='brightness'&&x.value.value===40));
 calls.length=0;result=await lib.executeAlexaGoveeVoiceLookV1146(message('govee-color',{color:'blue'}),opts);
 assert.equal(result.kind,'complete');assert.equal(calls.filter(x=>x.url==='/command').length,2);
 assert(calls.filter(x=>x.url==='/command').every(x=>x.value.action==='color'&&x.value.value.b===255));
 assert(!calls.some(x=>x.value?.ip==='8.8.8.8'));
 await assert.rejects(()=>lib.executeAlexaGoveeVoiceLookV1146(message('govee-color',{color:'not-safe'}),opts),/Ungültiger/);
 await assert.rejects(()=>lib.executeAlexaGoveeVoiceLookV1146(message('govee-brightness',{brightness:10},Date.now()-60000),opts),/abgelaufen/);
 assert.equal(calls.filter(x=>x.url==='/command').length,2,'stale command must not send UDP');
 cfg={...cfg,selectedIps:[]};await assert.rejects(()=>lib.executeAlexaGoveeVoiceLookV1146(message('govee-color',{color:'red'}),opts),/Govee LAN/);
 cfg={...cfg,selectedIps:['192.168.1.10']};lib.saveGoveeLookConsentV1146(false);
 await assert.rejects(()=>lib.executeAlexaGoveeVoiceLookV1146(message('govee-color',{color:'red'}),opts),/widerrufen/);
 const model=require('../integrations/alexa/interaction-model.de-DE.json').interactionModel.languageModel;
 const lambda=require('../integrations/alexa/voice-v1008.cjs');
 assert.equal(lambda.COMMANDS.GoveeBrightnessIntent,'govee-brightness');
 assert.equal(lambda.COMMANDS.GoveeColorIntent,'govee-color');
 assert(model.intents.find(x=>x.name==='GoveeBrightnessIntent')?.slots[0]?.type==='AMAZON.NUMBER');
 assert(model.intents.find(x=>x.name==='GoveeColorIntent')?.slots[0]?.type==='GoveeVoiceColorsV1146');
 assert(model.types.some(x=>x.name==='GoveeVoiceColorsV1146'));
 for(const marker of ['validGoveeVoiceLookV1146','goveeLook'])assert(read('app/api/alexa/voice/route.ts').includes(marker));
 for(const p of ['app/api/alexa/govee-pending/route.ts','app/api/alexa/govee-result/route.ts']){
  assert(read(p).includes('validGoveeVoiceLookV1146'),p);
 }
 for(const p of ['components/AlexaVoiceControlV1008.tsx','components/AlexaSettingsV1137.tsx']){
  assert(read(p).includes('V1146'),p);
 }
 assert(read('scripts/vercel-production-build.cjs').includes('v1146-alexa-govee-look-regression.cjs'));
 console.log('PASS V1146: bounded Alexa 1-100 brightness and named colors, double consent, no arbitrary IP, no retries or power, relay validation');
})().catch(e=>{console.error(e);process.exitCode=1;});
