#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1021(root){
 const checks=[],check=(name,ok)=>checks.push({name,ok:!!ok});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8'),exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const v=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version||'');
  check('version-at-least-1021',!!v&&Number(v[1])>=1021);
  check('metadata-consistency',!!v&&pkg.sonicRoadmapRelease==='v'+v[1]&&pkg.sonicFeatureRelease==='v'+v[1]);
  check('lockfile-consistency',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  check('node24-engine',pkg.engines?.node==='24.x');
  check('latest-prebuild-first',!!v&&pkg.scripts.prebuild.startsWith(`npm run test:v${v[1]} &&`));
  check('test-registered',pkg.scripts['test:v1021']==='node tests/v1021-genre-intelligence-regression.cjs');
  for(const p of ['lib/genreIntelligenceV1021.ts','components/visualizer/GenreIntelligencePanelV1021.tsx',
   'tests/v1021-genre-intelligence-regression.cjs','changelog/V1021-GENRE-INTELLIGENCE-3.md'])
    check('file:'+p,exists(p));
  check('visible-live-fx',read('components/visualizer/LiveFxDeckV881.tsx').includes('<GenreIntelligencePanelV1021'));
  for(const p of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
   check('mandatory:'+p,read(p).includes('tests/v1021-genre-intelligence-regression.cjs'));
  check('preflight-hook',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1021(root)'));
  check('action-titles',require('./version-action-titles-v1016.cjs').formatActionTitlesV1016(root,false).changed===0);
  check('production-gate',read('.github/workflows/v965-room-wave-production.yml').includes('node scripts/v965-production-verify.cjs'));
 }catch(e){check('read-project',false);}
 return {passed:checks.length>=15&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const result=inspectReleaseV1021(path.resolve(__dirname,'..'));
 for(const c of result.checks)console.log(`${c.ok?'PASS':'FAIL'} V1021 ${c.name}`);
 if(!result.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1021};
