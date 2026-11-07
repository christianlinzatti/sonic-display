#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1068(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const v=/^0\.1\.0-v(\d+)$/.exec(p.version||''),num=Number(v?.[1]);
  add('version',num>=1068&&p.sonicRoadmapRelease==='v'+num&&p.sonicFeatureRelease==='v'+num);
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.startsWith('npm run test:v'+num+' && npm run test:v'+num+':types &&'));
  add('focused',p.scripts['verify:v1068:focused']?.includes('verify:v1067:focused'));
  add('test-command',p.scripts['test:v1068']==='node tests/v1068-holographic-concert-regression.cjs');
  for(const f of ['lib/arena360HolographicConcertV1068.ts','tests/v1068-holographic-concert-regression.cjs',
   'tests/tsconfig.v1068-core.json','scripts/v1068-release-readiness.cjs',
   'changelog/V1068-HOLOGRAPHIC-CONCERT-FX-3.md'])add('file:'+f,exists(f));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaHolographicConcertEnabledV1068:false'));
  add('public-type',read('types/music.ts').includes('arenaHolographicConcertStrengthV1068'));
  add('component-type',read('components/visualizer/registry.tsx').includes('arenaHolographicConcertStrengthV1068'));
  add('stage-prop',read('components/visualizer/VisualizerStage.tsx').includes('arenaHolographicConcertEnabledV1068='));
  add('ui',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1068 · Holographic Concert FX 3.0'));
  add('one-frame',(read('components/visualizer/stages/ArenaHologramPortalsV1039.tsx').match(/useFrame\(/g)||[]).length===1);
  add('silhouettes',read('components/visualizer/stages/ArenaHologramPortalsV1039.tsx').includes('instancedMesh ref={echoes}'));
  add('gpu-dispose',read('components/visualizer/stages/ArenaHologramPortalsV1039.tsx').includes('silhouetteGeometry.dispose()'));
  add('stage-sync',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('floatCueV1067:floatingExperienceV1067'));
  add('manual',read('lib/arena360HolographicConcertV1068.ts').includes("input.portalPattern!=='auto'"));
  add('fixed-cast-floor',read('components/visualizer/stages/Arena360StageV1031.tsx').indexOf('<ArenaHologramPortalsV1039')<read('components/visualizer/stages/Arena360StageV1031.tsx').indexOf('ref={turntable}'));
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1068-holographic-concert-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1068-holographic-concert-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1068(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1068);
  add('pure',!/(fetch\(|Math\.random\(|Date\.now\(|setInterval\(|setTimeout\(|WebSocket\(|localStorage)/.test(read('lib/arena360HolographicConcertV1068.ts')));
 }catch(e){console.error('V1068 readiness:',e.message);add('readable',false);}
 return {passed:checks.length>=25&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1068(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1068 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1068};
