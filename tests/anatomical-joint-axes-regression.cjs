const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const p = path.resolve(__dirname, '../components/visualizer');
const axis = fs.readFileSync(path.join(p, 'anatomicalJointAxes.ts'), 'utf8');
const safety = fs.readFileSync(path.join(p, 'ikJointSafety.ts'), 'utf8');
const hand = fs.readFileSync(path.join(p, 'partnerHandIK.ts'), 'utf8');
const foot = fs.readFileSync(path.join(p, 'avatarFootIK.ts'), 'utf8');
const tests = [
  ['semantic knee and elbow only', /ELBOW\.test\(joint\.name\)/.test(axis) && /KNEE\.test\(joint\.name\)/.test(axis)],
  ['local axis from actual hierarchy', axis.includes('joint.position.clone()') && axis.includes('next.position.clone()')],
  ['reject ambiguous bend axis', axis.includes('sin < 0.12')],
  ['conservative elbow and knee delta', axis.includes('28 : 24')],
  ['anatomical inference is cached', safety.includes('WeakMap<Object3D')],
  ['projection of quaternion delta', safety.includes('dot(axis)') && safety.includes('setFromAxisAngle(axis, bounded)')],
  ['explicit calibration takes priority', safety.includes('if (constraints?.[node.name])')],
  ['missing data preserves legacy solver', safety.includes('if (!inferred) return false')],
  ['no source animation modification', safety.includes('baseline.clone().invert().multiply(candidate)')],
  ['IK uses central safety hook', hand.includes('applyIKJointSafety(joint, baseline, constraints)') && foot.includes('applyIKJointSafety(joint, baseline, constraints)')],
];
for (const [label, pass] of tests) { assert.ok(pass, label); console.log('✓', label); }
console.log(`${tests.length} V155 regressions passed`);
