'use strict';
/** V752: read-only pre-install release integrity check; uses only built-in Node modules.
 * A PASS validates release metadata, never the presence or correctness of node_modules.
 */
const fs = require('node:fs');
const path = require('node:path');

function inspectRelease(root, { ci = false } = {}) {
  const issues = [];
  const add = (id, condition, detail) => { if (!condition) issues.push({ id, detail }); };
  const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const pkg = read('package.json');
  const lock = read('package-lock.json');
  const config = read('tsconfig.json');
  const rootLock = lock.packages && lock.packages[''];
  add('lock:format', lock.lockfileVersion === 3, 'npm lockfile v3 required');
  add('lock:root', !!rootLock, 'npm lockfile root package missing');
  for (const key of ['name', 'version']) {
    add(`lock:top:${key}`, pkg[key] === lock[key], `package.json ${key} differs from lockfile top level`);
    add(`lock:root:${key}`, !!rootLock && pkg[key] === rootLock[key], `package.json ${key} differs from lockfile root`);
  }
  for (const key of ['dependencies', 'devDependencies', 'optionalDependencies']) {
    const manifest = pkg[key] || {};
    const locked = rootLock?.[key] || {};
    const keys = new Set([...Object.keys(manifest), ...Object.keys(locked)]);
    for (const name of keys) {
      add(`lock:range:${key}:${name}`, manifest[name] === locked[name], `${key}/${name}: manifest and lockfile range differ`);
      const entry = lock.packages && lock.packages[`node_modules/${name}`];
      if (manifest[name]) {
        add(`lock:entry:${key}:${name}`, !!entry, `Missing installed-package metadata for ${name}`);
        add(`lock:integrity:${key}:${name}`, !!entry && !!entry.version && (typeof entry.integrity === 'string' || entry.link === true), `Missing version/integrity for ${name}`);
      }
    }
  }
  const gatedVersion = /^npm run test:v(\d+) &&/.exec(pkg.scripts?.['check:fast'] || '')?.[1];
  // New roadmap versions retain the tested V908 package/lockfile baseline while
  // check:fast can begin with an earlier compatible regression (currently V906).
  // Enforce monotonic versions and a real release identity; never accept a fake
  // or downgraded package version just because lockfile values match.
  const packageVersion = /^0\\.1\\.0-v(\\d+)$/.exec(pkg.version || '')?.[1];
  const roadmapVersion = /^v(\\d+)$/i.exec(pkg.sonicRoadmapRelease || '')?.[1];
  const validVersion = Boolean(packageVersion && gatedVersion &&
    Number(packageVersion) >= 752 && Number(gatedVersion) >= 752 &&
    Number(packageVersion) >= Number(gatedVersion) &&
    (!roadmapVersion || Number(roadmapVersion) >= Number(packageVersion)));
  add('release:version', validVersion,
    'Package baseline must be valid, not older than fast gate, and not newer than roadmap');
  // V858: newer releases may run explicit recent regressions before the same mandatory fast gate.
  const prebuild = pkg.scripts?.prebuild || '';
  const prebuildRunsFast = prebuild === 'npm run check:fast' ||
    (Boolean(packageVersion) && prebuild.startsWith(`npm run test:v${packageVersion} &&`) &&
      prebuild.includes(`npm run test:v${gatedVersion} &&`) &&
      prebuild.endsWith(' && npm run check:fast'));
  add('scripts:prebuild', prebuildRunsFast, 'Keep the automatic production prebuild gate after recent release regressions');
  add('scripts:typecheck', pkg.scripts?.typecheck === 'tsc --noEmit', 'Full application typecheck must not be replaced by isolated tests');
  add('scripts:build', pkg.scripts?.build === 'next build', 'Must retain the real Next.js production build');
  add('scripts:fast', /npm run check:dependencies/.test(pkg.scripts?.['check:fast'] || '') && /npm run typecheck/.test(pkg.scripts?.['check:fast'] || ''), 'Quick build gate must check dependencies and types');
  const opts = config.compilerOptions || {};
  add('tsconfig:strict', opts.strict === true, 'Strict application typecheck required');
  add('tsconfig:noEmit', opts.noEmit === true, 'Application typecheck must not emit files');
  add('tsconfig:case', opts.forceConsistentCasingInFileNames === true, 'Case-sensitive module checking required');
  const excluded = config.exclude || [];
  add('tsconfig:node_modules', excluded.includes('node_modules'), 'Exclude installed dependencies');
  add('tsconfig:fixtures', excluded.includes('tests') || excluded.includes('tests/**/*'), 'Exclude all test-only type declarations from production TypeScript project');
  add('tsconfig:source', (config.include || []).includes('**/*.ts') && (config.include || []).includes('**/*.tsx'), 'Application source must be included');
  if (ci) {
    const workflow = fs.readFileSync(path.join(root, '.github/workflows/concert-validation-v571.yml'), 'utf8');
    for (const required of ['ubuntu-24.04', 'windows-latest', 'npm ci', 'npm run check:lockfile:v752', 'npm run verify:v752:static', 'npm run verify:v753:static', 'npm run verify:v754:static', 'npm run verify:v755:static', 'npm run verify:v756:static', 'npm run verify:v757:static', 'npm run verify:v758:static', 'npm run verify:v759:static', 'npm run verify:v760:static', 'npm run typecheck', 'npm run build']) {
      add(`ci:${required}`, workflow.includes(required), `Production CI missing ${required}`);
    }
  }
  return { ok: issues.length === 0, issues, dependencyCount: Object.keys(pkg.dependencies || {}).length + Object.keys(pkg.devDependencies || {}).length };
}

if (require.main === module) {
  try {
    const result = inspectRelease(path.resolve(__dirname, '..'), { ci: process.argv.includes('--ci') });
    for (const issue of result.issues) console.error(`FAIL ${issue.id}: ${issue.detail}`);
    if (!result.ok) process.exitCode = 1;
    else console.log(`PASS V752 release integrity: lockfile, ${result.dependencyCount} direct packages, TypeScript isolation, build scripts${process.argv.includes('--ci') ? ', Windows/Linux CI' : ''}`);
  } catch (error) {
    console.error(`FAIL V752 release integrity: ${error.message}`);
    process.exitCode = 1;
  }
}
module.exports = { inspectRelease };
