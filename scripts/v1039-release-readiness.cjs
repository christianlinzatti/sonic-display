#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1039(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8'),exists=f=>fs.existsSync(path.join(root,f));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  add('version',Number(/^0\.1\.0-v(\d+)$/.exec(p.version)?.[1])>=1039&&p.sonicFeatureRelease===p.version.split('-')[1]&&p.sonicRoadmapRelease===p.version.split('-')[1]);
  add('lock',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.includes('npm run test:v1039 && npm run test:v1039:types && npm run test:v1038 &&')&&p.scripts.prebuild.startsWith(`npm run test:${p.sonicFeatureRelease} &&`));
  add('scripts',p.scripts['test:v1039']==='node tests/v1039-holographic-laser-regression.cjs'&&p.scripts['test:v1039:types']==='tsc -p tests/tsconfig.v1039-core.json');
  for(const f of ['lib/arena360HolographyV1039.ts','components/visualizer/stages/ArenaHologramPortalsV1039.tsx',
   'components/visualizer/stages/ArenaLaserTunnelsV1039.tsx','components/visualizer/stages/Arena360StageV1031.tsx',
   'components/visualizer/stages/index.tsx','components/visualizer/ThreeAvatar.tsx',
   'components/visualizer/VisualizerStage.tsx','components/visualizer/registry.tsx',
   'types/music.ts','context/UiPreferencesContext.tsx','components/SettingsPanel.tsx',
   'components/visualizer/StageThemeCardScene.tsx','tests/v1039-holographic-laser-regression.cjs',
   'tests/tsconfig.v1039-core.json','changelog/V1039-HOLOGRAPHIC-LASER-ARCHITECTURE.md',
   '.github/workflows/v1039-holographic-laser-validation.yml'])add('file:'+f,exists(f));
  add('gates',read('scripts/v931-production-gate.cjs').includes('tests/v1039-holographic-laser-regression.cjs')&&
   read('scripts/vercel-production-build.cjs').includes('tests/v1039-holographic-laser-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1039(root)'));
  add('ci-manual',!read('.github/workflows/v1039-holographic-laser-validation.yml').includes('  push:')&&
   !read('.github/workflows/v1032-live-arena-validation.yml').includes('  push:'));
  add('ci-tests',read('.github/workflows/v1032-live-arena-validation.yml').includes('npm run test:v1039')&&
   read('.github/workflows/v1039-holographic-laser-validation.yml').includes('npm run test:v1039'));
  add('v1038-palette-fix',read('components/visualizer/DynamicStage.tsx').includes('arena360: {base:'));
  const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
  add('world-fixtures',stage.indexOf('<ArenaHologramPortalsV1039')>=0&&stage.indexOf('<ArenaHologramPortalsV1039')<stage.indexOf('ref={turntable}')&&stage.indexOf('<ArenaLaserTunnelsV1039')<stage.indexOf('ref={turntable}'));
  add('ui-controls',['arenaHologramsEnabledV1039','arenaLaserArchitectureEnabledV1039','arenaHologramPatternV1039','arenaHologramStrengthV1039'].every(x=>read('components/SettingsPanel.tsx').includes(x)));
 }catch(error){console.error('V1039 release error:',error.message);add('read-source',false)}
 return {passed:checks.length>=26&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const v=inspectReleaseV1039(path.resolve(__dirname,'..'));
 for(const c of v.checks)console.log(`${c.ok?'PASS':'FAIL'} V1039 ${c.name}`);
 if(!v.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1039};
