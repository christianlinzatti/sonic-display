#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
/** V1015: dependency-free, fail-closed metadata and test routing check. */
function inspectReleaseV1015(root){
 const checks=[],check=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=file=>fs.readFileSync(path.join(root,file),'utf8');
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const v=/^0\.1\.0-v([1-9][0-9]*)$/.exec(pkg.version||'');
  check('release-number',!!v&&Number(v[1])>=1015);
  check('feature-roadmap',!!v&&pkg.sonicFeatureRelease==='v'+v[1]&&pkg.sonicRoadmapRelease==='v'+v[1]);
  check('lockfile',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  check('Node24',pkg.engines?.node==='24.x');
  check('prebuild',!!v&&pkg.scripts?.prebuild?.startsWith('npm run test:v'+v[1]+' &&'));
  check('regression-entry',pkg.scripts?.['test:v1015']==='node tests/v1015-adaptive-network-regression.cjs');
  for(const file of ['lib/networkAdaptiveV1015.ts','lib/networkCoordinatorV1010.ts',
    'tests/v1015-adaptive-network-regression.cjs','changelog/V1015-ADAPTIVE-REQUEST-INTELLIGENCE.md'])
    check('file:'+file,fs.existsSync(path.join(root,file)));
  for(const file of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
    check('ci:'+file,read(file).includes('tests/v1015-adaptive-network-regression.cjs'));
  check('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1015(root)'));
 }catch(error){check('metadata-read',false);}
 return {passed:checks.length>=13&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const result=inspectReleaseV1015(path.resolve(__dirname,'..'));
 for(const c of result.checks)console.log(`${c.ok?'PASS':'FAIL'} V1015 ${c.name}`);
 if(!result.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1015};
