#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1037(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  add('version',pkg.version==='0.1.0-v1037'&&pkg.sonicFeatureRelease==='v1037'&&pkg.sonicRoadmapRelease==='v1037');
  add('lock',lock.version===pkg.version&&lock.packages?.['']?.version===pkg.version);
  add('node24',pkg.engines?.node==='24.x');
  add('prebuild',pkg.scripts.prebuild.startsWith('npm run test:v1037 && npm run test:v1037:types && npm run test:v1036 &&'));
  add('scripts',pkg.scripts['test:v1037']==='node tests/v1037-transforming-arena-regression.cjs'&&
   pkg.scripts['test:v1037:types']==='tsc -p tests/tsconfig.v1037-core.json');
  for(const f of ['lib/arena360TransformationV1037.ts','components/visualizer/stages/ArenaTransformingDeckV1037.tsx',
   'components/visualizer/stages/Arena360StageV1031.tsx','components/visualizer/stages/index.tsx',
   'components/visualizer/ThreeAvatar.tsx','components/visualizer/VisualizerStage.tsx',
   'components/visualizer/registry.tsx','types/music.ts','context/UiPreferencesContext.tsx',
   'components/SettingsPanel.tsx','components/visualizer/StageThemeCardScene.tsx',
   'tests/v1037-transforming-arena-regression.cjs','tests/tsconfig.v1037-core.json',
   'changelog/V1037-TRANSFORMING-ARENA.md','.github/workflows/v1037-transforming-arena-validation.yml'])add('file:'+f,exists(f));
  add('production-gates',read('scripts/v931-production-gate.cjs').includes('tests/v1037-transforming-arena-regression.cjs')&&
    read('scripts/vercel-production-build.cjs').includes('tests/v1037-transforming-arena-regression.cjs'));
  add('source-preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1037(root)'));
  add('push-ci-reused',read('.github/workflows/v1032-live-arena-validation.yml').includes('npm run test:v1037')&&
    read('.github/workflows/v1032-live-arena-validation.yml').includes('lib/arena360TransformationV1037.ts'));
  add('no-extra-push',!read('.github/workflows/v1037-transforming-arena-validation.yml').includes('  push:'));
  const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
  add('turntable-parent',stage.indexOf('<ArenaTransformingDeckV1037')>stage.indexOf('ref={turntable}')&&
    stage.indexOf('<ArenaTransformingDeckV1037')<stage.indexOf('{children}',stage.indexOf('ref={turntable}')));
  add('settings',['arenaTransformingDeckEnabledV1037','arenaTransformingDeckModeV1037',
    'arenaTransformingDeckStrengthV1037'].every(k=>read('components/SettingsPanel.tsx').includes(k)));
 }catch(e){console.error('V1037 release:',e.message);add('read-source',false);}
 return {passed:checks.length>=25&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const v=inspectReleaseV1037(path.resolve(__dirname,'..'));
 for(const c of v.checks)console.log(`${c.ok?'PASS':'FAIL'} V1037 ${c.name}`);
 if(!v.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1037};
