import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {AnimationMixer,Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
const require=createRequire(import.meta.url),load=require('./helpers/load-stage-typescript.cjs');
const {collectAvatarRigNodes}=load('components/visualizer/avatarRigController.ts');
const {initializeFootIK,updateFootIK}=load('components/visualizer/avatarFootIK.ts');
const {newShowAudit,sampleShowAudit}=load('lib/showQualityAudit.ts');
let totalRaw=0,totalCorrected=0;
for(const asset of JSON.parse(readFileSync('public/avatars/sonic/manifest.json'))){
 const bytes=readFileSync('public/avatars/sonic/'+asset.file),g=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const model=g.scene,mixer=new AnimationMixer(model),targets=collectAvatarRigNodes(model).targets,ik=initializeFootIK(model,targets);
 assert(ik.left&&ik.right,asset.file+' must have two recognized legs');
 const clip=g.animations.find(c=>c.name==='Idle_Breathe');mixer.clipAction(clip).play();
 const hips=model.getObjectByName('Hips'),foot=targets.leftFoot,raw=newShowAudit(),corrected=newShowAudit();
 let beforeRaw, beforeCorrected,rawPath=0,correctedPath=0;
 for(let frame=0;frame<360;frame++){
  const time=frame/60;mixer.setTime(time%clip.duration);
  // Controlled pelvis disturbance on each actual rig; this is not a claim about all dances.
  hips.position.x+=Math.sin(time*2)*.018;
  model.updateWorldMatrix(true,true);const observed=foot.getWorldPosition(new Vector3());
  updateFootIK(ik,model,1/60,true,.7,.55,.65,undefined,undefined,undefined,{trackId:'rig-check',playheadMs:time*1000},{enabled:true,intensity:.55});
  model.updateWorldMatrix(true,true);const actual=foot.getWorldPosition(new Vector3());
  assert(actual.toArray().every(Number.isFinite));
  const planted=ik.left.contact.phase==='planted'&&ik.left.contact.confidence>.6;
  sampleShowAudit(raw,{time,left:observed,leftPlanted:planted});sampleShowAudit(corrected,{time,left:actual,leftPlanted:planted});
  if(frame>60&&beforeRaw&&beforeCorrected){rawPath+=Math.hypot(observed.x-beforeRaw.x,observed.z-beforeRaw.z);correctedPath+=Math.hypot(actual.x-beforeCorrected.x,actual.z-beforeCorrected.z);}
  beforeRaw=observed;beforeCorrected=actual;
 }
 assert(corrected.plantedSeconds>1,'Auditor requires actual planted contact');
 assert(correctedPath<rawPath*.85,`${asset.file}: bounded existing IK must reduce residual drift (${correctedPath}/${rawPath})`);
 totalRaw+=rawPath;totalCorrected+=correctedPath;
 updateFootIK(ik,model,1/60,false);assert.equal(ik.initialized,false);assert.equal(ik.left.contact.phase,'airborne');
 mixer.stopAllAction();mixer.uncacheRoot(model);
 console.log(`PASS ${asset.file}: observed pelvis disturbance, actual planted contacts, bounded correction (${Math.round(correctedPath/rawPath*100)}% residual path), pause releases anchors`);
}
assert(totalCorrected<totalRaw*.85);
