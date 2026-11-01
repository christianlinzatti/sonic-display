'use strict';
/** V737: pure world-space contact anchors + static integration contract.
 * NOT a replacement for actual Three.js/GLB/GPU foot-slide inspection.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.join(__dirname,'..');
const get=rel=>fs.readFileSync(path.join(root,rel),'utf8');
function load(rel){
 const out=ts.transpileModule(get(rel),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const mod={exports:{}};
 new Function('module','exports','require',out)(mod,mod.exports,name=>{throw Error('unexpected import '+name);});
 return mod.exports;
}
const {createHipFootLockStateV737,createHipFootAnchorV737,resetHipFootLockV737,
 detectHipFootDiscontinuityV737,stepHipFootLockV737,hipFootLockReportV737}=load('components/visualizer/hipFootLockV737.ts');
const {sampleHipDanceV735}=load('components/visualizer/hipDanceV735.ts');
const pose={settings:{mode:'Hip_Circle',strength:85,speed:120},seconds:1.4,bpm:145,
 genre:'Deutschrap',section:'hook',playing:true,reducedMotion:false,
 footIKEnabled:true,contactKnown:true,plantedLeft:true,plantedRight:true};
const probe=(patch={})=>({position:{x:0,y:0,z:0},phase:'planted',confidence:.94,
 floorY:0,verticalSpeed:0,legLength:1.7,delta:1/60,intensity:.85,...patch});
let checks=0;
for(const mode of ['Hip_Sway','Hip_Circle','Hip_Bounce']){
 const lock=createHipFootAnchorV737();
 const hip=sampleHipDanceV735({...pose,settings:{...pose.settings,mode}});
 assert(Object.values(hip).every(Number.isFinite));
 let result;
 for(let frame=0;frame<150;frame++){
  const drift=(Math.sin(frame/17)*.019);
  result=stepHipFootLockV737(lock,probe({position:{x:drift,y:0,z:drift*.35}}));
  assert.equal(result.locked,true);
  assert(Number.isFinite(result.weight)&&result.weight>=0&&result.weight<=1);
  assert(Math.hypot(result.x-drift,result.z-drift*.35)<=1.7*.055+1e-10);
  if(frame>35)assert(Math.hypot(result.x,result.z)<Math.hypot(drift,drift*.35)+1e-9);
  checks++;
 }
 assert.deepEqual(lock.anchor,{x:0,y:0,z:0},'planted contact anchor never rewritten');
 assert(result.weight>.7,'full-speed hip lock should settle to meaningful influence');
 for(const release of [
  {phase:'releasing'}, {phase:'airborne'}, {position:{x:0,y:.4,z:0}},
  {verticalSpeed:3}, {confidence:.04}, {intensity:0},
 ]){
  const released=stepHipFootLockV737(lock,probe(release));
  assert.equal(released.locked,false,'real step must release immediately');
  assert.equal(released.weight,0,'released target must never drive IK');
  assert.equal(released.slip,0);
  checks+=3;
  stepHipFootLockV737(lock,probe()); // reacquire
 }
}
for(const val of [-100,0,.2,1,100,NaN,Infinity]){
 const lock=createHipFootAnchorV737();
 const result=stepHipFootLockV737(lock,probe({intensity:val}));
 assert(Object.values(result).every(x=>typeof x==='boolean'||Number.isFinite(x)));
 checks++;
}
const lock=createHipFootAnchorV737();
stepHipFootLockV737(lock,probe());
const tooFar=stepHipFootLockV737(lock,probe({position:{x:10,y:0,z:0}}));
assert.equal(tooFar.locked,false,'unreachable change must release');checks++;
const state=createHipFootLockStateV737();
assert.equal(detectHipFootDiscontinuityV737(state,'song-1',1000),false);
stepHipFootLockV737(state.left,probe());
assert.equal(detectHipFootDiscontinuityV737(state,'song-1',1016),false);
assert.equal(state.left.active,true);
assert.equal(detectHipFootDiscontinuityV737(state,'song-1',800),true,'rewind invalidates anchor');
assert.equal(state.left.active,false);
stepHipFootLockV737(state.left,probe());
assert.equal(detectHipFootDiscontinuityV737(state,'song-2',950),true,'track changes invalidate anchors');
assert.equal(state.left.active,false);
stepHipFootLockV737(state.left,probe());
assert.equal(detectHipFootDiscontinuityV737(state,'song-2',5000),true,'seek forward invalidates anchors');
assert.equal(state.left.active,false);
assert.equal(detectHipFootDiscontinuityV737(state,'song-2',NaN),false,'bad clock not a seek');
resetHipFootLockV737(state);assert.deepEqual(hipFootLockReportV737(state),
 {leftLocked:false,rightLocked:false,leftSlipCm:0,rightSlipCm:0});
checks+=12;
// Guard against root/hip processing taking over the single end-of-frame solver.
const ik=get('components/visualizer/avatarFootIK.ts');
const hook=get('components/visualizer/useGltfFootContactV492.ts');
const live=get('components/visualizer/GltfDancerAvatarV492.tsx');
assert.match(ik,/stepHipFootLockV737\(/);
assert.match(ik,/!optionsV322\?\.enabled/,'explicit V322 option must retain priority');
assert.match(ik,/if\s*\(!active\).*resetHipFootLockV737/,'pause must reset anchors');
assert.match(ik,/solveLeg\(leg,target,targetV737\.weight\*footStrength/,'uses existing IK');
assert.equal((hook.match(/updateFootIK\(/g)||[]).length,1,'single authoritative IK call');
assert.match(hook,/hipFootLockV737\)\)/,'hook passes live V737 options');
assert(live.indexOf('applyAvatarRigMotion(rigTargets.current')<live.indexOf('updateFootGrounding({'), 'IK must run after rig overlay');
assert.match(live,/!hipManualPriorityV735&&isPlaying&&!reducedMotion/);
assert.match(live,/hipSettingsV735\.mode!=='off'/);
assert.match(hook,/HIP_FOOT_LOCK_DIAGNOSTICS_V737/);
const controls=get('components/visualizer/IntelligentFootLockControlsV322.tsx');
assert.match(controls,/HIP_FOOT_LOCK_DIAGNOSTICS_V737/);
assert.match(controls,/Ankerabweichung vor IK/);
assert(!/hipFootLockV737[^]*?root\.position\./.test(live),'foot lock must not move root');
console.log(`PASS V737 — ${checks} contact-step samples/checks, seek/track reset, explicit V322 precedence, existing IK-only integration`);
