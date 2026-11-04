#!/usr/bin/env node
'use strict';
/** Always-run CI reporter: an interrupted npm install is FAILED, never green. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const reportDir = path.join(root, 'reports');
const reportPath = path.join(reportDir, 'v959-build-proof.json');
const summaryPath = path.join(reportDir, 'v959-build-summary.md');
fs.mkdirSync(reportDir, { recursive: true });
let proof;
try { proof = JSON.parse(fs.readFileSync(reportPath, 'utf8')); }
catch (_) {
  proof = { schema: 'sonic-v959-build-proof-v1', passed: false,
    error: 'VERIFIER_NOT_COMPLETED_OR_NPM_INSTALL_FAILED', platform: process.platform,
    node: process.version, finishedAt: new Date().toISOString(),
    readiness: null, production: null };
  fs.writeFileSync(reportPath, JSON.stringify(proof, null, 2) + '\n');
}
let independentRegressions = null;
try { independentRegressions = JSON.parse(fs.readFileSync(path.join(reportDir, 'v959-regression-only.json'),'utf8')); } catch (_) {}
const passed = proof.passed === true && proof.readiness?.passed === true && proof.production?.passed === true;
const status = passed ? 'PASS' : 'FAIL (no production approval)';
const rows = [
  '## Sonic Display V959 – Production Build Evidence', '',
  `**Status:** ${status}`, '',
  `- Platform: ${proof.platform || process.platform}`,
  `- Node.js: ${proof.node || process.version}`,
  `- Build version: ${proof.version || 'unknown'}`,
  `- Preflight: ${proof.readiness?.passed === true ? 'PASS' : 'FAIL / not completed'}`,
  `- V931 complete TypeScript + Next.js gate: ${proof.production?.passed === true ? 'PASS' : 'FAIL / not completed'}`,
  `- Error: ${proof.error || 'none'}`,
  `- Production-gate parallel workers: ${proof.production?.regressionConcurrency ?? 'not run'}`,
  `- Separate regression-only run: ${independentRegressions?.passed === true ? `${independentRegressions.tests.filter(t => t.ok).length}/${independentRegressions.tests.length} passed (not production certification)` : 'not verified in this report'}`, '',
  'A green build requires a successful `npm ci`, all focused regressions, full `tsc --noEmit`, and an actual `next build`.', '',
];
const markdown = rows.join('\n');
fs.writeFileSync(summaryPath, markdown);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
console.log(markdown);
if (!passed) process.exitCode = 1;
