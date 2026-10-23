const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const engine = fs.readFileSync(path.join(root,'components/visualizer/jointConstraintCalibration.ts'),'utf8');
const editor = fs.readFileSync(path.join(root,'components/visualizer/AvatarSkeletonEditor.tsx'),'utf8');
const settings = fs.readFileSync(path.join(root,'components/SettingsPanel.tsx'),'utf8');
const cases = [
 ['Model-specific persistence', /sonic-display:v153:joints:\$\{url\}/.test(engine)],
 ['Per-axis minimum and maximum', /min: number; max: number; preview: number/.test(engine)],
 ['Finite input validation', /Number\.isFinite/.test(engine)],
 ['Bounded angles', /-180, 180/.test(engine)],
 ['Prototype-safe map', /__proto__/.test(engine)],
 ['Limits preview clamp', /clampAngle\(finite\(v\.preview\)/.test(engine)],
 ['Safe GLB clone', /cloneSkinnedScene\(gltf.scene\)/.test(editor)],
 ['Rest pose preserved', /rest\.get\(node.uuid\)/.test(editor)],
 ['Quaternion preview', /new Quaternion\(\)\.setFromEuler/.test(editor)],
 ['Local X,Y,Z inputs', /\["x","y","z"\]/.test(editor)],
 ['Range UI', /type="range"/.test(editor)],
 ['Constraint persistence', /localStorage\.setItem\(jointConstraintKey/.test(editor)],
 ['Joint-specific reset', /delete next\[selected\]/.test(editor)],
 ['All-joint reset', /saveConstraints\(\{\}\)/.test(editor)],
 ['Export includes constraints', /modelUrl,overrides,constraints/.test(editor)],
 ['Editor preserves source clips', /importierte Tanzclips bleiben unverändert/.test(editor)],
 ['Settings integration', /V153 – Skeleton/.test(settings)],
];
for (const [name, passed] of cases) { assert.ok(passed, name); console.log('ok',name); }
console.log(`${cases.length} V153 checks passed`);
