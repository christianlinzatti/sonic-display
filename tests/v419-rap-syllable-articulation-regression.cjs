require('./helpers/threeAvatarSourcesV492.cjs').install();
"use strict";
const assert=require("node:assert/strict");const fs=require("node:fs");const path=require("node:path");
const {load}=require("./helpers/ts-loader-v404.cjs");
const {resolveVocalPerformanceQualityV374:quality}=load("components/visualizer/vocalPerformanceQualityV374");
const syllables=load("components/visualizer/rapSyllableArticulationV419");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const lyrics={provider:"spotify",synced:true,plainText:null,lines:[
  {startMs:1000,endMs:2450,text:"Bam, schnelle Melodie",words:[
    {text:"Bam,",startMs:1000,endMs:1280},{text:"schnelle",startMs:1300,endMs:1850},
    {text:"Melodie",startMs:1880,endMs:2410}]},
  {startMs:2500,endMs:3300,text:"Pause ohne Wortmarken"},
  {startMs:3400,endMs:3800,text:"[Instrumental]"},
]};
const base={style:"rap",genre:"Deutschrap",lipStrength:90,rapArticulationEnabledV405:true,
  qualityEnabledV374:true,rapLipEnabledV415:true,rapLipPrecisionV415:80,ensembleCountV374:1};
const extra={rapSyllableEnabledV419:true,rapSyllableStrengthV419:85,rapSyllableSmoothnessV419:65};
const cue=(ms,opt={},playing=true,source=lyrics)=>quality(source,ms,playing,{...base,...opt});
assert.equal(cue(1550).rapSyllableV419.active,false,"legacy unaffected by default");
const enabled=cue(1550,extra),old=cue(1550);
assert.equal(enabled.rapSyllableV419.active,true);
assert.equal(enabled.rapSyllableV419.word,"schnelle");
assert(enabled.rapSyllableV419.estimatedSyllables>=2);
assert(enabled.rapSyllableV419.sampledSyllables<=enabled.rapSyllableV419.estimatedSyllables);
assert.equal(enabled.rapSyllableV419.source,"grapheme-estimate");
assert.deepEqual(enabled.body,old.body,"body unchanged");
assert.deepEqual(enabled.vocal,old.vocal,"vocalist selection unchanged");
assert.equal(enabled.effectiveTimeMs,old.effectiveTimeMs,"no song clock shift");
assert.equal(enabled.songTimeMs,old.songTimeMs);
assert.equal(enabled.face.lipsClosed,old.face.lipsClosed,"must preserve lips seal");
assert.notDeepEqual([enabled.face.jaw,enabled.face.wide,enabled.face.round],[old.face.jaw,old.face.wide,old.face.round],"must affect mouth");
assert.deepEqual(cue(1550,{...extra,rapSyllableEnabledV419:false}).face,old.face,"toggle off exact legacy");
assert.deepEqual(cue(1550,{...extra,rapSyllableStrengthV419:0}).face,old.face,"zero strength exact legacy");
assert.equal(cue(1550,{...extra,lipStrength:0}).rapSyllableV419.active,false,"global lipsync off overrides V419");
assert.equal(cue(1080,extra).face.lipsClosed,cue(1080).face.lipsClosed,"B/P/M closure untouched");
for(const [ms,props,playing,lyric] of [
 [900,extra,true,lyrics],[1280,extra,true,lyrics],[2500,extra,true,lyrics],
 [3500,extra,true,lyrics],[1500,extra,false,lyrics],
 [1500,{...extra,reducedMotion:true},true,lyrics],
 [1500,{...extra,style:"singing"},true,lyrics],
 [1500,extra,true,{...lyrics,synced:false}],
 [1500,extra,true,{...lyrics,lines:lyrics.lines.map(line=>({...line,words:undefined}))}],
 [1550,{...extra,rapSyllableStrengthV419:0},true,lyrics],
]) assert.equal(cue(ms,props,playing,lyric).rapSyllableV419.active,false,`should be inactive at ${ms}`);
const rapid={...lyrics,lines:[{startMs:1000,endMs:1250,text:"Melodie",words:[{text:"Melodie",startMs:1000,endMs:1190}]}]};
assert(cue(1080,extra,true,rapid).rapSyllableV419.sampledSyllables<=2,"fast speech must cap shape changes");
const other=cue(1540,{...extra,rapLipOffsetMsV415:60});
assert.equal(other.effectiveTimeMs,cue(1540,extra).effectiveTimeMs);
assert.equal(other.rapSyllableV419.mouthTimeMs,cue(1540,extra).rapSyllableV419.mouthTimeMs+60);
for(const ms of [1000,1005,1070,1190,1279,1300,1460,1550,1849,1880,1900,2080,2409,2600,3500]){
 const a=cue(ms,extra),b=cue(ms,extra);assert.deepEqual(a,b,`seek ${ms}`);
 for(const k of ["jaw","wide","round","lipsClosed"]){assert(Number.isFinite(a.face[k])&&a.face[k]>=0&&a.face[k]<=1,`${ms}: ${k}`);}
 assert(a.face.jaw+a.face.lipsClosed*.985<=1+1e-9,"seal guard");
}
for(const corrupt of [{rapSyllableStrengthV419:NaN,rapSyllableSmoothnessV419:Infinity},{rapSyllableStrengthV419:10000,rapSyllableSmoothnessV419:-200}]) {
 const a=cue(1550,{...extra,...corrupt});assert(a.face.jaw>=0&&a.face.jaw<=1);assert(Number.isFinite(a.face.wide));
}
const backing=cue(1550,{...extra,manualSingingSlotsV385:[1],ensembleCountV374:2,avatarSlot:0});
assert(backing.face.jaw<=.1,"backing avatar should be muted");
assert.equal(syllables.refineRapSyllablesV419(lyrics,old,true,extra).rapSyllableV419.active,true);
for(const p of ["components/visualizer/ThreeAvatar.tsx","components/visualizer/VocalRigV368.tsx","components/visualizer/VisualizerStage.tsx","components/visualizer/registry.tsx","components/visualizer/VocalSyncInspectorV373.tsx"])assert(read(p).includes("rapSyllableEnabledV419"),p);
assert(read("types/music.ts").includes("avatarRapSyllableEnabledV419"));
assert(read("components/visualizer/VocalSyncInspectorV373.tsx").includes("Keine akustische Phonem- oder Silbenerkennung"));
assert(Number(JSON.parse(read("package.json")).version.match(/^0\.1\.0-v(\d+)$/)?.[1]) >= 419);
console.log("PASS V419: estimated syllable shapes, bounded transitions, pauses, syllable caps, offset, B/P/M preservation, manual roles, opt-in and deterministic seek");
