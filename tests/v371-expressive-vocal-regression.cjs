require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const cache=new Map();
function load(file){
 const full=path.resolve(root,file);
 if(cache.has(full))return cache.get(full).exports;
 const source=fs.readFileSync(full,'utf8');
 const js=ts.transpileModule(source,{fileName:full,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const m=new Module(full,module);m.filename=full;m.paths=Module._nodeModulePaths(path.dirname(full));cache.set(full,m);
 const normal=m.require.bind(m);
 m.require=(name)=>name.startsWith('./')?load(path.join(path.relative(root,path.dirname(full)),`${name}.ts`)):normal(name);
 m._compile(js,full);return m.exports;
}
const {resolveVocalStageCueV371,applyVocalStageOverlayV371,createVocalStageOverlayV371,NEUTRAL_VOCAL_STAGE_V371}=load('components/visualizer/vocalStageExpressionV371.ts');
const lyrics={provider:'spotify',synced:true,plainText:null,lines:[
 {startMs:1000,endMs:3400,text:'Bam superklasse Wunderbar!',words:[
  {text:'Bam',startMs:1000,endMs:1400},{text:'superklasse',startMs:1450,endMs:1950},{text:'Wunderbar!',startMs:2050,endMs:3370}]},
 {startMs:3500,endMs:4300,text:'♪'},
 {startMs:4500,endMs:5700,text:'Lange Zeile ohne Wörter'},
 {startMs:6000,endMs:7500,text:'[instrumental]'},
]};
const cue=(ms,opts={})=>resolveVocalStageCueV371(lyrics,ms,true,{genre:'Deutschrap',...opts});
assert.deepEqual(cue(900),NEUTRAL_VOCAL_STAGE_V371);
assert.deepEqual(resolveVocalStageCueV371(lyrics,1670,false),NEUTRAL_VOCAL_STAGE_V371);
assert.deepEqual(cue(1670,{reducedMotion:true}),NEUTRAL_VOCAL_STAGE_V371);
assert.deepEqual(cue(1670,{enabled:false}),NEUTRAL_VOCAL_STAGE_V371);
assert.deepEqual(resolveVocalStageCueV371({...lyrics,synced:false},1670,true),NEUTRAL_VOCAL_STAGE_V371);
assert.deepEqual(cue(3800),NEUTRAL_VOCAL_STAGE_V371);
assert.deepEqual(cue(6900),NEUTRAL_VOCAL_STAGE_V371);
assert.deepEqual(cue(1405),NEUTRAL_VOCAL_STAGE_V371,'gap between words is idle');
const a=cue(1590),b=cue(2280);
assert.equal(a.mode,'rap');assert.equal(a.confidence,'word');assert.ok(Math.abs(a.headPitch)>0);
assert.ok(Math.abs(b.chestLean)>0,'phrase ending receives a bounded expressive gesture');
assert.ok(Math.abs(a.headPitch)<=.16&&Math.abs(a.leftArm)<=.24&&Math.abs(a.headYaw)<=.1);
assert.deepEqual(cue(1590),a,'same Spotify clock yields same cue');
assert.notEqual(cue(1590,{avatarSlot:1}).headYaw,a.headYaw,'duo slots alternate gaze side');
assert.ok(Math.abs(cue(1590,{partnerAttention:1}).headPitch)<Math.abs(a.headPitch),'partner has priority');
assert.ok(Math.abs(cue(1590,{authoredPriority:true}).headPitch)<Math.abs(a.headPitch),'clip has priority');
assert.equal(cue(1590,{eyeContact:false}).headYaw,0);
assert.equal(cue(1590,{eyeContact:false}).eyeYaw,0);
assert.equal(cue(1590,{gestures:false}).leftArm,0);
assert.equal(cue(1590,{gestures:false}).chestLean,0);
assert.equal(cue(1590,{strength:0}).confidence,'none');
assert.equal(cue(4900).confidence,'line');
assert.equal(cue(4900).leftArm,0,'line timestamps must not invent gestures');
assert.equal(cue(4900).eyeYaw,0,'line timestamps must not invent deliberate gaze');
const singing=cue(1590,{style:'singing'});assert.equal(singing.mode,'singing');assert.ok(Math.abs(singing.leftArm)<Math.abs(a.leftArm));
const joint=()=>({rotation:{x:0,y:0,z:0}});
const targets={head:joint(),neck:joint(),chest:joint(),leftArm:joint(),rightArm:joint(),leftEye:joint(),rightEye:joint()};
const overlay=createVocalStageOverlayV371();
for(let i=0;i<30;i++)applyVocalStageOverlayV371(targets,a,1/60,overlay);
assert.ok(targets.head.rotation.x<0);
const before=targets.head.rotation.x;
for(let i=0;i<90;i++)applyVocalStageOverlayV371(targets,NEUTRAL_VOCAL_STAGE_V371,1/60,overlay);
assert.ok(Math.abs(targets.head.rotation.x)<Math.abs(before)*.001,'pause/seek releases additive bones');
const noBones={};applyVocalStageOverlayV371(noBones,a,1/60,createVocalStageOverlayV371());
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
assert.match(read('components/visualizer/gltfVocalPerformanceV492.ts'),/applyVocalStageOverlayV371\(/);
assert.match(read('components/visualizer/ThreeAvatar.tsx'),/rapBodyV453\.headPitch/);
assert.match(read('components/visualizer/VisualizerStage.tsx'),/bodyStrengthV371:rapPerformanceValuesV437\.gesture/);
assert.match(read('components/SettingsPanel.tsx'),/V371 · Expressive Vocal Performance/);
assert.match(read('context/UiPreferencesContext.tsx'),/avatarVocalBodyEnabledV371: true/);
assert.ok(Number(String(JSON.parse(read('package.json')).version).match(/v(\d+)$/)?.[1])>=371);
console.log('PASS V371: timed phrases, seek/pause, rap/singing, partner/choreography priority, gaze, gestures, additive rig release and UI integration');
