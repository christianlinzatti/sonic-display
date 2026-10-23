"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");const path=require("node:path");
const {load}=require("./helpers/ts-loader-v404.cjs");
const {resolveVocalPerformanceQualityV374:resolve}=load("components/visualizer/vocalPerformanceQualityV374");
const k=load("components/visualizer/rapSyllableKeyframesV420");
const root=path.resolve(__dirname,"..");
const read=s=>fs.readFileSync(path.join(root,s),"utf8");
const lyrics={provider:"spotify",synced:true,plainText:null,lines:[
 {startMs:1000,endMs:2500,text:"Bam schnelle Wörter",words:[
  {text:"Bam",startMs:1000,endMs:1290},{text:"schnelle",startMs:1300,endMs:1870},{text:"Wörter",startMs:1900,endMs:2440}]},
 {startMs:2600,endMs:3000,text:"Nur Zeilenzeit"},
 {startMs:3100,endMs:3800,text:"Pause"},
]};
const trackId="track_420";
const frames=[{at:0,jaw:.05,wide:.10,round:.05},{at:.5,jaw:.98,wide:.90,round:.08},{at:1,jaw:.08,wide:.05,round:.90}];
const edit={startMs:1300,text:"schnelle",strength:100,frames};
const doc={trackId,edits:[edit]};
const opts={style:"rap",genre:"Deutschrap",lipStrength:90,rapLipEnabledV415:true,rapLipPrecisionV415:80,
 rapSyllableEnabledV419:true,rapSyllableStrengthV419:80,rapSyllableSmoothnessV419:65,
 rapSyllableEditsEnabledV420:true,rapSyllableTrackIdV420:trackId,rapSyllableDocumentV420:doc};
