'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ts=(()=>{try{return require('typescript');}catch{return require(path.join(path.dirname(path.dirname(process.execPath)),'lib/node_modules/typescript'));}})();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const cache={};
function load(file){
 if(cache[file])return cache[file];
 const result=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(result.diagnostics?.length||0,0,`transpile ${file}`);
 const module={exports:{}};cache[file]=module.exports;
 vm.runInNewContext(result.outputText,{module,exports:module.exports,
  require(id){const match=/^@\/(lib\/govee(?:LanV909|ConcertDirectorV911|DeviceGroupsV915|RoomDashboardV928))$/.exec(id);
   if(match)return load(match[1]+'.ts');throw Error('Unexpected dependency: '+id);}},
  {filename:file,timeout:10000});
 cache[file]=module.exports;return module.exports;
}
const f=load('lib/goveeTroubleshootingV929.ts');
const dashboard=load('lib/goveeRoomDashboardV928.ts');
const lan=load('lib/goveeLanV909.ts');
const ips=['192.168.0.11','192.168.0.12','192.168.0.13','192.168.0.14'];
const models=['H6063','H610B','H61A2','H6051'];
const now=1783335000000;
const config={...lan.DEFAULT_GOVEE_CONFIG_V909,token:'VERY-PRIVATE-TOKEN',endpoint:'http://127.0.0.1:8765',
 enabled:true,autoSync:true,directorEnabledV911:true,showEnabledV912:true,selectedShowIdV912:'valid-show',selectedIps:ips};
const health={ok:true,udpError:null,devices:4,onlineDevices:4,uptimeSeconds:240,lastScanAt:now-5000,version:'v910'};
const devices=ips.map((ip,i)=>({ip,sku:models[i],name:`PRIVATE NAME ${i}`,online:true,lastSeen:now-1000}));
const groups={schema:'govee-device-groups-v915',enabled:false,groups:[]};
const calibration={schema:'govee-room-calibration-v927',enabled:false,maxAdvanceMs:350,fixtures:{}};
const spatial={schema:'govee-spatial-director-v926',enabled:false,positions:{}};
const features=[{id:'v912',label:'Show',enabled:true,requires:'show'},
 {id:'v919',label:'Verse Hook Drop',enabled:true,requires:'director'},
 {id:'v917',label:'Bass',enabled:true,requires:'sync'},
 {id:'v918',label:'Beat',enabled:false,requires:'sync'}];
