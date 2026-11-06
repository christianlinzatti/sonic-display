#!/usr/bin/env node
'use strict';
/** Source-only V1031 release gate; full TypeScript/Next checks run in CI. */
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1031(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:!!ok});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  add('version',Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1])>=1031);
  add('metadata',pkg.sonicFeatureRelease===pkg.version.split('-')[1]&&pkg.sonicRoadmapRelease===pkg.version.split('-')[1]);
  add('lockfile',lock.version===pkg.version&&lock.packages?.['']?.version===pkg.version);
  add('node24',pkg.engines?.node==='24.x');
  add('first-prebuild',pkg.scripts.prebuild.includes('npm run test:v1031 && npm run test:v1031:types &&')&&pkg.scripts.prebuild.startsWith(`npm run test:${pkg.sonicFeatureRelease} &&`));
  add('test',pkg.scripts['test:v1031']==='node tests/v1031-rotating-arena-regression.cjs');
  add('isolated-types',pkg.scripts['test:v1031:types']==='tsc -p tests/tsconfig.v1031-core.json'&&exists('tests/tsconfig.v1031-core.json'));
  const required=['lib/arena360RotationV1031.ts','components/visualizer/stages/Arena360StageV1031.tsx',
   'components/visualizer/stages/index.tsx','components/visualizer/ThreeAvatar.tsx',
   'components/SettingsPanel.tsx','components/visualizer/StageThemeCardScene.tsx',
   'tests/v1031-rotating-arena-regression.cjs','changelog/V1031-ROTATING-360-ARENA.md',
   '.github/workflows/v1031-rotating-arena-validation.yml'];
  required.forEach(f=>add('file:'+f,exists(f)));
  const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
  const avatar=read('components/visualizer/ThreeAvatar.tsx');
  add('shared-root',stage.includes('v1031-rotating-platform-and-cast')&&stage.includes('{children}')&&avatar.includes('rotationEnabled={props.stageRotationEnabledV1031 ?? true}'));
  add('stage-selection',read('components/visualizer/stages/index.tsx').includes('id:"arena360"'));
  add('settings',read('components/SettingsPanel.tsx').includes('stageRotationSpeedV1031'));
  add('production-gate',read('scripts/v931-production-gate.cjs').includes('tests/v1031-rotating-arena-regression.cjs'));
  add('vercel-gate',read('scripts/vercel-production-build.cjs').includes('tests/v1031-rotating-arena-regression.cjs'));
  add('preflight-hook',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1031(root)'));
 }catch(error){console.error('V1031 preflight error',error.message);add('read-source',false);}
 return {passed:checks.length>=22&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const report=inspectReleaseV1031(path.resolve(__dirname,'..'));
 for(const c of report.checks)console.log(`${c.ok?'PASS':'FAIL'} V1031 ${c.name}`);
 if(!report.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1031};
