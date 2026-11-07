#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1073(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const num=Number(/^0\.1\.0-v(\d+)$/.exec(p.version)?.[1]||0);
  add('version',num>=1073&&p.sonicRoadmapRelease==='v'+num&&p.sonicFeatureRelease==='v'+num);
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.includes('npm run test:v1073 && npm run test:v1073:types &&'));
  add('focused',p.scripts['verify:v1073:focused']?.includes('verify:v1072:focused'));
  add('test-command',p.scripts['test:v1073']==='node tests/v1073-audience-experience-regression.cjs');
  for(const f of ['lib/arena360AudienceExperienceV1073.ts',
   'tests/v1073-audience-experience-regression.cjs','tests/tsconfig.v1073-core.json',
   'scripts/v1073-release-readiness.cjs','changelog/V1073-CONCERT-AUDIENCE-EXPERIENCE-3.md'])
   add('file:'+f,exists(f));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaAudienceExperienceEnabledV1073:false'));
  add('public-type',read('types/music.ts').includes('arenaAudienceExperienceStrengthV1073'));
  add('component-type',read('components/visualizer/registry.tsx').includes('arenaAudienceExperienceStrengthV1073'));
  add('stage-prop',read('components/visualizer/VisualizerStage.tsx').includes('arenaAudienceExperienceEnabledV1073='));
  add('ui',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1073 · Concert Audience Experience 3.0'));
  add('cast',read('components/visualizer/ThreeAvatar.tsx').includes('audienceExperienceEnabledV1073='));
  add('stage-adapter',read('components/visualizer/stages/index.tsx').includes('audienceExperienceEnabledV1073={audienceExperienceEnabledV1073}'));
  add('director',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('planAudienceExperienceV1073('));
  add('cue',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('audienceCueV1073={audienceExperienceV1073}'));
  const crowd=read('components/visualizer/stages/ArenaAudienceV1032.tsx');
  add('one-instancing',crowd.includes('v1073-audience-wristbands')&&crowd.includes('phoneMembers.length'));
  add('uses-existing-clock',crowd.includes('sampleAudienceExperienceV1073(')&&!crowd.includes('v1073-useFrame'));
  add('no-new-audio',!/(?:AudioContext|speechSynthesis|\.play\(\))/.test(read('lib/arena360AudienceExperienceV1073.ts')));
  add('manual-protection',read('lib/arena360AudienceExperienceV1073.ts').includes("input.phoneMode!=='wave'"));
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1073-audience-experience-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1073-audience-experience-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1073(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1073);
 }catch(e){console.error('V1073 readiness:',e.message);add('readable',false);}
 return {passed:checks.length>=27&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1073(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1073 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1073};
