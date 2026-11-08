'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {DEFAULT_GOVEE_BEAT_ACCENT_V1099:DEFAULT,normalizeGoveeBeatAccentV1099:normalize,
 planGoveeBeatAccentV1099:plan,applyGoveeBeatAccentV1099:apply,
 GOVEE_BEAT_ACCENT_KEY_V1099:KEY,GOVEE_BEAT_ACCENT_EVENT_V1099:EVENT}=load('lib/goveeLiveBeatAccentV1099');
const {planGoveeRoomV1096:planRoom,applyGoveeRoomV1096:applyRoom}=load('lib/goveeRoomLightingV1096');
const {planGoveeSpatialWaveV1097:planWave,applyGoveeSpatialWaveV1097:applyWave}=load('lib/goveeSpatialWavesV1097');
const {planGoveeColorJourneyV1098:planJourney,applyGoveeColorJourneyV1098:applyJourney}=load('lib/goveeColorJourneyV1098');
const {normalizeGoveeSyncV1027}=load('lib/goveeConcertSyncV1027');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ips=['192.168.1.10','192.168.1.11','192.168.1.12','192.168.1.13'];
const sync=normalizeGoveeSyncV1027({fixtureIps:{wall:ips[0],rhythm:ips[1],neon:ips[2],ambient:ips[3]}});
const phase={phase:'hook',previous:'verse',transition:.75,verified:true};
const settings={schema:'govee-beat-accent-v1099',enabled:true,strength:50,style:'dynamic'};
const roomInput={settings:{schema:'govee-room-v1096',enabled:true,strength:45,style:'festival'},syncSettings:sync,
 selectedIps:ips,phase,genre:'Hardtekk',bridgeEnabled:true,autoSync:true,directorEnabled:true,
 playing:true,visible:true,stageIsArena:true};
assert.deepEqual(normalize(null),DEFAULT);
assert.deepEqual(normalize({enabled:true}),DEFAULT);
assert.deepEqual(normalize({...settings,strength:Infinity,style:'unsupported'}),{...settings,strength:35,style:'soft'});
assert.equal(normalize({...settings,strength:250}).strength,60);
assert.equal(normalize({...settings,strength:-25}).strength,0);
assert(KEY.endsWith('-v1099')&&EVENT.endsWith('-v1099'));
const zones=['wall','rhythm','neon','ambient'];
const room=zones.map((z,i)=>planRoom({...roomInput,ip:ips[i]}));
assert(room.every(x=>x.active));
const valid={settings,base:room[0],phase,microphoneActive:true,beatObserved:true,beatStrength:.96,sampleAgeMs:100};
const done=plan(valid);
assert(done.active&&done.envelope>0&&done.envelope<=1);
assert(!plan({...valid,settings:{...settings,enabled:false}}).active);
assert(!plan({...valid,settings:{...settings,strength:0}}).active);
assert(!plan({...valid,base:{...room[0],active:false}}).active);
assert(!plan({...valid,phase:{...phase,verified:false}}).active);
assert(!plan({...valid,phase:{...phase,phase:'build'}}).active);
assert(!plan({...valid,phase:{...phase,phase:'fake'}}).active);
assert(!plan({...valid,phase:{...phase,phase:'drop'}}).active);
assert(!plan({...valid,phase:{...phase,transition:2}}).active);
assert(!plan({...valid,microphoneActive:false}).active);
assert(!plan({...valid,beatObserved:false}).active);
assert(!plan({...valid,beatStrength:.7}).active);
assert(!plan({...valid,beatStrength:NaN}).active);
assert(!plan({...valid,beatStrength:2}).active);
assert(!plan({...valid,sampleAgeMs:-1}).active);
assert(!plan({...valid,sampleAgeMs:700}).active);
assert(!plan({...valid,sampleAgeMs:Infinity}).active);
const paused=planRoom({...roomInput,ip:ips[0],playing:false});
assert(!plan({...valid,base:paused}).active);
const manual=planRoom({...roomInput,ip:ips[0],manualOverride:true});
assert(!plan({...valid,base:manual}).active);
for(const field of ['higherPrioritySyncActive','savedShowActive','voiceActive','recovering','reducedMotion']){
 const base=planRoom({...roomInput,ip:ips[0],[field]:true});
 assert(!plan({...valid,base}).active,field+' must block live beat');
}
assert.deepEqual(apply(room[0],plan({...valid,beatObserved:false})),room[0]);
assert.deepEqual(apply(room[0],{...done,brightnessFactor:1.1}),room[0]);
assert.deepEqual(apply(room[0],{...done,mixFactor:.1}),room[0]);
assert.deepEqual(apply(room[0],{...done,accent:{...done.accent,r:999}}),room[0]);
assert.deepEqual(apply(room[0],{...done,phase:'verse'}),room[0]);
assert.deepEqual(apply(room[0],{...done,envelope:2}),room[0]);
const look={brightness:75,color:{r:100,g:80,b:150}},previous={brightness:70,color:{r:103,g:84,b:148}};
let cases=0,activeCases=0;const seen=new Set();
for(let i=0;i<180000;i++){
 const p={...phase,phase:i%2?'drop':'hook',transition:(i%101)/100};
 const base=planRoom({...roomInput,ip:ips[i%4],phase:p});
 const settingsFor={...settings,strength:1+i%60,style:i%3?'soft':'dynamic'};
 const age=i%601,beat=.78+(i%221)/1000;
 const input={settings:settingsFor,base,phase:p,microphoneActive:true,beatObserved:true,
  beatStrength:beat,sampleAgeMs:age};
 const decision=plan(input);
 const modified=apply(base,decision);
 assert(modified.mix>=0&&modified.mix<=base.mix);
 assert(modified.brightnessFactor>=.92&&modified.brightnessFactor<=base.brightnessFactor);
 for(const k of ['r','g','b']){
  assert(Number.isFinite(modified.accent[k])&&modified.accent[k]>=0&&modified.accent[k]<=255);
  assert(Math.abs(modified.accent[k]-base.accent[k])<=12);
 }
 const adjusted=applyRoom(look,previous,modified,75);
 assert(adjusted.brightness<=look.brightness&&adjusted.brightness>=0);
 for(const k of ['r','g','b'])assert(Math.abs(adjusted.color[k]-previous.color[k])<=12);
 if(decision.active){activeCases++;seen.add(decision.zone+':'+Math.round(decision.envelope*100));}
 cases++;
}
assert(activeCases>100000&&seen.size>=30,'a spread of valid beats must yield bounded spatial variations');
const current=room[1];
const wave=planWave({settings:{schema:'govee-waves-v1097',enabled:true,style:'orbit',strength:45},base:current,phase});
const waved=applyWave(current,wave);
const journey=planJourney({settings:{schema:'govee-journey-v1098',enabled:true,style:'balanced',strength:40},base:waved,phase});
const graded=applyJourney(waved,journey);
const beatAccent=plan({...valid,base:graded});
assert(beatAccent.active);
const output=apply(graded,beatAccent);
assert(output.mix<=graded.mix&&output.brightnessFactor<=graded.brightnessFactor);
const core=read('lib/goveeLiveBeatAccentV1099.ts');
for(const bad of ['fetch(', 'setInterval(', 'setTimeout(', 'requestAnimationFrame(', 'goveeBridgeRequestV909(', 'Date.now(', 'Math.random(', 'navigator.mediaDevices'])
 assert(!core.includes(bad),'no separate hardware, timer or beat source allowed: '+bad);
