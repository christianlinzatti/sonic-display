#!/usr/bin/env node
'use strict';
// Runs before npm ci: catches lockfile drift and Windows/Linux path collisions.
const path = require('node:path');
const { inspect } = require('../lib/v959BuildReadiness.cjs');
const fs = require('node:fs');
const root = path.resolve(__dirname, '..');
// A previous successful artifact must never survive a failed npm ci step.
for (const report of ['v959-build-proof.json', 'v959-build-summary.md', 'v931-production-gate.json']) {
  const output = path.join(root, 'reports', report);
  if (fs.existsSync(output)) fs.unlinkSync(output);
}
const report = inspect(root, { requireDependencies: false });
for (const c of report.checks) console.log(`${c.passed ? 'PASS' : 'FAIL'} V959 ${c.id}: ${c.detail}`);
if (!report.passed) process.exitCode = 1;
