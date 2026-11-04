#!/usr/bin/env node
'use strict';
/** V959 fail-closed production verifier. No success status without V931 TypeScript+Next. */
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { inspect } = require('../lib/v959BuildReadiness.cjs');
const root = path.resolve(__dirname, '..');
const reportDir = path.join(root, 'reports');
const reportPath = path.join(reportDir, 'v959-build-proof.json');
const started = new Date().toISOString();
let proof = {
  schema: 'sonic-v959-build-proof-v1',
  startedAt: started,
  finishedAt: null,
  version: null,
  node: process.version,
  platform: process.platform,
  passed: false,
  error: null,
  readiness: null,
  production: null,
};
function save() {
  proof.finishedAt = new Date().toISOString();
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(proof, null, 2) + '\n');
}
try {
  // Never reuse an earlier run's production proof.
  const priorV931Report = path.join(reportDir, 'v931-production-gate.json');
  if (fs.existsSync(priorV931Report)) fs.unlinkSync(priorV931Report);
  proof.version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
  proof.readiness = inspect(root);
  if (!proof.readiness.passed) {
    proof.error = 'READINESS_FAILED';
    console.error('V959 FAIL: preflight failed; no production certification.');
    for (const check of proof.readiness.checks.filter(x => !x.passed)) console.error(` - ${check.id}: ${check.detail}`);
    save();
    process.exitCode = 1;
  } else {
    const startedMs = Date.now();
    const result = spawnSync(process.execPath, [path.join(root, 'scripts/v931-production-gate.cjs')], {
      cwd: root, stdio: 'inherit', shell: false, windowsHide: true,
      timeout: 1000 * 60 * 45,
      env: { ...process.env, CI: process.env.CI || 'true', NEXT_TELEMETRY_DISABLED: '1' },
    });
    const v931Path = path.join(reportDir, 'v931-production-gate.json');
    let v931Report = null;
    if (fs.existsSync(v931Path)) {
      try { v931Report = JSON.parse(fs.readFileSync(v931Path, 'utf8')); }
      catch (_) { /* corrupted proof fails closed */ }
    }
    proof.production = { exitCode: result.status, elapsedMs: Date.now() - startedMs,
      passed: Boolean(result.status === 0 && !result.error && v931Report?.passed === true),
      checks: v931Report?.tests || [],
      regressionConcurrency: v931Report?.regressionConcurrency ?? null,
      ...(result.error ? { errorCode: result.error.code || 'SPAWN_FAILURE' } : {}),
    };
    proof.passed = proof.production.passed;
    if (!proof.passed) {
      proof.error = result.error ? result.error.code || 'SPAWN_FAILURE' : 'PRODUCTION_GATE_FAILED';
      console.error('V959 FAIL: full TypeScript and Next.js production build not certified.');
      process.exitCode = 1;
    } else console.log('V959 PASS: both operating-system-independent build gates certified.');
    save();
  }
} catch (error) {
  proof.error = error?.message || 'UNKNOWN_FAILURE';
  console.error('V959 FAIL:', error);
  save();
  process.exitCode = 1;
}
