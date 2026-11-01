'use strict';
/** V680: deterministic, read-only build environment check. No secrets or network access. */
const fs = require('node:fs');
const path = require('node:path');

function inspectBuildEnvironment(root, opts = {}) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const dependencies = Object.keys({ ...manifest.dependencies, ...manifest.devDependencies });
  // Inspect only project / ancestor node_modules locations (npm workspaces).
  // Global NODE_PATH packages are not a substitute for reproducible project deps.
  const missing = dependencies.filter((dependency) => {
    let directory = path.resolve(root);
    while (true) {
      const manifest = path.join(directory, 'node_modules', ...dependency.split('/'), 'package.json');
      if (fs.existsSync(manifest)) return false;
      const parent = path.dirname(directory);
      if (parent === directory) return true;
      directory = parent;
    }
  });
  const major = Number((opts.nodeVersion || process.versions.node).split('.')[0]);
  const hasLock = fs.existsSync(path.join(root, 'package-lock.json'));
  const problems = [];
  const warnings = [];
  if (!Number.isInteger(major) || major < 20) problems.push('Node.js 20+ ist erforderlich (Node.js 22 empfohlen).');
  if (missing.length) problems.push(`${missing.length} npm-Pakete fehlen: ${missing.join(', ')}`);
  if (!hasLock) (opts.requireLock ? problems : warnings).push('package-lock.json fehlt: Installation und CI sind nicht reproduzierbar.');
  return { major, hasLock, missing, dependencyCount: dependencies.length, problems, warnings, ok: problems.length === 0 };
}

function main(argv = process.argv.slice(2), root = path.resolve(__dirname, '..')) {
  const known = new Set(['--require-lock']);
  for (const arg of argv) if (!known.has(arg)) {
    console.error(`[V680] Unbekannte Option: ${arg}`);
    return 2;
  }
  const result = inspectBuildEnvironment(root, { requireLock: argv.includes('--require-lock') });
  console.log(`[V680 Build-Check] Node ${process.version} | Pakete ${result.dependencyCount - result.missing.length}/${result.dependencyCount} | Lockfile ${result.hasLock ? 'vorhanden' : 'fehlt'}`);
  for (const warning of result.warnings) console.warn(`[WARNUNG] ${warning}`);
  if (result.problems.length) {
    for (const problem of result.problems) console.error(`[BLOCKIERT] ${problem}`);
    console.error('Abhilfe: Im Projektverzeichnis `npm ci --no-audit --no-fund` mit Internetzugang ausführen; anschließend `npm run typecheck` und `npm run build`. Das bestehende package-lock.json nicht durch eine unkontrollierte Installation ersetzen.');
    return 1;
  }
  console.log('[PASS] Build-Abhängigkeiten und Node-Version geprüft. Dies ist noch KEIN erfolgreicher TypeScript- oder Next.js-Build.');
  return 0;
}
if (require.main === module) process.exitCode = main();
module.exports = { inspectBuildEnvironment, main };
