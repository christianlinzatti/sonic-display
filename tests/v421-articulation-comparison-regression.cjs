'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const core=load('components/visualizer/rapArticulationComparisonV421');
const {resolveVocalPerformanceQualityV374:resolve}=load('components/visualizer/vocalPerformanceQualityV374');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const lyrics={provider:'spotify',synced:true,plainText:null,lines:[
 {startMs:1000,endMs:2500,text:'Bam schnelle Wörter',words:[
 {text:'Bam',startMs:1000,endMs:1290},{text:'schnelle',startMs:1300,endMs:1870},{text:'Wörter',startMs:1900,endMs:2440}]},
 {startMs:2700,endMs:3000,text:'Nur Zeilenzeit'}]};
const word={startMs:1300,endMs:1870,text:'schnelle'};
const edit={startMs:1300,text:'schnelle',strength:100,frames:[
 {at:0,jaw:.1,wide:.1,round:.1},{at:.5,jaw:.96,wide:.8,round:.05},{at:1,jaw:.12,wide:.05,round:.86}]};
const doc={trackId:'v421',edits:[edit]};
const options={style:'rap',mode:'lyrics',lipStrength:90,rapLipEnabledV415:true,rapLipPrecisionV415:75,
 rapSyllableEnabledV419:true,rapSyllableStrengthV419:75,rapSyllableSmoothnessV419:65,
 rapSyllableTrackIdV420:'v421',rapSyllableDocumentV420:doc};
const pair=core.sampleRapArticulationPairV421(lyrics,word,1600,options);
assert(pair,'valid word produces comparison');
const baseline=resolve(lyrics,1600,true,{...options,rapSyllableEditsEnabledV420:false});
const corrected=resolve(lyrics,1600,true,{...options,rapSyllableEditsEnabledV420:true});
for(const part of ['jaw','wide','round','lipsClosed']){
 assert.equal(pair.automatic[part],baseline.face[part],`A ${part} = V419`);
 assert.equal(pair.corrected[part],corrected.face[part],`B ${part} = V420`);
 assert(Number.isFinite(pair.automatic[part])&&pair.automatic[part]>=0&&pair.automatic[part]<=1);
 assert(Number.isFinite(pair.corrected[part])&&pair.corrected[part]>=0&&pair.corrected[part]<=1);
}
assert.deepEqual(resolve(lyrics,1600,true,{...options,rapSyllableEditsEnabledV420:true}).body,
 resolve(lyrics,1600,true,{...options,rapSyllableEditsEnabledV420:false}).body,'comparison does not change body');
assert(Object.values(pair.delta).some(v=>Math.abs(v)>1e-3),'nontrivial A/B difference');
const chart=core.compareRapArticulationWordV421(lyrics,word,options,19);
assert.equal(chart.points.length,19);assert.equal(chart.validSamples,19);
assert(chart.averageChange>0&&chart.maximumChange>0);
assert.equal(chart.points[0].timeMs,word.startMs);
assert(chart.points.at(-1).timeMs<word.endMs,'last sample remains inside word');
assert.deepEqual(core.compareRapArticulationWordV421(lyrics,word,options,19),chart,'seek safe deterministic');
const cleared=core.compareRapArticulationWordV421(lyrics,word,{...options,rapSyllableDocumentV420:{trackId:'v421',edits:[]}});
assert.equal(cleared.averageChange,0,'A/B identical when no edit');
for(const invalid of [null,{...lyrics,synced:false}, {...lyrics,lines:[{startMs:1000,endMs:2000,text:'line only'}]}]){
 assert.equal(core.sampleRapArticulationPairV421(invalid,word,1600,options),null);
 assert.equal(core.compareRapArticulationWordV421(invalid,word,options).validSamples,0);
}
assert.equal(core.sampleRapArticulationPairV421(lyrics,word,1870,options),null,'exclusive end');
assert.equal(core.sampleRapArticulationPairV421(lyrics,{...word,text:'anderes Wort'},1600,options),null);
assert.equal(core.sampleRapArticulationPairV421(lyrics,{...word,startMs:1320},1600,options),null);
assert.equal(core.sampleRapArticulationPairV421(lyrics,word,1600,{...options,rapSyllableTrackIdV420:'other'}),null);
assert.equal(core.sampleRapArticulationPairV421(lyrics,word,1600,{...options,reducedMotion:true}),null);
assert.equal(core.sampleRapArticulationPairV421(lyrics,word,1600,{...options,lipStrength:0}),null);
assert.equal(core.sampleRapArticulationPairV421(lyrics,word,1800,{...options,rapLipOffsetMsV415:800}),null,'offset to other word must not silently compare');
const seal=core.sampleRapArticulationPairV421(lyrics,{startMs:1000,endMs:1290,text:'Bam'},1010,{...options,rapSyllableDocumentV420:{trackId:'v421',edits:[{...edit,startMs:1000,text:'Bam'}]}});
assert(seal);assert.equal(seal.automatic.lipsClosed,seal.corrected.lipsClosed,'preserve lip seal');
const ui=read('components/visualizer/RapArticulationComparisonPanelV421.tsx');
const parent=read('components/visualizer/RapSyllableTimelineEditorV420.tsx');
assert(ui.includes('Gestrichelt: A')&&ui.includes('Korrigiert')&&ui.includes('onSeek')&&ui.includes('MouthDiagram'));
assert(parent.includes('RapArticulationComparisonPanelV421')&&parent.includes('comparisonModeV421')&&parent.includes('onPreviewMouth(pair?pair[comparisonModeV421].jaw:null)'));
assert.ok(Number(JSON.parse(read('package.json')).version.match(/^0\.1\.0-v(\d+)$/)?.[1]) >= 421);
console.log('PASS V421: A/B predictions, same resolver/clock, exact word identity, protections, curves, deterministic sampling and preview controls');
