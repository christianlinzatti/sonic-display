#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1094(root){
 const checks=[],add=(id,condition)=>checks.push({id,ok:!!condition});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8'),exists=f=>fs.existsSync(path.join(root,f));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const number=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0);
  add('metadata',number>=1094&&pkg.sonicFeatureRelease==='v'+number&&pkg.sonicRoadmapRelease==='v'+number);
  add('lockfile',lock.version===pkg.version&&lock.packages[''].version===pkg.version);
  add('node24',pkg.engines.node==='24.x');
  add('scripts',pkg.scripts['test:v1094']==='node tests/v1094-concert-timeline-studio-regression.cjs'&&pkg.scripts['test:v1094:types']==='tsc -p tests/tsconfig.v1094-core.json --noEmit');
  add('prebuild',pkg.scripts.prebuild.includes('npm run test:v1094 && npm run test:v1094:types &&'));
  for(const f of ['lib/arena360ConcertTimelineStudioV1094.ts','components/visualizer/ConcertTimelineStudioV1094.tsx',
   'tests/v1094-concert-timeline-studio-regression.cjs','tests/tsconfig.v1094-core.json',
   'scripts/v1094-release-readiness.cjs','changelog/V1094-CONCERT-TIMELINE-STUDIO-3.md'])add('file:'+f,exists(f));
  const core=read('lib/arena360ConcertTimelineStudioV1094.ts');
  for(const fn of ['timelineBoundaryRangeV1094','retimeConcertBoundaryV1094','resetConcertBoundariesV1094','previewConcertTimelineV1094'])
   add('function:'+fn,core.includes('function '+fn+'('));
  add('live-normalization',read('lib/arena360ShowDesignerV1040.ts').includes('s.end-s.start<.02-1e-8'));
  add('no-parallel-renderer',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('sampleArenaShowPlanV1040('));
  add('panel',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('<ConcertTimelineStudioV1094/>'));
  const ui=read('components/visualizer/ConcertTimelineStudioV1094.tsx');
  add('save-to-existing-plan',ui.includes('updatePreferences({arenaShowPlanV1040:updated})'));
  add('virtual-preview',ui.includes('previewConcertTimelineV1094(plan,'));
  add('non-destructive-reset',ui.includes('resetConcertBoundariesV1094(plan)'));
  const workflow=read('.github/workflows/v965-room-wave-production.yml');
  add('ci',workflow.includes('V1094 Concert Timeline Studio 3.0')||workflow.includes('Active imported release (regression and isolated type checks)'));
  add('gate',read('scripts/v931-production-gate.cjs').includes('tests/v1094-concert-timeline-studio-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1094-concert-timeline-studio-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1094(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1]||0)>=1094);
 }catch(e){console.error(e);add('parse',false)}
 return {passed:checks.length>=26&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const result=inspectReleaseV1094(path.resolve(__dirname,'..'));for(const c of result.checks)console.log(`${c.ok?'PASS':'FAIL'} V1094 ${c.id}`);if(!result.passed)process.exitCode=1;}
module.exports={inspectReleaseV1094};
