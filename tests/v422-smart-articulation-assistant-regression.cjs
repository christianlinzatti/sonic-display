"use strict";
const assert=require("node:assert/strict");const fs=require("node:fs"),path=require("node:path");
const {load}=require("./helpers/ts-loader-v404.cjs");
const core=load("components/visualizer/rapArticulationAssistantV422");
const root=path.resolve(__dirname,"..");const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const lyrics={provider:"spotify",synced:true,plainText:null,lines:[{startMs:1000,endMs:2400,text:"Bam schnelle Wörter",words:[
{text:"Bam",startMs:1000,endMs:1290},{text:"schnelle",startMs:1300,endMs:1870},{text:"Wörter",startMs:1900,endMs:2390}]}]};
const word={startMs:1000,endMs:1290,text:"Bam"};
const options={style:"rap",mode:"lyrics",lipStrength:90,rapLipEnabledV415:true,rapLipPrecisionV415:80,
rapSyllableEnabledV419:true,rapSyllableStrengthV419:75,rapSyllableSmoothnessV419:70,
rapSyllableTrackIdV420:"track-422",rapSyllableDocumentV420:{trackId:"track-422",edits:[]}};
const proposals=core.suggestRapArticulationV422(lyrics,word,options);
assert(proposals.length>=1&&proposals.length<=2,"short real-time word yields at least one candidate");
for(const p of proposals){
 assert(p.edit.startMs===word.startMs&&p.edit.text==="bam");
 assert(p.edit.frames.length<=8&&p.edit.frames.length>=2);
 assert(p.edit.frames.every((f,i)=>[f.at,f.jaw,f.wide,f.round].every(n=>Number.isFinite(n)&&n>=0&&n<=1)&&(!i||f.at>p.edit.frames[i-1].at)));
 assert(p.edit.strength>=0&&p.edit.strength<=100);
 assert(Number.isFinite(p.estimatedPeakChange)&&p.estimatedPeakChange>=0);
}
assert.deepEqual(core.suggestRapArticulationV422(lyrics,word,options),proposals,"deterministic seek-safe suggestions");
const preserved=structuredClone(options);
preserved.rapSyllableDocumentV420.edits=[proposals[0].edit];
assert.deepEqual(core.suggestRapArticulationV422(lyrics,word,preserved),[],"manual saved edits never replaced");
assert.deepEqual(core.suggestRapArticulationV422(null,word,options),[],"no lyrics");
assert.deepEqual(core.suggestRapArticulationV422({...lyrics,synced:false},word,options),[],"no word timing");
assert.deepEqual(core.suggestRapArticulationV422({...lyrics,lines:[{startMs:1000,endMs:2500,text:"Bam"}]},word,options),[],"line-only lyrics");
assert.deepEqual(core.suggestRapArticulationV422(lyrics,{...word,text:"fake"},options),[],"text identity");
assert.deepEqual(core.suggestRapArticulationV422(lyrics,word,{...options,rapSyllableTrackIdV420:"other"}),[],"track identity");
assert.deepEqual(core.suggestRapArticulationV422(lyrics,word,{...options,reducedMotion:true}),[],"accessibility");
assert.deepEqual(core.suggestRapArticulationV422(lyrics,word,{...options,lipStrength:0}),[],"lip sync off");
const parent=read("components/visualizer/RapSyllableTimelineEditorV420.tsx");
const panel=read("components/visualizer/RapArticulationAssistantPanelV422.tsx");
assert(parent.includes("RapArticulationAssistantPanelV422")&&parent.includes("suggestRapArticulationV422"));
assert(parent.includes("setFrames(suggestion.edit.frames")&&parent.includes("hasUnsavedV422"));
assert(panel.includes("onApply")&&panel.includes("Mundformen speichern")&&panel.includes("hasExisting"));
assert.ok(Number(JSON.parse(read("package.json")).version.match(/^0\.1\.0-v(\d+)$/)?.[1]) >= 422);
console.log("PASS V422: bounded deterministic heuristic suggestions, word/track identity, manual-edit protection, editor-preview only, no autosave");
