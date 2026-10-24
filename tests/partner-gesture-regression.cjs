require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require('node:assert/strict');
const fs=require('node:fs');
const engine=fs.readFileSync('components/visualizer/partnerGestureEngine.ts','utf8');
const avatar=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
const tests={
 'bounded additive gesture output': /leftLift: clamp\(/.test(engine)&&/rightLift: clamp\(/.test(engine),
 'disabled for solo pause and reduced motion': /!playing \|\| reducedMotion \|\| mode === "solo"/.test(engine),
 'alternating call response': /secondary \? response : leader/.test(engine)&&/secondary \? leader : response/.test(engine),
 'distinct genre-independent duo weighting': /mode === "duet"/.test(engine)&&/mode === "mirror"/.test(engine),
 'frame rate smoothing': /Math\.exp/.test(engine),
 'per dancer gesture contexts': /PartnerGestureContext.Provider value=\{leadGesture\}/.test(avatar)&&/PartnerGestureContext.Provider value=\{partnerGesture\}/.test(avatar),
 'overlay respects prior source pose': /next.leftLift-previous.leftLift/.test(avatar),
 'integrated after rig motion': /applyAvatarRigMotion[\s\S]{0,380}applyPartnerGesture/.test(avatar),
 'procedural fallback': /partnerGesture\?\.current.leftLift/.test(avatar),
};
for (const [label, pass] of Object.entries(tests)){assert.ok(pass,label);console.log('PASS',label)}
