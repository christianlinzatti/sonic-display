#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1044(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const exists=f=>fs.existsSync(path.join(root,f));
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const ver=Number(/^0\.1\.0-v(\d+)$/.exec(p.version)?.[1]||0);
  add('version',ver>=1044&&p.sonicFeatureRelease==='v'+ver&&p.sonicRoadmapRelease==='v'+ver);
  add('lock',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('scripts',p.scripts['test:v1044']==='node tests/v1044-concert-transitions-regression.cjs'&&
   p.scripts['test:v1044:types']==='tsc -p tests/tsconfig.v1044-core.json --noEmit');
  add('prebuild',p.scripts.prebuild.startsWith('npm run test:'+p.sonicFeatureRelease+' &&')&&
   p.scripts.prebuild.includes('npm run test:v1044 && npm run test:v1044:types && npm run test:v1043'));
  for(const f of ['lib/arena360TransitionsV1044.ts','components/visualizer/ThreeAvatar.tsx',
   'components/visualizer/stages/Arena360StageV1031.tsx',
   'components/visualizer/stages/index.tsx','components/visualizer/VisualizerStage.tsx',
   'components/visualizer/registry.tsx','components/visualizer/ArenaShowDesignerPanelV1040.tsx',
   'components/GoveeMusicSyncV909.tsx','context/UiPreferencesContext.tsx','types/music.ts',
   'tests/v1044-concert-transitions-regression.cjs','tests/tsconfig.v1044-core.json',
   '.github/workflows/v1044-intelligent-concert-transitions-validation.yml',
   'changelog/V1044-INTELLIGENT-CONCERT-TRANSITIONS.md'])add('file:'+f,exists(f));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaTransitionsEnabledV1044:false'));
  add('shared-clock',['ThreeAvatar.tsx','stages/Arena360StageV1031.tsx'].every(f=>
   read('components/visualizer/'+f).includes('planArenaTransitionsV1044'))&&
   read('components/GoveeMusicSyncV909.tsx').includes('planArenaTransitionsV1044'));
  add('gates',read('scripts/v931-production-gate.cjs').includes('tests/v1044-concert-transitions-regression.cjs')&&
   read('scripts/vercel-production-build.cjs').includes('tests/v1044-concert-transitions-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1044(root)'));
  add('manual-only',!read('.github/workflows/v1044-intelligent-concert-transitions-validation.yml').includes('  push:'));
  add('shared-arena',read('.github/workflows/v1032-live-arena-validation.yml').includes('npm run test:v1044'));
 }catch(e){console.error('V1044 readiness:',e.message);add('read-source',false)}
 return {passed:checks.length>=21&&checks.every(x=>x.ok),checks};
}
if(require.main===module){const v=inspectReleaseV1044(path.resolve(__dirname,'..'));
 for(const c of v.checks)console.log((c.ok?'PASS':'FAIL')+' V1044 '+c.name);
 if(!v.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1044};
