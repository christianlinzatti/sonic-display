#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs'),root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
function load(file,dependencies={}){
 const r=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(r.diagnostics?.length||0,0,`TypeScript transpile error: ${file}`);
 const module={exports:{}};
 vm.runInNewContext(r.outputText,{module,exports:module.exports,require:name=>{
  if(!Object.hasOwn(dependencies,name))throw Error('Unexpected dependency: '+name);
  return dependencies[name];
 }},{filename:file,timeout:12000});
 return module.exports;
}
const settings=load('lib/ultimateConcertRoadmapV958.ts');
const v967=load('lib/alexaConcertV967.ts');
const v968=load('lib/alexaConcertV968.ts',{'./alexaConcertV967':v967});
const preset=load('lib/smartConcertPresetsV969.ts');
const v969=load('lib/alexaConcertV969.ts',{'./alexaConcertV968':v968,'./smartConcertPresetsV969':preset});
const scene={id:'track|4|drop',phase:'drop',verified:true,genre:'hardtekk',camera:'wide',formation:'sync',
 wall:'pulse',palette:['#123456','#654321'],effects:['beams','lasers','bass-impact'],intensity:.84,
 transition:.9,spotlight:.6,lightGain:.7,finale:false,reason:'verified',timelineOverride:false};
const base={...settings.DEFAULT_CONCERT_V958,hardwareSync:true,enabled:true,virtualFx:true,
 timeline:{TRACK:[{atMs:1000,phase:'drop',camera:'wide'}]},presets:[{id:'my-room'}]};
