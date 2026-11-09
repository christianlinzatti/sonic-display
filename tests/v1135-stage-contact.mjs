import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {Group,AnimationMixer,Vector3,Quaternion} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
const require=createRequire(import.meta.url),load=require('./helpers/load-stage-typescript.cjs');
const {stagePlacementV1135}=load('lib/stagePresenceV1135.ts');
const {prepareCrewReaction,applyCrewReaction}=load('components/visualizer/sonicCrewReaction.ts');
const {performerPersonaV1132}=load('lib/performerPersonalityV1132.ts');
const {concertScoreV1134}=load('lib/concertScoreV1134.ts');
const manifest=JSON.parse(readFileSync('public/avatars/sonic/manifest.json'));
for(const asset of manifest){
 const b=readFileSync('public/avatars/sonic/'+asset.file),g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
 const model=g.scene,parent=new Group(),actor=new Group();parent.add(actor);actor.add(model);const mixer=new AnimationMixer(model),refs=prepareCrewReaction(model);
 const feet=['LeftFoot','RightFoot'].map(n=>model.getObjectByName(n));
 const probes=feet.map(foot=>{let best=null;model.updateMatrixWorld(true);model.traverse(mesh=>{
  if(!mesh.isSkinnedMesh)return;const joint=mesh.skeleton.bones.indexOf(foot),a=mesh.geometry.attributes;
  for(let i=0;i<a.position.count;i++){if(a.skinIndex.getX(i)!==joint||a.skinWeight.getX(i)<.99)continue;
   const point=mesh.applyBoneTransform(i,new Vector3().fromBufferAttribute(a.position,i)).applyMatrix4(mesh.matrixWorld);
   if(!best||point.y<best.y)best={mesh,index:i,y:point.y};}
 });return best;});assert(probes.every(Boolean));
 for(const scale of [.6,1,1.8]){
  actor.scale.setScalar(scale);parent.position.y=stagePlacementV1135({bundled:true,adaptive:true,manual:false,scale,offsetY:0}).y;
  for(const name of ['Dance_RobotGroove','Dance_DiagonalStep','Dance_TurnPhrase']){
   const clip=g.animations.find(c=>c.name===name),action=mixer.clipAction(clip).reset().play();
   for(let frame=0;frame<120;frame++){
    mixer.setTime(frame/30);parent.updateMatrixWorld(true);
    const before=feet.map(f=>f.getWorldPosition(new Vector3()));
    const cue=concertScoreV1134({progressMs:8000+frame/30*1000,section:'verse',count:3,energy:.7});
    applyCrewReaction(refs,{active:true,reaction:'nod',beat:16,offset:0,persona:performerPersonaV1132('sonic-'+asset.file.slice(0,-4)),expressionGain:1.25,story:cue,interaction:{role:'lead',yaw:.09,armAccent:.055}},16+frame/15,.7,1/30);
    parent.updateMatrixWorld(true);
    feet.forEach((foot,i)=>assert(foot.getWorldPosition(new Vector3()).distanceTo(before[i])<1e-8,'Secondary upper-body motion must leave planted feet alone'));
    const soles=probes.map(p=>p.mesh.applyBoneTransform(p.index,new Vector3().fromBufferAttribute(p.mesh.geometry.attributes.position,p.index)).applyMatrix4(p.mesh.matrixWorld).y);
    assert(Math.abs(Math.min(...soles)+1.95)<.005,`${asset.file} @ ${scale}: the actual skinned sole must touch the visible floor`);
   }
   applyCrewReaction(refs,{active:false,reaction:'none'},0,0);
   for(const ref of refs){assert.equal(ref.velocity.x,0);assert(ref.node.quaternion.clone().normalize().angleTo(ref.baseQ.clone().normalize())<1e-5);}
   action.stop();
  }
 }
 applyCrewReaction(refs,{active:false,reaction:'none'},0,0);
 for(const ref of refs)assert.equal(ref.velocity.x,0);
 mixer.stopAllAction();console.log(`PASS V1135 ${asset.file}: real skinned soles meet stage at 0.6/1/1.8 scale; 3 clips; upper-body-only follow-through and clean release`);
}
