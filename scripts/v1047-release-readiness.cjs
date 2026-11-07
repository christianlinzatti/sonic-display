#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1047(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:!!ok});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const p=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const current=Number(/^0\.1\.0-v(\d+)$/.exec(p.version)?.[1]);
  add('version',current>=1047&&p.sonicRoadmapRelease==='v'+current&&p.sonicFeatureRelease==='v'+current);
  add('lockfile',lock.version===p.version&&lock.packages?.['']?.version===p.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.includes('npm run test:v1047 && npm run test:v1047:types && npm run test:v1046'));
  add('focused',p.scripts['verify:v1047:focused'].includes('verify:v1046:focused'));
  for(const f of ['lib/arena360ImmersiveArenaV1047.ts',
   'components/visualizer/stages/ArenaImmersiveExperienceV1047.tsx',
   'components/visualizer/stages/Arena360StageV1031.tsx',
   'components/visualizer/stages/index.tsx','components/visualizer/ThreeAvatar.tsx',
   'components/visualizer/VisualizerStage.tsx','components/visualizer/registry.tsx',
   'components/visualizer/StageCameraDirectorV289.tsx',
   'components/visualizer/SmartStageCameraV236.tsx',
   'components/visualizer/ArenaShowDesignerPanelV1040.tsx',
   'types/music.ts','context/UiPreferencesContext.tsx',
   'tests/v1047-immersive-arena-regression.cjs','tests/tsconfig.v1047-core.json',
   'changelog/V1047-IMMERSIVE-ARENA-EXPERIENCE-3.md',
   '.github/workflows/v1047-immersive-arena-validation.yml'])add('file:'+f,exists(f));
  add('optin',read('context/UiPreferencesContext.tsx').includes('arenaImmersiveEnabledV1047:false'));
  const v=read('components/visualizer/stages/ArenaImmersiveExperienceV1047.tsx');
  add('gpu-batches',v.includes('instancedMesh')&&v.includes('args={[undefined,undefined,24]}')&&v.includes('args={[undefined,undefined,12]}'));
  add('manual-camera',read('components/visualizer/StageCameraDirectorV289.tsx').includes('composeArenaImmersiveCameraV1047')&&
   read('components/visualizer/SmartStageCameraV236.tsx').includes('composeArenaImmersiveCameraV1047'));
  add('ci',read('scripts/v931-production-gate.cjs').includes('tests/v1047-immersive-arena-regression.cjs')&&
   read('scripts/vercel-production-build.cjs').includes('tests/v1047-immersive-arena-regression.cjs'));
 }catch(e){console.error('V1047 readiness:',e.message);add('readable',false);}
 return {checks,passed:checks.length>=24&&checks.every(x=>x.ok)};
}
if(require.main===module){const r=inspectReleaseV1047(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1047 ${c.name}`);
 if(!r.passed)process.exitCode=1;}
module.exports={inspectReleaseV1047};
