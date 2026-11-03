'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const preload = path.join(__dirname, 'helpers/force-crlf-source-v86513.cjs');
const cases = [
  'v682-cinematic-camera-variety-regression.cjs',
  'v633-cinematic-camera-2-regression.cjs',
  'v429-cinematic-rap-camera-regression.cjs',
  'v655-natural-concert-camera-regression.cjs',
  'v747-performance-camera-regression.cjs',
  'v497-cinematic-concert-choreography-regression.cjs',
  'v531-shared-embedded-motion-regression.cjs',
  'v612-expressive-vocal-facial-performance-regression.cjs',
  'v592-live-concert-quality-regression.cjs',
  'v412-avatar-preview-nullguard-regression.cjs',
];
for (const file of cases) {
  const result = spawnSync(process.execPath, ['--require', preload, path.join(__dirname, file)], {
    cwd: root, encoding: 'utf8', timeout: 90000, windowsHide: true,
  });
  if (result.status !== 0 || result.error || result.signal) {
    console.error(result.stdout || '');
    console.error(result.stderr || '');
  }
  assert.equal(result.error, undefined, `${file}: ${result.error?.message}`);
  assert.equal(result.status, 0, `${file}: Windows CRLF simulation failed`);
  console.log(`PASS Windows CRLF simulation: ${file}`);
}
console.log(`PASS V865.13: ${cases.length} Windows CRLF regression scripts`);
