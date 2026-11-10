import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {AnimationMixer,Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';
const require=createRequire(import.meta.url),load=require('./helpers/load-stage-typescript.cjs');
const {applyCrewClockEntry}=load('lib/crewMotionQuality.ts');
const {PreviewClipPlayer}=load('components/visualizer/previewClipPlayer.ts');
for(const asset of JSON.parse(readFileSync('public/avatars/sonic/manifest.json'))){
 const bytes=readFileSync('public/avatars/sonic/'+asset.file),g=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const reference=clone(g.scene),mixer=new AnimationMixer(g.scene),expected=new AnimationMixer(reference),clip=g.animations.find(c=>c.name==='Dance_CrossStep');
 const action=mixer.clipAction(clip).reset().play(),ref=expected.clipAction(clip).reset().play();
 action.time=.07;assert(applyCrewClockEntry(action,9.3));mixer.update(0);ref.time=9.3%clip.duration;expected.update(0);
 for(const name of ['Hips','LeftFoot','RightFoot']){
  const a=g.scene.getObjectByName(name),b=reference.getObjectByName(name);if(a&&b)assert(a.getWorldPosition(new Vector3()).distanceTo(b.getWorldPosition(new Vector3()))<1e-6,'Leg evaluation uses the actual musical entry phase');
 }
 const time=action.time;assert(!applyCrewClockEntry(action,NaN));assert(!applyCrewClockEntry(action,undefined));assert.equal(action.time,time);
 mixer.stopAllAction();const player=new PreviewClipPlayer(mixer,g.scene);player.select(clip,.5,0);
 const next=g.animations.find(c=>c.name==='Dance_FluidArc');
 const feet=['LeftFoot','RightFoot'].map(n=>g.scene.getObjectByName(n));g.scene.updateMatrixWorld(true);
 const before=feet.map(f=>f.getWorldPosition(new Vector3()));player.select(next,1,.6);g.scene.updateMatrixWorld(true);
 feet.forEach((foot,i)=>assert(foot.getWorldPosition(new Vector3()).distanceTo(before[i])<1e-6));
 for(let frame=0;frame<90;frame++){player.update((1+frame/60)%next.duration,1/60);g.scene.updateMatrixWorld(true);for(const foot of feet)assert(foot.getWorldPosition(new Vector3()).toArray().every(Number.isFinite));}
 assert(!player.transitioning);player.dispose();mixer.stopAllAction();mixer.uncacheRoot(g.scene);expected.stopAllAction();expected.uncacheRoot(reference);
 console.log(`PASS song motion ${asset.file}: authoritative leg phase, preserved first pose, smooth finite real foot transitions and cleanup`);
}
