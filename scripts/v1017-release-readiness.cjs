#!/usr/bin/env node
'use strict';
/** V1017: dependency-free verification before npm ci, for both Linux and Windows. */
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1017(root){
 const checks=[],check=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const version=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version||'');
  check('current-release',!!version&&Number(version[1])>=1017);
  check('metadata-match',!!version&&pkg.sonicFeatureRelease===`v${version[1]}`&&pkg.sonicRoadmapRelease===`v${version[1]}`);
  check('lockfile',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  check('node24',pkg.engines?.node==='24.x');
  check('latest-regression-first',!!version&&pkg.scripts.prebuild.startsWith(`npm run test:v${version[1]} &&`));
  check('regression-command',pkg.scripts['test:v1017']==='node tests/v1017-intelligent-cache-regression.cjs');
  for(const f of ['lib/intelligentCacheV1017.ts','tests/v1017-intelligent-cache-regression.cjs',
   'changelog/V1017-INTELLIGENT-CACHE-MANAGER.md'])check('file:'+f,fs.existsSync(path.join(root,f)));
  for(const f of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
   check('required:'+f,read(f).includes('tests/v1017-intelligent-cache-regression.cjs'));
  check('preflight-hook',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1017(root)'));
  check('user-visible-dashboard',read('components/NetworkPerformanceDashboardV1011.tsx').includes('data-v1017-cache-manager'));
  const titles=require('./version-action-titles-v1016.cjs').formatActionTitlesV1016(root,false);
  check('versioned-actions',titles.total>=30&&titles.changed===0);
  check('real-build',read('.github/workflows/v965-room-wave-production.yml').includes('node scripts/v965-production-verify.cjs'));
 }catch(error){check('read-source',false);}
 return {passed:checks.length>=14&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const result=inspectReleaseV1017(path.resolve(__dirname,'..'));
 for(const c of result.checks)console.log(`${c.ok?'PASS':'FAIL'} V1017 ${c.name}`);
 if(!result.passed)process.exitCode=1;}
module.exports={inspectReleaseV1017};
