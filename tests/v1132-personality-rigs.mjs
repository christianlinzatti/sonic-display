import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {AnimationMixer,Vector3,Quaternion} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
const require=createRequire(import.meta.url),load=require('./helpers/load-stage-typescript.cjs');
const {performerPersonaV1132}=load('lib/performerPersonalityV1132.ts');
const {concertStoryV1131,crewInteractionV1131}=load('lib/concertStoryV1131.ts');
const {prepareCrewReaction,applyCrewReaction}=load('components/visualizer/sonicCrewReaction.ts');
const manifest=JSON.parse(readFileSync('public/avatars/sonic/manifest.json','utf8'));
const signatures=[];
for(const asset of manifest){
 const slug=asset.file.slice(0,-4),b=readFileSync('public/avatars/sonic/'+asset.file);
 const g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
 const mixer=new AnimationMixer(g.scene),clip=g.animations.find(c=>c.name==='Dance_DiagonalStep');mixer.clipAction(clip).play();
 const refs=prepareCrewReaction(g.scene),cue=concertStoryV1131({progressMs:8000,section:'verse',bpm:120,count:3,energy:.7});
 const plan={active:true,clip:clip.name,part:'verse',beat:16,bpm:120,offset:0,leader:cue.leader,reaction:'nod',reason:'music',story:cue,
  interaction:crewInteractionV1131(cue,1,3),persona:performerPersonaV1132('sonic-'+slug),expressionGain:1.25};
 for(let frame=0;frame<120;frame++){
  mixer.setTime(frame/60);g.scene.updateMatrixWorld(true);
  const feet=['LeftFoot','RightFoot'].map(n=>g.scene.getObjectByName(n).getWorldPosition(new Vector3()));
  applyCrewReaction(refs,plan,16+frame/30,.7,1/60);g.scene.updateMatrixWorld(true);
  feet.forEach((p,i)=>assert(p.distanceTo(g.scene.getObjectByName(i?'RightFoot':'LeftFoot').getWorldPosition(new Vector3()))<1e-5));
 }
 signatures.push(refs.filter(x=>['Head','Chest'].includes(x.node.name)).flatMap(x=>[x.channels.x,x.channels.y,x.channels.z]).map(x=>x.toFixed(6)).join(','));
 const head=refs.find(x=>x.node.name==='Head'),prior=head.channels.y;
 applyCrewReaction(refs,{...plan,interaction:{...plan.interaction,yaw:-.09}},20,.7,1/60);
 assert(Math.abs(head.channels.y-prior)<.04,'Role changes must approach their new expression gradually');
 for(let frame=0;frame<1000;frame++)applyCrewReaction(refs,plan,frame/30,.7,1/60);
 for(const item of refs)assert(item.node.quaternion.clone().normalize().angleTo(item.baseQ.clone().normalize())<.22,'Personality accents remain bounded');
 applyCrewReaction(refs,{...plan,active:false},0,0,1/60);
 for(const item of refs){assert(item.node.quaternion.clone().normalize().angleTo(item.baseQ.clone().normalize())<1e-5);assert.equal(item.channels.x,0);}
 mixer.stopAllAction();mixer.uncacheRoot(g.scene);
 console.log(`PASS V1132 ${slug}: personality, stable feet, eased roles, bounded accents and pause cleanup`);
}
assert.equal(new Set(signatures).size,11,'All eleven real rigs must receive different personality accents');
