#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
/** V1025 pre-install release guard; no dependencies, network, runtime side effects. */
function inspectReleaseV1025(root){
 const checks=[],check=(name,ok)=>checks.push({name,ok:!!ok});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try {
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const match=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version||'');
  check('current-release',!!match&&Number(match[1])>=1025);
  check('feature-roadmap',!!match&&pkg.sonicFeatureRelease===`v${match[1]}`&&pkg.sonicRoadmapRelease===`v${match[1]}`);
  check('lockfile',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  check('node24',pkg.engines?.node==='24.x');
  check('prebuild-first',!!match&&pkg.scripts.prebuild.startsWith(`npm run test:v${match[1]} &&`));
  check('regression-script',pkg.scripts['test:v1025']==='node tests/v1025-cinematic-camera-intelligence-regression.cjs');
  check('types-script',pkg.scripts['test:v1025:types']?.includes('cinematicCameraIntelligenceV1025.ts'));
  for(const p of ['components/visualizer/cinematicCameraIntelligenceV1025.ts',
   'components/visualizer/StageCameraDirectorV289.tsx',
   'tests/v1025-cinematic-camera-intelligence-regression.cjs',
   'changelog/V1025-CINEMATIC-CAMERA-INTELLIGENCE-4.md'])check('file:'+p,exists(p));
  const camera=read('components/visualizer/StageCameraDirectorV289.tsx');
  check('one-camera-integrated',camera.includes('const cinematicV1025=reviewCinematicCameraV1025('));
  check('v898-prior',camera.indexOf('const danceCameraV898=sampleDanceCameraV898(')<camera.indexOf('const cinematicV1025='));
  check('final-v351-guard',camera.includes('guardAutomaticCameraV351(cinematicV1025.pose,composition)'));
  check('pacing-integrated',camera.includes('danceShowCameraV899.cameraRate*cinematicV1025.cameraRate'));
  for(const p of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
   check('mandatory:'+p,read(p).includes('tests/v1025-cinematic-camera-intelligence-regression.cjs'));
  check('preflight-hook',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1025(root)'));
  const titles=require('./version-action-titles-v1016.cjs').formatActionTitlesV1016(root,false);
  check('action-titles',titles.total>=25&&titles.changed===0);
  check('production-build',read('.github/workflows/v965-room-wave-production.yml').includes('node scripts/v965-production-verify.cjs'));
 }catch(error){check('readable',false);}
 return {passed:checks.length>=19&&checks.every(x=>x.ok),checks};
}
if(require.main===module){const result=inspectReleaseV1025(path.resolve(__dirname,'..'));
 for(const c of result.checks)console.log(`${c.ok?'PASS':'FAIL'} V1025 ${c.name}`);
 if(!result.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1025};
