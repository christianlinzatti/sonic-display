#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1048(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const v=Number(/^0\.1\.0-v(\d+)$/.exec(p.version)?.[1]);
  add('version',v>=1048&&p.sonicRoadmapRelease==='v'+v&&p.sonicFeatureRelease==='v'+v);
  add('lock',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.startsWith('npm run test:v1048 && npm run test:v1048:types && npm run test:v1047'));
  add('scripts',p.scripts['test:v1048']==='node tests/v1048-nextgen-concert-director-regression.cjs'&&
   p.scripts['test:v1048:types']==='tsc -p tests/tsconfig.v1048-core.json --noEmit');
  for(const f of ['lib/arena360ConcertDirectorV1048.ts',
   'components/visualizer/stages/Arena360StageV1031.tsx','components/visualizer/ThreeAvatar.tsx',
   'components/visualizer/VisualizerStage.tsx','components/visualizer/registry.tsx',
   'components/GoveeMusicSyncV909.tsx','components/visualizer/ArenaShowDesignerPanelV1040.tsx',
   'context/UiPreferencesContext.tsx','types/music.ts',
   'tests/v1048-nextgen-concert-director-regression.cjs', 'tests/tsconfig.v1048-core.json',
   'changelog/V1048-NEXT-GENERATION-CONCERT-DIRECTOR.md',
   '.github/workflows/v1048-nextgen-concert-validation.yml'])add('file:'+f,exists(f));
  add('opt-in',read('context/UiPreferencesContext.tsx').includes('arenaConcertDirectorEnabledV1048:false'));
  add('all-clients',['components/visualizer/stages/Arena360StageV1031.tsx',
   'components/visualizer/ThreeAvatar.tsx','components/GoveeMusicSyncV909.tsx'].every(f=>read(f).includes('directArenaShowV1048')));
  add('ci',read('scripts/v931-production-gate.cjs').includes('tests/v1048-nextgen-concert-director-regression.cjs')&&
   read('scripts/vercel-production-build.cjs').includes('tests/v1048-nextgen-concert-director-regression.cjs'));
  add('manual-priority',read('lib/arena360ConcertDirectorV1048.ts').includes('old[0]===defaults[0]'));
 }catch(e){console.error('V1048 readiness:',e.message);add('readable',false);}
 return {checks,passed:checks.length>=22&&checks.every(c=>c.ok)};
}
if(require.main===module){const r=inspectReleaseV1048(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1048 ${c.name}`);
 if(!r.passed)process.exitCode=1;}
module.exports={inspectReleaseV1048};
