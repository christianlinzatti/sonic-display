#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1045(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  add('version',['v1045','v1046'].includes(p.sonicFeatureRelease)&&p.sonicFeatureRelease===p.sonicRoadmapRelease&&p.version==='0.1.0-'+p.sonicFeatureRelease);
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('prebuild',p.scripts.prebuild.includes('npm run test:v1045 && npm run test:v1045:types &&'));
  add('scripts',p.scripts['test:v1045']==='node tests/v1045-atmosphere-orchestra-regression.cjs'&&
   p.scripts['test:v1045:types']==='tsc -p tests/tsconfig.v1045-core.json --noEmit');
  for(const f of ['lib/arena360AtmosphereDirectorV1045.ts','tests/v1045-atmosphere-orchestra-regression.cjs',
   'tests/tsconfig.v1045-core.json','components/visualizer/stages/Arena360StageV1031.tsx',
   'components/visualizer/stages/ArenaLowFogV1036.tsx','components/visualizer/stages/ArenaLaserFansV1036.tsx',
   'components/visualizer/stages/ArenaMovingLedSkyV1036.tsx','components/visualizer/stages/index.tsx',
   'components/visualizer/ThreeAvatar.tsx','components/visualizer/VisualizerStage.tsx',
   'components/visualizer/ArenaShowDesignerPanelV1040.tsx','components/visualizer/registry.tsx',
   'types/music.ts','context/UiPreferencesContext.tsx','changelog/V1045-INTELLIGENT-CONCERT-ATMOSPHERE-2.md'])
    add('file:'+f,exists(f));
  add('render-safe',read('components/visualizer/stages/ArenaLowFogV1036.tsx').includes('uTint')&&
   read('components/visualizer/stages/ArenaLaserFansV1036.tsx').includes('atmosphereV1045')&&
   read('components/visualizer/stages/ArenaMovingLedSkyV1036.tsx').includes('atmosphereV1045'));
  add('opt-in',read('context/UiPreferencesContext.tsx').includes('arenaAtmosphereDirectorEnabledV1045:false'));
  add('ci',read('scripts/v931-production-gate.cjs').includes('tests/v1045-atmosphere-orchestra-regression.cjs')&&
   read('scripts/vercel-production-build.cjs').includes('tests/v1045-atmosphere-orchestra-regression.cjs'));
 }catch(e){console.error('V1045:',e.message);add('readable',false)}
 return {checks,passed:checks.length>=19&&checks.every(c=>c.ok)};
}
if(require.main===module){const r=inspectReleaseV1045(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1045 ${c.name}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1045};
