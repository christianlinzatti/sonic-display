'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {
 DEFAULT_GOVEE_JOURNEY_V1098:DEFAULT,normalizeGoveeJourneyV1098:normalize,
 planGoveeColorJourneyV1098:plan,applyGoveeColorJourneyV1098:apply,
 GOVEE_JOURNEY_KEY_V1098:KEY,GOVEE_JOURNEY_EVENT_V1098:EVENT
}=load('lib/goveeColorJourneyV1098');
const {planGoveeRoomV1096:planRoom,applyGoveeRoomV1096:applyRoom}=load('lib/goveeRoomLightingV1096');
const {planGoveeSpatialWaveV1097:planWave,applyGoveeSpatialWaveV1097:applyWave}=load('lib/goveeSpatialWavesV1097');
const {normalizeGoveeSyncV1027}=load('lib/goveeConcertSyncV1027');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ips=['192.168.1.10','192.168.1.11','192.168.1.12','192.168.1.13'];
const sync=normalizeGoveeSyncV1027({fixtureIps:{wall:ips[0],rhythm:ips[1],neon:ips[2],ambient:ips[3]}});
const phase={phase:'hook',previous:'verse',transition:.65,verified:true};
const settings={schema:'govee-journey-v1098',enabled:true,style:'festival',strength:55};
const input={settings:{schema:'govee-room-v1096',enabled:true,strength:45,style:'festival'},syncSettings:sync,
 selectedIps:ips,phase,genre:'Deutschrap',bridgeEnabled:true,autoSync:true,
 directorEnabled:true,playing:true,visible:true,stageIsArena:true};
assert.deepEqual(normalize(null),DEFAULT);
assert.deepEqual(normalize({enabled:true}),DEFAULT);
assert.deepEqual(normalize({...settings,strength:Infinity,style:'unsafe'}),{...settings,strength:30,style:'balanced'});
assert.equal(normalize({...settings,strength:200}).strength,60);
assert.equal(normalize({...settings,strength:-10}).strength,0);
assert(KEY.endsWith('-v1098')&&EVENT.endsWith('-v1098'));
const zones=['wall','rhythm','neon','ambient'];
const room=zones.map((z,i)=>planRoom({...input,ip:ips[i]}));
assert(room.every(x=>x.active));
assert(!plan({settings:{...settings,enabled:false},base:room[0],phase}).active);
assert(!plan({settings:{...settings,strength:0},base:room[0],phase}).active);
assert(!plan({settings,base:{...room[0],active:false},phase}).active);
assert(!plan({settings,base:room[0],phase:{...phase,verified:false}}).active);
assert(!plan({settings,base:room[0],phase:{...phase,phase:'drop'}}).active);
assert(!plan({settings,base:room[0],phase:{...phase,phase:'fake'}}).active);
assert(!plan({settings,base:room[0],phase:{...phase,transition:-1}}).active);
assert(!plan({settings,base:room[0],phase:{...phase,transition:Infinity}}).active);
assert(!plan({settings,base:{...room[0],mix:Infinity},phase}).active);
assert.deepEqual(apply(room[0],plan({settings:{...settings,enabled:false},base:room[0],phase})),room[0]);
const manual=planRoom({...input,ip:ips[0],manualOverride:true});
assert(!manual.active&&!plan({settings,base:manual,phase}).active);
const paused=planRoom({...input,ip:ips[0],playing:false});
assert(!paused.active&&!plan({settings,base:paused,phase}).active);
const unverified=planRoom({...input,ip:ips[0],phase:{...phase,verified:false}});
assert(!unverified.active&&!plan({settings,base:unverified,phase}).active);
const original={brightness:75,color:{r:120,g:70,b:200}},previous={brightness:72,color:{r:116,g:75,b:196}};
const looks=new Set();
for(const style of ['balanced','cinematic','festival']){
 for(const section of ['verse','build','hook','drop','break']){
  const currentPhase={...phase,phase:section};
  for(let i=0;i<4;i++){
   const base=planRoom({...input,ip:ips[i],phase:currentPhase});
   const result=plan({settings:{...settings,style},base,phase:currentPhase});
   assert(result.active&&result.zone===base.zone&&result.phase===base.phase);
   const graded=apply(base,result);
   assert(graded.mix<=base.mix&&graded.mix>=0);
   assert(graded.brightnessFactor<=base.brightnessFactor&&graded.brightnessFactor>=.92);
   for(const c of ['r','g','b'])assert(Math.abs(graded.accent[c]-base.accent[c])<=24);
   const out=applyRoom(original,previous,graded,75);
   assert(out.brightness<=original.brightness);
   for(const c of ['r','g','b'])assert(Math.abs(out.color[c]-previous.color[c])<=12);
   looks.add([result.accent.r,result.accent.g,result.accent.b].join(','));
  }
 }
}
assert(looks.size>=8,'verified phases, styles and zones must yield different colors');
// Backward compatibility: wave V1097 and V1098 both operate on the same V1096 gate.
const wave=planWave({settings:{schema:'govee-waves-v1097',enabled:true,strength:50,style:'orbit'},base:room[0],phase});
const waved=applyWave(room[0],wave);
const journey=plan({settings,base:waved,phase});
const composed=apply(waved,journey);
assert(composed.mix<=waved.mix&&composed.brightnessFactor<=waved.brightnessFactor);
// A tampered or unsafely amplified decision must not override the base.
assert.deepEqual(apply(room[0],{...journey,brightnessFactor:1.5}),room[0]);
assert.deepEqual(apply(room[0],{...journey,accent:{...journey.accent,r:999}}),room[0]);
let samples=0;
for(let i=0;i<160000;i++){
 const p={...phase,phase:['verse','build','hook','drop','break'][i%5],transition:(i%101)/100};
 const base=planRoom({...input,ip:ips[i%4],phase:p});
 assert(base.active);
 const result=plan({settings:{...settings,strength:1+i%60,style:['balanced','cinematic','festival'][i%3]},base,phase:p});
 assert(result.active);
 const graded=apply(base,result);
 assert(graded.mix<=base.mix&&graded.brightnessFactor<=base.brightnessFactor);
 const prior={brightness:i%101,color:{r:(i*3)%256,g:(i*5)%256,b:(i*7)%256}};
 const now={brightness:i%101,color:{r:(i*11)%256,g:(i*13)%256,b:(i*17)%256}};
 const final=applyRoom(now,prior,graded,i%101);
 assert(final.brightness>=0&&final.brightness<=now.brightness);
 for(const k of ['r','g','b']){
  assert(final.color[k]>=0&&final.color[k]<=255);
  assert(Math.abs(final.color[k]-prior.color[k])<=12);
 }
 samples++;
}
const source=read('lib/goveeColorJourneyV1098.ts');
for(const forbidden of ['fetch(', 'setInterval(', 'setTimeout(', 'requestAnimationFrame(',
 'goveeBridgeRequestV909(', 'Date.now(', 'Math.random(', 'navigator.mediaDevices'])
 assert(!source.includes(forbidden),'forbidden new side effect: '+forbidden);
