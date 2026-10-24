require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planNaturalGlbMotionV489:plan}=load('components/visualizer/naturalGlbFullBodyMotionV489');
const base={enteringLow:true,leavingLow:false,switchingLow:false,
 baseFadeSeconds:.33,incomingDuration:2.5,plantedLeft:true,plantedRight:true,
 manualPriority:false,playing:true,reducedMotion:false,quality:'high',matchScore:1.1,matchTime:.8};
const crouch=plan(base);
assert(crouch.active,'automatic low pose entry is refined');
assert(crouch.fadeSeconds>.33,'two planted feet protect the crossfade');
assert(crouch.fadeSeconds<=.62&&crouch.fadeSeconds>=.08,'bounded fade');
assert.equal(crouch.allowPoseMatch,false,'weak pose match cannot seek deeply into squat');
assert.equal(crouch.allowPhaseFallback,false,'no unrelated dance phase into squat');
assert.equal(crouch.phaseStart,'begin');
assert.deepEqual(plan(base),crouch,'deterministic decision');
const matched=plan({...base,matchScore:.2,matchTime:.35});
assert(matched.allowPoseMatch&&matched.phaseStart==='matched','strong valid match may preserve a close stance');
for(const example of [
 {matchScore:NaN},{matchScore:-1},{matchTime:Infinity},{matchTime:2.4},
 {matchScore:.7},{matchTime:-.01},{matchTime:2.5},
])assert.equal(plan({...base,matchScore:.2,matchTime:.3,...example}).allowPoseMatch,false,JSON.stringify(example));
const airborne=plan({...base,plantedLeft:false,plantedRight:false});
const oneFoot=plan({...base,plantedRight:false});
assert(airborne.fadeSeconds<oneFoot.fadeSeconds&&oneFoot.fadeSeconds<crouch.fadeSeconds,'contact-sensitive fades');
const release=plan({...base,enteringLow:false,leavingLow:true,matchScore:.7,matchTime:.9});
assert(release.active&&release.allowPoseMatch,'strong upright recovery match allowed');
assert(release.fadeSeconds>=crouch.fadeSeconds,'standing return is controlled');
const exchange=plan({...base,enteringLow:false,switchingLow:true,matchScore:.55});
assert(exchange.active&&!exchange.allowPoseMatch,'squat->kneel requires strong pose evidence');
const short=plan({...base,incomingDuration:.35});
assert(short.fadeSeconds<=.35*.42+.00001,'short glb clip never gets an overlong blend');
const fast=plan({...base,baseFadeSeconds:.08});
assert(fast.fadeSeconds>=.08&&fast.fadeSeconds<=.62);
const normal=plan({...base,enteringLow:false});
assert.deepEqual(normal,{active:false,fadeSeconds:.33,allowPoseMatch:true,allowPhaseFallback:true,phaseStart:'matched'},'normal playback untouched');
for(const override of [{manualPriority:true},{playing:false},{reducedMotion:true},{quality:'low'},
 {incomingDuration:0},{incomingDuration:NaN},{incomingDuration:null},
 {enteringLow:false,leavingLow:false,switchingLow:false}]){
 const output=plan({...base,...override});
 assert.equal(output.active,false,JSON.stringify(override));
 assert.equal(output.allowPoseMatch,true);
 assert.equal(output.allowPhaseFallback,true);
}
assert(plan({...base,quality:'balanced'}).fadeSeconds<crouch.fadeSeconds,'balanced tier reduces extra work');
const source=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
for(const str of ['planNaturalGlbMotionV489({','const enteringLowV489','const leavingLowV489',
 'const switchingLowV489','previousWasLowClipV489','lowMotionV489.allowPoseMatch',
 'lowMotionV489.allowPhaseFallback','lowMotionV489.fadeSeconds',
 "footIK.current.left?.contact.phase==='planted'", "footIK.current.right?.contact.phase==='planted'",
 'polishAutomaticCrossfadeV311','nextAction.fadeIn(effectiveFadeDurationV311).play()']){
 assert(source.includes(str),`missing live GLB integration ${str}`);
}
assert(source.indexOf('planNaturalGlbMotionV489({')>source.indexOf('const selectedClip=lowClipV481'),
 'integrated only after automatic clip resolution');
assert(source.indexOf('planNaturalGlbMotionV489({')<source.indexOf('nextAction.fadeIn(effectiveFadeDurationV311).play()'),
 'V489 plan applied to the actual mixer crossfade');
assert(source.includes('updateFootIK(footIK.current') && source.includes('initializeFootIK(root.current'),
 'existing IK lifecycle remains active and is not replaced by V489');
const pure=fs.readFileSync('components/visualizer/naturalGlbFullBodyMotionV489.ts','utf8');
assert(!/\b(fetch|setInterval|setTimeout|requestAnimationFrame|Math\.random|Date\.now|window|document|localStorage)\b/.test(pure),
 'no second loop, network, timers or state');
const pkg=require('../package.json');assert.match(pkg.version,/^0\.1\.0-v49\d+$/);
assert(pkg.scripts['build:preflight'].includes('npm run test:v489 && npm run test:v489:types'));
let peak=0;
for(let i=0;i<126000;i++){
 const p=plan({...base,enteringLow:i%5===0,leavingLow:i%5===1,switchingLow:i%5===2,
  plantedLeft:i%2===0,plantedRight:i%3===0,quality:i%10===0?'balanced':'high',
  matchScore:i%13/13,matchTime:i%17/11,incomingDuration:.1+(i%51)/9,baseFadeSeconds:i%23/31});
 assert(Number.isFinite(p.fadeSeconds)&&p.fadeSeconds>=.08&&p.fadeSeconds<=1.5);
 peak=Math.max(peak,p.fadeSeconds);
 if(i%30000===0)assert.deepEqual(p,plan({...base,enteringLow:i%5===0,leavingLow:i%5===1,switchingLow:i%5===2,
  plantedLeft:i%2===0,plantedRight:i%3===0,quality:i%10===0?'balanced':'high',
  matchScore:i%13/13,matchTime:i%17/11,incomingDuration:.1+(i%51)/9,baseFadeSeconds:i%23/31}));
}
assert(peak>.2);
console.log('PASS V489: grounded low-clip transitions, bounded motion matching, authored/IK protection, deterministic long-play, live mixer wiring');
