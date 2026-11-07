#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1046(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:!!ok});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const v=Number(/^0\.1\.0-v(\d+)$/.exec(p.version)?.[1]);
  add('version',v>=1046&&p.sonicFeatureRelease==='v'+v&&p.sonicRoadmapRelease==='v'+v);
  add('lock',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.includes('npm run test:v1046 && npm run test:v1046:types && npm run test:v1045'));
  add('scripts',p.scripts['test:v1046']==='node tests/v1046-cinematic-finale-regression.cjs'&&
   p.scripts['test:v1046:types']==='tsc -p tests/tsconfig.v1046-core.json --noEmit');
  for(const f of ['lib/arena360CinematicFinaleV1046.ts',
   'components/visualizer/stages/ArenaCinematicFinaleV1046.tsx',
   'components/visualizer/stages/Arena360StageV1031.tsx',
   'components/visualizer/stages/ArenaLaserFansV1036.tsx',
   'components/visualizer/stages/index.tsx','components/visualizer/ThreeAvatar.tsx',
   'components/visualizer/VisualizerStage.tsx','components/visualizer/registry.tsx',
   'components/visualizer/ArenaShowDesignerPanelV1040.tsx','types/music.ts',
   'context/UiPreferencesContext.tsx','tests/v1046-cinematic-finale-regression.cjs',
   'tests/tsconfig.v1046-core.json','changelog/V1046-CINEMATIC-CONCERT-FINALE-ENGINE.md'])
   add('file:'+f,exists(f));
  add('opt-in',read('context/UiPreferencesContext.tsx').includes('arenaFinaleEnabledV1046:false'));
  add('real-beat',read('components/visualizer/stages/ArenaCinematicFinaleV1046.tsx').includes('!lastBeat.current'));
  add('ci',read('scripts/v931-production-gate.cjs').includes('tests/v1046-cinematic-finale-regression.cjs')&&
   read('scripts/vercel-production-build.cjs').includes('tests/v1046-cinematic-finale-regression.cjs'));
 }catch(e){console.error('V1046 readiness:',e.message);add('readable',false)}
 return {checks,passed:checks.length>=22&&checks.every(c=>c.ok)};
}
if(require.main===module){const r=inspectReleaseV1046(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1046 ${c.name}`);
 if(!r.passed)process.exitCode=1;}
module.exports={inspectReleaseV1046};
