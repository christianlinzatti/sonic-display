#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1075(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try {
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const version=Number(/^0\.1\.0-v(\d+)$/.exec(p.version)?.[1]||0);
  add('version',version>=1075&&p.sonicRoadmapRelease==='v'+version&&p.sonicFeatureRelease==='v'+version);
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.includes('npm run test:v1075 && npm run test:v1075:types &&'));
  add('focused',p.scripts['verify:v1075:focused']?.includes('verify:v1074:focused'));
  add('test',p.scripts['test:v1075']==='node tests/v1075-crowd-energy-regression.cjs');
  for(const f of ['lib/arena360CrowdEnergyV1075.ts','tests/v1075-crowd-energy-regression.cjs',
   'tests/tsconfig.v1075-core.json','scripts/v1075-release-readiness.cjs',
   'changelog/V1075-CROWD-ENERGY-ENGINE.md'])add('file:'+f,exists(f));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaCrowdEnergyEnabledV1075:false'));
  add('public-type',read('types/music.ts').includes('arenaCrowdEnergyStrengthV1075'));
  add('registry',read('components/visualizer/registry.tsx').includes('arenaCrowdEnergyStrengthV1075'));
  add('ui-prop',read('components/visualizer/VisualizerStage.tsx').includes('arenaCrowdEnergyEnabledV1075='));
  add('panel',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1075 · Crowd Energy Engine'));
  add('parent',read('components/visualizer/ThreeAvatar.tsx').includes('crowdEnergyEnabledV1075='));
  add('adapter',read('components/visualizer/stages/index.tsx').includes('crowdEnergyEnabledV1075={crowdEnergyEnabledV1075}'));
  add('stage',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('planCrowdEnergyV1075('));
  add('crowd',read('components/visualizer/stages/ArenaAudienceV1032.tsx').includes('energyActiveV1075'));
  add('audio-in-capped-frame',read('components/visualizer/stages/ArenaAudienceV1032.tsx').includes('sampleCrowdEnergyV1075('));
  add('manual-guard',read('lib/arena360CrowdEnergyV1075.ts').includes("input.phoneMode!=='wave'"));
  add('low-tier-guard',read('lib/arena360CrowdEnergyV1075.ts').includes("input.performanceTier==='low'"));
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1075-crowd-energy-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1075-crowd-energy-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1075(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1075);
 }catch(e){console.error('V1075 readiness:',e.message);add('readable',false)}
 return {passed:checks.length>=25&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1075(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1075 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1075};
