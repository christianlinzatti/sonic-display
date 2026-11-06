#!/usr/bin/env node
'use strict';
/** Dependency-free pre-install V1018 release guard. */
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1018(root){
 const checks=[],check=(name,ok)=>checks.push({name,ok:!!ok});
 const exists=p=>fs.existsSync(path.join(root,p));
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const v=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version||'');
  check('release-at-least-v1018',!!v&&Number(v[1])>=1018);
  check('version-and-roadmap',!!v&&pkg.sonicFeatureRelease==='v'+v[1]&&pkg.sonicRoadmapRelease==='v'+v[1]);
  check('npm-lock-consistent',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  check('node-24',pkg.engines?.node==='24.x');
  check('prebuild-latest-first',!!v&&pkg.scripts.prebuild.startsWith(`npm run test:v${v[1]} &&`));
  check('focused-test-command',pkg.scripts['test:v1018']==='node tests/v1018-song-understanding-regression.cjs');
  for(const p of ['lib/songUnderstandingV1018.ts','components/visualizer/SongUnderstandingPanelV1018.tsx',
   'tests/v1018-song-understanding-regression.cjs','changelog/V1018-AI-SONG-UNDERSTANDING-2.md'])check('file:'+p,exists(p));
  check('live-UI-integration',read('components/visualizer/LiveFxDeckV881.tsx').includes('<SongUnderstandingPanelV1018'));
  for(const p of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
   check('mandatory-regression:'+p,read(p).includes('tests/v1018-song-understanding-regression.cjs'));
  check('preflight-hook',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1018(root)'));
  const titles=require('./version-action-titles-v1016.cjs').formatActionTitlesV1016(root,false);
  check('versioned-action-titles',titles.total>=25&&titles.changed===0);
  check('production-gate-enabled',read('.github/workflows/v965-room-wave-production.yml').includes('node scripts/v965-production-verify.cjs'));
 }catch(e){check('source-integrity',false);}
 return {passed:checks.length>=13&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const report=inspectReleaseV1018(path.resolve(__dirname,'..'));
 for(const x of report.checks)console.log(`${x.ok?'PASS':'FAIL'} V1018 ${x.name}`);
 if(!report.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1018};
