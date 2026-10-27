'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planNaturalDanceFacialCoordinationV582:plan,
 NATURAL_DANCE_FACE_OFF_V582:OFF,applyBodyBoneAxisV582:apply,releaseBodyBoneAxisV582:release}=load('components/visualizer/naturalDanceFacialCoordinationV582');
const {planCoherentRapFaceV581:facePlan}=load('components/visualizer/coherentRapFacialPerformanceV581');
const {planRapMouthDynamicsV572:cadence}=load('components/visualizer/rapMouthDynamicsV572');
const {planVerifiedEyeContactV574:eye}=load('components/visualizer/verifiedEyeContactV574');
let count=0;const t=(name,fn)=>{try{fn();count++;}catch(err){err.message=`${name}: ${err.message}`;throw err;}};
const words=[{text:'Bam',startMs:1000,endMs:1250},{text:'macht',startMs:1270,endMs:1500},{text:'Druck',startMs:1520,endMs:1780}];
const lyrics={synced:true,lines:[{text:'Bam macht Druck',startMs:900,endMs:1900,words}]};
const rapInput={lyrics,effectiveTimeMs:1130,activeWord:'Bam',playing:true,enabled:true,rap:true,
 verifiedWord:true,reducedMotion:false,roleAllowed:true,manualSilent:false,
 manualPriority:false,preserveAudioMouth:false,intensity:88};
const scene={active:true,trackId:'song-v582',cueStartMs:1000,cueEndMs:2000,count:2,focus:'handoff',
 leadSlot:0,singingSlots:[0],handoffFrom:1,strength:1,lyricMotionGain:1,readingBoost:1,plateBoost:0};
const gaze=eye({scene,trackId:'song-v582',slot:0,timeMs:1130,playing:true,reducedMotion:false,
 manualPriority:false,enabled:true,tier:'high'});
const faceCue=facePlan({...rapInput,cadence:cadence(rapInput),eye:gaze,tier:'high',castVerified:true});
const base={faceCue,effectiveTimeMs:1130,playing:true,bodyEnabled:true,authoredMotion:false,
 reducedMotion:false,performanceTier:'high',bodyStrength:70,energy:.75,avatarSlot:0};
