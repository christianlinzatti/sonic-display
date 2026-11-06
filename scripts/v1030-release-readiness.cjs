#!/usr/bin/env node
'use strict';
/** V1030 – fail-closed, dependency-free source preflight (not production certification). */
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1030(root){
 const checks=[],check=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const v=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version??'');
  check('release',!!v&&Number(v[1])>=1030);
  check('metadata',!!v&&pkg.sonicFeatureRelease==='v'+v[1]&&pkg.sonicRoadmapRelease==='v'+v[1]);
  check('lockfile',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  check('node24',pkg.engines?.node==='24.x');
  check('prebuild-first',!!v&&pkg.scripts.prebuild.startsWith(`npm run test:v${v[1]} &&`));
  check('regression-script',pkg.scripts['test:v1030']==='node tests/v1030-intelligent-concert-atmosphere-regression.cjs');
  check('isolated-types',pkg.scripts['test:v1030:types']?.includes('intelligentConcertAtmosphereV1030.ts'));
  for(const file of ['components/visualizer/intelligentConcertAtmosphereV1030.ts',
   'components/visualizer/DynamicStage.tsx','components/visualizer/ConcertFxStudioPanelV810.tsx',
   'components/visualizer/concertFxStudioV810.ts',
   'tests/v1030-intelligent-concert-atmosphere-regression.cjs',
   'changelog/V1030-INTELLIGENT-CONCERT-ATMOSPHERE-5.md',
   '.github/workflows/v1030-intelligent-concert-atmosphere-validation.yml'])
   check('file:'+file,exists(file));
  const stage=read('components/visualizer/DynamicStage.tsx');
  check('integrated-planner',stage.includes('const concertAtmosphereV1030=planIntelligentConcertAtmosphereV1030({'));
  check('post-governor-crowd',stage.includes('applyConcertAtmosphereCrowdV1030(crowdCueV815.current,concertAtmosphereV1030)')&&
   stage.indexOf('applyConcertAtmosphereCrowdV1030(')>stage.indexOf('crowdCueV815.current=limitCrowdV999('));
  check('post-visual-stage',stage.includes('applyConcertAtmosphereStageV1030(liveStageV882.current,concertAtmosphereV1030)')&&
   stage.indexOf('applyConcertAtmosphereStageV1030(')>stage.indexOf('liveStageV882.current=visualMixV1029.stage'));
  check('fog-existing',stage.includes('visualDirectorV1029.fogGain*concertAtmosphereV1030.hazeGain'));
  check('existing-ambient',stage.includes('liveAtmosphereV885.environmentMix*concertAtmosphereV1030.ambientGain'));
  check('single-loop',(stage.match(/useFrame\(/g)||[]).length===1);
  check('ui-available',read('components/visualizer/ConcertFxStudioPanelV810.tsx').includes('Intelligent Concert Atmosphere 5.0'));
  check('production-gate',read('scripts/v931-production-gate.cjs').includes('tests/v1030-intelligent-concert-atmosphere-regression.cjs'));
  check('vercel-gate',read('scripts/vercel-production-build.cjs').includes('tests/v1030-intelligent-concert-atmosphere-regression.cjs'));
  check('preflight-hook',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1030(root)'));
  const titles=require('./version-action-titles-v1016.cjs').formatActionTitlesV1016(root,false);
  check('installed-titles',titles.total>=40&&titles.changed===0);
  check('production-workflow',read('.github/workflows/v965-room-wave-production.yml').includes('node scripts/v965-production-verify.cjs'));
 }catch(error){console.error('V1030 preflight error',error.message);check('read-source',false);}
 return {passed:checks.length>=23&&checks.every(x=>x.ok),checks};
}
if(require.main===module){const report=inspectReleaseV1030(path.resolve(__dirname,'..'));
 for(const c of report.checks)console.log(`${c.ok?'PASS':'FAIL'} V1030 ${c.name}`);
 if(!report.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1030};
