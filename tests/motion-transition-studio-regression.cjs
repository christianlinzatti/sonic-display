const assert=require('node:assert/strict');const fs=require('node:fs');
const studio=fs.readFileSync('components/visualizer/MotionTransitionStudio.tsx','utf8');
const settings=fs.readFileSync('components/visualizer/motionTransitionStudioSettings.ts','utf8');
const lib=fs.readFileSync('components/CharacterMotionLibraryPanel.tsx','utf8');
const pkg=require('../package.json');
const tests=[
 ['version',()=>assert.match(pkg.version,/v\d+$/)],
 ['shared mixer',()=>assert.match(studio,/new AnimationMixer\(rig\)/)],
 ['real crossfade',()=>assert.match(studio,/crossFadeTo\(action,Math.max\(0\.1,duration\),true\)/)],
 ['both GLBs loaded',()=>assert.match(studio,/Promise\.allSettled\(\[from,to\]/)],
 ['both clips retargeted',()=>assert.match(studio,/retargetHumanoidClips/)],
 ['3d preview',()=>assert.match(studio,/<Canvas/)],
 ['motion selection',()=>assert.match(studio,/Motion A<select/)],
 ['duration control',()=>assert.match(studio,/type="range"/)],
 ['beat sync toggle',()=>assert.match(studio,/settings\.beatSync/)],
 ['beat scheduling',()=>assert.match(studio,/nextBeatBoundary/)],
 ['raf wait',()=>assert.match(studio,/requestAnimationFrame\(poll\)/)],
 ['save settings',()=>assert.match(studio,/saveMotionTransitionSettings/)],
 ['uses existing library',()=>assert.match(lib,/<MotionTransitionStudio model=\{model\} motions=\{motions\}/)],
 ['settings sanitized',()=>assert.match(settings,/sanitizeMotionTransitionSettings/)],
 ['bounded duration',()=>assert.match(settings,/clamp\(o\.duration,0\.1,4,0\.6\)/)],
 ['persistent key',()=>assert.match(settings,/sonic\.motion\.transition\.studio\.v192/)],
 ['run script',()=>assert.match(pkg.scripts['test:motion-transition-studio'],/motion-transition-studio-regression/)],
 ['no global timer in module',()=>assert.doesNotMatch(settings,/setInterval/)]
];for(const [n,fn] of tests){fn();console.log('✓ '+n)}console.log(tests.length+' V192 tests passed');
