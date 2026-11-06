#!/usr/bin/env node
'use strict';
/** Dependency-free V1029 source integrity and full Node 24 CI release guard. */
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1029(root){
 const checks=[],check=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const version=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version??'');
  check('version',Boolean(version&&Number(version[1])>=1029));
  check('release-metadata',Boolean(version&&pkg.sonicFeatureRelease==='v'+version[1]&&
    pkg.sonicRoadmapRelease==='v'+version[1]));
  check('lockfile',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  check('node24',pkg.engines?.node==='24.x');
  check('latest-regression-first',Boolean(version&&pkg.scripts.prebuild.startsWith(`npm run test:v${version[1]} &&`)));
  check('focused-test',pkg.scripts['test:v1029']==='node tests/v1029-ai-visual-director-regression.cjs');
  check('isolated-types',pkg.scripts['test:v1029:types']?.includes('aiVisualDirectorV1029.ts'));
  for(const file of ['components/visualizer/aiVisualDirectorV1029.ts',
    'components/visualizer/DynamicStage.tsx','components/visualizer/concertFxStudioV810.ts',
    'components/visualizer/ConcertFxStudioPanelV810.tsx',
    'tests/v1029-ai-visual-director-regression.cjs',
    'changelog/V1029-AI-VISUAL-DIRECTOR-5.md',
    '.github/workflows/v1029-ai-visual-director-validation.yml'])
      check('file:'+file,exists(file));
  const stage=read('components/visualizer/DynamicStage.tsx');
  check('verified-director',stage.includes('const visualDirectorV1029=planAiVisualDirectorV1029({')&&
    stage.includes('source:cameraNarrativeV605.plan.source')&&
    stage.includes('cinematic:cinematicCueV761?{'));
  check('post-budget',stage.indexOf('const visualMixV1029=')>stage.indexOf('const immersiveMixV1028=')&&
    stage.includes('liveStageV882.current=visualMixV1029.stage;'));
  check('led-existing-shader',stage.includes('for(const uniform of VISUAL_LED_UNIFORMS_V1029)'));
  check('existing-fog',stage.includes('cinematicFogV887.floorOpacity*immersiveFxV1028.fogGain*visualDirectorV1029.fogGain'));
  check('single-stage-loop',(stage.match(/useFrame\(/g)||[]).length===1);
  check('ui-setting',read('components/visualizer/ConcertFxStudioPanelV810.tsx').includes('AI Visual Director 5.0')&&
    read('components/visualizer/concertFxStudioV810.ts').includes('aiVisualDirectorV1029:true'));
  check('production-regressions',read('scripts/v931-production-gate.cjs').includes('tests/v1029-ai-visual-director-regression.cjs'));
  check('vercel-regressions',read('scripts/vercel-production-build.cjs').includes('tests/v1029-ai-visual-director-regression.cjs'));
  check('preflight-hook',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1029(root)'));
  // Protected workflows require an authorized updater; merely bundling a YAML
  // within a ZIP does not install it. Fail closed on an incomplete installation.
  check('installed-manual-workflows',[
    'v1010-central-network-validation.yml','v1011-network-dashboard-validation.yml',
    'v1012-network-health-validation.yml','v1014-network-diagnostics-validation.yml',
    'v1017-intelligent-cache-validation.yml','v1025-cinematic-camera-validation.yml',
    'v1026-intelligent-stage-lighting-validation.yml','v1027-govee-concert-sync-validation.yml',
    'v1028-immersive-concert-fx-validation.yml','v1029-ai-visual-director-validation.yml',
  ].every(f=>exists('.github/workflows/'+f)));
  const titles=require('./version-action-titles-v1016.cjs').formatActionTitlesV1016(root,false);
  check('versioned-actions',titles.total>=38&&titles.changed===0);
  check('real-production-gate',read('.github/workflows/v965-room-wave-production.yml').includes('node scripts/v965-production-verify.cjs'));
 }catch(error){console.error('V1029 release guard:',error.message);check('read-source',false);}
 return {passed:checks.length>=24&&checks.every(x=>x.ok),checks};
}
if(require.main===module){const report=inspectReleaseV1029(path.resolve(__dirname,'..'));
 for(const c of report.checks)console.log(`${c.ok?'PASS':'FAIL'} V1029 ${c.name}`);
 if(!report.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1029};
