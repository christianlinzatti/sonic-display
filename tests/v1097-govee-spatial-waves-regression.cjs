'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {DEFAULT_GOVEE_WAVES_V1097:DEFAULT,normalizeGoveeWavesV1097:normalize,
 planGoveeSpatialWaveV1097:plan,applyGoveeSpatialWaveV1097:apply,
 GOVEE_WAVES_KEY_V1097:KEY,GOVEE_WAVES_EVENT_V1097:EVENT}=load('lib/goveeSpatialWavesV1097');
const {planGoveeRoomV1096:planRoom,applyGoveeRoomV1096:applyRoom}=load('lib/goveeRoomLightingV1096');
const {normalizeGoveeSyncV1027}=load('lib/goveeConcertSyncV1027');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ips=['192.168.1.10','192.168.1.11','192.168.1.12','192.168.1.13'];
const sync=normalizeGoveeSyncV1027({fixtureIps:{wall:ips[0],rhythm:ips[1],neon:ips[2],ambient:ips[3]}});
const phase={phase:'hook',previous:'verse',transition:.27,verified:true};
const settings={schema:'govee-waves-v1097',enabled:true,style:'orbit',strength:55};
const base={settings:{schema:'govee-room-v1096',enabled:true,strength:45,style:'festival'},
 syncSettings:sync,selectedIps:ips,phase,genre:'Deutschrap',bridgeEnabled:true,
 autoSync:true,directorEnabled:true,playing:true,visible:true,stageIsArena:true};
assert.deepEqual(normalize(null),DEFAULT);
assert.deepEqual(normalize({enabled:true}),DEFAULT,'old or corrupted storage cannot opt in');
assert.deepEqual(normalize({...settings,strength:Infinity,style:'blink'}),
 {...settings,strength:35,style:'orbit'});
