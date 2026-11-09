import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { AnimationMixer, Vector3, Quaternion, Bone, Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const require = createRequire(import.meta.url);
const load = require('./helpers/load-stage-typescript.cjs');
const { PreviewClipPlayer } = load('components/visualizer/previewClipPlayer.ts');
const { findAvatarRigTargets } = load('components/visualizer/avatarRigController.ts');
const { initializeFootIK } = load('components/visualizer/avatarFootIK.ts');
const manifest = JSON.parse(readFileSync(new URL('../public/avatars/sonic/manifest.json',import.meta.url)));
const poses = [];
for (const asset of manifest) {
  const bytes = readFileSync(new URL(`../public/avatars/sonic/${asset.file}`,import.meta.url));
  const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  const root = gltf.scene; const mixer = new AnimationMixer(root);
  const targets = findAvatarRigTargets(root);
  const ik = initializeFootIK(root,targets);
  assert.ok(ik.left && ik.right, `${asset.file}: standard glTF knees must enable actual runtime IK`);
  const ankles = ['LeftFoot','RightFoot'].map(name=>root.getObjectByName(name));
  const stance = ankles.map(node=>node.getWorldPosition(new Vector3()));
  const initialRotation = ankles.map(node=>node.getWorldQuaternion(new Quaternion()));
  const probes = ankles.map(ankle => {
    let best = null;
    root.traverse(mesh => {
      if (!mesh.isSkinnedMesh) return;
      const joint=mesh.skeleton.bones.indexOf(ankle), attr=mesh.geometry.attributes;
      for(let index=0;index<attr.position.count;index++) {
        if(attr.skinIndex.getX(index)!==joint || attr.skinWeight.getX(index)<.99) continue;
        const point=mesh.applyBoneTransform(index,new Vector3().fromBufferAttribute(attr.position,index)).applyMatrix4(mesh.matrixWorld);
        if(!best || point.y<best.floor) best={mesh,index,floor:point.y};
      }
    });
    assert.ok(best,'A real sole vertex must belong to each foot skin');return best;
  });
  let maxDrift = 0, maxRotation = 0;
  for (const clip of gltf.animations) {
    mixer.stopAllAction(); const action=mixer.clipAction(clip).reset().play();
    for (let n=0;n<240;n++) {
      const time=clip.duration*n/240, phase=time/clip.duration*Math.PI*2*(clip.duration>=8 ? clip.duration/4 : 1);
      mixer.setTime(time); root.updateMatrixWorld(true);
      const stationary=/^(Idle_Breathe|Gesture_Wave|Dance_Robot|Dance_FestivalBounce|Dance_PopLock|Dance_Clockwork)$/.test(clip.name);
      for(let i=0;i<2;i++) {
        const p=ankles[i].getWorldPosition(new Vector3());
        const q=ankles[i].getWorldQuaternion(new Quaternion());
        const h=p.y-stance[i].y;
        const probe=probes[i];
        const sole=probe.mesh.applyBoneTransform(probe.index,new Vector3().fromBufferAttribute(probe.mesh.geometry.attributes.position,probe.index)).applyMatrix4(probe.mesh.matrixWorld);
        assert.ok(sole.y>=probe.floor-.0015, 'Actual skinned soles must never penetrate the floor');
        assert.ok(h>-.0015 && h<.09, `${asset.file}/${clip.name}: no penetration or excessive lift (${h})`);
        maxRotation=Math.max(maxRotation,q.angleTo(initialRotation[i]));
        if((clip.name==='Dance_PivotStep'||clip.name==='Dance_TurnPhrase')){
          const relative=q.clone().multiply(initialRotation[i].clone().invert());
          assert.ok(new Vector3(0,1,0).applyQuaternion(relative).distanceTo(new Vector3(0,1,0))<.004,'Pivot yaw must not tilt the sole');
        }else assert.ok(q.angleTo(initialRotation[i])<.004,'Soles must stay level');
        const planted=stationary || (i===0 ? Math.sin(phase)<=0 : Math.sin(phase)>=0);
        if(planted) {
          const drift=p.distanceTo(stance[i]);maxDrift=Math.max(maxDrift,drift);
          assert.ok(drift<.0015, `${asset.file}/${clip.name}: stance drift ${drift}`);
        }
      }
    }
    action.stop();
  }
  const player = new PreviewClipPlayer(mixer,root);
  const capture=()=>{root.updateMatrixWorld(true);return root.getObjectByName('RightHand').getWorldPosition(new Vector3());};
  player.select(gltf.animations[0],.3,0);player.update(.3,0);
  const source=capture();
  player.select(gltf.animations[8],0,.4);
  assert.ok(player.transitioning);assert.ok(capture().distanceTo(source)<1e-5,'Switch starts from exact rendered pose');
  player.update(.08,.08);const intermediate=capture();
  player.select(gltf.animations[5],0,.4);
  assert.ok(capture().distanceTo(intermediate)<1e-5,'Interrupted fade must preserve its blended pose');
  for(let n=1;n<=30;n++)player.update(n/60,1/60);
  assert.equal(player.transitioning,false);
  const settled=capture();
  player.seek(.5);assert.ok(capture().distanceTo(settled)<1e-5,'Finished fade must match target clip exactly');
  for(let n=0;n<40;n++) {player.select(gltf.animations[n%12],0,.35);player.update(.1,.1);}
  player.seek(.2);assert.equal(player.transitioning,false);
  assert.ok(mixer.stats.actions.total<=gltf.animations.length,'Private snapshot actions must be released');
  player.select(gltf.animations[1],.2,0);assert.equal(player.transitioning,false,'Paused/reduced-motion selection can be immediate');
  player.update(.2,0);const a=capture();player.seek(.21);assert.ok(capture().distanceTo(a)>.0001,'A 0.01s scrub must change the evaluated pose');
  player.dispose();assert.equal(mixer.stats.actions.inUse,0);
  mixer.stopAllAction();mixer.clipAction(gltf.animations[0]).reset().setEffectiveWeight(1).play();mixer.setTime(.43);root.updateMatrixWorld(true);
  poses.push(root.getObjectByName('RightHand').getWorldPosition(new Vector3()));
  console.log(`${asset.file}: ${gltf.animations.length} clips / 240 contact samples each; max stance drift ${(maxDrift*1000).toFixed(3)} mm; level soles, IK recognition, smooth/rapid transitions and cleanup PASS`);
}
for(let i=0;i<poses.length;i++)for(let j=i+1;j<poses.length;j++)assert.ok(poses[i].distanceTo(poses[j])>.015,'Shared dances must have individual performer phrasing');
console.log('All eleven performers have different choreography, including the common Groove clip.');

// Exact conventional knee aliases work, unrelated or opposite-side nodes do not.
for(const kneeName of ['LeftLeg','mixamorig:LeftLeg','mixamorigLeftLeg','LeftLowerLeg','LeftKnee']) {
  const root=new Group(),hip=new Bone(),knee=new Bone(),foot=new Bone();
  hip.name='LeftUpLeg';knee.name=kneeName;foot.name='LeftFoot';
  hip.add(knee);knee.add(foot);knee.position.y=-.4;foot.position.y=-.4;root.add(hip);
  assert.ok(initializeFootIK(root,{leftLeg:hip,leftFoot:foot}).left, kneeName);
}
for(const kneeName of ['RightLeg','LeftUpLeg','UnrelatedHelper']) {
  const root=new Group(),hip=new Bone(),knee=new Bone(),foot=new Bone();
  knee.name=kneeName;hip.add(knee);knee.add(foot);knee.position.y=-.4;foot.position.y=-.4;root.add(hip);
  assert.equal(initializeFootIK(root,{leftLeg:hip,leftFoot:foot}).left,null,kneeName);
}
console.log('Standard knee aliases and rejection of opposite-side/unrelated chains PASS');
// A genuine GLTFLoader cubic-spline quaternion track has 12 stored components
// per key but only 4 evaluated values. Snapshot poses must not copy its tangents.
{
  const binary=Buffer.alloc(104);binary.writeFloatLE(0,0);binary.writeFloatLE(1,4);
  [0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,0, 0,Math.sin(.5),0,Math.cos(.5), 0,0,0,0].forEach((x,i)=>binary.writeFloatLE(x,8+i*4));
  const doc={asset:{version:'2.0'},scene:0,scenes:[{nodes:[0]}],nodes:[{name:'SplineBone'}],buffers:[{byteLength:binary.length}],bufferViews:[{buffer:0,byteOffset:0,byteLength:8},{buffer:0,byteOffset:8,byteLength:96}],accessors:[{bufferView:0,componentType:5126,count:2,type:'SCALAR',min:[0],max:[1]},{bufferView:1,componentType:5126,count:6,type:'VEC4'}],animations:[{name:'CubicRotation',samplers:[{input:0,output:1,interpolation:'CUBICSPLINE'}],channels:[{sampler:0,target:{node:0,path:'rotation'}}]}]};
  const raw=Buffer.from(JSON.stringify(doc));const json=Buffer.alloc(Math.ceil(raw.length/4)*4,32);raw.copy(json);
  const glb=Buffer.alloc(28+json.length+binary.length);glb.write('glTF');glb.writeUInt32LE(2,4);glb.writeUInt32LE(glb.length,8);glb.writeUInt32LE(json.length,12);glb.write('JSON',16);json.copy(glb,20);glb.writeUInt32LE(binary.length,20+json.length);glb.write('BIN\0',24+json.length);binary.copy(glb,28+json.length);
  const g=await new GLTFLoader().parseAsync(glb.buffer.slice(glb.byteOffset,glb.byteOffset+glb.byteLength),'');
  const mixer=new AnimationMixer(g.scene),player=new PreviewClipPlayer(mixer,g.scene),bone=g.scene.getObjectByName('SplineBone');
  player.select(g.animations[0],.3,0);player.update(.3,0);const before=bone.quaternion.clone();
  player.select(g.animations[0],.7,.35);
  assert.ok(before.angleTo(bone.quaternion)<.0001,'Cubic-spline snapshots preserve the actual quaternion');
  for(let n=0;n<30;n++)player.update(.7,1/60);
  assert.ok(bone.quaternion.toArray().every(Number.isFinite));assert.ok(Math.abs(bone.quaternion.length()-1)<.0001);
  assert.equal(player.transitioning,false);player.dispose();assert.equal(mixer.stats.actions.inUse,0);
  console.log('Real glTF CUBICSPLINE rotation snapshot and transition PASS');
}
{
  const { AnimationClip, NumberKeyframeTrack }=require('three');
  const root=new Group();root.name='IndependentChannels';
  const clips=['x','y','z'].map((axis,i)=>new AnimationClip(axis,1,[new NumberKeyframeTrack(`.position[${axis}]`,[0,1],[0,i+1])]));
  const mixer=new AnimationMixer(root),player=new PreviewClipPlayer(mixer,root);
  player.select(clips[0],.6,0);player.update(.6,0);
  player.select(clips[1],0,.4);player.update(.1,.1);
  const before=root.position.clone();player.select(clips[2],0,.4);
  assert.ok(root.position.distanceTo(before)<1e-6,'Rapid fades preserve channels unique to an earlier outgoing clip');
  for(let n=0;n<30;n++)player.update(.5,1/60);
  assert.ok(Math.abs(root.position.x)<1e-6 && Math.abs(root.position.y)<1e-6 && Math.abs(root.position.z-1.5)<1e-6);
  player.dispose();assert.equal(mixer.stats.actions.inUse,0);
  console.log('Interrupted transitions with disjoint animated channels PASS');
}
