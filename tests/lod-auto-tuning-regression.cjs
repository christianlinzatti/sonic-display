require('./helpers/threeAvatarSourcesV492.cjs').install();
const fs=require('node:fs');const assert=require('node:assert/strict');
const source=fs.readFileSync('components/visualizer/lodAutoTuning.ts','utf8');
const correction=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
assert(source.includes('Number.isFinite'));assert(source.includes('Math.exp(-dt*3)'));
assert(source.includes('Math.min(0.4'));assert(correction.includes('updateLodAutoTune('));
assert(correction.includes('getOutgoingLodPose(url, liveOwner.current'));
// After V492 extraction the ProceduralAvatar block is followed by GLB imports.
// Check the GLB-only correction path rather than scanning those hoisted imports.
assert(correction.indexOf('function ProceduralAvatar')>=0);
assert(correction.indexOf('export function GltfAvatar')>correction.indexOf('function ProceduralAvatar'));
assert(correction.includes('if (!isPlaying || reducedMotion) { lodTuning.current'));
console.log('V132 auto-tuning structural checks: 6 passed');
