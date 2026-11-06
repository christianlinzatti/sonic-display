#!/usr/bin/env node
/** V931/V959 release gate: bounded parallel regressions; production builds serial.
 * No npm recursion, concurrent .next writes, or false success with missing dependencies.
 * Run after npm ci; reports reflect this invocation only.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { parallelism, runParallelTests } = require('../lib/v959ParallelTests.cjs');
const root = path.resolve(__dirname, '..');
const reportFile = path.join(root, 'reports', 'v931-production-gate.json');
const regressions = [
  ['V1030 Intelligent Concert Atmosphere 5.0','tests/v1030-intelligent-concert-atmosphere-regression.cjs'],
  ['V1029 AI Visual Director 5.0','tests/v1029-ai-visual-director-regression.cjs'],
  ['V1028 Immersive Concert FX 5.0','tests/v1028-immersive-concert-fx-regression.cjs'],
  ['V1027 Govee Concert Sync 3.0','tests/v1027-govee-concert-sync-regression.cjs'],
  ['V1026 Intelligent Stage Lighting 4.0','tests/v1026-intelligent-stage-lighting-regression.cjs'],
  ['V1025 Cinematic Camera Intelligence 4.0','tests/v1025-cinematic-camera-intelligence-regression.cjs'],
  ['V1024 AI Dance Choreography 4.0','tests/v1024-ai-dance-choreography-regression.cjs'],
  ['V1023 Advanced Rap Performance 6.0','tests/v1023-advanced-rap-performance-regression.cjs'],
  ['V1022 AI Live Show Adaptation','tests/v1022-live-show-adaptation-regression.cjs'],
  ['V1021 Genre Intelligence 3.0','tests/v1021-genre-intelligence-regression.cjs'],
  ['V1020 AI Concert Storytelling','tests/v1020-concert-storytelling-regression.cjs'],
  ['V1019 Predictive Concert Director','tests/v1019-predictive-concert-regression.cjs'],
  ['V1018 AI Song Understanding 2.0','tests/v1018-song-understanding-regression.cjs'],
  ['V1017 intelligent cache manager','tests/v1017-intelligent-cache-regression.cjs'],
  ['V1016 smart offline and Action titles','tests/v1016-smart-offline-regression.cjs'],
  ['V1015 adaptive request intelligence','tests/v1015-adaptive-network-regression.cjs'],
  ['V1014 network diagnostics 2.0','tests/v1014-network-diagnostics-regression.cjs'],
  ['V1013 production stability and release metadata','tests/v1013-production-stability-regression.cjs'],
  ['V1012 network health and recovery','tests/v1012-network-health-regression.cjs'],
  ['V1011 network performance dashboard','tests/v1011-network-dashboard-regression.cjs'],
  ['V1010 network coordination','tests/v1010-network-coordination-regression.cjs'],
  ['V1009 private avatar resources and renderer release','tests/v1009-avatar-resources-regression.cjs'],
  ['V1009 native providers and background deadlines','tests/v1009-network-regression.cjs'],
  ['V1008 receiver and bulk undo lifecycle','tests/v1008-receiver-regression.cjs'],
  ['V1008 voice features and dialogs','tests/v1008-voice-regression.cjs'],
  ['V1008 authenticated result relay','tests/v1008-relay-regression.cjs'],
  ['V1008 all artists and batch undo','tests/v1008-batch-regression.cjs'],
  ['V1008 release recovery and backups','tests/v1008-recovery-regression.cjs'],
  ['V1007 Alexa artist receiver lifecycle','tests/v1007-alexa-artist-receiver-regression.cjs'],
  ['V1007 Alexa artist follow and unfollow','tests/v1007-alexa-artist-regression.cjs'],
  ['Spotify artist follow API readback','tests/v359-spotify-artist-follow-regression.cjs'],
  ['V1006 real avatar browser fixtures','tests/v1006-avatar-production-regression.cjs'],
  ['V1005 Playwright production orchestration','tests/v1005-playwright-production-regression.cjs'],
  ['V990 Living LED Wall 3.0','tests/v990-living-led-wall-regression.cjs'],
  ['V989 Volumetric Atmosphere 2.0','tests/v989-volumetric-atmosphere-regression.cjs'],
  ['V988 Holographic Stage Portal','tests/v988-holographic-stage-portal-regression.cjs'],
  ['V981 Concert Performance Intelligence 2.0','tests/v981-concert-performance-intelligence-regression.cjs'],
  ['V980 Concert Quality & Performance Director','tests/v980-concert-quality-director-regression.cjs'],
  ['V979 Intelligent Live Show Director 3.0','tests/v979-intelligent-live-show-director-regression.cjs'],
  ['V978 Smart Concert Atmosphere 2.0','tests/v978-smart-concert-atmosphere-regression.cjs'],
  ['V977 Smart Concert Storytelling','tests/v977-concert-storytelling-regression.cjs'],
  ['V976 Intelligent Concert Transitions','tests/v976-intelligent-concert-transitions-regression.cjs'],
  ['V975 Adaptive Concert Energy Director','tests/v975-adaptive-concert-energy-regression.cjs'],
  ['V973 Living Audience 3.0','tests/v973-living-audience-regression.cjs'],
  ['V972 volumetric stage atmosphere','tests/v972-volumetric-stage-regression.cjs'],
  ['V971 Alexa and Govee onboarding + standalone bridge','tests/v971-integration-setup-regression.cjs'],
  ['V970 Alexa & Govee opt-in room looks','tests/v970-alexa-govee-regression.cjs'],
  ['V970 signed Govee Alexa intents','tests/v970-alexa-lambda-regression.cjs'],
  ['V969 Smart Concert Presets','tests/v969-smart-concert-presets-regression.cjs'],
  ['V969 signed Alexa intents','tests/v969-alexa-lambda-regression.cjs'],
  ['V968 Alexa focused virtual scenes','tests/v968-alexa-concert-regression.cjs'],
  ['V968 authenticated Lambda intents','tests/v968-alexa-lambda-regression.cjs'],
  ['V967 private Alexa virtual show','tests/v967-alexa-integration-regression.cjs'],
  ['V967 signed Alexa relay','tests/v967-alexa-relay-route-regression.cjs'],
  ['V966 immersive concert', 'tests/v966-immersive-concert-regression.cjs'],
  ['V966 cleaned project structure', 'tests/v966-project-structure-regression.cjs'],
  ['V965 verified room wave', 'tests/v965-room-wave-regression.cjs'],
  ['V965 public deployment smoke regression', 'tests/v965-vercel-deployment-smoke-regression.cjs'],
  ['V964 verified post-peak recovery', 'tests/v964-peak-recovery-regression.cjs'],
  ['V964 Next.js emitted output guard', 'tests/v964-next-build-artifact-regression.cjs'],
  ['V963 verified bridge regression', 'tests/v963-verified-transition-bridge-regression.cjs'],
  ['V962 narrative light curve', 'tests/v962-concert-narrative-regression.cjs'],
  ['V961 TypeScript build hotfix', 'tests/v961-build-hotfix-regression.cjs'],
  ['V961 Govee concert governor regression', 'tests/v961-govee-concert-governor-regression.cjs'],
  ['V960 concert continuity regression', 'tests/v960-concert-continuity-regression.cjs'],
  ['V958 concert regression', 'tests/v958-concert-roadmap-regression.cjs'],
  ['V931 gate regression', 'tests/v931-build-gate-regression.cjs'],
  ['V959 production validation', 'tests/v959-production-validation-regression.cjs'],
  ['V959 parallel runner regression', 'tests/v959-parallel-tests-regression.cjs'],
  // All existing Govee-era versions stay in the production regression gate.
  ...[
    'v908-live-avatar-fx-verification', 'v909-govee-lan',
    'v910-pi-kiosk-govee', 'v911-govee-concert-director',
    'v912-govee-light-show-editor', 'v913-govee-color-harmony',
    'v914-govee-transitions', 'v915-govee-device-groups',
    'v916-govee-preset-library', 'v917-govee-bass-reactive',
    'v918-govee-beat-prediction', 'v919-govee-section-director',
    'v920-govee-genre-light', 'v921-govee-cinematic-sync',
    'v922-govee-shockwave', 'v923-govee-neon-pulse',
    'v924-govee-light-energy', 'v925-govee-festival-fx',
    'v926-govee-spatial', 'v927-govee-room-calibration',
    'v928-govee-room-performance', 'v929-govee-troubleshooting',
  ].map(version => [version, `tests/${version}-regression.cjs`]),
  ['Source syntax + duplicate imports', 'tests/check-source-syntax.cjs'],
];
const productionChecks = [
  ['V1025 Cinematic Camera isolated TypeScript','node_modules/typescript/bin/tsc',['--noEmit','--strict','--target','es2022','--moduleResolution','bundler','--module','esnext','--skipLibCheck','--lib','dom,es2022','components/visualizer/cinematicCameraIntelligenceV1025.ts']],
  ['V1024 Dance Choreography isolated TypeScript','node_modules/typescript/bin/tsc',['--noEmit','--strict','--target','es2022','--moduleResolution','bundler','--module','esnext','--skipLibCheck','--lib','dom,es2022','components/visualizer/aiDanceChoreographyV1024.ts']],
  ['V1023 Rap Performance strict TypeScript','node_modules/typescript/bin/tsc',['--noEmit','--strict','--target','es2022','--moduleResolution','bundler','--module','esnext','--skipLibCheck','--lib','dom,es2022','components/visualizer/advancedRapPerformanceV1023.ts']],
  ['V1022 Live Show Adaptation strict TypeScript','node_modules/typescript/bin/tsc',['--noEmit','--strict','--target','es2022','--moduleResolution','bundler','--module','esnext','--skipLibCheck','--lib','dom,es2022','lib/aiLiveShowAdaptationV1022.ts']],
  ['V1021 Genre Intelligence strict TypeScript','node_modules/typescript/bin/tsc',['--noEmit','--strict','--target','es2022','--moduleResolution','bundler','--module','esnext','--skipLibCheck','--lib','dom,es2022','lib/genreIntelligenceV1021.ts']],
  ['V1020 AI Concert Storytelling strict TypeScript','node_modules/typescript/bin/tsc',['--noEmit','--strict','--target','es2022','--moduleResolution','bundler','--module','esnext','--skipLibCheck','--lib','dom,es2022','lib/aiConcertStorytellingV1020.ts']],
  ['V1014 network diagnostics isolated TypeScript','node_modules/typescript/bin/tsc',['--noEmit','--strict','--target','es2022','--moduleResolution','bundler','--module','esnext','--skipLibCheck','--lib','dom,es2022','lib/networkCoordinatorV1010.ts','lib/networkDiagnosticsV1014.ts','lib/networkHealthV1012.ts']],
  ['V1014 network diagnostics isolated TypeScript','node_modules/typescript/bin/tsc',['--noEmit','--strict','--target','es2022','--moduleResolution','bundler','--module','esnext','--skipLibCheck','--lib','dom,es2022','lib/networkCoordinatorV1010.ts','lib/networkDiagnosticsV1014.ts','lib/networkHealthV1012.ts']],
  ['V990 Living LED Wall 3.0 core TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v990-core.json']],
  ['V989 Volumetric Atmosphere 2.0 core TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v989-core.json']],
  ['V988 Holographic Stage Portal core TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v988-core.json']],
  ['V981 Performance Intelligence core TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v981-core.json']],
  ['V980 Concert Quality Director core TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v980-core.json']],
  ['V979 Intelligent Live Show Director 3.0 core TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v979-core.json']],
  ['V978 core TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v978-core.json']],
  ['V977 core TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v977-core.json']],
  ['V976 core TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v976-core.json']],
  ['V973 core TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v973-core.json']],
  ['V972 core TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v972-core.json']],
  ['V971 core TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v971-core.json']],
  ['V970 core TypeScript', 'node_modules/typescript/bin/tsc', ['-p','tests/tsconfig.v970-core.json']],
  ['V969 core TypeScript', 'node_modules/typescript/bin/tsc', ['-p','tests/tsconfig.v969-core.json']],
  ['V968 core TypeScript', 'node_modules/typescript/bin/tsc', ['-p','tests/tsconfig.v968-core.json']],
  ['V967 core TypeScript', 'node_modules/typescript/bin/tsc', ['-p','tests/tsconfig.v967-core.json']],
  ['V966 core TypeScript', 'node_modules/typescript/bin/tsc', ['-p','tests/tsconfig.v966-core.json']],
  ['V965 core TypeScript', 'node_modules/typescript/bin/tsc', ['-p','tests/tsconfig.v965-core.json']],
  ['V964 core TypeScript', 'node_modules/typescript/bin/tsc', ['-p','tests/tsconfig.v964-core.json']],
  ['V963 core TypeScript', 'node_modules/typescript/bin/tsc', ['-p','tests/tsconfig.v963-core.json']],
  ['V962 core TypeScript', 'node_modules/typescript/bin/tsc', ['-p','tests/tsconfig.v962-core.json']],
  ['V961 core TypeScript', 'node_modules/typescript/bin/tsc', ['-p','tests/tsconfig.v961-core.json']],
  ['V960 core TypeScript', 'node_modules/typescript/bin/tsc', ['-p', 'tests/tsconfig.v960-core.json']],
  ['V958 core TypeScript', 'node_modules/typescript/bin/tsc', ['-p', 'tests/tsconfig.v958-core.json']],
  ['Full TypeScript', 'node_modules/typescript/bin/tsc', ['--noEmit']],
  ['Next.js production build', 'node_modules/next/dist/bin/next', ['build']],
];
const report = { schema: 'v931-production-gate', platform: process.platform, node: process.version,
  passed: false, regressionConcurrency: null, tests: [], startedAt: new Date().toISOString(), finishedAt: null };
function write() {
  report.finishedAt = new Date().toISOString();
  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
}
function fail(message) {
  console.error(`V931 FAIL: ${message}; no release approval.`);
  write();
  process.exit(1);
}
async function main() {
  // A failed or interrupted current run must not leave an old green result.
  if (fs.existsSync(reportFile)) fs.unlinkSync(reportFile);
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  if (pkg.version !== lock.version || pkg.version !== lock.packages[''].version) {
    fail('package.json/package-lock.json version mismatch');
  }
  // Validate all paths before starting any test worker.
  for (const [, file] of [...regressions, ...productionChecks]) {
    if (!fs.existsSync(path.join(root, file))) {
      report.tests.push({ label: file, ok: false, reason: 'DEPENDENCY_OR_SCRIPT_MISSING', path: file });
      fail(`DEPENDENCY_OR_SCRIPT_MISSING ${file}; run npm ci first`);
    }
  }
  const workers = parallelism(process.env.SONIC_TEST_CONCURRENCY || 3);
  report.regressionConcurrency = workers;
  console.log(`V931: ${regressions.length} independent regressions, up to ${workers} parallel Node workers`);
  const results = await runParallelTests({
    root, maxWorkers: workers, tasks: regressions.map(([label, file]) => ({ label, file })),
    env: { SONIC_LOW_MEMORY_BUILD: process.env.SONIC_LOW_MEMORY_BUILD || '1' },
    onResult: result => {
      console.log(`${result.ok ? 'PASS' : 'FAIL'} V931 ${result.label} (${result.elapsedMs}ms) – ${result.logFile}`);
      if (!result.ok) {
        const log = fs.readFileSync(path.join(root, result.logFile), 'utf8');
        console.error(log.slice(-6000));
      }
    },
  });
  report.tests.push(...results.tests);
  write();
  if (!results.passed) fail('one or more parallel regressions failed');
  // These remain serial: tsc can consume significant memory, and Next.js owns .next.
  for (const [label, file, args = []] of productionChecks) {
    const started = Date.now();
    console.log(`\nV931 running serial production check: ${label}`);
    const result = spawnSync(process.execPath, [path.join(root, file), ...args], {
      cwd: root, env: { ...process.env, SONIC_LOW_MEMORY_BUILD: process.env.SONIC_LOW_MEMORY_BUILD || '1' },
      stdio: 'inherit', shell: false, windowsHide: true, timeout: 1000 * 60 * 25,
    });
    const ok = result.status === 0 && !result.error;
    report.tests.push({ label, ok, exitCode: result.status, elapsedMs: Date.now() - started,
      ...(result.error ? { errorCode: result.error.code || 'SPAWN_ERROR' } : {}) });
    write();
    if (!ok) fail(`${label}, exit=${result.status ?? 'null'}`);
  }
  report.passed = true;
  write();
  console.log('V931 PASSED: parallel regressions, full TypeScript and Next.js production build');
}
if (require.main === module) main().catch(error => fail(error?.stack || String(error)));
module.exports = { regressions };
