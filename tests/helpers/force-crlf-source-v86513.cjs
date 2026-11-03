'use strict';
// Regression-only: simulate a Windows checkout even when CI runs on Linux.
// Do not modify project files or override runtime source compilation.
const fs = require('node:fs');
const path = require('node:path');
const original = fs.readFileSync;
const root = path.resolve(__dirname, '..', '..');
const affected = new Set([
  'components/visualizer/StageCameraDirectorV289.tsx',
  'components/visualizer/GltfDancerAvatarV492.tsx',
  'components/visualizer/VocalRigV368.tsx',
  'components/visualizer/ThreeAvatar.tsx',
  'components/visualizer/RapRealAvatarPreviewV409.tsx',
]);
fs.readFileSync = function readFileSyncWithWindowsSourceEol(file, options) {
  const value = original.apply(this, arguments);
  const rel = typeof file === 'string' ? path.relative(root, path.resolve(file)).replace(/\\/g, '/') : '';
  if (!affected.has(rel)) return value;
  if (typeof value === 'string') return value.replace(/\r?\n/g, '\r\n');
  if (Buffer.isBuffer(value)) return Buffer.from(value.toString('utf8').replace(/\r?\n/g, '\r\n'), 'utf8');
  return value;
};
