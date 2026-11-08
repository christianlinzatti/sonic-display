import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AnimationMixer, Vector3, LoopOnce, Box3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const files = ['neon-pulse', 'festival-nova', 'chrome-beat'];
const common = ['Dance_Groove','Dance_Techno','Idle_Breathe','Dance_House','Dance_HipHop','Dance_Disco','Dance_Shuffle','Dance_Robot','Dance_FestivalBounce','Gesture_Wave'];
const manifest = JSON.parse(readFileSync(new URL('../public/avatars/sonic/manifest.json', import.meta.url)));
for (const file of files) {
  const expected = manifest.find(asset => asset.file === `${file}.glb`).clips.map(clip => clip.name);
  assert.equal(expected.length,12);
  assert.deepEqual(expected.slice(0,10),common);
  const bytes = readFileSync(new URL(`../public/avatars/sonic/${file}.glb`, import.meta.url));
  assert.equal(bytes.toString('ascii', 0, 4), 'glTF');
  const json = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)));
  assert.equal(json.skins.length, 1);
  assert.ok(json.skins[0].joints.length >= 19);
  assert.ok(json.buffers.every(b => !b.uri), 'Geometry must be embedded');
  assert.ok(!json.images?.length, 'No external textures');
  const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
  assert.deepEqual(gltf.animations.map(a => a.name), expected);
  const bounds = new Box3().setFromObject(gltf.scene);
  assert.ok(bounds.min.y >= -1.1 && bounds.min.y < -.9 && bounds.max.y <= 1.2, 'Centered stage coordinates must keep the full avatar in view');
  const skinned = [];
  gltf.scene.traverse(o => { if (o.isSkinnedMesh) skinned.push(o); });
  assert.ok(skinned.length > 0);
  const mixer = new AnimationMixer(gltf.scene);
  function sample() {
    gltf.scene.updateMatrixWorld(true);
    return skinned.flatMap(mesh => {
      mesh.skeleton.update();
      const pos = mesh.geometry.attributes.position;
      return Array.from({length: Math.ceil(pos.count / 17)}, (_, i) => {
        const v = new Vector3().fromBufferAttribute(pos, i * 17);
        return mesh.applyBoneTransform(i * 17, v).applyMatrix4(mesh.matrixWorld).toArray();
      }).flat();
    });
  }
  const signatures = [];
  for (const clip of gltf.animations) {
    assert.ok(clip.duration >= 1.9);
    assert.ok(clip.tracks.every(track => Array.from(track.values).every(Number.isFinite)));
    mixer.stopAllAction();
    const action = mixer.clipAction(clip).reset().setLoop(LoopOnce, 1); action.clampWhenFinished = true; action.play();
    mixer.setTime(0); const start = sample();
    mixer.setTime(clip.duration * .23); const middle = sample();
    assert.ok(middle.some((x,i) => Math.abs(x-start[i]) > .002), `${file}/${clip.name} must deform real vertices`);
    signatures.push(middle.map(x=>x.toFixed(3)).join(','));
    mixer.setTime(clip.duration); const end = sample();
    assert.ok(end.every((x,i) => Math.abs(x-start[i]) < .001), `${clip.name} must loop without a pose jump`);
  }
  assert.equal(new Set(signatures).size, expected.length, 'Clips must produce different poses');
  console.log(`${file}: skin, 12 distinct animated clips, finite vertices and seamless loops PASS (${bytes.length} bytes)`);
}
