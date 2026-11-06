#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1034(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:!!ok});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  add('version',Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1])>=1034);
  add('metadata',pkg.sonicFeatureRelease===pkg.version.split('-')[1]&&pkg.sonicRoadmapRelease===pkg.version.split('-')[1]);
  add('lockfile',lock.version===pkg.version&&lock.packages?.['']?.version===pkg.version);
  add('node24',pkg.engines?.node==='24.x');
  add('first-prebuild',pkg.scripts.prebuild.includes('npm run test:v1034 && npm run test:v1034:types &&')&&pkg.scripts.prebuild.startsWith(`npm run test:${pkg.sonicFeatureRelease} &&`));
  add('scripts',pkg.scripts['test:v1034']==='node tests/v1034-ultimate-arena-regression.cjs'&&
    pkg.scripts['test:v1034:types']==='tsc -p tests/tsconfig.v1034-core.json');
  for(const f of ['lib/arena360ShowV1034.ts','components/visualizer/stages/ArenaSkyFormationV1034.tsx',
   'components/visualizer/stages/Arena360StageV1031.tsx','components/visualizer/stages/index.tsx',
   'components/visualizer/StageCameraDirectorV289.tsx','components/visualizer/SmartStageCameraV236.tsx',
   'components/visualizer/ThreeAvatar.tsx','components/visualizer/VisualizerStage.tsx',
   'types/music.ts','context/UiPreferencesContext.tsx','components/visualizer/registry.tsx','components/SettingsPanel.tsx',
   'tests/v1034-ultimate-arena-regression.cjs','tests/tsconfig.v1034-core.json',
   'changelog/V1034-ULTIMATE-ARENA.md','.github/workflows/v1034-ultimate-arena-validation.yml'])add('file:'+f,exists(f));
  add('camera-owners',read('components/visualizer/StageCameraDirectorV289.tsx').includes('composeArenaSectionCameraV1034(')&&
   read('components/visualizer/SmartStageCameraV236.tsx').includes('composeArenaSectionCameraV1034('));
  add('master-stage-keeps-cast',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('v1031-rotating-platform-and-cast')&&
   read('components/visualizer/stages/Arena360StageV1031.tsx').includes('v1034-independent-scenic-lift-ring'));
  add('release-gates',read('scripts/v931-production-gate.cjs').includes('tests/v1034-ultimate-arena-regression.cjs')&&
   read('scripts/vercel-production-build.cjs').includes('tests/v1034-ultimate-arena-regression.cjs'));
  add('preflight-hook',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1034(root)'));
  add('push-ci-reused',read('.github/workflows/v1032-live-arena-validation.yml').includes('npm run test:v1034'));
  add('manual-ci-no-extra-push',!read('.github/workflows/v1034-ultimate-arena-validation.yml').includes('  push:'));
  add('ui-switches',read('components/SettingsPanel.tsx').includes('arenaShowDirectorEnabledV1034'));
 }catch(error){console.error('V1034 release gate:',error.message);add('read-source',false);}
 return {passed:checks.length>=25&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const report=inspectReleaseV1034(path.resolve(__dirname,'..'));
 for(const c of report.checks)console.log(`${c.ok?'PASS':'FAIL'} V1034 ${c.name}`);
 if(!report.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1034};