function fixture({c=config,h=health,d=devices,bridgeState='connected',lastRefreshedAt=now-1000,
 groupsValue=groups,calibrationValue=calibration,featuresValue=features,showIds=['valid-show']}={}){
 const status=dashboard.buildGoveeDashboardV928({config:c,devices:d,bridgeState,health:h,lastRefreshedAt,now,
  features:featuresValue,groups:groupsValue,calibration:calibrationValue,spatial,showIds});
 return {config:c,health:h,dashboard:status};
}
const run=options=>f.buildGoveeTroubleshootingV929(fixture(options));
const issue=(result,code)=>result.issues.find(d=>d.code===code);
const json=x=>JSON.parse(JSON.stringify(x));
let count=0;
function test(label,check){check();count++;console.log('PASS V929 '+label);}
test('schema version',()=>assert.equal(run().schema,'govee-troubleshooting-v929'));
test('default has plausible configuration status',()=>assert.equal(run().status,'configured'));
test('default never claims hardware command was confirmed',()=>assert.ok(issue(run(),'CONFIGURED_NOT_VERIFIED')));
test('default explicitly flags missing microphone runtime telemetry',()=>assert.ok(issue(run(),'MICROPHONE_UNVERIFIED')));
test('no surprise critical diagnosis for healthy bridge',()=>assert.equal(run().criticalCount,0));
test('missing token is critical',()=>assert.equal(issue(run({c:{...config,token:''}}),'TOKEN_MISSING').severity,'critical'));
test('missing token directs to password field',()=>assert.equal(issue(run({c:{...config,token:''}}),'TOKEN_MISSING').targetId,'govee-v909-auth'));
test('blank token trimmed',()=>assert.ok(issue(run({c:{...config,token:'   '}}),'TOKEN_MISSING')));
test('token present does not generate missing-token issue',()=>assert.equal(issue(run(),'TOKEN_MISSING'),undefined));
test('unchecked bridge is not falsely considered disconnected',()=>{const result=run({bridgeState:'unchecked'});assert.ok(issue(result,'BRIDGE_UNCHECKED'));assert.equal(issue(result,'BRIDGE_OFFLINE'),undefined);});
test('unchecked bridge severity is informational',()=>assert.equal(issue(run({bridgeState:'unchecked'}),'BRIDGE_UNCHECKED').severity,'info'));
test('offline bridge is critical',()=>assert.equal(issue(run({bridgeState:'offline'}),'BRIDGE_OFFLINE').severity,'critical'));
test('offline bridge has repair steps',()=>assert.ok(issue(run({bridgeState:'offline'}),'BRIDGE_OFFLINE').steps.length>=3));
test('raw UDP problem reported as generic diagnostic',()=>{const r=run({h:{...health,ok:false,udpError:'SECRET IP 192.168.0.11'}});assert.ok(issue(r,'UDP_ERROR'));assert.equal(issue(r,'UDP_ERROR').description.includes('192.168.'),false);});
test('no UDP issue invented without explicit error',()=>assert.equal(issue(run({bridgeState:'offline'}),'UDP_ERROR'),undefined));
test('stale snapshot offers refresh',()=>assert.ok(issue(run({lastRefreshedAt:now-60000}),'STALE_SNAPSHOT')));
test('stale is not labelled offline',()=>assert.equal(issue(run({lastRefreshedAt:now-60000}),'BRIDGE_OFFLINE'),undefined));
test('no device selected offers scan and selection',()=>assert.ok(issue(run({c:{...config,selectedIps:[]}}),'NO_SELECTED_DEVICES')));
test('unregistered device receives targeted message',()=>{const r=run({d:devices.slice(1)});const x=issue(r,'DEVICE_UNREGISTERED');assert.equal(x.fixtureNumber,1);assert.ok(x.title.includes('Govee · Leuchte 1'));});
test('aged UDP device has specific warning',()=>{const r=run({d:[{...devices[0],lastSeen:now-92000},...devices.slice(1)]});assert.ok(issue(r,'DEVICE_NOT_RECENT'));});
test('unconfirmed UDP device has separate warning',()=>{const r=run({d:[{...devices[0],online:true,lastSeen:null},...devices.slice(1)]});assert.ok(issue(r,'DEVICE_UNCONFIRMED'));});
test('offline bridge does not generate misleading per-device errors',()=>assert.equal(run({bridgeState:'offline'}).issues.filter(i=>i.category==='device').length,0));
test('stale status does not make duplicate device warnings',()=>assert.equal(run({lastRefreshedAt:now-60000}).issues.filter(i=>i.category==='device').length,0));
test('unknown model has generic compatibility hint',()=>{const r=run({d:[{...devices[0],sku:'VENDOR-IP-PRIVATE',lastSeen:null},...devices.slice(1)]});assert.ok(issue(r,'DEVICE_UNCONFIRMED').steps.some(s=>s.includes('nicht jedes Govee-Modell')));});
test('every named model has its own help text',()=>{for(let n=0;n<4;n++){const d=devices.map((item,i)=>({...item,lastSeen:i===n?null:item.lastSeen}));const r=run({d});assert.ok(issue(r,'DEVICE_UNCONFIRMED').steps.some(s=>s.includes(models[n])));}});
test('no user-supplied model is displayed in issue title',()=>{const d=[{...devices[0],sku:'SECRET PRIVATE MODEL',lastSeen:null},...devices.slice(1)];assert.ok(!issue(run({d}),'DEVICE_UNCONFIRMED').title.includes('SECRET'))});
test('disabled integration is informational, not automatically repaired',()=>assert.equal(issue(run({c:{...config,enabled:false}}),'LIGHTING_OFF').severity,'info'));
test('disabled integration does not also generate autosync complaint',()=>assert.equal(issue(run({c:{...config,enabled:false,autoSync:false}}),'AUTOSYNC_OFF'),undefined));
test('enabled integration with autosync off warns',()=>assert.equal(issue(run({c:{...config,autoSync:false}}),'AUTOSYNC_OFF').severity,'warning'));
test('autosync off does not change input',()=>{const input=fixture({c:{...config,autoSync:false}}),before=json(input);f.buildGoveeTroubleshootingV929(input);assert.deepEqual(json(input),before);});
test('missing active show warns',()=>assert.ok(issue(run({showIds:[]}), 'SHOW_NOT_FOUND')));
test('disabled show does not warn if missing',()=>assert.equal(issue(run({showIds:[],c:{...config,showEnabledV912:false}}),'SHOW_NOT_FOUND'),undefined));
test('existing saved show does not warn',()=>assert.equal(issue(run(),'SHOW_NOT_FOUND'),undefined));
test('director-dependent modules flagged when v911 off',()=>assert.ok(issue(run({c:{...config,directorEnabledV911:false}}),'DIRECTOR_REQUIRED')));
test('no disabled director warning without enabled dependencies',()=>assert.equal(issue(run({c:{...config,directorEnabledV911:false},featuresValue:features.slice(2)}),'DIRECTOR_REQUIRED'),undefined));
test('director warning references real v318 cue requirement',()=>assert.ok(issue(run({c:{...config,directorEnabledV911:false}}),'DIRECTOR_REQUIRED').steps.some(s=>s.includes('V318'))));
test('bass diagnostics do not claim microphone is on',()=>assert.ok(issue(run(),'MICROPHONE_UNVERIFIED').description.includes('nicht')));
test('no microphone message if no bass/beat effect enabled',()=>assert.equal(issue(run({featuresValue:features.slice(0,2)}),'MICROPHONE_UNVERIFIED'),undefined));
test('optical offset generates cautious timing note',()=>{const c={...calibration,enabled:true,fixtures:{[ips[0]]:{visualDelayMs:200,statusRoundtripMs:600}}};assert.ok(issue(run({calibrationValue:c}),'OPTICAL_DELAY_UNVERIFIED'))});
test('network-only measurement does not claim optical delay',()=>{const c={...calibration,enabled:true,fixtures:{[ips[0]]:{visualDelayMs:0,statusRoundtripMs:600}}};assert.equal(issue(run({calibrationValue:c}),'OPTICAL_DELAY_UNVERIFIED'),undefined)});
test('optical timing note not repeated per device',()=>{const c={...calibration,enabled:true,fixtures:Object.fromEntries(ips.map(ip=>[ip,{visualDelayMs:100,statusRoundtripMs:500}]))};assert.equal(run({calibrationValue:c}).issues.filter(i=>i.code==='OPTICAL_DELAY_UNVERIFIED').length,1);});
test('severity order critical before warning before information',()=>{const r=run({c:{...config,token:'',autoSync:false},bridgeState:'offline'});const ranks={critical:0,warning:1,info:2};assert.ok(r.issues.every((v,i)=>i===0||ranks[r.issues[i-1].severity]<=ranks[v.severity]));});
test('stable sorting and issue identity',()=>{const a=json(run()),b=json(run());assert.deepEqual(a,b);assert.equal(new Set(a.issues.map(i=>i.id)).size,a.issues.length);});
test('counts match severity',()=>{const r=run({bridgeState:'offline'});assert.equal(r.criticalCount+r.warningCount+r.infoCount,r.issues.length);});
test('critical sets action-required state',()=>assert.equal(run({bridgeState:'offline'}).status,'action-required'));
test('warning only sets check-recommended state',()=>assert.equal(run({showIds:[]}).status,'check-recommended'));
test('configured state does not mean lamp reached',()=>assert.ok(issue(run(),'CONFIGURED_NOT_VERIFIED')));
test('symptom guide for no-light exists',()=>assert.equal(f.getGoveeSymptomGuideV929('no-light').id,'no-light'));
test('symptom guide for no-bass requires microphone',()=>assert.ok(f.getGoveeSymptomGuideV929('no-bass').steps.some(s=>s.includes('Mikrofon'))));
test('symptom guide for wrong timing differentiates network/LED',()=>assert.ok(f.getGoveeSymptomGuideV929('wrong-timing').steps.some(s=>s.includes('optisch'))));
test('symptom guide for no-show requires confirmed cues',()=>assert.ok(f.getGoveeSymptomGuideV929('no-show').steps.some(s=>s.includes('V318'))));
test('automatic mode has no invented symptom',()=>assert.equal(f.getGoveeSymptomGuideV929('automatic'),null));
test('symptom descriptions are actionable and bounded',()=>{for(const name of ['no-light','no-bass','wrong-timing','no-show'])assert.ok(f.getGoveeSymptomGuideV929(name).steps.length>=4);});
test('report schema and count match',()=>{const r=run(),exported=JSON.parse(f.createGoveeTroubleshootingReportV929(r,'now'));assert.equal(exported.schema,'govee-troubleshooting-v929');assert.equal(exported.infoCount,r.infoCount);});
test('report anonymizes device and bridge data',()=>{const r=run({d:[{...devices[0],sku:'PASSWORD-SECRET',lastSeen:null},...devices.slice(1)]});const report=f.createGoveeTroubleshootingReportV929(r,'now');for(const secret of [...ips,'127.0.0.1:8765','VERY-PRIVATE-TOKEN','PRIVATE NAME','PASSWORD-SECRET'])assert.ok(!report.includes(secret),secret);});
test('no reported raw UDP error',()=>{const r=run({h:{...health,ok:false,udpError:'PRIVATE-SECRET-NETWORK-ERR'}});assert.ok(!f.createGoveeTroubleshootingReportV929(r,'now').includes('PRIVATE-SECRET-NETWORK-ERR'))});
test('report contains only safe coded diagnostics',()=>{const report=JSON.parse(f.createGoveeTroubleshootingReportV929(run(),'date'));assert.ok(!('config' in report));assert.ok(!('health' in report));assert.ok(report.diagnostics.every(v=>Object.keys(v).sort().join(',')==='category,code,fixtureNumber,severity'));});
test('report does not include user-entered steps or names',()=>{const report=f.createGoveeTroubleshootingReportV929(run(),'date');assert.ok(!report.includes('Lamp'));assert.ok(!report.includes('192.168.'));});
test('source has no new network/timers/storage/mutation',()=>{const src=read('lib/goveeTroubleshootingV929.ts');for(const re of [/\bfetch\s*\(/,/\bsetInterval\s*\(/,/goveeBridgeRequestV909\s*\(/,/\blocalStorage\b/,/saveGoveeConfigV909\s*\(/])assert.doesNotMatch(src,re);});
test('UI has no network or automatic config mutations',()=>{const src=read('components/GoveeTroubleshootingAssistantV929.tsx');for(const re of [/\bfetch\s*\(/,/\bsetInterval\s*\(/,/goveeBridgeRequestV909\s*\(/,/saveGoveeConfigV909\s*\(/])assert.doesNotMatch(src,re);});
test('dashboard integrates assistant using current safe snapshot',()=>{const src=read('components/GoveeRoomPerformanceDashboardV928.tsx');assert.ok(src.includes('buildGoveeTroubleshootingV929({dashboard:snapshot,config,health})'));assert.ok(src.includes('<GoveeTroubleshootingAssistantV929 result={troubleshooting}'));});
test('all navigation target anchors exist',()=>{const code=read('lib/goveeTroubleshootingV929.ts');const targets=[...code.matchAll(/'govee-v\d{3}-[a-z0-9-]+'(?=\s*[,\)])/g)].map(x=>x[0].slice(1,-1));const all=[read('components/GoveeLanPanelV909.tsx'),read('components/GoveeLightShowEditorV912.tsx'),read('components/GoveeRoomCalibrationStudioV927.tsx')].join('\n');assert.ok(targets.length>=6);for(const target of new Set(targets))assert.ok(all.includes(`id="${target}"`),target);});
test('dashboard still has its existing refresh/report actions',()=>{const src=read('components/GoveeRoomPerformanceDashboardV928.tsx');assert.ok(src.includes('onRefresh'));assert.ok(src.includes('copyReport'));});
test('existing V909 poll and LAN sender unchanged',()=>{assert.ok(read('components/GoveeLanPanelV909.tsx').includes('setInterval(()=>void poll(),12000)'));assert.equal((read('components/GoveeMusicSyncV909.tsx').match(/goveeBridgeRequestV909\(config,'\/command'/g)||[]).length,1);});
test('build preflight retains V908 first and existing V928 order',()=>{const p=JSON.parse(read('package.json'));assert.ok(p.scripts.prebuild.includes('npm run test:v908 &&'));
 assert.ok(p.scripts.prebuild.includes('npm run test:v928 && npm run test:v928:types && npm run test:v928:ui-types &&'));
 assert.ok(p.scripts.prebuild.endsWith('npm run check:fast'));assert.ok(p.scripts.prebuild.includes('npm run test:v929 && npm run test:v929:types && npm run test:v929:ui-types'));});
test('CI includes V929 gates',()=>assert.ok(read('.github/workflows/v832-continuous-validation.yml').includes('npm run test:v929 && npm run test:v929:types && npm run test:v929:ui-types')));
let sampled=0;
for(let i=0;i<5000;i++){
 const opts={c:{...config,token:i%7?'VERY-PRIVATE-TOKEN':'',enabled:i%9!==0,autoSync:i%4!==0,
    directorEnabledV911:i%11!==0,selectedIps:i%13===0?[]:ips.slice(0,1+i%4)},
  h:{...health,ok:i%17!==0,udpError:i%17===0?'SECRET UDP 192.168.0.13':null},
  d:devices.map((d,j)=>({...d,lastSeen:now-(i*913+j*1000)%150000,online:i%5!==j})),
  bridgeState:i%19===0?'offline':i%19===1?'unchecked':'connected',
  lastRefreshedAt:now-((i%8)*9000),showIds:i%23===0?[]:['valid-show']};
 const r=run(opts);
 assert.equal(r.issues.length,r.criticalCount+r.warningCount+r.infoCount);
 assert.equal(new Set(r.issues.map(d=>d.id)).size,r.issues.length);
 assert.ok(r.issues.every(d=>d.steps.length>0));
 assert.equal(r.status,r.criticalCount?'action-required':r.warningCount?'check-recommended':'configured');
 const exportReport=f.createGoveeTroubleshootingReportV929(r,'safe-time');
 assert.ok(!exportReport.includes('VERY-PRIVATE-TOKEN')&&!exportReport.includes('192.168.0.'));
 assert.ok(!exportReport.includes('SECRET UDP'));
 sampled++;
}
console.log(`PASS V929 – ${count} test groups, ${sampled} deterministic diagnostic scenarios`);
