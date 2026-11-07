#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1044(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  add('version',['v1044','v1045','v1046'].includes(p.sonicFeatureRelease)&&p.sonicFeatureRelease===p.sonicRoadmapRelease&&p.version==='0.1.0-'+p.sonicFeatureRelease);
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('prebuild',p.scripts.prebuild.includes('npm run test:v1044 && npm run test:v1044:types &&'));
  add('scripts',p.scripts['test:v1044']==='node tests/v1044-audience-orchestra-regression.cjs'&&
   p.scripts['test:v1044:types']==='tsc -p tests/tsconfig.v1044-core.json --noEmit');
  for(const f of ['lib/arena360AudienceDirectorV1044.ts','tests/v1044-audience-orchestra-regression.cjs',
   'tests/tsconfig.v1044-core.json','components/visualizer/stages/Arena360StageV1031.tsx',
   'components/visualizer/stages/ArenaAudienceV1032.tsx','components/visualizer/stages/index.tsx',
   'components/visualizer/ThreeAvatar.tsx','components/visualizer/VisualizerStage.tsx',
   'components/visualizer/ArenaShowDesignerPanelV1040.tsx','components/visualizer/registry.tsx',
   'types/music.ts','context/UiPreferencesContext.tsx',
   'changelog/V1044-AUDIENCE-LIGHT-ORCHESTRA.md'])add('file:'+f,exists(f));
  // A release ZIP cannot install .github/workflows: the protected importer intentionally skips them.
  // The existing production/Vercel gates are authoritative. The optional manual workflow
  // may be installed separately; its absence must not fail a successful ZIP import.
  add('optional-workflow-safe',!exists('.github/workflows/v1044-audience-orchestra-validation.yml')||
   !read('.github/workflows/v1044-audience-orchestra-validation.yml').includes('  push:'));
  add('safety',read('lib/arena360AudienceDirectorV1044.ts').includes("input.performanceTier==='low'")&&
   read('lib/arena360AudienceDirectorV1044.ts').includes("input.phoneMode!=='wave'"));
  add('opt-in',read('context/UiPreferencesContext.tsx').includes('arenaAudienceDirectorEnabledV1044:false'));
  add('no-extra-mesh',read('components/visualizer/stages/ArenaAudienceV1032.tsx').includes('sampleArenaAudienceV1044'));
  add('ci',read('scripts/v931-production-gate.cjs').includes('tests/v1044-audience-orchestra-regression.cjs')&&
   read('scripts/vercel-production-build.cjs').includes('tests/v1044-audience-orchestra-regression.cjs'));
 }catch(e){console.error('V1044:',e.message);add('readable',false)}
 return {checks,passed:checks.length>=22&&checks.every(x=>x.ok)};
}
if(require.main===module){const r=inspectReleaseV1044(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1044 ${c.name}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1044};
