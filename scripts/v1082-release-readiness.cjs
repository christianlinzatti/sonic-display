#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1082(root){
 const checks=[],add=(id,passed)=>checks.push({id,ok:Boolean(passed)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  add('version',pkg.version==='0.1.0-v1082'&&pkg.sonicFeatureRelease==='v1082'&&pkg.sonicRoadmapRelease==='v1082');
  add('lockfile',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  add('node24',pkg.engines?.node==='24.x');
  add('prebuild',pkg.scripts.prebuild.startsWith('npm run test:v1082 && npm run test:v1082:types &&'));
  add('focused',pkg.scripts['verify:v1082:focused']?.includes('node scripts/v1082-release-readiness.cjs'));
  add('regression',pkg.scripts['test:v1082']==='node tests/v1082-stage-architecture-regression.cjs');
  add('typecheck',pkg.scripts['test:v1082:types']==='tsc -p tests/tsconfig.v1082-core.json --noEmit');
  for(const f of ['lib/arena360StageArchitectureV1082.ts',
   'components/visualizer/stages/ArenaDynamicArchitectureV1082.tsx',
   'tests/v1082-stage-architecture-regression.cjs','tests/tsconfig.v1082-core.json',
   'scripts/v1082-release-readiness.cjs','changelog/V1082-DYNAMIC-STAGE-ARCHITECTURE.md'])add('file:'+f,exists(f));
  const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
  add('stage-plan',stage.includes('planStageArchitectureV1082({'));
  add('safety-priority',stage.includes('manualDeckMode:transformingDeckMode'));
  add('observed-beats',stage.includes('beat:audio.beat,beatStrength:audio.beatStrength'));
  add('existing-show',stage.includes('strength:dynamicArchitectureStrengthV1082,show:showCueV1040'));
  add('scenic-root',stage.includes('<ArenaDynamicArchitectureV1082'));
  const renderer=read('components/visualizer/stages/ArenaDynamicArchitectureV1082.tsx');
  add('single-clock',(renderer.match(/useFrame\(/g)||[]).length===1);
  add('three-batches',(renderer.match(/<instancedMesh\b/g)||[]).length===3);
  add('quality-caps',renderer.includes("count=tier==='high'?8:tier==='balanced'?6:0"));
  add('no-gpu-leak',!renderer.includes('dispose={null}'));
  for(const f of ['types/music.ts','components/visualizer/registry.tsx',
   'context/UiPreferencesContext.tsx','components/visualizer/VisualizerStage.tsx',
   'components/visualizer/ThreeAvatar.tsx','components/visualizer/stages/index.tsx',
   'components/visualizer/ArenaShowDesignerPanelV1040.tsx'])
   add('ui:'+f,read(f).includes('DynamicArchitecture')||read(f).includes('dynamicArchitecture'));
  add('default-disabled',read('context/UiPreferencesContext.tsx').includes('arenaDynamicArchitectureEnabledV1082:false'));
  add('release-reset',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('arenaDynamicArchitectureEnabledV1082:false}'));
  add('production-gate',read('scripts/v931-production-gate.cjs').includes('tests/v1082-stage-architecture-regression.cjs'));
  add('vercel-gate',read('scripts/vercel-production-build.cjs').includes('tests/v1082-stage-architecture-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1082(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1082);
 }catch(e){console.error('V1082 readiness error',e);add('readable',false)}
 return {passed:checks.length>=30&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const result=inspectReleaseV1082(path.resolve(__dirname,'..'));
 for(const check of result.checks)console.log(`${check.ok?'PASS':'FAIL'} V1082 ${check.id}`);
 if(!result.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1082};
