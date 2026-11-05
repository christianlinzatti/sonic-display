'use strict';
/** V752: regression tests for the read-only release gate and broken-release fixtures. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { inspectRelease } = require('../scripts/release-integrity-v752.cjs');
const project = path.resolve(__dirname, '..');
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'sonic-v752-integrity-'));
const files = ['package.json', 'package-lock.json', 'tsconfig.json', '.github/workflows/concert-validation-v571.yml'];
let checks = 0;
function ok(condition, label) { checks++; assert(condition, label); }
function inspect() { return inspectRelease(fixture, { ci: true }); }
function broken(id) { const result = inspect(); ok(!result.ok && result.issues.some(issue => issue.id === id), `Expected failure: ${id}; got: ${result.issues.map(i => i.id).join(', ')}`); }
function mutateJson(file, fn, id) {
  const dest = path.join(fixture, file);
  const original = fs.readFileSync(dest, 'utf8');
  try {
    const obj = JSON.parse(original); fn(obj);
    fs.writeFileSync(dest, JSON.stringify(obj));
    broken(id);
  } finally { fs.writeFileSync(dest, original); }
}
function mutateText(file, fn, id) {
  const dest = path.join(fixture, file);
  const original = fs.readFileSync(dest, 'utf8');
  try { fs.writeFileSync(dest, fn(original)); broken(id); }
  finally { fs.writeFileSync(dest, original); }
}
try {
  for (const file of files) {
    const dest = path.join(fixture, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(project, file), dest);
  }
  const baseline = inspect();
  ok(baseline.ok, JSON.stringify(baseline.issues));
  ok(baseline.dependencyCount === 18, '18 direct application dependencies must be covered');
  ok(inspectRelease(project, { ci: true }).ok, 'Real checkout also passes');
  mutateJson('package-lock.json', p => { p.lockfileVersion = 2; }, 'lock:format');
  mutateJson('package-lock.json', p => { p.version = '0.1.0-v751'; }, 'lock:top:version');
  mutateJson('package-lock.json', p => { p.packages[''].version = '0.1.0-v751'; }, 'lock:root:version');
  mutateJson('package-lock.json', p => { p.packages[''].dependencies.react = '^0.0.1'; }, 'lock:range:dependencies:react');
  mutateJson('package-lock.json', p => { delete p.packages[''].devDependencies.typescript; }, 'lock:range:devDependencies:typescript');
  mutateJson('package-lock.json', p => { delete p.packages['node_modules/zustand']; p.packages[''].dependencies.zustand = '^5.0.16'; }, 'lock:range:dependencies:zustand');
  mutateJson('package-lock.json', p => { delete p.packages['node_modules/next']; }, 'lock:entry:dependencies:next');
  mutateJson('package-lock.json', p => { delete p.packages['node_modules/react'].integrity; }, 'lock:integrity:dependencies:react');
  mutateJson('package.json', p => { p.version = '0.1.0-v' + (Number(String(p.sonicRoadmapRelease).replace(/^v/, '')) + 1); }, 'release:version');
  mutateJson('package.json', p => { p.scripts.prebuild = ''; }, 'scripts:prebuild');
  mutateJson('package.json', p => { p.scripts.typecheck = 'tsc -p tests/tsconfig.v751-core.json'; }, 'scripts:typecheck');
  mutateJson('package.json', p => { p.scripts.build = 'echo skipped'; }, 'scripts:build');
  mutateJson('package.json', p => { p.scripts['check:fast'] = 'node nothing.cjs'; }, 'scripts:fast');
  mutateJson('tsconfig.json', p => { p.compilerOptions.strict = false; }, 'tsconfig:strict');
  mutateJson('tsconfig.json', p => { p.compilerOptions.noEmit = false; }, 'tsconfig:noEmit');
  mutateJson('tsconfig.json', p => { p.compilerOptions.forceConsistentCasingInFileNames = false; }, 'tsconfig:case');
  mutateJson('tsconfig.json', p => { p.exclude = ['node_modules']; }, 'tsconfig:fixtures');
  mutateJson('tsconfig.json', p => { p.exclude = ['tests/**/*']; }, 'tsconfig:node_modules');
  mutateJson('tsconfig.json', p => { p.include = ['next-env.d.ts']; }, 'tsconfig:source');
  mutateText('.github/workflows/concert-validation-v571.yml', t => t.replace('windows-latest', 'macos-latest'), 'ci:windows-latest');
  mutateText('.github/workflows/concert-validation-v571.yml', t => t.replace('npm ci --no-audit --no-fund', 'npm install --no-audit --no-fund'), 'ci:npm ci');
  mutateText('.github/workflows/concert-validation-v571.yml', t => t.replace('npm run typecheck', 'echo skip-typecheck'), 'ci:npm run typecheck');
  mutateText('.github/workflows/concert-validation-v571.yml', t => t.replace('npm run build', 'echo skip-build'), 'ci:npm run build');
  ok(inspect().ok, 'All fixture mutations were rolled back');
  // Ensure the checker never changes source files or lockfile while validating.
  for (const file of files) {
    ok(fs.readFileSync(path.join(project, file)).equals(fs.readFileSync(path.join(fixture, file))), `Release check mutated ${file}`);
  }
  // Windows case collisions and test shadowing remain guarded separately by the existing suite.
  const prod = JSON.parse(fs.readFileSync(path.join(project, 'tsconfig.json'), 'utf8'));
  ok(prod.exclude.includes('tests/**/*'), 'Productive TS must exclude all test declarations');
  ok(!prod.exclude.includes('components'), 'Productive TS must still include runtime components');
  console.log(`PASS V752 build integration regression: ${checks} assertions, negative fixtures, CI, lockfile & TypeScript isolation`);
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}
