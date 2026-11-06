'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ts=(()=>{try{return require('typescript');}catch{return require(path.join(path.dirname(path.dirname(process.execPath)),'lib/node_modules/typescript'));}})();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const storage=new Map(),events=[];
const fakeWindow={localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},dispatchEvent:e=>events.push(e.type)};
function load(file){
 const result=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(result.diagnostics?.length||0,0);
 const module={exports:{}};
 vm.runInNewContext(result.outputText,{module,exports:module.exports,localStorage:fakeWindow.localStorage,window:fakeWindow,
  Event:class{constructor(type){this.type=type;}},require(id){throw Error('Unexpected runtime dependency '+id);}},
  {filename:file,timeout:10000});return module.exports;
}
const f=load('lib/goveeRoomCalibrationV927.ts');
const json=x=>JSON.parse(JSON.stringify(x));
const ips=['192.168.1.31','192.168.1.32','192.168.1.33','192.168.1.34'];
const defaults=json(f.DEFAULT_GOVEE_CALIBRATION_V927);
const enabled=(fixtures={},rest={})=>({...defaults,enabled:true,fixtures,...rest});
const seeded=enabled({[ips[0]]:{visualDelayMs:80},[ips[1]]:{visualDelayMs:140},[ips[2]]:{visualDelayMs:310},[ips[3]]:{visualDelayMs:450}});
const advance=(ip=ips[0],s=seeded,list=ips)=>f.goveeVisualAdvanceV927(ip,list,s);
let groups=0;
const test=(name,fn)=>{fn();groups++;console.log('PASS V927 '+name);};
const document={schema:'sonic-track-analysis-v318',trackId:'current-song',source:'v927-test',durationMs:30000,
 tempo:145,timeSignature:4,beats:[],bars:[],importedAt:0,sections:[
  {startMs:0,durationMs:10000,label:'verse',confidence:.96},
  {startMs:10000,durationMs:9000,label:'hook',confidence:.94},
  {startMs:19000,durationMs:6000,label:'build',confidence:.92},
  {startMs:25000,durationMs:5000,label:'drop',confidence:.99},
 ]};
const verified=(at=11000,s=seeded,ip=ips[0],doc=document,track='current-song')=>
 f.compensatedGoveeVerifiedTimeV927(doc,track,at,ip,ips,s);

