import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {AnimationMixer,Vector3,Quaternion} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
const require=createRequire(import.meta.url),load=require('./helpers/load-stage-typescript.cjs');
const {concertStoryV1131,crewInteractionV1131}=load('lib/concertStoryV1131.ts');
const {prepareCrewReaction,applyCrewReaction}=load('components/visualizer/sonicCrewReaction.ts');
for(const [slot,slug] of ['neon-pulse','rio-carnival','quantum-bass'].entries()){
 const b=readFileSync(`public/avatars/sonic/${slug}.glb`),g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
 const mixer=new AnimationMixer(g.scene),clip=g.animations.find(c=>c.name==='Dance_DiagonalStep');mixer.clipAction(clip).play();
 const nodes=prepareCrewReaction(g.scene),cue=concertStoryV1131({progressMs:8000,bpm:120,count:3,section:'verse'});
 const plan={active:true,clip:clip.name,part:'verse',beat:16,bpm:120,offset:0,leader:cue.leader,reaction:slot===2?'led':'nod',reason:'music',story:cue,interaction:crewInteractionV1131(cue,slot,3)};
 for(let frame=0;frame<240;frame++){
  mixer.setTime(frame/60);g.scene.updateMatrixWorld(true);
  const feet=['LeftFoot','RightFoot'].map(n=>g.scene.getObjectByName(n).getWorldPosition(new Vector3()));
  applyCrewReaction(nodes,plan,16+frame/30,.65);g.scene.updateMatrixWorld(true);
  feet.forEach((p,i)=>assert(p.distanceTo(g.scene.getObjectByName(i===0?'LeftFoot':'RightFoot').getWorldPosition(new Vector3()))<1e-5,'Partner body language must not move grounded feet'));
 }
 const bases=nodes.map(n=>n.baseQ.clone());
 for(let frame=0;frame<1000;frame++)applyCrewReaction(nodes,plan,frame/30,.7);
 for(let i=0;i<nodes.length;i++){const angle=nodes[i].node.quaternion.clone().normalize().angleTo(bases[i].clone().normalize());assert(angle<.17,`${nodes[i].node.name}: overlays must not accumulate (${angle})`);}
 applyCrewReaction(nodes,{...plan,active:false},0,0);
 for(let i=0;i<nodes.length;i++)assert(nodes[i].node.quaternion.clone().normalize().angleTo(bases[i].clone().normalize())<1e-5,'Pause/manual guard releases the overlay');
 mixer.stopAllAction();mixer.uncacheRoot(g.scene);
 console.log(`PASS V1131 ${slug}: real-rig partner gaze/arm response, fixed feet, bounded overlay and cleanup`);
}
