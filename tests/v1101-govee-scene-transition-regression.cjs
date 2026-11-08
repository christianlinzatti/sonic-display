'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {DEFAULT_GOVEE_TRANSITION_V1101:DEFAULT,normalizeGoveeTransitionV1101:normalize,
 planGoveeSceneTransitionV1101:plan,applyGoveeSceneTransitionV1101:apply,
 GOVEE_TRANSITION_KEY_V1101:KEY}=load('lib/goveeSceneTransitionV1101');
const {planGoveeRoomV1096:planRoom,applyGoveeRoomV1096:applyRoom}=load('lib/goveeRoomLightingV1096');
const {normalizeGoveeSyncV1027}=load('lib/goveeConcertSyncV1027');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ips=['192.168.1.10','192.168.1.11','192.168.1.12','192.168.1.13'];
const sync=normalizeGoveeSyncV1027({fixtureIps:{wall:ips[0],rhythm:ips[1],neon:ips[2],ambient:ips[3]}});
const phase={phase:'hook',previous:'verse',transition:.4,verified:true};
const settings={schema:'govee-scene-transition-v1101',enabled:true,strength:70,style:'cinematic'};
const context={settings:{schema:'govee-room-v1096',enabled:true,strength:50,style:'festival'},
 syncSettings:sync,selectedIps:ips,phase,genre:'Deutschrap',bridgeEnabled:true,autoSync:true,
 directorEnabled:true,playing:true,visible:true,stageIsArena:true};
const base=planRoom({...context,ip:ips[0]});
assert(base.active&&base.mix>0&&KEY.endsWith('-v1101'));
assert.deepEqual(normalize(null),DEFAULT);
assert.deepEqual(normalize({enabled:true}),DEFAULT);
assert(!normalize({schema:'bad',enabled:true}).enabled);
assert.equal(normalize({...settings,strength:Infinity}).strength,50);
assert.equal(normalize({...settings,strength:200}).strength,80);
assert.equal(normalize({...settings,strength:-50}).strength,0);
assert.equal(normalize({...settings,style:'unknown'}).style,'gentle');
assert(!plan({settings:{...settings,enabled:false},base,phase}).active);
assert(!plan({settings:{...settings,strength:0},base,phase}).active);
assert(!plan({settings,base:{...base,active:false},phase}).active);
assert(!plan({settings,base:{...base,mix:.8},phase}).active);
assert(!plan({settings,base:{...base,brightnessFactor:1.5},phase}).active);
assert(!plan({settings,base:{...base,accent:{...base.accent,g:Infinity}},phase}).active);
for(const wrong of [{...phase,verified:false},{...phase,phase:'drop'},
 {...phase,transition:NaN},{...phase,transition:-.01},{...phase,transition:1.1}])
 assert(!plan({settings,base,phase:wrong}).active);
