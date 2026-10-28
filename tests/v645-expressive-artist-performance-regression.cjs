'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v=load('components/visualizer/expressiveArtistPerformanceV645');
let checks=0,states=0;
const check=(label,fn)=>{try{fn();checks++;}catch(err){err.message=`V645 ${label}: ${err.message}`;throw err;}};
const word={active:true,source:'verified-timed-word',wordStartMs:7000,headPitch:-.018,jawAttackRate:1.086};
const eye={mode:'partner',yaw:.025,pitch:0,weight:.8};
const body={active:true,source:'verified-word-and-ik',leftArmPitch:.002,rightArmPitch:.003};
const defaults={trackId:'v645-confirmed-track',avatarSlot:0,effectiveTimeMs:7140,
 playing:true,reducedMotion:false,authoredPriority:false,tier:'high',strength:70,energy:.85,
 word,eye,body};
const plan=(override={})=>v.planExpressiveArtistV645({...defaults,...override});
const idle=(override={})=>assert.deepEqual(plan(override),v.EXPRESSIVE_ARTIST_OFF_V645);
check('verified rap actor activated',()=>assert(plan().active));
check('correct evidence source',()=>assert.equal(plan().source,'verified-word'));
check('zero cue when stopped',()=>idle({playing:false}));
check('zero cue with reduced motion',()=>idle({reducedMotion:true}));
check('manual GLB priority',()=>idle({authoredPriority:true}));
check('low tier no extra animation',()=>idle({tier:'low'}));
check('inactive word no facial changes',()=>idle({word:{...word,active:false}}));
check('unverified word source no changes',()=>idle({word:{...word,source:'none'}}));
check('missing song invalid',()=>idle({trackId:''}));
check('wrong slot invalid',()=>idle({avatarSlot:4}));
check('negative slot invalid',()=>idle({avatarSlot:-1}));
check('fractional slot invalid',()=>idle({avatarSlot:1.3}));
check('NaN slot invalid',()=>idle({avatarSlot:NaN}));
check('out-of-range word time invalid',()=>idle({effectiveTimeMs:6999}));
check('no stale words after 520ms',()=>idle({effectiveTimeMs:7520}));
check('fractional NaN time invalid',()=>idle({effectiveTimeMs:NaN}));
check('Infinity time invalid',()=>idle({effectiveTimeMs:Infinity}));
check('negative word start invalid',()=>idle({word:{...word,wordStartMs:-1}}));
check('NaN word start invalid',()=>idle({word:{...word,wordStartMs:NaN}}));
check('zero head cue not reinvented',()=>idle({word:{...word,headPitch:0}}));
check('positive head cue invalid',()=>idle({word:{...word,headPitch:.01}}));
check('unbounded head cue invalid',()=>idle({word:{...word,headPitch:-.2}}));
check('NaN head cue invalid',()=>idle({word:{...word,headPitch:NaN}}));
check('no verified attack invalid',()=>idle({word:{...word,jawAttackRate:1}}));
check('unbounded attack invalid',()=>idle({word:{...word,jawAttackRate:2}}));
check('NaN attack invalid',()=>idle({word:{...word,jawAttackRate:NaN}}));
check('zero strength off',()=>idle({strength:0}));
check('negative strength off',()=>idle({strength:-1}));
check('NaN strength off',()=>idle({strength:NaN}));
check('invalid strong gain off',()=>idle({strength:120}));
check('invalid energy off',()=>idle({energy:NaN}));
check('negative energy off',()=>idle({energy:-.1}));
check('energy above one off',()=>idle({energy:1.1}));
check('empty song no motif',()=>assert.equal(v.artistMotifV645('',7000,0),'none'));
check('oversized id no motif',()=>assert.equal(v.artistMotifV645('x'.repeat(251),7000,0),'none'));
check('NaN motif clock no motif',()=>assert.equal(v.artistMotifV645('track',NaN,0),'none'));
check('negative motif clock no motif',()=>assert.equal(v.artistMotifV645('track',-1,0),'none'));
check('out of range motif slot no motif',()=>assert.equal(v.artistMotifV645('track',7000,4),'none'));
check('same phrase stable',()=>assert.equal(v.artistMotifV645('track',7350,0),v.artistMotifV645('track',12999,0)));
check('next phrase changes motif',()=>assert.notEqual(v.artistMotifV645('track',7350,0),v.artistMotifV645('track',14000,0)));
check('each slot selects different part',()=>assert.equal(new Set([0,1,2,3].map(s=>v.artistMotifV645('track',7350,s))).size,4));
check('no gaze without verified contact',()=>{const x=plan({eye:{...eye,mode:'off'}});assert.equal(x.eyeYaw,0);assert.equal(x.eyePitch,0);assert.equal(x.headYaw,0);});
check('no gaze without verified eye confidence',()=>{const x=plan({eye:{...eye,weight:0}});assert.equal(x.eyeYaw,0);});
check('no gaze from NaN angle',()=>{const x=plan({eye:{...eye,yaw:NaN}});assert.equal(x.eyeYaw,0);});
check('audience eye yields no invented partner direction',()=>{const x=plan({eye:{mode:'audience',yaw:0,pitch:-.01,weight:.6}});assert.equal(x.eyeYaw,0);});
check('partner gaze shifts only toward verified side',()=>{const a=plan({eye:{...eye,yaw:.03}}),b=plan({eye:{...eye,yaw:-.03}});assert(a.eyeYaw>0&&b.eyeYaw<0);});
check('missing supported body eliminates arm extras',()=>{const x=plan({body:{...body,active:false}});assert.equal(x.leftArmPitch,0);assert.equal(x.rightArmPitch,0);});
check('wrong foot cue source eliminates arms',()=>{const x=plan({body:{...body,source:'none'}});assert.equal(x.leftArmPitch,0);});
check('invalid actual arm cue eliminates arms',()=>{const x=plan({body:{...body,leftArmPitch:NaN}});assert.equal(x.rightArmPitch,0);});
check('out of bound arm cue eliminates arms',()=>{const x=plan({body:{...body,rightArmPitch:1}});assert.equal(x.leftArmPitch,0);});
check('neutral facial filter identity',()=>{const obj={face:{jaw:.8,brow:.1,cheek:.1,squint:.1}};assert.equal(v.addExpressiveArtistFaceV645(obj,v.EXPRESSIVE_ARTIST_OFF_V645),obj);});
check('mouth untouched',()=>{const obj={face:{jaw:.4,wide:.2,round:.3,lipsClosed:.65,blink:.5,smile:.2,brow:.1,cheek:.1,squint:.1}};
 const result=v.addExpressiveArtistFaceV645(obj,plan());for(const c of ['jaw','wide','round','lipsClosed','blink','smile'])assert.equal(result.face[c],obj.face[c]);});
