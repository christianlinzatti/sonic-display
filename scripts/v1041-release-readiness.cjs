#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1041(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8'),exists=f=>fs.existsSync(path.join(root,f));
 try{
  const p=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const version=Number(/^0\.1\.0-v(\d+)$/.exec(p.version)?.[1]);
  add('version',version>=1041&&p.sonicRoadmapRelease===`v${version}`&&p.sonicFeatureRelease===`v${version}`);
  add('lockfile',p.version===lock.version&&p.version===lock.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.startsWith(`npm run test:${p.sonicFeatureRelease} &&`)&&
   p.scripts.prebuild.includes('npm run test:v1041 && npm run test:v1041:types && npm run test:v1040'));
  add('scripts',p.scripts['test:v1041']==='node tests/v1041-arena-choreography-regression.cjs'&&
   p.scripts['test:v1041:types']==='tsc -p tests/tsconfig.v1041-core.json --noEmit');
  for(const f of ['lib/arena360ChoreographyV1041.ts','components/visualizer/ThreeAvatar.tsx',
   'components/visualizer/DanceFormationActorsV492.tsx','components/visualizer/VisualizerStage.tsx',
   'components/visualizer/registry.tsx','components/visualizer/ArenaShowDesignerPanelV1040.tsx',
   'types/music.ts','context/UiPreferencesContext.tsx','tests/v1041-arena-choreography-regression.cjs',
   'tests/tsconfig.v1041-core.json','changelog/V1041-INTELLIGENT-AVATAR-CHOREOGRAPHY-DIRECTOR.md',
   '.github/workflows/v1041-intelligent-avatar-choreography-validation.yml'])add('file:'+f,exists(f));
  add('v1041-source-connected',read('components/visualizer/ThreeAvatar.tsx').includes('planArenaChoreographyV1041')&&
   read('components/visualizer/DanceFormationActorsV492.tsx').includes('arenaWeightV1041'));
  add('opt-in-default',read('context/UiPreferencesContext.tsx').includes('arenaChoreographyEnabledV1041:false'));
  add('production-gates',read('scripts/v931-production-gate.cjs').includes('tests/v1041-arena-choreography-regression.cjs')&&
   read('scripts/vercel-production-build.cjs').includes('tests/v1041-arena-choreography-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1041(root)'));
  add('central-ci-only',!read('.github/workflows/v1041-intelligent-avatar-choreography-validation.yml').includes('  push:')&&
   !read('.github/workflows/v1032-live-arena-validation.yml').includes('  push:'));
  add('manual-cross-platform',read('.github/workflows/v1041-intelligent-avatar-choreography-validation.yml').includes('ubuntu-24.04, windows-latest'));
  add('previous-regressions',read('.github/workflows/v1032-live-arena-validation.yml').includes('npm run test:v1041')&&
   read('.github/workflows/v1032-live-arena-validation.yml').includes('npm run test:v1040'));
  add('type-palette-fix',read('components/visualizer/DynamicStage.tsx').includes('arena360: {base:'));
  add('safe-long-archives',read('scripts/vercel-ignore-upload.cjs').includes('ZIP_ONLY'));
  add('no-unverified-ai',!read('lib/arena360ChoreographyV1041.ts').includes('fetch('));
 }catch(error){console.error('V1041 release failure:',error.message);add('read-source',false)}
 return {passed:checks.length>=25&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1041(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1041 ${c.name}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1041};
