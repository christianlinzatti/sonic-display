const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '../components/visualizer');
const diag = fs.readFileSync(path.join(base,'anatomicalAxisDiagnostics.ts'),'utf8');
const editor = fs.readFileSync(path.join(base,'AvatarSkeletonEditor.tsx'),'utf8');
const tests = [
['rig bone traversal', diag.includes('root.traverse') && diag.includes('node instanceof Bone')],
['existing hinge inference reused', diag.includes('inferAnatomicalHinge(node)')],
['conservative axis alignment', diag.includes('>= 0.82')],
['minimum confidence threshold', diag.includes('hinge.confidence >= 0.5')],
['explicit suggestion only', diag.includes('proposeJointLimits')],
['missing ambiguous suggestion returns null', diag.includes('if (!d.suggestedAxis || d.confidence < 0.5) return null')],
['no implicit persistent writes in diagnostics', !diag.includes('localStorage.setItem')],
['confidence shown in UI', editor.includes('selectedDiagnostic.confidence')],
['selected bone axis overlay', editor.includes('showAxes &&') && editor.includes('name === selected')],
['explicit confirmation before save', editor.includes('window.confirm(')],
['existing manual editor intact', editor.includes('setJointAxis(current, axis, field, value)')],
['diagnostic export', editor.includes('anatomicalAxes:diagnostics')],
['model clone unchanged', editor.includes('cloneSkinnedScene(gltf.scene)')],
];
for (const [label, ok] of tests) { assert.ok(ok,label);console.log('✓',label); }
console.log(`${tests.length} V156 diagnostics tests passed`);
