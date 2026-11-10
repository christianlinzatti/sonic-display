'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const src=ts.transpileModule(read('lib/alexaConnectionDiagnosticsV1149.ts'),{
 fileName:'alexaConnectionDiagnosticsV1149.ts',
 reportDiagnostics:true,
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}
});
assert.equal(src.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
const mod={exports:{}};
vm.runInNewContext(src.outputText,{module:mod,exports:mod.exports,Object,Number,Set});
const lib=mod.exports;
const classify=lib.classifyAlexaServerV1149;
let r=classify(401,{spotify:false});
assert.equal(r.spotify.state,'attention');assert.equal(r.relay.state,'unknown');
assert.match(r.spotify.nextStep,/Spotify/);
r=classify(200,{spotify:true,artistScopes:true,relay:'ready'});
assert.equal(r.spotify.state,'ok');assert.equal(r.relay.state,'ok');
assert.match(r.relay.nextStep,/Alexa-Skill/);
r=classify(200,{spotify:true,artistScopes:false,relay:'not-configured'});
assert.equal(r.relay.state,'attention');assert.match(r.relay.nextStep,/Upstash/);
assert.match(r.spotify.summary,/Freigaben fehlen/);
r=classify(503,{spotify:true,relay:'unavailable'});
assert.equal(r.spotify.state,'ok');assert.equal(r.relay.state,'error');
r=classify(503,{error:'unknown'});
assert.equal(r.spotify.state,'unknown');assert.equal(r.relay.state,'unknown');
r=lib.classifyAlexaServerErrorV1149();
assert.equal(r.spotify.state,'unknown');assert.equal(r.relay.state,'unknown');
const cfg={enabled:true,selectedIps:['192.168.1.10','192.168.1.11']};
const live=[{ip:cfg.selectedIps[0],online:true},{ip:cfg.selectedIps[1],online:true}];
let g=lib.classifyGoveeBridgeV1149(cfg,{ok:true},live);
assert.equal(g.state,'ok');
assert.match(g.summary,/2 von 2/);
g=lib.classifyGoveeBridgeV1149(cfg,{ok:true},[{ip:cfg.selectedIps[0],online:true},{ip:cfg.selectedIps[1],online:false}]);
assert.equal(g.state,'attention');assert.match(g.summary,/1 von 2/);
g=lib.classifyGoveeBridgeV1149({...cfg,enabled:false},{ok:true},live);
assert.equal(g.state,'attention');assert.match(g.summary,/ausgeschaltet/);
g=lib.classifyGoveeBridgeV1149({...cfg,selectedIps:[]},{ok:true},[]);
assert.equal(g.state,'attention');
g=lib.classifyGoveeBridgeV1149(cfg,{ok:false},live);
assert.equal(g.state,'error');assert.match(g.summary,/UDP/);
g=lib.classifyGoveeBridgeV1149(cfg,{ok:true},null);
assert.equal(g.state,'unknown');
assert.equal(lib.classifyGoveeNotConfiguredV1149({token:'',selectedIps:['192.168.1.10']}).state,'attention');
assert.equal(lib.classifyGoveeNotConfiguredV1149({token:'valid-test-token',selectedIps:[]}),null);
assert.equal(lib.classifyGoveeErrorV1149().state,'error');
const allMessages=[r.spotify,r.relay,g,lib.classifyGoveeErrorV1149(),
 ...Object.values(classify(200,{spotify:true,relay:'ready'}))];
for(const v of allMessages){
 assert(!JSON.stringify(v).includes('192.168.'),'No device addresses in user-facing diagnostics');
 assert(!JSON.stringify(v).includes('valid-test-token'),'Never report the secret');
}
const ui=read('components/AlexaConnectionWizardV1149.tsx');
const settings=read('components/AlexaSettingsV1137.tsx');
assert(settings.includes('AlexaConnectionWizardV1149'),'Wizard must be shown in Alexa settings');
for(const marker of ["'/api/alexa/status'","'/health'","'/devices'","classifyAlexaServerV1149",
 "classifyGoveeBridgeV1149",'disabled={running}','aria-label="V1149 Verbindungstest Alexa Spotify Govee"']){
 assert(ui.includes(marker),'Missing UI integration: '+marker);
}
for(const action of ["'/command'","'/devices/add'","'/scan'","method:'POST'"]){
 assert(!ui.includes(action),'Wizard must not mutate Govee hardware: '+action);
}
assert(ui.includes('Promise.all([server(),bridge()])'),'Independent checks should not block one another');
assert(ui.includes('controller.signal'),'Server check must be abortable');
assert(read('scripts/vercel-production-build.cjs').includes('v1149-alexa-connection-wizard-regression.cjs'));
console.log('PASS V1149: independent read-only Spotify/relay/Govee diagnostics, honest setup guidance, redacted devices, no power or scan commands, wizard wiring');
