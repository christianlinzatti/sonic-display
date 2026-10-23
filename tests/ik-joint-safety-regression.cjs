const assert = require('node:assert/strict');
const fs = require('node:fs');const path=require('node:path');
const base=path.resolve(__dirname,'../components/visualizer');
const read=name=>fs.readFileSync(path.join(base,name),'utf8');
const safety=read('ikJointSafety.ts'),hand=read('partnerHandIK.ts'),foot=read('avatarFootIK.ts'),avatar=read('ThreeAvatar.tsx'),editor=read('AvatarSkeletonEditor.tsx');
const checks=[
 ['read v153 persisted constraints',safety.includes('jointConstraintKey(modelUrl)')],
 ['sanitize stored input',safety.includes('normalizeConstraintMap')],
 ['clamp only calibrated bones',safety.includes('if (!bounds')&&safety.includes('if (constraints?.[node.name])')&&safety.includes('if (!inferred) return false')],
 ['preserve animated pose baseline',safety.includes('baseline.clone().invert().multiply(candidate)')],
 ['bound xyz rotation delta',safety.includes('bounds.x.min')&&safety.includes('bounds.y.max')&&safety.includes('bounds.z.min')],
 ['hand IK accepts limits',hand.includes('constraints?: JointConstraintMap')],
 ['hand IK clamps after its rotation',hand.includes('applyIKJointSafety(joint, baseline, constraints)')],
 ['foot IK accepts limits',foot.includes('lockStrength = 0.5, constraints?: JointConstraintMap')],
 ['foot IK clamps the rotateTowards correction',foot.includes('applyIKJointSafety(joint, baseline, constraints)')],
 ['GLB-specific persistent constraints',avatar.includes('readIKConstraints(url)')],
 ['live updates',avatar.includes('sonic:joint-constraints-changed')&&editor.includes('sonic:joint-constraints-changed')],
 ['limits wired into hand + foot',avatar.includes('calibrated.reach, ikConstraints.current')&&avatar.includes('avatarFootIKLock / 100 + footCueV234.lockBoost')&&avatar.includes('ikConstraints.current, footCueV234')],
 ];
for(const [name,pass] of checks){assert.ok(pass,name);console.log('✓',name)}
console.log(`${checks.length} V154 regressions passed`);
