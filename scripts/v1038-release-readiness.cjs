#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1038(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try {
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  add('version',p.version==='0.1.0-v1038'&&p.sonicFeatureRelease==='v1038'&&p.sonicRoadmapRelease==='v1038');
  add('lock',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('node',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.startsWith('npm run test:v1038 && npm run test:v1038:types && npm run test:v1037 &&'));
  add('scripts',p.scripts['test:v1038']==='node tests/v1038-floating-stage-regression.cjs'&&p.scripts['test:v1038:types']==='tsc -p tests/tsconfig.v1038-core.json');
  for(const f of ['lib/arena360FloatingStageV1038.ts','components/visualizer/stages/ArenaFloatingPlatformsV1038.tsx',
    'components/visualizer/stages/Arena360StageV1031.tsx','components/visualizer/stages/index.tsx',
    'components/visualizer/ThreeAvatar.tsx','components/visualizer/VisualizerStage.tsx',
    'components/visualizer/registry.tsx','types/music.ts','context/UiPreferencesContext.tsx','components/SettingsPanel.tsx',
    'components/visualizer/StageThemeCardScene.tsx','tests/v1038-floating-stage-regression.cjs',
    'tests/tsconfig.v1038-core.json','changelog/V1038-FLOATING-STAGE.md',
    '.github/workflows/v1038-floating-stage-validation.yml'])add('file:'+f,exists(f));
  add('production-gates',read('scripts/v931-production-gate.cjs').includes('tests/v1038-floating-stage-regression.cjs')&&
   read('scripts/vercel-production-build.cjs').includes('tests/v1038-floating-stage-regression.cjs'));
  add('source-preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1038(root)'));
  add('push-ci-reused',read('.github/workflows/v1032-live-arena-validation.yml').includes('npm run test:v1038')&&
   read('.github/workflows/v1032-live-arena-validation.yml').includes('lib/arena360FloatingStageV1038.ts'));
  add('no-extra-push',!read('.github/workflows/v1038-floating-stage-validation.yml').includes('  push:'));
  const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
  add('world-fixed-satellites',stage.indexOf('<ArenaFloatingPlatformsV1038')>=0&&
   stage.indexOf('<ArenaFloatingPlatformsV1038')<stage.indexOf('ref={turntable}'));
  add('settings',['arenaFloatingStageEnabledV1038','arenaFloatingStageModeV1038',
    'arenaFloatingStageIntensityV1038'].every(k=>read('components/SettingsPanel.tsx').includes(k)));
 }catch(error){console.error('V1038 release:',error.message);add('read-source',false);}
 return {passed:checks.length>=25&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const v=inspectReleaseV1038(path.resolve(__dirname,'..'));
 for(const c of v.checks)console.log(`${c.ok?'PASS':'FAIL'} V1038 ${c.name}`);
 if(!v.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1038};
