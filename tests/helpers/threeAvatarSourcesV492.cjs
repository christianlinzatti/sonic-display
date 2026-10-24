'use strict';
/**
 * V492 module split compatibility for legacy source-level regression tests.
 * Older tests asserted against one large ThreeAvatar.tsx file.  The renderer
 * now delegates to five extracted modules.  Resolve the same logical source
 * from the ACTUAL modules (never a frozen or duplicated snapshot).
 * This shim affects only individual test processes opting in with install().
 */
const fs = require('node:fs');
const path = require('node:path');
const ORIGINAL = fs.readFileSync;
const SOURCE_NAMES = Object.freeze([
  'ThreeAvatarContextsV492.tsx',
  'ProceduralDancerAvatarV492.tsx',
  'GltfDancerAvatarV492.tsx',
  'useGltfFootContactV492.ts',
  'useGltfVocalMotionV492.ts',
  'gltfVocalPerformanceV492.ts',
  'useGltfBlendSetupV492.ts',
  'useGltfAnimationMixerV492.ts',
  'useGltfClipTransitionsV492.ts',
  'useGltfBlendPlaybackV492.ts',
  'DanceFormationActorsV492.tsx',
  'GroupDancersV326SceneV492.tsx',
  'ThreeAvatar.tsx',
]);
const SRC_DIR = path.resolve(__dirname, '../../components/visualizer');
function combinedSources() {
  return SOURCE_NAMES.map(name => ORIGINAL.call(fs, path.join(SRC_DIR, name), 'utf8')).join('\n');
}
function install() {
  if (fs.readFileSync.__sonicModularV492) return;
  function readFileSync(source, ...args) {
    if (typeof source === 'string' &&
        source.replace(/\\/g, '/').endsWith('/ThreeAvatar.tsx')) {
      const encoding = typeof args[0] === 'string' ? args[0] : args[0]?.encoding;
      const data = combinedSources();
      return encoding ? data : Buffer.from(data, 'utf8');
    }
    return ORIGINAL.call(fs, source, ...args);
  }
  readFileSync.__sonicModularV492 = true;
  fs.readFileSync = readFileSync;
}
module.exports = { combinedSources, install, SOURCE_NAMES };
