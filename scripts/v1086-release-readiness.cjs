#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1086(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8'),exists=f=>fs.existsSync(path.join(root,f));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const v=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0);
  add('release',v>=1086&&pkg.sonicFeatureRelease==='v'+v&&pkg.sonicRoadmapRelease==='v'+v);
  add('lock',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  add('engine',pkg.engines?.node==='24.x');
  add('prebuild',pkg.scripts.prebuild.includes('npm run test:v1086 && npm run test:v1086:types &&'));
  add('test',pkg.scripts['test:v1086']==='node tests/v1086-epic-stage-transformation-regression.cjs');
  add('types',pkg.scripts['test:v1086:types']==='tsc -p tests/tsconfig.v1086-core.json --noEmit');
  for(const f of ['lib/arena360EpicStageTransformationV1086.ts','tests/v1086-epic-stage-transformation-regression.cjs',
    'tests/tsconfig.v1086-core.json','scripts/v1086-release-readiness.cjs',
    'changelog/V1086-EPIC-STAGE-TRANSFORMATION-4.md'])add('file:'+f,exists(f));
  const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
  add('plan',stage.includes('planEpicStageTransformationV1086({'));
  add('compose',stage.includes('coordinateEpicStageTransformationV1086('));
  for(const channel of ['architecture','laser','led','holograms','projection'])
   add('render:'+channel,stage.includes('epicTransformedV1086.'+channel));
  const ui=read('components/visualizer/ArenaShowDesignerPanelV1040.tsx');
  add('panel',ui.includes('arena-v1086-epic-stage-transformation'));
  add('clear-all',ui.includes('arenaEpicTransformationEnabledV1086:false'));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaEpicTransformationEnabledV1086:false'));
  add('plumbing',read('components/visualizer/ThreeAvatar.tsx').includes('epicTransformationModeV1086={props.arenaEpicTransformationModeV1086'));
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1086-epic-stage-transformation-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1086-epic-stage-transformation-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1086(root)'));
  add('architecture',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1086);
 }catch(e){console.error('V1086 readiness',e);add('readable',false)}
 return {passed:checks.length>=24&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1086(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1086 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1086};
