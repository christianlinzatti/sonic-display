#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1043(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8'),exists=f=>fs.existsSync(path.join(root,f));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const match=/^0\.1\.0-v(\d+)$/.exec(p.version),v=Number(match?.[1]??0);
  add('version',v>=1043&&p.sonicFeatureRelease==='v'+v&&p.sonicRoadmapRelease==='v'+v);
  add('lock',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.startsWith('npm run test:'+p.sonicFeatureRelease+' &&')&&
   p.scripts.prebuild.includes('npm run test:v1043 && npm run test:v1043:types && npm run test:v1042'));
  add('script-tests',p.scripts['test:v1043']==='node tests/v1043-show-camera-regression.cjs'&&
   p.scripts['test:v1043:types']==='tsc -p tests/tsconfig.v1043-core.json --noEmit');
  for(const file of ['lib/arena360ShowCameraV1043.ts',
   'components/visualizer/StageCameraDirectorV289.tsx','components/visualizer/SmartStageCameraV236.tsx',
   'components/visualizer/ThreeAvatar.tsx','components/visualizer/VisualizerStage.tsx',
   'components/visualizer/ArenaShowDesignerPanelV1040.tsx','components/visualizer/registry.tsx',
   'context/UiPreferencesContext.tsx','types/music.ts',
   'tests/v1043-show-camera-regression.cjs','tests/tsconfig.v1043-core.json',
   'changelog/V1043-INTELLIGENT-SHOW-CAMERA-DIRECTOR.md',
   '.github/workflows/v1043-show-camera-validation.yml'])add('file:'+file,exists(file));
  add('opt-in-off',read('context/UiPreferencesContext.tsx').includes('arenaShowCameraEnabledV1043:false'));
  add('existing-cameras',['StageCameraDirectorV289','SmartStageCameraV236'].every(x=>
   read('components/visualizer/'+x+'.tsx').includes('composeArenaShowCameraV1043')));
  add('no-second-timer',!['fetch(','setTimeout(','setInterval(','WebSocket('].some(x=>
   read('lib/arena360ShowCameraV1043.ts').includes(x)));
  add('controls',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('arenaShowCameraStrengthV1043'));
  add('gates',read('scripts/v931-production-gate.cjs').includes('tests/v1043-show-camera-regression.cjs')&&
   read('scripts/vercel-production-build.cjs').includes('tests/v1043-show-camera-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1043(root)'));
  add('manual-only',!read('.github/workflows/v1043-show-camera-validation.yml').includes('  push:')&&
   read('.github/workflows/v1032-live-arena-validation.yml').includes('npm run test:v1043'));
 }catch(err){console.error('V1043 readiness:',err.message);add('read-source',false)}
 return {passed:checks.length>=20&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const result=inspectReleaseV1043(path.resolve(__dirname,'..'));
 for(const c of result.checks)console.log((c.ok?'PASS':'FAIL')+' V1043 '+c.name);
 if(!result.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1043};
