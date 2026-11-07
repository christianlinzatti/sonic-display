#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1050(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const version=p.version.match(/^0\.1\.0-v(\d+)$/);
  add('version',Boolean(version&&Number(version[1])>=1050&&p.sonicRoadmapRelease==='v'+version[1]&&p.sonicFeatureRelease==='v'+version[1]));
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('Node24',p.engines?.node==='24.x');
  add('prebuild tests',p.scripts.prebuild.includes('npm run test:v1050 && npm run test:v1050:types && npm run test:v1049'));
  add('focused chain',p.scripts['verify:v1050:focused'].includes('verify:v1049:focused'));
  for(const f of ['lib/arena360AdaptiveStorytellingV1050.ts','tests/v1050-adaptive-concert-storytelling-regression.cjs',
   'tests/tsconfig.v1050-core.json','changelog/V1050-ADAPTIVE-CONCERT-STORYTELLING.md'])add('file:'+f,exists(f));
  for(const f of ['components/visualizer/stages/Arena360StageV1031.tsx','components/visualizer/ThreeAvatar.tsx',
   'components/GoveeMusicSyncV909.tsx'])add('client:'+f,read(f).includes('directAdaptiveStoryV1050'));
  add('opt-in',read('context/UiPreferencesContext.tsx').includes('arenaStorytellingEnabledV1050:false'));
  add('UI',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1050 · Adaptive Concert Storytelling'));
  add('types',read('types/music.ts').includes('arenaStorytellingStrengthV1050'));
  add('visualizer',read('components/visualizer/VisualizerStage.tsx').includes('arenaStorytellingEnabledV1050'));
  add('Govee guard',read('components/GoveeMusicSyncV909.tsx').includes('show:storyGoveeShowV1050'));
  add('production gate',read('scripts/v931-production-gate.cjs').includes('tests/v1050-adaptive-concert-storytelling-regression.cjs'));
  add('Vercel gate',read('scripts/vercel-production-build.cjs').includes('tests/v1050-adaptive-concert-storytelling-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1050'));
  add('no side effects',!/(fetch\(|setInterval\(|setTimeout\(|WebSocket\(|Math\.random\()/.test(read('lib/arena360AdaptiveStorytellingV1050.ts')));
 }catch(err){add('readable',false);console.error(err);}
 return {checks,passed:checks.length>=20&&checks.every(c=>c.ok)};
}
if(require.main===module){const res=inspectReleaseV1050(path.resolve(__dirname,'..'));
 for(const c of res.checks)console.log(`${c.ok?'PASS':'FAIL'} V1050 ${c.name}`);
 if(!res.passed)process.exitCode=1;}
module.exports={inspectReleaseV1050};
