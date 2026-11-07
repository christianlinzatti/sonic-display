#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1077(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const version=Number(/^0\.1\.0-v(\d+)$/.exec(p.version)?.[1]||0);
  add('version',version>=1077&&p.sonicRoadmapRelease==='v'+version&&p.sonicFeatureRelease==='v'+version);
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.includes('npm run test:v1077 && npm run test:v1077:types &&'));
  add('focused',p.scripts['verify:v1077:focused']?.includes('verify:v1076:focused'));
  add('test',p.scripts['test:v1077']==='node tests/v1077-duet-performance-regression.cjs');
  for(const f of ['lib/arena360DuetPerformanceV1077.ts','tests/v1077-duet-performance-regression.cjs',
   'tests/tsconfig.v1077-core.json','scripts/v1077-release-readiness.cjs',
   'changelog/V1077-DUET-PERFORMANCE-3.md'])add('file:'+f,exists(f));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaDuetPerformanceEnabledV1077:false'));
  add('public-type',read('types/music.ts').includes('arenaDuetPerformanceStrengthV1077'));
  add('registry',read('components/visualizer/registry.tsx').includes('arenaDuetPerformanceStrengthV1077'));
  add('ui-prop',read('components/visualizer/VisualizerStage.tsx').includes('arenaDuetPerformanceEnabledV1077='));
  add('panel',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1077 · Duet Performance 3.0'));
  add('dancer',read('components/visualizer/GltfDancerAvatarV492.tsx').includes('arenaDuetPerformanceEnabledV1077&&stageTheme'));
  const hook=read('components/visualizer/useGltfVocalMotionV492.ts');
  add('hook',hook.includes('refineDuetPerformanceV1077(directedRapV1076,'));
  add('track-bound-cast',hook.includes('casting:authoredVocalV472?.active?authoredVocalV472:assignedDuetV472'));
  add('post-auth',hook.indexOf('refineRapGesturesV1076(directedRapV1062,')<hook.indexOf('refineDuetPerformanceV1077(directedRapV1076,'));
  add('pre-limiter',hook.indexOf('refineDuetPerformanceV1077(directedRapV1076,')<hook.indexOf('correctAutomaticAccentV515(wordDanceV567'));
  const source=read('lib/arena360DuetPerformanceV1077.ts');
  add('manual',source.includes('input.manualPriority'));
  add('low-tier',source.includes("input.tier==='low'"));
  add('word-evidence',source.includes("base.evidence!=='timed-word'"));
  add('singer-mask',source.includes('cast.singingSlots.includes(input.slot)'));
  add('bounds',source.includes('head:clamp(a.head*')&&source.includes('arms:clamp(a.arms*'));
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1077-duet-performance-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1077-duet-performance-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1077(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1077);
 }catch(e){console.error('V1077 readiness:',e.message);add('readable',false)}
 return {passed:checks.length>=28&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1077(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1077 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1077};
