'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pkg = require('../package.json');
const dependencies = Object.keys({
  ...pkg.dependencies,
  ...pkg.devDependencies,
});

// Do not resolve "<package>/package.json" here: packages such as three,
// @vercel/blob and ably may not export their manifest through Node's
// package "exports" map even when they are correctly installed.
function isInstalled(packageName) {
  const manifest = path.join(root, 'node_modules', ...packageName.split('/'), 'package.json');
  if (fs.existsSync(manifest)) return true;

  // Also support dependencies resolved from an ancestor node_modules directory
  // (e.g. an npm workspace). Resolving the public package entry is export-safe.
  try {
    require.resolve(packageName, { paths: [root] });
    return true;
  } catch {
    return false;
  }
}

const missing = dependencies.filter((dependency) => !isInstalled(dependency));
const nodeMajor = Number(process.versions.node.split('.')[0]);
const npmAgent = process.env.npm_config_user_agent || '';
const npmVersion = npmAgent.match(/(?:^|\s)npm\/([^\s]+)/)?.[1] || 'unknown';

console.log(`Node ${process.version} / npm ${npmVersion}`);
console.log(`package-lock.json: ${fs.existsSync(path.join(root, 'package-lock.json')) ? 'present' : 'missing'}`);
console.log(`Dependencies available: ${dependencies.length - missing.length}/${dependencies.length}`);

if (nodeMajor < 20) {
  console.error('FAIL: Node >=20 required');
  process.exitCode = 1;
}
if (missing.length > 0) {
  console.error('BLOCKED: npm dependencies missing: ' + missing.join(', '));
  console.error('Check node_modules and reinstall dependencies with npm ci if necessary.');
  process.exitCode = 2;
} else {
  console.log('PASS: all direct dependencies are installed.');
}
