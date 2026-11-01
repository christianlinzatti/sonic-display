'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const source=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const modules={};
const vec=(x=0,y=0,z=0)=>new V3(x,y,z);
class V3{
 constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z});}
 distanceTo(v){return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z);}
}
class Euler{constructor(x,y,z){Object.assign(this,{x,y,z});}}
class Quaternion{
 constructor(x=0,y=0,z=0,w=1){Object.assign(this,{x,y,z,w});}
 clone(){return new Quaternion(this.x,this.y,this.z,this.w);}
 setFromEuler(e){const a=Math.sin(e.x/2),b=Math.sin(e.y/2),c=Math.sin(e.z/2);
 const A=Math.cos(e.x/2),B=Math.cos(e.y/2),C=Math.cos(e.z/2);
 this.x=a*B*C+A*b*c;this.y=A*b*C-a*B*c;this.z=A*B*c+a*b*C;this.w=A*B*C-a*b*c;return this;}
 multiply(q){const {x,y,z,w}=this;this.x=w*q.x+x*q.w+y*q.z-z*q.y;
  this.y=w*q.y-x*q.z+y*q.w+z*q.x;this.z=w*q.z+x*q.y-y*q.x+z*q.w;
  this.w=w*q.w-x*q.x-y*q.y-z*q.z;return this;}
}
class Track{constructor(name,times,values){Object.assign(this,{name,times,values});}}
class AnimationClip{constructor(name,duration,tracks){Object.assign(this,{name,duration,tracks});}}
let lastExport;
class GLTFExporter{async parseAsync(scene,options){lastExport={scene,options};return new ArrayBuffer(256);}}
const avatarRoot={nodes:[],updateWorldMatrix(){},traverse(fn){this.nodes.forEach(fn);}};
const mk=(name,world)=>({name,quaternion:new Quaternion(),position:vec(.1,1,0),parent:{getWorldScale(){return vec(1,1,1);}},
 getWorldPosition(){return vec(...world);}});
const targets={hips:mk('pelvis',[0,1.2,0]),spine:mk('spine',[0,1.5,0]),
 leftLeg:mk('leftThigh',[-.1,.9,0]),rightLeg:mk('rightThigh',[.1,.9,0]),
 leftFoot:mk('leftFoot',[-.1,0,0]),rightFoot:mk('rightFoot',[.1,0,0])};
avatarRoot.nodes=Object.values(targets);
const stubs={
 'three':{AnimationClip,Euler,Quaternion,QuaternionKeyframeTrack:Track,Vector3:V3,VectorKeyframeTrack:Track},
 'three/examples/jsm/exporters/GLTFExporter.js':{GLTFExporter},
 'three/examples/jsm/utils/SkeletonUtils.js':{clone:s=>s},
 './avatarRigController':{findAvatarRigTargets:()=>targets},
 './privateGltfLifecycleV769':{withPrivateGltfV769:async(_url,fn)=>fn({scene:avatarRoot})},
 './disposeClonedAvatarSkeletonsV654':{disposeClonedAvatarSkeletonsV654:()=>0}
};
function load(rel){if(modules[rel])return modules[rel];
 const compiled=ts.transpileModule(source(rel),{fileName:rel,
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},reportDiagnostics:true});
 assert.equal(compiled.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
 const m={exports:{}};
 new Function('module','exports','require',compiled.outputText)(m,m.exports,dep=>{
  if(stubs[dep])return stubs[dep];
  if(dep==='./hipDanceV735')return load('components/visualizer/hipDanceV735.ts');
  if(dep==='./hipClipAvailabilityV739')return load('components/visualizer/hipClipAvailabilityV739.ts');
  throw Error('Unexpected import '+dep);
 });
 return modules[rel]=m.exports;
}
const check=load('components/visualizer/hipClipAvailabilityV739.ts');
const motion=load('components/visualizer/hipGlbMotionV739.ts');
let checks=0;
for(const name of check.HIP_GLB_NAMES_V739){
 for(const [sel,names,ready,kind] of [
  [`glb:${name}`,[],false,'loading'],[`glb:${name}`,[],true,'missing'],
  [`glb:${name}`,[name],true,'glb'],[`procedural:${name}`,[],true,'procedural']]){
  const res=check.resolveClipAvailabilityV739(sel,names,ready);
  assert.equal(res.kind,kind);assert.equal(res.clip,kind==='glb'||kind==='procedural'?name:null);
  assert(kind!=='missing'||/nicht vorhanden/.test(res.message));checks+=3;
 }
}
assert.equal(check.resolveClipAvailabilityV739('glb:Unknown',[],true).kind,'missing');
assert.equal(check.resolveClipAvailabilityV739('procedural:Unknown',[],true).kind,'missing');
assert.equal(check.resolveClipAvailabilityV739('',[],true).kind,'none');checks+=3;
for(const name of check.HIP_GLB_NAMES_V739)
for(const bpm of [65,120,190])for(const speed of [50,100,125,200]){
 const c=motion.bakeHipMotionClipV739(avatarRoot,name,{bpm,speed,strength:70});
 assert.equal(c.name,name);assert(c.tracks.length>=4);assert(c.duration>.4);
 for(const track of c.tracks){
  assert(track.times.length>=8);assert(track.name.includes('.'));checks+=2;
  assert(track.values.every(Number.isFinite));checks++;
  const stride=track.name.endsWith('.position')?3:4;
  assert.equal(track.values.length,track.times.length*stride);checks++;
  for(let i=1;i<track.times.length;i++){assert(track.times[i]>track.times[i-1]);checks++;}
  // Generated loops must begin/end in the same pose for BPM/speed variation.
  for(let i=0;i<stride;i++)assert(Math.abs(track.values[i]-track.values.at(-stride+i))<1e-9,track.name+' seam'),checks++;
 }
}
const temp=targets.hips;delete targets.hips;
assert.throws(()=>motion.bakeHipMotionClipV739(avatarRoot,'Hip_Sway',{bpm:120,speed:100,strength:70}),/Hips/);checks++;
targets.hips=temp;
const editor=source('components/visualizer/AvatarEditor.tsx');
const lib=source('components/CharacterMotionLibraryPanel.tsx');
assert.match(editor,/role=\{clipAvailabilityV739.kind==='missing'\?'alert'/);checks++;
assert.match(editor,/setClipInventoryV739\(null\)/);checks++;
assert.match(editor,/prozedural · ohne GLB-Clip/);checks++;
assert.match(lib,/verifyMotionFileV739\(url\)/);checks++;
assert.match(lib,/role="alert"/);checks++;
(async()=>{
 const f=await motion.exportHipMotionGlbV739('/avatars/demo.glb','Hip_Bounce',{bpm:130,strength:60,speed:100});
 assert.match(f.name,/Hip_Bounce-v739\.glb$/);assert.equal(lastExport.options.animations.length,1);
 assert.equal(lastExport.options.animations[0].name,'Hip_Bounce');checks+=3;
 console.log(`PASS V739 hip GLB selection, warnings, baking and export: ${checks} checks`);
})().catch(e=>{console.error(e);process.exitCode=1;});
