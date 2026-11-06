#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1023(root){
 const checks=[],check=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const v=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version||'');
  check('release-at-least-1023',Boolean(v&&Number(v[1])>=1023));
  check('feature-and-roadmap',Boolean(v&&pkg.sonicRoadmapRelease==='v'+v[1]&&pkg.sonicFeatureRelease==='v'+v[1]));
  check('lockfile',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  check('node24',pkg.engines?.node==='24.x');
  check('prebuild-first',Boolean(v&&pkg.scripts.prebuild.startsWith(`npm run test:v${v[1]} &&`)));
  check('registered-regression',pkg.scripts['test:v1023']==='node tests/v1023-advanced-rap-performance-regression.cjs');
  check('registered-typecheck',pkg.scripts['test:v1023:types']?.includes('advancedRapPerformanceV1023.ts'));
  for(const p of ['components/visualizer/advancedRapPerformanceV1023.ts',
   'components/visualizer/useGltfVocalMotionV492.ts','components/visualizer/VocalRigV368.tsx',
   'tests/v1023-advanced-rap-performance-regression.cjs',
   'changelog/V1023-ADVANCED-RAP-PERFORMANCE-6.md'])check('file:'+p,exists(p));
  check('gesture-integrated',read('components/visualizer/useGltfVocalMotionV492.ts').includes('refineAdvancedRapGestureV1023(rawWordDanceV567'));
  check('v515-authority',read('components/visualizer/useGltfVocalMotionV492.ts').includes('correctAutomaticAccentV515(wordDanceV567'));
  check('mouth-integrated',read('components/visualizer/VocalRigV368.tsx').includes('rapMouthResponseV1023(articulationV837,mouthContextV1023'));
  for(const p of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
   check('mandatory:'+p,read(p).includes('tests/v1023-advanced-rap-performance-regression.cjs'));
  check('preflight-hook',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1023(root)'));
  check('action-titles',require('./version-action-titles-v1016.cjs').formatActionTitlesV1016(root,false).changed===0);
  check('real-build',read('.github/workflows/v965-room-wave-production.yml').includes('node scripts/v965-production-verify.cjs'));
 }catch(error){check('project-readable',false);}
 return {passed:checks.length>=18&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const result=inspectReleaseV1023(path.resolve(__dirname,'..'));
 for(const c of result.checks)console.log(`${c.ok?'PASS':'FAIL'} V1023 ${c.name}`);
 if(!result.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1023};
