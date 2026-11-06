#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
/** Fail closed before npm ci, without requiring dependencies. */
function inspectReleaseV1014(root){
  const checks=[];const check=(name,ok)=>checks.push({name,ok:!!ok});
  const read=name=>fs.readFileSync(path.join(root,name),'utf8');
  try{
    const pkg=JSON.parse(read('package.json'));
    const lock=JSON.parse(read('package-lock.json'));
    const version=/^0\.1\.0-v(\d+)$/.exec(pkg.version||'');
    check('current-release',!!version&&Number(version[1])>=1014);
    check('feature-and-roadmap',!!version&&pkg.sonicRoadmapRelease==='v'+version[1]&&pkg.sonicFeatureRelease==='v'+version[1]);
    check('lockfile',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
    check('Node24',pkg.engines?.node==='24.x');
    check('current-prebuild',!!version&&pkg.scripts?.prebuild?.startsWith('npm run test:v'+version[1]+' &&'));
    check('new-regression',pkg.scripts?.['test:v1014']==='node tests/v1014-network-diagnostics-regression.cjs');
    for(const file of ['lib/networkDiagnosticsV1014.ts','tests/v1014-network-diagnostics-regression.cjs',
      'changelog/V1014-NETWORK-DIAGNOSTICS-2.md'])check('source:'+file,fs.existsSync(path.join(root,file)));
    for(const file of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
      check('mandatory:'+file,read(file).includes('tests/v1014-network-diagnostics-regression.cjs'));
  }catch(e){check('read-metadata',false);}
  return {passed:checks.length>=11&&checks.every(x=>x.ok),checks};
}
if(require.main===module){const report=inspectReleaseV1014(path.resolve(__dirname,'..'));
  for(const c of report.checks)console.log((c.ok?'PASS':'FAIL')+' V1014 '+c.name);
  if(!report.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1014};
