'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const tsRoot = path.join(root, 'tests');
const rootConfig = JSON.parse(fs.readFileSync(path.join(root, 'tsconfig.json'), 'utf8'));
const excluded = rootConfig.exclude ?? [];
assert(excluded.includes('tests') || excluded.includes('tests/**/*'), 'Production tsconfig must exclude test-only declarations');

// The V751 dashboard imports the real 3D renderer through its inspector panels.
// A stripped-down ambient `declare module "react"` shadows @types/react in that
// entire dependency graph, turning hooks, refs and JSX Three elements into errors.
for (const version of [751, 753, 754, 755]) {
  const configPath = path.join(tsRoot, `tsconfig.v${version}-ui.json`);
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  assert(config.files.includes('../global.d.ts'), `V${version}: keep production CSS typings`);
  assert(config.files.some(file => file.includes('ConcertQualityDashboardV751.tsx')), `V${version}: dashboard coverage must remain`);
  assert(!config.files.some(file => /stubs\/.*react.*\.d\.ts$/i.test(file)),
    `V${version}: test-only React declarations shadow the real React/R3F types`);
  assert.equal(config.compilerOptions?.incremental, false, `V${version}: isolated check must not reuse incremental cache`);
}

// Follow local import dependencies, not just the direct `files` list. A future
// UI check can reach the full Three.js scene indirectly through a dashboard.
const dependencyCache = new Map();
function resolveSource(from, specifier) {
  const base = specifier.startsWith('@/')
    ? path.join(root, specifier.slice(2))
    : specifier.startsWith('.') ? path.resolve(path.dirname(from), specifier) : null;
  if (!base) return null;
  return [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]
    .find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) ?? null;
}
function reaches3DScene(file, seen = new Set()) {
  if (seen.has(file)) return false;
  seen.add(file);
  if (file.endsWith('/ThreeAvatar.tsx') || file.endsWith('\\ThreeAvatar.tsx')) return true;
  if (dependencyCache.has(file)) return dependencyCache.get(file).some(next => reaches3DScene(next, seen));
  if (!fs.existsSync(file) || !/\.tsx?$/.test(file)) return false;
  const content = fs.readFileSync(file, 'utf8');
  const deps = [];
  const imports = /(?:\bfrom\s*|\bimport\s*\(|\bimport\s*)[\s]*["']([^"']+)["']/g;
  for (const [, specifier] of content.matchAll(imports)) {
    const resolved = resolveSource(file, specifier);
    if (resolved) deps.push(resolved);
  }
  dependencyCache.set(file, deps);
  return deps.some(next => reaches3DScene(next, seen));
}
let rendererConnected = 0;
for (const entry of fs.readdirSync(tsRoot, { withFileTypes: true })) {
  if (!entry.isFile() || !/^tsconfig\..*ui\.json$/.test(entry.name)) continue;
  const config = JSON.parse(fs.readFileSync(path.join(tsRoot, entry.name), 'utf8'));
  const files = config.files ?? [];
  const connected = files.some(file => reaches3DScene(path.resolve(tsRoot, file)));
  if (connected) {
    rendererConnected++;
    assert(!files.some(file => /stubs\/.*react.*\.d\.ts$/i.test(file)),
      `${entry.name}: renderer-connected check must not shadow actual React/R3F`);
  }
}
assert(rendererConnected >= 4, 'Missing renderer-connected UI test coverage');
console.log(`PASS V865.14: ${rendererConnected} renderer-connected UI configs use genuine React 19/R3F declarations; test-only stubs stay isolated`);
