#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
/** V1026 pre-install, dependency-free release guard. */
function inspectReleaseV1026(root){
 const checks=[],check=(name,value)=>checks.push({name,ok:!!value});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const match=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version??'');
  check('release-at-least-v1026',!!match&&Number(match[1])>=1026);
  check('feature-roadmap',!!match&&pkg.sonicFeatureRelease==='v'+match[1]&&pkg.sonicRoadmapRelease==='v'+match[1]);
  check('lockfile',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  check('node24',pkg.engines?.node==='24.x');
  check('prebuild-first',!!match&&pkg.scripts.prebuild.startsWith(`npm run test:v${match[1]} &&`));
  check('regression',pkg.scripts['test:v1026']==='node tests/v1026-intelligent-stage-lighting-regression.cjs');
  check('types',pkg.scripts['test:v1026:types']?.includes('intelligentStageLightingV1026.ts'));
  for(const p of ['components/visualizer/intelligentStageLightingV1026.ts',
    'components/visualizer/DynamicStage.tsx','tests/v1026-intelligent-stage-lighting-regression.cjs',
    'changelog/V1026-INTELLIGENT-STAGE-LIGHTING-4.md',
    '.github/workflows/v1026-intelligent-stage-lighting-validation.yml'])check('file:'+p,exists(p));
  const stage=read('components/visualizer/DynamicStage.tsx');
  check('stage-integrated',stage.includes('const stageLightV1026=planIntelligentStageLightingV1026({'));
  check('verified-v604-v761',stage.includes('narrative:cameraNarrativeV605,cinematic:cinematicCueV761'));
  check('manual-blackout-protection',stage.includes('manualLighting:manualLightingV763||authoredLightsV386')&&stage.includes('blackout:timelineCue.blackout>0'));
  check('single-stage-loop',(stage.match(/useFrame\(/g)||[]).length===1);
  check('regression-gate',read('scripts/v931-production-gate.cjs').includes('tests/v1026-intelligent-stage-lighting-regression.cjs'));
  check('vercel-gate',read('scripts/vercel-production-build.cjs').includes('tests/v1026-intelligent-stage-lighting-regression.cjs'));
  check('preflight-hook',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1026(root)'));
  const titles=require('./version-action-titles-v1016.cjs').formatActionTitlesV1016(root,false);
  check('workflow-titles',titles.total>=25&&titles.changed===0);
  check('production-workflow',read('.github/workflows/v965-room-wave-production.yml').includes('node scripts/v965-production-verify.cjs'));
 }catch(e){check('source-readable',false)}
 return {passed:checks.length>=20&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const result=inspectReleaseV1026(path.resolve(__dirname,'..'));
 for(const c of result.checks)console.log(`${c.ok?'PASS':'FAIL'} V1026 ${c.name}`);
 if(!result.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1026};
