'use strict';
// V865.5 focused static integration test for ten files diagnosed by real tsc.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const lib = read('components/CharacterMotionLibraryPanel.tsx');
assert.match(lib, /withPrivateGltfV769\(/);
assert.doesNotMatch(lib, /\breadGLB\b/);
assert.match(lib, /gltf\.animations\.slice\(0,64\)\.map/);
const editor = read('components/visualizer/AvatarEditor.tsx');
for (const name of ['NaturalDanceSettingsV758', 'createNaturalDanceStateV758', 'directNaturalDanceV758']) {
  assert.match(editor, new RegExp(`import \\{[^}]*${name}[^}]*\\} from ['\"]\\.\\/naturalDanceMotionV758['\"]`));
}
for (const [file, model] of [
  ['CameraComparisonCanvasV803.tsx','model'],
  ['DanceLiveComparisonV316.tsx','clone'],
  ['RealConcertPreviewCanvasV513.tsx','clone'],
]) {
  const src = read('components/visualizer/' + file);
  assert.ok(src.includes(`useEffect(()=>()=>{disposeClonedAvatarSkeletonsV654(${model});},[${model}]);`), file);
}
const stage = read('components/visualizer/DynamicStage.tsx');
assert.ok(!stage.includes("currentSectionV810==='intro'"));
assert.ok(!stage.includes("currentSectionV810==='finale'"));
const dancer = read('components/visualizer/GltfDancerAvatarV492.tsx');
for (const part of ['hipPitch','hipRoll','hipLateral','hipVertical']) {
  assert.ok(dancer.includes(`(hipDanceV735.${part}??0)*hipTorsoGainV735`), part);
}
assert.ok(dancer.includes('manualPriority:hipManualPriorityV735||!!stableLibraryClip||'));
assert.ok(read('components/visualizer/InteractiveConcertTimelineStudioV763.tsx').includes('onChange={e=>changeClip({value:e.target.value})}'));
assert.ok(read('components/visualizer/SmartConcertTimelineAutomationV764.tsx').includes('onChange={e=>setEdits(prev=>({...prev,[clip.id]:e.target.value}))}'));
const dashboard = read('components/visualizer/MotionQualityOptimizerDashboard.tsx');
const preview = read('components/visualizer/MotionQualityPreviewV321.tsx');
assert.ok(dashboard.includes('motionUrl={result!.url}'));
assert.ok(dashboard.includes('gltf.animations.map(clip=>clip.clone())'));
assert.ok(preview.includes('const sourceScene=useGLTF(motionUrl).scene;'));
assert.ok(preview.includes('usePreviewGltfCacheV654(motionUrl);'));
assert.ok(!dashboard.includes('sourceScene={result!.scene}'));
console.log('PASS V865.5: 18 reported TypeScript error locations corrected without private GLTF lifetime regression');
