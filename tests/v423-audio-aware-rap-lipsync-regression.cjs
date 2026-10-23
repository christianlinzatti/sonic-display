"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {load}=require("./helpers/ts-loader-v404.cjs");
const a=load("components/visualizer/rapAudioAwareV423");
const {resolveVocalPerformanceQualityV374:resolve}=load("components/visualizer/vocalPerformanceQualityV374");
const root=path.resolve(__dirname,"..");const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const sampleRate=16000,duration=3;
const wav=new Float32Array(sampleRate*duration);
for(let i=0;i<wav.length;i++)wav[i]=(i/sampleRate<1.7?.42:.05)*Math.sin(2*Math.PI*(210+Math.floor(i/4000)*40)*i/sampleRate);
const doc=a.analyzeLocalRapAudioV423(wav,sampleRate,"song423");
assert(doc&&doc.version===1&&doc.trackId==="song423"&&doc.points.length>20);
assert(doc.points.every(p=>p.length===3&&p.every(n=>Number.isInteger(n)&&n>=0&&n<=100)));
assert.deepEqual(a.analyzeLocalRapAudioV423(wav,sampleRate,"song423"),doc,"deterministic signal analysis");
assert.equal(a.analyzeLocalRapAudioV423(wav,0,"song423"),null);
assert.equal(a.analyzeLocalRapAudioV423(new Float32Array(90),16000,"song423"),null);
assert.equal(a.normalizeRapAudioDocumentV423("other",doc),null,"wrong song rejected");
assert.equal(a.normalizeRapAudioDocumentV423("song423",doc,7500),null,"mismatched duration rejected");
assert.equal(a.normalizeRapAudioDocumentV423("song423",{...doc,points:[[Infinity,0,0]]}),null,"invalid data rejected");
assert.equal(a.sampleRapAudioV423(doc,-1),null);
assert.equal(a.sampleRapAudioV423(doc,doc.durationMs),null);
assert(a.sampleRapAudioV423(doc,1200).energy>.1);
const lyrics={provider:"spotify",synced:true,plainText:null,lines:[{startMs:1000,endMs:2300,text:"Bam schnelle Reime",words:[
{text:"Bam",startMs:1000,endMs:1300},{text:"schnelle",startMs:1310,endMs:1880},{text:"Reime",startMs:1890,endMs:2300}]}]};
const options={style:"rap",mode:"lyrics",lipStrength:90,rapLipEnabledV415:true,rapLipPrecisionV415:70,
rapSyllableEnabledV419:true,rapSyllableStrengthV419:80,rapSyllableSmoothnessV419:65,
rapAudioEnabledV423:true,rapAudioStrengthV423:100,rapAudioTrackIdV423:"song423",rapAudioDocumentV423:doc,
rapSyllableTrackIdV420:"song423",rapSyllableDocumentV420:{trackId:"song423",edits:[]}};
const t=1530;
const base=resolve(lyrics,t,true,{...options,rapAudioEnabledV423:false});
const mixed=resolve(lyrics,t,true,options);
assert.equal(mixed.rapSyllableV419.active,true,"word timing active");
assert(["jaw","wide","round"].some(part=>Math.abs(base.face[part]-mixed.face[part])>1e-6),"local signal changes mouth");
for(const key of ["jaw","round","wide","lipsClosed"])assert(Number.isFinite(mixed.face[key])&&mixed.face[key]>=0&&mixed.face[key]<=1);
assert.deepEqual(mixed.body,base.body,"body unchanged");
assert.deepEqual(mixed.vocal,base.vocal,"vocal role unchanged");
assert.deepEqual(resolve(lyrics,t,true,options),mixed,"seeking remains deterministic");
assert.deepEqual(resolve(lyrics,t,false,options).face,resolve(lyrics,t,false,{...options,rapAudioEnabledV423:false}).face,"pause guard");
assert.deepEqual(resolve(lyrics,t,true,{...options,reducedMotion:true}).face,resolve(lyrics,t,true,{...options,rapAudioEnabledV423:false,reducedMotion:true}).face,"accessibility guard");
assert.deepEqual(resolve(lyrics,t,true,{...options,rapAudioTrackIdV423:"wrong"}).face,base.face,"track isolation");
assert.deepEqual(resolve(lyrics,t,true,{...options,rapAudioStrengthV423:0}).face,base.face,"zero strength fallback");
assert.deepEqual(resolve({...lyrics,synced:false},t,true,options).face,resolve({...lyrics,synced:false},t,true,{...options,rapAudioEnabledV423:false}).face,"no line-only/unsynced gate");
const edit={startMs:1310,text:"schnelle",strength:100,frames:[{at:0,jaw:.1,round:0,wide:0},{at:.5,jaw:.9,round:.5,wide:.2},{at:1,jaw:.1,round:0,wide:0}]};
const withManual={...options,rapSyllableEditsEnabledV420:true,rapSyllableDocumentV420:{trackId:"song423",edits:[edit]}};
assert.deepEqual(resolve(lyrics,t,true,withManual).face,resolve(lyrics,t,true,{...withManual,rapAudioEnabledV423:false}).face,"V420 authored edit has full priority");
const src=read("components/visualizer/RapAudioAwarePanelV423.tsx");
assert(src.includes("decodeAudioData")&&src.includes("Merkmale diesem Song zuordnen und speichern")&&src.includes("audio/*"));
assert(src.includes("rapAudioEnabledV423")&&src.includes("source.current"));
const stage=read("components/visualizer/VisualizerStage.tsx");
for(const file of ["components/visualizer/ThreeAvatar.tsx","components/visualizer/VocalRigV368.tsx","components/visualizer/vocalPerformanceQualityV374.ts"])
 assert(read(file).includes("rapAudioEnabledV423")||read(file).includes("applyRapAudioV423"),`live bridge ${file}`);
assert(stage.includes("rapAudioDocumentV423"));
assert(read("components/visualizer/RapPerformanceEditorPanelV408.tsx").includes("<RapAudioAwarePanelV423/>"));
const pkg=JSON.parse(read("package.json"));assert.ok(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1]) >= 425);assert(pkg.scripts["build:preflight"].includes("test:v423"));
console.log("PASS V423: explicit local audio analysis, bounded feature-only storage, track/duration validation, playback/role/manual keyframe guards, 3D pipeline, no Spotify audio interception");
