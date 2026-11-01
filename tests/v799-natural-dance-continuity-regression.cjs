'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planNaturalDanceContinuityV799:plan}=load('components/visualizer/naturalDanceContinuityV799');
let checks=0;
function test(name,fn){try{fn();checks++}catch(e){e.message='V799 '+name+': '+e.message;throw e}}
const channels=['mixamorigSpine','mixamorigLeftArm','mixamorigRightArm','mixamorigLeftForeArm','mixamorigRightForeArm'];
const quat=angle=>[0,Math.sin(angle/2),0,Math.cos(angle/2)];
const track=(name,angles=[0,0,0,0],duration=4)=>({name:`${name}.quaternion`,
 times:new Float32Array([0,1,2,duration]), values:Float32Array.from(angles.flatMap(quat)),getValueSize:()=>4});
const clip=(angle=0,duration=4)=>({duration,tracks:channels.map((n,i)=>track(n,[angle,angle,angle,angle],duration))});
const neutral=clip(0),close=clip(.05),distant=clip(1.55);
const base={outgoing:neutral,incoming:distant,outgoingSeconds:2,incomingSeconds:2,
 baseSeconds:.32,bpm:102,plantedLeft:false,plantedRight:false,
 automatic:true,playing:true,reducedMotion:false,quality:'high'};
const run=(x={})=>plan({...base,...x});
test('actual arm and torso discontinuity extends fade',()=>{const r=run();assert(r.enabled);assert(r.fadeSeconds>.32);assert.equal(r.style,'body-pose');assert(r.comparedChannels>=3);assert(r.poseDiscontinuity>.4)});
test('small pose mismatch does not blur performance',()=>assert.deepEqual(run({incoming:close}).enabled,false));
test('same pose is untouched',()=>{const r=run({incoming:neutral});assert(!r.enabled);assert.equal(r.fadeSeconds,.32)});
test('right and left arm evidence is required',()=>{assert(!run({incoming:{...distant,tracks:distant.tracks.filter(t=>!t.name.includes('Right'))}}).enabled);assert(!run({incoming:{...distant,tracks:distant.tracks.filter(t=>!t.name.includes('Left'))}}).enabled)});
test('torso channel is required',()=>assert(!run({incoming:{...distant,tracks:distant.tracks.filter(t=>!t.name.includes('Spine'))}}).enabled));
test('no fabricated support for unfamiliar rigs',()=>assert(!run({incoming:{duration:4,tracks:[track('unknownBone',[0,1,2,3])]}}).enabled));
test('duplicate tracks do not inflate compared count',()=>{const a=run({incoming:{...distant,tracks:[...distant.tracks,...distant.tracks]}});assert.equal(a.comparedChannels,channels.length)});
test('GLB nested bone paths supported',()=>{const rename=c=>({...c,tracks:c.tracks.map(t=>({...t,name:'Armature/Hips/'+t.name}))});assert(run({outgoing:rename(neutral),incoming:rename(distant)}).enabled)});
test('quaternion negative sign is same pose',()=>{const inverse={...neutral,tracks:neutral.tracks.map(t=>({...t,values:Float32Array.from(t.values,x=>-x)}))};assert(!run({incoming:inverse}).enabled)});
test('velocity discontinuity detected with equal pose',()=>{
 // At t=2, both clips pass through exactly the same pose but arms move in opposite directions.
 const forward={duration:4,tracks:channels.map(n=>track(n,[0,.7,1.4,2.0]))};
 const backward={duration:4,tracks:channels.map(n=>track(n,[2.0,2.1,1.4,.2]))};
 const r=run({outgoing:forward,incoming:backward,outgoingSeconds:2,incomingSeconds:2});
 assert(r.motionDiscontinuity>.24,r.motionDiscontinuity);assert(r.enabled);assert.equal(r.style,'gesture-momentum');
});
test('entrance at zero cannot claim movement direction',()=>{const r=run({outgoingSeconds:0,incomingSeconds:0});assert.equal(r.motionDiscontinuity,0)});
test('planted left foot adds continuity without changing IK',()=>{const a=run(),b=run({plantedLeft:true});assert(b.fadeSeconds>=a.fadeSeconds);assert.equal(b.style,'grounded-gesture')});
test('planted right foot likewise',()=>{const a=run(),b=run({plantedRight:true});assert(b.fadeSeconds>=a.fadeSeconds);assert.equal(b.style,'grounded-gesture')});
test('both feet planted supported',()=>assert(run({plantedLeft:true,plantedRight:true}).fadeSeconds>=run().fadeSeconds));
for(const [name,patch] of Object.entries({manual:{automatic:false},paused:{playing:false},reduced:{reducedMotion:true},low:{quality:'low'},missingOut:{outgoing:null},missingIn:{incoming:null},missingOutTime:{outgoingSeconds:null},missingInTime:{incomingSeconds:NaN},infiniteTime:{incomingSeconds:Infinity},negativeFade:{baseSeconds:-1},invalidFade:{baseSeconds:NaN},tinyIn:{incoming:clip(1.5,.20)},tinyOut:{outgoing:clip(0,.20)},badOut:{outgoing:{...neutral,duration:NaN}},badIn:{incoming:{...distant,duration:Infinity}}}))
 test('fail closed: '+name,()=>assert(!run(patch).enabled));
