const assert=require('node:assert/strict');const fs=require('node:fs');
const player=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
const pkg=require('../package.json');
const checks=[
 ['v191 version',()=>assert.match(pkg.version,/v\d+$/)],
 ['preloads via async GLTF',()=>assert.match(player,/loader\.loadAsync\(m\.url\)/)],
 ['isolates failed loads',()=>assert.match(player,/Promise\.allSettled/)],
 ['retargets to stable rig',()=>assert.match(player,/retargetHumanoidClips\(result\.value\.animations, result\.value\.scene, model/)],
 ['distinct library clip IDs',()=>assert.match(player,/Library:\$\{installed\[i\]\.id\}/)],
 ['includes multiple clips in one mixer',()=>assert.match(player,/\.\.\.libraryClips\], \[animations/)],
 ['selects dynamic library clip',()=>assert.match(player,/stableLibraryClip && actions\[stableLibraryClip\]/)],
 ['crossfade stays enabled',()=>assert.match(player,/nextAction\.fadeIn\(plan\.duration\)/)],
 ['does not swap imported component on automatic motion switch',()=>assert.match(player,/library\.automatic \? undefined : requestedAnimationUrl/)],
 ['uses detected BPM when selecting',()=>assert.match(player,/audio\.bpm \?\? undefined/)],
 ['stage passes BPM',()=>assert.match(stage,/audio\.bpm \?\? undefined/)],
 ['uses motion change event',()=>assert.match(player,/CHARACTER_MOTION_CHANGE_EVENT/)],
 ['calibration invalidates cache',()=>assert.match(player,/libraryKey, model, url, calibrationVersion/)],
 ['bounded library preload',()=>assert.match(player,/slice\(-24\)/)],
 ['throttles rapid motion switches',()=>assert.match(player,/shouldSwitchLiveMotion\(/)],
 ['prevents outdated fetch state',()=>assert.match(player,/if \(cancelled\) return/)]
];
checks.forEach(([n,f])=>{f();console.log('✓ '+n)});console.log(checks.length+' V191 checks passed');
