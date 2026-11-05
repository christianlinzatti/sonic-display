'use strict';
/** V1004: every historical gate remains active as release numbers advance. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { inspectRelease } = require('../scripts/release-integrity-v752.cjs');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
let count = 0;
const test = (name, fn) => { fn(); count++; console.log('PASS V1004 ' + name); };
const steps = (command) => command.split(/\s*&&\s*/).map(s => s.trim());

test('release and lockfile are monotonic and match in all three locations', () => {
  assert.match(pkg.version, /^0\.1\.0-v\d+$/);
  assert.ok(Number(pkg.version.split('-v')[1]) >= 1004);
  assert.equal(pkg.version, lock.version);
  assert.equal(pkg.version, lock.packages[''].version);
});
test('original release-integrity safety gate remains enabled', () => {
  const check = inspectRelease(root, { ci: true });
  assert.equal(check.ok, true, JSON.stringify(check.issues));
});
test('prebuild starts with actual current release and ends with fast gate', () => {
  const script = steps(pkg.scripts.prebuild);
  assert.equal(script[0], 'npm run test:v' + pkg.version.split('-v')[1]);
  assert.equal(script[script.length-1], 'npm run check:fast');
  assert.equal(script.filter(s => s === 'npm run check:fast').length, 1);
});
test('historic safety regressions all still scheduled, exactly once', () => {
  const script = steps(pkg.scripts.prebuild);
  for (const name of ['v908', 'v910', 'v925', 'v929', 'v1002', 'v1003']) {
    assert.equal(script.filter(s => s === 'npm run test:' + name).length, 1, name);
    assert.ok(pkg.scripts['test:' + name], name);
  }
});
test('release guard uses stable version comparison instead of exact historic version', () => {
  assert.match(read('tests/v908-live-avatar-fx-verification-regression.cjs'), /Dokumentationsstand/);
  assert.match(read('tests/v908-live-avatar-fx-verification-regression.cjs'), />=908/);
  for (const n of ['v910', 'v925', 'v929']) {
    const source = read({v910:'tests/v910-pi-kiosk-govee-regression.cjs',v925:'tests/v925-govee-festival-fx-regression.cjs',v929:'tests/v929-govee-troubleshooting-regression.cjs'}[n]);
    assert.ok(!source.includes("prebuild.startsWith('npm run test:v908"), n);
    assert.ok(source.includes('check:fast'), n);
  }
});
test('production commands remain real and no test-only types hide production errors', () => {
  assert.equal(pkg.scripts.typecheck, 'tsc --noEmit');
  assert.equal(pkg.scripts.build, 'next build');
  assert.equal(pkg.scripts['build:next'], 'next build');
  const tsconfig = JSON.parse(read('tsconfig.json'));
  assert.equal(tsconfig.compilerOptions.strict, true);
  assert.equal(tsconfig.compilerOptions.noEmit, true);
  assert.ok(tsconfig.exclude.includes('tests'));
});
test('Vercel always runs full types and the real emitted Next.js build', () => {
  const vercel = JSON.parse(read('vercel.json'));
  const source = read('scripts/vercel-production-build.cjs');
  assert.equal(vercel.buildCommand, 'node scripts/vercel-production-build.cjs');
  for (const keyword of ['V1004 Production Reliability 2.0', "run('Full TypeScript'", "run('Real Next.js production build'", "run('Real Next.js emitted artifact verification'"]) {
    assert.ok(source.includes(keyword), keyword);
  }
  assert.ok(source.includes('node_modules/next/dist/bin/next'));
  assert.ok(source.includes('node_modules/typescript/bin/tsc'));
});
test('Windows/Linux production CI uses Node 24 and real npm ci, tsc and Next', () => {
  const workflow = read('.github/workflows/v1004-production-reliability-validation.yml');
  for (const required of ['ubuntu-24.04', 'windows-latest', "node-version: '24'", 'npm ci --include=dev', 'npm run verify:v1004:focused', 'npm run typecheck', 'npm run build:next'])
    assert.ok(workflow.includes(required), required);
});
test('new V1004 test runs before older V1003 and is included in Vercel', () => {
  assert.ok(pkg.scripts.prebuild.indexOf('npm run test:v1004') < pkg.scripts.prebuild.indexOf('npm run test:v1003'));
  assert.ok(read('scripts/vercel-production-build.cjs').includes("'tests/v1004-production-reliability-regression.cjs'"));
});
console.log(`V1004 Production Reliability: PASS ${count} gates`);
