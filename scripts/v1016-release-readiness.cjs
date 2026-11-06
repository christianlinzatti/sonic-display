#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1016(root){
 const checks=[],check=(name,value)=>checks.push({name,ok:Boolean(value)});
 const read=file=>fs.readFileSync(path.join(root,file),'utf8');
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const v=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version||'');
  check('valid-release',!!v&&Number(v[1])>=1016);
  check('metadata',!!v&&pkg.sonicFeatureRelease==='v'+v[1]&&pkg.sonicRoadmapRelease==='v'+v[1]);
  check('lockfile',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  check('node24',pkg.engines?.node==='24.x');
  check('prebuild',!!v&&pkg.scripts?.prebuild?.startsWith('npm run test:v'+v[1]+' &&'));
  check('regression-script',pkg.scripts?.['test:v1016']==='node tests/v1016-smart-offline-regression.cjs');
  for(const file of ['lib/smartOfflineV1016.ts','tests/v1016-smart-offline-regression.cjs',
    'scripts/version-action-titles-v1016.cjs','changelog/V1016-SMART-OFFLINE-AND-ACTION-TITLES.md'])
    check('file:'+file,fs.existsSync(path.join(root,file)));
  for(const file of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
    check('ci:'+file,read(file).includes('tests/v1016-smart-offline-regression.cjs'));
  const {formatActionTitlesV1016}=require('./version-action-titles-v1016.cjs');
  const versioned=formatActionTitlesV1016(root,false);
  check('all-workflow-titles',versioned.changed===0&&versioned.total>=25);
  check('offline-status-marked',read('components/SonicDisplay.tsx').includes('LETZTER BEKANNTER STAND · NICHT LIVE'));
 }catch(e){check('read-source',false);}
 return {passed:checks.length>=13&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const report=inspectReleaseV1016(path.resolve(__dirname,'..'));
 for(const c of report.checks)console.log(`${c.ok?'PASS':'FAIL'} V1016 ${c.name}`);
 if(!report.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1016};
