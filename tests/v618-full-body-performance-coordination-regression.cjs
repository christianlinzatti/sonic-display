"use strict";
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {coordinateFullBodyPerformanceV618:plan}=load('components/visualizer/fullBodyPerformanceCoordinationV618');
const {applyBodyBoneAxisV582,releaseBodyBoneAxisV582}=load('components/visualizer/naturalDanceFacialCoordinationV582');
let groups=0;
const t=(name,fn)=>{try{fn();groups++;}catch(e){e.message=name+': '+e.message;throw e;}};
const body=Object.freeze({active:true,source:'verified-v581-word',chestPitch:-.005,chestRoll:.003,leftShoulderRoll:-.004,rightShoulderRoll:.004});
const face=Object.freeze({active:true,source:'verified-timed-word',wordStartMs:1000,headPitch:-.003,headYaw:.0015});
const both={known:true,leftPlanted:true,rightPlanted:true,leftConfidence:.92,rightConfidence:.91};
const input=Object.freeze({body,face,verifiedWordStartMs:1000,foot:both,playing:true,enabled:true,authoredMotion:false,reducedMotion:false,tier:'high',bodyStrength:80,energy:.7});
const run=(change={})=>plan({...input,...change});
const active=run();
t('confirmed singer word plus IK stance activates',()=>assert(active.active&&active.source==='verified-word-and-ik'));
t('supported chest follows verified head pitch',()=>assert(active.body.chestPitch<body.chestPitch));
t('supported clavicles oppose head yaw',()=>assert(active.body.leftShoulderRoll<body.leftShoulderRoll&&active.body.rightShoulderRoll>body.rightShoulderRoll));
t('opposite arms support planted stance',()=>assert(active.leftArmPitch>0&&active.rightArmPitch>0));
t('body source and provenance are preserved',()=>assert.equal(active.body.source,'verified-v581-word'));
t('never mutates incoming face or body',()=>{assert(Object.isFrozen(face)&&Object.isFrozen(body));assert.equal(body.chestPitch,-.005);assert.equal(face.headPitch,-.003);});
t('input and output deterministic across repeated timestamps',()=>{for(let i=0;i<400;i++)assert.deepEqual(run(),active);});
t('single left plant favors right arm',()=>{const p=run({foot:{known:true,leftPlanted:true,rightPlanted:false,leftConfidence:.9,rightConfidence:0}});assert(p.active&&p.rightArmPitch>p.leftArmPitch&&p.leftArmPitch<active.leftArmPitch);});
t('single right plant favors left arm',()=>{const p=run({foot:{known:true,leftPlanted:false,rightPlanted:true,leftConfidence:0,rightConfidence:.91}});assert(p.active&&p.leftArmPitch>p.rightArmPitch&&p.rightArmPitch<active.rightArmPitch);});
t('one planted foot receives softer chest motion',()=>{const x=run({foot:{known:true,leftPlanted:true,rightPlanted:false,leftConfidence:.9,rightConfidence:0}});assert(Math.abs(x.body.chestPitch-body.chestPitch)<Math.abs(active.body.chestPitch-body.chestPitch));});
t('balanced profile softens instead of disabling',()=>{const x=run({tier:'balanced'});assert(x.active);assert(Math.abs(x.body.chestPitch-body.chestPitch)<Math.abs(active.body.chestPitch-body.chestPitch));});
t('lower positive strength softens',()=>{const x=run({bodyStrength:30});assert(x.active&&x.rightArmPitch<active.rightArmPitch);});
t('audio energy scales, does not produce any new word cue',()=>{const x=run({energy:0});assert(x.active&&x.rightArmPitch<active.rightArmPitch);});
t('head yaw direction is never invented',()=>{const x=run({face:{...face,headYaw:0}});assert(x.active);assert.equal(x.body.chestRoll,body.chestRoll);assert.equal(x.body.leftShoulderRoll,body.leftShoulderRoll);assert.equal(x.body.rightShoulderRoll,body.rightShoulderRoll);});
t('head pitch direction is preserved',()=>{const x=run({face:{...face,headPitch:.003}});assert(x.active&&x.body.chestPitch>body.chestPitch);});
t('zero head cue cannot produce a body overlay',()=>{const x=run({face:{...face,headPitch:0,headYaw:0}});assert(!x.active&&x.body===body);});
const gates=[
 ['pause',{playing:false}],['disabled',{enabled:false}],['authored priority',{authoredMotion:true}],['reduced motion',{reducedMotion:true}],['low tier',{tier:'low'}],
 ['no V582 body',{body:{...body,active:false}}],['unverified V582 provenance',{body:{...body,source:'none'}}],
 ['no facial cue',{face:{...face,active:false}}],['fake face source',{face:{...face,source:'none'}}],
 ['face belongs to previous word',{face:{...face,wordStartMs:999}}],['invalid V581 time',{verifiedWordStartMs:-1}],
 ['unknown IK',{foot:{...both,known:false}}],['unplanted feet',{foot:{...both,leftPlanted:false,rightPlanted:false}}],
 ['weak left foot',{foot:{...both,leftPlanted:true,rightPlanted:false,leftConfidence:.44}}],
 ['weak right foot',{foot:{...both,leftPlanted:false,rightPlanted:true,rightConfidence:.44}}],
 ['NaN foot contact',{foot:{...both,leftConfidence:NaN}}],['out of bounds right foot',{foot:{...both,rightConfidence:2}}],
 ['bad face pitch',{face:{...face,headPitch:NaN}}],['unrealistic head pitch',{face:{...face,headPitch:.08}}],
 ['unrealistic head yaw',{face:{...face,headYaw:1}}],
 ['invalid chest pitch',{body:{...body,chestPitch:NaN}}],
 ['zero strength',{bodyStrength:0}],['negative strength',{bodyStrength:-1}],['NaN strength',{bodyStrength:NaN}],
 ['negative energy',{energy:-.1}],['NaN energy',{energy:NaN}],['too high energy',{energy:1.5}]
];
for(const [name,change] of gates)t('safety gate '+name,()=>{const p=run(change);assert.equal(p.active,false);assert.strictEqual(p.body,change.body||body);assert.equal(p.leftArmPitch,0);assert.equal(p.rightArmPitch,0);});
t('IK cannot be faked via unplanted secondary side',()=>{const x=run({foot:{known:true,leftPlanted:true,rightPlanted:false,leftConfidence:.40,rightConfidence:1}});assert(!x.active);});
t('all additions stay below fixed anatomical caps',()=>{
 let count=0;
 for(let i=0;i<16000;i++){
   const x=run({face:{...face,headPitch:(i%201-100)*.00004,headYaw:(i%99-49)*.00004},
     foot:i%3===0?both:i%3===1?{...both,rightPlanted:false,rightConfidence:0}:{...both,leftPlanted:false,leftConfidence:0},bodyStrength:i%101,energy:i%101/100});
   for(const n of [x.body.chestPitch,x.body.chestRoll,x.body.leftShoulderRoll,x.body.rightShoulderRoll,x.leftArmPitch,x.rightArmPitch])assert(Number.isFinite(n));
   assert(Math.abs(x.body.chestPitch)<=.01201&&Math.abs(x.body.chestRoll)<=.00701);
   assert(Math.abs(x.body.leftShoulderRoll)<=.00901&&Math.abs(x.body.rightShoulderRoll)<=.00901);
   assert(x.leftArmPitch>=0&&x.leftArmPitch<=.00351&&x.rightArmPitch>=0&&x.rightArmPitch<=.00351);
   count++;
 }
 assert.equal(count,16000);
});
t('existing additive bone helpers preserve mixer keyframes',()=>{
 const binding={bone:{rotation:{x:.27,y:0,z:0}},axis:'x',last:0,rendered:0};
 applyBodyBoneAxisV582(binding,active.leftArmPitch);
 applyBodyBoneAxisV582(binding,active.leftArmPitch);
 assert(Math.abs(binding.bone.rotation.x-(.27+active.leftArmPitch))<1e-10);
 binding.bone.rotation.x=.7;applyBodyBoneAxisV582(binding,0);
 assert.equal(binding.bone.rotation.x,.7);
 releaseBodyBoneAxisV582(binding);assert.equal(binding.bone.rotation.x,.7);
});
const rig=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');
const glb=fs.readFileSync('components/visualizer/GltfDancerAvatarV492.tsx','utf8');
const planner=fs.readFileSync('components/visualizer/fullBodyPerformanceCoordinationV618.ts','utf8');
t('live GLB avatar passes real foot IK ref',()=>assert(glb.includes('footIKV618={footIK} footIKEnabledV618={avatarFootIKEnabled}')));
t('GLB facial rig uses V582/V617 then V618',()=>{assert(rig.includes('coordinateFullBodyPerformanceV618({'));assert(rig.indexOf('const facialRealismV617=')<rig.indexOf('const coordinatedBodyV618='));assert(rig.indexOf('const bodyFaceCueV582=')<rig.indexOf('const coordinatedBodyV618='));});
t('validates identical confirmed word start',()=>assert(rig.includes('verifiedWordStartMs:coherentCueV581.wordStartMs')));
t('reads previous frame foot phase and confidence',()=>{assert(rig.includes("leftPlanted:leftIKV618?.contact.phase==='planted'"));assert(rig.includes('rightConfidence:rightIKV618?.contact.confidence??0'));});
t('author priority and reduced motion remain',()=>{assert(rig.includes('authoredMotion:authoredPriorityV499||optionsV538.manualPriority'));assert(rig.includes('reducedMotion:optionsV538.reducedMotion'));});
t('arm overlays released on teardown',()=>assert(rig.includes('for(const armAxis of upperArmBonesV618)releaseBodyBoneAxisV582(armAxis)')));
t('single existing render loop preserved',()=>assert.equal((rig.match(/useFrame\(/g)||[]).length,1));
t('no hip/foot IK root mutation, no timers, no synthetic audio',()=>{
 for(const bad of ['rotation.x=', 'rotation.y=', 'rotation.z=', 'useFrame(', 'setInterval(', 'requestAnimationFrame(', 'fetch(', 'Math.random(', 'Date.now(', 'new AnimationMixer'])assert(!planner.includes(bad),bad);
});
console.log(`PASS V618: ${groups} regression groups, 16,000 bounded torso/arm samples, real IK wiring`);
