'use strict';
/** Pure numeric body balancing and integration guard. Not a rendered GLB test. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
function load(rel,stubs={}){
 const output=ts.transpileModule(read(rel),{fileName:rel,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},reportDiagnostics:true});
 assert.equal(output.diagnostics.filter(x=>x.category===ts.DiagnosticCategory.Error).length,0);
 const mod={exports:{}};
 new Function('module','exports','require',output.outputText)(mod,mod.exports,(id)=>{
  if(id in stubs)return stubs[id];throw new Error('Unexpected runtime import: '+id);
 });
 return mod.exports;
}
const {sampleHipDanceV735}=load('components/visualizer/hipDanceV735.ts');
const {sampleNaturalBodyV740:sample,blendNaturalBodyV740:blend,
 normalizeNaturalBodyV740:normalize,DEFAULT_NATURAL_BODY_V740:defaults}=
 load('components/visualizer/naturalBodyDynamicsV740.ts');
const modes=['Hip_Sway','Hip_Circle','Hip_Bounce'];
let checks=0;
const ZERO={chestRoll:0,chestTwist:0,leftArm:0,rightArm:0,leftForearm:0,rightForearm:0,
 leftLeg:0,rightLeg:0,leftAnkle:0,rightAnkle:0,headTilt:0};
const baseInput={mode:'Hip_Circle',seconds:1.37,playing:true,reducedMotion:false,
 footIKEnabled:true,contactKnown:true,plantedLeft:false,plantedRight:false};
const hips=(mode,seconds)=>sampleHipDanceV735({settings:{mode,strength:90,speed:100},seconds,
 bpm:120,genre:'deutschrap',section:'hook',playing:true,reducedMotion:false,
 footIKEnabled:true,contactKnown:true,plantedLeft:false,plantedRight:false});
const sampleAt=(mode,seconds,patch={})=>sample({...baseInput,mode,seconds,pose:hips(mode,seconds),...patch});
assert.deepEqual(normalize(null),defaults);checks++;
assert.deepEqual(normalize({enabled:false,strength:-50,arms:900,legs:NaN}),
 {enabled:false,strength:0,arms:100,legs:65});checks++;
assert.deepEqual(normalize({strength:Infinity,arms:12.7,legs:22.5}),
 {enabled:true,strength:70,arms:13,legs:23});checks++;
for(const mode of modes){
 for(const plantedLeft of [false,true])for(const plantedRight of [false,true]){
 for(let frame=0;frame<550;frame++){
  const sec=frame/27;
  const p=sampleAt(mode,sec,{plantedLeft,plantedRight});
  for(const [k,v] of Object.entries(p)){
   assert(Number.isFinite(v),`${mode} ${k} finite`);
   assert(Math.abs(v)<=.0450000001,`${mode} ${k} bounded: ${v}`);checks+=2;
  }
  if(plantedLeft){assert.equal(p.leftLeg,0);assert.equal(p.leftAnkle,0);checks+=2;}
  if(plantedRight){assert.equal(p.rightLeg,0);assert.equal(p.rightAnkle,0);checks+=2;}
 }
 }
 const ref=sampleAt(mode,1.37),disabled=sampleAt(mode,1.37,{settings:{enabled:false}});
 assert.deepEqual(disabled,ZERO);checks++;
 assert.deepEqual(sampleAt(mode,1.37,{settings:{strength:0}}),ZERO);checks++;
 assert(Math.abs(sampleAt(mode,1.37,{settings:{arms:0}}).leftArm)===0);checks++;
 assert(Math.abs(sampleAt(mode,1.37,{settings:{legs:0}}).leftLeg)===0);checks++;
 assert(Math.abs(ref.chestRoll)<=.032);checks++;
}
for(const patch of [{playing:false},{reducedMotion:true},{manualPriority:true},{mode:'off'},
 {seconds:-1},{seconds:NaN},{seconds:Infinity},{pose:hips('Hip_Sway',0)}]){
 const pose=patch.pose??hips('Hip_Circle',1.37);
 const output=sample({...baseInput,pose,...patch});
 if(patch.pose===undefined)assert.deepEqual(output,ZERO,JSON.stringify(patch));
 checks++;
}
for(const patch of [{footIKEnabled:false},{contactKnown:false},{plantedLeft:true,plantedRight:false},
 {plantedLeft:false,plantedRight:true}]){
 const r=sampleAt('Hip_Bounce',1.33,patch);
 if(patch.footIKEnabled===false||patch.contactKnown===false||patch.plantedLeft===true){
  assert.equal(r.leftLeg,0);assert.equal(r.leftAnkle,0);checks+=2;
 }
 if(patch.footIKEnabled===false||patch.contactKnown===false||patch.plantedRight===true){
  assert.equal(r.rightLeg,0);assert.equal(r.rightAnkle,0);checks+=2;
 }
}
const zeroInput={...baseInput,mode:'Hip_Circle',pose:hips('Hip_Circle',1.37)};
for(const pose of [Object.fromEntries(Object.entries(hips('Hip_Circle',1.37)).map(([k])=>[k,0])),
 {...hips('Hip_Circle',1.37),hipPitch:NaN}]){
 assert.deepEqual(sample({...zeroInput,pose}),ZERO);checks++;
}
// Do not clobber existing vocal, authored-groove or pelvis signals.
const existing={headNod:.1,headTurn:.2,spineSway:.3,hipSway:.4,shoulderRoll:.5,armSwing:.6,
 hipRoll:.07,hipPitch:.03,footStep:.1,expressionJaw:.5,expressionHeadTilt:.25};
const before=JSON.stringify(existing);const natural=sampleAt('Hip_Circle',1.37);
const merged=blend(existing,natural);
assert.equal(JSON.stringify(existing),before);
for(const key of Object.keys(existing)){assert.equal(merged[key],existing[key]);checks++;}
assert.equal(merged.naturalChestRoll,natural.chestRoll);checks++;
// Test the actual rig-controller delta overlay: fixed input cannot accumulate,
// and authored mixer resets on chest + forearms preserve the additive motion.
class V3{constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z});} distanceTo(v){return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z);}}
const controller=load('components/visualizer/avatarRigController.ts',{
 three:{Vector3:V3},'./avatarRigProfiles':{getAvatarRigProfile:()=>({aliases:{}})}});
const node=()=>({position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0}});
const rig={chest:node(),leftForearm:node(),rightForearm:node(),leftArm:node(),rightArm:node(),head:node(),leftLeg:node(),rightLeg:node(),leftFoot:node(),rightFoot:node()};
const neutral={headNod:0,headTurn:0,spineSway:0,hipSway:0,shoulderRoll:0,
 followThrough:0,headLag:0,chestPulse:0,armSwing:0,legGroove:0,
 footStep:0,weightShift:0,beatImpulse:0,expressionJaw:0,expressionBrow:0,
 expressionEyeNarrow:0,expressionHeadTilt:0};
for(let n=0;n<200;n++){
 controller.applyAvatarRigMotion(rig,blend(neutral,natural),.15);
 assert(Math.abs(rig.chest.rotation.z-natural.chestRoll)<1e-9);checks++;
 assert(Math.abs(rig.leftForearm.rotation.z-natural.leftForearm)<1e-9);checks++;
 assert(Math.abs(rig.leftArm.rotation.z-natural.leftArm)<1e-9);checks++;
 assert(Math.abs(rig.leftLeg.rotation.x-natural.leftLeg)<1e-9);checks++;
}
for(let n=0;n<100;n++){
 const authored=Math.sin(n/9)*.07;
 rig.chest.rotation.z=authored;rig.leftForearm.rotation.z=authored;rig.leftArm.rotation.z=authored;rig.leftLeg.rotation.x=authored;
 controller.applyAvatarRigMotion(rig,blend(neutral,natural),.15);
 assert(Math.abs(rig.chest.rotation.z-authored-natural.chestRoll)<1e-9);checks++;
 assert(Math.abs(rig.leftForearm.rotation.z-authored-natural.leftForearm)<1e-9);checks++;
 assert(Math.abs(rig.leftArm.rotation.z-authored-natural.leftArm)<1e-9);checks++;
 assert(Math.abs(rig.leftLeg.rotation.x-authored-natural.leftLeg)<1e-9);checks++;
}
controller.resetAvatarRigMotion(rig,.15);
assert(Math.abs(rig.chest.rotation.z-Math.sin(99/9)*.07)<1e-9);checks++;
const live=read('components/visualizer/GltfDancerAvatarV492.tsx');
const preview=read('components/visualizer/AvatarEditor.tsx');
const settings=read('components/SettingsPanel.tsx');
const types=read('types/music.ts');
const ctx=read('context/UiPreferencesContext.tsx');
const rigSource=read('components/visualizer/avatarRigController.ts');
assert.match(live,/sampleNaturalBodyV740\(/);assert.match(preview,/sampleNaturalBodyV740\(/);checks+=2;
assert.match(live,/blendNaturalBodyV740\(/);assert.match(preview,/blendNaturalBodyV740\(/);checks+=2;
assert(live.indexOf('blendNaturalBodyV740(')<live.indexOf('applyAvatarRigMotion(rigTargets.current'));
assert(live.indexOf('applyAvatarRigMotion(rigTargets.current')<live.indexOf('updateFootGrounding({'));checks+=2;
assert(preview.indexOf('blendNaturalBodyV740(')<preview.indexOf('updateFootIK(footIK.current'));checks++;
assert.match(live,/manualPriority:hipManualPriorityV735/);checks++;
for(const s of [live,preview,settings,types,ctx]){assert.match(s,/avatarNaturalBodyV740|naturalBodyV740/);checks++;}
assert.match(preview,/role="status">V740 Rig-Hinweis/);checks++;
assert.match(rigSource,/naturalLeftAnkle/);checks++;
console.log(`PASS V740 Natural Body Dynamics: ${checks.toLocaleString('en-US')} numerical/contact/integration checks (rendered GLB not measured)`);
