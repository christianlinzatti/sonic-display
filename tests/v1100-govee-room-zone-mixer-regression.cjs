'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {GOVEE_ROOM_ZONES_V1100:ZONES,GOVEE_ZONE_PRESETS_V1100:PRESETS,
 DEFAULT_GOVEE_ZONE_MIXER_V1100:DEFAULT,
 normalizeGoveeZoneMixerV1100:normalize,planGoveeZoneMixV1100:plan,
 applyGoveeZoneMixV1100:apply,GOVEE_ZONE_MIXER_KEY_V1100:KEY}=load('lib/goveeRoomZoneMixerV1100');
const {planGoveeRoomV1096:planRoom,applyGoveeRoomV1096:applyRoom}=load('lib/goveeRoomLightingV1096');
const {normalizeGoveeSyncV1027}=load('lib/goveeConcertSyncV1027');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ips=['192.168.1.10','192.168.1.11','192.168.1.12','192.168.1.13'];
const sync=normalizeGoveeSyncV1027({fixtureIps:{wall:ips[0],rhythm:ips[1],neon:ips[2],ambient:ips[3]}});
const phase={phase:'hook',previous:'verse',transition:.75,verified:true};
const settings={schema:'govee-zone-mixer-v1100',enabled:true,weights:{wall:100,rhythm:65,neon:35,ambient:0}};
const context={settings:{schema:'govee-room-v1096',enabled:true,strength:45,style:'festival'},
 syncSettings:sync,selectedIps:ips,phase,genre:'Deutschrap',bridgeEnabled:true,autoSync:true,
 directorEnabled:true,playing:true,visible:true,stageIsArena:true};
assert.deepEqual(normalize(null),DEFAULT);
assert.deepEqual(normalize({enabled:true}),DEFAULT);
assert(!normalize({schema:'invalid',enabled:true}).enabled);
assert.deepEqual(normalize({...settings,weights:{wall:200,rhythm:-40,neon:NaN,ambient:Infinity}}).weights,
 {wall:100,rhythm:0,neon:100,ambient:100});
