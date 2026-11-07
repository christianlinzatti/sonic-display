#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1057(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:!!ok});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const p=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const v=/^0\.1\.0-v(\d+)$/.exec(p.version||'');
  add('metadata',!!v&&Number(v[1])>=1057&&p.sonicRoadmapRelease==='v'+v[1]&&p.sonicFeatureRelease==='v'+v[1]);
  add('lockfile',p.version===lock.version&&p.version===lock.packages?.['']?.version);
  add('Node24',p.engines?.node==='24.x');
  add('prebuild chain',p.scripts.prebuild.includes('npm run test:v1057 && npm run test:v1057:types && npm run test:v1056'));
  add('previous focused tests',p.scripts['verify:v1057:focused'].includes('verify:v1056:focused'));
  for(const f of ['lib/arena360IntelligentLaserV1057.ts','tests/v1057-intelligent-laser-regression.cjs',
   'tests/tsconfig.v1057-core.json','scripts/v1057-release-readiness.cjs',
   'changelog/V1057-INTELLIGENT-LASER-DIRECTOR.md'])add('file '+f,exists(f));
  add('default off',read('context/UiPreferencesContext.tsx').includes('arenaIntelligentLaserEnabledV1057:false'));
  add('types',read('types/music.ts').includes('arenaIntelligentLaserStrengthV1057'));
  add('props',read('components/visualizer/registry.tsx').includes('arenaIntelligentLaserStrengthV1057'));
  add('UI',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1057 · Intelligent Laser Director'));
  add('visualizer',read('components/visualizer/VisualizerStage.tsx').includes('arenaIntelligentLaserEnabledV1057'));
  add('stage props',read('components/visualizer/stages/index.tsx').includes('intelligentLaserEnabledV1057={intelligentLaserEnabledV1057}'));
  add('stage planner',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('planIntelligentLaserV1057('));
  add('two existing mesh batches',read('components/visualizer/stages/ArenaLaserFansV1036.tsx').includes('laserCueV1057')&&read('components/visualizer/stages/ArenaLaserTunnelsV1039.tsx').includes('laserCueV1057'));
  add('production gate',read('scripts/v931-production-gate.cjs').includes('tests/v1057-intelligent-laser-regression.cjs'));
  add('Vercel gate',read('scripts/vercel-production-build.cjs').includes('tests/v1057-intelligent-laser-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1057'));
  add('documentation',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1057);
  add('pure director',!/(fetch\(|setTimeout\(|setInterval\(|Math\.random\(|new SpotLight|WebSocket\(|Date\.now\(|localStorage)/.test(read('lib/arena360IntelligentLaserV1057.ts')));
 }catch(error){console.error('V1057 release inspection:',error.message);add('source readable',false);}
 return {checks,passed:checks.length>=20&&checks.every(c=>c.ok)};
}
if(require.main===module){const r=inspectReleaseV1057(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log((c.ok?'PASS':'FAIL')+' V1057 '+c.name);
 if(!r.passed)process.exitCode=1;}
module.exports={inspectReleaseV1057};
