'use strict';

// Regression for Node package "exports" maps. Running `npm install` can succeed
// even when require.resolve('<package>/package.json') is intentionally blocked.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sonic-v412-preflight-'));
const fixtureScripts = path.join(tempRoot, 'scripts');
const fixtureModules = path.join(tempRoot, 'node_modules');
const packages = ['three', '@vercel/blob', 'ably'];
const testEnv = { ...process.env, npm_config_user_agent: 'npm/11.6.1 node/v24.19.0' };

try {
  fs.mkdirSync(fixtureScripts, { recursive: true });
  fs.mkdirSync(fixtureModules, { recursive: true });
  fs.copyFileSync(path.join(__dirname, '..', 'scripts', 'build-preflight.cjs'), path.join(fixtureScripts, 'build-preflight.cjs'));
  fs.writeFileSync(path.join(tempRoot, 'package.json'), JSON.stringify({
    name: 'preflight-exports-fixture', dependencies: Object.fromEntries(packages.map(name => [name, '0.0.0']))
  }));
  fs.writeFileSync(path.join(tempRoot, 'package-lock.json'), '{}');

  for (const name of packages) {
    const folder = path.join(fixtureModules, ...name.split('/'));
    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(path.join(folder, 'package.json'), JSON.stringify({
      name, version: '0.0.0', exports: { '.': './index.js' }
    }));
    fs.writeFileSync(path.join(folder, 'index.js'), 'module.exports = {}\n');
    assert.throws(() => require.resolve(`${name}/package.json`, { paths: [tempRoot] }),
      { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' }, `${name} must simulate a restrictive exports map`);
  }

  const run = () => spawnSync(process.execPath, [path.join(fixtureScripts, 'build-preflight.cjs')],
    { encoding: 'utf8', env: testEnv });
  const installed = run();
  assert.equal(installed.status, 0, installed.stderr);
  assert.match(installed.stdout, /Dependencies available: 3\/3/);
  assert.match(installed.stdout, /PASS: all direct dependencies are installed/);
  assert.match(installed.stdout, /npm 11\.6\.1/);

  fs.rmSync(path.join(fixtureModules, 'ably'), { recursive: true, force: true });
  const missing = run();
  assert.equal(missing.status, 2, missing.stdout + missing.stderr);
  assert.match(missing.stdout, /Dependencies available: 2\/3/);
  assert.match(missing.stderr, /npm dependencies missing: ably/);

  console.log('PASS V412 preflight hotfix: exports-restricted installed packages, scoped packages, actual missing detection, Windows-safe npm version');
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