const active=plan(base);
t('real V581 verified word feeds V582',()=>assert.equal(faceCue.active,true));
t('chest follows facial rhythm',()=>assert(active.active&&active.chestPitch<0));
t('source accurately describes evidence',()=>assert.equal(active.source,'verified-v581-word'));
t('chest pitch maximum below 0.01 rad',()=>assert(Math.abs(active.chestPitch)<=.009));
t('chest roll maximum below 0.005 rad',()=>assert(Math.abs(active.chestRoll)<=.005));
t('shoulders maximum below 0.007 rad',()=>assert(Math.abs(active.leftShoulderRoll)<=.007 && Math.abs(active.rightShoulderRoll)<=.007));
t('counter-balanced shoulder rotation',()=>assert(Math.abs(active.leftShoulderRoll+active.rightShoulderRoll)<1e-12));
t('chest axis separate from leg/foot channels',()=>assert.deepEqual(Object.keys(active).sort(),['active','chestPitch','chestRoll','leftShoulderRoll','rightShoulderRoll','source'].sort()));
t('does not mutate V581 cue',()=>assert.deepEqual(faceCue,facePlan({...rapInput,cadence:cadence(rapInput),eye:gaze,tier:'high',castVerified:true})));
t('body gain scales monotonically',()=>assert(Math.abs(plan({...base,bodyStrength:40}).chestPitch)<Math.abs(active.chestPitch)));
t('performance energy only scales, not drives absent word',()=>assert(Math.abs(plan({...base,energy:0}).chestPitch)<Math.abs(active.chestPitch)));
t('balanced lower than high',()=>assert(Math.abs(plan({...base,performanceTier:'balanced'}).chestPitch)<Math.abs(active.chestPitch)));
t('stable deterministic same cues',()=>assert.deepEqual(plan(base),active));
t('slot changes stance without changing evidence',()=>{
 const other=plan({...base,avatarSlot:1});assert.equal(other.chestRoll,-active.chestRoll);assert.equal(other.chestPitch,active.chestPitch);
});
for(const [name,value] of [
 ['paused',{playing:false}],['body disabled',{bodyEnabled:false}],['manually authored dance',{authoredMotion:true}],
 ['reduce motion',{reducedMotion:true}],['low tier',{performanceTier:'low'}],
 ['zero strength',{bodyStrength:0}],['negative strength',{bodyStrength:-5}],
 ['NaN strength',{bodyStrength:NaN}],['NaN energy',{energy:NaN}],['infinite energy',{energy:Infinity}],
 ['NaN clock',{effectiveTimeMs:NaN}],['before word',{effectiveTimeMs:999}],
 ['expired word',{effectiveTimeMs:1521}],['negative slot',{avatarSlot:-1}],
 ['slot outside ensemble',{avatarSlot:4}],['fractional slot',{avatarSlot:.5}],
 ['no face evidence',{faceCue:facePlan({...rapInput,playing:false,cadence:cadence(rapInput),eye:gaze,tier:'high',castVerified:true})}],
 ['invalid source',{faceCue:{...faceCue,source:'none'}}],['invalid face timestamp',{faceCue:{...faceCue,wordStartMs:-1}}],
 ['invalid head pitch',{faceCue:{...faceCue,headPitch:NaN}}],
 ['head pitch reverse',{faceCue:{...faceCue,headPitch:.2}}],
 ['head pitch out of range',{faceCue:{...faceCue,headPitch:-.5}}],
 ['invalid attack rate',{faceCue:{...faceCue,jawAttackRate:NaN}}],
 ['attack not yet started',{faceCue:{...faceCue,jawAttackRate:1}}],
 ['out of range attack',{faceCue:{...faceCue,jawAttackRate:7}}],
])t(`hard gate: ${name}`,()=>assert.strictEqual(plan({...base,...value}),OFF));
t('no tongue/phoneme manipulation',()=>assert.equal(active.mouth,undefined));
t('no fabricated eye movement',()=>assert.equal(active.eye,undefined));
t('inactive constant is immutable',()=>assert(Object.isFrozen(OFF)));
const bone=(x=0,z=0)=>({rotation:{x,y:0,z}});
const tracker=(axis='x',start=.2)=>({bone:bone(start,start),axis,last:0,rendered:0});
t('null binding supported',()=>{apply(null,.01);release(null);});
t('additive bone pitch and removal',()=>{const b=tracker();apply(b,-.006);assert(Math.abs(b.bone.rotation.x-.194)<1e-10);release(b);assert(Math.abs(b.bone.rotation.x-.2)<1e-10);});
t('same word never drifts a bone',()=>{const b=tracker();for(let i=0;i<800;i++)apply(b,-.006);assert(Math.abs(b.bone.rotation.x-.194)<1e-10);release(b);assert(Math.abs(b.bone.rotation.x-.2)<1e-10);});
t('new word gently changes overlay',()=>{const b=tracker();apply(b,-.006);apply(b,-.004);assert(Math.abs(b.bone.rotation.x-.196)<1e-10);release(b);assert(Math.abs(b.bone.rotation.x-.2)<1e-10);});
t('pause releases overlay',()=>{const b=tracker();apply(b,-.004);apply(b,0);assert(Math.abs(b.bone.rotation.x-.2)<1e-10);release(b);});
t('renderer authored mixer can write a new chest keyframe',()=>{const b=tracker();apply(b,-.004);b.bone.rotation.x=.4;apply(b,-.003);assert(Math.abs(b.bone.rotation.x-.397)<1e-10);});
t('renderer authored mixer resets rotation on disposal',()=>{const b=tracker();apply(b,-.004);b.bone.rotation.x=.4;release(b);assert.equal(b.bone.rotation.x,.4);});
t('independent shoulder axes',()=>{const l=tracker('z');const r=tracker('z');apply(l,active.leftShoulderRoll);apply(r,active.rightShoulderRoll);assert.equal(l.bone.rotation.x,.2);assert.equal(r.bone.rotation.x,.2);release(l);release(r);assert(Math.abs(l.bone.rotation.z-.2)<1e-12);assert(Math.abs(r.bone.rotation.z-.2)<1e-12);});
t('no rotation is left after disabling performer',()=>{const b=tracker();apply(b,active.chestPitch);apply(b,plan({...base,playing:false}).chestPitch);assert(Math.abs(b.bone.rotation.x-.2)<1e-10);});
t('one missing bone does not alter other axes',()=>{const b=tracker();apply(null,active.chestPitch);apply(b,active.chestRoll);assert(Math.abs(b.bone.rotation.x-(.2+active.chestRoll))<1e-10);release(b);});
const source=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const rig=source('components/visualizer/VocalRigV368.tsx');
const planner=source('components/visualizer/naturalDanceFacialCoordinationV582.ts');
t('V582 is used in actual GLB renderer',()=>assert.match(rig,/planNaturalDanceFacialCoordinationV582\(/));
t('V582 uses the exact current V581 face cue',()=>assert.match(rig,/faceCue:coherentCueV581/));
t('V582 follows current word clock',()=>assert.match(rig,/effectiveTimeMs:optionsV538.effectiveTimeMs/));
t('V582 uses explicit dance priority',()=>assert.match(rig,/authoredMotion:authoredPriorityV499\|\|optionsV538.manualPriority/));
t('V582 uses built-in dancer enable',()=>assert.match(rig,/bodyEnabled:lipSync\?\.bodyEnabledV371!==false/));
t('V582 respects existing performance tier',()=>assert.match(rig,/performanceTier:getActivePerformanceTier\(\)/));
t('V582 uses real bone checks',()=>assert.match(rig,/node.type!=='Bone'/));
t('V582 additive overlays are restored when rig unmounts',()=>assert.match(rig,/releaseBodyBoneAxisV582\(boneAxis\)/));
t('V582 does not touch pelvis, hip, feet or legs',()=>assert.doesNotMatch(planner,/rotation\.[xyz]\s*[+\-]?=/));
t('V582 does not add a new frame loop',()=>assert.doesNotMatch(planner,/useFrame\(|requestAnimationFrame\(|setInterval\(|fetch\(/));
t('V582 has no synthetic phoneme markers',()=>assert.doesNotMatch(planner,/phonemeRecognizer|transcribeAudio|speechToText/));
t('old V581 and V574 paths remain',()=>{assert.match(rig,/planCoherentRapFaceV581/);assert.match(rig,/planVerifiedEyeContactV574/);});
console.log(`PASS V582: ${count} deterministic gesture/facial, bone-overlay, ownership and wiring tests. No real GLB/Pi visual sign-off claimed.`);

