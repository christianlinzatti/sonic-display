'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ts=(()=>{try{return require('typescript');}catch{return require(path.join(path.dirname(path.dirname(process.execPath)),'lib/node_modules/typescript'));}})();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const cache={};
function load(file){
 if(cache[file])return cache[file];
 const converted=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(converted.diagnostics?.length||0,0);
 const module={exports:{}};cache[file]=module.exports;
 vm.runInNewContext(converted.outputText,{module,exports:module.exports,
  require(id){const match=/^@\/(lib\/govee(?:LanV909|ConcertDirectorV911|DeviceGroupsV915))$/.exec(id);
   if(match)return load(match[1]+'.ts');throw Error('Unexpected runtime dependency '+id);}},
  {filename:file,timeout:10000});
 cache[file]=module.exports;return module.exports;
}
const f=load('lib/goveeRoomDashboardV928.ts');
const lan=load('lib/goveeLanV909.ts');
const ips=['192.168.1.31','192.168.1.32','192.168.1.33','192.168.1.34'];
const models=['H6063','H610B','H61A2','H6051'];const now=1783335000000;
const config={...lan.DEFAULT_GOVEE_CONFIG_V909,token:'SECRET-TOKEN-NEVER-EXPOSE',endpoint:'http://127.0.0.1:8765',
 enabled:true,autoSync:true,directorEnabledV911:true,showEnabledV912:true,selectedShowIdV912:'show_main_v928',selectedIps:ips};
const health={ok:true,udpError:null,devices:4,onlineDevices:3,uptimeSeconds:120,lastScanAt:now-20000,version:'v910'};
const devices=ips.map((ip,i)=>({ip,sku:models[i],name:`Lamp ${i+1}`,device:'',online:i!==3,
 lastSeen:now-(i===3?120000:10000+i*1000),status:{on:true,brightness:50,color:null}}));
const groups={schema:'govee-device-groups-v915',enabled:true,groups:[{id:'group_test',name:'Left side',members:[ips[0],ips[2]],mode:'individual',role:'auto',brightnessPercent:45}]};
const calibration={schema:'govee-room-calibration-v927',enabled:true,maxAdvanceMs:350,fixtures:{[ips[0]]:{visualDelayMs:120,statusRoundtripMs:425}}};
const spatial={schema:'govee-spatial-director-v926',enabled:true,positions:{[ips[0]]:{x:.25,y:.1}},direction:'left-right',strength:55,colorMixPercent:14,maxBoostPoints:5,periodMs:7800};
const features=[{id:'v912',label:'Show',enabled:true,requires:'show'},{id:'v915',label:'Gruppen',enabled:true,requires:'integration'},
 {id:'v919',label:'Abschnitte',enabled:true,requires:'director'},{id:'v923',label:'Neon',enabled:false,requires:'sync'}];
const input=(patch={})=>({config,devices,health,bridgeState:'connected',lastRefreshedAt:now-5000,
 now,features,groups,calibration,spatial,showIds:['show_main_v928'],...patch});
