#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const exists = (...segments) => fs.existsSync(path.join(root, ...segments));
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), 'utf8');
let checks = 0;
function check(name, fn) {
  try { fn(); checks++; }
  catch (error) { error.message = `${name}: ${error.message}`; throw error; }
}
check('all old v874-v878 folders are absent', () => {
  for (let v = 874; v <= 878; v++) assert(!exists(`v${v}`));
});
check('historic sources are present at their canonical paths', () => {
  for (const file of [
    'components/visualizer/IntelligentAudienceArmsV874.tsx',
    'components/visualizer/FestivalWristbandsV875.tsx',
    'components/visualizer/dynamicFestivalCrowdChoreographyV876.ts',
    'components/visualizer/intelligentCrowdInteractionV877.ts',
    'components/visualizer/smartAudienceEmotionDirectorV878.ts',
    'tests/tsconfig.v874-core.json',
    'tests/tsconfig.v878-core.json',
    'tests/v874-intelligent-audience-regression.cjs',
    'tests/v878-smart-audience-emotion-regression.cjs',
  ]) assert(exists(file), `missing active code ${file}`);
});
check('two divergent legacy components retained for forensic reference', () => {
  assert(exists('artifacts/legacy-snapshots/IntelligentAudienceArmsV874.tsx.txt'));
  assert(exists('artifacts/legacy-snapshots/FestivalWristbandsV875.tsx.txt'));
  assert(exists('artifacts/legacy-snapshots/v878-smart-audience-emotion-regression.cjs.txt'));
});
check('root contains only intentional project entry files', () => {
  const allowed = new Set([
    '.env.example', '.gitattributes', '.gitignore',
    'README.md', 'ARCHITECTURE.md',
    'global.d.ts', 'next-env.d.ts', 'next.config.ts',
    'package.json', 'package-lock.json', 'tsconfig.json',
    'tsconfig.v319-core.json', 'vercel.json',
  ]);
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.isFile()) assert(allowed.has(entry.name), `unexpected root file ${entry.name}`);
    if (entry.isDirectory()) assert(!/^v\d+$/.test(entry.name), `unexpected version root ${entry.name}`);
  }
});
check('feature documentation is grouped by topic', () => {
  for (const name of [
    'docs/features/avatars/AVATAR_EDITOR_V70.md',
    'docs/features/dance/CHOREOGRAPHY_V95.md',
    'docs/features/lyrics/LYRICS_STUDIO_V76.md',
    'docs/features/stage/LASER_SHOW_DIRECTOR_V888.md',
    'docs/features/performance/GPU_MEMORY_LEAK_V767.md',
    'docs/setup/SPOTIFY_LOCAL_SETUP.md',
    'docs/structure/README.md',
  ]) assert(exists(name), `missing categorized docs ${name}`);
});
check('Vercel deployment configuration stayed in root', () => {
  assert(exists('vercel.json'), 'vercel.json is required at root');
});
check('old installer sources are labelled retired, not accidentally runnable', () => {
  for (const version of [874,875,876,877,878]) {
    assert(exists(`docs/history/retired-installers/apply-v${version}.cjs.txt`));
    assert(!exists(`apply-v${version}.cjs`));
  }
});
check('source config does not refer to removed version folders', () => {
  const config = JSON.parse(read('tsconfig.json'));
  for (let v = 874; v <= 878; v++) assert(!config.exclude.some(x => x.startsWith(`v${v}/`)));
});
check('existing test scripts still run canonical regressions', () => {
  const pkg = JSON.parse(read('package.json'));
  for (let v = 874; v <= 878; v++) {
    assert(pkg.scripts[`test:v${v}`].includes(`tests/v${v}-`));
    assert(pkg.scripts[`test:v${v}:types`].includes(`tests/tsconfig.v${v}-core.json`));
  }
});
check('version-neutral importer protects workflows and the organized project', () => {
  const importer=read('scripts/project-archive-import.py');
  assert(importer.includes('ARCHIVE_NAME'));
  assert(importer.includes('scripts/project-archive-import.py'));
  assert(importer.includes('rel.parts[0].casefold() == ".github"'));
  assert(read('scripts/organize-version-docs.cjs').includes("require('./organize-project-structure.cjs').main()"));
});
console.log(`V966 Project Structure: PASS ${checks} checks`);
