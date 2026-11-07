#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1065(root){
 const checks=[],add=(id,passed)=>checks.push({id,ok:Boolean(passed)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8'),exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const match=/^0\.1\.0-v(\d+)$/.exec(pkg.version||''),ver=Number(match?.[1]);
  add('version',ver>=1065&&pkg.sonicFeatureRelease==='v'+ver&&pkg.sonicRoadmapRelease==='v'+ver);
  add('lockfile',lock.version===pkg.version&&lock.packages?.['']?.version===pkg.version);
  add('node24',pkg.engines?.node==='24.x');
  add('prebuild',pkg.scripts.prebuild.includes('npm run test:v1065 && npm run test:v1065:types &&'));
  add('focused',pkg.scripts['verify:v1065:focused']?.includes('verify:v1064:focused'));
  add('test-command',pkg.scripts['test:v1065']==='node tests/v1065-performance-director-regression.cjs');
  for(const file of ['lib/arena360PerformanceDirectorV1065.ts',
   'tests/v1065-performance-director-regression.cjs','tests/tsconfig.v1065-core.json',
   'scripts/v1065-release-readiness.cjs','changelog/V1065-AI-PERFORMANCE-DIRECTOR.md'])
   add('file:'+file,exists(file));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaPerformanceDirectorEnabledV1065:false'));
  add('types',read('types/music.ts').includes('arenaPerformanceDirectorStrengthV1065'));
  add('props',read('components/visualizer/registry.tsx').includes('arenaPerformanceDirectorStrengthV1065'));
  add('stage-props',read('components/visualizer/VisualizerStage.tsx').includes('arenaPerformanceDirectorEnabledV1065='));
  add('ui',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1065 · AI Performance Director'));
  add('one-clock',read('components/visualizer/ThreeAvatar.tsx').includes('planPerformanceDirectorV1065({'));
  add('camera',read('components/visualizer/ThreeAvatar.tsx').includes('stageInteractionV1055.cameraGain*performanceDirectorV1065.cameraGain'));
  add('dance',read('components/visualizer/ThreeAvatar.tsx').includes('performanceDirectorV1065.danceGain'));
  add('rap',read('components/visualizer/ThreeAvatar.tsx').includes('const dancerPropsV1065:VisualizerProps='));
  add('manual',read('components/visualizer/ThreeAvatar.tsx').includes('props.lipSync?.rapSyllableEditsEnabledV420===true'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1065-performance-director-regression.cjs'));
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1065-performance-director-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1065(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1065);
  add('pure',!/(fetch\(|Math\.random\(|Date\.now\(|setInterval\(|setTimeout\(|WebSocket\(|localStorage)/.test(read('lib/arena360PerformanceDirectorV1065.ts')));
 }catch(error){console.error('V1065 release gate:',error.message);add('readable',false);}
 return {checks,passed:checks.length>=24&&checks.every(x=>x.ok)};
}
if(require.main===module){const report=inspectReleaseV1065(path.resolve(__dirname,'..'));
 for(const check of report.checks)console.log(`${check.ok?'PASS':'FAIL'} V1065 ${check.id}`);
 if(!report.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1065};
