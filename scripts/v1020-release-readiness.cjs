#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1020(root){
 const checks=[],check=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8'),exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const version=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version||'');
  check('release-at-least-1020',!!version&&Number(version[1])>=1020);
  check('release-consistency',!!version&&pkg.sonicFeatureRelease==='v'+version[1]&&pkg.sonicRoadmapRelease==='v'+version[1]);
  check('lockfile-consistency',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  check('node24',pkg.engines?.node==='24.x');
  check('latest-first',!!version&&pkg.scripts.prebuild.startsWith(`npm run test:v${version[1]} &&`));
  check('test-command',pkg.scripts['test:v1020']==='node tests/v1020-concert-storytelling-regression.cjs');
  for(const f of ['lib/aiConcertStorytellingV1020.ts','components/visualizer/ConcertStorytellingPanelV1020.tsx',
   'tests/v1020-concert-storytelling-regression.cjs','changelog/V1020-AI-CONCERT-STORYTELLING.md'])check('file:'+f,exists(f));
  check('visible-live-fx',read('components/visualizer/LiveFxDeckV881.tsx').includes('<ConcertStorytellingPanelV1020'));
  for(const f of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
   check('required-gate:'+f,read(f).includes('tests/v1020-concert-storytelling-regression.cjs'));
  check('preflight-hook',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1020(root)'));
  const {formatActionTitlesV1016}=require('./version-action-titles-v1016.cjs');
  const actionTitles=formatActionTitlesV1016(root,false);
  check('run-titles-versioned',actionTitles.total>=25&&actionTitles.changed===0);
  check('production-build',read('.github/workflows/v965-room-wave-production.yml').includes('node scripts/v965-production-verify.cjs'));
 }catch(error){check('read-project',false);}
 return {passed:checks.length>=15&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const result=inspectReleaseV1020(path.resolve(__dirname,'..'));
 for(const x of result.checks)console.log(`${x.ok?'PASS':'FAIL'} V1020 ${x.name}`);
 if(!result.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1020};
