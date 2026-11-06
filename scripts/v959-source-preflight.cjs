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
const {inspectReleaseV1013}=require('./v1013-release-readiness.cjs');
const release=inspectReleaseV1013(root);
for(const check of release.checks)console.log(`${check.ok?'PASS':'FAIL'} V1013 ${check.id}${check.ok?'':': '+check.reason}`);
for (const c of report.checks) console.log(`${c.passed ? 'PASS' : 'FAIL'} V959 ${c.id}: ${c.detail}`);
const {inspectReleaseV1014}=require('./v1014-release-readiness.cjs');
const v1014=inspectReleaseV1014(root);
for(const check of v1014.checks)console.log(`${check.ok?'PASS':'FAIL'} V1014 ${check.name}`);
const {inspectReleaseV1015}=require('./v1015-release-readiness.cjs');
const v1015=inspectReleaseV1015(root);
for(const check of v1015.checks)console.log(`${check.ok?'PASS':'FAIL'} V1015 ${check.name}`);
if (!report.passed || !release.passed || !v1014.passed || !v1015.passed) process.exitCode = 1;
