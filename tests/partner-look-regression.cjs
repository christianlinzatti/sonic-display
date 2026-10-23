const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = fs.readFileSync(path.join(__dirname,'../components/visualizer/partnerLookAtEngine.ts'),'utf8');
const avatar = fs.readFileSync(path.join(__dirname,'../components/visualizer/ThreeAvatar.tsx'),'utf8');
const checks = [
 ['pure bounded IK cue', /function partnerLookCue/.test(ts) && /clamp\(angle, -0\.42, 0\.42\)/.test(ts)],
 ['duet stronger than mirror', /mode === "duet" \? 0\.78 : mode === "mirror" \? 0\.42 : 0\.26/.test(ts)],
 ['solo disabled', /mode === "solo"/.test(ts)],
 ['handles invalid input', /Number\.isFinite/.test(ts)],
 ['smooth time-scaled movement', /Math\.exp/.test(ts)],
 ['per dancer context', /PartnerLookContext.Provider value=\{leadLook\}/.test(avatar) && /PartnerLookContext.Provider value=\{partnerLook\}/.test(avatar)],
 ['after base animation motion', /applyAvatarRigMotion[\s\S]{0,220}applyPartnerLook/.test(avatar)],
 ['procedural fallback', /partnerLook\?\.current\.yaw/.test(avatar)],
 ['preserve glb clip rotations', /yaw - previous\.yaw/.test(avatar)],
];
checks.forEach(([name, ok]) => {assert.ok(ok, name); console.log('PASS', name);});
