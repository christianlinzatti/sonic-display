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
// React 19 intentionally does not expose React.act in its production runtime.
// Validate real test-mode compatibility in a separate development process and
// validate production imports without requiring test-only APIs. This check must
// also run during Vercel's NODE_ENV=production build.
const {spawnSync} = require('node:child_process');
const projectRoot = path.resolve(__dirname, '..');
let runtime = 'static source check (dependencies not installed)';
let installed = false;
try {
  require.resolve('react', {paths: [projectRoot]});
  installed = true;
} catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
}
if (installed) {
  const source = [
    'const assert=require("node:assert/strict");',
    'const React=require("react");',
    'assert.equal(typeof React.createElement,"function");',
    'if(process.env.NODE_ENV==="development")',
    '  assert.equal(typeof React.act,"function","Test runtime must export React.act");'
  ].join('\n');
  for (const mode of ['development', 'production']) {
    const result = spawnSync(process.execPath, ['-e', source], {
      cwd: projectRoot, env: {...process.env, NODE_ENV: mode},
      encoding: 'utf8', timeout: 20000, windowsHide: true
    });
    assert.equal(result.status, 0,
      'React runtime failed in '+mode+': '+(result.error?.message || result.stderr || result.stdout));
  }
  runtime = 'development React.act and production React import validated';
}
console.log('PASS React.act compatibility: '+tests.length+' renderer-based regression suites ('+runtime+')');
