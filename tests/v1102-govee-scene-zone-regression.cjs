'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {DEFAULT_GOVEE_CHOREOGRAPHER_V1102:DEFAULT,normalizeGoveeChoreographerV1102:normalize,
 planGoveeSceneZoneV1102:plan,applyGoveeSceneZoneV1102:apply,
 GOVEE_CHOREOGRAPHER_KEY_V1102:KEY}=load('lib/goveeSceneZoneChoreographerV1102');
const {planGoveeRoomV1096:planRoom,applyGoveeRoomV1096:applyRoom}=load('lib/goveeRoomLightingV1096');
const {normalizeGoveeSyncV1027}=load('lib/goveeConcertSyncV1027');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ips=['192.168.1.10','192.168.1.11','192.168.1.12','192.168.1.13'];
const sync=normalizeGoveeSyncV1027({fixtureIps:{wall:ips[0],rhythm:ips[1],neon:ips[2],ambient:ips[3]}});
const settings={schema:'govee-zone-choreographer-v1102',enabled:true,strength:75,style:'cinematic'};
const phase={phase:'hook',previous:'verse',transition:.4,verified:true};
const context={settings:{schema:'govee-room-v1096',enabled:true,strength:50,style:'festival'},
 syncSettings:sync,selectedIps:ips,phase,genre:'Deutschrap',bridgeEnabled:true,
 autoSync:true,directorEnabled:true,playing:true,visible:true,stageIsArena:true};
const base=planRoom({...context,ip:ips[0]});
assert(base.active&&KEY.endsWith('-v1102'));
assert.deepEqual(normalize(null),DEFAULT);
assert.deepEqual(normalize({enabled:true}),DEFAULT);
assert(!normalize({schema:'incorrect',enabled:true}).enabled);
assert.equal(normalize({...settings,strength:Infinity}).strength,60);
assert.equal(normalize({...settings,strength:-30}).strength,0);
assert.equal(normalize({...settings,strength:130}).strength,100);
assert.equal(normalize({...settings,style:'random'}).style,'balanced');
assert(!plan({settings:{...settings,enabled:false},base,phase}).active);
assert(!plan({settings:{...settings,strength:0},base,phase}).active);
for(const forbiddenBase of [{...base,active:false},{...base,mix:.15},{...base,brightnessFactor:1.3},
 {...base,zone:null},{...base,accent:{...base.accent,r:NaN}},{...base,phase:'ambient'}])
 assert(!plan({settings,base:forbiddenBase,phase}).active);
for(const wrong of [{...phase,verified:false},{...phase,phase:'break'},
 {...phase,transition:NaN},{...phase,transition:-.1},{...phase,transition:1.1}])
 assert(!plan({settings,base,phase:wrong}).active);
