#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1081(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const version=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0);
  add('version',version>=1081&&pkg.sonicRoadmapRelease==='v'+version&&pkg.sonicFeatureRelease==='v'+version);
  add('lockfile',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  add('node24',pkg.engines?.node==='24.x');
  add('prebuild',pkg.scripts.prebuild.startsWith('npm run test:v1081 && npm run test:v1081:types &&'));
  add('focused',pkg.scripts['verify:v1081:focused']?.includes('verify:v1080:focused'));
  add('test',pkg.scripts['test:v1081']==='node tests/v1081-holographic-dancers-regression.cjs');
  add('types',pkg.scripts['test:v1081:types']==='tsc -p tests/tsconfig.v1081-core.json --noEmit');
  for(const f of ['lib/arena360HolographicDancersV1081.ts','tests/v1081-holographic-dancers-regression.cjs',
   'tests/tsconfig.v1081-core.json','scripts/v1081-release-readiness.cjs',
   'changelog/V1081-HOLOGRAPHIC-DANCERS-2.md'])add('file:'+f,exists(f));
  const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
  add('stage-plan',stage.includes('planHolographicDancersV1081({'));
  add('flow-priority',stage.includes('baseHolograms:flowHologramsV1071'));
  add('holograms-opt-in',stage.includes('enabled:holographicDancersEnabledV1081&&holographicConcertEnabledV1068'));
  add('prop',stage.includes('dancerCueV1081={holographicDancersV1081}'));
  const render=read('components/visualizer/stages/ArenaHologramPortalsV1039.tsx');
  add('single-frame',(render.match(/useFrame\(/g)||[]).length===1);
  add('reuse',render.includes('sampleHolographicDancerV1081('));
  add('batch',render.includes('fixtures.length*2'));
  add('gpu-guard',render.includes("tier!=='low'&&concertCueV1068?.active&&dancerCueV1081?.active"));
  for(const file of ['types/music.ts','components/visualizer/registry.tsx',
   'context/UiPreferencesContext.tsx','components/visualizer/VisualizerStage.tsx',
   'components/visualizer/ThreeAvatar.tsx','components/visualizer/stages/index.tsx',
   'components/visualizer/ArenaShowDesignerPanelV1040.tsx'])
   add('ui:'+file,read(file).includes('HolographicDancers')||read(file).includes('holographicDancers'));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaHolographicDancersEnabledV1081:false'));
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1081-holographic-dancers-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1081-holographic-dancers-regression.cjs'));
  // Importer intentionally preserves .github workflows. Do not require a new workflow
  // filename or version-specific step: the updated V1080 gate and prebuild run V1081.
  const workflow=read('.github/workflows/v965-room-wave-production.yml');
  add('ci-stable',workflow.includes('npm run test:v1080 && npm run test:v1080:types')&&
    workflow.includes('Verify lockfile and cross-platform source names'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1081(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1081);
 }catch(e){console.error('V1081 readiness:',e.message);add('readable',false)}
 return {passed:checks.length>=28&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1081(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1081 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1081};
