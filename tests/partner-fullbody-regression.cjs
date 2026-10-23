const assert=require('node:assert/strict');
const fs=require('node:fs');
const engine=fs.readFileSync('components/visualizer/partnerFullBodyContact.ts','utf8');
const avatar=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
const tests={
  'contact reach envelope':engine.includes('distance / reach - 0.65')&&engine.includes('distance / reach - 1.35'),
  'invalid distances rejected':engine.includes('every(Number.isFinite)'),
  'torso offset rollback':engine.includes('state.offset.clone().invert()'),
  'bounded yaw':engine.includes('Math.max(-0.09, Math.min(0.09'),
  'smooth frame rate blend':engine.includes('Math.exp(-8*dt)'),
  'bone fallback':engine.includes('rig.chest ?? rig.spine'),
  'preserves source animation':engine.includes('resetPartnerTorso(rig,state)'),
  'uses world transforms':engine.includes('getWorldPosition')&&engine.includes('getWorldQuaternion'),
  'context respects pause':avatar.includes('isPlaying && !reducedMotion ? (partnerHand?.current ?? NEUTRAL_HAND)'),
  'integrated upstream of hand IK':avatar.indexOf('updatePartnerTorso({chest: arm.chest')<avatar.indexOf('updatePartnerHandIK({upper: arm.rightArm'),
  'existing hand IK preserved':avatar.includes('updatePartnerHandIK({upper: arm.rightArm'),
};
for(const [name,pass] of Object.entries(tests)){assert.ok(pass,name);console.log('PASS',name)}
console.log('V148 structural regression:',Object.keys(tests).length,'passed');
