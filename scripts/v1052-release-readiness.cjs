#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1052(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const version=p.version.match(/^0\.1\.0-v(\d+)$/);
  add('version',Boolean(version&&Number(version[1])>=1052&&p.sonicRoadmapRelease==='v'+version[1]&&p.sonicFeatureRelease==='v'+version[1]));
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('Node24',p.engines?.node==='24.x');
  add('prebuild tests',p.scripts.prebuild.includes('npm run test:v1052 && npm run test:v1052:types && npm run test:v1051'));
  add('focused chain',p.scripts['verify:v1052:focused'].includes('verify:v1051:focused'));
  for(const f of ['lib/arena360UltimateConcertV1052.ts','tests/v1052-ultimate-live-concert-regression.cjs',
   'tests/tsconfig.v1052-core.json','changelog/V1052-ULTIMATE-LIVE-CONCERT-EXPERIENCE.md'])add('file:'+f,exists(f));
  for(const f of ['components/visualizer/stages/Arena360StageV1031.tsx','components/visualizer/ThreeAvatar.tsx'])
   add('client:'+f,read(f).includes('directUltimateConcertV1052'));
  add('stage and audience',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('ultimateConcertV1052.crowdGain'));
  add('camera',read('components/visualizer/ThreeAvatar.tsx').includes('ultimateConcertV1052.cameraGain'));
  add('choreography',read('components/visualizer/ThreeAvatar.tsx').includes('ultimateConcertV1052.choreoGain'));
  add('opt-in',read('context/UiPreferencesContext.tsx').includes('arenaUltimateConcertEnabledV1052:false'));
  add('UI',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1052 · Ultimate Live Concert Experience'));
  add('types',read('types/music.ts').includes('arenaUltimateConcertStrengthV1052'));
  add('visualizer',read('components/visualizer/VisualizerStage.tsx').includes('arenaUltimateConcertEnabledV1052'));
  add('production gate',read('scripts/v931-production-gate.cjs').includes('tests/v1052-ultimate-live-concert-regression.cjs'));
  add('Vercel gate',read('scripts/vercel-production-build.cjs').includes('tests/v1052-ultimate-live-concert-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1052'));
  add('no planner side effects',!/(fetch\(|setInterval\(|setTimeout\(|WebSocket\(|Math\.random\()/.test(read('lib/arena360UltimateConcertV1052.ts')));
 }catch(err){add('readable',false);console.error(err);}
 return {checks,passed:checks.length>=22&&checks.every(c=>c.ok)};
}
if(require.main===module){const res=inspectReleaseV1052(path.resolve(__dirname,'..'));
 for(const c of res.checks)console.log(`${c.ok?'PASS':'FAIL'} V1052 ${c.name}`);
 if(!res.passed)process.exitCode=1;}
module.exports={inspectReleaseV1052};
