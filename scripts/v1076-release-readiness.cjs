#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1076(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try {
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const version=Number(/^0\.1\.0-v(\d+)$/.exec(p.version)?.[1]||0);
  add('version',version>=1076&&p.sonicRoadmapRelease==='v'+version&&p.sonicFeatureRelease==='v'+version);
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.includes('npm run test:v1076 && npm run test:v1076:types &&'));
  add('focused',p.scripts['verify:v1076:focused']?.includes('verify:v1075:focused'));
  add('test',p.scripts['test:v1076']==='node tests/v1076-advanced-rap-gestures-regression.cjs');
  for(const f of ['lib/advancedRapGesturesV1076.ts','tests/v1076-advanced-rap-gestures-regression.cjs',
   'tests/tsconfig.v1076-core.json','scripts/v1076-release-readiness.cjs',
   'changelog/V1076-ADVANCED-RAP-GESTURES-8.md'])add('file:'+f,exists(f));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaRapGesturesEnabledV1076:false'));
  add('public-type',read('types/music.ts').includes('arenaRapGesturesStrengthV1076'));
  add('registry',read('components/visualizer/registry.tsx').includes('arenaRapGesturesStrengthV1076'));
  add('ui-prop',read('components/visualizer/VisualizerStage.tsx').includes('arenaRapGesturesEnabledV1076='));
  add('panel',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1076 · Advanced Rap Gestures 8.0'));
  add('dancer',read('components/visualizer/GltfDancerAvatarV492.tsx').includes('arenaRapGesturesEnabledV1076&&stageTheme'));
  const hook=read('components/visualizer/useGltfVocalMotionV492.ts');
  add('hook',hook.includes('refineRapGesturesV1076(directedRapV1062,'));
  add('post-auth',hook.indexOf('refineRapGestureV1062(advancedRapV1023,')<hook.indexOf('refineRapGesturesV1076(directedRapV1062,'));
  add('pre-limiter',hook.indexOf('refineRapGesturesV1076(directedRapV1062,')<hook.indexOf('correctAutomaticAccentV515(wordDanceV567'));
  const source=read('lib/advancedRapGesturesV1076.ts');
  add('manual',source.includes('input.manualPriority'));
  add('low-tier',source.includes("input.tier==='low'"));
  add('word-evidence',source.includes("base.evidence!=='timed-word'"));
  add('bounds',source.includes("arms:clamp(accent.arms*"));
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1076-advanced-rap-gestures-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1076-advanced-rap-gestures-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1076(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1076);
 }catch(e){console.error('V1076 readiness:',e.message);add('readable',false)}
 return {passed:checks.length>=25&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1076(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1076 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1076};
