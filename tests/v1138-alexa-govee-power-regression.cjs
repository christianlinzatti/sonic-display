'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
let config={enabled:true,autoSync:true,token:'token-used-only-in-unit-tests',endpoint:'http://127.0.0.1:8765',selectedIps:['192.168.1.45','192.168.1.46']};
let requests=[],permissions=new Map(),revoked=false;
const storage={getItem:k=>permissions.get(k)||null,setItem:(k,v)=>permissions.set(k,String(v))};
const window=new EventTarget();
let enabled=true;
const deps={'./goveeLanV909':{
 loadGoveeConfigV909:()=>({...config,selectedIps:[...config.selectedIps]}),
 saveGoveeConfigV909:value=>{config=value;},
 goveeBridgeRequestV909:async(_cfg,url,method,data)=>{requests.push({url,method,data});if(revoked&&url==='/devices/add')enabled=false;return {ok:true};}
}};
const script=ts.transpileModule(read('lib/goveePowerV1138.ts'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true,fileName:'lib/goveePowerV1138.ts'});
assert.equal(script.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
const mod={exports:{}};
vm.runInNewContext(script.outputText,{module:mod,exports:mod.exports,require:id=>{assert(id in deps,id);return deps[id];},Date,JSON,Number,window,localStorage:storage,Event}, {filename:'lib/goveePowerV1138.ts'});
const power=mod.exports;
const now=Date.now();
const message=(command='govee-power-on')=>({id:'12345678-1234-1234-1234-123456789abc',command,createdAt:now});
const reset=()=>{requests=[];config={...config,enabled:true,autoSync:true,selectedIps:['192.168.1.45','192.168.1.46']};revoked=false;enabled=true;};
(async()=>{
 assert(power.isGoveePowerCommandV1138('govee-power-on'));assert(power.isGoveePowerCommandV1138('govee-power-off'));
 for(const invalid of ['govee-on','govee-strobe','power-on','spotify-play',null])assert(!power.isGoveePowerCommandV1138(invalid));
 assert.equal(power.normalizeGoveePowerConsentV1138({enabled:true,since:0}).enabled,false);
 assert.equal(power.loadGoveePowerConsentV1138().enabled,false);
 const consent=power.saveGoveePowerConsentV1138(true);assert(consent.enabled&&consent.since>0);
 const opts={since:now-4000,now:()=>Date.now(),allowed:()=>enabled&&power.loadGoveePowerConsentV1138().enabled};
 reset();
 const result=await power.executeAlexaGoveePowerV1138(message(),opts);
 assert.equal(result.kind,'complete');assert.match(result.text,/gesendet/);assert.equal(requests.length,4);
 assert.deepEqual(JSON.parse(JSON.stringify(requests.filter(r=>r.url==='/command').map(r=>r.data))),[
 {ip:'192.168.1.45',action:'power',value:true},{ip:'192.168.1.46',action:'power',value:true}]);
 assert.equal(config.autoSync,false,'power command stops automatic lighting');
 reset();
 const off=await power.executeAlexaGoveePowerV1138(message('govee-power-off'),opts);
 assert.match(off.text,/AUS/);
 assert(requests.filter(r=>r.url==='/command').every(r=>r.data.value===false));
 reset();power.saveGoveePowerConsentV1138(false);
 await assert.rejects(()=>power.executeAlexaGoveePowerV1138(message(),opts),/freigegeben/);assert.equal(requests.length,0);
 power.saveGoveePowerConsentV1138(true);reset();config.selectedIps=[];
 await assert.rejects(()=>power.executeAlexaGoveePowerV1138(message(),opts),/mindestens eine/);assert.equal(requests.length,0);
 reset();revoked=true;
 await assert.rejects(()=>power.executeAlexaGoveePowerV1138(message(),opts),/abgebrochen/);
 assert.equal(requests.filter(r=>r.url==='/command').length,0,'revocation before UDP power must not send');
 reset();await assert.rejects(()=>power.executeAlexaGoveePowerV1138({...message(),createdAt:now-60000},opts),/abgelaufen/);
 const model=require('../integrations/alexa/interaction-model.de-DE.json').interactionModel.languageModel.intents;
 for(const name of ['GoveePowerOnIntent','GoveePowerOffIntent'])assert(model.find(x=>x.name===name)?.samples.length>=3,name);
 const lambda=require('../integrations/alexa/voice-v1008.cjs');
 assert.equal(lambda.COMMANDS.GoveePowerOnIntent,'govee-power-on');
 assert.equal(lambda.COMMANDS.GoveePowerOffIntent,'govee-power-off');
 assert(read('lib/alexaVoiceV1008.ts').includes("'govee-power-off'"));
 assert(read('components/AlexaVoiceControlV1008.tsx').includes('executeAlexaGoveePowerV1138'));
 for(const f of ['components/ConcertControlCenterV649.tsx','components/AlexaSettingsV1137.tsx'])
  assert(read(f).includes('GoveePowerQuickControlsV1138'),f);
 assert(read('components/AlexaSettingsV1137.tsx').includes('GoveePowerPermissionV1138'));
 assert(read('components/GoveeMusicSyncV909.tsx').includes('if(!loadGoveeConfigV909().autoSync)break'));
 assert(read('scripts/vercel-production-build.cjs').includes('v1138-alexa-govee-power-regression.cjs'));
 console.log('PASS V1138 Govee power: opt-in, voice intents, bounded LAN power, off/on, revocation, no playback, quick UI, production gate');
})().catch(e=>{console.error(e);process.exitCode=1;});
