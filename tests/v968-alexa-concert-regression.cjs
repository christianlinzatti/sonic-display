#!/usr/bin/env node
'use strict';
/** Test Alexa V968 pure presentation and voice behavior without cloud, React or hardware. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs'),root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function load(file,dependencies={}){
 const compiled=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(compiled.diagnostics?.length||0,0,`${file}: invalid syntax`);
 const module={exports:{}};
 vm.runInNewContext(compiled.outputText,{module,exports:module.exports,require:name=>{
  if(!Object.hasOwn(dependencies,name))throw Error('Unexpected dependency '+name);return dependencies[name];
 }},{filename:file,timeout:12000});
 return module.exports;
}
const v967=load('lib/alexaConcertV967.ts');
const v968=load('lib/alexaConcertV968.ts',{'./alexaConcertV967':v967});
const util=load('lib/ultimateConcertRoadmapV958.ts');
const v966=load('lib/immersiveConcertEngineV966.ts');
const base={...util.DEFAULT_CONCERT_V958,hardwareSync:true,
 timeline:{TRACK:[{atMs:500,phase:'hook',effect:'beams'}]},presets:[{id:'myshow'}]};
const scene={id:'t|1|hook',phase:'hook',verified:true,genre:'hardtekk',camera:'wide',formation:'sync',wall:'pulse',
 palette:['#123456','#abcdef'],effects:['beams','lasers','bass-impact'],intensity:.9,transition:1,
 spotlight:1,lightGain:1,finale:false,reason:'confirmed',timelineOverride:false};
const maskInput={active:true,mood:'impact',colorA:'#123456',colorB:'#abcdef',beamOpacity:.04,
 sideGlowOpacity:.08,floorGlowOpacity:.05,backHazeOpacity:.06,audienceEdgeOpacity:.07,motionPhase:0,archScale:1};
let n=0;
function test(name,fn){n++;try{fn();console.log('PASS V968 '+name);}catch(e){console.error('FAIL V968 '+name,e);process.exitCode=1;}}
test('exact allowlist of 21 voice actions, all labels and no open-ended instructions',()=>{
 assert.equal(v968.ALEXA_CONCERT_COMMANDS_V968.length,21);
 assert.equal(new Set(v968.ALEXA_CONCERT_COMMANDS_V968).size,21);
 for(const command of v968.ALEXA_CONCERT_COMMANDS_V968){
  assert(v968.isAlexaConcertCommandV968(command),command);
  assert.equal(typeof v968.ALEXA_CONCERT_MESSAGES_V968[command],'string');
 }
 for(const invalid of ['volume-100','play','next','govee-on','flash','zone-light',null,{},['festival'],'ZONE-STAGE'])
  assert(!v968.isAlexaConcertCommandV968(invalid),String(invalid));
});
test('settings normalized, old saved files get safe compatible defaults',()=>{
 const settings=util.normalizeConcertRoadmapV958({enabled:true,voiceZoneV968:'invalid',voiceMoodV968:'unknown',voiceFxV968:'flash'});
 assert.equal(settings.voiceZoneV968,'all');assert.equal(settings.voiceMoodV968,'auto');assert.equal(settings.voiceFxV968,'auto');
 assert.equal(util.normalizeConcertRoadmapV958({voiceZoneV968:'backdrop',voiceMoodV968:'neon',voiceFxV968:'fog'}).voiceZoneV968,'backdrop');
 for(const key of ['voiceZoneV968','voiceMoodV968','voiceFxV968'])assert.equal(typeof settings[key],'string');
});
test('all voice commands hard-disable hardware and preserve manually authored timelines',()=>{
 for(const cmd of v968.ALEXA_CONCERT_COMMANDS_V968){
  const state=v968.applyAlexaConcertCommandV968(base,cmd);
  assert.equal(state.hardwareSync,false,cmd);
  assert.equal(state.timeline,base.timeline,cmd);
  assert.equal(state.presets,base.presets,cmd);
 }
});
test('stage targets can be chosen and restored without changing camera or song playback',()=>{
 for(const [command,zone] of [['zone-stage','stage'],['zone-backdrop','backdrop'],['zone-audience','audience'],['zone-all','all']])
  assert.equal(v968.applyAlexaConcertCommandV968(base,command).voiceZoneV968,zone);
 const restored=v968.applyAlexaConcertCommandV968(v968.applyAlexaConcertCommandV968(base,'zone-audience'),'festival');
 assert.equal(restored.voiceZoneV968,'all');
});
test('mood and effect commands are bounded and switching modes resets earlier visual overrides',()=>{
 let state=base;
 state=v968.applyAlexaConcertCommandV968(state,'mood-neon');assert.equal(state.voiceMoodV968,'neon');
 state=v968.applyAlexaConcertCommandV968(state,'effect-fog');assert.equal(state.voiceFxV968,'fog');
 state=v968.applyAlexaConcertCommandV968(state,'mood-auto');assert.equal(state.voiceMoodV968,'auto');
 state=v968.applyAlexaConcertCommandV968(state,'effect-auto');assert.equal(state.voiceFxV968,'auto');
 state=v968.applyAlexaConcertCommandV968(state,'effect-off');assert.equal(state.voiceFxV968,'off');
 state=v968.applyAlexaConcertCommandV968(state,'fx-on');assert.equal(state.voiceFxV968,'auto');
});
test('visual projection only changes palette and virtual effect mesh selection',()=>{
 const settings=v968.applyAlexaConcertCommandV968(base,'effect-fog');
 const withMood=v968.applyAlexaConcertCommandV968(settings,'mood-warm');
 const projected=v968.applyAlexaVirtualSceneV968(scene,withMood,{authoredStage:false,reducedMotion:false,lowPerformance:false});
 assert.deepEqual(Array.from(projected.effects),['fog']);
 assert.notDeepEqual(Array.from(projected.palette),Array.from(scene.palette));
 for(const key of ['camera','formation','wall','phase','transition','intensity','timelineOverride','verified','finale'])
  assert.equal(projected[key],scene[key],key);
 assert.deepEqual(Array.from(scene.effects),['beams','lasers','bass-impact']);
});
test('manual stage, timeline, unverified state and eco-device always win',()=>{
 const override=v968.applyAlexaConcertCommandV968(base,'effect-confetti');
 const opts={authoredStage:false,reducedMotion:false,lowPerformance:false};
 for(const [s,o] of [[scene,{...opts,authoredStage:true}],
   [{...scene,timelineOverride:true},opts],[{...scene,verified:false},opts],
   [scene,{...opts,lowPerformance:true}]])
  assert.equal(v968.applyAlexaVirtualSceneV968(s,override,o),s);
 assert.equal(v968.applyAlexaVirtualSceneV968(null,override,opts),null);
});
test('paper effect limited to verified hook/drop/outro and reduced-motion setting',()=>{
 const s=v968.applyAlexaConcertCommandV968(base,'effect-confetti');
 const opts={authoredStage:false,reducedMotion:false,lowPerformance:false};
 assert.equal(v968.applyAlexaVirtualSceneV968(scene,s,opts).effects[0],'confetti');
 for(const phase of ['verse','break','build'])
  assert.equal(v968.applyAlexaVirtualSceneV968({...scene,phase},s,opts).effects.length,0);
 assert.equal(v968.applyAlexaVirtualSceneV968(scene,s,{...opts,reducedMotion:true}).effects.length,0);
 assert.equal(v968.applyAlexaVirtualSceneV968(scene,{...s,voiceFxV968:'off'},opts).effects.length,0);
});
test('zone masks are independent, do not mutate incoming cue and conserve bounded opacities',()=>{
 for(const zone of ['all','stage','backdrop','audience']){
  const out=v968.maskAlexaImmersiveCueV968(maskInput,{...base,voiceZoneV968:zone});
  if(zone==='all')assert.equal(out,maskInput);
  if(zone==='stage')assert.equal(out.audienceEdgeOpacity,0);
  if(zone==='backdrop')assert.equal(out.floorGlowOpacity,0);
  if(zone==='audience')assert.equal(out.backHazeOpacity,0);
  assert.equal(out.active,true);
 }
 assert.equal(maskInput.floorGlowOpacity,.05);
});
test('stale/forged commands rejected, old V967 command still supported',()=>{
 const now=Date.now();const good={id:'12345678-1234-1234-1234-123456789abc',createdAt:now,command:'zone-stage'};
 assert(v968.canApplyAlexaCommandV968(good,now-200,now));
 assert(v968.canApplyAlexaCommandV968({...good,command:'festival'},now-200,now));
 for(const invalid of [{...good,id:'oops'},{...good,command:'play'},
  {...good,createdAt:now-76000},{...good,createdAt:now+10000},{...good,createdAt:now-4000}])
  assert(!v968.canApplyAlexaCommandV968(invalid,now,now));
});
test('V966 immersive engine still controls confirmed music phases',()=>{
 const raw=read('lib/immersiveConcertEngineV966.ts');
 assert(raw.includes('scene?.verified')&&raw.includes('sectionConfidence<.75'));
 assert(raw.includes('i.authoredStage||scene.timelineOverride'));
 const src=read('components/visualizer/ConcertFestivalFxV958.tsx');
 assert(src.includes('applyAlexaVirtualSceneV968('));
 assert(src.includes('maskAlexaImmersiveCueV968('));
 assert(src.includes('showBackdropV968&&<group ref={wallMotion}'));
 assert(src.includes('showStageV968&&beams&&'));
 assert(src.includes('const voiceZonesEnabledV968=!authoredStage&&!scene.timelineOverride')); 
 assert(src.includes('showStageV968&&(confetti||streamers)&&'));
});
test('security: no networking, dynamic lights or browser audio in V968 policy',()=>{
 const src=read('lib/alexaConcertV968.ts').toLowerCase();
 for(const forbidden of ['fetch(', 'setinterval(', 'localstorage', 'goveebridgerequest', '/api/spotify',
  'navigator.', 'websocket', 'document.', 'settimeout(', 'volume'])assert(!src.includes(forbidden),forbidden);
 const route=read('app/api/alexa/command/route.ts');assert(route.includes('isAlexaConcertCommandV968'));
 assert(route.includes('createHmac')&&route.includes('claimAlexaNonceV967'));
});
test('V968 model and Lambda action names stay in sync',()=>{
 const model=JSON.parse(read('integrations/alexa/interaction-model.de-DE.json'));
 const names=model.interactionModel.languageModel.intents.map(i=>i.name);
 const {ACTIONS}=require('../integrations/alexa/handler.cjs')._internals;
 for(const [name,command] of Object.entries(ACTIONS)){
  assert(names.includes(name),name);
  // V969 adds new intents; this legacy suite verifies the original V968 subset.
  if(!command.startsWith('preset-')&&!command.startsWith('govee-'))assert(v968.isAlexaConcertCommandV968(command),command);
 }
 assert.equal(new Set(names).size,names.length);
 for(const i of model.interactionModel.languageModel.intents.filter(i=>!i.name.startsWith('AMAZON.')))
  assert(i.samples.length>0,i.name);
});
test('client displays safe local controls and workflow runs V968 and full typecheck',()=>{
 const ui=read('components/AlexaConcertControlV967.tsx');
 for(const needle of ['canApplyAlexaCommandV968','applyAlexaConcertCommandV969','Alexa Bühnenbereich','Alexa Lichtstimmung','Alexa Bühneneffekte'])
  assert(ui.includes(needle),needle);
 assert(read('scripts/vercel-production-build.cjs').includes('v968-alexa-concert-regression.cjs'));
 assert(read('scripts/v931-production-gate.cjs').includes('v968-alexa-concert-regression.cjs'));
 assert(read('scripts/vercel-production-build.cjs').includes('Full TypeScript'));
});
console.log(`V968 ${n} regression groups executed`);
