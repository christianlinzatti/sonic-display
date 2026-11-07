#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1055(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json')),
   version=p.version.match(/^0\.1\.0-v(\d+)$/),pre=p.scripts.prebuild;
  add('version',!!version&&Number(version[1])>=1055&&p.sonicRoadmapRelease==='v'+version[1]&&p.sonicFeatureRelease==='v'+version[1]);
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('Node 24 CI',p.engines?.node==='24.x');
  add('new tests first',pre.includes('npm run test:v1055 && npm run test:v1055:types && npm run test:v1054'));
  add('previous focused chain retained',p.scripts['verify:v1055:focused'].includes('verify:v1054:focused'));
  for(const f of ['lib/arena360StageInteractionV1055.ts','tests/v1055-stage-interaction-regression.cjs',
   'tests/tsconfig.v1055-core.json','scripts/v1055-release-readiness.cjs',
   'changelog/V1055-DYNAMIC-STAGE-AVATAR-INTERACTION.md'])add('file '+f,exists(f));
  add('planner connected',read('components/visualizer/ThreeAvatar.tsx').includes('planStageInteractionV1055('));
  add('existing actors connected',read('components/visualizer/DanceFormationActorsV492.tsx').includes('applyStageInteractionV1055('));
  add('camera and audience attenuation',read('components/visualizer/ThreeAvatar.tsx').includes('stageInteractionV1055.cameraGain')&&
   read('components/visualizer/ThreeAvatar.tsx').includes('stageInteractionV1055.crowdGain'));
  add('platform intensity attenuation',read('components/visualizer/ThreeAvatar.tsx').includes('stageInteractionV1055.platformGain'));
  add('settings default off',read('context/UiPreferencesContext.tsx').includes('arenaStageInteractionEnabledV1055:false'));
  add('typed props',read('types/music.ts').includes('arenaStageInteractionStrengthV1055'));
  add('UI control',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1055 · Dynamic Concert Stage & Avatar Interaction'));
  add('visualizer preferences',read('components/visualizer/VisualizerStage.tsx').includes('arenaStageInteractionEnabledV1055'));
  add('production gate',read('scripts/v931-production-gate.cjs').includes('tests/v1055-stage-interaction-regression.cjs'));
  add('Vercel gate',read('scripts/vercel-production-build.cjs').includes('tests/v1055-stage-interaction-regression.cjs'));
  add('preflight release inspection',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1055'));
  add('documentation',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1055);
  add('pure planner',!/(fetch\(|setInterval\(|setTimeout\(|Math\.random\(|WebSocket\(|new AnimationMixer|Date\.now\(|localStorage)/.test(read('lib/arena360StageInteractionV1055.ts')));
 }catch(error){console.error(error);add('readability',false);}
 return {checks,passed:checks.length>=20&&checks.every(c=>c.ok)};
}
if(require.main===module){
 const result=inspectReleaseV1055(path.resolve(__dirname,'..'));
 for(const c of result.checks)console.log((c.ok?'PASS':'FAIL')+' V1055 '+c.name);
 if(!result.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1055};
