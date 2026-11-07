#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1072(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const v=/^0\.1\.0-v(\d+)$/.exec(p.version||''),num=Number(v?.[1]);
  add('version',num>=1072&&p.sonicRoadmapRelease==='v'+num&&p.sonicFeatureRelease==='v'+num);
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.includes('npm run test:v1072 && npm run test:v1072:types &&'));
  add('focused',p.scripts['verify:v1072:focused']?.includes('verify:v1071:focused'));
  add('test-command',p.scripts['test:v1072']==='node tests/v1072-concert-camera-director-regression.cjs');
  for(const file of ['lib/arena360ConcertCameraDirectorV1072.ts',
   'tests/v1072-concert-camera-director-regression.cjs','tests/tsconfig.v1072-core.json',
   'scripts/v1072-release-readiness.cjs','changelog/V1072-CONCERT-CAMERA-DIRECTOR-4.md'])
   add('file:'+file,exists(file));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaCameraDirectorEnabledV1072:false'));
  add('public-type',read('types/music.ts').includes('arenaCameraDirectorStrengthV1072'));
  add('component-type',read('components/visualizer/registry.tsx').includes('arenaCameraDirectorStrengthV1072'));
  add('stage-prop',read('components/visualizer/VisualizerStage.tsx').includes('arenaCameraDirectorEnabledV1072='));
  add('ui',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1072 · Concert Camera Director 4.0'));
  add('cast',read('components/visualizer/ThreeAvatar.tsx').includes('concertCameraV1072=planConcertCameraDirectorV1072('));
  for(const file of ['components/visualizer/StageCameraDirectorV289.tsx',
   'components/visualizer/SmartStageCameraV236.tsx'])
   add('camera:'+file,read(file).includes('composeConcertCameraDirectorV1072('));
  add('manual-protection',read('components/visualizer/StageCameraDirectorV289.tsx').includes('flyoverProtectedV1033||!automaticShot'));
  const logic=read('lib/arena360ConcertCameraDirectorV1072.ts');
  add('no-hardware',!/(?:\bfetch\(|Math\.random\(|Date\.now\(|setInterval\(|setTimeout\(|new WebSocket\(|localStorage)/.test(logic));
  add('no-new-draw',!read('components/visualizer/ThreeAvatar.tsx').includes('name="v1072-extra'));
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1072-concert-camera-director-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1072-concert-camera-director-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1072(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1072);
 }catch(e){console.error('V1072 readiness:',e.message);add('readable',false);}
 return {passed:checks.length>=25&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1072(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1072 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1072};