const options={authoredStage:false,reducedMotion:false,lowPerformance:false};
let passed=0;function test(name,fn){try{fn();passed++;console.log('PASS V969 '+name);}catch(e){console.error('FAIL V969 '+name,e);process.exitCode=1;}}
function select(id){return preset.selectSmartConcertPresetV969(base,id);}
function project(id,phase='drop',other={}){return preset.applySmartConcertPresetV969({...scene,phase,...other},select(id),options);}
test('8 fixed complete-show presets and strict compatible defaults',()=>{
 assert.equal(preset.SMART_CONCERT_PRESETS_V969.length,8);
 assert.equal(new Set(preset.SMART_CONCERT_PRESETS_V969.map(p=>p.id)).size,8);
 assert.equal(settings.DEFAULT_CONCERT_V958.concertPresetV969,'off');
 assert.equal(settings.normalizeConcertRoadmapV958({concertPresetV969:'bad'}).concertPresetV969,'off');
 for(const p of preset.SMART_CONCERT_PRESETS_V969)
  assert.equal(settings.normalizeConcertRoadmapV958({concertPresetV969:p.id}).concertPresetV969,p.id);
});
test('automatic selection maps each major genre without claiming Spotify playback control',()=>{
 for(const [g,id] of [['hardtekk','hardtekk'],['hardstyle','hardtekk'],['deutschrap','cinematic'],['deutschrock','rock'],['other','arena']])
  assert.equal(preset.resolveSmartConcertPresetV969('auto',g),id);
 assert.equal(preset.resolveSmartConcertPresetV969('off','hardtekk'),null);
});
test('every preset is visual-only and preserves authoring and room configuration',()=>{
 for(const p of preset.SMART_CONCERT_PRESETS_V969){
  const out=select(p.id);
  assert.equal(out.hardwareSync,false,p.id);
  assert.equal(out.timeline,base.timeline,p.id);
  assert.equal(out.presets,base.presets,p.id);
  if(p.id!=='off')assert(out.enabled&&out.virtualFx&&out.immersiveV966,p.id);
 }
});
test('opt-out leaves the V968 virtual stage exactly unchanged',()=>{
 const out=preset.applySmartConcertPresetV969(scene,select('off'),options);assert.strictEqual(out,scene);
 assert.equal(preset.applySmartConcertPresetV969(null,select('festival'),options),null);
});
test('all active worlds visibly change actual scene palette or LED patterns',()=>{
 for(const id of ['arena','festival','club','cinematic','hardtekk','rock','auto']){
  const out=project(id);
  assert.notStrictEqual(out,scene);
  assert.notDeepEqual(Array.from(out.palette),scene.palette,id);
  assert.equal(typeof out.wall,'string');
  assert(out.reason.includes('V969'),id);
 }
});
test('song phases have an actual dynamic concert arc with safe intensity limits',()=>{
 for(const id of ['arena','festival','club','cinematic','hardtekk','rock']){
  const verse=project(id,'verse'),drop=project(id,'drop'),breakCue=project(id,'break');
  assert(drop.intensity>verse.intensity,`${id} drop vs verse`);
  assert(drop.intensity>breakCue.intensity,`${id} drop vs break`);
  assert(drop.intensity<=.96&&drop.intensity>=.10,id);
 }
});
test('manual timeline, authored stage, unverified and economy performance have absolute priority',()=>{
 const selected=select('festival');
 for(const [s,o] of [[{...scene,timelineOverride:true},options],
  [{...scene,verified:false},options],[scene,{...options,authoredStage:true}],
  [scene,{...options,lowPerformance:true}]])
  assert.strictEqual(preset.applySmartConcertPresetV969(s,selected,o),s);
});
test('reduced motion generates no additional moving effects',()=>{
 for(const p of preset.SMART_CONCERT_PRESETS_V969.filter(p=>p.id!=='off')){
  const out=preset.applySmartConcertPresetV969(scene,select(p.id),{...options,reducedMotion:true});
  assert.equal(out.effects.length,0,p.id);
  assert(out.intensity<=.62,p.id);
 }
});
test('virtual confetti only appears in permitted verified finale phases',()=>{
 for(const phase of ['verse','hook','build','drop','break','outro']){
  const out=project('festival',phase,{finale:true});
  if(['hook','drop','outro'].includes(phase))assert(out.effects.includes('confetti'),phase);
  else assert(!out.effects.includes('confetti'),phase);
 }
});
test('no extra effects over three or flashing/strobe commands',()=>{
 for(const id of ['arena','festival','club','cinematic','hardtekk','rock']){
  const out=project(id,'drop',{finale:true});
  assert(out.effects.length<=3,id);
  assert(!out.effects.some(e=>['strobe','flash','pyro'].includes(e)),id);
 }
});
test('scene camera, dance, manual state, timeline and V968 overrides remain intact',()=>{
 const selected=select('hardtekk');
 const out=preset.applySmartConcertPresetV969(scene,selected,options);
 for(const field of ['camera','formation','spotlight','lightGain','timelineOverride','phase','verified','transition','finale'])
  assert.equal(out[field],scene[field],field);
 const newer=v968.applyAlexaVirtualSceneV968(out,{...selected,voiceMoodV968:'warm',voiceFxV968:'fog'},options);
 assert.equal(newer.effects[0],'fog');assert.equal(newer.palette[0],'#ffad62');
});
test('voice commands preserve existing explicit overrides and do not contact hardware',()=>{
 const newCommands=['preset-rap','preset-hardtekk','preset-rock','preset-cinema','preset-auto'];
 assert.equal(v969.ALEXA_CONCERT_COMMANDS_V969.length,v968.ALEXA_CONCERT_COMMANDS_V968.length+5);
 for(const cmd of [...v969.ALEXA_CONCERT_COMMANDS_V969]){
  const out=v969.applyAlexaConcertCommandV969(base,cmd);
  assert.equal(out.hardwareSync,false,cmd);
  assert.strictEqual(out.timeline,base.timeline,cmd);
  assert.strictEqual(out.presets,base.presets,cmd);
 }
 for(const cmd of newCommands)assert(v969.isAlexaConcertCommandV969(cmd));
 for(const invalid of ['play-spotify','govee-on','flash','volume','preset-discard',{}])
  assert(!v969.isAlexaConcertCommandV969(invalid));
 assert.equal(v969.applyAlexaConcertCommandV969(base,'arena').concertPresetV969,'arena');
 assert.equal(v969.applyAlexaConcertCommandV969(base,'calm').concertPresetV969,'cinematic');
 assert.equal(v969.applyAlexaConcertCommandV969(base,'stop').concertPresetV969,'off');
});
test('stale or forged Alexa preset commands cannot be applied',()=>{
 const now=Date.now(),valid={id:'12345678-1234-1234-1234-123456789abc',command:'preset-rock',createdAt:now};
 assert(v969.canApplyAlexaCommandV969(valid,now-500,now));
 assert(v969.canApplyAlexaCommandV969({...valid,command:'festival'},now-500,now));
 for(const invalid of [{...valid,id:'bad'},{...valid,command:'play'},{...valid,createdAt:now-80000},{...valid,createdAt:now+9000}])
  assert(!v969.canApplyAlexaCommandV969(invalid,now,now));
});
test('UI, renderer, signed bridge and CI gates wire V969 end to end',()=>{
 const ui=read('components/AlexaConcertControlV967.tsx');
 const stage=read('components/visualizer/ConcertFestivalFxV958.tsx');
 for(const s of ['Smart Konzert-Preset V969','selectSmartConcertPresetV969','applyAlexaConcertCommandV969'])
  assert(ui.includes(s),s);
 assert(stage.includes('applySmartConcertPresetV969(continuity,settings,')||
  stage.includes('applySmartConcertPresetV969(energyArcV975.scene??continuity,settings,'));
 assert(stage.indexOf('applySmartConcertPresetV969(')<stage.indexOf('applyAlexaVirtualSceneV968('));
 const route=read('app/api/alexa/command/route.ts');assert(route.includes('isAlexaConcertCommandV969')||route.includes('isAlexaCommandV970')); 
 assert(read('scripts/vercel-production-build.cjs').includes('v969-smart-concert-presets-regression.cjs'));
 assert(read('scripts/v931-production-gate.cjs').includes('v969-smart-concert-presets-regression.cjs'));
 const p=JSON.parse(read('package.json'));assert(/^v\d+$/.test(p.sonicRoadmapRelease)&&Number(p.sonicRoadmapRelease.slice(1))>=969);
});
test('pure policy has no networking, browser, microphone or physical lights',()=>{
 const src=read('lib/smartConcertPresetsV969.ts').toLowerCase();
 for(const s of ['fetch(', 'localstorage', 'setinterval(', 'navigator.', 'document.', 'goveebridgerequest', '/api/spotify','websocket', 'requestanimationframe(', 'speechrecognition'])
  assert(!src.includes(s),s);
});
let frames=0;
for(let i=0;i<5000;i++){
 const p=preset.SMART_CONCERT_PRESETS_V969[1+i%7];
 const phase=['verse','hook','build','drop','break','outro'][i%6];
 const genre=['hardtekk','hardstyle','deutschrap','deutschrock','other'][i%5];
 const out=preset.applySmartConcertPresetV969({...scene,id:`track|${i}|${phase}`,phase,genre,finale:i%11===0,
  intensity:.3+(i%40)*.015},select(p.id),{...options,reducedMotion:i%8===0});
 assert(out.intensity>=.1&&out.intensity<=.96);
 assert(out.effects.length<=3);frames++;
}
console.log(`V969 PASS ${passed} regression groups + ${frames} deterministic concert states`);
