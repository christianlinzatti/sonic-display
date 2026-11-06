#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
/** Dependency-free, pre-install release guard for V1028. */
function inspectReleaseV1028(root){
 const checks=[],check=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const v=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version??'');
  check('version',Boolean(v&&Number(v[1])>=1028));
  check('feature-roadmap',Boolean(v&&pkg.sonicFeatureRelease==='v'+v[1]&&pkg.sonicRoadmapRelease==='v'+v[1]));
  check('lockfile',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  check('node24',pkg.engines?.node==='24.x');
  check('prebuild-first',Boolean(v&&pkg.scripts.prebuild.startsWith(`npm run test:v${v[1]} &&`)));
  check('focused-test',pkg.scripts['test:v1028']==='node tests/v1028-immersive-concert-fx-regression.cjs');
  check('isolated-types',pkg.scripts['test:v1028:types']?.includes('immersiveConcertFxV1028.ts'));
  for(const p of ['components/visualizer/immersiveConcertFxV1028.ts',
    'components/visualizer/concertFxStudioV810.ts','components/visualizer/DynamicStage.tsx',
    'components/visualizer/ConcertFxStudioPanelV810.tsx',
    'tests/v1028-immersive-concert-fx-regression.cjs',
    'changelog/V1028-IMMERSIVE-CONCERT-FX-5.md',
    '.github/workflows/v1028-immersive-concert-fx-validation.yml'])check('file:'+p,exists(p));
  const stage=read('components/visualizer/DynamicStage.tsx');
  check('stage-coordinator',stage.includes('const immersiveFxV1028=planImmersiveConcertFxV1028({')&&
    stage.includes('const immersiveMixV1028=mixImmersiveConcertFxV1028('));
  check('after-performance',stage.indexOf('const immersiveMixV1028=')>stage.indexOf('const particleMixV889='));
  check('existing-fog',stage.includes('cinematicFogV887.floorOpacity*immersiveFxV1028.fogGain'));
  check('existing-stage',stage.includes('liveStageV882.current=immersiveMixV1028.stage'));
  check('only-one-stage-loop',(stage.match(/useFrame\(/g)||[]).length===1);
  check('settings-ui',read('components/visualizer/ConcertFxStudioPanelV810.tsx').includes('Immersive Concert FX 5.0'));
  check('production-gate',read('scripts/v931-production-gate.cjs').includes('tests/v1028-immersive-concert-fx-regression.cjs'));
  check('vercel-gate',read('scripts/vercel-production-build.cjs').includes('tests/v1028-immersive-concert-fx-regression.cjs'));
  check('preflight-hook',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1028(root)'));
  // The ZIP importer preserves protected workflows; verify the actual installed set.
  check('manual-validation-workflows-installed',[
    '.github/workflows/v1010-central-network-validation.yml',
    '.github/workflows/v1011-network-dashboard-validation.yml',
    '.github/workflows/v1012-network-health-validation.yml',
    '.github/workflows/v1014-network-diagnostics-validation.yml',
    '.github/workflows/v1017-intelligent-cache-validation.yml',
    '.github/workflows/v1025-cinematic-camera-validation.yml',
    '.github/workflows/v1026-intelligent-stage-lighting-validation.yml',
    '.github/workflows/v1027-govee-concert-sync-validation.yml',
    '.github/workflows/v1028-immersive-concert-fx-validation.yml',
  ].every(exists));
  const titles=require('./version-action-titles-v1016.cjs').formatActionTitlesV1016(root,false);
  check('workflow-titles',titles.total>=25&&titles.changed===0);
  check('production-workflow',read('.github/workflows/v965-room-wave-production.yml').includes('node scripts/v965-production-verify.cjs'));
 }catch(e){console.error('V1028 release guard:',e.message);check('sources-readable',false);}
 return {passed:checks.length>=22&&checks.every(x=>x.ok),checks};
}
if(require.main===module){const report=inspectReleaseV1028(path.resolve(__dirname,'..'));
 for(const c of report.checks)console.log(`${c.ok?'PASS':'FAIL'} V1028 ${c.name}`);
 if(!report.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1028};
