#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1051(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const current=p.version.match(/^0\.1\.0-v(\d+)$/);
  add('version',Boolean(current&&Number(current[1])>=1051&&p.sonicRoadmapRelease==='v'+current[1]&&p.sonicFeatureRelease==='v'+current[1]));
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild tests',p.scripts.prebuild.includes('npm run test:v1051 && npm run test:v1051:types && npm run test:v1050'));
  add('focused chain',p.scripts['verify:v1051:focused'].includes('verify:v1050:focused'));
  for(const f of ['lib/arena360CrowdExperienceV1051.ts','tests/v1051-immersive-crowd-experience-regression.cjs',
   'tests/tsconfig.v1051-core.json','changelog/V1051-IMMERSIVE-CONCERT-CROWD-EXPERIENCE.md'])add('file:'+f,exists(f));
  add('stage planner',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('planCrowdExperienceV1051'));
  add('audience sampler',read('components/visualizer/stages/ArenaAudienceV1032.tsx').includes('sampleCrowdExperienceV1051'));
  add('instanced arms',read('components/visualizer/stages/ArenaAudienceV1032.tsx').includes('v1051-audience-cheer-arms'));
  add('opt-in',read('context/UiPreferencesContext.tsx').includes('arenaCrowdExperienceEnabledV1051:false'));
  add('UI',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1051 · Immersive Concert Crowd Experience'));
  add('types',read('types/music.ts').includes('arenaCrowdExperienceStrengthV1051'));
  add('visualizer',read('components/visualizer/VisualizerStage.tsx').includes('arenaCrowdExperienceEnabledV1051'));
  add('avatar props',read('components/visualizer/ThreeAvatar.tsx').includes('crowdExperienceEnabledV1051='));
  add('production gate',read('scripts/v931-production-gate.cjs').includes('tests/v1051-immersive-crowd-experience-regression.cjs'));
  add('Vercel gate',read('scripts/vercel-production-build.cjs').includes('tests/v1051-immersive-crowd-experience-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1051'));
  add('no network',!/(fetch\(|WebSocket\(|Math\.random\()/.test(read('lib/arena360CrowdExperienceV1051.ts')));
 }catch(err){add('readable',false);console.error(err);}
 return {checks,passed:checks.length>=20&&checks.every(c=>c.ok)};
}
if(require.main===module){const res=inspectReleaseV1051(path.resolve(__dirname,'..'));
 for(const c of res.checks)console.log(`${c.ok?'PASS':'FAIL'} V1051 ${c.name}`);
 if(!res.passed)process.exitCode=1;}
module.exports={inspectReleaseV1051};
