#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1060(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:!!ok});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const v=/^0\.1\.0-v(\d+)$/.exec(pkg.version||'');
  add('version metadata',!!v&&Number(v[1])>=1060&&pkg.sonicFeatureRelease==='v'+v[1]&&pkg.sonicRoadmapRelease==='v'+v[1]);
  add('lockfile',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  add('node24',pkg.engines?.node==='24.x');
  add('prebuild first',pkg.scripts.prebuild.includes('npm run test:v1060 && npm run test:v1060:types && npm run test:v1059'));
  add('focused chain',pkg.scripts['verify:v1060:focused'].includes('verify:v1059:focused'));
  for(const f of ['lib/arena360LightingChoreographerV1060.ts','tests/v1060-lighting-choreographer-regression.cjs',
   'tests/tsconfig.v1060-core.json','scripts/v1060-release-readiness.cjs',
   'changelog/V1060-AI-LIGHTING-CHOREOGRAPHER.md'])add('file '+f,exists(f));
  add('default disabled',read('context/UiPreferencesContext.tsx').includes('arenaLightingChoreographerEnabledV1060:false'));
  add('typed preferences',read('types/music.ts').includes('arenaLightingChoreographerStrengthV1060'));
  add('typed props',read('components/visualizer/registry.tsx').includes('arenaLightingChoreographerStrengthV1060'));
  add('UI',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1060 · AI Lighting Choreographer'));
  add('visualizer',read('components/visualizer/VisualizerStage.tsx').includes('arenaLightingChoreographerEnabledV1060'));
  add('stage prop',read('components/visualizer/stages/index.tsx').includes('lightingChoreographerEnabledV1060={lightingChoreographerEnabledV1060}'));
  add('stage planner',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('planLightingChoreographerV1060('));
  add('four optical channels', ['coordinatedSpotsV1060','coordinatedLasersV1060','coordinatedVolumeV1060','coordinatedLedV1060'].every(x=>read('components/visualizer/stages/Arena360StageV1031.tsx').includes(x)));
  add('previous lights unchanged',read('components/visualizer/stages/ArenaLightsV1032.tsx').includes('<spotLight'));
  add('CI',read('scripts/v931-production-gate.cjs').includes('tests/v1060-lighting-choreographer-regression.cjs'));
  add('Vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1060-lighting-choreographer-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1060'));
  add('documentation',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1060);
  add('pure planner',!/(fetch\(|setTimeout\(|setInterval\(|Math\.random\(|new SpotLight|WebSocket\(|Date\.now\(|localStorage)/.test(read('lib/arena360LightingChoreographerV1060.ts')));
 }catch(e){console.error('V1060 readiness:',e.message);add('readable',false);}
 return {checks,passed:checks.length>=24&&checks.every(c=>c.ok)};
}
if(require.main===module){const r=inspectReleaseV1060(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1060 ${c.name}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1060};