const cue=(ms,more={},data=lyrics,playing=true)=>resolve(data,ms,playing,{...opts,...more});
const baseline=cue(1580,{rapSyllableEditsEnabledV420:false});
const edited=cue(1580);
assert(edited.rapSyllableV419.active);
assert.notDeepEqual(edited.face,baseline.face,'author keyframes affect mouth');
assert.deepEqual(edited.body,baseline.body,'body unchanged');
assert.deepEqual(edited.vocal,baseline.vocal,'vocal roles unchanged');
assert.equal(edited.effectiveTimeMs,baseline.effectiveTimeMs,'song and camera clock unchanged');
assert.equal(edited.face.lipsClosed,baseline.face.lipsClosed,'bilabial seal untouched');
assert.deepEqual(cue(1580,{rapSyllableEditsEnabledV420:false}),baseline,'disabled means exact V419 output');
assert.deepEqual(cue(1580,{rapSyllableDocumentV420:{trackId:"different",edits:[edit]}}),baseline);
assert.deepEqual(cue(1580,{rapSyllableTrackIdV420:"different"}),baseline);
assert.deepEqual(cue(1580,{rapSyllableEnabledV419:false}),cue(1580,{rapSyllableEnabledV419:false,rapSyllableEditsEnabledV420:false}));
assert.deepEqual(cue(1580,{rapSyllableDocumentV420:{trackId,edits:[{...edit,startMs:1305}]}}),baseline);
assert.deepEqual(cue(1580,{rapSyllableDocumentV420:{trackId,edits:[{...edit,text:"anderes Wort"}]}}),baseline);
const editedLyrics={...lyrics,lines:lyrics.lines.map((line,i)=>i?line:{...line,words:line.words.map(w=>w.text==="schnelle"?{...w,startMs:1320}:w)})};
assert.deepEqual(cue(1580,{},editedLyrics),cue(1580,{rapSyllableEditsEnabledV420:false},editedLyrics),'realigned words are not edited');
for(const ms of [900,1290,1300,1580,1869,1870,1900,2440,2700,3300]){
 const a=cue(ms),b=cue(ms);assert.deepEqual(a,b,`seek-safe ${ms}`);
 for(const field of ["jaw","wide","round","lipsClosed"]) assert(Number.isFinite(a.face[field])&&a.face[field]>=0&&a.face[field]<=1);
 assert(a.face.jaw+a.face.lipsClosed*.985<=1+1e-9);
}
const sealDoc={trackId,edits:[{...edit,startMs:1000,text:"Bam"}]};
const sealed=cue(1010,{rapSyllableDocumentV420:sealDoc});
const sealedBase=cue(1010,{rapSyllableEditsEnabledV420:false});
assert.equal(sealed.face.lipsClosed,sealedBase.face.lipsClosed,'B/P/M closure preserved');
assert(sealed.face.jaw<=1-sealed.face.lipsClosed*.985+1e-9);
assert.deepEqual(cue(1580,{},lyrics,false),cue(1580,{rapSyllableEditsEnabledV420:false},lyrics,false));
assert.deepEqual(cue(1580,{reducedMotion:true}),cue(1580,{reducedMotion:true,rapSyllableEditsEnabledV420:false}));
assert.deepEqual(cue(1580,{style:"singing"}),cue(1580,{style:"singing",rapSyllableEditsEnabledV420:false}));
assert.deepEqual(cue(1580,{}, {...lyrics,synced:false}), cue(1580,{rapSyllableEditsEnabledV420:false},{...lyrics,synced:false}));
assert.deepEqual(cue(1580,{}, {...lyrics,lines:lyrics.lines.map(line=>({...line,words:undefined}))}), cue(1580,{rapSyllableEditsEnabledV420:false},{...lyrics,lines:lyrics.lines.map(line=>({...line,words:undefined}))}));
const backing=cue(1580,{ensembleCountV374:2,avatarSlot:0,manualSingingSlotsV385:[1]});
assert(backing.face.jaw<=.1,'assigned backing role retains mute');
assert.equal(k.normalizeRapMouthEditV420({...edit,frames:[{...frames[0],jaw:NaN}]}),null);
assert.equal(k.normalizeRapMouthEditV420({...edit,frames:[frames[0],frames[0]]}),null,'duplicate time points rejected');
assert.equal(k.normalizeRapMouthEditV420({...edit,frames:[]}),null);
assert.equal(k.normalizeRapMouthEditV420({...edit,frames:Array(9).fill(frames[0])}),null);
assert.equal(k.normalizeRapMouthEditV420({...edit,strength:500}).strength,100);
assert.equal(k.sampleRapMouthFramesV420(frames,.5).jaw,.98);
assert(k.sampleRapMouthFramesV420(frames,.25).jaw>.05);
assert.deepEqual(k.normalizeRapMouthDocumentV420("wrong",doc),{trackId:"wrong",edits:[]});
const saved=k.upsertRapMouthEditV420(doc,{...edit,strength:65},{startMs:edit.startMs,text:edit.text});
assert.equal(saved.edits.length,1,'upsert replaces, not duplicates');assert.equal(saved.edits[0].strength,65);
assert.equal(k.upsertRapMouthEditV420(saved,null,{startMs:edit.startMs,text:edit.text}).edits.length,0,'delete works');
for(const src of ["types/music.ts","context/UiPreferencesContext.tsx","components/visualizer/registry.tsx","components/visualizer/VisualizerStage.tsx","components/visualizer/ThreeAvatar.tsx","components/visualizer/VocalRigV368.tsx","components/visualizer/VocalSyncInspectorV373.tsx"])
 assert(read(src).includes("rapSyllableEditsEnabledV420"),`missing live wiring: ${src}`);
assert(read("components/visualizer/vocalPerformanceQualityV374.ts").includes("applyRapMouthKeyframesV420"));
assert(read("components/visualizer/RapPerformanceEditorPanelV408.tsx").includes("RapSyllableTimelineEditorV420"));
assert(read("components/visualizer/RapSyllableTimelineEditorV420.tsx").includes("onPreviewMouth"));
assert(Number(JSON.parse(read("package.json")).version.match(/^0\.1\.0-v(\d+)$/)?.[1]) >= 420);
console.log("PASS V420: authored mouth keyframes, opt-in, song/word alignment, B/P/M seals, silence, singer roles, bounded interpolation, persistence and live preview wiring");
