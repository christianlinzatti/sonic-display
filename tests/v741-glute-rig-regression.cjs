'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
function load(rel){const out=ts.transpileModule(read(rel),{fileName:rel,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},reportDiagnostics:true});
 assert.equal(out.diagnostics.filter(x=>x.category===ts.DiagnosticCategory.Error).length,0);
 const mod={exports:{}};new Function('module','exports','require',out.outputText)(mod,mod.exports,()=>{throw new Error('unexpected runtime import');});return mod.exports;}
const glute=load('components/visualizer/advancedGluteRigV741.ts');
const hip=load('components/visualizer/hipDanceV735.ts');
let checks=0;
const check=(condition,message)=>{assert(condition,message);checks++};
const eq=(left,right,message)=>{assert.deepEqual(left,right,message);checks++};
eq(glute.normalizeGluteSettingsV741(null),glute.DEFAULT_GLUTE_V741);
eq(glute.normalizeGluteSettingsV741({enabled:true,strength:Infinity,left:-1,right:220,driver:'missing'}),
 {enabled:true,strength:35,left:0,right:100,driver:'auto'});
for(const [name,side] of [['Glute_L','left'],['Glute_R','right'],['LeftButtock','left'],['buttCheekRight','right'],['l_glute','left'],['R_glute','right'],['hips',''],['leftHip',''],['Glute','']]){
 eq(glute.gluteSideV741(name),side||null,name);
}
const attr=(v)=>({count:v.length,getX:i=>v[i][0],getY:i=>v[i][1],getZ:i=>v[i][2],getW:i=>v[i][3]});
const node=(name,props={})=>({name,rotation:{x:0,y:0,z:0},...props});
const makeRoot=(children)=>({name:'root',children,traverse(callback){
 const walk=(item)=>{callback(item);for(const child of item.children||[])walk(child);};walk(this);
}});
const left=node('Glute_L',{isBone:true}),right=node('Glute_R',{isBone:true});
const mesh=node('skin',{isSkinnedMesh:true,isMesh:true,morphTargetDictionary:{Glute_L:0,Glute_R:1},morphTargetInfluences:[0,0],
 skeleton:{bones:[left,right]},geometry:{morphAttributes:{position:[{count:2},{count:2}]},attributes:{skinIndex:attr([[0,1,5,5],[0,1,5,5]]),skinWeight:attr([[.8,.2,0,0],[0,.7,0,0]])}}});
const rootNode=makeRoot([left,right,mesh]);
const rig=glute.collectGluteRigV741(rootNode);
check(rig.available,'weighted bones and morphs available');
eq(rig.unweighted,[]);
for(const driver of ['auto','bone','morph'])check(glute.supportsGluteDriverV741(rig,driver),driver+' available');
check(glute.describeGluteRigV741(rig).includes('Glute_L'),'diagnostic contains target');
const insufficient=makeRoot([left,right,node('skinned',{isSkinnedMesh:true,isMesh:true,
 skeleton:{bones:[left,right]},geometry:{attributes:{skinIndex:attr([[0,1,0,0]]),skinWeight:attr([[0,0,0,0]])}}})]);
const missing=glute.collectGluteRigV741(insufficient);
check(!missing.available,'unweighted bones are not usable');
check(missing.unweighted.length===2,'unweighted warning names');
check(!glute.supportsGluteDriverV741(missing,'bone'),'warn missing driver');
const fakeMorph=glute.collectGluteRigV741(makeRoot([node('unshaped',{isMesh:true,morphTargetDictionary:{Glute_L:0,Glute_R:1},morphTargetInfluences:[0,0]})]));
check(!fakeMorph.available&&fakeMorph.warnings.some(msg=>msg.includes('ohne Positions-Shape')),'reject dictionary-only fake morphs');
const oneMorph=glute.collectGluteRigV741(makeRoot([node('one',{isMesh:true,morphTargetDictionary:{Glute_L:0},morphTargetInfluences:[0],geometry:{morphAttributes:{position:[{count:1}]}}})]));
check(oneMorph.available && !glute.supportsGluteDriverV741(oneMorph,'morph'),'partial support flagged');
const lonely=oneMorph.morphs.left[0].mesh;
glute.applyGluteRigV741(oneMorph,glute.createGluteOverlayV741(),{left:.2,right:0},
 {enabled:true,strength:100,left:100,right:100,driver:'morph'},1);
check(lonely.morphTargetInfluences[0]===0,'partial rig never creates lopsided deformation');
const sample=(mode,sec)=>hip.sampleHipDanceV735({settings:{mode,strength:90,speed:100},seconds:sec,
 bpm:135,genre:'hardtekk',section:'hook',playing:true,reducedMotion:false,
 footIKEnabled:true,contactKnown:true,plantedLeft:false,plantedRight:false});