check('face does not mutate passed object',()=>{const obj={face:{brow:.1,cheek:.1,squint:.1}};const x=v.addExpressiveArtistFaceV645(obj,plan());assert.notEqual(x,obj);assert.equal(obj.face.brow,.1);});
check('expression clamps at one',()=>{const obj={face:{brow:1,cheek:1,squint:1}};assert.deepEqual(v.addExpressiveArtistFaceV645(obj,plan()).face,obj.face);});
check('no additional render loop',()=>assert(!fs.readFileSync('components/visualizer/expressiveArtistPerformanceV645.ts','utf8').includes('useFrame(')));
check('existing rig consumes V645 expression',()=>{const s=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');assert(s.includes('planExpressiveArtistV645({'));assert(s.includes('addExpressiveArtistFaceV645(facialRealismV617.frame,artistCueV645)'));});
check('actual glb arm overlay is owned by V618',()=>{const s=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');assert(s.includes('coordinatedBodyV618.leftArmPitch+artistCueV645.leftArmPitch'));});
check('V644 manual lip ownership remains',()=>{const s=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');assert(s.includes('alignedMouthV644??directedTargetV632'));});
check('original V562 calibration remains',()=>assert(fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8').includes('calibrateMouthPoseV562(')));
check('no Spotify or audio interception',()=>{const s=fs.readFileSync('components/visualizer/expressiveArtistPerformanceV645.ts','utf8');assert(!s.includes('fetch(')&&!s.includes('getUserMedia')&&!s.includes('phonemeDetector'));});
check('same input is deterministic',()=>assert.deepEqual(plan(),plan()));
check('balanced quieter than high',()=>assert(plan({tier:'balanced'}).brow<plan().brow));
for(let i=0;i<12000;i++){
 const start=Math.floor(i/100)*1000+7000;
 const offset=i%100*4;
 const x=plan({trackId:'track'+(i%17),avatarSlot:i%4,effectiveTimeMs:start+offset,
  word:{...word,wordStartMs:start,headPitch:-.018, jawAttackRate:1.086},
  tier:i%3===0?'balanced':'high',energy:(i%100)/100,
  body:i%7===0?{...body,active:false}:body,
  eye:i%11===0?{...eye,mode:'off'}:eye});
 if(x.active){
  for(const key of ['brow','cheek','squint','headPitch','headYaw','eyePitch','eyeYaw','leftArmPitch','rightArmPitch']) assert(Number.isFinite(x[key]),key);
  assert(x.brow>=0&&x.brow<=.014);assert(x.cheek>=0&&x.cheek<=.012);assert(x.squint>=0&&x.squint<=.008);
  assert(x.headPitch>=-.006&&x.headPitch<=0);assert(Math.abs(x.headYaw)<=.004);
  assert(Math.abs(x.eyeYaw)<=.003&&x.eyePitch>=-.002);
  assert(x.leftArmPitch>=0&&x.leftArmPitch<=.0018&&x.rightArmPitch>=0&&x.rightArmPitch<=.0018);
  if(i%7===0)assert.equal(x.leftArmPitch,0);
  if(i%11===0)assert.equal(x.eyeYaw,0);
 }
 states++;
}
check('12,000 bounded frame samples',()=>assert.equal(states,12000));
console.log(`PASS V645: ${checks} regression groups, ${states} simulated verified-word frames`);
