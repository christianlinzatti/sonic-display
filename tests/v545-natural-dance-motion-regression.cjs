'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {createDanceMotionStateV545,refineNaturalDanceMotionV545:refine,
 normalizeNaturalDanceMotionV545:normalize,DEFAULT_NATURAL_DANCE_MOTION_V545:settings}=load('components/visualizer/naturalDanceMotionV545');
const root=path.join(__dirname,'..');
const source={hipSway:.16,hipCounter:.12,weightShift:.30,legGroove:.18,footStep:.17,
 headNod:.08,headTurn:.02,spineSway:.04,shoulderRoll:.03,followThrough:.02,headLag:.01,chestPulse:.05,
 armSwing:.18,beatImpulse:.8,expressionJaw:.4,expressionBrow:.1,expressionEyeNarrow:.1,expressionHeadTilt:.04};
const input={trackId:'song-a',modelKey:'avatar-a',seconds:1,delta:1/60,playing:true,reducedMotion:false,
 manualPriority:false,footIKEnabled:true,contactKnown:true,quality:'high',genre:'Deutschrap',
 plantedLeft:false,plantedRight:false,settings};
const run=(state=createDanceMotionStateV545(),inputChanges={},motion=source)=>refine(state,motion,{...input,...inputChanges});
const original=JSON.stringify(source);
const idle=createDanceMotionStateV545();
const airborne=run(idle);
assert.equal(airborne.footStep,source.footStep,'an airborne foot must preserve its authored swing');
assert.equal(airborne.expressionJaw,source.expressionJaw);
assert.equal(JSON.stringify(source),original,'source motion must remain unchanged');
const left=run(createDanceMotionStateV545(),{plantedLeft:true});
const both=run(createDanceMotionStateV545(),{plantedLeft:true,plantedRight:true});
assert(left.footStep<airborne.footStep,'a planted left foot must reduce additive ankle rotation');
assert(both.footStep<left.footStep,'two planted feet must be protected more strongly');
assert(both.weightShift<left.weightShift&&left.weightShift<airborne.weightShift);
assert(both.legGroove<left.legGroove&&left.legGroove<airborne.legGroove);
assert(both.hipSway<left.hipSway&&left.hipSway<airborne.hipSway);
assert(both.hipCounter<left.hipCounter&&left.hipCounter<airborne.hipCounter);
const newlyPlanted=createDanceMotionStateV545();run(newlyPlanted);
const drop=run(newlyPlanted,{seconds:1+1/60,plantedLeft:true,plantedRight:true});
assert(drop.footStep<=both.footStep+1e-10,'newly planted feet must not retain old airborne swing');
const off=run(newlyPlanted,{seconds:1+2/60,settings:{enabled:false,strength:100}});
assert.strictEqual(off,source,'feature off must pass through identical source object');
assert.equal(newlyPlanted.lastSeconds,-1,'disabled feature clears temporal history');
for(const changes of [
 {manualPriority:true},{reducedMotion:true},{playing:false},{footIKEnabled:false},
 {contactKnown:false},{quality:'low'},{trackId:''},{modelKey:''},
 {delta:0},{delta:.4},{seconds:NaN},{settings:{enabled:true,strength:0}},
])assert.strictEqual(run(createDanceMotionStateV545(),changes),source,
 `invalid/manual mode should preserve original motion: ${JSON.stringify(changes)}`);
