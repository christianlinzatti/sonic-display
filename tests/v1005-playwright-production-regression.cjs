'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../scripts/playwright-production.cjs'), 'utf8');
let count = 0;
function fixture({ artifactPassed = true, spawnStatus = 0, stats = { expected: 12, unexpected: 0, skipped: 0, flaky: 0 } } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sonic-playwright-'));
  fs.mkdirSync(path.join(root, '.next'), { recursive: true });
  fs.writeFileSync(path.join(root, '.next/BUILD_ID'), 'fixture-build-123');
  const calls = [];
  const module = { exports: {} };
  const fakeProcess = { execPath: process.execPath, platform: process.platform, version: process.version, env: {} };
  vm.runInNewContext(source, {
    __dirname: path.join(root, 'scripts'), module, process: fakeProcess, console: { log() {} },
    require(name) {
      if (name === './check-next-build-v964.cjs') return { inspectBuild: () => ({ passed: artifactPassed, issues: artifactPassed ? [] : ['BUILD_ID stale'] }) };
      if (name === 'node:child_process') return { spawnSync(_exe, args) {
        calls.push(args);
        fs.writeFileSync(path.join(root, 'reports/playwright-production/results.json'), JSON.stringify({ stats }));
        return { status: spawnStatus };
      } };
      return require(name);
    },
  });
  return { root, calls, run: module.exports.runProductionTests,
    clean() { fs.rmSync(root, { recursive: true, force: true }); } };
}
function check(name, options, verify, existingBuildSince = Date.now() - 5000) {
  const f = fixture(options);
  try { verify(f.run({ existingBuildSince }), f); count++; console.log('PASS V1005 ' + name); }
  finally { f.clean(); }
}
check('stale artifacts never reach browser runner', { artifactPassed: false }, (proof, f) => {
  assert.equal(proof.passed, false); assert.equal(f.calls.length, 0); assert.match(proof.error, /stale/);
});
check('invalid existing build timestamp fails closed', {}, (proof, f) => {
  assert.equal(proof.passed, false); assert.equal(f.calls.length, 0);
}, NaN);
check('nonzero Playwright exit fails gate despite passing-looking report', { spawnStatus: 1 }, proof => assert.equal(proof.passed, false));
for (const stats of [{ expected: 0, unexpected: 0, skipped: 0, flaky: 0 }, { expected: 11, unexpected: 0, skipped: 1, flaky: 0 }, { expected: 11, unexpected: 1, skipped: 0, flaky: 0 }]) {
  check('empty, skipped or failed suite cannot pass: ' + JSON.stringify(stats), { stats }, proof => assert.equal(proof.passed, false));
}
check('passing suite records build and artifact evidence without rebuilding', {}, (proof, f) => {
  assert.equal(proof.passed, true); assert.equal(proof.buildId, 'fixture-build-123'); assert.equal(f.calls.length, 1);
  const evidence = JSON.parse(fs.readFileSync(path.join(f.root, 'reports/v959-regression-logs/playwright-production.log')));
  assert.equal(evidence.proof.passed, true); assert.equal(evidence.playwright.stats.expected, 12);
});
// Exercise the actual parity script: browser failure must change the uploaded aggregate proof.
for (const [github, browserPassed] of [[true, true], [true, false], [false, false]]) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sonic-parity-'));
  const fakeProcess = { execPath: process.execPath, version: process.version, versions: { node: '24.0.0' },
    env: github ? { GITHUB_ACTIONS: 'true' } : {} };
  let browserCalls = 0;
  try {
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../scripts/vercel-production-build.cjs'), 'utf8'), {
      __dirname: path.join(root, 'scripts'), process: fakeProcess, console: { log() {}, error() {} },
      require(name) {
        if (name === 'node:child_process') return { spawnSync: () => ({ status: 0 }) };
        if (name === './playwright-production.cjs') return { runProductionTests(options) {
          browserCalls++; assert.ok(options.existingBuildSince > 0); return { passed: browserPassed };
        } };
        return require(name);
      },
    });
    const proof = JSON.parse(fs.readFileSync(path.join(root, 'reports/vercel-production-proof.json')));
    assert.equal(browserCalls, github ? 1 : 0);
    assert.equal(proof.passed, !github || browserPassed);
    if (github && !browserPassed) assert.equal(fakeProcess.exitCode, 1);
    count++; console.log(`PASS V1005 parity integration: GitHub=${github}, browserPassed=${browserPassed}`);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
}
console.log(`V1005: ${count} orchestration checks passed`);
