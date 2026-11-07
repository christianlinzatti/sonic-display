#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1083(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=file=>fs.readFileSync(path.join(root,file),'utf8');
 const exists=file=>fs.existsSync(path.join(root,file));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const v=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0);
  add('release',v>=1083&&pkg.sonicFeatureRelease==='v'+v&&pkg.sonicRoadmapRelease==='v'+v);
  add('lockfile',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  add('engine',pkg.engines?.node==='24.x');
  add('prebuild',pkg.scripts.prebuild.includes('npm run test:v1083 && npm run test:v1083:types &&'));
  add('test',pkg.scripts['test:v1083']==='node tests/v1083-advanced-led-wall-regression.cjs');
  add('typecheck',pkg.scripts['test:v1083:types']==='tsc -p tests/tsconfig.v1083-core.json --noEmit');
  for(const f of ['lib/arena360LedWallExperienceV1083.ts','components/visualizer/stages/ArenaLedLyricsV1083.tsx',
    'tests/v1083-advanced-led-wall-regression.cjs','tests/tsconfig.v1083-core.json',
    'scripts/v1083-release-readiness.cjs','changelog/V1083-ADVANCED-LED-WALL-5.md'])add('file:'+f,exists(f));
  const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
  add('stage-planner',stage.includes('planLedWallExperienceV1083({'));
  add('old-wall-priority',stage.includes('manualPattern:ledWallPatternV1059'));
  add('base-cue',stage.includes('baseCue:flowLedV1071'));
  add('real-lyrics',read('components/visualizer/ThreeAvatar.tsx').includes('currentSyncedLedLyricV1083(props.lyricsScene?.lyrics'));
  add('reused-pixels',read('components/visualizer/stages/ArenaLedWallV1059.tsx').includes('sampleLedWallExperienceV1083('));
  add('gpu-budget',(read('components/visualizer/stages/ArenaLedWallV1059.tsx').match(/<instancedMesh\b/g)||[]).length===1);
  add('texture-disposal',read('components/visualizer/stages/ArenaLedLyricsV1083.tsx').includes('tex.dispose()'));
  add('default-disabled',read('context/UiPreferencesContext.tsx').includes('arenaAdvancedLedEnabledV1083:false'));
  add('clear-button',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('arenaAdvancedLedEnabledV1083:false}'));
  add('production-gate',read('scripts/v931-production-gate.cjs').includes('tests/v1083-advanced-led-wall-regression.cjs'));
  add('vercel-gate',read('scripts/vercel-production-build.cjs').includes('tests/v1083-advanced-led-wall-regression.cjs'));
  add('source-preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1083(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1083);
 }catch(e){console.error('V1083 readiness:',e);add('readable',false);}
 return {passed:checks.length>=24&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1083(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1083 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1083};
