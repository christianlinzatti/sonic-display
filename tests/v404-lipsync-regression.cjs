'use strict';
const assert=require('node:assert/strict');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {resolveVocalPerformanceQualityV374:resolve}=load('components/visualizer/vocalPerformanceQualityV374');
const lyrics={synced:true,provider:'spotify',lines:[{startMs:1000,endMs:2300,text:'Bam booom',words:[
 {text:'Bam',startMs:1000,endMs:1330},{text:'booom',startMs:1450,endMs:2080}]},
 {startMs:3000,endMs:3900,text:'[Instrumental]'},
 {startMs:4200,endMs:6200,text:'Noch ein Vers'}]};
const options={style:'rap',genre:'Deutschrap',expression:.65,lipStrength:90,
 qualityEnabledV374:true,naturalArticulationEnabledV384:true,articulationStrengthV384:85,lipSealV384:90,
 jawStabilityV384:80,ensembleCountV374:2,manualSingingSlotsV385:[0]};
const v=(ms,slot=0,playing=true,extra={})=>resolve(lyrics,ms,playing,{...options,avatarSlot:slot,...extra});
assert.equal(v(1100).confidence,'word');
assert(v(1015).face.lipsClosed>.5,'consonant B should close mouth at word onset');
assert.equal(v(1400).face.jaw,0,'silence between words');
assert.equal(v(2800).face.jaw,0,'silence between lines');
assert.equal(v(3300).face.jaw,0,'instrumental does not animate mouth');
assert.equal(v(1100,0,false).face.jaw,0,'paused playback no jaw');
assert.equal(v(1100,0,true,{reducedMotion:true}).face.jaw,0,'reduced motion suppresses jaw');
assert.equal(v(4900).confidence,'line','line-only lyrics cannot claim word precision');
assert.equal(v(1100,0).qualityV374.role,'lead');
assert.equal(v(1100,1).qualityV374.role,'backing');
assert(v(1600,1).face.jaw<=v(1600,0).face.jaw,'non-singing avatar mouth muted');
assert.deepEqual(v(1700),v(1700),'deterministic playback / scrubbing');
for(const ms of [0,1000,1100,1250,1400,1600,2300,3300,4800,7000])for(const slot of [0,1]){
 const {face}=v(ms,slot);
 for(const name of ['jaw','wide','round','lipsClosed','smile','brow','blink','cheek','squint'])
   assert(Number.isFinite(face[name])&&face[name]>=0&&face[name]<=1,`invalid face ${name} at ${ms} slot ${slot}`);
}
assert.equal(v(1100,0,true,{qualityEnabledV374:false}).articulationV384.active,false,'feature toggle respected');
console.log('PASS V404 lip-sync QA: Deutschrap labials, silence, line/word confidence, cast, pause, reduced-motion, bounds and seeks');
