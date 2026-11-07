#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1062(root){
 const checks=[],check=(id,value)=>checks.push({id,ok:Boolean(value)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const match=/^0\.1\.0-v(\d+)$/.exec(pkg.version||'');
  check('version',!!match&&Number(match[1])>=1062&&
   pkg.sonicRoadmapRelease==='v'+match[1]&&pkg.sonicFeatureRelease==='v'+match[1]);
  check('lockfile',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  check('node24',pkg.engines?.node==='24.x');
  check('prebuild',pkg.scripts.prebuild.startsWith('npm run test:v1062 && npm run test:v1062:types &&'));
  check('focused',pkg.scripts['verify:v1062:focused'].includes('verify:v1061:focused'));
  for(const f of ['lib/advancedRapPerformanceV1062.ts',
   'tests/v1062-advanced-rap-performance-regression.cjs','tests/tsconfig.v1062-core.json',
   'scripts/v1062-release-readiness.cjs','changelog/V1062-ADVANCED-RAP-PERFORMANCE-7.md'])check('file:'+f,exists(f));
  check('default-off',read('context/UiPreferencesContext.tsx').includes('arenaRapPerformanceEnabledV1062:false'));
  check('preferences',read('types/music.ts').includes('arenaRapPerformanceStrengthV1062'));
  check('props',read('components/visualizer/registry.tsx').includes('arenaRapPerformanceStrengthV1062'));
  check('stage',read('components/visualizer/VisualizerStage.tsx').includes('arenaRapPerformanceEnabledV1062'));
  check('ui',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1062 · Advanced Rap Performance 7.0'));
  check('gltf',read('components/visualizer/GltfDancerAvatarV492.tsx').includes('arenaRapPerformanceStrengthV1062'));
  check('gestures',read('components/visualizer/useGltfVocalMotionV492.ts').includes('refineRapGestureV1062('));
  check('lips',read('components/visualizer/VocalRigV368.tsx').includes('rapMouthRateV1062('));
  check('face',read('components/visualizer/VocalRigV368.tsx').includes('rapFaceAccentV1062('));
  check('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1062-advanced-rap-performance-regression.cjs'));
  check('production',read('scripts/v931-production-gate.cjs').includes('tests/v1062-advanced-rap-performance-regression.cjs'));
  check('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1062(root)'));
  check('documentation',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1062);
  check('pure',!/(fetch\(|Math\.random\(|setTimeout\(|setInterval\(|WebSocket\(|localStorage)/.test(read('lib/advancedRapPerformanceV1062.ts')));
 }catch(e){console.error('V1062 release readiness',e.message);check('readable',false);}
 return {checks,passed:checks.length>=24&&checks.every(x=>x.ok)};
}
if(require.main===module){const result=inspectReleaseV1062(path.resolve(__dirname,'..'));
 for(const c of result.checks)console.log((c.ok?'PASS':'FAIL')+' V1062 '+c.id);
 if(!result.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1062};
