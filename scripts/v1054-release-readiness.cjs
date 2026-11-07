#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1054(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json')),
   v=p.version.match(/^0\.1\.0-v(\d+)$/);
  add('version',!!v&&Number(v[1])>=1054&&p.sonicRoadmapRelease==='v'+v[1]&&p.sonicFeatureRelease==='v'+v[1]);
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('Node24',p.engines?.node==='24.x');
  add('prebuild order',p.scripts.prebuild.includes('npm run test:v1054 && npm run test:v1054:types && npm run test:v1053'));
  add('older chain kept',p.scripts['verify:v1054:focused'].includes('verify:v1053:focused'));
  for(const f of ['lib/arena360AvatarPerformanceV1054.ts','tests/v1054-avatar-performance-regression.cjs',
   'tests/tsconfig.v1054-core.json','scripts/v1054-release-readiness.cjs',
   'changelog/V1054-ADVANCED-AVATAR-PERFORMANCE-INTELLIGENCE.md'])add('file '+f,exists(f));
  add('avatar planner',read('components/visualizer/ThreeAvatar.tsx').includes('planAvatarPerformanceV1054('));
  add('avatar cue forwarded',read('components/visualizer/ThreeAvatar.tsx').includes('arenaChoreoV1041.active ? performanceChoreoV1054 : null'));
  add('settings off',read('context/UiPreferencesContext.tsx').includes('arenaAvatarPerformanceEnabledV1054:false'));
  add('types',read('types/music.ts').includes('arenaAvatarPerformanceStrengthV1054'));
  add('UI',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1054 · Advanced Avatar Performance Intelligence'));
  add('visualizer settings',read('components/visualizer/VisualizerStage.tsx').includes('arenaAvatarPerformanceEnabledV1054'));
  add('production gate',read('scripts/v931-production-gate.cjs').includes('tests/v1054-avatar-performance-regression.cjs'));
  add('Vercel gate',read('scripts/vercel-production-build.cjs').includes('tests/v1054-avatar-performance-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1054'));
  add('no planner side effects',!/(fetch\(|setInterval\(|setTimeout\(|Math\.random\(|WebSocket\(|new AnimationMixer)/.test(read('lib/arena360AvatarPerformanceV1054.ts')));
 }catch(error){console.error(error);add('readable',false);}
 return {checks,passed:checks.length>=19&&checks.every(c=>c.ok)};
}
if(require.main===module){const result=inspectReleaseV1054(path.resolve(__dirname,'..'));
 for(const c of result.checks)console.log((c.ok?'PASS':'FAIL')+' V1054 '+c.name);
 if(!result.passed)process.exitCode=1;}
module.exports={inspectReleaseV1054};
