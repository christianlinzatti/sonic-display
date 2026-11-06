#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1040(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8'),exists=f=>fs.existsSync(path.join(root,f));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const v=Number(/^0\.1\.0-v(\d+)$/.exec(p.version)?.[1]);
  add('version',v>=1040&&p.sonicFeatureRelease===`v${v}`&&p.sonicRoadmapRelease===`v${v}`);
  add('lock',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.includes('npm run test:v1040 && npm run test:v1040:types && npm run test:v1039')&&
   p.scripts.prebuild.startsWith(`npm run test:${p.sonicFeatureRelease} &&`));
  add('scripts',p.scripts['test:v1040']==='node tests/v1040-show-designer-regression.cjs'&&
   p.scripts['test:v1040:types']==='tsc -p tests/tsconfig.v1040-core.json');
  for(const file of ['lib/arena360ShowDesignerV1040.ts','components/visualizer/ArenaShowDesignerPanelV1040.tsx',
   'components/visualizer/stages/Arena360StageV1031.tsx','components/visualizer/stages/index.tsx',
   'components/visualizer/ThreeAvatar.tsx','components/visualizer/VisualizerStage.tsx',
   'components/visualizer/registry.tsx','types/music.ts','context/UiPreferencesContext.tsx',
   'components/SettingsPanel.tsx','tests/v1040-show-designer-regression.cjs',
   'tests/tsconfig.v1040-core.json','.github/workflows/v1040-ai-show-designer-validation.yml',
   'changelog/V1040-AI-SHOW-DESIGNER.md'])add('file:'+file,exists(file));
  add('gates',read('scripts/v931-production-gate.cjs').includes('tests/v1040-show-designer-regression.cjs')&&
    read('scripts/vercel-production-build.cjs').includes('tests/v1040-show-designer-regression.cjs'));
  add('source-preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1040(root)'));
  add('ci-no-duplicate',!read('.github/workflows/v1040-ai-show-designer-validation.yml').includes('  push:')&&
    !read('.github/workflows/v1032-live-arena-validation.yml').includes('  push:'));
  add('ci-regression',read('.github/workflows/v1032-live-arena-validation.yml').includes('npm run test:v1040'));
  add('v1038-type-fix',read('components/visualizer/DynamicStage.tsx').includes('arena360: {base:'));
  add('local-offline',!read('lib/arena360ShowDesignerV1040.ts').includes('fetch('));
  add('existing-directors-protected',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('nicht überschrieben'));
  add('long-archive-support',read('scripts/vercel-ignore-upload.cjs').includes('ZIP_ONLY'));
 }catch(error){console.error('V1040 release error:',error.message);add('read-source',false)}
 return {passed:checks.length>=26&&checks.every(x=>x.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1040(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1040 ${c.name}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1040};