for(const guard of ['manualOverride','savedShowActive','authoredStageActive','groupUnisonActive',
 'recovering','voiceActive','roomAtmosphereActive','higherPrioritySyncActive','reducedMotion']){
 const forbidden=planRoom({...context,ip:ips[0],[guard]:true});
 assert(!forbidden.active&&!plan({settings,base:forbidden,phase}).active,guard);
}
for(const invalid of [{...settings,enabled:false},{...settings,strength:0}]){
 const inactive=plan({settings:invalid,base,phase});
 assert.deepEqual(apply(base,inactive),base);
}
const at0=plan({settings,base,phase:{...phase,transition:0}}),at1=plan({settings,base,phase:{...phase,transition:1}});
assert(at0.active&&at0.mixFactor<1&&at0.mixFactor>=.2);
assert(at1.active&&at1.mixFactor===1);
assert(at0.brightnessFactor<=1&&at0.brightnessFactor>=.992);
assert.deepEqual(apply(base,{...at0,mixFactor:1.5}),base);
assert.deepEqual(apply(base,{...at0,mixFactor:NaN}),base);
assert.deepEqual(apply(base,{...at0,brightnessFactor:1.5}),base);
assert.deepEqual(apply(base,{...at0,progress:Infinity}),base);
assert.deepEqual(apply(base,{...at0,zone:'ambient'}),base);
assert.deepEqual(apply(base,{...at0,phase:'verse'}),base);
const look={brightness:85,color:{r:84,g:120,b:160}},previous={brightness:81,color:{r:86,g:118,b:162}};
let tested=0;const versions=new Set();
for(let i=0;i<160000;i++){
 const p={...phase,phase:['verse','build','hook','drop','break'][i%5],transition:(i%101)/100};
 const room=planRoom({...context,ip:ips[i%4],phase:p});
 assert(room.active);
 const cfg={...settings,style:['gentle','cinematic','festival'][i%3],strength:i%81};
 const d=plan({settings:cfg,base:room,phase:p});
 assert.equal(d.active,cfg.strength>0);
 const result=apply(room,d);
 assert(result.mix<=room.mix&&result.mix>=0);
 assert(result.brightnessFactor<=room.brightnessFactor&&result.brightnessFactor>=.92);
 assert.deepEqual(result.accent,room.accent);
 if(i%16===0){
  const finalLook=applyRoom(look,previous,result,85);
  assert(finalLook.brightness<=85&&finalLook.brightness>=0);
  for(const ch of ['r','g','b']){
   assert(Number.isFinite(finalLook.color[ch]));
   assert(Math.abs(finalLook.color[ch]-previous.color[ch])<=12);
  }
 }
 versions.add(cfg.style+':'+Math.round(p.transition*100)+':'+cfg.strength);
 tested++;
}
for(const style of ['gentle','cinematic','festival']){
 let last=-1;
 for(let i=0;i<=100;i++){
  const d=plan({settings:{...settings,style},base,phase:{...phase,transition:i/100}});
  assert(d.mixFactor>=last,'monotonic ease-in: '+style);last=d.mixFactor;
 }
}
assert(versions.size>200);
const core=read('lib/goveeSceneTransitionV1101.ts');
for(const forbidden of ['fetch(', 'setInterval(', 'setTimeout(', 'requestAnimationFrame(',
 'goveeBridgeRequestV909(', 'Date.now(', 'Math.random(', 'navigator.mediaDevices'])
 assert(!core.includes(forbidden),'no hardware, timer or inference in pure transition module: '+forbidden);
const sender=read('components/GoveeMusicSyncV909.tsx');
const ordered=['applyGoveeZoneMixV1100(roomDecisionV1096,zoneMixDecisionV1100)',
 'planGoveeSceneTransitionV1101({settings:transitionSettingsV1101',
 'applyGoveeSceneTransitionV1101(roomDecisionV1096,transitionDecisionV1101)',
 'applyGoveeRoomV1096(showLookV1042,previous,roomDecisionV1096,',
 'governConcertLookV961(previous,roomLookV1096,',
 "goveeBridgeRequestV909(config,'/command','POST'"];
const positions=ordered.map(x=>sender.indexOf(x));
assert(positions.every((pos,i)=>pos>=0&&(!i||pos>positions[i-1])),`old V961 and V909 must remain final: ${positions}`);
assert(sender.includes('zoneMixerSettingsV1100,transitionSettingsV1101,choreographerSettingsV1102,goveeShowEnabledV1042'));
assert(sender.includes('window.removeEventListener(GOVEE_TRANSITION_EVENT_V1101,refresh)'));
assert(read('components/GoveeLanPanelV909.tsx').includes('<GoveeSceneTransitionStudioV1101 config={config} devices={devices}/>'));
const ui=read('components/GoveeSceneTransitionStudioV1101.tsx');
assert(ui.includes('Reine Vorschau')&&!ui.includes('goveeBridgeRequestV909('));
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0)>=1101);assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
for(const f of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(f).includes('tests/v1101-govee-scene-transition-regression.cjs'));
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1101(root)'));
console.log('PASS V1101: '+tested+' bounded scene-transition states, 303 monotonic fade samples, V909/V961 single authorized path');
