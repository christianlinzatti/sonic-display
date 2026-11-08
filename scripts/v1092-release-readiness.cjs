#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1092(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:!!ok});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8'),exists=f=>fs.existsSync(path.join(root,f));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const ver=Number(/^0\.1\.0-v(\d+)$/.exec(p.version)?.[1]||0);
  add('metadata',ver>=1092&&p.sonicRoadmapRelease==='v'+ver&&p.sonicFeatureRelease==='v'+ver);
  add('lock',p.version===l.version&&l.version===l.packages[''].version);
  add('node24',p.engines.node==='24.x');
  add('prebuild',p.scripts.prebuild.includes('npm run test:v1092 && npm run test:v1092:types &&'));
  add('script',p.scripts['test:v1092']==='node tests/v1092-crowd-harmony-regression.cjs'&&
   p.scripts['test:v1092:types']==='tsc -p tests/tsconfig.v1092-core.json --noEmit');
  for(const file of ['lib/arena360CrowdHarmonyV1092.ts','tests/v1092-crowd-harmony-regression.cjs',
   'tests/tsconfig.v1092-core.json','scripts/v1092-release-readiness.cjs',
   'changelog/V1092-AUDIENCE-STAGE-EMOTION-SYNC.md'])add('file:'+file,exists(file));
  const audience=read('components/visualizer/stages/ArenaAudienceV1032.tsx');
  add('crowd-step',audience.includes('crowdHarmonyV1092.current=')&&audience.includes('stepCrowdHarmonyV1092('));
  add('phone-batch',audience.includes('sampleCrowdHarmonyV1092(harmonyV1092.state,angle).phoneGain'));
  add('no-new-mesh',!audience.includes('v1092-crowd-harmony-mesh'));
  const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
  add('stage-bridge',stage.includes('crowdHarmonyEnabledV1092={crowdHarmonyEnabledV1092&&showDesignerEnabled&&showDirectorEnabled}'));
  add('scene-hint',stage.includes('storyArcStateV1091={storyArcEnabledV1091?storyArcStateV1091:undefined}'));
  add('show-panel',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('arena-v1092-crowd-harmony'));
  add('off-by-default',read('context/UiPreferencesContext.tsx').includes('arenaCrowdHarmonyEnabledV1092:false'));
  add('types',read('types/music.ts').includes('arenaCrowdHarmonyEnabledV1092?:boolean;')&&
   read('components/visualizer/registry.tsx').includes('arenaCrowdHarmonyEnabledV1092?:boolean;'));
  add('three-bridge',read('components/visualizer/ThreeAvatar.tsx').includes('crowdHarmonyEnabledV1092={props.arenaCrowdHarmonyEnabledV1092 ?? false}'));
  add('stage-index',read('components/visualizer/stages/index.tsx').includes('crowdHarmonyEnabledV1092={crowdHarmonyEnabledV1092}'));
  const ci=read('.github/workflows/v965-room-wave-production.yml');
  add('ci',ci.includes('V1092 Audience & Stage Emotion Sync')||ci.includes('Active imported release (regression and isolated type checks)'));
  add('gate',read('scripts/v931-production-gate.cjs').includes('tests/v1092-crowd-harmony-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1092-crowd-harmony-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1092(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1]||0)>=1092);
 }catch(e){console.error(e);add('parse',false)}
 return {passed:checks.length>=23&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1092(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1092 ${c.id}`);
 if(!r.passed)process.exitCode=1;}
module.exports={inspectReleaseV1092};