const runtime=read('components/GoveeMusicSyncV909.tsx');
for(const marker of ['planGoveeRoomV1096({settings:roomSettingsV1096',
 'applyGoveeSpatialWaveV1097(roomDecisionV1096,waveDecisionV1097)',
 'applyGoveeColorJourneyV1098(roomDecisionV1096,journeyDecisionV1098)',
 'planGoveeBeatAccentV1099({settings:beatAccentSettingsV1099',
 'applyGoveeBeatAccentV1099(roomDecisionV1096,beatAccentDecisionV1099)',
 'applyGoveeRoomV1096(showLookV1042,previous,roomDecisionV1096,',
 'governConcertLookV961(previous,roomLookV1096,',
 'waveSettingsV1097,journeySettingsV1098,beatAccentSettingsV1099',
 'window.removeEventListener(GOVEE_BEAT_ACCENT_EVENT_V1099,refresh)'])
 assert(runtime.includes(marker),'missing safe existing route: '+marker);
const positions=['applyGoveeSpatialWaveV1097(roomDecisionV1096,waveDecisionV1097)',
 'applyGoveeColorJourneyV1098(roomDecisionV1096,journeyDecisionV1098)',
 'applyGoveeBeatAccentV1099(roomDecisionV1096,beatAccentDecisionV1099)',
 'applyGoveeRoomV1096(showLookV1042,previous,roomDecisionV1096,',
 'governConcertLookV961(previous,roomLookV1096,'].map(x=>runtime.indexOf(x));
assert(positions.every((p,i)=>p>=0&&(!i||p>positions[i-1])),'existing governor must remain last');
const ui=read('components/GoveeBeatAccentStudioV1099.tsx');
assert(ui.includes('Reine Vorschau')&&!ui.includes('goveeBridgeRequestV909('));
assert(read('components/GoveeLanPanelV909.tsx').includes('<GoveeBeatAccentStudioV1099 config={config} devices={devices}/>'));
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0)>=1099,'V1099+ release required');assert.equal(lock.version,pkg.version);
assert.equal(lock.packages[''].version,pkg.version);
for(const p of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(p).includes('tests/v1099-govee-live-beat-accent-regression.cjs'));
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1099(root)'));
console.log('PASS V1099: '+cases+' bounded live beat samples, '+activeCases+' valid accents, four zones, all Govee opt-in priorities and existing LAN governor');
