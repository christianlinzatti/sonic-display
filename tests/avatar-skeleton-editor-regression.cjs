const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const editor = fs.readFileSync(path.join(root,'components/visualizer/AvatarSkeletonEditor.tsx'),'utf8');
const settings = fs.readFileSync(path.join(root,'components/SettingsPanel.tsx'),'utf8');
const checks = [
 ['3D preview', /<Canvas[\s>]/.test(editor)],
 ['GLB clone', /cloneSkinnedScene\(gltf.scene\)/.test(editor)],
 ['Bone selection', /onPointerDown=/.test(editor)],
 ['Camera orbit', /<OrbitControls/.test(editor)],
 ['Slot mapping', /Bone zuordnen/.test(editor)],
 ['Local persistence', /localStorage.setItem/.test(editor)],
 ['Per-model key', /sonic-display:v152:skeleton:\$\{url\}/.test(editor)],
 ['JSON export', /sonic-skeleton-calibration-v156.json/.test(editor)],
 ['Reset', /Alle Zuordnungen zurücksetzen/.test(editor)],
 ['Settings integration', /<AvatarSkeletonEditor modelUrl=/.test(settings)],
 ['No source GLB mutations', !/gltf.scene\.add\(/.test(editor)],
];
for(const [name,pass] of checks){assert.ok(pass, name); console.log('ok',name)}
console.log(`${checks.length} V152 checks passed`);
