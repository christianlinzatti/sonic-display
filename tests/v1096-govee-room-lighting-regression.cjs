'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {DEFAULT_GOVEE_ROOM_V1096:DEF,normalizeGoveeRoomV1096:normal,
 planGoveeRoomV1096:plan,applyGoveeRoomV1096:apply,
 GOVEE_ROOM_KEY_V1096:KEY}=load('lib/goveeRoomLightingV1096');
const {normalizeGoveeSyncV1027}=load('lib/goveeConcertSyncV1027');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ips=['192.168.1.10','192.168.1.11','192.168.1.12','192.168.1.13'];
const sync=normalizeGoveeSyncV1027({fixtureIps:{wall:ips[0],rhythm:ips[1],neon:ips[2],ambient:ips[3]}});
const base={settings:{schema:'govee-room-v1096',enabled:true,strength:45,style:'festival'},
 syncSettings:sync,ip:ips[0],selectedIps:ips,
 phase:{phase:'hook',previous:'verse',transition:1,verified:true},genre:'Deutschrap',
 bridgeEnabled:true,autoSync:true,directorEnabled:true,playing:true,
 visible:true,stageIsArena:true};
assert.deepEqual(normal(null),DEF);
assert.deepEqual(normal({enabled:true}),DEF,'missing schema cannot imply approval');
assert.deepEqual(normal({schema:'govee-room-v1096',enabled:true,strength:Infinity,style:'flash'}),
 {schema:'govee-room-v1096',enabled:true,strength:40,style:'balanced'});
assert.equal(normal({...base.settings,strength:-90}).strength,0);
assert.equal(normal({...base.settings,strength:999}).strength,60);
assert.equal(KEY,'sonic-display:govee-room-lighting-v1096');
const valid=plan(base);assert(valid.active);assert.equal(valid.zone,'wall');
assert(valid.mix>0&&valid.mix<=.12&&valid.brightnessFactor<=1&&valid.brightnessFactor>=.92);
for(const patch of [
 {settings:{...base.settings,enabled:false}},
 {settings:{...base.settings,strength:0}},
 {bridgeEnabled:false},{autoSync:false},{directorEnabled:false},
 {playing:false},{visible:false},{stageIsArena:false},{reducedMotion:true},
 {savedShowActive:true},{authoredStageActive:true},{groupUnisonActive:true},
 {recovering:true},{voiceActive:true},{roomAtmosphereActive:true},
 {higherPrioritySyncActive:true},{manualOverride:true},
 {phase:{...base.phase,verified:false}},
 {phase:{...base.phase,phase:'ambient'}},
 {phase:{...base.phase,transition:Infinity}},
 {selectedIps:[]},{selectedIps:[...ips,'192.168.1.14']},
 {selectedIps:[ips[0],ips[0]]},{ip:'192.168.1.99'},
 {syncSettings:normalizeGoveeSyncV1027({fixtureIps:{wall:'8.8.8.8'}})},
 ]){const decision=plan({...base,...patch});assert(!decision.active,'should fail closed: '+JSON.stringify(patch));}
const baseLook={brightness:77,color:{r:60,g:85,b:120}};
for(const zone of ['wall','rhythm','neon','ambient']){
 const ip=sync.fixtureIps[zone];const d=plan({...base,ip});assert(d.active);assert.equal(d.zone,zone);
 const result=apply(baseLook,{brightness:74,color:{r:50,g:65,b:115}},d,71);
 assert(result.brightness<=71&&result.brightness<=baseLook.brightness);
 for(const channel of ['r','g','b']){
  assert(Number.isInteger(result.color[channel]));assert(result.color[channel]>=0&&result.color[channel]<=255);
  assert(Math.abs(result.color[channel]-({r:50,g:65,b:115})[channel])<=12);
 }
}
// A planned finale/peak is not an observed V318 phase and cannot invent a drop.
const synthetic={active:true,scene:'finale',segmentIndex:6,intensity:100,fade:1,
 deck:'fan',floating:'rise',lasers:'tunnel',camera:'wide',dance:'peak'};
