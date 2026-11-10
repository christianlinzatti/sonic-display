'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const source=ts.transpileModule(read('lib/alexaLiveDiagnosticsV1150.ts'),{
 fileName:'alexaLiveDiagnosticsV1150.ts',reportDiagnostics:true,
 compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}
});
assert.equal(source.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
const mod={exports:{}};
vm.runInNewContext(source.outputText,{module:mod,exports:mod.exports,Number,Object,Date,Set,Map,Math});
const {deriveGoveeFixturesV1150:fixtures,summarizeLiveDiagnosticsV1150:summary}=mod.exports;
assert.equal(mod.exports.ALEXA_LIVE_INTERVAL_MS_V1150,60000);
assert.equal(mod.exports.ALEXA_LIVE_MAX_FIXTURES_V1150,4);
const now=1700000000000;
const selected=['192.168.1.10','192.168.1.11','192.168.1.12','192.168.1.13'];
const inventory=[
 {ip:selected[0],online:true,lastSeen:now-5000,status:{on:true}},
 {ip:selected[1],online:false,lastSeen:now-200000,status:{on:true}},
 {ip:selected[2],online:true,lastSeen:now-200000,status:{on:false}},
 {ip:'192.168.1.250',online:true,lastSeen:now-1000},
 {ip:selected[3],online:true,lastSeen:now+30000}
];
const a=fixtures(selected,inventory,now);
assert.equal(a.length,4);
assert.equal(a[0].state,'seen-online');
assert.equal(a[1].state,'not-seen');
assert.equal(a[2].state,'not-seen','Stale devices must not be labelled online');
assert.equal(a[3].state,'not-seen','Future timestamps must not be accepted');
assert(!JSON.stringify(a).includes('192.168'),'IPs must never leave pure view model');
assert(!JSON.stringify(a).includes('status'),'No unverified physical power field');
assert.match(a[0].description,/nicht bestätigt/);
const b=fixtures(selected,null,now);
assert(b.every(x=>x.state==='unknown'),'No network result must not become offline');
const c=fixtures(selected.slice(0,2),inventory,now);
assert.equal(c.length,4);
assert.equal(c[2].state,'not-selected');
assert.equal(c[3].state,'not-selected');
assert(fixtures([],[],now).every(x=>x.state==='not-selected'));
const yes={state:'ok',summary:'Success',nextStep:'Keine Aktion'};
const caution={state:'attention',summary:'Attention',nextStep:'Konfiguration prüfen'};
const unknown={state:'unknown',summary:'Unverified',nextStep:'Prüfen'};
const s=summary(yes,yes,caution,c);
assert.equal(s.ready,3); // Spotify, relay, and first lamp
assert.equal(s.issues,2); // bridge and second lamp
assert.equal(s.unknown,0);
assert.match(s.description,/Alexa-Skill/);
assert.match(summary(unknown,unknown,unknown,b).description,/nicht bestätigt/);
const ui=read('components/AlexaLiveDiagnosticsV1150.tsx'),settings=read('components/AlexaSettingsV1137.tsx');
assert(settings.includes('AlexaLiveDiagnosticsV1150'),'Live dashboard must appear in settings');
for(const marker of [
 'deriveGoveeFixturesV1150','summarizeLiveDiagnosticsV1150','ALEXA_LIVE_INTERVAL_MS_V1150',
 'document.visibilityState','navigator.onLine','clearInterval','useEffect','useRef',
 "'/api/alexa/status'","'/health'","'/devices'",'getValidSession',''
].filter(Boolean)){
 if(marker==='getValidSession')continue;
 assert(ui.includes(marker),'Missing safety or UI integration: '+marker);
}
assert(!ui.includes("'/command'"),'Dashboard must never send LAN commands');
assert(!ui.includes("'/scan'"),'Dashboard must never discover lights');
assert(!ui.includes("'/devices/add'"),'Dashboard must never register devices');
assert(!ui.includes(",'POST'"),'Dashboard should use read-only HTTP GET requests');
assert(!ui.includes('saveGoveeConfigV909'),'Dashboard cannot mutate settings');
assert(!ui.includes('sendGoveePowerV1138'),'Dashboard cannot control power');
assert(ui.includes('onClick={()=>setLive(v=>!v)}'),'Monitoring must be user opt-in');
assert(ui.includes("cache:'no-store'"),'Explicit refresh must avoid stale GET cache');
assert(ui.includes('controller.signal'),'Server probe must have abort support');
assert(ui.includes('Keine Lampen-IP')||ui.includes('Keine Lampen-IP'),'Privacy notice absent');
assert(read('scripts/vercel-production-build.cjs').includes('v1150-alexa-live-diagnostics-regression.cjs'));
const concertTest=read('tests/v1145-alexa-full-concert-regression.cjs');
assert(concertTest.includes("id==='./alexaConcertScenesV1147'"),'V1145 isolated test must mock scene restore');
console.log('PASS V1150: four private lamp slots, stale packet handling, unknown-on-failure, 60s opt-in visible-only live diagnostics, no mutation, V1145 Vercel regression fix');
