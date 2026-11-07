#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1067(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:!!ok});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const v=/^0\.1\.0-v(\d+)$/.exec(p.version||''),num=Number(v?.[1]);
  add('version',num>=1067&&p.sonicRoadmapRelease==='v'+num&&p.sonicFeatureRelease==='v'+num);
  add('lockfile',p.version===l.version&&l.packages?.['']?.version===p.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.startsWith('npm run test:v'+num+' && npm run test:v'+num+':types &&'));
  add('focused',p.scripts['verify:v1067:focused']?.includes('verify:v1066:focused'));
  add('test-command',p.scripts['test:v1067']==='node tests/v1067-floating-experience-regression.cjs');
  for(const f of ['lib/arena360FloatingExperienceV1067.ts','tests/v1067-floating-experience-regression.cjs',
   'tests/tsconfig.v1067-core.json','scripts/v1067-release-readiness.cjs',
   'changelog/V1067-FLOATING-PLATFORM-EXPERIENCE-2.md'])add('file:'+f,exists(f));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaFloatingExperienceEnabledV1067:false'));
  add('public-type',read('types/music.ts').includes('arenaFloatingExperienceStrengthV1067'));
  add('component-type',read('components/visualizer/registry.tsx').includes('arenaFloatingExperienceStrengthV1067'));
  add('stage-prop',read('components/visualizer/VisualizerStage.tsx').includes('arenaFloatingExperienceEnabledV1067='));
  add('ui',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1067 · Floating Platform Experience 2.0'));
  add('one-frame',(read('components/visualizer/stages/ArenaFloatingPlatformsV1038.tsx').match(/useFrame\(/g)||[]).length===1);
  add('integrated',read('components/visualizer/stages/ArenaFloatingPlatformsV1038.tsx').includes('stepFloatingExperienceV1067('));
  add('stage-sync',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('stageCueV1066:stageFormationV1066'));
  add('manual',read('lib/arena360FloatingExperienceV1067.ts').includes("input.floatMode!=='auto'"));
  add('fixed-floor',read('components/visualizer/stages/Arena360StageV1031.tsx').indexOf('<ArenaFloatingPlatformsV1038')<read('components/visualizer/stages/Arena360StageV1031.tsx').indexOf('ref={turntable}'));
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1067-floating-experience-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1067-floating-experience-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1067(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1067);
  add('pure',!/(fetch\(|Math\.random\(|Date\.now\(|setInterval\(|setTimeout\(|WebSocket\(|localStorage)/.test(read('lib/arena360FloatingExperienceV1067.ts')));
 }catch(e){console.error('V1067 readiness:',e.message);add('readable',false);}
 return {checks,passed:checks.length>=24&&checks.every(c=>c.ok)};
}
if(require.main===module){const r=inspectReleaseV1067(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1067 ${c.id}`);
 if(!r.passed)process.exitCode=1;}
module.exports={inspectReleaseV1067};