assert(!plan({...base,show:synthetic,phase:{...base.phase,verified:false}}).active);
assert.equal(plan({...base,show:synthetic}).phase,'hook');
const noMic=plan({...base,microphoneActive:false,beatObserved:true,beatStrength:1,sampleAgeMs:0});
const oldBeat=plan({...base,microphoneActive:true,beatObserved:true,beatStrength:1,sampleAgeMs:15000});
assert.equal(noMic.mix,oldBeat.mix);
assert(plan({...base,microphoneActive:true,beatObserved:true,beatStrength:.91,sampleAgeMs:130}).mix>=noMic.mix);
assert.deepEqual(apply(baseLook,undefined,plan({...base,playing:false}),100),baseLook);
for(const bad of [
 {...valid,mix:Infinity},{...valid,mix:.6},{...valid,brightnessFactor:.1},
 {...valid,accent:{r:Infinity,g:1,b:1}},{...valid,accent:{r:999,g:1,b:1}},
 ])assert.deepEqual(apply(baseLook,undefined,bad,80),baseLook);
assert.deepEqual(apply(baseLook,undefined,valid,Infinity),baseLook);
let samples=0;
const phases=['verse','hook','build','drop','break'];
const genres=['Deutschrap','Hardtekk','Deutschrock','Pop'];
for(let i=0;i<180000;i++){
 const zone=i%4,ip=ips[zone],phase=phases[i%5],style=['balanced','cinematic','festival'][i%3];
 const d=plan({...base,ip,genre:genres[i%4],settings:{...base.settings,style,strength:1+i%60},
  phase:{phase,previous:'verse',transition:(i%100)/99,verified:true},
  microphoneActive:i%2===0,beatObserved:i%7===0,beatStrength:(i%101)/100,sampleAgeMs:i%1300});
 assert(d.active);assert(d.mix>=0&&d.mix<=.12);assert(d.brightnessFactor>=.92&&d.brightnessFactor<=1);
 const prev={brightness:65,color:{r:i%256,g:(i*3)%256,b:(i*7)%256}};
 const look={brightness:i%101,color:{r:(i*2)%256,g:(i*5)%256,b:(i*11)%256}};
 const result=apply(look,prev,d,i%101);
 assert(result.brightness<=look.brightness&&result.brightness<=i%101&&result.brightness>=0);
 for(const k of ['r','g','b']){
  assert(result.color[k]>=0&&result.color[k]<=255);
  assert(Math.abs(result.color[k]-prev.color[k])<=12);
 }
 samples++;
}
const runtime=read('components/GoveeMusicSyncV909.tsx');
for(const text of ['planGoveeRoomV1096({settings:roomSettingsV1096',
 'const roomLookV1096=applyGoveeRoomV1096(showLookV1042,previous,roomDecisionV1096,',
 'applyConcertLightV1154(roomLookV1096,coordinationDecisionV1154,',
  'governConcertLookV961(previous,ensembleLook,',
 'syncDecisionV1027.active||authoredDecisionV1042.active',
 'roomAtmosphereActive:roomDecisionV987.active','savedShowActive:Boolean(show)',
 'groupUnisonActive:group?.mode',
 'GOVEE_ROOM_EVENT_V1096','GOVEE_ROOM_KEY_V1096',
 'window.removeEventListener(GOVEE_ROOM_EVENT_V1096,refresh)'])
 assert(runtime.includes(text),'existing single sender not integrated: '+text);
const source=read('lib/goveeRoomLightingV1096.ts');
for(const forbidden of ['fetch(', 'setInterval(', 'setTimeout(', 'requestAnimationFrame(',
 'goveeBridgeRequestV909(', 'action:\'power\'', 'action:\'on\'', 'navigator.mediaDevices',
 'Math.random(', 'Date.now('])assert(!source.includes(forbidden),'pure overlay must not introduce side effects: '+forbidden);
const ui=read('components/GoveeRoomLightingStudioV1096.tsx');
assert(ui.includes('saveGoveeRoomV1096(safe)'));
assert(ui.includes('Reine Vorschau (keine LAN-Kommandos)'));
assert(read('components/GoveeLanPanelV909.tsx').includes('<GoveeRoomLightingStudioV1096 config={config} devices={devices}/>'));
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0)>=1096);assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
for(const p of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(p).includes('tests/v1096-govee-room-lighting-regression.cjs'));
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1096(root)'));
assert(require('../lib/goveeSenderInvariant.cjs').hasFinalGoveeGovernor(require('node:fs').readFileSync(require('node:path').join(__dirname,'../components/GoveeMusicSyncV909.tsx'),'utf8')),'All overlays must feed the final governor before the sole LAN look send');

console.log('PASS V1096: '+samples+' bounded four-zone looks, explicit consent, manual priority, verified phases, capped color slew, no extra LAN sender');
