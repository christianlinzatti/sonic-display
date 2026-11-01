'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const old=load('components/visualizer/phonemeLipSyncV644');
const v=load('components/visualizer/advancedPhonemeLipSyncV662');
const id='rap-track',dur=180000;
const m=(slot,startMs,endMs,viseme)=>({slot,startMs,endMs,viseme});
const doc=old.createVisemeDocumentV644(id,dur,[
 m(0,1000,1100,'PP'),m(0,1100,1200,'AA'),m(0,1200,1310,'OH'),
 m(1,1100,1160,'E'),m(1,1160,1200,'OU'),m(2,2000,2070,'sil'),m(3,2070,2200,'TH'),
 m(0,1600,1660,'FF'),m(0,1660,1720,'PP'),m(0,1720,1800,'IH')]);
assert(doc,'valid V644 manual document');
let cases=0;
function check(label,fn){try{fn();++cases;}catch(err){err.message=`V662 ${label}: ${err.message}`;throw err;}}
check('disabled by default',()=>{old.clearLiveVisemeV644();v.clearAdvancedVisemeModeV662();assert.equal(v.sampleAdvancedVisemeV662(id,0,1050,true),null);});
check('cannot enable without V644 opt-in',()=>{assert(v.setAdvancedVisemeModeV662(id,'rap'));old.setLiveVisemeV644(doc,id,dur,false);assert.equal(v.sampleAdvancedVisemeV662(id,0,1050,true),null);});
check('valid manual cue opts in',()=>{old.setLiveVisemeV644(doc,id,dur,true);assert.equal(v.sampleAdvancedVisemeV662(id,0,1050,true).mouth.lipsClosed,1);});
check('wrong song never gets lip cues',()=>assert.equal(v.sampleAdvancedVisemeV662('wrong',0,1050,true),null));
check('disabled V662 falls back to V644',()=>{v.setAdvancedVisemeModeV662(id,'off');assert.equal(v.sampleAdvancedVisemeV662(id,0,1050,true),null);assert(old.sampleLiveVisemeV644(id,0,1050,true));});
check('do not accept unknown mode',()=>{assert.equal(v.setAdvancedVisemeModeV662(id,'guess'),false);assert.equal(v.getAdvancedVisemeModeV662(id),'off');});
check('song id mandatory',()=>assert.equal(v.setAdvancedVisemeModeV662('','rap'),false));
check('rap explicit',()=>{assert(v.setAdvancedVisemeModeV662(id,'rap'));assert.equal(v.getAdvancedVisemeModeV662(id),'rap');});
check('singing explicit',()=>{assert(v.setAdvancedVisemeModeV662(id,'singing'));assert.equal(v.getAdvancedVisemeModeV662(id),'singing');});
check('rap PP center fully closed',()=>{v.setAdvancedVisemeModeV662(id,'rap');const a=v.sampleAdvancedVisemeV662(id,0,1040,true).mouth;assert(a.lipsClosed>.999&&a.jaw<.001);});
check('AA center open',()=>{const a=v.sampleAdvancedVisemeV662(id,0,1150,true).mouth;assert(a.jaw>.88);});
check('OH round and E wide',()=>{assert(v.sampleAdvancedVisemeV662(id,0,1260,true).mouth.round>.8);assert(v.sampleAdvancedVisemeV662(id,1,1130,true).mouth.wide>.8);});
check('silence has zero energy',()=>{assert.deepEqual(v.sampleAdvancedVisemeV662(id,2,2030,true).mouth,{jaw:0,wide:0,round:0,lipsClosed:0});});
check('PP closure at middle of fast segment',()=>assert(v.sampleAdvancedVisemeV662(id,0,1690,true).mouth.lipsClosed>.99));
check('next gap is not synthesized',()=>{assert.equal(v.sampleAdvancedVisemeV662(id,0,1350,true),null);assert.equal(v.sampleAdvancedVisemeV662(id,0,1550,true),null);});
check('before and after intervals inactive',()=>{assert.equal(v.sampleAdvancedVisemeV662(id,0,999.99,true),null);assert.equal(v.sampleAdvancedVisemeV662(id,0,1800,true),null);});
check('half open boundary',()=>assert.equal(v.sampleAdvancedVisemeV662(id,1,1200,true),null));
check('paused, NaN, Infinity, negative',()=>{for(const t of [-1,NaN,Infinity,-Infinity])assert.equal(v.sampleAdvancedVisemeV662(id,0,t,true),null);assert.equal(v.sampleAdvancedVisemeV662(id,0,1050,false),null);});
check('invalid avatar slots',()=>{for(const i of [-1,4,1.1,NaN,Infinity])assert.equal(v.sampleAdvancedVisemeV662(id,i,1050,true),null);});
check('track duration bounds',()=>assert.equal(v.sampleAdvancedVisemeV662(id,0,dur,true),null));
check('different avatars isolated',()=>assert.equal(v.sampleAdvancedVisemeV662(id,2,1050,true),null));
check('transition smooth bounded',()=>{let previous=null;for(let t=1050;t<=1145;t++){const result=v.sampleAdvancedVisemeV662(id,0,t,true);assert(result);const x=result.mouth;assert(Object.values(x).every(n=>Number.isFinite(n)&&n>=0&&n<=1));assert(x.jaw<=1-x.lipsClosed+1e-9);if(previous!==null)assert(Math.abs(x.jaw-previous)<.09,`${t} discontinuity`);previous=x.jaw;}});
check('singing transitions wider than rap',()=>{v.setAdvancedVisemeModeV662(id,'rap');const rap=v.sampleAdvancedVisemeV662(id,0,1080,true).mouth;v.setAdvancedVisemeModeV662(id,'singing');const soft=v.sampleAdvancedVisemeV662(id,0,1080,true).mouth;assert(soft.jaw>rap.jaw,'singing should anticipate earlier');});
check('short cues retain center',()=>{v.setAdvancedVisemeModeV662(id,'singing');assert(v.sampleAdvancedVisemeV662(id,0,1690,true).mouth.lipsClosed>.99);});
check('store update rebuilds cache',()=>{const d2=old.createVisemeDocumentV644(id,dur,[m(0,1000,1100,'OU')]);old.setLiveVisemeV644(d2,id,dur,true);assert(v.sampleAdvancedVisemeV662(id,0,1040,true).mouth.round>.99);old.setLiveVisemeV644(doc,id,dur,true);});
check('disable V644 also disables advanced',()=>{old.setLiveVisemeV644(doc,id,dur,false);assert.equal(v.sampleAdvancedVisemeV662(id,0,1050,true),null);old.setLiveVisemeV644(doc,id,dur,true);});
check('no stale track after song change',()=>{old.clearVisemeOnTrackChangeV644('different');assert.equal(v.sampleAdvancedVisemeV662(id,0,1050,true),null);});
check('reusing new song cannot inherit old mode',()=>{const d2=old.createVisemeDocumentV644('another',dur,[m(0,1000,1100,'AA')]);old.setLiveVisemeV644(d2,'another',dur,true);assert.equal(v.sampleAdvancedVisemeV662('another',0,1050,true),null);});
check('explicit cleanup resets mode',()=>{v.clearAdvancedVisemeModeV662();assert.equal(v.getAdvancedVisemeModeV662(id),'off');});
check('UI exposes opt-in profiles',()=>{const ui=fs.readFileSync('components/visualizer/PhonemeTimelineLabV644.tsx','utf8');assert(ui.includes('Deutschrap · präzise Konsonanten')&&ui.includes('Gesang · weichere Übergänge')&&ui.includes('clearAdvancedVisemeModeV662()'));});
check('same rig, manual priority and legacy fallback',()=>{const rig=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');assert(rig.includes('sampleAdvancedVisemeV662(trackId,avatarSlot,clockV453'));assert(rig.includes('sampleLiveVisemeV644(trackId,avatarSlot,clockV453'));assert(rig.includes('alignedMouthV644??directedTargetV632'));assert(rig.includes('!authoredPriorityV499'));assert(rig.includes('!lipSync?.rapSyllableEditsEnabledV420'));assert(rig.includes('calibrateMouthPoseV562'));});
check('no extra hooks, network or audio',()=>{const src=fs.readFileSync('components/visualizer/advancedPhonemeLipSyncV662.ts','utf8');assert(!/useFrame\(|fetch\(|getUserMedia\(|new AudioContext\(|localStorage\.|setInterval\(/.test(src));});
check('V644 behavior unchanged',()=>{old.setLiveVisemeV644(doc,id,dur,true);assert.deepEqual(old.sampleLiveVisemeV644(id,0,1050,true),{jaw:0,wide:0,round:0,lipsClosed:1});});
// Real-sized manually timed library; the runtime must not leak cue sampling
// across tracks/slots or emit out-of-bound facial channels.
const large=old.createVisemeDocumentV644(id,dur,Array.from({length:3200},(_,i)=>{
 const group=Math.floor(i/4),slot=i%4,begin=group*180;
 return m(slot,begin,begin+100,old.VISEMES_V644[i%old.VISEMES_V644.length]);
}));
assert(large&&large.marks.length===3200);
old.setLiveVisemeV644(large,id,dur,true);v.setAdvancedVisemeModeV662(id,'rap');
let samples=0;
for(let i=0;i<15000;i++){
 const slot=i%4,time=(i*71.1)%dur;
 const result=v.sampleAdvancedVisemeV662(id,slot,time,true);
 if(result){assert(Object.values(result.mouth).every(n=>n>=0&&n<=1&&Number.isFinite(n)));assert(result.mouth.jaw<=1-result.mouth.lipsClosed+1e-9);}
 assert.equal(v.sampleAdvancedVisemeV662('unknown',slot,time,true),null);
 samples++;
}
old.clearLiveVisemeV644();v.clearAdvancedVisemeModeV662();
console.log(`PASS V662: ${cases} regression groups; ${samples} song/slot samples`);
