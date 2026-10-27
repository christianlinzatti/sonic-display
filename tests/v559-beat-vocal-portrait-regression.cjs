'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
function load(file){
  const transpiled=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
  assert.equal(transpiled.diagnostics?.length??0,0);
  const module={exports:{}};new Function('module','exports','require',transpiled.outputText)(module,module.exports,require);
  return module.exports;
}
const {planBeatVocalPortraitLightingV559:plan}=load('components/visualizer/beatVocalPortraitLightingV559.ts');
const {planPerformerLightingV557}=load('components/visualizer/performerLightingV557.ts');
const {planAvatarPortraitLightingV558}=load('components/visualizer/avatarPortraitLightingV558.ts');
const settings={enabled:true,avatarLight:true,avatarLightStrength:80,portraitLight:true,portraitWarmth:60,beatPortraitLight:true,beatPortraitStrength:70,strength:80};
const scene={active:true,trackId:'real-song',cueStartMs:0,cueEndMs:4800,count:2,focus:'handoff',leadSlot:1,singingSlots:[0,1],handoffFrom:0};
const cue={hook:true,density:.2};
const audio={beat:true,beatStrength:.95,kickAccentIntensity:.75,mids:.8,volume:.7,bass:.8,highs:.3,bpm:120,kick:.9,snare:.2,hiHat:.2,energyEnvelope:.8,attack:.6,decay:0};
const base={settings,cue,audio,scene,count:2,progressMs:400,playing:true,reactive:true,reducedMotion:false,tier:'high',authored:false,blackout:false,lyricsProtected:false};
const pipeline=patch=>{
  const input={...base,...patch};
  const performer=planPerformerLightingV557(input);
  const portrait=planAvatarPortraitLightingV558({performer,cue:input.cue,settings:input.settings,tier:input.tier});
  return plan({...input,performer,portrait});
};
let total=0;function test(name,fn){fn();++total;console.log('PASS V559',name);}
const disabled=r=>assert.deepEqual(r,{enabled:false,keyLift:0,fillLift:0,keyColorMix:0,fillColorMix:0,mode:'off'});
test('verified duo: subtle key and cool fill, within safety budget',()=>{
  const p=pipeline();assert.equal(p.enabled,true);assert.equal(p.mode,'duet');
  for(const [key,max] of [['keyLift',.12],['fillLift',.075],['keyColorMix',.11],['fillColorMix',.08]]) assert.ok(p[key]>0&&p[key]<=max,[key,p[key]]);
});
test('solo hook uses same validated performer and warmer key',()=>{
  const p=pipeline({scene:null,count:1});assert.equal(p.mode,'hook');assert.ok(p.keyLift>0);
});
test('quiet audio does not invent beat or vocals',()=>disabled(pipeline({audio:{...audio,beat:false,beatStrength:0,kickAccentIntensity:0,mids:0,volume:0}})));
test('low beat with middle frequency produces subdued musical activity',()=>{
  const r=pipeline({audio:{...audio,beat:false,beatStrength:0,kickAccentIntensity:0,mids:.65,volume:.35}});
  assert.equal(r.enabled,true);assert.ok(r.keyLift<pipeline().keyLift);
});
test('dimmer during dense fast rap',()=>{
  const d=pipeline({scene:null,count:1,cue:{hook:true,density:.99}});const h=pipeline({scene:null,count:1,cue:{hook:true,density:.2}});
  assert.equal(d.mode,'dense');assert.ok(d.keyLift<h.keyLift);assert.ok(d.keyColorMix<h.keyColorMix);
});
test('hook brighter than normal verse',()=>{
  assert.ok(pipeline({scene:null,count:1,cue:{hook:true,density:.2}}).keyLift>
    pipeline({scene:null,count:1,cue:{hook:false,density:.2}}).keyLift);
});
test('lyrics protected reduces accents, never suppresses main lyrics',()=>{
  const p=pipeline({lyricsProtected:true});assert.ok(p.keyLift>0&&p.keyLift<pipeline().keyLift);
});
test('user strength slider changes output and zero disables',()=>{
  const low=pipeline({settings:{...settings,beatPortraitStrength:15}});
  const high=pipeline({settings:{...settings,beatPortraitStrength:100}});
  assert.ok(high.keyLift>low.keyLift);disabled(pipeline({settings:{...settings,beatPortraitStrength:0}}));
});
test('off switches disable immediately',()=>{
  for(const patch of [{beatPortraitLight:false},{portraitLight:false},{avatarLight:false},{enabled:false},{strength:0},{avatarLightStrength:0}]) disabled(pipeline({settings:{...settings,...patch}}));
});
test('respects pause, reduced motion, non-reactive lighting and low Pi tier',()=>{
  for(const p of [{playing:false},{reactive:false},{reducedMotion:true},{tier:'low'}])disabled(pipeline(p));
});
test('authored timelines and blackout are never overridden',()=>{
  for(const p of [{authored:true},{blackout:true}])disabled(pipeline(p));
});
test('unverified ensemble cannot light a guessed singer',()=>disabled(pipeline({scene:null,count:2})));
test('invalid role assignments cannot light a guessed singer',()=>disabled(pipeline({scene:{...scene,count:3}})));
test('handoff expires cleanly into selected singer',()=>{
  const r=pipeline({progressMs:1600});assert.equal(r.enabled,true);assert.equal(r.mode,'hook');
});
test('no cue or settings has safe neutral fallback',()=>{
  disabled(pipeline({cue:undefined}));disabled(pipeline({settings:undefined}));
});
test('NaN, infinite and out-of-range audio/settings always finite and bounded',()=>{
  for(const bad of [NaN,Infinity,-Infinity,-7,700]){
    const r=pipeline({audio:{...audio,beatStrength:bad,mids:bad,volume:bad,kickAccentIntensity:bad},settings:{...settings,beatPortraitStrength:bad}});
    for(const [k,m] of [['keyLift',.12],['fillLift',.075],['keyColorMix',.11],['fillColorMix',.08]])assert.ok(Number.isFinite(r[k])&&r[k]>=0&&r[k]<=m,[k,bad,r[k]]);
  }
});
test('only existing key and fill lights: no extra geometry, shadows or material mods',()=>{
  const stage=read('components/visualizer/DynamicStage.tsx');assert.match(stage,/planBeatVocalPortraitLightingV559/);assert.match(stage,/beatKeyTargetV559/);
  assert.match(stage,/beatPortraitPlanV559\.keyColorMix/);assert.match(stage,/beatPortraitPlanV559\.fillColorMix/);
  assert.equal((stage.match(/<pointLight\b/g)||[]).length,3);assert.equal((stage.match(/<spotLight\b/g)||[]).length,1);
  assert.doesNotMatch(read('components/visualizer/beatVocalPortraitLightingV559.ts'),/new (?:Color|PointLight|Mesh|ShaderMaterial|SpotLight)/);
});
test('live and synthetic preview both wire into one shared renderer',()=>{
  assert.match(read('components/visualizer/VisualizerStage.tsx'),/concertBeatPortraitStrengthV559/);
  const preview=read('components/visualizer/StagePreviewModal.tsx');assert.match(preview,/previewBeatV559/);assert.match(preview,/setPreviewBeatV559/);
  assert.match(preview,/Beat-Licht/);assert.match(preview,/Deutschrap-Hook/);assert.match(preview,/Duett \(Demo\)/);
  assert.match(preview,/const previewGroupCountV542=concertMode==='duet'\?2:1/);
  assert.match(preview,/groupCountV542=\{previewGroupCountV542\}/);
  // V563 may replace the two preview mannequins with real GLBs; they must not overlap.
  assert.ok(/visible=\{concertMode==='duet'\|\|\(i===0&&\!showGlbV560\)\}/.test(preview)||
    /visible=\{concertMode==='duet'\?!duetAssetsV563\.useReal:/.test(preview));
});
test('settings persistent with safe defaults',()=>{
  assert.match(read('types/music.ts'),/concertBeatPortraitLightV559\?: boolean/);
  assert.match(read('context/UiPreferencesContext.tsx'),/concertBeatPortraitLightV559:true,concertBeatPortraitStrengthV559:45/);
  assert.match(read('components/SettingsPanel.tsx'),/Beat- &amp; Musikenergie-Porträtlicht V559/);
  assert.match(read('components/visualizer/concertDetailEffectsV555.ts'),/beatPortraitLight:true,beatPortraitStrength:45/);
});
test('version, preflight and cumulative verification connected',()=>{
  const p=JSON.parse(read('package.json'));assert.ok(Number(p.version.match(/^0\.1\.0-v(\d+)$/)?.[1])>=559);
  assert.match(p.scripts['build:preflight'],/npm run test:v559 && npm run test:v559:types/);
  assert.match(p.scripts['verify:v559'],/verify:v558/);
});
console.log(`V559: ${total} checks passed`);
