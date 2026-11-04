'use strict';
/** V959: deterministic, read-only build readiness checks for Windows and Linux. */
const fs = require('node:fs');
const path = require('node:path');

const SKIP_DIRECTORIES = new Set(['.git', 'node_modules', '.next', 'out', '.vercel']);
const REQUIRED_SCRIPTS = [
  'scripts/v931-production-gate.cjs',
  'tests/v931-build-gate-regression.cjs',
  'tests/v958-concert-roadmap-regression.cjs',
  'tests/check-source-syntax.cjs',
  '.github/workflows/v958-ultimate-concert-validation.yml',
];
const REQUIRED_DEPENDENCIES = [
  'node_modules/typescript/bin/tsc',
  'node_modules/next/dist/bin/next',
];

function scanCaseCollisions(root) {
  const lowerCasePaths = new Map();
  const collisions = [];
  const walk = (directory, parts) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) continue;
      const relative = [...parts, entry.name].join('/');
      const normalized = relative.toLowerCase();
      const first = lowerCasePaths.get(normalized);
      if (first && first !== relative) collisions.push([first, relative]);
      else lowerCasePaths.set(normalized, relative);
      if (entry.isDirectory() && !SKIP_DIRECTORIES.has(entry.name)) {
        walk(path.join(directory, entry.name), [...parts, entry.name]);
      }
    }
  };
  walk(root, []);
  return collisions;
}

function inspect(root, { requireDependencies = true } = {}) {
  const checks = [];
  const check = (id, passed, explanation) => {
    checks.push({ id, passed: Boolean(passed), detail: String(explanation) });
  };
  const loadJson = (name) => {
    try { return JSON.parse(fs.readFileSync(path.join(root, name), 'utf8')); }
    catch (error) { check(`parse:${name}`, false, error.message); return null; }
  };
  const pkg = loadJson('package.json');
  const lock = loadJson('package-lock.json');
  if (pkg && lock) {
    const consistent = Boolean(pkg.version && pkg.version === lock.version && pkg.version === lock.packages?.['']?.version);
    check('lockfile-version', consistent, consistent ? pkg.version : 'package.json and package-lock.json disagree');
    check('build-scripts', Boolean(pkg.scripts?.build === 'next build' && pkg.scripts?.typecheck === 'tsc --noEmit' && pkg.scripts?.['verify:v931:production'] === 'node scripts/v931-production-gate.cjs'), 'build, typecheck and V931 mandatory gate');
  }
  for (const script of REQUIRED_SCRIPTS) {
    check(`source:${script}`, fs.existsSync(path.join(root, script)), script);
  }
  const collisions = scanCaseCollisions(root);
  check('windows-case-collisions', collisions.length === 0,
    collisions.length ? collisions.slice(0, 12).map(([a, b]) => `${a} <> ${b}`).join('; ') : 'no case-insensitive path conflicts');
  if (requireDependencies) {
    for (const dependency of REQUIRED_DEPENDENCIES) {
      check(`dependency:${dependency}`, fs.existsSync(path.join(root, dependency)), dependency);
    }
  }
  return {
    schema: 'sonic-v959-readiness-v1',
    passed: checks.every(item => item.passed),
    checks,
    summary: { passed: checks.filter(item => item.passed).length, failed: checks.filter(item => !item.passed).length },
  };
}
module.exports = { inspect, scanCaseCollisions };
