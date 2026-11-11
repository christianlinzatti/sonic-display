import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {AnimationMixer,Vector3,Quaternion,Group} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';
const require=createRequire(import.meta.url),load=require('./helpers/load-stage-typescript.cjs');
const {stepCrew,newCrewState}=load('components/visualizer/sonicCrewDirector.ts'),{prepareCrewReaction,applyCrewReaction}=load('components/visualizer/sonicCrewReaction.ts');
const {newMotionFxState,sampleMotionEffects}=load('lib/concertMotionEffects.ts');
for(const asset of JSON.parse(readFileSync('public/avatars/sonic/manifest.json'))){
 const bytes=readFileSync('public/avatars/sonic/'+asset.file),g=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const model=clone(g.scene),reference=clone(g.scene),mixer=new AnimationMixer(model),expected=new AnimationMixer(reference),reaction=prepareCrewReaction(model),baseline=prepareCrewReaction(reference);
 const plan=stepCrew(newCrewState(),{trackId:'musical-rig',modelId:'sonic-'+asset.file.replace('.glb',''),clips:g.animations,progressMs:14000,durationMs:180000,genre:'house',energy:.6,section:'verse',count:3,slot:0,playing:true,reducedMotion:false,manualPriority:false,settings:{enabled:true,reactions:true,mode:'adaptive',showPlans:true,scenery:true},audioEvidence:{source:'microphone',confidence:.95,phase:.03,energy:.6,onset:.9,anticipation:.1,bass:.9,snare:.9,attack:.8,highs:.7}}).plan;
 assert(plan.dance?.measured);const clip=g.animations.find(c=>c.name===plan.clip);assert(clip);mixer.clipAction(clip).play();expected.clipAction(clip).play();
 let difference=0;
 for(let frame=0;frame<120;frame++){
  mixer.setTime(frame/60%clip.duration);expected.setTime(frame/60%clip.duration);
  const beat=plan.beat+frame/30;applyCrewReaction(reaction,plan,beat,.6,1/60);applyCrewReaction(baseline,{...plan,dance:null},beat,.6,1/60);
  model.updateMatrixWorld(true);reference.updateMatrixWorld(true);
  for(const name of ['Hips','LeftFoot','RightFoot'])assert(model.getObjectByName(name).getWorldPosition(new Vector3()).distanceTo(reference.getObjectByName(name).getWorldPosition(new Vector3()))<1e-6,'Musical accents must preserve hips and planted feet');
  difference=Math.max(difference,model.getObjectByName('Chest').getWorldQuaternion(new Quaternion()).angleTo(reference.getObjectByName('Chest').getWorldQuaternion(new Quaternion())));
  for(const {node} of reaction)assert(node.quaternion.toArray().every(Number.isFinite));
 }
 assert(difference>.001,'Measured channels visibly change real upper-body motion');
 applyCrewReaction(reaction,{...plan,active:false},plan.beat,.6);assert(reaction.every(item=>!item.owned));
 mixer.stopAllAction();expected.stopAllAction();
 const grounded=new Group();grounded.add(model);
 for(const scale of [.6,1,1.8]){
  model.scale.setScalar(scale);grounded.position.y=-1.95+scale;
  mixer.clipAction(g.animations.find(c=>c.name==='Dance_CrossStep')).reset().play();
  const fx=newMotionFxState();let contacts=0,handSegments=0;
  for(let frame=0;frame<480;frame++){
   mixer.setTime(frame/60);grounded.updateMatrixWorld(true);
   const points=['LeftHand','RightHand','LeftFoot','RightFoot'].map(name=>{const p=model.getObjectByName(name).getWorldPosition(new Vector3());return{x:p.x,y:p.y-(name.endsWith('Foot')?.12*scale:0),z:p.z,scale};});
   const sample=sampleMotionEffects(fx,{source:'rig-'+scale,position:10000+frame/60*1000,now:frame/60,allowed:true,points:[points[0],points[1],undefined,undefined,points[2],points[3]]});
   if(sample.landing)contacts++;handSegments+=sample.segments.length;
  }
  assert(contacts>0,'Real scaled clip foot swings must generate observed floor accents');
  assert(handSegments>0,'Real scaled hand motion must generate visible trail segments');
  mixer.stopAllAction();
 }
 mixer.uncacheRoot(model);expected.uncacheRoot(reference);
 console.log(`PASS musical rig ${asset.file}: measured bass/percussion accents, finite owned pose, unchanged real hips/feet, real hand trails and sole landings at 0.6/1/1.8 scale, pause cleanup`);
}
