#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1022(root){
 const checks=[],check=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8'),exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const release=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version||'');
  check('release-v1022-or-higher',Boolean(release&&Number(release[1])>=1022));
  check('matching-metadata',Boolean(release&&pkg.sonicFeatureRelease==='v'+release[1]&&pkg.sonicRoadmapRelease==='v'+release[1]));
  check('matching-lockfile',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  check('node24',pkg.engines?.node==='24.x');
  check('prebuild-first',Boolean(release&&pkg.scripts.prebuild.startsWith(`npm run test:v${release[1]} &&`)));
  check('registered-test',pkg.scripts['test:v1022']==='node tests/v1022-live-show-adaptation-regression.cjs');
  for(const p of ['lib/aiLiveShowAdaptationV1022.ts','components/visualizer/LiveShowAdaptationPanelV1022.tsx',
   'tests/v1022-live-show-adaptation-regression.cjs','changelog/V1022-AI-LIVE-SHOW-ADAPTATION.md'])
    check('file:'+p,exists(p));
  check('visible-live-fx',read('components/visualizer/LiveFxDeckV881.tsx').includes('<LiveShowAdaptationPanelV1022'));
  for(const p of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
   check('mandatory:'+p,read(p).includes('tests/v1022-live-show-adaptation-regression.cjs'));
  check('preflight-hook',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1022(root)'));
  check('action-titles',require('./version-action-titles-v1016.cjs').formatActionTitlesV1016(root,false).changed===0);
  check('real-production-build',read('.github/workflows/v965-room-wave-production.yml').includes('node scripts/v965-production-verify.cjs'));
 }catch(error){check('project-readable',false);}
 return {passed:checks.length>=15&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const result=inspectReleaseV1022(path.resolve(__dirname,'..'));
 for(const c of result.checks)console.log(`${c.ok?'PASS':'FAIL'} V1022 ${c.name}`);
 if(!result.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1022};
