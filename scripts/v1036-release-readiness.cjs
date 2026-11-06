#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1036(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  add('version',Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1])>=1036&&pkg.sonicFeatureRelease===pkg.version.split('-')[1]&&pkg.sonicRoadmapRelease===pkg.version.split('-')[1]);
  add('lock',lock.version===pkg.version&&lock.packages?.['']?.version===pkg.version);
  add('node24',pkg.engines?.node==='24.x');
  add('prebuild',pkg.scripts.prebuild.includes('npm run test:v1036 && npm run test:v1036:types && npm run test:v1035 &&')&&pkg.scripts.prebuild.startsWith(`npm run test:${pkg.sonicFeatureRelease} &&`));
  add('scripts',pkg.scripts['test:v1036']==='node tests/v1036-atmospheric-arena-regression.cjs'&&
    pkg.scripts['test:v1036:types']==='tsc -p tests/tsconfig.v1036-core.json');
  for(const f of ['lib/arena360AtmosphereV1036.ts','components/visualizer/stages/ArenaLaserFansV1036.tsx',
   'components/visualizer/stages/ArenaMovingLedSkyV1036.tsx','components/visualizer/stages/ArenaLowFogV1036.tsx',
   'components/visualizer/stages/Arena360StageV1031.tsx','components/visualizer/stages/index.tsx',
   'components/visualizer/ThreeAvatar.tsx','components/visualizer/VisualizerStage.tsx',
   'components/visualizer/registry.tsx','types/music.ts','context/UiPreferencesContext.tsx',
   'components/SettingsPanel.tsx','tests/v1036-atmospheric-arena-regression.cjs',
   'tests/tsconfig.v1036-core.json','changelog/V1036-ATMOSPHERIC-ARENA.md',
   '.github/workflows/v1036-atmospheric-arena-validation.yml'])add('file:'+f,exists(f));
  add('production-gates',read('scripts/v931-production-gate.cjs').includes('tests/v1036-atmospheric-arena-regression.cjs')&&
    read('scripts/vercel-production-build.cjs').includes('tests/v1036-atmospheric-arena-regression.cjs'));
  add('source-preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1036(root)'));
  add('push-ci-reused',read('.github/workflows/v1032-live-arena-validation.yml').includes('npm run test:v1036')&&
    read('.github/workflows/v1032-live-arena-validation.yml').includes('lib/arena360AtmosphereV1036.ts'));
  add('no-extra-push',!read('.github/workflows/v1036-atmospheric-arena-validation.yml').includes('  push:'));
  add('settings', ['arenaLasersEnabledV1036','arenaMovingSkyEnabledV1036','arenaGroundFogEnabledV1036',
    'arenaPeakDirectorEnabledV1036'].every(k=>read('components/SettingsPanel.tsx').includes(k)));
  const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
  add('world-fixed-fx',['<ArenaLaserFansV1036','<ArenaMovingLedSkyV1036','<ArenaLowFogV1036'].every(k=>
    stage.includes(k)&&stage.indexOf(k)<stage.indexOf('ref={turntable}')));
 }catch(error){console.error('V1036 release:',error.message);add('read-source',false);}
 return {passed:checks.length>=27&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1036(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1036 ${c.name}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1036};
