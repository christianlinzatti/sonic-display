#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1033(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:!!ok});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  add('version',Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1])>=1033);
  add('metadata',pkg.sonicFeatureRelease===pkg.version.split('-')[1]&&pkg.sonicRoadmapRelease===pkg.version.split('-')[1]);
  add('lockfile',lock.version===pkg.version&&lock.packages?.['']?.version===pkg.version);
  add('node24',pkg.engines?.node==='24.x');
  add('first-prebuild',pkg.scripts.prebuild.includes('npm run test:v1033 && npm run test:v1033:types &&')&&pkg.scripts.prebuild.startsWith(`npm run test:${pkg.sonicFeatureRelease} &&`));
  add('test',pkg.scripts['test:v1033']==='node tests/v1033-immersive-arena-regression.cjs');
  add('isolated-types',pkg.scripts['test:v1033:types']==='tsc -p tests/tsconfig.v1033-core.json'&&exists('tests/tsconfig.v1033-core.json'));
  const required=['lib/arena360ImmersionV1033.ts','components/visualizer/stages/ArenaAudienceV1032.tsx',
   'components/visualizer/stages/ArenaLedDomeV1033.tsx','components/visualizer/stages/Arena360StageV1031.tsx',
   'components/visualizer/stages/index.tsx','components/visualizer/ThreeAvatar.tsx',
   'components/visualizer/SmartStageCameraV236.tsx','components/visualizer/StageCameraDirectorV289.tsx',
   'components/SettingsPanel.tsx','tests/v1033-immersive-arena-regression.cjs',
   'changelog/V1033-IMMERSIVE-ARENA-SHOW.md','.github/workflows/v1033-immersive-arena-validation.yml'];
  required.forEach(f=>add('file:'+f,exists(f)));
  add('camera-owners',read('components/visualizer/StageCameraDirectorV289.tsx').includes('composeArenaFlyoverV1033(')&&
    read('components/visualizer/SmartStageCameraV236.tsx').includes('composeArenaFlyoverV1033('));
  add('rotating-platform',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('v1031-rotating-platform-and-cast'));
  add('adaptive-audience',read('components/visualizer/stages/ArenaAudienceV1032.tsx').includes('useAdaptivePerformance'));
  add('adaptive-dome',read('components/visualizer/stages/ArenaLedDomeV1033.tsx').includes('useAdaptivePerformance'));
  add('touch-settings',read('components/SettingsPanel.tsx').includes('arenaPhoneModeV1033'));
  add('production-gate',read('scripts/v931-production-gate.cjs').includes('tests/v1033-immersive-arena-regression.cjs'));
  add('vercel-gate',read('scripts/vercel-production-build.cjs').includes('tests/v1033-immersive-arena-regression.cjs'));
  add('preflight-hook',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1033(root)'));
  add('push-ci-reused',read('.github/workflows/v1032-live-arena-validation.yml').includes('npm run test:v1033'));
  add('manual-ci-no-extra-push',!read('.github/workflows/v1033-immersive-arena-validation.yml').includes('  push:'));
 }catch(error){console.error('V1033 release gate',error.message);add('read-source',false);}
 return {passed:checks.length>=29&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const report=inspectReleaseV1033(path.resolve(__dirname,'..'));
 for(const c of report.checks)console.log(`${c.ok?'PASS':'FAIL'} V1033 ${c.name}`);
 if(!report.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1033};
