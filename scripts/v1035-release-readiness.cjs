#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1035(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try {
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  add('version',Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1])>=1035&&pkg.sonicFeatureRelease===pkg.version.split('-')[1]&&pkg.sonicRoadmapRelease===pkg.version.split('-')[1]);
  add('lock',lock.version===pkg.version&&lock.packages?.['']?.version===pkg.version);
  add('node24',pkg.engines?.node==='24.x');
  add('prebuild',pkg.scripts.prebuild.includes('npm run test:v1035 && npm run test:v1035:types && npm run test:v1034 &&')&&pkg.scripts.prebuild.startsWith(`npm run test:${pkg.sonicFeatureRelease} &&`));
  add('scripts',pkg.scripts['test:v1035']==='node tests/v1035-ai-arena-regression.cjs'&&pkg.scripts['test:v1035:types']==='tsc -p tests/tsconfig.v1035-core.json');
  for(const f of ['lib/arena360DirectorV1035.ts','components/visualizer/stages/ArenaLedColumnsV1035.tsx',
   'components/visualizer/stages/ArenaVirtualPyroV1035.tsx','components/visualizer/stages/Arena360StageV1031.tsx',
   'components/visualizer/stages/ArenaAudienceV1032.tsx','components/visualizer/stages/ArenaSkyFormationV1034.tsx',
   'components/visualizer/stages/index.tsx','components/visualizer/ThreeAvatar.tsx','components/visualizer/VisualizerStage.tsx',
   'components/visualizer/registry.tsx','types/music.ts','context/UiPreferencesContext.tsx','components/SettingsPanel.tsx',
   'tests/v1035-ai-arena-regression.cjs','tests/tsconfig.v1035-core.json',
   'changelog/V1035-AI-ARENA-SHOW.md','.github/workflows/v1035-ai-arena-validation.yml'])add('file:'+f,exists(f));
  add('production-gates',read('scripts/v931-production-gate.cjs').includes("['V1035 AI Arena Show Director','tests/v1035-ai-arena-regression.cjs']")&&
   read('scripts/vercel-production-build.cjs').includes("run('V1035 AI Arena Show Director','tests/v1035-ai-arena-regression.cjs')"));
  add('source-preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1035(root)'));
  add('push-ci-reused',read('.github/workflows/v1032-live-arena-validation.yml').includes('npm run test:v1035')&&
   read('.github/workflows/v1032-live-arena-validation.yml').includes('lib/arena360DirectorV1035.ts'));
  add('manual-ci-only',!read('.github/workflows/v1035-ai-arena-validation.yml').includes('  push:'));
  const settings=read('components/SettingsPanel.tsx');
  add('settings-wired',['arenaFullSongDirectorEnabledV1035','arenaLedColumnsEnabledV1035','arenaVirtualPyroEnabledV1035',
   'arenaCrowdChantEnabledV1035','arenaShowIntensityV1035'].every(k=>settings.includes(k)));
  const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
  add('stage-fixed-fx',stage.indexOf('<ArenaLedColumnsV1035')<stage.indexOf('ref={turntable}')&&
   stage.indexOf('<ArenaVirtualPyroV1035')<stage.indexOf('ref={turntable}'));
 } catch(error){console.error('V1035 release gate:',error.message);add('read-source',false);}
 return {passed:checks.length>=27&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const report=inspectReleaseV1035(path.resolve(__dirname,'..'));
 for(const c of report.checks)console.log(`${c.ok?'PASS':'FAIL'} V1035 ${c.name}`);
 if(!report.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1035};
