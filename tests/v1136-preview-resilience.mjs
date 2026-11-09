import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {AnimationClip,AnimationMixer,Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
const require=createRequire(import.meta.url),load=require('./helpers/load-stage-typescript.cjs');
const {PreviewClipPlayer}=load('components/visualizer/previewClipPlayer.ts');
const manifest=JSON.parse(readFileSync('public/avatars/sonic/manifest.json'));
for(const asset of manifest){
 const b=readFileSync('public/avatars/sonic/'+asset.file),g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
 const mixer=new AnimationMixer(g.scene),player=new PreviewClipPlayer(mixer,g.scene);
 const nodes=['Head','RightHand','LeftFoot','RightFoot'].map(n=>g.scene.getObjectByName(n));
 const capture=()=>{g.scene.updateMatrixWorld(true);return nodes.map(n=>n.getWorldPosition(new Vector3()));};
 // Float32 snapshot tracks retain the rendered pose within 0.01 mm.
 const same=(a,b)=>a.forEach((p,i)=>assert(p.distanceTo(b[i])<1e-5,`A change must begin at the rendered pose; node ${i}; displacement ${p.distanceTo(b[i])}`));
 const clips=['Dance_RobotGroove','Dance_TurnPhrase','Dance_FluidArc'].map(n=>g.animations.find(c=>c.name===n));
 player.select(clips[0],.7,0);player.update(.7,0);const stable=capture();
 for(const time of [NaN,Infinity,-Infinity]){player.update(time,1/60);same(stable,capture());player.seek(time);same(stable,capture());}
 for(const duration of [NaN,Infinity,0,-1]){const bad=new AnimationClip('bad',1,[]);bad.duration=duration;assert.throws(()=>player.select(bad,0,.4),RangeError);same(stable,capture());}
 const first=player.select(clips[0],NaN,0);assert.equal(first.time,0);assert(capture().every(v=>v.toArray().every(Number.isFinite)));
 for(let i=0;i<180;i++){
  const before=capture(),clip=clips[i%3];player.select(clip,(i*.137)%clip.duration,.45);same(before,capture());
  if(i%9===0){const beforeInvalid=capture(),transition=player.transitioning;player.seek(NaN);player.update(Infinity,.1);assert.equal(player.transitioning,transition);same(beforeInvalid,capture());}
  for(const delta of [NaN,-1,1/120,1/60]){
   player.update((i*.137+.03)%clip.duration,delta);assert(capture().every(v=>v.toArray().every(Number.isFinite)));
  }
 }
 player.seek(1.3);assert(!player.transitioning);const pose=capture();
 player.seek(1.31);assert(capture().some((p,i)=>p.distanceTo(pose[i])>1e-5),'Paused scrubbing must change the actual rig pose');
 assert(mixer.stats.actions.total<=clips.length,'Private transition clips must not accumulate');
 player.dispose();assert.equal(mixer.stats.actions.inUse,0);mixer.stopAllAction();mixer.uncacheRoot(g.scene);
 console.log(`PASS V1136 ${asset.file}: malformed clocks/clips, 180 interrupted fades, finite real skeleton poses, paused scrubbing and mixer cleanup`);
}
