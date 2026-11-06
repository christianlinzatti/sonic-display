#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const cp=require('node:child_process');
const {bashExecutable}=require('./helpers/bash-runtime.cjs');
const bash=bashExecutable();
const ts=require('./typescript-loader.cjs');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const pi='integrations/govee-bridge-raspberry-pi/';
const win='integrations/govee-bridge-windows/';
let passed=0;
function test(label,fn){try{fn();passed++;console.log('PASS V971 '+label);}catch(error){console.error('FAIL V971 '+label,error.stack||error);process.exitCode=1;}}
function loadSetup(){
 const source=read('lib/integrationSetupV971.ts');
 const out=ts.transpileModule(source,{fileName:'lib/integrationSetupV971.ts',reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(out.diagnostics?.length||0,0);
 const exports={};const module={exports};
 vm.runInNewContext(out.outputText,{module,exports,require:()=>{throw Error('Unexpected require');}},{timeout:10000});
 return module.exports;
}
const setup=loadSetup();
const sample={bridgeState:'unchecked',bridgeHealthy:false,tokenPresent:false,selectedDevices:0,onlineDevices:0,syncEnabled:false,alexaReceiverEnabled:false,alexaGoveeAllowed:false};
test('core setup has six locally checkable steps + one unknown cloud item',()=>{
 const steps=setup.buildIntegrationStepsV971(sample);
 assert.equal(steps.length,7);
 assert.equal(steps.filter(s=>s.state==='unknown').length,1);
 assert.equal(setup.setupProgressV971(steps).completed,0);
 assert.equal(setup.setupProgressV971(steps).total,6);
 assert.equal(setup.setupProgressV971(steps).cloudVerified,false);
});
test('all local checks do not fabricate Alexa cloud approval',()=>{
 const steps=setup.buildIntegrationStepsV971({...sample,bridgeState:'connected',bridgeHealthy:true,tokenPresent:true,selectedDevices:2,onlineDevices:2,syncEnabled:true,alexaReceiverEnabled:true,alexaGoveeAllowed:true});
 assert.equal(setup.setupProgressV971(steps).completed,6);
 assert.equal(steps.at(-1).state,'unknown');
 assert.equal(setup.setupProgressV971(steps).cloudVerified,false);
});
test('offline or nonhealthy Bridge not counted as connected',()=>{
 for(const broken of [{bridgeState:'offline',bridgeHealthy:true},{bridgeState:'connected',bridgeHealthy:false}]){
  const steps=setup.buildIntegrationStepsV971({...sample,...broken,tokenPresent:true,selectedDevices:1,onlineDevices:1,syncEnabled:true});
  assert.equal(steps.find(s=>s.id==='bridge').state,'action');
  assert.equal(steps.find(s=>s.id==='devices').state,'action');
 }
});
test('Pi + Windows guidance visible; never automatic device activation',()=>{
 const src=read('components/IntegrationSetupWizardV971.tsx');
 for(const word of ['Raspberry Pi','start-govee-bridge.sh','start-for-vercel.sh','show-token.sh','Windows','start-govee-bridge.cmd','IntegrationSetupWizardV971'])assert(src.includes(word),word);
 assert(!src.includes('onClick={()=>window.location.href='));
});
test('Govee settings include the assistant, no duplicate LAN poll loop',()=>{
 const src=read('components/GoveeLanPanelV909.tsx');
 assert(src.includes('<IntegrationSetupWizardV971'));
 assert(src.includes('bridgeState={bridgeState}'));
 assert(!read('components/IntegrationSetupWizardV971.tsx').includes('setInterval'));
});
test('standalone Pi package has four scripts and README',()=>{
 for(const name of ['start-govee-bridge.sh','start-for-vercel.sh','check-bridge.sh','show-token.sh','README.md'])assert(fs.existsSync(path.join(ROOT,pi,name)),name);
});
test('all Pi scripts pass Bash syntax validation',()=>{
 for(const name of ['start-govee-bridge.sh','start-for-vercel.sh','check-bridge.sh','show-token.sh']){
  const check=cp.spawnSync(bash,['-n',path.join(ROOT,pi,name).replace(/\\/g,'/')],{encoding:'utf8',timeout:4000});
  assert.ifError(check.error);
  assert.equal(check.status,0,check.stderr);
 }
});
test('Pi launcher uses no sudo, npm, router changes or open bind address',()=>{
 const src=read(pi+'start-govee-bridge.sh');
 assert(src.includes('govee-lan-bridge.cjs'));
 assert(src.includes('process.versions.node'));
 assert(src.includes('exec node'));
 for(const danger of ['sudo ','npm install','0.0.0.0','systemctl enable','ufw disable'])assert(!src.includes(danger),danger);
});
test('Pi Vercel launcher requires HTTPS exact origin and delegates validation',()=>{
 const src=read(pi+'start-for-vercel.sh');
 assert(src.includes('^https://'));
 assert(src.includes('exec "$HERE/start-govee-bridge.sh" --origin "$ORIGIN"'));
 for(const example of ['https://example.com/a','http://example.com','https://example.com?a=1']){
  const test=cp.spawnSync(bash,[path.join(ROOT,pi+'start-for-vercel.sh').replace(/\\/g,'/'),example],{encoding:'utf8',timeout:4000});
  assert.ifError(test.error);
  assert.equal(typeof test.status,'number','launcher must actually exit, not time out');
  assert.notEqual(test.status,0,example);
 }
});
test('Pi check reads existing health handler but never emits Govee commands',()=>{
 const check=read(pi+'check-bridge.sh');
 assert(check.includes('govee-bridge-check-v971.cjs'));
 const script=read('scripts/govee-bridge-check-v971.cjs');
 assert(script.includes('/health'));
 assert(!script.includes('/command'));
 assert(!script.includes("'/scan'"));
});
test('Pi token display is opt-in and same source as Windows',()=>{
 const piToken=read(pi+'show-token.sh');
 assert(piToken.includes('print-govee-token-v971.cjs'));
 assert(read(win+'show-token.cmd').includes('print-govee-token-v971.cjs'));
 assert(!read(pi+'start-govee-bridge.sh').includes('print-govee-token-v971.cjs'));
});
test('bridge keeps loopback and bearer authentication',()=>{
 const src=read('scripts/govee-lan-bridge.cjs');
 assert(src.includes("server.listen(PORT,'127.0.0.1'"));
 assert(src.includes('crypto.timingSafeEqual'));
 assert(src.includes('const origins=new Set'));
 assert(src.includes('Access-Control-Allow-Private-Network'));
});
test('no new pi service is installed, V910 systemd remains opt-in',()=>{
 const src=read(pi+'README.md');
 assert(src.includes('systemctl --user status sonic-govee-bridge-v910.service'));
 assert(src.includes('keinen')||src.includes('kein'));
 assert(!fs.existsSync(path.join(ROOT,pi,'install-system-service.sh')));
});
test('Alexa bundled but not auto configured',()=>{
 assert(fs.existsSync(path.join(ROOT,'integrations/alexa/handler.cjs')));
 assert(fs.existsSync(path.join(ROOT,'integrations/alexa/interaction-model.de-DE.json')));
 const doc=read('docs/versions/V971-INTEGRATION-SETUP-CENTER.md');
 assert(doc.includes('Raspberry Pi'));
 assert(doc.includes('Kein Skill wird automatisch')||doc.includes('nicht automatisch'));
});
test('V971 package marker, scripts and Pi documentation are present',()=>{
 const p=JSON.parse(read('package.json'));
 assert(/^v\d+$/.test(p.sonicRoadmapRelease)&&Number(p.sonicRoadmapRelease.slice(1))>=971);
 assert(p.scripts['test:v971'].includes('v971-integration-setup-regression.cjs'));
 assert(p.scripts['test:v971:types'].includes('v971-core'));
 assert(read('README.md').includes('Raspberry Pi'));
});
console.log(`V971 setup/regression: ${passed} groups passed`);
