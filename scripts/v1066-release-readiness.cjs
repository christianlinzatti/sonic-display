#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1066(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const v=/^0\.1\.0-v(\d+)$/.exec(p.version||''),num=Number(v?.[1]);
  add('version',num>=1066&&p.sonicFeatureRelease==='v'+num&&p.sonicRoadmapRelease==='v'+num);
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.startsWith('npm run test:v'+num+' && npm run test:v'+num+':types &&'));
  add('focused',p.scripts['verify:v1066:focused']?.includes('verify:v1065:focused'));
  add('test-command',p.scripts['test:v1066']==='node tests/v1066-transforming-stage-regression.cjs');
  for(const file of ['lib/arena360TransformingStageV1066.ts',
   'tests/v1066-transforming-stage-regression.cjs','tests/tsconfig.v1066-core.json',
   'scripts/v1066-release-readiness.cjs','changelog/V1066-TRANSFORMING-STAGE-3.md'])
    add('file:'+file,exists(file));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaTransformingStageEnabledV1066:false'));
  add('type',read('types/music.ts').includes('arenaTransformingStageStrengthV1066'));
  add('props',read('components/visualizer/registry.tsx').includes('arenaTransformingStageStrengthV1066'));
  add('stage-props',read('components/visualizer/VisualizerStage.tsx').includes('arenaTransformingStageEnabledV1066='));
  add('ui',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1066 · Transforming Stage 3.0'));
  add('one-frame',read('components/visualizer/stages/ArenaTransformingDeckV1037.tsx').includes('stepStagePetalV1066('));
  add('fixed-floor',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('manualDeckMode:transformingDeckMode'));
  add('manual',read('lib/arena360TransformingStageV1066.ts').includes("input.manualDeckMode!=='auto'"));
  add('old-frame-owner',(read('components/visualizer/stages/ArenaTransformingDeckV1037.tsx').match(/useFrame\(/g)||[]).length===1);
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1066-transforming-stage-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1066-transforming-stage-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1066(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1066);
  add('pure',!/(fetch\(|Math\.random\(|Date\.now\(|setInterval\(|setTimeout\(|WebSocket\(|localStorage)/.test(read('lib/arena360TransformingStageV1066.ts')));
 }catch(e){console.error('V1066 release:',e.message);add('readable',false);}
 return {passed:checks.length>=25&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1066(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1066 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1066};
