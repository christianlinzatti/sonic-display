#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1064(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const version=/^0\.1\.0-v(\d+)$/.exec(pkg.version||'');
  add('version',!!version&&Number(version[1])>=1064&&pkg.sonicFeatureRelease==='v'+version[1]&&pkg.sonicRoadmapRelease==='v'+version[1]);
  add('lockfile',lock.version===pkg.version&&lock.packages?.['']?.version===pkg.version);
  add('node24',pkg.engines?.node==='24.x');
  add('prebuild',pkg.scripts.prebuild.includes('npm run test:v1064 && npm run test:v1064:types &&'));
  add('focused',pkg.scripts['verify:v1064:focused']?.includes('verify:v1063:focused'));
  add('test-command',pkg.scripts['test:v1064']==='node tests/v1064-stage-movement-regression.cjs');
  for(const p of ['lib/arena360StageMovementV1064.ts','tests/v1064-stage-movement-regression.cjs',
  'tests/tsconfig.v1064-core.json','scripts/v1064-release-readiness.cjs',
  'changelog/V1064-INTELLIGENT-STAGE-MOVEMENT.md'])add('file:'+p,exists(p));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaStageMovementEnabledV1064:false'));
  add('ui',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1064 · Intelligent Stage Movement'));
  add('settings',read('types/music.ts').includes('arenaStageMovementStrengthV1064'));
  add('props',read('components/visualizer/registry.tsx').includes('arenaStageMovementStrengthV1064'));
  add('stage-props',read('components/visualizer/VisualizerStage.tsx').includes('arenaStageMovementEnabledV1064='));
  add('stage-link',read('components/visualizer/ThreeAvatar.tsx').includes('stageMovementV1064={planStageMovementV1064({'));
  add('ground-safety',read('components/visualizer/GroupDancersV326SceneV492.tsx').includes('routeGroundSafeV1064'));
  add('collision-safety',read('components/visualizer/GroupDancersV326SceneV492.tsx').includes('routeCollisionSafeV1064'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1064-stage-movement-regression.cjs'));
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1064-stage-movement-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1064(root)'));
  add('architecture',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1064);
  add('pure',!/(fetch\(|Math\.random\(|Date\.now\(|setInterval\(|setTimeout\(|WebSocket\(|localStorage)/.test(read('lib/arena360StageMovementV1064.ts')));
 }catch(e){console.error('V1064 readiness:',e.message);add('readable',false);}
 return {checks,passed:checks.length>=23&&checks.every(c=>c.ok)};
}
if(require.main===module){const result=inspectReleaseV1064(path.resolve(__dirname,'..'));
 for(const c of result.checks)console.log(`${c.ok?'PASS':'FAIL'} V1064 ${c.id}`);
 if(!result.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1064};
