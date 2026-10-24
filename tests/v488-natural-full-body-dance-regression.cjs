require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planNaturalFullBodyV488:plan,neutralFullBodyPoseV488:neutral}=load('components/visualizer/naturalFullBodyDanceV488');
const footwork={offsetX:.09,offsetZ:-.12,liftLeft:.7,liftRight:0,rootSpeed:.7,weightShift:.011};
const base={trackId:'track-a',seconds:2.25,slot:0,lowDepth:0,footwork,beat:.75,kick:.8,energy:.8,genre:'Deutschrap',playing:true,reducedMotion:false,manualPriority:false,automaticGroup:true,tier:'high'};
const result=plan(base);
assert(result.active,'automatic group sidestep yields a body gesture');
assert(result.leftKneeExtra>0 && result.rightKneeExtra===0,'only actual lifted swing leg gets extra knee motion');
assert(result.leftArmSwing!==result.rightArmSwing,'arms counter-swing with alternating feet');
assert.equal(result.torsoPitch>0,true,'bending accompanies stepping');
assert.deepEqual(plan(base),result,'stable result for same audio/songtime regardless of render clock');
const right=plan({...base,footwork:{...footwork,liftLeft:0,liftRight:.7}});
assert.equal(right.leftKneeExtra,0);
assert(right.rightKneeExtra>0);
assert(Math.sign(right.hipShiftX)===-Math.sign(result.hipShiftX),'weight changes sides with foot swing');
const squat=plan({...base,lowDepth:.22,footwork:{...footwork,liftLeft:0,liftRight:0}});
assert(squat.active,'low pose retains a restrained expressive overlay');
assert.equal(squat.leftKneeExtra,0);
assert.equal(squat.rightKneeExtra,0);
assert(squat.torsoPitch>result.torsoPitch,'crouch receives coherent forward chest compensation');
assert(Math.abs(squat.hipShiftX)<=.016&&Math.abs(squat.torsoRoll)<=.02);
const drop=plan({...base,genre:'Hardstyle',lowDepth:.18,footwork:{...footwork,liftLeft:0,liftRight:0},kick:1,beat:1});
assert(drop.active && drop.leftKneeExtra===0 && drop.rightKneeExtra===0,'shared drop keeps planted knees untouched');
assert.notDeepEqual(drop,squat,'genre/energy affects small gestures, not show timing');
const balanced=plan({...base,tier:'balanced'});
assert(Math.abs(balanced.torsoPitch)<Math.abs(result.torsoPitch));
assert(balanced.leftKneeExtra<result.leftKneeExtra);
for(const guard of [{playing:false},{reducedMotion:true},{manualPriority:true},{automaticGroup:false},{tier:'low'},
 {trackId:''},{trackId:null},{seconds:NaN},{seconds:-1},{slot:4},{slot:-1},{lowDepth:-1},{beat:NaN},
 {kick:-1},{energy:Infinity},{footwork:{...footwork,liftLeft:NaN}}]){
 assert.deepEqual(plan({...base,...guard}),neutral(),`must opt out: ${JSON.stringify(guard)}`);
}
// No invented lift: V486 has already removed planted-foot swings when IK has contact.
const bothPlanted={...footwork,liftLeft:0,liftRight:0};
const planted=plan({...base,footwork:bothPlanted,lowDepth:0});
assert.equal(planted.leftKneeExtra,0);assert.equal(planted.rightKneeExtra,0);
const src=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
for(const fragment of ['planNaturalFullBodyV488({','const fullBodyV488=',
  'fullBodyV488.leftKneeExtra','fullBodyV488.rightKneeExtra','fullBodyV488.torsoPitch',
  'fullBodyV488.hipShiftX','fullBodyV488.leftArmSwing','fullBodyV488.rightArmSwing',
  'bodyRollTargetV488','fullBodyV488.headCounterPitch',
  'GroupFootworkContextV486.Provider','GroupLowPoseContextV481.Provider']){
 assert(src.includes(fragment),`V488 integration missing ${fragment}`);
}
assert(!src.includes('torso.current.rotation.z+=lowV482.torsoShift*smooth;'),'no accumulating torso tilt');
assert(!src.includes('head.current.rotation.x+=fullBodyV488.headCounterPitch*smooth;'),'no accumulating head tilt');
const pure=fs.readFileSync('components/visualizer/naturalFullBodyDanceV488.ts','utf8');
assert(!/\b(fetch|setInterval|setTimeout|requestAnimationFrame|Date\.now|Math\.random|window|document|localStorage)\b/.test(pure));
const versions=require('../package.json');
assert(Number(versions.version.match(/-v(\d+)$/)?.[1])>=488);
assert(versions.scripts['build:preflight'].includes('npm run test:v488 && npm run test:v488:types'));
let max=0;
// 33 minutes including rapid genre/track/pose/step changes and temporal seeks.
for(let t=0;t<120000;t++){
 const seconds=t%1200/60;
 const foot=t%2===0?{...footwork,liftLeft:.72,liftRight:0}:{...footwork,liftLeft:0,liftRight:.72};
 const p=plan({...base,trackId:'song-'+(t%7),seconds,slot:t%4,
  lowDepth:t%71<30?.2:0,genre:t%5===0?'Hardtekk':'Deutschrap',
  beat:(t%11)/10,kick:(t%17)/16,energy:(t%19)/18,footwork:foot});
 assert(Object.values(p).every(v=>typeof v==='boolean'||Number.isFinite(v)));
 assert(Math.abs(p.hipShiftX)<=.016&&Math.abs(p.hipRoll)<=.018);
 assert(Math.abs(p.torsoPitch)<=.05&&Math.abs(p.torsoRoll)<=.02);
 assert(Math.abs(p.leftArmSwing)<=.075&&Math.abs(p.rightArmSwing)<=.075);
 assert(p.leftKneeExtra>=0&&p.leftKneeExtra<=.023);
 assert(p.rightKneeExtra>=0&&p.rightKneeExtra<=.023);
 assert(Math.abs(p.headCounterPitch)<=.014);
 max=Math.max(max,Math.abs(p.leftArmSwing));
 if(t%1011===0)assert.deepEqual(plan({...base,seconds}),plan({...base,seconds}));
}
assert(max>0);
console.log('PASS V488: bounded full-body squat/step coupling, no planted-foot knee override, manual/reduced-motion safeguards, source wiring, deterministic 33-minute playback');
