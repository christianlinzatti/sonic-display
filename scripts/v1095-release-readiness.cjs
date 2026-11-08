#!/usr/bin/env node
'use strict';
/** Readiness for opt-in, local-only V1095 Live Show Learning. */
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1095(root){
 const checks=[],add=(id,condition)=>checks.push({id,ok:!!condition});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8'),exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const version=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0);
  add('metadata',version>=1095&&pkg.sonicFeatureRelease==='v'+version&&pkg.sonicRoadmapRelease==='v'+version);
  add('lock',lock.version===pkg.version&&lock.packages[''].version===pkg.version);
  add('node24',pkg.engines.node==='24.x');
  add('scripts',pkg.scripts['test:v1095']==='node tests/v1095-live-show-learning-regression.cjs'&&
   pkg.scripts['test:v1095:types']==='tsc -p tests/tsconfig.v1095-core.json --noEmit');
  add('prebuild',pkg.scripts.prebuild.includes('npm run test:v1095 && npm run test:v1095:types &&'));
  for(const f of ['lib/arena360LiveShowLearningV1095.ts',
   'components/visualizer/LiveShowLearningPanelV1095.tsx',
   'tests/v1095-live-show-learning-regression.cjs','tests/tsconfig.v1095-core.json',
   'scripts/v1095-release-readiness.cjs','changelog/V1095-LIVE-SHOW-LEARNING.md'])add('file:'+f,exists(f));
  const core=read('lib/arena360LiveShowLearningV1095.ts');
  for(const fn of ['normalizeLearningMemoryV1095','recordShowFeedbackV1095','suggestLiveShowV1095','showStyleSignatureV1095'])
   add('pure:'+fn,core.includes('function '+fn+'('));
  add('bounded',core.includes('MAX_FEEDBACK_V1095=24')&&core.includes('MAX_RECENT_V1095=6'));
  add('no-identifying-metadata',!core.includes('Date.now(')&&!core.includes('localStorage.')&&!core.includes('fetch('));
  const ui=read('components/visualizer/LiveShowLearningPanelV1095.tsx');
  add('explicit-accept',ui.includes('updatePreferences({arenaShowPlanV1040:visibleCandidate})'));
  add('explicit-feedback',ui.includes('recordShowFeedbackV1095('));
  add('local-storage',ui.includes('window.localStorage.setItem(')&&ui.includes('window.localStorage.removeItem('));
  add('integration',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('<LiveShowLearningPanelV1095/>'));
  add('stage-unchanged',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('sampleArenaShowPlanV1040('));
  const wf=read('.github/workflows/v965-room-wave-production.yml');
  add('ci',wf.includes('V1095 Live Show Learning')||wf.includes('Active imported release (regression and isolated type checks)'));
  add('gate',read('scripts/v931-production-gate.cjs').includes('tests/v1095-live-show-learning-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1095-live-show-learning-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1095(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1]||0)>=1095);
 }catch(e){console.error(e);add('parse',false)}
 return {passed:checks.length>=26&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const report=inspectReleaseV1095(path.resolve(__dirname,'..'));
 for(const c of report.checks)console.log((c.ok?'PASS':'FAIL')+' V1095 '+c.id);
 if(!report.passed)process.exitCode=1;}
module.exports={inspectReleaseV1095};
