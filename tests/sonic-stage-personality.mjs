import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AnimationMixer, Vector3, Matrix4 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const crew=[['neon-pulse','FaceVisorLeft'],['festival-nova','FaceEyeLeft'],['chrome-beat','FaceLedEyeLeft']];
for(const [slug,eyeName] of crew) {
  const bytes=readFileSync(new URL(`../public/avatars/sonic/${slug}.glb`,import.meta.url));
  const doc=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
  assert.ok(doc.skins[0].joints.length>=44 && doc.skins[0].joints.length<60);
  const g=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  const root=g.scene,mixer=new AnimationMixer(root),meshes=[];
  root.traverse(o=>{if(o.isSkinnedMesh)meshes.push(o);});
  let mixed=0;
  for(const mesh of meshes)for(let i=0;i<mesh.geometry.attributes.skinWeight.count;i++) {
    const w=mesh.geometry.attributes.skinWeight.getX(i);
    if(w>.001 && w<.999)mixed++;
  }
  assert.ok(mixed>500,'Joint bridges must have real blended skin weights');
  for(const side of ['Left','Right'])for(const finger of ['Thumb','Index','Middle','Ring','Little'])for(const segment of [1,2]) {
    const name=`${side}${finger}${segment}`;
    assert.ok(root.getObjectByName(name),`Articulated finger missing: ${name}`);
    assert.ok(g.animations.every(c=>c.tracks.some(t=>t.name===`${name}.quaternion`)),`Finger must be animated in every clip: ${name}`);
  }
  function evaluate(clip,time) {
    mixer.stopAllAction();mixer.clipAction(clip).reset().setEffectiveWeight(1).play();mixer.setTime(time);root.updateMatrixWorld(true);
  }
  function probe(boneName) {
    const bone=root.getObjectByName(boneName);
    for(const mesh of meshes) {
      const joint=mesh.skeleton.bones.indexOf(bone),a=mesh.geometry.attributes;
      for(let i=0;i<a.position.count;i++)if(a.skinIndex.getX(i)===joint && a.skinWeight.getX(i)>.99)return{mesh,index:i};
    }
    assert.fail(`Animated detail has no bound geometry: ${boneName}`);
  }
  function point(p,reference) {
    return p.mesh.applyBoneTransform(p.index,new Vector3().fromBufferAttribute(p.mesh.geometry.attributes.position,p.index))
      .applyMatrix4(p.mesh.matrixWorld).applyMatrix4(new Matrix4().copy(reference.matrixWorld).invert());
  }
  const finger=probe('LeftIndex2'),hand=root.getObjectByName('LeftHand');
  evaluate(g.animations[10],0);const a=point(finger,hand);
  evaluate(g.animations[10],g.animations[10].duration*.5);const b=point(finger,hand);
  assert.ok(a.distanceTo(b)>.003,'Actual fingertip skin must curl relative to the palm');
  const eye=probe(eyeName),head=root.getObjectByName('Head'),idle=g.animations[2];
  evaluate(idle,0);const open=point(eye,head);
  evaluate(idle,idle.duration*1.65/(Math.PI*2));const closed=point(eye,head);
  assert.ok(root.getObjectByName(eyeName).scale.y<.22,'Eyes/visor must close during the blink');
  assert.ok(open.distanceTo(closed)>.002,'Blink must deform actual face geometry');
  for(const clip of g.animations.slice(10)) {
    assert.ok(clip.duration>=12 && clip.duration<=16,'Signature choreography must last 12–16 seconds');
    const forearm=root.getObjectByName('RightForeArm');
    evaluate(clip,.5);const start=forearm.quaternion.clone();
    evaluate(clip,4.5);const second=forearm.quaternion.clone();
    evaluate(clip,8.5);const third=forearm.quaternion.clone();
    assert.ok(start.angleTo(second)>.025 && second.angleTo(third)>.025,'Long signatures must vary between phrases');
  }
  if(slug==='festival-nova') {
    evaluate(idle,0);const smile=root.getObjectByName('FaceSmile').scale.x;
    evaluate(idle,1);assert.ok(Math.abs(root.getObjectByName('FaceSmile').scale.x-smile)>.08,'Smile width changes');
  }
  if(slug==='chrome-beat') {
    evaluate(idle,0);const bar=root.getObjectByName('FaceLedBar0').scale.y;
    evaluate(idle,.3);assert.ok(Math.abs(root.getObjectByName('FaceLedBar0').scale.y-bar)>.1,'LED mouth changes expression');
  }
  const triangles=doc.meshes.reduce((sum,m)=>sum+m.primitives.reduce((n,p)=>n+doc.accessors[p.indices].count/3,0),0);
  assert.ok(triangles<20000,'Detail geometry stays within the stage asset budget');
  console.log(`${slug}: ${doc.skins[0].joints.length} joints, ${mixed} blended vertices, ${triangles} triangles; 20 animated finger segments, real blink/skin and varied 12–16 s signatures PASS`);
}
