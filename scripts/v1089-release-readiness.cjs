#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1089(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8'),exists=f=>fs.existsSync(path.join(root,f));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const n=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0);
  add('release',n>=1089&&pkg.sonicFeatureRelease==='v'+n&&pkg.sonicRoadmapRelease==='v'+n);
  add('lockfile',pkg.version===lock.version&&pkg.version===lock.packages[''].version);
  add('node24',pkg.engines.node==='24.x');
  add('prebuild',pkg.scripts.prebuild.includes('npm run test:v1089 && npm run test:v1089:types &&'));
  add('test',pkg.scripts['test:v1089']==='node tests/v1089-beat-drop-intelligence-regression.cjs');
  add('types',pkg.scripts['test:v1089:types']==='tsc -p tests/tsconfig.v1089-core.json --noEmit');
  add('focused',pkg.scripts['verify:v1089:focused'].includes('npm run test:v1088'));
  for(const f of ['lib/beatDropIntelligenceV1089.ts','tests/v1089-beat-drop-intelligence-regression.cjs',
   'tests/tsconfig.v1089-core.json','scripts/v1089-release-readiness.cjs',
   'changelog/V1089-BEAT-DROP-INTELLIGENCE-4.md'])add('file:'+f,exists(f));
  const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
  add('stage-filter',stage.includes('stepBeatDropIntelligenceV1089('));
  add('observed-drop-authority',stage.includes('planUltimateFestivalDropV1087({')&&stage.includes('qualifiedAudioV1089'));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaBeatIntelligenceEnabledV1089:false'));
  add('panel',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('arena-v1089-beat-intelligence'));
  add('clear-all',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('arenaBeatIntelligenceEnabledV1089:false'));
  add('plumbing',read('components/visualizer/ThreeAvatar.tsx').includes('beatIntelligenceEnabledV1089={props.arenaBeatIntelligenceEnabledV1089'));
  const bridge=read('components/visualizer/stages/index.tsx');
  add('stage-bridge',bridge.includes('beatIntelligenceEnabledV1089={beatIntelligenceEnabledV1089}')&&
    bridge.includes('ultimateFestivalDropEnabledV1087={ultimateFestivalDropEnabledV1087}'));
  add('registry-props',read('components/visualizer/registry.tsx').includes('arenaBeatIntelligenceEnabledV1089?:boolean;')&&
    read('components/visualizer/registry.tsx').includes('arenaUltimateFestivalDropEnabledV1087?:boolean;'));
  add('preferences-to-props',read('components/visualizer/VisualizerStage.tsx').includes('arenaBeatIntelligenceEnabledV1089={preferences.arenaBeatIntelligenceEnabledV1089')&&
    read('components/visualizer/VisualizerStage.tsx').includes('arenaUltimateFestivalDropEnabledV1087={preferences.arenaUltimateFestivalDropEnabledV1087'));

  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1089-beat-drop-intelligence-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1089-beat-drop-intelligence-regression.cjs'));
  add('ci',read('.github/workflows/v965-room-wave-production.yml').includes('V1089 Beat & Drop Intelligence 4.0')||
   read('.github/workflows/v965-room-wave-production.yml').includes('Active imported release (regression and isolated type checks)'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1089(root)'));
  add('architecture',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1089);
 }catch(e){console.error('V1089 release readiness:',e);add('readable',false)}
 return {passed:checks.length>=22&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1089(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1089 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1089};