const runtime=read('components/GoveeMusicSyncV909.tsx');
for(const marker of ['planGoveeRoomV1096({settings:roomSettingsV1096',
 'applyGoveeSpatialWaveV1097(roomDecisionV1096,waveDecisionV1097)',
 'planGoveeColorJourneyV1098({settings:journeySettingsV1098',
 'applyGoveeColorJourneyV1098(roomDecisionV1096,journeyDecisionV1098)',
 'applyGoveeRoomV1096(showLookV1042,previous,roomDecisionV1096,',
 'governConcertLookV961(previous,roomLookV1096,',
 'waveSettingsV1097,journeySettingsV1098',
 'window.removeEventListener(GOVEE_JOURNEY_EVENT_V1098,refresh)'])
 assert(runtime.includes(marker),'missing authorized runtime route: '+marker);
assert(runtime.indexOf('applyGoveeSpatialWaveV1097(roomDecisionV1096,waveDecisionV1097)')<
 runtime.indexOf('applyGoveeColorJourneyV1098(roomDecisionV1096,journeyDecisionV1098)'));
assert(runtime.indexOf('applyGoveeColorJourneyV1098(roomDecisionV1096,journeyDecisionV1098)')<
 runtime.indexOf('applyGoveeRoomV1096(showLookV1042,previous,roomDecisionV1096,'));
const ui=read('components/GoveeColorJourneyStudioV1098.tsx');
assert(ui.includes('saveGoveeJourneyV1098(safe)')&&ui.includes('Reine Vorschau')&&!ui.includes('goveeBridgeRequestV909('));
assert(read('components/GoveeLanPanelV909.tsx').includes('<GoveeColorJourneyStudioV1098 config={config} devices={devices}/>'));
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0)>=1098);assert.equal(lock.version,pkg.version);
assert.equal(lock.packages[''].version,pkg.version);
for(const p of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(p).includes('tests/v1098-govee-color-journey-regression.cjs'));
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1098(root)'));
console.log('PASS V1098: '+samples+' bounded mood samples, four verified zones, no new LAN sender, V1097 live update');