test('small GLB clip duration bounds fade',()=>{const r=run({incoming:clip(1.5,.9),outgoing:clip(0,.9),baseSeconds:.22});assert(r.fadeSeconds<=.9*.42+.0001)});
test('high bpm bounds fade',()=>{const r=run({bpm:240,baseSeconds:.35});assert(r.fadeSeconds<=.7751)});
test('no shorten if the prior V630 transition is already longer',()=>{const r=run({bpm:240,baseSeconds:1.08});assert(!r.enabled);assert.equal(r.fadeSeconds,1.08)});
test('NaN BPM still finite',()=>assert(Number.isFinite(run({bpm:NaN}).fadeSeconds)));
test('malformed quaternion length fails closed',()=>{const bad={...distant,tracks:distant.tracks.map(t=>({...t,values:new Float32Array(4)}))};assert(!run({incoming:bad}).enabled)});
test('nonfinite quaternion samples fail closed',()=>{const bad={...distant,tracks:distant.tracks.map(t=>({...t,values:Float32Array.from(t.values,x=>x)}))};bad.tracks[0].values[9]=NaN;assert(!run({incoming:bad}).enabled)});
test('nonmonotonic/missing keyframe times fail closed',()=>{const bad={...distant,tracks:distant.tracks.map(t=>({...t,times:new Float32Array([0,1,NaN,4])}))};assert(!run({incoming:bad}).enabled)});
test('identity survives frozen input and no GLB writes',()=>{
 const before=Array.from(distant.tracks[0].values), frozen=Object.freeze({...base});run(frozen);
 assert.deepEqual(Array.from(distant.tracks[0].values),before);assert.equal(frozen.baseSeconds,.32);
});
test('effect sequence after V630 and before Three.js fadeIn',()=>{
 const s=fs.readFileSync('components/visualizer/useGltfClipTransitionsV492.ts','utf8');
 const a=s.indexOf('const naturalPerformanceV630='),b=s.indexOf('const continuityV799='),c=s.indexOf('nextAction.fadeIn(effectiveFadeDurationV311).play();');
 assert(a>=0&&a<b&&b<c);
 assert(s.includes('incomingSeconds:nextAction.time'));
 assert(s.includes('automatic:autoV565&&flowV614.enabled&&!manualSelectionV565'));
 assert(s.includes('if(continuityV799.enabled)effectiveFadeDurationV311=continuityV799.fadeSeconds;'));
 assert(!s.includes('nextAction.time=continuityV799'));
});
test('pure upper planner never changes mixer or IK',()=>{
 const s=fs.readFileSync('components/visualizer/naturalDanceContinuityV799.ts','utf8');
 assert(!/\buseFrame\s*\(|requestAnimationFrame\s*\(|setTimeout\s*\(|new AnimationMixer\s*\(|\.fade(In|Out)\s*\(|Math.random\s*\(|Date.now\s*\(/.test(s));
 assert(!s.includes('contact.plantedX='));
});
let snapshots=0;
for(let i=0;i<3000;i++){
 const arg={baseSeconds:.12+(i%60)/100,bpm:60+(i%180),plantedLeft:i%2===0,plantedRight:i%5===0,outgoingSeconds:(i%390)/100,incomingSeconds:((i*3)%390)/100};
 const r=run(arg);
 assert(Number.isFinite(r.fadeSeconds)&&r.fadeSeconds>=.08&&r.fadeSeconds<=1.5);
 assert.deepEqual(r,run(arg));snapshots++;
}
test('deterministic multi-song sampled transitions',()=>assert.equal(snapshots,3000));
console.log(`PASS V799: ${checks} regression groups and ${snapshots} deterministic sampled transitions`);
