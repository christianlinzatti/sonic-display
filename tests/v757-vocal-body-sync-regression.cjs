'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'components/visualizer/vocalBodySyncV757.ts'),'utf8');
const compiled=ts.transpileModule(source,{fileName:'vocalBodySyncV757.ts',compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
assert.equal(compiled.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
const mod={exports:{}};
new Function('module','exports','require',compiled.outputText)(mod,mod.exports,()=>{throw Error('Unexpected runtime dependency')});
const v=mod.exports;
let checks=0;
function ok(x,msg){assert.ok(x,msg);checks++}
function eq(a,b,msg){assert.deepEqual(a,b,msg);checks++}
const cue={headPitch:-.012,headYaw:.009,headTilt:.004,eyeYaw:.023,chestLean:-.015,leftArm:-.02,rightArm:.04,confidence:'word',mode:'rap',emphasis:.32};
const lines=[{startMs:1000,endMs:2000,words:[
 {text:'Ich',startMs:1000,endMs:1260},
 {text:'rappe',startMs:1300,endMs:1540},
 {text:'hier!',startMs:1570,endMs:1950}
]}];
const base={settings:v.DEFAULT_VOCAL_BODY_SYNC_V757,body:cue,role:'singer',playing:true,reducedMotion:false,manualBodyPriority:false,
 bodyEnabled:true,gesturesEnabled:true,lyricSynced:true,lines,effectiveTimeMs:1030,activeWord:'Ich',
 vocalConfidence:'word',vocalStyle:'rap',mouthActivity:.8,focus:.4,genre:'deutschrap'};
const call=(patch={})=>v.directVocalBodySyncV757({...base,...patch});
eq(v.normalizeVocalBodySyncV757(),v.DEFAULT_VOCAL_BODY_SYNC_V757);
eq(v.normalizeVocalBodySyncV757({enabled:'bad',strength:-30,head:130,gestures:Infinity,rapidControl:NaN}),
 {enabled:false,strength:0,head:100,gestures:60,rapidControl:75});
ok(call().active,'singer with word timing produces cue');
ok(call().body!==cue,'active cue is new immutable body');
eq(call().body.eyeYaw,cue.eyeYaw,'eye control remains unchanged');
eq(call().body.confidence,cue.confidence,'lyric confidence remains unchanged');
ok(call({effectiveTimeMs:1007}).amount>call({effectiveTimeMs:1200}).amount,'word-onset accent strongest near entrance');
ok(call({effectiveTimeMs:1700,activeWord:'hier!'}).active,'phrase end active');
ok(call({effectiveTimeMs:1261}).active===false,'silence gap is not filled');
ok(call({effectiveTimeMs:2000}).active===false,'no cue after line');
ok(call({effectiveTimeMs:1570,activeWord:'hier!'}).phase==='onset','word start triggers onset');
for(const patch of [
 {role:'backing'},{role:'unassigned'},{playing:false},{reducedMotion:true},{manualBodyPriority:true},
 {bodyEnabled:false},{settings:{enabled:false}},{settings:{strength:0}},
 {lyricSynced:false},{vocalConfidence:'none'},{vocalConfidence:'line'},{vocalStyle:'line'},
 {vocalStyle:'silent'},{effectiveTimeMs:NaN},{effectiveTimeMs:Infinity},{mouthActivity:NaN},
 {focus:Infinity},{activeWord:'wrong'},{activeWord:null},{lines:null},
 {effectiveTimeMs:3000},{effectiveTimeMs:700},{mouthActivity:0,focus:0}
]){
 const r=call(patch);ok(!r.active,`neutral for ${JSON.stringify(patch)}`);eq(r.body,cue,'neutral must preserve exact cue');
}
const lineOnly=call({lines:[{startMs:1000,endMs:2000,words:[]}]});ok(!lineOnly.active,'line timing not a word');
for(const malformed of [
 [{startMs:1000,words:[{text:'Ich',startMs:1000}]}],
 [{startMs:1000,endMs:1500,words:[{text:'Ich',startMs:1000,endMs:2100}]}],
 [{startMs:1000,endMs:2000,words:[{text:'Ich',startMs:NaN,endMs:1200}]}],
 [{startMs:1000,endMs:2000,words:[{text:'Ich',startMs:1000,endMs:1000}]}],
 [{startMs:1000,endMs:2000,words:[{text:'Ich',startMs:1000,endMs:Infinity}]}],
 [{startMs:1000,endMs:2000,words:[{text:'Ich',startMs:1000,endMs:1500},{text:'there',startMs:1300,endMs:1400}]}],
 ])ok(!call({lines:malformed}).active,'bad boundaries rejected');
const derived=[{startMs:1000,endMs:2000,words:[{text:'Ich',startMs:1000}, {text:'rappe',startMs:1300,endMs:1600}]}];
ok(call({lines:derived}).active,'next verified start may bound previous word');
ok(!call({lines:derived,effectiveTimeMs:1350,activeWord:'Ich'}).active,'no bleed across next start');
const skip=call({settings:{head:0,gestures:0}});
ok(skip.active,'head/gesture setting does not control vocals');eq(skip.body,cue,'no movement when channel gains zero');
const noGestures=call({gesturesEnabled:false});
eq(noGestures.body.chestLean,cue.chestLean,'gestures off leaves chest');
eq(noGestures.body.leftArm,cue.leftArm,'gestures off leaves arms');
ok(noGestures.body.headPitch<cue.headPitch,'head motion independent');
const rapid=call({effectiveTimeMs:1320,activeWord:'rappe',settings:{rapidControl:100}});
const natural=call({effectiveTimeMs:1320,activeWord:'rappe',settings:{rapidControl:0}});
ok(rapid.amount<natural.amount,'rapid words are calmer when requested');
for(const singer of [0,1,2,3])for(let slot=0;slot<4;slot++){
 const role=slot===singer?'singer':'backing';
 const r=call({role});ok(r.active===(role==='singer'),'only confirmed singer is accented');
}
// Large deterministic variety against NaN / transforms and source mutations.
let rng=1337;
const random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296};
for(let i=0;i<28000;i++){
 const ms=900+Math.round(random()*1250),slot=Math.floor(random()*4),singer=Math.floor(random()*4),
  mode=random()>.5?'rap':'singing',strength=Math.floor(random()*101);
 const active=ms<1260?'Ich':ms>=1300&&ms<1540?'rappe':ms>=1570&&ms<1950?'hier!':'(gap)';
 const bodyBefore=JSON.stringify(cue),linesBefore=JSON.stringify(lines);
 const r=call({effectiveTimeMs:ms,activeWord:active,role:slot===singer?'singer':'backing',vocalStyle:mode,
   settings:{enabled:true,strength,head:Math.floor(random()*101),gestures:Math.floor(random()*101),rapidControl:Math.floor(random()*101)},
   mouthActivity:random(),focus:random()});
 ok(Number.isFinite(r.amount)&&r.amount>=0&&r.amount<=1,'bounded strength');
 for(const key of ['headPitch','headYaw','headTilt','chestLean','leftArm','rightArm'])
   ok(Number.isFinite(r.body[key])&&Math.abs(r.body[key])<=.201,'safe additive rotations');
 eq(r.body.eyeYaw,cue.eyeYaw,'eyes untouched');
 if(slot!==singer)ok(!r.active&&r.body===cue,'background performer untouched');
 eq(JSON.stringify(cue),bodyBefore,'no mutation of pre-existing rig target');
 eq(JSON.stringify(lines),linesBefore,'no mutation of lyrics');
}
const gltf=fs.readFileSync(path.join(root,'components/visualizer/gltfVocalPerformanceV492.ts'),'utf8');
ok(gltf.includes('directVocalBodySyncV757')&&gltf.includes('body:vocalPerformanceV746.body'),'downstream of V746');
ok(gltf.includes('(propsLipSyncV367?.qualityVocalGainV750??1)'),'V750 quality gate is preserved for added accents');
ok(gltf.includes('applyVocalStageOverlayV371(rigTargets.current,syncedBodyV757.body'),'only V371 writes rig');
ok(!gltf.includes('applyVocalStageOverlayV371(rigTargets.current,vocalPerformanceV746.body'),'no double apply');
for(const name of ['types/music.ts','context/UiPreferencesContext.tsx','components/SettingsPanel.tsx'])
 ok(fs.readFileSync(path.join(root,name),'utf8').includes('avatarVocalBodySyncV757'),`settings wire ${name}`);
ok(!source.includes('Math.random')&&!source.includes('Date.now')&&!source.includes('useFrame'),'seek-safe deterministic');
console.log(`PASS V757 Vocal & Body Sync: ${checks} checks`);
