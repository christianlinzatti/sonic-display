#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { inspectBuild } = require('./check-next-build-v964.cjs');
const { buildVisualReport } = require('./v1104-playwright-visual-report.cjs');
const { writeQualityReportV1105 } = require('./v1105-playwright-quality-report.cjs');
const root = path.resolve(__dirname, '..');
const directory = path.join(root, 'reports/playwright-production');
const proofFile = path.join(directory, 'proof.json');
const evidenceFile = path.join(root, 'reports/v959-regression-logs/playwright-production.log');
const REFERENCE_AVATAR_NAME = 'sonic-playwright-reference.glb';
function stageReferenceAvatar(root) {
  const source = path.join(root, 'public/benchmark/v777-reference-performer.glb');
  const target = path.join(root, 'public/avatars', REFERENCE_AVATAR_NAME);
  const original = fs.readFileSync(source);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  // Exclusive creation protects user-owned local avatars, even during local runs.
  fs.copyFileSync(source, target, fs.constants.COPYFILE_EXCL);
  return () => {
    if (!fs.readFileSync(target).equals(original)) throw Error('Test avatar changed during run; preserving file');
    fs.unlinkSync(target);
  };
}
function runProductionTests({ existingBuildSince } = {}) {
  fs.rmSync(directory, { recursive: true, force: true });
  fs.mkdirSync(directory, { recursive: true });
  fs.mkdirSync(path.dirname(evidenceFile), { recursive: true });
  fs.rmSync(evidenceFile, { force: true });
  const proof = { schema: 'sonic-playwright-production-v1', passed: false, startedAt: new Date().toISOString(),
    platform: process.platform, node: process.version, buildId: null, steps: [] };
  let results = null;
  let visual = null;
  let visualQuality = null;
  let cleanupAvatar = () => {};
  function run(label, file, args, timeout) {
    const started = Date.now();
    const result = spawnSync(process.execPath, [path.join(root, file), ...args], {
      cwd: root, shell: false, windowsHide: true, stdio: 'inherit', timeout,
      env: { ...process.env, NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1', SONIC_LOW_MEMORY_BUILD: '1' },
    });
    proof.steps.push({ label, passed: result.status === 0 && !result.error, elapsedMs: Date.now() - started });
    if (result.status !== 0 || result.error) throw Error(`${label} failed (${result.error?.code || result.status})`);
  }
  try {
    let notBefore = existingBuildSince;
    if (notBefore === undefined) {
      notBefore = Date.now();
      // Prevent a failed compilation from leaving an old BUILD_ID usable.
      fs.rmSync(path.join(root, '.next'), { recursive: true, force: true });
      run('Real Next.js production build', 'node_modules/next/dist/bin/next', ['build'], 30 * 60 * 1000);
    }
    if (!Number.isFinite(notBefore) || notBefore <= 0 || notBefore > Date.now()) throw Error('Invalid production build start');
    const artifacts = inspectBuild(root, notBefore);
    if (!artifacts.passed) throw Error('Missing/stale production build: ' + artifacts.issues.join('; '));
    proof.buildId = fs.readFileSync(path.join(root, '.next/BUILD_ID'), 'utf8').trim();
    cleanupAvatar = stageReferenceAvatar(root);
    if (process.env.GITHUB_ACTIONS === 'true') {
      run('Prepare and verify pinned Chromium runtime', 'scripts/prepare-playwright-chromium.cjs', [], 10 * 60 * 1000);
    }
    // The full desktop/touch suite exceeds 200 cases. Allow the serial
    // browser run enough time while retaining per-test limits and all evidence.
    run('Playwright against next start', 'scripts/run-playwright-capture.cjs', [], 92 * 60 * 1000);
    results = JSON.parse(fs.readFileSync(path.join(directory, 'results.json'), 'utf8'));
    if (results.stats.expected < 1 || results.stats.unexpected !== 0 || results.stats.skipped !== 0 || results.stats.flaky !== 0)
      throw Error('No complete passing Playwright suite');
    // V1104: actual screenshots from both browsers are mandatory evidence.
    visual = buildVisualReport(root, results);
    if (visual.screenshotCount < 2 || !visual.projects.includes('chromium-desktop') || !visual.projects.includes('chromium-touch'))
      throw Error('Missing desktop/touch screenshot evidence in Playwright report');
    visualQuality = writeQualityReportV1105(root, results, visual);
    if (!visualQuality.passed) throw Error('V1105 visual quality evidence missing or incomplete');
    proof.passed = true;
  } catch (error) {
    proof.error = error.message;
  } finally {
    try { cleanupAvatar(); } catch (error) { proof.passed = false; proof.error = error.message; }
    if (!results) { try { results = JSON.parse(fs.readFileSync(path.join(directory, 'results.json'), 'utf8')); } catch {} }
    // Preserve partial screenshot evidence even for an otherwise failing suite.
    if (results && !visual) { try { visual = buildVisualReport(root, results); }
      catch(error) { if (proof.passed) { proof.passed=false; proof.error='Visual report failed: '+error.message; } } }
    // Even if a browser test failed, produce the offline failed-check matrix beside partial screenshots.
    if (results && visual && !visualQuality) { try { visualQuality = writeQualityReportV1105(root, results, visual); }
      catch(error) { proof.passed=false; proof.error=proof.error || 'V1105 quality report failed: '+error.message; } }
    proof.visual = visual ? { screenshotCount: visual.screenshotCount, projects: visual.projects,
      gallery: 'visual-gallery/index.html', playwrightHtml: 'html/index.html' } : null;
    proof.visualQuality = visualQuality ? { passed: visualQuality.passed, passedChecks: visualQuality.passedChecks,
      expectedChecks: visualQuality.expectedChecks, verifiedBrowserCases: visualQuality.verifiedBrowserCases,
      report: 'visual-gallery/quality.html' } : null;
    proof.stats = results?.stats || null;
    proof.finishedAt = new Date().toISOString();
    fs.writeFileSync(proofFile, JSON.stringify(proof, null, 2) + '\n');
    // Existing protected workflow already uploads *.log from this directory.
    fs.writeFileSync(evidenceFile, JSON.stringify({ proof, playwright: results }, null, 2) + '\n');
    if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      `\n### Playwright production (${process.platform})\n\n${proof.passed ? 'PASS' : 'FAIL'} — ${proof.stats?.expected || 0} passed, ${proof.stats?.unexpected || 0} failed.\n\n**Screenshot evidence:** ${visual?.screenshotCount ?? 0} real captures (${visual?.projects.join(', ') || 'not available'}).\n\n**V1105 Visual Quality:** ${visualQuality?.passed ? 'PASS' : 'NOT VERIFIED'} · ${visualQuality?.passedChecks ?? 0}/${visualQuality?.expectedChecks ?? 0} controls · open \`playwright-production/visual-gallery/quality.html\`.\n\nDownload the workflow artifact \`sonic-…-${process.platform === 'win32' ? 'windows-latest' : 'ubuntu-24.04'}-production\`, then open \`playwright-production/visual-gallery/index.html\` for the offline image gallery or \`playwright-production/html/index.html\` for the detailed Playwright HTML report and traces.\n\nReal production build → next start → Chromium desktop + touch.\n\nDetailed results: production artifact → v959-regression-logs/playwright-production.log.\n`);
  }
  console.log('PLAYWRIGHT_PRODUCTION ' + (proof.passed ? 'PASS' : 'FAIL: ' + proof.error));
  return proof;
}
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length && !(args.length === 2 && args[0] === '--existing-build-since')) {
    console.error('Usage: node scripts/playwright-production.cjs [--existing-build-since <epoch-ms>]');
    process.exitCode = 1;
  } else if (!runProductionTests(args.length ? { existingBuildSince: Number(args[1]) } : {}).passed) process.exitCode = 1;
}
module.exports = { runProductionTests, stageReferenceAvatar, REFERENCE_AVATAR_NAME };
