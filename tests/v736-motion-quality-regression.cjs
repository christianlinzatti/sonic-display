'use strict';
/** V736 motion safety & integration regression (deterministic, no browser/GPU).
 * These tests are not a substitute for live GLB foot-sliding inspection.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('./typescript-loader.cjs');
const root = path.join(__dirname, '..');
const source = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const transpile = relative => {
  const result = ts.transpileModule(source(relative), { fileName:relative,
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}, reportDiagnostics:true });
  const errors = result.diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error)||[];
  assert.equal(errors.length,0,errors.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')).join('\n'));
  return result.outputText;
};
function load(relative, deps={}){
  const module={exports:{}};
  new Function('module','exports','require',transpile(relative))(
    module,module.exports,name=>{
      if(name in deps)return deps[name];
      throw Error(`unexpected runtime import ${name}`);
    });
  return module.exports;
}
let passed = 0;
function test(name, fn){
  try { fn(); passed++; console.log(`PASS V736: ${name}`); }
  catch (e) { e.message=`${name}: ${e.message}`; throw e; }
}
const {sampleHipDanceV735:sample,resolveHipDanceModeV735:resolve,
  normalizeHipDanceV735:normalize,blendHipDanceV735:blend} = load('components/visualizer/hipDanceV735.ts');
const modes=['Hip_Sway','Hip_Circle','Hip_Bounce'];
const ZERO={hipPitch:0,hipRoll:0,hipLateral:0,hipVertical:0,
  spineCounter:0,kneeCounter:0,ankleCounter:0};
function options(change={}){
  return { settings:{mode:'Hip_Sway',strength:85,speed:115}, seconds:3.17,bpm:140,
    genre:'deutschrap',section:'hook',playing:true,reducedMotion:false,
    manualPriority:false,footIKEnabled:true,contactKnown:true,
    plantedLeft:true,plantedRight:true,energy:.9,beat:.7, ...change };
}
const abs = value=>Math.abs(value);
const maxes={hipPitch:.10000001,hipRoll:.12000001,hipLateral:.01800001,
  hipVertical:.02200001};
let samples=0;
function bounded(pose){
  for(const [key,value] of Object.entries(pose))assert(Number.isFinite(value), `${key} not finite: ${value}`);
  for(const [key,limit] of Object.entries(maxes))assert(abs(pose[key])<=limit,`${key}: ${pose[key]}`);
  assert(abs(pose.spineCounter)<.1, 'torso counter too large');
  assert(abs(pose.kneeCounter)<.04, 'knee counter too large');
  assert(abs(pose.ankleCounter)<.025, 'ankle counter too large');
  samples++;
}
test('3 modes across genres/BPM/sections/stance/long clips remain finite and bounded',()=>{
  let maxSeen={};
  for(const mode of modes)for(const bpm of [40,65,95,120,145,190,300])
   for(const genre of ['Deutschrap','Hardtekk','Pop'])
   for(const section of ['verse','hook','drop','intro','bridge'])
   for(const mask of [0,1,2,3]){
    for(let frame=0;frame<48;frame++){
      const pose=sample(options({settings:{mode,strength:100,speed:200},
        bpm,genre,section,seconds:frame/24,
        plantedLeft:!!(mask&1),plantedRight:!!(mask&2)}));
      bounded(pose);
      for(const key of Object.keys(maxes))maxSeen[key]=Math.max(maxSeen[key]??0,abs(pose[key]));
      if(mask)assert.equal(pose.ankleCounter,0,'planted stance cannot rotate the ankle');
    }
   }
  for(const mode of modes) assert(modes.includes(mode));
  console.log('   max observed:',maxSeen);
});
test('foot-IK disabled/unknown suppresses *all* hip translation',()=>{
 for(const mode of modes)for(const footIKEnabled of [false,true])
  for(const contactKnown of [false,true])for(let t=0;t<60;t++){
   const p=sample(options({settings:{mode,strength:100,speed:150},seconds:t/13,
     footIKEnabled,contactKnown}));
   bounded(p);
   if(!footIKEnabled||!contactKnown){assert(p.hipLateral===0);assert(p.hipVertical===0);}
  }
});
test('planted feet get damped pelvis travel; both legs are not animated at ankle',()=>{
 for(const mode of modes){
   const ref=options({settings:{mode,strength:80,speed:100},seconds:1.37});
   const free=sample({...ref,plantedLeft:false,plantedRight:false});
   const grounded=sample(ref);
   bounded(free);bounded(grounded);
   assert(abs(grounded.hipRoll)<=abs(free.hipRoll)+1e-12);
   assert(abs(grounded.hipPitch)<=abs(free.hipPitch)+1e-12);
   assert(abs(grounded.hipVertical)<=abs(free.hipVertical)+1e-12);
   assert(abs(grounded.hipLateral)<=abs(free.hipLateral)+1e-12);
   assert.equal(grounded.ankleCounter,0);
 }
});
test('bounce always compresses rather than lifting pelvis above baseline',()=>{
 for(let t=0;t<256;t++){
  const p=sample(options({settings:{mode:'Hip_Bounce',strength:100,speed:200},
    seconds:t/57,plantedLeft:false,plantedRight:false}));
  bounded(p);assert(p.hipVertical<=0);
 }
});
test('pause, reduced motion, manual mode, invalid clock and off are inert',()=>{
  const cases=[{playing:false},{reducedMotion:true},{manualPriority:true},
   {settings:{mode:'off',strength:100,speed:100}},
   {settings:{mode:'Hip_Circle',strength:0,speed:100}},
   {seconds:NaN},{seconds:Infinity},{seconds:-1},
   {settings:{mode:'Hip_Bounce',strength:NaN,speed:100}},
   {settings:{mode:'Hip_Bounce',strength:100,speed:Infinity}}];
  for(const patch of cases) assert.deepEqual(sample(options(patch)),ZERO,JSON.stringify(patch));
});
test('invalid BPM and extreme finite seek times never make NaN',()=>{
 for(const clock of [0,1e6,1e16,1e100,Number.MAX_VALUE])
  for(const bpm of [NaN,Infinity,-Infinity,0,-20,1e100])
   for(const mode of [...modes,'auto']){
    const opt=options({settings:{mode,strength:100,speed:200},seconds:clock,bpm});
    const p=sample(opt);bounded(p);
    assert(modes.includes(resolve({...opt,settings:{...opt.settings,mode:'auto'}})));
   }
});
test('settings normalize unknown, boundary and nonfinite values',()=>{
 assert.deepEqual(normalize({mode:'Hip_Bounce',strength:Infinity,speed:NaN}),
  {mode:'Hip_Bounce',strength:45,speed:100});
 assert.deepEqual(normalize({mode:'Hip_Circle',strength:10.5,speed:999}),
  {mode:'Hip_Circle',strength:11,speed:200});
 assert.deepEqual(normalize({mode:'wrong',strength:-10,speed:-200}),
  {mode:'auto',strength:0,speed:50});
 assert.deepEqual(normalize(null),{mode:'auto',strength:45,speed:100});
});
test('determinism, pure blend and no changes to vocal/face/arms',()=>{
 const opt=options({settings:{mode:'auto',strength:55,speed:110}});
 assert.deepEqual(sample(opt),sample(opt));
 const base={headNod:.2,headTurn:.1,spineSway:.5,hipSway:.3,
  shoulderRoll:.2,followThrough:.1,headLag:.02,chestPulse:.15,
  armSwing:.5,legGroove:.1,footStep:.2,weightShift:.4,beatImpulse:.7,
  expressionJaw:.3,expressionBrow:.2,expressionEyeNarrow:.1,expressionHeadTilt:.1};
 const before=JSON.stringify(base),pose=sample(opt),copy=JSON.stringify(pose);
 const result=blend(base,pose);
 assert.equal(JSON.stringify(base),before);
 assert.equal(JSON.stringify(pose),copy);
 assert.equal(result.spineSway,base.spineSway+pose.spineCounter);
 for(const key of ['headNod','headTurn','hipSway','shoulderRoll','chestPulse','armSwing',
  'expressionJaw','expressionBrow','expressionEyeNarrow','expressionHeadTilt'])
   assert.equal(result[key],base[key],key);
});
test('rig frame overlay survives mixer resets without accumulating on static rig',()=>{
 class Vec3{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}distanceTo(b){return Math.hypot(this.x-b.x,this.y-b.y,this.z-b.z);}}
 const {applyAvatarRigMotion:apply,resetAvatarRigMotion:reset} = load('components/visualizer/avatarRigController.ts',
  {three:{Vector3:Vec3},'./avatarRigProfiles':{getAvatarRigProfile:()=>({aliases:{}})}});
 const node=(x,y,z)=>({position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0},
   getWorldPosition:()=>new Vec3(x,y,z)});
 const rig={hips:node(0,1,0),leftFoot:node(-.2,0,0),rightFoot:node(.2,0,0)};
 const base={headNod:0,headTurn:0,spineSway:0,hipSway:0,shoulderRoll:0,
  followThrough:0,headLag:0,chestPulse:0,armSwing:0,legGroove:0,
  footStep:0,weightShift:0,beatImpulse:0,expressionJaw:0,expressionBrow:0,
  expressionEyeNarrow:0,expressionHeadTilt:0};
 const pose=sample(options({settings:{mode:'Hip_Circle',strength:100,speed:100},
  plantedLeft:false,plantedRight:false,seconds:1.37}));
 const motion=blend(base,pose);
 for(let frame=0;frame<360;frame++){
  apply(rig,motion,.2);
  assert(abs(rig.hips.rotation.x-pose.hipPitch)<1e-9,'static pitch drift');
  assert(abs(rig.hips.rotation.z-pose.hipRoll)<1e-9,'static roll drift');
  assert(abs(rig.hips.position.y-pose.hipVertical*Math.hypot(1,.2))<1e-9,'static translation drift');
 }
 // Mimic a GLB mixer overwriting authored hips each frame with a changing pose.
 for(let frame=0;frame<360;frame++){
  const authoredPitch=.03+Math.sin(frame*.035)*.015;
  const authoredY=.04+Math.sin(frame*.03)*.009;
  rig.hips.rotation.x=authoredPitch;rig.hips.rotation.z=.02;
  rig.hips.position.y=authoredY;rig.hips.position.x=0;
  apply(rig,motion,.2);
  assert(abs(rig.hips.rotation.x-authoredPitch-pose.hipPitch)<1e-9,'mixer pitch lost');
  assert(abs(rig.hips.rotation.z-.02-pose.hipRoll)<1e-9,'mixer roll lost');
  assert(abs(rig.hips.position.y-authoredY-pose.hipVertical*Math.hypot(1,.2))<1e-9,'mixer height lost');
 }
 reset(rig,.2);
 assert(abs(rig.hips.rotation.x-(.03+Math.sin(359*.035)*.015))<1e-9);
 // Without feet anatomical length cannot be measured: translation must not run.
 const withoutFeet={hips:node(0,1,0)};
 apply(withoutFeet,motion,.2);assert.equal(withoutFeet.hips.position.y,0);
});
test('UI & live order: one IK call after one hip overlay; backup and duplicate clips respected',()=>{
 const live=source('components/visualizer/GltfDancerAvatarV492.tsx');
 const ui=source('components/visualizer/AvatarEditor.tsx');
 const settings=source('components/visualizer/hipDanceV735.ts');
 assert.match(live,/hipManualPriorityV735=authoredHipClipV735\|\|avatarMotionMode/);
 assert.match(live,/manualPriority:hipManualPriorityV735/);
 assert.match(live,/action\.getEffectiveWeight\(\)>.02/);
 assert(live.indexOf('blendHipDanceV735(')<live.indexOf('applyAvatarRigMotion(rigTargets.current'));
 assert(live.indexOf('applyAvatarRigMotion(rigTargets.current')<live.indexOf('updateFootGrounding({'));
 assert.equal((live.match(/updateFootGrounding\(\{/g)||[]).length,1);
 assert(ui.indexOf('applyAvatarRigMotion(targets')<ui.indexOf('updateFootIK(footIK.current'));
 for(const mode of modes){assert(settings.includes(mode));assert(ui.includes(mode));}
 const ctx=source('context/UiPreferencesContext.tsx');
 for(const field of ['avatarHipDanceModeV735','avatarHipDanceStrengthV735','avatarHipDanceSpeedV735'])
  assert(live.includes(field)&&ctx.includes(field),field);
});
console.log(`PASS V736: ${passed} test groups; ${samples.toLocaleString('en-US')} deterministic samples; note: no real GLB/GPU evaluation.`);
