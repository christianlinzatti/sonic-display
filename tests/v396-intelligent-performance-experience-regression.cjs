require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const code=ts.transpileModule(read('components/visualizer/performanceExperienceV396.ts'),{fileName:'performanceExperienceV396.ts',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod={exports:{}};new Function('module','exports','require',code)(mod,mod.exports,require);
const {initialExperienceV396:init,advanceExperienceV396:advance,resolveEnsembleSettingsV396:roles,chooseExperienceModeV396:choose}=mod.exports;
const base={trackId:'track1',progressMs:0,playing:true,reducedMotion:false,mode:'expressive',strength:85,section:'verse',genre:'deutschrap',energy:.75,beat:.5,activeLyrics:true,hasVocalTiming:true,performers:2,performanceTier:'high'};
const step=(state,updates={})=>advance(state,{...base,...updates});
const st=init();let verse=step(st);assert.equal(verse.active,true);assert.equal(verse.section,'verse');assert.equal(verse.vocalMode,'expressive');
assert.equal(verse.ensembleMode,'expressive');assert.equal(verse.festivalMode,'cinematic');
verse=step(st,{progressMs:800});assert.ok(verse.vocalGain>1);assert.ok(verse.groupGain<1,'verse should leave focus to vocalist');
assert.equal(verse.concertMode,'balanced');assert.equal(verse.performanceTier,'high');
let fleeting=step(st,{progressMs:1100,section:'drop',beat:1});assert.equal(fleeting.section,'verse');
fleeting=step(st,{progressMs:1230,section:'verse'});assert.equal(fleeting.section,'verse','brief classifier changes must not flip direction');
let hook=step(st,{progressMs:1450,section:'hook'});assert.equal(hook.section,'verse');
hook=step(st,{progressMs:1800,section:'hook'});assert.equal(hook.section,'hook');
hook=step(st,{progressMs:2500,section:'hook'});assert.ok(hook.groupGain>1);assert.ok(hook.visualGain>1);
const drop=step(st,{progressMs:3000,section:'drop',beat:.95});assert.equal(drop.section,'hook');
const stableDrop=step(st,{progressMs:3400,section:'drop',beat:.95});assert.equal(stableDrop.section,'drop');
const rapDrop=step(st,{progressMs:4000,section:'drop',beat:.95});assert.ok(rapDrop.visualGain<=1.13);
const electronic=step(init(),{genre:'hardtekk',section:'drop'});assert.equal(electronic.festivalMode,'festival');
const low=step(init(),{genre:'hardtekk',section:'drop',performanceTier:'low'});assert.equal(low.festivalMode,'cinematic');
const weak=step(init(),{genre:'hardtekk',section:'drop',performanceTier:'balanced'});assert.equal(weak.festivalMode,'cinematic');
const solo=step(init(),{performers:1});assert.equal(solo.ensembleMode,'off');assert.equal(solo.groupGain,1);
const muted=step(init(),{activeLyrics:false});assert.equal(muted.vocalMode,'off');assert.equal(muted.vocalGain,1);
const lineOnly=step(init(),{hasVocalTiming:false});assert.equal(lineOnly.vocalMode,'off');
const seek=step(st,{progressMs:200,section:'break'});assert.equal(seek.section,'break');assert.equal(seek.visualGain,1);
const trackSwap=step(st,{trackId:'track2',progressMs:2500,section:'verse'});assert.equal(trackSwap.section,'verse');assert.equal(trackSwap.visualGain,1);
for(const patch of [{mode:'off'},{playing:false},{reducedMotion:true},{strength:0},{trackId:''},{progressMs:NaN},{strength:NaN},{strength:Infinity}]){
 const val=step(init(),patch);assert.equal(val.active,false,JSON.stringify(patch));assert.equal(val.groupGain,1);assert.equal(val.vocalMode,'off');
}
for(const strength of [5,50,100,1000]){
 const state=init();step(state,{strength});const val=step(state,{progressMs:1000,strength});
 for(const k of ['vocalGain','groupGain','visualGain','strength'])assert.ok(Number.isFinite(val[k]),k);
 assert.ok(val.vocalGain<=1.16&&val.groupGain<=1.12&&val.visualGain<=1.13);
}
assert.deepEqual(roles({mode:'subtle',strength:95},verse),{mode:'subtle',strength:95},'user V392 settings take priority');
assert.deepEqual(roles({mode:'off',strength:50},undefined),{mode:'off',strength:50});
const fallback=roles({mode:'off',strength:50},verse);assert.equal(fallback.mode,'expressive');assert.ok(fallback.strength<=100);
assert.deepEqual(roles({mode:'off',strength:50},solo),{mode:'off',strength:50});
assert.equal(choose('expressive','subtle',verse),'expressive');
assert.equal(choose('off','subtle',verse),'subtle');
assert.equal(choose('off','subtle',step(init(),{mode:'off'})),'off');
for(const [f,strings] of Object.entries({
 'types/music.ts':['avatarExperienceModeV396','avatarExperienceStrengthV396'],
 'context/UiPreferencesContext.tsx':['avatarExperienceModeV396:"off"'],
 'components/visualizer/registry.tsx':['experienceCueV396'],
 'components/visualizer/VisualizerStage.tsx':['advanceExperienceV396','chooseExperienceModeV396','experienceCueV396={sharedExperienceCueV402}','hasActiveLyricsV350'],
 'components/visualizer/ThreeAvatar.tsx':['resolveEnsembleSettingsV396(readEnsembleV392(),props.experienceCueV396)'],
 'components/SettingsPanel.tsx':['V396 · Intelligent Performance Experience','avatarExperienceStrengthV396','v396-performance-experience-settings'],
 'V396-INTELLIGENT-PERFORMANCE-EXPERIENCE.md':['V396']
}))for(const needle of strings)assert.ok(read(f).includes(needle),f+': '+needle);
const pkg=JSON.parse(read('package.json'));assert.ok(['0.1.0-v398','0.1.0-v399','0.1.0-v400','0.1.0-v401', '0.1.0-v402','0.1.0-v403','0.1.0-v404','0.1.0-v405','0.1.0-v406','0.1.0-v407','0.1.0-v408','0.1.0-v409','0.1.0-v411','0.1.0-v412','0.1.0-v413','0.1.0-v414','0.1.0-v415','0.1.0-v416','0.1.0-v417','0.1.0-v418','0.1.0-v419','0.1.0-v420','0.1.0-v422','0.1.0-v424','0.1.0-v425','0.1.0-v426'].includes(pkg.version));assert.ok(pkg.scripts['verify:offline'].includes('test:v396'));
console.log('PASS V396 – synchronized show/ensemble/vocals, user priority, seek and pause safety, device budget');
