"use strict";
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v=load('components/visualizer/expressiveDeutschrapPerformanceV663');
const original={
 trackId:'rap-demo-track',avatarSlot:0,timeMs:1250,playing:true,rap:true,mode:'stage',
 reducedMotion:false,authoredPriority:false,tier:'high',section:'verse',strength:80,energy:.85,
 word:{active:true,source:'verified-timed-word',wordStartMs:1000,headPitch:-.015,jawAttackRate:1.09},
 phrase:{active:true,source:'verified-word',motif:'emphasis'},
 eye:{mode:'partner',yaw:.04,pitch:0,weight:.8},
 body:{active:true,source:'verified-v581-word',leftShoulderRoll:-.004,rightShoulderRoll:.004},
 supported:{active:true,source:'verified-word-and-ik',leftArmPitch:.002,rightArmPitch:.002},
};
const plan=(patch={})=>v.planDeutschrapPerformanceV663({...original,...patch});
let checks=0;
function check(name,callback){try{callback();checks++;}catch(e){e.message='V663 '+name+': '+e.message;throw e;}}
const off=v.DEUTSCHRAP_PERFORMANCE_OFF_V663;
check('opt-in disabled by default',()=>{v.clearDeutschrapPerformanceModeV663();assert.equal(v.getDeutschrapPerformanceModeV663('rap-demo-track'),'off');assert.deepEqual(plan({mode:'off'}),off);});
check('explicit opt-in only for current track',()=>{assert(v.setDeutschrapPerformanceModeV663('rap-demo-track','stage'));assert.equal(v.getDeutschrapPerformanceModeV663('rap-demo-track'),'stage');assert.equal(v.getDeutschrapPerformanceModeV663('another-track'),'off');});
check('reject malformed mode and track id',()=>{for(const mode of ['auto','guess',null,'stage '])assert.equal(v.setDeutschrapPerformanceModeV663('rap-demo-track',mode),false);assert.equal(v.setDeutschrapPerformanceModeV663('','stage'),false);assert.equal(v.setDeutschrapPerformanceModeV663('x'.repeat(260),'stage'),false);});
check('disable explicitly',()=>{assert(v.setDeutschrapPerformanceModeV663('rap-demo-track','off'));assert.equal(v.getDeutschrapPerformanceModeV663('rap-demo-track'),'off');});
check('baseline expressive and bounded',()=>{const c=plan();assert(c.active);assert.equal(c.source,'verified-word');assert(c.headPitch<0);assert(c.headPitch>=-.0042);assert(c.leftShoulderRoll<0);assert(c.rightShoulderRoll>0);assert(c.leftArmPitch>0);assert(c.eyeYaw>0);});
check('subtle less intense than stage',()=>{const a=plan({mode:'subtle'}),b=plan();assert(Math.abs(a.headPitch)<Math.abs(b.headPitch));assert(a.leftArmPitch<b.leftArmPitch);});
check('hook stronger than verse',()=>{const a=plan(),b=plan({section:'hook'});assert.equal(b.section,'hook');assert(Math.abs(b.headPitch)>Math.abs(a.headPitch));});
check('chorus/drop same category as hook',()=>{for(const section of ['chorus','drop'])assert.equal(plan({section}).section,'hook');});
check('silent word and false singer cast forbidden',()=>{assert.deepEqual(plan({word:{...original.word,active:false}}),off);assert.deepEqual(plan({phrase:{...original.phrase,active:false}}),off);});
check('source must be verified',()=>{assert.deepEqual(plan({word:{...original.word,source:'none'}}),off);assert.deepEqual(plan({phrase:{...original.phrase,source:'none'}}),off);});
check('never synthesize gestures for missing word interval',()=>{for(const timeMs of [-1,999,1520,4000,NaN,Infinity])assert.deepEqual(plan({timeMs}),off);});
check('paused and non-rap skipped',()=>{assert.deepEqual(plan({playing:false}),off);assert.deepEqual(plan({rap:false}),off);});
check('manual motion, reduced motion and low tier respected',()=>{for(const patch of [{authoredPriority:true},{reducedMotion:true},{tier:'low'}])assert.deepEqual(plan(patch),off);});
check('invalid energy/strength rejected',()=>{for(const energy of [-1,2,NaN,Infinity])assert.deepEqual(plan({energy}),off);for(const strength of [-1,0,101,NaN])assert.deepEqual(plan({strength}),off);});
check('invalid slot, track or malformed word rejected',()=>{for(const avatarSlot of [-1,4,NaN,1.5])assert.deepEqual(plan({avatarSlot}),off);assert.deepEqual(plan({trackId:''}),off);assert.deepEqual(plan({word:{...original.word,headPitch:Infinity}}),off);});
check('no author eye means no new gaze',()=>{const c=plan({eye:{mode:'off',yaw:0,pitch:0,weight:0}});assert(c.active);assert.equal(c.eyeYaw,0);assert(Math.abs(c.eyePitch)<1e-12);assert(Math.abs(c.headYaw)<1e-12);});
check('bad authored gaze does not enter output',()=>{for(const weight of [-1,NaN,Infinity,2]){const c=plan({eye:{...original.eye,weight}});assert.equal(c.eyeYaw,0);assert.equal(c.headYaw,0);}});
check('without V618 no guessed arm movement',()=>{const c=plan({supported:{...original.supported,active:false}});assert(c.active);assert.equal(c.leftArmPitch,0);assert.equal(c.rightArmPitch,0);});
check('without V582 no new shoulder movement',()=>{const c=plan({body:{...original.body,active:false}});assert(c.active);assert.equal(c.leftShoulderRoll,0);assert.equal(c.rightShoulderRoll,0);});
check('invalid foot support never leaks into arm',()=>{const c=plan({supported:{...original.supported,leftArmPitch:NaN}});assert.equal(c.leftArmPitch,0);assert.equal(c.rightArmPitch,0);});
check('artist motif stable and varied',()=>{const values=new Set(['address','emphasis','exchange','settle'].map(motif=>plan({phrase:{...original.phrase,motif}}).leftArmPitch));assert(values.size>1);assert.deepEqual(plan({phrase:{...original.phrase,motif:'invented'}}),off);});
check('no mouth or locomotion ownership',()=>{const keys=Object.keys(plan());for(const key of ['jaw','lipsClosed','round','wide','hip','foot','root','animation'])assert(!keys.includes(key));});
check('existing GLB rig adds rather than overwrites keyframes',()=>{const s=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');assert(s.includes('planDeutschrapPerformanceV663({'));assert(s.includes('getDeutschrapPerformanceModeV663(trackId)'));assert(s.includes('supportedBodyV618.leftShoulderRoll+expressionV663.leftShoulderRoll'));assert(s.includes('artistCueV645.headPitch+expressionV663.headPitch'));assert(s.includes('artistCueV645.eyeYaw+expressionV663.eyeYaw'));assert(s.includes('coordinatedBodyV618.leftArmPitch+artistCueV645.leftArmPitch+expressionV663.leftArmPitch'));assert(s.includes('additiveBoneAxisV581('));});
check('UI opt-in and track reset',()=>{const s=fs.readFileSync('components/visualizer/PhonemeTimelineLabV644.tsx','utf8');assert(s.includes('V663 · Expressive Deutschrap Performance'));assert(s.includes('clearDeutschrapPerformanceModeV663()'));assert(s.includes('setDeutschrapPerformanceModeV663(id,mode)'));assert(s.includes('Natürlich · ruhige Rap-Gesten'));assert(s.includes('Live-Bühne · deutlichere Hooks'));});
check('no second renderer, network or persistence',()=>{const s=fs.readFileSync('components/visualizer/expressiveDeutschrapPerformanceV663.ts','utf8');assert(!/useFrame\(|useEffect\(|setInterval\(|fetch\(|localStorage\.|AudioContext\(|getUserMedia\(/.test(s));});
check('settings shell clears profile even while closed',()=>{v.setDeutschrapPerformanceModeV663('rap-demo-track','stage');v.clearDeutschrapPerformanceOnTrackChangeV663('rap-demo-track');assert.equal(v.getDeutschrapPerformanceModeV663('rap-demo-track'),'stage');v.clearDeutschrapPerformanceOnTrackChangeV663('another');assert.equal(v.getDeutschrapPerformanceModeV663('rap-demo-track'),'off');const shell=fs.readFileSync('components/SmartLazySettings.tsx','utf8');assert(shell.includes('clearDeutschrapPerformanceOnTrackChangeV663(trackId)'));});
check('clearing leaves no song profile behind',()=>{v.setDeutschrapPerformanceModeV663('rap-demo-track','subtle');v.clearDeutschrapPerformanceModeV663();assert.equal(v.getDeutschrapPerformanceModeV663('rap-demo-track'),'off');});
// Stress tests reproduce song seeks, dense rap words, profiles and multi-slot scenes.
let samples=0;
for(let i=0;i<18000;i++){
 const wordStartMs=Math.floor(i/9)*450;
 const timeMs=wordStartMs+(i%9)*65;
 const c=plan({timeMs,avatarSlot:i%4,section:i%5===0?'hook':'verse',
  mode:i%2===0?'stage':'subtle',word:{...original.word,wordStartMs}});
 for(const [key,value] of Object.entries(c))if(typeof value==='number')assert(Number.isFinite(value),key);
 assert(Math.abs(c.headPitch)<=.0042+1e-9);assert(Math.abs(c.headYaw)<=.0035+1e-9);
 assert(Math.abs(c.leftShoulderRoll)<=.0038+1e-9);assert(Math.abs(c.rightShoulderRoll)<=.0038+1e-9);
 assert(c.leftArmPitch<=.0016+1e-9&&c.rightArmPitch<=.0016+1e-9);
 samples++;
}
console.log(`PASS V663: ${checks} regression groups, ${samples} word/slot samples`);