assert.equal(PRESETS.stage.ambient,40);assert.equal(PRESETS.ambient.ambient,100);
assert(KEY.endsWith('-v1100')&&ZONES.length===4);
const rooms=ips.map(ip=>planRoom({...context,ip}));
assert(rooms.every(x=>x.active));
assert(!plan({settings:{...settings,enabled:false},base:rooms[0],phase}).active);
assert(!plan({settings,base:{...rooms[0],active:false},phase}).active);
assert(!plan({settings,base:rooms[0],phase:{...phase,verified:false}}).active);
assert(!plan({settings,base:rooms[0],phase:{...phase,phase:'verse'}}).active);
assert(!plan({settings,base:rooms[0],phase:{...phase,transition:Infinity}}).active);
assert(!plan({settings,base:{...rooms[0],mix:.9},phase}).active);
assert(!plan({settings,base:{...rooms[0],brightnessFactor:2},phase}).active);
for(const guard of ['manualOverride','savedShowActive','authoredStageActive','groupUnisonActive',
 'recovering','voiceActive','roomAtmosphereActive','higherPrioritySyncActive','reducedMotion']){
 const blocked=planRoom({...context,ip:ips[0],[guard]:true});
 assert(!blocked.active&&!plan({settings,base:blocked,phase}).active,guard);
}
assert(!plan({settings,base:planRoom({...context,ip:ips[0],playing:false}),phase}).active);
assert(!plan({settings,base:planRoom({...context,ip:ips[0],visible:false}),phase}).active);
const off=plan({settings:{...settings,enabled:false},base:rooms[0],phase});
assert.deepEqual(apply(rooms[0],off),rooms[0]);
const valid=plan({settings,base:rooms[1],phase});
assert(valid.active&&valid.zone==='rhythm'&&valid.weight===65);
for(const bad of [
 {...valid,mixFactor:1.01},{...valid,mixFactor:.01},{...valid,weight:101},
 {...valid,brightnessFactor:1.1},{...valid,zone:'ambient'},{...valid,phase:'verse'},
 {...valid,weight:NaN},{...valid,brightnessFactor:Infinity}
])assert.deepEqual(apply(rooms[1],bad),rooms[1]);
const look={brightness:80,color:{r:80,g:110,b:155}},previous={brightness:76,color:{r:85,g:105,b:150}};
const strengths=new Set();let tested=0;
for(let i=0;i<160000;i++){
 const p={...phase,phase:['verse','build','hook','break','drop'][i%5],transition:(i%101)/100};
 const base=planRoom({...context,ip:ips[i%4],phase:p});
 const x={...settings,weights:{...settings.weights,[ZONES[i%4]]:i%101}};
 const d=plan({settings:x,base,phase:p});
 assert(d.active,'valid opt-in should adjust one of four zones');
 const modified=apply(base,d);
 assert(modified.mix>=0&&modified.mix<=base.mix);
 assert(modified.brightnessFactor>=.92&&modified.brightnessFactor<=base.brightnessFactor);
 assert.deepEqual(modified.accent,base.accent);
 const adjusted=applyRoom(look,previous,modified,80);
 assert(adjusted.brightness<=look.brightness&&adjusted.brightness>=0);
 for(const k of ['r','g','b']){
  assert(Number.isFinite(adjusted.color[k])&&adjusted.color[k]>=0&&adjusted.color[k]<=255);
  assert(Math.abs(adjusted.color[k]-previous.color[k])<=12);
 }
 strengths.add(d.zone+':'+d.weight);tested++;
}
assert(strengths.size>300,'weights should offer useful per-zone control');
const core=read('lib/goveeRoomZoneMixerV1100.ts');
for(const bad of ['fetch(', 'setInterval(', 'setTimeout(', 'requestAnimationFrame(',
 'goveeBridgeRequestV909(', 'Date.now(', 'Math.random(', 'navigator.mediaDevices'])
 assert(!core.includes(bad),'no new hardware sender, timers or microphone: '+bad);
const sender=read('components/GoveeMusicSyncV909.tsx');
const ordered=['applyGoveeBeatAccentV1099(roomDecisionV1096,beatAccentDecisionV1099)',
 'planGoveeZoneMixV1100({settings:zoneMixerSettingsV1100',
 'applyGoveeZoneMixV1100(roomDecisionV1096,zoneMixDecisionV1100)',
 'applyGoveeRoomV1096(showLookV1042,previous,roomDecisionV1096,',
 'governConcertLookV961(previous,ensembleLook,',
 "goveeBridgeRequestV909(config,'/command','POST'"];
const positions=ordered.map(token=>sender.indexOf(token));
assert(positions.every((p,i)=>p>=0&&(!i||p>positions[i-1])),'V961 and V909 must remain final');
assert(sender.includes('zoneMixerSettingsV1100,')&&sender.includes('goveeShowEnabledV1042'));
assert(sender.includes('window.removeEventListener(GOVEE_ZONE_MIXER_EVENT_V1100,refresh)'));
assert(read('components/GoveeLanPanelV909.tsx').includes('<GoveeRoomZoneMixerStudioV1100 config={config} devices={devices}/>'));
const ui=read('components/GoveeRoomZoneMixerStudioV1100.tsx');
assert(ui.includes('Reine Vorschau')&&!ui.includes('goveeBridgeRequestV909('));
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0)>=1100);assert.equal(lock.version,pkg.version);
assert.equal(lock.packages[''].version,pkg.version);
for(const file of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(file).includes('tests/v1100-govee-room-zone-mixer-regression.cjs'));
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1100(root)'));
assert(require('../lib/goveeSenderInvariant.cjs').hasFinalGoveeGovernor(require('node:fs').readFileSync(require('node:path').join(__dirname,'../components/GoveeMusicSyncV909.tsx'),'utf8')),'All overlays must feed the final governor before the sole LAN look send');

console.log('PASS V1100: '+tested+' bounded zone-weight cases, '+strengths.size+' independent weights, single LAN sender and V961 governor');
