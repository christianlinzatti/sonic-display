/* V735: mathematical and integration regression without GPU, web or native GLB. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.join(__dirname,'..');
function load(relative){
 const filename=path.join(root,relative);
 const output=ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},reportDiagnostics:true});
 const errors=(output.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);
 assert.equal(errors.length,0,errors.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')).join('\n'));
 const mod={exports:{}};new Function('module','exports','require',output.outputText)(mod,mod.exports,require);
 return mod.exports;
}
const {sampleHipDanceV735,blendHipDanceV735,normalizeHipDanceV735,resolveHipDanceModeV735}=load('components/visualizer/hipDanceV735.ts');
const base={settings:{mode:'Hip_Circle',strength:80,speed:100},seconds:1.37,bpm:120,
 genre:'deutschrap',section:'hook',playing:true,reducedMotion:false,
 footIKEnabled:true,contactKnown:true,plantedLeft:true,plantedRight:true};
for(const mode of ['Hip_Sway','Hip_Circle','Hip_Bounce']){
 let moved=false;
 for(let t=0;t<32;t++){
  const pose=sampleHipDanceV735({...base,settings:{...base.settings,mode},seconds:t/19});
  assert.ok(Object.values(pose).every(Number.isFinite),mode);
  assert.ok(Math.abs(pose.hipPitch)<=.1+1e-8);
  assert.ok(Math.abs(pose.hipRoll)<=.12+1e-8);
  assert.ok(Math.abs(pose.hipLateral)<=.018+1e-8);
  assert.ok(Math.abs(pose.hipVertical)<=.022+1e-8);
  assert.equal(pose.ankleCounter,0,'planted feet must remain undisturbed');
  moved||=Math.abs(pose.hipPitch)+Math.abs(pose.hipRoll)+Math.abs(pose.hipVertical)>1e-4;
 }
 assert.ok(moved,`${mode} should produce motion`);
}
const nulls=[{playing:false},{reducedMotion:true},{manualPriority:true},{settings:{...base.settings,mode:'off'}}];
for(const override of nulls)assert.deepEqual(sampleHipDanceV735({...base,...override}),
 {hipPitch:0,hipRoll:0,hipLateral:0,hipVertical:0,spineCounter:0,kneeCounter:0,ankleCounter:0});
let noIk=sampleHipDanceV735({...base,footIKEnabled:false,contactKnown:false});
assert.ok(Math.abs(noIk.hipVertical)===0);assert.ok(Math.abs(noIk.hipLateral)===0);
const withIk=sampleHipDanceV735(base);assert.notEqual(withIk.hipRoll,0);
const combined=blendHipDanceV735({hipPitch:0,hipRoll:0,hipLateral:0,hipVertical:0,
 spineSway:.1,kneeFollow:.05,footStep:.2},withIk);
assert.equal(combined.spineSway,.1+withIk.spineCounter);
assert.equal(combined.kneeFollow,.05+withIk.kneeCounter);
assert.equal(combined.footStep,.2+withIk.ankleCounter);
assert.equal(resolveHipDanceModeV735({...base,settings:{...base.settings,mode:'auto'}}),'Hip_Sway');
assert.deepEqual(normalizeHipDanceV735({mode:'Hip_Bounce',strength:400,speed:-9}),{mode:'Hip_Bounce',strength:100,speed:50});
assert.deepEqual(normalizeHipDanceV735({mode:'bad'}),{mode:'auto',strength:45,speed:100});
const rig=fs.readFileSync(path.join(root,'components/visualizer/avatarRigController.ts'),'utf8');
const live=fs.readFileSync(path.join(root,'components/visualizer/GltfDancerAvatarV492.tsx'),'utf8');
const preview=fs.readFileSync(path.join(root,'components/visualizer/AvatarEditor.tsx'),'utf8');
assert.match(rig,/translate\("hips", "y", motion\.hipVertical/);
assert.match(rig,/rotate\("hips", "x", motion\.hipPitch/);
assert.match(live,/sampleHipDanceV735/);
assert.ok(live.indexOf('applyAvatarRigMotion(rigTargets.current')<live.indexOf('updateFootGrounding({'), 'IK must run after pelvis overlay');
for(const name of ['Hip_Sway','Hip_Circle','Hip_Bounce'])assert.ok(preview.includes(name));
console.log('PASS V735 — hip motions, limits, no-IK guard, manual priority, preview wiring, IK order');
// The additive translation must survive a GLB AnimationMixer overwriting hips
// on every frame, but must not accumulate on a static rig.
const rigTs=ts.transpileModule(rig,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
class Vec3 {constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}distanceTo(v){return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z);}}
const rigExports={exports:{}};
new Function('module','exports','require',rigTs)(rigExports,rigExports.exports,function(name){
 if(name==='three')return {Vector3:Vec3};
 if(name==='./avatarRigProfiles')return {getAvatarRigProfile(){return {aliases:{}};}};
 throw Error('unexpected dependency '+name);
});
const {applyAvatarRigMotion,resetAvatarRigMotion}=rigExports.exports;
const node=(name,x,y,z)=>({name,rotation:{x:0,y:0,z:0},position:{x:0,y:0,z:0},
 getWorldPosition(){return new Vec3(x,y,z);}});
const targets={hips:node('Hips',0,1,0),leftFoot:node('LeftFoot',-.2,0,0),rightFoot:node('RightFoot',.2,0,0)};
const zeroRig={headNod:0,headTurn:0,spineSway:0,hipSway:0,
 shoulderRoll:0,followThrough:0,headLag:0,chestPulse:0,armSwing:0,
 legGroove:0,footStep:0,weightShift:0,beatImpulse:0,expressionJaw:0,
 expressionBrow:0,expressionEyeNarrow:0,expressionHeadTilt:0};
applyAvatarRigMotion(targets,{...zeroRig,hipPitch:.08,hipRoll:.04,hipVertical:.01},.2);
const firstY=targets.hips.position.y;
assert.ok(firstY>.009 && firstY<.012);
assert.equal(targets.hips.rotation.x,.08);
assert.equal(targets.hips.rotation.z,.04);
applyAvatarRigMotion(targets,{...zeroRig,hipPitch:.08,hipRoll:.04,hipVertical:.01},.2);
assert.equal(targets.hips.position.y,firstY,'no accumulation on static rig');
assert.equal(targets.hips.rotation.x,.08,'no accumulated rotation');
targets.hips.rotation.x=0;targets.hips.rotation.z=0;targets.hips.position.y=0;
applyAvatarRigMotion(targets,{...zeroRig,hipPitch:.08,hipRoll:.04,hipVertical:.01},.2);
assert.equal(targets.hips.position.y,firstY,'reapply over freshly evaluated GLB position');
assert.equal(targets.hips.rotation.x,.08,'reapply over freshly evaluated GLB rotation');
resetAvatarRigMotion(targets,.2);
assert.ok(Math.abs(targets.hips.position.y)<1e-8,'reset translation');
assert.ok(Math.abs(targets.hips.rotation.x)<1e-8,'reset pitch');
console.log('PASS V735 — additive static/animated rig transform lifecycle');
