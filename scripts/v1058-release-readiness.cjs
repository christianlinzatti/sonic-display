#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1058(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const version=/^0\.1\.0-v(\d+)$/.exec(p.version||'');
  add('metadata',!!version&&Number(version[1])>=1058&&p.sonicRoadmapRelease==='v'+version[1]&&p.sonicFeatureRelease==='v'+version[1]);
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('Node24',p.engines?.node==='24.x');
  add('prebuild first',p.scripts.prebuild.includes('npm run test:v1058 && npm run test:v1058:types && npm run test:v1057'));
  add('previous focused tests',p.scripts['verify:v1058:focused'].includes('verify:v1057:focused'));
  for(const f of ['lib/arena360VolumetricLightingV1058.ts','tests/v1058-volumetric-light-regression.cjs',
   'tests/tsconfig.v1058-core.json','scripts/v1058-release-readiness.cjs',
   'changelog/V1058-VOLUMETRIC-LIGHT-EXPERIENCE.md'])add('file '+f,exists(f));
  add('default off',read('context/UiPreferencesContext.tsx').includes('arenaVolumetricLightingEnabledV1058:false'));
  add('typed preference',read('types/music.ts').includes('arenaVolumetricLightingStrengthV1058'));
  add('typed prop',read('components/visualizer/registry.tsx').includes('arenaVolumetricLightingStrengthV1058'));
  add('UI',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1058 · Volumetric Light Experience'));
  add('visualizer',read('components/visualizer/VisualizerStage.tsx').includes('arenaVolumetricLightingEnabledV1058'));
  add('stage prop',read('components/visualizer/stages/index.tsx').includes('volumetricLightingEnabledV1058={volumetricLightingEnabledV1058}'));
  add('stage planner',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('planVolumetricLightingV1058('));
  add('two existing cones',read('components/visualizer/stages/ArenaLightsV1032.tsx').includes('showVolumeShader ? <shaderMaterial'));
  add('existing fog',read('components/visualizer/stages/ArenaLowFogV1036.tsx').includes('volume?.fogTint'));
  add('production gate',read('scripts/v931-production-gate.cjs').includes('tests/v1058-volumetric-light-regression.cjs'));
  add('Vercel gate',read('scripts/vercel-production-build.cjs').includes('tests/v1058-volumetric-light-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1058'));
  add('documentation',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1058);
  add('no side effects',!/(fetch\(|setTimeout\(|setInterval\(|Math\.random\(|new SpotLight|WebSocket\(|Date\.now\(|localStorage)/.test(read('lib/arena360VolumetricLightingV1058.ts')));
 }catch(error){console.error('V1058 release inspection:',error.message);add('source readable',false);}
 return {checks,passed:checks.length>=23&&checks.every(c=>c.ok)};
}
if(require.main===module){const r=inspectReleaseV1058(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log((c.ok?'PASS':'FAIL')+' V1058 '+c.name);
 if(!r.passed)process.exitCode=1;}
module.exports={inspectReleaseV1058};
