#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1103(root){
 const checks=[],add=(name,ok)=>checks.push({id:name,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8'),exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const v=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0);
  add('version',v>=1103&&pkg.sonicRoadmapRelease==='v'+v&&pkg.sonicFeatureRelease==='v'+v);
  add('lock',lock.version===pkg.version&&lock.packages[''].version===pkg.version);
  add('node24',pkg.engines?.node==='24.x');
  add('test-script',pkg.scripts['test:v1103']==='node tests/v1103-production-release-regression.cjs');
  add('types-script',pkg.scripts['test:v1103:types']==='tsc -p tests/tsconfig.v1103-core.json --noEmit');
  add('prebuild',pkg.scripts.prebuild.includes('npm run test:v1103 && npm run test:v1103:types'));
  for(const f of ['lib/releaseSourceGuardV1103.ts','lib/releaseAttestationV1103.cjs',
   'scripts/v1103-production-attestation.cjs','scripts/v1103-release-readiness.cjs',
   'tests/v1103-production-release-regression.cjs','tests/tsconfig.v1103-core.json',
   'changelog/V1103-PRODUCTION-STABILITY-AUTOMATED-RELEASE.md'])add('file:'+f,exists(f));
  const att=read('lib/releaseAttestationV1103.cjs');
  add('requires-real-browser',att.includes('browser-proof-complete')&&att.includes('browser-same-build'));
  add('rejects-stale-proof',att.includes('fresh-monotonic-timestamps')&&att.includes('proof-matches-exact-imported-revision'));
  add('rejects-skipped',att.includes('skipped===0')&&att.includes('flaky===0'));
  add('requires-soak',att.includes('short-soak-real-case'));
  add('no-hardware',!['goveeBridgeRequestV909(','fetch(','setInterval(','setTimeout('].some(x=>att.includes(x)));
  const verify=read('scripts/v965-production-verify.cjs');
  add('v965-attestor',verify.includes('attestCurrentBuildV1103()'));
  add('fail-shuts-down-v965',verify.includes("rejected.error='V1103_EVIDENCE_NOT_CERTIFIED'"));
  add('exact-revision',verify.includes('revision:checkedRevision'));
  const gate=read('scripts/v931-production-gate.cjs'),vercel=read('scripts/vercel-production-build.cjs');
  add('gate',gate.includes('tests/v1103-production-release-regression.cjs'));
  add('vercel',vercel.includes('tests/v1103-production-release-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1103(root)'));
  const workflow=read('.github/workflows/v965-room-wave-production.yml');
  add('linux-windows',workflow.includes('windows-latest')&&workflow.includes('ubuntu-24.04'));
  add('dynamic-release',workflow.includes('Active imported release (regression and isolated type checks)'));
  add('reports-uploaded',workflow.includes('reports/*production-proof.json'));
  add('importer-tests',read('scripts/project-archive-import.py').includes('SYNC_PROTECTED'));
  add('version-docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1]||0)>=1103);
 }catch(error){console.error(error);add('parse',false);}
 return {checks,passed:checks.length>=29&&checks.every(c=>c.ok)};
}
if(require.main===module){const r=inspectReleaseV1103(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1103 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1103};