test('settings opt-in false by default',()=>{assert.equal(defaults.enabled,false);assert.deepEqual(defaults.fixtures,{});});
test('malformed settings cannot enable automatically',()=>{for(const x of [null,undefined,1,'true',[],{},false,{enabled:1},{enabled:'true'}])assert.equal(f.normalizeGoveeCalibrationV927(x).enabled,false);});
test('schema is versioned',()=>{assert.equal(defaults.schema,'govee-room-calibration-v927');});
test('default manual advance is zero for every lamp',()=>{for(const ip of ips)assert.equal(advance(ip,enabled()),0);});
test('no V927 modification while disabled',()=>{for(const ip of ips)assert.equal(advance(ip,{...seeded,enabled:false}),0);});
test('per-lamp visual delays remain independent',()=>{assert.equal(advance(ips[0]),80);assert.equal(advance(ips[1]),140);assert.equal(advance(ips[2]),310);});
test('global advance cap prevents excessive time shifts',()=>{assert.equal(advance(ips[3]),350);});
test('cap setting is validated',()=>{assert.equal(f.normalizeGoveeCalibrationV927({maxAdvanceMs:900}).maxAdvanceMs,500);assert.equal(f.normalizeGoveeCalibrationV927({maxAdvanceMs:-9}).maxAdvanceMs,0);});
test('cap zero completely disables time shift',()=>{assert.equal(advance(ips[0],enabled({[ips[0]]:{visualDelayMs:300}},{maxAdvanceMs:0})),0);});
test('visual delay setting clamped 0 to 500 in 10ms steps',()=>{const s=f.setGoveeVisualDelayV927(seeded,ips[0],911);assert.equal(s.fixtures[ips[0]].visualDelayMs,500);assert.equal(f.setGoveeVisualDelayV927(s,ips[0],-100).fixtures[ips[0]].visualDelayMs,0);});
test('fractional manual setting rounds to 10ms step',()=>{assert.equal(f.setGoveeVisualDelayV927(seeded,ips[0],87).fixtures[ips[0]].visualDelayMs,90);});
test('text numeric injection rejected to fallback',()=>{const s=f.normalizeGoveeCalibrationV927({fixtures:{[ips[0]]:{visualDelayMs:'490'}}});assert.equal(s.fixtures[ips[0]].visualDelayMs,0);});
test('NaN infinite numeric injection cannot propagate',()=>{for(const x of [NaN,Infinity,-Infinity])assert.equal(f.normalizeGoveeCalibrationV927({fixtures:{[ips[0]]:{visualDelayMs:x}}}).fixtures[ips[0]].visualDelayMs,0);});
test('invalid fixture values ignored',()=>{const x=f.normalizeGoveeCalibrationV927({fixtures:{[ips[0]]:null,[ips[1]]:[],[ips[2]]:{visualDelayMs:20}}});assert.deepEqual(Object.keys(x.fixtures),[ips[2]]);});
test('public IPs never included',()=>{const x=f.normalizeGoveeCalibrationV927({fixtures:{'8.8.8.8':{visualDelayMs:300},'127.0.0.1':{visualDelayMs:300},[ips[0]]:{visualDelayMs:30}}});assert.deepEqual(Object.keys(x.fixtures),[ips[0]]);});
test('only selected devices can be compensated',()=>{assert.equal(advance(ips[1],seeded,[ips[0]]),0);});
test('unexpected ip never advances',()=>{assert.equal(advance('192.168.1.88'),0);});
test('IP spoof and malformed host fail closed',()=>{for(const ip of ['localhost','192.168.1.999','192.168.1.1:3000','172.15.1.1','169.254.5.5'])assert.equal(advance(ip,enabled({[ip]:{visualDelayMs:400}}),[ip]),0);});
test('up to 32 fixture entries only',()=>{const v={};for(let i=1;i<=45;i++)v[`192.168.1.${i}`]={visualDelayMs:10};assert.ok(Object.keys(f.normalizeGoveeCalibrationV927({fixtures:v}).fixtures).length<=32);});
test('normalize does not mutate imported config',()=>{const input=json(seeded);f.normalizeGoveeCalibrationV927(input);assert.deepEqual(input,json(seeded));});
test('unknown keys, tokens and endpoints not stored',()=>{const x=f.normalizeGoveeCalibrationV927({...seeded,token:'super-secret',endpoint:'http://localhost',fixtures:{[ips[0]]:{visualDelayMs:50,token:'abc'}}});assert.doesNotMatch(JSON.stringify(x),/token|endpoint|secret/);});
test('roundtrip diagnostic is separate from optical advance',()=>{const s=f.recordGoveeStatusRoundtripV927(seeded,ips[0],[430,500,480],12345);assert.equal(advance(ips[0],s),advance(ips[0],seeded));});
test('three HTTP/status samples averaged arithmetically',()=>{const s=f.recordGoveeStatusRoundtripV927(seeded,ips[0],[450,500,550],12345);assert.equal(s.fixtures[ips[0]].statusRoundtripMs,500);assert.equal(s.fixtures[ips[0]].statusSamples,3);assert.equal(s.fixtures[ips[0]].checkedAt,12345);});
test('diagnostic cannot enable function',()=>{const s=f.recordGoveeStatusRoundtripV927(defaults,ips[0],[350,450],1234);assert.equal(s.enabled,false);});
test('diagnostic cannot change visual offset',()=>{const s=f.recordGoveeStatusRoundtripV927(seeded,ips[0],[350,450],1234);assert.equal(s.fixtures[ips[0]].visualDelayMs,80);});
test('invalid diagnostic samples are rejected',()=>{for(const values of [[],[NaN],[Infinity],[-1],[3100],new Array(6).fill(350)])assert.deepEqual(json(f.recordGoveeStatusRoundtripV927(seeded,ips[0],values,125)),json(seeded));});
test('bad diagnostic timestamps rejected',()=>{assert.deepEqual(json(f.recordGoveeStatusRoundtripV927(seeded,ips[0],[400],NaN)),json(seeded));});
test('network times sanitised without causing visual advance',()=>{const s=f.normalizeGoveeCalibrationV927({enabled:true,fixtures:{[ips[0]]:{statusRoundtripMs:3000,statusSamples:500,visualDelayMs:0}}});assert.equal(advance(ips[0],s),0);assert.equal(s.fixtures[ips[0]].statusSamples,5);});
test('storage roundtrip and same-tab event',()=>{f.saveGoveeCalibrationV927(seeded);assert.deepEqual(json(f.loadGoveeCalibrationV927()),json(seeded));assert.ok(events.includes(f.GOVEE_CALIBRATION_EVENT_V927));});
test('corrupt browser storage returns safe default',()=>{storage.set(f.GOVEE_CALIBRATION_KEY_V927,'{broken');assert.equal(f.loadGoveeCalibrationV927().enabled,false);});
test('save strips unknown sensitive fields',()=>{f.saveGoveeCalibrationV927({...seeded,token:'x',fixtures:{[ips[0]]:{visualDelayMs:100,password:'n'}}});assert.doesNotMatch(storage.get(f.GOVEE_CALIBRATION_KEY_V927),/password|token/);});
test('invalid IP setter preserves settings',()=>{assert.deepEqual(json(f.setGoveeVisualDelayV927(seeded,'8.8.8.8',500)),json(seeded));});
test('setter keeps existing diagnostic status',()=>{const s=f.recordGoveeStatusRoundtripV927(seeded,ips[0],[390,410],1234);assert.equal(f.setGoveeVisualDelayV927(s,ips[0],120).fixtures[ips[0]].statusRoundtripMs,400);});
test('wave time adds no offset when disabled',()=>{assert.equal(f.compensatedGoveeWaveTimeV927(7000,ips[0],ips,{...seeded,enabled:false}),7000);});
test('wave time phase advances, not command rate',()=>{assert.equal(f.compensatedGoveeWaveTimeV927(7000,ips[0],ips,seeded),7080);});
test('invalid time cannot be transformed into a fabricated valid cue',()=>{for(const t of [-1,NaN,Infinity])assert.equal(Object.is(f.compensatedGoveeWaveTimeV927(t,ips[0],ips,seeded),t),true);});
test('verified phase advances only within same section',()=>{assert.equal(verified(12000),12080);});
test('section boundary never pretriggers next hook',()=>{assert.equal(verified(9980),9980);});
test('section boundary never pretriggers next drop',()=>{assert.equal(verified(24970),24970);});
test('exact transition uses new verified section',()=>{assert.equal(verified(25000),25080);});
test('low-confidence section cannot be advanced',()=>{const doc=json(document);doc.sections[1].confidence=.45;assert.equal(verified(11000,seeded,ips[0],doc),11000);});
test('unlabelled sections cannot be advanced',()=>{const doc=json(document);delete doc.sections[1].label;assert.equal(verified(11000,seeded,ips[0],doc),11000);});
test('unknown track analysis is rejected',()=>{assert.equal(verified(12000,seeded,ips[0],document,'other-song'),12000);});
test('null analysis cannot pre-trigger sections',()=>{assert.equal(verified(12000,seeded,ips[0],null),12000);});
test('end of track is not advanced',()=>{assert.equal(verified(30000),30000);});
test('out-of-range progress stays unchanged',()=>{for(const t of [NaN,-1,Infinity])assert.equal(Object.is(verified(t),t),true);});
test('no section match uses unchanged timeline',()=>{const doc=json(document);doc.sections=[];assert.equal(verified(22000,seeded,ips[0],doc),22000);});
test('zero delay keeps verified section unchanged',()=>{assert.equal(verified(12000,enabled()),12000);});
test('preview returns one row per private selected fixture',()=>{const rows=f.previewGoveeCalibrationV927([...ips,'8.8.8.8'],seeded,5000);assert.equal(rows.length,4);});
test('preview uses same timings as live plan',()=>{const rows=f.previewGoveeCalibrationV927(ips,seeded,8000);for(const r of rows)assert.equal(r.compensatedMs,8000+advance(r.ip));});
test('preview never edits stored settings',()=>{const before=storage.get(f.GOVEE_CALIBRATION_KEY_V927);f.previewGoveeCalibrationV927(ips,seeded,3000);assert.equal(storage.get(f.GOVEE_CALIBRATION_KEY_V927),before);});
test('preview never contains bridge credentials',()=>{assert.doesNotMatch(JSON.stringify(f.previewGoveeCalibrationV927(ips,seeded)),/token|password|endpoint/);});
test('no automatic RTT-to-visual delay formula',()=>{const s=f.recordGoveeStatusRoundtripV927(enabled(),ips[1],[800,900,1000],999);assert.equal(advance(ips[1],s),0);});
test('live integration uses only one LAN command sender',()=>{const src=read('components/GoveeMusicSyncV909.tsx');assert.equal((src.match(/goveeBridgeRequestV909\(config,'\/command'/g)||[]).length,1);for(const part of ['compensatedGoveeWaveTimeV927','compensatedGoveeVerifiedTimeV927','GOVEE_CALIBRATION_EVENT_V927','calibrationSettings,roadmapSettings,syncSettingsV1027]'])assert.ok(src.includes(part));});
test('existing V915 group limiter preserved after V927',()=>{const src=read('components/GoveeMusicSyncV909.tsx');assert.match(src,/festivalDeliveredLook=easeGoveeLookV911\(previous,\s*applyGoveeGroupBrightnessV915\(spatialUngrouped,group,config\.masterBrightness\)\)/);});
test('UI never sends power or color commands for calibration',()=>{const src=read('components/GoveeRoomCalibrationStudioV927.tsx');assert.doesNotMatch(src,/action:\s*['"](?:power|strobe|look|brightness|color)['"]/);assert.ok(src.includes("'/status','POST'"));assert.ok(src.includes('config.autoSync'));});
test('UI exposes manual lag and explicit save/revert',()=>{const src=read('components/GoveeRoomCalibrationStudioV927.tsx');for(const text of ['Sichtbare Verzögerung','Kalibrierung speichern','Änderungen verwerfen','Vorschau','nicht</strong>, wann die LEDs'])assert.ok(src.includes(text));});
test('panel includes new UI after V926',()=>{const src=read('components/GoveeLanPanelV909.tsx');assert.ok(src.indexOf('<GoveeRoomCalibrationStudioV927')>src.indexOf('<GoveeSpatialStudioV926'));});
test('build guard remains first and includes V927 checks',()=>{const pkg=JSON.parse(read('package.json'));assert.ok(pkg.scripts.prebuild.includes('npm run test:v908 && '));assert.ok(pkg.scripts.prebuild.includes('npm run test:v927 && npm run test:v927:types && npm run test:v927:ui-types'));});
test('CI includes all isolated V927 checks',()=>{const src=read('.github/workflows/v832-continuous-validation.yml');assert.ok(src.includes('npm run test:v927 && npm run test:v927:types && npm run test:v927:ui-types'));});
test('no additional LAN scheduling in V927 core',()=>{const src=read('lib/goveeRoomCalibrationV927.ts');assert.doesNotMatch(src,/\bfetch\s*\(|\bsetInterval\s*\(|goveeBridgeRequestV909\s*\(/);});
let samples=0;
for(let i=0;i<5000;i++){
 const ip=ips[i%4];const status=(i*73)%2200;const vis=(i*31)%501;
 const s=f.setGoveeVisualDelayV927(enabled({[ip]:{visualDelayMs:vis,statusRoundtripMs:status}},{maxAdvanceMs:(i*13)%501}),ip,vis);
 const t=(i*819)%30000;const a=f.goveeVisualAdvanceV927(ip,ips,s);
 assert.ok(Number.isFinite(a)&&a>=0&&a<=500&&a<=s.maxAdvanceMs);
 const next=f.compensatedGoveeWaveTimeV927(t,ip,ips,s);
 assert.ok(next>=t&&next<=t+500);
 const secure=f.compensatedGoveeVerifiedTimeV927(document,document.trackId,t,ip,ips,s);
 assert.ok(Number.isFinite(secure)&&secure>=t&&secure<=t+500);
 const sec=document.sections.find(v=>v.startMs<=t&&t<v.startMs+v.durationMs);
 if(sec)assert.ok(secure<sec.startMs+sec.durationMs);
 samples++;
}
console.log(`PASS V927 – ${groups} test groups, ${samples} deterministic latency/room-wave states`);
