#!/usr/bin/env node
'use strict';
/** V974: fail-closed repository hygiene after complete ZIP imports. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const exists = file => fs.existsSync(path.join(root, file));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const allowed = new Set([
  '.env.example', '.gitattributes', '.gitignore',
  'README.md', 'ARCHITECTURE.md', 'global.d.ts',
  'next-env.d.ts', 'next.config.ts', 'package.json',
  'package-lock.json', 'tsconfig.json',
  'tsconfig.v319-core.json', 'vercel.json',
]);
let checks = 0;
function check(description, fn) {
  fn(); checks++; console.log('PASS V974 ' + description);
}
check('root contains only runtime and configuration entry points', () => {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile()) assert(allowed.has(entry.name), 'unexpected root file: ' + entry.name);
    if (entry.isDirectory()) assert(!/^v[0-9]+$/i.test(entry.name), 'obsolete version folder: ' + entry.name);
  }
});
check('versioned directories V874-V878 and old installers are not executable', () => {
  for (let v = 874; v <= 878; v++) {
    assert(!exists('v' + v));
    assert(!exists('apply-v' + v + '.cjs'));
    assert(exists('docs/history/retired-installers/apply-v' + v + '.cjs.txt'));
  }
});
check('historical divergent snapshots remain accessible', () => {
  for (const file of [
    'artifacts/legacy-snapshots/IntelligentAudienceArmsV874.tsx.txt',
    'artifacts/legacy-snapshots/FestivalWristbandsV875.tsx.txt',
    'artifacts/legacy-snapshots/v878-smart-audience-emotion-regression.cjs.txt',
  ]) assert(exists(file), 'missing archived source: ' + file);
});
check('historical documentation and evidence remain in dedicated directories', () => {
  for (const file of [
    'docs/features/avatars/AVATAR_EDITOR_V70.md',
    'docs/features/integrations/GOVEE_LAN_V909.md',
    'docs/setup/SPOTIFY_LOCAL_SETUP.md',
    'artifacts/historical/manifests/V908-FILE-MANIFEST-SHA256.json',
  ]) assert(exists(file), 'missing archive: ' + file);
});
check('live app, Alexa, Govee and importer are untouched', () => {
  for (const file of [
    'app/page.tsx', 'components/ConcertRoadmapStudioV958.tsx',
    'integrations/alexa/handler.cjs', 'scripts/govee-lan-bridge.cjs',
    'scripts/project-archive-import.py', 'package-lock.json',
  ]) assert(exists(file), 'missing production file: ' + file);
});
check('future ZIP imports always run conservative structure repair', () => {
  const workflow = read('.github/workflows/project-archive-import.yml');
  assert(workflow.includes('releases/SonicDisplay-V*.zip'));
  assert(workflow.includes('node scripts/organize-project-structure.cjs'));
  assert(workflow.includes('node tests/v974-repository-cleanup-regression.cjs'));
});
console.log('V974 Repository Cleanup: PASS ' + checks + ' checks');
