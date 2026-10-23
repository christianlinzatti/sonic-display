'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {buildSmartRapShowV446,sampleSmartRapShowV446}=load('components/visualizer/smartAutomaticRapShowV446');
const {planIntelligentFeatureV460:plan,featureMotionForSlotV460:motion,
 featureBubblesV460:bubbles,featureSpotlightV460:spotlight,featureInteractionV460:interaction}=load('components/visualizer/intelligentFeaturePerformanceV460');
const lyrics={synced:true,lines:Array.from({length:12},(_,i)=>({startMs:i*3000,text:i===4||i===8?'Dies ist der gleiche Refrain in der Nacht':i===5||i===9?'Und wir tanzen alle diese ganze Nacht':`Verse mit Nummer ${i} und Rhythmus`}))};
const p=buildSmartRapShowV446({trackId:'feature-track',count:4,lyrics,durationMs:50000,enabled:true});
assert.equal(p.source,'synced-lyrics');
const get=(ms,count=4,override={})=>plan({plan:p,cue:sampleSmartRapShowV446(p,ms,{enabled:true,playing:true,reducedMotion:false,manualProtected:false}),
 progressMs:ms,count,enabled:true,playing:true,reducedMotion:false,manualProtected:false,...override});
assert.equal(get(300).active,true);
assert.equal(get(3500).moment,'solo');
const response=get(10200);
assert.equal(response.moment,'reply');
assert(response.responseGain>0);
assert.equal(response.partner,(response.lead+1)%4);
assert.equal(response.cameraCue.group,true);
assert.equal(motion(response,response.partner,'break'),'reply');
assert.equal(motion(response,response.lead,'break'),'verse');
assert.equal(motion(response,(response.partner+1)%4,'hook'),'break');
assert.equal(get(6500).moment,'solo');
assert.equal(get(12500).moment,'hook');
assert.equal(get(12500).cameraCue.group,true);
assert.equal(get(28000).moment,'hook');
for(const ms of [0,3500,6500,10200,12500,23000,28000,36000,49000])assert.deepEqual(get(ms),get(ms));
const bb={enabled:true,source:'spotify-credits',mode:'focus',style:'comic',activeSlot:response.lead,
 bubbles:Array.from({length:4},(_,i)=>({slot:i,name:`Artist ${i}`,displayName:`Artist ${i}`,visible:true,emphasized:i===response.lead}))};
const changed=bubbles(bb,response);assert.equal(changed.activeSlot,null);
assert.deepEqual(changed.bubbles.filter(x=>x.emphasized).map(x=>x.slot),[response.lead,response.partner]);
assert.deepEqual(bb,bubbles(bb,{...response,moment:'off'}));
assert.equal(bubbles({...bb,source:'manual-stage'},response).source,'manual-stage');
assert.equal(bubbles({...bb,mode:'always'},response).activeSlot,bb.activeSlot);
const spot={enabled:true,cueId:'auto',group:false,focus:response.lead,strength:70,showEntry:false,
 slots:Array.from({length:4},(_,i)=>({slot:i,offsetZ:i===response.lead?-.1:0,turnY:0,attention:i===response.lead?1:.35}))};
const sp=spotlight(spot,response);assert(sp.slots[response.partner].attention>=.76);assert.notDeepEqual(sp,spot);
const si={enabled:true,source:'visual-stage',group:false,lead:response.lead,reply:null,
 slots:Array.from({length:4},(_,i)=>({slot:i,role:i===response.lead?'lead':'listener',
 look:{yaw:0,pitch:0,eyeYaw:0,weight:0},gesture:{leftLift:0,rightLift:0,shoulder:0,lean:0,intensity:0}}))};
assert(interaction(si,response).slots[response.partner].gesture.rightLift>0);
assert.deepEqual(interaction({...si,source:'manual-vocal'},response),{...si,source:'manual-vocal'});
for(const opts of [{enabled:false},{playing:false},{reducedMotion:true},{manualProtected:true},{progressMs:NaN},{progressMs:-3},{count:1}]){
 const result=get(10200,4,opts);assert.equal(result.active,false);assert.equal(result.cameraCue,null);
}
const noLyrics=buildSmartRapShowV446({trackId:'feature-track',count:2,lyrics:null,durationMs:30000,enabled:true});
const noCue=sampleSmartRapShowV446(noLyrics,13000,{enabled:true,playing:true,reducedMotion:false,manualProtected:false});
const fallback=plan({plan:noLyrics,cue:noCue,progressMs:13000,count:2,enabled:true,playing:true,reducedMotion:false,manualProtected:false});
assert(fallback.active);assert.notEqual(fallback.moment,'reply','no fabricated voice exchanges when word timing missing');
for(let t=0;t<1800000;t+=197){const ms=t%49000;const result=get(ms);assert(Number.isFinite(result.responseGain));assert(result.responseGain>=0&&result.responseGain<=1);
 if(result.active)assert(result.lead>=0&&result.lead<4&&result.partner>=0&&result.partner<4);}
const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
require('./helpers/concert-camera-contract-v4737.cjs').assertConcertCameraCueContract(stage);
const avatar=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
const registry=fs.readFileSync('components/visualizer/registry.tsx','utf8');
for(const name of ['planIntelligentFeatureV460','featureMotionForSlotV460','featureBubblesV460','featureSpotlightV460','featureDirectionV460={featureDirectionV460}'])assert(stage.includes(name),name);
assert(avatar.includes('featureInteractionV460(interactionBaseV444'));
assert(registry.includes('featureDirectionV460?:'));
assert(avatar.includes('featureSpotlightV460(planArtistSpotlightV443'));
assert(stage.includes('continuityV457.quality==="low"?.36:.68'));
assert(stage.includes('manualProtected:preferences.avatarManualVocalEnabledV385===true'));
assert(stage.includes('preferences.rapCameraKeyframesEnabledV432')); 
assert(!fs.readFileSync('components/visualizer/intelligentFeaturePerformanceV460.ts','utf8').includes('localStorage'));
assert(Number(require('../package.json').version.match(/v(\d+)$/)?.[1])>=460);
console.log('PASS V460: deterministic scene phrases; dual focus; camera, badges, automatic gestures; authored overrides; pause/reduced motion; seek-safe 30-minute simulation');
