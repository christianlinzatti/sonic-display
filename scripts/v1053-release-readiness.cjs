#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1053(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:Boolean(ok)}),
 read=f=>fs.readFileSync(path.join(root,f),'utf8'),exists=f=>fs.existsSync(path.join(root,f));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json')),
   v=p.version.match(/^0\.1\.0-v(\d+)$/);
  add('version',!!v&&Number(v[1])>=1053&&p.sonicRoadmapRelease==='v'+v[1]&&p.sonicFeatureRelease==='v'+v[1]);
  add('lock',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('Node24',p.engines?.node==='24.x');
  add('prebuild order',p.scripts.prebuild.includes('npm run test:v1053 && npm run test:v1053:types && npm run test:v1052'));
  add('old regression tests retained',p.scripts['verify:v1053:focused'].includes('verify:v1052:focused'));
  for(const f of ['lib/arena360CinematicCameraV1053.ts','tests/v1053-cinematic-camera-regression.cjs',
   'tests/tsconfig.v1053-core.json','changelog/V1053-INTELLIGENT-CONCERT-CAMERA.md'])add('file '+f,exists(f));
  for(const f of ['components/visualizer/StageCameraDirectorV289.tsx','components/visualizer/SmartStageCameraV236.tsx'])
   add('camera '+f,read(f).includes('composeArenaCinematicCameraV1053('));
  add('avatar planner',read('components/visualizer/ThreeAvatar.tsx').includes('planArenaCinematicCameraV1053('));
  add('settings',read('context/UiPreferencesContext.tsx').includes('arenaCinematicCameraEnabledV1053:false'));
  add('types',read('types/music.ts').includes('arenaCinematicCameraEnabledV1053'));
  add('UI',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1053 · Intelligent Concert Camera Experience 2.0'));
  add('Vercel regression',read('scripts/vercel-production-build.cjs').includes('tests/v1053-cinematic-camera-regression.cjs'));
  add('production regression',read('scripts/v931-production-gate.cjs').includes('tests/v1053-cinematic-camera-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1053'));
 }catch(error){console.error(error);add('readable',false);}
 return {checks,passed:checks.length>=17&&checks.every(c=>c.ok)};
}
if(require.main===module){const result=inspectReleaseV1053(path.resolve(__dirname,'..'));
 for(const c of result.checks)console.log((c.ok?'PASS':'FAIL')+' V1053 '+c.name);
 if(!result.passed)process.exitCode=1;}
module.exports={inspectReleaseV1053};
