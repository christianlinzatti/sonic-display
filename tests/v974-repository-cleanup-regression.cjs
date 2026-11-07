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
check('docs migration does not rewrite importer version-file fixtures', () => {
  const docsMigration = read('scripts/organize-version-docs.cjs');
  assert(docsMigration.includes("rel === 'tests/v974-repository-cleanup-regression.cjs'"));
});

check('new full ZIP safely updates an already-organized version document', () => {
  const os = require('node:os');
  const crypto = require('node:crypto');
  const { moveChecked } = require('../scripts/organize-project-structure.cjs');
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'sonic-doc-revision-'));
  try {
    const old = 'V1031 archived 360 arena documentation';
    const revised = 'V1041 updated 360 arena documentation';
    const src = path.join(temp, 'V1031-360-ARENA.md');
    const dest = path.join(temp, 'docs', 'versions', 'V1031-360-ARENA.md');
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(src, revised);
    fs.writeFileSync(dest, old);
    moveChecked(src, dest, { allowVersionUpdate: true, archiveRoot: temp });
    assert.equal(fs.readFileSync(dest, 'utf8'), revised);
    assert(!fs.existsSync(src));
    const digest = crypto.createHash('sha256').update(old).digest('hex');
    const archive = path.join(temp, 'artifacts', 'historical', 'document-revisions',
      'V1031-360-ARENA.md.' + digest + '.bak');
    assert.equal(fs.readFileSync(archive, 'utf8'), old);
    fs.writeFileSync(src, revised);
    moveChecked(src, dest, { allowVersionUpdate: true, archiveRoot: temp });
    assert.equal(fs.readFileSync(archive, 'utf8'), old);
    const unsafe = path.join(temp, 'README.md');
    const unsafeDest = path.join(temp, 'docs', 'versions', 'README.md');
    fs.writeFileSync(unsafe, 'untrusted replacement');
    fs.writeFileSync(unsafeDest, 'existing canonical document');
    assert.throws(() => moveChecked(unsafe, unsafeDest,
      { allowVersionUpdate: true, archiveRoot: temp }), /Conflicting documents/);
    assert.equal(fs.readFileSync(unsafeDest, 'utf8'), 'existing canonical document');
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

console.log('V974 Repository Cleanup: PASS ' + checks + ' checks');
