#!/usr/bin/env node
'use strict';
/** Validate Vercel deploy path and fail-closed archive-only skip behavior.
 * Does not require Vercel credentials or running a deployment.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const pkg=JSON.parse(read('package.json'));
const lock=JSON.parse(read('package-lock.json'));
const config=JSON.parse(read('vercel.json'));
const {shouldSkipForPaths}=require('../scripts/vercel-ignore-upload.cjs');
assert.equal(pkg.engines.node,'24.x','Pin Vercel to supported Node 24');
assert.equal(lock.packages[''].engines.node,pkg.engines.node,'npm lockfile engine must match');
assert.equal(lock.version,pkg.version);
assert.equal(config.buildCommand,'node scripts/vercel-production-build.cjs');
assert.equal(config.ignoreCommand,'node scripts/vercel-ignore-upload.cjs');
assert.equal(config.installCommand,'npm ci --include=dev --no-audit --no-fund');
assert(Array.isArray(config.crons)&&config.crons.some(x=>x.path==='/api/cron/release-push'),
  'Preserve existing Vercel cron route');
assert.equal(pkg.scripts.build,'next build','Keep local next build unchanged');
assert.equal(pkg.scripts['build:vercel'],config.buildCommand);
assert.equal(pkg.scripts['test:vercel:parity'],'node tests/vercel-production-parity-regression.cjs');
assert(pkg.scripts.prebuild.startsWith('npm run test:v908 &&'), 'Preserve historical local CI prebuild');
assert(pkg.scripts.prebuild.endsWith(' && npm run check:fast'),'Keep complete local CI gate');
for(const single of ['releases/SonicDisplay-V963.zip','releases/SonicDisplay-V964.zip'])
  assert(shouldSkipForPaths([single]),'Skip ZIP-only commit: '+single);
assert(shouldSkipForPaths(['releases/SonicDisplay-V963.zip','releases/SonicDisplay-V964.zip']));
for(const changes of [[],['package.json'],['releases/README.md'],
 ['releases/SonicDisplay-V963.zip','lib/concertBridgeV963.ts'],
 ['releases/SonicDisplay-V963.zip','vercel.json'],
 ['../../releases/SonicDisplay-V963.zip'],['releases/unknown.zip']])
  assert(!shouldSkipForPaths(changes),'Never skip non-archive or mixed commits: '+changes.join(','));
const build=read('scripts/vercel-production-build.cjs');
for(const src of ["NODE_ENV:'production'",'React 19 production/development parity',
 'V963 verified transition bridge','V962 narrative regression','V961 light governor regression',
 'Full TypeScript','Real Next.js production build','VERCEL_PRODUCTION_GATE FAIL'])
 assert(build.includes(src),'Vercel gate missing: '+src);
assert(!build.includes("run('Legacy prebuild'"),'Vercel should not run the full historical prebuild');
assert(read('tests/react-act-compat-regression.cjs').includes("['development', 'production']"),
 'React smoke test must verify both runtime conditions');
console.log('PASS Vercel parity: Node 24, real Next.js, React 19, legacy CI guard and ZIP-only skips');
