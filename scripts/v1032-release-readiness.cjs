#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1032(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:!!ok});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  add('version',Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1])>=1032);
  add('metadata',pkg.sonicFeatureRelease===pkg.version.split('-')[1]&&pkg.sonicRoadmapRelease===pkg.version.split('-')[1]);
  add('lockfile',lock.version===pkg.version&&lock.packages?.['']?.version===pkg.version);
  add('node24',pkg.engines?.node==='24.x');
  add('first-prebuild',pkg.scripts.prebuild.includes('npm run test:v1032 && npm run test:v1032:types &&')&&pkg.scripts.prebuild.startsWith(`npm run test:${pkg.sonicFeatureRelease} &&`));
  add('test',pkg.scripts['test:v1032']==='node tests/v1032-live-arena-regression.cjs');
  add('isolated-types',pkg.scripts['test:v1032:types']==='tsc -p tests/tsconfig.v1032-core.json'&&exists('tests/tsconfig.v1032-core.json'));
  const required=['lib/arena360ExperienceV1032.ts','components/visualizer/stages/ArenaAudienceV1032.tsx',
   'components/visualizer/stages/ArenaLightsV1032.tsx','components/visualizer/stages/Arena360StageV1031.tsx',
   'components/visualizer/stages/index.tsx','components/visualizer/ThreeAvatar.tsx',
   'components/visualizer/SmartStageCameraV236.tsx','components/visualizer/StageCameraDirectorV289.tsx',
   'components/SettingsPanel.tsx','tests/v1032-live-arena-regression.cjs',
   'changelog/V1032-LIVE-ARENA-EXPERIENCE.md','.github/workflows/v1032-live-arena-validation.yml'];
  required.forEach(f=>add('file:'+f,exists(f)));
  add('camera-owner',read('components/visualizer/StageCameraDirectorV289.tsx').includes('composeArenaCameraV1032('));
  add('platform',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('v1031-rotating-platform-and-cast'));
  add('performance-tier',read('components/visualizer/stages/ArenaAudienceV1032.tsx').includes('useAdaptivePerformance'));
  add('settings',read('components/SettingsPanel.tsx').includes('arenaCameraModeV1032'));
  add('production-gate',read('scripts/v931-production-gate.cjs').includes('tests/v1032-live-arena-regression.cjs'));
  add('vercel-gate',read('scripts/vercel-production-build.cjs').includes('tests/v1032-live-arena-regression.cjs'));
  add('preflight-hook',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1032(root)'));
 }catch(error){console.error('V1032 preflight error',error.message);add('read-source',false);}
 return {passed:checks.length>=26&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const report=inspectReleaseV1032(path.resolve(__dirname,'..'));
 for(const c of report.checks)console.log(`${c.ok?'PASS':'FAIL'} V1032 ${c.name}`);
 if(!report.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1032};
