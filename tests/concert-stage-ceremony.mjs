import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {AnimationMixer,Object3D,Quaternion,Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';
const require=createRequire(import.meta.url),load=require('./helpers/load-stage-typescript.cjs');
const {stepCrew,newCrewState}=load('components/visualizer/sonicCrewDirector.ts'),{prepareCrewReaction,applyCrewReaction}=load('components/visualizer/sonicCrewReaction.ts');
const {placeConcertParticle}=load('lib/concertStageShow.ts'),{lyrics}=require('./fixtures/concertMocksV1130.cjs');
const marker=new Object3D();
for(const kind of ['rise','confetti'])for(let i=0;i<32;i++)for(let t=0;t<=3;t+=.05){placeConcertParticle(marker,kind,i,t);marker.updateMatrix();assert(marker.matrix.elements.every(Number.isFinite));assert(Math.abs(marker.position.x)<3&&marker.position.y>=-1.95&&marker.position.y<3&&marker.position.z< -2,'Particles stay behind performers, within the stage');}
for(const asset of JSON.parse(readFileSync('public/avatars/sonic/manifest.json'))){
 const bytes=readFileSync('public/avatars/sonic/'+asset.file),g=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 for(const progressMs of [2000,18000,99000]){
  const model=clone(g.scene),reference=clone(g.scene),mixer=new AnimationMixer(model),expected=new AnimationMixer(reference),reaction=prepareCrewReaction(model),baseline=prepareCrewReaction(reference);
  const plan=stepCrew(newCrewState(),{trackId:'ceremony',modelId:'sonic-'+asset.file.replace('.glb',''),clips:g.animations,progressMs,durationMs:100000,lyrics,genre:'house',count:3,slot:0,playing:true,reducedMotion:false,manualPriority:false,settings:{enabled:true,reactions:true,mode:'adaptive',showPlans:true,scenery:true}}).plan;
  const clip=g.animations.find(c=>c.name===plan.clip);assert(clip);mixer.clipAction(clip).play();expected.clipAction(clip).play();
  for(let frame=0;frame<40;frame++){
   mixer.setTime(frame/60%clip.duration);expected.setTime(frame/60%clip.duration);
   applyCrewReaction(reaction,plan,plan.beat,.5,1/60);applyCrewReaction(baseline,{...plan,story:{...plan.story,scenery:false}},plan.beat,.5,1/60);
   model.updateMatrixWorld(true);reference.updateMatrixWorld(true);
   for(const name of ['LeftFoot','RightFoot'])assert(model.getObjectByName(name).getWorldPosition(new Vector3()).distanceTo(reference.getObjectByName(name).getWorldPosition(new Vector3()))<1e-6,'Ceremony must not move authored feet');
  }
  assert(model.getObjectByName('Chest').getWorldQuaternion(new Quaternion()).angleTo(reference.getObjectByName('Chest').getWorldQuaternion(new Quaternion()))>1e-5,'Real upper-body pose must visibly differ');
  applyCrewReaction(reaction,{...plan,active:false},plan.beat,.5,1/60);assert(reaction.every(item=>!item.owned));
  mixer.stopAllAction();expected.stopAllAction();mixer.uncacheRoot(model);expected.uncacheRoot(reference);
 }
 console.log(`PASS ceremony ${asset.file}: audience greeting, incoming solo preparation, finale acknowledgement; actual foot poses unchanged and pause releases ownership`);
}