const dash=(patch={})=>f.buildGoveeDashboardV928(input(patch));
const json=x=>JSON.parse(JSON.stringify(x));
let groupsPassed=0;
function test(label,check){check();groupsPassed++;console.log(`PASS V928 ${label}`);}
test('bridge connected when fresh health and devices received',()=>assert.equal(dash().bridge,'connected'));
test('bridge status unknown without explicit attempt',()=>assert.equal(dash({bridgeState:'unchecked'}).bridge,'unchecked'));
test('bridge offline after transport failure',()=>assert.equal(dash({bridgeState:'offline'}).bridge,'offline'));
test('bridge offline when UDP reports error',()=>assert.equal(dash({health:{...health,ok:false}}).bridge,'offline'));
test('snapshot stale after 30 seconds',()=>assert.equal(dash({lastRefreshedAt:now-31000}).bridge,'stale'));
test('exactly 30 seconds still fresh',()=>assert.equal(dash({lastRefreshedAt:now-30000}).bridge,'connected'));
test('missing successful timestamp is unchecked stale',()=>assert.equal(dash({lastRefreshedAt:0}).bridge,'stale'));
test('future timestamp never treated as valid snapshot',()=>assert.equal(dash({lastRefreshedAt:now+100000}).bridge,'stale'));
test('sighted lamps do not imply live command acknowledgment',()=>{assert.equal(dash().recentCount,3);assert.equal(dash().devices[0].presence,'recent');});
test('manual unknown lamp not falsely considered online',()=>{const d=dash({devices:[{...devices[0],lastSeen:null,online:false,manual:true}]});assert.equal(d.devices[0].presence,'unknown');});
test('online true without timestamp does not imply reachable',()=>{const d=dash({devices:[{...devices[0],lastSeen:null,online:true}]});assert.equal(d.recentCount,0);});
test('recent timestamp with online false does not imply reachable',()=>{const d=dash({devices:[{...devices[0],online:false}]});assert.equal(d.recentCount,0);});
test('old reply never considered recent',()=>assert.equal(dash().devices[3].presence,'not-seen'));
test('no bridge means no recent devices shown',()=>assert.equal(dash({bridgeState:'offline'}).recentCount,0));
test('stale snapshot means no recent devices shown',()=>assert.equal(dash({lastRefreshedAt:now-60000}).recentCount,0));
test('unregistered selected lamp is called out',()=>{const d=dash({devices:devices.slice(1)});assert.equal(d.devices[0].presence,'unregistered');assert.ok(d.warnings.some(w=>w.includes('nicht registriert')));});
test('discovered but not selected devices are omitted',()=>assert.equal(dash({config:{...config,selectedIps:ips.slice(0,2)}}).devices.length,2));
test('duplicate selected device not counted twice',()=>assert.equal(dash({config:{...config,selectedIps:[ips[0],ips[0]]}}).selectedCount,1));
test('nonprivate IP ignored',()=>assert.equal(dash({config:{...config,selectedIps:['8.8.8.8',...ips]}}).selectedCount,4));
test('zero selected lamps requires explicit selection',()=>{const d=dash({config:{...config,selectedIps:[]}});assert.equal(d.readyForSync,false);assert.ok(d.warnings.some(w=>w.includes('Keine Leuchte')));});
test('show recognized only when enabled and saved',()=>assert.equal(dash().showConfigured,true));
test('missing show warns but never enables it',()=>{const d=dash({showIds:[]});assert.equal(d.showConfigured,false);assert.ok(d.warnings.some(w=>w.includes('V912')));});
test('show module not ready when selected show missing',()=>assert.equal(dash({showIds:[]}).features[0].ready,false));
test('disabled feature not ready regardless of other settings',()=>assert.equal(dash().features[3].ready,false));
test('other enabled features have configured prerequisites',()=>assert.equal(dash().readyCount,3));
test('disabled integration cannot report ready for sync',()=>assert.equal(dash({config:{...config,enabled:false}}).readyForSync,false));
test('disabled autosync cannot report ready for sync',()=>assert.equal(dash({config:{...config,autoSync:false}}).readyForSync,false));
test('missing token cannot report ready for sync',()=>assert.equal(dash({config:{...config,token:''}}).readyForSync,false));
test('offline bridge cannot report ready for sync',()=>assert.equal(dash({bridgeState:'offline'}).readyForSync,false));
test('stale snapshot cannot report ready for sync',()=>assert.equal(dash({lastRefreshedAt:now-40000}).readyForSync,false));
test('V911 director required for section modules',()=>assert.equal(dash({config:{...config,directorEnabledV911:false}}).features[2].ready,false));
test('group names only from active group library',()=>assert.equal(dash().devices[0].groupName,'Left side'));
test('disabled group library does not report active membership',()=>assert.equal(dash({groups:{...groups,enabled:false}}).devices[0].groupName,null));
test('group dimmer displayed as configured percent',()=>assert.equal(dash().devices[0].groupBrightnessPercent,45));
test('visual delay displayed only for enabled calibration',()=>assert.equal(dash().devices[0].visualDelayMs,120));
test('inactive calibration has no active offset',()=>assert.equal(dash({calibration:{...calibration,enabled:false}}).devices[0].visualDelayMs,0));
test('diagnostic RTT does not become LED delay',()=>assert.equal(dash().devices[0].statusRoundtripMs,425));
test('absent RTT does not imply zero measured latency',()=>assert.equal(dash().devices[1].statusRoundtripMs,null));
test('room positions visible only if spatial director enabled',()=>assert.equal(dash().devices[0].spatialPosition.x,.25));
test('disabled spatial coordinates are not shown as active',()=>assert.equal(dash({spatial:{...spatial,enabled:false}}).devices[0].spatialPosition,null));
test('roles resolve based on model',()=>assert.deepEqual(json(dash().devices.map(d=>d.role)),['wall','rhythm','neon','ambient']));
test('explicit role override respected',()=>assert.equal(dash({config:{...config,deviceRolesV911:{[ips[0]]:'neon'}}}).devices[0].role,'neon'));
test('no last seen is displayed as unknown',()=>assert.equal(dash({devices:[{...devices[0],lastSeen:null}]}).devices[0].lastSeenAt,null));
test('future UDP sighting does not count',()=>assert.equal(dash({devices:[{...devices[0],lastSeen:now+80000}]}).devices[0].presence,'unknown'));
test('warning for autosync disabled with integration enabled',()=>assert.ok(dash({config:{...config,autoSync:false}}).warnings.some(w=>w.includes('Musik-Synchronisierung'))));
test('no token warning',()=>assert.ok(dash({config:{...config,token:''}}).warnings.some(w=>w.includes('Token'))));
test('source object never modified',()=>{const x=input();const before=json(x);f.buildGoveeDashboardV928(x);assert.deepEqual(json(x),before);});
test('report is parsable JSON with versioned schema',()=>assert.equal(JSON.parse(f.createGoveeDashboardReportV928(dash(),'2026-11-04T15:00:00Z')).schema,'sonic-govee-dashboard-v928'));
test('report strips token, endpoint, IPs, device names, room coordinates',()=>{const report=f.createGoveeDashboardReportV928(dash(),'2026-11-04T15:00:00Z');for(const secret of ['SECRET-TOKEN-NEVER-EXPOSE','127.0.0.1:8765',...ips,'Lamp 1','Left side','spatialPosition'])assert.ok(!report.includes(secret),`leak ${secret}`);});
test('report includes only selected device count, no extra bridge details',()=>{const obj=JSON.parse(f.createGoveeDashboardReportV928(dash(),'date'));assert.equal(obj.devices.length,4);assert.equal(obj.selectedDevices,4);assert.equal('health' in obj,false);});
test('status builder has no side effects or network primitives',()=>{const source=read('lib/goveeRoomDashboardV928.ts');assert.doesNotMatch(source,/\bfetch\s*\(|\bsetInterval\s*\(|goveeBridgeRequestV909\s*\(/);});
test('dashboard UI no extra timers or power commands',()=>{const src=read('components/GoveeRoomPerformanceDashboardV928.tsx');assert.doesNotMatch(src,/\bsetInterval\s*\(|goveeBridgeRequestV909\s*\(|action:\s*['"](?:power|color)['"]/);});
test('dashboard UI includes refresh, report, status, features, lag',()=>{const src=read('components/GoveeRoomPerformanceDashboardV928.tsx');for(const v of ['onRefresh','copyReport','presenceLabel','GOVEE_CALIBRATION_EVENT_V927','Alle Lichtmodule','Optischer Zeitversatz'])assert.ok(src.includes(v));});
test('panel invokes dashboard with existing bridge state',()=>{const src=read('components/GoveeLanPanelV909.tsx');for(const v of ['<GoveeRoomPerformanceDashboardV928','bridgeState={bridgeState}','devices={devices}','lastRefreshedAt={lastRefreshedAt}','onRefresh={()=>void operation(refresh)}'])assert.ok(src.includes(v));});
test('existing 12-sec connectivity poll preserved',()=>assert.ok(read('components/GoveeLanPanelV909.tsx').includes('setInterval(()=>void poll(),12000)')));
test('existing 1 LAN sender preserved',()=>assert.equal((read('components/GoveeMusicSyncV909.tsx').match(/goveeBridgeRequestV909\(config,'\/command'/g)||[]).length,1));
test('build guards retain first v908 and now v928',()=>{const pkg=JSON.parse(read('package.json'));assert.ok(pkg.scripts.prebuild.includes('npm run test:v908 && npm run test:v928 && npm run test:v928:types && npm run test:v928:ui-types &&'));});
test('CI includes new V928 checks',()=>assert.ok(read('.github/workflows/v832-continuous-validation.yml').includes('npm run test:v928 && npm run test:v928:types && npm run test:v928:ui-types')));
let sampled=0;
for(let i=0;i<5000;i++){
 const p=i%9, t=now+i*137;
 const d=dash({now:t,lastRefreshedAt:t-(i%8)*9000,bridgeState:p===1?'offline':p===2?'unchecked':'connected',
  devices:devices.map((dev,j)=>({...dev,online:i%5!==j,lastSeen:t-((i*43+j*1234)%120000)})),
  config:{...config,autoSync:i%3!==0,selectedIps:i%7===0?[]:ips.slice(0,(i%4)+1)}});
 assert.ok(d.selectedCount>=0&&d.selectedCount<=4&&d.recentCount>=0&&d.recentCount<=d.selectedCount);
 assert.ok(d.readyCount<=d.enabledCount&&d.enabledCount<=d.features.length);
 if(d.bridge!=='connected')assert.equal(d.recentCount,0);
 for(const lamp of d.devices)if(lamp.presence==='recent')assert.ok(lamp.lastSeenAgeSeconds!==null&&lamp.lastSeenAgeSeconds<=90);
 const report=f.createGoveeDashboardReportV928(d,'2026-11-04T15:00:00Z');
 assert.ok(!report.includes(config.token)&&!report.includes(config.endpoint));
 sampled++;
}
console.log(`PASS V928 – ${groupsPassed} test groups, ${sampled} deterministic device/dashboard states`);
