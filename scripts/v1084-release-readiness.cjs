#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1084(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8'),exists=f=>fs.existsSync(path.join(root,f));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const v=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0);
  add('release',v>=1084&&pkg.sonicFeatureRelease==='v'+v&&pkg.sonicRoadmapRelease==='v'+v);
  add('lock',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  add('engine',pkg.engines?.node==='24.x');
  add('prebuild',pkg.scripts.prebuild.includes('npm run test:v1084 && npm run test:v1084:types &&'));
  add('test',pkg.scripts['test:v1084']==='node tests/v1084-festival-atmosphere-regression.cjs');
  add('types',pkg.scripts['test:v1084:types']==='tsc -p tests/tsconfig.v1084-core.json --noEmit');
  for(const f of ['lib/arena360FestivalAtmosphereV1084.ts','components/visualizer/stages/ArenaFestivalAtmosphereV1084.tsx',
   'tests/v1084-festival-atmosphere-regression.cjs','tests/tsconfig.v1084-core.json',
   'scripts/v1084-release-readiness.cjs','changelog/V1084-FESTIVAL-ATMOSPHERE-FX.md'])add('file:'+f,exists(f));
  const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
  add('stage-planner',stage.includes('planFestivalAtmosphereV1084({'));
  add('observed-drop',stage.includes('observedSection:section'));
  add('renderer',stage.includes('<ArenaFestivalAtmosphereV1084'));
  add('fog-integration',read('components/visualizer/stages/ArenaLowFogV1036.tsx').includes('festivalCueV1084?.active'));
  add('manual-fog',stage.includes('fogEnabled:groundFogEnabled'));
  add('pooled', (read('components/visualizer/stages/ArenaFestivalAtmosphereV1084.tsx').match(/<instancedMesh\b/g)||[]).length===3);
  add('default-disabled',read('context/UiPreferencesContext.tsx').includes('arenaFestivalFxEnabledV1084:false'));
  add('clear-all',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('arenaFestivalFxEnabledV1084:false'));
  add('production-gate',read('scripts/v931-production-gate.cjs').includes('tests/v1084-festival-atmosphere-regression.cjs'));
  add('vercel-gate',read('scripts/vercel-production-build.cjs').includes('tests/v1084-festival-atmosphere-regression.cjs'));
  add('source-preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1084(root)'));
  add('documentation',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1084);
 }catch(e){console.error('V1084 readiness',e);add('readable',false);}
 return {passed:checks.length>=24&&checks.every(x=>x.ok),checks};
}
if(require.main===module){let r=inspectReleaseV1084(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1084 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1084};