for(const guard of ['manualOverride','savedShowActive','authoredStageActive','groupUnisonActive',
 'recovering','voiceActive','roomAtmosphereActive','higherPrioritySyncActive','reducedMotion']){
 const forbidden=planRoom({...context,ip:ips[0],[guard]:true});
 assert(!forbidden.active&&!plan({settings,base:forbidden,phase}).active,guard);
}
const disabled=plan({settings:{...settings,enabled:false},base,phase});
assert.deepEqual(apply(base,disabled),base);
const early=plan({settings,base,phase:{...phase,transition:0}});
const late=plan({settings,base,phase:{...phase,transition:1}});
assert(early.active&&late.active&&early.weight>=0&&early.weight<=1&&late.weight>=0&&late.weight<=1);
assert.equal(late.weight,plan({settings,base,phase:{...phase,previous:'unknown',transition:1}}).weight);
assert.equal(late.weight,plan({settings,base,phase:{...phase,previous:'ambient',transition:0}}).weight);
assert.deepEqual(apply(base,{...early,mixFactor:Infinity}),base);
assert.deepEqual(apply(base,{...early,mixFactor:1.2}),base);
assert.deepEqual(apply(base,{...early,weight:-1}),base);
assert.deepEqual(apply(base,{...early,zone:'neon'}),base);
assert.deepEqual(apply(base,{...early,phase:'verse'}),base);
let tested=0;const roles=new Map();
const look={brightness:85,color:{r:84,g:120,b:160}},previous={brightness:81,color:{r:86,g:118,b:162}};
for(let i=0;i<180000;i++){
 const p={...phase,phase:['verse','build','hook','drop','break'][i%5],
  previous:['verse','build','hook','drop','break','ambient'][i%6],transition:(i%101)/100};
 const room=planRoom({...context,ip:ips[i%4],phase:p});
 assert(room.active);
 const cfg={...settings,style:['balanced','cinematic','festival'][i%3],strength:i%101};
 const d=plan({settings:cfg,base:room,phase:p});
 assert.equal(d.active,cfg.strength>0);
 const result=apply(room,d);
 assert(result.mix<=room.mix&&result.mix>=0);
 assert.equal(result.brightnessFactor,room.brightnessFactor);
 assert.deepEqual(result.accent,room.accent);
 if(i%11===0){
  const finalLook=applyRoom(look,previous,result,85);
  assert(finalLook.brightness<=85&&finalLook.brightness>=0);
  for(const ch of ['r','g','b']){
   assert(Number.isFinite(finalLook.color[ch]));
   assert(Math.abs(finalLook.color[ch]-previous.color[ch])<=12);
  }
 }
 roles.set(cfg.style+':'+p.phase+':'+room.zone,Math.round(d.mixFactor*1000));
 tested++;
}
assert(roles.size===60);
for(const style of ['balanced','cinematic','festival']){
 const all={...settings,style,strength:100};
 const outputs={};
 for(const p of ['verse','build','hook','drop','break']){
  outputs[p]={};
  for(let z=0;z<4;z++){
   const phaseCue={phase:p,previous:p,verified:true,transition:1};
   const source=planRoom({...context,ip:ips[z],phase:phaseCue});
   outputs[p][source.zone]=plan({settings:all,base:source,phase:phaseCue}).weight;
  }
 }
 assert(outputs.verse.ambient>outputs.verse.rhythm);
 assert(outputs.build.wall>=outputs.build.ambient);
 assert(outputs.hook.rhythm>=outputs.hook.ambient);
 assert(outputs.drop.neon>=outputs.drop.ambient);
 assert(outputs.break.ambient>outputs.break.rhythm);
}
const core=read('lib/goveeSceneZoneChoreographerV1102.ts');
for(const forbidden of ['fetch(', 'setInterval(', 'setTimeout(', 'requestAnimationFrame(',
 'goveeBridgeRequestV909(', 'Date.now(', 'Math.random(', 'navigator.mediaDevices'])
 assert(!core.includes(forbidden),'no extra hardware path, timer or event prediction: '+forbidden);
const sender=read('components/GoveeMusicSyncV909.tsx');
const order=['applyGoveeZoneMixV1100(roomDecisionV1096,zoneMixDecisionV1100)',
 'applyGoveeSceneTransitionV1101(roomDecisionV1096,transitionDecisionV1101)',
 'planGoveeSceneZoneV1102({settings:choreographerSettingsV1102',
 'applyGoveeSceneZoneV1102(roomDecisionV1096,sceneZoneDecisionV1102)',
 'applyGoveeRoomV1096(showLookV1042,previous,roomDecisionV1096,',
 'applyConcertLightV1154(roomLookV1096,coordinationDecisionV1154,',
 'governConcertLookV961(previous,coordinatedLookV1154,',
 "goveeBridgeRequestV909(config,'/command','POST'"];
const positions=order.map(x=>sender.indexOf(x));
assert(positions.every((pos,i)=>pos>=0&&(!i||pos>positions[i-1])),`final V1096,V961,V909 gates kept: ${positions}`);
assert(sender.includes('transitionSettingsV1101,choreographerSettingsV1102,coordinationV1154,goveeShowEnabledV1042'));
assert(sender.includes('window.removeEventListener(GOVEE_CHOREOGRAPHER_EVENT_V1102,refresh)'));
assert(read('components/GoveeLanPanelV909.tsx').includes('<GoveeSceneZoneStudioV1102 config={config} devices={devices}/>'));
const ui=read('components/GoveeSceneZoneStudioV1102.tsx');
assert(ui.includes('Reine Vorschau')&&!ui.includes('goveeBridgeRequestV909('));
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(/^0\.1\.0-v\d+$/.test(pkg.version)&&Number(pkg.version.split('-v')[1])>=1102);assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
for(const f of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(f).includes('tests/v1102-govee-scene-zone-regression.cjs'));
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1102(root)'));
console.log('PASS V1102: '+tested+' bounded scene-zone states; 60 zone/phase/style combinations; V961/V909 final security path');
