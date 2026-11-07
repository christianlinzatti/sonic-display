#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1074(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try {
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const num=Number(/^0\.1\.0-v(\d+)$/.exec(p.version)?.[1]||0);
  add('version',num>=1074&&p.sonicRoadmapRelease==='v'+num&&p.sonicFeatureRelease==='v'+num);
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.includes('npm run test:v1074 && npm run test:v1074:types &&'));
  add('focused',p.scripts['verify:v1074:focused']?.includes('verify:v1073:focused'));
  add('test',p.scripts['test:v1074']==='node tests/v1074-avatar-audience-regression.cjs');
  for(const f of ['lib/arena360AvatarAudienceInteractionV1074.ts',
    'tests/v1074-avatar-audience-regression.cjs','tests/tsconfig.v1074-core.json',
    'scripts/v1074-release-readiness.cjs','changelog/V1074-AVATAR-AUDIENCE-INTERACTION-2.md'])
   add('file:'+f,exists(f));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaAvatarAudienceEnabledV1074:false'));
  add('public-type',read('types/music.ts').includes('arenaAvatarAudienceStrengthV1074'));
  add('registry',read('components/visualizer/registry.tsx').includes('arenaAvatarAudienceCueV1074'));
  add('ui-prop',read('components/visualizer/VisualizerStage.tsx').includes('arenaAvatarAudienceEnabledV1074='));
  add('panel',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1074 · Avatar & Audience Interaction 2.0'));
  const three=read('components/visualizer/ThreeAvatar.tsx');
  add('cue-planned-once',three.includes('planAvatarAudienceInteractionV1074('));
  add('cast-cue',three.includes('arenaAvatarAudienceCueV1074:liveArtistV1079')&&three.includes('baseline:avatarAudienceV1074'));
  add('stage-cue',three.includes('avatarAudienceCueV1074={liveArtistV1079}'));
  add('stage-adapter',read('components/visualizer/stages/index.tsx').includes('avatarAudienceCueV1074={avatarAudienceCueV1074}'));
  add('stage-forward',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('avatarAudienceCueV1074={avatarAudienceCueV1074}'));
  add('crowd',read('components/visualizer/stages/ArenaAudienceV1032.tsx').includes('gestureArms'));
  add('glb',read('components/visualizer/GltfDancerAvatarV492.tsx').includes('lastAudiencePoseV1074.current=nextV1074'));
  add('procedural',read('components/visualizer/ProceduralDancerAvatarV492.tsx').includes('audiencePoseV1074.leftLift'));
  add('manual-gate',read('lib/arena360AvatarAudienceInteractionV1074.ts').includes('if(input.manualPriority)'));
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1074-avatar-audience-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1074-avatar-audience-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1074(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1074);
 }catch(e){console.error('V1074 readiness:',e.message);add('readable',false);}
 return {passed:checks.length>=28&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1074(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1074 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1074};
