'use strict';

// Regression guard for React 19+: act is imported from React, not from the
// deprecated react-test-renderer package (which may not export it).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const tests = fs.readdirSync(root).filter((name) => name !== path.basename(__filename) && name.endsWith('.cjs') &&
  fs.readFileSync(path.join(root, name), 'utf8').includes("require('react-test-renderer')"));

assert(tests.length > 0, 'Expected React renderer regression tests');
for (const name of tests) {
  const source = fs.readFileSync(path.join(root, name), 'utf8');
  assert.doesNotMatch(source,
    /\{[^}]*\bact\b[^}]*\}\s*=\s*require\(['"]react-test-renderer['"]\)/,
    `${name}: never import act from react-test-renderer`);
  assert.match(source, /\bReact\s*=\s*require\(['"]react['"]\)/,
    `${name}: import React for act`);
  assert.match(source, /(?:\bact\s*=\s*React\.act|\{\s*act\s*\}\s*=\s*React)/,
    `${name}: use React.act`);
}
// In CI node_modules is installed: verify the exported runtime function too.
// Source-only archives can still run this static guard before npm ci.
let runtime = 'static source check';
try {
  const React = require('react');
  assert.equal(typeof React.act, 'function', 'Installed React must export act');
  runtime = 'static + runtime React.act check';
} catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
}
console.log(`PASS React.act compatibility: ${tests.length} renderer-based regression suites (${runtime})`);