assert.equal(normalize({...settings,strength:120}).strength,60);
assert.equal(normalize({...settings,strength:-40}).strength,0);
assert.equal(KEY,'sonic-display:govee-spatial-waves-v1097');assert(EVENT.includes('v1097'));
const zones=['wall','rhythm','neon','ambient'];
const room=zones.map((z,i)=>planRoom({...base,ip:ips[i]}));
for(const d of room)assert(d.active);
const choices=room.map(d=>plan({settings,base:d,phase}));
assert(choices.every(d=>d.active));
assert(new Set(choices.map(d=>Math.round(d.wave*1000))).size>=3,'spatial zones must receive genuinely different envelopes');
assert(plan({settings:{...settings,enabled:false},base:room[0],phase}).active===false);
assert(!plan({settings:{...settings,strength:0},base:room[0],phase}).active);
assert(!plan({settings,base:{...room[0],active:false},phase}).active);
assert(!plan({settings,base:room[0],phase:{...phase,verified:false}}).active);
assert(!plan({settings,base:room[0],phase:{...phase,phase:'drop'}}).active);
assert(!plan({settings,base:room[0],phase:{...phase,transition:Infinity}}).active);
assert(!plan({settings,base:room[0],phase:{...phase,transition:-.1}}).active);
assert(!plan({settings,base:{...room[0],mix:NaN},phase}).active);
assert(!plan({settings,base:{...room[0],zone:'unknown'},phase}).active);
assert.deepEqual(apply(room[0],plan({settings:{...settings,enabled:false},base:room[0],phase})),room[0]);
const current={brightness:77,color:{r:50,g:100,b:150}};
const previous={brightness:74,color:{r:49,g:102,b:144}};
for(const style of ['orbit','mirror','breath']){
 const result=room.map(d=>plan({settings:{...settings,style},base:d,phase}));
 assert(result.every(x=>x.active));
 if(style==='mirror'){assert.equal(result[0].wave,result[3].wave);assert.equal(result[1].wave,result[2].wave);}
 if(style==='breath')assert(result.every(x=>x.wave===result[0].wave));
 for(let i=0;i<4;i++){
  const modified=apply(room[i],result[i]);
  assert(modified.mix>=0&&modified.mix<=room[i].mix);
  assert(modified.brightnessFactor>=.92&&modified.brightnessFactor<=room[i].brightnessFactor);
  const oldLook=applyRoom(current,previous,room[i],70);
  const newLook=applyRoom(current,previous,modified,70);
  assert(newLook.brightness<=oldLook.brightness&&newLook.brightness<=70);
  for(const c of ['r','g','b']){
   assert(newLook.color[c]>=0&&newLook.color[c]<=255);
   assert(Math.abs(newLook.color[c]-previous.color[c])<=12);
  }
 }
}
// No show template is permitted to supply a verified song section or re-enable V1096.
const inactive=planRoom({...base,ip:ips[0],playing:false});
assert(!plan({settings,base:inactive,phase}).active);
const manual=planRoom({...base,ip:ips[0],manualOverride:true});
assert(!plan({settings,base:manual,phase}).active);
const noPhase=planRoom({...base,ip:ips[0],phase:{...phase,verified:false}});
assert(!plan({settings,base:noPhase,phase}).active);
let samples=0;
for(let i=0;i<160000;i++){
 const zone=i%4,style=['orbit','mirror','breath'][i%3];
 const progress=(i%101)/100;
 const checkedPhase={...phase,phase:['verse','hook','build','drop','break'][i%5],transition:progress};
 const original=planRoom({...base,ip:ips[zone],phase:checkedPhase});
 assert(original.active);
 const wave=plan({settings:{...settings,style,strength:1+i%60},base:original,phase:checkedPhase});
 assert(wave.active&&wave.wave>=0&&wave.wave<=1&&wave.strength>0&&wave.strength<=1);
 const changed=apply(original,wave);
 assert(changed.mix<=original.mix&&changed.mix>=0);
 assert(changed.brightnessFactor<=original.brightnessFactor&&changed.brightnessFactor>=.92);
 const old={brightness:i%101,color:{r:i%256,g:(i*3)%256,b:(i*7)%256}};
 const prev={brightness:i%101,color:{r:(i*4)%256,g:(i*5)%256,b:(i*9)%256}};
 const final=applyRoom(old,prev,changed,i%101);
 assert(final.brightness<=old.brightness&&final.brightness>=0);
 for(const k of ['r','g','b']){
  assert(final.color[k]>=0&&final.color[k]<=255);
  assert(Math.abs(final.color[k]-prev.color[k])<=12);
 }
 samples++;
}
const source=read('lib/goveeSpatialWavesV1097.ts');
for(const forbidden of ['fetch(', 'setInterval(', 'setTimeout(', 'requestAnimationFrame(',
 'goveeBridgeRequestV909(', 'Date.now(', 'Math.random(', 'navigator.mediaDevices'])
 assert(!source.includes(forbidden),'new network or clock side effect forbidden: '+forbidden);
const runtime=read('components/GoveeMusicSyncV909.tsx');
for(const mark of ['planGoveeRoomV1096({settings:roomSettingsV1096',
 'planGoveeSpatialWaveV1097({settings:waveSettingsV1097',
 'applyGoveeSpatialWaveV1097(roomDecisionV1096,waveDecisionV1097)',
 'applyGoveeRoomV1096(showLookV1042,previous,roomDecisionV1096,',
 'governConcertLookV961(previous,roomLookV1096,',
 'GOVEE_WAVES_EVENT_V1097','window.removeEventListener(GOVEE_WAVES_EVENT_V1097,refresh)'])
 assert(runtime.includes(mark),'missing connection to the existing LAN governor: '+mark);
assert(runtime.indexOf('planGoveeSpatialWaveV1097({settings:waveSettingsV1097')<
 runtime.indexOf('applyGoveeRoomV1096(showLookV1042,previous,roomDecisionV1096,'));
const ui=read('components/GoveeSpatialWavesStudioV1097.tsx');
assert(ui.includes('saveGoveeWavesV1097(safe)')&&ui.includes('Reine Vorschau'));
assert(!ui.includes('goveeBridgeRequestV909('));
assert(read('components/GoveeLanPanelV909.tsx').includes('<GoveeSpatialWavesStudioV1097 config={config} devices={devices}/>'));
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert.equal(pkg.version,'0.1.0-v1097');assert.equal(lock.version,pkg.version);
assert.equal(lock.packages[''].version,pkg.version);
for(const p of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(p).includes('tests/v1097-govee-spatial-waves-regression.cjs'));
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1097(root)'));
console.log('PASS V1097: '+samples+' bounded zoned wave samples, authoritative V318 sections, V1096 consent, no extra LAN sender');
