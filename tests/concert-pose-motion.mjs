import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {AnimationMixer} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
const require=createRequire(import.meta.url),load=require('./helpers/load-stage-typescript.cjs');
const {choosePoseAwareCrew}=load('lib/poseAwareCrew.ts');
const {collectAvatarRigNodes}=load('components/visualizer/avatarRigController.ts'),{initializeFootIK,updateFootIK}=load('components/visualizer/avatarFootIK.ts');
let changed=0;
for(const asset of JSON.parse(readFileSync('public/avatars/sonic/manifest.json'))){
 const bytes=readFileSync('public/avatars/sonic/'+asset.file),g=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 let variants=new Set();
 for(let i=0;i<20;i++){
  const result=choosePoseAwareCrew({clips:g.animations,outgoing:'Dance_RobotGroove',candidate:'Dance_CrossStep',outTime:i/5,time:d=>(i/5)%d,genre:'house',left:i%2===0,right:i%2===1});
  assert(g.animations.some(c=>c.name===result));variants.add(result);if(result!=='Dance_CrossStep')changed++;
 }
 const mixer=new AnimationMixer(g.scene),clip=g.animations.find(c=>c.name==='Dance_CrossStep');mixer.clipAction(clip).play();const ik=initializeFootIK(g.scene,collectAvatarRigNodes(g.scene).targets);let single=0;
 for(let frame=0;frame<360;frame++){mixer.setTime(frame/60%clip.duration);updateFootIK(ik,g.scene,1/60,true,.7,.5,.5,undefined,undefined,undefined,undefined,undefined,{pending:true,phase:frame/120%1});if((ik.left.contact.phase==='planted')!==(ik.right.contact.phase==='planted'))single++;}
 assert(single>10,'Navigation must create measured single-support steps on '+asset.file);mixer.stopAllAction();mixer.uncacheRoot(g.scene);
 assert(variants.size>1,'Actual changing leg poses must affect the choice');
 console.log('PASS pose-aware choice on '+asset.file+': '+[...variants].join(', '));
}
assert(changed>20);