assert.strictEqual(run(createDanceMotionStateV545(),{}, {...source,weightShift:NaN}).weightShift,NaN);
const saved=createDanceMotionStateV545();
run(saved,{seconds:10,plantedLeft:true});
let changed=run(saved,{seconds:0.5,modelKey:'avatar-b',plantedLeft:false,plantedRight:false});
assert.equal(changed.footStep,source.footStep,'model change + seek must not inherit old foot contact');
assert.equal(saved.modelKey,'avatar-b');
changed=run(saved,{trackId:'song-b',seconds:0.3,plantedLeft:true});
assert.equal(saved.trackId,'song-b');assert(changed.footStep<source.footStep);
const reduced=run(createDanceMotionStateV545(),{plantedLeft:true,settings:{enabled:true,strength:20}});
assert(reduced.footStep>left.footStep,'user strength must be adjustable');
const clampInput=run(createDanceMotionStateV545(),{plantedLeft:true}, {...source,footStep:900,hipSway:900,weightShift:900});
assert(clampInput.hipSway<=.19&&clampInput.weightShift<=.34&&clampInput.footStep<=.19);
for(const v of [null,{}, {enabled:false,strength:190},{enabled:true,strength:-30},{strength:NaN},{strength:'big'}]){
 const n=normalize(v);assert(n.strength>=0&&n.strength<=100);assert.equal(typeof n.enabled,'boolean');
}
// Compare time-stepping: smoothing uses elapsed dt rather than counting frames.
const smooth=(dt)=>{const state=createDanceMotionStateV545();run(state,{seconds:1,plantedLeft:false});let out;for(let t=dt;t<.2+dt*.5;t+=dt){out=run(state,{seconds:1+t,delta:dt,plantedLeft:true});}return out;};
const fast=smooth(1/120),slow=smooth(1/30);
assert(Math.abs(fast.hipSway-slow.hipSway)<.015,'30/120Hz smoothing must be close');
let frames=0;
for(const genre of ['Deutschrap','Hip-Hop','Trap','Hardstyle','Hardtekk','Ambient']){
 for(const support of [[false,false],[true,false],[false,true],[true,true]]){
  const state=createDanceMotionStateV545();
  for(let i=0;i<300;i++){
   const out=run(state,{genre,seconds:i/60,plantedLeft:support[0],plantedRight:support[1]});
   assert(Number.isFinite(out.footStep)&&Math.abs(out.footStep)<=.19+1e-10);
   assert(Number.isFinite(out.weightShift)&&Math.abs(out.weightShift)<=.34+1e-10);
   assert(Number.isFinite(out.legGroove)&&Math.abs(out.legGroove)<=.22+1e-10);
   frames++;
  }
 }
}
const rapState=createDanceMotionStateV545(),hardState=createDanceMotionStateV545();
run(rapState,{seconds:1,genre:'Deutschrap',plantedLeft:true});run(hardState,{seconds:1,genre:'Hardtekk',plantedLeft:true});
const rapNext=run(rapState,{seconds:1+1/60,genre:'Deutschrap',plantedLeft:true}, {...source,hipSway:-.16});
const hardNext=run(hardState,{seconds:1+1/60,genre:'Hardtekk',plantedLeft:true}, {...source,hipSway:-.16});
assert(hardNext.hipSway<rapNext.hipSway,'hard-dance should react faster than rap-flow');
const avatar=fs.readFileSync(path.join(root,'components/visualizer/GltfDancerAvatarV492.tsx'),'utf8');
assert.match(avatar,/refineNaturalDanceMotionV545\(danceMotionV545\.current/);
assert(avatar.indexOf('refineNaturalDanceMotionV545(danceMotionV545.current')<avatar.indexOf('applyAvatarRigMotion(rigTargets.current, debugMotion'));
assert(avatar.indexOf('applyAvatarRigMotion(rigTargets.current, debugMotion')<avatar.indexOf('updateFootGrounding({delta'));
assert.match(avatar,/!!activeSequence\|\|!!activeLoop\|\|timelineEnabled\|\|avatarBlendEnabled/);
const controls=fs.readFileSync(path.join(root,'components/visualizer/NaturalDanceControlsV320.tsx'),'utf8');
assert.match(controls,/V545 · Natural Dance Motion/);assert.match(controls,/writeNaturalDanceMotionV545/);
// Model fixture check is a structural inspection, not GPU or real-time playback.
let assets=0,clips=0;
for(const name of ['sonic-performer-v3.glb','sonic-pulsebot-v1.glb','sonic-nova-v1.glb','sonic-rae-v1.glb','sonic-jax-v1.glb']){
 const file=path.join('/mnt/data',name);if(!fs.existsSync(file))continue;
 const bytes=fs.readFileSync(file);assert.equal(bytes.toString('utf8',0,4),'glTF');
 const jsonSize=bytes.readUInt32LE(12);assert.equal(bytes.toString('utf8',16,20),'JSON');
 const glb=JSON.parse(bytes.toString('utf8',20,20+jsonSize));
 assert(glb.nodes.some(n=>/hips?/i.test(n.name??'')));
 assert(glb.nodes.some(n=>/leftfoot/i.test(n.name??'')));
 assert(glb.nodes.some(n=>/rightfoot/i.test(n.name??'')));
 assert(glb.animations.length>=20);assets++;clips+=glb.animations.length;
}
console.log(`PASS V545 contact-aware additive motion: ${frames} synthetic frames, ${assets} local GLB fixtures / ${clips} animation clips (no WebGL/FPS claim)`);
