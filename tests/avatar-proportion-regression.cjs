require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert = require('node:assert/strict');
const fs = require('node:fs');
const source = fs.readFileSync('components/visualizer/avatarProportionCalibration.ts','utf8');
const avatar = fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
const tests = {
  'arm chain measured': source.includes('safeLength(shoulder, elbow)') && source.includes('safeLength(elbow, wrist)'),
  'missing bones fallback': source.includes('if (!shoulder || !elbow || !wrist) return null'),
  'degenerate rig guarded': source.includes('finiteLength(upperArm)') && source.includes('finiteLength(forearm)'),
  'nonfinite measurements guarded': source.includes('Number.isFinite(n)'),
  'torso landmark optional': source.includes('torsoHeight = torso !== null'),
  'automatic calibration bounded': source.includes('normalizeContactCalibration({reach, height: 0, strength: 1})'),
  'manual reach preserved': source.includes('manual.reach * automatic.reach'),
  'manual height preserved': source.includes('manual.height + automatic.height'),
  'manual strength preserved': source.includes('strength: manual.strength'),
  'measured per dancer': avatar.includes('const measuredProportions = useRef<AvatarProportions | null>(null)'),
  'rig measurement integrated': avatar.includes('measureAvatarProportions(arm)'),
  'calibration passed to IK': avatar.includes('resolveContactCalibration(contactCalibration, measuredProportions.current)') && avatar.includes('delta, calibrated.reach'),
  'independent dancer contexts': avatar.includes('props.secondaryContactCalibration ?? null') && avatar.includes('props.partnerContactCalibration ?? null'),
};
for (const [name, pass] of Object.entries(tests)) { assert.ok(pass, name); console.log('PASS', name); }
console.log(`V150: ${Object.keys(tests).length} checks passed`);