const active={enabled:true,strength:100,left:100,right:100,driver:'auto'};
const off={...active,enabled:false};
for(const mode of ['Hip_Sway','Hip_Circle','Hip_Bounce']){
 for(let frame=0;frame<2400;frame++){
  const seconds=frame/40;
  const v=glute.sampleGluteV741({mode,pose:sample(mode,seconds),playing:true,reducedMotion:false,settings:active});
  check(Number.isFinite(v.left)&&Number.isFinite(v.right)&&v.left>=0&&v.left<=.24&&v.right>=0&&v.right<=.24,'bounded side channels');
  const muted=glute.sampleGluteV741({mode,pose:sample(mode,seconds),playing:false,reducedMotion:false,settings:active});
  eq(muted,{left:0,right:0},'paused neutral');
 }
}
const pose=sample('Hip_Circle',.41),base={pose,mode:'Hip_Circle',playing:true,reducedMotion:false,settings:active};
for(const patch of [{playing:false},{reducedMotion:true},{manualPriority:true},{mode:'off'},
 {settings:off},{settings:{...active,strength:0}},{pose:{...pose,hipPitch:NaN}}])
 eq(glute.sampleGluteV741({...base,...patch}),{left:0,right:0},'safety gating');
const full=glute.sampleGluteV741(base);
const sideOff=glute.sampleGluteV741({...base,settings:{...active,left:0}});
eq(sideOff.left,0,'independent left enabled');eq(sideOff.right,full.right,'right unchanged');
const overlay=glute.createGluteOverlayV741();
for(let frame=0;frame<1000;frame++){
 glute.applyGluteRigV741(rig,overlay,{left:.2,right:.16},active,1/60);
 check(mesh.morphTargetInfluences[0]>=0&&mesh.morphTargetInfluences[0]<=.21,'morph no accumulate');
 check(mesh.morphTargetInfluences[1]>=0&&mesh.morphTargetInfluences[1]<=.17,'right no accumulate');
}
check(left.rotation.x===0 && right.rotation.x===0,'auto morph first, no bone double application');
const morphBefore=mesh.morphTargetInfluences.slice();
for(let frame=0;frame<150;frame++)glute.applyGluteRigV741(rig,overlay,{left:0,right:0},off,1/60);
check(mesh.morphTargetInfluences[0]<.00001&&mesh.morphTargetInfluences[1]<.00001,'disable decays overlays');
// Mixer writes original clip curves back: overlay must be reapplied, not lost.
mesh.morphTargetInfluences[0]=.4;glute.applyGluteRigV741(rig,overlay,{left:.1,right:0},active,1);
check(Math.abs(mesh.morphTargetInfluences[0]-.5)<1e-5,'morph adds to authored clip');
for(let frame=0;frame<120;frame++)glute.applyGluteRigV741(rig,overlay,{left:.1,right:0},active,1/60);
check(mesh.morphTargetInfluences[0]<.501&&mesh.morphTargetInfluences[0]>.495,'static morph does not accumulate');
// Bone-only validation with weighted bones and no morphs.
const boneRig=glute.collectGluteRigV741(makeRoot([left,right,mesh]));
const boneOverlay=glute.createGluteOverlayV741();
for(let i=0;i<200;i++)glute.applyGluteRigV741(boneRig,boneOverlay,{left:.2,right:.2},{...active,driver:'bone'},1/60);
check(Math.abs(left.rotation.x)<.05&&Math.abs(right.rotation.x)<.05,'bone rotations bounded');
check(left.rotation.x>0&&right.rotation.x<0,'independent opposite sign');
for(let i=0;i<150;i++)glute.applyGluteRigV741(boneRig,boneOverlay,{left:0,right:0},off,1/60);
check(Math.abs(left.rotation.x)<.00001&&Math.abs(right.rotation.x)<.00001,'bone clears');
const paths=['components/visualizer/GltfDancerAvatarV492.tsx','components/visualizer/AvatarEditor.tsx','components/SettingsPanel.tsx','context/UiPreferencesContext.tsx','types/music.ts'];
for(const p of paths)check(read(p).includes('V741')||read(p).includes('GluteRigV741')||read(p).includes('gluteV741'),'integrated '+p);
check(read('components/visualizer/AvatarEditor.tsx').includes('cloneSkinnedScene(scene)'),'preview preserves skin binding');
console.log(`PASS V741: ${checks} numeric, skinning, mixer reset, UI and integration checks`);
