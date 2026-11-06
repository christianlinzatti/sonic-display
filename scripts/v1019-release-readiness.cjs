#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
/** Run before npm ci on every supported OS. No network and no dependencies. */
function inspectReleaseV1019(root){
 const checks=[],check=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8'),exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const v=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version||'');
  check('release-v1019-or-newer',Boolean(v&&Number(v[1])>=1019));
  check('consistent-version',Boolean(v&&pkg.sonicFeatureRelease===`v${v[1]}`&&pkg.sonicRoadmapRelease===`v${v[1]}`));
  check('lockfile',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  check('node24',pkg.engines?.node==='24.x');
  check('latest-first',Boolean(v&&pkg.scripts.prebuild.startsWith(`npm run test:v${v[1]} &&`)));
  check('v1019-test',pkg.scripts['test:v1019']==='node tests/v1019-predictive-concert-regression.cjs');
  for(const p of ['lib/predictiveConcertDirectorV1019.ts',
    'components/visualizer/PredictiveConcertPanelV1019.tsx',
    'tests/v1019-predictive-concert-regression.cjs',
    'changelog/V1019-PREDICTIVE-CONCERT-DIRECTOR.md'])check('file:'+p,exists(p));
  check('integrated-ui',read('components/visualizer/LiveFxDeckV881.tsx').includes('<PredictiveConcertPanelV1019'));
  for(const p of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
    check('mandatory:'+p,read(p).includes('tests/v1019-predictive-concert-regression.cjs'));
  check('preflight-hook',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1019(root)'));
  check('official-action-titles',require('./version-action-titles-v1016.cjs').formatActionTitlesV1016(root,false).changed===0);
  check('production-build',read('.github/workflows/v965-room-wave-production.yml').includes('node scripts/v965-production-verify.cjs'));
 }catch(err){check('source-read',false);}
 return {passed:checks.length>=15&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const result=inspectReleaseV1019(path.resolve(__dirname,'..'));
 for(const c of result.checks)console.log(`${c.ok?'PASS':'FAIL'} V1019 ${c.name}`);
 if(!result.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1019};
