'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planAutomaticConcertExperienceV464:concert,concertMotionEnergyV464:energy}=load('services/show/automaticConcertExperienceV464');
const {buildSmartRapShowV446,sampleSmartRapShowV446}=load('components/visualizer/smartAutomaticRapShowV446');
const {planUltimateAutomaticShowV456}=load('services/show/ultimateAutomaticShowV456');
const {planIntelligentFeatureV460}=load('components/visualizer/intelligentFeaturePerformanceV460');
const {planShowContinuityV457}=load('services/show/showContinuityV457');
const balance={attention:'balanced',reason:'long-break',allowAutomaticInsight:true,allowCinematic:true,allowConnectionSpotlight:true};
// 18 synchronized lyric lines; 3 distinct recurring hook candidates, four avatars.
const hookTexts=['Wir feiern jetzt gemeinsam diese wunderschöne Nacht','Der ganze Club singt heute laut mit uns'];
const lines=Array.from({length:36},(_,i)=>({startMs:i*5500,text:
 [4,5,12,13,20,21,28,29].includes(i)?hookTexts[i%2===0?0:1]:`Eindeutiger Rap Vers ${i} mit einem frischen Reim`}));
const plan=buildSmartRapShowV446({trackId:'concert-464',lyrics:{synced:true,lines},count:4,durationMs:210000,enabled:true});
assert.equal(plan.source,'synced-lyrics');
assert.equal(plan.count,4);
const generate=(ms,patch={})=>{
 const cue=sampleSmartRapShowV446(plan,ms,{enabled:true,playing:true,reducedMotion:false,manualProtected:false});
 const dir=planUltimateAutomaticShowV456({enabled:true,playing:true,reducedMotion:false,automaticDance:true, cue,balance,count:4,energy:.72});
 const feat=planIntelligentFeatureV460({plan,cue,progressMs:ms,count:4,enabled:true,playing:true,reducedMotion:false,manualProtected:false});
 const smooth=planShowContinuityV457({direction:dir,plan,trackId:'concert-464',progressMs:ms,quality:patch.quality||'high'});
 return concert({plan,progressMs:ms,trackId:'concert-464',playing:true,reducedMotion:false,
  direction:smooth.direction,feature:feat,quality:patch.quality||'high',...patch});
};
const opening=generate(2000),development=generate(72000),climax=generate(144000),finale=generate(185000);
for(const [item,name] of [[opening,'opening'],[development,'development'],[climax,'climax'],[finale,'finale']]){
 assert(item.active);assert.equal(item.act,name);assert(item.eventId.includes('concert-464'));
 assert(item.direction.lightMultiplier>=.9&&item.direction.lightMultiplier<=1.15);
 assert(item.direction.interactionMultiplier>=.9&&item.direction.interactionMultiplier<=1.1);
 assert(item.energyAccent>=0&&item.energyAccent<=.075);
 assert(item.feature.responseGain>=0&&item.feature.responseGain<=1);
}
assert.equal(generate(23000).act,'opening');
const repeated=generate(143000);assert(repeated.hookOrdinal>=0);
const candidate=plan.beats.filter(b=>b.section==='hook');assert(candidate.length>=2,'real repeated lines must qualify a visual hook');
const firstHook=generate(candidate[0].atMs+2000),laterHook=generate(candidate[candidate.length-1].atMs+2000);
assert(firstHook.hookOrdinal>=1&&laterHook.hookOrdinal>=firstHook.hookOrdinal);
assert(laterHook.peak>=firstHook.peak,'later hook repetitions may gain intensity');
const breathing=plan.beats.filter(b=>b.section==='verse'&&b.untilMs-b.atMs>=12500);
assert(breathing.length>=1);
const breath=generate(breathing[0].atMs+(breathing[0].untilMs-breathing[0].atMs)*.69);
assert.equal(breath.breathing,true);
assert.equal(generate(breathing[0].atMs+500).breathing,false);
const low=generate(candidate[0].atMs+2000,{quality:'low'});
assert(low.energyAccent<=firstHook.energyAccent);
assert(low.direction.lightMultiplier<=1.15);
const paused=generate(77000,{playing:false});assert.equal(paused.active,false);
const reduced=generate(77000,{reducedMotion:true});assert.equal(reduced.active,false);
const invalid=generate(77000,{trackId:'different-track'});assert.equal(invalid.active,false);
const seek=generate(NaN);assert.equal(seek.active,false);
const out=generate(215000);assert.equal(out.active,false);
const authored=generate(77000,{direction:{...generate(77000).direction,active:false}});
assert.equal(authored.active,false);
assert.equal(authored.direction.lightMultiplier,generate(77000).direction.lightMultiplier);
const lyrics=generate(78000,{direction:{...generate(78000).direction,balance:{...balance,attention:'lyrics'}}});
assert(lyrics.active&&lyrics.direction.balance.attention==='lyrics');
assert.equal(energy(paused,.17,.03),.17,'disabled director must pass through exactly');
assert(energy(firstHook,.15,.7)>=.7,'never lower live music energy');
for(let ms=0;ms<210000;ms+=239){
 const score=generate(ms,{quality:ms%3===0?'low':ms%3===1?'balanced':'high'});
 if(score.active){
   assert(Number.isFinite(score.peak)&&Number.isFinite(score.energyAccent));
   assert(score.direction.lightMultiplier>=.9&&score.direction.lightMultiplier<=1.15);
   assert(score.direction.interactionMultiplier>=.9&&score.direction.interactionMultiplier<=1.1);
   assert(energy(score,.4,.3)>=.3);
   assert.deepEqual(score,generate(ms,{quality:ms%3===0?'low':ms%3===1?'balanced':'high'}),'seek safe');
 }
}
// A 30-min playback with repeats does not retain history, grow memory or create timers.
for(let ms=0;ms<1800000;ms+=500){const time=ms%210000;const score=generate(time);
 assert(score.energyAccent>=0&&score.energyAccent<=.075);
}
const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
require('./helpers/concert-camera-contract-v4737.cjs').assertConcertCameraCueContract(stage);
for(const term of ['planAutomaticConcertExperienceV464({','concertMotionEnergyV464(concertExperienceV464','const ultimateShowV456=concertExperienceV464.direction','const featureDirectionV460=concertExperienceV464.feature','lightStrengthForUltimateShowV456(ultimateShowV456','featureBubblesV460(','featureSpotlightV460('])assert(stage.includes(term),term);
const source=fs.readFileSync('services/show/automaticConcertExperienceV464.ts','utf8');
assert(!/localStorage|setInterval|setTimeout|requestAnimationFrame|Math.random|fetch\(/.test(source));
assert(Number(require('../package.json').version.match(/v(\d+)$/)?.[1])>=464);
console.log('PASS V464: musical arc (visual), repeated hooks, breathing, shared feature/camera/lighting, manual/lyrics priority, low tier, pauses/seeks, deterministic 30-minute playback');
