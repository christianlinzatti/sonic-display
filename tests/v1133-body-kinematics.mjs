import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {AnimationMixer,Vector3,Quaternion} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
const require=createRequire(import.meta.url),load=require('./helpers/load-stage-typescript.cjs');
const {FULL_BODY_CLIPS_V1133}=load('lib/fullBodyPerformanceV1133.ts');
const files=process.env.SONIC_ASSET_PROBE?[process.env.SONIC_ASSET_PROBE]:JSON.parse(readFileSync('public/avatars/sonic/manifest.json','utf8')).map(a=>a.file.slice(0,-4));
for(const slug of files){
 const b=readFileSync(`public/avatars/sonic/${slug}.glb`),g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
 const mixer=new AnimationMixer(g.scene),hips=g.scene.getObjectByName('Hips'),feet=['LeftFoot','RightFoot'].map(n=>g.scene.getObjectByName(n));
 const anchor=feet.map(n=>n.getWorldPosition(new Vector3()));let profiles=[];
 for(const name of FULL_BODY_CLIPS_V1133){
  const clip=g.animations.find(c=>c.name===name);assert(clip,`${slug}/${name} exists`);mixer.stopAllAction();mixer.clipAction(clip).play();
  let minHip=Infinity,maxHip=-Infinity,minX=Infinity,maxX=-Infinity,maxTurn=0;const samples=[];
  mixer.setTime(0);g.scene.updateMatrixWorld(true);const initial=hips.getWorldQuaternion(new Quaternion());
  for(let i=0;i<240;i++){
   const time=clip.duration*i/240,phase=time/clip.duration*Math.PI*2;mixer.setTime(time);g.scene.updateMatrixWorld(true);
   const hip=hips.getWorldPosition(new Vector3());minHip=Math.min(minHip,hip.y);maxHip=Math.max(maxHip,hip.y);minX=Math.min(minX,hip.x);maxX=Math.max(maxX,hip.x);
   maxTurn=Math.max(maxTurn,hips.getWorldQuaternion(new Quaternion()).angleTo(initial));
   for(let side=0;side<2;side++){
    const p=feet[side].getWorldPosition(new Vector3());assert(p.toArray().every(Number.isFinite));
    const planted=side===0?Math.sin(phase)<=0:Math.sin(phase)>=0;
    if(planted)assert(p.distanceTo(anchor[side])<.0015,`${slug}/${name}: planted foot drift`);
   }
   if(i===55)samples.push(hip.x,hip.y,hip.z,...feet.flatMap(n=>n.getWorldPosition(new Vector3()).toArray()));
  }
  assert(maxHip-minHip>.045,'Whole-body phrases must visibly compress the knees/hips');assert(maxX-minX>.075,'Weight shift must use the pelvis, not only the arms');
  if(name==='Dance_TurnPhrase')assert(maxTurn>.35,'Turning phrase must rotate the pelvis visibly');
  profiles.push(samples.map(x=>x.toFixed(4)).join(','));
 }
 assert.equal(new Set(profiles).size,6,'Six whole-body phrases must have different pelvis/foot trajectories');
 mixer.stopAllAction();mixer.uncacheRoot(g.scene);console.log(`PASS V1133 ${slug}: six distinct whole-body paths, weight shift, knee compression, pelvic turn and planted feet`);
}
