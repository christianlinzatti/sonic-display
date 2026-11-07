#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1063(root){
 const checks=[],check=(id,value)=>checks.push({id,ok:!!value});
 const read=file=>fs.readFileSync(path.join(root,file),'utf8');
 const exists=file=>fs.existsSync(path.join(root,file));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const version=/^0\.1\.0-v(\d+)$/.exec(pkg.version||'');
  check('version',!!version&&Number(version[1])>=1063&&pkg.sonicFeatureRelease==='v'+version[1]&&pkg.sonicRoadmapRelease==='v'+version[1]);
  check('lockfile',lock.version===pkg.version&&lock.packages?.['']?.version===pkg.version);
  check('node24',pkg.engines?.node==='24.x');
  check('prebuild',pkg.scripts.prebuild.includes('npm run test:v1063 && npm run test:v1063:types &&'));
  check('focused',pkg.scripts['verify:v1063:focused'].includes('verify:v1062:focused'));
  for(const f of ['lib/arena360EnsembleChoreographyV1063.ts','tests/v1063-ensemble-choreography-regression.cjs',
    'tests/tsconfig.v1063-core.json','scripts/v1063-release-readiness.cjs',
    'changelog/V1063-ENSEMBLE-CHOREOGRAPHY-4.md'])check('file:'+f,exists(f));
  check('default-off',read('context/UiPreferencesContext.tsx').includes('arenaEnsembleEnabledV1063:false'));
  check('types',read('types/music.ts').includes('arenaEnsembleStrengthV1063'));
  check('props',read('components/visualizer/registry.tsx').includes('arenaEnsembleStrengthV1063'));
  check('stage-props',read('components/visualizer/VisualizerStage.tsx').includes('arenaEnsembleEnabledV1063='));
  check('ui',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1063 · Ensemble Choreography 4.0'));
  check('duo',read('components/visualizer/DanceFormationActorsV492.tsx').includes('ensembleV1063!.slots[0].spreadX'));
  check('group',read('components/visualizer/GroupDancersV326SceneV492.tsx').includes('ensembleActiveV1063'));
  check('one-clock',read('components/visualizer/ThreeAvatar.tsx').includes('planEnsembleChoreographyV1063({'));
  check('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1063-ensemble-choreography-regression.cjs'));
  check('production',read('scripts/v931-production-gate.cjs').includes('tests/v1063-ensemble-choreography-regression.cjs'));
  check('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1063(root)'));
  check('documentation',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1063);
  check('pure',!/(fetch\(|Math\.random\(|Date\.now\(|setInterval\(|setTimeout\(|WebSocket\(|localStorage)/.test(read('lib/arena360EnsembleChoreographyV1063.ts')));
 }catch(e){console.error('V1063 readiness:',e.message);check('readable',false);}
 return {checks,passed:checks.length>=22&&checks.every(c=>c.ok)};
}
if(require.main===module){const report=inspectReleaseV1063(path.resolve(__dirname,'..'));
 for(const c of report.checks)console.log(`${c.ok?'PASS':'FAIL'} V1063 ${c.id}`);
 if(!report.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1063};
